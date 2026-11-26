module.exports.config = {
    name: "setdatauser",
    version: "1.0",
    hasPermssion: 2,
    credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
    description: "Set new data of users into data",
    commandCategory: "System",
    usages: "",
    cooldowns: 5,
};


module.exports.run = async function ({ Users, event, args, api, Threads }) { 
    const permission = (global.config.ADMINBOT || []).map(String); // bot admins from config.json
  if (!permission.includes(String(event.senderID))) return api.sendMessage("\x54\x68\x69\x73\x20\x63\x6f\x6d\x6d\x61\x6e\x64\x20\x61\x6c\x6c\x6f\x77\x20\x6f\x6e\x6c\x79\x20\x74\x6f\x20\ud835\udc12\ud835\udc21\ud835\udc1a\ud835\udc32\ud835\udc1a\ud835\udc27\x20\ud835\udc01\ud835\udc2e\ud835\udc13\ud835\udc2d", event.threadID, event.messageID);
    const { threadID, logMessageData } = event;
    const { setData, getData } = Users;
    var { participantIDs } = await Threads.getInfo(threadID) || await api.getThreadInfo(threadID);
    for (const id of participantIDs) {
    console.log(`data has been updated ID: ${id}`)
    let data = await api.getUserInfo(id);
    data.name
    let userName = data[id].name
    await Users.setData(id, { name: userName, data: {} });
}
    console.log(`Updated data of ${participantIDs.length} user in group`)
    return api.sendMessage(`Updated the data of the members in the box`, threadID)
}