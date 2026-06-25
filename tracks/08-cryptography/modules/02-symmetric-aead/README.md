# Module 02 — Symmetric & AEAD

*Type 2 · Misconception Reveal — you predict AES-GCM is foolproof, then see nonce/IV reuse break it worse than CBC (the WEP / PS3 nonce-reuse disaster); the reveal is that the mode is only as safe as its nonce discipline. (Secondary: Blast-Radius Trace.) [Go to the hands-on lab →](lab.md)*

*Last reviewed: 2026-06*

**[Track 08 — Cryptography, PKI & Secrets]** — *AES-GCM is the right choice — until you reuse the IV, at which point it is broken in a way that's worse than CBC.*

<!-- module-meta -->
**Difficulty:** Intermediate &nbsp;·&nbsp; **Estimated time:** ~5–7 hrs (study + lab) &nbsp;·&nbsp; **Prerequisites:** [Foundations](../../../00-foundations/README.md)
{ .module-meta }

!!! abstract "In 60 seconds"
    AEAD (AES-GCM, ChaCha20-Poly1305) is the modern answer to module 01's confidentiality-vs-integrity
    false choice — it encrypts *and* authenticates. But it carries one catastrophic failure mode the
    algorithm cannot police: nonce/IV reuse. Repeat a nonce under the same key and you hand an attacker
    the XOR of both plaintexts *and* the ability to forge tags — worse than CBC's padding oracle. It's
    the exact arithmetic that broke WEP, only the cipher changed. The fix is a unique 96-bit nonce per
    encryption, and that uniqueness is *your* responsibility.

## Why this matters

