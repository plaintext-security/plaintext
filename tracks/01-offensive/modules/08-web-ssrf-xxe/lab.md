# Lab 08 — Exploit SSRF Toward the Cloud-Metadata Pattern

## Setup
Docker-first — the [PortSwigger SSRF labs](https://portswigger.net/web-security/ssrf) in the
browser, or a deliberately vulnerable SSRF app you run in a container.

## Scenario
Exploit a Server-Side Request Forgery so the server fetches a URL of your choosing — the exact
class behind the Capital One breach.

> Only attack PortSwigger labs / deliberately vulnerable apps / targets you own.

## Do
1. [ ] Find a feature where the server fetches a URL you supply (an image loader, webhook, or
   URL preview).
2. [ ] Point it at an internal resource the server can reach but you can't — confirm SSRF.
3. [ ] Reach a sensitive internal endpoint (in the lab, the simulated metadata/admin service)
   and retrieve something you shouldn't.
4. [ ] State the root cause and the allow-list fix.

## Success criteria — you're done when
- [ ] You made the server issue a request to an internal target on your behalf.
- [ ] You retrieved internal-only data via the server.
- [ ] You can explain how this pattern caused the Capital One breach, and the fix.

## Deliverables
`ssrf.md`: the vulnerable feature, the payload, what you reached internally, the fix — and a
sentence linking it to Capital One.

## AI acceleration
Have a model explain why a payload did or didn't work given the server's network position —
then confirm against the app. Understanding the trust topology is the part only you can do.

## Connects forward
These server-side classes are where web attacks meet Track 05 (cloud) — SSRF to metadata is
the bridge.

## Marketable proof
> "I exploit SSRF, XXE, and insecure deserialization — the server-side classes behind real
> breaches like Capital One — and explain each fix."

## Automate & own it
**Required.** Script an SSRF probe that walks a list of internal targets through the vulnerable
parameter; AI drafts it, you reason about the server's network position; commit it.

## Stretch
- Research exactly how the Capital One SSRF reached the AWS metadata service, and what
  IMDSv2 changed to mitigate it.
