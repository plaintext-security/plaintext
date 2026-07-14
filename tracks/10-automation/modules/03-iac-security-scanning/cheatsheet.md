---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — IaC Security Scanning (Checkov / tfsec)

*Companion to [Module 03 — IaC Security Scanning](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Checkov — scan Terraform / IaC

```bash
checkov -d .                        # scan a directory tree of IaC
checkov -f main.tf                  # scan a single file
checkov -d . --compact              # one line per check, no code snippets
checkov -d . -o json                # machine-readable (also: -o sarif, -o cli, -o junitxml)
checkov -d . --framework terraform  # limit to one IaC framework (also: cloudformation, kubernetes…)
checkov --list                      # every built-in policy and its ID
```

Scan a **plan**, not just source — catches values only known after interpolation:

```bash
terraform plan -out tf.plan
terraform show -json tf.plan > plan.json
checkov -f plan.json                # scan the resolved plan
```

## Suppress a finding — with a rationale, never silence

```hcl
resource "aws_s3_bucket" "public_site" {
  # checkov:skip=CKV_AWS_20:This bucket is a public static site by design — reviewed 2026-07
  acl = "public-read"
}
```

```bash
checkov -d . --skip-check CKV_AWS_20        # skip a check globally (blunt — prefer inline skip)
checkov -d . --check CKV_AWS_18             # run ONLY specific checks
```

## tfsec — the second opinion

```bash
tfsec .                             # scan current directory
tfsec . --format sarif              # SARIF for GitHub code-scanning upload
tfsec . --minimum-severity HIGH     # only HIGH and CRITICAL fail the run
```

Inline ignore (scoped to the next block, with an expiry):

```hcl
#tfsec:ignore:aws-s3-enable-bucket-encryption:exp:2026-12-31
resource "aws_s3_bucket" "logs" {}
```

## Wire it as a CI gate (exit codes are the contract)

```yaml
# GitHub Actions step — non-zero exit fails the job and blocks the merge
- name: checkov
  run: checkov -d . --compact --soft-fail=false   # soft-fail=false → findings fail the build
```

| exit code | meaning                          |
|-----------|----------------------------------|
| `0`       | no failed checks — gate passes   |
| `1`       | at least one failed check — gate blocks |

```bash
checkov -d . --soft-fail            # report findings but ALWAYS exit 0 (advisory mode — not a gate)
```

## Gotchas worth remembering

- **A passing scan is not a secure config — it's an absence of *known-bad patterns*.** Checkov can't
  tell the port you opened on purpose from the one that's a breach. The scanner is a fast junior
  reviewer; you still own the verdict.
- **Suppress with a reason, never with `--soft-fail` everywhere.** An inline `checkov:skip=ID:why`
  documents the risk decision in the diff and survives review; a blanket soft-fail turns the gate
  into decoration and the next real finding sails through.
- **Scan the plan JSON, not only the `.tf`.** Values that come from variables or interpolation are
  `(known after apply)` in source — the open CIDR only appears in the resolved plan.
- **Exit code is the gate, not the pretty output.** In CI, assert on the exit code; `--soft-fail`
  hides the failure from your pipeline while still printing scary red text nobody blocks on.
- **Run two scanners.** Checkov and tfsec have different rule coverage — each catches things the
  other misses. Fail the build if *either* does.
