# Cheat sheet — Data Protection & KMS

*Companion to [Module 17 — Data Protection & KMS](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Keys — create and inspect

```bash
aws kms create-key --description "app data key"          # returns a KeyId (a CMK)
aws kms create-alias --alias-name alias/app-data \
  --target-key-id <key-id>                                # human-friendly handle
aws kms describe-key --key-id alias/app-data              # metadata, key state, origin
aws kms list-keys                                         # key IDs in the account
aws kms get-key-policy --key-id alias/app-data \
  --policy-name default                                   # the resource policy — READ THIS
```

## Envelope encryption (the real workflow)

```bash
# 1. Ask KMS for a DATA key — get plaintext + KMS-wrapped copy in one call
aws kms generate-data-key --key-id alias/app-data --key-spec AES_256

#   Response: Plaintext (base64, use locally then DISCARD) + CiphertextBlob (store this)

# 2. Encrypt your file locally with the plaintext data key (openssl/libsodium/etc.)
#    then zero the plaintext key from memory. Store CiphertextBlob next to the ciphertext.

# 3. To read later: send the wrapped key back, KMS unwraps it, decrypt locally
aws kms decrypt --ciphertext-blob fileb://wrapped-data-key.bin \
  --key-id alias/app-data --query Plaintext --output text | base64 -d

# Data-key-without-plaintext: for store-only paths that never decrypt in place
aws kms generate-data-key-without-plaintext --key-id alias/app-data --key-spec AES_256
```

Direct `kms encrypt`/`decrypt` is for **small blobs only** (<4 KB) — tokens, another key.
For files, always envelope: KMS wraps the data key, the data key wraps the file.

```bash
aws kms encrypt --key-id alias/app-data --plaintext fileb://secret.txt \
  --query CiphertextBlob --output text | base64 -d > secret.enc     # small blobs only
aws kms decrypt --ciphertext-blob fileb://secret.enc \
  --query Plaintext --output text | base64 -d
```

## Key policy — the second door

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "KeyAdmins-manage-not-use",
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::111122223333:role/KeyAdmin" },
      "Action": ["kms:Create*","kms:Describe*","kms:Put*","kms:ScheduleKeyDeletion"],
      "Resource": "*"
    },
    {
      "Sid": "App-uses-not-manages",
      "Effect": "Allow",
      "Principal": { "AWS": "arn:aws:iam::111122223333:role/AppRole" },
      "Action": ["kms:Decrypt","kms:GenerateDataKey"],
      "Resource": "*"
    }
  ]
}
```

Separation of duties: **admins manage but can't decrypt; the app decrypts but can't destroy.**
`"Resource": "*"` here means "this key" — a key policy only ever governs its own key.

```bash
aws kms put-key-policy --key-id alias/app-data \
  --policy-name default --policy file://key-policy.json
```

## Grants — temporary, scoped delegation

```bash
# Grant a principal narrow, revocable use without editing the key policy
aws kms create-grant --key-id alias/app-data \
  --grantee-principal arn:aws:iam::111122223333:role/BatchJob \
  --operations Decrypt GenerateDataKey

aws kms list-grants --key-id alias/app-data
aws kms revoke-grant --key-id alias/app-data --grant-id <grant-id>   # the off-switch
```

## Who can actually use the key (verify the blast radius)

```bash
# Simulate the effective decision (both doors: IAM + key policy)
aws iam simulate-principal-policy \
  --policy-source-arn arn:aws:iam::111122223333:role/AppRole \
  --action-names kms:Decrypt --resource-arns <key-arn>
```

## Gotchas worth remembering

- **A KMS key has two doors: the principal's IAM policy AND the key policy.** For most
  services IAM is the whole story — KMS is the exception. By default the **key policy is the
  root of authority**, and an IAM grant only takes effect if the key policy delegates to IAM.
  A perfect least-privilege IAM policy still leaks the key if a permissive key policy left the
  second door open. Audit *both*, for every key.
- **"Encrypted at rest" is silent against anyone you let use the key.** Capital One's 100M
  records were encrypted and read in plaintext — the storage layer decrypted transparently for
  an authorized-but-over-broad role. The control is `kms:Decrypt`, not the cipher.
- **Never store the plaintext data key.** Use it locally to encrypt, then zero it. Persist
  only the `CiphertextBlob` (the KMS-wrapped copy). Storing the plaintext key defeats envelope
  encryption entirely.
- **Revoking decrypt is a stronger off-switch than deleting files.** Every object *and every
  backup* is unreadable without `kms:Decrypt` on that one key — but `ScheduleKeyDeletion` has a
  7–30 day waiting period and is irreversible once it fires; a lost key = lost data. Prefer
  disabling or revoking grants over deletion.
- **`kms:GenerateDataKey` + `kms:Decrypt` together = full read/write.** Handing an app both is
  correct for envelope encryption, but it means that role *is* your data's blast radius. Don't
  also give it `kms:PutKeyPolicy` or `kms:CreateGrant` — that lets it re-open the door itself.
- **Grants beat policy edits for temporary access** — scoped, revocable, and they don't
  require touching (and risking) the key policy. But grants can be forgotten; list and prune them.

> Only manage keys and policies in accounts you own or are authorized to administer.
