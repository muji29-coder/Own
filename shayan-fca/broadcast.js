'use strict';

const logger = require('./logger');
const Fetch = require('got');

const broadcastConfig = {
  enabled: false,
  data: [],
};

const fetchBroadcastData = async () => {
  try {
    const response = await Fetch.get('https://raw.githubusercontent.com/priyanshu192/fb-bot/main/Fca_BroadCast.json');
    broadcastConfig.data = JSON.parse(response.body.toString());
    return broadcastConfig.data;
  } catch (error) {
    logger.Error(`Failed to fetch broadcast data: ${error.message}`);
    broadcastConfig.data = [];
    return [];
  }
};

const broadcastRandomMessage = () => {
  const randomMessage = broadcastConfig.data.length > 0 ? broadcastConfig.data[Math.floor(Math.random() * broadcastConfig.data.length)] : 'Ae Zui Zẻ Nhé !';
  logger.Normal(randomMessage);
};

const startBroadcasting = async (enabled) => {
  return; // turned off in shayan-fca: it only downloaded messages from the old author's GitHub
  enabled = global.Fca.Require.Priyansh.BroadCast

  if (enabled) {
    try {
      await fetchBroadcastData();
      broadcastRandomMessage();
      setInterval(broadcastRandomMessage, 3600 * 1000);
    } catch (error) {
      logger.Error(`Failed to start broadcasting: ${error.message}`);
    }
  }
};

module.exports = {
  startBroadcasting,
};
