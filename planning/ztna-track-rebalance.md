# ZTNA track — build-vs-find balance audit & rebalance plan

*Same approach as [`cloud-track-rebalance.md`](cloud-track-rebalance.md): audit done 2026-06-11 against
the actual **labs** (where the find-vs-build skew really shows), not just the concept objectives. The
cloud audit's question — "do we only teach *find/audit*, or also *build & operate the secure control*?"
— applied module by module to Track 11.*

## TL;DR

ZTNA is **already the most build-heavy track we have** — the entire back half (05–09) is *stand up the
control, author the policy, prove the deny*. The skew is **narrow and front-loaded**: two early labs
(02 identity, 03 device) stand up a provided environment and then only *inspect and reason about* it —
they never have the learner **author the hardened control themselves and verify it**, even though each
already carries that build step as an optional *stretch*. And there is **one true topical hole — the
application/workload pillar: cryptographic service-to-service identity (mTLS / SPIFFE-SPIRE).**
Recommendation: surgical fixes (promote the build-and-verify half from stretch to core in 02 and 03),
plus a decision on a new workload-identity module. No teardown — the same conclusion the cloud audit
reached.

## What "proactive / build & operate securely" means here

Identical bar to the cloud audit: not just "inspect a config" or "write a finding," but hands-on
*authoring, deploying, and operating* a secure control and **proving it works** — author a hardened IdP
realm and prove a wrong-audience token is rejected; apply a device ACL tier and prove the contractor
node is denied; stand up a proxy and prove no inbound port answers. The ZT proxy/policy modules already
deliver this; the audit is about where it's *missing*.

## Per-module verdict (from the lab Do-steps)

