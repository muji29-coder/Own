module.exports.config = {
  name: "prefix",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
  description: "given prefix detail",
  commandCategory: "For Admin",
  usages: "",
  cooldowns: 5,
};

module.exports.handleEvent = async ({ event, api, Threads }) => {
  var { threadID, messageID, body, senderID } = event;
  //if (senderID == global.data.botID) return;
  if ((this.config.credits) != "\ud835\udc12\ud835\udc21\ud835\udc1a\ud835\udc32\ud835\udc1a\ud835\udc27\x20\ud835\udc01\ud835\udc2e\ud835\udc13\ud835\udc2d") { return api.sendMessage(`\x41\x67\x61\x69\x6e\x20\x63\x68\x61\x6e\x67\x65\x20\x63\x72\x65\x64\x69\x74\x20\x74\x6f\x20\ud835\udc12\ud835\udc21\ud835\udc1a\ud835\udc32\ud835\udc1a\ud835\udc27\x20\ud835\udc01\ud835\udc2e\ud835\udc13\ud835\udc2d`, threadID, messageID)}
  function out(data) {
    api.sendMessage(data, threadID, messageID)
  }
  var dataThread = (await Threads.getData(threadID));
  var data = dataThread.data; 
  const threadSetting = global.data.threadData.get(parseInt(threadID)) || {};
  var arr = ["mpre","mprefix","prefix", "bot prefix", "what is the bot prefix","botprefix", "duong", "what prefix", "freefix", "what is the prefix", "bot dead", "bots dead", "where prefix", "what is bot", "what prefix bot", "how to use bot" ,"how use bot", "where are the bots","bot not working","bot is offline","where prefix","prefx","prfix","prifx","perfix","bot not talking","where is bot"];
  arr.forEach(i => {
    let str = i[0].toUpperCase() + i.slice(1);
    if (body === i.toUpperCase() | body === i | str === body) {
const prefix = threadSetting.PREFIX || global.config.PREFIX;
      if (data.PREFIX == null) {
        return out(`This Is My Prefix ⇉ [ ${prefix} ]\n💝🥀𝐎𝐖𝐍𝐄𝐑:- ☞𝙎𝙝𝙖𝙮𝙖𝙣 𝘽𝙪𝙏𝙩☜ 💫\n🖤𝚈𝚘𝚞 𝙲𝚊𝚗 𝙲𝚊𝚕𝚕 𝙷𝚒𝚖 𝙎𝙝𝙖𝙮𝙖𝙣 𝘽𝙪𝙏𝙩🖤\n😳𝐇𝐢𝐬 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐢𝐝🤓:- ☞ www.facebook.com/Shayan.Bstie.Ayish\n
👋😇`)
      }
      else return out('️️️️️️️️️️️️️️️️️️️️️️️️️️️This Is My Prefix ⇉ [ ${prefix} ]  \n💝🥀𝐎𝐖𝐍𝐄𝐑:- ☞𝙎𝙝𝙖𝙮𝙖𝙣 𝘽𝙪𝙏𝙩☜ 💫\n🖤𝚈𝚘𝚞 𝙲𝚊𝚗 𝙲𝚊𝚕𝚕 𝙷𝚒𝚖 𝙎𝙝𝙖𝙮𝙖𝙣 𝘽𝙪𝙏𝙩🖤\n😳𝐇𝐢𝐬 𝐅𝐚𝐜𝐞𝐛𝐨𝐨𝐤 𝐢𝐝🤓:- ☞ www.facebook.com/Shayan.Bstie.Ayish\n👋😇' + data.PREFIX)
    }

  });
};

module.exports.run = async({ event, api }) => {
    return api.sendMessage("error", event.threadID)
}
