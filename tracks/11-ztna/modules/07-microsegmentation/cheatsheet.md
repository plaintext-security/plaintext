# Cheat sheet — Microsegmentation (Cilium / Hubble / kubectl)

*Companion to [Module 07 — Microsegmentation](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Cluster + Cilium status

```bash
kind create cluster --config kind-cilium.yaml     # kind cluster (disable default CNI for Cilium)
cilium install                                     # install Cilium as the CNI
cilium status --wait                               # control plane health, agents ready
cilium hubble enable                               # turn on flow observability
kubectl get pods -A -o wide                        # pods + their (churning) IPs and nodes
kubectl get pods --show-labels                     # the LABELS your policy targets, not IPs
```

## CiliumNetworkPolicy — default-deny, allow the minimum

```yaml
apiVersion: cilium.io/v2
kind: CiliumNetworkPolicy
metadata:
  name: db-allow-backend-only
  namespace: app
spec:
  endpointSelector:
    matchLabels: { tier: database }        # this policy governs database pods
  ingress:
    - fromEndpoints:
        # bind app AND namespace — a bare app label matches that label in ANY namespace
        - matchLabels:
            app: backend
            k8s:io.kubernetes.pod.namespace: app
      toPorts:
        - ports: [{ port: "5432", protocol: TCP }]
  egress:
    - toEndpoints:                          # allow DNS or default-deny silently breaks name resolution
        - matchLabels:
            k8s:io.kubernetes.pod.namespace: kube-system
            k8s:k8s-app: kube-dns
      toPorts:
        - ports: [{ port: "53", protocol: UDP }, { port: "53", protocol: TCP }]
```

The presence of an ingress rule is what flips a pod to default-deny — everything not explicitly allowed
is dropped.

```bash
kubectl apply -f cnp.yaml
kubectl get cnp -A                                 # list CiliumNetworkPolicies
kubectl describe cnp db-allow-backend-only -n app  # what it selects, and why
```

## Prove BOTH halves — allow and deny

```bash
# ALLOW case: backend → db must SUCCEED
kubectl exec -n app deploy/backend -- \
  sh -c 'nc -zv db 5432'                            # connected

# DENY case: frontend → db must DROP (default-deny)
kubectl exec -n app deploy/frontend -- \
  sh -c 'nc -zv -w3 db 5432'                        # timeout / refused

# try to PIVOT: dial the service IP directly, or from another namespace — must still drop
kubectl exec -n app deploy/frontend -- nc -zv -w3 <db-clusterIP> 5432
```

## Hubble — read the drop verdict

```bash
hubble observe --namespace app                     # live flows in the namespace
hubble observe --verdict DROPPED                   # only dropped flows — your deny audit trail
hubble observe --from-label app=frontend --to-label tier=database   # the exact edge you denied
hubble observe -f --protocol tcp                    # follow, TCP only
cilium monitor --type drop                          # kernel-level drop events (no Hubble needed)
```

## Gotchas worth remembering

- **Default-deny silently breaks DNS.** A strict deny that forgets to allow UDP/TCP 53 to
  `kube-system`/kube-dns kills name resolution for every governed pod — and the symptom looks like an
  *app* bug, not a policy. Put the DNS allow in the baseline, not as an afterthought.
- **A bare `app` label matches that label in *any* namespace.** `fromEndpoints: {app: backend}` lets an
  attacker who can schedule a pod labelled `app: backend` anywhere inherit the allow. Pin **both** the
  app label and the namespace.
- **A pod is only default-deny once a policy selects it.** If nothing selects a pod, it stays wide open
  — the single most common "why is everything still reachable?" surprise.
- **Prove the deny, then try to pivot.** A policy tested only on the allow path is theater. Confirm
  frontend→db drops, then attempt a relabel, a different source pod, or a direct service-IP dial and
  confirm it *still* drops. eBPF enforces in-kernel on the sending node, so even a same-node pod has no
  path around it — which is exactly what makes the deny credible enough to red-team.
- **Labels, not IPs.** Pod IPs churn on every restart, so IP rules rot; label-scoped rules follow the
  workload. The policy *is* the perimeter — there's no edge firewall doing this.
- **Encode the allow+deny pair as a regression test** so a future edit that re-flattens the network
  turns the check red instead of going unnoticed.
