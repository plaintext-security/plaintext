# Verdict track — build status & open items

*The full 16-module track is drafted as prose (README + lab per module) under this directory, plus the
track `README.md`, `DESIGN.md` (spine/brief), and `SOURCES.md` (anchor catalogue). This file is the
honest punch-list: what's done, what's deliberately deferred, and what a real promotion to `tracks/`
would still owe.*

## Done

- **35 files:** track README + DESIGN + SOURCES + 16 × (README.md + lab.md).
- **Lab environments colocated.** Each module dir now also holds its runnable env (`Dockerfile`,
  `Makefile`, `docker-compose.yml`, `data/`, manifests, scripts), copied from `plaintext-labs` so the
  whole track is self-contained for review. `plaintext-labs` and the shipped `tracks/05-cloud/` are
  **untouched**. (Provisional layout — to be resorted into `tracks/` + `plaintext-labs/` once a direction is chosen.)
- **Meridian fully scraped, both prose and env.** The fictional company is gone everywhere (0 residual):
  the persona reframed to a neutral "the target account" (each README already names the *real* breach),
  and seed resources de-branded (`MeridianDevPolicy` → `DevPolicy`, `meridian-uploads-dev` → `uploads-dev`,
  the `data/account/meridian/` dir → `target/`, etc.) consistently across prose and the colocated env.
- Every module anchored to a **real, public breach or primary-source artifact** (Capital One, Code
  Spaces, Rhino 21-methods, the `0.0.0.0/0` wave, the 2017 S3 leaks, real Terraform misconfig class,
  Uber 2016, SolarWinds, Denonia, Docker Hub backdoors, runc CVE-2019-5736, Tesla 2018, Graboid, LastPass
  2022, the Capital One/LastPass detection gap).
- Each module applies the **shape-appropriate D-move** (predict-then-reveal where intuition misleads;
  build-first where the skill is procedural; detonate-only for the pure attack module) — not a rote template.
- Real tool/technical content from the **shipped modules preserved**; only the frame changed.
- Tooling honesty maintained throughout (LocalStack non-enforcement → `simulate-principal-policy`;
  Vulhub for the real CVE; "assessed from config" where a hop can't be reproduced locally).
- "Automate & own it" reframed to **judgment-as-code** (a guardrail that fails the bad state, passes the
  fix) in every build/audit module; the pure attack module (14) keeps a detonation harness instead, by design.

## Deliberately deferred (stated, not hidden)

- **Module count held at 16** for clean diff vs. the shipped track. The rebalance audit's **KMS /
  Data-Protection** module is still the one real topical hole; a truly complete track slots it after 04
  or alongside 07. (See `DESIGN.md` → "Known design decisions".)
- **Labs colocated but not re-validated.** The envs are now copied in beside each lab, but per
  CONTRIBUTING.md a module isn't *done* until `make up`/`make demo` is green — and these copies carry the
  Meridian→neutral renames plus the prose-assumed targets that were never built. See backfill below.
- **The form fails the current CONTRIBUTING.md bridge-prose rubric** (written for the essay). Promotion
  requires amending the charter so rules scale with module position (the meta-point in
  `../module-01-alternatives/CHARTER-CRITIQUE.md`).

## `<!-- VALIDATE -->` link/CVE markers (must confirm before any publish)

~33 markers across the track (run `grep -rn VALIDATE modules/`). Highest-priority clusters:
- **04** (4): Shodan exposure report, the specific Krebs MongoDB-ransom post, PrivateLink doc, Checkov rule IDs.
- **13** (4): exact Kyverno/Falco/K8s doc deep-paths (Graboid Unit 42 link is confirmed).
- **16** (4): LastPass incident-update FAQ exact URL, hayabusa/DFIR Report paths.
- **07** (3): current-year GitGuardian report, Vault tutorial slug, two AWS doc anchors.
- **02, 12** (federation/breach links): CISA SolarWinds ED 21-01 & Golden SAML advisory; RedLock/Unit 42 Tesla post.
- **06** (2): a concrete Terraform provider/module CVE by ID; current `checkov-action` input names.
- Modules **14 and 15 reported zero markers** — links validated against live primary sources.

## Lab-environment backfill (what `plaintext-labs/` would owe to make these *validated*)

The prose assumes a few targets/seed artifacts the existing lab envs don't yet ship. Each is a small,
well-scoped task — listed so the "prose ran ahead of the lab" gap is explicit, not silent:

| Module | Backfill needed in `plaintext-labs/cloud/<NN>/` |
|---|---|
| 02 | `make check-escalation` / `check-fixed` targets, `dev-alice-fixed-policy.json`, a `AppRole` |
| 03 | (optional) a bundled `graph-fixed.json` reference solution + a verify target |
| 04 | `reachability` / `reachability-fixed` targets + `check_reachability.py` |
| 07 | the deepened 4-service env: `db` + `localstack` services; `dynamic-creds` / `app-run` / `rotate-root` / `aws-secrets` targets |
| 11 | add a Vulhub runc (CVE-2019-5736) service so Half A runs the *real* CVE, not just the privileged-escape stand-in |
| 12 | seed the planted `cloud-creds` Secret (or soften prose to "kube-system Secrets only") |
| 13 | learner authors 2 new Kyverno policies + a Falco `/tmp`-exec rule — seed validates the base path only (by design) |
| 15 | a benign-only telemetry fixture + the FP-gate harness (fires on attack fixture, zero on benign) |

Modules 01, 05, 06, 08, 09, 10, 14, 16 are largely consistent with their existing lab envs as-is.

## Housekeeping before promotion

- Every README carries an `<!-- AUTHOR'S NOTE (delete before publish) -->` block explaining the
  Variant-D choices — strip these on promotion.
- Labs run ~130–170 lines (richer than the ~110 target) — trim Learn why-lines / Stretch if a tighter
  cut is wanted; the depth is deliberate, not padding.
- Add all pages to `mkdocs.yml` `nav:` (the rewrite lives outside `tracks/`, so it's not wired in).

## Suggested next decision points for the maintainer

1. **Read 2–3 contrasting modules end to end** — 06 (judgment-as-code exemplar), 14 (pure detonate), 16
   (the reconstruct finale) — to judge whether the form holds across shapes before committing.
2. If yes: **amend CONTRIBUTING.md** for module-position-scaled rules, then promote module-by-module,
   doing the lab backfill above as each moves into `tracks/`.
3. **Decide the KMS module** — the last real topical hole — as a 17th module or folded into 07.
