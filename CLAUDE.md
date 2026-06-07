# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Plaintext is an open security-education curriculum (CC BY 4.0). It is a **content repository plus a static landing page** — there is no application code, build system, package manager, or test suite. Work here is almost entirely Markdown authoring and editing one hand-written HTML page.

## Two decoupled halves

The single most important thing to understand: **the published website and the curriculum content are separate and do not reference each other.**

1. **`docs/index.html`** — the entire public website. A standalone, hand-authored page with all CSS inlined in a `<style>` block (no framework, no build step, no external assets except a Google Fonts link). Its nav/CTA links are placeholder `#` anchors; it does **not** link to or render anything under `tracks/`.
2. **`tracks/`** — the curriculum, authored in Markdown. This content is **not** built into the site or served by Pages.

Consequences:
- Editing curriculum Markdown does **not** change the live site, and editing `docs/index.html` does **not** change the curriculum. If a task implies the two should stay in sync, that wiring does not exist yet — flag it rather than assuming it.
- Only `docs/` is published (see Deployment). Nothing in `tracks/` reaches the live site.

## Deployment

`.github/workflows/deploy.yml` deploys to GitHub Pages via GitHub Actions, **on push to `main` only**. It uploads `./docs` as the Pages artifact — so only files inside `docs/` are published. The site is a project page served under the `/plaintext/` path (`https://patrickdaj.github.io/plaintext/`); keep that in mind for any absolute paths.

There is nothing to build, lint, or test. To preview the site locally, open `docs/index.html` directly in a browser, or serve it with `python3 -m http.server` from the `docs/` directory.

## Content structure and authoring rules

```
tracks/<NN-track-name>/
├── README.md                          # track overview (intro + module table)
└── modules/<NN-module-name>/
    ├── README.md                      # concept explanation
    └── lab.md                         # hands-on OSS-only exercise
```

Track and module directories are zero-padded and numbered (`00-foundations`, `modules/01-networking`). The canonical templates for a module `README.md` and `lab.md`, plus the curriculum content rules, live in `CONTRIBUTING.md` — follow them when adding or editing modules. Key non-obvious rules from there:

- All prose must be **original writing from primary sources**. Do not copy from SANS, Offensive Security, or other proprietary course material.
- Reference and use **open source tools only**; labs must be reproducible with free tools.
- Cite sources (CVEs, RFCs, tool docs, papers) in "Further reading".

New modules are proposed via the `.github/ISSUE_TEMPLATE/new-module.md` issue template.
