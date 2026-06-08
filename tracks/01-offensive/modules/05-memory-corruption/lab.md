# Lab 05 — Overflow a Buffer and Take Control

## Setup
Docker-first — a build environment for a tiny vulnerable C program (mitigations off, for
learning):
```bash
docker run --rm -it -v "$PWD":/work -w /work gcc:13 bash
# compile with protections disabled so the concept is visible:
#   gcc -fno-stack-protector -z execstack -no-pie vuln.c -o vuln
```

## Scenario
Write (or use) a deliberately vulnerable C program, overflow its buffer, and observe how that
lets you change what the program does.

> Do this only in the throwaway container / your own lab.

## Do
1. [ ] Build a small C program that copies unbounded input into a fixed-size buffer
   (mitigations disabled).
2. [ ] Feed it growing input until it crashes — and work out *why* it crashed (what got
   overwritten?).
3. [ ] Find the exact offset at which your input controls the saved return address.
4. [ ] Redirect execution to a different function (or your shellcode) to prove control.

## Success criteria — you're done when
- [ ] You can explain what your overflow overwrote and why it crashed.
- [ ] You found the offset that controls the instruction pointer.
- [ ] You redirected execution somewhere of your choosing.

## Deliverables
`overflow.md`: the vulnerable code, the offset you found, and a paragraph on how the overflow
hijacks control. (Don't commit the compiled binary.)

## AI acceleration
Have a model explain each crash and help you read the disassembly — then verify in the
debugger. The model accelerates understanding; the debugger is ground truth.

## Connects forward
This demystifies the vulnerability classes the rest of Offensive and Track 04 (malware)
reference; deeper exploit development is its own advanced path.

## Marketable proof
> "I can explain and demonstrate a stack buffer overflow — from crash to controlled
> instruction pointer — so memory-corruption CVEs aren't a black box to me."

## Automate & own it
**Required.** Script the offset discovery and exploit-input generation (a few lines of
Python/pwntools); AI drafts it, you confirm it in the debugger; commit it (not the binary).

## Stretch
- Turn ASLR, then the stack canary, back on one at a time and see what breaks — and why those
  mitigations exist.
