# plaintext

> Open security education for everyone. No paywalls. No gatekeeping. Forever free.

Plaintext is a community-built cybersecurity curriculum: hands-on, job-ready, and
AI-augmented, built open-source-first. Professional-grade training from foundations to
advanced specialisations — free to use, free to fork, free to improve.

**Live site:** <https://plaintext-security.github.io/plaintext/> — built with Material for MkDocs
from the Markdown under `tracks/`.

## Tracks

| # | Track | Tools |
|---|-------|-------|
| 00 | [Foundations](tracks/00-foundations/) | tcpdump, openssl, python, bash |
| 01 | [Offensive Security](tracks/01-offensive/) | nmap, metasploit, burpsuite CE, sqlmap |
| 02 | [Defensive Operations](tracks/02-defensive/) | elastic, zeek, suricata, wazuh |
| 03 | [Digital Forensics & IR](tracks/03-forensics/) | volatility3, sleuthkit, velociraptor, plaso |
| 04 | [Malware Analysis](tracks/04-malware/) | ghidra, capa, yara, oletools |
| 05 | [Cloud & Container Security](tracks/05-cloud/) | prowler, trivy, falco, stratus-red-team |
| 06 | [Active Directory & Windows](tracks/06-active-directory/) | impacket, BloodHound CE, crackmapexec |
| 07 | [Endpoint & Host Hardening](tracks/07-endpoint-hardening/) | OpenSCAP, Lynis, osquery, ansible |
| 08 | [Cryptography, PKI & Secrets](tracks/08-cryptography/) | openssl, step-ca, vault, testssl.sh |
| 09 | [Python for Security](tracks/09-python-for-security/) | requests, scapy, fastmcp, pytest |
| 10 | [Security Automation](tracks/10-automation/) | opentofu, ansible, sigma, n8n |
| 11 | [Zero Trust Network Access](tracks/11-ztna/) | keycloak, headscale, pomerium, OPA |
| 12 | [AI-Augmented Security Ops](tracks/12-ai-augmented-ops/) | ollama, chromadb, fastmcp, garak |

## Structure

```
tracks/                         ← curriculum source (MkDocs builds this into the site)
└── 00-foundations/
    ├── README.md               ← track content map (overview, modules, capstone)
    └── modules/
        └── 01-networking/
            ├── README.md       ← concept explanation
            └── lab.md          ← hands-on, Docker-first exercise
```

## Run it locally

```bash
python3 -m pip install -r requirements.txt
mkdocs serve     # live preview at http://127.0.0.1:8000
```

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md). All contributions welcome — fixes,
new modules, translations, lab improvements.

## License

[CC BY 4.0](LICENSE) — use it, share it, build on it.
