module.exports.config = {
	name: "nameCommand", // Command name, used to call the command
	version: "version", // version of this module
	hasPermssion: 0/1/2, // Permission level: 0 = all members, 1 = group admins and above, 2 = bot admin/owner
	credits: "𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭", // Who owns/made this module
	description: "say bla bla here", // Details about the command
	commandCategory: "group", // Which category it belongs to: system, other, game-sp, game-mp, random-img, edit-img, media, economy, ...
	usages: "[option] [text]", // How to use the command
	cooldowns: 5, // Time before a user can use the command again
	dependencies: {
		"packageName": "version"
	}, //List external package modules here so they are installed automatically when the command loads!
	envConfig: {
		//This is where you set up all the env config of the module, e.g. APIKEY, ...
	}
};

module.exports.languages = {
	"vi": {
		//What you do here is up to you ¯\_(ツ)_/¯ 
	},
	"en": {
		//What you do here is up to you ¯\_(ツ)_/¯ 
	}
}

module.exports.onLoad = function ({ configValue }) {
	//What you do here is up to you ¯\_(ツ)_/¯ 
}

module.exports.handleReaction = function({ api, event, models, Users, Threads, Currencies, handleReaction, models }) {
	//What you do here is up to you ¯\_(ツ)_/¯ 
}

module.exports.handleReply = function({ api, event, models, Users, Threads, Currencies, handleReply, models }) {
	//What you do here is up to you ¯\_(ツ)_/¯ 
}

module.exports.handleEvent = function({ event, api, models, Users, Threads, Currencies }) {
	//What you do here is up to you ¯\_(ツ)_/¯ 
}

module.exports.handleSedule = function({ event, api, models, Users, Threads, Currencies, scheduleItem }) {
	//What you do here is up to you ¯\_(ツ)_/¯ 
}

module.exports.run = function({ api, event, args, models, Users, Threads, Currencies, permssion }) {
	//What you do here is up to you ¯\_(ツ)_/¯ 
}
