---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Detection-as-Code (Sigma)

*Companion to [Module 08 — Detection-as-Code](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Sigma rule anatomy

```yaml
title: Encoded PowerShell From Office            # short, human, unique
id: 0f7a...                                       # a UUID — one per rule, stable forever
status: experimental                              # experimental | test | stable
description: Office application spawning encoded PowerShell (macro dropper).
references:
  - https://attack.mitre.org/techniques/T1059/001/
author: you
date: 2026-07-11
logsource:                                        # WHERE to look
  product: windows
  category: process_creation
detection:                                        # WHAT to match
  selection:
    ParentImage|endswith: '\WINWORD.EXE'
    Image|endswith: '\powershell.exe'
    CommandLine|contains: '-enc'
  condition: selection                            # the boolean over the blocks
falsepositives:
  - Rare legitimate signed add-ins
level: high                                        # informational | low | medium | high | critical
tags:
  - attack.execution
  - attack.t1059.001                               # ALWAYS map to ATT&CK
```

## The detection block — selections & condition

```yaml
detection:
  selection_img:
    Image|endswith: '\powershell.exe'
  selection_cmd:
    CommandLine|contains:
      - 'DownloadString'
      - 'IEX'
  filter_admin:
    User|contains: 'svc_patch'
  condition: selection_img and selection_cmd and not filter_admin
```

Field-name **modifiers** (piped after the field):

```
|contains  |startswith  |endswith  |all       # string matching
|re                                            # value is a regex
|base64  |base64offset                         # match the base64 of the value
|windash                                        # tolerate - / – dash variants in flags
```

`condition` keywords: `and or not`, `1 of selection_*`, `all of selection_*`, `( … )`.

## Convert with sigma-cli

```bash
pip install sigma-cli
sigma plugin list                                # available backends
sigma plugin install splunk                      # add a backend (elasticsearch, sentinel, ...)

sigma convert -t splunk rule.yml                 # → Splunk SPL
sigma convert -t elasticsearch -f dsl_lucene rule.yml   # -f = output format for the backend
sigma convert -t splunk rules/                   # convert a whole directory
sigma check rule.yml                             # validate structure before converting
```

(The older `sigmac -t splunk -c splunk-windows rule.yml` is the legacy converter you may still see.)

## The CI gate — what makes it detection-as-code

```
rule (file in git) → pull request → CI:
  1. sigma check           (valid structure?)
  2. fires on known-bad?   (run vs. real attack telemetry — must alert)
  3. quiet on known-good?  (run vs. benign baseline — must NOT alert)
  → all green → merge → live
```

## Gotchas worth remembering

- **The skill is testing, not YAML.** An AI drafts a logically-valid rule in seconds — one that matches the wrong field, misses an obvious variant, or fires on every 2 a.m. backup. It's still a liability until tested.
- **Two corpora, non-negotiable.** Known-bad proves it *catches* the thing; known-good proves it won't *bury* the SOC. A rule tested against only one is half-done.
- **Sigma is the intermediate representation; each SIEM is a compile target.** Write the logic once against the generic log model, convert to SPL/DSL/KQL. That portability is the entire value over writing the query directly.
- **Field names are backend-specific under the hood.** Sigma's `Image`/`CommandLine` come from a *field mapping* the backend supplies. A converted query that "runs but never matches" usually means the mapping (pipeline) is missing or wrong.
- **Every rule names its ATT&CK technique.** The only question leadership asks is "what can't we see?" — you can answer it only if detections are mapped. Untagged rules are invisible to coverage.
- **Start from SigmaHQ, don't invent from blank.** Thousands of peer-reviewed rules exist; most of the job is reading and adapting prior art in `rules/windows/process_creation/`.
