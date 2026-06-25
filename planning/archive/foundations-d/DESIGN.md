# Foundations Track — "Verdict" rewrite (Variant-D vein)

*A complete parallel rewrite of `tracks/00-foundations/` in the form prototyped by cloud Module 01
Variant D. Lives under `planning/` so it builds nothing and leaves the shipped track in place. This
file is the **spine and the authoring brief** — every module is written against its row below.*

## The thesis (and the beginner adaptation)

Same core as the cloud rewrite: **every module is anchored to a real, public breach or primary-source
artifact, and the learner ends by explaining what happened and turning the manual work into a small
reviewable script.** But this is the *beginner* track ("no prior security experience assumed"), so the
balance shifts:

- **Skill-first is the default.** The point of Foundations is literacy — using the shell, reading a
  packet, using git. The breach is the *motivation and the stakes*, and the source of **one** instructive
  prediction. It must never bury the skill-building under narrative. Keep breach tellings short.
- **Predict-then-reveal is reserved** for the modules where a beginner's intuition is reliably **wrong in
  a load-bearing way** — those wrong predictions are the highest-value teaching events in the whole track:
  *base64 is not encryption · "encrypted" passwords were not safe · deleting a secret in the next commit
  does not remove it · a container is not a VM.*
- **The fourth beat is "a small reviewable script," not an enterprise guardrail.** Beginners aren't
  writing Checkov rules yet. "Automate & own it" stays what the shipped track already does: turn the
  manual analysis into a tiny Python/script tool, **AI drafts → you review every line → you own it** —
  which is also the track's spine (module 10) and the capstone.

## The recurring move (lightened for beginners)

1. **Predict** — only where intuition misleads; commit to an answer before the reveal.
2. **Do** — the hands-on skill, against a *real-shaped* artifact (a real log format, a real capture, a
   real password-dump scheme, a real obfuscated command).
3. **Explain (the verdict)** — say, in your own words, what happened and which principle/control failed.
4. **Own it** — turn the manual steps into a small reviewable script committed to your portfolio repo.

## "Outside the box, only for good reason" — the discipline (beginner edition)

| Module shape | Use when | The move |
|---|---|---|
| **Predict-then-reveal (misconception)** | a beginner will confidently guess wrong and the right answer is foundational (08, 09, 11) | predict the wrong intuition → reveal → fix it for good |
| **Predict-then-reveal (concept autopsy)** | concept modules with no single tool (01, 12) | predict where the breach failed → reveal the principle/boundary |
| **Skill-first, breach as stakes** | procedural-literacy modules (02, 03, 04, 05, 06, 07, 10) | short real-incident hook → build the skill → one light prediction at most |

The test for a prediction prompt: *would a smart beginner likely answer wrong, and is the correct answer
load-bearing for the rest of the curriculum?* If not, skip it and just teach the skill well.

## House rules that still bind

- Two files per module (`README.md` + `lab.md`); colocated lab env (`Makefile`, `data/`, `demo.py`, etc.)
  copied in beside them under `planning/foundations-d/`. `plaintext-labs` and the shipped track untouched.
- README keeps the recognizable sections (meta line, objective, key concepts, AI acceleration); "The core
  idea" may become predict-then-reveal where the table says so.
- **Real links only**; cite primary sources (RFCs, man pages, breach filings/post-mortems, NVD, MITRE).
  Do not invent URLs — mark uncertain ones `<!-- VALIDATE -->`.
- **Beginner-honest tone.** Define jargon on first use; assume no prior security experience. The breach is
  a hook, not a horror story — keep it short and tie it straight to the skill.
- **Scrub the labs' fictional persona** to neutral framing (the shipped labs use one); each module already names its real anchor.

## Phases & capstone (structure unchanged, Verdict-framed)

- **Phase 1 · Lab & first principles (01–03)** — Project: stand up the isolated lab (VM + containers) as a
  rebuild-from-zero script, and threat-model it.
- **Phase 2 · Hosts & networks (04–07)** — Project: a scripted triage toolkit profiling a Linux *and* a
  Windows host and pulling DNS + the handshake from a real capture.
