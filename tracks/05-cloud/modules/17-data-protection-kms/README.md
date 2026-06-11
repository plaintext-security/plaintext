# Module 17 — Data Protection & KMS

*Module concept · [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Cloud & Container Security** — *encryption at rest isn't a checkbox — it's a key-access decision, and the key policy is the real off-switch for your data.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~4–6 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

## Why this matters

"Is our data encrypted at rest?" is the question every auditor, customer security review, and breach
post-mortem asks — and "yes, the box is ticked" is the wrong answer. Encryption at rest only buys you
anything if the *keys* are managed well: who can decrypt, who can delete the key, and whether a single
compromised credential can do both. Every cloud breach that ends in "but the data was encrypted"
turned on a key-access decision, not the cipher. This module is the protect-the-data counterpart to
the rest of the track — where Module 07 keeps *credentials* out of reach, here you make the *data*
itself unreadable to anyone without a key you control, and you learn to reason about key access the
way you reason about IAM.

## Objective

Use AWS KMS (via LocalStack) to envelope-encrypt sensitive records — generating a data key, encrypting
locally, and storing only the ciphertext and the KMS-wrapped key — then author a **key policy** that
separates the principals who *manage* the key from the ones who *use* it, and verify with a policy
evaluation that a single role can neither read all the data nor destroy the key.

## The core idea

The mechanism that makes cloud encryption-at-rest practical is **envelope encryption**, and the move
to internalize is that *you never send your data to KMS*. KMS holds a master key it never exports; when
you need to encrypt something, you ask KMS for a **data key**, and it hands back two things — the key in
plaintext (which you use to encrypt your data locally, then immediately discard) and the same key
*wrapped* under the master key (which you store next to your ciphertext). To decrypt, you give the
wrapped key back to KMS, it unwraps it, and you decrypt locally. The data never touches KMS; only the
small data key does. This is what lets you encrypt terabytes with a key you can't exfiltrate — and it's
why the real control is `kms:Decrypt`. Revoke that permission and every object, *and every backup of
every object*, becomes ciphertext nobody can read. Key access, not file deletion, is the off-switch.

That reframes "encrypted at rest" from a property of the storage to a property of the **key policy**.
A KMS key carries a resource policy listing principals and the `kms:` actions each may take on the key —
and the question that matters isn't "is encryption on" but "who is in that policy and for what." The
discipline is **separation of duties**: the role that *administers* the key (enable, disable, rotate,
schedule deletion) must not be able to `Decrypt`, and the application role that *uses* the key
(`Encrypt`/`Decrypt`/`GenerateDataKey`) must not be able to administer it. Collapse the two — grant one
app role `kms:*`, the default-feeling shortcut — and a single compromised credential can both read every
record and schedule the key for deletion, destroying the data outright. The key policy is where data
protection is actually configured, and it fails exactly the way IAM fails: too broad, one principal,
no separation.

The subtlety that trips people is the **two-layer access model**. By default a KMS key policy includes
a statement granting the account root `kms:*`, which *delegates* key-access decisions to IAM — so a
principal can use the key if *either* the key policy grants it directly *or* the key policy trusts the
account and an IAM policy grants it. That flexibility is convenient and a common source of "I revoked it
in the key policy but they can still decrypt" confusion: you have to reason about both layers. The
defensive posture is to make the key policy itself the source of truth for who can use a sensitive key —
explicit principals, explicit actions — rather than leaning on the broad IAM delegation, so the answer
to "who can decrypt this?" is readable in one document.

Finally, know what the cloud gives you for free and what it doesn't. Turning on **default encryption**
(S3 buckets, EBS volumes, RDS, snapshots) is genuinely a one-setting win and you should enforce it
everywhere — an unencrypted snapshot copied to another account is plaintext. But default encryption with
an AWS-managed key gives you the cipher without the control: you can't write a tight key policy on a key
you don't own. The practitioner move is customer-managed keys (CMKs) for anything sensitive, so the key
policy — and rotation, and the audit trail of every decrypt in CloudTrail — is yours to govern. The
cipher is a commodity; key governance is the job.

## Learn (~3 hrs)

**Envelope encryption & KMS concepts (~1.5 hrs)**
- [AWS KMS — Concepts (envelope encryption, data keys, CMKs)](https://docs.aws.amazon.com/kms/latest/developerguide/concepts.html) — the authoritative model; read "envelope encryption," "data keys," and "customer managed keys." This is the mental model the lab makes concrete.
- [AWS KMS — Cryptographic details (whitepaper)](https://docs.aws.amazon.com/kms/latest/cryptographic-details/intro.html) — how KMS actually wraps keys and what it never exposes; skim the "Key hierarchy" and "Customer master keys" sections for the why behind the design.

**Key policies & access control (~1 hr)**
- [AWS KMS — Key policies](https://docs.aws.amazon.com/kms/latest/developerguide/key-policies.html) — how the resource policy works, the default root statement, and the IAM-delegation interaction. Read "Default key policy" and "Key policies and IAM policies" carefully — that two-layer model is the gotcha.
- [AWS KMS — Key policy for separation of duties (best practices)](https://docs.aws.amazon.com/kms/latest/developerguide/key-policy-default.html) — the recommended split between key administrators and key users; this is exactly what you author in the lab.

**Encryption at rest in practice (~0.5 hr)**
- [AWS — Data protection: encryption at rest](https://docs.aws.amazon.com/whitepapers/latest/logical-separation/encrypted-data-at-rest.html) — where default encryption applies (S3, EBS, RDS, snapshots) and why an AWS-managed key vs. a CMK changes who holds control.

## Key concepts
- Envelope encryption: KMS wraps a data key; your data never goes to KMS — only the data key does.
- `kms:Decrypt` is the real off-switch — revoke it and all ciphertext (and every backup) is unreadable.
- "Encrypted at rest" is a property of the *key policy*, not the storage — who can decrypt is the question.
- Separation of duties: key administrators can't decrypt; key users can't administer. `kms:*` to one role breaks both.
- Two-layer access: the default key policy delegates to IAM; reason about key policy *and* IAM together.
- Default encryption is a free win, but only a customer-managed key (CMK) gives you the key policy, rotation, and audit control.

## AI acceleration

A model is a strong reviewer of a KMS key policy: paste it and ask it to flag separation-of-duties
violations — a principal that can both `Decrypt` and `ScheduleKeyDeletion`, or `kms:*` granted to an
application role. It's reliable on the obvious collapse. Where you own the judgment is intent: the model
doesn't know which role in *your* org is meant to administer versus use the key, so it can't tell a
correct grant from a dangerous one without that context — and it won't catch that a broad IAM policy
plus the default root delegation re-opens access you thought the key policy closed. Use it to draft the
separated policy and spot the obvious sins; prove the result with the lab's `check_keypolicy.py` and
verify the two-layer access yourself.
