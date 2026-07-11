# Cheat sheet — Cryptography with openssl

*Companion to [Module 09 — Cryptography Basics](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Hashing (one-way — integrity, not secrecy)

```bash
openssl dgst -sha256 file.txt              # hash a file
echo -n "string" | openssl dgst -sha256    # hash a string (-n: don't hash the trailing newline)
openssl dgst -md5 file.txt                 # MD5 — broken; only for matching legacy hashes
```

The algorithm is always a flag named after itself: `-sha256`, `-sha1`, `-md5`, `-sha512`. Output
matches the system `sha256sum` / `shasum -a 256` tools.

## Base64 (encoding, not encryption — no key, anyone reverses it)

```bash
echo -n "hello" | openssl base64           # encode
echo "aGVsbG8=" | openssl base64 -d        # decode
```

## Symmetric encryption (AES — one shared password)

```bash
echo -n "secret" | openssl enc -aes-256-cbc -pbkdf2 -base64        # encrypt (prompts for password)
echo "U2FsdGVkX1..." | openssl enc -aes-256-cbc -pbkdf2 -base64 -d # decrypt
openssl enc -list                                                   # list available ciphers
```

- Always pass `-pbkdf2` with a password — without it you get weak legacy key derivation (and a warning).
- **Same input + same password ≠ same output.** Password mode adds a random salt per run and derives
  a fresh key from it — output starting `U2FsdGVkX1` is Base64 for `Salted__`. That's a *feature*:
  deterministic ciphertext leaks which messages are equal. Only demos should use a fixed raw key
  (`-K <hex> -nosalt`), which is also how you show why ECB mode is broken.
- `openssl enc` refuses AEAD modes (GCM) — for authenticated encryption use a library (e.g. Python
  `cryptography`'s `AESGCM`).

## Asymmetric encryption (RSA keypair)

```bash
openssl genpkey -algorithm RSA -pkeyopt rsa_keygen_bits:2048 -out private.pem  # private key
openssl pkey -in private.pem -pubout -out public.pem                           # derive public key

echo -n "secret" | openssl pkeyutl -encrypt -pubin -inkey public.pem -out ct.bin  # public encrypts
openssl pkeyutl -decrypt -inkey private.pem -in ct.bin                            # private decrypts
```

- `pkeyutl` replaces the deprecated `rsautl`; `genpkey`/`pkey` replace `genrsa`/`rsa`.
- RSA only fits tiny payloads (~200 bytes at 2048-bit). Real systems are hybrid: RSA/ECDH exchanges a
  symmetric key, AES encrypts the data.

## TLS certificates

```bash
# quick facts: who issued it, for whom, valid when
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -subject -issuer -dates

# full dump (SANs, key size, signature algorithm, chain)
openssl s_client -connect example.com:443 -servername example.com </dev/null 2>/dev/null \
  | openssl x509 -noout -text

openssl x509 -in cert.pem -noout -text     # inspect a local cert file
```

`-servername` sets SNI so multi-domain hosts return the right cert; `</dev/null` closes the session
instead of hanging interactively.

## Random values (keys, salts, tokens)

```bash
openssl rand -hex 16      # 128 bits as hex — e.g. a raw AES key or salt
openssl rand -base64 32   # 256 bits, printable
```

## Gotchas worth remembering

- **Encoding ≠ encryption ≠ hashing.** Encoding is reversible with no secret (Base64). Encryption is
  reversible **with a key** (AES, RSA). Hashing is **one-way** (SHA-256). Keep them straight.
- Never store passwords with encryption — **hash and salt** them (a per-user salt). Reversible
  encryption of a password is the Adobe mistake this module reproduces.
- `.pem` / `.key` files are secrets — they're gitignored in the labs on purpose. Generate them in
  the lab dir or scratch space; never commit them.
