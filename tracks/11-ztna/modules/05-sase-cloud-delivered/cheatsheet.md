# Cheat sheet — SASE & Cloud-Delivered Zero Trust (cloudflared / Access)

*Companion to [Module 05 — SASE & Cloud-Delivered Zero Trust](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## cloudflared tunnel — outbound-only, no inbound ports

```bash
cloudflared tunnel login                       # authenticate; writes cert.pem to ~/.cloudflared
cloudflared tunnel create myapp                 # create a named tunnel → prints a tunnel UUID + creds file
cloudflared tunnel list                         # tunnels + connection state
cloudflared tunnel route dns myapp app.example.com   # map a hostname to this tunnel

# run the tunnel (dials OUT to the edge — no listener, no firewall rule)
cloudflared tunnel run myapp                    # uses config.yml
cloudflared tunnel --url http://localhost:8080 run myapp   # ad-hoc: publish a local port

cloudflared tunnel info myapp                   # active connections / edge locations
cloudflared tunnel delete myapp                 # remove it
```

### config.yml (ingress rules — first match wins, last must catch-all)

```yaml
tunnel: <TUNNEL-UUID>
credentials-file: /root/.cloudflared/<UUID>.json
ingress:
  - hostname: app.example.com
    service: http://localhost:8080     # your origin, bound to localhost
  - service: http_status:404           # REQUIRED catch-all — config errors without it
```

## Cloudflare Access policy — include / require / exclude

The three actions combine per rule:

```
include  →  OR   — ANY matching selector lets the request into this rule group
require  →  AND  — EVERY selector must also hold (added constraints)
exclude  →  NOT  — matching selectors are denied even if include matched
```

```yaml
# "@company.com emails, but ONLY from a compliant device, never a contractor"
decision: allow
include:
  - email_domain: company.com          # OR: anyone @company.com is a candidate
require:
  - device_posture: disk-encrypted      # AND: must ALSO pass posture
exclude:
  - email: contractor@company.com       # NOT: this one is denied anyway
```

A rule with only `include` and no `require` is syntactically valid and **wide open** to everyone the
`include` matches — the implicit-trust bug, one layer up.

## Red-team your own design (prove the no-listener claim)

```bash
# 1. confirm the origin is bound to localhost only, not 0.0.0.0
ss -ltnp | grep 8080                          # should show 127.0.0.1:8080, never 0.0.0.0:8080
# 2. scan the host from OUTSIDE — should find nothing to hit
nmap -Pn -p- <public-ip>                       # no open app port = no socket to attack
# 3. an unauthenticated request must land on the Access login page, never the app
curl -sI https://app.example.com | grep -i location   # redirect to the Cloudflare login
```

## Gotchas worth remembering

- **`include` is OR, `require` is AND, `exclude` is NOT.** This is the field where "valid policy" and
  "wide open" coincide. A policy with only an `include` and no `require` lets in everyone that `include`
  matches. When your intent is "must ALSO satisfy X," you need a `require` — the model reaching for
  `include` is the recurring AI mistake.
- **Prove the deny path.** A deployed no-inbound-ports service and a *claim* that it holds are different
  things. Actually attempt access with a credential that should be denied and confirm it is — that
  failed reach is part of the deliverable.
- **Verify no listener by trying to find one.** The security *is* "there is no socket," so bind the
  origin to `127.0.0.1`, then `nmap` the public IP and confirm nothing answers.
- **The catch-all ingress rule is mandatory.** A `config.yml` without a final `http_status:404` (or
  similar) service errors out — every hostname needs a fallthrough.
- **Vendor dependency is the price.** Cloud-delivered buys you convenience and sells you dependency: the
  edge is now in your data path and its SLA is the floor of your security posture. Build-vs-buy is
  ops-burden vs control — defend the call for *this* environment; there's no universally right answer.
- **Deprecated field names fail silently.** The dashboard/API may accept-then-ignore old Access field
  names — check `include`/`require`/`exclude` against the *current* Cloudflare docs.
