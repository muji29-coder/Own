const fetch = require("node-fetch");
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const ytSearch = require("yt-search");
const { downloadYouTube } = require("../../utils/ytdlp.js");

// Search YouTube: official YouTube Data API first (key from config.json), yt-search as backup.
async function searchYouTube(query, moduleName) {
  const conf = (global.configModule && global.configModule[moduleName]) || {};
  const key = process.env.YOUTUBE_API_KEY || conf.YOUTUBE_API;
  if (key) {
    try {
      const { data } = await axios.get("https://www.googleapis.com/youtube/v3/search", {
        params: { part: "snippet", type: "video", maxResults: 5, q: query, key },
        timeout: 15000,
      });
      const item = (data.items || []).find((it) => it.id && it.id.videoId);
      if (item) {
        const title = item.snippet.title
          .replace(/&amp;/g, "&").replace(/&quot;/g, '"').replace(/&#39;/g, "'")
          .replace(/&lt;/g, "<").replace(/&gt;/g, ">");
        return { videoId: item.id.videoId, title };
      }
    } catch (e) {
      const reason = e.response && e.response.data && e.response.data.error && e.response.data.error.message;
      console.log(`[ ${moduleName} ] YouTube API search failed (${reason || e.message}), using yt-search instead`);
    }
  }
  const searchResults = await ytSearch(query);
  if (!searchResults || !searchResults.videos.length) return null;
  return { videoId: searchResults.videos[0].videoId, title: searchResults.videos[0].title };
}

module.exports = {
  config: {
    name: "video",
    version: "1.0.3",
    hasPermssion: 0,
    credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
    description: "Download YouTube song from keyword search and link",
    commandCategory: "Media",
    usages: "[songName] [type]",
    cooldowns: 5,
    dependencies: {
      "node-fetch": "",
      "yt-search": "",
    },
    envConfig: {
      // Set in config.json -> "video": { "YOUTUBE_API": "..." } or YOUTUBE_API_KEY env variable
      YOUTUBE_API: "",
    },
  },

  run: async function ({ api, event, args }) {
    let songName, type;

    if (
      args.length > 1 &&
      (args[args.length - 1] === "audio" || args[args.length - 1] === "video")
    ) {
      type = args.pop();
      songName = args.join(" ");
    } else {
      songName = args.join(" ");
      type = "video";
    }

    const processingMessage = await api.sendMessage(
      "✅ Processing your request. Please wait...",
      event.threadID,
      null,
      event.messageID
    );

    let downloadPath = null;
    try {
      if (!songName) throw new Error("Please enter a song name.");

      // Search for the song on YouTube
      const topResult = await searchYouTube(songName, module.exports.config.name);
      if (!topResult) {
        throw new Error("No results found for your search query.");
      }
      const videoId = topResult.videoId;

      api.setMessageReaction("⌛", event.messageID, () => {}, true);

      // Download with yt-dlp (audio: m4a, video: mp4)
      downloadPath = await downloadYouTube(videoId, type, path.join(__dirname, "cache"));

      api.setMessageReaction("✅", event.messageID, () => {}, true);

      // Send the downloaded file to the user
      const sentPath = downloadPath;
      await api.sendMessage(
        {
          attachment: fs.createReadStream(sentPath),
          body: `🖤 Title: ${topResult.title}\n\n Here is your ${
            type === "audio" ? "audio" : "video"
          } 🎧:`,
        },
        event.threadID,
        () => {
          try { fs.unlinkSync(sentPath); } catch (e) {} // Cleanup after sending
          if (processingMessage) api.unsendMessage(processingMessage.messageID);
        },
        event.messageID
      );
    } catch (error) {
      console.error(`Failed to download and send song: ${error.message}`);
      if (downloadPath) try { fs.unlinkSync(downloadPath); } catch (e) {}
      api.setMessageReaction("❌", event.messageID, () => {}, true);
      if (processingMessage) api.unsendMessage(processingMessage.messageID);
      api.sendMessage(
        `Failed to download song: ${error.message}`,
        event.threadID,
        event.messageID
      );
    }
  },
};
