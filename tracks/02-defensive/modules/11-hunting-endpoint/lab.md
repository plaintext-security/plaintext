# Lab 11 — Hunt the Endpoint

## Setup
[Velociraptor](https://docs.velociraptor.app/) (a single binary, runs locally), with real endpoint
data: [EVTX-ATTACK-SAMPLES](https://github.com/sbousseaden/EVTX-ATTACK-SAMPLES), or generate your own
with Atomic Red Team on a lab host.

## Scenario
Form a hypothesis about attacker activity and hunt for it in real endpoint data.

## Do
1. [ ] Form a testable hypothesis (e.g. "an attacker established persistence via a registry Run key" —
   ATT&CK T1547.001).
2. [ ] Hunt: query the real endpoint data for evidence for or against it.
3. [ ] Follow the lead — if you find something, pivot (process ancestry, timing) to confirm; if not,
   refine the hypothesis.
4. [ ] Turn the result into a detection idea (or a Sigma rule) so the hunt becomes durable.

## Success criteria — you're done when
- [ ] You ran a hypothesis-driven hunt against real data.
- [ ] You confirmed or rejected it with evidence, not a guess.
- [ ] You produced a detection idea from the hunt.

## Deliverables
`hunt-endpoint.md`: the hypothesis, the queries, the evidence, and the detection it produced.

## AI acceleration
Have a model brainstorm hypotheses and draft VQL — then test each against the data yourself. A
"confirmed" pattern that's actually baseline noise is the classic hunting trap.

## Connects forward
Hunts that pay off become detections (module 08); the same method goes to the network in module 12.

## Marketable proof
> "I run hypothesis-driven endpoint hunts with Velociraptor against real data, confirm with evidence,
> and turn findings into detections."

## Automate & own it
**Required.** Package your hunt as a reusable Velociraptor artifact / osquery pack (AI drafts, you
validate it returns the right evidence); commit it so the hunt is repeatable.

## Stretch
- Take a hunt that found nothing and turn it into a *scheduled* query so it runs continuously.
