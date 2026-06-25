# Audit — Track 03 Forensics (READ-ONLY)

**Verdict:** Prose is excellent and uniform across all 16 modules (Type tags, anatomy, original bridge prose, time-boxed Learn with why-lines, real-world anchors, `*Last reviewed*` all present). The blocker is the **lab environment in `plaintext-labs/forensics/` is stale**: the published prose `lab.md` files in `tracks/` have been de-Meridianed and point at real datasets, but the labs repo still ships synthetic Meridian data, stale rules/titles, and (15/16) no env at all — a systemic prose↔lab divergence and a real-artifact gap (L5/L6).

## Per-module findings

- **01-forensic-fundamentals** — [POLISH] L7: Learn link "FBI — Digital Evidence Collection & Handling Guide" points to generic `/services/information-management` landing page, not a specific guide ("see sections" unscoped).
- **02-acquisition-imaging** — [POLISH] P4: Ch.15 "Applied Network Security Monitoring" is an Amazon paywalled link gated on "if available"; L5: lab images a synthetic 1MB device (acceptable for dc3dd mechanics, but not a real M57 image the README anchors on).
- **03-file-systems-carving** — [CONSISTENCY] L5: README anchors M57-Patents real images; lab ships a synthetic `disk.img` (FAT32 toy) — README itself flags FAT32 image as lab-only, mild tension.
- **04-windows-artifacts** — [BLOCKER] L5/L6: README promises "lab bundles a small slice of EVTX-ATTACK-SAMPLES" + real `.evtx`/`.dat`; labs repo ships only synthetic pre-shaped `security-events.jsonl` + `ntuser-parsed.json` (Meridian fiction). Labs `lab.md` references `data/security.evtx`/`data/ntuser.dat` that don't exist in `data/`.
- **05-browser-app-artifacts** — [CONSISTENCY] L5: ships a `data/History` SQLite (synthetic Meridian profile); README anchors Nitroba (real, PCAP) — acceptable stand-in but synthetic; labs `lab.md` still carries Meridian framing.
- **06-memory-forensics** — [BLOCKER] L5/L6: README/Type promise Volatility3 on a real image (MemLabs anchor); labs ship synthetic pre-processed `memory-sample.json` (Meridian), demo never runs Volatility3 — real tool not exercised on real (or any) memory image.
- **07-timeline-analysis** — [CONSISTENCY] L5: labs ship synthetic `timeline.csv`/`artifacts` (4× Meridian in labs `lab.md`); plaso not run on real artifacts; README anchors real DFIR Report timeline.
- **08-triage-live-response** — [CONSISTENCY] L5/L6: README/Type say "stand up Velociraptor server+agent in Docker via VQL"; labs ship static `pslist.json`/`netstat.json`/`recent_files.json` (synthetic), no live Velociraptor exercise against them as promised.
- **09-network-forensics** — [BLOCKER] L5/L6: prose `lab.md` retitled "Real Infection Capture" + anchors Malware-Traffic-Analysis.net; labs `lab.md` still titled "Meridian Capture" and `make pcap` *generates* a synthetic `capture.pcap` (invented C2 `update-cdn82.net`) — no real MTA PCAP, prose↔lab title/content divergence.
- **10-log-cloud-forensics** — [CONSISTENCY] L5: EVTX dir + `cloudtrail` are synthetic/"simulated" (README itself says "simulated AWS CloudTrail"); real Hayabusa/Chainsaw could run on real EVTX-ATTACK-SAMPLES but lab uses pre-canned `*_summary.txt`.
- **11-anti-forensics** — [CONSISTENCY] L4/L5: `data/` is only `disk.img.README` (no committed image — generated at `make up`); 0 Meridian (clean framing). Verify image actually builds; otherwise clean.
- **12-malware-artifacts-ir** — [BLOCKER] L5/L6: prose `lab.md` is current (benign PEs + `make fetch-data` real Latrodectus from MalwareBazaar + `rules/latrodectus_loader.yar` + auth note); labs repo is STALE — empty `data/samples/`, `rules/meridian.yar` only, `hypothetical_capa_output.txt`, no `fetch-data` target. Heaviest staleness (8× Meridian in labs lab.md). README Type promises Latrodectus YARA; labs env can't deliver it.
- **13-ir-process** — [CONSISTENCY] L5: demo-only (no env, fine for a mapping exercise); labs data is `meridian-incident-brief.md`/`meridian-timeline.csv` (8× Meridian) — synthetic narrative; README anchors real DFIR Report (acceptable as analysis input but invented).
- **14-reporting-root-cause** — [CONSISTENCY] L5: demo-only; `meridian-findings.md`/`report-template.md` (6× Meridian) synthetic raw findings — acceptable for a writing exercise but tied to invented incident vs README's DFIR-Report model.
- **15-forensic-eval-harness** — [BLOCKER] L4: no `plaintext-labs/forensics/15` dir exists; prose `lab.md` self-declares "**Docker environment to be built and validated**" — lab is a stub per Definition of Done.
- **16-reviewing-ai-summaries** — [BLOCKER] L4: no `plaintext-labs/forensics/16` dir; prose `lab.md` self-declares "**to be built and validated**" — stub.

## Counts
- Modules audited: 16 prose + 14 lab envs (+capstone).
- READMEs: 16/16 clean on P1–P7 (Type tags, anatomy, original core idea, grouped/time-boxed Learn, anchors, `*Last reviewed*`). One minor P4/L7 nit (01 FBI link, 02 Amazon-gated link).
- BLOCKER: 6 (04, 06, 09, 12 stale/synthetic labs vs real-data README promise; 15, 16 missing labs).
- CONSISTENCY: 7 (03, 05, 07, 08, 10, 13, 14 — synthetic Meridian data, prose↔lab divergence).
- POLISH: 2 (01, 02 link nits). Clean: 11.

## Top-3 fixes
1. **Retrofit `plaintext-labs/forensics/` to match the de-Meridianed prose** — the labs repo lags the published `tracks/` lab.md. Highest priority: 12 (ship benign PEs + `make fetch-data` Latrodectus + `latrodectus_loader.yar`, delete `meridian.yar`/`hypothetical_capa_output.txt`); 09 (retitle, wire a real MTA PCAP instead of generating a synthetic one); 04 & 06 (ship/point at real EVTX-ATTACK-SAMPLES and a MemLabs image, run the actual tool — chainsaw/Volatility3 — not pre-parsed JSON).
2. **Build the two missing lab envs (15, 16)** — both prose modules self-flag "Docker environment to be built and validated"; per Definition of Done these are stubs until `make up && make demo` is green.
3. **Reconcile L6 prose↔lab promises for analysis labs (08, 10, 13)** — where the README/Type tag says "stand up Velociraptor / run Hayabusa-Chainsaw / map a real case," ensure the lab actually exercises the live tool on real (or clearly-labeled real-derived) artifacts rather than shipping pre-canned synthetic output.
