# Content Sourcing & Freshness Strategy

*A working document for keeping Plaintext's learning side top-notch — the source map, the freshness
pipeline, and the structural mechanics that make the curriculum engaging. Compiled from a verified
research pass on 2026-06-11. Every external resource below was checked against live repo activity,
pricing pages, or current search index that week; **freshness flags are load-bearing — read them.***

> **How to use this doc.** Sections 1–3 are the reference (what to cite, where new content surfaces,
> what mechanics to adopt). Section 4 is the **dispatch board** — discrete, kickable tasks in the same
> format as `TODO.md`. When a task here is started, move it onto `TODO.md` proper. Re-verify any link
> before it ships into a module: the whole point of this doc is that the field moves and our citations
> must move with it.

---

## The thesis

Plaintext already has the rare half right: 158 modules, disciplined primary sourcing (NIST / MITRE /
RFCs / vendor docs, no proprietary-course copying), weekly lychee link-checking, and per-module
`Last reviewed:` dates. Sourcing *more links* is not the bottleneck.

The two upgrades that make the learning side genuinely top-notch:

1. **A freshness pipeline** (Section 2) so the Learn paths track the field instead of drifting — driven
   by the handful of feeds where modern, hardcore, real content surfaces first, plus machine-readable
   CVE/lab feeds we can diff in CI.
2. **Structural engagement** (Section 3) — borrowing the mechanics that make pwn.college, PortSwigger
   Academy, KC7, and freeCodeCamp *sticky*, not just their content. This is where "the freeCodeCamp for
   security" is won or lost.

Our structural advantage is durable and worth stating plainly: **as the paid platforms pull content
behind paywalls (HTB killed its $14 tier; TryHackMe is moving formerly-free rooms to premium;
CyberDefenders is tightening), a genuinely-free, CC-BY, OSS-first hardcore path becomes *more* valuable,
not less.** That is the wedge.

---

## 1. The source map (verified 2026-06-11)

Conventions: ✅ active & safe to anchor on · ⚠️ usable but flagged (stale / moving / freemium erosion) ·
❌ dead or do-not-anchor. "Anchor" = safe to make a module or lab depend on it.

### 1.1 Vulnerable environments & lab targets

