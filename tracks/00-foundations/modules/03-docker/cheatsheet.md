# Cheat sheet — Docker & Containers

*Companion to [Module 03 — Docker & Containers](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Run and manage containers

```bash
docker run -it --rm debian:12-slim bash     # interactive throwaway; deletes itself on exit
docker run -d --name web -p 8080:80 nginx   # detached, host port 8080 → container port 80
docker ps                                   # running containers
docker ps -a                                # ...including stopped ones
docker stop web && docker rm web            # stop, then delete
docker rm -f web                            # force-remove in one step
```

- `--rm` is the experimenter's friend — nothing left behind to clean up.
- `-p 8080:80` binds **all interfaces** (`0.0.0.0`) by default. On a shared network, publish as
  `-p 127.0.0.1:8080:80` so your deliberately vulnerable lab app isn't reachable from the LAN.

## Look inside a running container

```bash
docker exec -it web bash                    # shell into it (try sh if bash is missing)
docker logs -f web                          # follow stdout/stderr
docker top web                              # processes inside, from the host's view
docker inspect web                          # full config as JSON (mounts, env, network)
docker inspect -f '{{.NetworkSettings.IPAddress}}' web
docker cp web:/etc/nginx/nginx.conf .       # copy files out (works in reverse too)
docker diff web                             # files changed since the image started
```

## Images

```bash
docker pull nginx:1.27            # pin a tag — ':latest' means 'whatever today'
docker images                     # what's cached locally
docker build -t myapp:dev .       # build from ./Dockerfile
docker history myapp:dev          # the layers — and what each one added
docker rmi myapp:dev              # remove an image
```

- Layers are append-only: a secret `COPY`'d in one layer and deleted in the next **still ships**
  in the image — `docker history` and the layer tarballs will show it.

## Compose — the lab workflow

```bash
docker compose up -d --build      # build + start the whole stack in the background
docker compose ps                 # stack status
docker compose logs -f app        # follow one service's logs
docker compose exec app bash      # shell into a running service
docker compose run --rm app python3 demo.py   # one-off command in a fresh container
docker compose down               # stop and remove containers + network
docker compose down --volumes     # ...and the data volumes — full reset
```

## Disk and cleanup

```bash
docker system df                  # what's eating disk
docker system prune               # stopped containers, dangling images, unused networks
docker system prune -a --volumes  # scorched earth: ALL unused images and volumes
docker volume ls                  # named volumes (data outlives containers)
docker network ls                 # networks (compose makes one per project)
```

## Gotchas worth remembering

- A container is a **process with namespaces**, not a VM. Root inside the container plus a host
  bind-mount (`-v /:/host`) is effectively root on the host — which is why mounted Docker sockets
  (`/var/run/docker.sock`) are a classic escape path.
- Bind mounts (`-v $(pwd):/data`) edit your real files; named volumes persist until you
  `down --volumes` or `volume rm` them. "I reset the lab but the data's still there" is a volume.
- Container images run whatever their author put in them — treat `docker run` of an unknown image
  with the same suspicion as `curl | bash`.
