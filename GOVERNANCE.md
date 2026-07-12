# Governance

Plaintext is a community-built curriculum, and this document is the part that makes "community-built"
true rather than aspirational: who decides what, how responsibility is earned, and what you can expect
when you contribute. It is deliberately short — process should be the minimum needed for strangers to
collaborate confidently.

## Principles

- **The work is the identity.** Contributors are judged by merged work, not by names, employers, or
  certifications. Pseudonymous contribution is fully welcome — a handle with good PRs outranks a
  résumé, here as on the job. (The project itself operates the same way.)
- **Open by default.** Decisions happen in public — issues, pull requests, and the
  [Discord](COMMUNITY.md). If a decision matters and isn't written down somewhere linkable, it isn't
  decided.
- **Lazy consensus.** Most changes need no vote: propose it, and if nobody objects with reasons within
  a reasonable window, it proceeds. Objections come with reasoning and, ideally, an alternative.
- **The standards are binding.** [`CONTRIBUTING.md`](CONTRIBUTING.md) and [`AUTHORING.md`](AUTHORING.md)
  define what a finished module is; governance covers people and process, not a way around the quality
  bar. Nobody — including maintainers — merges content that skips the validated-lab rule.

## Roles — the contribution ladder

Responsibility is earned in public, one rung at a time. The rungs match the roles in
[`COMMUNITY.md`](COMMUNITY.md), so standing in the repo and standing in the Discord move together.

| Role | How it's earned | What it carries |
|---|---|---|
| **Learner** | Showing up | Everything: the curriculum, the labs, the Discord, filing issues. Learners are the point of the project, not its audience. |
| **Contributor** | One merged PR — any size, a typo fix counts | Listed in the repo history forever (CC BY attribution), `@Contributor` role in Discord, and a genuine thank-you. |
| **Mentor** | Sustained, quality help to other learners (Discord help forums, Discussions, issue triage), recognized by nomination from a maintainer or existing mentor | `@Mentor` in Discord (thread management, pinning), a voice that carries extra weight in content discussions. |
| **Module owner** | Authoring a new module *with its validated lab*, or substantially rebuilding an existing one | First-call reviewer for that module's issues and PRs; their view on changes to it is the default outcome under lazy consensus. |
| **Maintainer** | Sustained ownership plus demonstrated judgment across the project, by invitation of the existing maintainers | Commit access, PR merge rights, release/deploy responsibility, tie-breaking vote. |

Nothing on the ladder requires permission to start. Pick something from the
[roadmap](ROADMAP.md) or the issue tracker, say you're taking it, and do it.

## How decisions get made

- **Content changes** (fixes, Learn-path refreshes, lab improvements): ordinary PR review. The module
  owner reviews if there is one; otherwise any maintainer. The authoring standards decide most
  disagreements before they become arguments.
- **New modules**: proposed via the
  [New Module issue template](.github/ISSUE_TEMPLATE/new-module.md), which is the intake form —
  agree on scope in the issue *before* writing, so nobody drafts a module that can't land.
- **Structural or directional changes** (track layout, authoring model, tooling, this document): open
  an issue marked `proposal`, leave it open at least a week, and let lazy consensus run. Maintainers
  break ties.
- **Final say**: the project currently has a single founding maintainer, who holds the tie-break. The
  explicit goal is to grow to **three or more maintainers** from the contributor base so no single
  person is a bottleneck or a bus-factor — this document gets amended when that happens.

## What you can expect from reviewers

A community project lives or dies on review turnaround, so these are commitments, not aspirations:

- **First response to any PR or module proposal within a few days** — even if it's just "looking at
  this over the weekend."
- **First-time contributors get the warmest, fastest path.** Small fixes get merged quickly; module
  PRs get substantive review that says what "done" looks like, not a drive-by request list.
- **No silent closes.** A PR that can't land gets an explanation and, where possible, a smaller thing
  that can.

If your PR has sat for more than a week with no response, ping it — that's a failure on our side, not
pushiness on yours.

## Stepping back, and removal

Life happens. Module owners and maintainers who go quiet keep their standing for six months, then move
to **emeritus** — celebrated, and reinstated on request when they return. Removal outside of
inactivity happens only for violations of the community rules ([`COMMUNITY.md`](COMMUNITY.md) —
especially the authorization line: we only ever test systems we own or have written permission to
test), by maintainer decision, in writing.

## Changing this document

Governance changes are structural changes: PR against this file, marked `proposal`, open at least a
week. The bar for adding process is high — every rule here should earn its place by making
contribution easier, not by making the project feel important.
