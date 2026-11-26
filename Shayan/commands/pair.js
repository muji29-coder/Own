module.exports.config = {
  name: "pair",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
  description: "0Pairing",
  commandCategory: "Love",
  usages: "pair",
  cooldowns: 0
};
module.exports.run = async function({ api, event, args, Users, Threads, Currencies }) {
  const axios = global.nodemodule["axios"];
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID } = event;
  // unique temp files so two people can use the command at the same time
  const tmp = __dirname + `/cache/pair_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
  const files = [tmp + "_avt.png", tmp + "_love.gif", tmp + "_avt2.png"];
  const cleanup = () => files.forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
  try {
    var tl = ['21%', '67%', '19%', '37%', '17%', '96%', '52%', '62%', '76%', '83%', '100%', '99%', "0%", "48%"];
    var tle = tl[Math.floor(Math.random() * tl.length)];
    let dataa = await api.getUserInfo(senderID);
    let namee = dataa[senderID].name;
    let loz = await api.getThreadInfo(threadID);
    // never pair someone with themselves or with the bot
    const botID = api.getCurrentUserID();
    const candidates = loz.participantIDs.filter(x => x != senderID && x != botID);
    if (!candidates.length) return api.sendMessage("No other members in this group to pair with.", threadID, messageID);
    var id = candidates[Math.floor(Math.random() * candidates.length)];
    let data = await api.getUserInfo(id);
    let name = data[id].name;
    var arraytag = [];
    arraytag.push({id: senderID, tag: namee});
    arraytag.push({id: id, tag: name});
    var sex = data[id].gender;
    var gender = sex == 2 ? "Male🧑" : sex == 1 ? "Female👩‍🦰" : "Unknown";
    const pg = require(process.cwd() + "/utils/pairgif.js");
    // photos: the person who used the command first, the partner last
    const meAvatar = await pg.getAvatar(api, senderID);
    const partnerAvatar = await pg.getAvatar(api, id);
    files.push(tmp + "_me.gif", tmp + "_partner.gif");
    let imglove;
    try {
      // 3 separate pictures in this order:  [ you ]  [ love GIF ]  [ partner ]
      // (all three as GIFs, because photos are always sent before GIFs)
      await pg.photoToGif(meAvatar, files[3]);
      await pg.photoToGif(partnerAvatar, files[4]);
      fs.copyFileSync(pg.LOVE_GIF, files[1]);
      imglove = [files[3], files[1], files[4]].map(p => fs.createReadStream(p));
    } catch (e) {
      // could not convert: plain photos + GIF (Messenger then shows the GIF last)
      console.log(`[ pair ] GIF conversion failed (${e.message}), sending photos`);
      fs.writeFileSync(files[0], meAvatar);
      fs.writeFileSync(files[2], partnerAvatar);
      imglove = [fs.createReadStream(files[0]), fs.createReadStream(files[2])];
      try { fs.copyFileSync(pg.LOVE_GIF, files[1]); imglove.splice(1, 0, fs.createReadStream(files[1])); } catch (err) {}
    }
    var msg = {body: `🥰Successful pairing!\n💌Wish you two hundred years of happiness\nYour partner's gender: ${gender}\nDual ratio: ${tle}\n` + namee + " " + "❤️" + " " + name, mentions: arraytag, attachment: imglove};
    return api.sendMessage(msg, threadID, cleanup, messageID);
  } catch (e) {
    cleanup();
    console.log(`[ pair ] Failed: ${e.message}`);
    return api.sendMessage("Pairing failed, please try again later.", threadID, messageID);
  }
}
