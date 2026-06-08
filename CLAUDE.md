# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

Plaintext is an open security-education curriculum (CC BY 4.0). The curriculum is authored in **Markdown under `tracks/`** and published as a **[Material for MkDocs](https://squidfunk.github.io/mkdocs-material/) static site**. There is no application code or test suite — work here is almost entirely Markdown authoring, plus the MkDocs config and one hand-authored landing-page template. The one build step is `mkdocs build` (see Deployment).

**Two repos.** Plaintext is split so that prose and runnable code don't tangle:
- **`plaintext`** (this repo) — the curriculum you *read*: module concepts, the *Learn* path, lab instructions. Pure Markdown; nothing here needs to be built or run.
- **[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs)** — the companion repo you *clone & build*: every lab's `docker-compose`, Dockerfiles, seed data, harnesses, and per-track capstone starters, laid out `<track>/<NN-module-name>/`. A lab's *instructions* live here; its *environment* lives there.

So: when a task involves editing lab **prose**, it's this repo. When it involves the lab **environment** (a container, seed data, a helper script, a capstone scaffold), that's `plaintext-labs` — typically a sibling clone at `../plaintext-labs`.

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

`.github/workflows/deploy.yml` deploys to GitHub Pages via GitHub Actions, **on push to `main` only**. CI installs `requirements.txt`, runs `mkdocs build --strict`, and publishes `site/`. The site is a project page served under the `/plaintext/` path (`https://plaintext-security.github.io/plaintext/`); MkDocs handles base-path-relative links, so use the `url` filter in templates and normal relative links in Markdown.

A failed build does **not** take down the live site — Pages keeps the last good deploy — but it does mean your change is not published until the build is green. (The published Pages site may be unreachable from sandboxed environments that block `*.github.io`; verify a deploy succeeded via the GitHub Actions run status instead.)

## Content structure and authoring rules

Track and module directories are zero-padded and numbered (`00-foundations`, `modules/01-networking`); see the [Repo map](#repo-map). The canonical templates for a module `README.md` and `lab.md` live in `CONTRIBUTING.md` — follow them when adding or editing modules. The binding rules:

- **Original writing from primary sources — for the bridge, not the basics.** Do not copy from SANS, Offensive Security, or other proprietary course material. Topic *coverage* may be informed by such courses; prose and structure must be original. And per [the hybrid model](#the-hybrid-model--what-a-plaintext-module-is): write original prose where Plaintext adds value (the bridge, synthesis, judgment) — *curate*, don't rewrite, the step-by-step explanation that free resources already cover well.
- **Open-source first, not open-source only.** Prefer OSS tools; free/community editions (e.g. Burp CE) and the genuine real-world tool are acceptable where that is what the job actually uses. Labs must still be reproducible at zero cost.
- **Hands-on and job-ready.** "In the dirt," not certification theory — every module ends in something the learner *does*, and every track ends in a **capstone** (a portfolio-worthy artifact).
- **Tie it to the real world.** Wherever you can, ground modules and labs in genuine artifacts, not invented toy examples: real CVEs (by ID, via NVD / CISA KEV), real public datasets (Kaggle, Malware-Traffic-Analysis.net, public PCAP/EVTX repos, MalwareBazaar), real MITRE ATT&CK techniques, and actual tool output. The closer a lab is to what a practitioner truly sees, the more it transfers to the job.
- **Tracks are standalone; cross-references enrich, they don't gate.** A specialization track depends only on Foundations, never on a sibling track. Lean into the offense↔defense interplay as *connective tissue* (callbacks and "Connects forward" notes), but whenever a lab would use an artifact from another track — e.g. detecting the attack from Track 01 — give a self-contained way to get it (a real public dataset, or a generate-it-here step) so the learner can complete the track without having done the other.
- **Containers for reference labs; external targets allowed elsewhere (for now).** A *reference* lab ships a one-command environment **in `plaintext-labs`** — a `docker-compose.yml`, a small bundled `data/` set, and a `Makefile` (`up`/`down`/`reset`/`demo`) under `plaintext-labs/<track>/<NN-module-name>/` — so `git clone` + `make up` and the lab is live. The lab's `lab.md` (here) carries the instructions and links to that directory. Use VMs or cloud free-tier accounts only where the domain demands it (Active Directory, cloud). The reference exemplars are [`02-defensive/.../08-detection-as-code`](tracks/02-defensive/modules/08-detection-as-code/) (run a tool over bundled data) and [`01-offensive/.../06-web-injection`](tracks/01-offensive/modules/06-web-injection/) (attack a shipped vulnerable app), with environments in `plaintext-labs/` — copy those shapes.
- **Choosing a lab target (decide per lab, in this order):**
  1. **Wrap a known vulnerable image** when a mature one exists for the topic — Vulhub (per-CVE `docker-compose`), OWASP Juice Shop, DVWA, CloudGoat, flaws.cloud. Pull it in the lab's `docker-compose.yml` and add our `Makefile`/demo on top. This is the **default** for breadth and realism, and it satisfies "tie it to real artifacts." Real CVEs/datasets beat invented ones — **if Vulhub has it, prefer Vulhub.**
  2. **Point at an external target** (PortSwigger Web Security Academy, a TryHackMe free room) when there is no value in us hosting it — browser-based or already frictionless.
  3. **Build a custom minimal target** *only* when it teaches the mechanism better than a black box: when the demo must be legible and deterministic, when the learner edits the source to apply the fix (attacker→fixer), or when it anchors the Meridian narrative. Keep it tiny and honest — never a toy standing in for a real CVE that already exists (e.g. exploitation labs should use Vulhub, not a hand-rolled stand-in).
- **AI is core.** Every track carries an `## AI & automation` section, and modules should weave in the AI-acceleration move for that topic. The standing posture: **AI authors → you review → you own it** — automation is assumed; the differentiating skill is directing and rigorously reviewing it.
- **Cite multiple primary sources** (CVEs, RFCs, tool docs, papers, MITRE ATT&CK) in "Further reading".
- **Keep resources fresh.** Vary the sources cited in *Learn* across modules — don't send learners to the same site or author every time. Reuse a resource only when it is genuinely the best fit for that topic; otherwise prefer a different high-quality source so the curriculum has breadth.
- **Link to the specific resource, and validate it.** Never drop a learner a bare YouTube *channel* or a firehose playlist — link an *actual video* and say roughly how long it is or what to watch for. For a large doc or spec, link it only if it genuinely matters, and say exactly what to read (which chapters/sections) — never send someone to a 200-page manual unscoped. Every link must be checked to resolve to the specific, current resource it claims; do not guess or invent URLs (especially YouTube video IDs).
- **Labs are offensive-capable by nature** — keep the authorization rule explicit in any lab that attacks a target: only test systems you own or have explicit written permission to test, and point learners at intentionally vulnerable targets (DVWA, CloudGoat, locally spun VMs, free CTF rooms).

New modules are proposed via the `.github/ISSUE_TEMPLATE/new-module.md` issue template (which doubles as the per-module intake form: track, title, objective, tools, time, background).

## The hybrid model — what a Plaintext module IS

This is the editorial identity. Get it wrong and you either rewrite what the internet already
explains better (waste) or ship a link list that doesn't teach (thin). The resolution:

> **Curate the raw explanation; write original prose for the bridge.**
> The step-by-step "how TCP works / how Kerberos works" is covered well by people who did it
> better — *link* to it (the **Learn** path). Plaintext's original value is the **bridge**: the
> mental model, the practitioner translation ("a cloud Security Group *is* the stateful firewall
> rule you've written for years"), the synthesis across sources, the gotchas and judgment no
> single linked resource states, and the "why this matters to a defender." **Write the bridge;
> don't re-teach the basics.**

This reconciles the two rules that otherwise pull apart — "original writing from primary sources"
and "don't regurgitate what's well-covered." We write originally, but only where we add something.

The depth that makes this "professional-grade" comes from **the bridge + the lab + the
automation build**, not from re-explaining fundamentals. SANS hands you a book; we hand you a
sharp mental model, a curated path to the details, and a real thing you build and own.

## Module anatomy — every module is a guided learning unit

A module is **not** a summary page, and **not** a bare link list. It is a self-contained unit that
takes a learner from *why* all the way to a committed artifact. Two failure modes to avoid: the
**thin module** (a sentence of concept plus three bare links) and the **regurgitation module**
(re-explaining at length what a linked resource already nails). The anatomy spreads across the
module's two files:

**`README.md` — the bridge + the study path**
- **Why this matters** — the 90-second "so what," and where it gets reused in later tracks.
- **Objective** — measurable and job-relevant.
- **The core idea** — **the original-prose teaching section: 2–5 short paragraphs of the bridge**
  (mental model, practitioner translation, cross-source synthesis, the judgment/gotchas). This is
  Plaintext's original value and the thing the current modules are missing. It frames and connects;
  it does **not** re-derive what a Learn link explains step-by-step.
- **Learn (~N hrs)** — a curated, time-boxed, *opinionated* path: grouped resources (video-first
  where that helps) with real links and a line on why each earns the time. **This carries the raw
  explanation** — so "The core idea" doesn't have to. Keep the sources fresh across modules; don't
  lean on the same few sites or authors.
- **Key concepts** — a short bulleted **recap/checklist** of "The core idea" (not the teaching itself).
- **AI acceleration** — the AI/automation move for this topic, and what the learner must review and own.

**Definition of done (a module is finished when):** "The core idea" is substantive original prose,
not a list; **Learn** is grouped, time-boxed, and every link has a why-line; the lab follows the
full template below including the required **Automate & own it** build; and any lab that attacks a
target carries the authorization note.

**`lab.md` — the project**
- **Setup** (Docker-first) and **Scenario** (with the authorization note where it attacks a target).
- **Do** — an ordered checklist of *objectives*, not transcribed commands: state the goal (plus a hint) and let the learner derive the *how* from the Learn path and `man`. Show a command only when the syntax itself is the lesson. Scale the hand-holding to the track — **Foundations:** objective + a hint; **specialization tracks:** the objective; **advanced:** just the scenario and the outcome. Each step feeds the next.
- **Success criteria** — measurable "you're done when…" checkboxes.
- **Deliverables** — exactly what gets committed (the portfolio artifact); lab *artifacts* (captures, keys, dumps) stay out of commits.
- **Automate & own it** — a *required* step: turn the lab's manual work into a small reusable script/tool (or an AI/MCP/RAG build where the topic fits), with **AI drafting and the learner reviewing every line**, committed alongside the deliverable. This is where the AI/automation thread becomes hands-on rather than advisory.
- **AI acceleration**, **Connects forward**, **Marketable proof**, and an optional **Stretch**.

**Tracks group their modules into phases, and every phase ends in a phase project** — a larger, portfolio-worthy build that integrates and automates the phase's modules (a *phase* is the substantial, standalone unit; a single module is a few hours). The per-track **capstone** then integrates the phases. Keep individual modules digestible; concentrate the bigger builds in the phase projects and the capstone.

The canonical fill-in templates for both files live in `CONTRIBUTING.md`.

## Secret & artifact hygiene

The labs drive tools (tcpdump, openssl, metasploit, volatility, prowler, …) that emit exactly the kind of files you must never commit: packet captures (`*.pcap`), keys and credentials (`*.pem`, `*.key`, `*_rsa`), memory/disk images, tokens, and verbose logs. This repo's `.gitignore` covers these plus the `site/` build output; the **`plaintext-labs`** repo (where the runnable labs actually live and generate these files) carries its own matching `.gitignore`. In both: small *curated* seed data is committed on purpose, but generated/heavy artifacts, malware samples, and real secrets never are — reference them in the prose, or have the lab download/generate them.
