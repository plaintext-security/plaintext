# Foundations track — build-vs-find balance audit & rebalance plan

*Same approach as [`cloud-track-rebalance.md`](cloud-track-rebalance.md) and
[`ztna-track-rebalance.md`](ztna-track-rebalance.md): audit done 2026-06-12 against the actual
**labs** (read from `plaintext-labs/foundations/<module>/lab.md`, with the Makefile/data/compose
checked for promotability), not just the concept objectives. The cloud audit's question — "do we
only teach *find/audit*, or also *build & operate the secure control*?" — applied module by module
to Track 00.*

## TL;DR

**The frame mostly does not apply to Foundations, by design — and that's correct.** This is the
entry track: its job is to make a beginner *fluent with the tool and literate in the artifact*
(read a capture, decode a blob, profile a host, exercise a crypto primitive), not to author and
operate production security controls. Eleven of twelve labs are "learn the tool / orient yourself"
or "build a reusable analysis script," which is exactly what a foundations track *should* be, and
the curriculum's own per-track hand-holding rule says Foundations gets "objective + a hint," not a
build-the-control mandate. There is **no audit-only-should-build gap of the cloud-02/ztna-03 kind**
here, because almost nothing in Foundations is *attacking infrastructure it should then secure*.
Two labs already carry a genuine build-and-prove half (**11** wires a pre-commit secret block and
proves it fires; **10** builds an operating parser tool); **09** is the one place a tiny
*operate-the-control* deepening is defensible (verify a real artifact, not just exercise primitives)
and it's already the lab's own stretch. **Recommendation: leave the track essentially as-is.** One
optional S-sized deepen (09), and **no new module** — the closest hole (key/secret *handling*) is
deliberately owed to later tracks (Track 05 secrets, Track 08 PKI), and pulling it forward would
violate "tracks are standalone; cross-references enrich, they don't gate" and over-burden the entry
track. This is the "already balanced / frame doesn't fit" outcome the audit explicitly allows.

## What "build & operate securely" means here

Same bar as the prior audits — hands-on *authoring/standing up a control and proving it works*, not
just finding or reading. **But the Foundations translation is deliberately weaker:** at this level
"build & own it" legitimately means *building a reusable analysis tool you operate* (the parser, the
triage script, the verify-an-artifact tool) and *the one true control a beginner can stand up and
prove* — the pre-commit secret gate. We are **not** looking for least-privilege policy authoring or
segmentation here; those are what the *specialization* tracks this floor feeds into are for. So the
honest test per lab is narrower: does the lab end in something the learner *built and runs/proves*,
or only in notes? Most end in notes **by design** (literacy is the deliverable), and a few end in a
committed, operable tool.

## Per-module verdict (from the lab Do-steps)

