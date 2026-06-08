# Lab 08 — Decode the Layers

## Setup
Docker-first for the CLI tools, plus [CyberChef](https://gchq.github.io/CyberChef/) in the
browser:
```bash
docker run --rm -it alpine sh
apk add coreutils jq xxd
```

## Scenario
Peel apart a multiply-encoded blob and query a JSON document — the everyday reality of
handling indicators and captured data.

## Do
1. [ ] Take a short message and encode it through two layers (e.g. base64, then hex), then
   decode it back — by hand on the CLI and again in CyberChef.
2. [ ] Produce and read a hex dump of a small file; find the ASCII strings inside it.
3. [ ] URL-encode a string with spaces and special characters, then decode it.
4. [ ] Given a JSON document, use `jq` to extract a nested field and filter a list.

## Success criteria — you're done when
- [ ] You can convert a string between hex, base64, and plain text both ways.
- [ ] You can read a hex dump and pick out the ASCII.
- [ ] You can pull a nested value out of JSON with `jq`.
- [ ] You can explain why none of this is encryption.

## Deliverables
`encoding-notes.md`: your layered blob and its decoding, plus the `jq` queries you used.

## AI acceleration
Have a model identify an unknown encoding, then confirm by decoding it yourself — and note
when it guessed the wrong layer order.

## Connects forward
Hex and strings feed Track 04 (malware) and Track 03 (forensics); base64/URL encoding feed
Track 01 (web attacks); `jq` feeds Track 02 and Track 09.

## Marketable proof
> "I read and convert the encodings security data actually shows up in — hex, base64, URL —
> and query JSON with jq, without confusing encoding for encryption."

## Stretch
- Safely decode a real defanged IOC or a base64'd PowerShell command (no execution) and
  explain what it would have done.
