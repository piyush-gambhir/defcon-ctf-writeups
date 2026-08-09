#!/usr/bin/env python3
"""List challenges, update statuses, and regenerate the progress dashboard."""

from __future__ import annotations

import argparse
import json
import re
from collections import Counter, defaultdict
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CATALOG = ROOT / "catalog" / "challenges.json"
VALID_STATUSES = ("todo", "solving", "solved", "blocked")


def catalog() -> list[dict[str, object]]:
    return json.loads(CATALOG.read_text())["challenges"]


def read_status(item: dict[str, object]) -> str:
    text = (ROOT / str(item["workspace"]) / "README.md").read_text()
    match = re.search(r"^status: (todo|solving|solved|blocked)$", text, re.MULTILINE)
    if not match:
        raise SystemExit(f"missing valid status in {item['workspace']}/README.md")
    return match.group(1)


def refresh(items: list[dict[str, object]]) -> None:
    statuses = {str(item["id"]): read_status(item) for item in items}
    counts = Counter(statuses.values())
    by_year: dict[int, list[dict[str, object]]] = defaultdict(list)
    for item in items:
        by_year[int(item["year"])].append(item)

    lines = [
        "# Progress",
        "",
        f"**{counts['solved']} solved / {len(items)} total** — "
        f"{counts['solving']} solving, {counts['blocked']} blocked, {counts['todo']} todo.",
        "",
        "Generated from the `status` field in each challenge workspace.",
        "",
    ]
    icons = {"todo": "⬜", "solving": "🟨", "solved": "✅", "blocked": "🟥"}
    for year in sorted(by_year, reverse=True):
        year_items = by_year[year]
        solved = sum(statuses[str(item["id"])] == "solved" for item in year_items)
        lines.extend(
            [
                f"## {year} — {solved}/{len(year_items)} solved",
                "",
                "| Status | Category | Challenge | Workspace |",
                "| --- | --- | --- | --- |",
            ]
        )
        for item in sorted(year_items, key=lambda value: str(value["id"]).lower()):
            status = statuses[str(item["id"])]
            lines.append(
                f"| {icons[status]} `{status}` | `{item['category']}` | "
                f"{item['name']} | [{item['id']}]({item['workspace']}/README.md) |"
            )
        lines.append("")
    (ROOT / "PROGRESS.md").write_text("\n".join(lines))


def set_status(items: list[dict[str, object]], challenge_id: str, status: str) -> None:
    matches = [item for item in items if item["id"] == challenge_id]
    if not matches:
        raise SystemExit(f"unknown challenge id: {challenge_id}")
    item = matches[0]
    readme = ROOT / str(item["workspace"]) / "README.md"
    text = readme.read_text()
    text, changed = re.subn(
        r"^status: (todo|solving|solved|blocked)$",
        f"status: {status}",
        text,
        count=1,
        flags=re.MULTILINE,
    )
    if changed != 1:
        raise SystemExit(f"could not update status in {readme}")
    text = re.sub(r"\| Status \| `[^`]+` \|", f"| Status | `{status}` |", text, count=1)
    readme.write_text(text)
    refresh(items)


def main() -> None:
    parser = argparse.ArgumentParser()
    commands = parser.add_subparsers(dest="command", required=True)
    list_parser = commands.add_parser("list")
    list_parser.add_argument("--status", choices=VALID_STATUSES)
    list_parser.add_argument("--year", type=int)
    status_parser = commands.add_parser("status")
    status_parser.add_argument("challenge_id")
    status_parser.add_argument("status", choices=VALID_STATUSES)
    commands.add_parser("summary")
    commands.add_parser("refresh")
    args = parser.parse_args()
    items = catalog()

    if args.command == "status":
        set_status(items, args.challenge_id, args.status)
    elif args.command == "refresh":
        refresh(items)
    elif args.command == "summary":
        counts = Counter(read_status(item) for item in items)
        print(" ".join(f"{status}={counts[status]}" for status in VALID_STATUSES))
    else:
        for item in items:
            status = read_status(item)
            if args.status and status != args.status:
                continue
            if args.year and item["year"] != args.year:
                continue
            print(f"{status:7} {item['id']}")


if __name__ == "__main__":
    main()

