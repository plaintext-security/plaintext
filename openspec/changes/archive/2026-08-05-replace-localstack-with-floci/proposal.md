## Why

LocalStack's community edition sunsets in March 2026, so the 8 Track 05 labs that depend on
`localstack/localstack` will lose their zero-cost, offline AWS substrate — breaking the track's
"reproducible at zero cost" guarantee. [floci](https://github.com/floci-io/floci) is a free/OSS
AWS local emulator built as a direct answer to that sunset, and it is a drop-in on the *same wire*:
the same `http://localhost:4566` endpoint the labs already target. That single fact lets us both
replace LocalStack **and** — because the AWS SDK/CLI natively honor `AWS_ENDPOINT_URL` — offer a
second, high-fidelity "just use real AWS" route from one lab body, at almost no extra cost.

## What Changes

- **Swap the emulator backend on the 8 LocalStack-dependent cloud labs** (in `plaintext-labs/cloud/`,
  surfaced into `tracks/05-cloud` via symlinked `lab.md`): `01-cloud-fundamentals`,
  `02-cloud-identity-iam`, `03-iam-attack-paths`, `05-posture-auditing`, `07-secrets-management`,
  `09-serverless-security`, `14-cloud-attack-techniques`, `17-data-protection-kms`. Each
  `docker-compose.yml` moves from `localstack/localstack:<tag>` to a **pinned floci image**, keeping
  port `4566`, and the LocalStack-branded `awslocal` is replaced by a plain
  `aws --endpoint-url`/`AWS_ENDPOINT_URL` alias so nothing else in the lab body changes.
- **floci is the (only) route this pass** — `make up` / `make demo` run entirely on floci: offline,
  deterministic, CI-able, no cloud account. **Scope revised per direction ("just pivot to floci for
  now"):** the straightforward `localstack → floci` swap only; a full real-AWS `make up-aws` route is
  **deferred**.
- **Labs stay endpoint-agnostic** — by driving the CLI through the native `AWS_ENDPOINT_URL` (not the
  branded `awslocal`), the *same* lab body can later run against real AWS by unsetting one variable, so
  deferring the real-AWS route costs nothing structurally.
- **Add the LocalStack-sunset teachable note** to Track 05 prose — a short, real-world note framing
  the migration as an OSS-sustainability event (fits the track's "tie it to the real world" ethos).
- **Preserve honesty notes** — where floci simulates an API without enforcing it (e.g. KMS key
  policy, IAM), keep/refresh the existing "the emulator fakes the API, not the enforcement — the
  real-AWS route proves it" caveats.
- Per-lab coverage caveats (see design.md) are recorded where floci cannot fully stand in for a
  service; the affected labs point the learner at the real-AWS route for the parts that need it.
- **Non-goals:** the 9 non-LocalStack labs (`04`, `06`, `08`, `10`–`13`, `15`, `16`, capstone) are
  out of scope; this change does not re-author lab *pedagogy*, only the emulator substrate and the
  new dual-route selection.

## Capabilities

### New Capabilities
- `cloud-track-emulator-runtime`: The zero-cost local AWS substrate for Track 05's emulator-dependent
  labs — floci as the default `make up` backend, an optional real-AWS `make up-aws` fidelity route
  selected by `AWS_ENDPOINT_URL`, version-pinning/licensing requirements for the emulator image, and
  per-lab coverage/honesty caveats.

### Modified Capabilities
<!-- No existing spec's requirements change; the affected labs live in plaintext-labs and are governed by the new capability above. -->

## Impact

- **`plaintext-labs/cloud/`** — 8 labs' `docker-compose.yml`, `Dockerfile`, `Makefile`, and
  `data/setup.sh`/scan scripts. Notably `05-posture-auditing` (prowler) already carries a
  `patch-prowler-localstack.py` source patch and a `.ci-skip`; its patch and CI posture must be
  re-evaluated against floci (and it is the strongest candidate to become **real-AWS-first**).
- **`tracks/05-cloud/`** — the 3 prose files that name LocalStack (`02`, `14`, `17` READMEs), the
  track `README.md` (sunset note + dual-route mention), and the symlinked lab bodies stay in sync.
- **Dependencies** — introduces a floci image pin (replacing the `localstack/localstack` pins);
  removes the hard dependency on the sunsetting LocalStack community image and the `awslocal` package.
- **CI (`plaintext-labs` labs-ci)** — `.ci-demo`/`.ci-skip` markers revisited per lab once
  `make up && make demo && make down` is verified green on floci.
- **Risks to resolve in design** — floci maturity/pinnable-tags/license; prowler-on-floci coverage
  (lab 05); `iam simulate-principal-policy` (lab 02) and Docker-backed Lambda (lab 09) coverage;
  detection labs (14/capstone) still need real CloudTrail/GuardDuty or shipped sample events
  regardless of emulator choice.
