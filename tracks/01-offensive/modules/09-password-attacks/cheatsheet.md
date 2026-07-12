# Cheat sheet — Password & Credential Attacks

*Companion to [Module 09 — Password & Credential Attacks](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only crack hashes you obtained from systems you own or have explicit written permission to test.

## Identify the hash first

```bash
hashid '$2b$12$...'              # guess the hash type
# or feed a file: hashid -m hashes.txt   (-m prints the hashcat mode)
hashcat --example-hashes | less  # canonical example for every mode (confirm the format)
```

Common hashcat modes: `0` MD5 · `100` SHA1 · `1000` NTLM · `1800` sha512crypt (`$6$`) · `3200` bcrypt (`$2*$`) · `5600` NetNTLMv2 · `13100` Kerberoast (TGS).

## Hashcat — attack modes (progressively smarter guessing)

```bash
# -a 0 dictionary (straight wordlist)
hashcat -m 1000 -a 0 hashes.txt rockyou.txt

# -a 0 + rules (mutate words: Password -> P@ssw0rd!)
hashcat -m 1000 -a 0 hashes.txt rockyou.txt -r rules/best64.rule

# -a 3 mask / brute force (known structure) — ?l lower ?u upper ?d digit ?s special ?a all
hashcat -m 0 -a 3 hashes.txt '?u?l?l?l?l?d?d?d'

# -a 6 hybrid: wordlist + mask appended
hashcat -m 0 -a 6 hashes.txt rockyou.txt '?d?d?d'
```

## Hashcat — running and managing

```bash
hashcat -m 1000 -a 0 hashes.txt rockyou.txt --force        # ignore benign warnings
hashcat -m 1000 hashes.txt rockyou.txt -O -w 3             # -O optimized kernel, -w tune workload
hashcat -m 1000 hashes.txt --show                          # print already-cracked pairs
hashcat --restore                                           # resume an interrupted session
hashcat -b                                                  # benchmark your GPU
# status keys while running: s = status, p = pause, q = quit
```

## John the Ripper — quick and format-flexible

```bash
john --list=formats | less                    # supported hash formats
john --format=nt hashes.txt --wordlist=rockyou.txt --rules
john hashes.txt                               # auto-detect + default modes
john --show hashes.txt                        # display cracked passwords
# turn app files into crackable hashes with the *2john helpers:
zip2john secret.zip > zip.hash
ssh2john id_rsa > key.hash
```

## Capturing credentials (not just cracking)

```bash
# spraying: ONE password across MANY users (avoids lockout that per-user brute force triggers)
# e.g. with crackmapexec — one attempt per account, then move on:
crackmapexec smb 10.0.0.0/24 -u users.txt -p 'Winter2026!' --continue-on-success
```

## Gotchas worth remembering

- **Security is cost-per-guess.** MD5/NTLM fall at billions/sec on a GPU — a dumped database is effectively plaintext within hours. bcrypt/argon2 are *designed* to make each guess thousands of times costlier, so the same dump is infeasible. The hash type, not the wordlist, decides whether you win.
- **Reuse beats cracking.** The dominant real-world vector isn't GPU horsepower — it's credentials from one breach sprayed everywhere else. Check breach data and try spraying before you burn hours on a slow hash.
- **Spray, don't brute-force, against live services.** Many passwords against one account locks it and alerts the SOC; one password across many accounts stays under lockout thresholds. Watch the policy.
- **Confirm the hash type before you spend GPU-hours.** `hashid` guesses and is often wrong (e.g. `$2a$` bcrypt vs a truncated SHA); the wrong `-m` cracks nothing while looking busy. Verify against `--example-hashes`.
- **Rules are the highest-leverage knob.** `best64.rule` over a good wordlist finds far more than a longer wordlist alone — most real passwords are a dictionary word plus a predictable mutation.
