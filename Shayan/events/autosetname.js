module.exports.config = {
	name: "autosetname",
	eventType: ["log:subscribe"],
	version: "1.0.3",
	credits: "𝙎𝙝𝙖𝙮𝙖𝙣 𝘽𝙪𝙏𝙩",
	description: "Automatically set new member nicknames"
};

module.exports.run = async function({ api, event, Users }) {
const { threadID } = event;
const { readFileSync, existsSync } = global.nodemodule["fs-extra"];
const { join } = global.nodemodule["path"];
// same file the #autosetname command writes to
const pathData = join(__dirname, "..", "commands", "cache", "autosetname.json");
if (!existsSync(pathData)) return; // nobody has set an auto nickname yet
var dataJson;
try { dataJson = JSON.parse(readFileSync(pathData, "utf-8")); } catch (e) { return; }
// the bot's own nickname is set by joinNoti, so skip the bot here
const botID = api.getCurrentUserID();
var memJoin = event.logMessageData.addedParticipants.map(info => info.userFbId).filter(id => id != botID);
if (!memJoin.length) return;
	for (let idUser of memJoin) {
		var thisThread = dataJson.find(item => item.threadID == threadID) || { threadID, nameUser: [] };
		if (thisThread.nameUser.length == 0) return
		if (thisThread.nameUser.length != 0) {
		var setName = thisThread.nameUser[0] 
		await new Promise(resolve => setTimeout(resolve, 1000));
		var namee1 = await api.getUserInfo(idUser)
        var namee = namee1[idUser].name
		api.changeNickname(`${setName} ${namee}`, threadID, idUser);
		} 
	}	
	return api.sendMessage(`Set a temporary nickname for the new member`, threadID, event.messageID)
}