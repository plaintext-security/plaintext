# Type pass — Track 08: Cryptography, PKI & Secrets

Tagging each module against the 16-type library. Crypto is dominated by **Misconception
Reveal (2)** — almost every module is anchored on a "you thought this was safe" intuition —
with **Blast-Radius Trace (3)** where a weak scheme is actually broken, **Audit→Build→Verify
(4)** for the config/fix labs, and a clear absence of the two types the crypto domain most
needs at the top end: **Decision/ADR (11)** (algorithm/library/mode choice) and **Migration (12)**
(crypto-agility / PQC).

| Module | Primary | Secondary | Fit | Note |
|---|---|---|---|---|
| 01 Primitives in Practice | 2 Misconception Reveal | 1 Concept Autopsy | ✓ | "encryption = safe" — confidentiality ≠ integrity; ECB penguin, bit-flip on unauthenticated CBC. Strong predict-then-reveal. |
| 02 Symmetric & AEAD | 2 Misconception Reveal | 3 Blast-Radius Trace | ✓ | "AES-GCM is the right answer" — until IV reuse breaks it worse than CBC. Anchor on the **Sony PS3 ECDSA nonce reuse (2010)** / WEP IV reuse as the real-world nonce-misuse disaster (currently no named incident). |
| 03 Asymmetric & Key Exchange | 2 Misconception Reveal | 1 Concept Autopsy | ⚠ | Solid bridge (trapdoors, forward secrecy) but currently a passive concept page with no failure anchor — the obvious one is the **Debian OpenSSL RNG bug (2008, CVE-2008-0166)** (predictable keys) or PS3 nonce reuse. Add a "predict where the key exchange fails" beat. |
| 04 Hashing, MACs & Passwords | 2 Misconception Reveal | 3 Blast-Radius Trace | ✓ | "SHA-256 is a fine password store" — fast hash + no salt. Anchor explicitly on **Adobe 2013** (3DES-ECB password "encryption" + plaintext hints) or LinkedIn 2012 (unsalted SHA-1). Lab already has a cracking beat = Blast-Radius. |
| 05 TLS Deep Dive | 4 Audit→Build→Verify | 2 Misconception Reveal | ✓ | Build weak+strong nginx, scan, interpret. **Heartbleed (CVE-2014-0160)** and the **padding-oracle/POODLE/BEAST** family are the natural anchors; currently named only abstractly. |
| 06 PKI & Certificate Management | 7 Build-&-Operate | 1 Concept Autopsy | ✓ | Run step-ca, issue, chain, revoke — a genuine build/operate module. Real anchors available: **DigiNotar 2011** (CA compromise) or **ROCA (CVE-2017-15361)** weak-key cert generation. Revocation "soft-fail" gotcha is good bridge. |
| 07 Secrets Management | 7 Build-&-Operate | 11 Decision/ADR (latent) | ✓ | Operate Vault + SOPS. Vault-vs-SOPS (runtime broker vs secrets-in-git) is a real **ADR** that's currently implied, not committed. Anchor: Uber 2016 (hardcoded AWS keys in a private repo). |
| 08 Secret Detection & Leakage | 2 Misconception Reveal | 8 Judgment-as-Code/Gate | ✓ | "I deleted the file" ≠ "the secret is gone" — git history is permanent. Pre-commit/CI gate = type 8. Anchor on a real leaked-key breach (e.g. the **Uber 2016 GitHub-key** or Toyota/Samsung token leaks). |
| 09 Email Authentication | 2 Misconception Reveal | 4 Audit→Build→Verify | ✓ | "SPF stops spoofing" — it doesn't cover the visible From; DMARC alignment does. Staged none→quarantine→reject is operate-and-verify. Good fit; anchor on a real BEC/spoof case for the predict beat. |
| 10 Auditing Applied-Crypto Failures | 4 Audit→Build→Verify | 14 Adversarial Review | ✓ | Audit a config matrix, score, map to OWASP/NIST, deliver a remediation-delta report — the phase-3 capstone shape. Strong. The "AI suggests broken modes, you verify" thread is latent type-14/15. |

## Coverage gaps

