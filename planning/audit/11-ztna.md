# Audit: 11-ztna

**Verdict:** NOT DONE — strong prose throughout and de-Meridian clean, but 5 BLOCKERs: two spec-only labs (expected), one half-built lab (09 ships only stage 1 of a 3-stage promise), and two broken-command labs (01, 02). Two orphaned modules + numbering collision unresolved in track README.

## Per-module findings

- **01-zero-trust-principles** — [BLOCKER] lab.md cites seed files `data/access-map.md` + `data/colonial-timeline.md` but env ships only `data/corp-access-map.md` (timeline file absent, access-map misnamed); [CONSISTENCY] type tag "*Variant D · …*" not required "*Type N · …*" form; [POLISH] no BASELINE/DELUXE tiers.
- **02-identity-control-plane** — [BLOCKER] realm/file mismatch: lab.md uses realm `ztna-lab` + `data/realm.json` + `/realms/ztna-lab/...` URLs, but env uses `corp` / `data/corp-realm.json` / `/realms/corp/...` — every curl/JWKS path is wrong; [POLISH] no BASELINE/DELUXE tiers.
- **03-device-trust-posture** — [CONSISTENCY] lab.md hardcodes docker net `ztna-03_ztna-net` but compose project prefix derives from dir `03-device-trust-posture` (net `ztna-net`) — probe cmd fails; [CONSISTENCY] headscale "on 8080" but compose maps `8088:8080`; [POLISH] ACL HuJSON-in-.yaml cosmetic, no tiers.
- **04-ztna-architectures** — [CONSISTENCY] type tag mixes deprecated "*Variant D · Type 11 …*"; [POLISH] no BASELINE/DELUXE tiers; otherwise clean (full anatomy, original core idea, auth note, score-architecture.py).
- **05-sase-cloud-delivered** — [CONSISTENCY] compose `ports: "8090:80"` binds 0.0.0.0 but lab step 1/6 claim loopback-only + has learner verify "bound to loopback only" — contradicts; needs `127.0.0.1:8090:80`; [POLISH] no tiers.
- **06-identity-aware-access** — clean (real CVE-2026-40575 OAuth2-Proxy anchor, Pomerium env w/ up/down/demo, auth note, check-deny.sh); [POLISH] no tiers, `@corp.com` placeholders acceptable.
- **07-microsegmentation** — clean (kind+Cilium env, NotPetya/Maersk anchor, verify-policy.sh, auth note); [POLISH] `.ci-skip` marker (intentional for kind/VM), no formal tiers.
- **08-policy-as-code** — clean (pinned OPA 0.68.0 env w/ up/down/demo/test/ci, fail-open core idea, gate.sh, correctly no auth note); [POLISH] no tiers.
- **09-monitoring-detection** — [BLOCKER] lab promises 3-stage build (`make eval`/`gate`/`drift`, eval.py, drift.py, heldout/, baseline/) but env implements ONLY stage 1 (Makefile up/down/reset/demo/shell/convert/detect; only detect.py + access-logs.jsonl) — Success criteria/Deliverables/Do stages 2-3 unperformable; [CONSISTENCY] README otherwise clean; [POLISH] no tiers.
- **10-vpn-ztna-migration** — [BLOCKER] spec-only (lab.md only, no Makefile/env; "to be built at promotion"); [CONSISTENCY] number is TBD `<NN>` placeholders, orphaned from track README; prose strong (strangler-fig, Colonial AA21-131A); [POLISH] no tiers.
- **10-workload-identity-mtls** — clean (real SPIRE env: up/down/mtls/deny/check/demo, attestation+deny proof, 5-para core idea, auth note); [POLISH] no tiers, lab.md missing top Type tag line that README carries.
- **11-redteam-zt-deployment** — [BLOCKER] spec-only (lab.md only, no Makefile/env; "to build at promotion"); [CONSISTENCY] cd-path mismatch: Setup `cd .../redteam-zt-deployment` vs spec dir `.../<NN>-redteam-zt/`; prose strong w/ CVE-2026-40575, prominent auth note; [POLISH] no tiers.
- **Track-root README + collision** — [CONSISTENCY] numbering collision NOT reflected: README table/nav list only 01-10, module 10 = `10-workload-identity-mtls` only; `10-vpn-ztna-migration` + `11-redteam-zt-deployment` orphaned (not in table/phases/capstone); both unpromoted/TBD — known pre-promotion state.

## Counts
- BLOCKER: 5 (modules 01, 02, 09, 10-vpn spec-only, 11-redteam spec-only)
- CONSISTENCY: 8 (01, 02, 03, 04, 05, 10-vpn, 11-redteam, track-root)
- POLISH: ~12 (BASELINE/DELUXE tiers absent track-wide; minor naming/tag nits)
- de-Meridian: CLEAN (zero "Meridian" occurrences; "Corp" used as lab-data org)

## Top-3 fixes
1. Fix broken lab commands: 01 (seed filenames `corp-access-map.md`, missing colonial-timeline) and 02 (`ztna-lab`/`realm.json` → `corp`/`corp-realm.json` everywhere). Copy-paste-breaking.
2. 09-monitoring-detection: either build stages 2-3 (eval.py/drift.py/heldout/baseline + make eval/gate/drift) or scope lab.md/README down to the stage-1 env that actually ships.
3. Resolve numbering collision + orphans: assign real numbers to `10-vpn-ztna-migration` and `11-redteam-zt-deployment`, build their labs (currently spec-only), and add them to the track-root README table/nav/phases.
