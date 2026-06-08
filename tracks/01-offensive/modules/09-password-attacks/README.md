# Module 09 — Password & Credential Attacks

**Offensive Security** — *credentials are the keys; cracking and capturing them is how access spreads.*

## Why this matters
Most breaches don't "hack in" — they log in. Once you have a foothold, dumped password
hashes, reused credentials, and weak passwords turn access into more access. Understanding
how hashes are cracked — and how fast — is also the only way to argue convincingly for the
defenses (strong hashing, length, MFA) that stop it.

## Objective
Crack real password hashes, understand hash types and attack modes, and explain credential
attacks like spraying and reuse — plus the defenses that defeat them.

## Learn (~4 hrs)

**Cracking**
- [Hashcat — official wiki](https://hashcat.net/wiki/) — hash modes, attack modes, and rules; the authoritative reference.
- [Hashcat Tutorial: A Beginner's Guide (video)](https://www.youtube.com/watch?v=4bchWTf7un8) — a hands-on first pass before the wiki.

**Where it sits, and the defense**
- [MITRE ATT&CK — Brute Force (T1110)](https://attack.mitre.org/techniques/T1110/) and [OS Credential Dumping (T1003)](https://attack.mitre.org/techniques/T1003/) — the techniques you're performing.
- [OWASP — Password Storage Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Password_Storage_Cheat_Sheet.html) — the defender's side: why bcrypt/argon2 + salting beats you.

## Key concepts
- Hashing vs encryption (callback to Foundations crypto)
- Hash types (MD5, NTLM, bcrypt) and why some crack in seconds
- Attack modes: dictionary, rules, mask, brute force
- Credential spraying and reuse (the real-world entry vector)
- Defenses: strong KDFs, salting, length, MFA

## AI acceleration
A model suggests hashcat modes and rules and identifies a hash type instantly — handy. But it
also misidentifies hashes or suggests attacks that waste GPU-hours. Confirm the hash type and
mode yourself; cracking is expensive to get wrong.
