#!/usr/bin/env node
// Turns cookie rows copied from Chrome Dev Tools (Application > Cookies) into the cookies.txt file
// (Netscape format) that yt-dlp needs for #music / #video.
//
// 1) In Dev Tools open Application > Cookies > https://www.youtube.com
// 2) Copy the rows (click a row, Ctrl+C) and paste them, one per line, into  devtools-cookies.txt
//    (project root). Each row looks like:
//    __Secure-1PSID <TAB> g.a000... <TAB> .youtube.com <TAB> / <TAB> 2027-10-20T19:05:25.382Z <TAB> 167 <TAB> ✓ <TAB> ✓ ...
// 3) Run:  node tools/devtools-to-cookies.js      -> writes cookies.txt
// devtools-cookies.txt is in .gitignore; cookies.txt is what you commit (private repo).
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const IN = path.join(ROOT, process.argv[2] || "devtools-cookies.txt");
const OUT = path.join(ROOT, "cookies.txt");

if (!fs.existsSync(IN)) {
    console.error(`❌ ${path.basename(IN)} not found. Paste the Dev Tools cookie rows into it first.`);
    process.exit(1);
}

const lines = fs.readFileSync(IN, "utf8").split(/\r?\n/).map(l => l.trim()).filter(Boolean);
const out = ["# Netscape HTTP Cookie File", "# Made by tools/devtools-to-cookies.js from Chrome Dev Tools rows", ""];
let ok = 0, skipped = [];
for (const line of lines) {
    const c = line.split("\t");
    if (c.length < 5) { skipped.push(line.slice(0, 30)); continue; }
    const [name, value, domainRaw, cookiePath, expiresRaw] = c;
    let domain = (domainRaw || "").trim();
    if (!name || !domain) { skipped.push(line.slice(0, 30)); continue; }
    if (!/youtube\.com$/i.test(domain.replace(/^\./, "")) && !/(^|\.)google\.com$/i.test(domain.replace(/^\./, ""))) { skipped.push(`${name} (${domain})`); continue; }
    const includeSub = domain.startsWith(".") ? "TRUE" : "FALSE";
    const secure = name.startsWith("__Secure-") || name.startsWith("__Host-") || /✓/.test(c.slice(7).join(" ")) ? "TRUE" : "FALSE";
    const t = Date.parse(expiresRaw);
    const expires = isNaN(t) ? 0 : Math.floor(t / 1000); // "Session" -> 0
    out.push([domain, includeSub, (cookiePath || "/").trim() || "/", secure, expires, name.trim(), (value || "").trim()].join("\t"));
    ok++;
}
fs.writeFileSync(OUT, out.join("\n") + "\n");
console.log(`✅ cookies.txt written with ${ok} cookies.`);
if (skipped.length) console.log(`ℹ️ Skipped ${skipped.length} line(s) (not youtube.com / google.com, or not a cookie row): ${skipped.join(", ")}`);
if (!lines.some(l => /\.?youtube\.com/i.test(l))) console.log("⚠️ No youtube.com cookies found. In Dev Tools choose Cookies > https://www.youtube.com and copy those rows.");
