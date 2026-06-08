# Module 11 — Version Control & Working in the Open

**Foundations** — *if it isn't committed, it didn't happen — and this whole curriculum is "commit the artifact."*

## Why this matters
Every capstone and deliverable here is "commit it to git." Version control is how you build a
portfolio, collaborate, and prove your work — and it's where secrets get leaked when people
are careless (the reason this repo ships a `.gitignore`). Git fluency is table stakes for any
security role that touches detection-as-code, IaC, or tooling.

## Objective
Use git confidently — branch, commit, push, and collaborate via pull requests — and keep
secrets and artifacts out of history.

## Learn (~3 hrs)

**Git, properly**
- [Pro Git (free book)](https://git-scm.com/book/en/v2) — chapters 1–3 are the durable foundation; read, don't skim.
- [GitHub Skills](https://skills.github.com/) — short, interactive courses (intro, branching, pull requests) you do *in* a repo.
- [freeCodeCamp — Git & GitHub crash course (YouTube)](https://www.youtube.com/watch?v=RGOj5yH7evk) — a fast video pass if the book feels heavy.

**Hygiene**
- [git docs — gitignore](https://git-scm.com/docs/gitignore) — and study this repo's own `.gitignore` for what a security project must exclude.

## Key concepts
- Repos, commits, branches, and history
- Remotes: clone, push, pull
- Collaboration via fork + pull request
- `.gitignore` and keeping secrets/artifacts out of history
- Why a leaked secret in history is leaked *forever* (rotate, don't just delete)

## AI acceleration
Models are great at explaining a git error or drafting a commit message — but they'll also
confidently suggest history-rewriting commands (`reset --hard`, force-push) that can destroy
work. Understand any state-changing git command before you run it.
