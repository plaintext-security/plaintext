# Cheat sheet — Network Programming

*Companion to [Module 06 — Network Programming](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

> Scan and send only against systems you own or have explicit written permission to test.

## socket — a TCP port probe

```python
import socket

def scan(host, port, timeout=1.0):
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.settimeout(timeout)                      # without this a filtered port hangs forever
        code = s.connect_ex((host, port))          # returns 0 on success; error code otherwise
        return code == 0                           # True = OPEN
```

## connect_ex vs connect

```python
s.connect((host, port))    # raises ConnectionRefusedError / TimeoutError on failure
s.connect_ex((host, port)) # returns an errno int instead of raising — cleaner for scanning
# 0 = open · 111/ECONNREFUSED = closed (RST) · timeout = filtered (packet dropped)
```

## Banner grabbing — read what the service announces

```python
def grab_banner(host, port, timeout=2.0):
    with socket.socket() as s:                     # AF_INET/SOCK_STREAM are the defaults
        s.settimeout(timeout)
        s.connect((host, port))
        try:
            data = s.recv(1024)                    # SSH/SMTP/FTP announce first
        except socket.timeout:
            s.sendall(b"HEAD / HTTP/1.0\r\n\r\n")  # HTTP is probe-first — speak, then read
            data = s.recv(1024)
        return data.decode("utf-8", errors="replace")  # never assume valid UTF-8 off the wire
```

## Error cases a real scan hits

```python
try:
    ...
except ConnectionRefusedError:   # RST — port is CLOSED
    ...
except (socket.timeout, TimeoutError):  # no reply — port is FILTERED
    ...
except OSError:                  # network unreachable, no route, etc.
    ...
```

## scapy — layers stack with /

```python
from scapy.all import IP, TCP, ICMP, Ether, Raw, sr1, send, sniff, rdpcap, wrpcap

pkt = IP(dst="10.0.0.9") / TCP(dport=22, flags="S")   # each layer stacks with /
pkt = Ether() / IP() / TCP() / Raw(load=b"data")      # full stack, link layer up
pkt.show()                                             # dump every field at every layer
pkt[TCP].flags                                         # index by layer class to read a field
```

## scapy — send and receive

```python
ans = sr1(IP(dst="10.0.0.9") / TCP(dport=22, flags="S"), timeout=2, verbose=0)
# sr1 = send 1 packet, return the FIRST reply. send() = fire-and-forget (no reply captured).
if ans and ans.haslayer(TCP):
    if ans[TCP].flags == "SA":     # SYN-ACK -> OPEN
        open_port = True
    elif ans[TCP].flags == "R":    # RST    -> CLOSED
        open_port = False
# ans is None on no reply -> FILTERED
```

## scapy — capture & pcap I/O

```python
pkts = sniff(count=10, filter="tcp port 22", timeout=5)   # BPF filter — same syntax as tcpdump
sniff(prn=lambda p: p.summary(), filter="tcp", store=False) # callback per packet, don't buffer

wrpcap("capture.pcap", pkts)          # write a pcap
pkts = rdpcap("capture.pcap")         # read one back (post-process Wireshark/tcpdump traces)
for p in pkts:
    if p.haslayer(TCP):
        p[IP].src, p[TCP].dport
```

## BPF filter quick reference (sniff filter=)

```text
tcp port 22                 tcp traffic on port 22
host 10.0.0.9               to/from that host
src host 10.0.0.9           source only     dst port 443    destination port only
tcp and not port 22         combine with and / or / not
tcp[tcpflags] & tcp-syn != 0   SYN-flagged packets
```

## Gotchas worth remembering

- **Authorization first, always.** A scanner pointed at the wrong subnet is an incident; scapy will
  send whatever you tell it, malformed packets included, with no guardrail. Stay inside written scope.
- **`filtered` ≠ `closed` ≠ `open`.** A `RST` means closed, a `SYN-ACK` means open, and *silence*
  (dropped packet) means filtered — and that silence is itself intel about a firewall. Read the
  response, don't just tally opens.
- **Always `settimeout()`.** Without it a filtered port makes `connect`/`recv` hang indefinitely and
  your scan never finishes. One or two seconds is plenty on a LAN.
- **Not every service speaks first.** SSH/SMTP/FTP announce on connect; HTTP and TLS ports don't —
  `recv` on an HTTPS port returns TLS hello bytes, not plaintext. Probe-first when the recv times out.
- **Decode wire bytes with `errors="replace"`.** Banners are arbitrary bytes; a plain `.decode()`
  raises `UnicodeDecodeError` on the first non-UTF-8 byte and crashes the grab.
- **Raw scapy send/sniff needs root** (raw sockets). `connect_ex`-based scanning does not — reach
  for plain `socket` when you only need open/closed and don't want privileges.
