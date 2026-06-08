# Lab 09 — Hashing, Encryption, and Certificates with openssl

## Setup
Docker-first:
```bash
docker run --rm -it alpine sh
apk add openssl
```

## Scenario
Exercise each primitive once so its guarantee becomes concrete rather than abstract.

## Do
Look the exact invocations up in the OpenSSL Cookbook — choosing the right subcommand and
flags is the lesson.

1. [ ] Produce a SHA-256 digest of a short message, and say why a hash proves integrity but
   not secrecy.
2. [ ] Encrypt that message with AES and decrypt it back — a full round-trip. (Use a
   key-derivation flag so a passphrase works.)
3. [ ] Generate an RSA keypair, encrypt with the public key, and decrypt with the private
   key.
4. [ ] Pull a real website's certificate and read its issuer, subject, and validity dates.
5. [ ] Flip a single byte of the AES ciphertext and try to decrypt — observe what happens.

## Success criteria — you're done when
- [ ] You produce a SHA-256 digest and can say why it proves integrity, not secrecy.
- [ ] You round-trip a message through both AES and RSA.
- [ ] You can read a certificate's issuer, subject, and validity, and name who vouches for it.

## Deliverables
`crypto-notes.md`: one line per primitive — what it guaranteed — plus what happened when
you flipped a byte of the AES ciphertext.

## AI acceleration
Ask a model why CBC without authentication is unsafe and what AES-GCM fixes — then confirm
against the OpenSSL Cookbook, noting anywhere it gets the flags wrong.

## Connects forward
This underpins Track 05 (TLS and secrets in the cloud), Track 08 (PKI and secrets in
depth), and any HTTPS you inspect in Track 01.

## Marketable proof
> "I can exercise and audit the core crypto primitives with openssl — hashing, AES, RSA,
> and a live certificate chain — and explain what each does and doesn't guarantee."

## Stretch
- Redo the symmetric step with `-aes-256-gcm` (AEAD) and explain what the authentication
  tag changes.
