module.exports.config = {
	name: "unsend",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
	description: "Unsend the bot's message",
	commandCategory: "system",
	usages: "unsend",
	cooldowns: 0
};

module.exports.languages = {
	"vi": {
		"returnCant": "Can't unsend other people's messages.",
		"missingReply": "Please reply to the message you want to unsend."
	},
	"en": {
		"returnCant": "I can only unsend my own messages.",
		"missingReply": "Reply to the message of mine that you want me to unsend."
	}
}

module.exports.run = function({ api, event, getText }) {
	// first: is this a reply at all? (without a reply there is no messageReply and the old code crashed)
	if (event.type != "message_reply" || !event.messageReply) return api.sendMessage(getText("missingReply"), event.threadID, event.messageID);
	// Facebook only lets the bot delete its OWN messages
	if (String(event.messageReply.senderID) != String(api.getCurrentUserID())) return api.sendMessage(getText("returnCant"), event.threadID, event.messageID);
	return api.unsendMessage(event.messageReply.messageID);
	}