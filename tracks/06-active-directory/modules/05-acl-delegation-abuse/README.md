# Module 05 — ACL & Delegation Abuse

*Type 3 · Blast-Radius Trace — identify and exploit ACL misconfigurations (`GenericWrite`, `WriteDacl`, `WriteOwner`, `AllExtendedRights`) and delegation abuse (unconstrained/constrained) in Corp, then trace the full "owned in two hops through a legit permission" escalation path as the deliverable. (Secondary: Detonate & Detect — capture the artefacts each ACE write and delegation abuse emit.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Active Directory & Windows Security** — *the most dangerous attack paths in AD are not exploits — they are legitimate permissions given to the wrong principal.*

<!-- module-meta -->
**Difficulty:** Advanced &nbsp;·&nbsp; **Estimated time:** ~5–7 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    The deadliest AD attack paths aren't exploits — they're **legitimate permissions on the wrong
    principal**. Every object's DACL controls who can *modify* it, and the dangerous ACEs aren't
    "Full Control" but the targeted ones: `GenericWrite`, `WriteDacl`, `WriteOwner`,
    `AllExtendedRights`. A helpdesk account with `GenericWrite` on a group, or a foothold with
    `GenericWrite` on a computer (→ RBCD), owns the domain in a couple of hops. Delegation
    (unconstrained / constrained / RBCD) is the same story for tickets — and BloodHound's edges are
    what make any of it visible.

## Why this matters

ACL-based attack paths are the dominant finding in real-world red team engagements against mature AD environments — environments that have patched everything and think about Kerberos attacks. An organisation can have a strong password policy, LAPS deployed, Credential Guard on, and still be owned in two hops because a service account has `GenericWrite` on a high-privilege group. These misconfigurations are invisible in the standard "who's in Domain Admins" review and are only visible when you read the raw ACL entries on every object in the directory.

## Objective

Identify and exploit ACL misconfigurations (`GenericWrite`, `WriteDacl`, `WriteOwner`, `AllExtendedRights`) and delegation abuse (unconstrained and constrained delegation) in the Corp domain, and trace the full privilege escalation path.

## The core idea

Every AD object — a user, group, computer, OU, or GPO — has a security descriptor with a DACL listing who can do what. Most access control discussion focuses on "who can log on to this server" or "who's in this group," but the DACL controls something more granular and more powerful: who can *modify* the object. The dangerous ACE types are not "Full Control" (which is obvious) but the targeted rights that allow specific operations: `GenericWrite` allows modifying most attributes; `WriteDacl` allows rewriting the object's entire permission set; `WriteOwner` allows taking ownership (which then lets you set any permissions); `AllExtendedRights` includes the right to read `ms-Mcs-AdmPwd` (LAPS password) or force password changes on users. A helpdesk account with `GenericWrite` on a security group can add any user to that group. A service account with `WriteDacl` on the Domain Admins group can grant itself membership at will.

!!! note "The mental model"
    Stop reading ACLs as "who can *access* this" and start reading them as "who can *change* this."
    `WriteDacl` and `WriteOwner` are self-amplifying — they let you grant yourself any other right —
    so the question that finds attack paths is never "is anyone over-privileged?" but "who can edit
    the object that controls the thing I want?" That chain of edits is the path.

**Delegation** in Active Directory is a separate but related attack surface. Unconstrained delegation means: any service running as this account will receive the TGT of any user who authenticates to it, stored in memory. If an attacker can authenticate any high-value account to a service running with unconstrained delegation — even by coercing the DC's machine account to authenticate (via printer spooler or PetitPotam, [CVE-2021-36942](https://nvd.nist.gov/vuln/detail/CVE-2021-36942), the KEV-listed Windows LSA spoofing flaw that lets an unauthenticated caller force a DC to NTLM-authenticate via MS-EFSRPC) — they receive that account's TGT and can impersonate it anywhere in the domain. The same PetitPotam coercion feeds the classic AD CS attack path: relay the coerced DC authentication to a Certificate Authority's web-enrolment endpoint (ESC8) and mint a certificate that impersonates the DC. Constrained delegation is safer — the service can only request tickets to specific target services — but it still allows impersonation of any user to those targets, which is dangerous if those targets are domain controllers.

Resource-Based Constrained Delegation (RBCD) is a newer mechanism that reverses where the delegation configuration lives: instead of the front-end service specifying what it can impersonate to, the back-end resource specifies which services can impersonate users to it. The attack consequence: if an attacker has `GenericWrite` on any computer object, they can set the `msDS-AllowedToActOnBehalfOfOtherIdentity` attribute on that computer to allow an attacker-controlled account to impersonate any user to it — including local administrators — without being a Domain Admin.

!!! warning "The gotcha"
    These are the findings that survive a "we patched everything" domain. An org can run LAPS,
    Credential Guard, and strong passwords and still be owned in two hops because one service account
    has `GenericWrite` on a privileged group — and that's *invisible* to the standard "who's in
    Domain Admins?" review. The only way to see it is to read the raw ACEs on every object, which is
    exactly what BloodHound does for you.

??? note "Go deeper: PetitPotam, ESC8, and RBCD as the modern delegation chain"
    Unconstrained delegation harvests TGTs, but the dangerous modern move is *coercion + relay*.
    **PetitPotam** (CVE-2021-36942, KEV-listed) uses MS-EFSRPC to force a DC to NTLM-authenticate to
    you; relay that to an AD CS web-enrolment endpoint (**ESC8**) and you mint a certificate that
    impersonates the DC. **RBCD** is the other modern primitive: `GenericWrite` on a *computer* lets
    you write `msDS-AllowedToActOnBehalfOfOtherIdentity` and impersonate any user to it — no DA
    required. Both are why "GenericWrite on a computer" is not a minor finding.

The practical lesson is that BloodHound makes all of this tractable. The edges `GenericWrite`, `WriteDacl`, `WriteOwner`, `AllExtendedRights`, `AllowedToDelegate`, and `AllowedToAct` in the BloodHound graph represent exploitable relationships, and the graph's shortest-path queries find the multi-hop paths that are completely invisible in any tabular view. Every real AD assessment runs BloodHound; reading the graph is a core skill.

!!! tip "AI caveat"
    A model writes a clean plain-English attack narrative from a graph path — paste the nodes and
    edges in and it'll produce "starting from [account], an attacker can…". Good for a report draft,
    but verify each step's edge against the BloodHound edge-type docs before it goes to a client; an
    invented or mislabelled edge in a report is a credibility hit.

## Learn (~4 hrs)

**ACL abuse fundamentals**
- [ACL Abuse in Active Directory (The Hacker Recipes)](https://www.thehacker.recipes/ad/movement/dacl) — the most comprehensive practical reference for ACL abuse; covers GenericWrite, WriteDacl, WriteOwner, and AllExtendedRights with both PowerView and impacket equivalents.
- [T1222.001 — File and Directory Permissions Modification (MITRE ATT&CK)](https://attack.mitre.org/techniques/T1222/001/) and [T1484 — Domain Policy Modification (ATT&CK)](https://attack.mitre.org/techniques/T1484/) — the formal mapping for ACL modification techniques.

**Delegation attacks**
- [Unconstrained Delegation (adsecurity.org — Sean Metcalf)](https://adsecurity.org/?p=1667) — the original explanation of how unconstrained delegation works and how it is abused. Read the "TGT Harvesting" section carefully.
- [RBCD Attack (Elad Shamir, original research)](https://shenaniganslabs.io/2019/01/28/Wagging-the-Dog.html) — the paper that introduced RBCD abuse. Long but essential for understanding how GenericWrite on a computer object leads to full impersonation.

**PetitPotam coercion → NTLM relay → AD CS (ESC8)**
- [CVE-2021-36942 (NVD)](https://nvd.nist.gov/vuln/detail/CVE-2021-36942) — the Windows LSA spoofing CVE behind PetitPotam (KEV-listed). Read the summary to see why MS-EFSRPC coercion forces a DC to authenticate; this is the coercion half of the ESC8 relay-to-AD-CS chain.
- [BloodHound CE — Edge type documentation (GitHub)](https://github.com/SpecterOps/BloodHound/tree/main/docs) — the canonical definition of each edge type (GenericWrite, WriteDacl, AllowedToDelegate, AllowedToAct). Read the description and exploit path for each.

## Key concepts
- `GenericWrite` on a group = can add any member; on a user = can set attributes like `msDS-KeyCredentialLink` (shadow credentials).
- `WriteDacl` = can rewrite the object's ACL, granting yourself any right.
- `WriteOwner` = can take ownership, then write the DACL.
- `AllExtendedRights` on a user = can force password change; on a computer = can read LAPS password.
- Unconstrained delegation: any authenticating user's TGT is stored in service account's memory.
- Constrained delegation: service can impersonate any user to specific targets only.
- RBCD: back-end resource controls who can impersonate to it; GenericWrite on a computer enables the attack.
- BloodHound paths that include ACL edges are the primary finding in mature AD environments.
- PetitPotam (CVE-2021-36942) coerces a DC into NTLM auth; relay it to an AD CS web endpoint (ESC8) to mint a DC-impersonating certificate.

## AI acceleration

ACL abuse paths in BloodHound can be complex to narrate for a client report. Paste the graph path (nodes and edges) into a model and ask it to write a plain-English attack narrative: "Starting from [account], an attacker can..." The model is good at this — but verify each step by checking that the exploited edge is correctly documented in the BloodHound edge type docs before you put the narrative in a report.

!!! question "Check yourself"
    - Why is `WriteDacl` on a group more dangerous than direct membership in that group?
    - An org has LAPS, Credential Guard, and a strong password policy. How can it still fall in two hops, and why wouldn't a "who's in Domain Admins?" audit catch it?
    - What single ACE on a *computer* object enables RBCD, and what does it let you do?
