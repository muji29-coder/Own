module.exports.config = {
    name: "imgur",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
    description: "",
    commandCategory: "Game",
    usages: "[reply]",
    cooldowns: 5,
    dependencies: {
      "axios": ""
    }
};

module.exports.run = async ({ api, event, args }) => {
const axios = global.nodemodule['axios'];  
const replyPhoto = event.messageReply && event.messageReply.attachments && event.messageReply.attachments[0];
var linkanh = (replyPhoto && replyPhoto.url) || (args || []).join(" ");
    if(!linkanh) return api.sendMessage('Please reply or enter a link 1 image!!!', event.threadID, event.messageID)
const res = await axios.get(`https://imgur-api-by-koja.xx0xkoja.repl.co/imgur?link=${encodeURIComponent(linkanh)}`);    
var img = res.data.uploaded.image;
    return api.sendMessage(`${img}`, event.threadID, event.messageID);
}