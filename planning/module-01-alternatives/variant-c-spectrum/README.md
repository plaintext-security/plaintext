# Module 01 — Cloud Fundamentals & Shared Responsibility

*Variant C · compare-first ("the spectrum, three ways"). [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**Cloud & Container Security** — *ship the same feature three ways and watch the responsibility line slide.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~4–6 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

## Why this matters
"Who owns what" is the question behind every cloud breach investigation, and the honest answer is
*"it depends on the service."* The same feature — let a user upload a file — has a completely different
responsibility split depending on whether you run it on a VM, a function, or a managed service. Engineers
who only ever shipped one way carry a fixed mental picture of the boundary and get blindsided when it
moves. This module inoculates against that by having you ship one feature three ways and read the line in
each. It's the frame the whole track hangs on, taught as the thing it actually is: a sliding scale.

## Objective
Deploy or model the *same* file-upload feature three ways — on EC2 (IaaS), as a Lambda writing to S3
(PaaS), and as an S3-hosted static front (SaaS-ish) — and build a side-by-side responsibility matrix
across compute, runtime, network, identity, and data, articulating exactly where the customer/provider
line sits in each and why "more managed" does not mean "less responsibility."

## The core idea
The shared responsibility model is usually drawn as one diagram, which hides its most important
property: **it isn't one diagram, it's a dial.** Picture the same dinner three ways. *Cooking at home*
(IaaS) — you buy the ingredients, own the kitchen, manage the fire; the utility company only guarantees
gas and water. *A meal kit* (PaaS) — someone portioned and shipped the ingredients and wrote the recipe;
you still cook it, plate it, and you alone are accountable for who you invited and whether anyone's
allergic. *A restaurant* (SaaS) — they cook and serve; your job shrinks to choosing the place, who sits
at your table, and what you say in front of them. As you slide from home to restaurant, **fewer steps
are yours — but the ones that remain get more consequential, not less.** At a restaurant you can't burn
the food, but a careless word at the table is now your *entire* exposure.

That's the counter-intuitive judgment this module exists to install: **more managed shrinks your
surface but concentrates it.** On EC2 you own a sprawling surface — OS patches, the firewall, the SSH
keys, the app, the IAM role — and it's easy to assume the managed alternatives are simply "safer." But
on Lambda, AWS runs the OS and runtime, so your *entire* remaining surface is the execution role, the
function code (and its dependencies — AWS does **not** patch your `requirements.txt`), and the event
that triggers it. On a fully-hosted front, identity and data configuration is *all you have* — and all
of it matters. The smallest surface is also the least forgiving: there's nowhere for a mistake to hide.

So **"the default is not secure"** lands differently at each point on the dial. On IaaS the dangerous
default is a wide-open security group; on PaaS it's an over-permissive execution role or a vulnerable
dependency; on SaaS it's a public bucket policy or an over-shared identity. Same principle — *a control
you own, left in its permissive default* — but it shows up in a different place each time, which is
exactly why engineers who only know one shape miss it in the others. And the **control plane vs. data
plane** split (IAM/API governs who can call; bucket policies and security groups govern what flows)
runs through all three — but the proportion shifts: on SaaS, the control plane *is* nearly the whole
job. Reading the line move across the three is the durable skill; every later module in this track is
standing at one point on this dial.

## Learn (~3 hrs)

**The model as a spectrum (~1 hr)**
- [AWS Shared Responsibility Model](https://aws.amazon.com/compliance/shared-responsibility-model/) — the primary source; read it with the dial in mind and map each "customer" box to EC2 vs. Lambda vs. a managed service.
- [CISA Cloud Security Technical Reference Architecture (TRA), section 2](https://www.cisa.gov/resources-tools/resources/cloud-security-technical-reference-architecture) — a vendor-neutral synthesis that maps the model onto concrete service tiers; section 2 is the spectrum made explicit.

**The three service shapes (~1.5 hrs)**
- [How Lambda works — execution model](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtime-environment.html) — read what AWS runs *for* you (the runtime, scaling, the host) so you can see precisely what's left to you (the role, the code, the deps).
- [Hosting a static website on S3](https://docs.aws.amazon.com/AmazonS3/latest/userguide/WebsiteHosting.html) — the SaaS-end of the dial; note that the *only* security surface here is the bucket policy and who you grant.

**Threat framework orientation (~0.5 hr)**
- [MITRE ATT&CK for Cloud — Tactics overview](https://attack.mitre.org/matrices/enterprise/cloud/) — skim the tactics and ask, for each deployment shape, which ones even apply to *your* side of the line.

## Key concepts
- The shared responsibility model is a dial (IaaS → PaaS → SaaS), not a single diagram
- "More managed" shrinks your surface but *concentrates* it — the smallest surface is least forgiving
- The same feature has a different customer/provider split per deployment shape
- "Default is not secure" appears at a different layer in each shape (SG → exec role/deps → bucket policy)
- Control plane vs. data plane runs through all three, but the proportion shifts toward identity as you go managed

## AI acceleration
Ask a model to fill your three-column responsibility matrix (EC2 vs. Lambda vs. hosted) for a file-upload
feature. It's a strong first draft and a real time-saver — but audit it for the subtle misattributions
that matter most here: models frequently claim AWS "secures the runtime" in a way that implies it patches
your *application dependencies* (it does not), or that a managed service "handles access control" when the
bucket policy is entirely yours. The value is in catching exactly the boundary errors this module is
about. Correct each row and be able to defend it.