- **Phase 3 · Data, crypto, automation & git (08–12) → Capstone** — a Python "foundations toolkit" repo
  that decodes a real layered artifact, checks crypto the right way, parses a real log, and ships with
  secret hygiene and a STRIDE model.

---

## Per-module spine (the authoring brief)

> Each row: **Anchor** (real artifact) · **Shape** · **Predict** (if any) · **Do** (the skill) ·
> **Own it** (the script). Authors: preserve the real tool/technical content from the existing module;
> change the *frame*, not the rigor. Keep it beginner-honest.

### Phase 1 — Lab & first principles

**01 · Security First Principles** — CIA, AAA, defense in depth, the security mindset.
- **Anchor:** Equifax 2017 (147M records; unpatched Apache Struts CVE-2017-5638; flat network; an expired
  cert blinded monitoring for ~76 days).
- **Shape:** predict-then-reveal (concept autopsy).
- **Predict:** "Equifax had firewalls, encryption, and a security team. With all that, how did 147M records
  walk out — what *one* thing failed?" (the reveal: not one thing — every principle failed in series).
- **Do/Own it:** write a one-page "principle autopsy" mapping each failure to CIA / AAA / defense-in-depth /
  the missing detection. Mental model: security is a property of the whole system, not a product you buy.

**02 · Building a Safe Lab** — isolated VMs, VM-vs-container, snapshots, network isolation.
- **Anchor:** the discipline of never detonating on your daily machine — a real VM-escape CVE (VENOM,
  CVE-2015-3456) to show isolation has limits + why malware labs are network-isolated (WannaCry's worm spread).
- **Shape:** skill-first + one light predict: "is a Docker container enough to safely detonate malware?"
  (No — shared kernel; that's the real VM-vs-container decision).
- **Do/Own it:** stand up an isolated VM + container, snapshot, isolate the network; capture it as a
  rebuild-from-zero script. Connects → 03, capstone.

**03 · Docker & Containers** — run/build/inspect; the isolation model and its limits.
- **Anchor:** the 2018 wave of cryptojacking via **exposed Docker API/daemon** (an open daemon = root on the host).
- **Shape:** skill-first + light predict: "a container is just a VM, right?" / "what can `--privileged` do to the host?"
- **Do/Own it:** run, build, and `inspect` containers; see namespaces/cgroups (the isolation) and where it
  ends (shared kernel). A Dockerfile + an inspect script. Mental model: a container is a *process* with
  restricted views, not a machine.

### Phase 2 — Hosts & networks

**04 · Linux for Security** — shell, permissions, processes, logs, text processing.
- **Anchor:** Mirai 2016 (default-credential takeover of Linux IoT) or an SSH brute-force visible in `auth.log`.
- **Shape:** skill-first.
- **Do/Own it:** use the shell + perms + processes + `grep`/`awk` to investigate a compromised-host artifact
  (brute-force in `auth.log`, a SUID backdoor); say who got in and how; fold the hunt into a one-liner→script.

**05 · Windows for Security** — filesystem, registry, services, event logs, PowerShell.
- **Anchor:** a real Windows intrusion visible in event logs (malicious service install 7045 + encoded
  PowerShell — commodity loader / Emotet-style persistence).
- **Shape:** skill-first.
- **Do/Own it:** triage the provided `evtx` sample via event logs / registry / services / PowerShell; name
  the persistence mechanism; extend `triage.py`. Mental model: the registry & event log are Windows's
  ground truth.

**06 · Networking Fundamentals** — TCP/IP, the handshake, DNS, reading a capture.
- **Anchor:** SUNBURST (SolarWinds) DNS-based C2 beaconing — a real attack that *hid in DNS* (ties forward
  to the cloud track).
- **Shape:** skill-first + light predict: "which packet in this capture is the malware phoning home?"
- **Do/Own it:** walk the three-way handshake and a DNS lookup in a capture; spot the beacon; a pcap-parse
  script. Mental model: a packet capture is the network's CCTV; DNS is the phone book attackers also use.

**07 · Web & HTTP Fundamentals** — requests, responses, sessions, security headers.
- **Anchor:** Firesheep (2010) — a one-click demo that hijacked session cookies sent over plain HTTP, which
  pushed the web to HTTPS-everywhere.
- **Shape:** skill-first + light predict: "you're on café wi-fi, logged into a site over HTTP — what can the
  person beside you do?"
- **Do/Own it:** use `curl` to see requests/responses/sessions/headers; find the session cookie missing
  `Secure`/`HttpOnly`; name the header that would've stopped it; a header-audit script.

### Phase 3 — Data, crypto, automation & git

**08 · Data & Encoding** — hex, base64, URL encoding, JSON/`jq`.
- **Anchor:** base64-encoded PowerShell in real commodity malware (the `-EncodedCommand` trick).
- **Shape:** predict-then-reveal (misconception).
- **Predict:** "malware hides its payload in base64. Is that encryption — is the payload secret?"
- **Reveal:** encoding ≠ encryption; base64 is reversible by anyone, meant for transport/evading naive
  filters, not secrecy. **Do/Own it:** decode a layered hex/base64/URL blob; `jq` a JSON; a decode script.

**09 · Cryptography Basics** — hashing, symmetric/asymmetric, certificates, TLS.
- **Anchor:** Adobe 2013 (153M passwords "encrypted" with ECB, no salt, reused key, plus plaintext hints →
  mass-cracked; the "ECB penguin" / crossword).
- **Shape:** predict-then-reveal (misconception).
- **Predict:** "Adobe *encrypted* their passwords. Were they safe?"
- **Reveal:** encrypted-with-ECB-and-reused-key (reversible, leaks patterns) ≠ salted **hash**. Teaches
  hashing vs encryption, salt, why ECB leaks structure. **Do/Own it:** `openssl` hashing/symmetric/asymmetric/
  cert/TLS; a hash-and-verify script.

**10 · Scripting & Automation** — turning repetitive analysis into reviewable Python tools.
- **Anchor:** the scale problem — a real IOC list / log too large to eyeball (a CISA advisory's IOCs, or a
  real-format access log).
- **Shape:** build-first (this is the track's automation spine).
- **Do/Own it:** turn a manual analysis (decode / parse / extract IOCs) into a reviewable Python tool;
  **AI drafts → you review every line → you own it.** Mental model: automate the toil, never the judgment.

**11 · Version Control & Working in the Open** — git, PRs, keeping secrets out of history.
- **Anchor:** Toyota 2022 (an access key sat in a public GitHub repo for ~5 years) / the leaked-AWS-key-in-GitHub pattern.
- **Shape:** predict-then-reveal (misconception).
- **Predict:** "you committed a secret, then deleted it in the very next commit. Is it gone?"
- **Reveal:** no — it's in history forever until rewritten. Teaches git history/internals, `filter-repo`/BFG,
  `.gitignore`, pre-commit scanning. **Do/Own it:** a PR workflow + a pre-commit secret-scan hook.

**12 · Threat Modeling** — trust boundaries and STRIDE.
- **Anchor:** Target 2013 (HVAC vendor credentials → flat network → POS malware → ~40M cards).
- **Shape:** predict-then-reveal (concept autopsy).
- **Predict:** "Target was PCI-compliant, with firewalls. Where was the trust boundary nobody guarded?"
- **Reveal:** the third-party vendor path; a trust-boundary/STRIDE pass would have flagged it. **Do/Own it:**
  draw your lab's trust boundaries, STRIDE each, write the one-page model. Mental model: model the system
  before you touch a tool — the cheapest bug to fix is the one on the whiteboard.

### Capstone — "Prove the literacy on real artifacts"
A `foundations/` portfolio folder: capture and walk a real HTTP exchange end to end (DNS → TCP handshake →
TLS), **decode a real layered encoded blob** by committed script (not just CyberChef clicks), check crypto
the right way (salted hash, not ECB), parse a real log, and ship a one-page STRIDE model — all with secret
hygiene and a rebuild-from-zero script. Deliverable: the capture write-up, the decode script, the crypto
check, and the STRIDE model — the first portfolio piece.
