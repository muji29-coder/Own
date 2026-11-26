module.exports.config = {
    name: "antiout",
    version: "2.0.0",
    credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
    hasPermssion: 1,
    description: "Auto add back members who leave the group: on / off",
    usages: "on | off | (no word = show status)",
    commandCategory: "system",
    cooldowns: 0
};

// Saved in Shayan/commands/data/antiout.json (and in the repo on GitHub Actions), so it survives restarts.
// Default for every group: ON.
const store = require("../../utils/store.js");
const isOn = (threadID) => store.load("antiout", {})[String(threadID)] !== false;
module.exports.isOn = isOn;

module.exports.run = async ({ api, event, args }) => {
    const { threadID, messageID } = event;
    const word = String(args[0] || "").toLowerCase();
    const p = global.config.PREFIX;
    if (!["on", "off"].includes(word)) {
        return api.sendMessage(`🔁 Anti-out is ${isOn(threadID) ? "ON ✅ (members who leave are added back)" : "OFF ❌"}\n\nTurn on: ${p}antiout on\nTurn off: ${p}antiout off`, threadID, messageID);
    }
    const settings = store.load("antiout", {});
    settings[String(threadID)] = word === "on";
    store.save("antiout", 500, 3000);
    return api.sendMessage(word === "on" ? "✅ Anti-out ON: members who leave will be added back." : "❌ Anti-out OFF: members who leave will not be added back.", threadID, messageID);
};
