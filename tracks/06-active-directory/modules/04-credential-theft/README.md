# Module 04 — Credential Theft & Replay

*Type 5 · Detonate & Detect — extract NTLM hashes with `secretsdump.py`, replay them via pass-the-hash through `psexec.py`/`smbexec.py` (T1550.002), and establish the conditions that make PTH possible vs. impossible, delivering the executed attack plus its detection seam. (Secondary: Blast-Radius Trace — show how one local-admin hash reaches the whole estate and where LAPS draws the boundary.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Active Directory & Windows Security** — *a password hash is not a password, but in Windows it is often just as good.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~4–6 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    An NT hash is `MD4(UTF-16LE(password))`, and NTLM authenticates with the *hash*, not the
    password — so possessing the hash *is* possessing the account. That's **pass-the-hash**: not a
    bug, a property of the protocol. Hashes live in the SAM, in LSASS memory, and (the prize) in
    NTDS.dit on a DC; `secretsdump.py` pulls all three, including via **DCSync** replication. LAPS
    breaks shared-local-admin reuse but not domain-credential replay, and **Zerologon**
    (CVE-2020-1472) skips straight to dumping the whole domain.

## Why this matters

Pass-the-hash (PTH) is one of the most durable attack techniques in Windows environments because it exploits a fundamental property of the NTLM authentication protocol, not a bug in any single product. Every major Windows lateral movement campaign — from NotPetya to the SolarWinds intrusion — has relied on some form of credential theft and replay. The defence requires understanding exactly when NTLM can and cannot be used as a replay credential, and why some architectures completely remove that surface while others leave it intact by design. The most extreme shortcut to the credential store is **Zerologon** ([CVE-2020-1472](https://nvd.nist.gov/vuln/detail/CVE-2020-1472), a CVSS 10.0, CISA KEV-listed Netlogon flaw): a cryptographic weakness in MS-NRPC lets an unauthenticated attacker on the network reset a domain controller's machine-account password to empty, then DCSync every hash in the domain — turning "steal one hash" into "take the entire NTDS.dit" in minutes.

## Objective

Extract NTLM hashes from a Windows-style credential store using `secretsdump.py`, demonstrate pass-the-hash via `psexec.py` and `smbexec.py`, and explain the conditions under which PTH is possible vs. impossible.

## The core idea

Windows stores a user's credential as an **NT hash** — specifically, the MD4 hash of the UTF-16LE encoding of the password. This matters because NTLM authentication doesn't transmit the password; it uses the hash in a challenge-response protocol where the server sends a nonce, the client signs it with the NT hash, and the server verifies. The consequence: if you possess the NT hash, you can authenticate as the user without ever knowing the underlying password. This is what "pass the hash" means — not a vulnerability in the protocol but a property of how NTLM was designed.

!!! note "The mental model"
    In NTLM, the hash *is* the credential. The password only ever exists to produce the hash; the
    protocol never needs it again. So stop thinking "I need to crack this" — possessing the hash is
    already game over for that account. Cracking only matters when you want the *plaintext* for reuse
    elsewhere or for Kerberos.

Where do hashes live? The primary sources are: the **SAM database** on local machines (protected by SYSKEY, but extractable with SYSTEM privileges), **LSASS memory** on any machine where the user has authenticated (protected by PPL — Protected Process Light — on newer Windows, but bypassed by various techniques), and most importantly for a DC, **the NTDS.dit database** — the Active Directory credential store on the domain controller. `secretsdump.py` can extract from all three sources, using different techniques: VSS shadow copy + offline parsing for NTDS.dit, or live DRSUAPI replication (DCSync) when the attacker has sufficient rights.

The reason PTH is so dangerous in practice is that Windows historically used the *same* NTLM hash for local and domain authentication, and local admin credentials were historically shared across machines (the same local admin password on every workstation). LAPS (Local Administrator Password Solution) was introduced precisely to break this — it rotates the local admin password per machine and stores it in AD. Without LAPS, one cracked or stolen local admin hash gives you lateral movement across the entire estate. Even with LAPS, you still face the domain credential hash problem: a domain account that logs on to multiple machines leaves its NTLM hash in LSASS on every one of them.

!!! warning "The gotcha"
    "We deployed LAPS, so PTH is handled" is the trap. LAPS only kills the *shared local admin
    password* problem — one hash that worked on every workstation. It does nothing about a *domain*
    account whose NTLM hash is sitting in LSASS on every host it logged into. The domain-credential
    co-location problem is what the tiering modules (10–12) exist to solve, not LAPS.

??? note "Go deeper: Zerologon skips the foothold entirely"
    Every technique here assumes you already have *something* — SYSTEM on a box, or replication
    rights. **Zerologon** (CVE-2020-1472, CVSS 10.0, KEV-listed) needs neither: an MS-NRPC crypto
    flaw lets an *unauthenticated* attacker on the network reset a DC's machine-account password to
    empty, then DCSync every hash in the domain. It is the canonical "one network packet to full
    NTDS.dit." Patch it; it is not optional.

!!! tip "AI caveat"
    A model writes impacket scripts quickly, but it routinely confuses the **SAM vs. NTDS.dit
    extraction paths** — they use different code paths and different rights. Have it draft against a
    bundled offline SAM, then check every method name against the impacket source before trusting it. `psexec.py` authenticates via SMB using PTH, creates a named pipe, and drops a service binary — noisy, creates Event 7045. `smbexec.py` achieves the same result without dropping a binary, instead executing commands via a temporary service that reads from SMB shares — quieter on disk, but still creates service events. `wmiexec.py` uses WMI (DCOM) instead of SMB, leaving a different artefact profile. Each tool leaves a distinct event signature, and defenders should know all three.

## Learn (~3 hrs)

**Pass the hash mechanics**
- [T1550.002 — Pass the Hash (MITRE ATT&CK)](https://attack.mitre.org/techniques/T1550/002/) — procedure examples and detections. Note the sub-technique distinction from pass-the-ticket.

**Secretsdump and DCSync**
- [Impacket secretsdump.py — source and usage (GitHub)](https://github.com/fortra/impacket/blob/master/examples/secretsdump.py) — read the module docstring and the argument descriptions. Understand the difference between SAM extraction, LSASS extraction, and DCSync.
- [DCSync Attack Explained (adsecurity.org)](https://adsecurity.org/?p=1729) — the DCSync technique: using DRSUAPI replication rights to pull any credential from the DC without touching NTDS.dit on disk.

**Zerologon — Netlogon auth bypass to DC takeover**
- [CVE-2020-1472 (NVD)](https://nvd.nist.gov/vuln/detail/CVE-2020-1472) — the Netlogon elevation-of-privilege CVE (CVSS 10.0, KEV-listed). Read the summary for the MS-NRPC secure-channel weakness; this is the canonical example of an unauthenticated network attacker reaching the domain credential store directly.

**LAPS and mitigation**
- [LAPS — Local Administrator Password Solution (Microsoft Docs)](https://learn.microsoft.com/en-us/windows-server/identity/laps/laps-overview) — what LAPS solves (shared local admin passwords) and what it does not solve (domain credential replay). Read the overview section.

## Key concepts
- NT hash = MD4(UTF-16LE(password)) — the value NTLM uses for authentication, not the password itself.
- Pass-the-hash authenticates with the hash directly — no password needed.
- `secretsdump.py` can extract from SAM (local), LSASS (remote, privileged), or NTDS.dit via DCSync (domain admin).
- DCSync uses legitimate DRSUAPI replication to pull credentials from a DC — no need to touch NTDS.dit on disk.
- Zerologon (CVE-2020-1472) abuses an MS-NRPC crypto flaw to zero a DC's machine-account password unauthenticated, then DCSync the whole domain — patch immediately; it is KEV-listed.
- LAPS breaks shared local admin passwords; it does not prevent domain credential PTH.
- Detection: Event 4624 (Logon Type 3) with NtLmSsp provider from an unexpected source host; Event 4776 for NTLM authentication events.
- Mitigation: Protected Users group, Credential Guard (virtualises LSASS), SMB signing to prevent relay.

## AI acceleration

Ask a model to write a Python script using the `impacket` library to perform a read-only secretsdump against a local SAM file (no live target needed). Verify the script compiles and runs against the bundled SAM dump in `data/`. The model is good at impacket API calls but often confuses the SAM vs. NTDS.dit extraction paths — check each method name against the impacket source.

!!! question "Check yourself"
    - Why can you authenticate as a user with only their NT hash, and why is that a protocol property rather than a vulnerability?
    - Name the three places `secretsdump.py` can pull hashes from and the privilege each requires.
    - You've rolled out LAPS everywhere. Which credential-replay risk does that close, and which does it leave wide open?
