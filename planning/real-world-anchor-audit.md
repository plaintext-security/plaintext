# Real-World Anchor Audit

*Created 2026-06-23. A module-by-module audit of how well the curriculum honors the
CONTRIBUTING rule **"tie it to the real world"** — real named breaches (year + primary
source), real CVEs by ID, real public datasets, real MITRE ATT&CK technique IDs, and actual
tool output, rather than invented toy examples or unbacked fictional companies.*

> Method: one reader per track read every module's `README.md` (Why this matters / The core
> idea / Further reading) and scanned its `lab.md`, then rated each module **Strong /
> Moderate / Weak** and named the specific anchor(s). Ratings are reproduced per track below.

---

## TL;DR

The curriculum is **well grounded in prose** but **unevenly grounded in the lab**. Read along
two axes:

1. **Prose anchor** — does the module *open* on a named real breach/CVE/incident with a
   primary source? Strong in foundations, cloud, automation, ztna, ai-ops. Thin in forensics,
   malware, cryptography.
2. **Lab artifact** — does the hands-on exercise operate on a *real* dataset / sample / CVE
   target, or on synthetic "Meridian Financial" data? **This is the bigger systemic gap.**
   Forensics, malware, python, cryptography (and much of defensive) run their labs on
   synthetic data *even when they cite the perfect real dataset in the Learn section.*

**Scorecard (167 modules):** ~87 Strong · ~69 Moderate · ~11 Weak.

| Tier | Tracks | Reading |
|---|---|---|
| 🟢 **Gold standard** | 00-foundations, 05-cloud, 10-automation | Nearly every module opens on a named breach w/ primary source, woven through prose *and* lab. **Copy these.** |
| 🟢 **Strong** | 11-ztna, 12-ai-augmented-ops | Most modules anchored to named breaches/CVEs/legal cases; the un-anchored ones are honestly method-focused build/eval modules. |
| 🟡 **Strong technique, missing breaches/CVEs** | 01-offensive, 02-defensive, 06-active-directory, 07-endpoint-hardening | Excellent ATT&CK-ID / tool / benchmark grounding, but few or no named real breaches, and (AD especially) missing the obvious real CVEs. |
| 🔴 **Systemic gap — real anchor missing as the spine/lab artifact** | 03-forensics, 04-malware, 08-cryptography, 09-python-for-security | Labs run on synthetic/mock data; the genre-defining real artifacts (disk/memory images, malware samples, named crypto breaks, live feeds) are cited only in Learn or absent. **Highest leverage.** |

---

## The one cross-cutting finding: "Meridian Financial"

A fictional company — **Meridian Financial** — is the recurring lab scenario across most
tracks (offensive, defensive, forensics, malware, AD, endpoint, crypto, python, and parts of
ztna/automation). **The cloud track (05) was deliberately de-fictionalized** — Meridian was
scrubbed and every module re-anchored to a real breach — and it is now the model.

Meridian is **fine as connective narrative scaffolding** *when it sits on top of real
artifacts* (real ATT&CK IDs, real tools, real datasets) — as it does in defensive, endpoint,
and AD. It becomes a **grounding weakness** when it is the *only* anchor and stands in where a
real breach / dataset / sample should be — as it does in forensics, malware, crypto, and
python labs.

Two clean rules fall out of the audit:

- **Prose:** a fictional org may *frame* a scenario, but the "Why this matters" should reason
  *from* a named real incident (the way ztna/01 pairs a fictional 800-person firm with the
  real Colonial Pipeline timeline), not *instead of* one.
- **Lab:** if a real public dataset/sample/CVE exists for the topic, the committed lab seed
  should *be* it (or wrap it, Vulhub-style), with synthetic data kept only as an offline
  fallback — not the reverse.

---

## Priority recommendations (and a way to seed the under-developed tracks)

Ordered by leverage. Each names *specific* real anchors to adopt — these double as a
starting brief for the tracks that need the most work.

### 1. 04-malware — anchor labs to real samples (genre demands it)
Zero modules analyze a real sample; all use benign synthetic stand-ins. A malware track is the
single most natural place for real artifacts.
- Anchor static (03/04), unpacking (09), and detection (13) to a **real MalwareBazaar sample
  by SHA-256** from a named family (e.g. **AgentTesla, Emotet, Vidar, AsyncRAT**); keep the
  synthetic version as the frictionless fallback.
- Use a real C2 profile (Cobalt Strike / Sliver) as the analyzed artifact in 06, not just a
  named reference.

