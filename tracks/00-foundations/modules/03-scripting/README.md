# Module 03 — Scripting & Automation

## Objective
Turn repetitive security analysis into small, repeatable Python tools.

## Background
Security work is full of repetition: parsing logs, enriching indicators, calling APIs,
reshaping data. Python is the field's lingua franca because its standard library already
covers most of it (files, regex, JSON, HTTP) and the ecosystem covers the rest. The goal
isn't to become a software engineer — it's to stop doing by hand what a 20-line script
does reliably.

## Key concepts
- Reading files and iterating over lines
- Regular expressions for extraction (`re`)
- Structured data: JSON in and out
- Functions and the `if __name__ == "__main__"` entry point
- Standard-library HTTP (`urllib`) for enrichment

## AI acceleration
This is where "AI authors → you review → you own it" gets real: a model will happily write
the whole parser. Your job is to read it — check the regex actually matches, handle the
empty or malformed line, confirm it does nothing you didn't intend — then own it.

## Further reading
- Python standard library (`re`, `json`, `pathlib`): https://docs.python.org/3/library/
- PEP 8 style guide: https://peps.python.org/pep-0008/
- OWASP Logging Cheat Sheet: https://cheatsheetseries.owasp.org/cheatsheets/Logging_Cheat_Sheet.html
