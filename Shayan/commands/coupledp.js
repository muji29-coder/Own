const axios = require("axios");
const fs = require("fs-extra");

module.exports.config = {
 name: "coupledp",
 version: "1.1",
 hasPermssion: 0,
 credits: "Loid Butter",
 cooldowns: 5,
 description: "couple dp",
 commandCategory: "image",
 dependencies: {
   "axios":""
 }
 };

// The API this command used (tanjiro-api.onrender.com) has been shut down.
// Put a working "couple dp" API here (it must return JSON like { male: "<image url>", female: "<image url>" }).
const API_URL = "";

 module.exports.run = async function ({ api, event, args }) {
 if (!API_URL) return api.sendMessage("Couple DP service is not available right now.", event.threadID, event.messageID);
 // unique temp files so two people can use the command at the same time
 const tmp = __dirname + `/cache/coupledp_${Date.now()}_${Math.floor(Math.random() * 1e6)}`;
 const files = [tmp + "_1.png", tmp + "_2.png"];
 const cleanup = () => files.forEach(f => { try { fs.unlinkSync(f); } catch (e) {} });
 try {
 const { data } = await axios.get(API_URL);
 const maleImg = await axios.get(data.male, { responseType: "arraybuffer" });
 fs.writeFileSync(files[0], Buffer.from(maleImg.data));
 const femaleImg = await axios.get(data.female, { responseType: "arraybuffer" });
 fs.writeFileSync(files[1], Buffer.from(femaleImg.data));

 return api.sendMessage({
 body: "Here is your couple dp",
 attachment: files.map(f => fs.createReadStream(f))
 }, event.threadID, cleanup, event.messageID);
 } catch (error) {
 cleanup();
 console.log(`[ coupledp ] Failed: ${error.message}`);
 return api.sendMessage("Couple DP service is not available right now.", event.threadID, event.messageID);
 }
};
