module.exports.config = {
  name: "wasted",
  version: "1.1.0",
  hasPermssion: 0,
  credits: "Joshua Sy",
  description: "GTA style WASTED picture of you or a tagged/replied person",
  commandCategory: "banner",
  usages: "[@tag / reply]",
  cooldowns: 2,
  dependencies: {
    canvas: "",
    axios: "",
    "fs-extra": "",
  },
};

module.exports.run = async function ({ api, event, args, Users }) {
  let { senderID, threadID, messageID } = event;
  const { loadImage, createCanvas } = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  // unique file per request so two people can use the command at the same time
  let pathImg = __dirname + `/cache/wasted_${Date.now()}_${Math.floor(Math.random() * 1e6)}.png`;

  // whose picture: tagged person > replied message > yourself
  let uid = senderID;
  if (event.type == "message_reply" && event.messageReply) uid = event.messageReply.senderID;
  const mentioned = Object.keys(event.mentions || {});
  if (mentioned.length) uid = mentioned[0];

  try {
    const avatar = await loadImage(Buffer.from((await axios.get(
      `https://graph.facebook.com/${uid}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" })).data));

    // The WASTED effect is drawn here (the old online editor API no longer exists)
    const S = 720;
    const canvas = createCanvas(S, S);
    const ctx = canvas.getContext("2d");
    ctx.drawImage(avatar, 0, 0, S, S);

    // black & white, slightly darker
    const img = ctx.getImageData(0, 0, S, S), d = img.data;
    for (let i = 0; i < d.length; i += 4) {
      const g = (0.299 * d[i] + 0.587 * d[i + 1] + 0.114 * d[i + 2]) * 0.8;
      d[i] = d[i + 1] = d[i + 2] = g;
    }
    ctx.putImageData(img, 0, 0);

    // dark band + red "wasted"
    const bandY = S / 2 - 75, bandH = 150;
    const band = ctx.createLinearGradient(0, bandY, 0, bandY + bandH);
    band.addColorStop(0, "rgba(0,0,0,0)");
    band.addColorStop(0.2, "rgba(0,0,0,0.75)");
    band.addColorStop(0.8, "rgba(0,0,0,0.75)");
    band.addColorStop(1, "rgba(0,0,0,0)");
    ctx.fillStyle = band;
    ctx.fillRect(0, bandY, S, bandH);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = "bold 130px serif";
    ctx.lineWidth = 8;
    ctx.strokeStyle = "#000000";
    ctx.strokeText("wasted", S / 2, S / 2 + 5);
    ctx.fillStyle = "#c8102e";
    ctx.fillText("wasted", S / 2, S / 2 + 5);

    fs.writeFileSync(pathImg, canvas.toBuffer());
    return api.sendMessage(
      { attachment: fs.createReadStream(pathImg) },
      threadID,
      () => { try { fs.unlinkSync(pathImg); } catch (e) {} },
      messageID
    );
  } catch (e) {
    try { fs.unlinkSync(pathImg); } catch (err) {}
    console.log(`[ wasted ] Failed: ${e.message}`);
    return api.sendMessage("Could not make the picture, please try again later.", threadID, messageID);
  }
};
