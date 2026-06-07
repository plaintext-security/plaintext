# Track 00 — Foundations

The bedrock. Every other track assumes you are comfortable with what is here:
how networks move data, how Linux works, how to automate, and how cryptography
underpins trust. Build this floor solid and everything above it gets easier.

## What you'll be able to do

- Read and reason about network traffic at the packet level.
- Operate confidently on a Linux command line and write small tools to automate work.
- Explain the cryptographic primitives (hashing, symmetric/asymmetric, TLS) that
  secure modern systems — and where they fail.
- Frame a system in terms of assets, threats, and trust boundaries before you attack
  or defend it.

## Modules

| # | Module | What you'll learn | OSS tools |
|---|--------|-------------------|-----------|
| 01 | Networking Fundamentals | TCP/IP, the handshake, DNS, and how to capture and read traffic | `tcpdump`, `wireshark` |
| 02 | Linux for Security | Shell, filesystem, permissions, processes, and text processing for security work | `bash`, `coreutils` |
| 03 | Scripting & Automation | Turning repetitive analysis into repeatable scripts and small tools | `python3` |
| 04 | Cryptography Basics | Hashing, symmetric/asymmetric crypto, certificates, and TLS in practice | `openssl` |
| 05 | Web & HTTP Fundamentals | Requests, responses, sessions, and the anatomy of a web application | `curl`, `http` |
| 06 | Security Fundamentals & Threat Modeling | CIA triad, AAA, attacker goals, and modeling a system before testing it | — |

## Who this is for

Complete beginners and anyone wanting to solidify fundamentals before moving to a
specialisation track. No prior security experience assumed.

## Standards & further reading

- TCP/IP and protocol RFCs (e.g. RFC 791, RFC 793, RFC 8446 for TLS 1.3)
- NIST SP 800-series for foundational security concepts
- MITRE ATT&CK as the shared vocabulary used throughout the later tracks
