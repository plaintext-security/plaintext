# Plaintext Community

We learn in the open. The community home is **Discord** — real-time help, study rooms, and a
searchable knowledge base of lab gotchas — alongside per-page **GitHub Discussions** comments on
the site itself.

> **Join the Discord:** <https://discord.gg/sZjQYqVvG> — also linked from the README badge, the
> landing-page hero, and the site footer.

Discord and the site comments are complementary, not redundant: comment on a specific lesson via
giscus on its page; bring live questions, "did this work for you?", and show-your-work to Discord.

---

## Server setup

Enable **Community** in Server Settings first (unlocks the Welcome Screen, rules screening, forum
channels, and onboarding).

### Channels

```
📌 START HERE
   # welcome            (read-only)
   # rules              (read-only — rules screening points here)
   # announcements      (read-only)
   # introduce-yourself

💬 COMMUNITY
   # general
   # wins               (portfolio pieces, capstones, first jobs — "show your work")
   # resources          (share links, tools, write-ups)
   # career-and-jobs
   # off-topic

🎓 HELP  (Forum channels — one post = one question, stays searchable. One per track.)
   # 00-foundations-help
   # 01-offensive-help
   # 02-defensive-help
   # 03-forensics-help
   # 04-malware-help
   # 05-cloud-help
   # 06-active-directory-help
   # 07-endpoint-hardening-help
   # 08-cryptography-help
   # 09-python-help
   # 10-automation-help
   # 11-ztna-help
   # 12-ai-ops-help
   # labs-and-docker          (cross-cutting: env / Makefile / compose issues — the busiest channel)

🛠 CONTRIBUTE
   # contributing       (PRs, the hybrid-module model, CONTRIBUTING.md)
   # module-proposals   (Forum — mirrors the new-module issue template)
   # site-and-bugs

🔊 VOICE
   🎙 Office Hours
   📚 Study Room 1
   📚 Study Room 2
   🧑‍💻 Co-working
```

Use **Forum** channels for the HELP category: each question becomes its own searchable thread with
a "Solved" tag, so the community becomes a knowledge base instead of a scrolling wall. The number
prefixes mirror the curriculum's track numbering (`00`–`12`) so a channel maps 1:1 to a track and
sorts in order. The AI-acceleration thread runs through every module, so AI questions go in that
track's help channel; `#12-ai-ops-help` is for the AI-Augmented Ops track and AI-tooling chat.

Tip for launch: 13 forum channels can feel empty on day one. Optional — start with the
highest-traffic ones visible (`00`/`01`/`02` + `#labs-and-docker`) and reveal each remaining track
channel as its first cohort arrives. The track self-assign roles let you @-mention a cohort when you
open theirs.

### Roles

| Role | Who | Notes |
|---|---|---|
| `@Maintainer` | you / admins | full perms |
| `@Mentor` | trusted helpers | manage threads, pin |
| `@Contributor` | anyone with a merged PR | hand-assign as a thank-you |
| `@Member` | passed rules screening | base role; gates the server |
| **Track roles** (self-assign) | everyone | `@Foundations` `@Offensive` `@Defensive` `@Forensics` `@Malware` `@Cloud` `@AD` `@Crypto` `@Python` `@Automation` `@ZTNA` `@AI-Ops` — find track peers, @-mention a cohort |

Assign track roles via **Onboarding** ("Which track are you on?" → multi-select) or a reaction-role
bot (Carl-bot / Mee6) in a `#pick-your-tracks` post.

---

## Seed text

### `#welcome`

```
# Welcome to Plaintext 🔓

The open security-education curriculum — SANS-grade depth, $0 paywall, CC BY 4.0.
Hands-on tracks from foundations through offense, defense, cloud, and AI-augmented ops —
every module ends in something you BUILD and own.

📚 Curriculum → https://plaintext-security.github.io/plaintext/
💻 Repos      → github.com/plaintext-security/plaintext  ·  /plaintext-labs

Start here:
→ Read #rules
→ Say hi in #introduce-yourself
→ Grab your track roles in onboarding, then jump into the matching *-help forum
→ Stuck on a lab? #labs-and-docker is the place

We learn in the open. Share your wins in #wins — half of getting hired is having proof.
```

### `#rules`

```
**Plaintext Community Rules**

1. **Be decent.** No harassment, hate, or gatekeeping. Everyone started at zero.
2. **Hack only what's yours.** This is the line that matters. Only ever test systems you
   own or have explicit written permission to test. Use the intentionally-vulnerable targets
   the labs point you to (DVWA, Juice Shop, Vulhub, CloudGoat, CTF rooms) — never live/third-party
   systems. We don't help with attacks on systems you don't own. No "asking for a friend."
3. **No illegal goods.** No real malware samples, stolen data, credentials, pirated course
   material (SANS/OffSec/etc.), or cracking-for-hire. Link to safe sources (MalwareBazaar et al.),
   don't drop binaries here.
4. **Ask well.** Search the help forums first. Share what you tried, the exact error, and your
   environment. "It doesn't work" gets "what doesn't?"
5. **No spam / self-promo** without a maintainer's OK. Sharing your own write-ups in #resources
   or #wins is welcome.
6. **English in shared channels** so help stays searchable.
7. **Respect the license.** Curriculum is CC BY 4.0 — credit Plaintext when you reuse it.

Breaking #2 or #3 is an instant removal. By staying you agree to these and Discord's ToS.
```

### `#announcements` (seed post)

```
🚀 **Plaintext community is live.**

The curriculum's been public for a while — now there's a room to learn in together.
Newest drop: **PowerShell tradecraft** (offensive) and **PowerShell logging & hunting**
(defensive), labs included.

Pick your tracks above, introduce yourself, and post your first win when you land it.
Office Hours schedule coming soon — react 🎙 if you'd join a weekly call.
```

### `#introduce-yourself` (pinned template)

```
Drop a quick intro:
• Name / handle:
• Where you're coming from (student, switching careers, defender leveling up offense…):
• Track you're starting:
• What you want out of this (first SOC job, OSCP-equivalent skills, just curious…):
```

### Forum-channel guidelines (pin in each `*-help`)

```
One question = one post. Give it a clear title ("Vulhub CVE-2021-… container exits on `make up`").
Include: the module/lab, exact command + full error, and OS/Docker version.
Mark it ✅ Solved (post tag) when it's sorted — future learners will thank you.
```
