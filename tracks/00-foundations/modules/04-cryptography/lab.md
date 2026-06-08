# Lab 04 — Hashing, Encryption, and Certificates with openssl

## Setup
Docker-first:
```bash
docker run --rm -it alpine sh
apk add openssl
```

## Scenario
Exercise each primitive once so the guarantees become concrete rather than abstract.

## Steps
1. Hash for integrity:
   ```bash
   echo "transfer 100 to alice" > msg.txt
   openssl dgst -sha256 msg.txt
   ```
2. Symmetric encryption (AES) — round-trip it:
   ```bash
   openssl enc -aes-256-cbc -pbkdf2 -in msg.txt -out msg.enc
   openssl enc -d -aes-256-cbc -pbkdf2 -in msg.enc
   ```
3. Asymmetric keys (RSA):
   ```bash
   openssl genrsa -out priv.pem 2048
   openssl rsa -in priv.pem -pubout -out pub.pem
   openssl pkeyutl -encrypt -pubin -inkey pub.pem -in msg.txt -out msg.rsa
   openssl pkeyutl -decrypt -inkey priv.pem -in msg.rsa
   ```
4. Inspect a real certificate chain (needs outbound network):
   ```bash
   echo | openssl s_client -connect example.com:443 -servername example.com 2>/dev/null \
     | openssl x509 -noout -issuer -subject -dates
   ```

## Expected output
A SHA-256 digest; ciphertext that decrypts back to the plaintext; an RSA blob that only
the private key recovers; and the issuer, subject, and validity dates of example.com's
certificate.

## AI acceleration
Ask a model why CBC *without* authentication is unsafe and what AEAD (e.g. AES-GCM) fixes
— then confirm against the OpenSSL docs, and note anywhere it gets the flags wrong.

## Questions
1. Flip one byte of `msg.enc` and decrypt it — what happens, and what does that reveal
   about the difference between secrecy and integrity?
2. Who signed example.com's certificate, and how does your browser decide to trust that
   signer?
