---
title: "Interactive Tour (Prototype)"
---

# Interactive Tour — prototype

!!! warning "This is a prototype, not curriculum"
    A proof-of-concept of a proposed **bite-sized + hands-on** format: a module cut into a few
    inline *bites*, each one idea you immediately **do** and that auto-checks — freeCodeCamp-style
    gating × *A Tour of Go* runnable cells. It is **not** finished curriculum and is not wired into
    grading. It exists so we can feel the format on the real site before committing to it.

To stress-test whether the format generalizes, the modules below were drawn **at random** — one
from each of the 13 tracks (no cherry-picking the easy fits). Where the real production tool runs
client-side (SubtleCrypto, matchers, graph search, JSON), the bites use it for real; where a topic
needs real infrastructure (a domain, a cloud account, a live mesh), the bite is a faithful
**simulation** and the live version is flagged as the module’s container/cloud **capstone**.

| Track / module | Tour |
|---|---|
| 00 · Building Your Lab | [`02-lab-setup`](./02-lab-setup.md) |
| 01 · SSRF & XXE | [`08-web-ssrf-xxe`](./08-web-ssrf-xxe.md) |
| 02 · Intrusion Detection | [`05-intrusion-detection`](./05-intrusion-detection.md) |
| 03 · Cloud Log Forensics | [`10-log-cloud-forensics`](./10-log-cloud-forensics.md) |
| 04 · Detection & Reporting (YARA) | [`13-detection-reporting`](./13-detection-reporting.md) |
| 05 · Posture Auditing (CSPM) | [`05-posture-auditing`](./05-posture-auditing.md) |
| 06 · Path to Domain Admin | [`08-path-to-da`](./08-path-to-da.md) |
| 07 · Host Boot Integrity | [`11-host-boot-integrity`](./11-host-boot-integrity.md) |
| 08 · Crypto Primitives | [`01-primitives-practice`](./01-primitives-practice.md) |
| 09 · Structured Data → Report | [`03-structured-data-reporting`](./03-structured-data-reporting.md) |
| 10 · SOAR Fundamentals | [`08-soar-fundamentals`](./08-soar-fundamentals.md) |
| 11 · Policy as Code | [`08-policy-as-code`](./08-policy-as-code.md) |
| 12 · Building MCP Servers | [`05-building-mcp-servers`](./05-building-mcp-servers.md) |

**How to read it:** open one, click **run / check / pick** on each step, watch it verify, then
**next step →**. Three bites ≈ a few minutes. The point isn’t these specific modules — it’s whether
"approachable *and* genuinely hands-on" holds across a random slice of the curriculum.
