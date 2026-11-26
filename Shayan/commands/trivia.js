module.exports.config = {
  name: "trivia",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
  description: "Quiz game with points and a group leaderboard",
  commandCategory: "Game",
  usages: "| top | me   (reply to the question with A, B, C or D)",
  cooldowns: 5
};

const store = require("../../utils/store.js");
const gemini = require("../../utils/gemini.js");
const ANSWER_TIME = 30 * 1000;
const POINTS = 10;
const LETTERS = ["A", "B", "C", "D"];
const active = global.__triviaActive || (global.__triviaActive = new Map()); // threadID -> question
const recent = global.__triviaRecent || (global.__triviaRecent = new Map()); // threadID -> recently asked indexes

// [category, question, correct answer, wrong 1, wrong 2, wrong 3]
const BANK = [
  ["Islam", "Quran Pak mein kitni surahs hain?", "114", "110", "120", "99"],
  ["Islam", "Islam ke kitne arkan (pillars) hain?", "5", "4", "6", "7"],
  ["Islam", "Pehli wahi kis ghaar mein nazil hui?", "Ghar-e-Hira", "Ghar-e-Saur", "Ghar-e-Kahf", "Jabal-e-Noor ka maidan"],
  ["Islam", "Quran ki sab se lambi surah kaunsi hai?", "Al-Baqarah", "Al-Imran", "An-Nisa", "Yaseen"],
  ["Islam", "Quran ki sab se chhoti surah kaunsi hai?", "Al-Kawthar", "Al-Ikhlas", "An-Nas", "Al-Asr"],
  ["Islam", "Rozay kis Islami mahine mein farz hain?", "Ramzan", "Shaban", "Muharram", "Rajab"],
  ["Islam", "Din mein kitni farz namazain hain?", "5", "3", "4", "6"],
  ["Islam", "Hajj kis Islami mahine mein hota hai?", "Zul-Hijjah", "Ramzan", "Shawwal", "Muharram"],
  ["Islam", "Nabi Pak ﷺ ki wiladat kis sheher mein hui?", "Makkah", "Madina", "Taif", "Jerusalem"],
  ["Islam", "Hijrat Makkah se kis sheher ki taraf hui?", "Madina", "Taif", "Jeddah", "Damascus"],
  ["Pakistan", "Pakistan kab azad hua?", "14 August 1947", "15 August 1947", "23 March 1940", "14 August 1948"],
  ["Pakistan", "Pakistan ka darul hukumat (capital) kaunsa hai?", "Islamabad", "Karachi", "Lahore", "Rawalpindi"],
  ["Pakistan", "Pakistan ka qaumi tarana kis ne likha?", "Hafeez Jalandhari", "Allama Iqbal", "Faiz Ahmed Faiz", "Ahmad Faraz"],
  ["Pakistan", "Pakistan ki sab se oonchi choti kaunsi hai?", "K2", "Nanga Parbat", "Rakaposhi", "Tirich Mir"],
  ["Pakistan", "Pakistan ka qaumi phool kaunsa hai?", "Chambeli (Jasmine)", "Gulab", "Sooraj Mukhi", "Kanwal"],
  ["Pakistan", "Abaadi ke lihaz se Pakistan ka sab se bara sheher?", "Karachi", "Lahore", "Faisalabad", "Islamabad"],
  ["Pakistan", "Quaid-e-Azam ka pura naam kya hai?", "Muhammad Ali Jinnah", "Liaquat Ali Khan", "Muhammad Iqbal", "Sir Syed Ahmad Khan"],
  ["Pakistan", "Pakistan ki qaumi zaban kaunsi hai?", "Urdu", "Punjabi", "English", "Sindhi"],
  ["Pakistan", "Allama Iqbal ko kya kaha jata hai?", "Shayar-e-Mashriq", "Bulbul-e-Pakistan", "Quaid-e-Millat", "Baba-e-Qaum"],
  ["Pakistan", "Pakistan ka qaumi janwar kaunsa hai?", "Markhor", "Sher", "Cheetah", "Oont"],
  ["Pakistan", "Pakistan ka qaumi khel kaunsa hai?", "Hockey", "Cricket", "Squash", "Kabaddi"],
  ["Pakistan", "Pakistan ka sab se bara darya kaunsa hai?", "Sindh (Indus)", "Jhelum", "Chenab", "Ravi"],
  ["Pakistan", "Minar-e-Pakistan kis sheher mein hai?", "Lahore", "Karachi", "Islamabad", "Multan"],
  ["Pakistan", "Pakistan ke kitne sooba (provinces) hain?", "4", "3", "5", "6"],
  ["Cricket", "Pakistan ne cricket World Cup kis saal jeeta?", "1992", "1996", "1987", "1999"],
  ["Cricket", "1992 World Cup mein Pakistan ke captain kaun the?", "Imran Khan", "Javed Miandad", "Wasim Akram", "Inzamam-ul-Haq"],
  ["Cricket", "Pakistan ne Champions Trophy kis saal jeeti?", "2017", "2013", "2009", "2021"],
  ["Cricket", "Pakistan ne T20 World Cup kis saal jeeta?", "2009", "2007", "2012", "2022"],
  ["Cricket", "Ek over mein kitni legal balls hoti hain?", "6", "5", "8", "4"],
  ["Cricket", "'Rawalpindi Express' kise kaha jata hai?", "Shoaib Akhtar", "Wasim Akram", "Waqar Younis", "Mohammad Amir"],
  ["GK", "Duniya ka sab se bara samandar kaunsa hai?", "Pacific Ocean", "Atlantic Ocean", "Indian Ocean", "Arctic Ocean"],
  ["Science", "Ek baligh insaan ke jism mein kitni haddiyan hoti hain?", "206", "201", "212", "196"],
  ["Science", "Paani ka chemical formula kya hai?", "H2O", "CO2", "O2", "NaCl"],
  ["Science", "Suraj ke sab se qareeb planet kaunsa hai?", "Mercury (Utarid)", "Venus (Zohra)", "Mars (Mirrikh)", "Earth"],
  ["Science", "Hamare nizam-e-shamsi ka sab se bara planet?", "Jupiter (Mushtari)", "Saturn (Zuhal)", "Neptune", "Earth"],
  ["Science", "'Red Planet' kise kaha jata hai?", "Mars", "Jupiter", "Venus", "Mercury"],
  ["GK", "Aam saal (leap year nahi) mein kitne din hote hain?", "365", "366", "364", "360"],
  ["GK", "Duniya ka sab se lamba darya kaunsa mana jata hai?", "Nile", "Amazon", "Sindh", "Ganga"],
  ["GK", "Duniya ka sab se bara garam registan (desert)?", "Sahara", "Thar", "Gobi", "Arabian"],
  ["Science", "Insaani dil mein kitne khane (chambers) hote hain?", "4", "2", "3", "6"],
  ["Science", "Paude photosynthesis mein kaunsi gas lete hain?", "Carbon dioxide", "Oxygen", "Nitrogen", "Hydrogen"],
  ["Tech", "Computer ka 'dimagh' kis hisse ko kaha jata hai?", "CPU", "Monitor", "Keyboard", "Mouse"],
  ["GK", "1 kilometer mein kitne meter hote hain?", "1000", "100", "10000", "500"],
  ["Science", "Qaus-e-Quzah (rainbow) mein kitne rang hote hain?", "7", "5", "6", "8"],
  ["GK", "Zameen par sab se tez daurne wala janwar?", "Cheetah", "Sher", "Ghora", "Hiran"],
  ["GK", "Mount Everest kis pahari silsile mein hai?", "Himalaya", "Karakoram", "Hindu Kush", "Alps"],
  ["GK", "Japan ki currency kya hai?", "Yen", "Yuan", "Won", "Ringgit"],
  ["GK", "Saudi Arabia ka darul hukumat kaunsa hai?", "Riyadh", "Jeddah", "Makkah", "Madina"],
  ["GK", "Raqbe (area) ke lihaz se duniya ka sab se bara mulk?", "Russia", "Canada", "China", "USA"],
  ["GK", "Ek hafte mein kitne din hote hain?", "7", "5", "6", "8"]
];

