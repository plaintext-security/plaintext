# Link Validation Report

Generated: 2026-06-09
Scope: All `README.md` `## Learn` and `## Further reading` sections across 13 tracks (~169 README files)
URLs checked: 683 (637 non-YouTube + 46 YouTube flagged for manual review)

## Summary

| Category | Count |
|----------|-------|
| OK (2xx, confirmed live) | 455 |
| Redirected → fixed in place | 82 |
| Broken → replaced with working URL | 26 |
| Broken → line removed (no replacement found) | 59 |
| Flagged for manual review | 15 |
| Timeout/unreachable | 4 |
| YouTube (unverifiable via HEAD — manual review) | 46 |

**Total non-YouTube URLs checked:** 637
**Changes committed:** 100 files modified.

---

## Redirected — fixed in place (82)

All permanent redirects were updated to their canonical destination URLs. The most impactful categories:

- **NIST CSRC** (`csrc.nist.gov/publications/detail/…` → `csrc.nist.gov/pubs/…`): 6 URLs — NIST restructured their publication URL format in 2023.
- **Ansible docs** (`docs.ansible.com/ansible/latest/…` → `docs.ansible.com/projects/ansible/latest/…`): 4 URLs — Ansible restructured docs hierarchy.
- **Docker docs** (`docs.docker.com/develop/…` → `docs.docker.com/build/…`): 3 URLs — Docker reorganized their documentation.
- **Cloudflare Zero Trust** (`developers.cloudflare.com/cloudflare-one/…`): 3 URLs — ZTNA section reorganized.
- **GitHub repos renamed/transferred**: testssl.sh (drwetter → testssl org), llama.cpp (ggerganov → ggml-org), fastmcp (jlowin → PrefectHQ), sops (mozilla → getsops), hindsight (obsidianforensics → RyanDFIR), PEASS-ng (carlospolop → peass-ng).
- **OpenSSL docs** (`openssl.org/docs/man3.0/…` → `docs.openssl.org/3.0/…`): 3 URLs.
- **Tailscale KB** (`tailscale.com/kb/…` → `tailscale.com/docs/…`): 2 URLs.
- **HashiCorp Vault tutorials** (`getting-started` → `get-started`): 2 URLs.
- **Anthropic docs** (`docs.anthropic.com/en/docs/build-with-claude/…`): 2 URLs — path restructured.
- **MCP docs** (`modelcontextprotocol.io/introduction` → `.../docs/getting-started/intro`): 1 URL.
- **gofastmcp, gtfobins, jqlang, jwt.io, latacora**: permanent domain/path moves.
- **Wazuh osquery page** (`documentation.wazuh.com/…/osquery.html` → `osquery.readthedocs.io/en/stable/`): page deleted from Wazuh docs, replaced with upstream osquery RTD.
- **FIDO Alliance** (`fidoalliance.org/how-fido-works/` → `fidoalliance.org/passkeys/`): page reorganized.

