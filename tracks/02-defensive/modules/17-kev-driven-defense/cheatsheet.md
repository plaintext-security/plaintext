# Cheat sheet — KEV-Driven Defense

*Companion to [Module 17 — KEV-Driven Defense](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Pull the KEV catalog

```bash
# Canonical JSON feed (falls back to CISA's GitHub mirror if cisa.gov blocks non-browser clients)
curl -s https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json -o kev.json

# GitHub mirror (cisagov/kev-data) — git history IS the "what's new" diff
git clone https://github.com/cisagov/kev-data.git
```

Each entry carries `cveID`, `dateAdded`, `dueDate`, `knownRansomwareCampaignUse`, `vendorProject`, `product`, `shortDescription`. The top-level has `catalogVersion` and a `count`.

## Slice the feed with jq

```bash
jq '.catalogVersion, .count' kev.json                    # version + total entries

# Most recently added (this is the feed you act on)
jq -r '.vulnerabilities | sort_by(.dateAdded) | reverse
       | .[0:15][] | "\(.dateAdded)  \(.cveID)  \(.product)"' kev.json

# Added since a date
jq -r '.vulnerabilities[] | select(.dateAdded >= "2026-06-01")
       | "\(.dateAdded) \(.cveID) \(.vendorProject) \(.product)"' kev.json

# Ransomware-flagged — the highest-urgency subset
jq -r '.vulnerabilities[] | select(.knownRansomwareCampaignUse=="Known") | .cveID' kev.json

# Lookup one entry
jq '.vulnerabilities[] | select(.cveID=="CVE-2021-44228")' kev.json
```

## Diff the feed — the underrated core skill

```bash
# Extract just the CVE IDs from two pulls and diff — new entries = your new work
jq -r '.vulnerabilities[].cveID' kev-last.json | sort > last.txt
jq -r '.vulnerabilities[].cveID' kev.json      | sort > now.txt
comm -13 last.txt now.txt                                # CVE IDs added since last time
```

A detection programme that was "complete" last month is already behind if three KEV entries landed since.

## Stand up a reproducible target (Vulhub)

```bash
git clone https://github.com/vulhub/vulhub.git
cd vulhub/log4j/CVE-2021-44228           # per-CVE docker-compose + a README with the exploit
docker compose up -d                     # bring the vulnerable app up
docker compose down                      # tear it down when done
```

Cross-reference the live feed against "what Vulhub can stand up," pick the most recent *runnable* entry.

## Detection — write the rule against your own exploit traffic (Log4Shell)

```yaml
# The ${jndi:...} lookup lands in the URI, a header, OR the User-Agent — cover all three.
detection:
  selection:
    '|all':
      - '${jndi:'
  condition: selection
# Suricata equivalent — match the raw payload, not just http.uri:
# alert http any any -> any any (msg:"Log4Shell JNDI"; content:"${jndi:"; nocase;
#   sid:1000017; rev:1;)
```

> Only exploit targets you own or have written permission to test — these labs are intentionally vulnerable containers on your own machine.

## Gotchas worth remembering

- **KEV > CVSS for prioritisation.** "Confirmed exploited in the wild" outranks "theoretically severe." Applied defensively: cover what's *being used* this week, not the whole CVE wall.
- **KEV is a *moving feed*, so diffing is the skill.** `catalogVersion` and `dateAdded` change every few days. Pull, diff against last time, act on what's new — a static read goes stale fast.
- **Not every KEV entry is workable in a lab.** A Chrome V8 bug or a Cisco appliance RCE has no friendly container. The practitioner move is finding the runnable subset (large fraction map to Vulhub) and picking the most recent one.
- **Field coverage is where detections quietly miss.** The Log4Shell payload lands in the URI, a header, *or* the User-Agent. A detector that only checks the URI misses the User-Agent variant — check every place the payload can land.
- **KEV and Vulhub are leads, not gospel.** Still read the vendor advisory and the PoC before running anything — they're pointers into the primary sources, not substitutes.
- **The AI hallucinates here readily** — wrong affected-version range, invented CVE ID, a `dateAdded` that doesn't match. Verify every claim against the CISA entry, and *watch the rule fire* on your captured exploit traffic before trusting it.
