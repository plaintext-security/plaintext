# Module 06 — Lateral Movement

*Type 5 · Detonate & Detect — enumerate hosts and SMB-signing status with netexec, move laterally via impacket `psexec.py`/`wmiexec.py`, and difference the artefacts each method leaves (service-install 7045 vs process 4688), delivering the executed movement and its detection comparison. (Secondary: Blast-Radius Trace — map how NTLM-relay and missing SMB signing widen reach across the estate.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Active Directory & Windows Security** — *getting domain admin is not the goal; reaching the data is — and data rarely lives on the first machine you land on.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~4–6 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    Lateral movement is **credential + protocol + execution primitive**, and in a poorly defended
    network every combination works — so the attacker's real choice is *which artefacts it leaves*.
    `psexec.py` drops a service (Event 7045), `smbexec.py` skips the binary, `wmiexec.py` goes via
    DCOM (Event 4688). **SMB signing** is the control that stops the relay variant; netexec
    enumerates which hosts lack it in seconds. The standout standalone primitive is **PrintNightmare**
    (CVE-2021-34527) — SYSTEM-level RCE on nearly every domain host running the spooler.

## Why this matters

Lateral movement is the phase where a breach becomes a crisis. An attacker with a single compromised workstation is contained; an attacker who has moved to three servers and a domain controller is an incident. The techniques in this module — SMB exec, WMI exec, and CrackMapExec-style host discovery — are the mechanisms used in every significant Windows intrusion documented in the past decade, from APT campaigns to ransomware pre-staging. **Wizard Spider** ([G0102](https://attack.mitre.org/groups/G0102/)), the crew behind Ryuk and Conti ransomware, is documented by MITRE using the `Invoke-SMBExec` cmdlet to execute pass-the-hash and move laterally with stolen hashes — exactly the SMB-exec primitive below, in real big-game-hunting intrusions. Understanding these mechanisms is how defenders build the network segmentation, host telemetry, and alert logic that actually contains a breach.

## Objective

Enumerate live hosts and their SMB signing status using CrackMapExec (netexec), perform lateral movement via impacket `psexec.py`/`wmiexec.py`, and explain the artefact differences between each execution method.

## The core idea

Lateral movement in a Windows domain fundamentally relies on three things: a credential (password hash, Kerberos ticket, or plaintext), a protocol that accepts it (SMB, WMI/DCOM, WinRM, RDP), and a remote execution primitive that the protocol enables (service creation, WMI process, PowerShell remoting, GUI session). The attacker's choice of technique is driven by what artefacts it leaves, not by which one "works" — they all work in a poorly defended environment.

!!! note "The mental model"
    Lateral movement decomposes into a fixed triple: **credential + protocol + execution
    primitive**. Once you see it that way, the tools stop being a list to memorise — `psexec.py`,
    `smbexec.py`, `wmiexec.py` are just different *protocol + primitive* combinations behind the same
    credential. The attacker's actual decision is artefact-driven: pick the combination whose event
    trail the target isn't watching.

A standalone vulnerability can hand an attacker the same remote code-execution primitive these tools provide: **PrintNightmare** ([CVE-2021-34527](https://nvd.nist.gov/vuln/detail/CVE-2021-34527), KEV-listed) abuses the Windows Print Spooler — a service running as SYSTEM on essentially every domain-joined host, including DCs — to execute attacker-supplied code as SYSTEM remotely, a direct route to lateral movement and privilege escalation. It is the kind of "one service, everywhere, runs as SYSTEM" surface that turns a single foothold into estate-wide movement.

**SMB** is the most abused because it is universally open on Windows networks for file sharing and domain authentication. The impacket `psexec.py` technique creates a random-named service binary in `ADMIN$` (C:\Windows), starts it, and communicates via a named pipe. It leaves the binary on disk (briefly), creates a Service Control Manager event (Event 7045 — "A new service was installed"), and leaves a Logon Type 3 event (4624) with the source IP. `smbexec.py` avoids the binary drop by executing commands via a temporary share and service, but still leaves the service creation event. `wmiexec.py` uses DCOM/WMI — it creates a `win32_process` object and reads the output via a share — leaving a different event profile: Event 4688 (process creation) rather than 7045.

**SMB signing** is the network-level control that prevents NTLM relay attacks, which are lateral movement's close cousin. When SMB signing is required, every SMB packet must be signed with the session key, preventing a man-in-the-middle from relaying an authenticated session from host A to host B. When signing is not required (the default for workstations, even today), an attacker on the network can relay NTLM authentication from one machine to another and execute as that machine's credential without ever cracking anything. `CrackMapExec`/`netexec` has a flag to enumerate SMB signing status across a subnet in seconds — this is a standard finding in any penetration test.

!!! warning "The gotcha"
    SMB signing is **not required on workstations by default** — to this day. That single default is
    what makes NTLM relay practical across most workstation subnets: the attacker never cracks a
    thing, they relay an already-authenticated session from host A to host B. Auditing signing status
    (`nxc smb <subnet>`) is a one-liner; fixing it is a GPO, and it's a standard pentest finding for
    a reason.

??? note "Go deeper: PrintNightmare is a movement primitive, not just a CVE"
    Treat **PrintNightmare** (CVE-2021-34527, KEV-listed) as a member of the same family as
    `psexec`/`wmiexec`, not a one-off bug. The Print Spooler runs as SYSTEM on essentially every
    domain-joined host *including DCs*, so a spooler RCE is a "one service, everywhere, runs as
    SYSTEM" primitive — exactly the shape that turns one foothold into estate-wide reach. Mitigation
    is blunt: patch, and disable the spooler where it isn't needed.

**CrackMapExec (netexec)** is the operational tool for lateral movement at scale. It wraps the underlying impacket protocols into a single interface, accepts multiple target formats (CIDR ranges, host lists), and supports credential spraying, hash-based authentication, module execution (running commands, dumping SAM, executing BloodHound collection) across dozens of hosts simultaneously. A single `nxc smb 10.10.0.0/24 -u jsmith -p Welcome1!` tells you which hosts are alive, their OS version, their domain membership, and whether they have SMB signing enabled. This is the operational scanning pattern a real attacker uses to map the environment quickly after initial access.

!!! tip "AI caveat"
    Asking a model to compare the event IDs each tool generates is a strong use case — but it will
    *conflate* the artefacts (which tool drops 7045 vs. 4688, which leaves a binary on disk). Cross-
    check each claim against the impacket source and Microsoft's event-ID docs; the whole detection
    value of this module is in those distinctions being correct.

## Learn (~3 hrs)

**SMB and Windows remote execution**
- [T1021.002 — SMB/Windows Admin Shares (MITRE ATT&CK)](https://attack.mitre.org/techniques/T1021/002/) — the technique, with procedure examples from real APT campaigns. Note the artefact differences listed in the detection section.
- [T1047 — WMI (MITRE ATT&CK)](https://attack.mitre.org/techniques/T1047/) — WMI as an execution primitive; why it's popular (available everywhere, frequently not monitored as carefully as SMB).

**Real-world campaign**
- [Wizard Spider (MITRE ATT&CK — G0102)](https://attack.mitre.org/groups/G0102/) — the Ryuk/Conti ransomware operator. Read its T1550.002 procedure entry: it used `Invoke-SMBExec` to pass-the-hash and move laterally with stolen hashes — a concrete, attributed instance of the SMB lateral-movement primitive in this module.

**NetExec / CrackMapExec**
- [NetExec (GitHub — Pennyw0rth)](https://github.com/Pennyw0rth/NetExec) — the maintained fork of CrackMapExec. Read the wiki's SMB module section. Key flags: `--smb-signing`, `-H` (pass hash), `--local-auth` (local account vs domain).

**Impacket lateral movement tools**
- [Impacket examples (GitHub)](https://github.com/fortra/impacket/tree/master/examples) — read the docstrings for `psexec.py`, `smbexec.py`, and `wmiexec.py`. Each docstring explains the mechanism and the artefacts.

**PrintNightmare — spooler RCE as a movement primitive**
- [CVE-2021-34527 (NVD)](https://nvd.nist.gov/vuln/detail/CVE-2021-34527) — the Windows Print Spooler RCE (KEV-listed). Read the summary: it yields SYSTEM-level code execution on any host running the spooler, making it a remote-exec primitive for lateral movement and escalation alongside the SMB/WMI techniques here. Mitigation: disable the spooler where not needed and apply the patch.

**SMB relay**
- [NTLM Relay Attacks (byt3bl33d3r)](https://byt3bl33d3r.github.io/practical-guide-to-ntlm-relaying-in-2017-aka-getting-a-foothold-in-under-5-minutes.html) — the practical guide to NTLM relay, which explains why SMB signing matters and what it prevents.

## Key concepts
- Lateral movement = credential + protocol + execution primitive.
- `psexec.py` → service binary in ADMIN$ (Event 7045, Logon Type 3 4624).
- `smbexec.py` → temporary service, no binary drop (Event 7045, different named pipe).
- `wmiexec.py` → WMI/DCOM process creation (Event 4688, no Service Manager event).
- SMB signing required: prevents NTLM relay (critical control for workstation subnets).
- `nxc smb <subnet>` enumerates live hosts, OS, signing status in seconds.
- Every execution method leaves a Logon Type 3 (network logon) event on the target.
- Real-world anchor: Wizard Spider (G0102, Ryuk/Conti) is documented using `Invoke-SMBExec` pass-the-hash for this exact lateral-movement step.
- PrintNightmare (CVE-2021-34527) gives SYSTEM-level RCE via the Print Spooler on nearly every domain host — a standalone lateral-movement/escalation primitive; patch and disable the spooler where unneeded.

## AI acceleration

Ask a model to compare the Windows event IDs generated by `psexec.py`, `smbexec.py`, and `wmiexec.py` for the same lateral movement action. Cross-check each claim against the impacket source code and Microsoft's event ID documentation. This is a good AI use case (event/artefact comparison across tool variants) — but the model will sometimes conflate the tools' artefacts, so verification is essential.

!!! question "Check yourself"
    - What three ingredients does every lateral-movement technique require, and what actually drives the attacker's choice between `psexec`/`smbexec`/`wmiexec`?
    - Which event ID distinguishes `wmiexec.py` from the SMB-based tools, and why?
    - SMB signing is not required on workstations by default. What attack does that default enable, and how do you find affected hosts fast?
