---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — File Systems & Carving

*Companion to [Module 03 — File Systems & Carving](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The SleuthKit layer model (pick the tool by the layer you need)

```
Volume     → mmls    (partition table / offsets)
Filesystem → fsstat  (FS type, block size, layout)
Metadata   → istat   (one inode / MFT entry — timestamps, data runs)
Filename   → fls     (directory entries, including deleted)
Data       → icat    (raw bytes at an inode)
```

## mmls — find the partitions and their offsets

```bash
mmls evidence.dd                         # list partitions; note the Start sector of the one you want
mmls -B evidence.dd                      # also show sizes in bytes
```

- The **Start** column is the offset (in sectors) you feed to every later tool as `-o`.

## fsstat — filesystem layout

```bash
fsstat -o 2048 evidence.dd               # -o = partition offset from mmls (in sectors)
fsstat evidence.dd                        # a whole-disk image with no partition table
```

- Reports FS type, block/cluster size, inode range, and (NTFS) `$MFT` location. Read it before `fls`.

## fls — list files, including deleted ones

```bash
fls -o 2048 evidence.dd                   # root directory
fls -o 2048 -r evidence.dd                # -r recurse the whole tree
fls -o 2048 -d evidence.dd                # -d ONLY deleted entries
fls -o 2048 -r -d evidence.dd             # recurse, deleted only — the workhorse
fls -o 2048 -r -m / evidence.dd > body    # -m = bodyfile output for a timeline (mactime)
```

- Deleted entries are flagged with `*`; the leading number (e.g. `r/r * 34-128-4:`) is the **inode/MFT**
  address you hand to `icat`/`istat`.

## icat — extract content by inode

```bash
icat -o 2048 evidence.dd 34 > recovered.jpg    # dump bytes at inode 34
icat -o 2048 -r evidence.dd 34 > recovered.jpg # -r attempt recovery of a deleted file
```

- `icat` knows nothing about filenames — it extracts bytes at a metadata address. Pair it with the
  inode number `fls` gave you.

## istat — one metadata entry in detail

```bash
istat -o 2048 evidence.dd 34             # all timestamps + data-run block list for inode 34
```

- On NTFS this dumps *both* `$STANDARD_INFORMATION` and `$FILE_NAME` timestamps — the pair you
  compare for timestomping (Module 11).

## mactime — turn a bodyfile into a timeline

```bash
mactime -b body -d > timeline.csv        # -b bodyfile, -d comma-delimited
```

## foremost / scalpel — carve by magic signature

```bash
foremost -i evidence.dd -o carved/       # carve all configured types into carved/
foremost -t jpg,png,pdf -i evidence.dd -o carved/   # only these types
foremost -c custom.conf -i evidence.dd -o carved/   # header/footer config for a new type

scalpel -c scalpel.conf -o carved/ evidence.dd      # scalpel: config-driven, faster on big images
```

- Carvers scan raw bytes for headers/footers (JPEG `\xff\xd8\xff`, PNG `\x89PNG`, ZIP `PK\x03\x04`)
  — they recover **content with no filename, path, or timestamp**. Check `foremost`'s `audit.txt`.

## Gotchas worth remembering

- **Carving recovers content, not context.** A carved JPEG has no filename, no path, no deletion
  time — the metadata that proves *when* and *by whom* is gone. Use inode recovery (`fls`/`icat`)
  when metadata survives; carve only when it doesn't. Know which your finding rests on.
- **Most SleuthKit confusion is a layer mismatch.** Don't ask `fls` for inode timestamps or expect
  `icat` to know a filename. Match the tool to the layer: `mmls`→`fsstat`→`istat`→`fls`→`icat`.
- **Get the `-o` offset right or you get garbage.** `fls`/`icat`/`fsstat` on the wrong partition
  offset "work" but read nonsense. Pull the Start sector from `mmls` first, every time.
- **The recovery window closes on overwrite.** Deletion only removes the pointer; the clusters
  survive until the allocator reuses them. On SSDs, TRIM can zero them almost immediately.
- **NTFS is the artifact-rich filesystem.** The MFT carries every file (current + recently deleted)
  with `$DATA`, `$SI`, and `$FN` streams; `$LogFile` and `$UsnJrnl` record operations in order.
