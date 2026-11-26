// AI helper used by #joker, #trivia and #sim's backup.
// 1) Google Gemini   key: GEMINI_API_KEY env, or config.json "sim": { "GEMINI_APIKEY" }
// 2) Groq (free, fast)  key: GROQ_API_KEY env, or config.json "sim": { "GROQ_APIKEY" }
// 3) OpenAI (backup)     key: OPENAI_API_KEY env, or config.json "sim": { "OPENAI_APIKEY" }
// Each provider also has a backup model. The first one that answers wins.
const GEMINI_URL = "https://generativelanguage.googleapis.com/v1beta/models/";
const OPENAI_URL = "https://api.openai.com/v1/chat/completions";
const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"; // OpenAI-compatible

function settings() {
    const sim = (global.config && global.config.sim) || {};
    return {
        geminiKey: process.env.GEMINI_API_KEY || sim.GEMINI_APIKEY || "",
        geminiModels: [sim.GEMINI_MODEL || "gemini-flash-lite-latest", "gemini-flash-lite-latest", "gemini-flash-latest"],
        groqKey: process.env.GROQ_API_KEY || sim.GROQ_APIKEY || "",
        groqModels: [sim.GROQ_MODEL || "openai/gpt-oss-120b", "openai/gpt-oss-120b", "openai/gpt-oss-20b"],
        openaiKey: process.env.OPENAI_API_KEY || sim.OPENAI_APIKEY || "",
        openaiModels: [sim.OPENAI_MODEL || "gpt-5.4-mini", "gpt-5.4-mini", "gpt-4.1-mini"]
    };
}
const unique = (a) => [...new Set(a.filter(Boolean))];

function classify(e) {
    const status = e.response && e.response.status;
    const body = e.response && e.response.data && e.response.data.error;
    const msg = String((body && (body.message || body.code)) || e.message || "");
    const error = /billing|free tier is not available|credit|insufficient_quota|quota/i.test(msg) ? "billing"
        : /api key not valid|invalid api key|invalid_api_key|incorrect api key/i.test(msg) ? "badkey"
        : status == 429 ? "limit" : status == 401 || status == 403 ? "badkey" : status == 400 ? "request" : "network";
    return { error, status, msg };
}

async function askGemini(axios, key, model, { system, messages, json, temperature, maxOutputTokens }) {
    const { data } = await axios({
        url: GEMINI_URL + encodeURIComponent(model) + ":generateContent",
        method: "POST", timeout: 45000,
        headers: { "Content-Type": "application/json", "x-goog-api-key": key },
        data: {
            systemInstruction: system ? { parts: [{ text: system }] } : undefined,
            contents: messages.map(x => ({ role: x.role === "model" ? "model" : "user", parts: [{ text: String(x.text).slice(0, 4000) }] })),
            generationConfig: Object.assign({ temperature, maxOutputTokens }, json ? { responseMimeType: "application/json" } : {})
        }
    });
    const parts = (data && data.candidates && data.candidates[0] && data.candidates[0].content && data.candidates[0].content.parts) || [];
    return parts.filter(p => p.text && !p.thought).map(p => p.text).join("").trim();
}

async function askOpenAI(axios, key, model, { system, messages, json, temperature, maxOutputTokens }, url = OPENAI_URL) {
    const body = {
        model,
        messages: [...(system ? [{ role: "system", content: system }] : []),
            ...messages.map(x => ({ role: x.role === "model" ? "assistant" : "user", content: String(x.text).slice(0, 4000) }))],
        max_completion_tokens: maxOutputTokens
    };
    if (!/^gpt-5|^o\d/.test(model)) body.temperature = temperature; // reasoning models only accept the default
    if (json) body.response_format = { type: "json_object" };
    const { data } = await axios.post(url, body, { timeout: 45000, headers: { Authorization: "Bearer " + key } });
    return String((data && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) || "").trim();
}

/**
 * @param {object} o
 * @param {string} o.system            instructions for the model
 * @param {{role:"user"|"model", text:string}[]} o.messages conversation, last one from the user
 * @param {boolean} [o.json]           ask for a JSON answer
 * @returns {Promise<{text?:string, provider?:string, error?:string}>}
 */
async function ask({ system, messages, json = false, temperature = 0.9, maxOutputTokens = 2048, only = null }) {
    const axios = require("axios");
    const s = settings();
    const providers = [];
    if (s.geminiKey && (!only || only.includes("gemini"))) providers.push(["gemini", s.geminiKey, unique(s.geminiModels), askGemini]);
    if (s.groqKey && (!only || only.includes("groq"))) providers.push(["groq", s.groqKey, unique(s.groqModels), (ax, k, m, o) => askOpenAI(ax, k, m, o, GROQ_URL)]);
    if (s.openaiKey && (!only || only.includes("openai"))) providers.push(["openai", s.openaiKey, unique(s.openaiModels), askOpenAI]);
    if (!providers.length) return { error: "nokey" };

    let last = { error: "unknown" }, temporary = false;
    for (const [provider, key, models, fn] of providers) {
        for (const model of models) {
            for (let attempt = 1; attempt <= 2; attempt++) {
                try {
                    const text = await fn(axios, key, model, { system, messages, json, temperature, maxOutputTokens });
                    if (text) return { text, provider, model };
                    last = { error: "empty" };
                    break;
                } catch (e) {
                    const c = classify(e);
                    last = { error: c.error, detail: c.status || c.msg };
                    console.log(`[ AI ] ${provider}/${model}${attempt > 1 ? " (retry)" : ""}: ${c.status || ""} ${c.msg.slice(0, 150)}`);
                    if (c.error === "network" || c.error === "limit") temporary = true;
                    // server busy (5xx / timeout): one more try on the same model after a short pause
                    if (attempt === 1 && c.error === "network") { await new Promise(r => setTimeout(r, 1500)); continue; }
                    break;
                }
            }
            // key/billing problems: the provider's other model won't help, go to the next provider
            if (last.error === "billing" || last.error === "badkey") break;
        }
    }
    // if anything failed only temporarily, the honest answer is "busy, try again"
    if (temporary && last.error !== "nokey") return { error: "busy", detail: last.detail };
    return last;
}

module.exports = { ask };
