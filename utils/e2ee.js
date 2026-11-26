// Messenger end-to-end encrypted (🔒) chats.
// Messenger now encrypts personal chats by default, and the normal library (shayan-fca) can't read them,
// so the bot never saw inbox messages. FME (fme/, fb-messenger-e2ee, AGPL-3.0) connects as an extra
// encrypted "device" of the bot account, using the bot's OWN login (no second login).
// - incoming encrypted inbox messages are turned into normal bot events (commands, inbox AI chat work)
// - replies to those chats go back through the encrypted connection (text, photos, videos, audio, files)
// Groups keep using the normal library.
// Turn on/off: config.json -> "e2ee": true / false
//
// The device identity (fme keys) must survive restarts, otherwise a new device is registered every time.
// It is kept in Shayan/commands/data/e2ee-device.json (never committed) and, on GitHub, saved encrypted
// with the E2EE_KEY secret as e2ee-device.enc (safe to keep in a public repo).
const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const DIR = path.join(__dirname, "..", "Shayan", "commands", "data");
const DEVICE = path.join(DIR, "e2ee-device.json");
const DEVICE_ENC = path.join(DIR, "e2ee-device.enc");

const log = (m) => console.log(`[ E2EE ] ${m}`);
const errText = (e) => (e && (e.message || e.error || (typeof e == "string" ? e : JSON.stringify(e)))) || "unknown error";
const enabled = () => !!(global.config && global.config.e2ee === true);

let client = null;
let connected = false;
let botID = "";
const e2eeChats = new Set();          // user IDs whose inbox chat is encrypted (they wrote to us over E2EE)
const messages = new Map();           // E2EE message ID -> { threadId, senderJid } (for replies/reactions)
function remember(id, info) {
    messages.set(String(id), info);
    if (messages.size > 3000) messages.delete(messages.keys().next().value);
}

// ---------- device file: keep it across restarts (encrypted with E2EE_KEY) ----------
function key() {
    const k = process.env.E2EE_KEY || "";
    return k ? crypto.createHash("sha256").update(k).digest() : null;
}
function encrypt(buf) {
    const iv = crypto.randomBytes(12);
    const c = crypto.createCipheriv("aes-256-gcm", key(), iv);
    const data = Buffer.concat([c.update(buf), c.final()]);
    return JSON.stringify({ v: 1, iv: iv.toString("base64"), tag: c.getAuthTag().toString("base64"), data: data.toString("base64") });
}
function decrypt(text) {
    const j = JSON.parse(text);
    const d = crypto.createDecipheriv("aes-256-gcm", key(), Buffer.from(j.iv, "base64"));
    d.setAuthTag(Buffer.from(j.tag, "base64"));
    return Buffer.concat([d.update(Buffer.from(j.data, "base64")), d.final()]);
}
function restoreDevice() {
    if (fs.existsSync(DEVICE) || !fs.existsSync(DEVICE_ENC) || !key()) return;
    try { fs.writeFileSync(DEVICE, decrypt(fs.readFileSync(DEVICE_ENC, "utf8")), { mode: 0o600 }); log("Device restored from e2ee-device.enc"); }
    catch (e) { log(`Could not restore the device (wrong E2EE_KEY?): ${errText(e)}`); }
}
function saveDevice() {
    if (!key() || !fs.existsSync(DEVICE)) return;
    try {
        fs.writeFileSync(DEVICE_ENC, encrypt(fs.readFileSync(DEVICE)));
        require("./gitsave.js").save([DEVICE_ENC], "Update E2EE device", 5 * 60 * 1000);
    } catch (e) { log(`Could not save the device: ${errText(e)}`); }
}

