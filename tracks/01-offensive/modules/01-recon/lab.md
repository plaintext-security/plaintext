# Lab 01 — Map an Attack Surface

## Setup
Docker-first — a passive recon tool (OWASP Amass):
```bash
docker run --rm -it caffix/amass enum -passive -d <your-domain>
```
(`theHarvester` is a good companion, available in Kali or its own image.)

## Scenario
Build an attack-surface map for a target **you own or are explicitly authorised to test** —
your own domain, or a bug-bounty program whose scope permits recon.

> Authorization is mandatory. Recon a domain you own, or a bug-bounty scope that allows it.
> Passive recon still means *staying in scope* — don't probe assets you're not permitted to.

## Do
1. [ ] Confirm and write down your scope: exactly which domains/assets you may investigate.
2. [ ] Enumerate subdomains **passively** — no direct contact with the target. (What public
   data exposes subdomains — DNS records, certificate-transparency logs?)
3. [ ] Fingerprint the technologies running on the assets you found.
4. [ ] Assemble an attack-surface map — domains → IPs → technologies → exposed services —
   noting how you found each.

## Success criteria — you're done when
- [ ] You have an asset inventory, each entry annotated with its source.
- [ ] You stayed passive and in-scope throughout, and can show it.
- [ ] You can point to the single most interesting exposed asset and say why.

## Deliverables
`recon-report.md`: the scope statement, the asset inventory (with sources), and your top
targets for the next phase.

## AI acceleration
Have a model consolidate your raw tool output into the asset map — then verify every asset
actually resolves before trusting it. Hallucinated subdomains are the classic failure mode.

## Connects forward
The assets you map here are the input to module 02 (scanning & enumeration).

## Marketable proof
> "I map an external attack surface from OSINT — subdomains, tech stack, exposed services —
> methodically and in-scope, the way bug-bounty and red-team recon actually works."

## Stretch
- Script the passive subdomain enumeration into a repeatable tool (a preview of Track 09).
