const schedule = require('node-schedule');
const moment = require('moment-timezone');
const chalk = require('chalk');

module.exports.config = {
    name: 'autosent',
    version: '10.0.0',
    hasPermssion: 0,
    credits: '𝐒𝐡𝐚𝐲𝐚𝐧 𝐁𝐮𝐓𝐭',
    description: 'Set Karne Ke Bad Automatically Msg Send Karega',
    commandCategory: 'group messenger',
    usages: '[]',
    cooldowns: 3
};

const messages = [
    { time: '12:00 AM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 11:30 𝗔𝐌 ⏳ پھر وہ تمہاری من پسند چیز تمہارے تک لائے گا,مقررہ وقت پر اور پھر تم حیران رہ جاؤ گے_💯 🥀 ──── •💜• ────' },
    { time: '1:00 AM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 12:30 A𝐌 ⏳ نماز قائم کرو اور اللٌٰه کی نافرمانی سے بچو، اسی کی طرف تم سمیٹے جاؤ گے ──── •💜• ────' },
    { time: '2:00 AM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 1:30 A𝐌 ⏳     وہ نگاہوں کی خیانت کو بھی جانتا ہے♥🌸خَائِنَةَ الْأَعْيُن○ِ🌼 😳 ──── •💜• ────' },
    { time: '3:00 AM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 2:30 A𝐌 ⏳ ♡𝗔𝗭𝗔𝗡 is the m0st 𝗕𝗲𝗮𝘂𝘁𝗶𝗳𝘂𝗹 𝗦𝗼𝘂𝗻𝗱 in the 𝗪𝗼𝗿𝗹𝗱۔۔ 🥺🌎🫀 ──── •💜• ────' },
    { time: '4:00 AM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 3:30 A𝐌 ⏳ سُبْحَانَ رَبِّیَ الْاَعْلٰی    جتنا سکون سجدے میں ہے,دنیا کے کسی کونے میں نہیں_♥️ ──── •💜• ────' },
    { time: '5:00 AM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 4:30 𝗔𝐌 ⏳ قُل هُوَ الله أَحَدٌ ۝          کہو وہ اللہﷻ ایک ہے ──── •💜• ────' },
    { time: '6:00 AM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 5:30 A𝐌 ⏳ ✨🌹 ۞ رَبَّنَـآ ءَاتِنَـا فِى الدُّنيَـا حَسَنَةً وَفِى الأَخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّـارِ ──── •💜• ────' },
    { time: '7:00 AM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 6:30 A𝐌 ⏳  ا تٙرجُ اِلّا رٙبّٙکٙ🖤        اپنے رب کے علاوہ کسی سے اُمید مت رکھو  🦋✨ ──── •💜• ────' },
    { time: '8:00 AM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 7:30 A𝐌 ⏳  اِنَّ اللّٰہَ مَعَ الصّٰبِرِیْنَ:          جان لو کہ اللہ صبر کرنے والوں کے ساتھ ہے۔📿 ──── •💜• ────' },
    { time: '9:00 AM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 8:30 A𝐌 ⏳  لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا°        غم نہ کرو، اللّٰہ ہمارے ساتھ ہے, سورة التوبة✨ ──── •💜• ────' },
    { time: '10:00 AM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 9:30 A𝐌 ⏳ اِیَّاکَ نَعۡبُدُ وَ اِیَّاکَ نَسۡتَعِیۡنُ ؕ o       ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں.. 💯❤️✨ ──── •💜• ────' },
    { time: '11:00 AM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 10:30 A𝐌 ⏳ وَرَفَعْنَا لَكَ ذِكْرَكَ ○               میرے نبی ﷺ کا ذکر ہمیشہ بلند رہے گا🥰 ──── •💜• ────' },
    { time: '12:00 PM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 11:30 𝐏𝐌 ⏳ سُبْحَانَ رَبِّیَ الْاَعْلٰی ──── •💜• ────' },
    { time: '1:00 PM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 12:30 𝐏𝐌 ⏳ قُل هُوَ الله أَحَدٌ ۝          کہو وہ اللہﷻ ایک ہے ──── •💜• ────' },
    { time: '2:00 PM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 1:30 𝐏𝐌 ⏳ خَائِنَةَ الْأَعْيُن○ِ🌼       وہ نگاہوں کی خیانت کو بھی جانتا ہے♥🌸 ──── •💜• ────' },
    { time: '3:00 PM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 2:30 𝐏𝐌 ⏳     نماز قائم کرو اور اللٌٰه کی نافرمانی سے بچو، اسی کی طرف تم سمیٹے جاؤ گے" 🎀   ──── •💜•  ──── •💜• ────' },
    { time: '4:00 PM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 3:30 𝐏𝐌 ⏳ ♡𝗔𝗭𝗔𝗡 is the m0st 𝗕𝗲𝗮𝘂𝘁𝗶𝗳𝘂𝗹 𝗦𝗼𝘂𝗻𝗱 in the 𝗪𝗼𝗿𝗹𝗱۔۔ 🥺🌎🫀 ──── •💜• ────' },
    { time: '5:00 PM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 4:30 𝐏𝐌 ⏳ جتنا سکون سجدے میں ہے,دنیا کے کسی کونے میں نہیں_♥️ ──── •💜• ────' },
    { time: '6:00 PM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 5:30 𝐏𝐌 ⏳ قُل هُوَ الله أَحَدٌ ۝          کہو وہ اللہﷻ ایک ہے ──── •💜• ────' },
    { time: '7:00 PM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 6:30 𝐏𝐌 ⏳  ا تٙرجُ اِلّا رٙبّٙکٙ🖤        اپنے رب کے علاوہ کسی سے اُمید مت رکھو  🦋✨ ──── •💜• ────' },
    { time: '8:00 PM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 7:30 𝐏𝐌 ⏳  اِنَّ اللّٰہَ مَعَ الصّٰبِرِیْنَ:          جان لو کہ اللہ صبر کرنے والوں کے ساتھ ہے۔📿 ──── •💜• ────' },
    { time: '9:00 PM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 8:30 𝐏𝐌 ⏳  لَا تَحْزَنْ إِنَّ اللَّهَ مَعَنَا°        غم نہ کرو، اللّٰہ ہمارے ساتھ ہے, سورة التوبة✨ ──── •💜• ────' },
    { time: '10:00 PM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 9:30 𝐏𝐌 ⏳ اِیَّاکَ نَعۡبُدُ وَ اِیَّاکَ نَسۡتَعِیۡنُ ؕ o       ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں.. 💯❤️✨ ──── •💜• ────' },
    { time: '11:00 PM', message: '──── •💜• ──── 𝐍𝐨𝐰 𝐢𝐭𝐬 𝐭𝐢𝐦𝐞 10:30 𝐏𝐌 ⏳ وَرَفَعْنَا لَكَ ذِكْرَكَ ○               میرے نبی ﷺ کا ذکر ہمیشہ بلند رہے گا🥰 ──── •💜• ────' }
];