### 2. 03-forensics — swap synthetic seeds for the already-cited real images
The track *names* the perfect datasets but commits synthetic data instead.
- Memory (06): use a **MemLabs** image (already cited) as the committed seed, not a
  pre-processed JSON.
- Network (09): use a **Malware-Traffic-Analysis.net** PCAP (already cited) with its analyst
  write-up as ground truth.
- Windows artifacts (04, 10): commit an **EVTX-ATTACK-SAMPLES** slice as the actual seed.
- Anchor at least one module to a real named case (a documented ransomware or BEC incident)
  for the Meridian narrative to *mirror*.

### 3. 08-cryptography — adopt the canonical named breaks
Standards/RFCs are cited well, but the famous applied-crypto failures are **absent**. Each maps
cleanly to a module:
- TLS (05): **Heartbleed CVE-2014-0160**, **POODLE**, **BEAST**, **DROWN**.
- PKI (06): **DigiNotar 2011**, **Debian OpenSSL CVE-2008-0166**, Symantec distrust.
- Asymmetric (03): **ROCA CVE-2017-15361**; promote the **Sony PS3 ECDSA** nonce reuse from
  Stretch into the spine.
- Hashing (04): **LinkedIn 2012** (unsalted SHA-1) or **Adobe 2013** (ECB, no salt — already
  the anchor in foundations/09).
- Integrity (01/02): **Flame MD5 collision**.

### 4. 06-active-directory — add the real CVEs and a named campaign
Named techniques + ATT&CK IDs are strong, but real CVEs are missing and breaches are one-liners.
- Add by ID: **Zerologon CVE-2020-1472**, **PetitPotam CVE-2021-36942** (named in prose but not
  cited), **noPac CVE-2021-42278/42287**, **PrintNightmare CVE-2021-34527**.
- Name a real APT/campaign where module 06 says "real APT campaigns" (e.g. an ATT&CK-documented
  group using PtH/lateral movement).

### 5. 09-python-for-security — feed labs real data, not mocks
Programming craft is taught on toy/mock inputs; real sources appear only by reference.
- 02: a real public **sshd log** (Loghub / SecRepo) instead of an invented one.
- 03: a real **EVTX/alert** sample.
- 04/09: an optional **live abuse.ch URLhaus/Feodo or AbuseIPDB** lookup gated behind a key,
  with the mock as the offline fallback.

### 6. Lighter touches
- **02-defensive:** add one named breach per phase (it leans on techniques/datasets; a named
  incident would lift it from "strong technique" to "gold standard"). It has **no named breach
  anywhere** and only one CVE (Log4Shell, the exemplar — module 17).
- **07-endpoint-hardening:** add a named breach motivator per module (it has **zero named
  incidents** — grounding is all benchmarks/ATT&CK/KEV/tool output).
