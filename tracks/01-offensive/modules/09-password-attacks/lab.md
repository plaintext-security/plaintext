# Lab 09 — Crack Real Password Hashes

## Setup
Docker-first — hashcat with the rockyou wordlist:
```bash
docker run --rm -it dizcza/docker-hashcat
```
(`john` is in Kali. The **rockyou.txt** wordlist comes from the real 2009 RockYou breach —
the canonical cracking dictionary.)

## Scenario
Crack a set of password hashes the way an attacker does after dumping a database — using a
real wordlist from a real breach.

> Crack only hashes you generated or are authorised to test. Never attack credentials you
> don't own.

## Do
1. [ ] Generate (or obtain authorised) hashes of a few passwords in a couple of formats —
   e.g. MD5 and NTLM.
2. [ ] Identify each hash type. (How do you tell NTLM from MD5?)
3. [ ] Crack them with a dictionary attack using **rockyou.txt**.
4. [ ] Add a rules-based or mask attack to catch a password the plain dictionary missed, and
   note how long each took.

## Success criteria — you're done when
- [ ] You identified the hash types and cracked the weak ones with rockyou.
- [ ] You can explain why one hash type fell in seconds and another resisted.
- [ ] You can state the defenses (slow KDF, salt, length, MFA) that would have stopped you.

## Deliverables
`cracking.md`: the hash types, which cracked and how (mode + time), and the defenses you'd
recommend. (Don't commit real hashes or wordlists.)

## AI acceleration
Ask a model to identify a hash type and suggest a hashcat mode — then verify before you spend
GPU time. A wrong mode is hours wasted.

## Connects forward
Cracked/captured credentials feed lateral movement (module 12) and, in Track 06, Active
Directory attacks like Kerberoasting.

## Marketable proof
> "I crack real password hashes with hashcat — identifying hash types and choosing attack
> modes — and can argue the hashing/MFA defenses that defeat it."

## Stretch
- Crack a captured NTLMv2 hash, then explain why Kerberoasting (Track 06) hands you crackable
  hashes legitimately.
