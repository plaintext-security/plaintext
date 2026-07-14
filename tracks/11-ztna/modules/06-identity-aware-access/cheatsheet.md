---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Identity-Aware Access (Pomerium)

*Companion to [Module 06 — Identity-Aware Access](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Pomerium — the identity-aware proxy

Pomerium bundles three services (split in production, one container in the lab):
**authenticate** (OIDC redirect dance) · **authorize** (policy against claims) · **proxy** (forwarding).

```yaml
# config.yaml — a route with an inline policy (PPL)
routes:
  - from: https://app.example.com
    to: http://backend:8080          # upstream — no public listener
    policy:
      - allow:
          and:
            # bind to IdP-managed GROUPS/roles, not raw email strings
            - claim/groups: [engineering]
            - domain: [corp.com]
      - deny:
          or:
            - user: [contractor@corp.com]
```

```bash
pomerium -config config.yaml          # run the proxy
# the proxy signs its assertion with a key published at:
curl -s https://app.example.com/.well-known/pomerium/jwks.json | jq   # JWKS for backend verification
```

## The identity header the backend must trust

The proxy injects `X-Pomerium-Jwt-Assertion` — a JWT *signed by Pomerium's key*. The backend verifies:

```
1. Fetch Pomerium's public key from /.well-known/pomerium/jwks.json (cache it).
2. Verify the assertion's SIGNATURE against that key.
3. Check aud (this service), iss (your Pomerium), exp (not expired).
4. ONLY THEN read the identity/claims inside — never before.
```

## Test the deny path (the part AI-drafted policy skips)

```bash
# 1. no token → dropped, not a 401 login page reaching the backend
curl -sS -o /dev/null -w "%{http_code}\n" https://app.example.com/    # expect a redirect/deny, never 200 from backend

# 2. FORGE a client-supplied identity header — must be ignored
curl -H "X-Forwarded-User: admin@corp.com" https://app.example.com/    # must NOT authenticate you
curl -H "X-Forwarded-Email: admin@corp.com" https://app.example.com/   # same — a plain header is free to set

# 3. DIRECT-TO-BACKEND bypass — the backend must refuse a request that skipped the proxy
curl -sS -o /dev/null -w "%{http_code}\n" http://backend:8080/          # must not be reachable around the proxy

# 4. a valid session → trace the injected assertion the backend actually verifies
curl -H "Cookie: _pomerium=$SESSION" -i https://app.example.com/whoami
```

## Gotchas worth remembering

- **Trust only the *signed* assertion — never a plain client-supplied header.**
  `curl -H "X-Forwarded-User: admin@corp.com"` costs nothing; a backend that believes an *unsigned*
  identity header has handed authentication to the attacker. Verify `X-Pomerium-Jwt-Assertion` against
  the JWKS + `aud`/`iss`/`exp` *before* reading any claim. CVE-2026-40575 (OAuth2 Proxy, CVSS 9.1) is
  this exact class made into a CVE.
- **No bypass.** Every path to the backend must pass through the proxy. A published port, a flat-network
  route, or a teammate's `docker run -p` makes the whole deny path moot — no request ever hits the
  identity check. "No open ports" is a precondition, not a nice-to-have.
- **Header-forgery and bypass are duals of one rule:** every path traverses the proxy, and the backend
  believes only what the proxy cryptographically signs. Test *both* deny paths, not just the allow path.
- **Bind policy to IdP-managed groups/roles, not email-domain strings.** `allow if email ends in
  @corp.com` breaks the moment the IdP also issues `@corp-partner.com` tokens or you must distinguish a
  finance analyst from a junior dev. The IdP is the system of record; the proxy is the enforcement point.
- **A deny is not a 401 — it's a dropped packet.** No valid token means the backend never sees the
  request. Attackers scanning the IP see nothing.
- **AI policy skews permissive.** The only way to know a policy is tight is to send a request that
  *should* fail and confirm it does — encode that verdict as a regression test so a future edit can't
  silently reopen the deny path.
