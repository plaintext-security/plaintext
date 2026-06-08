# Module 04 — Cryptography Basics

## Objective
Understand the cryptographic primitives that secure modern systems — hashing, symmetric
and asymmetric encryption, and certificates — and exercise them with `openssl`.

## Background
Cryptography underpins every trust decision online: that a download wasn't tampered with
(hashing), that a session is private (symmetric encryption), that a server is who it
claims (asymmetric keys + certificates). You don't need the math, but you do need to know
what each primitive guarantees — and, just as important, what it does **not**.

## Key concepts
- Hashing for integrity, not secrecy — SHA-256
- Symmetric encryption (one shared key) — AES
- Asymmetric encryption (public/private keypair) — RSA / EC
- Certificates and the chain of trust (X.509, TLS)
- Why "encrypted" ≠ "authenticated" — secrecy alone doesn't guarantee integrity

## AI acceleration
Crypto is where wrong advice is dangerous — models will confidently suggest broken modes
(ECB) or deprecated ciphers. Use AI to explain a concept, then verify the actual command
and parameters against the OpenSSL docs and current guidance before you rely on them.

## Further reading
- RFC 8446 (TLS 1.3): https://datatracker.ietf.org/doc/html/rfc8446
- NIST SP 800-175B (cryptographic standards guidance): https://csrc.nist.gov/pubs/sp/800/175/b/r1/final
- OpenSSL documentation: https://docs.openssl.org/
