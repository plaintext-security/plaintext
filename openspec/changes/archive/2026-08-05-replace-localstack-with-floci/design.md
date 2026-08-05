## Context

Track 05 (Cloud & Container Security) has 17 modules. Their lab bodies live in the companion
`plaintext-labs` repo under `plaintext-labs/cloud/<NN-module>/` and are surfaced into this repo as
**symlinked `lab.md`** files under `tracks/05-cloud/modules/<NN-module>/lab.md`. Eight of those labs
pin `localstack/localstack` in their `docker-compose.yml`:

```
01 fundamentals   02 iam        03 iam-attack-paths   05 posture(prowler)
07 secrets        09 serverless 14 attack-techniques  17 kms
```

The other nine labs (`04`, `06`, `08`, `10`–`13`, `15`, `16`, capstone) use containers/k8s/IaC
scanners or real free-tier/CloudGoat and are unaffected. LocalStack community edition sunsets
March 2026, so the pinned images and the `awslocal` tool become a liability.

The labs already run tools through the AWS SDK/CLI against `http://localhost:4566`, and the existing
`patch-prowler-localstack.py` confirms the key fact: **boto3 / AWS CLI honor `AWS_ENDPOINT_URL`
natively.** floci exposes the same `4566` endpoint and the same AWS protocol, so it is a drop-in on
the wire.

## Goals / Non-Goals

**Goals:**
- Replace LocalStack with a pinned floci image as the **default** substrate for the 8 labs; `make up`
  works offline, at zero cost, deterministically, and (where feasible) in CI.
- Add an **optional real-AWS route** to the same lab body, selected only by `AWS_ENDPOINT_URL`, so a
  learner can run the identical lab against their own account for genuine enforcement.
- Remove all LocalStack references and the `awslocal` branded wrapper.
- Keep/refresh honesty notes and, where floci can't carry the pedagogy, make the lab real-AWS-first.
- Update Track 05 prose (sunset note + dual-route framing) and keep symlinked labs in sync.

**Non-Goals:**
- Re-authoring lab pedagogy or the `Do` steps beyond the substrate/route change.
- Touching the 9 non-LocalStack labs or the container/k8s toolchain.
- Building a floci abstraction layer or contributing service coverage upstream to floci.
- Guaranteeing every lab is CI-green on floci in this change (coverage may force real-AWS-first for
  some; CI markers are set per lab as they verify).

## Decisions

### D1 — floci-only for this pass; real-AWS route deferred (but kept cheap to add)
**Revised (per direction to "just pivot to floci for now"):** this pass does the straightforward
`localstack → floci` swap and does **not** build a second real-AWS route. `make up`/`make demo` target
floci with `AWS_ENDPOINT_URL=http://floci:4566`. **Why:** simplest, uniform across all 8 labs, and it
still honors zero-cost onboarding. Crucially, because we drive the CLI through the native
`AWS_ENDPOINT_URL` (not `awslocal`), a real-AWS route stays one unset-variable away — so deferring it
costs nothing structurally. A full dual route (`make up-aws`, credential/cost/teardown handling, compose
profiles) is explicitly **out of scope now** and can be added later per the D5 taxonomy. (Labs `17` and
`01`, which were first built with the dual route, are simplified back to the uniform floci-only pattern
for consistency.)

### D2 — Backend selection is one environment variable, threaded through compose + Makefile
The lab body stays backend-agnostic. `docker-compose.yml` gets the floci service (default profile);
the Makefile provides `up` (floci) and `up-aws` (no emulator service, expects real creds in the
environment). Scripts use `aws` with `--endpoint-url "$AWS_ENDPOINT_URL"` when set, else plain `aws`.
**Why:** the AWS SDK/CLI already honor `AWS_ENDPOINT_URL`, so one variable is the entire seam — no
per-lab branching logic. Alternative (separate lab variants per backend) rejected: doubles
maintenance and drifts.

### D3 — Retire `awslocal` for a plain `aws --endpoint-url` alias
`awslocal` is a LocalStack-branded convenience that just presets the endpoint. Replace with an alias
or wrapper that reads `AWS_ENDPOINT_URL`. **Why:** removes the LocalStack dependency and makes the
*same* command work against floci and real AWS. Alternative (keep `awslocal` pointed at floci)
rejected: keeps a dead LocalStack dependency and can't express the real-AWS route.

### D4 — Pin the floci image tag and record its license
Mirror the existing discipline (`localstack:3.7.0`/`3.4.0`) with a specific floci tag. Record the
license in the change. **Why:** reproducibility and CC BY 4.0 redistribution compatibility.
**Open:** exact pinnable tag + license — see Open Questions.

### D5 — Per-lab taxonomy decides how hard the real-AWS route leans
Classify each of the 8 labs by what floci can honestly teach:
- **Emulator-native (floci-primary):** `01`, `02`, `03`, `07`, `17` — API-shape is the lesson; floci
  is the default, real AWS is the optional "prove enforcement" upgrade.
