module.exports.config = {
  name: "remind",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
  description: "Reminders: after some time, at a clock time, or every day",
  commandCategory: "Tools",
  usages: "<10m|2h|5pm|17:30|daily 5am> <text> | list | del <number>",
  cooldowns: 3
};

const store = require("../../utils/store.js");
const tz = require("../../utils/tz.js");
const MAX_PER_USER = 10, MAX_PER_GROUP = 30;
const LATE_LIMIT = 6 * 60 * 60 * 1000; // a one-time reminder missed by more than 6h (bot was off) is dropped

const list = () => store.load("reminders", []);
const UNITS = { s: 1000, sec: 1000, m: 60000, min: 60000, mins: 60000, minute: 60000, minutes: 60000, h: 3600000, hr: 3600000, hrs: 3600000, hour: 3600000, hours: 3600000, d: 86400000, day: 86400000, days: 86400000 };

// "5pm" / "5:30 pm" / "17:30" -> {hour, minute}; null if not a clock time
function parseClock(s) {
  const m = String(s).trim().toLowerCase().match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)?$/);
  if (!m) return null;
  let hour = +m[1], minute = +(m[2] || 0);
  if (!m[2] && !m[3]) return null; // a bare number like "5" is not a time
  if (m[3]) { if (hour < 1 || hour > 12) return null; hour = hour % 12 + (m[3] === "pm" ? 12 : 0); }
  if (hour > 23 || minute > 59) return null;
  return { hour, minute };
}

// args -> { at, daily, text } or { error }
function parse(args) {
  let words = args.slice();
  let daily = false;
  if (/^(daily|roz|rozana|everyday)$/i.test(words[0] || "")) { daily = true; words.shift(); }
  // allow "5 pm" / "5:30 pm" written with a space
  if (words[1] && /^(am|pm)$/i.test(words[1])) words = [words[0] + words[1], ...words.slice(2)];
  // allow "2 h" / "10 min" written with a space
  else if (/^\d+$/.test(words[0] || "") && words[1] && UNITS[words[1].toLowerCase()]) words = [words[0] + words[1], ...words.slice(2)];
  const first = words.shift() || "";
  const text = words.join(" ").trim();
  if (!text) return { error: "notext" };

  const clock = parseClock(first);
  if (clock) {
    const at = tz.nextAt(clock.hour, clock.minute);
    return { at, text, daily: daily ? `${String(clock.hour).padStart(2, "0")}:${String(clock.minute).padStart(2, "0")}` : null };
  }
  if (daily) return { error: "dailyclock" };
  const rel = first.toLowerCase().match(/^(\d+)\s*([a-z]+)$/);
  if (rel && UNITS[rel[2]]) {
    const ms = +rel[1] * UNITS[rel[2]];
    if (ms < 30000) return { error: "tooshort" };
    if (ms > 30 * 86400000) return { error: "toolong" };
    return { at: Date.now() + ms, text, daily: null };
  }
  return { error: "format" };
}

function when(r) {
  return r.daily ? `daily at ${tz.clock(r.at)}` : `${tz.clock(r.at)}${r.at - Date.now() > 20 * 3600000 ? " (" + new Date(r.at).toLocaleDateString("en-GB", { timeZone: tz.zone(), day: "numeric", month: "short" }) + ")" : ""}`;
}

function help(prefix) {
  return `⏰ REMINDERS\n\n${prefix}remind 10m drink tea\n${prefix}remind 2h homework\n${prefix}remind 5pm namaz\n${prefix}remind 17:30 meeting\n${prefix}remind daily 5am Fajr prayer\n\n${prefix}remind list → your reminders\n${prefix}remind del 2 → delete reminder #2\n\n(time zone: ${tz.zone()})`;
}

module.exports.run = async function ({ api, event, args }) {
  const { threadID, messageID, senderID } = event;
  const prefix = global.config.PREFIX;
  const sub = (args[0] || "").toLowerCase();
  const all = list();
  const mine = all.filter(r => r.threadID == threadID && r.userID == senderID).sort((a, b) => a.at - b.at);

  if (!args.length) return api.sendMessage(help(prefix), threadID, messageID);
  if (sub == "list") {
    if (!mine.length) return api.sendMessage("📭 You have no reminders.", threadID, messageID);
    return api.sendMessage("⏰ Your reminders:\n" + mine.map((r, i) => `${i + 1}. ${when(r)} → ${r.text}`).join("\n") + `\n\nTo delete one: ${prefix}remind del <number>`, threadID, messageID);
  }
  if (sub == "del" || sub == "delete" || sub == "remove") {
    const n = parseInt(args[1]);
    const r = mine[n - 1];
    if (!r) return api.sendMessage(`Wrong number. See: ${prefix}remind list`, threadID, messageID);
    all.splice(all.indexOf(r), 1);
    store.save("reminders", 500, 3000);
    return api.sendMessage(`🗑️ Reminder deleted: ${r.text}`, threadID, messageID);
  }

  const p = parse(args);
  if (p.error) {
    const msg = { notext: "Please write the reminder text too.", dailyclock: "Write a time with daily, e.g.: daily 5am", tooshort: "At least 30 seconds.", toolong: "At most 30 days.", format: "I couldn't understand the time." }[p.error];
    return api.sendMessage(`❌ ${msg}\n\n${help(prefix)}`, threadID, messageID);
  }
  if (mine.length >= MAX_PER_USER) return api.sendMessage(`❌ You already have ${MAX_PER_USER} reminders. Delete some first: ${prefix}remind list`, threadID, messageID);
  if (all.filter(r => r.threadID == threadID).length >= MAX_PER_GROUP) return api.sendMessage(`❌ This group already has ${MAX_PER_GROUP} reminders.`, threadID, messageID);

  const r = { id: Date.now() + "" + Math.floor(Math.random() * 1000), threadID: String(threadID), userID: String(senderID), text: p.text.slice(0, 300), at: p.at, daily: p.daily };
  all.push(r);
  store.save("reminders", 500, 3000);
  return api.sendMessage(`✅ Okay! I'll remind you at ${when(r)}:\n📝 ${r.text}`, threadID, messageID);
};

// check every 20 seconds for reminders that are due
function check(api) {
  const all = list();
  const now = Date.now();
  let changed = false;
  for (const r of all.slice()) {
    if (r.at > now) continue;
    changed = true;
    if (!r.daily && now - r.at > LATE_LIMIT) { all.splice(all.indexOf(r), 1); continue; } // bot was off too long
    const name = (global.data && global.data.userName && global.data.userName.get(r.userID)) || "you";
    const tag = "@" + name;
    api.sendMessage({ body: `⏰ Reminder ${tag}!\n📝 ${r.text}`, mentions: [{ tag, id: r.userID }] }, r.threadID);
    if (r.daily) {
      const [h, m] = r.daily.split(":").map(Number);
      r.at = tz.nextAt(h, m, now + 60000);
    } else all.splice(all.indexOf(r), 1);
  }
  if (changed) store.save("reminders", 500, 3000);
}

module.exports.onLoad = function ({ api }) {
  if (global.__remindTimer) clearInterval(global.__remindTimer);
  global.__remindTimer = setInterval(() => {
    try { check(api || global.client.api); } catch (e) { console.log("[ remind ] " + e.message); }
  }, 20000);
};

module.exports._test = { parse, parseClock, check };
