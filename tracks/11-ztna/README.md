# Track 11 — Zero Trust Network Access

**The perimeter is dead; identity is the new control plane.** Replace "inside the network =
trusted" with per-request, identity-aware access — built with open source and cloud-native
tools.

## What you'll be able to do
- Explain Zero Trust and SASE beyond the marketing, and where each actually applies.
- Make identity and device posture the basis for access — with OSS tools and cloud-delivered services.
- Stand up identity-aware access with no inbound ports using both self-hosted and free managed options.
- Segment, express policy as code, and monitor a Zero Trust environment.

## Modules

| # | Module | What you'll learn | OSS / free tools |
|---|--------|-------------------|--------------------|
| 01 | Zero Trust Principles | Why the perimeter failed; the core tenets and the SASE landscape | — |
| 02 | Identity as the Control Plane | Authentication, SSO, and authorization; OIDC/SAML federation with enterprise IdPs | `keycloak` |
| 03 | Device Trust & Posture | Tying access to device health; hardware-bound auth and network-level device trust | `tailscale`, `headscale`, FIDO2/passkeys |
| 04 | ZTNA Architectures | OSS vs. cloud-delivered patterns and trade-offs | — |
| 05 | SASE & Cloud-Delivered Zero Trust | Managed ZT at the edge; when SASE beats self-hosted | Cloudflare Zero Trust (free tier) |
| 06 | Identity-Aware Access | Per-request access with no open ports; self-hosted vs. managed | `pomerium`, `tailscale` |
| 07 | Microsegmentation | Limiting blast radius between workloads | `cilium` |
| 08 | Policy as Code | Continuous, versioned authorization | `OPA` |
| 09 | Monitoring & Detection in Zero Trust | What "trust nothing" means for logging and detection | `sigma` |

## Prerequisites
Complete Track 00 — Foundations; Track 05 — Cloud helps.

> Build with your own accounts and lab hosts. Identity-aware proxies touch real access —
> test against resources you own.

## Capstone
Publish a lab service with **no inbound ports** behind an identity-aware proxy (Pomerium or
Cloudflare Tunnel + Access), enforce an access policy as code with OPA, and show the access
logs that prove every request was authenticated and authorised. **Deliverable:** the working
setup, the policy-as-code, and the audit trail.

## AI & automation
ZTNA is policy-as-code, and AI will happily write the policy — including one that's quietly
too permissive. The skill is reviewing generated authorization rules against least
privilege before they go live. AI drafts the policy; you prove it denies what it should.

## Standards & further reading
- NIST SP 800-207 (Zero Trust Architecture)
- CISA Zero Trust Maturity Model
- The BeyondCorp papers (Google)
- Gartner SASE framework overview
- Cloudflare Zero Trust documentation (free tier)
- Open Policy Agent and Pomerium documentation
