module.exports.config = {
    name: "sim",
    version: "5.0.0",
    hasPermssion: 0,
    credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
    description: "Chat with SimSimi (official SmallTalk API), with Gemini as backup",
    commandCategory: "Chat same sim",
    usages: "[on | off | message]",
    cooldowns: 5,
    dependencies: {
        axios: ""
    },
    envConfig: {
        // Set the real key in config.json -> "sim": { "APIKEY": "..." }
        // or in the SIMSIMI_API_KEY environment variable (takes priority).
        APIKEY: "",
        // SimSimi language code, e.g. "ur" (Urdu), "hi" (Hindi), "en" (English)
        LANG: "ur",
        // Backup: used when SimSimi fails (bad key, limit, server down, no answer).
        // Set in config.json -> "sim": { "GEMINI_APIKEY": "..." } or GEMINI_API_KEY env variable.
        GEMINI_APIKEY: "",
        // If this model is busy, the other one is tried automatically.
        GEMINI_MODEL: "gemini-flash-lite-latest"
    }
};

const API_URL = "https://wsapi.simsimi.com/190410/talk";
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
const GEMINI_BACKUP_MODELS = ["gemini-flash-lite-latest", "gemini-flash-latest"];

function getSettings() {
    const conf = (global.configModule && global.configModule.sim) || {};
    return {
        apiKey: process.env.SIMSIMI_API_KEY || conf.APIKEY || "",
        lang: conf.LANG || "ur",
        geminiKey: process.env.GEMINI_API_KEY || conf.GEMINI_APIKEY || "",
        geminiModel: conf.GEMINI_MODEL || "gemini-flash-lite-latest"
    };
}

// Returns { answer } on success, or { error } with a short reason.
async function simsimi(text) {
    const axios = require("axios");
    const { apiKey, lang } = getSettings();
    if (!apiKey) return { error: "nokey" };
    try {
        const { data } = await axios({
            url: API_URL,
            method: "POST",
            timeout: 15000,
            headers: { "Content-Type": "application/json", "x-api-key": apiKey },
            // SimSimi accepts at most 100 characters per message
            data: { utext: String(text).slice(0, 100), lang }
        });
        if (data && data.status == 200 && data.atext) return { answer: data.atext };
        if (data && data.status == 228) return { error: "noanswer" };
        return { error: "api", detail: data && (data.statusMessage || data.status) };
    } catch (e) {
        const status = e.response && e.response.status;
        if (status == 403) return { error: "badkey" };
        if (status == 429) return { error: "limit" };
        return { error: "network", detail: status || e.message };
    }
}

// Backup chat through Google Gemini. Returns { answer } or { error }.
async function gemini(text) {
    const { geminiKey, geminiModel } = getSettings();
    if (!geminiKey) return { error: "nokey" };
    const models = [geminiModel, ...GEMINI_BACKUP_MODELS.filter(m => m != geminiModel)];
    let result;
    for (const model of models) {
        result = await geminiModelCall(text, geminiKey, model);
        // Only switch models when this one is busy/overloaded or out of quota
        if (result.answer || !result.retry) return result;
        console.log(`[ SIM ] Gemini model ${model} unavailable (${result.detail}), trying next...`);
    }
    return result;
}

async function geminiModelCall(text, geminiKey, geminiModel) {
    const axios = require("axios");
    const botName = (global.config && global.config.BOTNAME) || "Sim";
    try {
        const { data } = await axios({
            url: GEMINI_URL + encodeURIComponent(geminiModel) + ":generateContent",
            method: "POST",
            timeout: 30000,
            headers: { "Content-Type": "application/json", "x-goog-api-key": geminiKey },
            data: {
                systemInstruction: {
                    parts: [{
                        text: `You are ${botName}, a fun and friendly chat buddy in a Facebook Messenger group. ` +
                            "Reply in the same language and script the user writes in (often Roman Urdu or Roman Hindi). " +
                            "Keep replies short (1-2 sentences), casual and playful, like a friend texting. " +
                            "Use an emoji sometimes. Keep it friendly and respectful."
                    }]
                },
                contents: [{ role: "user", parts: [{ text: String(text).slice(0, 500) }] }],
                generationConfig: { temperature: 0.9, maxOutputTokens: 1024 }
            }
        });
        const parts = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
        const answer = parts.filter(p => p.text && !p.thought).map(p => p.text).join("").trim();
        if (answer) return { answer: answer.slice(0, 1000) };
        return { error: "noanswer" };
    } catch (e) {
        const status = e.response && e.response.status;
        if (status == 400 || status == 401 || status == 403) return { error: "badkey", detail: status };
        if (status == 429) return { error: "limit", detail: status, retry: true };
        if (status == 404 || status >= 500) return { error: "network", detail: status, retry: true };
        return { error: "network", detail: status || e.message };
    }
}

