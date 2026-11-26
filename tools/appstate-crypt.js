#!/usr/bin/env node
// Keeps the Facebook cookies (appstate.json) encrypted in the repo.
//
//   appstate.json  = real cookies, ONLY on your PC (in .gitignore, never committed)
//   appstate.enc   = AES-256-GCM encrypted copy, safe to commit to the public repo
//   .appstate.key  = the secret key, ONLY on your PC (in .gitignore). Put the same value
//                    in the GitHub secret APPSTATE_KEY so GitHub Actions can decrypt.
//
// Usage:
//   node tools/appstate-crypt.js encrypt   appstate.json -> appstate.enc
//   node tools/appstate-crypt.js decrypt   appstate.enc  -> appstate.json   (used by GitHub Actions)
//   node tools/appstate-crypt.js watch     re-encrypt automatically every time appstate.json is saved
//
// The key is read from the APPSTATE_KEY environment variable, or from .appstate.key.
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const ROOT = path.join(__dirname, "..");
const PLAIN = path.join(ROOT, "appstate.json");
const ENC = path.join(ROOT, "appstate.enc");
const KEYFILE = path.join(ROOT, ".appstate.key");

function getKey(createIfMissing) {
    let k = (process.env.APPSTATE_KEY || "").trim();
    if (!k && fs.existsSync(KEYFILE)) k = fs.readFileSync(KEYFILE, "utf8").trim();
    if (!k && createIfMissing) {
        k = crypto.randomBytes(32).toString("base64");
        fs.writeFileSync(KEYFILE, k + "\n", { mode: 0o600 });
        console.log("🔑 New key created in .appstate.key");
        console.log("   Copy its content into the GitHub secret APPSTATE_KEY (Settings > Secrets and variables > Actions).");
    }
    if (!k) throw new Error("No key found. Set APPSTATE_KEY or create .appstate.key (run: node tools/appstate-crypt.js encrypt)");
    const key = Buffer.from(k, "base64");
    if (key.length !== 32) throw new Error("APPSTATE_KEY is not valid (must be the 44-character value from .appstate.key)");
    return key;
}

function decryptText(key) {
    const box = JSON.parse(fs.readFileSync(ENC, "utf8"));
    const decipher = crypto.createDecipheriv("aes-256-gcm", key, Buffer.from(box.iv, "base64"));
    decipher.setAuthTag(Buffer.from(box.tag, "base64"));
    return Buffer.concat([decipher.update(Buffer.from(box.data, "base64")), decipher.final()]).toString("utf8");
}

// Returns true if appstate.enc was (re)written, false if it was already up to date.
function encrypt() {
    if (!fs.existsSync(PLAIN)) throw new Error("appstate.json not found");
    const text = fs.readFileSync(PLAIN, "utf8");
    JSON.parse(text); // refuse to encrypt a half-saved / broken file
    const key = getKey(true);
    if (fs.existsSync(ENC)) {
        try { if (decryptText(key) === text) return false; } catch (e) { /* different key or old file: re-encrypt */ }
    }
    const iv = crypto.randomBytes(12);
    const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
    const data = Buffer.concat([cipher.update(text, "utf8"), cipher.final()]);
    const box = { v: 1, alg: "aes-256-gcm", iv: iv.toString("base64"), tag: cipher.getAuthTag().toString("base64"), data: data.toString("base64") };
    fs.writeFileSync(ENC, JSON.stringify(box, null, 2) + "\n");
    return true;
}

function decrypt() {
    if (!fs.existsSync(ENC)) throw new Error("appstate.enc not found");
    let text;
    try { text = decryptText(getKey(false)); }
    catch (e) { throw new Error("Could not decrypt appstate.enc - wrong APPSTATE_KEY? (" + e.message + ")"); }
    JSON.parse(text);
    fs.writeFileSync(PLAIN, text);
}

function watch() {
    console.log("👀 Watching appstate.json - it will be encrypted to appstate.enc every time you save it.");
    let timer = null;
    const run = () => {
        try {
            if (!fs.existsSync(PLAIN)) return;
            const changed = encrypt();
            if (changed) console.log(`🔒 ${new Date().toLocaleTimeString()} appstate.enc updated (encrypted). Commit appstate.enc, never appstate.json.`);
        } catch (e) {
            if (e instanceof SyntaxError) console.log("⏳ appstate.json is not valid JSON yet - will encrypt when it is.");
            else console.log("❌ " + e.message);
        }
    };
    run();
    // watch the folder (editors often replace the file on save, which breaks a direct file watch)
    fs.watch(ROOT, (event, filename) => {
        if (filename !== "appstate.json") return;
        clearTimeout(timer);
        timer = setTimeout(run, 400);
    });
}

const cmd = process.argv[2];
try {
    if (cmd === "encrypt") console.log(encrypt() ? "🔒 appstate.enc updated" : "✅ appstate.enc already up to date");
    else if (cmd === "decrypt") { decrypt(); console.log("🔓 appstate.json created from appstate.enc"); }
    else if (cmd === "watch") watch();
    else { console.log("Usage: node tools/appstate-crypt.js encrypt|decrypt|watch"); process.exit(1); }
} catch (e) {
    console.error("❌ " + e.message);
    process.exit(1);
}
