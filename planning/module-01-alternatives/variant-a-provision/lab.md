# Lab 01 — Provision a Workload & Map the Responsibility Line

*Variant A · build-first. [← Back to the module concept](README.md)*

## Setup
This is a **reference lab** — it ships a one-command environment in the companion
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs) repo. It uses
[LocalStack](https://localstack.cloud/) to simulate an AWS account locally — no cloud account or real
credentials required. Unlike the audit variant, **the account starts empty**: you provision it.

```bash
git clone https://github.com/plaintext-security/plaintext-labs
cd plaintext-labs/cloud/01-cloud-fundamentals
make up         # start LocalStack (empty account) + the lab container
make shell      # drop in; awslocal / tflocal point at LocalStack
make demo       # OPTIONAL: shows one worked, hardened reference baseline
make down       # stop when done
```

The container bundles `awslocal` (a drop-in for `aws`) and `tflocal` (a drop-in for `terraform`),
both pointed at LocalStack. A `starter/` directory holds a deliberately *naive* `main.tf` — a
copy-pasted-from-a-blog baseline that "works" but is wide open. You'll harden it.

> Everything runs locally against a simulated AWS environment you own. No real AWS account needed.

## Scenario
You are Meridian Financial's first cloud engineer. Marketing needs a file-upload backend: a Python API
on EC2, writing user uploads to an S3 bucket, with one developer (`dev-alice`) who needs to deploy and
debug it. There is no platform team, no landing zone, no guardrails — just you and an empty account.
Stand the workload up, and as you set each control, record who owns its security. The naive `starter/`
config is what a hurried engineer would ship; your job is to ship the version that doesn't end up in an
incident review.

## Do
1. [ ] **Apply the naive baseline and read what you just created.** From `make shell`, run
   `tflocal init && tflocal apply` in `starter/`. Then enumerate what exists exactly as an auditor
   would: `awslocal s3api list-buckets`, `awslocal iam list-users`, `awslocal iam list-roles`. You're
   now looking at *your own* work — note your first impressions of what's exposed.

2. [ ] **Harden the bucket, and name the owner.** Check the bucket's public-access posture
   (`awslocal s3api get-public-access-block`). Set all four block settings on
   (`put-public-access-block`) — or fix it in `main.tf` and re-apply. Write one line: *who is
   responsible for this bucket being private — you or AWS?* (Hint: AWS will happily host a public
   bucket; the block is yours to turn on.)

3. [ ] **Scope the EC2 instance role's trust policy.** Inspect the role's `AssumeRolePolicyDocument`
   (`awslocal iam get-role --role-name <name>`). Confirm only `ec2.amazonaws.com` is trusted — and
   confirm the *permissions* policy attached to it isn't `Resource: "*"`. Tighten it to just the
   uploads bucket. Record: the trust boundary is the control plane; who owns it?

4. [ ] **Author `dev-alice`'s policy least-privilege from the start.** The naive version grants
   `s3:*` on `*`. Replace it with only the actions and the single resource she needs. This is the
   inverse of the usual lab — you're *writing* the good policy, not finding the bad one.

5. [ ] **Prove the line holds.** Use `awslocal iam simulate-principal-policy` to show that `dev-alice`
   is *allowed* to put an object in the uploads bucket but *denied* on a second bucket you create as a
   decoy. The simulator evaluates your real policy documents — this is your proof the customer-side
   control works.

6. [ ] **Write the responsibility baseline.** Produce `responsibility-baseline.md`: each control you
   set, which plane it lives on (control vs. data), and one sentence on customer-vs-provider ownership.

## Success criteria — you're done when
- [ ] `tflocal apply` produces a workload where the uploads bucket has all four public-access blocks on.
- [ ] The EC2 role trusts only `ec2.amazonaws.com` and its permissions are scoped to the uploads bucket
  (no `Resource: "*"`).
- [ ] `dev-alice`'s policy grants only the needed actions on the single bucket, and
  `simulate-principal-policy` shows `allowed` on the uploads bucket and `explicitDeny`/`implicitDeny`
  on the decoy.
- [ ] `responsibility-baseline.md` maps every control to its plane and its owner with a one-line rationale.

## Deliverables
The hardened `main.tf` (or `provision.sh`) **and** `responsibility-baseline.md`. Commit both. Do not
commit any real credentials, state files, or `.tfstate` (it can contain secrets — it's gitignored).

## Automate & own it
**Required.** Your hardened `main.tf`/`provision.sh` *is* the automation — it must rebuild the entire
secure baseline idempotently from empty (`tflocal destroy && tflocal apply` returns to the proven
state). Have a model draft the first pass; you review every resource for the permissive defaults it
leaves in and confirm `simulate-principal-policy` still proves the line holds. This is the seed of the
infrastructure-as-code baseline you extend in modules 06, 12, and 13.

## AI acceleration
Hand a model your hardened `main.tf` and ask: "Which of these controls is the customer's responsibility
under the AWS shared responsibility model, and which would AWS own?" It produces a fast first-pass
matrix — then verify each row, because models routinely misattribute the boundary (e.g. claiming AWS
secures your IAM policy logic, which is entirely yours). Note every row you had to correct.

## Connects forward
The baseline you provisioned becomes the *target* for module 02 (Cloud Identity & IAM), where
`cloudfox` enumerates exactly what you built, and module 05 (Posture Auditing), where `prowler` scores
it against a benchmark. Because you built it as code, module 06 (IaC Security) can gate it with Checkov
in CI — you'll be scanning your own Terraform.

## Marketable proof
> "I can provision a cloud workload from scratch as code, harden each control to least privilege, and
> articulate the shared-responsibility boundary for every resource I created — proving the customer-side
> controls hold with policy simulation."

## Stretch
- Re-apply against a real AWS free-tier account (`tflocal` → `terraform`, same config). Watch which
  defaults differ — AWS now blocks public buckets account-wide by default, a real example of the
  provider moving the line *toward* safer.
- Add an `aws_iam_account_password_policy` and an MFA-required condition to `dev-alice`, then re-simulate.
