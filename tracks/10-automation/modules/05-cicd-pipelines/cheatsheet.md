---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — CI/CD Pipelines & Gates (GitHub Actions)

*Companion to [Module 05 — CI/CD Pipelines & Gates](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The gate tools (each fails non-zero → blocks the merge)

```bash
gitleaks detect --source . --redact               # scan history for committed secrets
gitleaks detect --no-git --source .               # scan the working tree (files, not commits)
gitleaks git --log-opts="-1"                       # scan only the latest commit range

checkov -d . --compact                             # IaC misconfig scan (see Module 03)

syft dir:. -o spdx-json > sbom.spdx.json           # generate an SBOM from a directory
syft <image>:<tag> -o cyclonedx-json               # SBOM from a built image
```

## A minimal, hardened workflow

```yaml
name: security-gates
on: [push, pull_request]

permissions:
  contents: read                    # least privilege — grant only what the job needs

jobs:
  scan:
    runs-on: ubuntu-latest
    steps:
      # PIN to a full commit SHA, not a moving tag like @v4
      - uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683   # v4.2.2
        with:
          fetch-depth: 0            # gitleaks needs full history to scan commits

      - name: gitleaks
        run: gitleaks detect --source . --redact --exit-code 1
```

## OIDC — mint cloud creds, store no key

```yaml
permissions:
  id-token: write                   # REQUIRED to request the OIDC JWT
  contents: read

steps:
  - uses: aws-actions/configure-aws-credentials@<pinned-sha>
    with:
      role-to-assume: arn:aws:iam::111122223333:role/gha-deploy
      aws-region: us-east-1
      # no aws-access-key-id / aws-secret-access-key — that's the point
```

## GITHUB_TOKEN & secrets

```yaml
permissions:
  contents: read
  pull-requests: write              # only the scopes this workflow actually uses

# use secrets via env, never echo them
env:
  API_TOKEN: ${{ secrets.API_TOKEN }}
```

## Gotchas worth remembering

- **Pin actions to a full commit SHA, not a tag.** `@v4` and even `@v4.2.2` are mutable refs the
  author can move — a compromised or re-pointed tag runs attacker code on your runner (the SolarWinds
  / tj-actions class of supply-chain hit). Pin the 40-char SHA and note the version in a comment.
- **Least-privilege the `GITHUB_TOKEN`.** It defaults to broad write scopes. Set top-level
  `permissions: contents: read` and add back only what a job needs — a leaked token from a
  compromised dependency can then do far less.
- **The runner is a high-value target.** It holds every secret and runs code from every push (Codecov
  2021). Never run untrusted PR code with secrets available — `pull_request_target` exposes them; keep
  it off forks, or gate it behind an environment approval.
- **`id-token: write` is opt-in and per-job.** Without it the OIDC request fails; grant it only in the
  job that federates, not workflow-wide.
- **Exit code is the gate.** A tool that prints findings but exits 0 doesn't block anything —
  `gitleaks ... --exit-code 1`, `checkov --soft-fail=false`. Assert the failure, then prove the gate
  actually stops a bad merge (run it red on purpose).
- **Secrets don't reach forked-PR runs** by design — don't "fix" a failing fork build by loosening that.
