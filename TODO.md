# Plaintext — current work board

*Refreshed 2026-06-25. The original 24-task hardening program (T1–T24) is **complete** —
archived at [`planning/archive/dispatch-board-T1-T24-completed.md`](planning/archive/dispatch-board-T1-T24-completed.md).
This board tracks what's live now.*

## Done since the dispatch board

- **De-Meridian** — the fictional "Meridian Financial" is gone from every track (labs + prose) and the
  `curriculum-mcp` snapshot. Verified `grep -rli meridian` = 0 in both repos. Convention: **Corp** /
  `corp.local` / `Example Corp`.
- **Real-world artifacts (dimension 2)** — labs wired to real public data (abuse.ch, EVTX-ATTACK-SAMPLES,
  MalwareBazaar, MTA.net, loghub, live Samba DC). Confirmed across all tracks; legitimately-authored data
  (IaC/policy/crypto samples/ADRs) left as-is.
- **Labs Survey CI harness** — `labs-survey.yml` runs every lab (`make up?/demo/down`) and reports a
  PASS/FAIL scorecard; `promote: true` opens a PR adding `.ci-demo` to the greens. Tuned to 20-way
  parallel / 12-min timeout / native red-green.
- **Conversion audit** — 13-track prose+lab audit; findings in [`planning/audit/`](planning/audit/),
  consolidated remediation in [`planning/conversion-audit-remediation.md`](planning/conversion-audit-remediation.md).

## Active

| Status | Item | Where |
|--------|------|-------|
| 🟡 in review | **Labs PR #17** — survey tuning + ~31 category-D lab fixes (version bit-rot + code bugs) | plaintext-labs |
| ✅ | **A1** Type tags normalized — 34 `Variant D ·` → canonical `Type N ·` (+ 3 stray renderings); Variant D = 0 | plaintext `afcdac1` |
| ✅ | **A2** Deluxe tier sanctioned as go-forward template + type tag made required (CONTRIBUTING.md) | plaintext `afcdac1` |
| ✅ | **A3** 9 empty Learn sub-headers filled with real resources | plaintext `afcdac1` |
| ✅ | **A4** Stale track READMEs refreshed (crypto/python/automation/ai-ops/endpoint counts+tables+phases) | plaintext `afcdac1` |
| ✅ | **A5** Numbering reconciled in reader-facing surfaces (automation nav, ztna README match nav) | plaintext `afcdac1` |

## Next phase — after PR #17 merges + re-survey

| Status | Item | Where |
|--------|------|-------|
| ⬜ next | **Merge PR #17 → re-run Labs Survey → promote greens to `.ci-demo`** (dimension-3 validation loop) | plaintext-labs |
| ⬜ | **A5-tail** Physical dir-prefix renames (cosmetic URL slugs), bundled with the gitlink bump: automation `11-clickops`→`12`, ztna `10-vpn-ztna-migration`→stays-10 / `10-workload-identity-mtls`→`12` + symlink + nav-path fixes | both |
| ⬜ | **B** Reconcile genuine prose↔env lab mismatches (offensive 02/12, defensive 15/06/14/01, ai-ops eval harnesses, AD 06) — drive off the re-run survey's real fail list | both |
| ⬜ | **C** Per-track prose papercut sweep | plaintext |

Full detail + reconciliation (which auditor claims were stale) in the remediation doc.

## Conventions (unchanged)

Read `CLAUDE.md` + `CONTRIBUTING.md` first (hybrid-module model, lab-target rule, definition of done).
Keep `mkdocs build --strict` green; never commit secrets/heavy artifacts; `plaintext/` (prose) and
`plaintext-labs/` (labs) are siblings. Models: Opus for bridge prose/architecture, Sonnet for scoped
authoring, Haiku for mechanical bulk edits.
