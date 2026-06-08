# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Plaintext is an open security-education curriculum (CC BY 4.0). The curriculum is authored in **Markdown under `tracks/`** and published as a **[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) static site**. There is no application code or test suite — work here is almost entirely Markdown authoring, plus the MkDocs config and one hand-authored landing-page template. The one build step is `mkdocs build` (see Deployment).

## Repo map

```
plaintext/
├── tracks/                # the curriculum Markdown — the SOURCE OF TRUTH, and MkDocs' docs_dir
│   ├── index.md               # landing page stub (uses the custom home template)
│   ├── stylesheets/extra.css  # Material theme tuning (terminal palette)
│   └── <NN-track-name>/
│       ├── README.md          # track overview / content map (rendered at /<NN-track-name>/)
│       └── modules/<NN-module-name>/
│           ├── README.md      # concept explanation
│           └── lab.md          # hands-on, OSS-first exercise
├── overrides/home.html    # custom landing hero (Material theme override) — hand-authored
├── mkdocs.yml             # site config: theme, nav, markdown extensions
├── requirements.txt       # pinned site toolchain (mkdocs-material)
├── site/                  # GENERATED build output — gitignored, never committed or edited
├── CONTRIBUTING.md        # canonical module/lab templates + content rules — read before authoring
├── README.md              # repo intro + track table
├── LICENSE                # CC BY 4.0
├── .gitignore             # secrets, lab artifacts, build output
└── .github/
    ├── workflows/deploy.yml         # CI: mkdocs build → GitHub Pages (push to main)
    └── ISSUE_TEMPLATE/new-module.md # the per-module intake form
```

## How the site is built

- **`tracks/` is the single source of truth.** MkDocs is configured with `docs_dir: tracks` and builds the whole site into `site/`.
- **Never edit `site/`** — it is generated and gitignored. Edit the Markdown (or `mkdocs.yml` / `overrides/`) and rebuild.
- **The landing page** is `overrides/home.html` (the hand-authored terminal-style hero) wired to `tracks/index.md` via its `template:` front matter. Curriculum pages use the stock Material theme, tuned by `tracks/stylesheets/extra.css`.
- **Nav is explicit** in `mkdocs.yml`. When you add a module (`README.md` / `lab.md`), add it to the `nav:` tree, or `mkdocs build --strict` will fail on a page that is not in the nav.
- **Preview / build locally:**
  ```bash
  python3 -m pip install -r requirements.txt
  mkdocs serve              # live preview at http://127.0.0.1:8000
  mkdocs build --strict     # what CI runs; fails on broken links / orphan pages
  ```

## Deployment

`.github/workflows/deploy.yml` deploys to GitHub Pages via GitHub Actions, **on push to `main` only**. CI installs `requirements.txt`, runs `mkdocs build --strict`, and publishes `site/`. The site is a project page served under the `/plaintext/` path (`https://patrickdaj.github.io/plaintext/`); MkDocs handles base-path-relative links, so use the `url` filter in templates and normal relative links in Markdown.

A failed build does **not** take down the live site — Pages keeps the last good deploy — but it does mean your change is not published until the build is green. (The published Pages site may be unreachable from sandboxed environments that block `*.github.io`; verify a deploy succeeded via the GitHub Actions run status instead.)

## Content structure and authoring rules