function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }

function fromBank(threadID) {
  const used = recent.get(threadID) || [];
  const choices = BANK.map((q, i) => i).filter(i => !used.includes(i));
  const pick = choices[Math.floor(Math.random() * choices.length)];
  recent.set(threadID, [...used, pick].slice(-Math.floor(BANK.length * 0.7)));
  const [category, question, right, ...wrong] = BANK[pick];
  const options = shuffle([right, ...wrong]);
  return { category, question, options, answer: options.indexOf(right) };
}

// A fresh question from Gemini (when the AI key works); null if not available
async function fromAI() {
  if (Math.random() < 0.5) return null; // mix AI and bank questions
  const res = await gemini.ask({
    json: true, temperature: 1,
    system: "You write fun, correct multiple-choice quiz questions in Roman Urdu for a Pakistani Messenger group. Topics: Islam (respectful), Pakistan, cricket, science, general knowledge. Only ask facts you are completely sure about.",
    messages: [{ role: "user", text: 'Give one question as JSON: {"category": "...", "question": "...", "options": ["...","...","...","..."], "answer": <index 0-3 of the correct option>}' }]
  });
  if (!res.text) return null;
  try {
    const q = JSON.parse(res.text.replace(/^```(json)?|```$/g, "").trim());
    if (typeof q.question === "string" && Array.isArray(q.options) && q.options.length === 4 && Number.isInteger(q.answer) && q.answer >= 0 && q.answer < 4)
      return { category: String(q.category || "AI"), question: q.question, options: q.options.map(String), answer: q.answer, ai: true };
  } catch (e) { }
  return null;
}