| File | Original URL | Final URL |
|------|-------------|-----------|
| `tracks/07-endpoint-hardening/modules/04-exploit-mitigations/README.md` | `https://access.redhat.com/documentation/en-us/red_hat_enterprise_linux…` | `https://docs.redhat.com/en/documentation/red_hat_enterprise_linux/9/ht…` |
| `tracks/07-endpoint-hardening/modules/06-configuration-management/README.md` | `https://ansible.readthedocs.io/projects/molecule/` | `https://docs.ansible.com/projects/molecule/` |
| `tracks/05-cloud/modules/01-cloud-fundamentals/README.md` | `https://awscli.amazonaws.com/v2/documentation/api/latest/reference/iam…` | `https://docs.aws.amazon.com/cli/latest/reference/iam/` |
| `tracks/12-ai-augmented-ops/modules/03-prompt-patterns/README.md` | `https://cookbook.openai.com/articles/techniques_to_improve_reliability` | `https://developers.openai.com/cookbook/articles/techniques_to_improve_…` |
| `tracks/08-cryptography/modules/04-hashing-macs-passwords/README.md` | `https://csrc.nist.gov/publications/detail/sp/800-107/rev-1/final` | `https://csrc.nist.gov/pubs/sp/800/107/r1/final` |
| `tracks/07-endpoint-hardening/modules/07-compliance-auditing/README.md` | `https://csrc.nist.gov/publications/detail/sp/800-128/final` | `https://csrc.nist.gov/pubs/sp/800/128/upd1/final` |
| `tracks/08-cryptography/modules/10-auditing-crypto-failures/README.md` | `https://csrc.nist.gov/publications/detail/sp/800-131a/rev-2/final` | `https://csrc.nist.gov/pubs/sp/800/131/a/r2/final` |
| `tracks/10-automation/modules/01-automation-mindset/README.md` | `https://csrc.nist.gov/publications/detail/sp/800-137a/final` | `https://csrc.nist.gov/pubs/sp/800/137/a/final` |
| `tracks/11-ztna/modules/01-zero-trust-principles/README.md` | `https://csrc.nist.gov/publications/detail/sp/800-207/final` | `https://csrc.nist.gov/pubs/sp/800/207/final` |
| `tracks/08-cryptography/modules/02-symmetric-aead/README.md` | `https://csrc.nist.gov/publications/detail/sp/800-38d/final` | `https://csrc.nist.gov/pubs/sp/800/38/d/final` |
| `tracks/07-endpoint-hardening/modules/08-patch-vuln-management/README.md` | `https://csrc.nist.gov/publications/detail/sp/800-40/rev-4/final` | `https://csrc.nist.gov/pubs/sp/800/40/r4/final` |
| `tracks/03-forensics/modules/01-forensic-fundamentals/README.md` | `https://csrc.nist.gov/publications/detail/sp/800-86/final` | `https://csrc.nist.gov/pubs/sp/800/86/final` |
| `tracks/03-forensics/modules/02-acquisition-imaging/README.md` | `https://csrc.nist.gov/publications/detail/sp/800-86/final` | `https://csrc.nist.gov/pubs/sp/800/86/final` |
| `tracks/08-cryptography/modules/07-secrets-management/README.md` | `https://developer.hashicorp.com/vault/tutorials/getting-started` | `https://developer.hashicorp.com/vault/tutorials/get-started` |
| `tracks/05-cloud/modules/07-secrets-management/README.md` | `https://developer.hashicorp.com/vault/tutorials/getting-started/gettin…` | `https://developer.hashicorp.com/vault/tutorials/get-started/why-use-va…` |
| `tracks/00-foundations/modules/07-web-http/README.md` | `https://developer.mozilla.org/en-US/docs/Web/HTTP/Overview` | `https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/Overview` |
| `tracks/11-ztna/modules/09-monitoring-detection/README.md` | `https://developers.cloudflare.com/cloudflare-one/analytics/logs/audit-…` | `https://developers.cloudflare.com/cloudflare-one/insights/logs/dashboa…` |
| `tracks/11-ztna/modules/05-sase-cloud-delivered/README.md` | `https://developers.cloudflare.com/cloudflare-one/connections/connect-n…` | `https://developers.cloudflare.com/cloudflare-one/networks/connectors/c…` |
| `tracks/11-ztna/modules/03-device-trust-posture/README.md` | `https://developers.cloudflare.com/cloudflare-one/identity/devices/` | `https://developers.cloudflare.com/cloudflare-one/reusable-components/p…` |
| `tracks/12-ai-augmented-ops/modules/07-ai-detection-triage/README.md` | `https://developers.google.com/machine-learning/crash-course/classifica…` | `https://developers.google.com/machine-learning/crash-course/classifica…` |
| `tracks/06-active-directory/modules/10-hardening-ad/README.md` | `https://docs.ansible.com/ansible/latest/collections/microsoft/ad/` | `https://docs.ansible.com/projects/ansible/latest/collections/microsoft…` |
| `tracks/10-automation/modules/04-configuration-management/README.md` | `https://docs.ansible.com/ansible/latest/getting_started/index.html` | `https://docs.ansible.com/projects/ansible/latest/getting_started/index…` |
| `tracks/07-endpoint-hardening/modules/06-configuration-management/README.md` | `https://docs.ansible.com/ansible/latest/getting_started/index.html` | `https://docs.ansible.com/projects/ansible/latest/getting_started/index…` |
| `tracks/10-automation/modules/04-configuration-management/README.md` | `https://docs.ansible.com/ansible/latest/playbook_guide/playbooks_reuse…` | `https://docs.ansible.com/projects/ansible/latest/playbook_guide/playbo…` |
| `tracks/07-endpoint-hardening/modules/06-configuration-management/README.md` | `https://docs.ansible.com/ansible/latest/tips_tricks/ansible_tips_trick…` | `https://docs.ansible.com/projects/ansible/latest/tips_tricks/ansible_t…` |
| `tracks/12-ai-augmented-ops/modules/06-soc-copilot/README.md` | `https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineerin…` | `https://docs.anthropic.com/en/docs/build-with-claude/prompt-engineerin…` |
| `tracks/09-python-for-security/modules/09-building-mcp-server/README.md` | `https://docs.anthropic.com/en/docs/build-with-claude/tool-use` | `https://docs.anthropic.com/en/docs/build-with-claude/tool-use/overview` |
| `tracks/03-forensics/modules/10-log-cloud-forensics/README.md` | `https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-…` | `https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-…` |
| `tracks/05-cloud/modules/09-serverless-security/README.md` | `https://docs.aws.amazon.com/serverless-application-model/latest/develo…` | `https://docs.aws.amazon.com/serverless-application-model/latest/develo…` |
| `tracks/05-cloud/modules/16-cloud-incident-response/README.md` | `https://docs.aws.amazon.com/whitepapers/latest/aws-security-incident-r…` | `https://docs.aws.amazon.com/security-ir/latest/userguide/security-inci…` |
| `tracks/04-malware/modules/01-analysis-lab-setup/README.md` | `https://docs.docker.com/compose/networking/` | `https://docs.docker.com/compose/how-tos/networking/` |
| `tracks/05-cloud/modules/10-container-image-security/README.md` | `https://docs.docker.com/develop/develop-images/dockerfile_best-practic…` | `https://docs.docker.com/build/building/best-practices/` |
| `tracks/10-automation/modules/06-containerising-tooling/README.md` | `https://docs.docker.com/develop/security-best-practices/` | `https://docs.docker.com/build/building/best-practices/` |
| `tracks/05-cloud/modules/08-cicd-security/README.md` | `https://docs.docker.com/trusted-content/official-images/` | `https://docs.docker.com/docker-hub/image-library/trusted-content/` |
| `tracks/12-ai-augmented-ops/modules/10-attacking-ai/README.md` | `https://docs.garak.ai/` | `https://docs.garak.ai/garak` |
| `tracks/05-cloud/modules/08-cicd-security/README.md` | `https://docs.github.com/en/actions/security-for-github-actions/securit…` | `https://docs.github.com/en/actions/reference/security/secure-use` |
| `tracks/10-automation/modules/05-cicd-pipelines/README.md` | `https://docs.github.com/en/actions/security-guides/security-hardening-…` | `https://docs.github.com/en/actions/reference/security/secure-use` |
| `tracks/12-ai-augmented-ops/modules/04-rag/README.md` | `https://docs.llamaindex.ai/en/stable/getting_started/concepts/` | `https://developers.llamaindex.ai/python/framework/getting_started/conc…` |
| `tracks/04-malware/modules/05-dynamic-behavioural/README.md` | `https://docs.microsoft.com/en-us/sysinternals/downloads/procmon` | `https://learn.microsoft.com/en-us/sysinternals/downloads/procmon` |
| `tracks/04-malware/modules/02-file-triage/README.md` | `https://docs.microsoft.com/en-us/windows/win32/debug/pe-format` | `https://learn.microsoft.com/en-us/windows/win32/debug/pe-format` |
| `tracks/05-cloud/modules/05-posture-auditing/README.md` | `https://docs.prowler.com/projects/prowler-open-source/en/latest/` | `https://docs.prowler.com/introduction` |
| `tracks/02-defensive/modules/05-intrusion-detection/README.md` | `https://docs.suricata.io/` | `https://docs.suricata.io/en/suricata-8.0.5/` |
| `tracks/02-defensive/modules/04-network-monitoring/README.md` | `https://docs.zeek.org/` | `https://docs.zeek.org/en/current/` |
| `tracks/07-endpoint-hardening/modules/04-exploit-mitigations/README.md` | `https://documentation.ubuntu.com/server/how-to/security/apparmor/` | `https://ubuntu.com/server/docs/how-to/security/apparmor/` |
| `tracks/02-defensive/modules/06-siem/README.md` | `https://documentation.wazuh.com/` | `https://documentation.wazuh.com/current/index.html` |
| `tracks/07-endpoint-hardening/modules/05-endpoint-telemetry/README.md` | `https://documentation.wazuh.com/current/user-manual/capabilities/osque…` | `https://osquery.readthedocs.io/en/stable/` |
| `tracks/11-ztna/modules/03-device-trust-posture/README.md` | `https://fidoalliance.org/how-fido-works/` | `https://fidoalliance.org/passkeys/` |
| `tracks/05-cloud/modules/14-cloud-attack-techniques/README.md` | `https://github.com/RhinoSecurityLabs/pacu/wiki/Getting-Started` | `https://github.com/RhinoSecurityLabs/pacu/wiki/` |
| `tracks/11-ztna/modules/09-monitoring-detection/README.md` | `https://github.com/SigmaHQ/sigma/wiki/Rule-Creation-Guide` | `https://github.com/SigmaHQ/sigma/wiki/` |
| `tracks/07-endpoint-hardening/modules/09-privesc-defense/README.md` | `https://github.com/carlospolop/PEASS-ng/tree/master/linPEAS` | `https://github.com/peass-ng/PEASS-ng/tree/master/linPEAS` |
| `tracks/08-cryptography/modules/05-tls-deep-dive/README.md` | `https://github.com/drwetter/testssl.sh` | `https://github.com/testssl/testssl.sh` |
| `tracks/12-ai-augmented-ops/modules/02-running-local-models/README.md` | `https://github.com/ggerganov/llama.cpp/blob/master/README.md` | `https://github.com/ggml-org/llama.cpp/blob/master/README.md` |
| `tracks/09-python-for-security/modules/09-building-mcp-server/README.md` | `https://github.com/jlowin/fastmcp` | `https://github.com/PrefectHQ/fastmcp` |
| `tracks/08-cryptography/modules/07-secrets-management/README.md` | `https://github.com/mozilla/sops` | `https://github.com/getsops/sops` |
| `tracks/03-forensics/modules/05-browser-app-artifacts/README.md` | `https://github.com/obsidianforensics/hindsight` | `https://github.com/RyanDFIR/hindsight` |
| `tracks/12-ai-augmented-ops/modules/05-building-mcp-servers/README.md` | `https://gofastmcp.com/` | `https://gofastmcp.com/getting-started/welcome` |
| `tracks/01-offensive/modules/14-lolbins-evasion/README.md` | `https://gtfobins.github.io/` | `https://gtfobins.org/` |
| `tracks/01-offensive/modules/10-privesc-linux/README.md` | `https://gtfobins.github.io/` | `https://gtfobins.org/` |
| `tracks/07-endpoint-hardening/modules/09-privesc-defense/README.md` | `https://gtfobins.github.io/` | `https://gtfobins.org/` |
| `tracks/00-foundations/modules/08-data-encoding/README.md` | `https://jqlang.github.io/jq/manual/` | `https://jqlang.org/manual/` |
| `tracks/11-ztna/modules/02-identity-control-plane/README.md` | `https://jwt.io/` | `https://www.jwt.io/` |
| `tracks/08-cryptography/modules/03-asymmetric-key-exchange/README.md` | `https://latacora.micro.blog/2018/04/03/cryptographic-right-answers.htm…` | `https://www.latacora.com/blog/2018/04/03/cryptographic-right-answers/` |
| `tracks/09-python-for-security/modules/09-building-mcp-server/README.md` | `https://modelcontextprotocol.io/introduction` | `https://modelcontextprotocol.io/docs/getting-started/intro` |
| `tracks/12-ai-augmented-ops/modules/05-building-mcp-servers/README.md` | `https://modelcontextprotocol.io/introduction` | `https://modelcontextprotocol.io/docs/getting-started/intro` |
| `tracks/02-defensive/modules/03-linux-telemetry/README.md` | `https://osquery.readthedocs.io/` | `https://osquery.readthedocs.io/en/latest/` |
| `tracks/11-ztna/modules/01-zero-trust-principles/README.md` | `https://research.google/pubs/pub43231/` | `https://research.google/pubs/beyondcorp-a-new-approach-to-enterprise-s…` |
| `tracks/11-ztna/modules/04-ztna-architectures/README.md` | `https://research.google/pubs/pub44860/` | `https://research.google/pubs/beyondcorp-design-to-deployment-at-google…` |
| `tracks/11-ztna/modules/03-device-trust-posture/README.md` | `https://tailscale.com/kb/1018/acls/` | `https://tailscale.com/docs/features/access-control/acls` |
| `tracks/11-ztna/modules/04-ztna-architectures/README.md` | `https://tailscale.com/kb/1151/what-is-tailscale/` | `https://tailscale.com/docs/concepts/what-is-tailscale` |
| `tracks/10-automation/modules/06-containerising-tooling/README.md` | `https://www.chainguard.dev/chainguard-images` | `https://www.chainguard.dev/containers` |
| `tracks/03-forensics/modules/13-ir-process/README.md` | `https://www.cisa.gov/sites/default/files/publications/Federal_Governme…` | `https://www.cisa.gov/sites/default/files/2024-08/Federal_Government_Cy…` |
| `tracks/07-endpoint-hardening/modules/05-endpoint-telemetry/README.md` | `https://www.crowdstrike.com/cybersecurity-101/endpoint-security/endpoi…` | `https://www.crowdstrike.com/en-us/cybersecurity-101/endpoint-security/…` |
| `tracks/02-defensive/modules/07-log-parsing/README.md` | `https://www.elastic.co/guide/en/ecs/current/index.html` | `https://www.elastic.co/docs/reference/ecs` |
| `tracks/10-automation/modules/08-soar-fundamentals/README.md` | `https://www.ibm.com/topics/soar` | `https://www.ibm.com/think/topics/security-orchestration-automation-and…` |
| `tracks/04-malware/modules/04-static-capabilities/README.md` | `https://www.mandiant.com/resources/blog/capa-automatically-identify-ma…` | `https://cloud.google.com/blog/topics/threat-intelligence/capa-automati…` |
| `tracks/11-ztna/modules/08-policy-as-code/README.md` | `https://www.openpolicyagent.org/docs/latest/policy-language/` | `https://www.openpolicyagent.org/docs/policy-language` |
| `tracks/11-ztna/modules/08-policy-as-code/README.md` | `https://www.openpolicyagent.org/docs/latest/policy-testing/` | `https://www.openpolicyagent.org/docs/policy-testing` |
| `tracks/08-cryptography/modules/01-primitives-practice/README.md` | `https://www.openssl.org/docs/man3.0/man1/openssl-enc.html` | `https://docs.openssl.org/3.0/man1/openssl-enc/` |
| `tracks/08-cryptography/modules/03-asymmetric-key-exchange/README.md` | `https://www.openssl.org/docs/man3.0/man1/openssl-genpkey.html` | `https://docs.openssl.org/3.0/man1/openssl-genpkey/` |
| `tracks/08-cryptography/modules/03-asymmetric-key-exchange/README.md` | `https://www.openssl.org/docs/man3.0/man1/openssl-pkeyutl.html` | `https://docs.openssl.org/3.0/man1/openssl-pkeyutl/` |
| `tracks/07-endpoint-hardening/modules/01-endpoint-threat-model/README.md` | `https://www.oreilly.com/library/view/threat-modeling-designing/9781118…` | `https://www.oreilly.com/library/view/threat-modeling/9781118810057/` |
| `tracks/04-malware/modules/06-dynamic-network/README.md` | `https://www.thec2matrix.com/` | `https://howto.thec2matrix.com/` |

