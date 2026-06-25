# Lab 01 — Blast Radius of a Leaked Key

*Variant B · attack-first. [← Back to the module concept](README.md)*

## Setup
This is a **reference lab** — it ships a one-command environment in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo. It uses
[LocalStack](https://localstack.cloud/) to simulate the Meridian AWS account locally — no cloud account
or real credentials required. The account is seeded with the same misconfigured Meridian workload as the
audit lab, but you approach it differently: you hold one stolen key and work outward.

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/cloud/01-cloud-fundamentals
make up         # start LocalStack + seed the Meridian account
make shell      # drop into the lab container
make demo       # OPTIONAL: shows one worked blast-radius walkthrough
make down       # stop when done
```

The container ships the leaked credential as the profile `dev-alice` (the key that "leaked"). You act
**as that principal**, not as an admin. A note on realism: LocalStack does not *enforce* IAM, so calls
won't be rejected for you — you'll determine what `dev-alice` can and cannot do with
`awslocal iam simulate-principal-policy`, which evaluates AWS's real policy logic against the seeded
documents. That tells you which walls would hold in a real account, and *why*.

> Only test systems you own or have explicit written permission to test. This lab attacks a simulated
> account you run locally. The same enumeration against any account you do not own is unauthorised access.

## Scenario
A Meridian developer pushed a personal automation script to a public GitHub repo with their AWS access
key still in it. A bot found it in under a minute (this is real — leaked keys are scraped within
seconds). You're the responder. Before you rotate the key, you need the blast radius: assume you are the
attacker who grabbed it, and map exactly how far into Meridian's account this one credential reaches —
then turn that map into a shared-responsibility readout for the engineering team.

## Do
1. [ ] **Identify the foothold.** As `dev-alice`, confirm who you are
   (`awslocal sts get-caller-identity`) and enumerate your own grants:
   `awslocal iam list-attached-user-policies --user-name dev-alice`, then pull the policy document.
   What does this key claim it can do?

2. [ ] **Test the data-plane doors.** The policy grants `s3:*` on `*`. Use
   `awslocal iam simulate-principal-policy` to ask whether `dev-alice` is allowed to `s3:GetObject` on
   (a) the intended `meridian-uploads-dev` bucket and (b) any *other* bucket. Which door holds, which
   gives — and is that wall provider-enforced or a customer choice?

3. [ ] **Find the control-plane escalation.** Look for `iam:PassRole` in the policy. Simulate whether
   `dev-alice` can `iam:PassRole` the `MeridianEC2InstanceRole` and `ec2:RunInstances`. If both are
   allowed, the key can launch compute *as a more privileged role* — write down the hop. This is the
   classic cloud privesc primitive; you'll automate finding it in module 03.

4. [ ] **Probe a wall that should hold.** Pick something a real AWS account would deny no matter the
   policy — e.g. reading another tenant's resource, or an action the policy never grants like
   `iam:CreateUser`. Simulate it and confirm the decision is `implicitDeny`. That door is the
   provider's (or the absence of a grant) — note why it's a different *kind* of wall.

5. [ ] **Classify every wall.** For each door you tested, record: open or closed, control-plane or
   data-plane, and provider-enforced vs. customer-owned. The pattern that emerges *is* the shared
   responsibility model for this account.

6. [ ] **Write the blast-radius readout.** Produce `blast-radius.md`: the reachable resources, the
   escalation hop, and the responsibility classification — the readout you'd hand Meridian before
   rotating the key.

## Success criteria — you're done when
- [ ] You can state `dev-alice`'s effective reach and name the specific statement (`s3:* / *`) that
  makes it over-broad.
- [ ] `simulate-principal-policy` output shows the `PassRole` + `RunInstances` escalation hop is
  `allowed`, and you've described what an attacker gains from it.
- [ ] You've identified at least one wall that holds (`implicitDeny`/`explicitDeny`) and explained why
  it's provider/absent-grant rather than a customer default.
- [ ] `blast-radius.md` classifies every tested door as open/closed × control/data × customer/provider.

## Deliverables
`blast-radius.md` — the reachability map and the responsibility classification. Commit it alongside the
seed `data/account.json`. Do not commit any real credentials or real account data.

## Automate & own it
**Required.** Write `blast-radius.sh` (or `.py`) that takes a username and prints its blast radius
non-interactively: dump the attached policies, then run `simulate-principal-policy` for a checklist of
high-value actions (`s3:GetObject` on every bucket, `iam:PassRole`, `ec2:RunInstances`,
`iam:CreateUser`) and print `OPEN`/`CLOSED` per door. Have a model draft it from your command history;
read every line and confirm it reproduces your manual findings (`make demo` should invoke it). This is
the kernel of the privilege-mapping you scale with `pmapper`/`cloudfox` in modules 02–03.

## AI acceleration
Paste `dev-alice`'s policy JSON into a model and ask: "If this key leaked, what's the blast radius and
which ATT&CK techniques does it enable?" You'll get a fast, mostly-right hypothesis — then confirm every
claimed reach with `simulate-principal-policy`, because the model reads the *written* policy, not the
*evaluated* permission once boundaries and resource policies layer in. Note anything it over- or
under-claimed.

## Connects forward
The foothold-and-trace move here is exactly what module 02 (Cloud Identity & IAM) automates with
`cloudfox`, and the `PassRole` escalation hop is the first edge in the privilege-escalation graph you
build with `pmapper` in module 03. The same leaked-key scenario reappears in module 14 as a detonated
attack technique you'll then detect.

## Marketable proof
> "Given a leaked cloud credential, I can map its blast radius — reachable data, control-plane
> escalation paths — using IAM policy simulation, and classify each boundary as customer- or
> provider-owned under the shared responsibility model."

## Stretch
- Run the same blast-radius script against a real AWS free-tier account using an intentionally
  over-broad test user (then delete it). The decisions are now *enforced*, not simulated — compare.
- Map your findings onto the [ATT&CK for Cloud](https://attack.mitre.org/matrices/enterprise/cloud/)
  privilege-escalation techniques and cite the technique IDs in `blast-radius.md`.