Track and module directories are zero-padded and numbered (`00-foundations`, `modules/01-networking`); see the [Repo map](#repo-map). The canonical templates for a module `README.md` and `lab.md` live in `CONTRIBUTING.md` — follow them when adding or editing modules. The binding rules:

- **Original writing from primary sources.** Do not copy from SANS, Offensive Security, or other proprietary course material. Topic *coverage* may be informed by such courses; prose and structure must be original.
- **Open-source first, not open-source only.** Prefer OSS tools; free/community editions (e.g. Burp CE) and the genuine real-world tool are acceptable where that is what the job actually uses. Labs must still be reproducible at zero cost.
- **Hands-on and job-ready.** "In the dirt," not certification theory — every module ends in something the learner *does*, and every track ends in a **capstone** (a portfolio-worthy artifact).
- **Tie it to the real world.** Wherever you can, ground modules and labs in genuine artifacts, not invented toy examples: real CVEs (by ID, via NVD / CISA KEV), real public datasets (Kaggle, Malware-Traffic-Analysis.net, public PCAP/EVTX repos, MalwareBazaar), real MITRE ATT&CK techniques, and actual tool output. The closer a lab is to what a practitioner truly sees, the more it transfers to the job.
- **Docker-first labs.** Default to containers for reproducibility; use VMs or cloud free-tier accounts only where the domain demands it (Active Directory, cloud).
- **AI is core.** Every track carries an `## AI & automation` section, and modules should weave in the AI-acceleration move for that topic. The standing posture: **AI authors → you review → you own it** — automation is assumed; the differentiating skill is directing and rigorously reviewing it.
- **Cite multiple primary sources** (CVEs, RFCs, tool docs, papers, MITRE ATT&CK) in "Further reading".
- **Keep resources fresh.** Vary the sources cited in *Learn* across modules — don't send learners to the same site or author every time. Reuse a resource only when it is genuinely the best fit for that topic; otherwise prefer a different high-quality source so the curriculum has breadth.
- **Link to the specific resource, and validate it.** Never drop a learner a bare YouTube *channel* or a firehose playlist — link an *actual video* and say roughly how long it is or what to watch for. For a large doc or spec, link it only if it genuinely matters, and say exactly what to read (which chapters/sections) — never send someone to a 200-page manual unscoped. Every link must be checked to resolve to the specific, current resource it claims; do not guess or invent URLs (especially YouTube video IDs).
- **Labs are offensive-capable by nature** — keep the authorization rule explicit in any lab that attacks a target: only test systems you own or have explicit written permission to test, and point learners at intentionally vulnerable targets (DVWA, CloudGoat, locally spun VMs, free CTF rooms).

New modules are proposed via the `.github/ISSUE_TEMPLATE/new-module.md` issue template (which doubles as the per-module intake form: track, title, objective, tools, time, background).

## Module anatomy — every module is a guided learning unit

A module is **not** a summary page. It is a self-contained unit that takes a learner from *why* all the way to a committed artifact — a full study unit, not a blurb. The failure mode to avoid is the thin module: a paragraph of concept plus three bare links. In particular the **Learn** path is mandatory — it is the actual studying (curated, time-boxed, opinionated), not an afterthought tacked on as "Further reading." The anatomy spreads across the module's two files:

**`README.md` — concept + study path**
- **Why this matters** — the 90-second "so what," and where it gets reused in later tracks.
- **Objective** — measurable and job-relevant.
- **Learn (~N hrs)** — a curated, time-boxed, *opinionated* path: grouped resources (video-first where that helps) with real links and a line on why each earns the time. **This is the core of the module** and the thing thin modules lack. Keep the sources fresh across modules — don't lean on the same few sites or authors.
- **Key concepts** — the original-prose explanation.
- **AI acceleration** — the AI/automation move for this topic, and what the learner must review and own.

**`lab.md` — the project**
- **Setup** (Docker-first) and **Scenario** (with the authorization note where it attacks a target).
- **Do** — an ordered checklist of *objectives*, not transcribed commands: state the goal (plus a hint) and let the learner derive the *how* from the Learn path and `man`. Show a command only when the syntax itself is the lesson. Scale the hand-holding to the track — **Foundations:** objective + a hint; **specialization tracks:** the objective; **advanced:** just the scenario and the outcome. Each step feeds the next.
- **Success criteria** — measurable "you're done when…" checkboxes.
- **Deliverables** — exactly what gets committed (the portfolio artifact); lab *artifacts* (captures, keys, dumps) stay out of commits.
- **AI acceleration**, **Connects forward**, **Marketable proof**, and an optional **Stretch**.

The canonical fill-in templates for both files live in `CONTRIBUTING.md`.

## Secret & artifact hygiene

The labs drive tools (tcpdump, openssl, metasploit, volatility, prowler, …) that emit exactly the kind of files you must never commit: packet captures (`*.pcap`), keys and credentials (`*.pem`, `*.key`, `*_rsa`), memory/disk images, tokens, and verbose logs. The repo's `.gitignore` covers these plus malware sample dirs and the `site/` build output — keep it current, reference lab artifacts in the prose rather than committing them, and never commit real secrets or capture data into curriculum content.
