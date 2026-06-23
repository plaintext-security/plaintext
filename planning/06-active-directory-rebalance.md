# Active Directory track — build-vs-find balance audit & rebalance plan

*Same approach as [`cloud-track-rebalance.md`](cloud-track-rebalance.md) and
[`ztna-track-rebalance.md`](ztna-track-rebalance.md): audited 2026-06-12 against the actual **labs**
(read the real `lab.md` + `Makefile` + `data/` under `plaintext-labs/active-directory/`, not just the
concept objectives). The standing question — "does the lab only **find/attack**, or also **build &
operate a control and prove it**?" — applied module by module to Track 06.*

## TL;DR

AD is an **offense↔defense track by construction**, and it is structurally honest about it: the front
nine (01–08) are deliberately attack/analysis, and the **whole defensive build half is concentrated in
a dedicated back-third (09–11) plus a "close-the-path" capstone** — which is the correct shape for this
domain (cf. cloud 14 being pure-by-design and feeding the detection modules). The attack labs are
therefore **"by design" pure**, not gaps: each one ends in detection notes / event-ID mapping / a
remediation note that explicitly *feeds* 09–11. So the skew is **not** "attack labs never build."

The one real gap is narrower and sits **inside the defensive third**: **module 10 (Hardening AD as
Code) authors the remediation but never *verifies* it.** Its Ansible tasks are `debug`-only ("print
what the real remediation *would* do"), and the posture delta is computed "conceptually" — even though
a live Samba4 DC with the misconfigurations is *right there* and module 05's demo already mutates that
same DC with `samba-tool`. The fix half exists; the "re-scan and prove the attack now fails" half does
not. That's a **deepen-and-verify**, not an add-from-scratch, and it rests on the already-validated env
(cheap). Modules 09 (Sigma + chainsaw + CI) and 11 (tiered-admin design) are sound as-is.

**No new module and no teardown.** Tiering / ESAE / detection — the usual structural holes — are all
*present* (11 is the tiering/ESAE module; 09 is detection). Recommendation: one surgical
deepen-and-verify on 10.

## What "build & operate and prove it" means here

For an AD track the build half is specifically: **harden the domain and prove the attack now fails**
(remove the no-preauth flag and re-scan to show it's gone; rotate the service-account password and show
the old Kerberoast hash no longer cracks; remove the abusive ACE and show the BloodHound edge is gone),
**author a detection for the attack and prove it fires** (and doesn't fire on baseline), and **apply a
tiering / least-privilege fix and re-test the path**. Pure attack-sim that *feeds* those builds is
legitimate here (it's the raw material the blue half consumes) — the bar is only whether the
**defensive** labs that own the build actually close the loop with a verified re-test.

## Per-module verdict (from the lab Do-steps)

| # | Module | Lab orientation | Has a build/operate-and-**verify** half? | Verdict |
|---|--------|-----------------|-------------------------------------------|---------|
| 01 | AD & Windows Security Model | read the Meridian spec, map topology, trace a Kerberos flow, spot GPO/NTLM gaps; `parse_domain.py` | no | **By design** — foundational orientation lab (the track's "read the environment" entry, like cloud 01 / ztna 01) |
| 02 | Enumeration | enum4linux/ldapsearch/bloodhound-python, find SPNs/no-preauth/delegation, shortest path to DA | no — pure recon | **By design** — pure enumeration; explicitly feeds 03/05/08, and ends in "what a defender would see in DC logs" |
| 03 | Kerberos Attacks | Kerberoast + AS-REP roast, crack offline, etype downgrade, ATT&CK + Event ID | no — attack-sim | **By design** — feeds the 4769/4768 Sigma rules in 09; ends in the detection note |
| 04 | Credential Theft & Replay | secretsdump, DCSync, PTH (psexec/smbexec), hash chain, LAPS gap | no — attack-sim | **By design** — feeds 09 (4662/4624 rules) and 10/11 (Credential Guard/tiering fix); ends in event-ID + "what would have stopped each step" |
| 05 | ACL & Delegation Abuse | read `nTSecurityDescriptor`, exploit GenericWrite (live `samba-tool`), trace path, **note the remediation ACE** | partial — names the fix per finding, but never *removes the ACE and re-verifies* the edge is gone | **By design (attack-sim)** — remediation is correctly deferred to 10; the *verified* ACE removal is the thing 10 should prove |
| 06 | Lateral Movement | netexec sweep, PTH, psexec/smbexec/wmiexec, artefact/Event-ID profile, SMB-signing impact | no — attack-sim | **By design** — produces the per-technique event profile that becomes the 09 Sigma rules; segmentation rec feeds 10/11 |
| 07 | Persistence in AD | forge golden/silver ticket, add DCSync rights, **write remediation checklist** (double krbtgt rotation) | partial — remediation is *written*, not executed/verified | **By design (attack-sim)** — feeds 09 golden-ticket detection + 10 DCSync-rights audit; `persistence-audit.py` is a real audit artifact |
| 08 | Path to Domain Admin | trace the BloodHound path hop-by-hop, ATT&CK map, choke-point analysis, client report; `path-analyzer.py` | no — analysis | **By design** — pure analysis/reporting lab (the report *is* the artifact, like cloud 14 / ztna 04); feeds 09/10/11 |
| 09 | Detecting AD Attacks | **write 4 Sigma rules** (DCSync/PTH stubs), validate they fire with chainsaw, FP-test vs baseline, **CI gate** | **yes** — detection-as-build, validated on EVTX + FP-tested + `validate-rules.yml` CI | **Balanced (proactive)** |
| 10 | Hardening AD as Code | run dacledit/ldapsearch posture audit on the live DC, score vs CIS checklist, **extend the Ansible playbook** | **no — authors the fix but the tasks are `debug`-only and the posture delta is "conceptual"; the live DC is never re-scanned to prove the attack now fails** | **Deepen — add the apply-and-re-verify half** |
| 11 | Defending Identity (tiered admin) | design the tier model, GPO deny-logon spec, map tiering to PATH-001, Protected Users, JIT; `tier-compliance-check.py` | partial — design + a real compliance-check script, but design-by-nature (no live apply) | **By design** — architectural/design capstone lab (the design *is* the deliverable); ESAE/tiering hole is *filled* here |

**Tally:** 1 balanced/proactive (09) · 8 "by design" pure (01 orient, 02/03/04/06 attack-sim, 05/07
attack-sim-with-deferred-fix, 08 analysis, 11 design) · **1 deepen-and-verify (10)** · 0 find-only
that should gain a build half from scratch · **0 structural holes.** The most build-light track of the
three audited — but correctly so, because the build half is *concentrated by design* in 09–11 + the
capstone, and only one of those three (10) leaves the loop open.

## Structural hole: none

The two holes the framework flags for AD — **tiering/ESAE** and **detection** — are both **already
present as dedicated modules**: 11 *is* the tiering/Enterprise-Access-Model/JIT/Protected-Users module
(its `AI acceleration` even contrasts ESAE vs the Enterprise Access Model), and 09 *is* the detection
module (Sigma + chainsaw + detection-as-code CI). NIST/Microsoft identity-defense surface — Kerberos
hardening (gMSA, AES-only, Protected Users), delegation cleanup, ACL hygiene, golden-ticket containment
— is covered across 09/10/11 and the capstone. There is **no defensible missing module**; adding one
would be overcorrection.

## Rebalance plan (sequenced — one item)

1. **10 — close the loop: apply the remediation to the live DC and re-verify** *(S–M, promotable /
   rests on the already-validated env — no new scaffolding).* The lab already (a) runs a real posture
   audit against a live Samba4 DC and (b) has the learner author Ansible remediation tasks — but step 6
   tasks are `ansible.builtin.debug` prints and step 7's posture delta is explicitly "conceptual," so
   the attack is never *proven* closed. Promote the existing conceptual remediation to a **verified**
   one, reusing the env that already mutates this same DC in module 05:
   - **Apply** at least the two cheapest, fully-Samba-supported fixes against the running DC — clear the
     `DONT_REQUIRE_PREAUTH` bit on `svc-legacy` and rotate `svc-mssql`'s password (both doable with
     `samba-tool user` / an LDAP modify from the tools container, exactly as 05's demo uses `samba-tool`
     to add a group member).
   - **Re-run the same audit** (the module's own `posture-audit.py` / the `make demo` ldapsearch queries)
     and **prove the delta**: the no-preauth query now returns "(none found — good!)" and the rotated
     account's old Kerberoast hash from module 03's `data/hashes.txt` no longer cracks. Make this a
     graded `make harden-verify` step (mirrors cloud 10's `make harden-verify` and ztna's
     author-apply-prove pattern).
   - This converts 10 from *audit + author* into *audit → apply → re-verify*, the one missing build-half
     verification in the track. The Ansible playbook stays as the "this is how you'd do it at scale on a
     real Windows DC" artifact; the `samba-tool`/LDAP apply is the lab-provable version.
   - **Promotable, not new env:** the Samba4 DC, the tools container, and `samba-tool`-based mutation are
     all already validated (05/10 share the same DC image). The change is `lab.md` Do-steps + a
     `make harden-verify` target + a small re-scan assertion — no new container.

   *(Optional, opportunistic — not required for balance:* 05 and 07 could each end in the *verified*
   version of the fix they already name — remove the GenericWrite ACE and show the BloodHound edge gone
   (05); add DCSync rights then remove them and show the audit clean (07). But this is **legitimately
   10/11's job** in the track's attack-then-defend arc, so leave 05/07 pure unless 10's verify step
   wants the ACE-removal proof co-located.)*

## Non-goals / cautions

- **Don't overcorrect — this track is mostly fine.** 01–08 are attack/analysis **by design** and feed
  the dedicated defensive third; bolting a "harden it" half onto each attack lab would break the
  track's deliberate attack-then-defend structure (the same reason cloud 14 and ztna 04 stay pure). The
  fix is **one** module (10), and it's a *verify* gap, not a missing build.
- **09 and 11 are done.** 09 is a model detection-as-build lab (write rules → prove they fire → FP-test
  → CI gate). 11 is a design lab and the design *is* the artifact (cf. ztna 04 / cloud 14) — its
  `tier-compliance-check.py` already gives it an executable check. Leave both.
- **No new module.** Tiering/ESAE (11) and detection (09) — the holes the frame looks for — are present.
- The 10 change is **promotable / cheap**: it rests on the already-validated Samba4 DC + tools container
  and the `samba-tool`-mutation pattern proven in 05; it needs no new env scaffolding. If Docker is
  unavailable in the authoring session, the only follow-up is running `make up && make harden-verify &&
  make down` on a Linux runner to validate before adding `.ci-demo` — same discipline the cloud/ztna
  rebalances followed.
- Any change touches **both repos** (concept prose in `plaintext`, lab env in `plaintext-labs`) and must
  keep `mkdocs build --strict` green and ship a validated `make up`/`make demo`.
