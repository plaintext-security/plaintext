# Module 03 — Docker & Containers

**Foundations** — *every lab here is Docker-first; this is the literacy that assumes.*

## Why this matters
Containers are how modern software ships — and how every lab here runs, because they're
reproducible, disposable, and zero-cost. You need to read a `docker run` line, build an
image, and understand the isolation model well enough to both use containers and, later,
attack and defend them (Track 05). Skip this and every other lab is cargo-culting.

## Objective
Run, build, and inspect containers, and explain the isolation model well enough to use them
safely.

## Learn (~3 hrs)

**Hands-on basics**
- [Docker — Get Started](https://docs.docker.com/get-started/) — the official, hands-on intro: images, containers, volumes, ports.
- [TechWorld with Nana — Docker Tutorial for Beginners (full course, ~3 hrs)](https://www.youtube.com/watch?v=3c-iBn73dDE) — the clearest beginner-to-working walkthrough; the first hour (images, containers, ports, volumes) is enough for the lab.
- [Play with Docker](https://labs.play-with-docker.com/) — a free in-browser Docker host if you can't install locally.

**The security angle**
- [Docker docs — Engine security](https://docs.docker.com/engine/security/) — the isolation model, why `--privileged` is dangerous, and running as non-root.

## Key concepts
- Images vs containers vs registries
- `docker run` anatomy: ports, volumes, env, lifecycle
- Building an image with a Dockerfile
- The isolation model (namespaces/cgroups) — and its limits
- Why a container is not a security boundary by default

## AI acceleration
A model writes your Dockerfile or `docker run` line instantly — and that's exactly where
over-broad mounts and `--privileged` sneak in. Read every generated flag: a volume mount or
capability you didn't intend is a real hole.
