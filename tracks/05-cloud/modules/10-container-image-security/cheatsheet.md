---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Container & Image Security

*Companion to [Module 10 — Container & Image Security](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Scan for CVEs — Trivy

```bash
trivy image python:3.8-slim                          # scan an image's packages against CVE feeds
trivy image --severity HIGH,CRITICAL myapp:latest    # only what's worth acting on
trivy image --ignore-unfixed myapp:latest            # hide CVEs with no patch yet (track, don't gate)
trivy image --format json -o report.json myapp:latest # machine-readable for triage/AI
trivy image --format table myapp:latest              # default human-readable table

# The CI gate: fail the build ONLY on fixable HIGH/CRITICAL
trivy image --exit-code 1 --severity HIGH,CRITICAL --ignore-unfixed myapp:latest
```

## Second opinion — Grype (one scanner is one opinion)

```bash
grype python:3.8-slim                  # scan an image
grype myapp:latest -o json             # JSON output
grype myapp:latest --only-fixed        # Grype's equivalent of --ignore-unfixed
grype myapp:latest --fail-on high      # non-zero exit at/above a severity (CI gate)
grype dir:./project                    # scan a filesystem/source dir instead of an image
```

Run `trivy` *and* `grype` and reconcile — their CVE databases source differently (NVD, GitHub Advisory, distro feeds), so they disagree at the edges.

## Look inside the layers — what running never shows

```bash
docker history myapp:latest                    # every layer + the command that built it
docker history --no-trunc myapp:latest         # full commands — reveals secrets baked into ENV/ARG/RUN
docker inspect myapp:latest                     # config: USER, ENV, ExposedPorts, Entrypoint
docker inspect --format '{{.Config.User}}' myapp:latest   # is it running as root? (empty/0 = yes)
docker image save myapp:latest -o img.tar && tar xf img.tar  # crack layers open, grep for keys
```

`docker history` is how the Codecov attacker found a credential — a secret deleted in a later layer is still recoverable from the earlier one.

## Beyond CVEs — config & Dockerfile hygiene

```bash
trivy config .                          # scan Dockerfile/IaC for misconfig (non-root, no secrets, etc.)
trivy image --scanners misconfig myapp:latest   # misconfig scanning on the built image
docker scout cves myapp:latest          # Docker's own CVE view (needs Docker Desktop/login)
docker scout recommendations myapp:latest  # suggested base-image bumps
```

A clean CVE report says nothing about a miner, a reverse shell, a root `USER`, or an open debug port — those are hygiene, not vulnerabilities.

## The fix — harden with a multi-stage rebuild

```dockerfile
# builder stage: fat, has the toolchain
FROM golang:1.22 AS build
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /app ./cmd/server

# final stage: tiny, ships only the artifact — no shell, no package manager
FROM gcr.io/distroless/static-debian12@sha256:<digest>   # pin by digest, not a mutable tag
COPY --from=build /app /app
USER 65532:65532          # non-root UID — never run as root
ENTRYPOINT ["/app"]
```

```bash
docker build -t myapp:hardened .
trivy image myapp:hardened     # prove the rebuild measurably cut the SBOM and CVE count
```

## Gotchas worth remembering

- **Fixability, not count, is the verdict.** Gating on a CRITICAL with no available patch just blocks every build for no action; gate on `--severity HIGH,CRITICAL --ignore-unfixed` so the pipeline fails only when a rebuild would actually fix something.
- **"It scanned clean" ≠ "it's clean."** A CVE scan answers *"are the packages patched"* — it is silent on embedded miners, planted reverse shells, secrets in a layer, and containers running as root. Pair `trivy image` with `trivy config`/`docker history`.
- **Tags are mutable; digests aren't.** `python:3.8-slim` today and a year ago are different bits. Pin `FROM ...@sha256:...` so a cached old digest can't quietly ship vulnerable code forever, and rebuild on a schedule.
- **A CRITICAL in the SBOM may be unreachable in your app.** The scanner sees packages, not your call graph — confirm the vulnerable path is actually exercised before you treat a finding as urgent.
- **The final stage should be near-empty.** Distroless/`-slim` with no shell or package manager removes the exact tools an attacker pivots through — you can't `apt upgrade` your way out of an inherited base, you rebuild off it.

> Only scan and test images you own or have explicit permission to assess.
