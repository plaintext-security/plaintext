---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — LLM-Native PowerShell & an MCP Surface

*Companion to [Module 07 — LLM-Native PowerShell & an MCP Surface](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The trust-boundary view of tool-calling

```text
model context  ──►  MODEL  ──►  MCP client  ──►  tools/call {name, arguments}  ──►  YOUR handler
   (attacker can                 (transport:                                          ▲
    prompt-inject                 stdio / HTTP)                                        │
    upstream)                                                    everything crossing this line
                                                                is UNTRUSTED INPUT — validate it
```

The `inputSchema` you advertise is a hint **to the model**. It enforces nothing on your side. The security
control is the validation **in your handler** — write it as if the schema didn't exist.

## MCP tool-definition shape (advertised in `tools/list`)

```powershell
@{
    name        = 'Get-VigilEvent'                       # the tool the model calls
    description = 'Return suspicious Windows events from a bundled log. READ-ONLY.'
    inputSchema = @{                                     # JSON Schema — a HINT to the model
        type       = 'object'
        properties = @{
            severity = @{ type = 'string'; enum = @('Low','Medium','High') }  # tight: enumerated
            source   = @{ type = 'string'; enum = @('sample','sysmon') }      # tight: allow-list
        }
        required             = @('source')
        additionalProperties = $false                    # no free-form fields
    }
}
```

Keep schemas tight: enumerate values, no `command`/`script`/free-text field, `additionalProperties=$false`.
Tight schema **plus** handler re-validation — two separate jobs.

## Expose only read-only verbs (the surface IS the control)

```powershell
# The registry is an explicit allow-list. There is no destructive tool to call.
$script:VigilTools = @{
    'Get-VigilEvent'      = { param($a) Invoke-VigilGetEvent      @a }   # Get-  : read-only
    'Read-VigilEnrichment'= { param($a) Invoke-VigilEnrichment    @a }   # Read- : read-only
}                                                                        # NO Set-/Remove-/Invoke-

function Resolve-VigilTool {
    param([string]$Name)
    if (-not $script:VigilTools.ContainsKey($Name)) {
        throw "unknown or non-exposed tool: $Name"   # -> clean MCP error, not a fallback run
    }
    $script:VigilTools[$Name]
}
```

A prompt-injected model's worst case is calling a tool that exists and is read-only. It cannot call what you
never registered.

## Validating tool args — allow-list, typed parse, path confinement

```powershell
# 1. Enumerated field -> ValidateSet (reject anything not in the set)
function Test-VigilSeverity {
    param([ValidateSet('Low','Medium','High')][string]$Severity)
    $Severity                                            # returns only on a valid value; else throws
}

# 2. Typed field -> parse, don't trust the JSON string
[int]$count = 0
if (-not [int]::TryParse($arguments.count, [ref]$count)) { throw 'count: not an integer' }

# 3. Path-like field -> resolve + confine to an allowed root (reject .., absolute escape, symlink out)
function Resolve-VigilSafePath {
    param([string]$Candidate, [string]$Root)
    $full = [System.IO.Path]::GetFullPath((Join-Path $Root $Candidate))
    $rootFull = [System.IO.Path]::GetFullPath($Root)
    if (-not $full.StartsWith($rootFull + [System.IO.Path]::DirectorySeparatorChar)) {
        throw "path escapes allowed root: $Candidate"
    }
    $full
}
```

The move is always: **loosest thing the model can send → tightest thing your cmdlet needs**, rejecting
everything in between. A failed check throws → your handler returns an MCP error result, never a coerced run.

## Never pass model output into anything executable

```powershell
# WRONG — model output crosses into an executable string (LLM injection)
Invoke-Expression $arguments.filter                     # NEVER
Get-Content $arguments.path                              # unconfined path = arbitrary read

# RIGHT — typed, named, validated fields only
$sev  = Test-VigilSeverity -Severity $arguments.severity
$path = Resolve-VigilSafePath -Candidate $arguments.source -Root $DataRoot
Get-VigilEvent -Path $path -Severity $sev               # cmdlet gets only validated, typed values
```

## Minimal JSON-RPC / stdio handler (offline, no SDK)

```powershell
function Invoke-VigilMcpRequest {
    param([Parameter(Mandatory)][string]$Json)          # one JSON-RPC request in, one response out
    $req = $Json | ConvertFrom-Json
    $result = switch ($req.method) {
        'initialize' { @{ protocolVersion = '2025-06-18'; serverInfo = @{ name = 'vigil'; version = '0.7.0' } } }
        'tools/list' { @{ tools = Get-VigilToolDefinitions } }
        'tools/call' {
            $handler = Resolve-VigilTool -Name $req.params.name       # allow-list gate
            $args    = ConvertTo-VigilValidatedArgument -Name $req.params.name -Raw $req.params.arguments  # validate!
            @{ content = @(@{ type = 'text'; text = (& $handler $args | ConvertTo-Json -Depth 5) }) }
        }
        default { throw "unsupported method: $($req.method)" }
    }
    @{ jsonrpc = '2.0'; id = $req.id; result = $result } | ConvertTo-Json -Depth 8
}
```

A validation `throw` becomes a JSON-RPC `error` object the model can see — a safe rejection, not a partial run.

## Pester — prove the boundary holds

```powershell
Describe 'Vigil MCP surface' {
    It 'returns objects for a good tools/call' {
        $r = Invoke-VigilMcpRequest -Json $goodCall | ConvertFrom-Json
        $r.result.content | Should -Not -BeNullOrEmpty
    }
    It 'rejects a path-traversal argument' {
        { ConvertTo-VigilValidatedArgument -Name 'Get-VigilEvent' -Raw @{ source = '../../etc/passwd' } } |
            Should -Throw
    }
    It 'rejects an out-of-set severity' {
        { Test-VigilSeverity -Severity "'; Remove-Item" } | Should -Throw
    }
    It 'exposes no state-changing verb' {
        $script:VigilTools.Keys | ForEach-Object { $_ | Should -Not -Match '^(Set|Remove|New|Invoke|Start|Stop)-' }
    }
}
```

## The one-line rule

> **The tool arguments the model sends are the least-trusted input in the pipeline — parse, allow-list, and
> type them before they touch a cmdlet, expose only read-only verbs, and never let model output reach
> anything executable.**
