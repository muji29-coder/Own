module.exports.config = {
	name: "approve",
	version: "2.0.0",
	hasPermssion: 2,
	credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
	description: "Approve groups so they can use the bot",
	commandCategory: "Admin",
	usages: "[groupID] | list | pending | del [groupID] | help",
	cooldowns: 5
};

const approval = require("../../utils/approval.js");

async function groupName(api, id) {
	try { const info = await api.getThreadInfo(id); return (info && info.threadName) || "Unnamed group"; }
	catch (e) { return "Unknown group (bot may not be in it)"; }
}

async function adminName(api) {
	const id = (global.config.ADMINBOT || [])[0];
	if (!id) return "the bot admin";
	try { const u = await api.getUserInfo(id); return (u && u[id] && u[id].name) || "the bot admin"; }
	catch (e) { return "the bot admin"; }
}

// Approve one group and tell that group about it
async function approveGroup(api, id) {
	const isNew = approval.approve(id);
	const prefix = global.config.PREFIX;
	api.changeNickname(`[ ${prefix} ] • ${global.config.BOTNAME || ""}`, id, api.getCurrentUserID());
	api.sendMessage(`✅ This group has been approved! 🙌\nYou can use the bot now.\n\n🤖 Bot: ${global.config.BOTNAME || ""}\n🔣 Prefix: ${prefix}\n👑 Owner: ${await adminName(api)}\n📋 Commands: ${prefix}help`, id);
	return isNew;
}

module.exports.handleReply = async function ({ event, api, handleReply }) {
	if (handleReply.author != event.senderID) return;
	const { threadID, messageID, body } = event;
	if (handleReply.type !== "pending") return;
	// reply with numbers from the pending list, e.g. "1" or "1 3"
	const picked = String(body || "").split(/[\s,]+/).map(n => parseInt(n)).filter(n => !isNaN(n));
	const done = [];
	for (const n of picked) {
		const id = handleReply.list[n - 1];
		if (!id) continue;
		await approveGroup(api, id);
		done.push(`${n}. ${id}`);
	}
	if (!done.length) return api.sendMessage("Reply with the number(s) from the list, e.g. 1 or 1 3", threadID, messageID);
	return api.sendMessage(`✅ Approved ${done.length} group(s):\n${done.join("\n")}`, threadID, messageID);
};

module.exports.run = async ({ event, api, args }) => {
	const { threadID, messageID, senderID } = event;
	const prefix = global.config.PREFIX;
	const sub = (args[0] || "").toLowerCase();

	if (sub == "help" || sub == "h") {
		return api.sendMessage(
			`=====「 APPROVE 」=====\n\n` +
			`${prefix}approve => approve this group\n` +
			`${prefix}approve <groupID> => approve a group by ID\n` +
			`${prefix}approve list => approved groups\n` +
			`${prefix}approve pending => groups waiting for approval (reply with a number to approve)\n` +
			`${prefix}approve del <groupID> => remove a group's approval\n\n` +
			`Approval mode: ${approval.enabled() ? "ON" : "OFF"} (config.json "approvalMode")`, threadID, messageID);
	}

	if (sub == "list" || sub == "l") {
		const list = approval.approvedList();
		if (!list.length) return api.sendMessage("No approved groups yet.", threadID, messageID);
		let msg = `=====「 APPROVED GROUPS: ${list.length} 」=====`;
		for (let i = 0; i < list.length; i++) msg += `\n〘${i + 1}〙» ${await groupName(api, list[i])}\n${list[i]}`;
		return api.sendMessage(msg, threadID, messageID);
	}

	if (sub == "pending" || sub == "p") {
		const list = approval.pendingList();
		if (!list.length) return api.sendMessage("No groups are waiting for approval.", threadID, messageID);
		let msg = `=====「 WAITING FOR APPROVAL: ${list.length} 」=====`;
		for (let i = 0; i < list.length; i++) msg += `\n〘${i + 1}〙» ${await groupName(api, list[i])}\n${list[i]}`;
		msg += `\n\nReply to this message with the number(s) to approve, e.g. 1 or 1 3`;
		return api.sendMessage(msg, threadID, (error, info) => {
			if (error || !info) return;
			global.client.handleReply.push({ name: this.config.name, messageID: info.messageID, author: senderID, type: "pending", list });
		}, messageID);
	}

	if (sub == "del" || sub == "d" || sub == "remove") {
		const id = args[1] || threadID;
		if (isNaN(parseInt(id))) return api.sendMessage("[ ERR ] Not a valid group ID", threadID, messageID);
		const reason = args.slice(2).join(" ");
		if (!approval.remove(id)) return api.sendMessage("[ ERR ] This group was not approved.", threadID, messageID);
		if (id != threadID) api.sendMessage(`[ OK ] This group's approval was removed by the bot admin.${reason ? "\nReason: " + reason : ""}`, id);
		return api.sendMessage(`[ OK ] Approval removed for group ${id}`, threadID, messageID);
	}

	// approve: given ID, or the current group
	const id = args[0] || threadID;
	if (isNaN(parseInt(id))) return api.sendMessage(`[ ERR ] Not a valid group ID. Use ${prefix}approve help`, threadID, messageID);
	if (id == senderID && !args[0]) return api.sendMessage(`Use this inside a group, or: ${prefix}approve <groupID>`, threadID, messageID);
	if (approval.isApproved(id)) return api.sendMessage(`[ - ] Group ${id} is already approved.`, threadID, messageID);
	await approveGroup(api, id);
	if (id != threadID) return api.sendMessage(`[ OK ] Approved group: ${await groupName(api, id)}\n${id}`, threadID, messageID);
};
