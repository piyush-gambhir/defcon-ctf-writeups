import { spawn } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { resolve, sep } from "node:path";
import type { Plugin } from "vite";

type CatalogChallenge = {
  id: string;
  name: string;
  upstream_path: string;
  year: number;
};

type ContentIndex = {
  challenges: CatalogChallenge[];
};

const UPSTREAM_PREFIX = "ctfs/DEFCON/";

function safeFilename(value: string) {
  return value.replace(/[^a-z0-9._-]+/gi, "-").replace(/^-+|-+$/g, "");
}

async function isDirectory(path: string) {
  try {
    return (await stat(path)).isDirectory();
  } catch {
    return false;
  }
}

function sendText(response: import("node:http").ServerResponse, status: number, message: string) {
  response.statusCode = status;
  response.setHeader("Content-Type", "text/plain; charset=utf-8");
  response.end(message);
}

export function challengeDownloads(): Plugin {
  let root = process.cwd();
  let contentPromise: Promise<ContentIndex> | undefined;

  async function getContent() {
    contentPromise ??= readFile(resolve(root, "data", "content.json"), "utf8")
      .then((value) => JSON.parse(value) as ContentIndex);
    return contentPromise;
  }

  return {
    name: "local-challenge-downloads",
    apply: "serve",
    configResolved(config) {
      root = config.root;
    },
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        if (!request.url) return next();
        const url = new URL(request.url, "http://localhost");
        if (!url.pathname.startsWith("/__downloads/")) return next();

        try {
          const content = await getContent();
          const assetRoot = resolve(root, "..", "challenge-files");
          let sourceDirectory: string | undefined;
          let archiveName: string | undefined;

          if (url.pathname === "/__downloads/challenge.zip") {
            const id = url.searchParams.get("id");
            const challenge = content.challenges.find((item) => item.id === id);
            if (!challenge || !challenge.upstream_path.startsWith(UPSTREAM_PREFIX)) {
              return sendText(response, 404, "Unknown challenge.");
            }
            sourceDirectory = resolve(assetRoot, challenge.upstream_path.slice(UPSTREAM_PREFIX.length));
            archiveName = `${challenge.year}-${safeFilename(challenge.name)}-attachments.zip`;
          } else if (url.pathname === "/__downloads/event.zip") {
            const year = Number(url.searchParams.get("year"));
            if (!Number.isInteger(year) || !content.challenges.some((item) => item.year === year)) {
              return sendText(response, 404, "Unknown DEF CON event.");
            }
            sourceDirectory = resolve(assetRoot, String(year));
            archiveName = `defcon-${year}-attachments.zip`;
          } else if (url.pathname === "/__downloads/archive.zip") {
            sourceDirectory = assetRoot;
            archiveName = "defcon-ctf-all-attachments.zip";
          } else {
            return next();
          }

          const safeRoot = `${assetRoot}${sep}`;
          if (sourceDirectory !== assetRoot && !sourceDirectory.startsWith(safeRoot)) {
            return sendText(response, 400, "Invalid download path.");
          }
          if (!(await isDirectory(sourceDirectory))) {
            return sendText(
              response,
              404,
              "Challenge files are not downloaded yet. Run python3 tools/archive.py fetch-all from the repository root.",
            );
          }

          const zip = spawn("zip", ["-r", "-q", "-", "."], {
            cwd: sourceDirectory,
            stdio: ["ignore", "pipe", "pipe"],
          });
          let errorOutput = "";
          zip.stderr.setEncoding("utf8");
          zip.stderr.on("data", (chunk: string) => { errorOutput += chunk.slice(0, 2000); });
          zip.once("error", (error) => {
            if (!response.headersSent) {
              sendText(response, 500, `Unable to create ZIP. Make sure the zip command is installed.\n${error.message}`);
            } else {
              response.destroy(error);
            }
          });
          zip.once("spawn", () => {
            response.statusCode = 200;
            response.setHeader("Content-Type", "application/zip");
            response.setHeader("Content-Disposition", `attachment; filename="${archiveName}"`);
            response.setHeader("Cache-Control", "no-store");
            response.setHeader("X-Content-Type-Options", "nosniff");
            zip.stdout.pipe(response);
          });
          zip.once("close", (code) => {
            if (code && !response.writableEnded) {
              response.destroy(new Error(errorOutput || `zip exited with status ${code}`));
            }
          });
          request.once("aborted", () => zip.kill());
        } catch (error) {
          sendText(response, 500, error instanceof Error ? error.message : "Unable to create ZIP.");
        }
      });
    },
  };
}