// Try SimSimi first; if it fails for any reason, fall back to Gemini.
async function getReply(text) {
    const sim = await simsimi(text);
    if (sim.answer) return sim;
    if (sim.error != "noanswer") console.log(`[ SIM ] SimSimi: ${errorText[sim.error]}${sim.detail ? " (" + sim.detail + ")" : ""}`);
    if (getSettings().geminiKey) {
        const gem = await gemini(text);
        if (gem.answer) return gem;
        console.log(`[ SIM ] Gemini: ${gem.error}${gem.detail ? " (" + gem.detail + ")" : ""}`);
    }
    // last backups: Groq, then OpenAI (config.json "sim": { "GROQ_APIKEY", "OPENAI_APIKEY" })
    const ai = await require("../../utils/gemini.js").ask({
        only: ["groq", "openai"], maxOutputTokens: 300,
        system: `You are ${(global.config && global.config.BOTNAME) || "Sim"}, a fun friendly chat buddy in a Messenger group. Reply in the same language the user writes (often Roman Urdu), 1-2 short sentences, casual. Never anything 18+.`,
        messages: [{ role: "user", text: String(text).slice(0, 500) }]
    });
    if (ai.text) return { answer: ai.text.slice(0, 1000) };
    return sim;
}

const errorText = {
    nokey: "SimSimi API key is not set in config.json.",
    badkey: "SimSimi API key is invalid or not activated yet.",
    limit: "SimSimi daily limit reached, try again later.",
    noanswer: "I don't know what to say to that 😅",
    api: "Sim API is not responding right now, try again later.",
    network: "Sim API is not responding right now, try again later."
};

module.exports.onLoad = async function () {
    if (typeof global.manhG == "undefined") global.manhG = {};
    if (typeof global.manhG.simsimi == "undefined") global.manhG.simsimi = new Map();
};

module.exports.handleEvent = async function ({ api, event }) {
    const { threadID, messageID, senderID, body } = event;
    if (!global.manhG.simsimi.has(threadID)) return;
    if (!body || senderID == api.getCurrentUserID() || messageID == global.manhG.simsimi.get(threadID)) return;
    // Don't answer bot commands while sim mode is on
    const threadSetting = global.data.threadData.get(String(threadID)) || {};
    const prefix = threadSetting.PREFIX || global.config.PREFIX;
    if (prefix && body.startsWith(prefix)) return;

    const result = await getReply(body);
    if (result.answer) return api.sendMessage(result.answer, threadID, messageID);
};

module.exports.run = async function ({ api, event, args }) {
    const { threadID, messageID } = event;
    const reply = (msg) => api.sendMessage(msg, threadID, messageID);
    if (args.length == 0) return reply("[ 𝐒𝐈𝐌 ] - Use: sim on | sim off | sim <message>");

    switch (args[0].toLowerCase()) {
        case "on":
            if (global.manhG.simsimi.has(threadID)) return reply("[ 𝐒𝐈𝐌 ] - Sim is already on in this group.");
            global.manhG.simsimi.set(threadID, messageID);
            return reply("[ 𝐒𝐈𝐌 ] - Sim turned on. I'll reply to messages here.");
        case "off":
            if (!global.manhG.simsimi.has(threadID)) return reply("[ 𝐒𝐈𝐌 ] - Sim is already off in this group.");
            global.manhG.simsimi.delete(threadID);
            return reply("[ 𝐒𝐈𝐌 ] - Sim turned off.");
        default: {
            const result = await getReply(args.join(" "));
            if (result.answer) return reply(result.answer);
            return reply("[ 𝐒𝐈𝐌 ] - " + errorText[result.error]);
        }
    }
};

// used by inboxchat.js as a backup when the AI cannot answer
module.exports._getReply = getReply;
