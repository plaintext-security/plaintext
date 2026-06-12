/* Plaintext interactive-tour engine (PROTOTYPE). Auto-generated from the POC.
   Mounts one module tour into each #pt-tour[data-module]. All logic runs client-side. */
(function(){
'use strict';

/* ---------- tiny real helpers (run client-side, no deps) ---------- */
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
];

/* ---- engine: mount one module's tour into each #pt-tour[data-module] ---- */
function el(tag,cls,html){var e=document.createElement(tag);if(cls)e.className=cls;if(html!=null)e.innerHTML=html;return e;}

function mountTour(mount){
  var id=mount.getAttribute('data-module');
  var m=MODULES.find(function(x){return x.id===id;});
  if(!m){mount.innerHTML="<p style='color:#ff5d6c'>Unknown tour module: "+id+"</p>";return;}
  var state={si:0,passed:{}};

  function passStep(i){state.passed[i]=true;var d=mount.querySelectorAll('.pt-dot');if(d[i])d[i].classList.add('pass');}
  function verdict(card,ok,msg){var v=card.querySelector('.pt-verdict');if(!v){v=el('div','pt-verdict');card.appendChild(v);}v.className='pt-verdict show '+(ok?'ok':'no');v.innerHTML=(ok?'✓ ':'✗ ')+msg;}
  function out(card,text){var o=card.querySelector('.pt-out.dyn');if(!o){o=el('div','pt-out dyn');card.appendChild(o);}o.className='pt-out dyn show';o.textContent=text;}

  function renderStep(card,step){
    var head='<div class="pt-step-t">'+(step.t||'step')+'</div>';
    if(step.type==='note'){card.innerHTML=head+'<div class="pt-prose">'+(step.html||'')+'</div>'+(step.render?step.render(m):'');state.passed[state.si]=true;return;}
    if(step.type==='mcq'){
      card.innerHTML=head+'<div class="pt-prose">'+step.q+'</div>';
      var wrap=el('div');card.appendChild(wrap);
      step.options.forEach(function(o){var b=el('button','pt-opt',o.t);
        b.onclick=function(){wrap.querySelectorAll('.pt-opt').forEach(function(x){x.disabled=true;});b.classList.add(o.correct?'ok':'no');
          verdict(card,!!o.correct,(o.correct?'':'Not quite. ')+step.explain);
          if(o.correct)passStep(state.si);else wrap.querySelectorAll('.pt-opt').forEach(function(x){if(x!==b)x.disabled=false;});};
        wrap.appendChild(b);});
      return;}
    if(step.type==='input'){
      card.innerHTML=head+'<div class="pt-prose">'+step.prose+'</div>';
      var ti=el('input','pt-ti');ti.placeholder=step.placeholder||'';card.appendChild(ti);
      var row=el('div','pt-row');var go=el('button','pt-btn','check');row.appendChild(go);card.appendChild(row);
      var run=async function(){var r=await step.verify(ti.value);if(r.out)out(card,r.out);verdict(card,r.pass,r.msg);if(r.pass)passStep(state.si);};
      go.onclick=run;ti.addEventListener('keydown',function(e){if(e.key==='Enter')run();});
      return;}
    if(step.type==='run'){
      card.innerHTML=head+'<div class="pt-prose">'+(step.prose||'')+'</div><label class="pt-fld">editable — change it and re-run</label>';
      var ta=el('textarea','pt-ta');ta.value=step.code||'';card.appendChild(ta);
      var row2=el('div','pt-row');var b=el('button','pt-btn','▶ run');row2.appendChild(b);row2.appendChild(el('span','pt-pill',m.engine));card.appendChild(row2);
      b.onclick=async function(){var r=await step.run(ta.value,m);out(card,r.output||'');verdict(card,r.pass,r.msg);if(r.pass)passStep(state.si);};
      return;}
    if(step.type==='terminal'){
      card.innerHTML=head+'<div class="pt-prose">'+(step.prose||'')+'</div>';
      var term=el('div','pt-term','<span class="o">// type a command and press enter</span>');card.appendChild(term);
      var row3=el('div','pt-row');row3.appendChild(el('span','pt-pill','$'));var cmd=el('input','pt-ti');cmd.style.flex='1';cmd.placeholder='command';row3.appendChild(cmd);card.appendChild(row3);
      cmd.addEventListener('keydown',function(e){if(e.key!=='Enter')return;var c=cmd.value.trim();if(!c)return;
        var o=step.commands[c]!==undefined?step.commands[c]:'command not found: '+c;
        term.innerHTML+='\n<span class="p">$ '+c+'</span>\n<span class="o">'+o+'</span>';cmd.value='';term.scrollTop=term.scrollHeight;
        if(c===step.goal){verdict(card,true,step.goalMsg);passStep(state.si);}});
      return;}
    if(step.type==='order'){
      var cur=step.items.slice().sort(function(){return Math.random()-0.5;});
      card.innerHTML=head+'<div class="pt-prose">'+step.prose+'</div>';
      var o=el('div');card.appendChild(o);
      var row4=el('div','pt-row');var chk=el('button','pt-btn','check order');row4.appendChild(chk);card.appendChild(row4);
      function draw(){o.innerHTML='';cur.forEach(function(it,i){var b=el('div','pt-opt','<b style="color:var(--pt-cy)">'+(i+1)+'.</b> '+it+' <span style="float:right"><button class="pt-btn pt-ghost pt-mini" data-u="'+i+'">↑</button> <button class="pt-btn pt-ghost pt-mini" data-d="'+i+'">↓</button></span>');o.appendChild(b);});
        o.querySelectorAll('[data-u]').forEach(function(b){b.onclick=function(){var i=+b.dataset.u;if(i>0){var t=cur[i-1];cur[i-1]=cur[i];cur[i]=t;draw();}};});
        o.querySelectorAll('[data-d]').forEach(function(b){b.onclick=function(){var i=+b.dataset.d;if(i<cur.length-1){var t=cur[i+1];cur[i+1]=cur[i];cur[i]=t;draw();}};});}
      draw();
      chk.onclick=function(){var ok=cur.every(function(x,i){return x===step.correct[i];});verdict(card,ok,(ok?'':'Not yet. ')+step.explain);if(ok)passStep(state.si);};
      return;}
  }

  function render(){
    mount.innerHTML='';
    mount.appendChild(el('div','pt-intro','This is a <b>proof-of-concept</b> of a proposed format: the module cut into a few inline <b>bites</b>, each one idea you immediately <b>do</b> and that auto-checks — freeCodeCamp-style gating × Tour-of-Go runnable cells. Real engines run in your browser; heavier targets are simulated, with the live version noted as the module’s capstone.'));
    mount.appendChild(el('div','pt-crumbs',m.track+' / '+m.id));
    mount.appendChild(el('div','pt-h1',m.title));
    var meta=el('div','pt-meta');
    meta.appendChild(el('span','pt-chip','engine: <b>'+m.engine+'</b>'));
    meta.appendChild(el('span','pt-chip','step <b>'+(state.si+1)+'</b> / '+m.steps.length));
    meta.appendChild(el('span','pt-chip',m.substrate==='real'?'<b style="color:var(--pt-grn)">real execution</b>':'<b style="color:var(--pt-amber)">simulated target</b>'));
    mount.appendChild(meta);
    var dots=el('div','pt-dots');
    m.steps.forEach(function(_,i){dots.appendChild(el('span','pt-dot'+(i===state.si?' on':'')+(state.passed[i]?' pass':'')));});
    mount.appendChild(dots);
    var card=el('div','pt-card');mount.appendChild(card);
    renderStep(card,m.steps[state.si]);
    var nav=el('div','pt-nav');
    var prev=el('button','pt-btn pt-ghost','← prev');if(state.si===0){prev.disabled=true;prev.style.opacity=0.4;}
    prev.onclick=function(){if(state.si>0){state.si--;render();}};
    var next=el('button','pt-btn pt-cy',state.si===m.steps.length-1?'finish ✓':'next step →');
    next.onclick=function(){if(state.si<m.steps.length-1){state.si++;render();}};
    nav.appendChild(prev);nav.appendChild(next);mount.appendChild(nav);
    mount.appendChild(el('div','pt-cap','<b>Capstone (the container/cloud part):</b> '+m.capstone));
  }
  render();
}
function ptInit(){var ms=document.querySelectorAll('#pt-tour');ms.forEach(mountTour);}
if(document.readyState!=='loading')ptInit();else document.addEventListener('DOMContentLoaded',ptInit);

})();
