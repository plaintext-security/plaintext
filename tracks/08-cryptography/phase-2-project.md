# Phase 2 Project — Private CA to TLS Scan

*Cryptography, PKI & Secrets · Phase 2 (modules 05–06) · ~4–6 hrs · Prereqs: finish modules 05, 06 first.*

> You ran a private CA and scanned a TLS service separately. The project is the **integration**: stand up your own CA, issue and chain a certificate, serve TLS with it, then scan that service and explain every handshake step and cipher the scan reports — issuance to inspection, one chain.

## Why this is a project, not another module

Each Phase-2 module left one half of the PKI-to-TLS story. Alone they're a cert and a scan; integrated they're a service you issued, served, and audited end to end:

- **05 · TLS deep dive** → `tls-audit-report.md` + `tls-check.sh` (the five-finding handshake/cipher audit; a `testssl.sh` gate that fails CI on HIGH/CRITICAL findings).
- **06 · PKI & certificates** → `pki-analysis.md` + `cert-expiry-check.sh` (the leaf cert's SAN/validity/basicConstraints, the OCSP revocation evidence, the short-lived-cert argument; an expiry check that fails inside 30 days).

## Build it

1. **Issue the chain you'll serve.** Use `step-ca` (06) to run a private CA and issue a leaf certificate with a correct SAN and `basicConstraints`, chained to your root — then point a TLS service at *that* chain. The cert you scan is one you issued, so every finding is one you can fix at the source.
2. **Scan and explain, not just run.** Run `testssl.sh` (05) against the service and produce the handshake walk: the protocol negotiated, the key exchange, the cipher chosen — explain *why* each, citing TLS 1.3 (RFC 8446) where it applies. A scan you can't read is noise.
3. **Wire the gates.** Put `tls-check.sh` (05) and `cert-expiry-check.sh` (06) in front of the service so a HIGH finding or a cert expiring within 30 days fails the check — issuance hygiene and TLS hygiene enforced, not just observed.
4. **One report.** Produce `tls-pki-report.md`: the issued chain (fields + revocation evidence), the annotated handshake/cipher walk, and the two gate results, leading with a one-line *what this proves* per section.

## Success criteria

- [ ] A certificate **you issued** from your own `step-ca` serves a TLS service, chained and verifying.
- [ ] The `testssl.sh` walk explains every handshake step and cipher decision, citing the standard.
- [ ] Both gates fire — `tls-check.sh` on a HIGH finding, `cert-expiry-check.sh` on a near-expiry cert.
- [ ] Revocation is demonstrated (serial + OCSP), not just asserted.

## Deliverable

A `tls-pki/` folder in your repo: the **CA/issuance config**, the **gate scripts**, the **`tls-pki-report.md`** (chain → handshake walk → gate results), and your committed module notes. Reference the certs — **do not** commit private keys, the CA signing key, or any secrets (see `.gitignore`).

## Self-check rubric

Grade your own `tls-pki/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Issuance & chain** | Self-signed cert, no chain | Leaf issued from your CA with correct SAN/constraints, chain verifies | ACME/short-lived issuance demonstrated; rotation shown |
| **Handshake read** | Scan run, not interpreted | Every handshake step and cipher explained, standard cited | Ties cipher choice to forward secrecy and RFC 8446 specifics |
| **Gates** | None | Both TLS and expiry checks fail correctly on a bad input | Wired into CI; reports *which* finding/date tripped the gate |
| **Revocation & hygiene** | Expiry checked only; keys committed | Revocation shown (serial + OCSP); no private/CA keys in history | Revocation automated; commits tell the build story |

→ Next: **[Module 07 — Secrets Management](modules/07-secrets-management/README.md)** opens Phase 3, which **is** the **[track capstone](README.md#capstone)**.