function scores() { return store.load("trivia", {}); }

async function nameOf(Users, id) { try { return (await Users.getNameUser(id)) || "Someone"; } catch (e) { return "Someone"; } }

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;
  const sub = (args[0] || "").toLowerCase();
  const tid = String(threadID);

  if (sub == "top") {
    const board = Object.entries(scores()[tid] || {}).sort((a, b) => b[1] - a[1]).slice(0, 10);
    if (!board.length) return api.sendMessage("🏆 Nobody has any points yet. Start: " + global.config.PREFIX + "trivia", threadID, messageID);
    const medals = ["🥇", "🥈", "🥉"];
    let msg = "🏆 TRIVIA LEADERBOARD 🏆\n";
    for (let i = 0; i < board.length; i++) msg += `\n${medals[i] || `${i + 1}.`} ${await nameOf(Users, board[i][0])} — ${board[i][1]} points`;
    return api.sendMessage(msg, threadID, messageID);
  }
  if (sub == "me") {
    const group = scores()[tid] || {};
    const mine = group[String(senderID)] || 0;
    const rank = Object.values(group).filter(p => p > mine).length + 1;
    return api.sendMessage(`🧠 Your trivia points: ${mine}${mine ? ` (rank #${rank})` : ""}`, threadID, messageID);
  }

  if (active.has(tid)) return api.sendMessage("⏳ Answer the current question first! (reply to it with A/B/C/D)", threadID, messageID);
  active.set(tid, { pending: true }); // reserve while the question is prepared

  const q = (await fromAI()) || fromBank(tid);
  q.answered = new Set();
  const text = `🧠 TRIVIA • ${q.category}\n\n❓ ${q.question}\n\n` + q.options.map((o, i) => `${LETTERS[i]}) ${o}`).join("\n") +
    `\n\n⏳ ${ANSWER_TIME / 1000} sec! Reply to this message with A, B, C or D. First correct answer = +${POINTS} points`;

  return api.sendMessage(text, threadID, (err, info) => {
    if (err || !info) return active.delete(tid);
    q.messageID = info.messageID;
    q.timer = setTimeout(() => {
      if (active.get(tid) !== q) return;
      active.delete(tid);
      api.sendMessage(`⌛ Time's up! The correct answer was: ${LETTERS[q.answer]}) ${q.options[q.answer]}`, threadID);
    }, ANSWER_TIME);
    active.set(tid, q);
    global.client.handleReply.push({ name: module.exports.config.name, messageID: info.messageID, author: senderID, type: "answer" });
  });
};

module.exports.handleReply = async function ({ api, event, Users, handleReply }) {
  const { threadID, messageID, senderID, body } = event;
  const tid = String(threadID);
  const q = active.get(tid);
  const cleanup = () => { const list = global.client.handleReply; const i = list.indexOf(handleReply); if (i >= 0) list.splice(i, 1); };
  if (!q || q.pending || q.messageID !== handleReply.messageID) return cleanup(); // question already over

  const m = String(body || "").trim().match(/^\(?([abcd1-4])\)?\b/i);
  if (!m) return; // not an answer
  const choice = /[1-4]/.test(m[1]) ? Number(m[1]) - 1 : LETTERS.indexOf(m[1].toUpperCase());
  if (q.answered.has(String(senderID))) return api.sendMessage("✋ You already answered, give others a chance!", threadID, messageID);
  q.answered.add(String(senderID));

  if (choice !== q.answer) return api.setMessageReaction("❌", messageID, () => { }, true);

  clearTimeout(q.timer);
  active.delete(tid);
  cleanup();
  const all = scores();
  all[tid] = all[tid] || {};
  all[tid][String(senderID)] = (all[tid][String(senderID)] || 0) + POINTS;
  store.save("trivia");
  api.setMessageReaction("✅", messageID, () => { }, true);
  return api.sendMessage(`🎉 Correct, ${await nameOf(Users, senderID)}! ${LETTERS[q.answer]}) ${q.options[q.answer]}\n+${POINTS} points (total: ${all[tid][String(senderID)]})\nNext question: ${global.config.PREFIX}trivia`, threadID, messageID);
};
