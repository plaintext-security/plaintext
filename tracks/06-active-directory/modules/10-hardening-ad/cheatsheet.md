# Cheat sheet — Hardening AD as Code

*Companion to [Module 10 — Hardening AD as Code](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only assess and change Active Directory environments you own or are authorised to administer.

## Audit posture — read the ACLs (dacledit.py)

```bash
# Read the DACL on the objects that matter most; grep for the dangerous rights.
dacledit.py -action read -target "Domain Admins" corp.local/svc-audit:'P@ss' -dc-ip 10.10.0.10
dacledit.py -action read -target "corp.local"   corp.local/svc-audit:'P@ss' -dc-ip 10.10.0.10  # DCSync ACEs
# Flag any principal with WriteDacl / WriteOwner / GenericAll / GenericWrite on a privileged object.

# ldapsearch audits for the attack-exposing attributes
ldapsearch -x -H ldap://10.10.0.10 -b "dc=corp,dc=local" -D "corp\svc-audit" -w 'P@ss' \
  "(userAccountControl:1.2.840.113556.1.4.803:=4194304)" sAMAccountName   # AS-REP roastable
ldapsearch ... "(userAccountControl:1.2.840.113556.1.4.803:=524288)" sAMAccountName   # unconstrained deleg
ldapsearch ... "(servicePrincipalName=*)" sAMAccountName pwdLastSet        # SPN + password age
```

## Score against a benchmark — PingCastle (Windows, free CE)

```
PingCastle.exe --healthcheck --server dc01.corp.local    # 0–100 risk score (LOWER is riskier)
# Read the risk categories (Stale Objects, Privileged Accounts, Trusts, Anomalies) as a TRIAGE guide,
# then trend the score week-over-week — the delta is the deliverable, not the single number.
```

## Codify the fixes — Ansible (microsoft.ad collection)

```yaml
# Idempotent, reviewable in a PR, its own audit trail via each task's name:
- name: svc-legacy must require Kerberos pre-authentication (kills AS-REP roast)
  microsoft.ad.user:
    identity: svc-legacy
    kerberos_encryption_types: { add: [aes256] }
    account_locked: false
    do_not_require_preauth: false          # the remediation for the module's roast
    state: present

- name: Remove jsmith from privileged group
  microsoft.ad.group:
    identity: Domain Admins
    members: { remove: [jsmith] }
    state: present
```

```bash
ansible-playbook harden-ad.yml --check       # DRY RUN first — always, before you apply
ansible-playbook harden-ad.yml               # apply
ansible-playbook harden-ad.yml --check        # re-run: idempotent = 0 changed the second time
```

## Prove it — the non-negotiable second half

```bash
# 1. Apply the two highest-value fixes to the live DC (above).
# 2. Re-run the attack — it must now FAIL:
GetNPUsers.py corp.local/ -dc-ip 10.10.0.10 -usersfile users.txt -no-pass -format hashcat
#    → svc-legacy no longer returns an AS-REP hash.
# 3. Re-score: the HIGH findings clear vs. the held baseline.
```

## The 20 controls that matter (CIS-aligned priority)

Service-account password age · SPN hygiene · no `DONT_REQUIRE_PREAUTH` accounts · no unconstrained
delegation · privileged-group membership · GPO audit-policy coverage (4769/4662/4624 enabled) · SMB
signing required · LAPS deployed · Protected Users group · `krbtgt` rotation cadence.

## Gotchas worth remembering

- **A playbook never run against the domain is documentation, not a control.** Authoring the fix and
  *proving it closes the path* (re-run the attack, re-score) are equal halves — assert neither alone.
- **`--check` before every apply.** A dry run catches a typo that would lock out an account or strip a
  legitimate ACE. Re-run after applying: idempotent means the second run reports **0 changed**.
- **AI reaches for deprecated Ansible module names.** `win_ad_user` is dead — use `microsoft.ad.user` /
  `microsoft.ad.group`. Validate every module name and parameter against the Galaxy docs before you run.
- **The score is a triage guide, not the deliverable.** PingCastle's number tells you *which category*
  first; a single figure hides which control moved. Trend it (this week vs. last) and feed it to drift detection.
- **The UAC bit filters are exact.** `4194304` = no-preauth, `524288` = unconstrained delegation. A wrong
  decimal silently returns the wrong set — your "clean" audit may just be a broken filter.
- **A fix clicked through a console is unversioned and unrepeatable.** If it isn't in version control, it
  isn't real — that's the whole premise. GPO console edits drift; a reviewed PR does not.
