# DEF CON CTF Archive website

The local companion site for the challenge catalog and write-ups in this
repository. It is built with React and vinext and runs directly from this repo.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

`npm run sync` regenerates `data/content.json` from the repository catalog,
challenge workspaces, and published Markdown write-ups. `npm run build` runs the
same sync step before producing the application build.

ZIP buttons are available for one challenge, one event, or the complete local
attachment archive. Downloads are generated on demand from
`../challenge-files/`; they are available while `npm run dev` is running. On a
fresh clone, fetch the files first with `python3 tools/archive.py fetch-all`.

## Content model

- Challenge metadata comes from `../catalog/challenges.json`.
- Progress comes from each workspace's `README.md` front matter.
- A published solution at `../writeups/<challenge-id>.md` automatically adds a
  write-up page and link to its challenge page.
