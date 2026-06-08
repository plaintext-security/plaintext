# Plaintext — Lab Validation Backlog & Session Prompt

> **How to use this:** paste the "Session prompt" block below into a fresh Claude / Claude Code
> session (mobile or desktop) to continue the work. The checklist further down is the live tracker —
> tick a box when a lab is built **and** validated. Keep this file updated as the source of truth for
> "what's left."

---

## Session prompt (paste this)

You are continuing work on **Plaintext**, an open security-education curriculum (the "SANS, but free"
project). Two repos, both in the `plaintext-security` GitHub org and cloned side-by-side locally:

- `plaintext/` — the curriculum **prose** (Markdown under `tracks/`), published via Material for MkDocs.
- `plaintext-labs/` — the **runnable** labs (Docker, seed data, harnesses), laid out `<track>/<NN-module>/`.

**Read first, every session:** `plaintext/CLAUDE.md` and `plaintext/CONTRIBUTING.md` — they are the
charter (the hybrid module model, the lab-target rule, and the definition of done). Follow them exactly.

**Your job:** backfill **validated lab environments** for existing modules. A module is NOT done until
its lab is built in `plaintext-labs` (a custom build or a wrapped known image) AND you have actually run
`make up` / `make demo` and seen it work. A `lab.md` that only references an external target or an
untested `docker run` line is a stub — that is the gap we are closing.

**Per-lab recipe (one lab at a time):**
1. Read the module's `plaintext/tracks/<track>/modules/<NN-module>/{README.md,lab.md}` for intent.
2. Pick the target per the charter's lab-target rule, in order: **wrap a known vulnerable image**
   (Vulhub / Juice Shop / DVWA / CloudGoat — prefer this) → **point at an external target** (PortSwigger,
   flaws.cloud) only if hosting adds nothing → **build a custom minimal target** only if it teaches the
   mechanism better. Real CVEs/datasets beat invented ones.
3. Build `plaintext-labs/<track>/<NN-module>/` with: `docker-compose.yml`, a `Makefile`
   (`up`/`down`/`reset`/`demo`[/`shell`]), small **committed** seed data in `data/`, and any
   Dockerfile/harness. Pin image tags and tool versions.
4. **Validate:** `make up && make demo && make down` — actually run it, debug until it works. A demo
   should deterministically show the lesson and exit cleanly.
5. Repoint `plaintext/tracks/.../<NN-module>/lab.md` Setup to `git clone … && cd <track>/<module> &&
   make up`; keep the real production tool as the learner's build target where relevant.
6. Verify prose still builds: in `plaintext/`, `mkdocs build --strict` (use the local `.venv`).
7. Commit: push the lab to `plaintext-labs` (`main`); commit the `lab.md` repoint to `plaintext` on a
   track branch (`feat/<track>-labs`) and open a PR. Never commit secrets or heavy artifacts
   (`*.pcap`, dumps, keys) — `.gitignore` covers them; only small curated seed data is committed.

**Guardrails:** OSS-first; every offensive lab keeps the authorization note (own/authorised targets,
intentionally-vulnerable only); ground labs in the fictional **Meridian Financial** estate where it
fits; don't claim a lab works unless you ran it.

**Work the checklist below in order (defensive → offensive → foundations). Tick each box only after
`make demo` passed. Then report which labs you completed and what's next.**

---

## Status (as of this handoff)

