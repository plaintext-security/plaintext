---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — TLS auditing with testssl.sh & openssl

*Companion to [Module 05 — TLS Deep Dive](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## testssl.sh — full scan and scoping

```bash
testssl.sh example.com                     # full scan of :443 (protocols, ciphers, cert, vulns)
testssl.sh https://example.com:8443        # explicit scheme + port
testssl.sh 10.0.0.5:443                    # scan a raw IP:port on the bridge network
testssl.sh --severity HIGH example.com     # only surface HIGH and above (LOW/MEDIUM/CRITICAL also valid)
testssl.sh --sneaky --quiet example.com    # less noisy User-Agent, drop the banner
```

## testssl.sh — target one category

```bash
testssl.sh -p example.com                  # protocols only (SSLv2/3, TLS 1.0–1.3)
testssl.sh -E example.com                  # each cipher, per protocol (the "-e" is a shorter list)
testssl.sh -S example.com                  # server-preferred cipher order
testssl.sh -U example.com                  # all vulnerability checks in one pass
testssl.sh -H example.com                  # HTTP headers (HSTS, etc.)
testssl.sh --phone-out example.com         # allow OCSP/CRL lookups that need outbound network
```

## testssl.sh — named-attack checks

```bash
testssl.sh --heartbleed example.com        # CVE-2014-0160 — OpenSSL heartbeat over-read
testssl.sh --drown example.com             # CVE-2016-0800 — SSLv2 leaks a modern session key
testssl.sh --poodle example.com            # CVE-2014-3566 — SSLv3 CBC padding oracle
testssl.sh --beast example.com             # CVE-2011-3389 — TLS 1.0 CBC
testssl.sh --robot example.com             # RSA key-exchange padding oracle (Bleichenbacher)
```

## testssl.sh — machine-readable output (for CI)

```bash
testssl.sh --jsonfile-pretty out.json example.com   # structured JSON — parse the "severity" field
testssl.sh --csvfile out.csv example.com            # CSV, one finding per row
testssl.sh --logfile out.log example.com            # plain-text log alongside the terminal run
# gate a pipeline: fail if any finding is HIGH or CRITICAL
jq -e '[.[] | select(.severity=="HIGH" or .severity=="CRITICAL")] | length == 0' out.json
```

## openssl s_client — advanced handshake inspection

```bash
# pin a protocol version to confirm it is (or isn't) offered
openssl s_client -connect example.com:443 -tls1_3 </dev/null
openssl s_client -connect example.com:443 -tls1_2 </dev/null
openssl s_client -connect example.com:443 -no_tls1_3 </dev/null   # force downgrade attempt

# force a single cipher (TLS 1.2) or ciphersuite (TLS 1.3) to test acceptance
openssl s_client -connect example.com:443 -cipher 'ECDHE-RSA-AES256-GCM-SHA384' </dev/null
openssl s_client -connect example.com:443 -ciphersuites TLS_AES_256_GCM_SHA384 </dev/null

# name the key-exchange group(s) offered — confirms ECDHE / X25519 forward secrecy
openssl s_client -connect example.com:443 -groups X25519:P-256 </dev/null

openssl s_client -connect example.com:443 -servername example.com -status </dev/null  # OCSP staple
openssl s_client -connect example.com:443 -alpn h2,http/1.1 </dev/null                # test ALPN
openssl ciphers -v 'ECDHE+AESGCM'          # expand a cipher string to the suites it selects
```

Read the `New, TLSv1.x, Cipher is ...` line and the `Server Temp Key:` line — the latter names the
ephemeral group (e.g. `X25519, 253 bits`), which is your proof forward secrecy is actually in use.

## Gotchas worth remembering

- **Classify before you rank.** Every finding is *protocol*, *cipher suite*, or *certificate* — sort it
  first and the remediation names itself (config-list edit vs. reissue/renew).
- **The scan line is the symptom, not the risk.** "SSLv2 enabled" reads like dead weight; it's DROWN and
  can leak a *modern* session's key. Map to the named attack before assigning severity.
- **Heartbleed is an implementation axis, not a config one.** No weak cipher is involved — a patched
  OpenSSL is the only fix. Modern protocol + strong ciphers is necessary, not sufficient.
- **`</dev/null` on every s_client.** Without it the session hangs waiting for interactive input; a bare
  `-connect` looks like a freeze, not a result.
- **Don't hand-roll the fix.** testssl.sh (or an AI) tells you *what's* wrong; the
  [Mozilla SSL Config Generator](https://ssl-config.mozilla.org/) is the authority on the exact
  `ssl_protocols` / `ssl_ciphers` lines. Confirm a directive is in the modern/intermediate profile before applying.
- **testssl.sh flags need a working outbound path for OCSP/CRL.** In an air-gapped lab, revocation checks
  will show as unreachable — use `--phone-out` only when the network genuinely allows it.
