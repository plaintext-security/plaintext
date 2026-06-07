# Contributing to Plaintext

Thanks for helping make security education free and open.

## How to contribute

1. Fork the repo
2. Create a branch: `git checkout -b feat/your-module-name`
3. Add your content following the structure below
4. Submit a pull request

## Module structure

Each module lives at `tracks/<track>/modules/<number>-<name>/` and contains:

- `README.md` — Concept explanation (your own original writing, no copying from
  proprietary sources)
- `lab.md` — Hands-on exercise using only OSS tools

## Content rules

- Write everything in your own words from primary sources
- Only reference and use open source tools
- No copying from SANS, Offensive Security, or other proprietary course materials
- Labs must be reproducible with free tools only
- Cite your sources (CVEs, RFCs, tool docs, research papers)

## Module README template

```markdown
# Module Title

## Objective
What the learner will understand after this module.

## Background
Core concept explanation (written originally).

## Key concepts
- Concept 1
- Concept 2

## Further reading
- Link to RFC / CVE / OSS docs
```

## Lab template

```markdown
# Lab: Title

## Setup
Tools needed and how to install them.

## Scenario
What you're trying to do and why.

## Steps
1. Step one
2. Step two

## Expected output
What success looks like.

## Questions
1. What did you observe?
2. How would you defend against this?
```
