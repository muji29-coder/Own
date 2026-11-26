module.exports.config = {
	name: "offbot",
	version: "1.0.0",
	hasPermssion: 2,
	credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
	description: "turn the bot off",
	commandCategory: "system",
	cooldowns: 0
        };
module.exports.run = ({event, api}) =>{
    const permission = (global.config.ADMINBOT || []).map(String); // bot admins from config.json
  	if (!permission.includes(String(event.senderID))) return api.sendMessage("[ ERR ] You don't have permission to use this command, This Command Only For The Bot Admin", event.threadID, event.messageID);
  api.sendMessage(`[ OK ] ${global.config.BOTNAME} Bot are now turned off.`,event.threadID, () =>process.exit(0))
}