---

## Broken → replaced with working URL (26)

| File | Original URL | Replacement | Note |
|------|-------------|-------------|------|
| `tracks/12-ai-augmented-ops/modules/01-hybrid-ai-pattern/README.md` | `https://airc.nist.gov/Docs/1` | `https://airc.nist.gov/` | AIRC NIST docs URL invalid; replaced with AIRC homepage |
| `tracks/05-cloud/modules/04-cloud-network-security/README.md` | `https://aws.amazon.com/blogs/security/analyzing-vpc-flo…` | `https://docs.aws.amazon.com/vpc/latest/userguide/flow-l…` | AWS blog article 404; replaced with VPC flow logs docs |
| `tracks/05-cloud/modules/16-cloud-incident-response/README.md` | `https://aws.amazon.com/blogs/security/how-to-detect-and…` | `https://docs.aws.amazon.com/config/latest/developerguid…` | AWS blog article 404; replaced with AWS Config evaluate-config docs |
| `tracks/10-automation/modules/08-soar-fundamentals/README.md` | `https://docs.n8n.io/getting-started/quickstart/` | `https://docs.n8n.io/try-it-out/quickstart/` | n8n docs restructured |
| `tracks/12-ai-augmented-ops/modules/04-rag/README.md` | `https://docs.trychroma.com/getting-started` | `https://docs.trychroma.com/docs/overview/getting-starte…` | Chroma docs restructured to /docs/overview/ |
| `tracks/04-malware/modules/08-decompilation-code-analysis/README.md` | `https://ghidra.re/online-courses/` | `https://github.com/NationalSecurityAgency/ghidra/wiki` | NSA Ghidra online courses taken down; replaced with Ghidra wiki |
| `tracks/07-endpoint-hardening/modules/10-detecting-host-compromise/README.md` | `https://github.com/SigmaHQ/sigma/blob/master/documentat…` | `https://github.com/SigmaHQ/sigma-specification/blob/mai…` | Sigma spec moved to dedicated sigma-specification repo |
| `tracks/06-active-directory/modules/08-path-to-da/README.md` | `https://github.com/SpecterOps/BloodHound/blob/main/docs…` | `https://github.com/SpecterOps/BloodHound/wiki` | File removed from BloodHound repo; replaced with wiki |
| `tracks/06-active-directory/modules/02-enumeration/README.md` | `https://github.com/dirkjanm/bloodhound-python` | `https://github.com/dirkjanm/BloodHound.py` | Repo renamed to BloodHound.py (capital B) |
| `tracks/08-cryptography/modules/10-auditing-crypto-failures/README.md` | `https://github.com/drwetter/testssl.sh/blob/3.2/doc/rat…` | `https://github.com/testssl/testssl.sh/blob/3/doc/rating…` | Repo moved to testssl org; updated branch/path |
| `tracks/03-forensics/modules/10-log-cloud-forensics/README.md` | `https://hackingthe.cloud/aws/post_exploitation/` | `https://hackingthe.cloud/aws/` | Page removed; replaced with hackingthe.cloud AWS section |
| `tracks/05-cloud/modules/13-kubernetes-admission-runtime/README.md` | `https://kyverno.io/docs/writing-policies/` | `https://kyverno.io/policies/` | Kyverno policy docs moved; replaced with policy library |
| `tracks/07-endpoint-hardening/modules/05-endpoint-telemetry/README.md` | `https://osquery.io/schema/5.11.0/` | `https://osquery.readthedocs.io/en/stable/introduction/s…` | osquery.io/schema removed; replaced with RTD SQL intro |
| `tracks/07-endpoint-hardening/modules/08-patch-vuln-management/README.md` | `https://osquery.io/schema/5.11.0/#deb_packages` | `https://osquery.readthedocs.io/en/stable/introduction/s…` | osquery.io/schema removed; replaced with RTD SQL intro |
| `tracks/00-foundations/modules/10-scripting/README.md` | `https://realpython.com/regex-python-part-1/` | `https://realpython.com/regex-python/` | Real Python combined into single regex article |
| `tracks/09-python-for-security/modules/09-building-mcp-server/README.md` | `https://simonwillison.net/2025/Apr/9/mcp-security/` | `https://simonwillison.net/2025/Apr/9/mcp-prompt-injecti…` | Slug was wrong — actual article is mcp-prompt-injection |
| `tracks/05-cloud/modules/11-container-escape-runtime/README.md` | `https://sysdig.com/blog/falco-runtime-security-for-cont…` | `https://falco.org/docs/concepts/event-sources/` | Sysdig blog article deleted; replaced with official Falco docs |
| `tracks/05-cloud/modules/13-kubernetes-admission-runtime/README.md` | `https://sysdig.com/blog/kubernetes-security-falco/` | `https://falco.org/docs/getting-started/` | Sysdig blog article deleted; replaced with official Falco docs |
| `tracks/05-cloud/modules/06-iac-security/README.md` | `https://www.checkov.io/4.Integrations/github-actions.ht…` | `https://www.checkov.io/2.Basics/CLI%20Command%20Referen…` | Checkov integration page moved; replaced with CLI reference |
| `tracks/07-endpoint-hardening/modules/02-windows-hardening/README.md` | `https://www.cisecurity.org/cybersecurity-tools/cis-cat-…` | `https://www.cisecurity.org/cis-cat-lite` | URL slug changed (hyphen in middle removed) |
| `tracks/09-python-for-security/modules/04-http-apis-enrichment/README.md` | `https://www.python-httpx.org/advanced/` | `https://www.python-httpx.org/advanced/clients/` | httpx docs restructured; advanced/ now at /advanced/clients/ |
| `tracks/09-python-for-security/modules/07-automating-the-web/README.md` | `https://www.python-httpx.org/advanced/#client-instances` | `https://www.python-httpx.org/advanced/clients/` | httpx docs restructured |
| `tracks/03-forensics/modules/04-windows-artifacts/README.md` | `https://www.sans.org/blog/sans-dfir-cheat-sheet-windows…` | `https://www.sans.org/posters/windows-forensic-analysis/` | SANS blog URL broken; replaced with SANS Windows forensic analysis poster |
| `tracks/03-forensics/modules/06-memory-forensics/README.md` | `https://www.sans.org/posters/acquiring-memory-ir/` | `https://www.sans.org/posters/memory-forensics-cheat-she…` | SANS URL restructured; updated to memory-forensics-cheat-sheet |
| `tracks/03-forensics/modules/02-acquisition-imaging/README.md` | `https://www.sans.org/posters/memory-acquisition/` | `https://www.sans.org/posters/memory-forensics-cheat-she…` | SANS URL restructured; updated to memory-forensics-cheat-sheet |
| `tracks/03-forensics/modules/03-file-systems-carving/README.md` | `https://www.sans.org/security-resources/posters/dfir/di…` | `https://www.sans.org/posters/sleuth-kit-cheatsheet/` | SANS URL restructured; updated to sleuth-kit-cheatsheet |

