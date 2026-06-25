# Type pass — Track 00 Foundations

Canonical = the shipped track (`tracks/00-foundations`). The "Verdict" rewrite at
`planning/foundations-d/` is not tagged here.

Foundations is deliberately skill-first: most modules are "build the literacy, prove it in a
hands-on lab," so the dominant shapes are the *Misconception Reveal* (kill a wrong intuition)
and a *skill-first* lab whose closest library type is **Tool-Build (#9)** once the lab ends in a
committed script/artifact. The "Verdict"/breach-anchored family is intentionally light here.

| Module | Primary type | Secondary | Fit | Note |
|---|---|---|---|---|
| 01 Security First Principles | 1 Concept Autopsy | 2 Misconception Reveal | ✓ | Lens-not-vocabulary framing; would sharpen with one real anchor (authz-failure breach, e.g. broken-access-control case) to make CIA/AAA concrete. Library already cites it as found-01. |
| 02 Building a Safe Lab | 11 Decision/ADR | 2 Misconception Reveal | ⚠ | Content *is* a VM-vs-container, network-mode, snapshot-strategy decision but is shaped as a light concept page + build checklist. Library's explicit retrofit: make the deliverable an ADR (options · tradeoffs · pick · why) and introduce the ADR construct early. The "is my lab actually isolated or bridged?" gotcha is the misconception thread. |
| 03 Docker & Containers | 2 Misconception Reveal | 7 Build-&-Operate | ✓ | Anchor: "a container is not a security boundary by default" — classic predict-then-reveal; lab runs/builds/inspects a container. Good as-is. |
| 04 Linux for Security | 2 Misconception Reveal | 9 Tool-Build | ✓ | "Everything is a file" + SUID-as-privesc-seed is the reveal; lab is hands-on host triage. Skill-first, well-shaped. |
| 05 Windows for Security | 2 Misconception Reveal | 9 Tool-Build | ✓ | "Windows centralises where Linux scatters"; registry/event-logs literacy. Anchor a lab artifact in real Event IDs (it already gestures at forensic goldmine). |
| 06 Networking Fundamentals | 6 Reconstruct | 2 Misconception Reveal | ✓ | Capture-and-dissect a real exchange (handshake/DNS) = a small reconstruction. Library tags found 05/06 as Reconstruct. Good fit. |
| 07 Web & HTTP Fundamentals | 2 Misconception Reveal | 9 Tool-Build | ✓ | "Stateless → sessions are faked" + "browser is a convenience, not the protocol"; craft raw requests with curl. Strong reveal. |
| 08 Data & Encoding | 2 Misconception Reveal | 9 Tool-Build | ✓ | The textbook reveal: "encoding ≠ encryption." Layered-blob decode is the lab. Flagship Misconception-Reveal of the track. |
| 09 Cryptography Basics | 2 Misconception Reveal | 9 Tool-Build | ✓ | "'encrypted' ≠ 'authenticated'" + AI-suggests-ECB gotcha. openssl hands-on. Well-shaped. |
| 10 Scripting & Automation | 9 Tool-Build | 14 Adversarial Review | ⚠ | Lab already ships a reusable `topips.py` + README + flags — it *is* a Tool-Build, but the module is framed as generic "build-first scripting." Library's explicit reframe: name it Tool-Build (reusable, reviewable tool — the construct the automation track compounds on). The "AI authors → you review every line" thread is a latent Adversarial-Review seed. |
| 11 Version Control & Open | 2 Misconception Reveal | 7 Build-&-Operate | ✓ | "git history is forever → rotate, don't delete" is the reveal; fork→branch→PR is the operate. Secret-leak-in-history is a real, citeable disaster class. Good fit. |
| 12 Threat Modeling | 10 Design → red-team-your-design | 1 Concept Autopsy | ✓ | Four-questions + STRIDE against trust boundaries; deliverable is a STRIDE model = the design half of type 10. Library tags it found-12 as Concept Autopsy; the design framing is closer to the actual deliverable. Could close the loop by red-teaming the produced model. |

## Coverage gaps

- **Decision/ADR (#11)** — present only latently in 02 (and not as the deliverable). The ADR
  construct should be *introduced* in Foundations so every later track (ztna 04/05, automation
  01, ai 01) can lean on it. This is the track's clearest under-use. Fix = retrofit 02.
- **Tool-Build (#9)** — module 10's lab is already a Tool-Build but isn't *named* one; naming it
  establishes the reusable-tool construct early. Fix = reframe 10.
- **Adversarial Review (#14)** — the "AI authors → you review → you own it" posture runs through
  every module's AI-acceleration note but is never the *spine* of a lab. A single explicit
  review-the-AI-output rep would seed the construct without violating skill-first. (Latent in 10.)
- **Correctly absent** (per the library, do NOT add to Foundations): Eval Harness (#13),
  Migration (#12), Red-team-the-AI (#15), Drift (#16) — later-track constructs; forcing them on
  beginners breaks the skill-first discipline. Family I breach-anchoring is intentionally light.

## Suggested additions

1. **Retrofit, not a new module — name 02 a Decision/ADR (#11).** Change the deliverable from a
   build checklist to an Architecture Decision Record (VM vs container · network mode · snapshot
   strategy — choose and defend it). Introduces the ADR construct early; truer to the real skill.
2. **Retrofit, not a new module — name 10 a Tool-Build (#9).** The lab already ships
   `topips.py` + README + flags; reframe the module prose around "a reusable, reviewable tool,"
   the construct the whole automation track compounds on.
3. **Optional new micro-module / lab beat — "Trusting AI output" (Adversarial Review #14, light).**
   One small, beginner-safe rep where the learner is handed a *subtly wrong* AI-generated
   artifact (a parser regex that drops a line, an `openssl` invocation using ECB, a `docker run`
   with a stray `-v /:/host`) and must catch it and write the trust note. Makes the curriculum-wide
   "AI authors → you review" thread hands-on once, at the level beginners can handle. Lower
   priority than the two retrofits.
