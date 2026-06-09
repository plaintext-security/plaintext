# Plaintext Community

We learn in the open. The community home is **Discord** — real-time help, study rooms, and a
searchable knowledge base of lab gotchas — alongside per-page **GitHub Discussions** comments on
the site itself.

> **Discord invite:** _add the invite link here once the server is live_, then surface it as a
> badge in `README.md` and a button in the landing hero (`overrides/home.html`).

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

🎓 HELP  (Forum channels — one post = one question, stays searchable)
   # foundations-help
   # offensive-help
   # defensive-help
   # other-tracks-help  (forensics / malware / cloud / AD / crypto / ztna … until each earns its own)
   # labs-and-docker    (env / Makefile / compose issues — the busiest help channel)
   # ai-and-automation  (the AI-acceleration thread that runs through every module)

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
a "Solved" tag, so the community becomes a knowledge base instead of a scrolling wall.

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
