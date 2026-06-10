# Plaintext — Improvement Plan (dispatch board)

Goal: make Plaintext **10x better than SANS** by hardening the *system around* already-strong content
— provably-working labs, provable/portable completion, and the open + AI-native advantages SANS can't copy.

**How to use this board.** Each task below is self-contained and independently kickable. Pick the
recommended model, start a fresh session, and paste the **Kickoff prompt**. Respect the `Depends on`
field. Tasks are ordered P0 → P2; do the P0 concrete fixes first (they're fast and one is a real bug).

### Standard session preamble (prepend to every kickoff prompt)
> Read `plaintext/CLAUDE.md` and `plaintext/CONTRIBUTING.md` first — they are the charter (hybrid-module
> model, lab-target rule, definition of done). Work on a new `feat/<slug>` branch, keep
> `mkdocs build --strict` green, never commit secrets/heavy artifacts, and open a PR when done. The two
> repos are siblings: `plaintext/` (prose) and `plaintext-labs/` (runnable labs).

### Model guidance
- **Opus 4.8** — deepest reasoning: architecture, credential/security design, editorial *bridge prose*, multi-track structural changes.
- **Sonnet 4.6** — default for scoped build/authoring tasks; best speed/quality balance.
- **Haiku 4.5** — fast/cheap: mechanical bulk edits, find-replace, boilerplate.

---

## Summary

Status: ✅ done · 🟡 partial · ⬜ not started · ➖ n/a

| # | Status | Task | Pri | Repo | Model | Effort | Depends on |
|---|--------|------|-----|------|-------|--------|-----------|
| T1 | ✅ | Fix labs-dir numbering drift + repoint paths | P0 | both | Sonnet 4.6 | S | — |
| T2 | ✅ | Add authorization notes to attack labs | P0 | plaintext | Haiku 4.5 | XS | — |
| T3 | ✅ | Verify/fix dead links (OWASP RE + sweep) | P0 | plaintext | Haiku 4.5 | S | — |
| T4 | ✅ | Reword learner `# TODO:` scaffolds → `# YOU:` | P0 | plaintext | Haiku 4.5 | XS | — |
| T5 | ✅ | Lab CI + cross-repo consistency check (incl. opt-in `.ci-demo` re-scope) | P0 | plaintext-labs | Opus 4.8 | L | — |
| T6 | ✅ | `make grade` grading system + completion receipts | P0 | plaintext-labs | Opus 4.8 | XL | T5 |
| T7 | ✅ | Track certificate + public verification page | P1 | both | Opus 4.8 | L | T6 |
| T8 | ✅ | Phase structure across tracks 03–12 | P1 | plaintext | Opus 4.8 | L | — |
| T9 | ✅ | Capstone rubrics (13) + lab capstone scaffolds | P1 | both | Sonnet 4.6 | M | — |
| T10 | ✅ | Even out thin bridge prose + quality gate | P1 | plaintext | Opus 4.8 | M–L | — |
| T11 | ✅ | Start-Here/roadmap + glossary + per-module headers + progress tracking | P1 | plaintext | Sonnet 4.6 | M | — |
| T12 | ✅ | MCP server over the curriculum (AI tutor) | P2 | plaintext-labs | Sonnet 4.6 | M | — |
| T13 | ✅ | AI rubric-grader for design/paper labs | P2 | plaintext-labs | Sonnet 4.6 | M | T6 |
| T14 | ✅ | Link-check CI + per-module "last reviewed" | P2 | plaintext | Sonnet 4.6 | S–M | T3 |
| T15 | ✅ | Living CISA-KEV lab (defensive module 17) | P2 | both | Sonnet 4.6 | M | T5 |
| T16 | ➖ | Accessibility: alt-text audit (n/a — curriculum has no images) | P2 | plaintext | Sonnet 4.6 | S–M | — |
| T17 | ✅ | Community: showcase + office hours + instructor guide | P2 | plaintext | Sonnet 4.6 | M | — |
| T18 | ✅ | Triage & fix labs failing the full CI matrix; opt each into `.ci-demo` | P1 | plaintext-labs | Sonnet 4.6 (Opus for design calls) | L | T5 |
| T19 | 🟡 | PR build gate: `mkdocs build --strict` on pull_request (today it's push-to-main only) | P1 | plaintext | Sonnet 4.6 | S | — |
| T20 | 🟡 | pytest + CI for the grading/credential scripts (grade/verify/certificate/consistency) | P1 | plaintext-labs | Sonnet 4.6 | M | T6 |
| T21 | 🟡 | `grade.yaml` schema-lint in CI | P2 | plaintext-labs | Sonnet 4.6 | S | T6 |
| T22 | 🟡 | Document grading/`.ci-demo`/credentials in CLAUDE.md + CONTRIBUTING.md + a learner page | P1 | plaintext | Sonnet 4.6 | M | — |

*(T19–T22 added 2026-06-10 from a testing/CI + docs review — the grading system shipped but was untested in CI and undocumented in the charter, and PRs had no build gate.)*

---

## P0 — Concrete fixes (do first)

### T1 — Fix labs-dir numbering drift + repoint paths · Sonnet 4.6 · both repos
**Why:** the PowerShell merge renumbered modules in `tracks/` but not the lab dirs, leaving duplicate
prefixes (`offensive/15-cloud-primer` + `15-powershell-tradecraft`; `defensive/13-powershell-logging-hunting`
+ `13-triage-ir`) and a stale clone path in `16-cloud-primer/lab.md`.
**Done when:** every `tracks/<track>/modules/NN-*` has a same-numbered `plaintext-labs/<track>/NN-*` dir;
no duplicate prefixes; every `lab.md` clone path resolves; `make up` still works for renamed labs.
> **Kickoff:** Reconcile `plaintext-labs/` directory numbering with `plaintext/tracks/` after the
> PowerShell insertion. In `plaintext-labs`, `git mv` `offensive/15-cloud-primer`→`16-cloud-primer`,
> `offensive/16-reporting`→`17-reporting`, `defensive/13-triage-ir`→`14-triage-ir`,
> `defensive/14-threat-intel`→`15-threat-intel`, `defensive/15-soar`→`16-soar` (verify against the
> current `tracks/` numbers first). Then fix every affected `lab.md` clone path in `plaintext/`. Confirm
> no duplicate numeric prefixes remain and a sampled renamed lab still `make up`s.

### T2 — Add authorization notes to attack labs · Haiku 4.5 · plaintext
**Why:** charter requires an authorization note on any lab that attacks a target; several are missing it.
**Done when:** `01-offensive/.../15-powershell-tradecraft/lab.md`, `06-active-directory/.../08-path-to-da/lab.md`,
and any other attack lab missing it carry the standard note.
> **Kickoff:** Grep every `lab.md` under `tracks/01-offensive` and `tracks/06-active-directory` for an
> authorization note ("own or have explicit written permission"); for any attack lab missing it, add the
> standard note (match the wording in `01-offensive/modules/06-web-injection/lab.md`). Don't add it to
> pure-defensive/hardening labs.

### T3 — Verify/fix dead links · Haiku 4.5 · plaintext
**Why:** a free curriculum loses trust fast on dead links; the malware RE link is suspect.
**Done when:** the OWASP reverse-engineering link in `04-malware/.../07-disassembly-basics/README.md` is
fixed or replaced; a one-off sweep of all `Learn`/Further-reading links reports status; broken ones fixed.
> **Kickoff:** Run a link check across all `tracks/**/*.md` (e.g. `lychee`). Fix or replace every broken
> link with the specific, current resource (never invent URLs — verify each). Start with the OWASP
> reverse-engineering URL in `04-malware/modules/07-disassembly-basics/README.md`. Report what changed.

### T4 — Reword learner `# TODO:` scaffolds · Haiku 4.5 · plaintext
**Why:** learner-facing `# TODO:` in starter scaffolds reads as the author's unfinished work (it already
caused a false "track incomplete" review).
**Done when:** `# TODO:` lines inside "Starter scaffold"/"Automate & own it" code blocks become `# YOU:`
or `# your code here:`; no change to genuine author-side notes.
> **Kickoff:** In `tracks/05-cloud` (and any other track) find `# TODO:` lines inside learner-facing
> starter-scaffold code blocks and reword to `# YOU:` so they clearly mark the learner's fill-in. Leave
> any real author TODOs alone.

## P0 — Systems

### T5 — Lab CI + cross-repo consistency check · Opus 4.8 · plaintext-labs
**Why:** 158 labs, **zero CI** — the top reliability risk. A consistency check would have caught T1.
**Done when:** a GitHub Actions workflow runs `make up && make demo && make down` per lab (changed-labs
on PR via path filter, full matrix nightly), pinned base images, and a job asserting every `tracks/`
module has a same-numbered labs dir; per-lab pass/fail visible.
> **Kickoff:** Design and build CI for `plaintext-labs`: a matrix that runs `make up && make demo &&
> make down` for each lab (changed-only on PRs, full nightly), with sensible timeouts and log capture.
> Add a consistency job that fails if any `plaintext/tracks/<track>/modules/NN-*` lacks a same-numbered
> `plaintext-labs/<track>/NN-*` (and vice-versa). Pin base images to digests. Make per-lab status legible.

### T6 — `make grade` grading system + completion receipts · Opus 4.8 · plaintext-labs · depends T5
**Why:** the single biggest 10x lever — free, verifiable proof of competence (the GIAC replacement).
There's currently **no assessment anywhere**. A strong design existed on the deleted `feat/lab-validation`
branch — recover it from git history if reachable.
**Done when:** a shared grader lib + per-lab `grade.yaml` + `make grade` target supporting check types
(flag, artifact-functional against held-out data, structural lint, target-state); a passing grade emits a
signed **completion receipt** (JSON: lab id, timestamp, checks passed, artifact hash) a learner commits to
their own repo; retrofitted onto `detection-as-code`, `web-injection`, `log-parsing` as proofs.
> **Kickoff:** Design and implement an automated lab-grading system for `plaintext-labs`: a shared grader
> library, a per-lab `grade.yaml` manifest, and a `make grade` target. Support check types: flag, artifact
> (functional, run against held-out labeled data), structural (schema/lint), and target-state. On pass,
> emit a signed completion-receipt JSON the learner can commit to their own repo and run as a green GitHub
> Action. Retrofit three exemplar labs. Recover the prior design from the `feat/lab-validation` branch if
> present in history. Open a design note + PR.

## P1 — Consistency, learner experience, credential

### T7 — Track certificate + public verification page · Opus 4.8 · both · depends T6
**Done when:** completing all lab grades + the capstone in a track yields a verifiable "Plaintext Track
Certificate" (badge + a public verification page that checks the signed receipts). Free, but real.
> **Kickoff:** Design a free, verifiable track-completion credential built on the T6 completion receipts:
> a signing/verification scheme (open repo ⇒ self-verification + portfolio evidence, document the trust
> model honestly), a learner-facing badge, and a public verification page on the MkDocs site. No
> server-side secrets required for the open model; note what a real proctored credential would need.

### T8 — Phase structure across tracks 03–12 · Opus 4.8 · plaintext
**Why:** only foundations/offensive/defensive have phases + phase projects; the other 10 tracks don't.
**Done when:** every track groups modules into phases each ending in a phase project, consistently with
the first three; track READMEs and `mkdocs.yml` nav updated; build green.
> **Kickoff:** Bring the phase + phase-project structure (as used in `tracks/00-foundations`,
> `01-offensive`, `02-defensive`) to tracks 03–12. For each track, group its modules into coherent phases,
> author a phase project per phase (portfolio-worthy, integrates+automates the phase), and update the track
> README. Keep modules digestible; concentrate big builds in phase projects. Keep `mkdocs build --strict` green.

### T9 — Capstone rubrics + lab capstone scaffolds · Sonnet 4.6 · both
**Done when:** each of the 13 capstones has an explicit rubric (exemplary/proficient/developing) and a
`<track>/capstone/` starter scaffold in `plaintext-labs` (none currently exist).
> **Kickoff:** For all 13 tracks, write a capstone rubric (exemplary / proficient / developing, with
> concrete criteria) into the track README, and add a `<track>/capstone/` starter scaffold in
> `plaintext-labs` (README + minimal structure + acceptance criteria). Match the charter's capstone intent.

### T10 — Even out thin bridge prose + quality gate · Opus 4.8 · plaintext
**Why:** ~15–20% of "The core idea" sections are thin vs. siblings (e.g. `03-forensics/07-timeline-analysis`,
`06-active-directory/08-path-to-da`, `01-offensive/02-scanning`).
**Done when:** the flagged thin modules are brought to the depth of the strong exemplars (mental model,
practitioner translation, judgment) without re-teaching basics; a short authoring quality-checklist added
to CONTRIBUTING.md.
> **Kickoff:** Audit every module's `## The core idea` for bridge-prose depth against the strong exemplars
> (`00-foundations/01-security-principles`, `02-defensive/08-detection-as-code`). Rewrite the thin ones
> (start with `03-forensics/07-timeline-analysis`, `06-active-directory/08-path-to-da`,
> `01-offensive/02-scanning`) to add mental model + practitioner translation + judgment — without
> re-explaining what Learn links already cover. Add a bridge-prose quality checklist to CONTRIBUTING.md.

### T11 — Start-Here/roadmap + glossary + progress tracking · Sonnet 4.6 · plaintext
**Done when:** a "Start Here" page (how the curriculum works, track order, AI posture, prerequisites), a
cross-curriculum glossary, a per-module difficulty/time/prereq header, and client-side (localStorage)
progress checkboxes all exist and are in the nav.
> **Kickoff:** Add learner-experience scaffolding to the MkDocs site: a "Start Here / How to use this"
> page (suggested track order, prerequisites, the AI posture), a cross-curriculum glossary, a consistent
> per-module difficulty + time + prerequisites header, and lightweight client-side progress tracking
> (localStorage checkboxes). Wire into `mkdocs.yml` nav; keep the strict build green.

## P2 — AI moat, currency, community

### T12 — MCP server over the curriculum · Sonnet 4.6 · plaintext-labs
> **Kickoff:** Build an MCP server that exposes the Plaintext curriculum (modules, labs, Learn paths) as
> tools/resources so a learner can point Claude/Cursor at it as a context-aware tutor. Ship it as a
> runnable lab and consider making "build/extend it" a capstone for Track 09/12. Document setup.

### T13 — AI rubric-grader for design/paper labs · Sonnet 4.6 · plaintext-labs · depends T6
> **Kickoff:** For the design/paper labs that can't be auto-graded (threat modeling, reporting), add an
> AI rubric-grader that gives advisory feedback against the rubric — never a hard gate. Integrate with the
> T6 grade flow as an advisory check type.

### T14 — Link-check CI + per-module "last reviewed" · Sonnet 4.6 · plaintext · depends T3
> **Kickoff:** Add a scheduled link-checking CI job (lychee) over `tracks/**`, plus a per-module
> "last reviewed: YYYY-MM" field and a CI nudge when a module goes stale past N months. Report cleanly;
> don't fail the deploy on transient 429s.

### T15 — Living CISA-KEV lab · Sonnet 4.6 · both · depends T5
> **Kickoff:** Build a lab that refreshes against the current CISA Known Exploited Vulnerabilities catalog
> — pull the feed, pick a recent KEV with a Vulhub target where possible, and have the learner exploit +
> detect it. Make the "what's current" part automated so the lab stays fresh. Something static courseware can't match.

### T16 — Accessibility: alt-text audit · Sonnet 4.6 · plaintext
> **Kickoff:** Audit every image/diagram across `tracks/**` for meaningful alt text; add it where missing
> (describe what the image teaches, not "screenshot"). Note any video-heavy modules that would benefit
> from a short text summary.

### T17 — Community: showcase + office hours + instructor guide · Sonnet 4.6 · plaintext
> **Kickoff:** Add community/social-proof scaffolding: a graduate/capstone showcase page, an office-hours
> structure (tie to the Discord in `COMMUNITY.md`), and an instructor/cohort guide (running Plaintext as a
> cohort: pacing, scaffolding, how to review phase projects and capstones). Keep it honest — no fake testimonials.

### T18 — Triage & fix labs failing the full CI matrix; opt each into `.ci-demo` · Sonnet 4.6 (Opus for design calls) · plaintext-labs · depends T5
**Why:** the first full Labs CI run (T5) exercised all 158 labs and surfaced two classes of red:
genuine bugs and labs that fail *by design*. Already handled: the AD `samba-tool` build bug (fixed)
and the matrix re-scope to **opt-in** via `.ci-demo` (so learner-exercise / VM-cloud labs aren't
false failures). What remains is to walk the full failure census and resolve each lab.
**Per-lab triage (three buckets):**
- **Genuine bug** → fix it, confirm `make up && make demo && make down` is green, then add a `.ci-demo`.
- **Learner-exercise** (demo intentionally fails until completed — e.g. a Dockerfile the learner
  writes, `# YOU:` scaffolds) → leave unmarked; no `.ci-demo`.
- **VM / cloud** (needs Windows / hypervisor / real cloud creds) → leave unmarked; note it in the lab.
**Known specifics:** `automation/06-containerising-tooling` `data/seed-repo` is committed as an empty
git submodule with no `.gitmodules` (real bug) — fix as part of that lab's completion; shipping a
scannable git repo as seed data needs a small design choice (init at demo-time from committed plain
files, or scan in filesystem mode). The active-directory attack labs may still not be CI-green even
after the build fix (they provision a samba DC + run an attack) — verify before opting them in.
**Done when:** every lab is either green **with** a `.ci-demo`, or intentionally unmarked **with a
one-line reason**; the full matrix census has been triaged; no lab is red-by-accident.
> **Kickoff:** Trigger the full Labs CI matrix (workflow_dispatch on `labs-ci.yml`, no `only` input)
> and collect the per-lab pass/fail census. For each failing lab, classify it: genuine bug (fix it,
> get `make demo` green on a Linux runner, add a `.ci-demo` marker), learner-exercise (leave
> unmarked), or VM/cloud (leave unmarked, note in `lab.md`). Fix `automation/06`'s `seed-repo`
> submodule as part of that lab. Report the final census: green+opted-in vs intentionally-unmarked.

---

*Generated from a content+structure review on 2026-06-10. Re-run the assessment after P0/P1 land to re-prioritise P2.*
*Update 2026-06-10 — COMPLETE. Every task T1–T18 is merged to `main` in both repos (T16 was n/a — no images). Landed across: plaintext PRs #14–24 and plaintext-labs PRs #1–7, plus the module-17 polish. All `mkdocs build --strict` green; the opt-in Labs CI (`.ci-demo`) is green on its 4 enforced reference labs.*

*Ongoing (not a task — a maintenance loop): Labs CI coverage grows as more labs are verified green and opted in (T18 fixed the `discover` bug, `automation/06`, and 9 broken `make demo` recipes; those 9 are left unmarked until the nightly full matrix confirms them green). New tasks discovered during the work should be appended below.*
