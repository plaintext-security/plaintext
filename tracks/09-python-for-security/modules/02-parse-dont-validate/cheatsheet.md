---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — Parse, Don't Validate (pydantic v2)

*Companion to [Module 02 — Parse, Don't Validate](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## A model + typed fields (Suricata EVE JSON)

```python
from datetime import datetime
from typing import Literal
from pydantic import BaseModel, ConfigDict, Field, IPvAnyAddress

class EveBase(BaseModel):
    model_config = ConfigDict(extra="ignore")  # EVE has many envelope fields — ignore, don't forbid
    timestamp: datetime                    # ISO string → datetime automatically
    src_ip: IPvAnyAddress | None = None    # a non-IP raises here, not three layers down
    dest_ip: IPvAnyAddress | None = None   # some events legitimately omit it → optional
    proto: str | None = None

class AlertDetails(BaseModel):
    model_config = ConfigDict(extra="ignore")
    signature: str
    signature_id: int                      # e.g. an ET Open sid; a string here is rejected
    category: str
    severity: int = Field(ge=1, le=3)      # Suricata severity is 1..3; 5 is rejected

class AlertEvent(EveBase):
    event_type: Literal["alert"]           # the discriminant (see the union below)
    alert: AlertDetails                    # nested model validates recursively
```

## Field constraints

```python
from typing import Annotated
from pydantic import BaseModel, Field

class AlertDetails(BaseModel):
    signature: str = Field(min_length=1)                # non-empty
    severity: int = Field(ge=1, le=3)                   # Suricata severity, 1..3
    signature_id: int = Field(gt=0)                     # positive sid
    rev: int = Field(default=1, ge=1)                   # default + constraint
    gid: int | None = None                              # optional, defaults None

# Reuse a constrained type via Annotated
Port = Annotated[int, Field(ge=1, le=65535)]
class EveBase(BaseModel):
    src_port: Port | None = None
    dest_port: Port | None = None
```

## Parsing at the boundary

```python
raw = {"timestamp": "2024-07-30T12:00:00Z", "event_type": "alert",
       "src_ip": "10.0.0.5", "dest_ip": "8.8.8.8",
       "alert": {"signature": "ET MALWARE ...", "signature_id": 2019401,
                 "category": "A Network Trojan was detected", "severity": 1}}

event = AlertEvent.model_validate(raw)      # dict → typed AlertEvent (or ValidationError)
event = AlertEvent.model_validate_json(line)  # one raw eve.json line → AlertEvent in one step

d = event.model_dump()                      # AlertEvent → dict
s = event.model_dump_json()                 # AlertEvent → JSON str
```

Parse **once**, per line, at the edge. Downstream code takes an `AlertEvent`, never a dict of maybes.

## The discriminated union (grows with dissectors)

```python
from typing import Annotated, Union
from pydantic import Field, TypeAdapter

# Add one member per dissector stretch: DnsEvent, HttpEvent, TlsEvent, ...
EveEvent = Annotated[Union[AlertEvent], Field(discriminator="event_type")]

event = TypeAdapter(EveEvent).validate_python(raw)   # routes on event_type
# an event_type with NO union member → ValidationError → quarantine (never fatal)
```

## Custom validators

```python
from pydantic import BaseModel, field_validator, model_validator

class AlertDetails(BaseModel):
    signature: str
    signature_id: int
    severity: int

    @field_validator("signature")           # one field, after type coercion
    @classmethod
    def sig_nonempty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("alert signature must be non-empty")
        return v                             # MUST return the (possibly normalized) value

    @model_validator(mode="after")          # whole object, cross-field rules
    def sev_in_range(self):
        if not 1 <= self.severity <= 3:      # Suricata severity is 1..3
            raise ValueError("severity out of Suricata range 1..3")
        return self
```

## Handling rejection (the reject-policy)

```python
import json
from pydantic import ValidationError

good, quarantine = [], []
for line in eve_lines:                             # one JSON event per line
    try:
        raw = json.loads(line)                     # truncated/non-JSON → JSONDecodeError
        good.append(AlertEvent.model_validate(raw))  # valid → typed object
    except (json.JSONDecodeError, ValidationError) as err:
        errs = err.errors() if isinstance(err, ValidationError) else str(err)
        quarantine.append({"raw": line, "errors": errs})  # skip-and-log

# err.errors() → list of dicts: {"loc": (...), "msg": ..., "type": ...}
# — reports ALL failures at once, far better triage than the first KeyError
```

## Strict vs lax — and why a real feed uses `extra="ignore"`

```python
from pydantic import BaseModel, ConfigDict

class Lax(BaseModel):                         # default: coerces sanely
    severity: int                             # "1" (str) → 1 (int) OK

class Strict(BaseModel):
    model_config = ConfigDict(strict=True)    # "1" now RAISES — no coercion
    severity: int

class RealEve(BaseModel):
    # Real EVE carries dozens of envelope fields (community_id, in_iface, app_proto, ...).
    model_config = ConfigDict(extra="ignore") # DON'T forbid — it would reject every genuine line.
    timestamp: str                            # get strictness from PINNED, constrained fields
    # ... reserve extra="forbid" only for a small sub-object whose exact shape you truly own
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
- **`.get()`-and-`if` soup is the smell.** `event.get("alert", {}).get("severity", 1)` trusts and silently
  defaults malformed input. A constrained field (`Field(ge=1, le=3)`) *rejects* it instead — defaulting hides bugs.
- **Annotating is not constraining.** `dest_ip: str` parses nothing; `dest_ip: IPvAnyAddress` does; a bare
  `severity: int` admits `5` while `Field(ge=1, le=3)` rejects it. A type that admits any value is not a check.
- **On a real feed, pin — don't forbid.** `extra="forbid"` on a whole EVE record rejects every genuine
  line (the envelope is huge and version-dependent). Use `extra="ignore"` and get your strictness from the
  constrained fields you actually consume; reserve `forbid` for a sub-object whose shape you own.
- **Unknown `event_type` → quarantine, not crash.** A discriminated union routes on `event_type`; a line
  with no member raises `ValidationError` you catch. Adding a member (a dissector) is how the boundary grows.
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
