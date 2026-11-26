// Small wrapper around the yt-dlp program for downloading YouTube audio/video.
// - Downloads the official standalone yt-dlp binary into ./bin on first use (no Python needed).
// - Checks for a yt-dlp update once per bot start (YouTube changes often).
// - Uses Node.js as the JavaScript runtime that yt-dlp needs for YouTube.
// - Uses YouTube cookies if available (needed on servers like GitHub Actions):
//     YT_COOKIES_FILE env variable, or a cookies.txt file in the project root.
const fs = require("fs");
const path = require("path");
const https = require("https");
const { execFile } = require("child_process");

const ROOT = path.join(__dirname, "..");
const BIN_DIR = path.join(ROOT, "bin");
const ASSET = process.platform == "win32" ? "yt-dlp.exe" : process.platform == "darwin" ? "yt-dlp_macos" : "yt-dlp_linux";
const BIN_PATH = path.join(BIN_DIR, ASSET);
// nightly builds get YouTube fixes first (YouTube changes often)
const DOWNLOAD_URL = `https://github.com/yt-dlp/yt-dlp-nightly-builds/releases/latest/download/${ASSET}`;

// Messenger rejects attachments bigger than ~25MB
const MAX_FILESIZE = "25M";
const LIMITS = {
    // fallbackFormat: used with the other YouTube players, which often only offer video+audio files
    audio: { format: "bestaudio[ext=m4a]/bestaudio", fallbackFormat: "bestaudio/18/91/92/worst[ext=mp4]", maxSeconds: 20 * 60 },
    video: { format: "18/best[ext=mp4][height<=480]/best[ext=mp4]", fallbackFormat: "18/92/91/best[ext=mp4][height<=360]", maxSeconds: 10 * 60 }
};
// If YouTube hides the formats (common on servers like GitHub Actions), try other YouTube players.
const PLAYER_TRIES = [null, "tv,web_safari", "mweb,web_embedded", "android_vr,ios"];

let readyPromise = null;

function downloadFile(url, dest, redirects = 0) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { "User-Agent": "messenger-bot" } }, (res) => {
            if ([301, 302, 303, 307, 308].includes(res.statusCode) && res.headers.location && redirects < 10) {
                res.resume();
                return resolve(downloadFile(res.headers.location, dest, redirects + 1));
            }
            if (res.statusCode != 200) {
                res.resume();
                return reject(new Error(`yt-dlp download failed (HTTP ${res.statusCode})`));
            }
            const tmp = dest + ".tmp";
            const file = fs.createWriteStream(tmp);
            res.pipe(file);
            file.on("finish", () => file.close(() => {
                fs.renameSync(tmp, dest);
                resolve();
            }));
            file.on("error", reject);
        }).on("error", reject);
    });
}

function run(args, timeoutMs) {
    return new Promise((resolve) => {
        execFile(BIN_PATH, args, { timeout: timeoutMs, maxBuffer: 10 * 1024 * 1024, windowsHide: true }, (error, stdout, stderr) => {
            resolve({ error, stdout: String(stdout || ""), stderr: String(stderr || "") });
        });
    });
}

// Make sure the yt-dlp binary exists (download it if missing) and try to update it once per start.
function ensureReady() {
    if (!readyPromise) {
        readyPromise = (async () => {
            if (!fs.existsSync(BIN_PATH)) {
                fs.mkdirSync(BIN_DIR, { recursive: true });
                console.log("[ yt-dlp ] Downloading yt-dlp...");
                await downloadFile(DOWNLOAD_URL, BIN_PATH);
                if (process.platform != "win32") fs.chmodSync(BIN_PATH, 0o755);
            } else {
                const upd = await run(["--update-to", "nightly"], 120000);
                const line = (upd.stdout + upd.stderr).trim().split("\n").pop();
                if (line) console.log("[ yt-dlp ] " + line);
            }
        })().catch((e) => {
            readyPromise = null; // try again next time
            throw e;
        });
    }
    return readyPromise;
}

