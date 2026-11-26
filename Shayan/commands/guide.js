module.exports.config = {
  name: "guide",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
  description: "Clean help menu: categories, commands in a category, or details of one command",
  commandCategory: "Help",
  usages: "| <category> | <command>",
  cooldowns: 3
};

// messy category names in the old commands -> one clean name
const MAP = {
  "noprefix": "No Prefix", "no prefix": "No Prefix",
  "image": "Images", "images": "Images", "random-img": "Images", "edit-img": "Images", "banner": "Images", "picture": "Images", "pictures": "Images", "photo": "Images", "img": "Images", "love": "Love", "tình yêu": "Love",
  "media": "Media", "video": "Media", "music": "Media", "audio": "Media",
  "game": "Games", "games": "Games", "fun": "Fun", "entertainment": "Fun", "giải trí": "Fun",
  "admin": "Admin", "for admin": "Admin", "system": "Admin", "config": "Admin",
  "group": "Group", "box chat": "Group", "box": "Group",
  "tool": "Tools", "tools": "Tools", "utility": "Tools", "utilities": "Tools", "other": "Tools",
  "ai": "AI", "chat same sim": "AI",
  "economy": "Economy", "money": "Economy", "help": "Help", "info": "Info", "information": "Info",
  "edit-image": "Images", "png": "Images", "anime": "Images", "memes": "Fun", "vtuber": "Fun", "wargroup": "Fun",
  "the group": "Group", "admin-bot system": "Admin", "general": "Tools", "study": "Tools", "...": "Other"
};
const ICONS = { "AI": "🤖", "Games": "🎮", "Fun": "😂", "Images": "🖼️", "Love": "💞", "Media": "🎵", "Group": "👥", "Tools": "🛠️", "Admin": "🔒", "Economy": "💰", "No Prefix": "💬", "Help": "📘", "Info": "ℹ️", "Other": "📦" };
const NEW = ["joker", "trivia", "remind", "stats", "guide"]; // highlighted on the main page

function category(cmd) {
  const raw = String((cmd.config && cmd.config.commandCategory) || "").trim();
  const key = raw.toLowerCase();
  if (MAP[key]) return MAP[key];
  if (/nsfw|18/.test(key)) return "18+";
  return raw ? raw[0].toUpperCase() + raw.slice(1).toLowerCase() : "Other";
}

function catalog() {
  const disabled = (global.config.commandDisabled || []).map(f => String(f).replace(/\.js$/, "").toLowerCase());
  const cats = {};
  for (const [name, cmd] of global.client.commands) {
    if (disabled.includes(String(name).toLowerCase())) continue;
    const c = category(cmd);
    (cats[c] = cats[c] || []).push(cmd);
  }
  // tiny categories (1 command) go into "Other"
  for (const c of Object.keys(cats)) if (cats[c].length < 2 && c !== "Other" && !ICONS[c]) { (cats.Other = cats.Other || []).push(...cats[c]); delete cats[c]; }
  for (const c of Object.keys(cats)) cats[c].sort((a, b) => a.config.name.localeCompare(b.config.name));
  return cats;
}

const who = (p) => p >= 2 ? "🔒 Bot admin" : p == 1 ? "👮 Group admin" : "👤 Everyone";

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID } = event;
  const prefix = global.config.PREFIX;
  const q = args.join(" ").trim().toLowerCase();
  const cats = catalog();

  if (!q) {
    const names = Object.keys(cats).sort((a, b) => cats[b].length - cats[a].length);
    let msg = `📘 ${global.config.BOTNAME || "BOT"} — GUIDE\n\n✨ New: ${NEW.map(n => prefix + n).join("  ")}\n\n`;
    msg += names.map(c => `${ICONS[c] || "📁"} ${c} (${cats[c].length})`).join("\n");
    msg += `\n\n👉 ${prefix}guide <category>  e.g. ${prefix}guide games\n👉 ${prefix}guide <command>  e.g. ${prefix}guide trivia\n🔣 Prefix: ${prefix}`;
    return api.sendMessage(msg, threadID, messageID);
  }

  // a command?
  const cmd = global.client.commands.get(q) || [...global.client.commands.values()].find(c => (c.config.aliases || []).includes(q));
  if (cmd && !Object.keys(cats).some(c => c.toLowerCase() == q)) {
    const c = cmd.config;
    return api.sendMessage(
      `📘 ${prefix}${c.name}\n\n📝 ${c.description || "No description"}\n⌨️ Use: ${prefix}${c.name} ${c.usages || ""}\n📁 Category: ${category(cmd)}\n${who(c.hasPermssion || 0)}\n⏱️ Cooldown: ${c.cooldowns || 1}s`,
      threadID, messageID);
  }

  // a category?
  const catName = Object.keys(cats).find(c => c.toLowerCase() == q) || Object.keys(cats).find(c => c.toLowerCase().startsWith(q));
  if (catName) {
    const lines = cats[catName].map(c => `${(c.config.hasPermssion || 0) >= 2 ? "🔒 " : "• "}${prefix}${c.config.name}${c.config.description ? " — " + String(c.config.description).slice(0, 45) : ""}`);
    // Messenger messages have a length limit: split long categories into parts
    const parts = [];
    let cur = `${ICONS[catName] || "📁"} ${catName.toUpperCase()} (${lines.length})\n`;
    for (const l of lines) { if ((cur + "\n" + l).length > 1800) { parts.push(cur); cur = ""; } cur += "\n" + l; }
    parts.push(cur + `\n\nDetails: ${prefix}guide <command>`);
    for (const p of parts) await api.sendMessage(p, threadID, messageID);
    return;
  }
  return api.sendMessage(`❓ No category or command called "${q}".\nSee everything: ${prefix}guide`, threadID, messageID);
};
