// Builds ONE animated GIF for pair commands:  [ person 1 photo ]  [ moving love GIF ]  [ person 2 photo ]
// (Messenger always moves a GIF attachment after the photos, so separate attachments can't keep this order.)
// Needs: canvas (already used by the bot), gifencoder, omggif.
const fs = require("fs");
const path = require("path");
const axios = require("axios");

const TOKEN = "6628568379%7Cc1e620fa708a1d5696fb991c1bde5662";
const LOVE_GIF = path.join(__dirname, "..", "Shayan", "commands", "cache", "assets", "imgur_vcydK3t.gif");

// Profile photo. The old Graph link gives a grey "no photo" picture for many people
// (a tiny file from static.xx.fbcdn.net/rsrc.php), so then use the photo Messenger itself shows instead.
async function getAvatar(api, uid) {
    let graph = null;
    try {
        const r = await axios.get(`https://graph.facebook.com/${uid}/picture?height=512&width=512&access_token=${TOKEN}`, { responseType: "arraybuffer", timeout: 20000 });
        graph = Buffer.from(r.data);
        const finalUrl = (r.request && r.request.res && r.request.res.responseUrl) || "";
        if (!/rsrc\.php/.test(finalUrl) && graph.length > 2000) return graph; // a real photo
    } catch (e) { }
    try {
        const u = (await api.getUserInfo(uid))[uid] || {};
        if (u.thumbSrc) return Buffer.from((await axios.get(u.thumbSrc, { responseType: "arraybuffer", timeout: 20000 })).data);
    } catch (e) { }
    if (graph) return graph; // grey "no photo" picture is still better than nothing
    throw new Error(`no profile photo for ${uid}`);
}

/**
 * @param {Buffer} leftAvatar  photo of the person who used the command
 * @param {Buffer} rightAvatar photo of their partner
 * @param {string} outPath     where to write the .gif
 */
async function makePairGif(leftAvatar, rightAvatar, outPath, gifPath = LOVE_GIF) {
    const { createCanvas, loadImage } = require("canvas");
    const GIFEncoder = require("gifencoder");
    const { GifReader } = require("omggif");

    const S = 300, PAD = 20, W = S * 3 + PAD * 4, H = S + PAD * 2;

    // fixed background with the two round photos
    const base = createCanvas(W, H), b = base.getContext("2d");
    const grad = b.createLinearGradient(0, 0, W, H);
    grad.addColorStop(0, "#ffdde1"); grad.addColorStop(1, "#ee9ca7");
    b.fillStyle = grad; b.fillRect(0, 0, W, H);
    const drawRound = (img, x) => {
        b.save();
        b.beginPath(); b.arc(x + S / 2, PAD + S / 2, S / 2 - 6, 0, Math.PI * 2); b.closePath(); b.clip();
        b.drawImage(img, x, PAD, S, S);
        b.restore();
        b.lineWidth = 8; b.strokeStyle = "#ffffff";
        b.beginPath(); b.arc(x + S / 2, PAD + S / 2, S / 2 - 6, 0, Math.PI * 2); b.stroke();
    };
    drawRound(await loadImage(leftAvatar), PAD);
    drawRound(await loadImage(rightAvatar), PAD * 3 + S * 2);

    // read the love GIF frame by frame
    const reader = new GifReader(fs.readFileSync(gifPath));
    const gw = reader.width, gh = reader.height;
    const pixels = new Uint8ClampedArray(gw * gh * 4);
    const frameCanvas = createCanvas(gw, gh), fctx = frameCanvas.getContext("2d");

    const out = createCanvas(W, H), o = out.getContext("2d");
    const enc = new GIFEncoder(W, H);
    const stream = enc.createReadStream();
    const chunks = [];
    stream.on("data", c => chunks.push(c));
    const done = new Promise(r => stream.on("end", r));
    enc.start(); enc.setRepeat(0); enc.setQuality(10);

    const frames = Math.min(reader.numFrames(), 60);
    let prev = null;
    for (let i = 0; i < frames; i++) {
        const info = reader.frameInfo(i);
        if (prev && prev.disposal == 2) { // "restore to background": clear the last frame's area
            for (let y = prev.y; y < prev.y + prev.height; y++) pixels.fill(0, (y * gw + prev.x) * 4, (y * gw + prev.x + prev.width) * 4);
        }
        reader.decodeAndBlitFrameRGBA(i, pixels);
        fctx.putImageData(new (require("canvas").ImageData)(new Uint8ClampedArray(pixels), gw, gh), 0, 0);

        o.drawImage(base, 0, 0);
        const scale = Math.min(S / gw, S / gh), dw = gw * scale, dh = gh * scale;
        o.drawImage(frameCanvas, PAD * 2 + S + (S - dw) / 2, PAD + (S - dh) / 2, dw, dh);
        enc.setDelay(Math.max(20, (info.delay || 10) * 10));
        enc.addFrame(o);
        prev = info;
    }
    enc.finish();
    await done;
    fs.writeFileSync(outPath, Buffer.concat(chunks));
    return outPath;
}

// Save a photo as a (still) GIF. The message library sends all photos first and all GIFs after them,
// so to keep  [ photo ] [ love GIF ] [ photo ]  in order, the photos must be GIFs too.
async function photoToGif(photo, outPath, size = 512) {
    const { createCanvas, loadImage } = require("canvas");
    const GIFEncoder = require("gifencoder");
    const img = await loadImage(photo);
    const c = createCanvas(size, size), ctx = c.getContext("2d");
    // fill the square like the profile photo (crop the middle if it isn't square)
    const s = Math.min(img.width, img.height);
    ctx.drawImage(img, (img.width - s) / 2, (img.height - s) / 2, s, s, 0, 0, size, size);
    const enc = new GIFEncoder(size, size);
    const stream = enc.createReadStream(), chunks = [];
    stream.on("data", d => chunks.push(d));
    const done = new Promise(r => stream.on("end", r));
    enc.start(); enc.setRepeat(-1); enc.setQuality(5);
    enc.addFrame(ctx);
    enc.finish();
    await done;
    fs.writeFileSync(outPath, Buffer.concat(chunks));
    return outPath;
}

module.exports = { makePairGif, photoToGif, getAvatar, LOVE_GIF };
