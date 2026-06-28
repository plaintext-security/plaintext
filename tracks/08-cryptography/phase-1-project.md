# Phase 1 Project — Crypto Primitives Toolkit

*Cryptography, PKI & Secrets · Phase 1 (modules 01–04) · ~4–6 hrs · Prereqs: finish modules 01, 02, 03, 04 first.*

> You exercised each primitive on its own. The project is the **integration**: one small, tested toolkit that uses each correctly — AEAD, a key exchange, an HMAC, password hashing — with a written note on the misuse each one invites.

## Why this is a project, not another module

Each Phase-1 module left one primitive and its failure mode. Alone they're four scripts; integrated they're a toolkit that *demonstrates correct use and detects the misuse* of every primitive in the set:

- **01 · Primitives** → `primitives-analysis.md` + `encrypt-aead.py` (AES-256-GCM with a randomly generated IV, tag included; the CBC-vs-GCM analysis).
- **02 · Symmetric & AEAD** → `aead-demo.py` + `check-iv-reuse.py` (the IV-reuse attack *and* its fix; a duplicate-IV detector).
- **03 · Asymmetric & key exchange** → `key-exchange-analysis.md` + `keygen-benchmark.py` (RSA-2048 vs EC P-256 timings; the forward-secrecy explanation).
- **04 · Hashing, MACs & passwords** → `password-analysis.md` + `check-password-hash.py` (the Argon2id migration argument; a detector that flags bare MD5/SHA hashes as vulnerable).

## Build it

1. **One entrypoint, four primitives.** Wrap the per-module scripts behind a single `cryptokit` CLI — `cryptokit encrypt` (GCM, from 01), `cryptokit keygen` (RSA/EC, from 03), an HMAC verify, and `cryptokit hash` (Argon2id, from 04) — so the toolkit *uses* each primitive correctly, not just describes it.
2. **Make the misuse detectable.** Fold the two detectors (`check-iv-reuse.py` from 02, `check-password-hash.py` from 04) into a `cryptokit audit` subcommand that flags reused IVs and fast-hash password storage — the toolkit catches the very mistakes the analysis notes warn about.
3. **Test it.** Add a small test suite: GCM round-trips and rejects a tampered tag, the IV detector flags a duplicate, the password checker passes `$argon2id$` and fails a bare hex digest. *Tested* is the bar — a crypto toolkit you can't trust is worse than none.
4. **One misuse note.** Produce `misuse.md`: for each primitive, the one-line correct use and the misuse it invites (ECB, nonce/IV reuse, fast hashes for passwords, RSA without padding), each backed by a test in the suite.

## Success criteria

- [ ] **One** CLI exercises all four primitives correctly (AEAD, key exchange, HMAC, Argon2id).
- [ ] The toolkit **detects** at least IV reuse and fast-hash password storage.
- [ ] A test suite proves correct use *and* catches the misuse — GCM tamper-reject, duplicate IV, bare-hash flag.
- [ ] `misuse.md` names the misuse each primitive invites, each tied to a test.

## Deliverable

A `cryptokit/` folder in your repo: the **unified CLI**, the **test suite**, the **`misuse.md`**, and your committed module notes. Reference test fixtures — **do not** commit real keys, generated keypairs, IVs, or any captured secrets (see `.gitignore`).

## Self-check rubric

Grade your own `cryptokit/`. **Proficient is the bar; exemplary is the portfolio piece.**

| Dimension | Developing | Proficient | Exemplary |
|---|---|---|---|
| **Primitive coverage** | One or two primitives, separate scripts | One CLI exercises AEAD, key exchange, HMAC, and Argon2id correctly | A new primitive slots in without rewriting the CLI |
| **Misuse detection** | Misuse described only | IV reuse and fast-hash storage flagged by the tool | Detectors cite the standard each violates (NIST/OWASP) |
| **Tests** | None, or happy-path only | Tests prove correct use *and* catch tamper/duplicate/bare-hash | Negative cases exhaustive; failures are legible, not cryptic |
| **Hygiene & rigour** | Keys/IVs committed; claims unbacked | No keys/secrets in history; every claim has a test behind it | Commits tell the build story; fixtures generated, never real secrets |

→ Next: **[Module 05 — TLS Deep Dive](modules/05-tls-deep-dive/README.md)** opens Phase 2, which ends in its own **[phase project](phase-2-project.md)** before the **[track capstone](README.md#capstone)**.
