module.exports.config = {
  name: "hack",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
  description: "Prank picture that pretends to hack someone's account",
  commandCategory: "hack",
  usages: "@mention",
  dependencies: {
        "axios": "",
        "fs-extra": ""
  },
  cooldowns: 0
};

module.exports.run = async function ({ args, Users, Threads, api, event, Currencies }) {
  const { loadImage, createCanvas } = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  // unique file per request so two people can use the command at the same time
  let pathImg = __dirname + `/cache/hack_${Date.now()}_${Math.floor(Math.random() * 1e6)}.png`;

  try {
    var id = Object.keys(event.mentions || {})[0] || event.senderID;
    var name = await Users.getNameUser(id) || "Facebook User";

    const avatar = await loadImage(Buffer.from((await axios.get(
      `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" })).data));

    // Prank "hacking" screen, drawn here (the old template image was deleted from its host)
    const W = 900, H = 560;
    const canvas = createCanvas(W, H);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#0b0f14";
    ctx.fillRect(0, 0, W, H);
    // faint matrix-style background
    ctx.font = "16px monospace";
    ctx.fillStyle = "rgba(0,255,90,0.10)";
    for (let y = 20; y < H; y += 22) {
      let line = "";
      for (let i = 0; i < 70; i++) line += Math.random() < 0.5 ? "0" : "1";
      ctx.fillText(line, 10, y);
    }
    // window
    ctx.fillStyle = "rgba(10,20,30,0.92)";
    ctx.fillRect(60, 50, W - 120, H - 100);
    ctx.strokeStyle = "#00ff66";
    ctx.lineWidth = 3;
    ctx.strokeRect(60, 50, W - 120, H - 100);
    ctx.fillStyle = "#00ff66";
    ctx.font = "bold 30px monospace";
    ctx.textAlign = "center";
    ctx.fillText("FACEBOOK ACCOUNT HACKER v2.0", W / 2, 100);

    // avatar
    ctx.save();
    ctx.beginPath();
    ctx.arc(190, 250, 90, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(avatar, 100, 160, 180, 180);
    ctx.restore();
    ctx.beginPath();
    ctx.arc(190, 250, 92, 0, Math.PI * 2);
    ctx.strokeStyle = "#00ff66";
    ctx.stroke();

    // details
    ctx.textAlign = "left";
    ctx.font = "bold 26px sans-serif";
    ctx.fillStyle = "#ffffff";
    let shown = name;
    while (ctx.measureText(shown).width > 470 && shown.length > 3) shown = shown.slice(0, -2);
    if (shown !== name) shown += "…";
    ctx.fillText(shown, 310, 195);
    ctx.font = "20px monospace";
    ctx.fillStyle = "#9fb3c8";
    ctx.fillText(`ID: ${id}`, 310, 235);
    ctx.fillText("Password: ************", 310, 270);
    ctx.fillStyle = "#00ff66";
    ctx.fillText("Status: ACCESS GRANTED", 310, 305);

    // progress bar
    ctx.fillStyle = "#1c2733";
    ctx.fillRect(110, 380, W - 220, 34);
    ctx.fillStyle = "#00ff66";
    ctx.fillRect(110, 380, W - 220, 34);
    ctx.fillStyle = "#0b0f14";
    ctx.font = "bold 20px monospace";
    ctx.textAlign = "center";
    ctx.fillText("HACKING... 100%", W / 2, 404);
    ctx.fillStyle = "#6b7c8f";
    ctx.font = "14px sans-serif";
    ctx.fillText("Just a prank 😜 - nothing was actually hacked", W / 2, 470);

    fs.writeFileSync(pathImg, canvas.toBuffer());
    return api.sendMessage({ body: ` `, attachment: fs.createReadStream(pathImg) },
        event.threadID,
        () => { try { fs.unlinkSync(pathImg); } catch (e) {} },
        event.messageID);
  } catch (e) {
    try { fs.unlinkSync(pathImg); } catch (err) {}
    console.log(`[ hack ] Failed: ${e.message}`);
    return api.sendMessage("Could not make the picture, please try again later.", event.threadID, event.messageID);
  }
}