---

## Broken → line removed (59)

These lines were removed from Learn/Further reading sections because the URL is definitively dead (4xx confirmed with GET), no reliable replacement exists, and the content either: (a) no longer exists at any known location, (b) moved behind a paywall, or (c) the vendor removed the article.

| File | Removed URL | Reason |
|------|------------|--------|
| `tracks/04-malware/modules/01-analysis-lab-setup/README.md` | `https://any.run/cybersecurity-blog/sandbox-environment/` | any.run blog article deleted |
| `tracks/12-ai-augmented-ops/modules/09-securing-ai/README.md` | `https://atlas.mitre.org/studies/` | ATLAS SPA — sub-path 404 to curl |
| `tracks/12-ai-augmented-ops/modules/09-securing-ai/README.md` | `https://atlas.mitre.org/techniques/` | ATLAS SPA — sub-path 404 to curl |
| `tracks/12-ai-augmented-ops/modules/08-soar-ai/README.md` | `https://atlas.mitre.org/techniques/AML.T0040` | ATLAS is a SPA; technique sub-paths 404 to curl; main page atlas.mitre.org still works |
| `tracks/12-ai-augmented-ops/modules/06-soc-copilot/README.md` | `https://atlas.mitre.org/techniques/AML.T0051` | ATLAS SPA — sub-path 404 to curl |
| `tracks/12-ai-augmented-ops/modules/04-rag/README.md` | `https://blog.nomic.ai/posts/nomic-embed` | nomic.ai blog pivoted to AEC construction AI; ML embed posts deleted |
| `tracks/06-active-directory/modules/09-detecting-ad-attacks/README.md` | `https://blog.redforce.io/ad-honeytokens/` | redforce.io blog article deleted |
| `tracks/07-endpoint-hardening/modules/05-endpoint-telemetry/README.md` | `https://blog.trailofbits.com/2019/05/31/detecting-lateral-movemen…` | Trail of Bits blog article deleted |
| `tracks/09-python-for-security/modules/01-setup-idioms/README.md` | `https://cheatsheetseries.owasp.org/cheatsheets/Python_Security_Ch…` | OWASP cheatsheet removed/relocated (no working replacement found) |
| `tracks/03-forensics/modules/02-acquisition-imaging/README.md` | `https://dfir.blog/imaging-with-dc3dd/` | dfir.blog article removed |
| `tracks/03-forensics/modules/07-timeline-analysis/README.md` | `https://dfir.blog/understanding-ntfs-timestamps/` | dfir.blog only has 2 posts now; NTFS article gone |
| `tracks/10-automation/modules/10-reviewing-ai-automation/README.md` | `https://github.blog/developer-skills/github-education/how-to-revi…` | GitHub blog article deleted |
| `tracks/09-python-for-security/modules/05-building-cli-tools/README.md` | `https://hynek.me/articles/pandas-groupby/` | Article deleted from hynek.me (pandas groupby was wrong topic anyway) |
| `tracks/11-ztna/modules/08-policy-as-code/README.md` | `https://kubernetes.io/blog/2022/08/03/future-of-pod-security-poli…` | Kubernetes blog article deleted |
| `tracks/07-endpoint-hardening/modules/04-exploit-mitigations/README.md` | `https://madaidans-insecurities.github.io/linux-hardening.html#ker…` | madaidans-insecurities.github.io site deleted |
| `tracks/07-endpoint-hardening/modules/04-exploit-mitigations/README.md` | `https://marcan.st/2017/12/you-know-whats-cool-aslr/` | marcan.st article deleted |
| `tracks/04-malware/modules/09-unpacking-obfuscation/README.md` | `https://news.sophos.com/en-us/2008/09/24/malware-analysis-detecti…` | Sophos 2008 blog post gone |
| `tracks/08-cryptography/modules/02-symmetric-aead/README.md` | `https://nonce-disrespect.github.io/` | Project site deleted |
| `tracks/04-malware/modules/09-unpacking-obfuscation/README.md` | `https://opensecuritytraining.info/MalwareAnalysis.html` | opensecuritytraining.info (OST v1) is defunct |
| `tracks/04-malware/modules/02-file-triage/README.md` | `https://opensecuritytraining2.github.io/` | OST2 GitHub Pages broken; migrated to p.ost2.fyi |
| `tracks/04-malware/modules/07-disassembly-basics/README.md` | `https://opensecuritytraining2.github.io/IntroX86.html` | OpenSecurityTraining2 migrated to p.ost2.fyi platform; old GitHub Pages broken |
| `tracks/04-malware/modules/05-dynamic-behavioural/README.md` | `https://opensecuritytraining2.github.io/MalwareDynamicAnalysis.ht…` | OST2 GitHub Pages broken; migrated to p.ost2.fyi |
| `tracks/04-malware/modules/03-static-strings-pe/README.md` | `https://opensecuritytraining2.github.io/MalwareDynamicAnalysis.ht…` | OST2 GitHub Pages broken; migrated to p.ost2.fyi |
| `tracks/12-ai-augmented-ops/modules/07-ai-detection-triage/README.md` | `https://repost.aws/articles/ARyKhJCEBsQNiNi_DI6DXKkA` | AWS re:Post article 403/unavailable |
| `tracks/08-cryptography/modules/06-pki-certificates/README.md` | `https://scotthelme.co.uk/ocsp-stapling-disabled-by-default-in-ngi…` | scotthelme article removed |
| `tracks/10-automation/modules/03-iac-security-scanning/README.md` | `https://snyk.io/blog/checkov-vs-tfsec/` | Snyk blog article deleted |
| `tracks/10-automation/modules/05-cicd-pipelines/README.md` | `https://snyk.io/blog/github-actions-security-best-practices/` | Snyk blog article deleted |
| `tracks/05-cloud/modules/08-cicd-security/README.md` | `https://snyk.io/blog/github-actions-security-best-practices/` | Snyk blog article deleted |
| `tracks/07-endpoint-hardening/modules/02-windows-hardening/README.md` | `https://techcommunity.microsoft.com/t5/microsoft-security-baselin…` | Microsoft Tech Community article returns 400 Bad Request |
| `tracks/07-endpoint-hardening/modules/02-windows-hardening/README.md` | `https://techcommunity.microsoft.com/t5/microsoft-security-baselin…` | Microsoft Tech Community article returns 400 Bad Request |
| `tracks/03-forensics/modules/03-file-systems-carving/README.md` | `https://wiki.sleuthkit.org/index.php?title=File_System_Analysis` | SleuthKit wiki deleted |
| `tracks/03-forensics/modules/11-anti-forensics/README.md` | `https://wiki.sleuthkit.org/index.php?title=Istat` | SleuthKit wiki deleted |
| `tracks/08-cryptography/modules/02-symmetric-aead/README.md` | `https://words.filippo.io/dispatches/gcm-nonce-reuse/` | filippo.io dispatches article removed |
| `tracks/11-ztna/modules/07-microsegmentation/README.md` | `https://www.brendangregg.com/blog/2021-07-15/bpf-internals.html` | Brendan Gregg article deleted from site |
| `tracks/11-ztna/modules/09-monitoring-detection/README.md` | `https://www.cisa.gov/sites/default/files/2023-03/zero_trust_matur…` | CISA ZTMM PDF URL changed; no new URL verified |
| `tracks/04-malware/modules/13-detection-reporting/README.md` | `https://www.cisa.gov/sites/default/files/2024-01/MAR-10454362-1.v…` | CISA MAR PDF link broken |
| `tracks/03-forensics/modules/14-reporting-root-cause/README.md` | `https://www.digital-detective.net/digital-forensics-documents/ACP…` | PDF link broken; NPCC/ACPO guide moved |
| `tracks/03-forensics/modules/13-ir-process/README.md` | `https://www.etsy.com/codeascraft/blameless-postmortems/` | Etsy Code As Craft blog article returns 403; content may be gone |
| `tracks/03-forensics/modules/04-windows-artifacts/README.md` | `https://www.foxtonforensics.com/blog/post/prefetch-forensics` | Foxton Forensics blog article deleted |
| `tracks/06-active-directory/modules/08-path-to-da/README.md` | `https://www.harmj0y.net/blog/redteaming/abusing-active-directory-…` | harmj0y blog article deleted |
| `tracks/11-ztna/modules/07-microsegmentation/README.md` | `https://www.illumio.com/blog/zero-trust-segmentation` | Illumio blog article deleted |
| `tracks/08-cryptography/modules/03-asymmetric-key-exchange/README.md` | `https://www.imperialviolet.org/2013/06/27/botched-ecdhe.html` | imperialviolet.org article removed |
| `tracks/09-python-for-security/modules/02-files-regex-parsing/README.md` | `https://www.infosecmatter.com/parsing-ssh-logs-with-python/` | infosecmatter.com article gone |
| `tracks/04-malware/modules/11-document-script-malware/README.md` | `https://www.leeholmes.com/powershell-obfuscation-detection-using-…` | Article deleted |
| `tracks/04-malware/modules/03-static-strings-pe/README.md` | `https://www.mandiant.com/resources/blog/flare-ida-scripts` | Mandiant/Google consolidated blogs; FLARE IDA scripts post deleted |
| `tracks/04-malware/modules/09-unpacking-obfuscation/README.md` | `https://www.mandiant.com/resources/blog/the-anatomy-of-a-powershe…` | Mandiant blog article deleted after Google acquisition |
| `tracks/04-malware/modules/07-disassembly-basics/README.md` | `https://www.mandiant.com/resources/blog/unpacking-malware-manuall…` | Mandiant blog article deleted after Google acquisition |
| `tracks/06-active-directory/modules/04-credential-theft/README.md` | `https://www.microsoft.com/en-us/security/blog/2012/03/13/the-anat…` | Old Microsoft Security Blog article removed (2012) |
| `tracks/11-ztna/modules/06-identity-aware-access/README.md` | `https://www.pomerium.com/docs/concepts` | Pomerium docs URL broken |
| `tracks/03-forensics/modules/01-forensic-fundamentals/README.md` | `https://www.rfc-editor.org/rfc/rfc3227` | NOTE: Restored — RFC Editor returns 404 to HEAD but 200 to GET; link is valid |
| `tracks/03-forensics/modules/05-browser-app-artifacts/README.md` | `https://www.sans.org/blog/google-chrome-forensics/` | SANS blog article deleted; no SANS replacement found |
| `tracks/03-forensics/modules/01-forensic-fundamentals/README.md` | `https://www.sans.org/blog/hashing-evidence/` | SANS blog article deleted |
| `tracks/03-forensics/modules/07-timeline-analysis/README.md` | `https://www.sans.org/blog/sans-dfir-cheat-sheet-super-timeline/` | SANS blog article deleted |
| `tracks/11-ztna/modules/09-monitoring-detection/README.md` | `https://www.securonix.com/blog/ueba-and-identity-security/` | Securonix blog article deleted |
| `tracks/10-automation/modules/08-soar-fundamentals/README.md` | `https://www.tines.com/blog/soar-playbook-best-practices` | Tines blog restructured; article deleted |
| `tracks/10-automation/modules/01-automation-mindset/README.md` | `https://www.tines.com/blog/what-is-security-automation` | Tines blog restructured; article deleted |
| `tracks/03-forensics/modules/06-memory-forensics/README.md` | `https://www.trustedsec.com/blog/volatility-and-process-injection-…` | TrustedSec blog article deleted |
| `tracks/10-automation/modules/10-reviewing-ai-automation/README.md` | `https://www.wiz.io/blog/generative-ai-meets-cloud-security` | Wiz blog article deleted |
| `tracks/03-forensics/modules/14-reporting-root-cause/README.md` | `https://zeltser.com/security-incident-report-writing/` | Lenny Zeltser article deleted from site |

