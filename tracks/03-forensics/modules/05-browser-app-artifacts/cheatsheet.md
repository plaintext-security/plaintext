# Cheat sheet — Browser & Application Artifacts

*Companion to [Module 05 — Browser & Application Artifacts](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## hindsight — parse a Chrome/Chromium profile

```bash
hindsight.py -i "Default/" -o report                 # -i profile dir, -o output basename
hindsight.py -i "Default/" -o report -f jsonl        # JSONL (feeds the Module 07 super-timeline)
hindsight.py -i "Default/" -o report -f xlsx         # spreadsheet for review
hindsight_gui.py                                      # local web UI, then browse to it
```

- `hindsight` reads the main DB **and the WAL** — that's where rows survive a "clear history."
  It converts Chrome's epoch for you.

## Chrome profile — where the databases live

```
Linux    ~/.config/google-chrome/Default/
Windows  %LOCALAPPDATA%\Google\Chrome\User Data\Default\
macOS    ~/Library/Application Support/Google/Chrome/Default/

History        (SQLite: urls, visits, downloads, keyword_search_terms)
History-wal    (Write-Ahead Log — often holds pre-clear rows)
Cookies, Login Data, Web Data (autofill), Network/Cookies
```

## sqlite3 — query the History DB directly

```bash
sqlite3 History ".tables"                 # list tables
sqlite3 History ".schema urls"            # column names + types
sqlite3 -header -csv History "SELECT ..." > out.csv
```

- **Work on a copy.** Opening the live DB can trigger a checkpoint and merge/prune the WAL —
  copy `History` *and* `History-wal` together, then query the copy.

## SQL — the queries you always re-type

```sql
-- Visited URLs, newest first, with human time (Chrome epoch → local)
SELECT datetime(last_visit_time/1000000 - 11644473600,'unixepoch') AS visited,
       url, title, visit_count
FROM urls ORDER BY last_visit_time DESC;

-- Downloads: where from, to where, how big
SELECT datetime(start_time/1000000 - 11644473600,'unixepoch') AS started,
       tab_url, target_path, total_bytes
FROM downloads;

-- Search terms typed in the omnibox
SELECT term, url_id FROM keyword_search_terms;

-- Individual visits with referrer chain + transition type
SELECT datetime(visit_time/1000000 - 11644473600,'unixepoch') AS t,
       url_id, from_visit, transition
FROM visits ORDER BY visit_time;
```

## Epoch conversion (the 369-year trap)

```
Chrome / WebKit  = microseconds since 1601-01-01 UTC (Windows FILETIME base)
  SQL:  datetime(field/1000000 - 11644473600, 'unixepoch')
Unix (Firefox places.sqlite uses microseconds since 1970):
  SQL:  datetime(field/1000000, 'unixepoch')
```

```bash
# Sanity-check one value on the CLI (Chrome epoch)
python3 -c "import datetime;print(datetime.datetime(1601,1,1)+datetime.timedelta(microseconds=13350000000000000))"
```

## Gotchas worth remembering

- **Chrome epoch is microseconds since 1601, not 1970.** Forget `- 11644473600` and every timestamp
  shifts ~369 years. Always sanity-check one *known* event before trusting a conversion — this
  mistake has shipped in real reports.
- **"Cleared history" ≠ gone.** The WAL, OS DNS cache, download directory, `$MFT`, prefetch, and
  network flows are all redundant records. Copy `History-wal` alongside `History`.
- **Incognito writes no `urls`/`visits` rows** — but DNS cache and network flows still place the
  user on the site. Absence in the history DB is not proof of absence of activity.
- **Query a copy, never the live profile.** Touching the live DB can checkpoint and prune the very
  WAL rows you came for.
- **Same pattern beyond the browser:** Slack (LevelDB), Teams (`%APPDATA%\Microsoft\Teams`), Outlook
  (`.ost`) — all parseable offline. "I never downloaded it" is a testable claim.
