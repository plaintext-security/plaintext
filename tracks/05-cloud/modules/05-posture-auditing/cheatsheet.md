---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Posture auditing with Prowler & ScoutSuite

*Companion to [Module 05 — Posture & Misconfiguration Auditing](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Prowler — run the scan (the linter for your account)

```bash
prowler aws                                   # scan the current AWS creds against all checks
prowler aws --profile audit                   # use a named profile
prowler aws --region us-east-1 eu-west-1      # limit regions (faster, cheaper)
prowler gcp | prowler azure | prowler kubernetes   # other providers, same tool
```

## Prowler — filter 400 findings into a triage queue

```bash
prowler aws --severity critical high          # only the ones worth looking at first
prowler aws --status FAIL                      # hide the PASSes — see only violations
prowler aws --service s3 iam                    # scope to services (public-bucket hunt)
prowler aws --check s3_bucket_public_access     # one specific check by id
prowler aws --compliance cis_3.0_aws            # run a named benchmark (CIS L1/L2)
prowler aws --list-checks                        # every check id available
prowler aws --list-compliance                     # every compliance framework available
```

## Prowler — machine-readable output for the pipeline

```bash
prowler aws --output-formats json-ocsf csv html   # -M is the old alias
# artifacts land in ./output/ ; parse the JSON to build the triage queue:
prowler aws --status FAIL --output-formats json-ocsf
jq '.[] | select(.severity=="Critical") | {check:.metadata.event_code, res:.resources[0].uid}' \
  output/*.ocsf.json
```

## Triage — the actual job (not running the tool)

```
priority  =  severity  ×  exploitability  ×  blast radius     (with asset context the tool CAN'T have)

  public S3 bucket + regulated data + internet-reachable   → the 2017 wave, whatever label it got
  MEDIUM finding on a throwaway sandbox                     → noise
  "stale" IAM key                                          → is it stale, or serving a live service?
```

- Map each finding to its **CIS control id** (rationale + fix) and to **ATT&CK** (a public bucket →
  **T1530** Data from Cloud Storage; a valid-account finding → **T1078**).

## Suppress consciously — never as the default clear

```bash
# a mutelist/allowlist is a DOCUMENTED decision with a rationale, not a way to hide the noise
prowler aws --mutelist-file mutelist.yaml
```

```yaml
# mutelist.yaml — suppress a known-accepted sandbox finding, with a reason in the comment
Mutelist:
  Accounts:
    "111122223333":
      Checks:
        "s3_bucket_public_access":
          Regions: ["us-east-1"]
          Resources: ["sandbox-demo-bucket"]   # accepted: public demo assets, no PII — reviewed 2026-07
```

## ScoutSuite — the second opinion (different blind spots)

```bash
scout aws                                      # collect + render an HTML report
scout aws --profile audit
scout aws --report-dir ./scout-report          # open scoutsuite-results/*.html in a browser
scout gcp --user-account | scout azure --cli   # other providers
```

- Two linters, different coverage: note where ScoutSuite surfaces something Prowler missed and vice
  versa — neither is complete on its own.

## Verify — remediation isn't done until FAIL → PASS

```bash
# 1. apply the fix (Terraform apply, or an awslocal one-liner for the seeded account)
# 2. RE-SCAN the single check and watch it flip:
prowler aws --check s3_bucket_public_access --status FAIL     # should now return nothing
# 3. freeze it: the verified check is the guardrail that fails the moment the fix regresses
```

## Gotchas worth remembering

- **Running the scanner is one command; the value is entirely in triage.** A 400-line report you
  treat line-by-line drowns the one finding that matters under 380 that don't.
- **The tool's severity stamp is a guess.** A MEDIUM on regulated, internet-reachable data outranks a
  HIGH on a sandbox — only *you* know which resource holds what and who can reach it.
- **Closing all 400 and suppressing the noisy rule are both wrong.** Suppression is a conscious,
  documented decision with a written rationale — never the default way to make a finding disappear.
- **Triage without verification is a wish.** "I'll fix the public bucket" is not done until the
  re-scan flips FAIL→PASS on that exact check. That flip is the seed of the CI guardrail (Module 06).
- **Run two scanners.** Prowler and ScoutSuite have different blind spots; the finding one misses is
  often the one that matters, and cross-checking is cheap.

> Only scan accounts you own or have explicit written permission to assess.
