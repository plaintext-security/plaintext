# Cheat sheet — Containerising Tooling (Docker)

*Companion to [Module 06 — Containerising Tooling](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Build, run, publish

```bash
docker build -t trufflehog-tool:1.0 .            # build from ./Dockerfile with a real version tag
docker run --rm trufflehog-tool:1.0 --help       # ENTRYPOINT is the tool; args pass straight through
docker run --rm -v "$PWD:/scan:ro" trufflehog-tool:1.0 filesystem /scan   # scan mounted files, read-only
docker history trufflehog-tool:1.0               # inspect layers — spot a secret COPY'd then deleted
docker push ghcr.io/you/trufflehog-tool:1.0      # publish to a registry
```

## A hardened Dockerfile (multi-stage, non-root, pinned)

```dockerfile
# ---- build stage: heavy toolchain stays OUT of the final image ----
FROM golang:1.23-alpine AS build              # pin the base tag, not :latest
WORKDIR /src
COPY . .
RUN CGO_ENABLED=0 go build -o /out/trufflehog ./cmd/...

# ---- runtime stage: minimal, no compiler, no shell surface ----
FROM gcr.io/distroless/static:nonroot         # tiny base; runs as non-root by default
COPY --from=build /out/trufflehog /usr/local/bin/trufflehog
USER nonroot:nonroot                          # never run as root
ENTRYPOINT ["/usr/local/bin/trufflehog"]      # the tool IS the container
# no CMD — the user supplies the args (filesystem, git, etc.)
```

Pin a downloaded binary **and verify its checksum**:

```dockerfile
ARG TH_VERSION=3.82.0
RUN curl -fsSL -o th.tar.gz \
      "https://github.com/trufflesecurity/trufflehog/releases/download/v${TH_VERSION}/..." \
 && echo "<sha256>  th.tar.gz" | sha256sum -c -   # fail the build on a checksum mismatch
```

## trufflehog — what you're packaging

```bash
trufflehog filesystem /scan                      # scan a directory tree for verified secrets
trufflehog git file://.                          # scan a local repo's history
trufflehog github --repo=https://github.com/org/x --only-verified   # live-verify hits, cut noise
```

## Verify the image is honest

```bash
docker run --rm trufflehog-tool:1.0 whoami 2>/dev/null || \
  docker inspect -f '{{.Config.User}}' trufflehog-tool:1.0   # confirm non-root
docker inspect -f '{{.Config.Entrypoint}}' trufflehog-tool:1.0
docker scout cves trufflehog-tool:1.0            # (or: trivy image trufflehog-tool:1.0) scan for CVEs
```

## Gotchas worth remembering

- **Layers are append-only — a secret is in the image even after you delete it.** `COPY`ing a
  credential or `.env` in one layer and `RUN rm`-ing it in the next still ships it; `docker history`
  and the layer tarballs expose it. Never bake a secret in; mount it at run time or use build secrets.
- **Pin the base *and* the tool.** `FROM ubuntu:latest` and `curl | bash` are "run arbitrary binary
  data and hope" — the docker123321 campaign rode exactly that (~5M pulls of backdoored images). Pin
  the base tag, pin the tool version, verify the checksum.
- **Multi-stage keeps the compiler out of the runtime image.** Ship the built binary on a distroless
  or `-slim` base — no compiler, no package manager, no shell means a far smaller attack surface.
- **Run non-root with an explicit `USER`.** Root in the container plus a bind mount is effectively
  root on that path of the host. Distroless `:nonroot` or a created user closes the easy escape.
- **`ENTRYPOINT` = the tool, no `CMD`.** The container should behave like the binary — args flow
  through, `--help` works, and there's no surprise default command a user didn't ask for.
- **A published image runs whatever its author put in it** — pin, checksum, and scan yours so the
  next person can trust it the way you'd want to trust theirs.
