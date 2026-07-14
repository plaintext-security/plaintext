---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Secrets management with Vault, SOPS & age

*Companion to [Module 07 — Secrets Management](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Vault — connect to a dev server

```bash
vault server -dev                          # ephemeral dev server; prints root token + unseal key
export VAULT_ADDR='http://127.0.0.1:8200'  # point the CLI at it
export VAULT_TOKEN='<root-or-scoped-token>'
vault status                               # sealed? initialised? which HA node?
```

## Vault — KV secrets (store, read, rotate, version)

```bash
vault kv put secret/corp/payroll/db user=svc password='s3cr3t'   # write (creates a new version)
vault kv get secret/corp/payroll/db                              # read (table form)
vault kv get -format=json secret/corp/payroll/db                 # read as JSON — the app-consumable form
vault kv get -field=password secret/corp/payroll/db              # pull one field, scriptable
vault kv put secret/corp/payroll/db password='rotated!'          # rotate = write a new version
vault kv metadata get secret/corp/payroll/db                     # how many versions retained
vault kv get -version=1 secret/corp/payroll/db                   # fetch a prior version
```

## Vault — policies, tokens, audit

```bash
vault policy write payroll-ro payroll-ro.hcl   # apply a least-privilege HCL policy
vault token create -policy=payroll-ro          # mint a token scoped to that policy
vault audit enable file file_path=/vault/logs/audit.log   # turn on the audit device
# HCL: read-only on one path
# path "secret/data/corp/payroll/db" { capabilities = ["read"] }
```

Test the policy live: with the scoped token, `vault kv get` must succeed and `vault kv put` must be
denied. The audit log records *who/what/when* but hashes secret values — it is not a copy of the secret.

## Vault — dynamic secrets (short-lived credentials)

```bash
vault secrets enable database              # enable the database engine
vault read database/creds/payroll-role     # get an ephemeral user + lease_id + TTL
vault lease revoke <lease_id>              # revoke the credential immediately
```

## age — generate keys and encrypt

```bash
age-keygen -o key.txt                      # keypair; prints the public key (age1...)
age-keygen -y key.txt                      # re-derive the public key from a private key file
age -r age1qz... -o secret.age secret.txt  # encrypt to a recipient public key
age -d -i key.txt secret.age               # decrypt with the private identity file
age -p secret.txt > secret.age             # passphrase mode (no keypair)
```

## SOPS — encrypt values, keep keys readable (git-safe)

```bash
export SOPS_AGE_KEY_FILE=key.txt           # tell sops which age identity to use
export SOPS_AGE_RECIPIENTS=age1qz...       # public key(s) to encrypt to
sops -e -i config.yaml                     # encrypt in place — values become ciphertext, keys stay readable
sops -d config.yaml                        # decrypt to stdout
sops config.yaml                           # open $EDITOR; re-encrypts on save
sops updatekeys config.yaml                # re-key after editing .sops.yaml recipients
sops -d --extract '["db"]["password"]' config.yaml   # pull one value without decrypting the whole file
```

A `.sops.yaml` in the repo root pins `age` recipients per path rule, so `sops -e` needs no flags per file.

## Gotchas worth remembering

- **A static key in a vault is still a static key.** Storing it better doesn't shrink its value — steal
  it once, own it indefinitely. Dynamic, short-lived, scoped credentials are the real win; reach for
  Vault's `database/creds/*` over a stored long-lived password wherever the app allows.
- **"We deployed Vault, secrets are solved" is the trap.** The surviving leak vector is *sprawl* — copies
  in CI variables, shells, backups, old config. Rotation, access auditing, and detection (module 08) are the ongoing work.
- **SOPS encrypts values, not keys — on purpose.** A reviewer sees *what* is configured; a stolen clone
  yields no live credential. Never commit a plaintext YAML "just this once" alongside the encrypted one.
- **age private keys and Vault root tokens are the crown jewels.** They're gitignored in the labs for a
  reason — lose the age identity and the SOPS files are unrecoverable; leak the root token and every path is open.
- **Vault dev mode has no persistence.** Restart the server and every secret is gone. It's for learning
  and CI, never for anything you need to keep — production Vault must be initialised, sealed, and unsealed.
- **Policy bugs are silent.** An over-broad path or an extra capability grants access nobody intended.
  After `vault policy write`, always prove the scoped token can read but genuinely cannot write or delete.
