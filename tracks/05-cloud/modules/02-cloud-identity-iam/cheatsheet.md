---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — AWS IAM & policy simulation

*Companion to [Module 02 — Cloud Identity & IAM](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Who am I, what can I reach

```bash
aws sts get-caller-identity                       # who is this key? account, ARN, userId
aws iam list-users                                # every user in the account
aws iam list-roles                                # every role (assumable identities)
aws iam get-account-authorization-details          # ONE dump: users, roles, groups, all policies
```

## Enumerate a principal's grants

```bash
aws iam list-attached-user-policies --user-name dev-alice   # managed policies on the user
aws iam list-user-policies --user-name dev-alice            # inline policy names
aws iam get-user-policy --user-name dev-alice --policy-name p # inline policy body

# managed policy → its live default version document
aws iam get-policy --policy-arn arn:aws:iam::111122223333:policy/dev
aws iam get-policy-version --policy-arn <arn> --version-id v3

# a role's trust policy — WHO is allowed to assume it (the federation wall)
aws iam get-role --role-name AdminRole --query 'Role.AssumeRolePolicyDocument'
```

## Prove the reach — simulate-principal-policy

This runs **AWS's real evaluation logic** and returns `allowed` / `explicitDeny` / `implicitDeny`.

```bash
# does dev-alice's over-broad policy actually permit the dangerous action?
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::111122223333:user/dev-alice \
  --action-names iam:PassRole s3:DeleteObject ec2:RunInstances \
  --resource-arns "*"

# scope the sim to a specific resource (PassRole a specific admin role)
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::111122223333:user/dev-alice \
  --action-names iam:PassRole \
  --resource-arns arn:aws:iam::111122223333:role/AdminRole

# read only the verdict, not the whole envelope
aws iam simulate-principal-policy --policy-source-arn <arn> \
  --action-names s3:DeleteObject --resource-arns "*" \
  --query 'EvaluationResults[].{action:EvalActionName,decision:EvalDecision}'
```

- `simulate-custom-policy` tests a policy *document you paste* before it's attached — useful for
  validating the least-privilege rewrite before you apply it.

## The escalation pair to always check

```bash
# iam:PassRole + a launch action = admin. Simulate BOTH; either denied breaks the chain.
aws iam simulate-principal-policy --policy-source-arn <user-arn> \
  --action-names iam:PassRole ec2:RunInstances --resource-arns "*"

# self-grant primitives worth a second look
#   iam:CreateAccessKey  iam:CreatePolicyVersion  iam:AttachUserPolicy  iam:PutUserPolicy
```

## Read the verdict — the evaluation rulebook

```
explicit Deny   >   Allow   >   implicit (default) Deny
```

- No matching `Allow` → `implicitDeny` (default-deny).
- A matching `Allow` → `allowed`.
- Any matching `Deny` anywhere (identity / resource / SCP / boundary / session) → `explicitDeny`,
  and it wins over every `Allow`.

## Author the least-privilege cut, then re-simulate

```bash
# a scoped policy: keep the legit action, kill the dangerous reach
cat > fix.json <<'JSON'
{ "Version": "2012-10-17",
  "Statement": [
    { "Effect": "Allow", "Action": "s3:GetObject", "Resource": "arn:aws:s3:::dev-bucket/*" },
    { "Effect": "Deny",  "Action": "iam:PassRole", "Resource": "*" }
  ] }
JSON
aws iam put-user-policy --user-name dev-alice --policy-name least-priv --policy-document file://fix.json
# then re-run simulate-principal-policy: dangerous action → explicitDeny, legit action → allowed
```

## Gotchas worth remembering

- **A policy's name is not its boundary.** "dev" scoped `s3:*` on `*` reads and deletes *every*
  bucket. Read `Action` × `Resource`; the moment either is `*`, the label means nothing.
- **The escalation hides in composition, not in one line.** No single statement says "admin," but
  `iam:PassRole` on `*` plus `ec2:RunInstances` does. Simulate the *pair*, not each in isolation.
- **A finding is a hypothesis until `simulate-principal-policy` confirms it.** An SCP, permission
  boundary, or `Deny` you didn't read may already cap the grant — the simulator sees the full chain.
- **The trust policy is a separate wall.** `"Principal": {"AWS": "...:root"}` trusts the *whole
  account*, not one identity; an OIDC trust with no `sub` condition trusts every workflow. Check who
  can *assume* a role, not just what the role can do.
- **"Fixed" means the sim flips.** The dangerous action must return `explicitDeny`/`implicitDeny`
  *and* the legitimate action must still return `allowed` — cut the reach, don't break the job.

> Only enumerate and simulate accounts you own or have explicit written permission to assess.
