---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — CI/CD Pipeline Security

*Companion to [Module 08 — CI/CD Pipeline Security](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## gitleaks — secrets in the pipeline

```bash
gitleaks detect --source .                   # scan the full git history for committed secrets
gitleaks detect --source . --redact          # mask the secret value in the report
gitleaks protect --staged                     # scan staged changes — block before commit (pre-commit/CI)
gitleaks detect --report-format sarif -o gitleaks.sarif   # SARIF for PR annotations
gitleaks detect --config .gitleaks.toml       # custom allowlist / rules
```

## trivy — image CVEs and SBOM

```bash
trivy image myapp:1.0                          # scan a built image for known CVEs
trivy image --severity HIGH,CRITICAL myapp:1.0 # only what would fail a gate
trivy image --exit-code 1 --severity CRITICAL myapp:1.0   # non-zero exit → fail the build
trivy image --format cyclonedx -o sbom.json myapp:1.0     # emit a CycloneDX SBOM
trivy fs --scanners vuln,secret,misconfig .    # scan the repo before the image is even built
```

## GitHub Actions OIDC — short-lived creds, no standing secrets

```yaml
permissions:
  id-token: write        # REQUIRED to mint the OIDC token — without it, no federation
  contents: read

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: aws-actions/configure-aws-credentials@v4   # (pin to a SHA in real use)
        with:
          role-to-assume: arn:aws:iam::111122223333:role/gha-deploy
          aws-region: us-east-1
          # NO aws-access-key-id / secret — the OIDC token is exchanged for temp STS creds
```

- The IAM role's **trust policy** must condition on `token.actions.githubusercontent.com` *and* a `sub`
  claim scoped to your repo/branch — an unscoped `sub` trusts every workflow from GitHub.

## Pin everything to an immutable digest (SUNBURST's lesson)

```yaml
# BAD — a mutable tag can be re-pointed to malicious code silently
- uses: actions/checkout@v4

# GOOD — pinned to a commit SHA; what runs can't change under you (this repo's T23)
- uses: actions/checkout@11bd71901bbe5b1630ceea73d27597364c9af683   # v4.2.2
```

```dockerfile
FROM node:20-alpine@sha256:...   # pin base images by digest too, not just a tag
```

## Least-privilege workflow hygiene

```yaml
permissions: {}          # default-deny at the top; grant per-job only what each job needs
jobs:
  build:
    permissions:
      contents: read     # this job reads code and nothing more
```

- Never interpolate untrusted input directly into a `run:` block — `${{ github.event.pull_request.title }}`
  in a shell line is expression injection. Pass it via `env:` and quote it.

## Build provenance / attestation — WHAT was built, not just WHO signed

```yaml
permissions:
  id-token: write
  attestations: write      # required to emit a signed provenance attestation
steps:
  - uses: actions/attest-build-provenance@v1
    with:
      subject-path: dist/myapp
```

```bash
gh attestation verify dist/myapp --owner my-org   # demand provenance BEFORE deploy
```

## Gotchas worth remembering

- **Signing proves WHO built it, not WHAT they built.** SolarWinds' signature verified perfectly on a
  backdoored binary because the signing step trusts whatever the build step hands it. A green signature
  (or a clean scan) is not proof of integrity — demand **provenance**, an attestation tying the artifact
  to its source commit and builder.
- **The build step is the highest-trust, least-watched stage.** Code review, branch protection, and
  signed commits guard the *source* arrow; SUNBURST walked in *after* checkout and *before* signing.
  The dangerous gap is the distance between trusted source and trusted signature.
- **A mutable tag is a supply-chain hole.** `@v4` can be silently re-pointed; pin every `uses:` and base
  image to an immutable SHA/digest so a re-tag can't change what runs.
- **OIDC over long-lived secrets.** A standing `AWS_SECRET_ACCESS_KEY` in repo secrets is a credential a
  compromised build can exfiltrate; a per-run OIDC token expires in minutes and is scoped by the role's
  trust policy. But an unscoped `sub` condition trusts every workflow — scope it to your repo/branch.
- **The find-half scans inputs; provenance attests the process.** gitleaks + trivy + SBOM are necessary
  but not sufficient — they'd all have passed the SolarWinds build. Confirm your hardened workflow
  actually *fails* a build-time-injection-shaped attack, not just the linters.
- **AI misses multi-job data-flow injection.** A tainted early step feeding a later privileged job is a
  real path a model won't flag, and it rarely volunteers provenance — direct it to add attestation as the gate.
