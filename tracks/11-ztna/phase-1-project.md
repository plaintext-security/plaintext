# Phase 1 Project — Identity Control Plane & Device Trust

*ZTNA · Phase 1 (modules 01–03) · ~5–7 hrs · Prereqs: finish modules 01, 02, 03 first.*

> You took a breach apart, stood up an IdP, and bound access to a device — one tenet at a time. The project is the **integration**: one identity control plane where access is granted on *who* (Keycloak/OIDC) *and* *what device* (passkeys + a Tailscale/Headscale mesh), with each control mapped back to the Zero Trust tenet it satisfies.

## Why this is a project, not another module

Each Phase-1 module left a piece of the "identity is the new perimeter" story for one tenet. Alone they're three separate analyses; integrated they're the control plane every later phase builds on:

- **01 · Zero Trust Principles** → `gap-analysis.md` — the pillar gap-analysis + risk-prioritized roadmap (the breach taken apart, mapped to a standards framework).
- **02 · Identity as the Control Plane** → `oidc-analysis.md` — the decoded `analyst`/`admin` claims, the token-lifetime assessment, the stolen-token vs. stolen-signing-key contrast, and the federation paragraph.
- **03 · Device Trust & Posture** → `device-trust-analysis.md` — the device-bound access proof (enrolled-reaches vs. unenrolled-denied, with commands and output), the contractor-tier ACL, and the posture → device-trust-gap mapping.

## Build it

1. **One control plane, two factors.** Wire your Keycloak realm (02) and the Tailscale/Headscale mesh (03) so a single access decision requires *both* an authenticated OIDC identity *and* an enrolled device — the enrolled-reaches / unenrolled-denied proof now also fails an unauthenticated identity. The two controls deciding *together* is the new work.
2. **Prove the deny.** Capture the matrix: authenticated + enrolled → reaches; authenticated + unenrolled device → denied; unauthenticated → denied. Real commands and output, not a description.
3. **Map every control to a tenet.** Extend `gap-analysis.md` into a short table: each control you stood up → the Zero Trust tenet (NIST SP 800-207) it satisfies, and the gap it closes from the breach roadmap.
4. **One posture statement.** Open `CONTROL-PLANE.md` with a two-sentence *who is trusted, on what device, and which tenet that satisfies* lede.

## Success criteria

- [ ] A single access decision requires **both** an authenticated OIDC identity **and** an enrolled device.
- [ ] The deny matrix is proven with real commands/output: enrolled+auth reaches; unenrolled or unauthenticated is denied.
- [ ] Every control maps to a named Zero Trust tenet and the roadmap gap it closes.
- [ ] `CONTROL-PLANE.md` opens with a who/device/tenet verdict, not a config dump.

## Deliverable

An `identity-control-plane/` folder in your repo: the **gap-analysis + tenet map**, the **OIDC analysis**, the **device-trust proof** (the deny matrix), and `CONTROL-PLANE.md`. Build with **your own accounts and lab hosts** — identity-aware controls touch real access; test only against resources you own. **Do not** commit raw tokens, the realm export, WireGuard keys, the headscale DB, or any credential beyond the fictional scenario (see `.gitignore`).

## Self-check rubric

Grade your own `identity-control-plane/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Identity decision** | Single shared credential | Per-request access tied to an authenticated OIDC identity | Token lifetimes and federation assessed against ZT discipline |
| **Device trust** | Access independent of device | Decision requires an enrolled device; deny proven with output | Hardware-bound auth (FIDO2/passkey) or contractor tier factored in |
| **Combined decision** | One factor only | Auth **and** device required together; full deny matrix shown | Posture gaps named and tied to the roadmap |
| **Tenet mapping** | Controls listed, not justified | Each control mapped to a named NIST SP 800-207 tenet | Roadmap is risk-prioritized; gaps tracked to closure |
| **Hygiene** | Tokens/keys/DB committed | No tokens, keys, or realm export in history; `.gitignore` present | Commits tell the build story |

→ Next: **[Module 04 — ZTNA Architectures](modules/04-ztna-architectures/README.md)** opens Phase 2.
