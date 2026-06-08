# Module 07 — Web & HTTP Fundamentals

**Foundations** — *almost every web attack and defense is just manipulating these fields.*

## Why this matters
The web runs on HTTP: a stateless request/response protocol where methods, headers, status
codes, and cookies are all text you can read and craft. Seeing them raw is the prerequisite
for the Offensive track's web modules and the Defensive track's web telemetry — if you
can't read an HTTP exchange by hand, web security stays a black box.

## Objective
Read and craft every part of an HTTP request/response with `curl`, and explain how state is
faked with cookies.

## Learn (~3 hrs)

**The protocol**
- [MDN — An overview of HTTP](https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview) — the canonical, readable reference for messages, methods, and status codes; read this page top to bottom.

**Web security on-ramp**
- [PortSwigger Web Security Academy — learning paths](https://portswigger.net/web-security/learning-paths) — free, hands-on, and the bridge straight into Track 01; start with the HTTP material.

**Reference**
- [curl manual](https://curl.se/docs/manpage.html) and [RFC 9110 (HTTP Semantics)](https://datatracker.ietf.org/doc/html/rfc9110) — the flags you'll use and the spec behind them.

## Key concepts
- Request anatomy: method, path, headers, body
- Response anatomy: status code, headers, body
- Statelessness and how cookies/sessions work around it
- Methods (GET/POST/PUT/DELETE) and status classes (2xx/3xx/4xx/5xx)
- Security-relevant headers (`Set-Cookie`, `Location`, CSP)

## AI acceleration
Models explain an unfamiliar header or status code instantly. The judgment to keep: a
header's *presence* isn't proof it's *correct* — verify security headers against the actual
response, not the model's assumption of best practice.
