---
name: progress-tracking-roadmap
description: Roadmap for progress tracking + completion recognition (receipts/credentials)
metadata: 
  node_type: memory
  type: project
  originSessionId: 889251c3-57b2-4f9e-8fab-1f2d5fc6d25c
---

## Progress Tracking & Completion Recognition

### What already exists (do not re-invent)
The receipts/credential system is already built in `plaintext-labs`:
- `make grade` → `scripts/grade.py` runs a lab's `grade.yaml` → writes `receipt.json` **into the learner's OWN portfolio repo** (NOT a PR to us).
- `scripts/verify_receipt.py` recomputes digest/HMAC to prove a receipt wasn't hand-edited.
- `scripts/track_certificate.py` rolls per-lab receipts into a track certificate + SVG badge.
- `GRADER_HMAC_KEY` is reserved for a future server-side grader (the anti-cheat the open repo can't do client-side).

**Key reframe:** completion already lands in the learner's GitHub with no PR to plaintext. The real
gap is *recognition/aggregation* — completion is invisible unless the learner manually shows it
(posts in Discord, pastes a badge). The work below closes that without manual steps.

### Progress display (browser, separate concern)
- Phase 1: local browser storage (localStorage/IndexedDB) + export/import JSON. No backend.

### Building NOW (decided 2026-06-10)
- **A — Self-verifying badge workflow.** Reusable GitHub Action learners paste into their portfolio
  repo; verifies receipts on push and renders a live progress badge in their README. Zero central
  infra. Lives in `plaintext-labs` (script + template workflow).
- **B — Discord verify-bot.** `/verify <repo>` clones, runs `verify_receipt.py`, auto-assigns a
  completion role (e.g. "Foundations Complete" unlocks channels), posts to `#completions`. Replaces
  manual posting. Builds on existing Discord server-as-code.

### Roadmap (deferred)
- **C — GitHub OAuth + serverless verifier (the spine).** GitHub login (reuse giscus auth) → a
  Cloudflare Worker / serverless fn reads the learner's portfolio repo, verifies receipts with the
  **server-held HMAC key**, writes to a central DB. Powers: cross-device progress sync (Patrick uses
  mobile + desktop), public profiles, opt-in leaderboard, resume generation. Opt-in; local storage
  still works without an account; user owns/can delete their data.
- **D — OpenBadges / LinkedIn-mintable credential.** Signed badge minted on completion, addable to
  LinkedIn. Rides on top of C. The "make it count on a résumé" layer.

**Sequencing:** A + B ship first (reuse what exists, no backend). C is the backend spine when ready.
D rides on C.

**Related:** [[project_mission|Project mission]] — supports the portfolio-is-the-credential model.
