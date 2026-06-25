# Audit — 06-active-directory

**Verdict:** NOT DONE. READMEs (prose) are strong and de-Meridianed throughout; the **`plaintext-labs` companion repo is broadly stale** — most lab envs are still Meridian and several promised builds (08, 10, 11, 12, 13) are missing/print-only, so prose has drifted ahead of validated labs.

## Per-module findings

- **01-ad-windows-model:** [CONSISTENCY] plaintext-labs/01 env fully Meridian (Makefile echoes MERIDIAN.LOCAL, `data/meridian-domain.md`, labs lab.md titled "Map the Meridian Domain") while prose references `data/corp-domain.md` — referenced file doesn't exist. [POLISH] conceptual lab only (no compose; `make demo` echo).
- **02-enumeration:** [CONSISTENCY] plaintext-labs/02 env Meridian (`dc01.meridian.local`, `bloodhound-meridian.json`, `meridian-domain.md`) vs prose `dc01.corp.local`/`bloodhound-corp.json` — names don't resolve. [POLISH] README AI section typo "hallibate" → "hallucinate".
- **03-kerberos-attacks:** [CONSISTENCY] prose lab promises live AS-REP/TGS-REP + `data/wordlist.txt` but env still ships static `data/hashes.txt`, no `wordlist.txt`; labs lab.md still Meridian. L5 fixtures, not live-as-advertised.
- **04-credential-theft:** [CONSISTENCY] plaintext-labs/04 fully Meridian (compose `MERIDIAN.LOCAL`, `plaintext/meridian-dc`, `meridian-dc`, pw `M3rid1an@Admin!`). [POLISH] `data/` empty though lab/README reference `data/corp-domain.md`.
- **05-acl-delegation-abuse:** [CONSISTENCY] env (Makefile/compose/`acl-findings.json`/labs lab.md) still MERIDIAN.LOCAL vs prose CORP.LOCAL. [POLISH] hybrid artifacts (JSON fixture + live DC) — acceptable, note it. README clean (CVE-2021-36942 PetitPotam/ESC8, noPac).
- **06-lateral-movement:** [BLOCKER] L5: workstations are Linux Samba SMB containers — cannot emit real Windows events (7045/4688/4624); demo hardcodes signing summary and prints PTH cmds instead of running them, so the core "observe distinct Windows event profiles" promise isn't executable. [CONSISTENCY] Corp↔Meridian split across env.
- **07-persistence-ad:** [BLOCKER] L4/L5: `data/` empty, no `demo/` scripts; Makefile `demo` only echoes golden/silver/DCSync cmds (silver/DCSync never executed) — not a validated build. [CONSISTENCY] tracks Corp ↔ labs Meridian. README clean (T1558.001/.002, T1003.006, rotate-krbtgt-twice).
- **08-path-to-da:** [BLOCKER] L4: lab promises `make up`+`make collect` (bloodhound-python live) but **no docker-compose.yml, no up/collect targets** — only `demo` printing static JSON; live-graph step impossible. [CONSISTENCY] fixture `bloodhound-attack-paths.json` + path-analyzer.py are MERIDIAN.LOCAL.
- **09-detecting-ad-attacks:** [POLISH] README Learn has an empty `**Honeytokens**` subsection (bold header, no links/why-line). Otherwise clean — lab env real & validated (fetch-data pulls real EVTX-ATTACK-SAMPLES, eval/gate regression scripts + held-out corpus), fully de-Meridianed. Best module in track.
- **10-hardening-ad:** [BLOCKER] lab step 7 + Automate require `posture-audit.py` + live `samba-tool` AS-REP re-walk, but env ships no `posture-audit.py` and Makefile has only `demo` (ACL audit) — "apply to live DC, prove attack dead" half unbuilt. [CONSISTENCY] env still "Meridian Financial" (`ad-hardening.yml`, `hardening-checklist.md` columns).
- **11-defending-identity:** [BLOCKER] lab promises `make up`/`compliance`/`corroborate`, live DC, `tier-compliance-check.py` — none exist; lab dir is print-only `demo`. [CONSISTENCY] that demo Makefile still "Meridian Financial".
- **12-brownfield-tiering:** [BLOCKER] **No plaintext-labs directory exists at all.** lab.md references many make targets/scripts/data + DC + VALIDATION.md — nothing shipped. README strong & de-Meridianed; lab is a stub.
- **13-posture-drift:** [BLOCKER] **No plaintext-labs directory exists at all.** lab.md references `drift-detect.py`, `bin/drift-introduce.sh`, `data/baseline.json`, DC — none shipped. README strong & de-Meridianed; lab is a stub.
- **capstone:** clean — scaffold present (brief + acceptance criteria, rubric.md, gitignored submission/), de-Meridianed (GOAD/local eval domain).

## Counts

- **[BLOCKER]:** 7 (06, 07, 08, 10, 11, 12, 13)
- **[CONSISTENCY]:** 10 (01, 02, 03, 04, 05, 06, 07, 08, 10, 11)
- **[POLISH]:** 5 (01, 02, 04, 05, 09)
- Clean: 09 (README, minus 1 polish), capstone
- README prose quality across all 13: strong, de-Meridianed, full anatomy/anchors. Defects are nearly all on the labs (env) side.

## Top-3 fixes

1. **Build the 5 missing/incomplete lab envs (BLOCKERS):** 12 & 13 have NO directory; 08, 10, 11 are print-only `demo` Makefiles missing the promised `up`/`collect`/`compliance`/`corroborate` targets, scripts, and DC. Build + run `make up && make demo` to validate, or downscope the lab.md promises.
2. **De-Meridian the entire `plaintext-labs/active-directory/` tree:** Makefiles, docker-compose, Dockerfiles, seed `*.md`, BloodHound/findings JSON, and the stale labs-side `lab.md` copies all still say MERIDIAN.LOCAL/"Meridian Financial" — rename to corp.local/CORP.LOCAL so prose references (`corp-domain.md`, `bloodhound-corp.json`, `dc01.corp.local`) resolve.
3. **Fix module 06's artifact realism (BLOCKER):** Linux Samba containers can't emit real Windows event IDs (7045/4688/4624) the lab is built around — either supply real EVTX samples (like module 09 does) or rewrite the lab to not claim live Windows-event observation. Then ship the live-hash flow promised in 03 and the executed (not echoed) forge/DCSync steps in 07.
