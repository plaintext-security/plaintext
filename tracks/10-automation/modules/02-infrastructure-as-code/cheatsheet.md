# Cheat sheet — Infrastructure as Code (Terraform / OpenTofu)

*Companion to [Module 02 — Infrastructure as Code](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> `tofu` is a drop-in for `terraform` — swap the binary name and every command below still works.

## The core lifecycle

```bash
terraform init                    # download providers, set up .terraform/ + lockfile
terraform fmt                     # canonicalise formatting (fmt -recursive for subdirs)
terraform validate                # config is internally consistent (no cloud calls)
terraform plan -out=tf.plan       # compute the diff; SAVE it so apply runs exactly this
terraform apply tf.plan           # apply the saved plan — no re-prompt, no surprise diff
terraform destroy                 # tear it all down (plan the destroy first: -out)
```

- **Always `plan -out` then `apply <file>`.** A bare `terraform apply` re-plans at apply time — what
  you reviewed and what runs can differ. The saved plan is the thing you reviewed.

## Read the plan-diff

```text
  + create        # new resource
  ~ update in-place
  -/+ replace      # DESTROY then create — the dangerous one; read WHY it forces replacement
  -  destroy
```

```bash
terraform plan                    # human-readable diff
terraform show -json tf.plan      # machine-readable — feed to a policy scanner / jq
terraform plan -target=aws_s3_bucket.logs   # scope the plan to one resource (escape hatch)
```

## State

```bash
terraform state list                          # every resource Terraform tracks
terraform state show aws_s3_bucket.logs       # one resource's tracked attributes
terraform state rm aws_s3_bucket.logs         # forget a resource (does NOT delete it)
terraform state mv <old.addr> <new.addr>      # rename/move without destroy-recreate
terraform refresh                             # reconcile state with real infra (or plan -refresh-only)
```

## Variables, outputs, workspaces

```bash
terraform plan -var 'region=us-east-1'        # single var
terraform plan -var-file=prod.tfvars          # a file of vars (auto-loaded: *.auto.tfvars)
terraform output                              # all outputs
terraform output -raw bucket_name             # one value, unquoted — pipe into a script
terraform workspace new staging && terraform workspace select staging
```

## Minimal config shape

```hcl
terraform {
  required_version = ">= 1.6"
  required_providers {
    local = { source = "hashicorp/local", version = "~> 2.5" }
  }
}

resource "local_file" "note" {
  filename = "${path.module}/hello.txt"
  content  = "reproducible, reviewable, in git"
}
```

## Using modules (reusable building blocks)

A **module** is a folder of `.tf` files you call from elsewhere — the unit of reuse. The root config
you run `apply` in is itself a module; anything it calls is a *child module*.

```hcl
module "vpc" {
  # source is REQUIRED and picks where the module comes from:
  source  = "terraform-aws-modules/vpc/aws"   # public Terraform Registry (namespace/name/provider)
  version = "~> 5.8"                            # version is ONLY valid for registry sources — pin it

  # inputs: everything the child module declares as `variable` becomes an argument here
  name = "prod"
  cidr = "10.0.0.0/16"
}

module "local_thing" {
  source = "./modules/thing"     # local path — no version arg; re-init if you add/move it
}
# git source: source = "git::https://github.com/org/repo.git//subdir?ref=v1.4.0"
```

```hcl
# consume a child module's outputs elsewhere in your config:
resource "aws_instance" "web" {
  subnet_id = module.vpc.private_subnets[0]     # module.<name>.<output>
}
```

```bash
terraform init          # ALSO fetches/updates modules into .terraform/modules
terraform get -update   # re-fetch modules only (after bumping a source/version)
```

- **`version` works only for registry modules**, not local/git sources — pin git with `?ref=<tag>`.
- Adding, moving, or re-sourcing a module means **re-run `init`** (or `get`) before `plan`, or Terraform
  won't see it.
- Keep child modules small and input-driven: expose `variable`s in, `output`s out — no hardcoded
  account IDs or regions inside the module.

## Gotchas worth remembering

- **`terraform.tfstate` is a bundle of plaintext secrets** — it stores every attribute, including
  passwords and private keys, unencrypted. Never commit it (`.gitignore` it), never paste it in a
  ticket. Use a remote backend (S3 + DynamoDB lock, or TF Cloud) for anything shared.
- **Review the plan-diff, never the apply.** The same `apply` that builds 100 resources can destroy
  100. `-/+ replace` on a database is a data-loss incident hiding in a green diff — read *why*.
- **Commit `.terraform.lock.hcl`.** It pins provider hashes so every teammate and CI runner resolves
  the exact same provider versions — reproducibility depends on it.
- **`state rm` ≠ delete, `destroy` = delete.** `state rm` makes Terraform forget a live resource (it
  keeps running); `destroy` tears the real thing down. Confusing them either orphans infra or nukes it.
- **Pin providers with `~>`, not open ranges.** `version = "5.0.0"` or `~> 5.0` — an unpinned provider
  can pull a breaking change on the next `init` and rewrite your plan.
- **`fmt` + `validate` belong in CI, before plan** — cheap, offline, and they catch the typo before it
  costs a cloud round-trip.