The canonical real-world demonstration that IV/nonce reuse breaks a stream cipher is **WEP**, the original Wi-Fi encryption. WEP fed RC4 a 24-bit IV prepended to a static key; with only ~16.7 million IVs, a busy network repeats one within minutes — and the moment two packets share an IV, they share a keystream, so XORing the two ciphertexts cancels the keystream and yields the XOR of the two plaintexts ([Borisov, Goldberg & Wagner, "Intercepting Mobile Communications: The Insecurity of 802.11," MobiCom 2001](http://web.cs.ucla.edu/classes/fall03/cs211/papers/mobilesec.pdf)). That single design mistake — reusing the keystream — is *exactly* the failure mode that recurs in AES-GCM when a nonce repeats. Authenticated Encryption with Associated Data (AEAD) is the modern answer to the "confidentiality vs integrity" false choice in module 01. AES-GCM is the dominant AEAD scheme in practice — it is the cipher suite in TLS 1.3, the default in many cloud encryption APIs, and the recommended mode in NIST guidance. But AEAD schemes have a specific failure mode that is catastrophically worse than a classical cipher's failure: nonce/IV reuse. Understanding AEAD in depth — what it guarantees, what it requires of the caller, and where implementations go wrong — is the applied cryptography skill that separates a practitioner from someone who just picked the recommended mode.

## Objective

Demonstrate AES-GCM authenticated encryption and the concrete failure mode of IV reuse — showing that two messages encrypted with the same key and IV allow an attacker to recover the XOR of both plaintexts — then implement the correct IV generation pattern.

## The core idea

AES-GCM is a composed construction: it uses AES in Counter Mode (CTR) for encryption and GHASH for authentication. The CTR keystream is generated from the key and nonce (IV); if the same nonce is used with the same key, the same keystream is generated. When an attacker has two ciphertexts encrypted with the same key/nonce pair, XORing them cancels the keystream and produces the XOR of the two plaintexts — a known-plaintext or crib-dragging attack can then recover both. This is "nonce misuse" and it completely breaks the confidentiality guarantee, regardless of the fact that GCM otherwise provides authenticated encryption. This is the same arithmetic that doomed WEP — only the cipher changed from RC4 to AES-CTR.

!!! note "The mental model"
    A nonce is not a key and not a secret — it travels in the clear next to the ciphertext. Its one
    job is to be *unique per key*. Think of it as a serial number the keystream is built from: reuse
    the serial number and you reuse the keystream, and a stream cipher with a reused keystream is no
    cipher at all.

The authentication tag in GCM also depends on the nonce. Nonce reuse allows an attacker to forge authentication tags — recovering the authentication key from two messages encrypted with the same nonce. The combined result of nonce reuse is catastrophic: both confidentiality and authenticity are broken simultaneously. This is categorically worse than CBC's padding oracle (which breaks confidentiality under specific conditions) because it requires only two observed ciphertexts with the same nonce to achieve full compromise.

!!! warning "The gotcha"
    "We use AES-GCM" tells you nothing about safety — the mode is only as safe as its nonce
    discipline. The bugs that reuse nonces are mundane: a hardcoded test IV shipped to production, a
    counter that resets after a reboot, a weak entropy source on an embedded device. One repeat is
    full compromise, not a degraded margin.

The correct implementation pattern for AES-GCM is a randomly generated 96-bit (12-byte) nonce for every encryption operation. The nonce is not secret — it is transmitted alongside the ciphertext — but it must be unique per key. At 96 bits of randomness, the birthday bound probability of a collision at 2^32 encryptions is acceptable for most applications; if you need more encryptions under a single key, use a deterministic nonce (a counter) with collision-resistant generation, or rotate the key. The key insight is that the nonce uniqueness requirement is a caller responsibility — the AES-GCM algorithm cannot enforce it. Bugs that reuse nonces are typically found in embedded systems with weak entropy sources, in counter implementations that reset after restart, or in code that hardcodes a test nonce into production.

ChaCha20-Poly1305 is the AEAD alternative to AES-GCM. It uses the ChaCha20 stream cipher with the Poly1305 MAC. Its primary advantage is software performance without hardware AES acceleration — relevant for mobile devices, IoT, and systems where AES-NI is not available. Its nonce requirements are identical to GCM: unique 96-bit nonce per encryption. TLS 1.3 includes both `TLS_AES_256_GCM_SHA384` and `TLS_CHACHA20_POLY1305_SHA256` as mandatory cipher suites, and most TLS implementations negotiate ChaCha20 when AES-NI is unavailable on the client.

??? note "Go deeper: the 'forbidden attack' against real TLS servers"
    The nonce-reuse break isn't a classroom toy. The Nonce-Disrespecting Adversaries project found
    live TLS servers reusing GCM nonces and used a *single* repeat to recover the GHASH key `H` and
    forge messages. The lab reproduces exactly this recovery — the same two-ciphertext requirement,
    the same algebra — so you see the gap between "configured AES-GCM" and "deployed it safely."

!!! tip "AI caveat"
    Ask an AI for the nonce-reuse demo and it will write it correctly. Ask it for the *fixed* version
    and check the nonce source line by line: it must be `os.urandom(12)` or a proven-unique counter,
    never a constant. A model will sometimes leave a hardcoded nonce in "for clarity" — exactly the
    production bug.

## Learn (~4 hrs)

**Nonce/IV reuse's real-world failure — the *why* (~20 min)**
- [Borisov, Goldberg & Wagner — "Intercepting Mobile Communications: The Insecurity of 802.11" (MobiCom 2001, PDF)](http://web.cs.ucla.edu/classes/fall03/cs211/papers/mobilesec.pdf) — the paper that broke WEP; read Section 4 ("Keystream Reuse"). WEP's 24-bit IV guarantees keystream reuse on any busy network, and the XOR-of-plaintexts recovery it describes is the *same* attack you implement against AES-GCM in the lab.

**AES-GCM in depth**
- [NIST SP 800-38D — Recommendation for GCM](https://csrc.nist.gov/pubs/sp/800/38/d/final) — the specification; read Sections 5–6 (the construction and requirements) and Section 8 (the key usage guidance). The nonce uniqueness requirement is in Section 8.

**AEAD alternatives**
- [RFC 8439 — ChaCha20 and Poly1305 for IETF Protocols](https://www.rfc-editor.org/rfc/rfc8439) — the spec for ChaCha20-Poly1305; read the Introduction and Section 2 for the construction overview.

**IV reuse attack implementation**
- [Böck, Zauner et al. — "Nonce-Disrespecting Adversaries: Practical Forgery Attacks on GCM in TLS" (project page + paper)](https://github.com/nonce-disrespect/nonce-disrespect) — the practical write-up of the GCM "forbidden attack": one repeated nonce recovers the GHASH authentication key `H` and lets you forge messages. Read the README's attack summary — it is exactly the recovery you implement in the lab, found live against real TLS servers.

**Python cryptography library**
- [cryptography.io — Symmetric encryption with AEAD](https://cryptography.io/en/latest/hazmat/primitives/aead/) — the `AESGCM` and `ChaCha20Poly1305` API reference; understand the `nonce` parameter and the `InvalidTag` exception.

## Key concepts

- AES-GCM = AES-CTR (encryption) + GHASH (authentication); both depend on the nonce.
- Nonce reuse breaks both confidentiality (XOR of plaintexts) and authenticity (tag forgery).
- **WEP** is the canonical real-world IV-reuse failure: a 24-bit IV over RC4 guaranteed keystream reuse and made Wi-Fi traffic recoverable — the identical arithmetic that breaks AES-GCM on a repeated nonce.
- The nonce must be unique per key; uniqueness is a caller responsibility the algorithm cannot enforce.
- Correct pattern: randomly generated 96-bit nonce per encryption, transmitted with ciphertext.
- ChaCha20-Poly1305 is the software-performance alternative; same nonce requirements, different algorithm.

## AI acceleration

Ask an AI to write a Python script demonstrating the GCM nonce-reuse attack: encrypt two messages with the same key and nonce, XOR the ciphertexts, and show the result is the XOR of the plaintexts. Verify the math works by running the script. Then ask it to write the *correct* version with a randomly generated nonce. Check that the random nonce version uses `os.urandom(12)` or equivalent — not a hardcoded value — before committing either.

!!! question "Check yourself"
    - Two ciphertexts were produced with the same AES-GCM key and the same nonce. What exactly can an attacker recover, and with how many observed messages?
    - Why is GCM nonce reuse categorically *worse* than a CBC padding oracle?
    - A nonce is sent in the clear alongside the ciphertext — so why isn't transmitting it a confidentiality problem, and what *is* the one property it must have?