// ---------- outgoing: send to encrypted chats through FME ----------
const KIND = (file) => {
    const ext = path.extname(String(file || "")).toLowerCase();
    if ([".jpg", ".jpeg", ".png", ".gif", ".webp"].includes(ext)) return "image";
    if ([".mp4", ".mov", ".mkv", ".webm"].includes(ext)) return "video";
    if ([".mp3", ".m4a", ".ogg", ".wav", ".aac", ".opus"].includes(ext)) return "audio";
    return "file";
};
const MIME = { ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".png": "image/png", ".gif": "image/gif", ".webp": "image/webp", ".mp4": "video/mp4", ".mov": "video/quicktime", ".webm": "video/webm", ".mp3": "audio/mpeg", ".m4a": "audio/mp4", ".ogg": "audio/ogg", ".wav": "audio/wav", ".aac": "audio/aac", ".pdf": "application/pdf" };

async function readStream(s) {
    if (Buffer.isBuffer(s)) return { data: s, name: "file.bin" };
    if (s && s.path && fs.existsSync(s.path)) { try { s.destroy && s.destroy(); } catch (e) { } return { data: fs.readFileSync(s.path), name: path.basename(String(s.path)) }; }
    const chunks = [];
    for await (const c of s) chunks.push(Buffer.from(c));
    return { data: Buffer.concat(chunks), name: path.basename(String((s && s.path) || "file.bin")) };
}

async function sendE2EE(msg, threadId, replyTo) {
    const body = typeof msg === "string" ? msg : (msg && (msg.body || msg.emoji)) || "";
    const atts = msg && typeof msg === "object" && msg.attachment ? [].concat(msg.attachment).filter(Boolean) : [];
    const reply = replyTo && messages.get(String(replyTo));
    const replyOpts = reply ? { replyToMessageId: String(replyTo), replyToSenderJid: reply.senderJid } : {};
    let last = null;
    for (let i = 0; i < atts.length; i++) {
        const { data, name } = await readStream(atts[i]);
        const kind = KIND(name);
        const input = { threadId, data, fileName: name, mimeType: MIME[path.extname(name).toLowerCase()], caption: i == 0 && body ? body : undefined, ...(i == 0 ? replyOpts : {}) };
        last = await (kind == "image" ? client.sendImage(input) : kind == "video" ? client.sendVideo(input) : kind == "audio" ? client.sendAudio(input) : client.sendFile(input));
        // audio/video/file have no caption in Messenger: send the text separately
        if (i == 0 && body && kind != "image") last = await client.sendMessage({ threadId, text: body });
    }
    if (!atts.length && body) last = await client.sendMessage({ threadId, text: String(body), ...replyOpts });
    const id = last && (last.messageId || last.messageID);
    if (id) remember(id, { threadId, senderJid: `${botID}.0@msgr`, fromBot: true });
    return { threadID: threadId, messageID: id, timestamp: (last && last.timestampMs) || Date.now() };
}

// Call BEFORE utils/safety.js wraps the api, so the human-like send queue still applies.
function wrapApi(api) {
    if (!api || api.__e2eeWrapped) return api;
    api.__e2eeWrapped = true;
    const origSend = api.sendMessage.bind(api);
    api.sendMessage = function (msg, threadID, cb, reply, isGroup) {
        const tid = String(threadID);
        if (!connected || !client || !e2eeChats.has(tid)) return origSend(msg, threadID, cb, reply, isGroup);
        if (typeof cb === "string" && !reply) { reply = cb; cb = undefined; }
        const p = sendE2EE(msg, tid, reply).catch((e) => {
            log(`Encrypted send to ${tid} failed (${errText(e)}), sending the normal way`);
            return new Promise((res, rej) => origSend(msg, threadID, (err, info) => err ? rej(err) : res(info), reply, isGroup));
        });
        if (typeof cb === "function") { p.then(d => cb(null, d), e => cb(e)); return p.catch(() => undefined); }
        return p;
    };
    const origReact = api.setMessageReaction && api.setMessageReaction.bind(api);
    if (origReact) api.setMessageReaction = function (reaction, messageID, cb, force) {
        const m = messages.get(String(messageID));
        if (!connected || !client || !m || m.fromBot) return origReact(reaction, messageID, cb, force);
        const p = client.sendReaction({ messageId: String(messageID), reaction, threadId: m.threadId, targetSenderJid: m.senderJid });
        p.then(() => typeof cb == "function" && cb(null), (e) => typeof cb == "function" && cb(e));
        return p.catch(() => undefined);
    };
    const origTyping = api.sendTypingIndicator && api.sendTypingIndicator.bind(api);
    if (origTyping) api.sendTypingIndicator = function (threadID, cb) {
        const tid = String(threadID);
        if (!connected || !client || !e2eeChats.has(tid)) return origTyping(threadID, cb);
        client.sendTyping({ threadId: tid, isTyping: true }).catch(() => { });
        if (typeof cb == "function") cb(null);
        return () => client && client.sendTyping({ threadId: tid, isTyping: false }).catch(() => { });
    };
    return api;
}

