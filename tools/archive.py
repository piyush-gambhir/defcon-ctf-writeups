#!/usr/bin/env python3
"""Fetch DEF CON challenge assets without committing them to this repository."""

from __future__ import annotations

import argparse
import json
import shutil
import subprocess
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CACHE = ROOT / ".cache" / "ctf-archives"
ASSETS = ROOT / "challenge-files"
CATALOG = ROOT / "catalog" / "challenges.json"
UPSTREAM = "https://github.com/sajjadium/ctf-archives.git"


def run(*args: str, cwd: Path | None = None) -> None:
    print("+", " ".join(args))
    subprocess.run(args, cwd=cwd, check=True)


def ensure_clone(refresh: bool) -> None:
    if not (CACHE / ".git").exists():
        CACHE.parent.mkdir(parents=True, exist_ok=True)
        run(
            "git",
            "clone",
            "--filter=blob:none",
            "--sparse",
            "--depth=1",
            UPSTREAM,
            str(CACHE),
        )
    elif refresh:
        run("git", "fetch", "--depth=1", "origin", "main", cwd=CACHE)
        run("git", "checkout", "--detach", "origin/main", cwd=CACHE)


def sparse_checkout(upstream_path: str) -> Path:
    pattern = f"/{upstream_path}/"
    run("git", "sparse-checkout", "set", "--no-cone", pattern, cwd=CACHE)
    source = CACHE / upstream_path
    if not source.exists():
        raise SystemExit(f"upstream path was not found: {upstream_path}")
    return source


def load_catalog() -> list[dict[str, object]]:
    if not CATALOG.exists():
        raise SystemExit("catalog is missing; run tools/generate_catalog.py first")
    return json.loads(CATALOG.read_text())["challenges"]


def fetch_all(refresh: bool) -> None:
    ensure_clone(refresh)
    source = sparse_checkout("ctfs/DEFCON")
    shutil.copytree(source, ASSETS, dirs_exist_ok=True)
    print(f"Fetched all DEF CON assets into {ASSETS}")


def fetch_one(challenge_id: str, refresh: bool) -> None:
    matches = [item for item in load_catalog() if item["id"] == challenge_id]
    if not matches:
        raise SystemExit(f"unknown challenge id: {challenge_id}")
    item = matches[0]
    upstream_path = str(item["upstream_path"])
    ensure_clone(refresh)
    source = sparse_checkout(upstream_path)
    destination = ASSETS / Path(*Path(upstream_path).parts[2:])
    shutil.copytree(source, destination, dirs_exist_ok=True)
    print(f"Fetched {challenge_id} into {destination}")


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--refresh", action="store_true", help="refresh upstream first")
    subparsers = parser.add_subparsers(dest="command", required=True)
    subparsers.add_parser("fetch-all")
    one = subparsers.add_parser("fetch")
    one.add_argument("challenge_id")
    args = parser.parse_args()

    if args.command == "fetch-all":
        fetch_all(args.refresh)
    else:
        fetch_one(args.challenge_id, args.refresh)


if __name__ == "__main__":
    try:
        main()
    except subprocess.CalledProcessError as exc:
        print(f"command failed with exit code {exc.returncode}", file=sys.stderr)
        raise SystemExit(exc.returncode) from exc

