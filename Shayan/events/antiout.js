module.exports.config = {
 name: "antiout",
 eventType: ["log:unsubscribe"],
 version: "0.0.1",
 credits: "𝙎𝙝𝙖𝙮𝙖𝙣 𝘽𝙪𝙏𝙩",
 description: "Listen events"
};

module.exports.run = async({ event, api, Threads, Users }) => {
 // on/off is set with the #antiout command (saved file, default ON)
 const cmd = global.client.commands.get("antiout");
 if (cmd && cmd.isOn && !cmd.isOn(event.threadID)) return;
 if (event.logMessageData.leftParticipantFbId == api.getCurrentUserID()) return;
 const name = global.data.userName.get(event.logMessageData.leftParticipantFbId) || await Users.getNameUser(event.logMessageData.leftParticipantFbId);
 const type = (event.author == event.logMessageData.leftParticipantFbId) ? "self-separation" : "removed by an admin";
 if (type == "self-separation") {
  api.addUserToGroup(event.logMessageData.leftParticipantFbId, event.threadID, (error, info) => {
   if (error) {
    api.sendMessage(`Couldn't add ${name} back to the group 🥺`, event.threadID)
   } else api.sendMessage(`No running away, ${name}! 😄 I've added you back to the group.`, event.threadID);
  })
 }
}