| # | Module | Lab orientation | Has a build/operate-and-verify half? | Verdict |
|---|--------|-----------------|---------------------------------------|---------|
| 01 | Security First Principles | pick a real breach (CISA KEV), map to CIA, name failed principle, propose controls → `breach-analysis.md` | no — pure analysis/reasoning | **By design** — foundational analysis lab (the written breach analysis *is* the artifact, like cloud 01 / ztna 01) |
| 02 | Building a Safe Lab | stand up an isolated VM, snapshot/revert, confirm a container runs, write rebuild steps | partial — *stands up & proves the lab env* (isolation + revert), plus a rebuild-from-zero script in Automate | **Balanced (orientation build)** — the build is *the lab itself*; correctly scoped, leave it |
| 03 | Docker & Containers | run/build/inspect containers, write a minimal Dockerfile, check the run-as-user default | partial — builds & runs an image; non-root/read-only is the *stretch* | **By design** — container-fluency orientation; non-root hardening is rightly a stretch at this level |
| 04 | Linux for Security | enumerate users/SUID/procs, parse a **real** loghub auth log for failed-login IPs → script it | partial — *find/triage*, but Automate builds a reusable `linux-triage.sh` | **By design** — host-literacy lab; the tool-build is the Automate step, correctly placed |
| 05 | Windows for Security | enumerate local admins/services/Run-keys, find a real attacker logon in a real EVTX → collector script | partial — *find/triage*; Automate builds a PowerShell collector | **By design** — Windows-literacy lab; mirror of 04 |
| 06 | Networking Fundamentals | capture a live exchange, isolate DNS + the TCP handshake, follow the stream → script the parse | partial — *read the wire*; Automate scripts the capture-parse | **By design** — the track's signature literacy lab; capture-reading is the point |
| 07 | Web & HTTP Fundamentals | drive curl (GET/POST/redirect/cookie/role-header), read every part → header-extract script | partial — *read HTTP*; Automate builds a header-extractor | **By design** — HTTP-literacy lab; notes the `role=admin` trust flaw but rightly doesn't fix it here |
| 08 | Data & Encoding | decode a **real** base64 PowerShell stager + hex + query live KEV JSON with jq → script the feed query | partial — *decode/analyse*; Automate builds a KEV-feed query tool | **By design** — encoding-literacy lab; analysis is the deliverable |
| 09 | Cryptography Basics | exercise SHA-256/AES/RSA once each, read a real cert, flip a ciphertext byte → tiny verify tool | partial — *exercise primitives*; Automate builds a "verify-an-artifact" tool (hash a file, check cert expiry) | **Deepen (optional, S)** — make the *operate-the-control* half (verify a real artifact's integrity / cert) co-equal, not just a one-off primitive tour |
| 10 | Scripting & Automation | build `topips.py` that parses a real auth log, ranks IPs, handles malformed lines + `--json/--threshold` | **yes** — the lab *is* building and operating a tool, with edge-case handling and flags | **Balanced (build)** — the deliverable is a working, committed tool |
| 11 | Version Control & Working in the Open | init repo, author a `.gitignore`, prove an ignored secret stays out, PR loop, **wire a pre-commit/gitleaks hook and prove it blocks a test secret** | **yes** — stands up a real preventive control (secret gate) and **proves the block** | **Balanced (proactive)** — the one genuine "build the control + prove the deny" lab in the track |
| 12 | Threat Modeling | draw the data-flow + trust boundaries, run STRIDE per element, mitigation + CIA per threat → `threat-model.md` | no — pure design/analysis | **By design** — design/analysis lab; the STRIDE model is the artifact (like ztna 04's ADR) |

**Tally:** 2 balanced (10 build, 11 proactive) · 1 balanced-orientation (02) · **8 "by design" pure /
analysis / literacy (01, 03–08, 12)** · **1 optional deepen (09)** · **0 audit-only-should-build
gaps** · **0 confident structural holes.** This is the inverse shape of the cloud and ztna findings:
there it was "mostly balanced, a couple of audit-only gaps + a pillar hole"; here it's "mostly
by-design literacy, no real gap." That is the expected, healthy result for an entry track.

## Structural-hole analysis: none (defensibly)

The one subject a reader might call missing is **safe secret/key *handling*** — Foundations teaches
you to *keep secrets out of git* (11) and to *exercise* crypto primitives (09), but never to *store
and serve a secret to an app* or *manage a key's lifecycle*. **This is deliberately owed downstream,
not a hole:**

- Secret **storage/serving** is Track 05's *Secrets Management* module (Vault/Secrets Manager,
  dynamic creds, rotation) — already audited and being *deepened* in the cloud rebalance. Pulling a
  Vault/KMS build into Foundations would duplicate it and break "tracks are standalone; a
  specialization depends only on Foundations, never the reverse."
- Key **lifecycle/KMS** is the cloud track's new *Data Protection & KMS* module — explicitly the
  cloud audit's structural fill. It is not a *foundational literacy* topic; it's an operate-a-control
  topic that needs cloud primitives a beginner hasn't met yet.

So the right call for Foundations is to **stay literacy-only on secrets/crypto and hand the
build-and-operate to the tracks built for it.** Adding a 13th "secrets handling" module here would
over-scope the entry track and overcorrect exactly the way the non-goals warn against. **Recommended
answer: no new module.**

(Other candidates considered and rejected: a dedicated "logging/observability" module — already
covered as artifact-reading across 04/05/06/08 and owned properly by Track 02; a "shell scripting"
module — folded into 04 and 10. Neither is a real hole.)

## Rebalance plan (sequenced, smallest-disruption first)

1. **09 — deepen the operate half** *(S, optional, promotable).* Keep the primitive tour (hash/AES/
   RSA/cert/bit-flip is the right literacy). Make the lab's *own* Automate/stretch the spine of a
   second half: have the learner **operate the verify-an-artifact tool against a real artifact** —
   verify a downloaded file's published SHA-256 *and* check a live host's certificate expiry/chain,
   and **prove it catches a tampered file / an expired cert**. This turns "I exercised AES once" into
   "I built a small integrity/cert verifier and proved it flags bad input" — the foundational shadow
   of a real control. **Promotable, not new env:** rests on the already-validated openssl container
   (`make up`/`demo` exist); it's a Do-step + success-criterion edit plus extending the existing
   `demo.py`, no new scaffolding. Docker was unavailable this session, so re-running `make demo` is a
   follow-up, but no new services are introduced.

2. **Everything else — leave as-is.** 01, 03–08, and 12 are correctly "by design"; 02, 10, and 11
   already carry their build/operate half at the right depth for an entry track. No promotions, no
   new env, no new module.

That's the whole plan. If item 1 is judged not worth the churn, **"no changes" is a fully defensible
verdict for this track.**

## Non-goals / cautions

- **Don't overcorrect — this is the strongest "frame doesn't fit" case of the three audits.**
  Foundations is *supposed* to be literacy- and tool-fluency-first. Bolting a "build a control +
  prove the deny" half onto a capture-reading or curl lab would dilute the very thing the track
  exists to teach and contradict the charter's per-track hand-holding scale (Foundations = objective
  + a hint). 01, 03–08, 12 should stay pure.
- **Don't pull secrets/KMS handling forward.** It's owed to Track 05 (secrets) and the cloud track's
  new KMS module; duplicating it here breaks track independence and over-scopes the entry track. The
  "no structural hole" conclusion is the deliberate one.
- **The two real builds (10, 11) are already at the right altitude — leave them.** 11 in particular
  is the track's one genuine *stand-up-a-control-and-prove-it* lab (the pre-commit secret gate) and
  is the correct foundational version of the IaC/secret-scanning gates in Tracks 06/08/10.
- Any change (item 1 only) touches **both repos** (prose in `plaintext`, lab Do-steps + `demo.py` in
  `plaintext-labs`) and must keep `mkdocs build --strict` green and re-validate `make up`/`make demo`
  on the existing crypto container.
