module.exports.config = {
  name: "inf",
  version: "1.0.1", 
  hasPermssion: 0,
  credits: "Shayan BuTt", //don't change the credits please
  description: "Admin and Bot info.",
  commandCategory: "...",
  cooldowns: 1,
  dependencies: 
  {
    "request":"",
    "fs-extra":"",
    "axios":""
  }
};
module.exports.run = async function({ api,event,args,client,Users,Threads,__GLOBAL,Currencies }) {
const axios = global.nodemodule["axios"];
const request = global.nodemodule["request"];
const fs = global.nodemodule["fs-extra"];
const time = process.uptime(),
    hours = Math.floor(time / (60 * 60)),
    minutes = Math.floor((time % (60 * 60)) / 60),
    seconds = Math.floor(time % 60);
const moment = require("moment-timezone");
var juswa = moment.tz("Asia/Karachi").format("『D/MM/YYYY』 【HH:mm:ss】");
var link = ["https://i.imgur.com/Qew2r28.jpeg", "https://i.imgur.com/lXpufPr.jpeg", "https://i.imgur.com/Qew2r28.jpeg", "https://i.imgur.com/lXpufPr.jpeg", "https://i.imgur.com/lXpufPr.jpeg", "https://i.imgur.com/Qew2r28.jpeg", "https://i.imgur.com/lXpufPr.jpeg"];
var callback = () => api.sendMessage({body:`⫸⫷ 🧡 𝐀𝐃𝐌𝐈𝐍 𝐀𝐍𝐃 𝐁𝐎𝐓 𝐈𝐍𝐅𝐎𝐑𝐌𝐀𝐓𝐈𝐎𝐍 🧡 ⫸⫷

Bot Name ⫸⫷ ${global.config.BOTNAME}

Bot Admin ⫸⫷ Shayan BuTt

Bot Prefix ⫸⫷ ${global.config.PREFIX}

Bot Owner ⫸⫷ Shayan BuTt

Today is ⫸⫷ ${juswa} 

💌Bot is running💌 ${hours}:${minutes}:${seconds}.

✅Thanks for using ${global.config.BOTNAME} Bot🖤`,attachment: fs.createReadStream(__dirname + "/cache/juswa.jpg")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/juswa.jpg")); 
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/juswa.jpg")).on("close",() => callback());
   };
