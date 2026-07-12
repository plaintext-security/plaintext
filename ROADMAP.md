# Roadmap

This is the public map of where Plaintext is and what's wanted next — so a stranger can find where
they fit without asking permission. (The maintainers' fine-grained work board is [`TODO.md`](TODO.md);
this file is the community-facing view. Governance and the contribution ladder live in
[`GOVERNANCE.md`](GOVERNANCE.md).)

**How to claim something:** open or comment on an issue saying you're taking it, so work isn't
duplicated. For a new module, use the
[New Module issue template](.github/ISSUE_TEMPLATE/new-module.md) and agree scope in the issue before
writing. Then it's yours.

## Where the project is

Thirteen tracks are live — foundations through offense, defense, forensics, malware, cloud, Active
Directory, hardening, cryptography, Python, automation, ZTNA, and AI-augmented ops — each module
pairing concept prose here with a runnable lab in
[`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs). Most labs are CI-validated
(the `.ci-demo` marker means `make up && make demo && make down` is proven green on a clean runner).
A redesign toward the type-driven authoring model ([`AUTHORING.md`](AUTHORING.md)) is in progress:
new and substantially-edited modules follow it; older modules migrate as they're touched.

## Now — the maintainers' current focus

- **Lab validation loop**: re-run the labs survey CI, fix the genuine prose↔environment mismatches it
  surfaces, and promote newly green labs to `.ci-demo`.
- **Prose quality sweep**: per-track papercut pass, and adoption of the richer "deluxe" module
  presentation (summaries, admonitions, self-check questions) as modules are edited.
- **Community launch**: the Discord ([`COMMUNITY.md`](COMMUNITY.md)) going live, an office-hours
  cadence, and the first showcase entries.

## Help wanted — claim one

Roughly in ascending order of effort; every one of these is a real contribution, and the first rung of
the [ladder](GOVERNANCE.md#roles--the-contribution-ladder):

- **Fix a papercut.** Typos, broken or stale links, a Learn resource that has moved or been superseded
  by something better. One-file PRs are welcome and get merged fast.
- **Refresh a Learn path.** Pick a module, verify every link still resolves to the specific resource
  it claims, and improve the why-lines. The freshness rule in
  [`CONTRIBUTING.md`](CONTRIBUTING.md#content-rules) is the bar.
- **Harden a lab.** Run a lab in [`plaintext-labs`](https://github.com/plaintext-security/plaintext-labs)
  on your machine; anything that doesn't work first try is a bug worth filing or fixing. Labs that
  pass cleanly but lack a `.ci-demo` marker are candidates for promotion.
- **Test a track end-to-end as a learner.** Clone fresh, follow the instructions exactly as written,
  and file everything confusing. "I got stuck here" is high-value feedback — the authors can no longer
  see their own curriculum with fresh eyes.
- **Author a module.** Propose it via the issue template first. The type library
  ([`planning/MODULE-TYPE-LIBRARY.md`](planning/MODULE-TYPE-LIBRARY.md)) and
  [`AUTHORING.md`](AUTHORING.md) define the shape; a module ships *with* its validated lab. Landing
  one makes you its owner.
- **Mentor.** Answer questions in the Discord help forums and GitHub Discussions. Sustained help is
  its own rung on the ladder.
- **Translate.** The curriculum is CC BY 4.0 — translations are welcome as forks or, coordinated via
  an issue first, in-tree. If you want to lead a language, open an issue.
- **Show your work.** Finished a capstone? Submit it to the showcase and post it in `#wins` — learner
  proof is the strongest argument this model works.

## Later — direction, not commitments

- **More maintainers.** The explicit goal in [`GOVERNANCE.md`](GOVERNANCE.md) is three or more
  maintainers grown from the contributor base.
- **New tracks and modules** driven by what the community proposes and what jobs actually demand —
  the intake is the issue template, not a private list.
- **Learner-experience improvements** informed by end-to-end track testing: better onboarding
  (`start-here`), clearer prerequisites, and whatever the first cohorts stumble on.

This file changes by PR like everything else. If you think the priorities are wrong, that's a
`proposal` issue — see [`GOVERNANCE.md`](GOVERNANCE.md#how-decisions-get-made).
