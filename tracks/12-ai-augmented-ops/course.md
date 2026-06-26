# AI-Augmented Security Operations — Course Overview

> **The force multiplier — and the new attack surface.** Run your own models, ground them in your
> data, wire them to your tools, automate the boring 80% — then turn around and attack the AI system
> you just built, and harden it until the attack fails.

| | |
|---|---|
| **Level** | Intermediate–Advanced — comfort with Python and the command line assumed |
| **Format** | Self-paced · hands-on labs in every module · runs local models (Ollama) |
| **Shape** | 11 modules · 3 phases · 1 portfolio capstone |
| **Prerequisites** | Track 00 — Foundations. Track 09 — Python strongly recommended. |
| **Cost** | Free, forever. Open-source tools; local models run free on your own hardware. |

## What this course is

The AI thesis of the whole curriculum, made hands-on. You don't prompt a chatbot — you *run* models
on modest hardware, ground them in your own corpus with RAG, expose real security tools to an LLM
over MCP, and assemble a working SoC copilot that triages at volume. Then you close the loop: you
red-team the thing you built, demonstrate a prompt-injection or data-exfil weakness, and harden until
it holds.

## What you'll be able to do

- Run local models on modest hardware — and know when to reach for a frontier model instead.
- Ground answers in your own corpus with RAG, and write reliable, reviewable prompts.
- Expose security tools to an LLM over MCP and build a SoC copilot grounded in your data and tools.
- Wire automated response with a human in the loop, and triage at volume cheaply.
- Attack and harden AI/MCP/RAG systems — and gate quality with held-out evals, not vibes.

## How it's taught

Every module runs the same honest loop: **build the AI capability with local-first OSS → ground it in
real data → use it on a real SOC task → then secure or attack it.** The discipline that holds the
whole curriculum together applies hardest here — *AI authors → you review → you own it* — because the
thing reviewing the output is also the thing under test. Test prompt-injection and jailbreak
techniques only against models and applications you own or are authorised to assess.

There's no grading and no certificate. **Your repo is the credential** — the copilot, the attack, and
the fix are the only proof, to you and to anyone who reads them.

## Syllabus at a glance

| Phase | Modules | You'll finish with |
|---|---|---|
| **1 · Run & ground models** | The Hybrid AI Pattern · Running Local Models · Prompt Patterns for Security · Retrieval-Augmented Generation | A local-model setup (Ollama/llama.cpp), a reviewable prompt library, and a RAG pipeline grounded in your own security notes |
| **2 · Build the copilot** | Building MCP Servers · A SoC Copilot (MCP + RAG) · AI-Assisted Detection & Triage · SOAR + AI | An MCP server exposing one real tool, wired to your RAG corpus into a SoC copilot that triages at volume, plus a human-in-the-loop SOAR playbook |
| **3 · Secure & attack the AI** | Securing the AI You Run · Attacking AI Systems · AI Evaluation & Observability | The capstone — red-team your own copilot with garak/promptfoo, demonstrate a prompt-injection or data-exfil weakness, then harden until the same attack fails |

The attack and hardening map to real frameworks — the OWASP LLM Top 10, MITRE ATLAS, the NIST AI RMF
— so the red-team is grounded in named threats, not invented ones.

→ **[Full module list & the why behind each →](README.md)**

## Hands-on

Every module ends in a validated, one-command lab built on real, local-first tools — Ollama,
llama.cpp, ChromaDB, fastmcp, Shuffle, garak, promptfoo. Models run on your own hardware; nothing
here needs a paid API key. You don't watch the demo; you build the system and then break it.

## What you'll walk away with

An **`ai-augmented-ops/` portfolio piece**: a small SoC copilot — an MCP server exposing one real
tool, grounded in a RAG corpus of your own notes — that you then red-team, demonstrating a working
prompt-injection or data-exfil exploit and a concrete fix that defeats it on re-test. The build, the
attack, and the fix, told as one coherent story.

## Who it's for

Practitioners who want AI as a directed, reviewed force multiplier — not a magic box. If you can
already script in Python and want to build, ground, and *secure* the AI tooling a modern SOC runs on,
start here.

---

**Ready?** [See the full syllabus →](README.md) · or jump to [Module 01 — The Hybrid AI Pattern →](modules/01-hybrid-ai-pattern/README.md)
