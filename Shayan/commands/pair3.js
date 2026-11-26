module.exports.config = {
  name: "pair3",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
  description: "It's a compound :>",
  commandCategory: "Entertainment",
  usages: "",
  dependencies: {
        "axios": "",
        "fs-extra": ""
  },
  cooldowns: 0
}

// Draws a heart shape centred at (x, y) with the given size
function drawHeart(ctx, x, y, size, color) {
  ctx.save();
  ctx.fillStyle = color;
  ctx.beginPath();
  const top = y - size * 0.35;
  ctx.moveTo(x, top + size * 0.25);
  ctx.bezierCurveTo(x, top, x - size * 0.5, top, x - size * 0.5, top + size * 0.3);
  ctx.bezierCurveTo(x - size * 0.5, top + size * 0.6, x, top + size * 0.75, x, top + size);
  ctx.bezierCurveTo(x, top + size * 0.75, x + size * 0.5, top + size * 0.6, x + size * 0.5, top + size * 0.3);
  ctx.bezierCurveTo(x + size * 0.5, top, x, top, x, top + size * 0.25);
  ctx.fill();
  ctx.restore();
}

// Draws an avatar as a circle with a white border
function drawCircleAvatar(ctx, img, x, y, size) {
  ctx.save();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2 + 8, 0, Math.PI * 2);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  ctx.beginPath();
  ctx.arc(x + size / 2, y + size / 2, size / 2, 0, Math.PI * 2);
  ctx.clip();
  ctx.drawImage(img, x, y, size, size);
  ctx.restore();
}

module.exports.run = async function ({ args, Users, Threads, api, event, Currencies }) {
  const { loadImage, createCanvas } = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  // unique file per request so two people can use the command at the same time
  let pathImg = __dirname + `/cache/${this.config.name}_${Date.now()}_${Math.floor(Math.random() * 1e6)}.png`;

  try {
    var id1 = event.senderID;
    var name1 = await Users.getNameUser(id1);
    var ThreadInfo = await api.getThreadInfo(event.threadID);
    var all = ThreadInfo.userInfo || [];
    const botID = api.getCurrentUserID();
    // random partner from all group members (not yourself, not the bot)
    let ungvien = (ThreadInfo.participantIDs || all.map(u => u.id)).filter(id => id != id1 && id != botID);
    if (!ungvien.length) return api.sendMessage("No other members in this group to pair with.", event.threadID, event.messageID);

    var id2 = ungvien[Math.floor(Math.random() * ungvien.length)];
    var name2 = await Users.getNameUser(id2);
    var rd1 = Math.floor(Math.random() * 100) + 1;
    var cc = ["0", "-1", "99,99", "-99", "-100", "101", "0,01"];
    var rd2 = cc[Math.floor(Math.random() * cc.length)];
    var djtme = [`${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd2}`, `${rd1}`, `${rd1}`, `${rd1}`, `${rd1}`];
    var tile = djtme[Math.floor(Math.random() * djtme.length)];

    const avatarUrl = (id) => `https://graph.facebook.com/${id}/picture?width=720&height=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
    const [avt1, avt2] = await Promise.all([id1, id2].map(async (id) =>
      loadImage(Buffer.from((await axios.get(avatarUrl(id), { responseType: "arraybuffer" })).data))));

    // Background is drawn here (no external image needed, so it can never break)
    const W = 1300, H = 600;
    let canvas = createCanvas(W, H);
    let ctx = canvas.getContext("2d");
    const grad = ctx.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#ff9a9e");
    grad.addColorStop(0.5, "#fbc2eb");
    grad.addColorStop(1, "#a18cd1");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
    for (let i = 0; i < 40; i++) {
      drawHeart(ctx, Math.random() * W, Math.random() * H, 15 + Math.random() * 35, `rgba(255,255,255,${0.15 + Math.random() * 0.25})`);
    }
    drawCircleAvatar(ctx, avt1, 100, 150, 300);
    drawCircleAvatar(ctx, avt2, 900, 150, 300);
    drawHeart(ctx, W / 2, H / 2 - 10, 230, "#e8174a");
    ctx.fillStyle = "#ffffff";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 56px sans-serif";
    ctx.fillText(`${tile}%`, W / 2, H / 2 - 20);

    fs.writeFileSync(pathImg, canvas.toBuffer());
    return api.sendMessage({ body: `Congratulations ${name1} successfully paired with ${name2}\nThe odds are ${tile}%`,
              mentions: [{
            tag: `${name2}`,
            id: id2
          }], attachment: fs.createReadStream(pathImg) },
        event.threadID,
        () => { try { fs.unlinkSync(pathImg); } catch (e) {} },
        event.messageID);
  } catch (e) {
    try { fs.unlinkSync(pathImg); } catch (err) {}
    console.log(`[ ${this.config.name} ] Failed: ${e.message}`);
    return api.sendMessage("Pairing failed, please try again later.", event.threadID, event.messageID);
  }
}
