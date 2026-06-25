# Audit — Track 09: Python for Security

**Verdict:** Strong, consistent conversion — prose/labs/envs all present and well-built; the dominant gap is **lab validation: ~8 of 11 labs carry a self-declared "validation deferred — `make demo` not re-run on a clean Linux runner" banner**, so by Definition of done those labs are not yet "done." Plus a stale track README (lists 10 modules, but 11 exist).

## Findings (one line per item; "clean" = no findings)

- **Track README** — [CONSISTENCY] Module table lists only 10 modules (01–10); module 11 (Eval Harness) missing from table, "What you'll learn" and phases ("ten modules", Phase 3 = "08–10"). README↔nav↔dir drift. [POLISH] Capstone exists in labs (`capstone/` with rubric) but track README has no separate capstone lab link to its README; only the scaffold dir link.
- **P5 (BASELINE/DELUXE)** — N/A track-wide: BASELINE/DELUXE markers are used **nowhere** in the curriculum (grep = 0 hits across `tracks/`); not a convention here, so not a defect.
- **01-setup-idioms** — [BLOCKER] Learn section has an empty subsection: "**Security idioms (~30 min)**" header with **zero links** beneath it (~30 min budgeted, nothing cited) — P4/P7 defect. [CONSISTENCY] No "validation deferred" banner, but `.ci-demo` absent (as are all modules); lab env complete.
- **02-files-regex-parsing** — [CONSISTENCY] Lab carries "real-data rewire — validation deferred" banner (loghub OpenSSH corpus swapped in, `make demo` not re-run on clean runner). Env + PROVENANCE.txt present; real loghub anchor (P6) good.
- **03-structured-data-reporting** — [CONSISTENCY] "real-data rewire — validation deferred" banner (Suricata eve.json from WRCCDC-2018 PCAP); env present. README "The core idea" mentions `rich` as stdlib in objective line ("from the standard library and one lightweight third-party formatter" — `rich` is third-party, slightly muddled but lab is correct). Real anchor good.
- **04-http-apis-enrichment** — [CONSISTENCY] "real-feed rewire — validation deferred" banner; real abuse.ch Feodo+URLhaus feeds in `feeds/db.json` with provenance (P6/L5 strong). Env (mock-api + feeds) present. Otherwise clean.
- **05-building-cli-tools** — [CONSISTENCY] "real-feed rewire — validation deferred" banner (shared module-04 feed sidecar); env present. Clean otherwise; strong README↔lab continuity (wraps module-04 enrich fn).
- **06-network-programming** — [CONSISTENCY] "real-target rewire — validation deferred" banner (now Vulhub Solr 8.11/Log4Shell image vs echo server). [POLISH] Lab dir has no `data/` (none needed). Auth note present (L2). Real CVE anchor good.
- **07-automating-the-web** — [CONSISTENCY] "real-target rewire — validation deferred" banner (now OWASP Juice Shop vs hand-rolled Flask). Auth note present (L2). Env present (no data dir needed). Real anchor good.
- **08-driving-security-tools** — [CONSISTENCY] "real-feed rewire — validation deferred" banner (VT-shaped API now real abuse.ch; MISP stays local mock). Env (mock-misp + mock-vt + feeds) present. Auth note present. Clean otherwise.
- **09-building-mcp-server** — [CONSISTENCY] "real-feed rewire — validation deferred" banner (shared module-04 feed). Env (mock-api + server.py + test_call.py) present. Strong red-team/untrusted-arg framing. Clean otherwise.
- **10-packaging-testing** — clean. No validation banner; env present (`data/ai_generated.py` flawed script). Strong adversarial-review framing. [POLISH] "Connects forward" references "Track 10 modules 02-04 / module 10" — cross-track ref reads slightly off (this is Track 09) but is pointing at the Automation track; verify the link target.
- **11-eval-harness** — [CONSISTENCY] "real-data rewire — validation deferred" banner; env most complete in track (eval.py, scripts/parser_good+regressed, corpus+labels, tests, VALIDATION.md present). Excellent core-idea prose. Missing from track README table (see Track README finding).
- **capstone** — clean: `capstone/` has Makefile, README.md, rubric.md, submission/. Rubric in track README is thorough and real-data-mandated.

## Counts
- Modules audited: 11 + capstone
- [BLOCKER]: 1 (module 01 empty "Security idioms" Learn subsection)
- [CONSISTENCY]: ~10 (8 unvalidated lab banners + stale track README table + minor cross-refs)
- [POLISH]: ~4
- Clean modules: 2 (10, capstone) — plus all envs/Makefiles present (11/11), real-data anchors strong, type tags present (11/11), auth notes present where labs attack (06/07/08).

## Top-3 fixes
1. **Run `make up && make demo && make down` on a clean Linux runner for the ~8 labs carrying "validation deferred" banners (02,03,04,05,06,07,08,09,11), then remove the banners** — these labs are not "done" per CLAUDE.md until validated; add `.ci-demo` to any that pass cleanly.
2. **Module 01: fill the empty "Security idioms (~30 min)" Learn subsection** with real links (OWASP Secure Coding / Python security idioms) or delete the header — it currently budgets 30 min against nothing.
3. **Update the track README** to include module 11 (Eval Harness) in the module table, the "What you'll learn" list, and the phase descriptions (currently "ten modules"; reflect 11 + the capstone link).