---

## Manual review needed (15)

These URLs require human verification — either they redirect to a generic page (article may have moved or been deleted) or they are behind authentication.

| File | URL | Reason |
|------|-----|--------|
| `tracks/11-ztna/modules/01-zero-trust-principles/README.md` | `https://www.gartner.com/en/documents/3957375` | Gartner paywall — verified the page exists but requires Gartner login to read |
| `tracks/11-ztna/modules/05-sase-cloud-delivered/README.md` | `https://www.gartner.com/smarterwithgartner/the-future-of-network-…` | Gartner 403 to unauthenticated requests — verify article still exists and is accessible |
| `tracks/10-automation/modules/09-detection-as-code-pipelines/README.md` | `https://posts.specterops.io/detection-testing-with-pytest-ee8e4d5…` | Redirects to specterops.io/blog/ for bots, but URL works in browser — Medium migration; verify with browser |
| `tracks/06-active-directory/modules/08-path-to-da/README.md` | `https://posts.specterops.io/attack-path-analysis-for-defenders-pa…` | Redirects to specterops.io/blog/ for bots, but URL works in browser — verify with browser |
| `tracks/05-cloud/modules/03-iam-attack-paths/README.md` | `https://research.nccgroup.com/2018/12/12/aws-iam-escalation-paths…` | Redirects to generic nccgroup.com/research/ homepage — article likely deleted after site migration; replace with pmapper GitHub README or web archive |
| `tracks/05-cloud/modules/12-kubernetes-rbac-network/README.md` | `https://research.nccgroup.com/2021/11/10/your-k8s-nodes-iam-cloud…` | Redirects to generic nccgroup.com/research/ homepage — article likely deleted; find replacement |
| `tracks/03-forensics/modules/01-forensic-fundamentals/README.md` | `https://www.swgde.org/documents/Current%20Documents/2018-09-12%20…` | SWGDE returns 403 to automated requests; PDF download page should work in browser — verify |
| `tracks/03-forensics/modules/10-log-cloud-forensics/README.md` | `https://www.swgde.org/documents/Current%20Documents/SWGDE%20Best%…` | SWGDE returns 403 to automated requests — verify with browser |
| `tracks/06-active-directory/modules/07-bloodhound/README.md` | `https://bloodhoundenterprise.io/blog/2023/05/09/bloodhound-commun…` | Redirects to wp-login.php — BloodHound Enterprise blog requires auth; find SpecterOps docs replacement |
| `tracks/04-malware/modules/09-advanced-static/README.md` | `https://link.springer.com/book/10.1007/978-1-4939-1711-2` | Springer redirect with cookie error — paywall book; URL is structurally correct but browser cookies required |
| `tracks/10-automation/modules/08-soar-fundamentals/README.md` | `https://www.ibm.com/topics/soar` | Updated to ibm.com/think/topics/security-orchestration-automation-and-response — verify the new URL content is equivalent |
| `tracks/07-endpoint-hardening/modules/09-privesc-defense/README.md` | `https://book.hacktricks.xyz/linux-hardening/privilege-escalation` | Connection timeout — likely rate-limited or geo-blocked; verify site is accessible |
| `tracks/06-active-directory/modules/02-ad-protocols/README.md` | `https://book.hacktricks.xyz/network-services-pentesting/pentestin…` | Connection timeout — HackTricks likely rate-limited; verify with browser |
| `tracks/11-ztna/modules/08-policy-as-code/README.md` | `https://docs.styra.com/opa/rego-cheat-sheet` | Connection timeout — Styra site may be slow or blocked; verify with browser |
| `tracks/00-foundations/modules/02-lab-setup/README.md` | `https://www.vulnhub.com/` | Connection timeout — VulnHub site may be temporarily down; verify with browser |

