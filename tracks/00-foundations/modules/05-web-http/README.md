# Module 05 — Web & HTTP Fundamentals

## Objective
Understand the anatomy of an HTTP request and response, and use `curl` to inspect every
part of it.

## Background
The web runs on HTTP: a stateless request/response protocol where everything — methods,
headers, status codes, cookies — is just text you can read and craft by hand. Almost every
web attack and defense comes down to manipulating or validating these fields, so seeing
them raw is the foundation for the Offensive and Defensive tracks.

## Key concepts
- Request anatomy: method, path, headers, body
- Response anatomy: status code, headers, body
- Statelessness, and how cookies/sessions work around it
- Methods (GET/POST/PUT/DELETE) and status classes (2xx/3xx/4xx/5xx)
- Why headers matter for security (`Set-Cookie`, `Location`, CSP)

## AI acceleration
Models are great at explaining an unfamiliar header or status code on the spot. The
judgment to keep: a header's *presence* isn't proof it's *correct* — verify security
headers against the actual response, not the model's assumption of best practice.

## Further reading
- RFC 9110 (HTTP Semantics): https://datatracker.ietf.org/doc/html/rfc9110
- MDN HTTP reference: https://developer.mozilla.org/en-US/docs/Web/HTTP
- curl manual: https://curl.se/docs/manpage.html
