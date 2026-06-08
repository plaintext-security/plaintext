# Module 09 — Cryptography Basics

**Foundations** — *the trust layer under every secure system.*

## Why this matters
Every trust decision online rests on crypto: that a download wasn't tampered with
(hashing), that a session is private (symmetric), that a server is who it claims
(asymmetric + certificates). You don't need the math, but you do need to know what each
primitive guarantees — and what it doesn't. Get this wrong and the Cloud, Web, and
Crypto/PKI tracks all inherit the mistake.

## Objective
Explain and exercise the core primitives — hashing, symmetric and asymmetric encryption,
and certificates — with `openssl`, and recognise when one is misused.

## Learn (~4 hrs)

**Concepts**
- [Crypto 101 (free book)](https://www.crypto101.io/) — a no-math, practical intro to the primitives and how they fail; the best free starting point.
- [Computerphile — cryptography playlist (YouTube)](https://www.youtube.com/playlist?list=PLzH6n4zXuckpoaxDKOOV26yhgoY2S-xYg) — short, vivid explainers (AES, Diffie-Hellman, hashing) for when a concept won't stick.

**Hands-on with openssl & TLS**
- [OpenSSL Cookbook (free, Ivan Ristić)](https://www.feistyduck.com/library/openssl-cookbook/) — the canonical reference for the exact commands in the lab.
- [The Illustrated TLS 1.3 Connection](https://tls13.xargs.org/) — a byte-by-byte walk through a real handshake; makes "what a certificate is for" finally click.

**Reference**
- [RFC 8446 (TLS 1.3)](https://datatracker.ietf.org/doc/html/rfc8446) — the source of truth; skim, don't read cover to cover.

## Key concepts
- Hashing for integrity, not secrecy — SHA-256
- Symmetric encryption (one shared key) — AES, and why AEAD matters
- Asymmetric encryption (keypair) — RSA / EC
- Certificates and the chain of trust (X.509, TLS)
- "Encrypted" ≠ "authenticated"

## AI acceleration
Crypto is where confident-but-wrong AI advice is dangerous — models suggest broken modes
(ECB) and dead ciphers. Use a model to explain a concept, then verify the actual command
and parameters against the OpenSSL Cookbook before you rely on them.
