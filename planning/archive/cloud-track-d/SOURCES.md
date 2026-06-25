# Real-breach writeup sources — the anchor mine

*The Verdict track lives on real, public, well-documented breaches. This is the curated catalogue an
author pulls a module's anchor from. Prefer a **primary source** (court filing, regulator report, the
breached company's own post-mortem, the discovering researcher's writeup) over journalism, and over a
vendor blog that's really an ad. Where a breach has a primary filing, cite that first.*

> Link-hygiene rule (from `DESIGN.md`): **do not invent URLs.** Where this file names a source without a
> URL, the author looks it up and validates before citing. Anything marked `<!-- VALIDATE -->` is a real
> thing whose exact current URL must be confirmed at authoring time.

## Curated lists (start here — these are *lists of breaches*, each a menu of anchors)

- **Rami McCarthy — public AWS customer security incidents** (`ramimac.me`). A maintained, sourced list
  of real AWS customer breaches with links to each primary writeup. The single best starting point for
  this track. `<!-- VALIDATE exact URL/title -->`
- **Cloud Security Alliance — "Top Threats: Deep Dive" case studies.** CSA publishes anatomized real
  breaches mapped to threats and controls — written exactly in the "what failed, whose responsibility"
  shape this track wants. `<!-- VALIDATE current edition URL -->`
- **k8s.af — "Kubernetes Failure Stories."** A community list of public, detailed Kubernetes/cloud-native
  failure post-mortems. The anchor mine for the K8s modules (12, 13). `<!-- VALIDATE -->`
- **tl;dr sec & "Last Week in AWS" archives** — newsletter back-issues that round up cloud incidents with
  links to the primary writeups; good for finding the *recent* anchor.
- **DataBreaches.net / the Wikipedia "list of data breaches"** — breadth index to find candidates, then
  chase each to its primary source (never cite the index as the anchor).

## Primary-source classes (cite these as the anchor)

- **Court & regulator filings** — DOJ indictments, SEC enforcement orders, FTC complaints, US Senate /
  congressional committee reports, state AG settlements. These are the gold standard: Capital One has a
  DOJ indictment and a Senate report; Uber 2016 has the FTC complaint and the later DOJ case. Searchable
  on `justice.gov`, `sec.gov`, `ftc.gov`, `hsgac.senate.gov`.
- **The breached company's own incident report** — e.g. LastPass published a multi-part post-mortem of
  its 2022 incidents; Cloudflare, GitLab, and Travis CI have public RCAs. Most credible "whose control"
  source there is.
- **The discovering researcher's writeup** — Wiz Research (ChaosDB, ExtraReplica), Orca, Datadog Security
  Labs, Unit 42, Aqua **Nautilus**, Sysdig **TRT**, Google **Mandiant**, Rhino Security Labs. These give
  the technical chain you need for the *reproduce* beat.

## Reproducible-lab sources (for the "reproduce the hop locally" beat)

- **Vulhub** (`github.com/vulhub/vulhub`) — per-CVE `docker-compose` environments; the default for any
  module whose anchor is a CVE (e.g. **runc CVE-2019-5736** for module 11). Reproduce the real thing.
- **flaws.cloud** and **flaws2.cloud** (Scott Piper) — intentionally vulnerable AWS, attacker *and*
  defender tracks; ideal for the Phase-1 project and the capstone.
- **CloudGoat** (Rhino Security Labs, `github.com/RhinoSecurityLabs/cloudgoat`) — scenario-based AWS
  attack ranges; each scenario models a real attack pattern (IAM privesc, SSRF, etc.).
- **stratus-red-team** (DataDog) and **Pacu** (Rhino) — detonate real ATT&CK-for-Cloud techniques to
  generate telemetry (modules 14–16).
- **Kubernetes Goat**, **kube-hunter**, **MITRE Caldera-for-cloud** — K8s and purple-team ranges.

## Frameworks to map the verdict against

- **MITRE ATT&CK for Cloud and for Containers** — map each breach hop to a technique ID; the verdict memo
  cites these.
- **CIS Benchmarks** (AWS/GCP/Azure/Kubernetes) — the control each guardrail enforces.
- **Cloud provider Well-Architected / security pillars** — the provider's own statement of where the line sits.

## Don't be AWS-only — multi-cloud anchors (good reason to reach outside the box)

The shipped track skews AWS. A stronger Verdict track proves the model is provider-agnostic by anchoring
a few modules on **Azure/GCP** incidents:

- **Storm-0558 (2023)** — a stolen Microsoft signing key forged tokens for Exchange Online/Azure AD; a
  superb federation/identity anchor (pairs with module 02's Golden SAML thread). `<!-- VALIDATE: MSRC + CSRB report -->`
- **ChaosDB (2021, Wiz)** — cross-tenant access to Azure Cosmos DB; the cleanest "provider mechanism vs.
  customer config" Azure case. `<!-- VALIDATE Wiz writeup -->`
- **OMIGOD (2021)** — a silently-installed Azure agent (OMI) RCE; great for the "what did the provider put
  on your box that's now your problem" angle. `<!-- VALIDATE -->`
- **GCP** — the **2018 Tesla Kubernetes** cryptojacking ran on GCP/AWS hybrid; GKE metadata-server SSRF
  writeups (Google/Rhino) parallel Capital One for module 04/12. `<!-- VALIDATE -->`

## How to vet an anchor before committing a module to it

1. Is there a **primary source** (filing or first-party RCA)? If only journalism exists, find a better breach.
2. Is the **technical chain documented** well enough to reproduce a hop locally (or honestly *assess from
   config*)? If not, it can teach the verdict but not the hands-on — note that.
3. Does it produce an **instructive wrong prediction**? The best anchors are ones where the naive verdict
   ("AWS's fault", "the encryption saved them") is wrong — that's the teaching event.
4. Is it **stable and citeable** (won't 404 next year)? Prefer filings and archived RCAs over blog posts.
5. **Freshness across the track** — don't anchor five modules on the same breach. Capital One, Code Spaces,
   Uber, SolarWinds, Tesla, LastPass, Denonia, runc, the 2017 S3 wave, ChaosDB/Storm-0558 give breadth.
