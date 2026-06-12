/* Plaintext interactive-tour engine v2 (PROTOTYPE) — learn+do bites, substrate tiers.
   Auto-generated; logic carried from the tested POC. Mounts into #pt-tour[data-module]. */
(function(){
'use strict';
const enc = new TextEncoder();
async function sha256hex(input){
  const data = typeof input==='string' ? enc.encode(input) : input;
  const h = await crypto.subtle.digest('SHA-256', data);
  return [...new Uint8Array(h)].map(b=>b.toString(16).padStart(2,'0')).join('');
}
function hexToBytes(h){ h=h.replace(/[^0-9a-f]/gi,''); const a=new Uint8Array(h.length/2); for(let i=0;i<a.length;i++)a[i]=parseInt(h.substr(i*2,2),16); return a; }
function concatBytes(a,b){ const c=new Uint8Array(a.length+b.length); c.set(a,0); c.set(b,a.length); return c; }
async function pcrExtend(pcrHex, measHex){ // PCR_new = SHA256(PCR_old || measurement) — real measured-boot operation
  return await sha256hex(concatBytes(hexToBytes(pcrHex), hexToBytes(measHex)));
}
const J = o => JSON.stringify(o,null,2);

/* ======================================================================
   MODULE DEFINITIONS  — one randomly-selected module per track
   step types: note | mcq | input | run | terminal | order
   ====================================================================== */
const MODULES = [
/* 00 ───────────────────────────────────────────────────────────── */
{track:"00 · foundations", id:"02-lab-setup", title:"Building Your Lab",
 substrate:"sim", engine:"mock shell + config-fix",
 capstone:"You already have one: the module ships a real <code>docker-compose</code> you bring up. The tour gets you safe-by-default first.",
 steps:[
  {type:"mcq", t:"Idea 1 / isolation", q:"You're about to run intentionally-vulnerable software. Which network keeps a lab exploit from reaching your home LAN?",
   options:[{t:"Bridged — VM gets an IP on your real network"},{t:"Host-only / isolated bridge — lab talks only to itself",correct:true},{t:"NAT straight to the internet"}],
   explain:"Vulnerable boxes belong on an isolated segment. Bridged or internet-routable means your exploit (or the malware you detonate) can pivot to real assets."},
  {type:"run", t:"Idea 2 / fix the compose", prose:"This service is exposed to your whole network. Edit it so the vulnerable app sits on an <code>internal</code> lab network only.",
   code:`services:
  dvwa:
    image: vulnerables/web-dvwa
    network_mode: host        # <-- danger`,
   run:async(code)=>{
     const bad = /network_mode:\s*host/.test(code);
     const good = /networks:|internal:\s*true/.test(code);
     return {output: bad? "⚠ host networking still present — the app is reachable from your LAN." : "lab network applied.",
             pass: !bad && good, msg: (!bad&&good)?"Isolated. The app can't see your real network now.":"Remove `network_mode: host` and put it on a named (ideally `internal: true`) network."};
   }},
  {type:"terminal", t:"Idea 3 / prove it's up", prose:"Bring the lab up and confirm. Type the commands (try <code>docker compose ps</code> then <code>curl target</code>).",
   commands:{
     "docker compose ps":"NAME    IMAGE                  STATUS         PORTS\ndvwa    vulnerables/web-dvwa   Up 4 seconds   172.30.0.2:80",
     "curl target":"<html><title>DVWA</title> ... Login ...",
     "make up":"Creating network lab_internal ... done\nCreating dvwa ... done"},
   goal:"docker compose ps", goalMsg:"Lab is live and isolated — you're ready to attack it safely."}
 ]},

/* 01 ───────────────────────────────────────────────────────────── */
{track:"01 · offensive", id:"08-web-ssrf-xxe", title:"SSRF & XXE",
 substrate:"real", engine:"JS mock backend (server-side fetch simulated)",
 capstone:"Wrap a Vulhub SSRF/XXE CVE container and pull live cloud creds from a fake metadata service.",
 steps:[
  {type:"input", t:"Idea 1 / reach the inside", prose:"The app fetches any image URL you give it — <i>from the server</i>. Give it a URL that makes the server read the cloud metadata endpoint. (hint: the magic IP is <code>169.254.169.254</code>)",
   placeholder:"http://...",
   verify:(v)=>{
     if(/169\.254\.169\.254/.test(v)) return {pass:true, out:"200 OK\n{\"AccessKeyId\":\"AKIA...LAB\",\"SecretAccessKey\":\"wJalr...\",\"Token\":\"FQoG...\"}", msg:"SSRF. You made the trusted server fetch its own credentials and hand them to you."};
     if(/localhost|127\.0\.0\.1|^http:\/\/(10|192\.168)\./.test(v)) return {pass:false, out:"200 OK (some internal page)", msg:"You reached the internal network — good instinct. Now aim at the cloud metadata IP specifically."};
     return {pass:false, out:"200 OK (returns the external image)", msg:"That's an external URL — the server just proxies it. Target something the server can reach that you can't."};
   }},
  {type:"mcq", t:"Idea 2 / why it worked", q:"Why did fetching an internal URL succeed when you can't reach it directly?",
   options:[{t:"The firewall was off"},{t:"The request originates from the server, which sits inside the trust boundary",correct:true},{t:"The metadata service has no auth by accident"}],
   explain:"SSRF turns a trusted server into your proxy. Its source IP and network position — not yours — decide what's reachable."},
  {type:"run", t:"Idea 3 / XXE the parser", prose:"Now an XML upload. Define an external entity that pulls a local file into the response.",
   code:`<?xml version="1.0"?>\n<order><item>book</item></order>`,
   run:async(code)=>{
     const ent = /<!ENTITY\s+\w+\s+SYSTEM\s+["'](file:|https?:)/i.test(code) && /<!DOCTYPE/i.test(code);
     const used = /&\w+;/.test(code);
     return {output: ent&&used? "root:x:0:0:root:/root:/bin/bash\ndaemon:x:1:1:daemon:/usr/sbin:/usr/sbin/nologin\n..." : "<order> parsed, no entities expanded.",
             pass: ent&&used, msg: ent&&used? "XXE. The parser resolved your SYSTEM entity and leaked the file — same bug class as SSRF, different interpreter.":"Add a `<!DOCTYPE ... [<!ENTITY xxe SYSTEM \"file:///etc/passwd\">]>` and reference `&xxe;` in an element."};
   }}
 ]},

/* 02 ───────────────────────────────────────────────────────────── */
{track:"02 · defensive", id:"05-intrusion-detection", title:"Intrusion Detection",
 substrate:"real", engine:"JS content-matcher over bundled flows",
 capstone:"Run real Suricata over a bundled PCAP and diff alerts.",
 data:[
   {id:1, label:"malicious", payload:"GET /cgi-bin/x?file=../../../../etc/passwd HTTP/1.1\nUser-Agent: curl/7.1"},
   {id:2, label:"malicious", payload:"POST /login HTTP/1.1\nUser-Agent: sqlmap/1.7\n\nuser=a' OR 1=1--"},
   {id:3, label:"benign",    payload:"GET /images/logo.png HTTP/1.1\nUser-Agent: Mozilla/5.0"},
   {id:4, label:"benign",    payload:"GET /docs/etc/passwd-howto.html HTTP/1.1\nUser-Agent: Mozilla/5.0"}
 ],
 steps:[
  {type:"run", t:"Idea 1 / write a match", prose:"Type a <b>content string</b> a Suricata rule would match on to catch the path-traversal flow (#1). It runs against all 4 flows below.",
   code:`/etc/passwd`,
   run:async(code,ctx)=>{
     const s=code.trim(); const hits=ctx.data.filter(f=>f.payload.includes(s));
     const out=ctx.data.map(f=>`#${f.id} [${f.label}] ${hits.includes(f)?'⮕ ALERT':'·'}`).join("\n");
     const caught1 = hits.some(f=>f.id===1);
     return {output:out, pass:caught1, msg:caught1?"Catches the traversal. But look — did anything benign also alert?":"Pick a string that appears in flow #1's payload."};
   }},
  {type:"run", t:"Idea 2 / kill the false positive", prose:"<code>/etc/passwd</code> also alerts on the benign docs page (#4). Add precision: type two strings separated by <code>&&</code> that hit the attack but not the docs.",
   code:`/etc/passwd && `,
   run:async(code,ctx)=>{
     const parts=code.split("&&").map(s=>s.trim()).filter(Boolean);
     const match=f=>parts.every(p=>f.payload.includes(p));
     const hits=ctx.data.filter(match);
     const out=ctx.data.map(f=>`#${f.id} [${f.label}] ${match(f)?'⮕ ALERT':'·'}`).join("\n");
     const good = hits.length && hits.every(f=>f.label==="malicious") && hits.some(f=>f.id===1);
     return {output:out, pass:good, msg:good?"Precise: malicious only. That second predicate is the whole game in detection.":"Still flagging a benign flow (or missing #1). Find a token in #1 that #4 lacks — e.g. `cgi-bin` or `curl`."};
   }},
  {type:"mcq", t:"Idea 3 / FP economics", q:"Your rule fires 400×/day, 2 are real. What's the right move before shipping it?",
   options:[{t:"Ship it — coverage is coverage"},{t:"Tune against a benign baseline until the signal-to-noise is workable, or the SOC will mute it",correct:true},{t:"Raise the severity so analysts take it seriously"}],
   explain:"A noisy rule gets suppressed and then misses the real one. Detection is false-positive economics, not pattern-matching."}
 ]},

/* 03 ───────────────────────────────────────────────────────────── */
{track:"03 · forensics", id:"10-log-cloud-forensics", title:"Cloud Log Forensics",
 substrate:"real", engine:"real CloudTrail JSON + JS queries",
 capstone:"Pull a real CloudTrail export into a notebook and reconstruct an intrusion.",
 data:[
  {t:"08:01:12", eventName:"ConsoleLogin", user:"alice", ip:"203.0.113.9", note:"MFA"},
  {t:"08:42:55", eventName:"AssumeRole",   user:"alice", ip:"45.155.205.7", note:"role: admin-break-glass"},
  {t:"08:43:10", eventName:"CreateAccessKey", user:"admin-break-glass", ip:"45.155.205.7"},
  {t:"08:44:02", eventName:"GetObject", user:"admin-break-glass", ip:"45.155.205.7", note:"s3://payroll-exports/2026.csv"},
  {t:"08:45:30", eventName:"DeleteTrail", user:"admin-break-glass", ip:"45.155.205.7"}
 ],
 steps:[
  {type:"note", t:"the evidence", html:"Five CloudTrail events below. Skim them, then answer the next two steps — they're real-shaped records.",
   render:(ctx)=>"<div class='pt-out show'>"+ctx.data.map(e=>`${e.t}  ${e.eventName.padEnd(15)} ${e.user.padEnd(20)} ${e.ip}  ${e.note||''}`).join("\n")+"</div>"},
  {type:"input", t:"Idea 2 / spot the pivot", prose:"One event is where a legit user's session turns malicious — the IP changes mid-session. Type that <b>eventName</b>.",
   placeholder:"eventName",
   verify:(v)=>{ const ok=/assumerole/i.test(v); return {pass:ok, msg: ok?"Right — same user `alice`, new hostile IP (45.155.205.7), assuming break-glass admin. That's the takeover moment.":"Look for where alice's IP jumps from 203.0.113.9 to a new one."};}},
  {type:"input", t:"Idea 3 / the cover-up (flag)", prose:"What's the <b>last</b> action — the anti-forensics step the attacker took to blind logging? Type the eventName.",
   placeholder:"eventName",
   verify:(v)=>{ const ok=/deletetrail/i.test(v); return {pass:ok, msg: ok?"DeleteTrail — they killed CloudTrail to stop further logging. In real IR this is why you ship logs off-account.":"It's the final event in the timeline."};}}
 ]},

/* 04 ───────────────────────────────────────────────────────────── */
{track:"04 · malware", id:"13-detection-reporting", title:"Detection & Reporting (YARA)",
 substrate:"real", engine:"JS YARA-lite matcher over bundled samples",
 capstone:"Compile real YARA, scan a MalwareBazaar sample, emit a STIX bundle.",
 data:[
  {name:"sample_A.bin", goodware:false, strings:["cmd.exe /c", "http://evil-c2[.]top/gate.php", "MZ\x90"]},
  {name:"installer.exe", goodware:true, strings:["Microsoft Corporation", "InstallShield", "MZ\x90"]}
 ],
 steps:[
  {type:"run", t:"Idea 1 / match the bad", prose:"Write YARA <b>strings</b> (one per line, <code>$a=\"...\"</code>) and the matcher flags any sample containing them. Catch <code>sample_A.bin</code>.",
   code:`$a="MZ"`,
   run:async(code,ctx)=>{
     const subs=[...code.matchAll(/\$\w+\s*=\s*"([^"]+)"/g)].map(m=>m[1]);
     const match=s=>subs.length&&subs.some(x=>s.strings.join(" ").includes(x));
     const out=ctx.data.map(s=>`${s.name.padEnd(15)} ${match(s)?'⮕ MATCH':'·'} ${s.goodware?'(goodware)':'(malware)'}`).join("\n");
     const a=ctx.data[0]; return {output:out, pass:match(a), msg: match(a)?"Matches the malware. But `MZ` is in every PE — check the installer.":"Add a string that appears in sample_A's strings list."};
   }},
  {type:"run", t:"Idea 2 / don't flag goodware", prose:"<code>$a=\"MZ\"</code> also matches the legit installer. Pick a string <i>unique</i> to the malware (look at its C2).",
   code:`$a="MZ"`,
   run:async(code,ctx)=>{
     const subs=[...code.matchAll(/\$\w+\s*=\s*"([^"]+)"/g)].map(m=>m[1]);
     const match=s=>subs.length&&subs.some(x=>s.strings.join(" ").includes(x));
     const hits=ctx.data.filter(match);
     const out=ctx.data.map(s=>`${s.name.padEnd(15)} ${match(s)?'⮕ MATCH':'·'} ${s.goodware?'(goodware)':'(malware)'}`).join("\n");
     const good=hits.length===1&&!hits[0].goodware;
     return {output:out, pass:good, msg:good?"Malware only. A rule that flags goodware is worse than no rule — same lesson as a noisy detection.":"Use something like the `evil-c2[.]top` C2 string that the installer doesn't have."};
   }},
  {type:"input", t:"Idea 3 / extract the IOC", prose:"For the report, give the <b>C2 domain</b> (defanged) you'd publish as an indicator.",
   placeholder:"domain",
   verify:(v)=>{ const ok=/evil-c2\[\.\]top/.test(v)||/evil-c2\.top/.test(v); return {pass:ok, msg:ok?"That's your shippable IOC — maps to ATT&CK T1071 (C2 over web). Report = indicators + technique + confidence.":"It's the http URL in sample_A's strings — give just the domain."};}}
 ]},

/* 05 ───────────────────────────────────────────────────────────── */
{track:"05 · cloud", id:"05-posture-auditing", title:"Posture Auditing (CSPM)",
 substrate:"real", engine:"real Prowler-shaped JSON + JSON-fix check",
 capstone:"Run real Prowler against a CloudGoat/free-tier account and triage the output.",
 data:[
  {id:"s3_public", sev:"critical", pass:false, msg:"S3 bucket 'payroll-exports' allows public read", exploitable:true},
  {id:"sg_open_ssh", sev:"high", pass:false, msg:"Security group allows 0.0.0.0/0 on tcp/22"},
  {id:"mfa_root", sev:"medium", pass:false, msg:"Root account has no MFA"},
  {id:"cloudtrail_on", sev:"info", pass:true, msg:"CloudTrail enabled in all regions"}
 ],
 steps:[
  {type:"mcq", t:"Idea 1 / triage first", q:"Four findings (see engine). Which do you remediate FIRST?",
   options:[{t:"Root MFA — it's the root account"},{t:"Public S3 bucket exposing payroll data — critical AND exploitable right now",correct:true},{t:"Open SSH — port 22 is always bad"}],
   explain:"Severity × exploitability × blast-radius. Public PII beats a config that merely could be abused. This prioritisation IS the job."},
  {type:"run", t:"Idea 2 / fix the policy", prose:"Here's the offending bucket policy. Remove what makes it public (the wildcard principal / public grant).",
   code:`{\n  "Effect": "Allow",\n  "Principal": "*",\n  "Action": "s3:GetObject",\n  "Resource": "arn:aws:s3:::payroll-exports/*"\n}`,
   run:async(code)=>{
     let ok=false,parsed=true; try{const p=JSON.parse(code); ok = p.Principal!=="*" && !(typeof p.Principal==="object"&&JSON.stringify(p.Principal).includes("*")) && !/AllUsers/.test(code);}catch(e){parsed=false;}
     return {output: parsed? "policy parsed.":"⚠ invalid JSON", pass: parsed&&ok,
       msg: !parsed?"Keep it valid JSON.": ok?"No more public principal — bucket's private. Re-running Prowler would flip this finding to PASS.":"`\"Principal\":\"*\"` is the public grant. Scope it to an account/role ARN (or remove the statement)."};
   }},
  {type:"input", t:"Idea 3 / report the number (flag)", prose:"How many findings are <b>FAIL</b> (not PASS)? Type the number.",
   placeholder:"#",
   verify:(v)=>{ const ok=v.trim()==="3"; return {pass:ok, msg:ok?"3 FAIL / 1 PASS. That ratio + the critical is your one-line exec summary.":"Count the findings where pass=false."};}}
 ]},

/* 06 ───────────────────────────────────────────────────────────── */
{track:"06 · active directory", id:"08-path-to-da", title:"Path to Domain Admin",
 substrate:"sim", engine:"REAL graph search over a BloodHound-shaped graph + mock exec",
 capstone:"The live chain (Kerberoast → crack → ACL abuse → DCSync) runs in the GOAD/container capstone. Here you learn to <i>find</i> the path.",
 graph:{
   edges:[
     ["JDOE@corp","MemberOf","IT-STAFF"],
     ["IT-STAFF","GenericWrite","SVC-SQL"],
     ["SVC-SQL","HasSPN","(kerberoastable)"],
     ["SVC-SQL","MemberOf","SERVER-ADMINS"],
     ["SERVER-ADMINS","AdminTo","DC01"],
     ["DC01","DCSync","DOMAIN-ADMINS"]
   ]},
 steps:[
  {type:"note", t:"the graph", html:"You've landed as <code>JDOE@corp</code>. Below is the attack graph (BloodHound-style edges). Your goal node is <code>DOMAIN-ADMINS</code>.",
   render:(ctx)=>"<div class='pt-out show'>"+ctx.graph.edges.map(e=>`${e[0].padEnd(16)} --${e[1]}-->  ${e[2]}`).join("\n")+"</div>"},
  {type:"input", t:"Idea 2 / find the path", prose:"List the node chain from <code>JDOE@corp</code> to <code>DOMAIN-ADMINS</code>, arrow-separated. (A real BFS checks it.)",
   placeholder:"JDOE@corp -> ... -> DOMAIN-ADMINS",
   verify:(v)=>{
     const want=["JDOE@corp","IT-STAFF","SVC-SQL","SERVER-ADMINS","DC01","DOMAIN-ADMINS"];
     const got=v.split(/->|→|,/).map(s=>s.trim().toUpperCase()).filter(Boolean);
     const ok=got.length===want.length && want.every((n,i)=>got[i]===n.toUpperCase());
     return {pass:ok, msg: ok?"That's the path. Notice it's pure reachability — the same query BloodHound runs to make DA look inevitable.":"Follow the edges: JDOE is MemberOf IT-STAFF, which can GenericWrite SVC-SQL, which is in SERVER-ADMINS..."};
   }},
  {type:"terminal", t:"Idea 3 / take the first hop", prose:"Execute the first abusable edge. SVC-SQL has an SPN — try <code>kerberoast SVC-SQL</code>, then <code>crack hash</code>.",
   commands:{
     "kerberoast SVC-SQL":"[+] Requested TGS for SVC-SQL\n$krb5tgs$23$*SVC-SQL$CORP$... (hash captured)",
     "crack hash":"[+] cracked: SVC-SQL : Summer2026!\n[i] now: pass-the-ticket or abuse SERVER-ADMINS -> AdminTo DC01 -> DCSync",
     "dcsync DOMAIN-ADMINS":"[!] needs DC01 admin first — walk the path."
   },
   goal:"crack hash", goalMsg:"First hop owned. The rest of the chain is the same loop, run live in the capstone."}
 ]},

/* 07 ───────────────────────────────────────────────────────────── */
{track:"07 · endpoint hardening", id:"11-host-boot-integrity", title:"Host Boot Integrity (Measured Boot)",
 substrate:"real", engine:"REAL SubtleCrypto — actual TPM PCR-extend math",
 capstone:"Read real PCRs off a TPM (or vTPM) with tpm2-tools and compare to a golden value.",
 golden:"", // computed at runtime
 steps:[
  {type:"run", t:"Idea 1 / measure the boot chain", prose:"Measured boot hashes each component into a PCR: <code>PCR = SHA256(PCR || component_hash)</code>, starting at 32 zero bytes. Click run to extend across a clean boot chain — this is the <i>real</i> operation.",
   code:`firmware  = aa\nbootloader= bb\nkernel    = cc`,
   run:async(code,ctx)=>{
     const meas=[...code.matchAll(/=\s*([0-9a-f]{2,})/gi)].map(m=>m[1].length%2?("0"+m[1]):m[1]);
     let pcr="00".repeat(32);
     for(const m of meas) pcr=await pcrExtend(pcr,m);
     ctx.golden=pcr;
     return {output:`measurements: ${meas.join(", ")}\nfinal PCR = ${pcr.slice(0,32)}…`, pass:true,
       msg:"That folded hash is your golden PCR — the cryptographic fingerprint of a known-good boot. Remember it for the next step."};
   }},
  {type:"run", t:"Idea 2 / detect the rootkit", prose:"A bootkit swapped the bootloader (<code>bb</code> → <code>b9</code>). Re-extend and decide: does the PCR still match golden?",
   code:`firmware  = aa\nbootloader= b9\nkernel    = cc`,
   run:async(code,ctx)=>{
     const meas=[...code.matchAll(/=\s*([0-9a-f]{2,})/gi)].map(m=>m[1].length%2?("0"+m[1]):m[1]);
     let pcr="00".repeat(32); for(const m of meas) pcr=await pcrExtend(pcr,m);
     const golden=ctx.golden|| await (async()=>{let p="00".repeat(32);for(const m of["aa","bb","cc"])p=await pcrExtend(p,m);return p;})();
     const tampered = pcr!==golden;
     return {output:`recomputed PCR = ${pcr.slice(0,32)}…\ngolden      PCR = ${golden.slice(0,32)}…\nmatch: ${!tampered}`,
       pass:tampered, msg: tampered?"Mismatch → boot chain is tampered. One flipped byte cascades through every later measurement — that's why measured boot catches bootkits that file-AV (running inside the compromised OS) can't.":"Run it — and notice the PCR diverges from golden."};
   }},
  {type:"mcq", t:"Idea 3 / why it beats AV", q:"Why can measured boot catch a bootkit that endpoint AV misses?",
   options:[{t:"It scans more files"},{t:"The chain of trust is rooted in hardware (TPM) and measured BEFORE the OS — so it can't be lied to by malware running in that OS",correct:true},{t:"It uses a bigger hash"}],
   explain:"AV runs inside the thing it's checking. Measured boot anchors trust in the TPM and records the chain before the OS loads, so a rootkit can't forge a clean measurement."}
 ]},

/* 08 ───────────────────────────────────────────────────────────── */
{track:"08 · cryptography", id:"01-primitives-practice", title:"Crypto Primitives",
 substrate:"real", engine:"REAL SubtleCrypto (SHA-256, HMAC)",
 capstone:"Mostly inline — the track's lab builds a small tool that signs & verifies artifacts.",
 steps:[
  {type:"run", t:"Idea 1 / hashing is one-way", prose:"Hash a message with SHA-256 (real, in your browser). Edit the text and watch the digest change completely — that's the avalanche effect.",
   code:`attack at dawn`,
   run:async(code)=>{ const h=await sha256hex(code); return {output:`SHA-256 = ${h}`, pass:true, msg:"Change one character and ~half the output bits flip. Deterministic, one-way, fixed-length — the basis of integrity."};}},
  {type:"input", t:"Idea 2 / hit a target digest (flag)", prose:"Find the word that hashes to <code>2c624232…</code> (sha256). hint: it's the literal string <code>password</code>… try variations until the prefix matches.",
   placeholder:"guess a word",
   verify:async(v)=>{ const h=await sha256hex(v.trim()); const ok=h.startsWith("5e884898da280471"); return {pass:ok, out:`sha256(${v.trim()}) = ${h.slice(0,24)}…`, msg: ok?"Matched — that's how a `flag` grade-check works: we store the hash, you prove you found the input. Zero answer-leak.":"Not it — but you can see the digest. (It's the classic weak password.)"};}},
  {type:"run", t:"Idea 3 / a hash isn't a MAC", prose:"Compute an HMAC-SHA256 with a key. Unlike a bare hash, an attacker who can't guess the key can't forge it.",
   code:`key=s3cret\nmsg=transfer $100`,
   run:async(code)=>{
     const key=(code.match(/key=(.*)/)||[])[1]||""; const msg=(code.match(/msg=(.*)/)||[])[1]||"";
     const k=await crypto.subtle.importKey("raw",enc.encode(key),{name:"HMAC",hash:"SHA-256"},false,["sign"]);
     const sig=await crypto.subtle.sign("HMAC",k,enc.encode(msg));
     const hex=[...new Uint8Array(sig)].map(b=>b.toString(16).padStart(2,"0")).join("");
     return {output:`HMAC = ${hex}`, pass:true, msg:"Integrity + authenticity. Change the key OR the message and it's a different tag — this is what signs your receipts and API requests."};
   }}
 ]},

/* 09 ───────────────────────────────────────────────────────────── */
{track:"09 · python for security", id:"03-structured-data-reporting", title:"Structured Data → Report",
 substrate:"real", engine:"runs JS over bundled scan data (the Python equivalent shown)",
 capstone:"The lab writes the real Python (csv/json/pandas) and packages it as a CLI.",
 data:[
  {host:"10.0.0.5", port:445, svc:"smb"},{host:"10.0.0.5", port:445, svc:"smb"},
  {host:"10.0.0.9", port:22, svc:"ssh"},{host:"10.0.0.5", port:3389, svc:"rdp"},
  {host:"10.0.0.9", port:445, svc:"smb"}
 ],
 steps:[
  {type:"run", t:"Idea 1 / count what matters", prose:"You have 5 scan rows (see engine note). How many <b>distinct hosts</b> expose SMB (port 445)? Click run — this filters & dedups the data for real.",
   code:`// pseudo: rows.filter(port==445).map(host) |> unique |> count`,
   run:async(code,ctx)=>{ const hosts=[...new Set(ctx.data.filter(r=>r.port===445).map(r=>r.host))]; return {output:`SMB hosts: ${hosts.join(", ")}\ncount = ${hosts.length}`, pass:true, msg:`Two distinct hosts. The Python is one line: <code>{r['host'] for r in rows if r['port']==445}</code>.`};}},
  {type:"input", t:"Idea 2 / the report row", prose:"You're writing the exec table. Type how many <b>distinct hosts</b> have RDP (3389) exposed.",
   placeholder:"#",
   verify:(v)=>{ const ok=v.trim()==="1"; return {pass:ok, msg: ok?"1 — host 10.0.0.5. That's a finding (RDP exposed). Reporting = turning rows into the 3 numbers a manager reads.":"Filter port==3389, unique hosts."};}},
  {type:"mcq", t:"Idea 3 / why dedupe", q:"Why does deduping before counting matter in a real scan report?",
   options:[{t:"It's faster"},{t:"Raw scan output double-counts (multiple ports/rows per host) — un-deduped numbers overstate exposure and burn your credibility",correct:true},{t:"It sorts the data"}],
   explain:"Hand a manager '5 SMB exposures' when it's 2 hosts and your whole report gets doubted. Clean aggregation is the deliverable."}
 ]},

/* 10 ───────────────────────────────────────────────────────────── */
{track:"10 · automation", id:"08-soar-fundamentals", title:"SOAR Fundamentals",
 substrate:"sim", engine:"JS playbook runner over a bundled alert",
 capstone:"Build the playbook in a real SOAR (Shuffle/Tines) and fire it on a webhook.",
 alert:{type:"phishing_url", vt_score:9, user:"bob", url:"http://evil-c2[.]top"},
 steps:[
  {type:"order", t:"Idea 1 / shape the playbook", prose:"Put these playbook stages in the right order:",
   items:["contain (block URL / isolate)","enrich (look up the URL reputation)","decide (is it malicious?)"],
   correct:["enrich (look up the URL reputation)","decide (is it malicious?)","contain (block URL / isolate)"],
   explain:"Enrich → decide → act. Containing before you've enriched/decided is how SOAR auto-isolates the CEO over a false positive."},
  {type:"run", t:"Idea 2 / wire the decision", prose:"Set the threshold: auto-contain when VirusTotal score <code>&gt;= ?</code>. The runner fires it against a live alert (vt_score=9).",
   code:`threshold = 5`,
   run:async(code,ctx)=>{ const th=parseInt((code.match(/=\s*(\d+)/)||[])[1]||"99",10); const fire=ctx.alert.vt_score>=th;
     return {output:`alert.vt_score=${ctx.alert.vt_score}  threshold=${th}\n=> ${fire?"CONTAIN: block "+ctx.alert.url+", notify "+ctx.alert.user:"no action"}`,
       pass:fire&&th>=4&&th<=8, msg: !fire?"Threshold too high — the malicious alert slipped through.": (th<4?"That'll auto-contain on near-anything; you'll isolate users over noise.":"Good band — high-confidence auto-contain, low-confidence to a human.")};}},
  {type:"mcq", t:"Idea 3 / the guardrail", q:"Which action should stay human-in-the-loop even in a mature SOAR?",
   options:[{t:"Enriching an indicator"},{t:"Disabling a production user account / isolating a critical server",correct:true},{t:"Tagging the ticket"}],
   explain:"Reversible enrichment: automate freely. Destructive/business-impacting containment: gate behind a human or tight confidence. SOAR maturity is knowing the difference."}
 ]},

/* 11 ───────────────────────────────────────────────────────────── */
{track:"11 · ztna", id:"08-policy-as-code", title:"Policy as Code",
 substrate:"real", engine:"JS policy evaluator over bundled access requests (Rego-shaped)",
 capstone:"Author the same logic in real OPA/Rego (or Cedar), unit-test it, run it in CI.",
 data:[
  {user:"alice", dept:"finance", compliant:true,  resource:"payroll", expect:"allow"},
  {user:"bob",   dept:"finance", compliant:false, resource:"payroll", expect:"deny"},
  {user:"carol", dept:"sales",   compliant:true,  resource:"payroll", expect:"deny"}
 ],
 steps:[
  {type:"run", t:"Idea 1 / write the allow rule", prose:"Zero-trust = default deny, allow on explicit conditions. Tick the predicates that must ALL hold to allow access to <code>payroll</code>. (toggle with the words)",
   code:`allow if: dept=="finance" AND resource=="payroll"`,
   run:async(code,ctx)=>{
     const needDept=/dept\s*==\s*"finance"/.test(code), needRes=/resource\s*==\s*"payroll"/.test(code), needComp=/compliant/.test(code);
     const allow=r=> needRes? (r.resource==="payroll") : true, fns=[];
     const decide=r=>{ let ok = (!needDept||r.dept==="finance") && (!needRes||r.resource==="payroll") && (!needComp||r.compliant===true); return ok?"allow":"deny"; };
     const out=ctx.data.map(r=>`${r.user.padEnd(7)} got=${decide(r).padEnd(5)} want=${r.expect}`).join("\n");
     const correct=ctx.data.every(r=>decide(r)===r.expect);
     return {output:out, pass:correct, msg: correct?"All three correct — including denying the non-compliant finance user.":"Close. Look at `bob` (finance, but non-compliant device) — your rule still lets him in. What predicate is missing?"};
   }},
  {type:"mcq", t:"Idea 2 / the missing predicate", q:"Bob is in finance but his laptop is non-compliant. To deny him you must AND in:",
   options:[{t:"resource == payroll"},{t:"device compliant == true",correct:true},{t:"user == alice"}],
   explain:"Identity isn't enough in zero-trust — device posture is a first-class input. `dept==finance && resource==payroll && compliant` denies Bob and Carol, allows Alice."},
  {type:"mcq", t:"Idea 3 / why as code", q:"What's the point of expressing this as code (OPA/Rego) vs clicking it in a console?",
   options:[{t:"It's faster to type"},{t:"Versioned, unit-tested, reviewed in a PR, and identical across every enforcement point — the same detection-as-code discipline, for access",correct:true},{t:"Consoles can't do device checks"}],
   explain:"Policy-as-code is detection-as-code's twin: a file in git, tested in CI, deployed everywhere. That's the whole ZTNA operating model."}
 ]},

/* 12 ───────────────────────────────────────────────────────────── */
{track:"12 · ai-augmented ops", id:"05-building-mcp-servers", title:"Building MCP Servers",
 substrate:"real", engine:"REAL tool-call loop — a mock MCP host invokes YOUR handler",
 capstone:"Build a real MCP server (Python/TS) and connect it to Claude; the track ships a scaffold.",
 ioc_db:{"evil-c2[.]top":"malicious (confidence 0.96)","example.com":"benign"},
 steps:[
  {type:"run", t:"Idea 1 / declare the tool", prose:"A model can only call tools it's been <i>described</i>. Write the JSON schema for a <code>lookup_ioc</code> tool (needs a <code>name</code> and an <code>inputSchema</code> with one string property <code>indicator</code>).",
   code:`{\n  "name": "lookup_ioc",\n  "description": "reputation for a domain/ip",\n  "inputSchema": {\n    "type": "object",\n    "properties": { "indicator": { "type": "string" } },\n    "required": ["indicator"]\n  }\n}`,
   run:async(code)=>{ let p,ok=false; try{p=JSON.parse(code); ok=p.name==="lookup_ioc"&&p.inputSchema&&p.inputSchema.properties&&p.inputSchema.properties.indicator;}catch(e){} return {output: ok?"✓ tool registered with host. The model now 'sees' lookup_ioc in its tool list.":"schema invalid or missing name/inputSchema.indicator", pass:ok, msg: ok?"That schema is the entire contract between the model and your code — get it right and the model can call you.":"Keep valid JSON with name='lookup_ioc' and inputSchema.properties.indicator."};}},
  {type:"run", t:"Idea 2 / run the loop", prose:"The host now simulates the model deciding to call your tool with <code>{\"indicator\":\"evil-c2[.]top\"}</code>. Your handler must return the verdict. Fill the lookup.",
   code:`function handle(args) {\n  const db = HOST.ioc_db;            // provided\n  return db[args.indicator] || "unknown";\n}`,
   run:async(code,ctx)=>{
     let verdict="(handler error)"; try{ const f=new Function("HOST", code+"; return handle({indicator:'evil-c2[.]top'});"); verdict=f({ioc_db:ctx.ioc_db}); }catch(e){verdict="ERR: "+e.message;}
     const ok=/malicious/.test(verdict);
     return {output:`model → tool_use: lookup_ioc({"indicator":"evil-c2[.]top"})\ntool_result ← ${verdict}\nmodel: "That domain is malicious; I'd block it."`, pass:ok,
       msg: ok?"You closed the loop: model→tool_use→your handler→tool_result→model. That round-trip IS an MCP server.":"Make the handler return the db lookup for the indicator."};
   }},
  {type:"mcq", t:"Idea 3 / the security catch", q:"What's the #1 thing to harden in a tool a model can call?",
   options:[{t:"Make it faster"},{t:"Validate/contain the args — the model will pass malformed or adversarial input (and prompt-injected content can steer it)",correct:true},{t:"Return more data so it has context"}],
   explain:"A tool is an attack surface the moment a model (steerable by untrusted content) can invoke it. Validate inputs, scope permissions, never trust the call blindly — the curriculum's 'review every line' posture, enforced in code."}
 ]}
,
{track:"00 · foundations", id:"fnd-01-security-principles", title:"Security First Principles",
 engine:"concept checks + risk math (JS)",
 capstone:"Pick a real CISA KEV breach and write a one-page CIA/AAA + controls analysis — your first portfolio artifact.",
 steps:[
  {type:"mcq", t:"Bite 1 / CIA", q:"Ransomware encrypts a hospital’s files and demands payment. Which leg of the CIA triad does it primarily attack?",
   options:[{t:"Confidentiality"},{t:"Availability",correct:true},{t:"Non-repudiation"}], explain:"It denies access to data you’re entitled to — Availability. (It can hit Integrity too, but the squeeze is Availability.)"},
  {type:"mcq", t:"Bite 2 / authn vs authz", q:"A user logs in with valid credentials, then edits another user’s invoice. What failed?",
   options:[{t:"Authentication"},{t:"Authorization",correct:true},{t:"Encryption"}], explain:"They proved who they are (authn) but did something they shouldn’t (authz). Most ‘broken access control’ is an authz failure."},
  {type:"run", t:"Bite 3 / risk = likelihood × impact", prose:"Three findings below. Click run — it scores risk and picks what to fix first.",
   code:"// [name, likelihood(1-5), impact(1-5)]",
   run:async(code)=>{ const f=[["public S3 with PII",5,5],["TLS1.0 enabled",3,2],["missing security.txt",1,1]];
     const sc=f.map(x=>[x[0],x[1]*x[2]]).sort((a,b)=>b[1]-a[1]);
     return {output:sc.map(s=>s[0].padEnd(22)+" risk="+s[1]).join("\n"), pass:true, msg:"Highest risk first — you never ‘fix everything’, you fix what’s both likely and impactful (the KEV/EPSS instinct)."}; }}
 ]},
{track:"00 · foundations", id:"fnd-02-lab-setup", title:"Building a Safe Lab",
 engine:"compose-fix + mock shell",
 capstone:"Bring up the bundled lab with `make up` and confirm it’s isolated from your real network.",
 steps:[
  {type:"mcq", t:"Bite 1 / isolation", q:"You’re about to run intentionally-vulnerable software. Which network keeps a lab exploit off your home LAN?",
   options:[{t:"Bridged (VM on your real network)"},{t:"Host-only / isolated bridge — lab talks only to itself",correct:true},{t:"NAT straight to the internet"}], explain:"Hostile software belongs on an isolated segment; bridged/internet-routable lets an exploit pivot to real assets."},
  {type:"run", t:"Bite 2 / fix the compose", prose:"This service is exposed to your whole network. Put it on an isolated lab network instead.",
   code:"services:\n  dvwa:\n    image: vulnerables/web-dvwa\n    network_mode: host        # <-- danger",
   run:async(code)=>{ const bad=/network_mode:\s*host/.test(code); const good=/networks:|internal:\s*true/.test(code);
     return {output: bad?"⚠ host networking still present — reachable from your LAN.":"lab network applied.", pass:!bad&&good, msg:(!bad&&good)?"Isolated — the app can’t see your real network now.":"Remove `network_mode: host` and put it on a named (ideally `internal: true`) network."}; }},
  {type:"terminal", t:"Bite 3 / prove it’s up", prose:"Mock shell. Try `docker compose ps`.",
   commands:{"docker compose ps":"NAME   IMAGE                  STATUS    PORTS\ndvwa   vulnerables/web-dvwa   Up 4s     172.30.0.2:80","make up":"Creating network lab_internal ... done\nCreating dvwa ... done","curl target":"<html><title>DVWA</title> ... Login ..."},
   goal:"docker compose ps", goalMsg:"Live and isolated — you’re ready to attack it safely."}
 ]},
{track:"00 · foundations", id:"fnd-03-docker", title:"Docker & Containers",
 engine:"compose parsing (JS) + mock docker",
 capstone:"Write a Dockerfile, build it, and run your own container — committed to your portfolio.",
 steps:[
  {type:"mcq", t:"Bite 1 / image vs container", q:"What’s the relationship between a Docker image and a container?",
   options:[{t:"They’re the same thing"},{t:"An image is the read-only template; a container is a running instance of it",correct:true},{t:"A container builds the image"}], explain:"Image = frozen filesystem + metadata; container = a running process with a writable layer. One image → many containers."},
  {type:"run", t:"Bite 2 / read the compose", prose:"Which host port does this expose? Click run to parse the published ports.",
   code:"services:\n  web:\n    image: nginx\n    ports:\n      - \"8080:80\"",
   run:async(code)=>{ const m=[...code.matchAll(/(\d+):(\d+)/g)].map(x=>"host "+x[1]+" -> container "+x[2]);
     return {output:m.length?m.join("\n"):"no published ports", pass:m.length>0, msg:m.length?"Published ports are your attack surface — expose only what you must.":"Add a ports mapping like \"8080:80\"."}; }},
  {type:"terminal", t:"Bite 3 / run it", prose:"Mock shell. Try `docker run hello-world` then `docker ps`.",
   commands:{"docker run hello-world":"Hello from Docker!\nYour installation appears to be working.","docker ps":"CONTAINER ID  IMAGE  STATUS   PORTS\n9f2a          nginx  Up 3s    0.0.0.0:8080->80/tcp","docker images":"REPOSITORY  TAG     SIZE\nnginx       latest  187MB"},
   goal:"docker ps", goalMsg:"Image → run → live container. The real engine is one Codespace away."}
 ]},
{track:"00 · foundations", id:"fnd-04-linux", title:"Linux for Security",
 engine:"real parsing over planted host data (JS)",
 capstone:"Write linux-triage.md (privileged accounts, SUID list, top failed-login IPs), then turn it into a reusable linux-triage.sh — AI drafts, you review every line, you commit it.",
 steps:[
  {type:"mcq", t:"Bite 1 / everything is a file", q:"You want a running process’s command line and open files — with no special API. Where do you look?",
   options:[{t:"A database the kernel keeps"},{t:"/proc/<pid>/ — the kernel exposes live process state as files",correct:true},{t:"You can’t without root"}], explain:"Processes, devices, even live kernel state appear under /proc, /dev, /sys as files you read with ordinary tools. That’s why text-processing is a security superpower, not a chore."},
  {type:"run", t:"Bite 2 / decode permissions", prose:"`ls -l` output. One file is world-writable — anyone can modify it (a classic foothold). Click run to flag it.",
   code:"-rw-r--r-- 1 root root  /etc/hostname\n-rwxr-xr-x 1 root root  /usr/bin/id\n-rw-rw-rw- 1 root root  /etc/cron.d/backup",
   run:async(code)=>{ const bad=code.split("\n").filter(l=>/^.{8}w/.test(l)).map(l=>l.split(/\s+/).pop());
     return {output: bad.length?("world-writable: "+bad.join(", ")):"none", pass:bad.length>0, msg: bad.length?"`/etc/cron.d/backup` is world-writable — anyone can edit a root cron job. The last rwx triad (‘other’) is where privesc hides.":"Check chars 8–10 (the ‘other’ triad) for a w."}; }},
  {type:"run", t:"Bite 3 / the SUID set", prose:"SUID runs a binary as its <i>owner</i>, not you — fine for `passwd`, lethal for a shell or `find`. Click run to flag the SUID binary that shouldn’t be.",
   code:"-rwsr-xr-x root /usr/bin/passwd\n-rwsr-xr-x root /usr/bin/sudo\n-rwsr-xr-x root /usr/bin/find",
   run:async(code)=>{ const suid=code.split("\n").filter(l=>/^-rws/.test(l)).map(l=>l.split(/\s+/).pop()); const danger=suid.filter(b=>/\/(find|vim|nmap|bash|cp|nano|less|awk)$/.test(b));
     return {output:"SUID-root: "+suid.join(", ")+"\nescalation risk: "+(danger.join(", ")||"none"), pass:danger.length>0, msg: danger.length?"SUID `find` is instant root (`find . -exec /bin/sh \; `). passwd/sudo are expected; a SUID shell-capable binary is the seed of half of Linux privesc — see GTFOBins.":"Spot the binary that isn’t a normal SUID-root tool."}; }},
  {type:"run", t:"Bite 4 / who can become root", prose:"Two ways to root: be UID 0, or be in a group sudoers trusts. Click run to list both from /etc/passwd + /etc/group.",
   code:"# passwd\nroot:x:0:0::/root:/bin/bash\nsupport:x:0:0::/home/support:/bin/bash\nbob:x:1000:1000::/home/bob:/bin/bash\n# group\nsudo:x:27:bob",
   run:async(code)=>{ const lines=code.split("\n"); const uid0=lines.filter(l=>/^[^#]/.test(l)&&l.split(":")[2]==="0").map(l=>l.split(":")[0]); const sudo=(lines.find(l=>/^sudo:/.test(l))||"").split(":")[3]||"";
     return {output:"UID 0 (root): "+uid0.join(", ")+"\nin sudo group: "+(sudo||"(none)"), pass:uid0.includes("support")&&/bob/.test(sudo), msg: uid0.includes("support")?"`support` is a hidden UID-0 root, and `bob` can sudo — both are ‘can become root’. The kernel trusts the UID; sudo trusts the group.":"List every UID-0 account plus the sudo group’s members."}; }},
  {type:"run", t:"Bite 5 / what’s running", prose:"Triage step one: what’s eating the box? Click run to sort by CPU and name the top consumer.",
   code:"USER PID %CPU CMD\nroot 1 0.0 /sbin/init\nwww 812 1.2 nginx\nbob 990 88.5 xmrig\nbob 991 0.3 bash",
   run:async(code)=>{ const rows=code.split("\n").slice(1).map(l=>l.trim().split(/\s+/)).filter(r=>r.length>=4).sort((a,b)=>parseFloat(b[2])-parseFloat(a[2])); const top=rows[0];
     return {output:rows.map(r=>r[2].padStart(5)+"%  "+r[3]).join("\n"), pass:top&&/xmrig/.test(top[3]), msg: (top&&/xmrig/.test(top[3]))?"`xmrig` at 88% CPU is a crypto-miner. ‘Sort by CPU’ finds the runaway in seconds.":"Sort the %CPU column descending."}; }},
  {type:"run", t:"Bite 6 / rank the brute force", prose:"The pipeline (<code>grep | awk | sort | uniq -c | sort -rn</code>) is the log-triage skill. This is real OpenSSH brute-force noise (MITRE T1110). Click run to rank failed logins per source IP.",
   code:"Failed password for root from 45.83.64.1 port 22\nFailed password for admin from 45.83.64.1 port 22\nAccepted password for bob from 10.0.0.5 port 22\nFailed password for root from 45.83.64.1 port 22\nFailed password for root from 218.92.0.158 port 22",
   run:async(code)=>{ const c={}; code.split("\n").forEach(l=>{const m=l.match(/Failed password.* from (\S+)/); if(m)c[m[1]]=(c[m[1]]||0)+1;}); const t=Object.entries(c).sort((a,b)=>b[1]-a[1]);
     return {output:t.map(x=>String(x[1]).padStart(3)+"  "+x[0]).join("\n"), pass:t.length>0&&t[0][0]==="45.83.64.1", msg: (t.length>0&&t[0][0]==="45.83.64.1")?"45.83.64.1 leads — your block candidate, and the seed of a real detection. This five-stage pipeline is what you’ll live in.":"Count ‘Failed password … from <ip>’ per IP, ranked."}; }},
  {type:"mcq", t:"Bite 7 / read the pipeline", q:"In `grep Failed auth.log | awk '{print $NF}' | sort | uniq -c | sort -rn`, which stage does the counting?",
   options:[{t:"grep"},{t:"uniq -c — it collapses identical adjacent lines and prepends the count (so you sort first)",correct:true},{t:"awk"}], explain:"grep filters, awk extracts the field, sort groups identical lines, `uniq -c` counts them, `sort -rn` ranks. Knowing each stage’s job lets you build any triage one-liner."},
  {type:"note", t:"Bite 8 / a real shell, in your browser", html:"You’ve been reading planted output. Now drive a <b>real Linux kernel</b> — no install. This boots a genuine Debian client-side (the scenario’s planted users/logs live in the local lab below; here you just get a real shell to practise on).",
   render:()=>'<a class="pt-launch" href="https://webvm.io/" target="_blank" rel="noopener">▶ Open a real Linux shell (WebVM)</a><div class="pt-linkrow">Real Debian via x86→WASM. Try <code>ls -l /etc</code>, <code>cat /etc/passwd</code>, <code>ps aux</code>. (Third-party frame; opens in a new tab.)</div>'}
 ]},
{track:"00 · foundations", id:"fnd-05-windows", title:"Windows for Security",
 engine:"event-log triage (JS)",
 capstone:"Triage a Security.evtx sample: identify a logon brute force and write the timeline.",
 steps:[
  {type:"mcq", t:"Bite 1 / logon events", q:"In Windows Security logs, which Event ID is a *successful* logon?",
   options:[{t:"4625"},{t:"4624",correct:true},{t:"1102"}], explain:"4624 = success, 4625 = failed logon, 1102 = audit log cleared (itself a red flag)."},
  {type:"run", t:"Bite 2 / spot the brute force", prose:"A slice of Security events. Click run to count 4625 (failed) by account.",
   code:"4624 bob\n4625 administrator\n4625 administrator\n4625 administrator\n4624 alice\n4625 administrator",
   run:async(code)=>{ const c={}; code.split("\n").forEach(l=>{const p=l.trim().split(/\s+/); if(p[0]==="4625")c[p[1]]=(c[p[1]]||0)+1;}); const t=Object.entries(c).sort((a,b)=>b[1]-a[1]); const ok=t.length&&t[0][0]==="administrator";
     return {output:t.map(x=>"4625 "+x[0]+"  x"+x[1]).join("\n"), pass:ok, msg:ok?"‘administrator’ is being hammered — a 4625 spike then a 4624 = success-after-failures.":"Count the 4625 lines by account."}; }},
  {type:"mcq", t:"Bite 3 / least privilege", q:"Why give admins a *standard* account for daily work plus a separate admin account?",
   options:[{t:"To save licenses"},{t:"So a phish in everyday work doesn’t run with admin rights (least privilege)",correct:true},{t:"Windows requires it"}], explain:"Tiering credentials limits blast radius — the everyday token can’t install a service or dump LSASS."}
 ]},
{track:"00 · foundations", id:"fnd-06-networking", title:"Networking Fundamentals",
 engine:"subnet calc + port parsing (JS)",
 capstone:"Capture and read your own traffic with tcpdump; explain a TCP handshake from the bytes.",
 steps:[
  {type:"mcq", t:"Bite 1 / a port is a hypothesis", q:"A scan shows tcp/443 open. What do you conclude?",
   options:[{t:"Definitely HTTPS, no need to check"},{t:"Probably HTTPS — but a port is a hypothesis; banner-grab to confirm",correct:true},{t:"SSH"}], explain:"443 is conventionally HTTPS, but anything can listen anywhere. The port suggests; the banner confirms."},
  {type:"run", t:"Bite 2 / subnet math", prose:"Real CIDR math. Click run to compute usable hosts for the block. (Edit the CIDR.)",
   code:"10.0.5.0/24",
   run:async(code)=>{ const m=code.trim().match(/^(\d+)\.(\d+)\.(\d+)\.(\d+)\/(\d+)$/); if(!m)return{output:"bad CIDR",pass:false,msg:"Format like 10.0.5.0/24"}; const bits=+m[5]; const hosts=bits<=30?Math.pow(2,32-bits)-2:0;
     return {output:"network "+m[1]+"."+m[2]+"."+m[3]+"."+m[4]+"/"+bits+"\nusable hosts: "+hosts, pass:true, msg:"/"+bits+" → "+hosts+" usable hosts. Subnetting scopes a scan and segments a network — both sides of the job."}; }},
  {type:"input", t:"Bite 3 / well-known port", prose:"Your nmap shows 22, 80, 445 open. Which is SMB (worth a hard look)? Type the port.",
   placeholder:"port",
   verify:(v)=>{ const ok=v.trim()==="445"; return {pass:ok, msg:ok?"445 = SMB. Exposed SMB starts a lot of breaches (EternalBlue, ransomware spread).":"22=SSH, 80=HTTP, 445=SMB."}; }}
 ]},
{track:"00 · foundations", id:"fnd-07-web-http", title:"Web & HTTP Fundamentals",
 engine:"HTTP parsing + base64 (JS)",
 capstone:"Proxy your browser through Burp/ZAP, capture a login, and annotate every header.",
 steps:[
  {type:"mcq", t:"Bite 1 / 401 vs 403", q:"An API returns 403 to your *authenticated* request. What does that tell you?",
   options:[{t:"You’re not logged in"},{t:"You ARE authenticated but not authorized for this resource",correct:true},{t:"The server is down"}], explain:"401 = authenticate; 403 = I know you, you can’t. 403-on-authenticated is the scent of broken access control."},
  {type:"run", t:"Bite 2 / read the request", prose:"Click run to parse this request and flag an access-control test worth running.",
   code:"GET /account?id=5 HTTP/1.1\nHost: app.local\nCookie: session=abc\nUser-Agent: curl",
   run:async(code)=>{ const idor=/[?&]id=\d+/.test(code); return {output:"method: "+code.split(" ")[0]+"\nhost: "+((code.match(/Host: (.*)/)||[])[1]||"?")+"\nobject id: "+(idor?"present — try id=6":"none"), pass:idor, msg:idor?"A numeric object id in the URL screams IDOR — does id=6 return someone else’s account? That’s the authz test.":"No obvious object reference here."}; }},
  {type:"run", t:"Bite 3 / decode the cookie", prose:"This cookie looks random. Click run to base64-decode it — encoding isn’t secrecy.",
   code:"eyJ1c2VyIjoiYm9iIiwicm9sZSI6InVzZXIifQ",
   run:async(code)=>{ let d; try{d=atob(code.trim().replace(/-/g,'+').replace(/_/g,'/'));}catch(e){d="(not base64)";} const ok=/role/.test(d);
     return {output:d, pass:ok, msg:ok?"Base64 JSON — tamper role:user → role:admin and you’ve found broken access control. Base64 ≠ encryption.":"Not decodable as base64."}; }}
 ]},
{track:"00 · foundations", id:"fnd-08-data-encoding", title:"Data & Encoding",
 engine:"base64 / hex / url (JS, real)",
 capstone:"Build a tiny multi-stage decoder (base64→gzip→json) over a real sample and commit it.",
 steps:[
  {type:"run", t:"Bite 1 / base64", prose:"Decode this base64 (real atob).",
   code:"cGxhaW50ZXh0IGlzIG5vdCBlbmNyeXB0aW9u",
   run:async(code)=>{ let d; try{d=atob(code.trim());}catch(e){d="(invalid)";} const ok=/plaintext/.test(d); return {output:d, pass:ok, msg:ok?"Base64 is reversible by anyone — transport, not protection.":"Paste valid base64."}; }},
  {type:"run", t:"Bite 2 / hex", prose:"Decode this space-separated hex.",
   code:"48 54 54 50 2f 31 2e 31",
   run:async(code)=>{ const d=code.trim().split(/\s+/).map(h=>String.fromCharCode(parseInt(h,16))).join(""); const ok=/HTTP/.test(d); return {output:d, pass:ok, msg:ok?"Hex is just base-16 bytes — every analyst reads it on sight.":"Space-separated hex bytes."}; }},
  {type:"mcq", t:"Bite 3 / encoding ≠ encryption", q:"A dev base64-encodes passwords ‘so they’re safe’. What’s wrong?",
   options:[{t:"Nothing, base64 is secure"},{t:"Base64 is reversible with no key — it hides nothing; use hashing/encryption",correct:true},{t:"It’s too slow"}], explain:"Encoding changes representation, not secrecy. Passwords need salted hashing; secrets need encryption with a key."}
 ]},
{track:"00 · foundations", id:"fnd-09-cryptography", title:"Cryptography Basics",
 engine:"SubtleCrypto (real)",
 capstone:"Build a small tool that signs and verifies a file; explain where each key lives.",
 steps:[
  {type:"run", t:"Bite 1 / hashing", prose:"Real SHA-256. Edit the text and watch every bit change (avalanche).",
   code:"plaintext",
   run:async(code)=>{ const h=await sha256hex(code); return {output:"sha256 = "+h, pass:true, msg:"Deterministic, one-way, fixed-length — the basis of integrity and the flag checks you keep seeing."}; }},
  {type:"mcq", t:"Bite 2 / asymmetric", q:"In public-key crypto, which key encrypts a message *to* you?",
   options:[{t:"Your private key"},{t:"Your public key — only your private key can decrypt it",correct:true},{t:"A shared password"}], explain:"Encrypt with the recipient’s public key; only their private key opens it. That’s how TLS bootstraps without a shared secret."},
  {type:"input", t:"Bite 3 / hit the hash (flag)", prose:"Which common password hashes (sha256) to a value starting <code>5e884898…</code>?",
   placeholder:"a word",
   verify:async(v)=>{ const h=await sha256hex(v.trim()); const ok=h.startsWith("5e884898da280471"); return {pass:ok, out:"sha256("+v.trim()+") = "+h.slice(0,20)+"…", msg:ok?"Matched — exactly how a flag check works: store the hash, prove the input.":"Not it — but you see the digest. (It’s the most common weak password.)"}; }}
 ]},
{track:"00 · foundations", id:"fnd-10-scripting", title:"Scripting & Automation",
 engine:"regex / filtering (JS); Python shown",
 capstone:"Turn a manual triage into a reusable script (AI drafts, you review every line) and commit it.",
 steps:[
  {type:"run", t:"Bite 1 / extract IOCs", prose:"Pull every IP from this blob with a pattern (Python shown after).",
   code:"conn from 203.0.113.9 ok; 10.0.0.5 retry; bad 45.83.64.1 x3",
   run:async(code)=>{ const ips=code.match(/\d{1,3}(?:\.\d{1,3}){3}/g)||[]; return {output:ips.join("\n")+"\n\n# python: re.findall(r'\\d{1,3}(?:\\.\\d{1,3}){3}', text)", pass:ips.length>=3, msg:ips.length>=3?"Extraction + dedupe is 80% of security scripting.":"Expected several IPs."}; }},
  {type:"mcq", t:"Bite 2 / exit codes", q:"Your script ends `exit 0`. In a CI gate, what does that signal?",
   options:[{t:"Failure"},{t:"Success — 0 = OK, non-zero = failure; gates key off this",correct:true},{t:"Nothing"}], explain:"Exit codes are how scripts talk to pipelines. 0 passes the gate; anything else fails it."},
  {type:"run", t:"Bite 3 / filter to signal", prose:"Count only the ERROR lines.",
   code:"INFO start\nERROR disk full\nWARN retry\nERROR oom\nINFO done",
   run:async(code)=>{ const n=code.split("\n").filter(l=>/^ERROR/.test(l)).length; return {output:"ERROR lines: "+n, pass:n===2, msg:n===2?"Filtering to the signal — the heart of log triage and your first reusable script.":"Count lines starting with ERROR."}; }}
 ]},
{track:"00 · foundations", id:"fnd-11-version-control", title:"Version Control in the Open",
 engine:"secret-scan (JS) + git concepts",
 capstone:"Set up a portfolio repo with a .gitignore and a pre-commit secret scan; make your first signed commit.",
 steps:[
  {type:"mcq", t:"Bite 1 / commit vs push", q:"You `git commit`. Is your work on GitHub now?",
   options:[{t:"Yes, commit uploads it"},{t:"No — commit is local; `git push` sends it to the remote",correct:true},{t:"Only if you’re online"}], explain:"Commit records locally; push publishes. Knowing the difference avoids both ‘I lost my work’ and ‘I pushed a secret’."},
  {type:"run", t:"Bite 2 / catch the secret", prose:"Pre-commit scan. Click run to flag what must NOT be committed.",
   code:"+ API_BASE=https://api.example.com\n+ AWS_SECRET_ACCESS_KEY=wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY\n+ DEBUG=true",
   run:async(code)=>{ const hits=code.split("\n").filter(l=>/SECRET|PRIVATE KEY|AKIA|wJalr|API_KEY|TOKEN|password=/i.test(l)); return {output:hits.length?("⚠ would block:\n"+hits.join("\n")):"clean", pass:hits.length>0, msg:hits.length?"That AWS secret would be public forever once pushed — why secret-scanning runs in pre-commit/CI, and why .gitignore + a vault exist.":"Look for credential-shaped lines."}; }},
  {type:"mcq", t:"Bite 3 / shared history", q:"Why never `git push -f` to a shared branch?",
   options:[{t:"It’s slower"},{t:"It rewrites history others built on — you can erase their commits",correct:true},{t:"GitHub bans it"}], explain:"Force-push on shared history is destructive. Rewrite only your own un-pushed work; on shared branches, add commits."}
 ]},
{track:"00 · foundations", id:"fnd-12-threat-modeling", title:"Threat Modeling",
 engine:"STRIDE mapping (JS)",
 capstone:"Threat-model a small app you’ll build later: DFD, STRIDE per element, prioritized mitigations.",
 steps:[
  {type:"mcq", t:"Bite 1 / STRIDE", q:"An attacker forges a JWT to impersonate another user. Which STRIDE category?",
   options:[{t:"Spoofing",correct:true},{t:"Denial of Service"},{t:"Repudiation"}], explain:"Pretending to be someone else = Spoofing. (Tampering = altering data; DoS = availability.)"},
  {type:"order", t:"Bite 2 / the method", prose:"Put the threat-modeling loop in order:",
   items:["enumerate threats (STRIDE per element)","diagram the system (data flow + trust boundaries)","mitigate & prioritise by risk"],
   correct:["diagram the system (data flow + trust boundaries)","enumerate threats (STRIDE per element)","mitigate & prioritise by risk"],
   explain:"Diagram → enumerate → mitigate. You can’t enumerate threats to a system you haven’t drawn, or prioritise what you haven’t enumerated."},
  {type:"mcq", t:"Bite 3 / trust boundary", q:"Where do you focus threat enumeration first?",
   options:[{t:"Inside a single trusted process"},{t:"At trust boundaries — where data crosses from less-trusted to more-trusted (user→app, app→db)",correct:true},{t:"On the prettiest diagram"}], explain:"Boundaries are where controls must live; most real findings sit on a boundary crossing — the same ‘input crossing into a control plane’ idea from injection."}
 ]}
];
const ENRICH = {"02-lab-setup": {"tiers": ["T0", "T0", "T1"], "learn": ["A security lab runs hostile software <i>on purpose</i>. <b>Isolation is control #1</b>: keep the vulnerable box on a network that reaches only itself — never your home LAN or the internet.", "Compose files encode that isolation. <code>network_mode: host</code> hands the container your real network; a named/<code>internal</code> network walls it off. You fix the environment by editing the environment.", "Bringing it up and confirming from the shell is itself the skill — and where a <b>real Linux shell</b> belongs (Tier&nbsp;1: WebVM/v86 in-browser, or your own Docker)."], "links": [{"href": "https://docs.docker.com/network/", "label": "Docker networking (docs)"}, null, null], "realenv": {"t": "Do it for real", "learn": "Spin the actual lab in a free GitHub Codespace — real Docker, real isolation — then prove it’s contained.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch lab in Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{lab-isolated}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{lab-isolated}</code>", "flagPrefix": "09987a25ca9d1a4e"}}, "08-web-ssrf-xxe": {"tiers": ["T0", "T0", "T0"], "learn": ["SSRF abuses a server feature that fetches a URL <i>for you</i>. Because the request originates inside the trust boundary, you can reach things you can’t from outside — like the cloud metadata service.", "The pattern generalises: SSRF, XXE and injection are all <b>untrusted input crossing into a privileged interpreter/requester</b>. Always ask: <i>who actually makes this request, and what can they reach?</i>", "XXE is the same move against an XML parser — an external entity makes the parser read a local file. The fix is structural: disable DTDs/external entities."], "links": [{"href": "https://portswigger.net/web-security/ssrf", "label": "PortSwigger — SSRF (free labs)"}, null, {"href": "https://owasp.org/www-community/vulnerabilities/XML_External_Entity_(XXE)_Processing", "label": "OWASP — XXE"}], "realenv": {"t": "Exploit a real SSRF CVE", "learn": "Bring up a Vulhub SSRF target in a Codespace and pull the (mock) metadata creds against a live server.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{ssrf-169254}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{ssrf-169254}</code>", "flagPrefix": "99737b77559466f8"}}, "05-intrusion-detection": {"tiers": ["T0", "T0", "T0"], "learn": ["An IDS rule fires when traffic matches a pattern. The cheap version is one content string — but cheap rules are noisy.", "Precision is the craft: add predicates until you hit the attack and <i>only</i> the attack. A rule is defined as much by what it <b>doesn’t</b> match.", "False-positive economics: a noisy rule gets muted, then misses the real thing. Tune against a benign baseline before you ship."], "links": [{"href": "https://docs.suricata.io/en/latest/rules/intro.html", "label": "Suricata — rule syntax"}, null, null], "realenv": {"t": "Run real Suricata", "learn": "Replay a PCAP through actual Suricata in a Codespace and confirm your rule fires.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{alert-fired}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{alert-fired}</code>", "flagPrefix": "ac40ed270dcbff4a"}}, "10-log-cloud-forensics": {"tiers": ["T0", "T0", "T0"], "learn": ["Cloud forensics is timeline reconstruction over API logs. CloudTrail records who did what, from where, when — your whole case is in the JSON.", "The pivot is where a trusted identity turns hostile: same user, new IP, sudden privilege. Spotting that transition is the core skill.", "Attackers cover tracks (<code>DeleteTrail</code>, <code>StopLogging</code>). Ship logs off-account so the cover-up <i>itself</i> becomes evidence."], "links": [{"href": "https://docs.aws.amazon.com/awscloudtrail/latest/userguide/cloudtrail-concepts.html", "label": "AWS — CloudTrail concepts"}, null, null], "realenv": {"t": "Query a real export", "learn": "Open a CloudTrail export in a Codespace and reconstruct the intrusion with <code>jq</code>.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{deletetrail}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{deletetrail}</code>", "flagPrefix": "8c6125f78a02bae9"}}, "13-detection-reporting": {"tiers": ["T0", "T0", "T0"], "learn": ["YARA matches malware on strings/bytes plus a condition. Start by catching the sample.", "Then the hard part: <b>don’t match goodware</b>. A unique artifact (a C2 string) beats a generic one (<code>MZ</code>, in every PE).", "Reporting turns a match into shippable intel: the IOC + the ATT&CK technique + your confidence."], "links": [{"href": "https://yara.readthedocs.io/en/stable/writingrules.html", "label": "YARA — writing rules"}, null, null], "realenv": {"t": "Compile real YARA", "learn": "Scan a MalwareBazaar sample with the real <code>yara</code> CLI in a Codespace.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{yara-hit}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{yara-hit}</code>", "flagPrefix": "85af614421df4429"}}, "05-posture-auditing": {"tiers": ["T0", "T0", "T0"], "learn": ["CSPM tools emit a flood of findings. The skill isn’t running the scanner — it’s <b>triage</b>: severity × exploitability × blast-radius.", "Remediation is editing the artifact. Remove the public principal and the bucket is private; a re-scan flips the finding to PASS.", "The exec summary is two numbers: how many FAIL, and the worst one."], "links": [{"href": "https://github.com/prowler-cloud/prowler", "label": "Prowler (open-source CSPM)"}, null, null], "realenv": {"t": "Run real Prowler", "learn": "Point Prowler at a CloudGoat/sandbox account in a Codespace and triage live output.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{public-bucket}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{public-bucket}</code>", "flagPrefix": "68c649605b639170"}}, "08-path-to-da": {"tiers": ["T0", "T0", "T2"], "learn": ["BloodHound models AD as a graph — users, groups, machines, and the rights between them. Attack paths are just <b>reachability</b>.", "Finding the path is the defender’s skill too: cut one edge and the route to Domain Admin disappears.", "Executing the chain (Kerberoast → crack → ACL abuse) is real tradecraft — it belongs in a live AD range (Tier&nbsp;2/3), not a browser."], "links": [{"href": "https://bloodhound.specterops.io/", "label": "BloodHound (docs)"}, null, null], "realenv": {"t": "Walk the chain live", "learn": "Stand up the GOAD-style AD range and run the path end-to-end to Domain Admin.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch AD range", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{domain-admin}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{domain-admin}</code>", "flagPrefix": "9cf3699c0ade85c4"}}, "11-host-boot-integrity": {"tiers": ["T0", "T0", "T0"], "learn": ["Measured boot hashes each boot component into a TPM PCR, chaining them: <code>PCR = H(PCR ‖ component)</code>. The final value fingerprints the whole chain.<details><summary>Go deeper: why chaining?</summary>Because each measurement folds into the previous, you can’t alter an early component without changing every later PCR — there’s nowhere to hide a swap.</details>", "Tamper one component and every later PCR diverges from the golden value — detection by cryptography, not signatures.", "It beats AV because trust is rooted in hardware and measured <i>before</i> the OS, so malware in that OS can’t forge a clean result."], "links": [{"href": "https://wiki.archlinux.org/title/Trusted_Platform_Module", "label": "Arch Wiki — TPM"}, null, null], "realenv": {"t": "Read real PCRs", "learn": "Read PCRs off a vTPM with <code>tpm2-tools</code> in a Codespace and diff against golden.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{pcr-mismatch}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{pcr-mismatch}</code>", "flagPrefix": "cc2ff99694d56323"}}, "01-primitives-practice": {"tiers": ["T0", "T0", "T0"], "learn": ["A hash is deterministic, one-way, fixed-length. Flip one input bit and ~half the output bits flip (avalanche).", "That property powers the <b>flag check</b> you keep seeing: we store a hash, you prove you found the input — zero answer-leak.", "A bare hash proves integrity, not authenticity. An HMAC adds a secret key, so only a key-holder can forge the tag."], "links": [{"href": "https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto", "label": "MDN — SubtleCrypto"}, null, null], "realenv": {"t": "Sign with OpenSSL", "learn": "Generate a key and sign/verify a file with real <code>openssl</code> in a Codespace.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{hmac-verified}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{hmac-verified}</code>", "flagPrefix": "112d1105a09e7637"}}, "03-structured-data-reporting": {"tiers": ["T0", "T0", "T0"], "learn": ["Security work drowns in rows — scans, logs, findings. Step one is filtering to what matters.", "A report is the few numbers a decision-maker reads: distinct exposed hosts, not raw row counts.", "Dedupe before counting — raw output double-counts hosts, and an inflated number costs you credibility."], "links": [{"href": "https://docs.python.org/3/library/csv.html", "label": "Python — csv module"}, null, null], "realenv": {"t": "Run the real Python", "learn": "Run the actual parser over an nmap CSV in a Codespace and emit a Markdown report.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{report-built}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{report-built}</code>", "flagPrefix": "fa14b55f90203152"}}, "08-soar-fundamentals": {"tiers": ["T0", "T0", "T0"], "learn": ["A SOAR playbook is a pipeline: <b>enrich → decide → act</b>. Order matters — acting before deciding is how you auto-isolate the CEO.", "The decision is a threshold on confidence. Too high misses; too low auto-contains on noise.", "Reversible actions (enrich, tag) automate freely; destructive ones (disable user, isolate host) stay human-gated."], "links": [{"href": "https://github.com/Shuffle/Shuffle", "label": "Shuffle (open-source SOAR)"}, null, null], "realenv": {"t": "Fire a real playbook", "learn": "Wire a Shuffle workflow in a Codespace and trigger it on a webhook alert.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{playbook-fired}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{playbook-fired}</code>", "flagPrefix": "498821ddadf14145"}}, "08-policy-as-code": {"tiers": ["T0", "T0", "T0"], "learn": ["Zero trust is <b>default-deny</b>: access is granted only when explicit conditions hold. You write those conditions as a policy.", "Identity alone isn’t enough — device posture is a first-class input. The missing predicate is what denies the non-compliant insider.", "As code, the policy is versioned, unit-tested, reviewed, and identical at every enforcement point.<details><summary>Go deeper: the twin</summary>This is detection-as-code’s twin — a file in git, tested in CI, deployed everywhere — applied to access instead of alerts.</details>"], "links": [{"href": "https://www.openpolicyagent.org/docs/latest/policy-language/", "label": "OPA — Rego language"}, null, null], "realenv": {"t": "Run real OPA", "learn": "Evaluate your Rego with the real <code>opa</code> CLI and its unit tests in a Codespace.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{policy-passes}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{policy-passes}</code>", "flagPrefix": "c548c9e02bcc4e0d"}}, "05-building-mcp-servers": {"tiers": ["T0", "T0", "T0"], "learn": ["A model can only call a tool it’s been <i>described</i>. The JSON schema is the entire contract between the model and your code.", "The MCP loop: model emits <code>tool_use</code> → your handler runs → <code>tool_result</code> goes back → model continues. Closing that loop <i>is</i> an MCP server.", "A callable tool is an attack surface: the model (steerable by untrusted content) will pass bad args. Validate, scope, never trust the call blindly."], "links": [{"href": "https://modelcontextprotocol.io/", "label": "Model Context Protocol (spec)"}, null, null], "realenv": {"t": "Run a real MCP server", "learn": "Launch a real MCP server + inspector in a Codespace and watch a client call your tool.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{tool-called}", "okMsg": "Verified — that’s the full real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab this comes from the grader. For the POC, paste: <code>FLAG{tool-called}</code>", "flagPrefix": "4f8a7d4b73551523"}}, "fnd-01-security-principles": {"tiers": ["T0", "T0", "T0"], "learn": ["Before tools comes the shared language. The <b>CIA triad</b> is what we protect — confidentiality, integrity, availability — and nearly every attack maps to degrading one of the three.", "<b>AAA</b> is how we control access: authentication (who are you), authorization (what may you do), accounting (what did you do). Keeping authn vs authz straight prevents a huge class of bugs.", "Risk ≈ threat × vulnerability × impact. You don’t fix everything — you fix what’s both exploitable and impactful."], "links": [{"href": "https://www.cisa.gov/known-exploited-vulnerabilities-catalog", "label": "CISA — Known Exploited Vulnerabilities"}, null, null], "realenv": {"t": "Analyse a real breach", "learn": "Pull a CISA KEV entry + vendor post-mortem in a Codespace and map it to CIA/AAA + the missing control.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{cia-mapped}", "okMsg": "Verified — the real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab the grader prints this. For the POC, paste: <code>FLAG{cia-mapped}</code>", "flagPrefix": "507bf71f7cad85d0"}}, "fnd-02-lab-setup": {"tiers": ["T0", "T0", "T1"], "learn": ["A security lab runs hostile software on purpose. <b>Isolation is control #1</b>: keep the box on a network that reaches only itself.", "Compose files encode that isolation. <code>network_mode: host</code> hands over your real network; a named/<code>internal</code> network walls it off.", "Bringing it up and confirming from the shell is the skill — and where a <b>real Linux shell</b> belongs (Tier 1: WebVM, or your own Docker)."], "links": [{"href": "https://docs.docker.com/network/", "label": "Docker networking"}, null, null], "realenv": {"t": "Bring up the real lab", "learn": "Spin the lab in a Codespace — real Docker, real isolation — then prove it’s contained.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch lab in Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{lab-isolated}", "okMsg": "Verified — the real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab the grader prints this. For the POC, paste: <code>FLAG{lab-isolated}</code>", "flagPrefix": "09987a25ca9d1a4e"}}, "fnd-03-docker": {"tiers": ["T0", "T0", "T1"], "learn": ["An image is a frozen filesystem; a container is a running instance of it. One image → many containers.", "A compose file’s published ports are your exposed attack surface — read them before you trust an environment.", "The container lifecycle (build → run → inspect) is muscle memory you’ll use in every other track."], "links": [{"href": "https://docs.docker.com/get-started/", "label": "Docker — Get started"}, null, null], "realenv": {"t": "Run real Docker", "learn": "Build and run your own container in a Codespace; confirm it’s live.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{container-up}", "okMsg": "Verified — the real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab the grader prints this. For the POC, paste: <code>FLAG{container-up}</code>", "flagPrefix": "3b5c88e16430e08d"}}, "fnd-04-linux": {"tiers": ["T0", "T0", "T0", "T0", "T0", "T0", "T0", "T1"], "learn": ["In Linux, <b>everything is a file</b>: processes, devices, even live kernel state show up under <code>/proc</code>, <code>/dev</code>, <code>/sys</code>. One set of text tools reads them all — which is exactly why text-processing is a security power tool, not busywork.", "Permissions are the whole OS access-control story in nine bits: <b>rwx</b> for user / group / other, enforced by the kernel on every open. A stray <i>world-writable</i> config or cron file is a direct foothold.", "The <b>SUID</b> bit makes a binary run as its <i>owner</i> (often root), not as you. Necessary for <code>passwd</code>; lethal for a shell-capable binary, which simply hands you the owner’s privileges. This one bit seeds half of Linux privilege escalation.", "Two paths to root: <b>be UID 0</b>, or belong to a group sudoers trusts. Auditing a host starts here — a second UID-0 account or an unexpected sudo member is how persistence hides in plain sight.", "Reading what’s <b>running</b> is triage step one. Sorting processes by CPU surfaces the runaway or crypto-miner instantly — the fastest ‘is this box owned?’ signal you have.", "The text-processing <b>pipeline</b> — <code>grep | awk | sort | uniq -c | sort -rn</code> — is what you actually live in: the one line that matters among a million. Every later track (privesc, forensics, detection) comes back to it.", "A pipeline is a sentence — each stage does one job. Read it that way (filter → extract → group → count → rank) and you can build any triage one-liner from scratch.", "Reading planted output builds pattern-recognition; driving a <b>real shell</b> builds fluency — you want both. And remember: a wrong <code>rm</code> or <code>chmod</code> on a live box has no undo, so check any generated command against <code>man</code> before you run it."], "links": [{"href": "https://man7.org/linux/man-pages/man5/proc.5.html", "label": "man 5 proc"}, {"href": "https://man7.org/linux/man-pages/man1/chmod.1.html", "label": "man 1 chmod"}, {"href": "https://gtfobins.github.io/", "label": "GTFOBins — SUID/privesc reference"}, {"href": "https://man7.org/linux/man-pages/man5/passwd.5.html", "label": "man 5 passwd"}, {"href": "https://man7.org/linux/man-pages/man1/ps.1.html", "label": "man 1 ps"}, {"href": "https://man7.org/linux/man-pages/man1/grep.1.html", "label": "man 1 grep"}, {"href": "https://man7.org/linux/man-pages/man1/uniq.1.html", "label": "man 1 uniq"}, null], "realenv": {"t": "Do it for real — the lab (local)", "learn": "The module ships a real container: Ubuntu 22.04 with planted users and a genuine SSH auth log. Run it locally and answer the triage questions by hand — by-hand first, scripted second.", "href": "../../00-foundations/modules/04-linux/lab/", "launchLabel": "Open the lab → run with make up", "afterLaunch": "<b>Setup:</b> <code>git clone</code> the labs repo, <code>cd foundations/04-linux</code>, <code>make up && make shell</code>. <b>Do:</b> (1) list local accounts + who can root, (2) find the SUID set, (3) processes by CPU, (4) rank failed logins per IP. Then paste the flag <code>make grade</code> prints:", "placeholder": "FLAG{...}", "flagPrefix": "ad42e28166f4eadc", "okMsg": "That’s the model: in-browser bites build the reflexes, the <b>local lab</b> is where you do it for real and produce the artifact.", "noMsg": "In the real lab <code>make grade</code> prints this. For the POC, paste: <code>FLAG{linux-triaged}</code>"}}, "fnd-05-windows": {"tiers": ["T0", "T0", "T0"], "learn": ["Windows speaks in Event IDs: 4624 success, 4625 failure, 1102 audit-cleared. Knowing the vocabulary is half of triage.", "A burst of 4625 against one account is password-guessing; a 4624 right after is success-after-failures.", "Tiering admin credentials (everyday standard account + separate admin) limits blast radius — least privilege on the desktop."], "links": [{"href": "https://www.ultimatewindowssecurity.com/securitylog/encyclopedia/", "label": "Windows Security Log Encyclopedia"}, null, null], "realenv": {"t": "Triage real EVTX", "learn": "Run a log-triage tool over a Security.evtx sample in a Codespace.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{event-4624}", "okMsg": "Verified — the real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab the grader prints this. For the POC, paste: <code>FLAG{event-4624}</code>", "flagPrefix": "69d1e43027db80d0"}}, "fnd-06-networking": {"tiers": ["T0", "T0", "T0"], "learn": ["A port is a <b>hypothesis</b>, not an answer — convention says 443=HTTPS, but you confirm with a banner.", "Subnetting is the math that scopes a scan and segments a network; a /24 gives 254 usable hosts.", "Well-known ports are a map: 22 SSH, 80 HTTP, 445 SMB — and exposed SMB is a frequent breach origin."], "links": [{"href": "https://www.practicalnetworking.net/series/packet-traveling/packet-traveling/", "label": "Practical Networking — Packet Traveling"}, null, null], "realenv": {"t": "Read real packets", "learn": "Capture with tcpdump and scope a subnet with nmap in a Codespace.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{subnet-ok}", "okMsg": "Verified — the real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab the grader prints this. For the POC, paste: <code>FLAG{subnet-ok}</code>", "flagPrefix": "1269a98d47615c2b"}}, "fnd-07-web-http": {"tiers": ["T0", "T0", "T0"], "learn": ["HTTP status codes carry meaning: 401 = authenticate, 403 = authenticated-but-forbidden. 403 on an authenticated request smells like broken access control.", "A numeric object id in a URL (<code>?id=5</code>) invites IDOR: does <code>id=6</code> return someone else’s data?", "Cookies/tokens are often just base64 — readable, and tamperable unless signed. Encoding is not secrecy."], "links": [{"href": "https://developer.mozilla.org/en-US/docs/Web/HTTP", "label": "MDN — HTTP"}, null, null], "realenv": {"t": "Drive real HTTP", "learn": "curl an app in a Codespace, tamper a parameter, and observe the authz check.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{http-200}", "okMsg": "Verified — the real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab the grader prints this. For the POC, paste: <code>FLAG{http-200}</code>", "flagPrefix": "eb03e6dffe9d96f9"}}, "fnd-08-data-encoding": {"tiers": ["T0", "T0", "T0"], "learn": ["Base64 turns bytes into a safe-to-transport alphabet — reversible by anyone. You’ll decode it constantly.", "Hex is base-16 bytes; reading it on sight is table stakes for analysis.", "The trap: encoding ≠ encryption. Base64’d secrets are not protected — that needs hashing or a key."], "links": [{"href": "https://developer.mozilla.org/en-US/docs/Glossary/Base64", "label": "MDN — Base64"}, null, null], "realenv": {"t": "Build a decoder", "learn": "Chain base64→gzip→json over a real sample in a Codespace.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{decoded}", "okMsg": "Verified — the real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab the grader prints this. For the POC, paste: <code>FLAG{decoded}</code>", "flagPrefix": "27bca09f54bff69b"}}, "fnd-09-cryptography": {"tiers": ["T0", "T0", "T0"], "learn": ["A hash is deterministic, one-way, fixed-length; one flipped input bit flips ~half the output (avalanche).", "Asymmetric crypto uses a keypair: encrypt with the public key, decrypt with the private — no shared secret needed.", "The flag checks you keep meeting are just hashes: we store the digest, you prove the input. Zero answer-leak."], "links": [{"href": "https://developer.mozilla.org/en-US/docs/Web/API/SubtleCrypto", "label": "MDN — SubtleCrypto"}, null, null], "realenv": {"t": "Sign with OpenSSL", "learn": "Generate a key and sign/verify a file with real openssl in a Codespace.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{hashed}", "okMsg": "Verified — the real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab the grader prints this. For the POC, paste: <code>FLAG{hashed}</code>", "flagPrefix": "c5545e7d02a10945"}}, "fnd-10-scripting": {"tiers": ["T0", "T0", "T0"], "learn": ["Security scripting is mostly extract → filter → report. Regex pulls IOCs (IPs, hashes, domains) out of noise.", "Exit codes are how a script talks to a pipeline: 0 passes the gate, non-zero fails it — set them deliberately.", "Filtering to the signal (just the ERRORs) is the first script you’ll reuse forever. AI drafts it; you review every line."], "links": [{"href": "https://docs.python.org/3/library/re.html", "label": "Python — re module"}, null, null], "realenv": {"t": "Run real Python", "learn": "Run the parser over an nmap CSV in a Codespace and emit a Markdown report.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{script-ran}", "okMsg": "Verified — the real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab the grader prints this. For the POC, paste: <code>FLAG{script-ran}</code>", "flagPrefix": "cbc15e2f33e43823"}}, "fnd-11-version-control": {"tiers": ["T0", "T0", "T0"], "learn": ["Commit is local; push publishes. The gap is where ‘I lost my work’ and ‘I pushed a secret’ both live.", "A committed secret is public forever once pushed — pre-commit/CI secret scanning and a good .gitignore exist for exactly this.", "Force-push rewrites shared history and can erase others’ commits; rewrite only your own un-pushed work."], "links": [{"href": "https://git-scm.com/book/en/v2", "label": "Pro Git (book)"}, null, null], "realenv": {"t": "Real git + gitleaks", "learn": "Set up a repo with a pre-commit secret scan in a Codespace and make a clean signed commit.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{committed}", "okMsg": "Verified — the real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab the grader prints this. For the POC, paste: <code>FLAG{committed}</code>", "flagPrefix": "0f90c96309774f9d"}}, "fnd-12-threat-modeling": {"tiers": ["T0", "T0", "T0"], "learn": ["STRIDE names the threat classes: Spoofing, Tampering, Repudiation, Info-disclosure, DoS, Elevation. Forging an identity is Spoofing.", "The method is an order: diagram the system → enumerate threats per element → mitigate by risk. Skipping the diagram skips the threats.", "Trust boundaries — where data crosses from less- to more-trusted — are where controls belong and where most findings live."], "links": [{"href": "https://owasp.org/www-community/Threat_Modeling_Process", "label": "OWASP — Threat Modeling Process"}, null, null], "realenv": {"t": "Build the model", "learn": "Draft a DFD + STRIDE table for a small app in a Codespace and commit it.", "href": "https://codespaces.new/plaintext-security/plaintext-labs?quickstart=1", "launchLabel": "Launch in GitHub Codespaces", "afterLaunch": "Then run the lab steps and paste the flag your run prints (same hash-check the in-browser bites use):", "placeholder": "FLAG{model-built}", "okMsg": "Verified — the real-container → flag loop, identical to <code>make grade</code>.", "noMsg": "In the real lab the grader prints this. For the POC, paste: <code>FLAG{model-built}</code>", "flagPrefix": "24158ac75730c388"}}};

/* ---- engine v2: each bite = tier badge + LEARN half + DO half; +realenv +capstone ---- */
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}
function tierName(t){return {T0:'in-browser · WASM',T1:'real Linux · in-browser',T2:'real container · Codespaces',T3:'capstone · local'}[t]||t;}

function mountTour(mount){
  var id=mount.getAttribute('data-module');
  var m=MODULES.find(function(x){return x.id===id;});
  if(!m){mount.innerHTML="<p style='color:#ff5d6c'>Unknown tour module: "+id+"</p>";return;}
  var enr=(typeof ENRICH!=='undefined'&&ENRICH[id])||{};
  var nStd=m.steps.length, hasReal=!!enr.realenv, total=nStd+(hasReal?1:0)+1;
  var state={si:0,passed:{}};

  function bite(i){
    if(i<nStd) return {kind:'std',tier:(enr.tiers&&enr.tiers[i])||'T0',learn:(enr.learn&&enr.learn[i])||'',link:(enr.links&&enr.links[i])||null,title:m.steps[i].t,step:m.steps[i]};
    if(hasReal&&i===nStd){var r=enr.realenv;return {kind:'real',tier:'T2',learn:r.learn,link:r.link||null,title:r.t,step:r};}
    return {kind:'cap',tier:'T3',learn:m.capstone,link:null,title:'Capstone — own it'};
  }
  function pass(i){state.passed[i]=true;var d=mount.querySelectorAll('.pt-dot');if(d[i])d[i].classList.add('pass');}
  function verdict(card,ok,msg){var v=card.querySelector('.pt-verdict');if(!v){v=el('div','pt-verdict');card.appendChild(v);}v.className='pt-verdict show '+(ok?'ok':'no');v.innerHTML=(ok?'✓ ':'✗ ')+msg;}
  function out(card,text){var o=card.querySelector('.pt-out.dyn');if(!o){o=el('div','pt-out dyn');card.appendChild(o);}o.className='pt-out dyn show';o.textContent=text;}

  function interaction(card,doEl,step){
    var t=step.type;
    if(t==='note'){doEl.innerHTML=(step.html?'<div class="pt-prose">'+step.html+'</div>':'')+(step.render?step.render(m):'');state.passed[state.si]=true;return;}
    if(t==='mcq'){
      doEl.innerHTML='<div class="pt-prose">'+step.q+'</div>';var wrap=el('div');doEl.appendChild(wrap);
      step.options.forEach(function(o){var b=el('button','pt-opt',o.t);
        b.onclick=function(){wrap.querySelectorAll('.pt-opt').forEach(function(x){x.disabled=true;});b.classList.add(o.correct?'ok':'no');verdict(card,!!o.correct,(o.correct?'':'Not quite. ')+step.explain);if(o.correct)pass(state.si);else wrap.querySelectorAll('.pt-opt').forEach(function(x){if(x!==b)x.disabled=false;});};
        wrap.appendChild(b);});return;}
    if(t==='input'){
      doEl.innerHTML='<div class="pt-prose">'+step.prose+'</div>';var ti=el('input','pt-ti');ti.placeholder=step.placeholder||'';doEl.appendChild(ti);
      var row=el('div','pt-row');var go=el('button','pt-btn','check');row.appendChild(go);doEl.appendChild(row);
      var run=async function(){var r=await step.verify(ti.value);if(r.out)out(card,r.out);verdict(card,r.pass,r.msg);if(r.pass)pass(state.si);};
      go.onclick=run;ti.addEventListener('keydown',function(e){if(e.key==='Enter')run();});return;}
    if(t==='run'){
      doEl.innerHTML='<div class="pt-prose">'+(step.prose||'')+'</div><label class="pt-fld">editable — change it and re-run</label>';
      var ta=el('textarea','pt-ta');ta.value=step.code||'';doEl.appendChild(ta);
      var row2=el('div','pt-row');var b=el('button','pt-btn','▶ run');row2.appendChild(b);row2.appendChild(el('span','pt-pill',m.engine));doEl.appendChild(row2);
      b.onclick=async function(){var r=await step.run(ta.value,m);out(card,r.output||'');verdict(card,r.pass,r.msg);if(r.pass)pass(state.si);};return;}
    if(t==='terminal'){
      doEl.innerHTML='<div class="pt-prose">'+(step.prose||'')+'</div>';var term=el('div','pt-term','<span class="o">// type a command and press enter</span>');doEl.appendChild(term);
      var row3=el('div','pt-row');row3.appendChild(el('span','pt-pill','$'));var cmd=el('input','pt-ti');cmd.style.flex='1';cmd.placeholder='command';row3.appendChild(cmd);doEl.appendChild(row3);
      cmd.addEventListener('keydown',function(e){if(e.key!=='Enter')return;var c=cmd.value.trim();if(!c)return;var o=step.commands[c]!==undefined?step.commands[c]:'command not found: '+c;term.innerHTML+='\n<span class="p">$ '+c+'</span>\n<span class="o">'+o+'</span>';cmd.value='';term.scrollTop=term.scrollHeight;if(c===step.goal){verdict(card,true,step.goalMsg);pass(state.si);}});return;}
    if(t==='order'){
      var cur=step.items.slice().sort(function(){return Math.random()-0.5;});doEl.innerHTML='<div class="pt-prose">'+step.prose+'</div>';var o=el('div');doEl.appendChild(o);
      var row4=el('div','pt-row');var chk=el('button','pt-btn','check order');row4.appendChild(chk);doEl.appendChild(row4);
      function draw(){o.innerHTML='';cur.forEach(function(it,i){var bb=el('div','pt-opt','<b style="color:var(--pt-cy)">'+(i+1)+'.</b> '+it+' <span style="float:right"><button class="pt-btn pt-ghost pt-mini" data-u="'+i+'">↑</button> <button class="pt-btn pt-ghost pt-mini" data-d="'+i+'">↓</button></span>');o.appendChild(bb);});
        o.querySelectorAll('[data-u]').forEach(function(b){b.onclick=function(){var i=+b.dataset.u;if(i>0){var x=cur[i-1];cur[i-1]=cur[i];cur[i]=x;draw();}};});
        o.querySelectorAll('[data-d]').forEach(function(b){b.onclick=function(){var i=+b.dataset.d;if(i<cur.length-1){var x=cur[i+1];cur[i+1]=cur[i];cur[i]=x;draw();}};});}
      draw();chk.onclick=function(){var ok=cur.every(function(x,i){return x===step.correct[i];});verdict(card,ok,(ok?'':'Not yet. ')+step.explain);if(ok)pass(state.si);};return;}
  }

  function realenv(card,doEl,step){
    doEl.innerHTML='';
    var a=el('a','pt-launch');a.href=step.href;a.target='_blank';a.rel='noopener';a.textContent='▶ '+(step.launchLabel||'Launch in GitHub Codespaces');doEl.appendChild(a);
    doEl.appendChild(el('div','pt-fld',step.afterLaunch||'Then paste the flag your run prints:'));
    var ti=el('input','pt-ti');ti.placeholder=step.placeholder||'FLAG{...}';doEl.appendChild(ti);
    var row=el('div','pt-row');var go=el('button','pt-btn','verify flag');row.appendChild(go);doEl.appendChild(row);
    go.onclick=async function(){var h=await sha256hex(ti.value.trim());var ok=h.indexOf(step.flagPrefix)===0;verdict(card,ok,ok?step.okMsg:step.noMsg);if(ok)pass(state.si);};
  }

  function render(){
    mount.innerHTML='';
    mount.appendChild(el('div','pt-intro',
      'PROTOTYPE — a module as <b>interleaved bites</b>: each bite <b>teaches</b> one idea (with a scoped Learn link), then makes you <b>do</b> it and auto-checks. The badge shows <b>where each bite runs</b>.'+
      '<div class="pt-legend"><span class="pt-tier t0">T0 in-browser</span><span class="pt-tier t1">T1 real linux</span><span class="pt-tier t2">T2 real container</span><span class="pt-tier t3">T3 capstone</span></div>'));
    mount.appendChild(el('div','pt-crumbs',m.track+' / '+m.id));
    mount.appendChild(el('div','pt-h1',m.title));
    var meta=el('div','pt-meta');
    meta.appendChild(el('span','pt-chip','bite <b>'+(state.si+1)+'</b> / '+total));
    meta.appendChild(el('span','pt-chip','engine: <b>'+m.engine+'</b>'));
    mount.appendChild(meta);
    var dots=el('div','pt-dots');for(var i=0;i<total;i++){dots.appendChild(el('span','pt-dot'+(i===state.si?' on':'')+(state.passed[i]?' pass':'')));}mount.appendChild(dots);
    var b=bite(state.si);
    var card=el('div','pt-card');mount.appendChild(card);
    card.appendChild(el('span','pt-tier '+b.tier.toLowerCase(),b.tier+' · '+tierName(b.tier)));
    card.appendChild(el('div','pt-step-t',b.title));
    if(b.learn){var lh='<span class="pt-llabel">learn</span> '+b.learn;if(b.link)lh+='<div class="pt-linkrow">↗ Go deeper: <a href="'+b.link.href+'" target="_blank" rel="noopener">'+b.link.label+'</a></div>';card.appendChild(el('div','pt-learn',lh));}
    var doEl=el('div','pt-do');card.appendChild(doEl);
    if(b.kind==='std')interaction(card,doEl,b.step);
    else if(b.kind==='real')realenv(card,doEl,b.step);
    else{doEl.innerHTML='<div class="pt-prose">The <b>integrative</b> bite: the real environment, run locally (<code>git clone</code> + <code>make up</code>), where the module’s ideas combine into a portfolio artifact you own.</div>';state.passed[state.si]=true;}
    var nav=el('div','pt-nav');
    var prev=el('button','pt-btn pt-ghost','← prev');if(state.si===0){prev.disabled=true;prev.style.opacity=0.4;}prev.onclick=function(){if(state.si>0){state.si--;render();}};
    var next=el('button','pt-btn pt-cy',state.si===total-1?'finish ✓':'next bite →');next.onclick=function(){if(state.si<total-1){state.si++;render();}};
    nav.appendChild(prev);nav.appendChild(next);mount.appendChild(nav);
  }
  render();
}
window.PT={MODULES:MODULES,mountTour:mountTour};
function ptInit(){document.querySelectorAll('#pt-tour[data-module]').forEach(mountTour);}
if(document.readyState!=='loading')ptInit();else document.addEventListener('DOMContentLoaded',ptInit);
})();
