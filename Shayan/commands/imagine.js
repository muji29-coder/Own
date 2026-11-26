module.exports.config = {
  name: "imagine",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
  description: "generate image from polination",
  commandCategory: "image",
  usages: "query",
  cooldowns: 2,
};
module.exports.run = async ({ api, event, args }) => {
  const axios = require('axios');
  const fs = require('fs-extra');
  let { threadID, messageID } = event;
  let query = args.join(" ");
  if (!query) return api.sendMessage("put text/query", threadID, messageID);
  // unique file per request so two people can use the command at the same time
  let path = __dirname + `/cache/poli_${Date.now()}_${Math.floor(Math.random() * 1e6)}.jpg`;
  try {
    api.setMessageReaction("⌛", messageID, () => {}, true);
    const poli = (await axios.get(`https://image.pollinations.ai/prompt/${encodeURIComponent(query)}`, {
      responseType: "arraybuffer",
      timeout: 120000,
    })).data;
    fs.writeFileSync(path, Buffer.from(poli));
    api.setMessageReaction("✅", messageID, () => {}, true);
    api.sendMessage({
      body: `“${query}” 𝗜𝗺𝗮𝗴𝗲 𝗚𝗲𝗻𝗲𝗿𝗮𝘁𝗲𝗱`,
      attachment: fs.createReadStream(path)
    }, threadID, () => { try { fs.unlinkSync(path); } catch (e) {} }, messageID);
  } catch (e) {
    console.log(`[ imagine ] Failed: ${e.message}`);
    try { fs.unlinkSync(path); } catch (err) {}
    api.setMessageReaction("❌", messageID, () => {}, true);
    api.sendMessage("Couldn't generate the image, please try again in a little while.", threadID, messageID);
  }
};
