---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Cloud Secrets Management

*Companion to [Module 07 — Secrets Management & Detection](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Find what's already leaked (git history is forever)

```bash
trufflehog git file://.                      # scan the whole LOCAL git history, not just HEAD
trufflehog git https://github.com/org/repo   # scan a remote repo's full history
trufflehog filesystem ./path                 # scan files on disk
trufflehog git file://. --only-verified      # only report keys the provider API confirms are LIVE
git log -p -S 'AKIA'                          # find the commit that introduced an AWS key literal
gitleaks detect --source .                    # fast, config-driven history scan (regex-based)
```

- "Deleting" a committed secret in the next commit leaves it in history — the **only** fix is revoke + rotate.

## Stop the next leak at the keyboard (gitleaks pre-commit)

```bash
gitleaks protect --staged                     # scan STAGED changes — block the secret before it commits
gitleaks detect --source . --report-format sarif -o gitleaks.sarif   # CI gate output
```

```yaml
# .pre-commit-config.yaml
- repo: https://github.com/gitleaks/gitleaks
  rev: v8.18.0
  hooks:
    - id: gitleaks
```

## AWS Secrets Manager — store with an IAM-gated read

```bash
aws secretsmanager create-secret --name prod/db --secret-string '{"user":"app","pass":"..."}'
aws secretsmanager get-secret-value --secret-id prod/db --query SecretString --output text
aws secretsmanager put-secret-value --secret-id prod/db --secret-string '{...}'   # new version
aws secretsmanager rotate-secret --secret-id prod/db --rotation-lambda-arn <arn>  # managed rotation
aws secretsmanager describe-secret --secret-id prod/db     # see rotation config + last-rotated
```

```json
// IAM: only the app role can read exactly ONE secret ARN — Resource-scoped, no wildcards
{ "Effect": "Allow", "Action": "secretsmanager:GetSecretValue",
  "Resource": "arn:aws:secretsmanager:us-east-1:111122223333:secret:prod/db-*" }
```

## AWS SSM Parameter Store — the lighter-weight alternative

```bash
aws ssm put-parameter --name /prod/db/pass --type SecureString --value 's3cr3t'   # KMS-encrypted
aws ssm get-parameter --name /prod/db/pass --with-decryption --query Parameter.Value --output text
aws ssm get-parameters-by-path --path /prod/db/ --with-decryption --recursive
```

- `SecureString` is encrypted at rest with KMS; without `--with-decryption` you get back ciphertext.

## HashiCorp Vault — leased, dynamic credentials (the real fix)

```bash
vault kv put secret/prod/db pass=s3cr3t       # store a static KV secret (encrypted at rest)
vault kv get secret/prod/db                    # read it back (audited, policy-gated)

# Dynamic DB creds: Vault mints a NEW Postgres user per request with a short lease
vault read database/creds/app-role            # returns username/password + a lease_id + TTL
vault lease renew <lease_id>                   # extend the lease
vault lease revoke <lease_id>                  # kill the credential now (user is dropped)
vault write database/rotate-root/my-postgres  # rotate the master password — no human ever knows it
```

- A leased credential is destroyed at lease end, so a **leaked copy expires on its own in minutes.**

## The AWS-native "no static key" pattern

```bash
# An EC2/Lambda/ECS execution ROLE *is* the credential — minted and rotated by STS, no key at rest
aws sts get-caller-identity                    # confirm you're using the instance/task role, not a key
curl http://169.254.169.254/latest/meta-data/iam/security-credentials/<role>   # IMDS-provided temp creds
```

## Gotchas worth remembering

- **A static secret fails open; a leased one fails closed.** Rotation invalidates a key *going forward*,
  but the clock started when it leaked and the data is already gone — which is why rotating Uber's leaked
  key contained nothing. The fix is changing *what the secret is*, not how well you hide it.
- **A secrets manager holding a long-lived secret still fails open.** Encryption-at-rest and an IAM wall
  are necessary, not sufficient — a stored static credential is still valid until a human notices. Only a
  short lease makes a leak self-expiring.
- **An env var injected at deploy is a slower hardcode.** It lives in the process, the deploy config, and
  often an image layer. The app must hold *no* secret — it authenticates to the broker and *fetches* at
  runtime.
- **"No human knows the credential" beats "the credential is encrypted."** After `rotate-root`, no person
  possesses the master password — you can't leak what you don't have.
- **Verify an IAM/Vault policy by testing that it DENIES, not by reading it.** Confirm the role can read
  the one ARN/path and *nothing else* — a wildcard `Resource` quietly re-opens everything.
- **Rotation procedures differ per credential type.** An AWS IAM key, a GitHub PAT, and a Postgres
  password are three different processes — don't let an AI-drafted ticket conflate them.
