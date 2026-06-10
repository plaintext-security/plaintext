# Glossary

Plain-language definitions of terms that recur across the tracks. Each is the practitioner's
working definition, not a dictionary entry — enough to keep reading without breaking stride.

## Foundations & concepts
- **CIA triad** — Confidentiality, Integrity, Availability: the three properties security exists to
  protect. A lens for reasoning about what a control actually defends, not a checklist.
- **Authentication vs. authorization** — *authn* is proving who you are; *authz* is what you're
  allowed to do. Conflating them is the root of most broken-access-control bugs.
- **Threat model** — a structured answer to "what are we defending, against whom, and how could it
  fail." STRIDE is one framework for enumerating the "how."
- **Defense in depth** — overlapping controls so no single failure is fatal.
- **Least privilege** — grant the minimum access needed, nothing more; the default posture everywhere.

## Offense
- **Reconnaissance** — gathering information about a target before attacking (passive: no contact;
  active: probing).
- **Enumeration** — turning "a host exists" into "this service, this version, these users."
- **Exploit / payload** — the exploit triggers a flaw; the payload is what runs once it does.
- **Privilege escalation** — going from limited access to higher (user → root/SYSTEM/Domain Admin).
- **Lateral movement / pivoting** — using one foothold to reach other systems on the network.
- **C2 (command and control)** — the channel an attacker uses to control compromised hosts.
- **Living off the land (LOLBins)** — abusing tools already on the system (PowerShell, certutil) so
  nothing obviously malicious lands on disk.
- **CVE / KEV** — a CVE is a catalogued vulnerability (by ID); CISA's KEV is the list of CVEs *known
  to be actively exploited* — your patch-priority signal.

## Defense
- **Telemetry** — the logs and events systems emit; the raw material of detection.
- **SIEM** — a system that centralises telemetry and runs detections over it (Elastic, Splunk, Wazuh).
- **Detection-as-code** — detections written, version-controlled, and tested like software (e.g. Sigma).
- **Sigma** — a vendor-neutral detection rule format you `convert` to your SIEM's query language.
- **True/false positive, false negative** — TP: real threat caught; FP: benign flagged as bad; FN:
  real threat missed. Tuning trades these off.
- **Threat hunting** — proactively searching telemetry for threats no rule has alerted on.
- **MITRE ATT&CK** — a catalogue of real adversary techniques (T-numbers); the shared map for
  coverage, hunting, and reporting.
- **IOC (indicator of compromise)** — an artifact (hash, IP, domain) that signals an intrusion.

## Cloud, identity & infra
- **IAM** — Identity and Access Management: who (principals) can do what (permissions) to which
  resources. The control plane of the cloud.
- **Security group** — a cloud instance's stateful firewall rules (the cloud version of host firewall rules).
- **IaC (infrastructure as code)** — defining infrastructure in version-controlled files (Terraform/OpenTofu).
- **Posture / misconfiguration auditing** — scanning a cloud account for insecure settings (Prowler, ScoutSuite).
- **Zero Trust / ZTNA** — never trust by network location; verify identity + device for every request.
- **PKI** — Public Key Infrastructure: certificate authorities, certs, and trust chains behind TLS.

## AI & automation
- **LLM** — large language model (the engine behind AI assistants).
- **RAG (retrieval-augmented generation)** — grounding an LLM's answers in your own documents/data.
- **MCP (Model Context Protocol)** — an open standard for giving AI tools/assistants structured access
  to data and actions (e.g. a SOC copilot that can query your telemetry).
- **The Plaintext AI posture** — *AI authors → you review → you own it.* Use AI to go faster; never
  ship what you can't verify and reproduce yourself.

## Labs & this curriculum
- **Reference lab** — a one-command containerised environment (`make up`/`demo`/`reset`/`down`) bundled
  in `plaintext-labs`.
- **Capstone** — the portfolio-worthy build that integrates a whole track.
- **Completion receipt** — the signed JSON `make grade` emits on a pass; your verifiable proof of work.
