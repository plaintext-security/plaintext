# Cheat sheet — Device Trust & Posture (WireGuard / Tailscale / headscale)

*Companion to [Module 03 — Device Trust & Posture](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## WireGuard basics

```bash
wg genkey | tee privatekey | wg pubkey > publickey   # keypair (the pubkey IS the device identity)
wg show                                              # peers, latest handshake, transfer, endpoints
wg show wg0 latest-handshakes                        # last handshake per peer (recent = alive)
wg-quick up wg0                                       # bring interface up from /etc/wireguard/wg0.conf
wg-quick down wg0                                     # tear it down
ip -brief addr show wg0                               # confirm the tunnel address is assigned
```

WireGuard crypto is fixed by design (Noise, ChaCha20-Poly1305, Curve25519) — no algorithm to negotiate,
nothing to downgrade. A peer is *only* a 256-bit public key.

## headscale — self-hosted control server

```bash
headscale users create corp                          # a namespace/user to own nodes
headscale users list

# enroll a node: on the client, tailscale up points at headscale
tailscale up --login-server http://headscale.local:8080
headscale nodes register --user corp --key <nodekey> # approve the node from the server side

headscale nodes list                                 # enrolled devices, tags, IPs, online state
headscale nodes tag -i <id> -t tag:corp-managed      # tag a node so ACLs can target it
headscale routes list                                # advertised subnet routes
```

## Tailscale client

```bash
tailscale up --login-server http://headscale.local:8080 --advertise-tags=tag:corp-managed
tailscale status                                     # peers, tags, connection type (direct vs relay)
tailscale ping <peer>                                # test reachability + path
tailscale netcheck                                   # NAT / DERP diagnostics
tailscale ip -4                                      # this node's tailnet IP
```

## ACL policy (HuJSON — HCL/JSON with comments + trailing commas)

```jsonc
{
  // DEFAULT-DENY: with tagOwners + acls present, anything NOT listed is denied.
  "tagOwners": {
    "tag:corp-managed": ["corp"],
    "tag:target":       ["corp"],
  },
  "acls": [
    // only corp-managed devices may reach the target service on 443
    { "action": "accept", "src": ["tag:corp-managed"], "dst": ["tag:target:443"] },
  ],
  // NO wildcard rule like {"src":["*"],"dst":["*:*"]} — that is the implicit default-allow trap.
}
```

```bash
headscale policy check -f acl.hujson                 # validate the policy parses (syntax only!)
```

## Prove the deny (the only honest test)

```bash
# from an ENROLLED, tagged device — should SUCCEED
curl -sS --max-time 5 http://target.tailnet:443/ && echo ALLOWED

# from a container with NO registered keypair — should FAIL (no route, no reach)
curl -sS --max-time 5 http://target.tailnet:443/ ; echo "exit=$?"   # non-200 / timeout = denied
```

## Gotchas worth remembering

- **WireGuard is not identity-aware by itself.** It authenticates a *key*, not a user or a device's
  health. A mesh where every enrolled device reaches everything is just a flatter network with better
  crypto — you moved the perimeter, you didn't remove it. The ACL is what makes it Zero Trust.
- **Prove the deny, not just the allow.** A syntax check passes an ACL with an implicit default-allow.
  The only honest verification is confirming an *unenrolled/untagged* device is refused — construct a
  `curl` from a container with no keypair.
- **Bind app AND scope, not a bare tag everywhere.** A rule that allows a tag with no destination
  restriction is a hole; scope `dst` to the specific service and port.
- **Posture is assessed, not demonstrated, when self-hosted.** Patch level, EDR state, and disk
  encryption come from an MDM/EDR stack you can't run for free — the lab maps a structured policy to
  production controls and labels it honestly. Don't claim you *proved* posture when you only *asserted* it.
- **Control plane ≠ data plane.** headscale distributes keys and ACLs; once keys are exchanged, traffic
  flows peer-to-peer. headscale being down doesn't kill existing tunnels, but it does stop new
  enrollments and ACL updates.
- **Store the private key in a TPM/Secure Enclave in production** so it can't be exported. A key sitting
  in a world-readable file is a device identity anyone can steal.