| # | Module | Lab orientation | Has a proactive "build/operate & verify" half? | Verdict |
|---|--------|-----------------|-------------------------------------------------|---------|
| 01 | Zero Trust Principles | read access map, map to NIST pillars, write gap analysis + roadmap; scoring script | no | **By design** — foundational assessment lab (the track's "orient yourself" entry, like cloud 01) |
| 02 | Identity as the Control Plane | deploy Keycloak, walk OIDC flow, **inspect** realm/token settings, reason about abuse, federation in *prose* | **no** — stands up the *provided* realm and only inspects it; never authors the ZT-hardened realm and proves it | **Add build half** |
| 03 | Device Trust & Posture | deploy headscale, verify registered vs. unregistered, read posture policy, *write* a contractor ACL stanza **in the deliverable only** | **no** — the second tier is written but never *applied to the live mesh and proven* (that's only the stretch) | **Add build half** |
| 04 | ZTNA Architectures | design exercise: score 4 patterns, write an ADR | no | **By design** — pure design/decision lab (the ADR is the artifact, like cloud 14 is pure by design) |
| 05 | SASE & Cloud-Delivered ZT | deploy `cloudflared` tunnel, **author an Access policy**, prove no inbound port, verify deny | yes — build & operate the gated access | **Balanced (proactive)** |
| 06 | Identity-Aware Access | stand up Pomerium, **author a second route + stricter policy**, apply, verify deny; regression test | yes — author + apply + verify | **Balanced (proactive)** |
| 07 | Microsegmentation | apply Cilium policy, verify allow/deny, **tighten** (namespace-scope) and re-verify; `make verify` | yes — strong build/verify half | **Balanced (proactive)** |
| 08 | Policy as Code | **write Rego** (new role, k8s admission), write `opa test` cases, CI gate | yes — policy-as-code, prevention | **Balanced (proactive)** |
| 09 | Monitoring & Detection | **write Sigma rules** against ZT access logs, regression-test | yes — detection-as-build | **Balanced** |

**Tally:** 5 balanced/proactive (05–09) · 2 "by design" pure (01 assessment, 04 design) · **2 inspect/
reason-only that should gain a build half (02, 03)** · 1 structural hole (workload identity). Mirror
image of the cloud finding, which landed on 2 audit-only modules + 1 hole.

## The two inspect-only labs (the narrow skew)

Both already *contain* the build half — it's just demoted to a stretch or a "write it in your
deliverable" step, so the learner can finish the lab without ever configuring the control and proving
it. Promote the existing stretch to a core, graded step:

- **02 — author the hardened realm and prove it.** Today: `make up` loads a pre-built realm, the
  learner decodes tokens and *reads* the token-lifespan and scope settings. Add: the learner **edits the
  realm** to ZT discipline — short access-token lifespan, a single `aud`, minimal claims — and **proves**
  it by showing a token minted for `meridian-app` is rejected by a second client (`meridian-api`) on
  audience mismatch (the current *stretch*), validated by the lab's `validate-token.py`. Finding the
  permissive default and closing it become equal halves — exactly cloud 02's "trace the escalation,
  then author the minimum-cut policy and re-verify."
- **03 — apply the tier ACL to the live mesh and prove the deny.** Today: step 5 has the learner *write*
  a contractor-tier ACL stanza "in your deliverable"; the actual apply-and-verify is only the stretch.
  Add: **apply** the second-tier ACL to the running headscale, register a `contractor`-tagged node, and
  **prove** with `curl` that it reaches `tag:contractor-allowed` but is denied `tag:corp-only`. Mirrors
  cloud 04's "author the least-privilege Security Groups and prove reachability."

Each change touches the module `README.md` (objective + key concepts, in `plaintext`) and the lab
`lab.md` Do-steps + success criteria (in `plaintext-labs`), and must keep `make up`/`make demo`
validated — the same dual-repo discipline the cloud rebalance followed.

## The one structural hole: workload / service identity (mTLS · SPIFFE/SPIRE)

NIST SP 800-207's five pillars are **identity, device, network, application/workload, data.** Track 11
covers human **identity** (02 Keycloak, 06 Pomerium), **device** (03 headscale/WireGuard), and
**network** (07 Cilium) thoroughly — but the **application/workload** pillar's core question, *how do
two services prove identity to each other with no network trust*, is absent. Module 07 segments
east-west traffic by **label** (a network allow/deny), which is necessary but not the same as
**cryptographic workload identity**: a short-lived, attested SVID per workload, mutual TLS on every
service-to-service call, and an un-attested workload that simply cannot obtain an identity. That is the
zero-trust answer to lateral movement *between services*, and it's the natural OSS-first, CNCF-grounded,
**almost-entirely-build-and-operate** module — the exact shape (a missing NIST pillar, mostly build)
that made KMS the right fill for the cloud track.

Candidate: **Module 10 — Workload Identity & mTLS (SPIFFE/SPIRE).** Stand up a SPIRE server + agent,
register two workloads, have each fetch its SVID and establish mTLS, then prove that a workload with no
registration entry is refused an identity (and a stripped/mismatched SVID is rejected by the peer). Mostly
build/operate; slots after 07 (segment the network → then identify the workloads) and feeds 08 (policy
over verified identities) and 09 (mTLS/SVID issuance events as detection signal).

*Alternative hole worth noting (not recommended as the primary):* **continuous verification / token
revocation** (CAEP / Shared Signals). The track's concept (02) raises token-lifetime creep but the labs
never build session revocation or continuous re-evaluation — ZT's "re-evaluate every request" promise vs.
bearer-token reality. Real and ZT-core, but thinner OSS tooling and harder to lab cheaply than SPIFFE.

## Rebalance plan (sequenced, smallest-disruption first)

1. **02 — add the build half** *(S).* Promote the audience-enforcement stretch to a core step: author the
   ZT-hardened realm (short token, single `aud`, minimal claims) and prove the wrong-audience token is
   rejected via `validate-token.py` / a second client. Realign the concept objective + key concepts.
2. **03 — add the build half** *(S).* Promote the second-tier-ACL stretch to a core step: apply the
   contractor-tier ACL to the live mesh and prove the deny with a tagged node. Realign concept prose.
3. **New module — Workload Identity & mTLS (SPIFFE/SPIRE)** *(M–L, structural decision).* Fills the
   application/workload pillar with a build/operate lab. Needs a validated `plaintext-labs/ztna/10-…`
   env (`make up`/`make demo`) + concept + nav + track map + landing counts — the full KMS-style unit.
   **This is a decision, not a default** (see cloud audit item #4): it is the larger, lab-validation-heavy
   piece and should be confirmed before building, because shipping an unvalidated module would violate the
   charter's labs-built-and-validated definition of done.

   **Status (2026-06-11):** *built, pending lab validation.* Module 10 — Workload Identity & mTLS
   (SPIFFE/SPIRE) is authored: concept `README.md`, lab `lab.md`, a full `plaintext-labs/ztna/10-…`
   env (SPIRE server + agent + two workloads doing mTLS, a `rogue` deny proof, `check_identity.sh`,
   `Makefile` up/demo/mtls/deny/check), nav, and the track map/phases. **Not yet validated:** Docker
   was unavailable in the authoring session, so `make up`/`make demo` has **not** been run. Per the
   charter this makes the lab a stub until proven. Two consequences, deliberately honest:
   - The landing page (`overrides/home.html`) was **left at "TRACK_11 · 9 modules live" / 134 total** —
     it claims "every one with a validated lab," which module 10 isn't yet. Bump to **10 live / 135**
     only after `make up && make demo && make down` is green on a Linux runner.
   - No `.ci-demo` marker was added to the lab (it would gate Labs CI on a demo that hasn't been run).
   **Validation to-do:** run `make up`/`make demo`/`make check`; the likely friction points are the
   join-token bootstrap ordering and the Docker workload attestor (`pid: "host"` + `docker.sock`); fix,
   then bump the two counts and add `.ci-demo`.
4. **Minor, opportunistic:** 09's data-volume rule is punted to a stretch because the offline matcher
   lacks numeric `|gte`; could be made a core step by teaching the `detect.py` extension. Low priority.

## Non-goals / cautions

- **Don't overcorrect.** 01 (assessment) and 04 (ADR) are pure by design — the written analysis *is* the
  job, exactly as cloud 01/14 are pure. Do not bolt a "build" half onto them.
- Any change touches **both repos** (prose in `plaintext`, lab env in `plaintext-labs`) and must keep
  `mkdocs build --strict` green and ship a validated `make up`/`make demo`.
- The back half (05–09) is already a model of build-and-verify — leave it. The fix is narrow and
  front-loaded, plus the one pillar-shaped hole.
