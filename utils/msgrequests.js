// Facebook puts chats from people who are NOT the bot's friends into "Message requests"
// (also groups that such people add the bot to). The bot does not receive those messages live,
// so it can't reply in the inbox and never hears that it was added to the group.
// Every few minutes this accepts those requests:
// - inbox chats: accepted (the next messages reach the bot), and the person gets a short hello
// - groups: accepted, put on the approval waiting list, and the bot admins are told (like joinNoti)
// Turn off: config.json -> "autoAcceptRequests": false
const approval = require("./approval.js");

const FIRST_CHECK_MS = 60 * 1000;      // 1 minute after login
const EVERY_MS = 10 * 60 * 1000;       // then every 10 minutes
const handled = new Set();             // don't handle the same chat twice in one run

const log = (msg) => console.log(`[ REQUESTS ] ${msg}`);
const errText = (e) => (e && (e.message || e.error || (typeof e == "string" ? e : JSON.stringify(e)))) || "unknown error";

async function notifyAdmins(api, thread) {
    const prefix = global.config.PREFIX;
    api.sendMessage(`👋 Thanks for adding ${global.config.BOTNAME || "the bot"}!\n⏳ This group is waiting for approval from the bot admin.\nCommands will start working once it is approved.`, thread.threadID);
    let addedBy = "";
    if (thread.snippetSender) {
        try { const u = await api.getUserInfo(thread.snippetSender); if (u && u[thread.snippetSender]) addedBy = `\n👤 Last message from: ${u[thread.snippetSender].name} (${thread.snippetSender})`; } catch (e) { }
    }
    for (const adminID of global.config.ADMINBOT || []) {
        api.sendMessage(`🔔 The bot was added to a new group (it was in Message requests)\n📛 ${thread.name || "Unnamed group"}\n🆔 ${thread.threadID}${addedBy}\n\n✅ Approve: ${prefix}approve ${thread.threadID}\n❌ Remove: ${prefix}approve del ${thread.threadID}\n📋 All waiting groups: ${prefix}approve pending`, adminID);
    }
}

async function checkOnce(api) {
    let threads = [];
    for (const tag of ["PENDING", "OTHER"]) {
        try { threads = threads.concat((await api.getThreadList(30, null, [tag])) || []); }
        catch (e) { log(`Could not read ${tag} requests: ${errText(e)}`); }
    }
    const fresh = [];
    for (const t of threads) {
        const id = t && t.threadID && String(t.threadID);
        if (!id || handled.has(id) || fresh.some(f => String(f.threadID) == id)) continue;
        fresh.push(t);
    }
    if (!fresh.length) return;

    try { await api.handleMessageRequest(fresh.map(t => String(t.threadID)), true); }
    catch (e) { return log(`Could not accept ${fresh.length} request(s): ${errText(e)}`); }

    for (const t of fresh) {
        handled.add(String(t.threadID));
        if (t.isGroup) {
            log(`Accepted group ${t.threadID} (${t.name || "no name"})`);
            if (approval.enabled() && !approval.isApproved(t.threadID)) {
                approval.addPending(t.threadID);
                await notifyAdmins(api, t);
            }
        } else {
            log(`Accepted inbox chat ${t.threadID}`);
            if (global.config.allowInbox !== false)
                api.sendMessage(`👋 Hi! Sorry for the late reply, I'm here now.\nSend your message again, or type ${global.config.PREFIX}guide to see what I can do.`, t.threadID);
        }
    }
}

function start(api) {
    if (global.config.autoAcceptRequests === false) return log("Turned off (autoAcceptRequests: false)");
    const run = () => checkOnce(api).catch(e => log(`Check failed: ${errText(e)}`));
    setTimeout(() => { run(); setInterval(run, EVERY_MS); }, FIRST_CHECK_MS);
    log("Will accept message requests every 10 minutes");
}

module.exports = { start, checkOnce };
