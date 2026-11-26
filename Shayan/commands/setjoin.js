module.exports.config = {
    name: "setjoin",
    version: "1.0.4",
    hasPermssion: 1,
    credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭",
    description: "Edit text/animated images when new members join",
    commandCategory: "config",
    usages: "[gif/text] [Text or url to download gif image]",
    cooldowns: 10,
    dependencies: {
        "fs-extra": "",
        "path": ""
    }
}

module.exports.onLoad = function () {
    const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];

    const path = join(__dirname, "..", "events", "cache", "joinGif");
    if (!existsSync(path)) mkdirSync(path, { recursive: true });

    return;
}

module.exports.languages = {
    "vi": {
        "savedConfig": "Your settings were saved successfully! Here is a preview:",
        "tagMember": "[Member name]",
        "tagType": "[You/You all]",
        "tagCountMember": "[Member count]",
        "tagNameGroup": "[Group name]",
        "gifPathNotExist": "Your group has never set a join gif",
        "removeGifSuccess": "Successfully removed your group's gif file!",
        "invaildURL": "The URL you entered is not valid!",
        "internetError": "Could not download the file because the URL does not exist or the bot has a network problem!",
        "saveGifSuccess": "Your group's gif file was saved successfully, here is a preview:"
    },
    "en": {
        "savedConfig": "Saved your config, here is preview:",
        "tagMember": "[Member's name]",
        "tagType": "[You/They]",
        "tagCountMember": "[Member number]",
        "tagNameGroup": "[Thread's name]",
        "gifPathNotExist":"Your thread didn't set gif join",
        "removeGifSuccess": "Removed thread's gif!",
        "invaildURL": "Invalid url!",
        "internetError": "Can't load file because url doesn't exist or internet have some problem!",
        "saveGifSuccess": "Saved file gif, here is preview:"
    }
}

module.exports.run = async function ({ args, event, api, Threads, getText }) {
    try {
        const { existsSync, createReadStream } = global.nodemodule["fs-extra"];
        const { join } = global.nodemodule["path"];
        const { threadID, messageID } = event;
        const msg = args.slice(1, args.length).join(" ");
        var data = (await Threads.getData(threadID)).data;

        switch (args[0]) {
            case "text": {
                data["customJoin"] = msg;
                global.data.threadData.set(parseInt(threadID), data);
                await Threads.setData(threadID, { data });
                return api.sendMessage(getText("savedConfig"), threadID, function () {
                    const body = msg
                    .replace(/\{name}/g, getText("tagMember"))
                    .replace(/\{type}/g, getText("tagType"))
                    .replace(/\{soThanhVien}/g, getText("tagCountMember"))
                    .replace(/\{threadName}/g, getText("tagNameGroup"));
                    return api.sendMessage(body, threadID);
                });
            }
            case "gif": {
                const path = join(__dirname, "..", "events", "cache", "joinGif");
                const pathGif = join(path, `${threadID}.gif`);
                if (msg == "remove") {
                    if (!existsSync(pathGif)) return api.sendMessage(getText("gifPathNotExist"), threadID, messageID);
                    unlinkSync(pathGif);
                    return api.sendMessage(getText("removeGifSuccess"), threadID, messageID);
                }
                else {
                    if (!msg.match(/(http(s?):)([/|.|\w|\s|-])*\.(?:gif|GIF)/g)) return api.sendMessage(getText("invaildURL"), threadID, messageID);
                    try {
                        await global.utils.downloadFile(msg, pathGif);
                    } catch (e) { return api.sendMessage(getText("internetError"), threadID, messageID); }
                    return api.sendMessage({ body: getText("saveGifSuccess"), attachment: createReadStream(pathGif) }, threadID, messageID);
                }
            }
            default: { return global.utils.throwError(this.config.name, threadID, messageID) }
        }
    } catch (e) { return console.log(e) };
}