- **#12 Migration / Brownfield is entirely absent — the biggest gap.** Crypto-agility and the
  **post-quantum migration** (NIST FIPS 203/204/205 finalized 2024; ML-KEM hybrid key exchange
  rolling out in TLS) is *the* defining real-world crypto task of the next decade, and a textbook
  strangler-fig migration (inventory crypto → pick hybrid suites → migrate without breaking
  interop → prove nothing broke). It also surfaces SHA-1→SHA-2 and RSA→ECDSA brownfield moves.
  The track ends at "audit failures" and never asks the learner to *migrate* anything.
- **#11 Decision/ADR is latent but never committed as a deliverable.** Algorithm/library/mode
  choice is the single most ADR-shaped decision in security (AES-GCM vs ChaCha20-Poly1305; RSA
  vs Ed25519; Vault vs SOPS vs cloud KMS; bcrypt vs Argon2id). Modules 02/03/04/07 each contain
  the tradeoff prose but stop short of an "options · tradeoffs · pick · why" artifact. The
  capstone rubric rewards "cites the standard for each decision" — an ADR is the missing vehicle.
- **#3 Blast-Radius Trace is under-exercised at the attack level.** Modules 02 and 04 describe
  the break (nonce-reuse XOR recovery, offline cracking) but mostly stop at demonstration; a
  true Blast-Radius module would have the learner *carry out* a padding-oracle or nonce-reuse
  exploit end-to-end and trace how far one broken primitive reaches (e.g. a forged session token).
- **Real-incident anchoring is thin.** Per the type library, every module should commit the
  learner to a prediction against a *named* failure. Several modules (01, 03, 05, 09) currently
  teach the mechanism abstractly without the Adobe/Heartbleed/Debian-RNG/ROCA/PS3-nonce hook
  that would make the predict-then-reveal land. This is a fit ⚠ for 03 specifically.
- **#13 Eval Harness — minor/optional.** Not core to crypto, but a "crypto posture regression
  gate" (testssl/cert-expiry/secret-scan run continuously, fail on regression) would connect to
  the automation track and to type 16 Drift (certs expire, configs drift). Worth a nod, not a module.

## Suggested additions

1. **PQC & Crypto-Agility Migration (type 12 Migration)** — *highest value.* Take a service on
   classic ECDHE/RSA and migrate it to a **hybrid post-quantum key exchange** (X25519+ML-KEM)
   incrementally, proving interop is preserved at each step (strangler-fig). Deliverable: a crypto
   inventory + the migrated config + before/after handshake captures proving nothing broke. Anchors
   on the real "harvest-now-decrypt-later" threat and NIST's 2024 PQC standards — the most
   job-relevant crypto skill the track is currently missing, and it gives the track a forward-looking
   capstone-adjacent build.

2. **Choosing Your Crypto: an ADR (type 11 Decision/ADR)** — a short module that makes the
   algorithm/library/mode decisions *explicit and defended*: AEAD choice (GCM vs ChaCha20-Poly1305),
   signature scheme (Ed25519 vs ECDSA vs RSA), password KDF (Argon2id params), and secrets backend
   (Vault vs SOPS vs cloud KMS), each as an "options · tradeoffs · pick · why · what would change
   the pick" record citing the current standard. Introduces the ADR construct the capstone rubric
   already implicitly grades, and turns the scattered tradeoff prose in 02/03/04/07 into an owned
   artifact. Could alternatively be folded into module 07 or the capstone rather than added as a
   standalone.

3. *(Optional)* **Break It Yourself: a Padding-Oracle / Nonce-Reuse exploit (type 3 Blast-Radius
   Trace)** — promote the "demonstrate the break" beats in 02/04 into one hands-on offensive module
   where the learner runs a padding-oracle decryption (CBC) or nonce-reuse plaintext recovery
   (GCM) against a shipped vulnerable target and traces the blast radius to a forged auth token.
   Anchors on the POODLE/Vaudenay padding-oracle and the PS3 ECDSA nonce-reuse incidents. Only add
   if the track wants a dedicated attacker module; otherwise the existing labs cover the mechanism.
