---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Identity as the Control Plane (OIDC / Keycloak / JWT)

*Companion to [Module 02 — Identity as the Control Plane](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Run Keycloak (dev)

```bash
# quick dev instance (NOT production — no persistence, HTTP only)
docker run -p 8080:8080 \
  -e KEYCLOAK_ADMIN=admin -e KEYCLOAK_ADMIN_PASSWORD=admin \
  quay.io/keycloak/keycloak:latest start-dev

# well-known discovery doc — every endpoint the flow needs
curl -s http://localhost:8080/realms/myrealm/.well-known/openid-configuration | jq
```

Key endpoints for a realm: `.../protocol/openid-connect/token` (mint),
`.../protocol/openid-connect/certs` (JWKS public keys), `.../protocol/openid-connect/userinfo`.

## Get a token (OIDC / OAuth2 grants)

```bash
# Resource Owner Password grant (the lab's scriptable shortcut — direct, no browser redirect)
# Hands the APP the user's password — fine for a lab, OAuth 2.1-deprecated for real use.
curl -s -X POST http://localhost:8080/realms/myrealm/protocol/openid-connect/token \
  -d grant_type=password \
  -d client_id=myclient \
  -d username=alice -d password=s3cret \
  -d scope=openid | jq

# Authorization Code grant (what a real app uses — password goes ONLY to the IdP)
# 1. Send the browser to the authorize endpoint; the user logs in AT Keycloak:
#      .../protocol/openid-connect/auth?response_type=code&client_id=myclient\
#        &redirect_uri=http://localhost:3000/callback&scope=openid&state=xyz
# 2. Keycloak redirects back to redirect_uri with ?code=... (single-use, ~60s).
# 3. Exchange the code (+ client_secret) on the back channel — the browser never sees this:
curl -s -X POST .../token \
  -d grant_type=authorization_code \
  -d client_id=myclient -d client_secret=$SECRET \
  -d redirect_uri=http://localhost:3000/callback \
  -d code=$CODE | jq

# Client Credentials grant (service-to-service, no user)
curl -s -X POST .../token \
  -d grant_type=client_credentials \
  -d client_id=svc -d client_secret=$SECRET | jq

# capture just the access token into a var
TOKEN=$(curl -s -X POST .../token -d grant_type=password \
  -d client_id=myclient -d username=alice -d password=s3cret | jq -r .access_token)
```

## Decode and inspect a JWT

```bash
jwt decode "$TOKEN"                    # jwt-cli: header + claims, human-readable
jwt decode --json "$TOKEN" | jq        # machine-readable

# no jwt-cli? decode the payload by hand (base64url, middle segment)
echo "$TOKEN" | cut -d. -f2 | base64 -d 2>/dev/null | jq   # add '=' padding if it complains

# claims that matter: sub (who), aud (which app), exp (dies when),
# iss (issuer), realm_access.roles (what they may do)
```

Paste into [jwt.io](https://www.jwt.io/) to decode interactively — but never paste a *real* production
token into a third-party site.

## Use the token against an API

```bash
curl -H "Authorization: Bearer $TOKEN" http://api.local/me
# introspect a token server-side (is it still active?)
curl -s -X POST .../token/introspect \
  -d token=$TOKEN -d client_id=myclient -d client_secret=$SECRET | jq .active
```

## Validating a token — do it RIGHT

A real validator MUST, in order:

```
1. Split header.payload.signature; read `alg` from the header.
2. REJECT alg: none, and reject any alg you didn't expect (no HS256 where you expect RS256).
3. Fetch the realm's public key from the JWKS (/certs), matched by the header `kid`.
4. Verify the SIGNATURE over header.payload with that key.  ← the step attackers want you to skip
5. Check `exp` (not expired), `nbf`, `iss` (your realm), and `aud` (this app, not another).
6. Only THEN read claims/roles and make the access decision.
```

A "validator" that base64-decodes the payload and reads claims without step 4 is the Storm-0558
failure mode in script form.

```bash
# Verify in ONE command — no Python (step, the smallstep CLI: brew install step)
# Enforces every gate above: --alg pins the algorithm (kills alg:none + HS256 confusion),
# --jwks fetches the public key by kid and verifies the signature, --iss/--aud/exp check the claims.
echo "$TOKEN" | step crypto jwt verify \
  --jwks <(curl -s http://localhost:8080/realms/myrealm/protocol/openid-connect/certs) \
  --iss http://localhost:8080/realms/myrealm --aud myclient --alg RS256
# exits 0 + prints the decoded JWT on success; NON-ZERO on a bad signature or failed claim.

# Python equivalent (PyJWT) — algorithms PINNED by you, never read from the token:
#   jwt.decode(token, public_key, algorithms=["RS256"], audience="myclient", issuer=ISS)
```

Handy either way, but a one-command CLI *hides* the gates behind flags — know what each flag enforces.

## Gotchas worth remembering

- **Validate signature AND `aud`/`exp`/`iss` — not just decode.** Decoding a JWT is trivial and proves
  nothing; a token is only trustworthy after its signature verifies against the JWKS *and* its
  audience/expiry/issuer match. Skipping signature verification (or accepting `alg: none`) is the whole
  ballgame.
- **The signing key is the crown jewel.** Whoever holds the realm's private key can *mint* a valid
  identity for anyone — no password, no MFA (Storm-0558). Treat it accordingly; never let it into a
  crash dump, a log, or a repo.
- **Short `exp` is a blast-radius control, not a UX annoyance.** Stretching token lifetime to stop
  re-auth complaints quietly restores session-based trust and widens the window a stolen token stays
  live. Defend the number (why 300s, not 3600?).
- **Scope each token to a single `aud`.** A token minted for app A must not be replayable against app B.
  Claim inflation (40 group memberships in every token) is VPN access re-packaged as JSON.
- **The password grant hands the *app* the user's password; Authorization Code doesn't.** ROPC is a fine
  scriptable shortcut and OAuth 2.1-deprecated for real use. In the redirect flow the password reaches
  only the IdP, and the app gets a one-time `code` it redeems with its `client_secret` — the secret
  proves the *app*, not the user.
- **`start-dev` is not production.** It uses HTTP, ephemeral storage, and dev defaults — fine for the
  lab, never for anything real.
