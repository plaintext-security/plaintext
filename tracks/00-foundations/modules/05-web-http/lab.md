# Lab 05 — Dissecting HTTP with curl

## Setup
Docker-first — run a local echo server so you can see exactly what you send:
```bash
docker run --rm -d -p 8080:80 --name httpbin kennethreitz/httpbin
```
Then use your host's `curl` against `http://localhost:8080` (or run `curl` from a
container with `--network host`).

## Scenario
Send requests to a local httpbin instance and read every part of the exchange.

## Steps
1. See the full request and response headers:
   ```bash
   curl -v http://localhost:8080/get
   ```
2. Send a POST with a body and watch it echoed back:
   ```bash
   curl -X POST http://localhost:8080/post -d 'user=alice&role=admin'
   ```
3. Observe a redirect, then follow it:
   ```bash
   curl -i http://localhost:8080/redirect/1     # the 302 + Location header
   curl -iL http://localhost:8080/redirect/1    # follow it to the destination
   ```
4. Set a cookie, then send it back:
   ```bash
   curl -i 'http://localhost:8080/cookies/set?session=abc123'
   curl --cookie 'session=abc123' http://localhost:8080/cookies
   ```

When done: `docker rm -f httpbin`.

## Expected output
The verbose request/response lines (method, headers, status), your POST body reflected
back as JSON, a 302 with a `Location` header, and the cookie round-tripped.

## AI acceleration
Ask a model to explain each response header httpbin returns — then decide for yourself
which are actually security-relevant versus noise.

## Questions
1. What status code did the redirect return, and which header told the client where to go?
2. The server trusted `role=admin` simply because you sent it — what class of vulnerability
   does that hint at for the Offensive track?
