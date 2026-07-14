---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Acquisition & Imaging

*Companion to [Module 02 — Acquisition & Imaging](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## dc3dd — raw disk imaging with inline hash

```bash
# Image a whole device, hashing as it goes, and log the run
sudo dc3dd if=/dev/sdb of=evidence.dd hash=sha256 log=acquire.log
sudo dc3dd if=/dev/sdb of=evidence.dd hash=sha256 hash=md5 log=acquire.log   # two algorithms
sudo dc3dd if=/dev/sdb of=evidence.dd hofs=image.000 ofsz=2G log=acquire.log  # split into 2G segments
sudo dc3dd if=/dev/sdb of=evidence.dd bs=512 conv=noerror,sync              # skip past read errors
```

- `dc3dd` prints the hash *as it reads the source* — that value proves the image matched the medium
  at capture time. Keep the log file; it is part of the evidence record.

## ewfacquire — E01 (Expert Witness Format)

```bash
sudo ewfacquire /dev/sdb                 # interactive: case number, examiner, notes, hash, compression
sudo ewfacquire -t evidence /dev/sdb     # -t sets the output basename (evidence.E01, .E02, …)
ewfverify evidence.E01                    # re-hash the E01 and compare to the stored hash
ewfinfo evidence.E01                      # read the embedded case metadata + acquisition hashes
```

- E01 is compressed, split, and carries case metadata + hashes *inside* the container. Raw (`dc3dd`)
  is bigger but every tool reads it — fine for the lab; E01 is the courtroom default.

## Verify — hash before and after

```bash
sha256sum /dev/sdb                       # hash the source (dead-box, write-blocked)
sha256sum evidence.dd                    # hash the image — must match
sha256sum evidence.dd > evidence.dd.sha256   # store the hash alongside the image
sha256sum -c evidence.dd.sha256          # re-verify later against the stored digest
```

## avml — Linux memory acquisition (capture FIRST)

```bash
sudo ./avml memory.lime                  # dump physical RAM to a LiME-format file
sudo ./avml --compress memory.lime.compressed
sha256sum memory.lime                     # hash the dump immediately after capture
```

- `avml` needs no target-specific config and works across most kernels — that is why it's the
  go-to for live Linux. Windows equivalents: **WinPmem**, **DumpIt**.

## Mount an image read-only for triage

```bash
sudo mount -o ro,loop,noexec,noload evidence.dd /mnt/case   # never mount evidence read-write
sudo losetup -rf evidence.dd            # -r = read-only loop device; -f = find a free one
```

## Case-note skeleton (write this for every image)

```
Acquisition time (UTC) : 2026-07-11T14:03:22Z
Operator / examiner    : <name>
Source device          : /dev/sdb  (make, model, serial)
Write blocker          : <hardware model / N/A + why>
Tool + version         : dc3dd 7.2.646
Output + segment layout: evidence.dd (single, 500 GB)
Hash (algo + value)    : sha256 = <digest>
Dead-box or live       : <choice + one-line justification>
```

## Gotchas worth remembering

- **Order of volatility.** On a live host, capture RAM *first* (`avml`), then image disk — memory
  evaporates the instant a process dies or the box reboots; the disk can wait.
- **The dead-box vs. live call is irreversible.** Pull power and you lose RAM, keys, live sockets,
  fileless malware forever; image live and your disk image is a system *in motion*, not a frozen
  moment. Decide deliberately for *this* case and record why.
- **`cp -r` is not acquisition.** A file-level copy grabs only what the OS shows you — it misses
  deleted files, slack, unallocated space, and volume metadata. Forensic imaging reads every sector.
- **Hash before and after, and keep the log.** An image with no verified hash isn't forensic
  evidence — it's a guess. The inline hash is what makes the copy provably identical to the original.
- **Write-block before you touch source media** in dead-box acquisition — a mount, an fsck, or even
  an OS auto-mount can update timestamps and invalidate the evidence.