| Resource | Status | Notes for curriculum use |
|---|---|---|
| **Vulhub** (`github.com/vulhub/vulhub`) | ✅ | New CVE environments through spring 2026. **Default per-CVE target.** Machine-readable index at `environments.toml` — diff it in CI (see T-CS1). |
| **OWASP Juice Shop** | ✅ | v20 (May 2026) **added AI/prompt-injection challenges** — serves the "AI is core" mandate directly. |
| **CloudGoat** (Rhino) | ✅ | v2.4–2.5 added Bedrock/agent-hijacking scenarios. Needs learner's own AWS account (cloud cost, not licence). |
| **DVWA** (digininja) | ✅ | Revived and active (was long-stale historically). Good Foundations on-ramp; lower realism than Juice Shop/Vulhub. |
| **OWASP crAPI** | ✅ | The current API-security target (BOLA/BFLA, mass assignment, JWT). Docker Compose. |
| **GOAD v3** (Orange Cyberdefense) | ✅ | The Active Directory backbone. v3 rewrote tooling to Python; deployable via Ludus, Proxmox, VMware, AWS, Azure. |
| **Kubernetes Goat** (Madhu Akula) | ✅ | Reference vulnerable K8s cluster. |
| **flaws.cloud / flaws2.cloud** | ✅ | Zero-setup AWS-security intro. Hosted by Scott Piper (now at Wiz). *Verify in a real browser before relying — sandbox egress can't reach it.* |
| **DataDog stratus-red-team** | ✅ **adopt** | Granular cloud adversary-emulation mapped to ATT&CK. Near-perfect fit for the offense↔defense "detonate then detect" model. |
| **OWASP FinBot CTF** | ✅ **adopt** | Launched Apr 2026 — "Juice Shop for agentic AI," mapped to OWASP Agentic Top 10 + MITRE ATLAS. Strongest current agentic-AI target. |
| **OWASP PwnzzAI** | ✅ **adopt** | New (2026), lightweight self-hosted full-AI-stack target (prompt injection, vector-DB attacks, excessive agency). |
| **ReversecLabs damn-vulnerable-llm-agent** | ✅ | Canonical ReAct-agent exploitation lab (use the ReversecLabs origin, not the many forks). |
| **Ludus** (badsectorlabs) | ✅ | AGPL, active (releases through May 2026). **The DetectionLab successor** for AD ranges. |
| **Splunk attack_range v5** | ✅ | Active; UI/API/CLI, Docker Compose builds. Detection-as-code ranges. |
| **IAM Vulnerable** (BishopFox) | ✅ | AWS IAM privesc playground (~30+ paths). Pairs with CloudGoat. |
| **OWASP WrongSecrets** | ✅ | Secrets anti-patterns across AWS/Azure/GCP/Vault/K8s; now includes prompt-injection secret challenges. |
| **TerraGoat** (Bridgecrew) | ⚠️ | ~11 mo since commit; still fine for "scan Terraform for misconfigs." Pin versions. |
| **DVGA** (Damn Vulnerable GraphQL) | ⚠️ | Maintenance-only (one commit in the last year). Still the standard GraphQL target; note it's undeveloped. |
| **INE AzureGoat / GCPGoat / AWSGoat** | ⚠️ | ~1–1.6 yr stale; not archived. Among the few full-stack Azure/GCP options — keep with a version-pinning caveat; for AWS prefer CloudGoat. |
| **DetectionLab** (clong) | ❌ | **Dead** — unmaintained since 2023-01-01 (author's own README). Replace with Ludus / attack_range. |
| **CdkGoat** (~3 yr), **NCC sadcloud** (~2.6 yr), **Tenable CNAPPgoat** (~1.75 yr), **dhammon/ai-goat** (stale) | ❌ | Do not anchor. Use only with heavy version pinning if a topic truly requires them. |

### 1.2 Hands-on platforms (free tiers)

| Platform | Status | What's actually free |
|---|---|---|
| **PortSwigger Web Security Academy** | ✅ | **Entirely free**, ~279 labs incl. a free **Web LLM attacks** path. The gold-standard web anchor. |
| **pwn.college** (ASU) | ✅ | Entirely free; belts (white→black), 1000+ auto-graded challenges. Best free deep-dive for binary/systems/RE + Linux fundamentals. |
| **KC7** (`kc7cyber.com`) | ✅ | **Free, nonprofit.** Browser-based KQL threat-hunting against realistic datasets. Strongest zero-setup *defensive* content anywhere. |
| **OverTheWire** | ✅ but static | Free, no account (ssh in). Bandit = best free Linux-CLI on-ramp. No new content 2025–2026 — stable classic, don't promise freshness. |
| **CyLab Security Academy** (was **picoCTF**) | ✅ | **Rebranded May 2026** → `cylabacademy.org` / `learn.cylabacademy.org`. Free; picoGym = always-on archive. **Update all `picoctf.org` links.** |
| **Antisyphon / BHIS** | ✅ | Pay-what-you-can incl. **$0** (SOC Core Skills, Packet Decoding). Free webcasts on YouTube. |
| **Cybr** | ✅ | 20+ free hands-on AWS-security labs, no credit card. |
| **TryHackMe** | ⚠️ | Free rooms **shrinking** (Linux Fundamentals Pt 1 → premium); AttackBox 1 hr/day. **Link specific verified-free rooms, never "the free tier."** |
| **Hack The Box** | ⚠️ | Killed $14 VIP (Oct 2025); cheapest paid is now $25/mo VIP+. Free: active (non-retired) machines + Academy Tier-0 modules (effectively free via cubes). Retired machines paywalled. |
| **LetsDefend** | ⚠️ | **Acquired by HTB (Sept 2025)**, accounts migrating. Free: ~15 SOC alerts/mo. Link with a durability caveat. |
| **CyberDefenders** | ⚠️ | Free scope **tightening** (5 hr lifetime Pro trial). Link individual free-badged labs, not the platform. Hosts the Szechuan Sauce case free. |
| **Blue Team Labs Online** | ⚠️ | All downloadable **Challenges** free + 6 Investigations + 10 hr/mo. Good DFIR-artifact source. |
| **SadServers** | ⚠️ | ~100 scenarios (nearly doubled in 2025); free but rate-limited. Great Linux-troubleshooting supplement, not a required lab. |

### 1.3 Best free educators (the standout, with the move that matters)

- **Foundations:** Practical Networking (Ed Harmoush — *Networking Fundamentals* series), Ben Eater
  (6502 breadboard), Julia Evans / Wizard Zines, OSTEP (free OS book), MIT Missing Semester, Cloudflare
  Learning Center. ⚠️ **LiveOverflow** binary-exploitation playlist is still the best free intro but
  uploads stopped — link the *playlist*, not the channel.
- **Offensive:** IppSec + 0xdf (very active, writeups Apr 2026; `ippsec.rocks` to jump to a technique),
  TCM's free "Practical Ethical Hacking" 12-hour course, PayloadsAllTheThings, GTFOBins, LOLBAS.
  ⚠️ **HackTricks moved to `book.hacktricks.wiki`** (Google-delisted — use its search). ⚠️ Haddix's full
  TBHM and Tib3rius's privesc are now **paid** — link their free conference talks instead.
- **Web/AppSec:** PortSwigger Research (James Kettle's annual talk — 2025's "HTTP/1.1 Must Die"; their
  annual "Top 10 Web Hacking Techniques" is a ready-made module-refresh list), Critical Thinking Bug
  Bounty Podcast (weekly, current), NahamSec. ⚠️ **Assetnote → Searchlight Cyber** (`slcyber.io`).
- **Defensive/SOC/DFIR:** Antisyphon SOC Core Skills, SigmaHQ, Elastic Security Labs, **The DFIR Report**
  (real intrusions end-to-end, ATT&CK-mapped), 13Cubed (Windows memory forensics), DFIRScience, MITRE
  ATT&CK CTI training (`attack.mitre.org/resources/learn-more-about-attack/training/`).
- **Malware/RE:** Dr Josh Stroschein "The Cyber Yeti" (now Google FLARE), OALabs, pwn.college RE dojo,
  Flare-On (annual, free past challenges + solutions), crackmes.one. ⚠️ MalwareUnicorn RE101 and Azeria's
  ARM tutorials are ~2017 (32-bit) — label the age; pair with ARM64 material.
- **Cloud:** fwd:cloudsec archive (all free), Hacking the Cloud, Datadog Security Labs + Stratus, Wiz
  Research + cloudvulndb.org. ⚠️ Scott Piper's Summit Route blog is dormant — link the games, not the blog.
- **AI/LLM:** OWASP GenAI **LLM Top 10 (2025 v2.0)**, **Johann Rehberger / Embrace The Red** ("Month of AI
  Bugs," Aug 2025 — best practitioner source), Lakera Gandalf + Agent Breaker, **MITRE ATLAS** (now covers
  agents; v5.4 Feb 2026), Simon Willison's prompt-injection synthesis.

### 1.4 Real-artifact datasets

- ✅ **Malware-Traffic-Analysis.net** (active, exercises into 2026 — best PCAP/network-forensics source,
  with answer pages) · **MalwareBazaar** (⚠️ now needs a **free** auth-key from `auth.abuse.ch` — update any
  keyless API examples) · **Splunk BOTS v1–v3** (live S3 downloads, CC0; **no v4 dataset exists**) ·
  **Splunk attack_data** (living, commits June 2026 — best detection-engineering corpus) · **DFIR Artifact
  Museum** (active through May 2026) · **Security Onion sample-PCAP index** · **CIC datasets** (active;
  CIC-IDS2017 still the IDS teaching standard; light registration).
- DFIR images: ✅ **Stolen Szechuan Sauce** (DFIR Madness — best free full-stack IR case; **also free on
  CyberDefenders** as the durable second link) · ✅ **13Cubed** memory challenges (new ones still shipping).
- ⚠️ **OTRF Security-Datasets** (frozen Sept 2023; Mordor 301-redirects here) and **EVTX-ATTACK-SAMPLES**
  (frozen Jan 2023) — still canonical corpora, but pair with newer sources for current-OS schemas.
- ⚠️ **Cado REvil/Kaseya** repo still public post-Darktrace-acquisition but dormant since 2021 — **mirror
  it**, don't make a lab a single point of failure on it.
- ❌ ADFA / LANL / DARPA sets — legacy; ML-history context only.

---

## 2. The freshness pipeline (the actual "best way")

A curriculum this size rots silently. Define an intake spine — the highest-signal, mostly-CC-friendly
sources where modern content surfaces first — and a CI mechanism to pull real artifacts in automatically.

**The core loop (minimum set that catches almost everything):**

- **Meta-feed:** **tl;dr sec** (Clint Gibler) — weekly; the single best "what to read this week."
- **Primary research:** watchTowr Labs · Google **Project Zero** (now `projectzero.google`) · **PortSwigger
  Research** · GreyNoise Labs · **The DFIR Report** · Elastic Security Labs.
- **Machine-readable, lab-ready feeds (diff these in CI):** **CISA KEV JSON via the new GitHub mirror**
  `cisagov/kev-data` · **Vulhub `environments.toml`**. When a module's topic gains a new exploited-in-wild
  CVE *with a Vulhub target*, that's a signal to refresh the module or add a lab.
- **Free, reusable talk video:** **media.ccc.de** (all **CC BY 4.0** — directly compatible with our licence,
  downloadable) and **fwd:cloudsec** (all talks free). Prefer these over YouTube for durability.

**Critical feed caveat — NVD is officially degraded.** As of April 2026, NIST enriches only higher-risk
CVEs; pre-March-2026 CVEs moved to "Not Scheduled." **Do not depend on NVD CVSS/CPE enrichment being
present.** Pivot to CISA KEV (exploited-in-wild signal) + the CVE Program JSON (`CVEProject/cvelistV5`) +
GreyNoise/VulnCheck for exploitation context.

**Conference archives, by cadence:** media.ccc.de (final cuts 1–2 days after talk — gold standard) >
BSidesSF / fwd:cloudsec / DEF CON (weeks–months) > Black Hat (~90–120 days). Slide aggregator:
`onhexgroup/Conferences`.

**Newsletters worth a standing subscription:** tl;dr sec, Detection Engineering Weekly (Zack Allen),
CloudSecList (Marco Lancini — still running, redesigned Apr 2026), Risky Business (now `news.risky.biz` —
*not* the old Substack), Vulnerable U, SANS NewsBites.

### Link-rot tactics for our MkDocs setup (specific)

- `mkdocs build --strict` **does not check external links** — only internal nav/anchors. Keep `validation:
  links: { unrecognized_links: warn, anchors: warn }` in `mkdocs.yml` for internal integrity.
- External health: **lychee** (already in CI) is the right 2026 tool — keep it on a **cron schedule, not
  per-PR**, so transient 429/403s don't block merges. (`gaurav-nelson/markdown-link-check` action is
  deprecated; don't migrate to it.)
- **The gap lychee can't close:** it catches *dead* links, not *stale* ones (a URL that resolves but now
  points to a superseded version). That's what the `Last reviewed:` dates + Section 2 feeds are for — a
  human/AI review pass, not a 200-check. See T-CS2.
