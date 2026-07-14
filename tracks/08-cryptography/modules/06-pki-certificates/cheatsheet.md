---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Private PKI with step-ca & step CLI

*Companion to [Module 06 — PKI & Certificate Management](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Stand up a CA (step-ca)

```bash
step ca init                               # interactive: name the CA, pick root/intermediate, provisioner
step ca init --name "Corp CA" \
  --dns ca.corp.internal --address :443 \
  --provisioner admin@corp.internal        # non-interactive scaffold
step-ca $(step path)/config/ca.json        # start the CA server (foreground)
step ca health                             # is the running CA reachable and healthy?
```

`step path` prints the `$STEPPATH` config dir (certs, keys, `ca.json`). Everything the CA holds lives there.

## Bootstrap a client to trust the CA

```bash
step ca bootstrap --ca-url https://ca.corp.internal \
  --fingerprint <root-fp>                  # install the root into $STEPPATH so this host trusts the CA
step certificate fingerprint root_ca.crt   # compute the SHA-256 fingerprint to pin against
```

## Issue, renew, and inspect leaf certificates

```bash
step ca certificate corp.internal svc.crt svc.key    # request a leaf (SAN = the name given)
step ca certificate corp.internal svc.crt svc.key \
  --not-after 5m                           # deliberately short-lived cert (test revocation independence)
step ca renew svc.crt svc.key              # renew before expiry (the automation-friendly path)
step certificate inspect svc.crt           # human-readable: subject, SANs, validity, extensions
step certificate inspect svc.crt --short   # one-line summary
step certificate inspect https://example.com   # inspect a live server's cert over TLS
```

## Verify the chain and revoke

```bash
step certificate verify svc.crt --roots root_ca.crt   # validate leaf against the trust anchor
step ca revoke --cert svc.crt --key svc.key           # revoke by presenting the cert
step ca revoke <serial-number>                        # revoke by serial (from inspect output)
```

Corrupt a byte of the PEM and re-run `verify` — the signature check fails, proving the whole chain is
signature-verified, not just trusted by filename.

## openssl x509 — read the fields that decide authorisation

```bash
openssl x509 -in svc.crt -noout -ext subjectAltName    # the SANs — the real hostname validation field
openssl x509 -in svc.crt -noout -ext basicConstraints  # CA:TRUE (a CA) vs CA:FALSE (a leaf)
openssl x509 -in svc.crt -noout -ext keyUsage          # keyCertSign,cRLSign on a CA; digitalSignature on a leaf
openssl x509 -in svc.crt -noout -enddate               # notAfter — feed this to an expiry monitor
openssl x509 -in svc.crt -noout -serial                # serial number (identifies the cert in revocation)
openssl verify -CAfile root_ca.crt -untrusted int.crt svc.crt   # verify a leaf through an intermediate
```

## Gotchas worth remembering

- **SAN is the hostname field, not CN.** Modern TLS ignores the Common Name for hostname matching — a
  cert with the right CN but no matching `subjectAltName` still fails validation. Always check the SANs.
- **`basicConstraints` is what stops a stolen leaf from minting certs.** `CA:FALSE` means the key cannot
  sign other certificates. This is why a leaked leaf key impersonates *one* host, not the whole CA.
- **Trust is transitive and no stronger than the root.** Every CA in the trust store can mint a cert for
  *any* name (DigiNotar's lesson). There's no per-domain boundary by default — CAA records and short
  lifetimes are mitigations bolted on top.
- **Revocation half-works.** OCSP soft-fail clients treat an unreachable responder as "valid," so an
  attacker who blocks the check defeats it. Prefer short-lived certs + `step ca renew` over relying on revocation.
- **Verify the byte, not the filename.** `step certificate verify` checks the cryptographic signature up
  the chain; a tampered PEM fails. Don't confuse "the file is named root.crt" with "the signature is valid."
- **The root key is the crown jewel.** In production the root is offline/air-gapped and the intermediate
  issues daily — so a compromised operational key doesn't hand over the trust anchor.
