# Lab 06 — Exploit SQL Injection

## Setup
Docker-first — DVWA (Damn Vulnerable Web Application):
```bash
docker run --rm -it -p 80:80 vulnerables/web-dvwa
```
(Or use the PortSwigger Academy SQL-injection labs in the browser.)

## Scenario
Find and exploit SQL injection in a deliberately vulnerable app, escalating from detection to
data extraction.

> Only attack DVWA / PortSwigger labs / targets you own.

## Do
1. [ ] Find an input that isn't sanitised and confirm it's injectable. (What single character
   often breaks a SQL query?)
2. [ ] Determine the number and types of columns the query returns.
3. [ ] Extract data you shouldn't be able to — e.g. the user list and password hashes.
4. [ ] State the root cause and the one-line fix.

## Success criteria — you're done when
- [ ] You confirmed injection and extracted data via a crafted query.
- [ ] You can explain why the input was injectable.
- [ ] You can state the fix (parameterised queries) and why it works.

## Deliverables
`sqli.md`: the injectable parameter, the payloads that worked, the data extracted (redacted),
and the fix.

## AI acceleration
Have a model explain a confusing SQL error or suggest a next payload — then confirm it works
and that you understand why. Don't submit a finding you can't reproduce by hand.

## Connects forward
Injection is one of three web classes here; module 07 (auth & access control) and 08
(SSRF/XXE/deserialization) cover the rest.

## Marketable proof
> "I find, exploit, and explain SQL and command injection — from detection to data extraction
> to the correct parameterised-query fix."

## Automate & own it
**Required.** After exploiting by hand, script the extraction (or run `sqlmap`) and document exactly
what it automated versus what you did manually; commit the writeup and the script.

## Stretch
- Re-run the same finding with `sqlmap`, then explain everything sqlmap did that you'd done by
  hand.
