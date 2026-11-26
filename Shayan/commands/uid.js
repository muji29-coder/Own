module.exports.config = {
	name: "uid",
	version: "1.2.0",
	hasPermssion: 0,
	credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
	description: "Get User ID.",
	commandCategory: "Tools",
	usages: "[@tag / name / reply to a message]",
	cooldowns: 5
};

const norm = (s) => String(s || "").toLowerCase().replace(/^@/, "").replace(/\s+/g, " ").trim();

module.exports.run = async function({ api, event, args }) {
	const { threadID, messageID, senderID } = event;
	// 1) real tags (Facebook sends them as event.mentions = { id: "@Name" })
	const mentions = event.mentions || {};
	const ids = Object.keys(mentions);
	if (ids.length) {
		const lines = ids.map(id => `${String(mentions[id]).replace('@', '')}: ${id}`);
		return api.sendMessage(lines.join("\n"), threadID, messageID);
	}
	// 2) reply to someone's message: their ID
	if (event.type == "message_reply" && event.messageReply && event.messageReply.senderID) {
		return api.sendMessage(`${event.messageReply.senderID}`, threadID, messageID);
	}
	// 3) a name written after the command (when Facebook didn't send the tag info): find it among the group members
	const text = norm((args || []).join(" "));
	if (text && event.isGroup) {
		try {
			const info = await api.getThreadInfo(threadID);
			const members = (info && info.userInfo) || [];
			const exact = members.filter(u => norm(u.name) === text);
			const found = exact.length ? exact : members.filter(u => norm(u.name).includes(text) || text.includes(norm(u.name).split(" ")[0] || "\u0000"));
			if (found.length) return api.sendMessage(found.slice(0, 10).map(u => `${u.name}: ${u.id}`).join("\n"), threadID, messageID);
			return api.sendMessage(`No member called "${text}" was found in this group.\nReply to that person's message with ${global.config.PREFIX}uid instead.`, threadID, messageID);
		} catch (e) {
			return api.sendMessage(`Couldn't get the member list. Reply to that person's message with ${global.config.PREFIX}uid instead.`, threadID, messageID);
		}
	}
	// 4) otherwise: your own ID
	return api.sendMessage(`${senderID}`, threadID, messageID);
}
