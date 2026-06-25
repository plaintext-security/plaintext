# Type pass — Track 11 · Zero Trust Network Access

Spine (per the library): Design-&-defend + Decision/ADR + Migration. Anchors lean on real
lateral-movement breaches and a reference architecture; verbs are mostly **build** and **design**.
Track-wide fictional anchor is "Meridian Financial," which threads cleanly across all nine modules.

| Module | Primary | Secondary | Fit | Note |
|---|---|---|---|---|
| 01 Zero Trust Principles | 1 Concept Autopsy | 11 Decision/ADR (latent) | ✓ | Predict-then-reveal on flat-interior breaches; deliverable is a pillar gap-analysis + roadmap. Names the model but cites generic incidents — could sharpen onto a *named* breach (Target/OPM/SolarWinds) for a harder predict. |
| 02 Identity as the Control Plane | 7 Build-&-Operate | — | ✓ | Stand up Keycloak, mint a JWT via OIDC, reason about federation. Clean build module; the "claim/token-lifetime gotcha" gives it judgment. |
| 03 Device Trust & Posture | 7 Build-&-Operate | — | ✓ | Headscale + WireGuard device enrollment; posture-policy mapping. Solid build; posture half stays conceptual (Cloudflare/CrowdStrike) since it can't be self-hosted. |
| 04 ZTNA Architectures | 11 Decision/ADR | 10 Design→red-team | ✓ | **Exemplary ADR** — scoring table, Nygard format, forced honest Consequences, SWIFT-gateway attack-path paragraph. This is the model other architecture modules should copy. |
| 05 SASE & Cloud-Delivered ZT | 7 Build-&-Operate | 10 Design→red-team | ✓ | Cloudflare tunnel + Access policy, no inbound ports; includes a "verify denial" unauth step and an attacker-cost paragraph — genuine red-team-your-design seasoning, not just a survey. |
| 06 Identity-Aware Access | 7 Build-&-Operate | 8 Judgment-as-Code | ✓ | Pomerium OIDC proxy; trace unauth vs auth request end-to-end. Deny-path verification carries the judgment thread. |
| 07 Microsegmentation | 7 Build-&-Operate | 8 Judgment-as-Code | ✓ | Cilium/eBPF default-deny policy in kind; prove backend→db allowed, frontend→db denied via Hubble. Strong allow+deny proof. |
| 08 Policy as Code | 8 Judgment-as-Code/Gate | 7 Build-&-Operate | ✓ | OPA/Rego allow+deny, K8s admission reject-root; the "silently-absent deny rule" gotcha is the centerpiece. Textbook gate module. |
| 09 Monitoring & Detection | 6 Reconstruct/Detect | 16 Drift, 13 Eval Harness (latent) | ⚠ | Sigma rule over bundled ZT access logs (unexpected-country). Detect half is solid; the **Drift** angle the library predicts (policy/posture drifting from intended steady-state over time) is absent, and the rule has no test-corpus/regression framing (Eval Harness). |

Legend: ✓ shape matches content · ⚠ partial mismatch or missing predicted secondary.

## Coverage gaps

- **Migration / Brownfield (#12) — the predicted missing centerpiece, confirmed.** No VPN→ZTNA
  migration module and no `migration/` dir in `plaintext-labs/ztna/`. Module 01's scenario *sets up*
  the brownfield (Cisco AnyConnect on a flat /20) and 04 *decides* the target architecture — but
  nothing covers the strangler-fig cutover: run VPN and ZTNA side-by-side, move apps one at a time,
  prove nothing breaks, decommission. This is the single most real-world ZTNA task and the track
  jumps over it.
- **Design→red-team-your-own-design (#10) is present but thin.** Only 05 makes the learner attack
  their own no-inbound-ports deployment (one incognito "verify denial" step). The library predicts
  04/07 should also red-team the design; 07's Cilium lab proves the deny case but stops short of an
  adversarial "try to pivot anyway" framing. No module has the learner *publish a service and then
  genuinely try to reach it unauthenticated / scan for an open port* as the graded centerpiece.
- **Decision/ADR (#11) is well-covered** — 04 is exemplary and 01 carries a latent roadmap-decision.
  This is a track strength, not a gap; reuse 04's ADR shape elsewhere in the curriculum.
- **Eval Harness (#13) latent in 09.** A detection rule shipped without a labelled test corpus +
  regression gate is a vibe; 09 fires one rule against one event set. Light addition, not a new module.
- **Drift/Steady-State (#16) gap in 09.** "Trust nothing" is inherently an over-time posture
  (tokens lengthen, policies accrete exceptions, posture checks decay), yet no module detects or
  reconciles ZT drift.

## Suggested additions

1. **VPN → ZTNA Migration (type 12) — highest priority, the missing capstone-adjacent module.**
   Brownfield cutover for Meridian: stand VPN and an identity-aware proxy side-by-side, migrate apps
   one cohort at a time behind a feature-flag/DNS cutover, prove each move with a before/after access
   test, and decommission the VPN path. Deliverable: a migration runbook + per-app cutover checklist
   + proof (logs) that no app had an outage. Slots between 06 and 07, or as a Phase-3 project.

2. **Red-team-your-Zero-Trust-deployment (type 10) — fold into the capstone or add as a short module.**
   Learner publishes the gated service, then *attacks their own design*: external port scan to prove
   nothing listens, attempt unauthenticated reach, attempt header-forgery of the proxy's identity
   headers (the `X-Pomerium-Jwt-Assertion` gotcha from 06), attempt to bypass the proxy to the
   backend directly. Deliverable: the attacks that failed + the one finding that didn't, hardened.
   Could also be a graded dimension already implied by the capstone's "verified with an external port
   scan" Exemplary bar — promote it to an explicit step.

3. **ZT Drift & Steady-State (type 16) — optional, extends module 09.** Detect policy/token/posture
   drift over time (token-lifetime creep, accreted allow exceptions, posture checks silently
   disabled) and reconcile against an intended baseline. Lower priority than 1–2; could instead be a
   sub-section bolted onto 09 plus an Eval-Harness regression gate for the Sigma rule.
