// Safety layer: makes the bot behave more like a human to lower the risk of Facebook flagging the account.
//  - every outgoing message waits in one queue and is sent with a small random "typing" delay
//  - a minimum gap between two messages in the same chat
//  - a limit on how many messages the whole bot sends per minute
//  - flood guard: one user can't fire many commands in a short time (bot admins are exempt)
// Settings: config.json -> "safety": { ... } (see DEFAULTS). Set "enable": false to turn it all off.
const DEFAULTS = {
    enable: true,
    typingIndicator: true,      // show "typing..." before a message
    minDelayMs: 700,            // random delay before each message: between min and max
    maxDelayMs: 1800,
    perChatGapMs: 1500,         // at least this long between two messages in the same chat
    maxMessagesPerMinute: 25,   // for the whole bot
    commandFloodLimit: 6,       // commands per user ...
    commandFloodWindowSec: 30,  // ... within this many seconds
    commandFloodMuteSec: 60     // then ignore that user's commands for this long
};

const settings = () => Object.assign({}, DEFAULTS, (global.config && global.config.safety) || {});
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// ---------------- outgoing message queue ----------------
function wrapApi(api) {
    if (!api || api.__safetyWrapped) return api;
    api.__safetyWrapped = true;
    const originalSend = api.sendMessage.bind(api);
    const queue = [];
    const sentAt = [];               // timestamps of sent messages (last minute)
    const lastInChat = new Map();    // threadID -> timestamp of last message
    let running = false;

    async function pump() {
        if (running) return;
        running = true;
        while (queue.length) {
            const job = queue.shift();
            const s = settings();
            try {
                const threadID = String(job.args[1]);
                // whole-bot limit per minute
                for (;;) {
                    const now = Date.now();
                    while (sentAt.length && now - sentAt[0] > 60000) sentAt.shift();
                    if (sentAt.length < s.maxMessagesPerMinute) break;
                    await sleep(60000 - (now - sentAt[0]) + 50);
                }
                // gap inside the same chat
                const since = Date.now() - (lastInChat.get(threadID) || 0);
                if (since < s.perChatGapMs) await sleep(s.perChatGapMs - since);
                // human-like typing delay (a bit longer for longer texts)
                const body = typeof job.args[0] === "string" ? job.args[0] : (job.args[0] && job.args[0].body) || "";
                const delay = s.minDelayMs + Math.random() * Math.max(0, s.maxDelayMs - s.minDelayMs) + Math.min(String(body).length * 10, 1200);
                if (s.typingIndicator && typeof api.sendTypingIndicator === "function") {
                    try { api.sendTypingIndicator(threadID, () => {}); } catch (e) { /* not important */ }
                }
                await sleep(delay);
                lastInChat.set(threadID, Date.now());
                sentAt.push(Date.now());
                job.resolve(originalSend(...job.args));
            } catch (e) {
                job.reject(e);
            }
        }
        running = false;
    }

    api.sendMessage = function (...args) {
        if (!settings().enable) return originalSend(...args);
        return new Promise((resolve, reject) => {
            queue.push({ args, resolve, reject });
            pump();
        });
    };
    return api;
}

// ---------------- command flood guard ----------------
const commandLog = new Map();   // userID -> [timestamps]
const mutedUntil = new Map();   // userID -> timestamp
// returns "ok", "warn" (just got muted: tell them once) or "muted"
function checkCommandFlood(userID) {
    const s = settings();
    if (!s.enable) return "ok";
    userID = String(userID);
    const now = Date.now();
    if ((mutedUntil.get(userID) || 0) > now) return "muted";
    const list = (commandLog.get(userID) || []).filter(t => now - t < s.commandFloodWindowSec * 1000);
    list.push(now);
    commandLog.set(userID, list);
    if (list.length > s.commandFloodLimit) {
        mutedUntil.set(userID, now + s.commandFloodMuteSec * 1000);
        commandLog.set(userID, []);
        return "warn";
    }
    return "ok";
}

module.exports = { wrapApi, checkCommandFlood, DEFAULTS };
