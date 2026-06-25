# ZTNA "Verdict" conversion — status

*Wave 3, track 2. Drafted in `planning/ztna-d/` (prose-complete); live `tracks/11-ztna` untouched.
Honor-system. The track was already healthy (8/9 clean) so most modules are light conversions; the real
work is two new modules + the 09 eval/drift add.*

## Done (this push)
- **DESIGN.md** spine (per-module type + anchors + actions).
- **11 modules drafted** (9 conversions + 2 new):
  - 01 principles → **Concept Autopsy** (Colonial Pipeline 2021 VPN-no-MFA + Target/OPM; predict-then-reveal)
  - 02 identity control plane → **Build-&-Operate** (Keycloak/OIDC; Storm-0558 token-forgery stakes)
  - 03 device trust → **Build-&-Operate** (Headscale/WireGuard/FIDO2; LastPass-2022 home-machine pivot)
  - 04 architectures → **Decision/ADR** (the curriculum's ADR template — kept exemplary)
  - 05 SASE → **Build-&-Operate** (Cloudflare Tunnel, no inbound; build-vs-buy defended)
  - 06 identity-aware access → **Build-&-Operate + Gate** (Pomerium; the `X-Pomerium-Jwt-Assertion` header-forgery gotcha)
  - 07 microsegmentation → **Build-&-Operate + Judgment-as-Code** (Cilium default-deny; NotPetya lateral-movement anchor; + a "pivot anyway" red-team beat)
  - 08 policy-as-code → **Gate** (OPA/Rego; the silently-absent fail-open deny rule)
  - 09 monitoring → **Reconstruct/Detect + Eval Harness (#13) + Drift (#16)** (held-out corpus + scorecard + regression gate; token-creep/exception/posture-decay drift detector)
  - **NEW · VPN → ZTNA Migration** → **Type 12** — the missing centerpiece (strangler-fig cutover, cohort-by-cohort, prove no outage, decommission VPN)
  - **NEW · Red-team Your ZT Deployment** → **Type 10** — the curriculum's Design→red-team-your-own-design exemplar (port scan, unauth-deny, header forgery, proxy bypass → harden)

## Promotion remaining (for the ztna merge)
1. **Placement of the two new modules** — Migration between 06–07 (or Phase-3 project); Red-team in Phase-3. Renumber decision.
2. **Lab-env builds** (specs appended to each new lab.md; build + `make demo`-validate in `plaintext-labs/ztna/`):
   - **Migration** — the side-by-side VPN + identity-aware-proxy env + cohort cutover/rollback + before/after access-test harness.
   - **Red-team** — reuse the 06 Pomerium env + a naive header-trusting backend (to demonstrate the forgery finding) + an nmap/curl `make attack` harness.
   - **09** — the held-out corpus + `eval.py`/`make eval`/`make gate` + the `drift.py` baseline/reconcile loop (mirror ai-ops 11 / defensive 09).
   - **01** — add `data/colonial-timeline.md`.
3. **Scrub Meridian from the live ztna lab envs** (the whole track uses it — Makefiles, seed data, realm/client names). The converted *prose* is already clean.
4. **Resolve ~6 VALIDATE clusters** (incl. a final check on the recent CVE citations — ztna 06/red-team cite CVE-2026-40575; confirm). Strip AUTHOR'S NOTE; move prose → tracks/ + plaintext-labs; nav; `mkdocs --strict`; merge.

## Note
ztna 04 stays the **ADR template** for the whole curriculum. No lab envs were modified this push (prose +
specs only), so the labs branch/submodule are unchanged from automation's checkpoint.
