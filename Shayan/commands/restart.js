module.exports.config = {
	name: "restart",
	version: "1.1.0",
	hasPermssion: 2,
	credits: "𝙎𝙝𝙖𝙮𝙖𝙣 𝘽𝙪𝙏𝙩",
	description: "Restart the bot (on GitHub: starts a fresh run, so new cookies/keys from Secrets are loaded)",
	commandCategory: "system",
	usages: "",
	cooldowns: 30
};

// On GitHub Actions the cookies and keys are read only when a run starts.
// So instead of just restarting the program, ask GitHub for a NEW run of the workflow:
// it reads the current Secrets (e.g. new APPSTATE cookies), and the old run stops by itself.
module.exports.run = async ({ api, event }) => {
	const { threadID, messageID } = event;
	const repo = process.env.GITHUB_REPOSITORY, token = process.env.GITHUB_TOKEN;
	if (process.env.GITHUB_ACTIONS === "true" && repo && token) {
		try {
			await require("axios").post(
				`https://api.github.com/repos/${repo}/actions/workflows/run.yml/dispatches`,
				{ ref: process.env.GITHUB_REF_NAME || "main" },
				{ headers: { Authorization: `Bearer ${token}`, Accept: "application/vnd.github+json", "User-Agent": "shayan-bot" }, timeout: 20000 }
			);
			return api.sendMessage("🔄 Restarting with a fresh run on GitHub (new cookies and keys from Secrets are loaded).\n⏳ The bot will be back in about 2-3 minutes.", threadID, messageID);
		} catch (e) {
			const why = e.response ? `HTTP ${e.response.status}` : e.message;
			console.log(`[ restart ] Could not start a new GitHub run: ${why} ${e.response ? JSON.stringify(e.response.data).slice(0, 200) : ""}`);
			return api.sendMessage(`❌ Couldn't start a new run on GitHub (${why}).\nOpen GitHub → Actions → Run workflow instead.`, threadID, messageID);
		}
	}
	// not on GitHub (PC/VPS): restart the program
	return api.sendMessage(`${global.config.BOTNAME || "The bot"} is restarting...`, threadID, () => process.exit(1));
};
