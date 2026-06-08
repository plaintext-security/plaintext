# Track 08 — Cryptography, PKI & Secrets

**The trust layer of everything.** Go beyond the Foundations primer into applied
cryptography, PKI, secrets management, and email authentication — and how to audit them.

## What you'll be able to do
- Choose and use the right primitive, and recognise when one is misused.
- Run and reason about TLS and a certificate chain end to end.
- Manage secrets properly and hunt for leaked ones.
- Audit email authentication and applied-crypto failures.

## Modules

| # | Module | What you'll learn | OSS tools |
|---|--------|-------------------|-----------|
| 01 | Primitives in Practice | What each guarantees — and doesn't | `openssl` |
| 02 | Symmetric & AEAD | AES, modes, and authenticated encryption | `openssl` |
| 03 | Asymmetric & Key Exchange | RSA/EC, Diffie-Hellman, key agreement | `openssl` |
| 04 | Hashing, MACs & Passwords | Integrity, HMAC, and password storage | `openssl`, `argon2` |
| 05 | TLS Deep Dive | The handshake, ciphers, and inspection | `openssl`, `testssl.sh` |
| 06 | PKI & Certificate Management | CAs, chains, revocation, and issuance | `step-ca`, `openssl` |
| 07 | Secrets Management | Storing and brokering secrets properly | `vault`, `sops` |
| 08 | Secret Detection & Leakage | Finding credentials in code and history | `gitleaks`, `trufflehog` |
| 09 | Email Authentication | SPF, DKIM, and DMARC in practice | `dig`, `openssl` |
| 10 | Auditing Applied-Crypto Failures | Spotting the real-world mistakes | `testssl.sh` |

## Prerequisites
Complete Track 00 — Foundations (module 09 — Cryptography Basics).

## Capstone
Audit a small system's crypto posture: TLS configuration, certificate hygiene, secrets
handling, and SPF/DKIM/DMARC — then fix each finding and re-test. **Deliverable:** the audit
report with before/after evidence.

## AI & automation
Crypto is where confident-but-wrong AI advice is dangerous — models suggest broken modes
and deprecated ciphers. Use AI to explain and to draft audit tooling, then verify every
recommendation against current standards and the actual configuration. Trust the test
output, not the model's assurance.

## Standards & further reading
- RFC 8446 (TLS 1.3) and RFC 5280 (X.509/PKI)
- NIST SP 800-175B and SP 800-57 (key management)
- RFCs 7208/6376/7489 (SPF/DKIM/DMARC)
- OWASP Cryptographic Storage Cheat Sheet
