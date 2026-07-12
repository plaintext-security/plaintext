# Cheat sheet — Detecting Host Compromise

*Companion to [Module 10 — Detecting Host Compromise](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## sigma-cli — install and inspect

```bash
pip install sigma-cli                    # the CLI (module `sigma`, command `sigma`)
sigma plugin list                        # available backends/pipelines and install state
sigma plugin install splunk              # add a backend before you can convert to it
sigma plugin install elasticsearch
sigma list targets                       # backends you can convert TO (-t)
sigma list pipelines                     # field-mapping pipelines you can apply (-p)
sigma list formats -t splunk             # output formats a backend supports (-f)
```

## Converting a Sigma rule to a backend

```bash
sigma convert -t splunk rules/credaccess-lsass.yml            # → SPL
sigma convert -t elasticsearch -f dsl_lucene rules/*.yml      # → Elastic (pick a format)
sigma convert -t splunk -p sysmon rules/persistence-runkey.yml # apply a pipeline (field map)
sigma convert -t splunk --without-pipeline rules/lat-svc.yml   # raw fields, no remap (lab proof)
```

- `-t` = target backend, `-p` = pipeline (generic field → your SIEM's field), `-f` = output format.

## A Sigma rule skeleton (windows / sysmon)

```yaml
title: LSASS Handle Access (credential dumping)
id: 0e7163d4-...              # a UUID, one per rule
status: experimental          # experimental | test | stable | deprecated
logsource:
  product: windows
  category: process_access    # or service: sysmon / category: registry_set
detection:
  selection:
    EventID: 10
    TargetImage|endswith: '\lsass.exe'
  condition: selection        # combine with `and`/`or`/`not`/`1 of ...`
level: high                   # informational | low | medium | high | critical
tags:
  - attack.credential_access
  - attack.t1003.001          # LSASS memory — map every rule to ATT&CK
```

- Lab phases: Run-key persistence `EventID: 13` + `TargetObject|contains: '\CurrentVersion\Run'`
  (T1547.001); LSASS `EventID: 10` (T1003.001); remote service install `EventID: 7045` on the
  `System` channel (T1021.002 / T1543.003).

## Wazuh custom rules — `/var/ossec/etc/rules/local_rules.xml`

```xml
<group name="local,sysmon,">
  <rule id="100210" level="12">
    <if_sid>61603</if_sid>                    <!-- chain off a Sysmon base rule for context -->
    <field name="win.eventdata.targetImage">lsass\.exe</field>
    <match>GrantedAccess</match>
    <description>Possible credential dumping: handle opened to LSASS</description>
    <mitre>
      <id>T1003.001</id>
    </mitre>
  </rule>
</group>
```

- `<match>` = substring; `<regex>` = OSSEC regex; `<field name>` matches a decoded field.
- `<if_sid>` (a specific rule) or `<if_group>` chains rules so context/severity build up.

## Wazuh custom decoders — `/var/ossec/etc/decoders/local_decoder.xml`

```xml
<decoder name="myapp">
  <prematch>^MyApp: </prematch>
  <regex offset="after_prematch">user=(\S+) src=(\S+)</regex>
  <order>srcuser, srcip</order>              <!-- name the captured fields -->
</decoder>
```

## Test before you deploy

```bash
/var/ossec/bin/wazuh-logtest              # paste a raw log line; shows decoder + rule that fires
# older builds: /var/ossec/bin/ossec-logtest
systemctl restart wazuh-manager           # reload rules/decoders after editing
```

## Gotchas worth remembering

- **Sigma is backend-agnostic; the pipeline does the translation.** A rule uses generic field names —
  `-p sysmon`/`-p ecs_windows` remaps them to your SIEM's schema. Convert `--without-pipeline` and the
  raw field names may not match anything in the target log store.
- **A rule that converts is not a rule that fires.** `sigma convert` only proves the syntax is valid.
  Run it against real events (the lab's `detect.py` / your sample JSON): does it match the malicious
  event *and* stay quiet on the benign ones? Test data, not the model, tells you the logic is right.
- **Wazuh custom rules live at id 100000+.** IDs below that belong to the shipped ruleset — reuse one
  and an upgrade clobbers your rule or yours clobbers a built-in. Higher `level` = higher severity.
- **Always `wazuh-logtest` a rule before restarting the manager.** A malformed `local_rules.xml` can
  stop the manager from loading its whole ruleset — one bad `<field>` silences everything.
- **Rule count is vanity; ATT&CK coverage is the metric.** Map every rule to a technique and report the
  gap ("83% of Credential Access, these named gaps"), not "we have 200 rules."
- **Treat detections as code.** Version-control the `rules/` directory, test each rule against known-bad
  and known-good telemetry in CI, and review changes — the detection-as-code discipline from Track 02.
