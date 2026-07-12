# Cheat sheet — Patch & Vulnerability Management

*Companion to [Module 08 — Patch & Vulnerability Management](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Inventory with osquery — "what do we have"

```sql
-- Installed OS packages (pick the table for the distro)
SELECT name, version, arch FROM deb_packages ORDER BY name;   -- Debian/Ubuntu
SELECT name, version, release FROM rpm_packages ORDER BY name; -- RHEL/Fedora
SELECT name, version FROM homebrew_packages;                   -- macOS

-- Language ecosystems (where app CVEs actually live)
SELECT name, version, path FROM python_packages;
SELECT name, version, path FROM npm_packages;

-- Host context for the report header
SELECT name, version FROM os_version;
SELECT version FROM kernel_info;
```

```sql
-- Windows: applied hotfixes / patch level
SELECT hotfix_id, description, installed_on FROM patches;
```

```bash
osqueryi --json "SELECT name, version FROM deb_packages ORDER BY name"   # one-shot, JSON out
```

## Generate an SBOM with syft — freeze the inventory

```bash
syft ubuntu:22.04                       # catalog a container image
syft dir:.                              # catalog a filesystem / project dir
syft registry:myrepo/app:1.2           # catalog without pulling to the daemon

# Output formats — syft-json is grype's native input
syft dir:. -o syft-json > sbom.json     # feed straight into grype
syft dir:. -o spdx-json > sbom.spdx.json
syft dir:. -o cyclonedx-json > sbom.cdx.json
syft dir:. -o json                      # alias for syft-json
```

## Scan for CVEs with grype — "what applies to it"

```bash
grype ubuntu:22.04                      # scan an image directly
grype dir:/                             # scan a filesystem
grype dir:/ --scope all-layers          # include every image layer, not just squashed

# Scan the SBOM, not the live target — reproducible + air-gap friendly
grype sbom:./sbom.json

grype dir:/ -o json > grype-results.json  # machine-readable for triage scripts
grype dir:/ --only-fixed                   # drop findings with no available fix
grype dir:/ --fail-on high                 # non-zero exit at High+ (CI gate)

grype db status                            # is the vuln DB current?
grype db update                            # pull the latest NVD/advisory feeds
```

## SBOM-driven pipeline — build once, scan many

```bash
syft dir:. -o syft-json | grype           # generate + scan in one pass
# Or persist the SBOM as an artifact, then scan it later / elsewhere:
syft dir:. -o syft-json > sbom.json
grype sbom:./sbom.json --only-fixed -o json > results.json
```

## Prioritise — CVSS is not your context

```bash
# Severity histogram from grype JSON
jq '.matches | group_by(.vulnerability.severity)
     | map({sev: .[0].vulnerability.severity, count: length})' grype-results.json

# Cross-reference findings against CISA KEV (active-exploitation evidence)
curl -s https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json \
  | jq -r '.vulnerabilities[].cveID' > kev-ids.txt
jq -r '.matches[].vulnerability.id' grype-results.json | while read cve; do
  grep -qi "$cve" kev-ids.txt && echo "KEV: $cve"     # KEV hits = Priority 1
done
```

Priority order: **KEV-listed → Critical → High → Medium**, filtered by *is it reachable* and *does a
fix exist*. A CVSS 6.5 in an internet-facing, KEV-listed service beats a 9.8 in an unreachable library.

## Gotchas worth remembering

- **Scan the SBOM, not the live image, for anything you need to reproduce.** `grype sbom:./sbom.json`
  freezes the inventory at build time — the same input yields the same findings next month, and it
  works in an air-gapped pipeline where the scanner can't reach the host.
- **A stale DB silently misses recent CVEs.** grype only knows what its vuln feed knows — run
  `grype db update` (check `grype db status`) before a scan you'll act on, or a fresh KEV entry won't show.
- **`--only-fixed` is the noise filter that makes the list actionable.** A finding with no upstream
  patch isn't a task you can close — separate "waiting on a fix" from "fix exists, we haven't applied it."
- **CVSS is a property of the vulnerability, not of your exposure.** Sorting by base score inverts your
  priorities. KEV membership and network reachability tell you what to patch first; a loaded-but-unreachable
  package is not the same risk as an exposed one.
- **osquery tells you what's *actually installed*; manifests lie.** A `requirements.txt` or lockfile is
  intent — drift, sideloaded packages, and manual installs only show up in the live inventory.
- **Distroless and multi-stage images still carry deps.** "Minimal" doesn't mean empty — syft/grype
  still catalog the OS libs and app dependencies baked into the final layer, so scan the shipped image.
