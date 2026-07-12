# Cheat sheet — Kubernetes RBAC & Network Policy

*Companion to [Module 12 — Kubernetes: RBAC & Network Policy](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Ask "can I?" — the K8s `simulate-principal-policy`

```bash
kubectl auth can-i get secrets                       # can *I* do it, in the current namespace?
kubectl auth can-i '*' '*' --all-namespaces          # am I effectively cluster-admin?
kubectl auth can-i list pods -n kube-system

# impersonate a ServiceAccount — the real test of a workload's blast radius
kubectl auth can-i --list --as=system:serviceaccount:prod:app-sa -n prod
kubectl auth can-i get secrets --as=system:serviceaccount:prod:app-sa -n prod
```

`--list` dumps every verb×resource the subject can reach — this is the functional RBAC test, run it *before and after* your cut.

## Enumerate who can do what

```bash
kubectl get rolebindings,clusterrolebindings -A -o wide     # every binding, all namespaces
kubectl get clusterrole cluster-admin -o yaml               # the Resource:"*" of Kubernetes
kubectl describe clusterrolebinding <name>                   # subjects + the role it grants
kubectl get sa -A                                           # ServiceAccounts (principals)
kubectl describe pod <pod> | grep -i serviceaccount          # which SA a pod runs as
```

## Least-privilege RBAC — Role + RoleBinding as YAML

```yaml
apiVersion: rbac.authorization.k8s.io/v1
kind: Role                                  # namespaced; ClusterRole for cluster-wide
metadata: { namespace: prod, name: app-reader }
rules:
  - apiGroups: [""]                         # "" = core API group
    resources: ["configmaps"]               # NOT secrets, NOT "*"
    verbs: ["get", "list"]                   # NOT ["*"]
---
apiVersion: rbac.authorization.k8s.io/v1
kind: RoleBinding                           # attaches the Role to the subject
metadata: { namespace: prod, name: app-reader-bind }
subjects:
  - kind: ServiceAccount
    name: app-sa
    namespace: prod
roleRef: { kind: Role, name: app-reader, apiGroup: rbac.authorization.k8s.io }
```

Stop the token auto-mount when a pod doesn't need the API — set on the SA or the pod spec:

```yaml
automountServiceAccountToken: false
```

## Default-deny NetworkPolicy (opt-in segmentation)

```yaml
# deny ALL ingress in this namespace — the firewall default you've written for years
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: default-deny-ingress, namespace: prod }
spec:
  podSelector: {}                 # {} = every pod in the namespace
  policyTypes: [Ingress]          # add Egress to also lock outbound
  # no ingress: rules → nothing gets in
---
# then add back ONLY the flow the app needs
apiVersion: networking.k8s.io/v1
kind: NetworkPolicy
metadata: { name: allow-api-from-web, namespace: prod }
spec:
  podSelector: { matchLabels: { app: api } }
  policyTypes: [Ingress]
  ingress:
    - from: [{ podSelector: { matchLabels: { app: web } } }]
      ports: [{ protocol: TCP, port: 8080 }]
```

## Verify the cuts

```bash
kubectl apply -f rbac.yaml -f netpol.yaml
kubectl auth can-i get secrets --as=system:serviceaccount:prod:app-sa -n prod   # want: no
# connectivity probe from a pod that should NOT reach the API pod:
kubectl run probe --rm -it --image=busybox -n prod -- wget -qO- --timeout=3 http://api:8080
```

## kube-bench — CIS baseline audit

```bash
kube-bench run                          # run the CIS Kubernetes Benchmark
kube-bench run --targets master,node    # scope to control-plane / worker checks
kube-bench run --check 5.1.1            # a single control (section 5 = RBAC & policies)
kube-bench run --json | jq '.Totals'    # summary counts; read FAIL vs WARN, scored vs not
```

## Gotchas worth remembering

- **The Kubernetes default is default-*allow* — the opposite of AWS IAM.** A new AWS principal can do nothing until granted; a K8s pod gets an SA token auto-mounted and a flat network out of the box. Assume every pod already holds a key to the API.
- **`cluster-admin` on a workload SA reads every Secret in every namespace** — which, in the Tesla shape, is where the cloud keys live. Bind SAs to a tight namespaced Role, never `cluster-admin`.
- **NetworkPolicy is opt-in and namespace-scoped.** A default-deny in namespace `A` does nothing for `B` — partial coverage is the trap. Every namespace needs its own default-deny, and it only works if a CNI that enforces NetworkPolicy is installed (Calico, Cilium — not flat kubenet).
- **"Uses no SA" doesn't mean no token.** Unless you set `automountServiceAccountToken: false`, a compromised process always has *a* token to the API server whether the app uses it or not.
- **A NetworkPolicy that *looks* right can leave a gap.** Verify the RBAC cut with `kubectl auth can-i` and the network cut with a real connectivity probe — a model can draft the YAML but can't see cluster state.

> Only test clusters you own or have explicit written permission to assess.
