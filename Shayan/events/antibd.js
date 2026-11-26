module.exports.config = {
  name: "antibd",
  eventType: ["log:user-nickname"],
  version: "0.0.1",
  credits: "𝙎𝙝𝙖𝙮𝙖𝙣 𝘽𝙪𝙏𝙩",
  description: "Against changing Bot's nickname"
};

module.exports.run = async function({ api, event, Users, Threads }) {
    var { logMessageData, threadID, author } = event;
    var botID = api.getCurrentUserID();
    var { BOTNAME, ADMINBOT, PREFIX } = global.config;
    // same nickname the bot gets when it is added to a group: "[ prefix ] • BOTNAME"
    const threadSetting = global.data.threadData.get(String(threadID)) || {};
    var nickname = `[ ${threadSetting.PREFIX || PREFIX} ] • ${BOTNAME || ""}`;
    if (logMessageData.participant_id == botID && author != botID && !ADMINBOT.includes(author) && logMessageData.nickname != nickname) {
        api.changeNickname(nickname, threadID, botID)
        var info = await Users.getData(author);
       return api.sendMessage({ body: `${info.name} - 𝙔𝙊𝙐 𝘾𝘼𝙉'𝙏 𝘾𝙃𝘼𝙉𝙂𝙀 𝙏𝙃𝙀 𝘽𝙊𝙏'𝙎 𝙉𝙄𝘾𝙆𝙉𝘼𝙈𝙀 😹🖐`}, threadID);
    }  
        }
