# Lab 15 — Build a Response Playbook (Track Capstone)

## Setup
Docker-first — [Shuffle](https://github.com/Shuffle/Shuffle) (its docker-compose), wired to your SIEM
(module 06), MISP (module 14), and TheHive (module 13).

## Scenario
**This is the Track 02 capstone.** Take a real alert and automate the response — enrich, decide,
ticket/contain — with a human in the loop and an AI triage step you own.

## Do
1. [ ] Define the trigger: a real alert from your detections (modules 08–09) lands in the playbook.
2. [ ] Enrich it automatically: query your threat intel (module 14) and add context.
3. [ ] Add a decision step — optionally an AI triage ("is this worth a human?") — and route accordingly.
4. [ ] Act: open a case/ticket (TheHive) automatically, and gate any *containment* action behind a
   human approval.
5. [ ] Run the whole pipeline on a real alert end to end.

## Success criteria — you're done when
- [ ] An alert flows trigger → enrich → decide → ticket without manual steps.
- [ ] Any containment action requires explicit human approval.
- [ ] You can explain where AI is used, what it decides, and why a human gates the rest.

## Deliverables
`soar-playbook.md` + the exported playbook — the **Track 02 capstone**: an incident handled
alert→root-cause with an automated enrich → contain → ticket step (and the human kept in command).

## AI acceleration
The AI triage step *is* the lab — and you own its failure modes. Test it on known true and false
positives; put it where it accelerates, not where its mistake auto-contains production. AI authors the
workflow; you design the guardrails.

## Connects forward
This capstone integrates the whole track — and the SOAR + AI pattern is exactly what Track 12
(AI-Augmented Ops) builds on with MCP and RAG.

## Marketable proof
> "I build SOAR playbooks that automate alert enrichment, AI-assisted triage, ticketing, and gated
> containment — human-in-the-loop — tying telemetry, detection, and intel into one response."

## Automate & own it
**Required.** The playbook *is* the artifact — commit it as exportable workflow-as-code, with a written
note on where the human gate sits and why. This is the track's automation capstone.

## Stretch
- Add a local-model (Ollama) triage step for high-volume alerts and a frontier-model step for the hard
  calls — the hybrid pattern Track 12 formalises.
