---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Workload Identity & mTLS (SPIFFE / SPIRE)

*Companion to [Module 10 — Workload Identity & mTLS (SPIFFE/SPIRE)](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The vocabulary

```
SPIFFE ID   spiffe://corp.local/ledger    — a workload's identity, a URI
SVID        the SPIFFE ID wrapped in a short-lived X.509 cert (or JWT), signed by the trust-domain CA
trust domain  corp.local                  — the CA root everyone in the domain validates against
Workload API  the local socket a workload calls to fetch its own SVID at runtime
selector    an unforgeable property the agent observes (unix:uid, k8s:sa, docker:image-id)
registration entry   selectors → SPIFFE ID  (the workload-identity equivalent of an IAM policy)
```

## SPIRE server

```bash
spire-server run -config server.conf                 # start the server (the CA + registry)
spire-server healthcheck
spire-server token generate -spiffeID spiffe://corp.local/agent   # join token for node attestation
spire-server bundle show                             # the trust bundle (CA roots) to distribute

# register a workload: bind a SPIFFE ID to hard-to-spoof selectors
spire-server entry create \
  -spiffeID spiffe://corp.local/ledger \
  -parentID spiffe://corp.local/agent \
  -selector docker:image_id:sha256:<digest>          # pin to the IMAGE DIGEST, not a settable label
spire-server entry show                              # list registration entries
```

## SPIRE agent + workload

```bash
spire-agent run -config agent.conf -joinToken <TOKEN>   # node attestation via the join token
spire-agent healthcheck

# a workload fetches its OWN identity off the Workload API (no secret shipped to it)
spire-agent api fetch x509 -write /tmp/svid/          # writes svid.pem, key.pem, bundle.pem
spire-agent api fetch jwt -audience ledger            # JWT-SVID for a given audience
```

## Verify the mTLS + inspect the SVID

```bash
# read the SPIFFE ID out of the cert (it's in the SAN URI)
openssl x509 -in /tmp/svid/svid.0.pem -noout -text | grep -A1 "Subject Alternative Name"
openssl x509 -in /tmp/svid/svid.0.pem -noout -enddate    # confirm the SHORT TTL (minutes, not months)

# mutual TLS handshake: BOTH sides present + validate a cert
openssl s_client -connect ledger:8443 \
  -cert /tmp/svid/svid.0.pem -key /tmp/svid/key.0.pem \
  -CAfile /tmp/svid/bundle.0.pem                        # verify return code should be 0 (ok)
```

## Prove the boundary (the deny)

```bash
# a workload with NO matching registration entry must be refused an identity
spire-agent api fetch x509 -write /tmp/nope/   # from an unregistered process → no SVID, error out
# → and therefore the mTLS handshake cannot complete: identity, not network position, grants access
```

## Gotchas worth remembering

- **The security control is "get the attestation right," not "protect the key."** There's no long-lived
  key to steal — the risk moves to the *selectors*. A selector that's too loose (`unix:uid:0`, a label
  any deployment can set) lets the wrong workload claim an identity — the workload-identity equivalent
  of a wildcard IAM policy. Ask of every selector: *could a different workload satisfy this?*
- **Pin to genuinely-unforgeable selectors.** Prefer an image digest or a namespace-bound Kubernetes
  service account over a shared UID or a free-form Docker label. The model will happily pick a selector
  that *works* without seeing it's forgeable.
- **Keep SVID TTLs short.** A leaked SVID should expire in minutes; the agent auto-rotates. Long TTLs
  re-create the long-lived-secret problem SPIFFE exists to kill.
- **mTLS means BOTH ends present and validate a cert.** Client proves itself to server *and* server to
  client, each reading the peer's SPIFFE ID out of the SAN — no shared secret anywhere.
- **SPIFFE is authentication, not authorization.** It proves *which* workload is calling and encrypts
  the channel; whether `spiffe://.../web` may call `spiffe://.../ledger` is a *policy* question — the
  handoff to OPA (Module 08). Identity here, decision there.
- **No bootstrap secret is shipped to the workload.** Its identity is *derived from what it demonstrably
  is* (node attestation, then workload attestation) — which is why an unregistered workload simply gets
  nothing.
