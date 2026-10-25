import assert from "node:assert/strict";
import test from "node:test";

// Cloudflare builds import cloudflare: modules and must run in workerd.
let worker;
test.before(async () => {
  const { unstable_dev } = await import("wrangler");
  worker = await unstable_dev("dist/server/index.js", {
    config: "dist/server/wrangler.json",
    local: true,
    persist: false,
    logLevel: "error",
    experimental: { disableExperimentalWarning: true, disableDevRegistry: true },
  });
});
test.after(async () => { await worker?.stop(); });

async function render(path = "/") {
  return worker.fetch(`http://localhost${path}`, { headers: { accept: "text/html" } });
}

test("server-renders the challenge archive", async () => {
  const response = await render();
  assert.equal(response.status, 200);
  assert.match(response.headers.get("content-type") ?? "", /^text\/html\b/i);
  const html = await response.text();
  assert.match(html, /<title>DEF CON CTF — Solve Them All<\/title>/i);
  assert.match(html, /126(?:<!-- -->)? rooms\./i);
  assert.match(html, /The archive, by year/i);
  assert.match(html, /Find the next flag/i);
  assert.match(html, /Download all files/i);
  assert.doesNotMatch(html, /react-loading-skeleton|Your site is taking shape/i);
});

test("server-renders an event and challenge route", async () => {
  const eventResponse = await render("/events/2025");
  assert.equal(eventResponse.status, 200);
  assert.match(await eventResponse.text(), /DEF CON QUALIFIERS/i);

  const challengeResponse = await render("/challenges/2025/quals/uncategorized/NautilusInstituteContinuousIntegrationAndContinuousDelivery");
  assert.equal(challengeResponse.status, 200);
  const challengeHtml = await challengeResponse.text();
  assert.match(challengeHtml, /THE QUESTION/i);
  assert.match(challengeHtml, /Download ZIP/i);
});
