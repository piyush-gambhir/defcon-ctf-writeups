#!/usr/bin/env python3
"""Generate the catalog and per-challenge workspaces from fetched assets."""

from __future__ import annotations

import argparse
import json
import subprocess
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
UPSTREAM_WEB = "https://github.com/sajjadium/ctf-archives/tree/main/"


def source_revision(source: Path) -> str:
    cache_repo = ROOT / ".cache" / "ctf-archives"
    if cache_repo.exists():
        result = subprocess.run(
            ["git", "rev-parse", "HEAD"],
            cwd=cache_repo,
            text=True,
            capture_output=True,
            check=False,
        )
        if result.returncode == 0:
            return result.stdout.strip()
    return "6df09f36b18d9f3405912a3285eb5eb4ec749119"


def challenge_dirs(event_root: Path) -> list[tuple[str, Path]]:
    found: list[tuple[str, Path]] = []
    for first in sorted(path for path in event_root.iterdir() if path.is_dir()):
        if any(path.is_file() for path in first.iterdir()):
            found.append(("uncategorized", first))
            continue
        for challenge in sorted(path for path in first.iterdir() if path.is_dir()):
            found.append((first.name.lower(), challenge))
    return found


def build(source: Path) -> list[dict[str, object]]:
    challenges: list[dict[str, object]] = []
    for year_dir in sorted(path for path in source.iterdir() if path.is_dir()):
        year = int(year_dir.name)
        for event_root in sorted(path for path in year_dir.iterdir() if path.is_dir()):
            stage = event_root.name
            for category, challenge in challenge_dirs(event_root):
                relative = challenge.relative_to(source)
                upstream_path = Path("ctfs/DEFCON") / relative
                files = [path for path in challenge.rglob("*") if path.is_file()]
                readme = challenge / "README.md"
                prompt = readme.read_text(errors="replace").strip() if readme.exists() else ""
                artifacts = [
                    {
                        "path": path.relative_to(challenge).as_posix(),
                        "bytes": path.stat().st_size,
                    }
                    for path in sorted(files)
                    if path.name != "README.md"
                ]
                challenge_id = "/".join(
                    [str(year), stage.lower(), category, challenge.name]
                )
                workspace = Path("challenges") / challenge_id
                challenges.append(
                    {
                        "id": challenge_id,
                        "year": year,
                        "stage": stage,
                        "category": category,
                        "name": challenge.name,
                        "file_count": len(files),
                        "total_bytes": sum(path.stat().st_size for path in files),
                        "prompt": prompt,
                        "artifacts": artifacts,
                        "upstream_path": upstream_path.as_posix(),
                        "upstream_url": UPSTREAM_WEB + upstream_path.as_posix(),
                        "workspace": workspace.as_posix(),
                    }
                )
    return challenges


def write_workspace(item: dict[str, object]) -> None:
    workspace = ROOT / str(item["workspace"])
    workspace.mkdir(parents=True, exist_ok=True)
    readme = workspace / "README.md"
    if readme.exists():
        return
    asset_path = str(item["upstream_path"]).removeprefix("ctfs/DEFCON/")
    readme.write_text(
        f'''---
status: todo
---

# {item["name"]}

| Field | Value |
| --- | --- |
| Event | DEF CON {item["year"]} {item["stage"]} |
| Category | {item["category"]} |
| Status | `todo` |
| Upstream | [challenge files]({item["upstream_url"]}) |
| Local assets | `challenge-files/{asset_path}` |

## Notes

Add reconnaissance, hypotheses, and useful commands here while solving.

## Solution files

Keep original solver and exploit code in this directory. Put disposable output
and large generated artifacts under the repository-level `scratch/` directory.

## Write-up

Create `writeups/{item["id"]}.md` from `writeups/TEMPLATE.md` after solving.
'''
    )


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "source",
        nargs="?",
        type=Path,
        default=ROOT / "challenge-files",
        help="fetched DEF CON archive directory",
    )
    args = parser.parse_args()
    source = args.source.resolve()
    if not source.exists():
        raise SystemExit(f"source directory does not exist: {source}")

    challenges = build(source)
    if not challenges:
        raise SystemExit("no challenges found")
    for item in challenges:
        write_workspace(item)

    catalog_dir = ROOT / "catalog"
    catalog_dir.mkdir(parents=True, exist_ok=True)
    payload = {
        "source": "sajjadium/ctf-archives",
        "source_revision": source_revision(source),
        "challenge_count": len(challenges),
        "challenges": challenges,
    }
    (catalog_dir / "challenges.json").write_text(
        json.dumps(payload, indent=2, sort_keys=True) + "\n"
    )
    print(f"Generated {len(challenges)} challenge workspaces")


if __name__ == "__main__":
    main()