- **Docker-backed heavy:** `09` serverless (real Lambda containers) — floci is the default but is its
  hardest path; verify Lambda works or lean real-AWS.
- **Needs real fidelity (candidate real-AWS-first):** `05` posture (prowler's broad scan) and the
  `14`/capstone detection loop (CloudTrail→GuardDuty→Sigma). floci may only partially serve these; the
  lesson (real posture findings, real detections) may require the real-AWS route to be primary, with
  floci offering a smoke-test or dropped for that part.
**Why:** avoids shipping a misleading emulator demo where the point is real enforcement — matches the
curriculum's honesty ethos and the existing `17` KMS honesty note.

### D6 — Keep prose changes minimal and sync the symlinked labs
Update only the 3 READMEs naming LocalStack plus the track `README.md` (sunset note + dual-route
mention). Lab bodies are edited in `plaintext-labs`; the `tracks/` symlinks then reflect them
automatically. **Why:** `plaintext-labs` is the source of truth for lab bodies; prose bridge changes
are small.

## Risks / Trade-offs

- **floci maturity / coverage gaps** → floci is new (built for the 2026 sunset). Mitigation: gate the
  whole change on a **spike** validating the riskiest labs (`05` prowler, `17` KMS, `09` Lambda,
  `02` IAM simulate) before touching all 8; where a service is missing, fall back to the real-AWS
  route and record it (D5).
- **prowler-on-floci (`05`)** → prowler fires hundreds of calls across many services and already
  needs an STS-endpoint patch + is `.ci-skip`'d for time. Mitigation: treat `05` as most likely
  real-AWS-first; re-evaluate/port or drop `patch-prowler-localstack.py` against floci's STS.
- **IAM `simulate-principal-policy` (`02`)** → if floci doesn't implement policy simulation, the
  "prove the wall holds" step breaks. Mitigation: the lab already evaluates policy logically; keep
  that path and use real AWS for true enforcement.
- **Docker-backed Lambda (`09`)** → floci runs Lambda via real containers; setup is heavier and may
  differ from LocalStack. Mitigation: validate in the spike; document a real-AWS fallback.
- **Detection labs (`14`/capstone)** → no emulator provides GuardDuty or real CloudTrail delivery.
  Mitigation: these lean on shipped sample CloudTrail (Stratus provides events) or real AWS
  regardless of emulator — unchanged by this migration, but call it out.
- **Version pin / license unknown** → could block adoption. Mitigation: resolve in Open Questions
  before merge; if floci can't be pinned/licensed cleanly, narrow scope to labs that can go
  real-AWS-first and hold the rest.
- **CI budget** → some labs may be too slow or too high-fidelity to run in labs-CI. Mitigation: set
  `.ci-demo`/`.ci-skip` per lab only after `make up && make demo && make down` is verified green.

## Migration Plan

1. **Spike (de-risk first).** Stand up floci and validate the riskiest labs — `17-kms`, `05-posture`,
   `09-serverless`, `02-iam` — recording which APIs work and which force the real-AWS route. Confirm a
   pinnable tag and license.
2. **Establish the dual-route pattern** on one clean emulator-native lab (e.g. `17-kms`): floci
   default via `AWS_ENDPOINT_URL`, `make up` + `make up-aws`, `awslocal`→`aws` alias. This becomes the
   template.
3. **Roll the pattern across the remaining emulator-native labs** (`01`, `02`, `03`, `07`), then the
   Docker-backed (`09`), applying the taxonomy (D5).
4. **Resolve the real-fidelity labs** (`05`, `14`/capstone): decide floci-partial vs real-AWS-first,
   port/replace the prowler patch, wire the real-AWS route as primary where needed.
5. **Update Track 05 prose** — sunset note, dual-route framing, de-LocalStack the 3 READMEs; verify
   symlinked labs stay in sync; `mkdocs build --strict` passes.
6. **CI markers** — set `.ci-demo`/`.ci-skip` per lab after a green `make up && make demo && make
   down` run on a Linux runner.
- **Rollback:** the change is per-lab and additive on the route seam; if floci proves unworkable for a
  lab, that lab reverts to real-AWS-first (or holds) without affecting the others.

## Open Questions

- Which floci tag is stable and pinnable, and what is its license (CC BY 4.0-redistribution safe)?
- Does floci implement `iam simulate-principal-policy` well enough for lab `02`, or does that step go
  real-AWS-only?
- Does prowler run usefully against floci (STS + service coverage), or is `05` real-AWS-first?
- Is floci's Docker-backed Lambda fidelity sufficient for `09`'s execution-role pedagogy?
- Do `make up-aws` routes need a shared helper/scaffold in `plaintext-labs`, or is per-lab docs enough?
