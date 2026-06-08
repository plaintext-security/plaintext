# Module 08 — Data & Encoding

**Foundations** — *security data is a mess of formats; reading them is a daily skill.*

## Why this matters
Indicators, payloads, tokens, and captured data show up base64'd, hex-encoded, URL-encoded,
or buried in JSON. Forensics and malware analysis live in hex; web attacks live in URL and
base64 encoding; everything emits JSON. Confusing *encoding* (reversible, not secret) with
*encryption* is a classic beginner mistake this module kills early.

## Objective
Recognise and convert between common encodings (hex, base64, URL), read JSON, and query it on
the command line.

## Learn (~2 hrs)

**Encodings & character sets**
- [Joel Spolsky — The Absolute Minimum Every Developer Must Know About Unicode & Character Sets](https://www.joelonsoftware.com/2003/10/08/the-absolute-minimum-every-software-developer-absolutely-positively-must-know-about-unicode-and-character-sets-no-excuses/) — the classic that makes encoding click: encoding ≠ encryption.
- [CyberChef](https://gchq.github.io/CyberChef/) — "the cyber swiss-army knife"; build a recipe to peel apart layered base64/hex/URL and *see* each transformation.

**Querying structured data**
- [jq manual](https://jqlang.github.io/jq/manual/) — slice and filter JSON from the command line; you'll use this constantly.

## Key concepts
- Encoding ≠ encryption (reversible, not secret)
- Hex and ASCII; reading a hex dump
- Base64 and base64url
- URL / percent encoding
- JSON structure and querying it with `jq`

## AI acceleration
Models decode and identify encodings instantly — paste a blob and ask "what is this?" Useful,
but verify by decoding it yourself in CyberChef; a model guessing the wrong layer sends you
down a wrong path.
