# Cheat sheet — IaC Security Scanning

*Companion to [Module 06 — Infrastructure-as-Code Security](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Checkov — scan Terraform/HCL

```bash
checkov -d .                               # scan a whole directory (recurse the tree)
checkov -f main.tf                         # scan a single file
checkov -d . --framework terraform         # limit to one IaC framework (also: cloudformation, kubernetes, helm)
checkov -d . --compact                     # trim the per-check code blocks from output
checkov -d . -o cli -o sarif               # multiple outputs at once (sarif for PR annotations)
checkov -d . --output-file-path results/   # write outputs to files instead of stdout
checkov -d . --check CKV_AWS_18            # run ONLY this check (S3 access logging)
checkov -d . --skip-check CKV_AWS_20       # run everything EXCEPT this check
```

## Checkov — the CI gate (exit codes are the whole game)

```bash
checkov -d .                               # exit 1 if any check FAILS, 0 if all pass — this is your gate
checkov -d . --soft-fail                   # always exit 0 (report only, never block) — for onboarding a repo
checkov -d . --hard-fail-on HIGH,CRITICAL  # block only on these severities; softer ones report but pass
checkov -d . --soft-fail-on CKV_AWS_18     # let this one specific check report without failing the build
```

```yaml
# .github/workflows — the canonical Action (bridgecrewio/checkov-action)
- uses: bridgecrewio/checkov-action@v12
  with:
    directory: .
    framework: terraform
    soft_fail_on: CKV_AWS_18      # report, don't block, on this check
    output_format: sarif
```

## Suppression — an audit trail, not a mute button

```hcl
resource "aws_security_group" "lb" {
  # checkov:skip=CKV_AWS_260: public HTTPS is intended — this SG fronts the public ALB
  ingress {
    from_port   = 443
    to_port     = 443
    cidr_blocks = ["0.0.0.0/0"]
  }
}
```

- Inline, per-resource, with a **check-ID + a real reason** — you over-ruling the junior, on the record.
- Never `--skip-check` a rule across the whole codebase to clear noise; that silences the real exposure too.

## tfsec — Terraform-native scanner

```bash
tfsec .                                    # scan the current directory
tfsec . --format sarif                     # SARIF for PR annotations (also: json, junit, csv)
tfsec . --minimum-severity HIGH            # only surface HIGH/CRITICAL
tfsec . --exclude aws-vpc-no-public-ingress-sgr   # skip a specific check by its slug
```

```hcl
#tfsec:ignore:aws-s3-enable-bucket-encryption   # inline suppression, above the resource
```

## Trivy — one scanner for config AND images

```bash
trivy config .                             # scan Terraform / CloudFormation / Helm / K8s manifests
trivy config --severity HIGH,CRITICAL .    # filter by severity
trivy config --format sarif -o tf.sarif .  # SARIF output
trivy fs .                                 # filesystem scan: config + vuln + secrets in one pass
trivy fs --scanners misconfig,secret .     # pick which scanners run
```

- `trivy config` is the same engine you use for images in Module 10 — one tool across IaC and containers.

## Map a finding back to a standard

```bash
# checkov finding → CIS control (traceability is what makes it a finding, not a lint nit)
# CKV_AWS_18  → S3 access logging          CKV_AWS_21 → S3 versioning
# CKV_AWS_20  → S3 public-read block        CKV_AWS_24 → SG ingress 0.0.0.0/0 on :22
# CKV_AWS_260 → SG ingress 0.0.0.0/0 on any port
```

## Gotchas worth remembering

- **The scan is not the deliverable — the gate is.** Fixing a finding by hand regresses the next time
  someone copies the module. Wire the scan into CI so the bad config *cannot merge*; that exit code is
  the whole point.
- **A scanner is a junior reviewer with no context.** It flags two identical `0.0.0.0/0` findings and can't
  tell you the `:443` one is your intended public ALB while the `:5432` one is a database you just exposed.
  The known-bad *pattern* is its job; the bad *decision* is yours.
- **Scanners miss secrets in HCL.** A `password = "changeme"` literal in `rds.tf` is a `gitleaks`/
  `trufflehog` job (Module 07), not a Checkov job — don't assume a clean config scan means no secrets.
- **A wildcard "fix" is often still broken.** Moving `*` from `Action` to `Resource` passes the pattern
  check but still composes into privilege escalation. Confirm the gate fails the original for the *right*
  reason and passes only the genuinely-fixed config.
- **IaC has a supply chain too.** A vulnerable Terraform provider/module poisons every config that uses
  it (e.g. CVE-2025-13357, HashiCorp Vault provider). Pin provider/module versions and scan what you pull.
