# Cheat sheet — Policy as Code (OPA / Rego)

*Companion to [Module 08 — Policy as Code](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## opa eval — evaluate a policy against an input

```bash
opa eval -d policy.rego -i input.json 'data.authz.allow'      # ask one rule
opa eval -d policy.rego -i input.json 'data.authz.deny'       # ask the DENY set (see gotchas)
opa eval -d policy.rego 'data.authz' -i input.json --format pretty
opa eval -d policy.rego -i input.json 'data.authz.allow' --format raw   # just the value

# turn a decision into a process exit for CI gating:
opa eval --fail-defined -d policy.rego -i bad.json 'data.authz.deny'   # exit≠0 if deny is DEFINED (bad blocked)
opa eval --fail         -d policy.rego -i good.json 'data.authz.deny'  # exit≠0 if deny is UNDEFINED/empty
# pick the flag so THE BAD STATE exits non-zero.
```

## opa test — unit-test Rego like software

```bash
opa test .                       # run every test_ rule in the dir; exit≠0 on any failure
opa test . -v                    # verbose — which tests passed/failed
opa test . --coverage --format=json | jq .coverage   # % of policy exercised
opa fmt -w policy.rego           # format in place
opa check policy.rego            # type/compile check without running
```

## Rego — fail-closed patterns

```rego
package authz

# DEFAULT-CLOSED: absence of an allow means deny.
default allow := false

allow if {
    input.user.role == "analyst"
    input.action == "read"
}

# deny OVERRIDES allow — collect reasons into a set
deny contains msg if {
    input.action == "write"
    input.user.role == "analyst"
    msg := "analysts cannot write"
}

# k8s admission: reject root — BOTH the explicit case AND the omitted-field case
deny contains msg if {
    input.request.object.spec.securityContext.runAsUser == 0
    msg := "container runs as root (uid 0)"
}
deny contains msg if {
    not input.request.object.spec.securityContext.runAsUser   # omitted == root by default!
    msg := "runAsUser not set — defaults to root"
}
```

```rego
# tests live beside the policy (policy_test.rego)
test_analyst_cannot_write if {
    count(deny) > 0 with input as {"user": {"role": "analyst"}, "action": "write"}
}
test_root_pod_rejected if {
    count(deny) > 0 with input as {"request": {"object": {"spec": {}}}}   # omitted runAsUser
}
```

## Gotchas worth remembering

- **A rule you never wrote is an allow.** Rego is declarative — a `deny` whose condition is never
  satisfied is not an error, it is *silently absent*. A typo'd field, a `==` that should be `!=`, or an
  `input.user.role` the request actually spells `roles`, and the rule simply never fires. If your query
  treats "no deny" as "allow," you've shipped a policy that **fails open**.
- **`default allow := false` is your fail-closed switch.** Combine it with *asking the deny set* rather
  than a lone allow flag, so absence-of-decision means deny, not allow.
- **Confirm you get `{"deny": [...]}`, not `{}`.** An empty result means no rule fired — which a
  poorly-structured query reads as *allow*. The Rego Playground shows this vividly: a broken deny prints
  `{}`, not `false`. This is the one thing a scanner won't warn you about.
- **k8s admission: reject `runAsUser: 0` AND an *omitted* `runAsUser`.** The omitted case is also root
  by default and is the case AI drafts most often miss.
- **Test the deny path explicitly.** A test suite that only checks the allow path passes a fail-open
  policy every time. The gate is the deliverable: it must exit non-zero on the bad input and zero on the
  fix — a test you've only ever seen pass is theater.
- **OPA is decoupled from enforcement.** It returns a decision; your proxy/admission-webhook/app
  enforces it. That decoupling is exactly what lets you test the policy in milliseconds in CI.
