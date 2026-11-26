module.exports.config = {
  name: "joker",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
  description: "Smart AI chat that remembers the group's conversation (Gemini)",
  commandCategory: "AI",
  usages: "<message> | reset   (or reply to Joker's message to keep talking)",
  cooldowns: 3
};

const gemini = require("../../utils/gemini.js");
const MAX_TURNS = 20;                     // remembered messages per group
const FORGET_AFTER = 2 * 60 * 60 * 1000;  // forget a conversation after 2 hours of silence
// Conversations are kept in memory only (not saved anywhere) for privacy.
const memory = global.__jokerMemory || (global.__jokerMemory = new Map());

function systemPrompt(groupName, inbox) {
  const bot = (global.config && global.config.BOTNAME) || "Joker";
  const where = inbox
    ? `in a private one-to-one Facebook Messenger chat (the person messaged you directly). Be warm and welcoming; if they seem new, you can briefly mention they can type ${global.config.PREFIX}guide to see what you can do`
    : `in a Facebook Messenger group${groupName ? ` called "${groupName}"` : ""}`;
  return `You are ${bot}, a friendly, witty chat buddy ${where}.
- Each user message starts with the sender's name, like "Ali: ...". Talk to people by name when it fits.
- Reply in the same language and script the person used (often Roman Urdu, also English or Urdu). Roman Urdu means Urdu written in English letters ("kya haal hai") - answer that in Roman Urdu too, never switch to Urdu/Arabic script unless they wrote in it.
- Keep replies short and natural (1-3 sentences) unless someone asks for detail or an explanation.
- You can talk about ANY topic people bring up: jokes, roasting friends in a fun way, gossip, love life advice, studies, news, politics, cricket, movies, opinions, deen, anything. Don't lecture or refuse normal topics.
- The ONLY thing you never do is 18+ content: nothing sexual or explicit, no nudity, no sexual jokes. If someone asks, refuse in one short, light line and change the topic.
- Always be respectful about Islam and every religion.
- If you don't know something, say so honestly instead of making it up.
- Do not start your reply with your own name.`;
}

// returns true if an answer was sent, false if the AI could not answer
async function talk({ api, event, Users, text, quietOnError = false }) {
  const inbox = !event.isGroup && String(event.senderID) == String(event.threadID);
  const { threadID, messageID, senderID } = event;
  let name = "Someone";
  try { name = (await Users.getNameUser(senderID)) || name; } catch (e) { }
  let groupName = "";
  try { const info = global.data.threadInfo.get(String(threadID)); groupName = (info && info.threadName) || ""; } catch (e) { }

  let conv = memory.get(String(threadID));
  if (!conv || Date.now() - conv.updated > FORGET_AFTER) conv = { turns: [], updated: Date.now() };
  conv.turns.push({ role: "user", text: `${name}: ${text}` });

  api.setMessageReaction("⌛", messageID, () => { }, true);
  const res = await gemini.ask({ system: systemPrompt(groupName, inbox), messages: conv.turns });
  if (!res.text) {
    conv.turns.pop();
    api.setMessageReaction("", messageID, () => { }, true);
    if (quietOnError) return false; // caller has its own backup (e.g. inbox chat -> SimSimi)
    const why = res.error == "nokey" ? "AI key is not set."
      : res.error == "busy" ? "AI is busy right now, please try again in a little while."
      : res.error == "billing" ? "AI keys need billing/credits (Gemini / OpenAI). Admin: add credits or a new key."
      : res.error == "badkey" ? "AI key is not working. Admin: check the Gemini / OpenAI keys."
      : res.error == "limit" ? "AI limit reached for now, try again later."
      : "AI is not responding right now, try again later.";
    return api.sendMessage(`🤖 ${why}`, threadID, messageID);
  }
  const answer = res.text.slice(0, 1800);
  conv.turns.push({ role: "model", text: answer });
  conv.turns = conv.turns.slice(-MAX_TURNS);
  conv.updated = Date.now();
  memory.set(String(threadID), conv);
  api.setMessageReaction("", messageID, () => { }, true);

  return api.sendMessage(answer, threadID, (err, info) => {
    if (err || !info) return;
    // replying to this message continues the chat without typing the command again
    const list = global.client.handleReply;
    list.push({ name: module.exports.config.name, messageID: info.messageID, author: senderID, type: "chat" });
    // keep only the last 200 Joker messages answerable (the list would otherwise grow forever)
    const mine = list.filter(h => h.name === module.exports.config.name);
    if (mine.length > 200) list.splice(list.indexOf(mine[0]), 1);
  }, messageID);
}

module.exports.run = async function ({ api, event, args, Users }) {
  const text = args.join(" ").trim();
  const prefix = global.config.PREFIX;
  if (!text) return api.sendMessage(`🤖 Ask me anything!\nExample: ${prefix}joker what's the plan today?\n💬 Reply to my message to keep chatting.\n🧹 ${prefix}joker reset = forget the old conversation`, event.threadID, event.messageID);
  if (/^(reset|clear|bhool\s*jao)$/i.test(text)) {
    memory.delete(String(event.threadID));
    return api.sendMessage("🧹 Done, I forgot this chat's old conversation!", event.threadID, event.messageID);
  }
  return talk({ api, event, Users, text });
};

module.exports.handleReply = async function ({ api, event, Users, handleReply }) {
  if (handleReply.type !== "chat" || !event.body) return;
  // anyone in the group can reply to Joker and continue the conversation
  return talk({ api, event, Users, text: event.body });
};

// used by inboxchat.js (automatic AI replies in the bot's inbox)
module.exports._talk = talk;
