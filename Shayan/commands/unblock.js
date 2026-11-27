module.exports.config = {
	name: "unblock",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
	description: "Unblock a person blocked with #block",
	commandCategory: "admin",
	usages: "@tag / reply / ID",
	cooldowns: 2
};

// same as "#block del ..."
module.exports.run = (o) => require("./block.js").run({ ...o, args: ["del", ...(o.args || [])] });
