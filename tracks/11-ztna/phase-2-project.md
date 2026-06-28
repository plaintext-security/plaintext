# Phase 2 Project — No-Inbound-Port Access, Self-Hosted and Managed

*ZTNA · Phase 2 (modules 04–06) · ~5–7 hrs · Prereqs: finish modules 04, 05, 06 first.*

> You chose an architecture, published a service through a managed edge, and gated one self-hosted with an identity-aware proxy — separately. The project is the **integration**: the *same* lab service published two ways — self-hosted (Pomerium) *and* cloud-delivered (Cloudflare Zero Trust), both with **no inbound ports** — and a defended ADR for which you'd choose for which use case.

## Why this is a project, not another module

Each Phase-2 module left a piece of the "reach it without opening a port" story. Alone they're a decision doc and two deployments; integrated they're a build-vs-buy comparison you can actually defend:

- **04 · ZTNA Architectures** → `architecture-adr.md` — the OSS-vs-cloud-delivered ADR against real constraints (the template the track copies whenever a decision must be defended).
- **05 · SASE & Cloud-Delivered Zero Trust** → `cloudflare-zt-deployment.md` — tunnel-connected + Access-policy-active proof, the unauthenticated-denial **and** no-listener proof, the three Access-policy JSON changes, and the build-vs-buy defence.
- **06 · Identity-Aware Access** → `config.yaml` (the stricter Pomerium route), `notes.md` (the header-trust rule, the forged-header finding, the Okta mapping), and `check-deny.sh` + the `make check` target.

## Build it

1. **Same service, two paths.** Publish one lab service through **both** Pomerium (06) *and* Cloudflare Zero Trust (05), each reaching it over an egress-only tunnel with **no inbound ports**. The same target gated two ways — and made directly comparable — is the new work.
2. **Prove no-inbound, both ways.** Capture the external probe showing nothing listens, and the unauthenticated-denial, for *each* path. Run `check-deny.sh` against both so the deny is asserted, not assumed.
3. **Defend the trade-off.** Extend `architecture-adr.md` into a side-by-side: self-hosted vs. managed on operational cost, trust boundary (the forged-header / header-trust lesson from 06), latency/edge, and lock-in — ending in *which you'd choose for which use case*.
4. **One verdict.** Open `ACCESS.md` with a two-sentence *what's published, reachable only how, and which path wins for which case* lede.

## Success criteria

- [ ] The **same** lab service is published behind **both** a self-hosted (Pomerium) and a cloud-delivered (Cloudflare) identity-aware proxy.
- [ ] **No inbound ports** on either path — proven with an external probe and an unauthenticated-denial capture for each.
- [ ] `check-deny.sh` asserts the deny against both paths.
- [ ] The ADR defends a per-use-case choice between self-hosted and managed — not "it depends."

## Deliverable

A `no-port-access/` folder in your repo: the **Pomerium `config.yaml` + `check-deny.sh` + `make check`**, the **Cloudflare deployment proof + Access-policy JSON**, the **comparison ADR**, and `ACCESS.md`. Build with **your own accounts and lab hosts** — identity-aware proxies touch real access; test only against resources you own. **Do not** commit your Cloudflare tunnel token, account credentials, or the TLS material Pomerium generates at runtime (see `.gitignore`).

## Self-check rubric

Grade your own `no-port-access/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **No inbound ports** | Service on an open port | Reachable only through the proxy/tunnel; no inbound ports | External port scan shows nothing open; egress-only tunnel proven — both paths |
| **Identity-aware access** | Single shared credential | Per-request access tied to authenticated identity, both paths | Device posture / header-trust forgery defended (the 06 finding) |
| **Two-path parity** | One path only, or not comparable | Same service published self-hosted *and* managed, deny proven on each | `check-deny.sh` asserts allow + deny on both; directly comparable |
| **Decision quality** | "It depends," no recommendation | ADR defends a per-use-case self-hosted-vs-managed choice | Cost, trust boundary, latency, lock-in each weighed honestly |
| **Hygiene** | Tunnel token / TLS material committed | No tokens, credentials, or runtime TLS in history; `.gitignore` present | Commits tell the build story |

→ Next: **[Module 07 — Microsegmentation](modules/07-microsegmentation/README.md)** opens Phase 3, which ends in the **[track capstone](README.md#capstone)**.
