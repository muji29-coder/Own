module.exports.config = {
  name: "stats",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
  description: "Group activity: top members today / this week, busiest hour",
  commandCategory: "Group",
  usages: "| me",
  cooldowns: 10
};

const store = require("../../utils/store.js");
const tz = require("../../utils/tz.js");
const KEEP_DAYS = 8;
// Only counts are stored (who sent how many messages, and at which hour) - never the message text.
const data = () => store.load("stats", {});

module.exports.handleEvent = function ({ api, event }) {
  if (!event.isGroup || !event.senderID || event.senderID == api.getCurrentUserID()) return;
  if (event.type !== "message" && event.type !== "message_reply") return;
  const all = data();
  const tid = String(event.threadID), day = tz.dayKey(), hour = tz.parts().hour;
  const g = all[tid] || (all[tid] = { days: {} });
  const d = g.days[day] || (g.days[day] = { users: {}, hours: new Array(24).fill(0) });
  d.users[event.senderID] = (d.users[event.senderID] || 0) + 1;
  d.hours[hour]++;
  // forget old days
  const keys = Object.keys(g.days).sort();
  while (keys.length > KEEP_DAYS) delete g.days[keys.shift()];
  store.save("stats", 60 * 1000, 30 * 60 * 1000);
};

function sum(days) {
  const users = {}, hours = new Array(24).fill(0);
  let total = 0;
  for (const d of days) {
    for (const [u, n] of Object.entries(d.users)) { users[u] = (users[u] || 0) + n; total += n; }
    d.hours.forEach((n, h) => hours[h] += n);
  }
  return { users, hours, total, ranking: Object.entries(users).sort((a, b) => b[1] - a[1]) };
}

const hourText = (h) => `${h % 12 || 12}${h < 12 ? "am" : "pm"}-${(h + 1) % 12 || 12}${h + 1 < 12 || h + 1 == 24 ? "am" : "pm"}`;

module.exports.run = async function ({ api, event, args, Users }) {
  const { threadID, messageID, senderID } = event;
  const g = data()[String(threadID)];
  if (!g || !Object.keys(g.days).length) return api.sendMessage("📊 Still collecting data. Check again a little later!", threadID, messageID);
  const today = tz.dayKey();
  const last7 = Object.keys(g.days).sort().slice(-7).map(k => g.days[k]);
  const week = sum(last7), day = sum(g.days[today] ? [g.days[today]] : []);
  const nameOf = async (id) => { try { return (await Users.getNameUser(id)) || "Someone"; } catch (e) { return "Someone"; } };

  if ((args[0] || "").toLowerCase() == "me") {
    const me = String(senderID);
    const rank = week.ranking.findIndex(r => r[0] == me) + 1;
    return api.sendMessage(`📊 ${await nameOf(me)}\n\n💬 Today: ${day.users[me] || 0} messages\n📅 This week: ${week.users[me] || 0} messages${rank ? `\n🏅 Weekly rank: #${rank} (of ${week.ranking.length})` : ""}`, threadID, messageID);
  }

  const medals = ["🥇", "🥈", "🥉", "4.", "5."];
  let msg = `📊 GROUP STATS\n\n💬 Today: ${day.total} messages\n📅 Last 7 days: ${week.total} messages\n👥 Active members (7 days): ${week.ranking.length}`;
  if (day.ranking.length) {
    msg += "\n\n🔥 Top today:";
    for (let i = 0; i < Math.min(3, day.ranking.length); i++) msg += `\n${medals[i]} ${await nameOf(day.ranking[i][0])} — ${day.ranking[i][1]}`;
  }
  msg += "\n\n🏆 Top this week:";
  for (let i = 0; i < Math.min(5, week.ranking.length); i++) msg += `\n${medals[i]} ${await nameOf(week.ranking[i][0])} — ${week.ranking[i][1]}`;
  const busiest = week.hours.indexOf(Math.max(...week.hours));
  if (week.total) msg += `\n\n⏰ Busiest time: ${hourText(busiest)}`;
  msg += `\n\nYour own stats: ${global.config.PREFIX}stats me`;
  return api.sendMessage(msg, threadID, messageID);
};
