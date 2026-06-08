# Module 10 — Scripting & Automation

**Foundations** — *stop doing by hand what a 20-line script does reliably.*

## Why this matters
Security work is repetition: parsing logs, enriching indicators, calling APIs, reshaping
data. Python is the field's lingua franca because its standard library already covers most
of it. You won't become a software engineer here — you'll learn to automate the boring 80%
so your attention goes to the 20% that needs judgment. It's also where the *AI authors →
you review → you own it* habit begins, because a model will write the script and you have
to read it.

## Objective
Turn a repetitive analysis task into a small, repeatable, reviewable Python tool.

## Learn (~4 hrs)

**Python, fast**
- [Automate the Boring Stuff with Python (free online)](https://automatetheboringstuff.com/) — Al Sweigart's classic; the files, regex, and command-line chapters are the security-automation core. Type along.
- [Corey Schafer — Python tutorials (YouTube)](https://www.youtube.com/playlist?list=PL-osiE80TeTskrapNbzXhwoFUiLCjGgY7) — clear, practical walkthroughs for when a written page doesn't click.

**Regex — the analyst's scalpel**
- [Real Python — Regular Expressions](https://realpython.com/regex-python-part-1/) — the `re` module done properly; you'll reach for this on every log-parsing task.
- [regex101](https://regex101.com/) — build and test your pattern interactively (set the flavour to Python) before it goes into code.

**Reference**
- [Python standard library — `re`, `json`, `pathlib`, `argparse`](https://docs.python.org/3/library/) — the modules a security script actually needs.

## Key concepts
- Reading files and iterating lines
- Regular expressions for extraction (`re`)
- Structured data: JSON in and out
- Functions and the `if __name__ == "__main__"` entry point
- Standard-library HTTP for enrichment

## AI acceleration
A model will happily write the whole parser. Your job is to read it — check the regex
matches, handle the malformed line, confirm it does nothing unintended — then own it.
Typing the code was never the skill; directing and reviewing it is.
