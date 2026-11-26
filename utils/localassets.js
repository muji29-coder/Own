// Many old commands download their template picture from imgur on every use, but imgur refuses
// requests from the bot (HTTP 429). The pictures are saved once in Shayan/commands/cache/assets/
// (imgur_<id>.<ext>); this axios hook answers those requests from the saved file instead of imgur.
// No command file needs to change. Unknown links still go to the internet as before.
const fs = require("fs");
const path = require("path");

const DIR = path.join(__dirname, "..", "Shayan", "commands", "cache", "assets");
const TYPES = { jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", gif: "image/gif", mp4: "video/mp4", webp: "image/webp" };

let index = null; // imgur id -> file path
function load() {
    index = new Map();
    for (const f of fs.existsSync(DIR) ? fs.readdirSync(DIR) : []) {
        const m = f.match(/^imgur_([A-Za-z0-9]+)\.([a-z0-9]+)$/i);
        if (m) index.set(m[1], path.join(DIR, f));
    }
}

// the saved file for an imgur link, or null
function localFor(url) {
    const m = String(url || "").match(/^https?:\/\/(?:i\.)?imgur\.com\/([A-Za-z0-9]+)(?:\.[a-z0-9]+)?(?:[?#].*)?$/i);
    if (!m) return null;
    if (!index) load();
    return index.get(m[1]) || null;
}

function install(axios) {
    if (!axios || axios.__localAssets) return;
    axios.__localAssets = true;
    axios.interceptors.request.use((config) => {
        const file = localFor(config.url);
        if (!file) return config;
        config.adapter = async (cfg) => {
            const ext = path.extname(file).slice(1).toLowerCase();
            const data = cfg.responseType === "stream" ? fs.createReadStream(file)
                : cfg.responseType === "arraybuffer" ? fs.readFileSync(file)
                    : fs.readFileSync(file);
            return { data, status: 200, statusText: "OK", headers: { "content-type": TYPES[ext] || "application/octet-stream" }, config: cfg, request: {} };
        };
        return config;
    });
}

module.exports = { install, localFor };
