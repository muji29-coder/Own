module.exports.config = {
	name: "resend",
	version: "3.0.0",
	hasPermssion: 1,
	credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
	description: "Resends messages that someone deletes (unsends). #resend turns it on/off for this chat",
	commandCategory: "general",
	usages: "(on/off toggle)",
	cooldowns: 0,
	hide: true,
	dependencies: { "fs-extra": "", "axios": "" }
};

const KEEP_MS = 6 * 60 * 60 * 1000; // remember messages for 6 hours
const MAX_MESSAGES = 3000;           // and at most this many (oldest are forgotten first)
const log = global.__resendLog || (global.__resendLog = new Map()); // messageID -> saved message

function remember(e) {
	log.set(e.messageID, {
		time: Date.now(),
		senderID: String(e.senderID),
		body: e.body || "",
		attachments: (e.attachments || []).map(a => ({ type: a.type, url: a.url || a.largePreviewUrl || a.previewUrl || a.playableUrl, name: a.filename || a.name || "" })).filter(a => a.url)
	});
	// forget old messages (Map keeps insertion order, so the oldest are first)
	const now = Date.now();
	for (const [id, m] of log) {
		if (log.size <= MAX_MESSAGES && now - m.time < KEEP_MS) break;
		log.delete(id);
	}
}

function extOf(a) {
	const fromName = (a.name.match(/\.([a-z0-9]{2,5})$/i) || [])[1];
	const fromUrl = (String(a.url).split("?")[0].match(/\.([a-z0-9]{2,5})$/i) || [])[1];
	return (fromName || fromUrl || { photo: "jpg", animated_image: "gif", sticker: "png", video: "mp4", audio: "mp3" }[a.type] || "bin").toLowerCase();
}

module.exports.handleEvent = async function ({ event: e, api, Users }) {
	const botID = String(api.getCurrentUserID());
	if (String(e.senderID) == botID) return;
	const setting = global.data.threadData.get(String(e.threadID)) || {};
	if (setting.resend === false) return; // turned off in this chat with #resend

	if (e.type == "message" || e.type == "message_reply") return remember(e);
	if (e.type != "message_unsend") return;

	const m = log.get(e.messageID);
	if (!m) return; // too old, or sent before the bot started
	log.delete(e.messageID);

	let name = "Someone";
	try { name = (await Users.getNameUser(m.senderID)) || name; } catch (err) { }
	const tag = "@" + name;
	const msg = {
		body: `♻️ ${tag} deleted a message` + (m.attachments.length ? ` (${m.attachments.length} attachment)` : "") + (m.body ? `:\n\n💬 ${m.body}` : ""),
		mentions: [{ tag, id: m.senderID }]
	};

	const fs = global.nodemodule["fs-extra"];
	const axios = global.nodemodule["axios"];
	const files = [];
	for (const a of m.attachments) {
		try {
			const data = (await axios.get(a.url, { responseType: "arraybuffer", timeout: 30000 })).data;
			const file = __dirname + `/cache/resend_${Date.now()}_${Math.floor(Math.random() * 1e6)}.${extOf(a)}`;
			fs.writeFileSync(file, Buffer.from(data));
			files.push(file);
		} catch (err) { /* attachment link expired: send the rest */ }
	}
	if (files.length) msg.attachment = files.map(f => fs.createReadStream(f));
	else if (!m.body) msg.body += "\n(the attachment is no longer available)";

	return api.sendMessage(msg, e.threadID, () => files.forEach(f => { try { fs.unlinkSync(f); } catch (err) { } }));
};

module.exports.run = async function ({ api, event, Threads }) {
	const { threadID, messageID } = event;
	let data = {};
	try { data = (await Threads.getData(threadID)).data || {}; } catch (err) { }
	data.resend = data.resend === false; // toggle (default is on)
	try { await Threads.setData(threadID, { data }); } catch (err) { }
	global.data.threadData.set(String(threadID), data);
	return api.sendMessage(data.resend ? "♻️ Resend ON: deleted messages will be sent again." : "⏸️ Resend OFF: deleted messages in this chat will not be sent again.", threadID, messageID);
};
