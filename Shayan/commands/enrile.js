module.exports.config = {
    
	name: "enrile",
	
	version: "1.0.1",
	hasPermssion: 0,
	credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
	description: "Write your text on a whiteboard",
	commandCategory: "edit-img",
	usages: "[text]",
	cooldowns: 10,
	dependencies: {
		"canvas":"",
		 "axios":"",
		 "fs-extra":""
	}
};

module.exports.wrapText = (ctx, text, maxWidth) => {
	return new Promise(resolve => {
		if (ctx.measureText(text).width < maxWidth) return resolve([text]);
		if (ctx.measureText('W').width > maxWidth) return resolve(null);
		const words = text.split(' ');
		const lines = [];
		let line = '';
		while (words.length > 0) {
			let split = false;
			while (ctx.measureText(words[0]).width >= maxWidth) {
				const temp = words[0];
				words[0] = temp.slice(0, -1);
				if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
				else {
					split = true;
					words.splice(1, 0, temp.slice(-1));
				}
			}
			if (ctx.measureText(`${line}${words[0]}`).width < maxWidth) line += `${words.shift()} `;
			else {
				lines.push(line.trim());
				line = '';
			}
			if (words.length === 0) lines.push(line.trim());
		}
		return resolve(lines);
	});
} 

module.exports.run = async function({ api, event, args }) {
	let { senderID, threadID, messageID } = event;
	const { createCanvas } = require("canvas");
	const fs = global.nodemodule["fs-extra"];
	// unique file per request so two people can use the command at the same time
	let pathImg = __dirname + `/cache/enrile_${Date.now()}_${Math.floor(Math.random() * 1e6)}.png`;
	var text = args.join(" ");
	if (!text) return api.sendMessage("Enter the content of the comment on the board", threadID, messageID);
	try {
		// The board is drawn here (the old template image was deleted from imgur)
		const W = 1000, H = 700;
		let canvas = createCanvas(W, H);
		let ctx = canvas.getContext("2d");
		const wall = ctx.createLinearGradient(0, 0, 0, H);
		wall.addColorStop(0, "#d9cbb3");
		wall.addColorStop(1, "#b9a587");
		ctx.fillStyle = wall;
		ctx.fillRect(0, 0, W, H);
		// wooden frame
		ctx.fillStyle = "#7a4a21";
		ctx.fillRect(60, 50, W - 120, H - 140);
		ctx.fillStyle = "#a0662f";
		ctx.fillRect(72, 62, W - 144, H - 164);
		// white board
		ctx.fillStyle = "#fbfbf8";
		ctx.fillRect(88, 78, W - 176, H - 196);
		// marker tray
		ctx.fillStyle = "#6b3f1b";
		ctx.fillRect(140, H - 92, W - 280, 16);
		ctx.fillStyle = "#1565c0";
		ctx.fillRect(420, H - 104, 90, 12);
		ctx.fillStyle = "#c62828";
		ctx.fillRect(530, H - 104, 90, 12);

		// text, as big as fits
		ctx.fillStyle = "#1a1a1a";
		ctx.textAlign = "center";
		ctx.textBaseline = "middle";
		const maxW = W - 240, maxH = H - 260;
		let fontSize = 90, lines;
		do {
			ctx.font = `bold ${fontSize}px sans-serif`;
			lines = (await this.wrapText(ctx, text, maxW)) || [text];
			if (lines.length * fontSize * 1.2 <= maxH) break;
			fontSize -= 4;
		} while (fontSize > 18);
		const startY = 78 + (H - 196) / 2 - ((lines.length - 1) * fontSize * 1.2) / 2;
		lines.forEach((l, n) => ctx.fillText(l, W / 2, startY + n * fontSize * 1.2));

		fs.writeFileSync(pathImg, canvas.toBuffer());
		return api.sendMessage({ attachment: fs.createReadStream(pathImg) }, threadID, () => { try { fs.unlinkSync(pathImg); } catch (e) {} }, messageID);
	} catch (e) {
		try { fs.unlinkSync(pathImg); } catch (err) {}
		console.log(`[ enrile ] Failed: ${e.message}`);
		return api.sendMessage("Could not make the picture, please try again later.", threadID, messageID);
	}
}
