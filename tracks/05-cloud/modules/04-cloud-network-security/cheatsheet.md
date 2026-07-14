---
template: cheatsheet.html
hide:
  - navigation
  - toc
---

# Cheat sheet — VPC reachability, Security Groups & NACLs

*Companion to [Module 04 — Cloud Network Security](README.md) · CC BY 4.0 — print it, pin it, share it.*

*Last reviewed: 2026-07*

## Inventory the VPC

```bash
aws ec2 describe-vpcs --query 'Vpcs[].{id:VpcId,cidr:CidrBlock}'
aws ec2 describe-subnets --query 'Subnets[].{id:SubnetId,cidr:CidrBlock,az:AvailabilityZone,public:MapPublicIpOnLaunch}'
aws ec2 describe-route-tables         # which subnets route to an internet/NAT gateway = public
aws ec2 describe-internet-gateways
aws ec2 describe-nat-gateways
```

## Read Security Groups (the stateful, per-ENI firewall)

```bash
aws ec2 describe-security-groups \
  --query 'SecurityGroups[].{id:GroupId,name:GroupName}'

# the ingress rules that matter: what ports are open to the world
aws ec2 describe-security-groups --query \
  'SecurityGroups[].IpPermissions[?contains(IpRanges[].CidrIp,`0.0.0.0/0`)]'

# find SGs exposing SSH/RDP to 0.0.0.0/0 (the classic finding)
aws ec2 describe-security-groups \
  --filters Name=ip-permission.cidr,Values=0.0.0.0/0 \
            Name=ip-permission.from-port,Values=22 \
  --query 'SecurityGroups[].GroupId'

# who trusts whom? group-references are the TRANSITIVE edges
aws ec2 describe-security-groups --query \
  'SecurityGroups[].IpPermissions[].UserIdGroupPairs[].GroupId'
```

## Which ENI / instance uses a group

```bash
aws ec2 describe-instances --filters Name=instance.group-id,Values=sg-0abc123 \
  --query 'Reservations[].Instances[].{id:InstanceId,ip:PublicIpAddress,priv:PrivateIpAddress}'
aws ec2 describe-network-interfaces --filters Name=group-id,Values=sg-0abc123
```

## NACLs — the stateless, per-subnet layer

```bash
aws ec2 describe-network-acls --query \
  'NetworkAcls[].{id:NetworkAclId,entries:Entries[].{rule:RuleNumber,proto:Protocol,action:RuleAction,cidr:CidrBlock,egress:Egress}}'
```

- NACLs are **stateless** → you must allow the ephemeral return ports (1024–65535) explicitly, both
  directions. SGs are **stateful** → return traffic is auto-allowed.

## Map reachability as a graph — cloudmapper

```bash
python cloudmapper.py collect --account myaccount     # pull the account config
python cloudmapper.py prepare --account myaccount     # build the topology graph
python cloudmapper.py audit   --account myaccount     # surfaces 0.0.0.0/0 findings
python cloudmapper.py webserver                        # browse the graph at http://127.0.0.1:8000
```

- Read the graph, don't read the rules: follow group-references as edges — "what can the internet
  touch, and what can *that* touch?"

## Egress is open by default — scope it

```bash
# VPC ALLOWS ALL OUTBOUND out of the box. A clean ingress audit does nothing about exfil.
# Keep AWS-service traffic off the public internet with VPC Endpoints:
aws ec2 create-vpc-endpoint --vpc-id vpc-0abc --service-name com.amazonaws.us-east-1.s3 \
  --route-table-ids rtb-0abc            # Gateway endpoint for S3/DynamoDB
# Interface endpoint (PrivateLink) for other services / third parties: --vpc-endpoint-type Interface
```

## Author a default-deny SG baseline (Terraform, then a scanner gate)

```hcl
resource "aws_security_group" "db" {
  name   = "db-sg"
  vpc_id = aws_vpc.main.id
  ingress {                       # ONLY app-sg on 5432 — nothing "just in case"
    from_port       = 5432
    to_port         = 5432
    protocol        = "tcp"
    security_groups = [aws_security_group.app.id]
  }
  egress { from_port = 0; to_port = 0; protocol = "-1"; cidr_blocks = ["10.0.0.0/16"] }  # scoped, not 0.0.0.0/0
}
```

```bash
checkov -d . --check CKV_AWS_24,CKV_AWS_25   # fail SSH/RDP open to 0.0.0.0/0 — the guardrail
```

## Observe reachability after the fact — VPC Flow Logs

```
# 5-tuple + action: scans show as REJECT storms; exfil shows as a fat ACCEPT flow to an external IP on 443
srcaddr dstaddr srcport dstport protocol packets bytes action(ACCEPT|REJECT)
```

## Gotchas worth remembering

- **Reachability is transitive.** A private DB whose SG only trusts `app-sg` is internet-reachable the
  moment `app-sg` opens `:22` to the world. A per-rule audit calls it "clean" and is wrong.
- **Egress is default-permit.** Locking ingress stops the initial reach; it does nothing about a
  foothold calling the metadata service or shipping data out on 443. Scope egress in *both* directions.
- **The attack surface is the union of every rule**, not the worst single line — the exposure lives in
  the composition. Author a default-deny baseline, don't just delete the worst rule.
- **SGs are IAM-controlled API objects.** Anyone with `ec2:AuthorizeSecurityGroupIngress` can re-punch
  the hole — the baseline only stays true if a scanner (Checkov/cloudmapper) re-checks it in CI.
- **SG vs NACL:** SG = stateful, per-ENI, allow-only (no explicit deny). NACL = stateless, per-subnet,
  ordered allow *and* deny — remember the ephemeral return ports or the NACL silently breaks traffic.

> Only enumerate and test networks you own or have explicit written permission to assess.
