module.exports.config = {
  name: "pair2",
  version: "1.0.0", 
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
  description: "Ghep doi ngau nhien",
  commandCategory: "random-img", 
  usages: "", 
  cooldowns: 0,
};
module.exports.run = async function({ api, event, args, Users, Threads, Currencies }) {
        const axios = global.nodemodule["axios"];
        const fs = global.nodemodule["fs-extra"];
        var data = await Currencies.getData(event.senderID);
        var money = data.money
        if(money < 500) api.sendMessage("You need 500 USD for 1 pairing, please use ${global.config.PREFIX}work to received money or ask for admin bot!\n🤑Theres something new to eat🤑",event.threadID,event.messageID)
        else {
        var tl = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
        var tle = tl[Math.floor(Math.random() * tl.length)];
        let dataa = await api.getUserInfo(event.senderID);
        let namee = await dataa[event.senderID].name
        let loz = await api.getThreadInfo(event.threadID);
        // never pair someone with themselves or with the bot
        const botID = api.getCurrentUserID();
        var emoji = loz.participantIDs.filter(x => x != event.senderID && x != botID);
        if (!emoji.length) return api.sendMessage("No other members in this group to pair with.", event.threadID, event.messageID);
        var id = emoji[Math.floor(Math.random() * emoji.length)];
        let data = await api.getUserInfo(id);
        let name = await data[id].name
        var arraytag = [];
                arraytag.push({id: event.senderID, tag: namee});
                arraytag.push({id: id, tag: name});
        api.changeNickname(`😘👉🔐🔐 ${name} Property 🔐🔐👈😘`, event.threadID, event.senderID);
        api.changeNickname(`😘👉🔐🔐 ${namee} Property🔐🔐👈😘`, event.threadID, id);
        var sex = await data[id].gender;
        var gender = sex == 2 ? "Male🧑" : sex == 1 ? "Female👩‍🦰" : "Unknown";
        Currencies.setData(event.senderID, options = {money: money - 500})
        // unique temp files so two people can use the command at the same time
        const tmp = __dirname + `/cache/pair2_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
        const files = [tmp + "_avt.png", tmp + "_avt2.png"];
        const cleanup = () => files.forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
        try {
        let Avatar = (await axios.get( `https://graph.facebook.com/${event.senderID}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" } )).data;
            fs.writeFileSync( files[0], Buffer.from(Avatar, "utf-8") );
        let Avatar2 = (await axios.get( `https://graph.facebook.com/${id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: "arraybuffer" } )).data;
            fs.writeFileSync( files[1], Buffer.from(Avatar2, "utf-8") );
        var imglove = [];
              imglove.push(fs.createReadStream(files[0]));
              imglove.push(fs.createReadStream(files[1]));
        var msg = {body: `Complete the pairing bar you lost 500 dollars!\nYour partner's gender: ${gender}\nDual ratio: ${tle}\n`+namee+" "+"❤️"+" "+name, mentions: arraytag, attachment: imglove}
        return api.sendMessage(msg, event.threadID, cleanup, event.messageID)
        } catch (e) {
          cleanup();
          console.log(`[ pair2 ] Failed: ${e.message}`);
          return api.sendMessage("Pairing failed, please try again later.", event.threadID, event.messageID);
        }
      }
  }