# Cheat sheet — Click-ops → IaC Migration (terraform import)

*Companion to [Module 11 — Click-ops → IaC Migration](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> The brownfield rule: **import, don't recreate.** An empty state means Terraform thinks the live
> resource doesn't exist and will *duplicate* or *destroy-recreate* it — the outage you were hired to
> avoid. One resource at a time (strangler-fig), driving `plan` to **`No changes`**.

## The import loop (one resource at a time)

```bash
# 1. write a resource BLOCK for the thing (address can be empty of attributes at first)
#    resource "aws_s3_bucket" "logs" {}

# 2. import the live resource INTO state at that address
terraform import aws_s3_bucket.logs my-live-logs-bucket     # <resource.addr> <cloud-id>

# 3. plan — it now shows the DELTA between your (thin) code and reality
terraform plan                                              # expect many '~ update' lines

# 4. edit the CODE to match reality until:
terraform plan                                              # -> "No changes. Your infrastructure matches."
```

**You edit the code to match the cloud, never the cloud to match the code.** The goal is zero drift
against what's already serving traffic.

## Finding the import ID (it's resource-specific)

```bash
terraform import aws_security_group.web sg-0abc123          # SG: the sg-id
terraform import aws_instance.app i-0def456                 # EC2: the instance id
terraform import aws_iam_role.deploy DeployRole             # IAM role: the role NAME
# unsure of the ID format? check the provider docs' "Import" section for each resource type
```

Block-based import (Terraform 1.5+) — reviewable in a PR, no separate CLI step:

```hcl
import {
  to = aws_s3_bucket.logs
  id = "my-live-logs-bucket"
}
```

```bash
terraform plan -generate-config-out=generated.tf           # scaffold HCL from the live resource
```

## Read the plan like a migration

```text
No changes.            # DONE for this resource — code == reality, zero drift
~ update in-place      # your code differs from reality — edit CODE to converge (safe-ish)
-/+ replace            # DANGER: would DESTROY the live resource — you imported wrong or a field forces new
+ create               # DANGER: Terraform doesn't see the import — wrong address/ID, a duplicate incoming
```

## Verify + roll back

```bash
terraform state list                     # confirm the resource is now tracked
terraform state show aws_s3_bucket.logs  # what Terraform believes vs. the console
terraform state rm aws_s3_bucket.logs    # ROLLBACK: un-import — forgets it, does NOT delete the live resource
```

## Gotchas worth remembering

- **`plan` after import will show a diff — that's expected, not a failure.** Your stub block is thinner
  than reality. Converge by adding attributes to the *code* until `plan` says `No changes`. That "No
  changes" is the deliverable's zero-drift proof.
- **`+ create` or `-/+ replace` after an import means STOP.** Create = Terraform never saw your import
  (wrong address or ID) and is about to duplicate a live resource. Replace = it would destroy the
  running thing. Neither should ever be applied during a migration — fix the import first.
- **`terraform state rm` is your rollback, and it is non-destructive.** It removes the resource from
  state only; the live infra keeps running. That's the safe undo when an import went to the wrong address.
- **Import one resource at a time.** Bulk-importing hides which resource caused a bad plan; strangler-fig
  keeps every step small, reviewable, and reversible.
- **A resource that lived only in the console was invisible to your scanners.** Once it's in code, the
  Module 03 checkov/tfsec gate can finally see it — expect it to surface real findings on first scan.
- **Never `apply` during a migration until the plan is `No changes`.** The whole point is adopting the
  resource *without touching it*.
