---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Data & Encoding

*Companion to [Module 08 — Data & Encoding](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Base64

```bash
echo -n "hello" | base64                 # encode  → aGVsbG8=   (-n: no trailing newline)
echo "aGVsbG8=" | base64 -d              # decode
base64 -w0 file                          # encode a file, no line wrapping (GNU coreutils)
```

- Base64 is **encoding, not encryption** — no key, anyone can reverse it. It exists to move binary
  safely through text channels, not to hide anything.
- `=` / `==` padding at the end and an alphabet of `A–Z a–z 0–9 + /` are the visual tell. URL-safe
  Base64 swaps `+/` for `-_`.
- Malware loves it: PowerShell `-EncodedCommand` takes Base64 of **UTF-16LE** (see below).

## Hex

```bash
echo -n "hello" | xxd                    # hex + ASCII side by side
echo -n "hello" | xxd -p                 # plain hex, no formatting  → 68656c6c6f
echo "68656c6c6f" | xxd -r -p            # reverse: hex back to bytes
od -An -tx1 file                         # another hex dumper (BSD/macOS friendly)
```

## URL and other web encodings

```bash
# URL-encode / decode with the tool you already have:
python3 -c "import urllib.parse,sys; print(urllib.parse.quote(sys.argv[1]))" "a b&c"
python3 -c "import urllib.parse,sys; print(urllib.parse.unquote(sys.argv[1]))" "a%20b%26c"

# HTML entities: &lt; &gt; &amp; &#39;   — how < > & ' survive inside markup
```

## Character encodings — iconv

```bash
iconv -f UTF-16LE -t UTF-8 in.txt        # convert UTF-16LE → UTF-8
iconv -l                                 # list every encoding iconv knows
file suspicious.txt                      # guess the encoding/type from content
```

- **UTF-16LE** stores each ASCII char as `<byte> 00` — so text looks like `h.e.l.l.o.` in a hex
  dump (a `00` after every letter). That interleaved-null pattern is the fingerprint of a decoded
  PowerShell `-EncodedCommand` payload.

## Identifying a blob: magic bytes

```bash
file mystery.bin           # the fast answer — reads magic bytes for you
xxd mystery.bin | head     # look at the first bytes yourself
```

| First bytes (hex) | ASCII | Type |
|-------------------|-------|------|
| `25 50 44 46`     | `%PDF` | PDF |
| `50 4B 03 04`     | `PK`   | ZIP / DOCX / XLSX / JAR |
| `7F 45 4C 46`     | `.ELF` | Linux executable |
| `4D 5A`           | `MZ`   | Windows PE (.exe/.dll) |
| `89 50 4E 47`     | `.PNG` | PNG image |
| `1F 8B`           |        | gzip |

- An "image" whose first bytes are `MZ` is not an image. Magic bytes beat the file extension every
  time — extensions lie, the first bytes usually don't.

## The decode-chain move (CTFs and real IR both)

```bash
echo "Njg2NTZjNmM2Zg==" | base64 -d | xxd -r -p       # base64 → hex → text
```

Attacker payloads nest encodings (base64 of gzip of base64…) to dodge naïve detection. Peel one
layer at a time, running `file`/`xxd` between steps to see what you've got before guessing the next.

## Gotchas worth remembering

- **Encoding ≠ encryption ≠ hashing.** Encoding is reversible with no secret (Base64, hex). Encryption
  is reversible **with a key** (AES, RSA). Hashing is **one-way** (SHA-256). Calling Base64
  "encrypted" is the misconception this whole track exists to kill.
- `echo` without `-n` appends a newline that changes your Base64/hash output — the single most
  common "why doesn't this match" bug.
