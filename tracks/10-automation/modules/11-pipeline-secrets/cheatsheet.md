# Cheat sheet — Pipeline Secrets & OIDC Federation

*Companion to [Module 11 — Secrets Handling in Pipelines (OIDC)](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> The most secure secret is the one that doesn't exist. OIDC replaces a stored long-lived key with a
> per-run JWT the runner trades at STS for **already-expiring** credentials. The security lives in the
> **IAM trust policy's `sub` condition**, not in the pipeline YAML.

## GitHub Actions — federate, store no key

```yaml
permissions:
  id-token: write              # REQUIRED — lets the job request the OIDC JWT
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@<pinned-sha>   # v4
    with:
      role-to-assume: arn:aws:iam::111122223333:role/gha-deploy
      aws-region: us-east-1
      # NO aws-access-key-id / aws-secret-access-key — nothing stored is the point

  - run: aws sts get-caller-identity            # prove you assumed the role
```

## The IAM trust policy (this is the real control)

```json
{
  "Effect": "Allow",
  "Principal": { "Federated": "arn:aws:iam::111122223333:oidc-provider/token.actions.githubusercontent.com" },
  "Action": "sts:AssumeRoleWithWebIdentity",
  "Condition": {
    "StringEquals": {
      "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
    },
    "StringLike": {
      "token.actions.githubusercontent.com:sub": "repo:my-org/my-repo:ref:refs/heads/main"
    }
  }
}
```

- **`aud` must be pinned** (`sts.amazonaws.com`) and **`sub` scoped to the exact repo/ref**. Loosen
  `sub` to `repo:my-org/*:*` and *any fork or branch* of the org can mint production credentials.

## Register the provider + role (one-time, per account)

```bash
aws iam create-open-id-connect-provider \
  --url https://token.actions.githubusercontent.com \
  --client-id-list sts.amazonaws.com

aws iam create-role --role-name gha-deploy \
  --assume-role-policy-document file://trust-policy.json
aws iam attach-role-policy --role-name gha-deploy \
  --policy-arn arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess   # least privilege on the deploy role

aws iam get-role --role-name gha-deploy       # inspect the trust policy that scopes it
```

## The raw exchange (what the action does under the hood)

```bash
aws sts assume-role-with-web-identity \
  --role-arn arn:aws:iam::111122223333:role/gha-deploy \
  --role-session-name gha-run \
  --web-identity-token "$OIDC_JWT" \
  --duration-seconds 900                        # short-lived; STS returns temp creds + an expiry
```

## Prove no static secret remains

```bash
grep -rInE 'AKIA[0-9A-Z]{16}|aws_secret_access_key' .github/   # should find nothing in the OIDC pipeline
aws sts get-caller-identity                                    # the assumed role, not a stored user
```

## Gotchas worth remembering

- **The `sub` condition IS the security boundary.** A passing `make oidc` / green deploy with a
  wildcard `sub` (`repo:org/*:*`) is *worse* than the static key you removed — you replaced one leaked
  secret with a standing grant any fork of the org can assume, and it looks like a success.
- **Pin `aud` too.** Without `aud = sts.amazonaws.com` the confused-deputy surface widens — the token's
  audience is what stops it being replayed against a different relying party.
- **`id-token: write` is opt-in and per-job.** Omit it and the OIDC request fails; grant it only on the
  job that federates, never workflow-wide.
- **Least-privilege the deploy role, not just the trust.** Scoping *who* can assume it is half the job;
  the role's attached policy decides *what* they can do once in. Grant the minimum for the deploy.
- **OIDC creds are already expiring — nothing to rotate, nothing to leak long-term.** A JWT printed in
  a log is dead within the session; an `AKIA…` key printed in a log is a live incident until revoked.
- **Removing the stored key is only half the refactor — the other half is proving it's gone** (grep the
  workflow, confirm the caller identity is the assumed role). No `AKIA…`, no `aws_secret_access_key`.