- **YouTube:** cite the **video ID + channel** (a re-upload stays findable), prefer the conference's own
  channel, **exclude `youtube.com` from lychee** (it 403s bots → false positives), and **Wayback-snapshot**
  load-bearing resources via Save Page Now (S3-style API keys, not cookies).

---

## 3. "The freeCodeCamp for security" — what to adopt structurally

### 3.0 The gap is real and unclaimed

A dedicated research pass found **no platform that credibly bills itself "the freeCodeCamp of
cybersecurity."** freeCodeCamp's own Information Security cert is now *legacy* (folded into the old QA
cert); TryHackMe and HTB are **freemium** (free tier shrinking — see §1.2); OpenSecurityTraining2 is free
and deep but *advanced-only* with no linear on-ramp or portfolio cert; Cisco NetAcad and the Google
Cybersecurity Certificate skew *theory/quiz* (and Google's is paid). The center — **free all the way
through + open-source curriculum + a single linear beginner→job path + auto-graded hands-on projects +
a portfolio credential** — is empty.

Why it stays empty (and why Plaintext is positioned to take it):

- **Security labs are expensive to host.** fCC's near-zero-marginal-cost in-browser test runner has no
  security equivalent — vulnerable VMs/containers need isolation and attack infra, which is *why*
  TryHackMe/HTB must charge. **Plaintext sidesteps this by pushing compute to the learner's own Docker
  host** — that's how it can be free all the way through where they can't.
- **Auto-grading exploitation is hard.** "Tests go green" works for `add(2,2)===4`; verifying "you got a
  shell" deterministically and tamper-evidently is harder. Plaintext's multi-check-type grader
  (`flag` / `structural` / `artifact_functional` / `target_state`) is the security-correct substitute.
- **Legal/authorization.** Every offensive lab must ship its own sandboxed target — you can't drop a
  beginner onto a hosted "attack box." Plaintext's lab-target ladder + authorization notes already do this.

freeCodeCamp itself didn't win on content quality — plenty of sites had good content. It won on
**structure and a flywheel** (News with 8,000+ tutorials + a ~11M-subscriber YouTube channel funneling
millions of learners into an open-source, donor-funded, linear, project-graded curriculum). The mechanics,
mapped to what Plaintext can do with Markdown + docker-compose labs + the YAML auto-grader + receipts:

| freeCodeCamp / top-program mechanic | Why it works | Plaintext equivalent — status |
|---|---|---|
| **Project-based certs** (earn by building, not watching) | Proof is the artifact; portfolio > badge | **Have it** (capstones + receipts). Lean in: the receipt *is* the credential. |
| **Linear, opinionated path** (no adventure-paralysis) | Removes decision fatigue → momentum | Tracks are linear; keep Learn paths to **one best link per concept**, not a buffet. |
| **Every concept has an immediately-attached lab** (PortSwigger) | Tight read→do loop is the core hook | **Audit gap** — flag any module that explains a concept but never makes the learner *do* it. See T-CS3. |
| **Instant pass/fail feedback** (fCC in-browser tests) | Tight loop = engagement | Security can't run in-browser; **`make grade` is the native equivalent.** Surface the pass/fail more prominently. |
| **Belts/levels with public proof** (pwn.college) | Visible progression motivates | Receipts + track certificates encode it — make the progression *visible*, not just verifiable. |
| **Cross-module narrative** (KC7's detective story; our "Meridian Financial") | A story is what makes people finish | **Seed exists** — extend the Meridian thread across more labs. |
| **Mystery / no-hint expert tiers** (PortSwigger apprentice→expert) | Scales challenge to skill | CONTRIBUTING.md already mandates scaling hand-holding down by track — **enforce it** in review. |
| **Randomized per-learner flags** (pwn.college) | Defeats answer-sharing; forces real solving | Hardest to retrofit; the grader's `flag` check type is the right primitive if we pursue it. |
| **Content flywheel** (fCC News + YouTube funnel *into* the curriculum) | Acquisition + SEO + authority + community authorship | **Biggest missing piece.** A writeups/showcase stream + per-module "why this matters now" tied to a current CVE turns a curriculum into a *destination*. See T-CS4. |
| **Zero-friction, no paywall cliff** (nonprofit) | Trust; nobody blocked mid-path | **Our structural wedge** — and it widens as competitors paywall. State it loudly. |

### 3.1 The engagement mechanics that earn "hardcore" reputations (ranked, with evidence)

The key finding from studying pwn.college, PortSwigger, KC7, picoCTF, OverTheWire, and HTB: **the
mechanics that make programs respected are almost all authoring/structure decisions, not platform
features** — which means our stack already supports the top ones. In priority order:

1. **One narrow hands-on lab welded to every concept** — read → do, one vulnerability at a time.
   PortSwigger's gold-standard pattern (explain in text, then an interactive lab scoped to *one* class);
   pwn.college's SIGCSE'24 finding that generic CTF challenges are "too difficult" until each isolates one
   mechanism; Julia Evans' cognitive version (you learn a topic far better *after* you have a real
   problem). **Never separate prose from doing.** (`portswigger.net/web-security`; `jvns.ca/blog/learn-how-things-work/`; `dl.acm.org/doi/10.1145/3626252.3630912`)
2. **A deliberate scaffolded difficulty ramp; first lab trivially winnable.** The single most
   research-backed retention lever — picoCTF's "pico-Boo! How to avoid scaring students away," pwn.college's
   "progressive learning curve through modularized challenges." Pure authoring discipline. Our CLAUDE.md
   scaled-hand-holding-by-track rule *is* this. (`picoctf.org/pdfs/FINAL_CISSE_paper.pdf`; `arxiv.org/abs/2004.11556`)
3. **One-command, validated environments** (`make up`/`make demo` actually run). OverTheWire endures on
   `ssh`-in minimalism; pwn.college and the "PWN Lessons Made Easy with Docker" work Dockerize to lower the
   on-ramp. We already mandate this in the definition of done — the research says it's a *top engagement
   driver*, not just hygiene.
4. **Instant, granular pass/fail feedback the learner runs at will** — the flag *is* the feedback.
   Our `make grade` already is this; lean into immediacy and per-check granularity.
5. **Visible belts/badges + portable proof.** pwn.college white→black belts; PortSwigger
   apprentice→practitioner→expert; HTB tiers/XP. Our `receipt.json` + `track_certificate.py` + badge
   rendering is the substrate — **make the progression bragworthy and visible**, and label labs by tier.
   (Caution from pwn.college's own 5-year paper: tune gamification carefully — "don't let points become
   the point.")
6. **Cross-module narrative that reuses earlier artifacts.** KC7's data-driven detective story (55k+ free
   players) proves a self-paced branching narrative needs only a dataset + ordered questions — maps onto
   Markdown + a bundled `data/` set perfectly. Extend the Meridian thread; a later lab should consume the
   artifact an earlier lab produced. (`kc7cyber.com/about`)
7. **A no-hint "mystery/expert" tier and gated solutions.** PortSwigger's Mystery Lab hides the vuln class
   "to introduce an element of recon"; HTB ships writeups *only after* a machine retires. Adopt as authoring
   policy: advanced labs state only scenario + success criteria, and don't ship a walkthrough beside the
   hardest ones. (`portswigger.net/web-security/mystery-lab-challenge`)
8. **Mandatory "build-your-own-tool" finish.** MIT Missing Semester's toolsmithing ethos + Julia Evans'
   "understand how things work." Our required **Automate & own it** step is exactly this — keep it mandatory;
   the committed tool is both the engagement payoff and the marketable proof.

### 3.2 The AI-era integrity move (most current finding)

The live question — "how does a hands-on program stay hardcore when an LLM can just solve the flag?" — is
being answered now, and the consensus maps directly onto our grader:

- **Grade the artifact/trajectory, not just the flag.** AI-era CTF-design research (arXiv 2603.21551, 2026;
  arXiv 2506.17644, CCS'25) converges on reviewing *intermediate steps* and excluding flag-only submissions
  "lacking supporting steps." For us: the bare `flag` check is now the *weakest* signal; weight grading
  toward `artifact_functional` (the learner's script runs), `structural` (the artifact exists / matches
  patterns), and `target_state` (the live lab is provably solved) — these survive even when an LLM could
  emit the flag.
- **Randomized per-learner flags** defeat answer-sharing and make the grader tamper-evident. pwn.college
  derives each flag from `challenge_id + user_id` and logs cross-user submissions as cheating (source:
  `github.com/pwncollege/CTFd-pwn-college-plugin`). Adoptable in `grade.yaml` flag checks where a lab exposes
  a unique per-learner secret — giving effort-proof + tamper-evidence (not proctoring, which an open repo
  with visible keys can't provide — state this honestly, as our trust model already does).
- **AI as sanctioned scaffolded tutor, not answer key.** pwn.college's SENSAI frames AI as one way to get
  unstuck (with full challenge/terminal context), alongside thinking/searching/Discord. Our
  "AI authors → you review → you own it" posture is exactly the published consensus.

*(Engagement findings: all program-behavior/paper claims are from search-result extracts of primary pages
— direct fetches of PortSwigger/MIT/ACM/arXiv were 403-blocked to the research agent; the per-user-flag
detail is corroborated against pwn.college's actual GitHub source. fCC scale figures are search-snippet
extractions, not full-page reads — treat exact numbers as directional.)*

---

## 4. Dispatch board — kickable tasks

Same format as `TODO.md`; move onto that board when started. Prepend the standard session preamble from
`TODO.md`. Pri: P0 fast/high-value · P1 substantial · P2 nice-to-have.

| # | Task | Pri | Repo | Effort |
|---|------|-----|------|--------|
| T-CS1 | KEV + Vulhub freshness watcher (CI) | P1 | both | M |
| T-CS2 | ✅ **done** — Stale-link audit against the Section 1 flags | P0 | plaintext | S–M |
| T-CS3 | "Concept→lab attachment" audit | P1 | plaintext | M |
| T-CS4 | Content flywheel: showcase + "why this matters now" | P1 | plaintext | M |
| T-CS5 | Adopt the fresh AI-security targets (FinBot/PwnzzAI/Stratus) | P1 | both | M–L |
| T-CS6 | Wayback-snapshot load-bearing citations in CI | P2 | plaintext | S |

### T-CS1 — KEV + Vulhub freshness watcher · plaintext-labs (+ plaintext)
**Why:** the highest-leverage move — close the loop between the freshness pipeline and the modules so the
curriculum *pulls* current real artifacts instead of aging in place. NVD enrichment is officially
degraded (Apr 2026), so KEV is now the primary exploited-in-wild signal.
**Done when:** a scheduled job diffs the **CISA KEV JSON** (`cisagov/kev-data` mirror) and **Vulhub's
`environments.toml`**; when a newly-KEV'd CVE has a Vulhub target *and* maps to a module topic, it opens a
tracking issue ("module X has a fresh real-world target: CVE-… / Vulhub path"). Reuses the existing
module-17 KEV-refresh plumbing where possible.
> **Kickoff:** Build a scheduled GitHub Action that diffs the CISA KEV JSON (GitHub mirror) against the
> last run and cross-references Vulhub's `environments.toml`; for each new KEV entry that has a Vulhub
> environment and matches a module topic, open/update a `content-fresh` tracking issue. Don't auto-edit
> modules — surface candidates for human review. Build on `defensive/17`'s KEV plumbing.

### T-CS2 — Stale-link audit against Section 1 flags · plaintext · ✅ DONE (2026-06-11)
**Why:** several canonical citations have moved or gone stale (picoCTF→cylabacademy.org, HackTricks→.wiki,
Assetnote→slcyber.io, DetectionLab dead, MITRE training path moved). lychee catches 404s but not these
"resolves-but-wrong/superseded" cases.
**Outcome:** swept all `tracks/**/README.md` Learn sections against the flags. **The prose was already
remarkably clean** — none of the headline dead/moved domains (`picoctf.org`, `hacktricks.xyz`,
`assetnote.io`, `DetectionLab`, `mandiant.com`) appear anywhere in `tracks/`. Three fixes made:
1. `malware/12-ioc-extraction-attck` — MITRE CTI training repointed from the old `/resources/training/cti/`
   to the current `/resources/learn-more-about-attack/training/cti/` path.
2. `malware/12-ioc-extraction-attck` — a **mislabeled duplicate** link (labeled "Cyber Threat Coalition"
   but pointing at the same MITRE CTI training URL) repointed to **David Bianco's Pyramid of Pain**, which
   is what the entry actually describes — fixing both the mislabel and the duplicate-source.
3. `foundations/05-windows` — a bare `tryhackme.com` homepage link → the specific Windows Fundamentals
   module URL, with a free-tier caveat (THM is moving rooms to premium).
`mkdocs build --strict` green. *Not done (no occurrences found): age-labels on MalwareUnicorn/Azeria ARM
material — those resources aren't currently cited in `tracks/`, so nothing to label.*

### T-CS3 — "Concept→lab attachment" audit · plaintext
**Why:** PortSwigger's signature (and fCC's) is that **every concept has an immediately-attached thing you
do.** Some modules may explain without an attached exercise.
**Done when:** each module is classified "has an immediately-attached do-it step" vs not; the gaps get a
short attached exercise (or a pointer to the existing lab) so no concept is read-only.
> **Kickoff:** Audit every module for whether its core concept attaches to an immediate hands-on step.
> Produce a census; for read-only modules, add a short attached exercise or surface the existing lab
> earlier. Respect the bridge-prose model — don't pad; attach *doing*.

### T-CS4 — Content flywheel · plaintext
**Why:** the biggest missing piece vs freeCodeCamp — the News/YouTube funnel is how fCC turned a curriculum
into a destination. We have COMMUNITY.md + a showcase scaffold (T17) to build on.
**Done when:** a learner-writeup/capstone showcase stream exists, and a lightweight per-module "why this
matters now" hook ties concepts to a current CVE/incident (fed by Section 2 feeds). No fake testimonials.
> **Kickoff:** Extend the community showcase into a content flywheel: a capstone/writeup showcase page and
> a per-module "why this matters now" hook tied to a recent real CVE/incident from the Section 2 feeds.
> Keep it honest and CC BY. Coordinate with COMMUNITY.md / T17.

### T-CS5 — Adopt fresh AI-security targets · both
**Why:** the AI-security lab landscape matured fast in 2025–2026 (FinBot CTF, PwnzzAI, ReversecLabs
DV-LLM-agent, Stratus). The AI track and the offense↔defense thread should use them.
**Done when:** relevant AI/automation and cloud modules cite/wrap the current targets (FinBot CTF for
agentic AI, PwnzzAI for self-hosted full-stack, Stratus for detonate-then-detect), with validated labs.
> **Kickoff:** Wire the fresh AI-security and cloud-emulation targets into the relevant modules/labs
> (FinBot CTF, PwnzzAI, ReversecLabs damn-vulnerable-llm-agent, DataDog stratus-red-team). Follow the
> lab-target ladder and the "validated lab" definition of done.

### T-CS6 — Wayback-snapshot load-bearing citations · plaintext
**Why:** video/slides rot faster than text; a load-bearing talk dying breaks a module.
**Done when:** a CI step extracts external URLs from `tracks/**` and POSTs load-bearing ones to Wayback
Save Page Now (S3-style keys), so an archived fallback exists.
> **Kickoff:** Add a scheduled CI step that snapshots load-bearing external citations via the Wayback Save
> Page Now S3 API (keys in repo secrets). Start with talks/slides/videos. Don't rewrite citations yet —
> just ensure a snapshot exists; a later pass can add archived-fallback links.

---

*Compiled 2026-06-11 from a verified multi-source research pass. Re-verify links before they ship; the
field moves — that's the whole premise. Engagement (§3) and freeCodeCamp-model citations are folded in as
the dedicated research lands.*
