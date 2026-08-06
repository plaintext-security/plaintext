## 1. Reference module (lock the template)

- [x] 1.1 Rebuild `01-hybrid-ai-pattern` README in place: self-contained teaching, 2–4 diagrams, Learn→
      "Go deeper", a real case-study anchor (LLM hallucination with real consequences). Reference Track 11
      module 01 as the shape exemplar.
- [x] 1.2 Rewrite `plaintext-labs/ai-augmented-ops/01-hybrid-ai-pattern/lab.md` to the cognitive-load
      template, wrapping the real env; rails validated against actual `make` output.
- [x] 1.3 Interim `mkdocs build --strict` green; owner sanity-check (quick lock before fan-out).

## 2. Rebuild modules 02–11 (parallel fan-out)

- [x] 2.1 `02-running-local-models` — README + cognitive-load lab + case study.
- [x] 2.2 `03-prompt-patterns` — README (prompt-injection class; OWASP LLM01) + lab + seam.
- [x] 2.3 `04-rag` — README (RAG grounding; poisoned-doc / indirect-injection seam) + lab.
- [x] 2.4 `05-building-mcp-servers` — README (MCP tool-scope risk) + lab.
- [x] 2.5 `06-soc-copilot` — README (Slack-AI / Copilot data-exfil seam) + lab.
- [x] 2.6 `07-ai-detection-triage` — README + lab + case study.
- [x] 2.7 `08-soar-ai` — README (human-in-the-loop) + lab + case study.
- [x] 2.8 `09-securing-ai` — README (OWASP LLM Top-10 / MITRE ATLAS) + lab.
- [x] 2.9 `10-attacking-ai` — README (garak/promptfoo; malicious-model supply chain) + lab; authorization note.
- [x] 2.10 `11-ai-evaluation` — README (eval gates) + lab + case study.

## 3. Overview & verify

- [x] 3.1 Rebuild `tracks/12-ai-augmented-ops/README.md` with a phase Mermaid diagram, module table,
      phases/projects, capstone + rubric, AI & automation.
- [x] 3.2 Resolve every `<!-- VALIDATE -->` marker (WebFetch/WebSearch); confirm each link resolves.
- [x] 3.3 Consistency pass: front-matter shape, "Go deeper" (not "Learn"), 2–4 theme-safe diagrams,
      honor-system, lab rails match the real `plaintext-labs/ai-augmented-ops/<NN>` env.
- [x] 3.4 Keep the existing per-module `cheatsheet.md` (confirm each still applies).
- [x] 3.5 `mkdocs build --strict` green; render spot-check (a container lab + a diagram-heavy module).

## 4. Ship

- [ ] 4.1 Commit `plaintext-labs` (11 lab bodies) and `plaintext` (11 READMEs + overview + archived change +
      synced specs) on `track12-aiops-oss500` in both repos.
- [ ] 4.2 Push both; merge into `main` (both repos); confirm the Pages/Cloudflare deploy runs green.
- [ ] 4.3 `openspec archive add-aiops-oss500-edition` (syncs specs); commit the archive.
