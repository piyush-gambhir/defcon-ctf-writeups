# DEF CON CTF Archive website

The public companion site for the challenge catalog and write-ups in this
repository. It is built with React, vinext, and Cloudflare Workers.

## Local development

Requires Node.js 22.13 or newer.

```bash
npm install
npm run dev
```

`npm run sync` regenerates `data/content.json` from the repository catalog,
challenge workspaces, and published Markdown write-ups. `npm run build` runs the
same sync step before producing the deployable Worker.

## Content model

- Challenge metadata comes from `../catalog/challenges.json`.
- Progress comes from each workspace's `README.md` front matter.
- A published solution at `../writeups/<challenge-id>.md` automatically adds a
  write-up page and link to its challenge page.
