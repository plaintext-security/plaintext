# Track 00 — Foundations

The bedrock. Every other track assumes you can set up a safe lab, work on Linux *and*
Windows, read the network and the web, handle data and crypto, automate with Python, and
work in the open with git. Build this floor solid and everything above it gets easier.

## What you'll be able to do

- Set up an isolated, reproducible lab and work fluently with containers.
- Operate both Linux and Windows from the command line for security tasks.
- Read network traffic, HTTP, and the encodings security data actually shows up in.
- Explain the cryptographic primitives that secure modern systems — and where they fail.
- Automate with Python, work in the open with git, and threat-model before you touch a tool.

## Modules

| # | Module | What you'll learn | OSS tools |
|---|--------|-------------------|-----------|
| 01 | Security First Principles | CIA, AAA, defense in depth, and the security mindset | — |
| 02 | Building a Safe Lab | Isolated, snapshot-able VMs, and when to use a VM vs a container | VirtualBox, Docker |
| 03 | Docker & Containers | Run, build, and inspect containers; the isolation model | `docker` |
| 04 | Linux for Security | Shell, permissions, processes, logs, and text processing | `bash`, `coreutils` |
| 05 | Windows for Security | Filesystem, registry, services, event logs, and PowerShell | `powershell` |
| 06 | Networking Fundamentals | TCP/IP, the handshake, DNS, and reading a capture | `tcpdump`, `wireshark` |
| 07 | Web & HTTP Fundamentals | Requests, responses, sessions, and security-relevant headers | `curl` |
| 08 | Data & Encoding | Hex, base64, URL encoding, and querying JSON | `cyberchef`, `jq` |
| 09 | Cryptography Basics | Hashing, symmetric/asymmetric, certificates, and TLS | `openssl` |
| 10 | Scripting & Automation | Turning repetitive analysis into reviewable Python tools | `python3` |
| 11 | Version Control & Working in the Open | git, pull requests, and keeping secrets out of history | `git` |
| 12 | Threat Modeling | Trust boundaries and STRIDE — model before you test | — |

## Who this is for

Complete beginners and anyone wanting to solidify fundamentals before moving to a
specialisation track. No prior security experience assumed.

## Capstone

Stand up your isolated lab and a portfolio repo, then prove the core literacy in one
committed artifact: capture and walk an HTTP exchange end to end (DNS → TCP handshake →
TLS), decode a layered encoded blob, and threat-model the little system you built.
**Deliverable:** a `foundations/` folder in your git repo with the capture write-up, the
decoded blob, and a one-page STRIDE model — your first portfolio piece.

## AI & automation

Automation and AI are assumed from day one — but as accelerators, not substitutes for
understanding. Use a model to explain a packet capture, generate a parsing script, or quiz
you on a concept; then verify it against the primary source (the RFC, the man page, the
docs). The skill this track starts building is the judgment to know when the tool — or the
model — is wrong. Anyone can run the command now; the value is understanding the output.

## Standards & further reading

- TCP/IP and protocol RFCs (e.g. RFC 791, RFC 9293 for TCP, RFC 8446 for TLS 1.3)
- NIST SP 800-series for foundational security concepts
- CIS Benchmarks as the hardening baselines later tracks build on
- MITRE ATT&CK as the shared vocabulary used throughout the later tracks