// ---------- incoming: encrypted inbox messages -> normal bot events ----------
function toBotEvent(d) {
    const event = {
        type: d.replyTo ? "message_reply" : "message",
        threadID: String(d.threadId),
        senderID: String(d.senderId),
        messageID: String(d.id),
        body: d.text || "",
        isGroup: false,
        mentions: {},
        attachments: [],
        timestamp: d.timestampMs || Date.now(),
        isE2EE: true
    };
    if (d.replyTo) event.messageReply = { messageID: String(d.replyTo.messageId), senderID: String(d.replyTo.senderId || ""), body: d.replyTo.text || "", attachments: [], mentions: {} };
    return event;
}

function handleEvent(ev, dispatch) {
    if (!ev || !ev.type) return;
    if (ev.type === "e2ee_connected") { connected = true; return log("Connected: encrypted inbox chats are on"); }
    if (ev.type === "disconnected") { if (connected) log("Disconnected"); connected = false; return scheduleReconnect(); }
    if (ev.type === "error") return log(`Error: ${ev.data && ev.data.message}`);
    if (ev.type !== "e2ee_message") return;
    const d = ev.data || {};
    if (d.isGroup || !d.id || !d.threadId) return;                 // groups: the normal library handles them
    if (String(d.senderId) === botID) return;                      // our own messages
    if (!["text", "image", "video", "audio", "document", "sticker"].includes(d.kind)) return;
    e2eeChats.add(String(d.threadId));
    remember(d.id, { threadId: String(d.threadId), senderJid: d.senderJid });
    if (!d.text) return;                                           // media without text: nothing for commands to read
    try { dispatch(toBotEvent(d)); } catch (e) { log(`Could not handle a message: ${errText(e)}`); }
}

let reconnectTimer = null, reconnectDelay = 60 * 1000;
function scheduleReconnect() {
    if (reconnectTimer || !client) return;
    reconnectTimer = setTimeout(async () => {
        reconnectTimer = null;
        try { await client.connectE2EE(DEVICE, botID); connected = true; reconnectDelay = 60 * 1000; log("Reconnected"); }
        catch (e) { log(`Reconnect failed: ${errText(e)}`); reconnectDelay = Math.min(reconnectDelay * 2, 30 * 60 * 1000); scheduleReconnect(); }
    }, reconnectDelay);
}

async function start(api, dispatch) {
    if (!enabled()) return log('Off (config.json "e2ee": false)');
    if (process.env.GITHUB_ACTIONS === "true" && !key()) return log("Off: add the E2EE_KEY secret first (otherwise a new device would be registered on every restart)");
    try {
        fs.mkdirSync(DIR, { recursive: true });
        restoreDevice();
        const { FBClient } = require("../fme/dist/index.cjs");
        client = new FBClient({ platform: "messenger" });
        client.controller.api = api;                               // reuse the bot's own login (no second login)
        botID = String(api.getCurrentUserID());
        client.onEvent((ev) => handleEvent(ev, dispatch));
        await client.connectE2EE(DEVICE, botID);
        connected = true;
        log("Started");
        saveDevice();
        fs.watchFile(DEVICE, { interval: 60 * 1000 }, saveDevice); // keys change over time: keep the saved copy fresh
    } catch (e) {
        log(`Could not start: ${errText(e)}`);
        scheduleReconnect();
    }
}

module.exports = { wrapApi, start, _test: { handleEvent, toBotEvent, encrypt, decrypt, e2eeChats, messages, setClient: (c, id) => { client = c; botID = id; connected = !!c; } } };
