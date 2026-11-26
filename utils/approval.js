// Group approval: the bot only works in groups that a bot admin (ADMINBOT in config.json) has approved.
// Turn it off with  "approvalMode": false  in config.json.
//
// Lists are stored in Shayan/commands/approval/approvedThreads.json and pendingdThreads.json.
// When the bot runs on GitHub Actions, every change is also committed back to the repo,
// because Actions starts from a fresh copy of the repo on every restart.
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const DIR = path.join(ROOT, "Shayan", "commands", "approval");
const APPROVED = path.join(DIR, "approvedThreads.json");
const PENDING = path.join(DIR, "pendingdThreads.json");

function read(file) {
    try {
        const list = JSON.parse(fs.readFileSync(file, "utf8"));
        return Array.isArray(list) ? list.map(String) : [];
    } catch (e) { return []; }
}
function write(file, list) {
    fs.mkdirSync(DIR, { recursive: true });
    fs.writeFileSync(file, JSON.stringify([...new Set(list.map(String))], null, 2));
}

const enabled = () => !global.config || global.config.approvalMode !== false;
const isAdmin = (id) => ((global.config && global.config.ADMINBOT) || []).map(String).includes(String(id));
const isApproved = (threadID) => read(APPROVED).includes(String(threadID));
const approvedList = () => read(APPROVED);
const pendingList = () => read(PENDING);

function approve(threadID) {
    threadID = String(threadID);
    const already = isApproved(threadID);
    write(APPROVED, [...read(APPROVED), threadID]);
    write(PENDING, read(PENDING).filter(id => id !== threadID));
    saveToGitHub(`Approve group ${threadID}`);
    return !already;
}
function remove(threadID) {
    threadID = String(threadID);
    const was = isApproved(threadID);
    write(APPROVED, read(APPROVED).filter(id => id !== threadID));
    write(PENDING, read(PENDING).filter(id => id !== threadID));
    saveToGitHub(`Remove group ${threadID}`);
    return was;
}
function addPending(threadID) {
    threadID = String(threadID);
    if (isApproved(threadID) || read(PENDING).includes(threadID)) return false;
    write(PENDING, [...read(PENDING), threadID]);
    saveToGitHub(`New pending group ${threadID}`);
    return true;
}

// Tell an unapproved group at most once every 30 minutes (avoid spamming the group)
const lastNotice = new Map();
function shouldNotify(threadID) {
    const now = Date.now(), last = lastNotice.get(String(threadID)) || 0;
    if (now - last < 30 * 60 * 1000) return false;
    lastNotice.set(String(threadID), now);
    return true;
}

// ---- keep the lists when running on GitHub Actions (utils/gitsave.js) ----
function saveToGitHub(reason) {
    require("./gitsave.js").save([APPROVED, PENDING], reason, 3000);
}

module.exports = { enabled, isAdmin, isApproved, approvedList, pendingList, approve, remove, addPending, shouldNotify };
