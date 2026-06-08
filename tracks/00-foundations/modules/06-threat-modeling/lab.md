# Lab 06 — Threat-Modeling a Small Application

## Setup
No attack tooling — you need only a diagram and a list. Optionally spin up a deliberately
vulnerable app to model against:
```bash
docker run --rm -d -p 3000:3000 bkimminich/juice-shop   # classic vulnerable web app
```

## Scenario
Model a simple web app: a browser → a web server → a database, with user logins. Produce a
data-flow diagram and a STRIDE threat list.

> If you point any later-track tooling at this app, keep it on your own machine — never at
> systems you don't own.

## Steps
1. Draw the data flow (text is fine): list the **elements** (browser, server, DB), the
   **data flows** between them, and the **trust boundaries** those flows cross (e.g. the
   internet → server boundary).
2. For each element and flow, walk **STRIDE** and write at least one concrete threat:
   - **S**poofing — can someone impersonate a user or the server?
   - **T**ampering — can request or stored data be altered?
   - **R**epudiation — could an action be denied for lack of logs?
   - **I**nformation disclosure — what leaks (errors, tokens, PII)?
   - **D**enial of service — what exhausts the server or DB?
   - **E**levation of privilege — how could a user become admin?
3. For each threat, note a **mitigation** and which CIA property it protects.

## Expected output
A one-page data-flow sketch plus a STRIDE table: threat → trust boundary → mitigation →
CIA property protected.

## AI acceleration
Give a model your data-flow description and ask for a STRIDE pass; then prune its list to
what's real for *this* app and add what it missed. The pruning is the learning.

## Questions
1. Which trust boundary in your diagram is the most dangerous to get wrong, and why?
2. Pick one threat — how would a later track (Offensive or Defensive) actually test for or
   detect it?