const tz = require("../../utils/tz.js");
const approval = require("../../utils/approval.js");

// "Now its time 11:30 AM" inside a message -> the real Pakistan time when it is sent, same bold style
function withCurrentTime(message) {
    const p = tz.parts();
    const h12 = p.hour % 12 || 12, ampm = p.hour < 12 ? "𝐀𝐌" : "𝐏𝐌";
    return message.replace(/(𝐭𝐢𝐦𝐞\s+)\d{1,2}:\d{2}\s*\S+/u,`$1${h12}:${String(p.minute).padStart(2, "0")} ${ampm}`);
}

module.exports.onLoad = ({ api }) => {
    console.log(chalk.bold.hex("#00c300")("============ SUCCESFULLY LOADED THE AUTOSENT COMMAND ============"));
    // cancel old jobs if the command is reloaded
    (global.__autosendJobs || []).forEach(j => j && j.cancel());
    global.__autosendJobs = [];

    messages.forEach(({ time, message }) => {
        const [hour, minute, period] = time.split(/[: ]/);
        let hour24 = parseInt(hour, 10);
        if (period === 'PM' && hour !== '12') {
            hour24 += 12;
        } else if (period === 'AM' && hour === '12') {
            hour24 = 0;
        }

        // every day at this time, Pakistan time (config.json "timezone")
        const rule = new schedule.RecurrenceRule();
        rule.hour = hour24;
        rule.minute = parseInt(minute, 10);
        rule.tz = tz.zone();

        global.__autosendJobs.push(schedule.scheduleJob(rule, () => {
            const text = withCurrentTime(message);
            // only groups the bot admin approved (when approval mode is on); messages are paced by utils/safety.js
            const groups = global.data.allThreadID.filter(id => !approval.enabled() || approval.isApproved(id));
            groups.forEach(threadID => {
                api.sendMessage(text, threadID, (error) => {
                    if (error) {
                        console.error(`Failed to send message to ${threadID}:`, error);
                    }
                });
            });
        }));
    });
};

module.exports._test = { messages, withCurrentTime };

module.exports.run = () => {
    // This function can be left empty as the main logic is handled in onLoad
};
