---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — IAM attack paths with pmapper & cloudfox

*Companion to [Module 03 — IAM Attack Paths](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## pmapper — model the account as a graph

`pmapper` (NCC Group) builds a directed graph: principals are nodes, an edge means "A can become B."

```bash
pmapper graph create                         # pull IAM, build the graph for the current account
pmapper graph create --profile audit         # use a named AWS profile
pmapper graph list                            # graphs you've already built (by account id)
pmapper graph display                         # summary: node/edge counts
```

## pmapper — find the paths to admin

```bash
# every principal that can reach admin, and the exact hops
pmapper query "who can do iam:* with *"
pmapper query "preset privesc *"              # run the built-in privilege-escalation preset on all
pmapper query "preset privesc arn:aws:iam::111122223333:user/dev-alice"

# can a specific principal reach a specific action?
pmapper query "can user/dev-alice do s3:DeleteObject with *"

# argquery form (structured, scriptable)
pmapper argquery --principal dev-alice --action iam:PutUserPolicy --resource "*"
```

- A returned path prints each hop and the permission that draws the edge (`sts:AssumeRole`,
  `iam:PassRole` + a launch action, `iam:CreatePolicyVersion`, `iam:AttachUserPolicy`).

## pmapper — visualize and re-run after the cut

```bash
pmapper visualize --filetype svg              # render the graph; admin nodes stand out
pmapper visualize --only-privesc              # draw only the escalation edges
# after you apply the cut, rebuild and re-query — a fix is "no paths to admin", proven:
pmapper graph create && pmapper query "preset privesc *"
```

## cloudfox — enumerate and corroborate

`cloudfox` (BishopFox) is the fast enumeration accelerator — use it to confirm the graph against live policy.

```bash
cloudfox aws --profile audit permissions          # who-can-do-what table across the account
cloudfox aws --profile audit permissions --principal dev-alice
cloudfox aws --profile audit role-trusts          # every role's trust policy (assume edges)
cloudfox aws --profile audit iam-simulator        # bulk simulate-principal-policy over principals
cloudfox aws --profile audit endpoints            # reachable service endpoints (reach context)
```

- Output lands in `~/.cloudfox/` as CSV/loot files — grep `permissions.csv` for `PassRole`,
  `CreatePolicyVersion`, `AttachUserPolicy`, `AssumeRole` to spot escalation primitives fast.

## Escalation primitives — the edges to hunt

```
Does this permission let the holder grant ITSELF or a resource MORE power?  If yes → it's an edge.

  iam:PassRole  +  ec2:RunInstances / lambda:CreateFunction   → become the passed role
  iam:CreatePolicyVersion  (on a policy you're attached to)    → write Allow *:* into it
  iam:AttachUserPolicy / iam:PutUserPolicy                     → attach AdministratorAccess to self
  sts:AssumeRole  (trust policy permits you)                    → hop to another principal
  lambda:UpdateFunctionConfiguration + iam:PassRole            → re-point a Lambda at AdminRole
```

Reach-only permissions (`s3:GetObject`, `cloudwatch:GetMetricData`) draw **no edges** — terminal.

## The minimum cut-set — the deliverable

```bash
# cutting ONE edge is not a fix if a second path survives. Find the smallest edge set that
# disconnects ALL source→admin paths, then implement the cheapest cut:
#   scope iam:PassRole Resource from "*" → the one role legitimately needed
#   add an iam:PassedToService condition
#   remove an over-broad principal from a trust policy
# re-run pmapper: SUCCESS = "no paths to admin"
```

- ATT&CK mapping for the finding: **T1548** (Abuse Elevation Control Mechanism) and **T1078.004**
  (Valid Accounts: Cloud Accounts).

## Gotchas worth remembering

- **The danger is the edges *between* principals, not one over-grant.** `dev-alice` with no `iam:*`,
  no admin, and one `sts:AssumeRole` can still be two hops from admin — flat policy review can't see it.
- **Cut-set, not cut.** Severing one edge breaks one path; a second path through different edges
  leaves the account compromised. The deliverable is the smallest edge removal that disconnects *all*.
- **AI misses three-hop chains and hallucinates edges** from services it doesn't fully model (Lambda
  execution, ECS task roles). Validate every claimed path — *and every claimed absence* — against the graph.
- **A stale graph lies.** New roles, rotated policies, and fresh trust edges appear only after
  `pmapper graph create` re-runs. Rebuild before you trust a "no paths" result.
- **"Fixed" is proven, not promised.** Apply the cut and re-run the path finder; a recommendation in a
  report is not a severed edge in the graph.

> Only graph and analyze accounts you own or have explicit written permission to assess.
