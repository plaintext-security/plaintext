# Module 04 — ZTNA Architectures

*Type 11 · Decision / ADR — choose a ZTNA architecture under real constraints (self-hosted vs cloud-delivered, threat model vs ops burden) and defend the pick; the deliverable is an Architecture Decision Record with options scored, a one-sentence decision, and the honest consequences. [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Zero Trust Network Access** — *four patterns, one principle: match the architecture to the threat model, not to the vendor's marketing.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~4–6 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    "Zero Trust" is a government mandate, a sales term, and a real architectural shift all at once — and
    the practitioner skill is choosing the right *delivery pattern* for a specific org, not memorizing
    which product "is" ZT. Four patterns (VPN, reverse proxy, network mesh, cloud edge, plus hybrid)
    map onto three tradeoff axes: self-hosted vs cloud-delivered, OSS/self-run vs managed, and threat
    model vs blast radius. You'll score them against a real constraint set and defend the pick as an
    Architecture Decision Record — where the *Consequences* section is the proof, not the pick.

## Why this matters

"Zero Trust" is now a requirement in government mandates (the 2021 Biden Executive Order), a sales
term applied to products that have little to do with ZT principles, and a genuine architectural
shift that organizations are in various stages of implementing. The practitioner skill is being able
to look at a specific organization's access patterns and say: which of the four ZT delivery
patterns fits best, what are the operational trade-offs, and where is the blast-radius boundary if
this pattern is compromised? That skill is a *decision* — and a decision worth anything is one you
can defend after the fact. This module is where you learn to make the call and record it as an
**Architecture Decision Record (ADR)** — the construct the rest of this track (and the curriculum)
reuses whenever a choice has to be justified to someone who will live with the consequences.

## Objective

Read the structured comparison of four ZTNA patterns, score them against a real constraint set, and
produce an **Architecture Decision Record** — options scored, a pick, and *honest* consequences —
that a security architect could defend to a CISO. The deliverable is the ADR; its quality is the
defence, not the pick.

## The core idea

!!! note "The mental model"
    The ZT *principle* is fixed — never trust, always verify, enforce least-privilege at the resource —
    but the **delivery mechanism** is an engineering decision with real tradeoffs. The skill is
    reasoning along the axes of that tradeoff, not memorizing which product "is" Zero Trust. "We bought
    a ZTNA product" is not "we have Zero Trust" — the gap is being able to say *why this pattern was
    chosen* and *what threat model it addresses*, which is exactly what an ADR closes.

This is a **Decision / ADR** module: there is no single right answer to bring you to, only a choice
to make well and write down honestly. The ZT *principle* is fixed — never trust, always verify,
enforce least-privilege access at the resource — but the **delivery mechanism** is an engineering
decision with real tradeoffs, and the skill is reasoning along the axes of that tradeoff, not
memorising which product "is" Zero Trust. Practitioners who confuse "we bought a ZTNA product" with
"we have Zero Trust" have usually deployed one pattern without being able to say *why it was chosen*
or *what threat model it addresses* — which is exactly the gap an ADR closes.

Three axes carry almost every ZTNA decision, and a good ADR reasons explicitly along each:

- **Self-hosted vs. cloud-delivered.** Self-hosting (Pomerium, headscale) keeps the control plane
  and the data path in your hands — no vendor in the middle, no per-seat subscription, no third-party
  SLA tied to yours — at the cost of *you* now running, patching, and scaling that control plane with
  the staff you have. Cloud-delivered (Cloudflare Zero Trust, Zscaler) hands the ops burden and the
  global edge to a vendor, gets you a single policy plane and threat inspection for free, and in
  exchange puts that vendor in your data path and makes their abuse handling and SLA part of your
  posture. This is the central decision the lab asks you to defend.
- **OSS / self-run vs. managed.** A near-relative of the first axis, but about *who carries the
  toil*: a 3-engineer team with no network function will drown maintaining a self-hosted proxy fleet
  across dozens of apps, while a larger team may prefer the control and cost profile of OSS. The
  honest ADR scores operational complexity against the *actual* team, not an idealised one.
- **Threat model and blast radius.** The deciding question is **where the policy engine sits and what
  it can observe at the moment of the access decision** — and therefore *what an attacker gains if
  the pattern is compromised*. A VPN evaluates identity at the network perimeter once, so a single
  stolen credential = the whole flat interior. A reverse proxy evaluates identity (and optionally
  posture) per request, so a stolen token reaches only that user's authorised apps. A mesh evaluates
  device identity at enrolment and ACL-scoped access per connection. A cloud edge evaluates identity,
  posture, and threat signals per session with continuous re-evaluation. Each step up is more granular
  and dynamic — and shrinks the blast radius — but buys that with cost, ops, or dependency on one of
  the other axes.

The four patterns map onto those axes. A **VPN** (the baseline to improve on) enforces at the network
perimeter — broad protocol support, low operational novelty, maximum blast radius on credential
compromise. A **reverse proxy** (Pomerium, BeyondCorp-style) shifts the decision to the application
layer per request; excellent for HTTP/S, self-hostable, but protocol-scoped (it can't replace VPN for
arbitrary TCP/UDP). A **network mesh** (Tailscale, headscale) restores private-IP reachability
cryptographically, supports any protocol, self-hosts via headscale, and limits blast radius to a
device's ACL tags — at the cost of client install and posture integration. A **cloud edge**
(Cloudflare Zero Trust, Zscaler) moves enforcement to a distributed edge with one policy plane and
continuous re-evaluation, at the cost of vendor dependency in your data path. A **hybrid** (cloud edge
for SaaS/web + mesh for infrastructure) is often the honest answer for mixed estates — and a real ADR
should be willing to recommend it.

The point of the ADR format (Nygard's Context / Decision / Consequences) is that it *forces the
honesty*: the Consequences section is where you write down what you are giving up and what new risk
you are taking on. A recommendation with only upsides is the tell of a junior architect — or an
AI draft you didn't review.

!!! warning "The gotcha"
    A recommendation with only upsides is the tell — every pattern trades something away. Self-hosting
    is not "free" (you now run, patch, and scale the control plane); cloud-delivered is not
    dependency-free (the vendor sits in your data path and their SLA becomes your security floor). The
    Consequences section is where that honesty has to land, per option.

??? note "Go deeper: the four patterns against the three axes"
    A **VPN** enforces at the network perimeter — broad protocol support, maximum blast radius on
    credential compromise. A **reverse proxy** (Pomerium, BeyondCorp-style) decides per request at the
    app layer; self-hostable but HTTP/S-scoped. A **network mesh** (Tailscale, headscale) restores
    private-IP reachability cryptographically for any protocol, limiting blast radius to a device's ACL
    tags. A **cloud edge** (Cloudflare, Zscaler) moves enforcement to a distributed edge with continuous
    re-evaluation, at the cost of vendor dependency. A **hybrid** (cloud edge for SaaS + mesh for infra)
    is often the honest answer for a mixed estate — and a real ADR should be willing to recommend it.

!!! tip "AI caveat"
    A model drafts the ADR template and pre-populates the scoring tables well — it knows the vendor
    landscape. Your critical review is the **Consequences** section: a model reliably lists only
    *positive* consequences. Explicitly ask it for the negative and risky ones per option, then verify
    each against the actual product docs. A model that says Cloudflare carries no single-vendor risk, or
    that a self-hosted proxy is "free," is not being honest about the axes.

## Learn (~3 hrs)

**Architecture patterns (~1.5 hrs)**
- [Pomerium — Architecture Overview](https://www.pomerium.com/docs/internals/architecture) — the clearest documentation of the reverse-proxy ZTNA pattern: how the proxy sits in front of upstreams, how authentication and authorization are separated, and how the access policy is evaluated per request. Read it as the self-hosted end of the build-vs-buy axis.
- [Tailscale — What is Tailscale?](https://tailscale.com/docs/concepts/what-is-tailscale) — Tailscale's overview of the WireGuard mesh model, coordination server, and ACL-driven access control. Read alongside the headscale lab from module 03; note where commercial Tailscale adds posture signals that headscale OSS does not.

**The BeyondCorp pattern (~1 hr)**
- [BeyondCorp: Design to Deployment at Google (2016)](https://research.google/pubs/beyondcorp-design-to-deployment-at-google/) — the second BeyondCorp paper, focusing on deployment. Read sections 2–4 to see how the access proxy, device inventory, and trust inference engine were assembled. This is the original reverse-proxy ZTNA in production, and a real "prior-art" precedent you can cite in your ADR.

**ADR format (~30 min)**
- [Architecture Decision Records — Michael Nygard (2011)](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions) — the original ADR-format post. Short. The structure (Context / Decision / Consequences) is exactly what the deliverable uses; pay attention to *Consequences* as the place the honest downsides live.

## Key concepts

- The ADR is the artifact: Context (the forces) → options scored → Decision (the pick) → Consequences (the honest downsides + a real attack-path note)
- The three tradeoff axes: **self-hosted vs. cloud-delivered**, **OSS/self-run vs. managed (the ops burden)**, **threat model & blast radius**
- Four patterns: VPN (network perimeter), reverse proxy (application layer), network mesh (device identity), cloud edge (distributed enforcement) — plus hybrid
- Policy-engine placement: where in the stack is the access decision made, and what can it observe at decision time?
- Blast-radius boundary: what does an attacker gain if this pattern — or its control plane — is compromised?
- Protocol scope: reverse proxy = HTTP/S; mesh = arbitrary TCP/UDP; cloud edge = varies by product
- SASE = cloud edge + SD-WAN + security stack, delivered as a managed service

## AI acceleration

Use a model to draft the ADR template and pre-populate the comparison and scoring tables — it knows
the vendor landscape well. **Your critical review is the Consequences section**: a model will reliably
list only positive consequences. Explicitly ask it to populate the *negative and risky* consequences
for each option, then verify each against the actual product documentation. A model that says
Cloudflare Zero Trust carries no single-vendor dependency risk, or that a self-hosted proxy is "free,"
is not being honest about the axes — and catching that is the skill this module certifies. **AI drafts
→ you review every line → you own the decision.**

!!! question "Check yourself"
    - Name the three tradeoff axes — and why is "self-hosted vs cloud-delivered" not the same axis as "OSS/self-run vs managed"?
    - For the same stolen credential, how does the blast radius differ between a VPN, a reverse proxy, and a cloud edge?
    - Why is a recommendation with only upsides a sign the ADR (or the AI draft) wasn't reviewed honestly?
