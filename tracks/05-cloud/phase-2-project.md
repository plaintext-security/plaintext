# Phase 2 Project — Harden a Workload End to End

*Cloud · Phase 2 (modules 09–13) · ~6–8 hrs · Prereqs: finish modules 09–13 first.*

> You scanned an image, scoped a function role, broke out of a container, and wrote Kubernetes policy one surface at a time. The project is the **integration**: take one workload from image to running pod and harden every layer — scan, least-privilege the role, catch the breakout with Falco, and enforce RBAC, NetworkPolicy, and admission as code on a `kind` cluster.

## Why this is a project, not another module

Each Phase-2 module left a fix or a detection for one layer of the workload. Alone they're five separate artifacts; integrated they're the defense-in-depth posture a platform-security engineer ships:

- **09 · Serverless** → `blast-radius-verdict.md` + `least-privilege-policy.json` + `handler-fixed.py` + `assert_lambda_role_scoped.py`.
- **10 · Image security** → `verdict-report.md` + `Dockerfile.fixed` (multi-stage, digest-pinned) + `sbom.json` + the `ci-image-scan.yml` gate.
- **11 · Container escape** → `escape-report.md` (the CVE-2019-5736 reproduction, host-root proof) + `falco-rules-tuned.yaml`.
- **12 · K8s RBAC & NetworkPolicy** → `rbac-audit.md` + `manifests/rbac-fixed.yaml` + `netpol-default-deny.yaml` + `netpol-allow-frontend.yaml`.
- **13 · K8s admission & runtime** → `policy-report.md` + `disallow-host-path.yaml` + `disallow-host-namespaces.yaml` + `falco-runtime-rules.yaml` + the `validate-policies.yaml` CI gate.

## Build it

1. **Ship one image, scanned.** Take your module-10 `Dockerfile.fixed` (multi-stage, digest-pinned) and its `ci-image-scan.yml` gate — that hardened image is the single workload the rest of the phase defends. Carry its `sbom.json` forward.
2. **Scope what it can reach.** Apply the module-09 least-privilege execution-role thinking to the workload's identity in the cluster: the module-12 `rbac-fixed.yaml` Role + RoleBinding (no `cluster-admin`, no reading Secrets it doesn't own) and the `netpol-default-deny.yaml` + allow-frontend segmentation. The reachable set must match the baseline.
3. **Prove the breakout is caught.** Reproduce the module-11 container escape against the running workload and show your tuned `falco-rules-tuned.yaml` fires on the write-to-host-binary — and stays quiet on the benign case you excepted.
4. **Enforce it as code.** Apply the module-13 admission policies (`disallow-host-path`, `disallow-host-namespaces`) and wire `validate-policies.yaml` so a host-path / host-namespace pod is **denied** in CI with no live cluster. Add the `/tmp`-execution Falco rule for the runtime gap admission can't see.
5. **One hardening report.** Produce a combined `workload-hardening.md`: the layered model (scan → least-privilege → segmentation → admission → runtime detection), each layer's before/after, leading with a two-sentence *what an attacker could do unhardened, and where each layer now stops them.*

## Success criteria

- [ ] One workload is hardened across **all five** layers — image, role, segmentation, admission, runtime.
- [ ] The image gate, the RBAC/NetworkPolicy fix, and the admission policies each **fail** the bad state and **pass** the fix.
- [ ] The container escape is caught by a **tuned** Falco rule (fires on the attack, silent on the excepted benign case).
- [ ] The report opens with the layered who/how/blast-radius, not a raw `kubectl` dump.

## Deliverable

A `workload-hardening/` folder in your repo: the **combined `workload-hardening.md`**, the **`Dockerfile.fixed` + `sbom.json`**, the **`manifests/` set** (RBAC, NetworkPolicy, admission policies), the **tuned Falco rules**, and the **CI gates** (`ci-image-scan.yml`, `validate-policies.yaml`). Reference the cluster — **do not** commit kubeconfigs, SA tokens, Secret values, the overwritten `runc`, image tarballs, or pulled-image layers (see `.gitignore`). The `kind` cluster is yours; tear it down when done.

## Self-check rubric

Grade your own `workload-hardening/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Layer coverage** | One or two layers hardened | All five layers — image, role, segmentation, admission, runtime — applied to one workload | Layers reinforce each other; the report shows what each catches that the others can't |
| **Least privilege** | `cluster-admin` left, image not rebuilt | Scoped role + default-deny NetworkPolicy + minimal rebuilt image | Reachable set proven to match the baseline; role parameterised and reusable |
| **Detection** | No Falco, or fires on nothing | Tuned rule fires on the breakout, silent on the excepted benign case | Runtime rule ties to the same workload's admission gap; FP-tested |
| **Policy as code** | Manual `kubectl apply`, no gate | Admission + image gates fail the bad state and pass the fix in CI | Gates run with no live cluster, block merge on the specific finding only |
| **Hygiene** | Kubeconfigs/tokens/secrets committed | No kubeconfigs/tokens/Secret values/layers in history; `.gitignore` present | Commits tell the hardening story; cluster rebuilds and tears down cleanly |

→ Next: **[Module 14 — Cloud Attack Techniques](modules/14-cloud-attack-techniques/README.md)** opens Phase 3, whose project **is** the **[track capstone](README.md#capstone)**.
