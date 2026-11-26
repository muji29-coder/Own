// JSON data files for the new features (reminders, trivia scores, stats) in Shayan/commands/data/.
// Writes are kept in memory and flushed to disk shortly after; on GitHub Actions they are also
// committed back to the repo (utils/gitsave.js) so they survive restarts.
const fs = require("fs");
const path = require("path");
const gitsave = require("./gitsave.js");

const DIR = path.join(__dirname, "..", "Shayan", "commands", "data");
const cache = new Map();   // name -> object
const timers = new Map();  // name -> timeout

const file = (name) => path.join(DIR, name + ".json");

function load(name, fallback) {
    if (cache.has(name)) return cache.get(name);
    let data = fallback;
    try { data = JSON.parse(fs.readFileSync(file(name), "utf8")); } catch (e) { /* new file */ }
    cache.set(name, data);
    return data;
}

/**
 * Mark data as changed.
 * @param {string} name
 * @param {number} diskDelayMs   write to disk after this long (several changes = one write)
 * @param {number} githubDelayMs commit to the repo after this long (GitHub Actions only)
 */
function save(name, diskDelayMs = 2000, githubDelayMs = 10 * 60 * 1000) {
    if (timers.has(name)) return;
    timers.set(name, setTimeout(() => {
        timers.delete(name);
        fs.mkdirSync(DIR, { recursive: true });
        fs.writeFileSync(file(name), JSON.stringify(cache.get(name), null, 1));
        gitsave.save([file(name)], `Update ${name}`, githubDelayMs);
    }, diskDelayMs));
}

module.exports = { load, save, DIR };
