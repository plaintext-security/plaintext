---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Cloud Logging & Detection

*Companion to [Module 15 — Cloud Logging & Detection](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## CloudTrail — pull events

```bash
# Look up recent MANAGEMENT events (last 90 days, no trail needed)
aws cloudtrail lookup-events --max-results 50

# Filter by a specific API call
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=CreateUser

# Filter by the principal that acted
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=Username,AttributeValue=dev-alice

# Filter by resource, and bound the window
aws cloudtrail lookup-events \
  --lookup-attributes AttributeKey=EventName,AttributeValue=AssumeRole \
  --start-time 2026-07-01T00:00:00Z --end-time 2026-07-11T00:00:00Z

# Dump raw event JSON to a file to parse offline (CloudTrailEvent is a JSON *string*)
aws cloudtrail lookup-events --max-results 500 > events.json
```

`lookup-events` only sees **management** events. **Data** events (`s3:GetObject`,
`dynamodb:GetItem`, `lambda:Invoke`) are off by default — you read those from the
trail's S3 delivery, not from `lookup-events`.

## Parse CloudTrail with jq

```bash
# CloudTrail log files: newline of gzipped JSON with a top-level .Records[]
cat trail-log.json | jq '.Records[] | .eventName'

# Who did what, from where — the triage triple
jq -r '.Records[] | [.eventName, .userIdentity.arn, .sourceIPAddress] | @tsv' trail-log.json

# lookup-events wraps the real event in a JSON *string* — parse it back out
jq -r '.Events[].CloudTrailEvent | fromjson | .eventName' events.json

# Count events by name — the cheapest anomaly sweep
jq -r '.Records[].eventName' trail-log.json | sort | uniq -c | sort -rn

# Isolate one principal's actions (assumed-role sessions)
jq '.Records[] | select(.userIdentity.arn | test("dev-alice"))' trail-log.json

# Non-AWS source IPs (drop the aws-internal calls)
jq -r '.Records[] | select(.sourceIPAddress | test("amazonaws.com") | not)
       | .sourceIPAddress' trail-log.json | sort -u

# Find the escalation move: admin user created, policy attached
jq '.Records[] | select(.eventName=="AttachUserPolicy" or .eventName=="CreateUser")' trail-log.json
```

Useful `userIdentity` fields: `.type` (IAMUser/AssumedRole/Root), `.arn`,
`.accessKeyId`, `.sessionContext.sessionIssuer.arn` (the role behind an assumed session).

## Sigma rule for CloudTrail

```yaml
title: AWS Root Console Login
id: 7c8b...              # a UUID
status: experimental
logsource:
  product: aws
  service: cloudtrail    # the two lines that scope a rule to CloudTrail
detection:
  selection:
    eventSource: signin.amazonaws.com
    eventName: ConsoleLogin
    userIdentity.type: Root
  condition: selection
falsepositives:
  - Break-glass root use (should be rare and pre-announced)
level: high
```

```yaml
# Selection matches a value; filter subtracts known-benign noise (the tuning step)
detection:
  selection:
    eventName: CreateUser
  filter:
    userIdentity.arn|contains: 'role/terraform-ci'   # IaC creates users legitimately
  condition: selection and not filter
```

```bash
# Convert a Sigma rule to a backend query with the sigma CLI
sigma convert -t opensearch_lucene -p ecs_cloudtrail my_rule.yml
sigma convert -t splunk my_rule.yml
```

## Gotchas worth remembering

- **Management plane is free and on; data plane is dark by default.** `AssumeRole`,
  `CreateUser`, `PutBucketPolicy` log for free. `s3:GetObject` (the LastPass/Capital One
  exfil move) is a **data event** — off by default, billed, high-volume — so if you didn't
  explicitly enable data events on that bucket, the read simply isn't in the log to detect.
- **`lookup-events` is not your detection source.** It's read-only, management-only, and
  90-day-bounded. Real detection reads the trail's S3/CloudWatch delivery. Don't build a
  pipeline on `lookup-events`.
- **Precision, not recall, is the product.** `alert on any CreateUser` fires on the attack
  *and* on every Terraform run — muted by week two, it's zero coverage. Tune with a `filter`
  against benign principals until it fires on the attack and *not* the noise.
- **Chain individually-benign events; don't alert on one.** A lone `GetObject` or
  `AssumeRole` is meaningless. High fidelity comes from the *sequence* (assume-role →
  create-user → attach-admin) or volume/velocity, not a single event name.
- **`CloudTrailEvent` from `lookup-events` is a JSON string, not an object** — you must
  `fromjson` it in jq before you can select on `.eventName`, `.sourceIPAddress`, etc.
- **Assumed-role events hide the human.** `.userIdentity.arn` shows the session; the actual
  role is in `.sessionContext.sessionIssuer.arn`. Pivot on the access key to correlate a
  stolen credential across services.

> Only analyze logs from accounts you own or are authorized to investigate.
