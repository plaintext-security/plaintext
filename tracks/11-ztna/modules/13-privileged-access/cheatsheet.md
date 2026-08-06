---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Privileged Access in a Zero Trust World (Teleport)

*Companion to [Module 13 — Privileged Access in a Zero Trust World](README.md) · CC BY 4.0 — print it,
pin it, share it.*

*Last reviewed: 2026-08*

## Bring up a cluster (lab)

```bash
# lab environment — one auth+proxy container, one node that joins it, no exposed SSH ports
docker compose up -d --build
```

Core pieces: **auth service** (the CA + RBAC engine, `tctl` talks to it), **proxy service** (the only
network path in — clients connect here, never to the node), **ssh_service** (runs on the target node,
dials *out* to the proxy over a reverse tunnel; nothing listens for inbound connections).

## Create a user + role (admin, via `tctl`)

```bash
# role.yaml — bind LOGINS + NODE LABELS + session options together (all three must match to allow)
tctl create -f role.yaml
tctl users add alice --roles=privileged-ops

# a role this narrow is the goal of Step 5 — not the wildcarded starting point
cat <<'EOF' > role.yaml
kind: role
version: v7
metadata:
  name: privileged-ops
spec:
  allow:
    logins: ["ubuntu"]              # NOT root — least privilege
    node_labels:
      env: ["production"]           # NOT '*':'*' — scope to the resource, not the fleet
  options:
    max_session_ttl: "15m"
    record_session:
      default: "best_effort"
EOF
```

## Mint a short-lived certificate (no browser needed)

```bash
# tctl auth sign = the admin's offline equivalent of `tsh login` — scriptable, no password reset
tctl auth sign --user=alice --format=file --out=alice-identity --ttl=15m

# adopt that identity into a normal tsh profile (now `tsh ssh` etc. all just work)
tsh login --proxy=teleport-auth:3080 --identity=alice-identity --insecure

# show the cert's TTL and the identity baked into it
tsh status
```

## Connect through the proxy (the only path in)

```bash
tsh ssh ubuntu@app-prod-01                 # interactive session, through the proxy, recorded
tsh ssh ubuntu@app-prod-01 -- whoami       # non-interactive — still recorded
```

## Play back a recorded session — the audit artifact

```bash
tsh recordings ls                          # list recorded sessions: ID, type, participants, duration
tsh play <session-id>                      # replay it — every keystroke, exactly as it happened
```

## Prove the two denials

```bash
# (a) wrong role — no logins/node_labels match this node
tctl auth sign --user=mallory --format=file --out=mallory-identity --ttl=15m
tsh login --proxy=teleport-auth:3080 --identity=mallory-identity --insecure
tsh ssh ubuntu@app-prod-01                 # -> access denied

# (b) direct bypass — the node has no listening SSH port to hit
nc -zv app-prod-01 3022                    # -> connection refused, nothing is listening

# (c) expired certificate
tctl auth sign --user=alice --format=file --out=short-identity --ttl=30s
sleep 35
tsh login --proxy=teleport-auth:3080 --identity=short-identity --insecure   # -> certificate has expired
```

## Gotchas worth remembering

- **A certificate proves identity, not authorization.** The RBAC role's `logins` + `node_labels` decide
  what that identity may actually reach — a valid cert with the wrong role is still denied.
- **TTL and RBAC scope are independent controls.** A 15-minute certificate on a role scoped
  `node_labels: '*': '*'` is still a skeleton key for 15 minutes. Tighten both.
- **The node has no inbound port — that's the point.** It dials *out* to the proxy; there is nothing on
  the network for a "direct SSH, skip the proxy" attempt to connect to.
- **`tctl auth sign` is for admins and automation, not routine human login.** It's how this lab stays
  scriptable; a real deployment puts humans through `tsh login` (SSO / WebAuthn / password) instead — the
  certificate you get back is the same shape either way.
- **Session recording is the audit artifact, not a nice-to-have.** If `record_session` isn't set (or is
  disabled) on the role/cluster, there is no tape to pull when someone asks "what did that session do."
- **`--insecure` is a lab convenience.** It skips TLS verification against the proxy's self-signed cert;
  never use it against a real cluster — pin or trust the actual CA instead.
