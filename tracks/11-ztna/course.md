# Zero Trust Network Access — Course Overview

> **The perimeter is dead; identity is the new control plane.** Replace "inside the network =
> trusted" with per-request, identity-aware access — make identity and device posture the basis for
> every request, publish services with no inbound ports, segment the blast radius, and express the
> whole policy as versioned code.

| | |
|---|---|
| **Level** | Intermediate — builds on Foundations; cloud experience helps |
| **Format** | Self-paced · hands-on labs in every module · one-command Docker |
| **Shape** | 11 modules · 3 phases · 1 portfolio capstone |
| **Prerequisites** | Track 00 — Foundations. Track 05 — Cloud helps. |
| **Cost** | Free, forever. Open-source tools and free managed tiers only. |

## What this course is

Zero Trust beyond the marketing. You don't recite the five tenets — you *build* them: stand up an
identity control plane, tie access to device health, publish a real service that has **no open
ports**, segment workloads so a breach can't spread, and prove from the access logs that every
single request was authenticated and authorised. The kind of access architecture a modern security
team actually ships.

## What you'll be able to do

- Explain Zero Trust and SASE beyond the marketing — and where each actually applies.
- Make identity and device posture the basis for access, with OSS tools and cloud-delivered services.
- Stand up identity-aware access with **no inbound ports** — self-hosted *and* free managed.
- Segment workloads to limit blast radius, and express authorization as versioned code.
- Monitor a "trust nothing" environment and prove every request was authenticated and authorised.

## How it's taught

Every module runs the same honest loop: **understand the control → build it with real OSS or a free
managed tier → tie it back to the Zero Trust tenet it satisfies → turn the manual setup into
reviewable policy-as-code.** Identity-aware proxies touch real access — you build with your own
accounts and lab hosts, and test only against resources you own.

There's no grading and no certificate. **Your repo is the credential** — the working setup, the
policy-as-code, and the audit trail are the only proof, to you and to anyone who reads them.

## Syllabus at a glance

| Phase | Modules | You'll finish with |
|---|---|---|
| **1 · Principles & identity** | Zero Trust Principles · Identity as the Control Plane · Device Trust & Posture | An identity control plane (Keycloak, OIDC/SAML) with access tied to passkeys/FIDO2 and a Tailscale/Headscale mesh |
| **2 · Architectures & access** | ZTNA Architectures · SASE & Cloud-Delivered Zero Trust · Identity-Aware Access | A lab service published with **no inbound ports** — self-hosted (Pomerium/Tailscale) *and* cloud-delivered (Cloudflare) — and the trade-off you'd pick |
| **3 · Segment, govern & monitor** | Microsegmentation · Policy as Code · Monitoring & Detection · VPN → ZTNA Migration · Red-team Your Deployment | The capstone — Cilium segmentation, OPA policy-as-code, and an audit trail proving every request was authed; a brownfield migration runbook; your own design red-teamed |

Each control ties back to a named Zero Trust tenet, grounded in real frameworks — NIST SP 800-207,
the CISA Maturity Model, the BeyondCorp papers — never the vendor pitch.

→ **[Full module list & the why behind each →](README.md)**

## Hands-on

Every module ends in a validated, one-command lab (`git clone` + `make up`) built on real tools —
Keycloak, Tailscale/Headscale, Pomerium, Cilium, OPA, Cloudflare's free tier — not slideware. You
don't read about Zero Trust; you stand it up.

## What you'll walk away with

A **`ztna/` portfolio piece**: a lab service reachable with **no inbound ports** behind an
identity-aware proxy, gated by an OPA policy you wrote and version-controlled (with allow *and* deny
cases asserted), and an audit trail that shows a denied-and-allowed pair end to end — the working
setup, the policy-as-code, and the proof.

## Who it's for

Engineers and defenders moving past the dead perimeter — anyone who needs to make identity the
control plane in practice, not in a diagram. If you've configured a VPN and a firewall but never
made *identity* the gate, start here.

---

**Ready?** [See the full syllabus →](README.md) · or jump to [Module 01 — Zero Trust Principles →](modules/01-zero-trust-principles/README.md)
