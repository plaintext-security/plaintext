## ADDED Requirements

### Requirement: floci is the default zero-cost emulator for the LocalStack-dependent Track 05 labs

The 8 Track 05 labs that currently depend on LocalStack SHALL run their default `make up` / `make
demo` against [floci](https://github.com/floci-io/floci) instead of `localstack/localstack`. The
affected labs (in `plaintext-labs/cloud/`) are `01-cloud-fundamentals`, `02-cloud-identity-iam`,
`03-iam-attack-paths`, `05-posture-auditing`, `07-secrets-management`, `09-serverless-security`,
`14-cloud-attack-techniques`, and `17-data-protection-kms`. The floci image
MUST be pinned to a specific published tag (not `latest`) so labs stay reproducible, and its license
MUST be compatible with redistribution in a CC BY 4.0 curriculum. The emulator MUST continue to be
reachable on `http://localhost:4566` so the lab bodies remain unchanged apart from the image swap.

#### Scenario: Default lab run uses floci offline at zero cost
- **WHEN** a learner runs `git clone` + `make up` + `make demo` in one of the 8 labs with no cloud
  account and no network access to AWS
- **THEN** the lab stands up floci on `localhost:4566`, the demo completes against it, and no
  LocalStack image and no paid resource is required

#### Scenario: Emulator image is pinned and license-clean
- **WHEN** a contributor inspects a migrated lab's `docker-compose.yml`
- **THEN** the floci image reference is a specific pinned tag (never `latest`), and the change records
  floci's license and confirms it permits redistribution in the curriculum

### Requirement: Migrated labs stay endpoint-agnostic so a real-AWS route remains one variable away

Migrated labs SHALL drive the AWS CLI through the native `AWS_ENDPOINT_URL` environment variable
(pointed at floci) rather than the LocalStack-branded `awslocal` wrapper, so that running the *same*
lab body against real AWS later requires only unsetting `AWS_ENDPOINT_URL` and supplying real
credentials — no rewrite of lab steps. Building, documenting, and validating a full real-AWS route
(a `make up-aws` target with credential/cost/teardown handling) is **deferred** and out of scope for
this pass; the migration only preserves the property that makes it cheap to add.

#### Scenario: Lab commands are backend-agnostic
- **WHEN** a contributor inspects a migrated lab's scripts and Makefile
- **THEN** commands invoke plain `aws` (honoring `AWS_ENDPOINT_URL`), not `awslocal`, so the only
  thing binding the lab to floci is the `AWS_ENDPOINT_URL=http://floci:4566` setting

### Requirement: LocalStack is fully removed from the migrated labs

The migration SHALL remove the hard dependency on the sunsetting LocalStack community image and its
branded tooling from all 8 labs: no `localstack/localstack` image reference, and the LocalStack-only
`awslocal` wrapper replaced by a plain `aws --endpoint-url`/`AWS_ENDPOINT_URL`-based invocation that
works identically against floci and real AWS. Any LocalStack-specific workaround (e.g. the
`patch-prowler-localstack.py` STS-endpoint patch, LocalStack health-check paths) MUST be re-evaluated
and either ported to floci, replaced, or removed.

#### Scenario: No LocalStack reference remains in a migrated lab
- **WHEN** a contributor greps a migrated lab directory for `localstack` / `awslocal`
- **THEN** no `localstack/localstack` image, LocalStack health path, or `awslocal` command remains;
  any former LocalStack-specific patch has been ported, replaced, or removed with a recorded rationale

### Requirement: Per-lab floci coverage is verified, and honesty caveats point learners to the real-AWS route where the emulator falls short

Each migrated lab's specific API surface SHALL be verified to work on floci before the lab is marked
done, because floci simulates AWS APIs with varying fidelity. Where floci cannot faithfully
stand in for the pedagogy (e.g. prowler's broad posture scan in `05`, IAM
`simulate-principal-policy` enforcement in `02`, Docker-backed Lambda in `09`, real
CloudTrail/GuardDuty for the `14`/capstone detection loop), the lab MUST carry an honesty note and
route the learner to the real-AWS path for that part. A lab that cannot be made correct on floci MUST
be declared **real-AWS-first** rather than shipping a misleading emulator demo.

#### Scenario: A lab whose point needs real fidelity is real-AWS-first
- **WHEN** floci cannot enforce or reproduce the behavior a lab teaches (e.g. real posture findings,
  IAM/key-policy enforcement, CloudTrail/GuardDuty detection)
- **THEN** the lab documents the limitation in an honesty note and designates the real-AWS route as
  the path that actually proves the lesson, rather than presenting the emulator result as authoritative

#### Scenario: Coverage is validated, not assumed
- **WHEN** a lab is marked done on floci
- **THEN** its `make up && make demo && make down` has actually been run green against floci, and any
  service/API the lab relies on that floci does not implement is documented with the fallback taken

### Requirement: Track 05 prose frames the LocalStack sunset and the dual-route model

Track 05's prose SHALL be updated so the 3 READMEs that name LocalStack (`02`, `14`, `17`) no longer
imply a LocalStack dependency, the track `README.md` carries a short real-world note on the LocalStack
community sunset (an OSS-sustainability teachable moment) and names the floci-default / real-AWS-option
model, and the symlinked lab bodies stay in sync with the `tracks/` source of truth.

#### Scenario: Prose reflects the new substrate and teaches the sunset
- **WHEN** a learner reads the Track 05 README and the affected module READMEs
- **THEN** they see floci as the default local substrate, the optional real-AWS route, and a brief
  note on why the migration happened (LocalStack community sunset), with no stale LocalStack framing
