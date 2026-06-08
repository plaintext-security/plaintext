# Lab 13 — Run an Incident in TheHive

## Setup
Docker-first — [TheHive](https://docs.strangebee.com/thehive/) (its docker-compose). Real data: an
alert from your Phase 1–2 work (a detection that fired, an EVTX sample, a Suricata alert) — or a
public IR scenario.

## Scenario
Take a real alert from raw signal to a documented incident verdict, using a structured process.

## Do
1. [ ] Triage the alert: true or false positive? Severity and scope? (Decide the priority before you
   dig in.)
2. [ ] Open a case and capture the observables (IPs, hashes, hosts) and a timeline.
3. [ ] Walk the NIST lifecycle: what would you contain, eradicate, and recover — and in what order?
4. [ ] Reach a root-cause verdict and write the post-incident summary (what happened, what you'd
   improve).

## Success criteria — you're done when
- [ ] You triaged the alert to a justified true/false-positive call.
- [ ] Your case has observables, a timeline, and a root-cause verdict.
- [ ] You wrote a post-incident summary with a concrete improvement.

## Deliverables
`incident.md`: the triage decision, the case timeline, the root-cause verdict, and the post-incident
review.

## AI acceleration
Have a model draft the incident timeline/summary from your case notes — then verify every claim
against the observables. You sign the verdict; you own it.

## Connects forward
The indicators from your incident feed threat intel (module 14); the response steps get automated in
module 15.

## Marketable proof
> "I triage alerts and run incidents through the NIST lifecycle in a real case-management platform —
> to a documented root-cause verdict and post-incident review."

## Automate & own it
**Required.** Build an alert-triage checklist/template (and optionally wire a detection to auto-create
a TheHive case via its API); AI drafts, you verify it captures the right fields; commit it.

## Stretch
- Connect Cortex to TheHive and auto-enrich an observable — a bridge to module 15's automation.
