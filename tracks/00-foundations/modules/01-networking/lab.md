# Lab 01 — Capturing and Analysing Traffic with tcpdump

## Setup
Install tcpdump (usually pre-installed on Linux):
```bash
sudo apt install tcpdump   # Debian/Ubuntu
sudo dnf install tcpdump   # Fedora/RHEL
```

## Scenario

You want to observe the DNS and TCP handshake that occurs when your
machine visits a website.

## Steps

1. Start a capture on your network interface:

```bash
sudo tcpdump -i eth0 -w capture.pcap
```

2. In a separate terminal, make an HTTP request:

```bash
curl http://example.com
```

3. Stop the capture (Ctrl+C) and analyse:

```bash
# View DNS queries
tcpdump -r capture.pcap port 53

# View TCP handshake
tcpdump -r capture.pcap 'tcp[tcpflags] & (tcp-syn|tcp-ack) != 0'
```

## Expected output

You should see a DNS query for example.com, followed by SYN, SYN-ACK,
and ACK packets establishing the TCP connection.

## Questions

1. What IP address did example.com resolve to?
2. What port did the server respond on?
3. How many packets were exchanged before data was transferred?
