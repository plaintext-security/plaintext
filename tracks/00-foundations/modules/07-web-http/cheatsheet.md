# Cheat sheet — Web & HTTP with curl

*Companion to [Module 07 — Web & HTTP Fundamentals](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## The essentials

```bash
curl https://example.com                 # GET, body to stdout
curl -i https://example.com              # include response headers
curl -I https://example.com              # headers ONLY (a HEAD request)
curl -s https://example.com              # silent (no progress meter) — for pipes/scripts
curl -sS https://example.com             # silent but still show errors
curl -v https://example.com              # verbose: full request + response, TLS handshake
curl -o page.html https://example.com    # save to a file (-O keeps the remote name)
curl -L https://example.com              # follow redirects (3xx)
```

## Methods, headers, data

```bash
curl -X POST https://api/login
curl -H "Authorization: Bearer $TOKEN" https://api/me
curl -H "User-Agent: plaintext-lab" https://example.com
curl -A "Mozilla/5.0"  https://example.com          # shortcut for User-Agent
curl -e "https://ref.example" https://example.com   # shortcut for Referer

# form-encoded body (sets Content-Type: application/x-www-form-urlencoded)
curl -d "user=admin&pass=hunter2" https://api/login

# JSON body
curl -H "Content-Type: application/json" \
     -d '{"user":"admin","pass":"hunter2"}' https://api/login

# multipart file upload
curl -F "file=@payload.pdf" https://api/upload
```

`-d` implies `POST`; use `-G` to send the data as a query string on a GET instead.

## Cookies and sessions

```bash
curl -c jar.txt https://site/login           # SAVE cookies the server sets → jar.txt
curl -b jar.txt https://site/dashboard        # SEND cookies from the jar
curl -c jar.txt -b jar.txt https://site/next  # both: reuse and update (a session)
curl -b "session=abc123" https://site/        # send a cookie inline, no file
```

The two-step "save then send" is how you script an authenticated flow: log in with `-c` to capture
the session cookie, then reuse it with `-b` on every following request.

## Inspecting without the noise

```bash
curl -s -o /dev/null -w "%{http_code}\n" https://example.com     # just the status code
curl -s -o /dev/null -w "%{time_total}s\n" https://example.com   # just the timing
curl -sI https://example.com | grep -i "^location:"              # where a redirect points
curl --resolve example.com:443:10.0.0.5 https://example.com/     # force a host→IP (test vhosts)
curl -k https://self-signed.local                                # skip TLS verify (LABS ONLY)
curl -x http://127.0.0.1:8080 https://target/                    # route through a proxy (Burp/ZAP)
```

## HTTP status codes at a glance

| Range | Meaning | Common ones |
|-------|---------|-------------|
| **2xx** | Success | 200 OK · 201 Created · 204 No Content |
| **3xx** | Redirect | 301 Moved · 302 Found · 304 Not Modified |
| **4xx** | *You* erred | 400 Bad Request · 401 Unauthenticated · 403 Forbidden · 404 Not Found · 429 Too Many Requests |
| **5xx** | *Server* erred | 500 Internal · 502 Bad Gateway · 503 Unavailable · 504 Gateway Timeout |

- **401 vs 403:** 401 = "I don't know who you are" (authenticate); 403 = "I know who you are and
  you can't" (authorize). Confusing them is a classic access-control bug.

## Security-relevant response headers

```
Set-Cookie: id=...; HttpOnly; Secure; SameSite=Lax   # HttpOnly = JS can't read it (blunts XSS theft)
Strict-Transport-Security: max-age=31536000          # HSTS — force HTTPS
Content-Security-Policy: default-src 'self'           # CSP — the main XSS mitigation
X-Frame-Options: DENY                                 # clickjacking defense
```

## Gotchas worth remembering

- `-k` / `--insecure` disables certificate validation — fine against your own lab's self-signed
  cert, **never** a habit against real targets; it silently defeats the whole point of TLS.
- Passing secrets as `-d` / `-H` on the command line leaks them into shell history and `ps`. Prefer
  `-d @file`, `--data-urlencode`, or an env var you don't echo.
- `-i` (include headers in output) vs `-I` (HEAD request, headers only) vs `-v` (full transcript to
  stderr) — mixing these up is the most common curl confusion.

> Only send requests to systems you own or have explicit written permission to test.
