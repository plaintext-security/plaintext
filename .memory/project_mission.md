---
name: project-mission
description: "Core mission, quality bar, and the relationship between plaintext and sec-school"
metadata: 
  node_type: memory
  type: project
  originSessionId: 80277e8a-8fc4-46f0-a97f-65a9372fb2b8
---

Plaintext is "FreeCodeCamp for SANS" — SANS-quality security education at $0. The bar is SANS, not "good enough for free."

**Why:** Patrick wants to give people who can't pay $8k/course the same education SANS delivers. The project is explicitly modeled on SANS certifications.

**The sec-school connection:** `/Users/patrick/Development/sec-school` is Patrick's own 21-week personal curriculum — a "GCED on crack" self-study program. `plaintext` is the public, community version of that. `sec-school/FUTURE_DIRECTION.md` is the canonical vision document — read it before making significant decisions about plaintext.

**Three differentiators:**
1. Curation over re-distillation — link to the best existing resource, don't rewrite it
2. Containers first — every lab is a `docker-compose up`, using `sec-school/projects/ai-lab/` as the template
3. AI woven through everything, not bolted on — MCP, RAG, local models (Ollama), hybrid routing

**The fictional lab environment is Meridian Financial** — use it for realistic lab data (Windows events, PCAPs, cloud trail, AD, vuln scans).

**The flagship course** is the GCED equivalent (SEC501, enterprise defender) — spans `02-defensive` plus adjacent enterprise breadth modules.

**Practitioner voice** — content written by practitioners, not instructors. Cross-domain translation ("cloud Security Groups map to stateful firewall rules") is the editorial differentiator. Preserve it as community content grows.

**How to apply:** Content depth must match or exceed SANS. Don't regurgitate what's freely available — link to it. OSS tools only. Every lab needs a docker-compose. Use Meridian Financial as the lab environment context.