- **01-offensive:** module **01-recon** references CVEs only by vendor category ("FortiGate
  CVE") — pull the real IDs (module 03 already names them); promote **PwnKit CVE-2021-4034**
  (10) and **PrintNightmare** (11) from Stretch into the core privesc labs.
- **10-scripting (foundations):** the one soft spot in an otherwise gold track — anchor it to a
  specific named campaign rather than generic CISA-advisory framing.

---

## Per-track detail

### 00-foundations — 🟢 Gold standard (11 Strong / 1 Moderate)
Nearly every module is a principle-by-principle autopsy of a named breach with primary sources,
driving the teaching (not in Further reading). Labs reinforce with real CVEs, ATT&CK IDs, the
CISA KEV feed, and EVTX-ATTACK-SAMPLES. No unbacked fiction.

| Module | Anchor | Type | Rating |
|---|---|---|---|
| 01-security-principles | Equifax 2017 (GAO-18-559 + House Oversight); CVE-2017-5638 | Breach+CVE | Strong |
| 02-lab-setup | WannaCry 2017; VENOM CVE-2015-3456 | Breach+CVE | Strong |
| 03-docker | 2018 exposed-Docker-daemon cryptojacking wave (Unit 42/Aqua) | Campaign | Strong |
| 04-linux | Mirai 2016 (source code + Krebs); T1110 | Breach+ATT&CK | Strong |
| 05-windows | Emotet (S0367, CISA AA20-280A); EVTX-ATTACK-SAMPLES | ATT&CK | Strong |
| 06-networking | SUNBURST 2020 (Mandiant; DGA); RFC 9293 | Breach+Std | Strong |
| 07-web-http | Firesheep 2010 (Butler + Wired) | Breach | Strong |
| 08-data-encoding | CISA AA25-141B (LummaC2/ClickFix); KEV JSON + real access logs | Campaign+Dataset | Strong |
| 09-cryptography | Adobe 2013 (153M; 3DES-ECB, no salt) | Breach | Strong |
| 10-scripting | CISA advisories (generic); T1110 | ATT&CK | **Moderate** |
| 11-version-control | Toyota 2022 (T-Connect key in public GitHub) | Breach | Strong |
| 12-threat-modeling | Target 2013 (Senate "Kill Chain"; Fazio pivot) | Breach | Strong |

### 01-offensive — 🟡 Strong technique, generic where methodology (6 Strong / 11 Moderate)
"Meridian Financial" frames every lab; backed by real CVEs/targets where exploitation is
concrete (03/04/08/16), generic at tactic level where the topic is methodology (01/05/12/13).

| Module | Anchor | Type | Rating |
|---|---|---|---|
| 03-vuln-id | Log4Shell + Rapid Reset + FortiGate + Confluence CVEs; KEV/EPSS | CVE | Strong |
| 04-exploitation | CVE-2021-41773/42013 (Apache path-traversal RCE) | CVE | Strong |
| 08-web-ssrf-xxe | Capital One 2019; IMDSv1→v2 | Breach | Strong |
| 15-powershell-tradecraft | T1059.001; Invoke-Obfuscation; 4104 | ATT&CK | Strong |
| 16-cloud-primer | flaws.cloud, CloudGoat+Pacu; Capital One/IMDS | Dataset | Strong |
| 17-reporting | PTES; real public pentest reports (Cure53) | Std | Strong |
| 01-recon … 02 … 05 … 06 … 07 … 09 … 10 … 11 … 12 … 13 … 14 | tactic-level ATT&CK + real tools; CVEs by category, named CVEs in Stretch only | ATT&CK | Moderate |

### 02-defensive — 🟡 Strong technique/dataset, no named breach (12 Strong / 5 Moderate)
Every module ties to specific ATT&CK IDs and/or named OSS tools; labs point to real public
datasets (Malware-Traffic-Analysis.net, EVTX-ATTACK-SAMPLES, Atomic Red Team, abuse.ch). **No
named breach anywhere**; only CVE is Log4Shell (module 17, the exemplar). Meridian = synthetic
estate over real techniques.

Strong: 02, 04, 05, 08, 09, 10, 11, 12, 13, 14, 15, 17 · Moderate: 01, 03, 06, 07, 16.

### 03-forensics — 🔴 Systemic gap (0 Strong / 9 Moderate / 5 Weak)
All 14 modules run on synthetic "Meridian" data. Real public datasets (EVTX-ATTACK-SAMPLES,
MemLabs, MTA.net) are named but only in Learn/Stretch — never the committed seed. No CVE/breach.
Standards (NIST 800-61/800-86, RFC 3227) lift several to Moderate. Weakest: 05, 07, 08, 11, 12.

### 04-malware — 🔴 Systemic gap (0 Strong / 13 Moderate)
Excellent ATT&CK-ID and tool grounding (capa, YARA, radare2, UPX), but **no real malware
family / sample / hash / CVE is ever the analyzed artifact** — all benign synthetic stand-ins
("loader.exe", "meridian-loader.bin"). Real families/datasets named only in Learn. The genre
most needs real samples.

### 05-cloud — 🟢 Gold standard (17 Strong)
De-fictionalization fully holds (zero Meridian). Every module opens on a named real breach/CVE/
research catalogue with primary sources (DOJ/Senate/SEC/CISA/vendor), ATT&CK IDs threaded
through. **This is the model for the rest of the curriculum.**

| Module | Anchor (abbrev.) |
|---|---|
| 01 Capital One · 02 Code Spaces + Golden SAML · 03 Rhino 21-Methods · 04 2017-19 Mongo/ES exposure wave · 05 2017 S3 wave (Verizon/Accenture/…) · 06 CVE-2025-13357 (Vault TF provider) · 07 Uber 2016 (FTC/DOJ) · 08 SolarWinds · 09 Denonia 2022 · 10 docker123321 + Codecov · 11 CVE-2019-5736 (Vulhub) · 12 Tesla cryptojacking 2018 · 13 Graboid 2019 · 14 LastPass 2022 + Scattered Spider · 15 Capital One + LastPass · 16 LastPass two-incident chain · 17 Capital One (KMS) | all Strong |

### 06-active-directory — 🟡 Strong technique, missing CVEs (8 Strong / 3 Moderate)
Named techniques (Kerberoasting, DCSync, RBCD) tied to specific ATT&CK sub-technique IDs + seminal
research (adsecurity.org, Elad Shamir). Built on fictional meridian.local. **Gap: almost no real
CVEs by ID** (Zerologon/PetitPotam/noPac/PrintNightmare); breach mention is one passing line
(NotPetya/SolarWinds in module 04). Strong: 02–09 · Moderate: 01, 10, 11.

### 07-endpoint-hardening — 🟡 Strong standards/tools, no breach (9 Strong / 2 Moderate)
Consistently grounded in named CIS Benchmarks (Windows 11, Ubuntu 22.04), ATT&CK IDs, CISA KEV,
real tool output (Lynis, OpenSCAP, osquery, grype, AIDE). **No named real breach anywhere.**
Strong: 01, 02, 03, 05, 07, 08, 09, 10, 11 · Moderate: 04, 06.

### 08-cryptography — 🔴 Systemic gap (0 Strong / 10 Moderate)
RFCs cited with specific sections; real tools (testssl.sh, gitleaks, Vault). But the canonical
named crypto breaks — **Heartbleed, DROWN, ROCA, Debian OpenSSL, Flame, DigiNotar, POODLE,
LinkedIn/Adobe** — appear *nowhere*; labs are all fictional Meridian, not real CVE/Vulhub. The
two real incidents present (Bleichenbacher, Sony PS3 ECDSA) are in passing/Stretch.

### 09-python-for-security — 🔴 Systemic gap (0 Strong / 4 Moderate / 6 Weak)
Programming craft taught on synthetic "Meridian" logs and mock VT/MISP/AbuseIPDB APIs. Real
sources named only by *interface* (API shapes, MISP object model, ATT&CK, TLP) — never consumed
as live data. Moderate (mock real-API shape): 04, 05, 08, 09 · Weak (toy input): 01, 02, 03,
06, 07, 10.

### 10-automation — 🟢 Gold standard (9 Strong / 3 Moderate)
Nearly every module anchored to a named incident/CVE with primary sources, woven through prose
and lab: Knight Capital (SEC order), SCARLETEEL, 2017 S3 wave, CISA AA23-278A, Codecov,
SolarWinds, Target ("Kill Chain"), tj-actions CVE-2025-30066, CircleCI 2023. Moderate: 06, 07,
11-clickops (method/pattern-anchored, no incident).

### 11-ztna — 🟢 Strong (9 Strong / 3 Moderate)
9/12 anchored to named breaches (Colonial Pipeline, Storm-0558, LastPass, NotPetya/Maersk) or
CVEs by ID (CVE-2020-5741, CVE-2017-0144 EternalBlue, CVE-2026-40575 OAuth2 Proxy); NIST
SP 800-207 cited section-specifically. **Only real fiction-without-backing: 10-workload-identity-mtls**
(Meridian, no incident). Moderate: 04 (ADR module), 08 (no breach/CVE), 10-workload-identity.

### 12-ai-augmented-ops — 🟢 Strong (6 Strong / 5 Moderate)
Named incidents/CVEs/legal cases correctly cited: Moffatt v. Air Canada (2024 BCCRT 149),
Knight Capital + SEC order, EchoLeak CVE-2025-32711, Chevy $1 Tahoe, Invariant Labs tool-poisoning.
Strong: 01, 03, 05, 08, 09, 10. Build/eval modules (02, 04, 06, 07, 11) are honestly
method-anchored (OWASP LLM Top 10, RAGAS, garak, MITRE ATLAS) with synthetic SOC seed data.

---

## Appendix — rating rubric

- **Strong** — a specific, named, real artifact (breach w/ year + primary source, CVE by ID,
  named public dataset, or specific ATT&CK technique ID tied to a real campaign) anchors the
  module's teaching *and/or* lab and is woven through — not merely in Further reading.
- **Moderate** — real artifacts present but used generically (e.g. "ATT&CK" / "a real tool"
  with no specific named incident/technique/dataset), *or* a real anchor appears only in Learn /
  Further reading / passing mention rather than driving the module.
- **Weak** — invented/toy scenario, a hypothetical company with no real incident behind it, or
  no real-world anchor at all.
