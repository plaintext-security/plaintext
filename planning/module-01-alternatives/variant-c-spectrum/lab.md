# Lab 01 — One Feature, Three Ways: Mapping the Sliding Line

*Variant C · compare-first. [← Back to the module concept](README.md)*

## Setup
This is a **reference lab** — it ships a one-command environment in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo. It uses
[LocalStack](https://localstack.cloud/) to simulate AWS locally — no cloud account or real credentials
required.

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/cloud/01-cloud-fundamentals
make up         # start LocalStack + seed all three deployment shapes
make shell      # drop into the lab container
make demo       # OPTIONAL: invokes the live Lambda upload path end to end
make down       # stop when done
```

**A note on what's live and what's modeled** (honesty matters here): in LocalStack, the **Lambda path
genuinely runs** — you'll invoke a function that writes to S3 and watch it work. The **EC2 path is
describe-only** (LocalStack CE mocks EC2; there's no real VM to SSH into), so you'll read its
configuration surface — the instance role, the security group, the AMI — rather than log into a box.
The **SaaS path** is an S3 static-website configuration standing in for a fully-hosted service. You're
comparing *responsibility surfaces*, and all three expose theirs through configuration — which is the
point.

> Everything runs locally against a simulated AWS environment you own. No real AWS account needed.

## Scenario
Meridian Financial needs the file-upload feature shipped, and the team is arguing about *how*: a
developer wants it on the EC2 box they already run, the architect wants a Lambda, and someone in
marketing found a no-code hosted form. Before they decide, you — the security engineer — produce the
one artifact that should drive the choice: a side-by-side map of exactly what Meridian would own, and
be on the hook for, in each option.

## Do
1. [ ] **IaaS — read the EC2 surface.** Enumerate the EC2 deployment: the instance role
   (`awslocal iam get-role`), its attached policies, the security group rules
   (`awslocal ec2 describe-security-groups`), and the AMI. List everything Meridian owns here — OS
   patching, the firewall, the SSH keys, the app, the role. This is the widest surface; write it out fully.

2. [ ] **PaaS — run the Lambda and find its surface.** Invoke the seeded upload function
   (`awslocal lambda invoke …`) and confirm the object lands in S3. Then enumerate *its* surface: the
   execution role (`awslocal lambda get-function` → role), the function's code and its bundled
   dependencies, and the event source. Note what just disappeared from your list (OS, patching, the
   host) and what concentrated (the role and the code are now nearly everything).

3. [ ] **SaaS-ish — inspect the hosted front.** Look at the S3 static-website configuration and its
   bucket policy (`awslocal s3api get-bucket-policy`, `get-public-access-block`). List the surface:
   essentially just *who can access* and *what data is exposed*. Note how small — and how unforgiving —
   this list is.

4. [ ] **Build the matrix.** Make a five-row × three-column table — rows: **compute, runtime, network,
   identity, data**; columns: **EC2, Lambda, Hosted** — and in each cell mark **C** (customer) or **P**
   (provider), with a word on the specific control. Watch the C's turn to P's as you move right across
   compute and runtime, while identity and data stay stubbornly **C** the whole way.

5. [ ] **Draw the conclusion.** Write the recommendation: which option gives Meridian the smallest
   attack surface, and — the part that proves you understood the module — why "smallest surface" is
   *not* "least responsibility," and what the one or two controls are that Meridian absolutely cannot
   get wrong in that option.

## Success criteria — you're done when
- [ ] You've enumerated the customer-owned surface for all three deployment shapes from their actual
  configuration (not from memory).
- [ ] The Lambda upload path runs and you've confirmed the object in S3.
- [ ] `responsibility-matrix.md` contains the 5×3 customer/provider table with a named control in each cell.
- [ ] Your conclusion identifies the lowest-surface option *and* names the concentrated controls that
  remain the customer's to get right.

## Deliverables
`responsibility-matrix.md` — the 5×3 matrix plus the recommendation paragraph. Commit it alongside the
seed data. Do not commit credentials, the uploaded test object, or any real account data.

## Automate & own it
**Required.** Write `surface.sh` (or `.py`) that takes a deployment shape (`ec2` | `lambda` | `hosted`)
and prints the customer-owned control checklist for it by querying LocalStack — e.g. for `lambda`, dump
the execution role policy and list the function's dependencies; for `hosted`, dump the bucket policy and
public-access-block. Have a model draft it; review every line and confirm the output matches the matrix
you built by hand. This becomes a reusable "what do I own in this deployment?" triage tool.

## AI acceleration
Ask a model to generate the 5×3 responsibility matrix for a file-upload feature across EC2/Lambda/hosted,
then check its work against what you actually enumerated. The high-value catch: models tend to mark
"runtime" as fully provider-owned for Lambda without flagging that *your dependencies* are still yours to
patch, and to mark "data" as provider-handled for the hosted option when the bucket policy is entirely
the customer's. Correcting those two cells is the whole lesson — note where the model moved the line to
the wrong side.

## Connects forward
The three points on this dial are the settings for the rest of the track: the EC2/IaaS surface is where
modules 02–04 (identity, IAM attack paths, network) live; the Lambda/PaaS surface is module 09
(Serverless Security); and the "identity and data are always yours" thread runs through every posture and
detection module. You'll return to this matrix whenever a later module asks "whose responsibility is this?"

## Marketable proof
> "I can map the shared-responsibility boundary across IaaS, PaaS, and SaaS deployments of the same
> feature, and explain why a smaller managed surface concentrates rather than removes the customer's
> security responsibility."

## Stretch
- Add a fourth column for a real managed service you haven't used (e.g. an API Gateway + Lambda combo or
  a managed database) and place its line on the dial.
- Re-run the Lambda path against a real AWS free-tier account and compare the cold-start/permission
  behaviour to LocalStack's.
