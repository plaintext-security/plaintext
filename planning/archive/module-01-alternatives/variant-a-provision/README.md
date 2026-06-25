# Module 01 — Cloud Fundamentals & Shared Responsibility

*Variant A · build-first ("provision it and feel the line"). [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Cloud & Container Security** — *you don't truly know who owns a control until you're the one who had to configure it.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~4–6 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

## Why this matters
Every cloud breach investigation arrives at one question: was that the provider's failure or the
customer's? But you answer that question fastest if you've ever stood on the customer side and
configured the controls yourself — because then you know, from muscle memory, exactly which knobs were
yours to turn. This module builds that muscle. Provision a small workload from an empty account and the
shared-responsibility line stops being a diagram you memorise and becomes the set of decisions you were
forced to make. It's the frame every other cloud module hangs on, learned by doing rather than reading.

## Objective
Provision a minimal Meridian workload (an S3 bucket, an EC2 instance role with a trust policy, and a
scoped developer user) into an empty account from the CLI/Terraform, and for every control you set,
state whether securing it is the customer's job or the provider's — producing a reusable, hardened
**responsibility baseline** you could hand an engineering team.

## The core idea
The shared responsibility model is the cloud's load-bearing structure, and it's a *spectrum*, not a
binary. At one end, IaaS (a raw EC2 instance) is a rented rack: AWS secures and virtualises the
hardware; you own the OS, patches, firewall, keys, and everything on top. At the other, SaaS hands you
a running app and your surface shrinks to identity and data. PaaS (Lambda, RDS) sits between. The
mental model: **draw a horizontal line through the stack — everything above is yours, everything below
is the provider's — and the line slides with the service type.**

Here's the move this variant is built on: **that line is invisible until you provision.** Renting cloud
is like renting an apartment. The building's wiring, foundation, and exterior locks are the landlord's —
you will never touch them and you couldn't break them if you tried. But every appliance you plug in,
every window you leave open, every spare key you hand out, and every time you prop the lobby door for a
delivery — that's all you, and the lease says so in fine print nobody reads. When you *furnish the
apartment yourself*, you find out exactly which is which, because you're the one standing there deciding
whether to lock the window. Reading the lease teaches you less than moving in.

So the dangerous belief — **"the default is secure"** — is really the belief that the landlord locked
the windows for you. They didn't. AWS, GCP, and Azure ship permissive defaults in many places because
the alternative is blocking legitimate use; a fresh S3 bucket, a copy-pasted IAM policy, an over-trusting
role are all *your* responsibility the instant you create them, even though they feel like provider
territory. You learn this in your bones the first time you create a bucket and have to consciously decide
its public-access posture — nobody decided it for you.

One more split to carry forward: **control plane vs. data plane.** IAM governs who can call the API
(the control plane — auditable, CloudTrail-logged). Bucket policies, security groups, and object ACLs
govern what flows through the service (the data plane). Both are customer-owned, but they fail and are
logged differently — and when you provision, you set them in different places, which is the cleanest
way to feel the distinction. And because in the cloud the configuration *is* the artifact, the secure
baseline you build here isn't notes — it's code you commit, the first link in the infrastructure-as-code
chain this whole track compounds on.

## Learn (~3 hrs)

**Shared responsibility (~1 hr)**
- [AWS Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/) — the definitive primary source; read the full page and watch the boundary shift between EC2, RDS, and S3 as you read.
- [AWS S3 — Blocking public access](https://docs.aws.amazon.com/AmazonS3/latest/userguide/access-control-block-public-access.html) — read this *before* you create your bucket; it's the single control most often left in a default state. Note all four settings and what each blocks.

**Provisioning with the CLI / Terraform (~1.5 hrs)**
- [AWS CLI Getting Started](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html) — install and credential setup; the "install" and "configure" sections.
- [LocalStack + Terraform (`tflocal`)](https://docs.localstack.cloud/user-guide/integrations/terraform/) — how to point Terraform at a local simulated AWS so you can `apply` a baseline at zero cost. Skim the quickstart; you'll use `tflocal` in the lab.

**Threat framework orientation (~0.5 hr)**
- [MITRE ATT&CK for Cloud — Tactics overview](https://attack.mitre.org/matrices/enterprise/cloud/) — skim the tactic columns; each maps to a phase of an attack that crosses one of the responsibility layers you're about to provision.

## Key concepts
- The shared responsibility model as a spectrum (IaaS → PaaS → SaaS), not a binary split
- The line becomes legible when you *configure* each control, not when you read about it
- "Default is not secure" — a control you create is yours to harden the instant it exists
- Control plane (IAM/API) vs. data plane (bucket policy, security groups) — set in different places
- In the cloud the config *is* the artifact: your secure baseline is committed code, not notes

## AI acceleration
Ask a model to scaffold the Terraform or CLI to provision your workload — it's fast and mostly correct.
Then review it as an adversary would: models love to leave the very defaults this module is about —
a bucket without an explicit public-access block, an IAM statement with `Resource: "*"`, a security
group with `0.0.0.0/0`. The AI gives you a working baseline in minutes; *making it secure* is the part
you own. Diff what it generated against the hardened state you decided on, and be able to explain every
change.
