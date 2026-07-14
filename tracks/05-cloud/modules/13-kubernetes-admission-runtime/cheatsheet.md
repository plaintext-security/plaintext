---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Kubernetes Admission & Runtime

*Companion to [Module 13 — Kubernetes: Admission & Runtime](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The bouncer — Kyverno admission policies

```bash
kubectl apply -f policy.yaml                    # register a ClusterPolicy
kubectl get clusterpolicy                        # list policies + their Audit/Enforce mode
kubectl describe clusterpolicy disallow-privileged
kubectl get policyreport -A                      # who would/did fail (Audit mode findings)
kubectl get clusterpolicyreport                  # cluster-scoped violations
```

## Deny the four "never admit" patterns (validate rule)

```yaml
apiVersion: kyverno.io/v1
kind: ClusterPolicy
metadata: { name: pod-security-baseline }
spec:
  validationFailureAction: Audit        # Audit first! flip to Enforce after you've triaged
  background: true
  rules:
    - name: no-privileged
      match: { any: [{ resources: { kinds: [Pod] } }] }
      validate:
        message: "privileged containers are not allowed"
        pattern:
          spec:
            containers:
              - securityContext: { privileged: "false" }   # A: privileged: true
    - name: no-host-path
      match: { any: [{ resources: { kinds: [Pod] } }] }
      validate:
        message: "hostPath volumes are not allowed"
        deny:
          conditions:
            any:
              - key: "{{ request.object.spec.volumes[].hostPath.path }}"   # B: hostPath: /
                operator: AnyNotIn
                value: [""]
    - name: no-host-namespaces
      match: { any: [{ resources: { kinds: [Pod] } }] }
      validate:
        message: "hostNetwork/hostPID are not allowed"
        pattern:
          spec: { =(hostNetwork): "false", =(hostPID): "false" }   # C
    - name: require-run-as-non-root      # D: the silent default — runs as root (UID 0)
      match: { any: [{ resources: { kinds: [Pod] } }] }
      validate:
        message: "containers must run as non-root"
        pattern:
          spec:
            containers:
              - securityContext: { runAsNonRoot: true }
```

## Mutate — default a field instead of rejecting

```yaml
    - name: default-run-as-non-root
      match: { any: [{ resources: { kinds: [Pod] } }] }
      mutate:
        patchStrategicMerge:
          spec:
            securityContext: { +(runAsNonRoot): true }   # add if absent
```

Kyverno rule types: **`validate`** (allow/deny), **`mutate`** (default/patch), **`generate`** (create linked resources, e.g. a default NetworkPolicy per namespace).

## Prove the policy actually blocks (the load-bearing test)

```bash
# apply a deliberately bad pod and watch it get REJECTED for the right field
kubectl run bad --image=nginx --privileged --dry-run=server
#   → error: ...blocked by policy "pod-security-baseline" rule "no-privileged"

kubectl apply -f good-pod.yaml     # a compliant pod must still be ADMITTED
```

A policy that admits the bad pod while *looking* correct is worse than none — always test with the bad spec.

## The camera — Falco runtime rules (K8s DaemonSet)

```yaml
- rule: Terminal shell in container
  desc: A shell was spawned inside a container (exec into a pod)
  condition: >
    spawned_process and container
    and shell_procs and proc.tty != 0
  output: >
    Shell in container (user=%user.name %container.info
    pod=%k8s.pod.name ns=%k8s.ns.name cmd=%proc.cmdline)
  priority: NOTICE
  tags: [container, shell, mitre_execution, T1610]

- rule: Run process from /tmp
  desc: A binary executed out of /tmp inside a container
  condition: spawned_process and container and proc.exepath startswith /tmp/
  output: "Process from /tmp (cmd=%proc.cmdline pod=%k8s.pod.name)"
  priority: WARNING
```

Falco carries Kubernetes context in output: `%k8s.pod.name`, `%k8s.ns.name`, `%container.image.repository`. Reuse `list`/`macro`; tune with `exceptions`.

## Gotchas worth remembering

- **Roll out `Audit` first, then `Enforce`.** Jumping straight to `Enforce` on a live cluster is how a CronJob can't start at 2 AM — watch the Policy Reports for how many existing workloads would fail, remediate, *then* flip. `kubectl get clusterpolicy` shows which mode you're in.
- **The most common bad spec isn't `privileged` — it's nothing set at all.** No `securityContext` means the container runs as root (UID 0). "The default is not secure" is as true in Kubernetes as it was in S3.
- **Admission reads the spec; it cannot see behavior.** A pod that passed every policy can still be `exec`'d into or read a credential file, and an image already running before you wrote the policy never went through the door. That's the gap Falco fills — prevention without detection is blind to its own gaps.
- **A `deny` whose path is subtly wrong admits the bad pod while looking correct.** That silent failure is more dangerous than no policy, because you trust it. Prove every policy by applying the bad pod and watching it get rejected for the *right* field.
- **Learn the shape from the Kyverno policy library, then write your own.** Copy-pasting a community policy blind is how you ship one that doesn't match your API version or leaves a field uncovered.

> Only test admission and runtime controls on clusters you own or are authorized to assess.
