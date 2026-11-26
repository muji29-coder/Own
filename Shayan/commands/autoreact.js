module.exports.config = {
	name: "autoreact",
	version: "1.1.1",
	hasPermission: 0,
	credits: "Clarence DK",
	description: "random letters heart react",
	commandCategory: "No Prefix",
	cooldowns: 0,
};
const fs = require("fs");
module.exports.handleEvent = function({ api, event, client, __GLOBAL }) {
	var { threadID, messageID } = event;
	if (!event.body) return;
	let react = event.body.toLowerCase();
	// one reaction per message (Messenger allows one per account), picked at random for the message's mood
	const MOODS = {
		sad: ["😢", "😭", "🥺", "💔", "😔"],
		laugh: ["😂", "🤣", "😆", "😹"],
		love: ["❤", "😍", "🥰", "😘", "💗", "💖"],
		greeting: ["🌸", "☀️", "🌙", "😊", "❤"],
		default: ["❤", "👍", "😮", "😊", "🔥", "💯", "😎", "🥰", "✨", "🙌"],
		islamic: ["❤"] // always the love react
	};
	const RANK = { default: 1, greeting: 2, love: 3, laugh: 4, sad: 5, islamic: 10 }; // stronger mood wins
	let mood = null;
	const setMood = (m) => { if (!mood || RANK[m] > RANK[mood]) mood = m; };
	if (/(ha){2,}|(he){2,}|\blol\b|\blmao\b|\bxd\b|😂|🤣|😆|😹/i.test(react)) setMood("laugh");
	// Allah / Salam / Assalam o Alaikum / Walaikum Salam / Allah Hafiz and similar: always ❤ (beats every other mood)
	const ISLAMIC = [
		/\ballah\b/, /alla+h\s*ha+fi+z/, /khuda\s*ha+fi+z/,                  // Allah, Allah Hafiz, Khuda Hafiz
		/\bsa+la+m\b/, /\bsalaam/, /\bslm\b/,                                 // Salam, Salaam
		/a?s+a+la+mu?\s*o?\s*a?la+i?ku+m/, /\bas+la+mu?\s*o?\s*a?la+i?ku+m/, /\baoa\b/, // Assalam o Alaikum, Assalamualaikum, Aslam o Alaikum, AoA
		/w[ao]?\s*a?la+i?ku+m/, /walekum/, /\bwslm\b/,                       // Walaikum Salam, Wa Alaikum, Wslm
		/insh?a+\s*-?\s*allah/, /ma+sh?a+\s*-?\s*allah/, /alhamdu\s*lill?ah/, // InshaAllah, MashaAllah, Alhamdulillah
		/subhana?\s*allah/, /jazak\s*allah/, /bismillah/, /\bamee+n\b/,       // SubhanAllah, JazakAllah, Bismillah, Ameen
		/allah/, /astag?h?fir/, /la\s*ilaha/, /\btakbee?r\b/,                // Allahu Akbar, Astaghfirullah, La ilaha illallah
		// all other Islam-related words
		/\bislam/, /\bmuslim/, /\bmusalman/, /\bdeen\b/, /\bima+n\b/, /\btaqwa\b/,
		/\bqur'?a+n/, /\bkoran\b/, /\bsurah?\b/, /\bayat/, /\bpara\s*e?\s*\d/, /tilawat/,
		/\bna+ma+z/, /\bnimaz/, /\bsalah\b/, /\bsalat/, /\bwu[dz]u\b/, /\bqibla/, /\bsajd/, /\bruku\b/,
		/\bmasjid/, /\bmosque/, /\ba[zd]h?a+a?n\b/, /\bimam\b/, /\bkhutb/,
		/\bnabi\b/, /\bnabi\s*pak/, /\brasoo?l/, /\brasul/, /\bmuhamm?ad/, /\bmohamm?ad/, /\bhuzoor\b/, /\bpbuh\b/, /\bs\.?a\.?w\.?w?\b/, /ﷺ/,
		/\bhazrat\b/, /\bsahaba/, /\bahl\s*e\s*bait/,
		/\bhad[ie]e?[st]h?\b/, /\bhadith/, /\bsunn(ah?|at)\b/, /\bsharia/, /\bfiqh\b/,
		/\bzikr\b/, /\bdhikr\b/, /\btasbee?h/, /\bdua\b/, /\bdu'?aa?\b/, /\bdaroo?d\b/, /\bdurood\b/, /\bkal[iy]?ma\b/,
		/\broz[ae]\b/, /\broza\s*dar/, /\bramadan\b/, /\bramz?a+n\b/, /\bramazan\b/, /\biftar/, /\bsehr[iy]\b/, /\bsuhoor\b/, /\btaraw[ie]e?h/, /\bitikaf/,
		/\beid\b/, /\beid\s*(ul|al)/, /\bjumm?a\b/, /\bjumu'?ah\b/, /\bjumm?a\s*mubarak/, /\bmuharram\b/, /\bashura\b/, /shab\s*-?e\s*-?(barat|qadr|meraj)/, /laylat/,
		/\bhajj?\b/, /\bhaji\b/, /\bumrah?\b/, /\bmakk?ah?\b/, /\bmecca\b/, /\bmad[ei]e?na/, /\bmedina\b/, /\bka'?a?ba\b/, /\bkhana\s*ka/, /\barafat\b/,
		/\bjann[ae]t\b/, /\bjannah\b/, /\bakhirat/, /\bqiyamat/, /\bfarishta/, /\bmalaik/,
		/\bzaka+t\b/, /\bsadq[ae]h?\b/, /\bsadaqah/, /\bqurbani\b/, /\bhalal\b/, /\bhijab\b/, /\bbarakah?\b/, /\bbarkat\b/, /\brahmat\b/,
		/اللہ|الله|سلام|علیکم|عليكم|حافظ|ان شاء|ماشاء|الحمد/,                  // Urdu / Arabic script
		/اسلام|مسلم|مسلمان|قرآن|نماز|روزہ|رمضان|عید|جمعہ|مسجد|محمد|رسول|نبی|حدیث|سنت|دعا|درود|کلمہ|حج|عمرہ|مکہ|مدینہ|کعبہ|جنت|زکوٰۃ|صدقہ|سبحان|استغفر|بسم/
	];
	if (ISLAMIC.some(r => r.test(react))) setMood("islamic");
	if(react.includes("a") || react.includes("A") || react.includes("b") || react.includes("B") || react.includes("c") || react.includes("z") || react.includes("d") || react.includes("e") || react.includes("f") || react.includes("g") || react.includes("h") || react.includes("i") || react.includes("j") || react.includes("k") || react.includes("l") || react.includes("m") || react.includes("n") || react.includes("o") || react.includes("p") || react.includes("q") || react.includes("r") || react.includes("s") || react.includes("t") || react.includes("u") || react.includes("v") || react.includes("w") || react.includes("x") || react.includes("y") || react.includes("❤") || react.includes(":)") || react.includes("❤") || react.includes("❤") || react.includes("❤") || react.includes("mabaho") || react.includes("mapanghi") || react.includes("Mabaho") || react.includes("suntukan") || react.includes("stupid") || react.includes("fuck") || react.includes("fuckyou") || react.includes("sapak") || react.includes("Sapak") || react.includes("bold") || react.includes("Bold") || react.includes("am") || react.includes("nan") || react.includes("Am") || react.includes("bisaya") || react.includes("gagi") || react.includes("bastos") || react.includes("Bastos") || react.includes("deputa") || react.includes("Deputa") || react.includes("puta") || react.includes("Puta") || react.includes("Pota") || react.includes("baboy") || react.includes("kababuyan") || react.includes("🖕") || react.includes("🤢") || react.includes("😝") || react.includes("hayup") || react.includes("hayop") || react.includes("nigga") || react.includes("Nigga") || react.includes("script kiddie") || react.includes("trash") || react.includes("Hayop") || react.includes("Hayup") || react.includes("kagagohan") || react.includes("kagaguhan") || react.includes("Nan") || react.includes("kingina") || react.includes("Kingina") || react.includes("KINGINA") || react.includes("hindot") || react.includes("jesus") || react.includes("Jesus") || react.includes ("jesos") || react.includes("Jesos") || react.includes("abno") || react.includes("Abno") || react.includes("Script kiddie") || react.includes("lmao") || react.includes("Lmao") || react.includes("LMAO") || react.includes("xd") || react.includes("Xd") || react.includes("XD") || react.includes("biot") || react.includes("Biot") || react.includes("bayot") || react.includes("Bayot") || react.includes("Bayut") || react.includes("bayut") || react.includes("bakla") || react.includes("Bakla") || react.includes("bading") || react.includes("Bading") || react.includes("poor") || react.includes("Poor")) {
    setMood("default");
          };
    if(react.includes("mahal") || react.includes("Mahal") || react.includes("Love") || react.includes("love") || react.includes("lab") || react.includes("lab") || react.includes("😊") || react.includes("ilove") || react.includes("Ilove") || react.includes("iLove") || react.includes("ilab") || react.includes("iLab") || react.includes("Ilab") || react.includes("labyu") || react.includes("Labyu") || react.includes("kiss") || react.includes("Kiss") || react.includes("yie") || react.includes("kwass") || react.includes("Kwass") || react.includes("krass") || react.includes("Krass") || react.includes("crush") || react.includes("crush") || react.includes("ligawan") || react.includes("kilig") || react.includes("fuck") || react.includes("Fuck") || react.includes("Kinikilig") || react.includes("Kilig") || react.includes("😗") || react.includes("😙") || react.includes("😘") || react.includes("😚") || react.includes("ugh") || react.includes("Ugh") || react.includes("sige pa") || react.includes("Sige pa") || react.includes("sarap") || react.includes("Sarap") || react.includes("sex") || react.includes("Sex") || react.includes("☺") || react.includes("porn") || react.includes("Porn") || react.includes("kantotan") || react.includes("Kantotan") || react.includes("Iyotan") || react.includes("Iyutan") || react.includes("iyotan") || react.includes("iyutan") || react.includes("pasend") || react.includes("Pasend") || react.includes("Iyut") || react.includes("Iyot") || react.includes("iyot") || react.includes("iyut") || react.includes("eut") || react.includes("Eut") || react.includes("eut") || react.includes("😍") || react.includes("shet") || react.includes("Shet") || react.includes("send") || react.includes("Send") || react.includes("baby") || react.includes("Baby") || react.includes("babe") || react.includes("Babe") || react.includes("babi") || react.includes("Baby") || react.includes("bby") || react.includes("Bby") || react.includes("kantot") || react.includes("Kantot") || react.includes("manyak") || react.includes("libog") || react.includes("Libog") || react.includes("horn") || react.includes("Horn") || react.includes("abno") || react.includes("Abno") || react.includes("malibog") || react.includes("labs") || react.includes("Labs") || react.includes("pekpek") || react.includes("Pekpek") || react.includes("pepe") || react.includes("Pepe") || react.includes("🤭") || react.includes("🥰") || react.includes("puke") || react.includes("Puke") || react.includes("bilat") || react.includes("Bilat") || react.includes("puday") || react.includes("Puday") || react.includes("finger") || react.includes("Finger") || react.includes("fifinger") || react.includes("pipinger") || react.includes("Pipinger") || react.includes("pinger") || react.includes("Pinger") || react.includes("mwah") || react.includes("Mwah") || react.includes("mwuah") || react.includes("Mwuah") || react.includes("halikan") || react.includes("Halik") || react.includes("marry") || react.includes("Marry") || react.includes("😇") || react.includes("🤡")) {
      setMood("love");
          };
    if(react.includes("sakit") || react.includes("Sakit") || react.includes("saket") || react.includes("Saket") || react.includes("peyn") || react.includes("Peyn") || react.includes("Pain") || react.includes("mamatay") || react.includes("Mamatay") || react.includes("ayaw ko na") || react.includes("Ayaw ko na") || react.includes("saktan") || react.includes("Saktan") || react.includes("Sasaktan") || react.includes("sasaktan") || react.includes("sad") || react.includes("Sad") || react.includes("malungkot") || react.includes("Malungkot") || react.includes(" 😥") || react.includes("😰") || react.includes("😨") || react.includes("😢") || react.includes(":(") || react.includes("😔") || react.includes("😞") || react.includes("depress") || react.includes("stress") || react.includes("Stress") || react.includes("Depress") || react.includes("depression") || react.includes("Depression") || react.includes("kalungkutan") || react.includes("Kalungkutan") || react.includes("😭")) {
      setMood("sad");
          };
    if(react.includes("eve") || react.includes("Eve") || react.includes("morning") || react.includes("Morning") || react.includes("afternoon") || react.includes("Afternoon") || react.includes("evening") || react.includes("eat") || react.includes("Eat") || react.includes("night") || react.includes("nyt") || react.includes("Night") || react.includes("Nyt")) {
      setMood("greeting");
                }
	// safety: at most N random reactions per chat per minute (busy groups). Islamic ❤ is never skipped.
	const limit = ((global.config && global.config.safety) || {}).maxReactionsPerMinute || 10;
	if (!global.__reactLog) global.__reactLog = new Map();
	const now = Date.now(), log = (global.__reactLog.get(String(threadID)) || []).filter(t => now - t < 60000);
	if (mood && mood !== "islamic" && log.length >= limit) mood = null;
	if (mood) { log.push(now); global.__reactLog.set(String(threadID), log); }
	if (mood) {
		const list = MOODS[mood];
		const emoji = list[Math.floor(Math.random() * list.length)];
		api.setMessageReaction(emoji, event.messageID, (err) => {
			// show why Facebook refused a reaction (at most once per 10 minutes, so the log stays readable)
			if (!err) { if (!global.__reactOk) console.log("[ autoreact ] Reactions are working."); global.__reactOk = (global.__reactOk || 0) + 1; return; }
			const now2 = Date.now();
			if (now2 - (global.__reactErrAt || 0) < 10 * 60 * 1000) return;
			global.__reactErrAt = now2;
			let why; try { why = JSON.stringify(err).slice(0, 400); } catch (e) { why = String(err); }
			console.log(`[ autoreact ] Facebook refused the reaction ${emoji} (${global.__reactOk || 0} worked so far): ${why}`);
		}, true);
	}
        }
	module.exports.run = function({ api, event, client, __GLOBAL }) {

}