- **Prose:** all 43 existing modules have the `## The core idea` bridge (foundations 12, offensive 16,
  defensive 15). Merged to `main` (PRs #4, #6, #7, #8).
- **Labs built & validated: 3 / 43** — `defensive/08-detection-as-code`, `offensive/06-web-injection`,
  `defensive/07-log-parsing`.
- **Open PR:** #9 (charter "labs-validated = done" + the 07-log-parsing backfill).
- **Empty stub tracks (no modules yet):** 03-forensics, 04-malware, 05-cloud, 06-active-directory,
  07-endpoint-hardening, 08-cryptography, 09-python-for-security, 10-automation, 11-ztna,
  12-ai-augmented-ops — these need modules **authored from scratch** (prose + labs together), a separate
  larger effort to plan track-by-track.

---

## Lab backfill checklist (build + validate)

### Defensive (`02-defensive`) — 2/15 done
- [x] 07-log-parsing — *stdlib parse-rate harness over a messy sshd sample*
- [x] 08-detection-as-code — *sigma-cli + teaching matcher*
- [x] 01-telemetry — *suggest: ship a small log set + a shipper (fluent-bit/vector) to a file/stdout*
- [x] 02-endpoint-telemetry — *bundle Sysmon-shaped EVTX/JSON; read key Event IDs*
- [x] 03-linux-telemetry — *osquery querying the container; auditd rules (deterministic query demo)*
- [x] 04-network-monitoring — *Zeek over a bundled/generated small pcap → read conn/dns/http logs*
- [x] 05-intrusion-detection — *Suricata + ET open rules over a sample pcap → alerts*
- [x] 06-siem — *wrap the Wazuh image (heavy — verify it comes up) or a lighter OpenSearch+sample*
- [x] 09-detection-testing — *Atomic Red Team test + confirm the module-08 Sigma rule fires*
- [x] 10-attack-coverage — *ATT&CK Navigator layer from a rule set (likely a script + sample rules)*
- [x] 11-hunting-endpoint — *Velociraptor/osquery hunt over bundled endpoint data*
- [x] 12-hunting-network — *RITA over Zeek logs from a beaconing sample → find the beacon*
- [x] 13-triage-ir — *TheHive (wrap image) or a guided triage over a bundled alert + observables*
- [x] 14-threat-intel — *MISP (wrap image) or a script ingesting a sample abuse.ch feed*
- [x] 15-soar — *Shuffle (wrap image) or a small playbook: trigger→enrich→decide with a human gate*

### Offensive (`01-offensive`) — 1/16 done
- [x] 06-web-injection — *custom vulnerable Flask app; UNION-extract demo*
- [x] 01-recon — *passive recon harness over a target you own; script the asset inventory*
- [x] 02-scanning — *nmap against a bundled target container (compose: scanner + victim)*
- [x] 03-vuln-id — *searchsploit/nuclei against a known-version service container*
- [x] 04-exploitation — **wrap a Vulhub real-CVE target** (charter: real CVE, not a toy) + Metasploit
- [x] 05-memory-corruption — *tiny vulnerable C binary + gdb; demonstrate EIP control (NX/ASLR off)*
- [x] 07-web-access-control — *vulnerable app with IDOR/role flaws (extend the 06 app or Juice Shop)*
- [x] 08-web-ssrf-xxe — *app with SSRF to a mock metadata endpoint (compose: app + fake-metadata)*
- [x] 09-password-attacks — *hashcat/john over a bundled hash set (fast vs slow KDF contrast)*
- [x] 10-privesc-linux — *container/VM with a SUID/sudo/cron misconfig; linpeas → root*
- [x] 11-privesc-windows — *(needs Windows — likely a documented VM, not a container; validate the path)*
- [x] 12-pivoting — *compose: attacker + dual-homed pivot host + hidden internal target; ligolo/chisel*
- [x] 13-c2-postex — *custom Flask C2 server + implant + operator in compose; task/result/beacon cycle*
- [x] 14-lolbins-evasion — *Linux LOLBin demo container (download/exec/persist via native binaries)*
- [x] 15-cloud-primer — *flaws.cloud (external, validated) + CloudGoat setup + Pacu quick ref*
- [x] 16-reporting — *no container: validate.py checks 11/11 structural elements + public report refs*

### Foundations (`00-foundations`) — 0/12 done
- [ ] 02-lab-setup — *the lab harness itself; validate VM/container isolation guidance + a compose*
- [ ] 03-docker — *hands-on container build/inspect; an intentionally over-privileged example to fix*
- [ ] 04-linux — *a Linux box (container) with files/users/logs to investigate*
- [ ] 05-windows — *(Windows — documented VM / TryHackMe; validate the path, not a container)*
- [ ] 06-networking — *capture + dissect a generated exchange (tcpdump in a compose) → read it*
- [ ] 07-web-http — *a small HTTP server to craft requests against with curl*
- [ ] 08-data-encoding — *CyberChef is hosted; ship sample blobs + a decode harness to validate*
- [ ] 09-cryptography — *openssl exercises over bundled material (hash/sign/verify), deterministic*
- [ ] 10-scripting — *a parsing task + sample data; the learner's script is the artifact*
- [ ] 11-version-control — *a repo scenario (a planted secret in history to find/rotate)*
- [ ] 01-security-principles — *design/paper exercise — likely NO container; validate the exercise is sound*
- [ ] 12-threat-modeling — *design/paper exercise (STRIDE on a data flow) — likely NO container*

> For the "design/paper" modules, "validated" means the exercise is concrete and doable as written —
> not a forced container. Say so in `lab.md` rather than inventing a hollow environment.

---

## Other backlog (not lab-validation)

- [ ] **Link-validation sweep** — every `Learn`/Further-reading link across the 43 modules must resolve
  to the specific, current resource (no invented YouTube IDs). Not yet done.
- [ ] **README track table is stale** — lists 6 tracks; 12 exist. Fix it.
- [ ] **Author the 9 stub tracks** from scratch (prose + labs together), track-by-track, full modules.
  Likely order: cloud / forensics / malware first (flagship-adjacent).
