# Lab 02 — Scan and Enumerate a Target

## Setup
Docker-first Nmap:
```bash
docker run --rm -it instrumentisto/nmap <target>
```

## Scenario
Scan an **authorised** target end to end: discover it, enumerate its services, and record
what you find.

> Use only **scanme.nmap.org** — a host Nmap explicitly provides for scan practice — or
> machines in your own lab. Never scan systems you don't own or aren't authorised to test.

## Do
1. [ ] Discover whether the target is up, then find its open ports. (Which scan type needs
   root, and why is it the faster default?)
2. [ ] Identify the service and version behind each open port.
3. [ ] Run default enumeration scripts against one interesting service and read what they
   return.
4. [ ] Record the open ports, services, and versions as you'd hand them to the next phase.

## Success criteria — you're done when
- [ ] You have a list of open ports with service + version for the target.
- [ ] You can explain the difference between a SYN and a connect scan.
- [ ] You enumerated one service beyond just its version.

## Deliverables
`scan-notes.md`: the host, the open ports/services/versions, and the one service you
enumerated further.

## AI acceleration
Paste a confusing Nmap line or NSE result to a model for a plain-English read — then confirm
it against the raw output and the Nmap docs.

## Connects forward
The service versions you find here are the input to module 03 (vulnerability identification).

## Marketable proof
> "I scan and enumerate a target with Nmap — host discovery, version detection, NSE — and
> read the output to find the next step."

## Automate & own it
**Required.** Wrap scan → parse into a script that emits the open services as JSON for the next
phase; AI drafts it, you check it against the raw scan output; commit it.

## Stretch
- Capture your scan with `tcpdump` (Foundations module 06) and watch a SYN scan's half-open
  handshakes on the wire.
