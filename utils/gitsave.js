// Keep data files when the bot runs on GitHub Actions (each restart starts from a fresh copy of the repo):
// changed files are committed and pushed back to the repo, batched, with "[skip ci]" so no restart is triggered.
// On your own PC this does nothing (commit the files yourself if you want them in the repo).
const path = require("path");
const { execFile } = require("child_process");

const ROOT = path.join(__dirname, "..");
let batch = { files: new Set(), reasons: new Set(), due: Infinity, timer: null };
let flushing = Promise.resolve();

function git(args) {
    return new Promise((resolve) => execFile("git", args, { cwd: ROOT, timeout: 60000 },
        (error, stdout, stderr) => resolve({ error, out: String(stdout) + String(stderr) })));
}

async function flush() {
    const files = [...batch.files].map(f => path.relative(ROOT, f));
    const message = [...batch.reasons].join(", ").slice(0, 200) + " [skip ci]";
    batch = { files: new Set(), reasons: new Set(), due: Infinity, timer: null };
    if (!files.length) return;
    const branch = process.env.GITHUB_REF_NAME || "main";
    await git(["add", "--", ...files]);
    const commit = await git(["-c", "user.name=github-actions[bot]", "-c", "user.email=41898282+github-actions[bot]@users.noreply.github.com",
        "commit", "-m", message, "--", ...files]);
    if (commit.error && !/nothing to commit|no changes added/i.test(commit.out)) return console.log("[ SAVE ] git commit failed: " + commit.out.trim());
    if (commit.error) return; // nothing changed
    await git(["pull", "--rebase", "--autostash", "origin", branch]);
    const push = await git(["push", "origin", "HEAD:" + branch]);
    console.log(push.error ? "[ SAVE ] Could not save data to GitHub: " + push.out.trim() : `[ SAVE ] Saved to GitHub: ${files.join(", ")}`);
}

/**
 * Save these files to the GitHub repo (only when running on GitHub Actions).
 * Several calls are combined; the commit happens at the earliest requested time.
 * @param {string[]} files absolute paths
 * @param {string} reason short text for the commit message
 * @param {number} delayMs how long to wait (collects more changes into one commit)
 */
function save(files, reason, delayMs = 3000) {
    if (process.env.GITHUB_ACTIONS !== "true") return;
    files.forEach(f => batch.files.add(f));
    batch.reasons.add(reason);
    const due = Date.now() + delayMs;
    if (due < batch.due) {
        clearTimeout(batch.timer);
        batch.due = due;
        batch.timer = setTimeout(() => { flushing = flushing.then(flush).catch(e => console.log("[ SAVE ] " + e.message)); }, delayMs);
    }
}

module.exports = { save };
