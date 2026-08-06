---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Data, the Last Pillar (OPA classification / Sigma volume)

*Companion to [Module 14 — Data, the Last Pillar](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-08*

## Run the lab

```bash
cd plaintext-labs/ztna/14-data-pillar
make up        # start the OPA server + build the sigma/detect.py image
make demo      # PART 1: label-based decisions · PART 2: bulk-read detection
make test      # opa test over data/policies/
make check     # the committed regression gate (check-data.sh)
make down
```

## Label-based authorization — query it yourself

```bash
# One-off eval: make eval POLICY=<path> INPUT=<path>
make eval POLICY=data/policies/data-classification.rego INPUT=data/inputs/analyst-read-restricted.json

# Or, direct against the running opa-lab service:
docker compose run --rm opa-lab eval \
  --input /lab/data/inputs/analyst-read-restricted.json \
  --data /lab/data/policies/data-classification.rego \
  "data.corp.data.allow"                       # false
docker compose run --rm opa-lab eval \
  --input /lab/data/inputs/analyst-read-restricted.json \
  --data /lab/data/policies/data-classification.rego \
  "data.corp.data.deny"                        # true  <- the must-deny proof

# The fail-closed proof: an UNLABELED record must resolve to restricted, never public.
docker compose run --rm opa-lab eval \
  --input /lab/data/inputs/analyst-read-unlabeled.json \
  --data /lab/data/policies/data-classification.rego \
  "data.corp.data.effective_classification"    # "restricted"
```

The policy, in one screen:

```
default allow := false
default effective_classification := "restricted"   # <- the load-bearing line

effective_classification := input.record.classification if {
    input.record.classification in {"public", "internal", "restricted"}
}

allow if { effective_classification == "public" }
allow if { effective_classification == "internal"; <role in analyst/auditor/data-officer/admin> }
allow if { effective_classification == "restricted"; <role in data-officer/admin> }

deny if { effective_classification == "restricted"; not <role in data-officer/admin> }
```

## Detecting bulk-restricted reads — query it yourself

```bash
# Run the shipped rule against the shipped log
make detect RULE=examples/zt-bulk-restricted-read.yml
# -> exactly 8 [HIT] lines, all session_id=sess_D2; sess_D1 stays silent

# Compile to a real backend (best-effort — logsource has no stock pipeline)
make convert RULE=examples/zt-bulk-restricted-read.yml
```

The rule's `detection` block, in one screen:

```yaml
detection:
  selection:
    event_type: "access_allowed"
    classification: "restricted"
  condition: selection | count() by session_id > 5   # volume, not identity or geography
```

`detect.py` implements exactly three condition forms: `selection`, `selection and not filter` (Module
09's shape), and `selection | count() by <field> > <N>` (this module's addition — groups the
selection-matching events by `<field>` and fires only for groups over the threshold).

## Tune the threshold both ways — don't just trust one number

```bash
# too loose: misses the real burst (0 hits)
sed 's/> 5/> 10/' examples/zt-bulk-restricted-read.yml > /tmp/loose.yml
make detect RULE=/tmp/loose.yml

# too tight: flags ordinary work too (11 hits, both sessions)
sed 's/> 5/> 2/' examples/zt-bulk-restricted-read.yml > /tmp/tight.yml
make detect RULE=/tmp/tight.yml
```

A threshold you haven't watched fail in both directions is a guess, not a decision.

## The break-it-to-prove-it move (fail-closed)

```rego
# Change this one line in data-classification.rego:
default effective_classification := "restricted"
# to:
default effective_classification := "public"
```

Re-run the `effective_classification` and `allow` evals above against
`data/inputs/analyst-read-unlabeled.json`. **Watch** the unlabeled record become `"public"` /
`allow: true` — then restore the line and confirm it's `"restricted"` / `deny: true` again. A fail-closed
default you have only ever seen working was never actually proven.

## Gotchas worth remembering

- **Unlabeled is not ungoverned.** A record with a missing or unrecognized `classification` must resolve
  to the *most* restrictive tier, never the least. `default effective_classification := "restricted"` is
  the one line that decides this — get it backwards and every migration gap becomes a silent grant.
- **Case-sensitive labels bite exactly like a missing label.** `"Restricted"` (capital R) is not the same
  string as `"restricted"` to Rego — it fails closed too, for the same reason, not by accident.
- **`deny == true` proves more than `allow == false`.** Query the deny decision explicitly — the same
  discipline as Module 08's auditor/`/export` deny.
- **OPA and Sigma do different jobs — don't ask one to do the other's.** OPA authorizes ONE request from
  role + classification; it cannot see volume. Sigma sees volume across a session; it cannot block the
  next request in real time on its own (see the lab's Stretch section for wiring them together).
- **Volume beats identity/geography as this module's signal.** The bulk-read rule ignores country, device,
  and time of day on purpose — a stolen-but-valid credential (Snowflake, 2024) often matches all three of
  the legitimate account's usual values.
- **A DLP/CASB/CMK control is a design until you've stood it up.** Label CASB, DLP-egress, tokenization,
  CMK/BYOK, and data-residency mappings *assessed*, never *demonstrated*, unless you actually deployed
  one — same honesty as Module 03's device-posture policy.
