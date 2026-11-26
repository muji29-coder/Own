module.exports.config = {
	name: "luckynum",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
	description: "random number",
	commandCategory: "game",
	cooldowns: 5
};

module.exports.languages = {
	"vi": {
		"returnResultDefault": "%1 might be a lucky number :thinking:",
		"invalidMax": "Invalid number range",
		"invalidInput": "The start or end of the range is not a valid number!",
		"returnResult": "%1 might be a lucky number in the range from %2 to %3 :thinking:"
	},

	"en": {
		"returnResultDefault": "%1 is maybe a lucky number :thinking:",
		"invalidMax": "invalid dial limit range",
		"invalidInput": "The started range or the ended range is not an invalid!",
		"returnResult": "%1 is nay e a lucky number in range from %2 to %3 :thinking:"
	}
}

module.exports.run = function ({ event, api, args, getText }) {
    const { threadID, messageID } = event;

    if (args.length == 0) return api.sendMessage(getText("returnResultDefault", Math.floor(Math.random() * 11)), threadID, messageID);
    if (args.length != 2) return api.sendMessage(getText("invalidMax"), threadID, messageID);
    if (isNaN(args[0]) || isNaN(args[1]) || args[1] <= args[0] || args[0] < 0 || args[1] < 0) return api.sendMessage(getText("invalidInput"), threadID, messageID);
    return api.sendMessage(getText("returnResult", Math.floor(Math.random() * (args[1] - args[0] + 1) + args[0]), args[0], args[1]), threadID, messageID);
}
