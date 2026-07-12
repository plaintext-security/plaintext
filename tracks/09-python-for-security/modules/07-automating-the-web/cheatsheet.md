# Cheat sheet — Automating the Web

*Companion to [Module 07 — Automating the Web](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Scrape only hosts you own or have explicit written permission to test. Respect `robots.txt` and scope.

## httpx.Client — a session that carries cookies

```python
import httpx

with httpx.Client(
    base_url="http://localhost:5000",
    headers={"User-Agent": "plaintext-scraper/1.0"},   # identify yourself
    timeout=10.0,                                       # never scrape without a timeout
    follow_redirects=True,                              # follow 3xx (default is False on Client!)
) as client:
    r = client.get("/")
    r = client.post("/login", data={"user": "x", "pass": "y"})  # cookies now stored on client
    r = client.get("/dashboard")                        # session cookie resent automatically
```

## Cookies & redirect inspection

```python
client.cookies                          # the session cookie jar (dict-like)
client.cookies.get("session")           # read a specific cookie
r.cookies                               # cookies set by THIS response

r = client.get("/old", follow_redirects=False)   # DON'T follow — inspect the hop
r.status_code                           # 301 / 302
r.headers["location"]                   # where it points
r.history                               # list of intermediate responses when following
```

## BeautifulSoup — parse the HTML

```python
from bs4 import BeautifulSoup

soup = BeautifulSoup(r.text, "html.parser")   # stdlib parser; "lxml" if installed & faster

soup.find("a")                          # first <a> or None
soup.find_all("a")                      # every <a> (a list)
soup.find_all("a", href=True)           # only <a> that HAVE an href
soup.find_all("input", {"type": "hidden"})   # attribute filter (finds CSRF tokens etc.)
soup.select("div.result a")             # CSS selector -> list
soup.select_one("#main")                # CSS selector -> first match
```

## Pulling data out of tags

```python
for a in soup.find_all("a", href=True):
    a["href"]           # attribute access (KeyError if absent)
    a.get("href")       # safe access -> None if absent
    a.attrs             # dict of all attributes
    a.text              # visible text of the tag and descendants
    a.get_text(strip=True)   # text with whitespace collapsed/trimmed

soup.title.string       # <title> text
[img["src"] for img in soup.find_all("img", src=True)]
```

## Find what isn't linked — regex the raw source

```python
import re
# find_all misses paths buried in <script>, comments, and attributes — regex the raw text.
paths = set(re.findall(r"/[\w/.-]+", r.text))    # /admin, /api/v2/internal, ...
comments = re.findall(r"<!--(.*?)-->", r.text, re.DOTALL)
```

## Scope guard — the non-negotiable

```python
from urllib.parse import urljoin, urlparse

TARGET_HOST = "localhost"

def in_scope(url) -> bool:
    return urlparse(url).netloc in ("", TARGET_HOST)   # "" = relative/same-host link

# Resolve relative hrefs against the current page before checking scope.
for a in soup.find_all("a", href=True):
    full = urljoin(str(r.url), a["href"])
    if in_scope(full):
        queue.append(full)                  # follow only in-scope links
```

## A bounded crawl loop

```python
seen, queue, MAX_DEPTH = set(), [(start, 0)], 3
while queue:
    url, depth = queue.pop()
    if url in seen or depth > MAX_DEPTH:     # dedup + depth cap -> the crawl terminates
        continue
    seen.add(url)
    try:
        resp = client.get(url)
    except httpx.HTTPError:                  # a 404/timeout must not kill the crawl
        continue
    ...                                      # parse, enqueue in-scope links at depth+1
```

## Gotchas worth remembering

- **A crawler with no scope guard becomes unauthorized access.** Without `urlparse(url).netloc ==
  target_host` and a depth limit, one off-domain link walks your scoped recon onto someone else's
  host. This is the single most common — and most dangerous — scraper bug.
- **`follow_redirects` defaults to `False` on `httpx.Client`.** Set it explicitly. Forgetting means
  your scraper silently stops at every 302 login redirect and "finds nothing".
- **`find_all` only sees the parse tree.** Endpoints hide in `<script>` bodies, comments, and JS
  strings — regex the raw `response.text` to surface the paths BeautifulSoup won't expose.
- **Use `.get()` / `href=True` for attributes that may be absent.** `tag["href"]` raises `KeyError`
  on a link without one; filter with `href=True` or read with `.get("href")`.
- **`.text` includes descendant text.** `<a>Home<span>(new)</span></a>.text` is `"Home(new)"` —
  use `.get_text(strip=True)` when you want it cleaned, and don't assume it's just the anchor label.
- **Identify yourself and rate-limit.** A real `User-Agent`, a small delay between requests, and
  reading `robots.txt` are what separate responsible automation from a hostile flood.
