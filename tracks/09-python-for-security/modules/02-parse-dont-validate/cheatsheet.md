# Cheat sheet — Parse, Don't Validate (pydantic v2)

*Companion to [Module 02 — Parse, Don't Validate](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## A model + typed fields

```python
from datetime import datetime
from enum import Enum
from pydantic import BaseModel, IPvAnyAddress

class Severity(str, Enum):                 # anything outside the set is rejected
    low = "low"; medium = "medium"; high = "high"; critical = "critical"

class Indicator(BaseModel):
    type: str
    value: IPvAnyAddress                   # a non-IP raises here, not three layers down

class Alert(BaseModel):
    id: str
    severity: Severity                     # coerced/validated against the enum
    seen_at: datetime                      # ISO string → datetime automatically
    indicators: list[Indicator] = []       # nested models validate recursively
    tags: list[str] = []                   # mutable default is safe in pydantic
```

## Field constraints

```python
from typing import Annotated
from pydantic import BaseModel, Field

class Alert(BaseModel):
    id: str = Field(min_length=1)                       # non-empty
    score: int = Field(ge=0, le=100)                    # 0..100 inclusive
    source: str = Field(pattern=r"^[a-z-]+$")           # regex constraint
    count: int = Field(default=0, ge=0)                 # default + constraint
    note: str | None = None                             # optional, defaults None

# Reuse a constrained type via Annotated
Port = Annotated[int, Field(ge=1, le=65535)]
class Endpoint(BaseModel):
    host: str
    port: Port
```

## Parsing at the boundary

```python
raw = {"id": "A-1", "severity": "high", "seen_at": "2026-07-01T12:00:00Z", "indicators": []}

alert = Alert.model_validate(raw)          # dict → typed Alert (or ValidationError)
alert = Alert.model_validate_json(blob)    # raw JSON bytes/str → Alert in one step
alert = Alert(**raw)                        # same as model_validate for a dict

d = alert.model_dump()                      # Alert → dict
s = alert.model_dump_json()                 # Alert → JSON str
```

Parse **once**, at the edge. Downstream code takes an `Alert`, never a dict of maybes.

## Custom validators

```python
from pydantic import BaseModel, field_validator, model_validator

class Alert(BaseModel):
    id: str
    starts_at: datetime
    ends_at: datetime

    @field_validator("id")                  # one field, after type coercion
    @classmethod
    def id_nonempty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("alert id must be non-empty")
        return v                             # MUST return the (possibly normalized) value

    @model_validator(mode="after")          # whole object, cross-field rules
    def order_ok(self):
        if self.ends_at < self.starts_at:
            raise ValueError("ends_at before starts_at")
        return self
```

## Handling rejection (the reject-policy)

```python
from pydantic import ValidationError

good, quarantine = [], []
for raw in feed:
    try:
        good.append(Alert.model_validate(raw))     # valid → typed object
    except ValidationError as err:
        quarantine.append({"raw": raw, "errors": err.errors()})  # skip-and-log

# err.errors() → list of dicts: {"loc": (...), "msg": ..., "type": ...}
# — reports ALL failures at once, far better triage than the first KeyError
```

## Strict vs lax

```python
from pydantic import BaseModel, ConfigDict

class LaxAlert(BaseModel):                   # default: coerces sanely
    score: int                               # "42" (str) → 42 (int) OK

class StrictAlert(BaseModel):
    model_config = ConfigDict(strict=True)   # "42" now RAISES — no coercion
    score: int

class Sealed(BaseModel):
    model_config = ConfigDict(extra="forbid")  # unexpected field → error (a red flag)
    id: str
```

## Secrets via pydantic-settings

```python
from pydantic import SecretStr
from pydantic_settings import BaseSettings, SettingsConfigDict

class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_prefix="SIFT_", env_file=".env")
    api_key: SecretStr                       # required → missing key fails at startup
    log_level: str = "info"                  # optional with default

settings = Settings()                        # reads SIFT_API_KEY from env / .env
key = settings.api_key.get_secret_value()    # explicit unwrap; repr/logs show '**********'
```

Commit a `.env.example`, never a populated `.env` or the real key.

## Gotchas worth remembering

- **Validate at the boundary, not everywhere.** Parse untrusted input once into a typed object; then
  the type carries the invariant. Re-checking the same field three functions deep is the anti-pattern.
- **`.get()`-and-`if` soup is the smell.** `alert.get("severity", "low")` trusts and silently defaults
  malformed input. A constrained field *rejects* it instead — defaulting hides bugs.
- **Annotating is not constraining.** `ip: str` parses nothing; `ip: IPvAnyAddress` does. A type that
  admits any string is not a check.
- **This is pydantic v2.** Use `model_validate` / `model_dump` / `field_validator` / `ConfigDict` —
  the v1 names (`parse_obj`, `.dict()`, `@validator`, `class Config`) are deprecated/removed.
- **Validators must return the value.** A `field_validator`/`model_validator` that forgets to `return`
  turns the field into `None` — a quiet, nasty bug.
- **Secrets live in `BaseSettings`, not source.** `SecretStr` keeps keys out of logs and tracebacks;
  a missing required setting fails loudly at startup, not as a confusing `None` mid-request.
- **`model_validate_json` beats `json.loads` + `model_validate`** — one pass, and pydantic parses the
  JSON with the schema in mind.

> The extreme case of trusting input is unsafe deserialization: `yaml.load()` / `pickle.loads` on
> untrusted bytes build live objects and hand an attacker code execution. Same bug, escalated to RCE.
