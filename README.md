# DEF CON CTF: solve them all

A public learning journal for solving every DEF CON CTF challenge that is
currently available in the [`sajjadium/ctf-archives`](https://github.com/sajjadium/ctf-archives/tree/main/ctfs/DEFCON)
collection, one challenge at a time, and publishing original write-ups after
each solve.

## Scope

The current catalog contains **126 challenges across 8 archived editions**:
2018, 2019, 2020, 2021, 2022, 2024, 2025, and 2026. This is the complete DEF
CON subset available in the upstream archive at the pinned source revision; it
is not a claim that every challenge from every DEF CON in history has been
preserved.

See [PROGRESS.md](PROGRESS.md) for the full checklist and
[catalog/challenges.json](catalog/challenges.json) for machine-readable
metadata.

## Get the challenge files

The public repo tracks the catalog, workspaces, tooling, and write-ups—not
nearly 1 GB of duplicated third-party binaries. Fetch all original assets into
the git-ignored `challenge-files/` directory:

```bash
python3 tools/archive.py fetch-all
```

Or fetch only one challenge:

```bash
python3 tools/archive.py fetch 2026/quals/crypto/rfc1149b
```

The initial local checkout created for this project already has the full asset
set. Fresh clones can reproduce it with the command above.

## Workflow

1. Pick a challenge from [PROGRESS.md](PROGRESS.md).
2. Mark it as in progress:

   ```bash
   python3 tools/manage.py status 2026/quals/crypto/rfc1149b solving
   ```

3. Work only inside the challenge's `challenges/...` workspace and
   git-ignored `scratch/` directory.
4. Copy [writeups/TEMPLATE.md](writeups/TEMPLATE.md) to the matching path under
   `writeups/` and document the reasoning, failed approaches, exploit, and
   lessons learned.
5. Mark it solved:

   ```bash
   python3 tools/manage.py status 2026/quals/crypto/rfc1149b solved
   ```

6. Commit the workspace notes, solution code, and write-up. Do not commit
   upstream challenge binaries.

Useful commands:

```bash
python3 tools/manage.py list --status todo --year 2026
python3 tools/manage.py summary
python3 -m unittest discover -s tests
```

## Safety

CTF archives deliberately contain vulnerable programs, malformed files, and
exploit code. Never run them on a production machine or against systems you do
not own. Prefer a disposable VM or container with minimal privileges and no
sensitive credentials. The fetch tool downloads files but never executes them.

## Attribution

Challenge names and downloadable assets come from the upstream CTF archive.
See [ATTRIBUTION.md](ATTRIBUTION.md). All write-ups and solution code in this
repository are original unless a file states otherwise.

