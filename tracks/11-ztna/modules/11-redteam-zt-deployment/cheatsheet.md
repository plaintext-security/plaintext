---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Red-team Your Zero-Trust Deployment

*Companion to [Module 11 — Red-team Your Zero-Trust Deployment](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only test systems you own or have explicit written permission to test.

## The four attacks map to four tenets

```
(1) No inbound listener   → nmap the host/origin — nothing to hit
(2) No unauthenticated reach → curl with no session — a login/redirect/drop, never a 200 from the backend
(3) No forged identity    → curl a spoofed X-Forwarded-* header — must be ignored
(4) No proxy bypass       → curl the backend directly — must refuse (dual of #1)
```

A **refused attack is a documented win** — "I attacked this and it held" is the artifact.

## (1) Prove nothing listens

```bash
nmap -Pn -p- <origin-host>                     # full TCP port sweep — expect no app port open
nmap -Pn --top-ports 1000 -sV <origin-host>    # service/version on the common ports
ss -ltnp | grep -E ':(8080|3000|8443)'         # on the origin: bound to 127.0.0.1, never 0.0.0.0
```

## (2) Prove unauthenticated reach is denied

```bash
curl -sS -o /dev/null -w "%{http_code}\n" https://app.example.com/     # expect redirect/deny, not 200
curl -sI https://app.example.com/ | grep -i location                   # lands on the Access/login page
curl -sS -o /dev/null -w "%{http_code}\n" https://app.example.com/admin # a protected route — still denied
```

## (3) Identity-header forgery (the one this module exists for)

```bash
# a PLAIN client-settable header — costs nothing, must be IGNORED by a verifying backend
curl -H "X-Forwarded-User: admin@corp.com"  https://app.example.com/whoami
curl -H "X-Forwarded-Email: admin@corp.com" https://app.example.com/whoami
curl -H "X-Forwarded-Uri: /admin"           https://app.example.com/    # CVE-2026-40575 class

# against the deliberately-NAIVE backend the forgery SUCCEEDS (your one finding);
# against the VERIFYING backend it's refused — because it checks the SIGNED assertion:
curl -s https://app.example.com/.well-known/pomerium/jwks.json | jq     # the key the backend verifies against
```

The rule the backend must obey: trust the identity in `X-Pomerium-Jwt-Assertion` **only after**
verifying its signature against the JWKS plus `aud`/`iss`/`exp` — never a plain header.

## (4) Proxy bypass — reach the backend directly

```bash
curl -sS -o /dev/null -w "%{http_code}\n" http://backend-host:8080/     # must refuse — no path around proxy
nmap -Pn -p 8080,3000 backend-host                                       # is the backend port published anywhere?
```

## Inspect / forge at the TLS + JWT layer

```bash
openssl s_client -connect app.example.com:443 -servername app.example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -dates                  # what cert the edge/proxy presents

# decode a captured assertion — then confirm the backend actually re-verifies it, not just trusts it
echo "$ASSERTION" | cut -d. -f2 | base64 -d 2>/dev/null | jq   # aud / iss / exp the backend must check
```

## Gotchas worth remembering

- **A control you haven't attacked is a hope, not a control.** A green dashboard and a `connected`
  tunnel prove the happy path; they say nothing about whether the deny path refuses the attacks it was
  built to refuse. The deny path is the only thing that makes it Zero Trust.
- **Forging a plain header is free; forging a *signed* assertion needs the proxy's private key.**
  `curl -H "X-Forwarded-User: admin@corp.com"` costs nothing. A backend that believes an *unsigned*
  identity header has handed authentication to you. CVE-2026-40575 (OAuth2 Proxy, CVSS 9.1) is this
  exact class.
- **Bypass is the dual of denial.** Even a perfect deny path is decoration if the backend is reachable
  around the proxy — a published port, a flat-network route, a teammate's `docker run -p`.
- **Your harness must fail *closed*.** A script that prints PASS when a `curl` errors, times out, hits a
  `000`, or takes an unexpected redirect tells you your *design* held when your *test* broke. A probe
  that can't reach a verdict is a failure to investigate, never a silent pass.
- **A red-team that finds nothing may have a hardened design *or* a shallow attack.** Point the same
  harness at the deliberately-naive backend and confirm it correctly goes RED — that's how you know your
  green means something.
- **The finding is the exercise working.** Landing one forgery against the naive backend, hardening it,
  and re-attacking until it fails too *is* the deliverable — not a failure of the exercise.
