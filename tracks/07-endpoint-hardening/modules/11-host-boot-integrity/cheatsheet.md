# Cheat sheet — Host & Boot Integrity

*Companion to [Module 11 — Host & Boot Integrity](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## AIDE — file-integrity baseline

```bash
aide --init                                 # build the baseline db from aide.conf
aide --init --config=/lab/data/aide.conf    # explicit config (Debian default is /etc/aide/aide.conf)
mv /var/lib/aide/aide.db.new /var/lib/aide/aide.db   # promote new db → the trusted baseline
aide --check                                # re-fingerprint live host, diff vs baseline
aide --update                               # check AND write a fresh db.new in one pass
aide --version                              # confirm build + compiled-in defaults
```

- `aide --check` exit code is a **bitfield**, not 0/1 — non-zero means "differences found," which is
  the *expected* state after a real tamper. Key alarms on the report text, not the raw code.

## aide.conf — rule groups and selection

```conf
# attribute groups: what to compare per file
p+i+n+u+g+s+b+m+c+sha256    # perms, inode, links, owner, group, size, blocks, mtime, ctime, hash
NORMAL = p+i+n+u+g+s+b+m+c+sha256   # name a reusable group

# selection lines: path  <group>   (leading '=' = this dir only, not recursive)
/srv/app        NORMAL       # watch the app tree strictly
/etc/cron.d     NORMAL       # watch the DIRECTORY → an ADDED cron job is caught
!/var/log       # '!' = exclude (churns; would drown you in false positives)
!/proc
!/tmp
LOGONLY = p+u+g              # relax: metadata only, ignore content churn
/var/log        LOGONLY      # watch permission/owner, not the ever-changing bytes
```

## cryptsetup / LUKS — encryption at rest

```bash
cryptsetup luksFormat /dev/sdX          # initialise a LUKS volume (DESTROYS existing data)
cryptsetup luksDump /dev/sdX            # header + keyslot layout (no secrets shown)
cryptsetup luksOpen /dev/sdX secret     # unlock → /dev/mapper/secret
cryptsetup luksClose secret            # lock and remove the mapping
cryptsetup luksAddKey /dev/sdX         # add another passphrase to a free keyslot
cryptsetup luksRemoveKey /dev/sdX      # revoke a passphrase
cryptsetup status secret               # is it open? cipher, keysize, device
cryptsetup luksHeaderBackup /dev/sdX --header-backup-file luks-hdr.img   # SAVE THIS OFF-BOX
```

## TPM 2.0 — measured boot & sealing (tpm2-tools)

```bash
tpm2_pcrread                            # dump all PCR banks (sha1/sha256) — what booted
tpm2_pcrread sha256:0,7                 # just firmware (0) + Secure Boot state (7)
tpm2_getcap properties-fixed            # TPM manufacturer / spec version
# seal a secret to the current PCR state (measured boot = detection, not prevention):
tpm2_createprimary -c primary.ctx
tpm2_create -C primary.ctx -u seal.pub -r seal.priv -i secret.bin
tpm2_load -C primary.ctx -u seal.pub -r seal.priv -c seal.ctx
tpm2_unseal -c seal.ctx                 # only releases if PCRs match the sealed state
# LUKS key sealed to a TPM PCR state → volume auto-unlocks only if the boot chain is unchanged:
systemd-cryptenroll /dev/sdX --tpm2-device=auto --tpm2-pcrs=7
```

## Secure Boot — is the chain signature-verified?

```bash
mokutil --sb-state                      # "SecureBoot enabled" / "disabled"
mokutil --list-enrolled                 # keys the firmware trusts (incl. self-signed MOK)
bootctl status                          # systemd-boot: Secure Boot, TPM2, firmware info
# raw read of the firmware variable if mokutil is absent:
od -An -t u1 /sys/firmware/efi/efivars/SecureBoot-*   # last byte 1 = enabled
```

## Gotchas worth remembering

- **The AIDE database is the real target, not the files.** An attacker who roots the box can tamper a
  binary, re-run `aide --init`, and the next check reports clean. The db (ideally the binary and config
  too) must live where a compromised host **can't write it** — read-only media, or a separate host that
  pulls and verifies. Keep an off-box hash of the db and check it *before* trusting a "clean" result.
- **Re-baseline after every *approved* change.** A package update legitimately rewrites watched files;
  if you don't `--init` over it, the next check drowns in noise. The discipline is knowing *which*
  changes are approved before you re-baseline — never re-init blindly to "make the alarm stop."
- **`luksHeaderBackup` or the data is gone.** LUKS keys live in the header keyslots; a corrupted or
  overwritten header means every passphrase is useless and the volume is unrecoverable. Back the header
  up off-disk the day you format.
- **TPM PCR-sealed keys break on legitimate updates.** A firmware or kernel update changes the PCR
  values the key was sealed against, so the TPM refuses to release it. Always enrol a **recovery
  passphrase** alongside the TPM binding, or a routine patch locks you out of your own disk.
- **Measured boot detects; it does not prevent.** TPM PCRs record *what* booted into a tamper-evident
  log you attest later — nothing is blocked inline. **Secure Boot** is the prevention layer (refuses
  unsigned/tampered components); to boot a self-built kernel you enrol a self-signed MOK rather than
  disabling Secure Boot outright.
- **File integrity is blind before the OS mounts.** AIDE can't see firmware, bootloader, kernel, or
  initramfs — that window belongs to Secure Boot (prevent), measured boot/TPM (detect), and FDE
  (protect at rest). Every one of them has the same weak point: the *reference* it compares against.
