# Lab 07 — Dissecting HTTP with curl

## Setup
Docker-first — run a local echo server so you can see exactly what you send:
```bash
docker run --rm -d -p 8080:80 --name httpbin kennethreitz/httpbin
```
Then use your host's `curl` against `http://localhost:8080`.

## Scenario
Send requests to a local httpbin instance and read every part of the exchange.

## Do
Figure out the `curl` flags from its manual — knowing which flag does what is half the lab.

1. [ ] Make a plain GET request and read the full request *and* response headers.
2. [ ] Send a POST with form data and watch the server echo your body back.
3. [ ] Trigger a redirect: observe the 3xx status and its `Location` header, then make curl
   follow it.
4. [ ] Set a cookie via one request, then send it back on the next — proving you carried
   state across two otherwise stateless requests.
5. [ ] Tear down the container when done.

## Success criteria — you're done when
- [ ] You can identify the method, status code, and key headers in an exchange.
- [ ] You can explain what `Location` does on a redirect.
- [ ] You can describe how the cookie carried state between two otherwise stateless requests.

## Deliverables
`http-notes.md`: an annotated request/response pair, and one sentence on why the server
"trusting" `role=admin` is a problem.

## AI acceleration
Ask a model to explain each response header httpbin returns — then decide for yourself which
are security-relevant versus noise.

## Connects forward
This is the literacy Track 01's web modules (injection, auth, SSRF) and Track 02's web
telemetry assume.

## Marketable proof
> "I can read and craft raw HTTP with curl — methods, headers, status codes, redirects, and
> cookies — which is the basis of every web attack and defense."

## Stretch
- Capture an HTTPS request with `curl -v https://example.com`: you'll see the TLS
  negotiation but not the payload. Tie it back to module 09.
