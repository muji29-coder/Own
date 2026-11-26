module.exports.config = {
  name: "inboxchat",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
  description: "Automatic friendly AI replies when someone messages the bot in its inbox",
  commandCategory: "AI",
  usages: "(automatic in the bot's inbox) | status",
  cooldowns: 3
};

// Turn on/off: config.json -> "inboxChat": true / false  (also needs "allowInbox": true)
const enabled = () => global.config.inboxChat !== false && global.config.allowInbox !== false;

module.exports.handleEvent = async function ({ api, event, Users }) {
  if (!enabled()) return;
  const { threadID, senderID, body } = event;
  // only private chats (inbox), only text, never the bot itself
  if (event.isGroup || String(senderID) !== String(threadID) || !body || String(senderID) == String(api.getCurrentUserID())) return;
  if (body.startsWith(global.config.PREFIX)) return;                       // a command: handled by the command system
  if (global.manhG && global.manhG.simsimi && global.manhG.simsimi.has(String(threadID))) return; // "#sim on" in this chat
  // a reply to a bot message that a command is waiting for (trivia answer, joker reply...): let that command answer
  if (event.messageReply && global.client.handleReply.some(h => h.messageID == event.messageReply.messageID)) return;

  const commands = global.client.commands;
  const joker = commands.get("joker");
  if (joker && joker._talk) {
    const answered = await joker._talk({ api, event, Users, text: body, quietOnError: true });
    if (answered !== false) return;
  }
  // AI not available: SimSimi
  const sim = commands.get("sim");
  if (sim && sim._getReply) {
    const r = await sim._getReply(body);
    if (r && r.answer) return api.sendMessage(r.answer, threadID, event.messageID);
  }
};

module.exports.run = async function ({ api, event }) {
  const p = global.config.PREFIX;
  return api.sendMessage(
    `💬 Inbox chat: ${enabled() ? "ON ✅" : "OFF ❌"}\n\nWhen someone messages the bot in its inbox, the bot replies by itself with AI.\nTurn on/off: config.json → "inboxChat": true / false\nCommands also work in the inbox, e.g. ${p}guide`,
    event.threadID, event.messageID);
};