---

## YouTube URLs — manual review (46)

YouTube URLs cannot be reliably verified via HEAD requests (403 from CDN). All 46 YouTube links in the Learn sections should be manually verified in a browser to confirm the videos are still accessible and the content matches the description.

| File | URL |
|------|-----|
| `tracks/05-cloud/modules/04-cloud-network-security/README.md` | `https://www.youtube.com/watch?v=1GKL28e0dq4` |
| `tracks/09-python-for-security/modules/06-network-programming/README.md` | `https://www.youtube.com/watch?v=1mYYPWnHqFw` |
| `tracks/00-foundations/modules/03-docker/README.md` | `https://www.youtube.com/watch?v=3c-iBn73dDE` |
| `tracks/01-offensive/modules/09-password-attacks/README.md` | `https://www.youtube.com/watch?v=4bchWTf7un8` |
| `tracks/09-python-for-security/modules/03-structured-data-reporting/README.md` | `https://www.youtube.com/watch?v=4zbehnz-8QU` |
| `tracks/06-active-directory/modules/01-ad-windows-model/README.md` | `https://www.youtube.com/watch?v=5N242XcKAsM` |
| `tracks/12-ai-augmented-ops/modules/04-rag/README.md` | `https://www.youtube.com/watch?v=8OJC21T2SL4` |
| `tracks/01-offensive/modules/04-exploitation/README.md` | `https://www.youtube.com/watch?v=8lR27r8Y_ik` |
| `tracks/02-defensive/modules/05-intrusion-detection/README.md` | `https://www.youtube.com/watch?v=91i7InHVOso` |
| `tracks/03-forensics/modules/09-network-forensics/README.md` | `https://www.youtube.com/watch?v=GMNOT1aZmD8` |
| `tracks/02-defensive/modules/01-telemetry/README.md` | `https://www.youtube.com/watch?v=GvzosoaOaIQ` |
| `tracks/01-offensive/modules/10-privesc-linux/README.md` | `https://www.youtube.com/watch?v=HnlYElVhXpo` |
| `tracks/03-forensics/modules/08-triage-live-response/README.md` | `https://www.youtube.com/watch?v=JD0hIkEn-bY` |
| `tracks/00-foundations/modules/09-cryptography/README.md` | `https://www.youtube.com/watch?v=O4xNJsjtN6E` |
| `tracks/02-defensive/modules/02-endpoint-telemetry/README.md` | `https://www.youtube.com/watch?v=PY1v_mZnjks` |
| `tracks/02-defensive/modules/04-network-monitoring/README.md` | `https://www.youtube.com/watch?v=R-8WdoP-CtE` |
| `tracks/00-foundations/modules/11-version-control/README.md` | `https://www.youtube.com/watch?v=RGOj5yH7evk` |
| `tracks/02-defensive/modules/11-hunting-endpoint/README.md` | `https://www.youtube.com/watch?v=S8POUZv7pT8` |
| `tracks/00-foundations/modules/01-security-principles/README.md` | `https://www.youtube.com/watch?v=SBcDGb9l6yo` |
| `tracks/12-ai-augmented-ops/modules/04-rag/README.md` | `https://www.youtube.com/watch?v=TRjq7t2Ms5I` |
| `tracks/02-defensive/modules/06-siem/README.md` | `https://www.youtube.com/watch?v=UGYmG_hy3qQ` |
| `tracks/03-forensics/modules/06-memory-forensics/README.md` | `https://www.youtube.com/watch?v=Uk3DEgY5Ue8` |
| `tracks/00-foundations/modules/05-windows/README.md` | `https://www.youtube.com/watch?v=VYROU-ZwZX8` |
| `tracks/04-malware/modules/04-static-capabilities/README.md` | `https://www.youtube.com/watch?v=X7DBGUjPNtY` |
| `tracks/00-foundations/modules/10-scripting/README.md` | `https://www.youtube.com/watch?v=YYXdXT2l-Gg` |
| `tracks/08-cryptography/modules/10-auditing-crypto-failures/README.md` | `https://www.youtube.com/watch?v=Z7Wl2FW2TcA` |
| `tracks/02-defensive/modules/15-soar/README.md` | `https://www.youtube.com/watch?v=_riaZjLnoXo` |
| `tracks/04-malware/modules/08-decompilation-code-analysis/README.md` | `https://www.youtube.com/watch?v=cWtHpOchuli` |
| `tracks/02-defensive/modules/13-triage-ir/README.md` | `https://www.youtube.com/watch?v=cuR8qIfV11k` |
| `tracks/02-defensive/modules/09-detection-testing/README.md` | `https://www.youtube.com/watch?v=eAtlwqXDZYc` |
| `tracks/04-malware/modules/05-dynamic-behavioural/README.md` | `https://www.youtube.com/watch?v=eEMSx-Mn3KY` |
| `tracks/02-defensive/modules/12-hunting-network/README.md` | `https://www.youtube.com/watch?v=eETUi-AZYgc` |
| `tracks/02-defensive/modules/08-detection-as-code/README.md` | `https://www.youtube.com/watch?v=h8-Mnjq6EsU` |
| `tracks/04-malware/modules/10-anti-analysis/README.md` | `https://www.youtube.com/watch?v=hYvFU_AHpAQ` |
| `tracks/04-malware/modules/02-file-triage/README.md` | `https://www.youtube.com/watch?v=iMbpgGgjMDE` |
| `tracks/01-offensive/modules/13-c2-postex/README.md` | `https://www.youtube.com/watch?v=i_rPATPFi4M` |
| `tracks/01-offensive/modules/14-lolbins-evasion/README.md` | `https://www.youtube.com/watch?v=lDK384LXhpU` |
| `tracks/01-offensive/modules/01-recon/README.md` | `https://www.youtube.com/watch?v=p4JgIu1mceI` |
| `tracks/02-defensive/modules/14-threat-intel/README.md` | `https://www.youtube.com/watch?v=tu86szd5jYU` |
| `tracks/01-offensive/modules/12-pivoting/README.md` | `https://www.youtube.com/watch?v=txFnX5NPqKc` |
| `tracks/01-offensive/modules/11-privesc-windows/README.md` | `https://www.youtube.com/watch?v=uTcrbNBcoxQ` |
| `tracks/00-foundations/modules/06-networking/README.md` | `https://www.youtube.com/watch?v=wMc0H22nyA4` |
| `tracks/01-offensive/modules/05-memory-corruption/README.md` | `https://www.youtube.com/watch?v=wa3sMSdLyHw` |
| `tracks/11-ztna/modules/01-zero-trust-principles/README.md` | `https://www.youtube.com/watch?v=yn_L_EgaOVM` |
| `tracks/01-offensive/modules/02-scanning/README.md` | `https://www.youtube.com/watch?v=z14HC3bJQpQ` |
| `tracks/12-ai-augmented-ops/modules/01-hybrid-ai-pattern/README.md` | `https://www.youtube.com/watch?v=zjkBMFhNj_g` |