function cookiesFile() {
    const candidates = [process.env.YT_COOKIES_FILE, path.join(ROOT, "cookies.txt")].filter(Boolean);
    return candidates.find((p) => fs.existsSync(p) && fs.statSync(p).size > 0);
}

function cleanup(prefix) {
    const dir = path.dirname(prefix), base = path.basename(prefix);
    for (const f of fs.existsSync(dir) ? fs.readdirSync(dir) : []) {
        if (f.startsWith(base)) try { fs.unlinkSync(path.join(dir, f)); } catch (e) { }
    }
}

/**
 * Download a YouTube video as audio (m4a) or video (mp4).
 * Resolves to the downloaded file path. Rejects with a user-friendly Error.
 */
async function downloadYouTube(videoId, type, outDir) {
    if (!/^[A-Za-z0-9_-]{11}$/.test(videoId)) throw new Error("Invalid YouTube video id.");
    const limit = LIMITS[type] || LIMITS.audio;
    await ensureReady();
    fs.mkdirSync(outDir, { recursive: true });

    const prefix = path.join(outDir, `yt_${videoId}_${type}_${Date.now()}`);
    const dir = path.dirname(prefix), base = path.basename(prefix);
    const cookies = cookiesFile();
    let out = "", res = {};
    for (const players of PLAYER_TRIES) {
        const args = [
            "--js-runtimes", "node", // Deno is used too when it is installed (GitHub workflow installs it)
            "--no-playlist", "--no-progress", "--no-warnings", "--no-mtime",
            "-f", players ? limit.fallbackFormat : limit.format,
            "--max-filesize", MAX_FILESIZE,
            "--match-filters", `duration<=${limit.maxSeconds}`,
            "-o", prefix + ".%(ext)s"
        ];
        if (players) args.push("--extractor-args", `youtube:player_client=${players}`);
        // other players may only give a video file: keep just the sound (needs ffmpeg, installed on GitHub)
        if (players && type == "audio") args.push("-x", "--audio-format", "m4a");
        if (cookies) args.push("--cookies", cookies);
        args.push(`https://www.youtube.com/watch?v=${videoId}`);

        res = await run(args, 5 * 60 * 1000);
        out = res.stdout + "\n" + res.stderr;
        const file = fs.readdirSync(dir).find((f) => f.startsWith(base) && !f.endsWith(".part") && !f.endsWith(".ytdl"));
        if (file && !res.error) return path.join(dir, file);
        cleanup(prefix);
        // only "YouTube hid the formats" problems are worth another player; others won't change
        if (!/format is not available|n challenge|signature|confirm you.?re not a bot|Sign in to confirm|only images are available|player response/i.test(out)) break;
        console.log(`[ yt-dlp ] ${videoId}: no usable format with player ${players || "default"}, trying another...`);
    }
    if (/larger than max-filesize/i.test(out)) throw new Error(`File is bigger than ${MAX_FILESIZE}B (Messenger limit). Try a shorter one.`);
    if (/does not pass filter/i.test(out)) throw new Error(`Too long. Max length is ${limit.maxSeconds / 60} minutes for ${type}.`);
    if (/confirm you.?re not a bot|Sign in to confirm/i.test(out)) {
        console.log("[ yt-dlp ] YouTube is blocking this server. Add YouTube cookies (YT_COOKIES secret / cookies.txt).");
        throw new Error("YouTube blocked the download on this server. Bot admin needs to add YouTube cookies.");
    }
    const errLine = out.split("\n").filter((l) => /ERROR/.test(l)).pop();
    console.log("[ yt-dlp ] " + (errLine || (res.error && res.error.message) || "unknown error"));
    if (/format is not available|only images are available/i.test(out)) throw new Error("YouTube refused this song right now. Try again later or try another song.");
    if (/private video|video unavailable|removed|copyright|age/i.test(out)) throw new Error("This video is not available (private, deleted or age-restricted). Try another one.");
    throw new Error("Download failed, please try again in a little while.");
}

module.exports = { downloadYouTube, ensureReady };
