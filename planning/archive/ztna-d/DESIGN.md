# ZTNA Track (11) — "Verdict" conversion spine

*Wave 3, track 2. Converts `tracks/11-ztna` to the type-driven model. Drafted in `planning/ztna-d/`
(prose-complete; live track untouched), then promoted. Honor-system: NO grading/receipts/grade.yaml.*

## Thesis

ZTNA is an **architecture & policy** discipline: its spine is **Design-&-defend + Decision/ADR +
Migration**, not the breach-anchored judgment family. The track is already healthy (8 of 9 clean fits) —
the conversion is mostly **naming the type, sharpening the anchor onto a named breach, and scrubbing the
track-wide "Meridian" persona to neutral framing**, plus three real additions the type pass found:
- **NEW: VPN→ZTNA Migration (#12)** — the confirmed missing centerpiece (the single most real-world ZTNA task).
- **NEW: Red-team-your-ZT-deployment (#10)** — the curriculum's exemplar of Design→red-team-your-own-design.
- **09: add Eval Harness (#13) + Drift (#16)** — a held-out corpus + regression gate for the Sigma rule, and ZT drift detection.

**ztna 04 is the curriculum's ADR template** (keep it as-is, reference it elsewhere). The track's verbs
are **build** and **design** — so build-first throughout; reserve predict-then-reveal for 01 (the autopsy).

## House rules (bind every module)
- Two files (`README.md` + `lab.md`); lab.md is the symlinked source-of-truth in `plaintext-labs/ztna/`.
- **Preserve the real tool content** (Keycloak/OIDC/SAML, Headscale/WireGuard/FIDO2, Cloudflare Tunnel,
  Pomerium, Cilium/Hubble, OPA/Rego, Sigma) — change the frame/type, not the rigor.
- **Build-first** (Families II/III). Reserve predict-then-reveal for 01.
- Real anchors, primary sources, no invented URLs (`<!-- VALIDATE -->` if unsure).
- **Scrub "Meridian"** (the track uses it throughout) → neutral framing.
- Honor-system; deliverable = the committed artifact (the ADR, the running gated service, the migration
  runbook, the failed attacks, the scored detection) — no grader.

---

## Per-module spine (the authoring brief)

> Source = `tracks/11-ztna/modules/<same-name>` + lab env `plaintext-labs/ztna/<same-name>`.
> Draft output = `planning/ztna-d/modules/<name>/{README.md,lab.md}`.

**01 · Zero Trust Principles** — **Type 1 Concept Autopsy** (+ latent ADR).
- **Anchor:** **Colonial Pipeline 2021** — a single legacy **VPN account with no MFA** (a leaked password)
  was the entry; once inside, a flat network let it spread (cite the public reporting / CISA). Secondary:
  **Target 2013** (vendor → flat interior) and **OPM 2015** as flat-interior lateral-movement examples.
  Predict-then-reveal: *"the VPN required a password — wasn't the perimeter holding?"* → reveal: a perimeter
  + a flat trusted interior means **one credential = the whole network**; "inside = trusted" is the bug.
- **Deliverable:** a Zero-Trust pillar gap-analysis + roadmap mapping the breach's failures to the tenets.

**02 · Identity as the Control Plane** — **Type 7 Build-&-Operate**.
- Stand up Keycloak, mint a JWT via OIDC, reason about federation. **Anchor the stakes** on token-forgery
  (Storm-0558 2023 — a stolen signing key forged tokens): identity is the control plane and its signing
  keys are the crown jewels. Judgment: claim/token-lifetime gotcha. Deliverable = the working IdP + a minted/validated token.

**03 · Device Trust & Posture** — **Type 7 Build-&-Operate**.
- Headscale + WireGuard device enrollment; posture→policy mapping; FIDO2/passkeys. **Anchor:** unmanaged/
  compromised-device access (the home-machine pivot, e.g. the LastPass-2022 engineer's box). Deliverable =
  device-bound access proven; posture half honestly noted as conceptual where it can't self-host.

**04 · ZTNA Architectures** — **Type 11 Decision/ADR** *(the exemplar — keep, light touch)*.
- Already exemplary (scoring table, Nygard format, honest Consequences, attack-path paragraph). Just scrub
  Meridian + confirm the type label. **This is the ADR template the rest of the curriculum copies.**

**05 · SASE & Cloud-Delivered ZT** — **Type 7 Build-&-Operate** (+ Design→red-team seasoning).
- Cloudflare Tunnel + Access policy, **no inbound ports**; keep the "verify denial" unauth step + the
  attacker-cost paragraph. **Anchor:** the decision of self-host vs cloud-delivered (defend it). Deliverable
  = the published, gated, no-inbound-ports service + the proof an unauth request is denied.

**06 · Identity-Aware Access** — **Type 7 Build-&-Operate** (secondary: Gate).
- Pomerium OIDC proxy; trace unauth vs auth end-to-end. **Judgment centerpiece:** the deny-path + the
  **`X-Pomerium-Jwt-Assertion` header-forgery gotcha** (the backend must trust only the proxy). Deliverable
  = the operating identity-aware proxy + the verified deny path.

**07 · Microsegmentation** — **Type 7 Build-&-Operate + Type 8 Judgment-as-Code**.
- Cilium/eBPF default-deny in kind; prove backend→db allowed, frontend→db denied via Hubble. **Anchor:** a
  breach that spread *because* the interior was flat (Target/NotPetya lateral movement). Deliverable = the
  default-deny policy-as-code + the allow+deny proof. (Add a light "try to pivot anyway" red-team beat.)

**08 · Policy as Code** — **Type 8 Judgment-as-Code / Gate**.
- OPA/Rego allow+deny + K8s admission reject-root. **Centerpiece gotcha:** the silently-absent deny rule
  (a policy that fails open). Deliverable = the policy gate proven fail-bad/pass-good.

**09 · Monitoring & Detection** — **Type 6 Reconstruct/Detect + Type 13 Eval Harness + Type 16 Drift**.
- Keep the Sigma rule over ZT access logs (unexpected-country). **Add #13:** a **held-out** access-log
  corpus + scorecard + regression gate (mirror ai-ops 11 / defensive 09). **Add #16:** detect ZT **drift**
  (token-lifetime creep, accreted allow-exceptions, posture checks silently disabled) and reconcile against
  the intended baseline. Deliverable = the scored detection + the drift detector.

**NEW · VPN → ZTNA Migration** — **Type 12 Migration/Brownfield** *(highest priority; the missing centerpiece)*.
- **Anchor:** the universal reality — a legacy VPN on a flat network (the Colonial setup from 01) must be
  replaced *without an outage*. **Lab (strangler-fig):** stand VPN and an identity-aware proxy **side-by-side**,
  migrate apps **one cohort at a time** behind a DNS/feature-flag cutover, prove each move with a before/after
  access test, then **decommission the VPN path**. Deliverable = the migration runbook + per-app cutover
  checklist + proof (logs) that no app had an outage + a rollback per cohort. *(Placement: between 06 and 07,
  or as a Phase-3 project — decide at promotion.)*

**NEW · Red-team Your Zero-Trust Deployment** — **Type 10 Design→red-team-your-own-design** *(the construct's exemplar)*.
- **Anchor:** the gap between "I deployed Zero Trust" and "I proved it holds." **Lab:** publish the gated
  service (from 05/06), then **attack your own design** — external port scan to prove nothing listens,
  attempt unauthenticated reach, **forge the proxy's identity headers** (the `X-Pomerium-Jwt-Assertion`
  gotcha), attempt to bypass the proxy straight to the backend. Deliverable = the attacks that *failed*
  (the design held) + the one that didn't, hardened. *(Placement: Phase-3, capstone-adjacent.)*

## Phases (reframed)
- **Phase 1 · Principles & identity (01–03)** — autopsy the flat-perimeter breach; stand up the identity
  control plane + device trust.
- **Phase 2 · Architect & access (04–06 + Migration)** — decide the architecture (ADR), publish gated
  no-inbound access, and migrate the brownfield VPN to ZTNA without an outage.
- **Phase 3 · Segment, govern, prove (07–09 + Red-team)** — microsegment, policy-as-code, monitor with a
  scored detection + drift, and red-team your own deployment.

## Promotion notes
- Placement/renumber for the two new modules (Migration after 06; Red-team in Phase 3).
- Lab-env builds: the Migration side-by-side env + the Red-team attack harness + 09's held-out corpus/drift
  detector. Scrub Meridian from the live ztna lab envs. Resolve VALIDATE; strip AUTHOR'S NOTE; `mkdocs --strict`; STATUS.