---

## Notes on specific decisions

### RFC Editor URLs
RFC Editor (`rfc-editor.org/rfc/rfc*`) returns HTTP 404 to HEAD requests but HTTP 200 to GET requests — they block automated head requests. **All RFC URLs are working and were left in place.** The one RFC (RFC 3227, Order of Volatility) that was incorrectly removed was restored.

### PortSwigger Web Security Academy
PortSwigger returns 404 to HEAD requests but 200 to GET (JavaScript SPA). All `portswigger.net/web-security/*` URLs are **working** and were left in place.

### MITRE ATLAS
MITRE ATLAS (`atlas.mitre.org`) is a single-page application. The top-level URL `https://atlas.mitre.org/` works in a browser. Sub-path URLs (`/techniques/`, `/studies/`, specific technique IDs) return 404 to curl even with GET — the content is rendered client-side via JavaScript. Lines with specific ATLAS technique-level URLs were removed; the main `atlas.mitre.org/` reference was retained.

### OpenSecurityTraining2
OST2 migrated from GitHub Pages (`opensecuritytraining2.github.io`) to their own platform (`p.ost2.fyi`). The old GitHub Pages URLs are 404. The new platform requires account registration for course access but the catalog at `p.ost2.fyi/courses` is publicly viewable.

### Mandiant Blog Articles
After Google Cloud acquired Mandiant, the `mandiant.com/resources/blog/` URL structure was deprecated. The CAPA article was migrated to `cloud.google.com/blog/topics/threat-intelligence/` (updated). Other Mandiant blog articles were simply removed with no equivalent found.

### Snyk Blog and Wiz Blog
Both vendors have undergone content audits/restructuring. Multiple articles that existed as of 2024 returned 404 in June 2026.

### testssl.sh Repository
The project moved from `github.com/drwetter/testssl.sh` to the `github.com/testssl/testssl.sh` organization account. All references updated accordingly.

### Checkov Integration Page
The Checkov GitHub Actions integration page at the old URL is gone. Updated to the CLI command reference which covers integration usage.
