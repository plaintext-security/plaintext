# 01-offensive — conversion/quality audit

**Verdict:** Structurally solid — all 17 READMEs carry Type tag, full anatomy, *Last reviewed*, module-meta block, original multi-para core ideas, and real-world anchors. But the whole track is BASELINE except 06 (lone DELUXE exemplar), and **two labs have prose↔env BLOCKER mismatches** (02 Vulhub, 12 chisel) where the shipped environment does not deliver what the lab promises.

## Per-module findings

- **01-recon** (BASELINE): [POLISH] lab "Connects forward" hardcodes `vpn.example.com`/`jira.example.com` w/ CVE-2024-21762 & CVE-2023-22515 as if in seed data; verify they appear in bundled `data/`.
- **02-scanning** (BASELINE): **[BLOCKER]** lab.md says `make up`/`make target-up` stands up a Vulhub `nginx/CVE-2017-7529` target via `fetch_repo vulhub`, "the lab now centers on the real Vulhub CVE" — but Makefile has **no `target-up` and no Vulhub wiring**; compose builds only the custom `victim/` image. Prose's central named-CVE target does not exist in the built env.
- **03-vuln-id** (BASELINE): [CONSISTENCY] lab "Connects forward" has wrong/self-referential module numbers ("feeds module 03's output into the SIEM (module 06)" — 06 is web-injection). [POLISH] generated `vuln-assessment.md` checked into env dir (should be gitignored).
- **04-exploitation** (BASELINE): [CONSISTENCY] Type tag says "exploit a real **Vulhub** CVE" but env is a custom-built `victim/` Apache 2.4.49 (CVE-2021-41773), not Vulhub — tag overstates (body is self-consistent on the CVE).
- **05-memory-corruption** (BASELINE): [POLISH] lab Setup fenced block shows only `make up` though `demo` exists and is used in Do steps. (Custom minimal target — charter-permitted.)
- **06-web-injection** (DELUXE — exemplar): clean. All admonitions, module-meta, Heartland anchor, `.ci-demo`, full Makefile.
- **07-web-access-control** (BASELINE): clean.
- **08-web-ssrf-xxe** (BASELINE): [CONSISTENCY] README scope "SSRF, XXE & Deserialization" but lab is "Exploit SSRF and XXE" (deserialization undisclosed-dropped). [POLISH] Learn labs ungrouped under one block, no per-group `(~N hrs)`.
- **09-password-attacks** (BASELINE): clean.
- **10-privesc-linux** (BASELINE): clean.
- **11-privesc-windows** (BASELINE): [CONSISTENCY] intentionally partial env — no `make up`/docker (Windows VM required); `make demo` runs `triage.py` on bundled `winpeas_sample.txt` only. Legitimate per VM-allowed rule but deviates from one-command-container shape.
- **12-pivoting** (BASELINE): **[BLOCKER]** lab.md names **chisel** the primary tool, says `make up` "stages it for you" onto both containers, Do step 1 runs `chisel server --reverse`/`client R:socks`; env ships **no chisel binary and no staging** — only `relay.py`/`pivot_demo.py`. Success criterion "reached inventory through a chisel SOCKS tunnel" is not what the env validates; Do steps 2-3 contradict by referencing relay.py as the tunnel. [POLISH] `pivot_demo.py` still says "Meridian Financial" (de-Meridian not applied).
- **13-c2-postex** (BASELINE): [CONSISTENCY] lab Do steps 5-6 still ask Cobalt Strike / malleable-profile questions (leftover from older minimal-HTTP lab) and Automate targets the reference Flask C2, mild tension with the "Sliver is primary" reframing. [POLISH] line-7 tagline sits before module-meta.
- **14-lolbins-evasion** (BASELINE): [POLISH] lab Stretch references "the `certutil` chain from Step 5" but Do list has only steps 1-4 — dangling step reference.
- **15-powershell-tradecraft** (BASELINE, richest): [POLISH] line-6 tagline butts against *Last reviewed* with no blank line.
- **16-cloud-primer** (BASELINE): [CONSISTENCY] no `make up` Docker env (intentional — external flaws.cloud/CloudGoat targets, allowed for cloud); flag as external-only. [POLISH] auth note uses generic "this app is yours — attack it freely" boilerplate, wrong for external cloud targets.
- **17-reporting** (BASELINE): [CONSISTENCY] doc/validator-only env (no Docker; `validate.py` + report template) — appropriate. [POLISH] same generic "this app is yours" auth note, mismatched for a reporting lab (no target attacked).
- **capstone env**: README brief + acceptance table, `rubric.md`, skeleton `submission/`, Makefile is a comment-only stub (no targets, by design for honor-system portfolio scaffold). Clean.

## Counts

- BLOCKER: 2 (02-scanning, 12-pivoting)
- CONSISTENCY: 7 (03, 04, 08, 11, 12, 13, 16, 17 — env/scope/numbering)
- POLISH: ~11 (01, 02-note, 03, 05, 08, 12, 13, 14, 15, 16, 17)
- Tier spread: 16 BASELINE, 1 DELUXE (06). No truncation/dead-link/empty-section defects found.

## Top-3 fixes

1. **Reconcile 02-scanning & 12-pivoting lab.md to their built envs** (BLOCKERs): either restore the Vulhub `target-up` / chisel-staging wiring the prose promises, or rewrite the labs to the custom `victim/`-and-`relay.py` reality. Pick one per lab; today they lie about the env.
2. **Fix the cross-reference / scope drift**: 03 self-referential module numbers; 04's "Vulhub" Type tag vs custom victim; 08's dropped "Deserialization" scope; 13's Cobalt-Strike leftovers vs Sliver reframing.
3. **Sweep papercuts**: replace the copy-pasted "this app is yours — attack it freely" auth boilerplate on 16/17 (and 13/14) with target-appropriate wording; fix 14's dangling "Step 5"; tagline blank-line spacing (13/15); de-Meridian `pivot_demo.py`.
