---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Log & Cloud Forensics

*Companion to [Module 10 — Log & Cloud Forensics](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Hayabusa — fast Sigma triage over EVTX

```bash
hayabusa csv-timeline -d logs/ -o timeline.csv      # scan a dir of .evtx → severity-ranked CSV
hayabusa json-timeline -d logs/ -o timeline.json    # JSON for further tooling / AI review
hayabusa csv-timeline -f Security.evtx -o out.csv   # -f a single file
hayabusa update-rules                                # pull the latest Sigma/Hayabusa rules
hayabusa csv-timeline -d logs/ --min-level high -o out.csv   # only high+ severity
```

- Hayabusa is the **initial triage heat map** — hundreds of thousands of events to a ranked timeline
  in seconds. Sort the output by level and time and start pivoting.

## Chainsaw — hunt + structured field search

```bash
chainsaw hunt logs/ -s sigma/ --mapping mappings/sigma-event-logs-all.yml --csv --output out/
chainsaw search logs/ -t 'Event.EventData.SubjectUserName: =dev-svc01'   # drill on one account
chainsaw search logs/ -e 4720 --json                 # search by event ID
```

- Chainsaw is the **hypothesis-driven pass**: once Hayabusa tells you *where* to look, `search` by
  account/technique. Running both costs little and widens coverage.

## CloudTrail — the fields that matter

```
userIdentity        who (type: IAMUser / AssumedRole / Root; arn, accessKeyId)
eventName           the API call: CreateUser, AttachUserPolicy, AssumeRole, RunInstances
eventSource         the service: iam.amazonaws.com, s3.amazonaws.com
eventTime           UTC timestamp
sourceIPAddress     origin of the call
requestParameters / responseElements   the arguments and results
errorCode           AccessDenied etc. — failed attempts are signal too
```

## CloudTrail + jq — trace a compromised credential forward

```bash
# All calls made by one access key, in time order
jq -r '.Records[] | select(.userIdentity.accessKeyId=="AKIA...")
       | [.eventTime,.eventName,.sourceIPAddress] | @tsv' trail.json | sort

# Privilege-escalation / persistence API calls
jq -r '.Records[] | select(.eventName|test("CreateUser|AttachUserPolicy|CreateAccessKey|AssumeRole|PutUserPolicy"))
       | [.eventTime,.userIdentity.arn,.eventName] | @tsv' trail.json | sort

# Count activity per source IP (spot the attacker's IP)
jq -r '.Records[].sourceIPAddress' trail.json | sort | uniq -c | sort -nr

# Every new principal this identity created
jq -r '.Records[] | select(.eventName=="CreateUser")
       | [.eventTime,.requestParameters.userName] | @tsv' trail.json
```

- The attack graph **is** the event sequence: start at the first call from the compromised key, trace
  forward through every action, then every principal it created and every role it assumed.

## Gotchas worth remembering

- **Cloud incidents often leave no disk** — the instance terminated, the function was serverless. The
  *log is the evidence*; a responder who can only work from disk images is stranded.
- **Logs exist only if enabled before the incident.** CloudTrail keeps management events ~90 days by
  default, but **data events** (S3 GetObject, Lambda invokes) are *off* by default. "We'll just check
  CloudTrail" assumes someone turned the right thing on and forwarded it to a tamper-evident archive.
- **CloudTrail logs the *API call*, not host activity.** It's what the API was *asked* to do — a
  different mental model from an endpoint log. `errorCode` rows (AccessDenied) show attempted, denied
  moves and are often the clearest signal of probing.
- **Hayabusa for speed, Chainsaw for drilling.** Triage with Hayabusa, then hunt specific
  accounts/techniques with Chainsaw's field search. They're complementary, not redundant.
- **Verify every AI-identified event against the raw JSON.** Models hallucinate from event *names*
  without reading the field values, and miss events that need operational context.
