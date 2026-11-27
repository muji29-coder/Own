module.exports.config = {
	name: "block",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
	description: "Block a person: the bot ignores them everywhere (no replies, no AI, no reactions). Kept after restarts.",
	commandCategory: "admin",
	usages: "@tag / reply / ID [reason] | del @tag / reply / ID | list",
	cooldowns: 2
};

// Saved in Shayan/commands/data/blocked.json (and in the repo on GitHub), so blocks survive restarts.
// The old "#user ban" lived only in the database, which GitHub resets on every restart.
const store = require("../../utils/store.js");
const load = () => store.load("blocked", {});
const isAdmin = (id) => (global.config.ADMINBOT || []).map(String).includes(String(id));

// put the saved blocks into the bot's ban list (called when the bot starts and after each change)
function applySaved() {
	if (!global.data || !global.data.userBanned) return;
	for (const [id, b] of Object.entries(load())) global.data.userBanned.set(id, { reason: b.reason || "", dateAdded: b.dateAdded || "", silent: true });
}
module.exports.applySaved = applySaved;

function targetsOf(event, args) {
	const ids = Object.keys(event.mentions || {});
	if (ids.length) return ids;
	if (event.type == "message_reply" && event.messageReply && event.messageReply.senderID) return [String(event.messageReply.senderID)];
	const id = (args.find(a => /^\d{6,}$/.test(a)) || "");
	return id ? [id] : [];
}

module.exports.run = async function ({ api, event, args, Users }) {
	const { threadID, messageID } = event;
	const p = global.config.PREFIX;
	const sub = (args[0] || "").toLowerCase();
	const blocked = load();

	if (sub == "list") {
		const ids = Object.keys(blocked);
		if (!ids.length) return api.sendMessage("✅ Nobody is blocked.", threadID, messageID);
		return api.sendMessage(`🚫 Blocked (${ids.length}):\n\n` + ids.map((id, i) => `${i + 1}. ${blocked[id].name || "Unknown"} (${id})${blocked[id].reason ? "\n   Reason: " + blocked[id].reason : ""}`).join("\n") + `\n\nUnblock: ${p}unblock ID`, threadID, messageID);
	}

	const unblock = ["del", "remove", "off", "unblock"].includes(sub);
	const rest = unblock ? args.slice(1) : args;
	const targets = targetsOf(event, rest);
	if (!targets.length) return api.sendMessage(`How to use:\n${p}block @tag (or reply to their message, or their ID) [reason]\n${p}unblock @tag / ID\n${p}block list`, threadID, messageID);

	const done = [];
	for (const id of targets) {
		let name = id;
		try { name = (await Users.getNameUser(id)) || id; } catch (e) { }
		if (unblock) {
			if (!blocked[id]) { done.push(`ℹ️ ${name} was not blocked`); continue; }
			delete blocked[id];
			global.data.userBanned.delete(id);
			done.push(`✅ Unblocked ${name} (${id})`);
		} else {
			if (isAdmin(id) || id == String(api.getCurrentUserID())) { done.push(`⛔ Can't block ${name}: bot admin / the bot`); continue; }
			const reason = rest.filter(a => !a.startsWith("@") && a != id && !Object.values(event.mentions || {}).some(m => m.includes(a))).join(" ").trim();
			blocked[id] = { name, reason, by: String(event.senderID), dateAdded: new Date().toLocaleString("en-GB", { timeZone: "Asia/Karachi" }) };
			done.push(`🚫 Blocked ${name} (${id})${reason ? "\nReason: " + reason : ""}`);
		}
	}
	store.save("blocked", 500, 3000);
	applySaved();
	const anyBlocked = !unblock && done.some(d => d.startsWith("🚫"));
	return api.sendMessage(done.join("\n") + (anyBlocked ? "\n\nThe bot will ignore them everywhere." : ""), threadID, messageID);
};
