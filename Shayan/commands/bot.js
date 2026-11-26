const fs = global.nodemodule["fs-extra"];
module.exports.config = {
name: "goibot",
version: "1.0.1",
hasPermssion: 0,
credits: "Mod by John Lester",
description: "goibot",
commandCategory: "Noprefix",
usages: "noprefix",
cooldowns: 5,
};
module.exports.handleEvent = async function({ api, event, args, Threads, Users }) {
var { threadID, messageID, reason } = event;
if (!event.body) return; // photos, stickers etc. have no text
if (event.body.startsWith(global.config.PREFIX)) return; // commands are handled elsewhere
if (!event.isGroup) return; // in the bot's inbox the AI chat (inboxchat.js) replies instead
// when #sim is on in this group, sim does the chatting (avoid two replies to one message)
if (global.manhG && global.manhG.simsimi && global.manhG.simsimi.has(threadID)) return;
const moment = require("moment-timezone");
const time = moment.tz("Asia/Karachi").format("HH:MM:ss L");
var idgr = `${event.threadID}`;
var id = event.senderID;
var name = await Users.getNameUser(event.senderID); 

var tl = ["ji ji hukam kro 😂", "Bot na bolo! Janu bolo mujy aur janu sy piyar sy bat kerty hai 🥰🌸", "rat ko kahan thy nazar nahi ay bht miss kiya 🌸🌎", "Shaqal Sy masoom lgty ho 🥰 lkn hrkaton sy ni", "kash tum single hoty to aj hum mingle hoty 🥰😂", "Ha ha ab meri yaad ab ai na phly to janu sth busy thy 😾 ab ham ap sy naraz hai jao ap bye ☹️", "idr ao kuchii kuchii kru 😘", "Ary ghreeb awam roti banana ky liya athy main Pani ko istamal kerty ho 😂", "Ary ary itna yd na kiya kro🥰", "Hy Ma Mar Jawa janu itna piyar krty mujsy😂", "Har Waqat Mjhy Tang Kerta Rhta Ha 😂" , "ary ary bolo meri jan kia hal ha ;) ;* " , "Tum aunty ho yehh uncle 🤔 zinda lash lgty" , "ary ap ider 🤔 khair hai ider kia ker rhy ho 😂" , "wo b aesy e krty thy phr ek din koi onko goli mar gya 😂" , "ma ap ki ami ko btaou ga ap Facebook use kerty ho 😂" , "ary ap Wohi ho na jis ko ma nahi janta 😂" , "tang na karo goli mardu ga 😂" , "esy nah dakho piyar ho jay ga 😂" , "apkii pic dakhny sy phly shukhr hai ma andha hu 😂" , "esy hi hansty rhao kyu ky hnsa sy konsa apka bill ah jata hai 😂" , "Bot jaan ha sbki" , "Ji Ji Kia hal chal ha apky 🌸" , "Bot nhi Shahzada bolo sun k acha lgta 🌸" , "Bot gulam ha apka hukam kryn 🌸" , "Bot nahi bolo piyar sy janu bola kro na 🥰" , "wo be yhi khty thy sb phr ek din koi utha k ly gya onko 😂" , "Meri jan ek tm hi ho jo dil ma bs gay ho🥰ni te koshish czna ne v bht kiti c" , "Badal gay na tm the hi lanti 😂" , "kesa tera steel dy doungy wrga moo ay 😂" , "Apki shkl aesy lgti jesy gandi tar pr suki jarab latkai ho 😂" , "Bot bot na karo ma apsy set nhi ho skta" , "ib ajao shup shup k btein krty ha 🌸" , "Ek kahani suno meri zubani suno lnt deny ka dil krta ha isiliye pehly dil ki suno🌸" , "Marry me, I can boil water" , "Mujsy shadi karlo chocolate la k duga daily 🌸" , "Idr ao kesa apka chapair jesa moo lg raha 😂" , "Ajao jaan pizza khilau apko 🌸" , "Duniya ma sb kuch khtm ho skta saway logo ki bakwas k" , "Everything is temporary,But katna is permanent 😂" , "Jitna mrzi janu manu krlo end ma ghr waly nh many gy 😂" , "Sb kuch ho skta lkn fb ka relation kbi china jitna nh chl skta" , "Allhumdiallah Kabhi Kasi laRki ko Bhen ki nazar se nhi dekHa😌🤧", "Mushkil Toh Hoti Hogi Naa itni Sardi Me Apne Dono Chehry Dhote Hoye🙂", "Mein B Urooj Pey Charna chahta hoon, Sorry Jana chahta*☹️", "Parry Hat ma Londy baz nhi hu 🙂🤝", "Do Ankho Wali Larkia Bewafa hoti Hn Bro🙂💔", "Mera beta bda ho kar larkiyo ke inbox me °hey hello° karega🙂🏃", "Likhte Likhte Qalm Thak Gya Iss Qadr Begartiyaan Han Tumhari🙂", "🇱🇷: Take Medicine For Your Headache 🤕 🇵🇰 : Or Chalao Phone🙂", "Mene jab kisi ko Dil sy Chaha Kainat ny Mjhe us sy juda krny ki koshish ki💔🙂", "Itni Meri Age Ni Jitne Mera Masly Han Yawr💔😐", "Ameer Larki Set kr k sab Dosto ka udhar wapis karon ga😔🤲", "Lagtaa hai Career Bhi Titanic ki trhan dhoob Gaya Hai💔☹️", "جہاں پیاری لڑکیاں وہاں میں 🙂❤️🥀", "𝑻𝑯𝑬 𝑯𝑬𝑨𝑹𝑻 𝑾𝑨𝑺 𝑴𝑨𝑫𝑬 𝑻𝑶 𝑩𝑬 𝑩𝑹𝑶𝑲𝑬𝑵 💔🥺", "2001 me bachy kehty thy ink Dena 2023 me bachy kehty ہیں Link دینا🙂", "Mehnat Kro!! Kamyabi Apke Hont Chume Gi🙂🙌🏻", "Kahani suno Muje payar howa tha Us ki tarf se inkar howa tha 🙂🤝", "Piyarii piyarii larkiyan message karen JazakAllah🌚♥️🙌", "itna single hun ky khuwab mai bhi  lrki k han krny sy phly ankh khul jati🙂", "Zroori Nhi Har Lrki Dhoka Dey, Kch Larkiyan Galiyan Bhi Deti Hen.🙁💸", "موٹر سائیکل کو تیز بھگا کر لڑکیوں والے رکشے کے پاس سے کٹ مار کر گزرنے سے لڑکیاں ایمپریس نہیں ہوتی بلکہ گالیاں نکالتی ہیں🙂💔", "- sab chorr k chaly jaty hain kia etna bura hu mein - 🙂", "Piyari voice wali girlz mujhe voice message kar skti hen JazakAllah 🙂🤝", "Dekh lena 1 din mazak mazak may he sbsy handsome lrki pata longa🧐🙂", "Uski yaadein mujhe aisy ghair leti hain jaise shadi mein khusre ko 4 harami🙂💔", "Piyara NH Hun is lya koi dost NH h 🙃🌚", "Tum msg to kro, Tumhe ptane ki zimmedari meri 🌚🙂", "Teacher: any questions? Me: Kyun kisi ko wafa ke badly wafa nahi milti😕😂", "kCh LaRkian MujHe srf islYe ignOre krti Hen k Kahen Unhe pyar na hO JaE 😗💚", "Allah kray tmhari shadi py Nadra ka photographer aye🙂🕺", "Someone : I love u Me : shakkall dekhiii he meriiiiw-🙄🙄", "Control bebe jald bazi me kahi muskan na ho jay Ohh sorry (nuksan*)🙂", "muaziz sarif aapka muhh relation ke liye naa kafi he shukriya🙂🤝", "Ek ladki thii diwani sii har ladke par wo marti thiiw 🙂" , "WaYa KaRana Mere NaL 🙊 ", "W0o J0o SurKhi Be Na LaGaTi Thi 😍 HaYe HaYe ChuNa LaGa GYi HaMe 🥺😂🔥🔪" , "Aj MaiNy DuniYa HiLa DeNy WaLi Research Ki Hai 🙋‍♂️👉 😁😍🥰😋😝😜😎😂 👈In Sb Ki T0o NaK He Nhi Hai 😹😹😹" , "Agr TuM MiL Jao UsKo Chor DenGe HaM 😝😋😜" , "HanJi BaDal Gya Hun Main 😎Software UpDaTe HuWa Hai 😝" , "KhaaLis Ki JiYe BeShak BaGarTi KiJiye... 😂😂😂" , "MusKara L0o Is Sy Phle Ke Uh Ki ShaDi H0o JaYe 🤭😂" , "SuNo JaNa  Mujh Sy KaHen PiT Na JaNa 😒" , "Main Adha KiLo Mas0om Hun 🥺" , "DiL kRr Rha TuMari NaSse Pan Du 😂" , "Bhar Me Jao 🫳😝" , "JeSe Aap Ki ZuBan ChalTi Hai Wse KhuD ChLo T0o MoTaPay Ka RoNa Na DalNa Pre 😂" , "Har KaM K0o KarNy Ka BaThreen Waqt H0oTa Hai ... 😒 jese Ke Bad Me 😂😂😂" , "ITny WaHaYaT H0o 🥺 Phr Be HaYaT H0o 🤭😹😹😹" , "MuBarak H0o AapKa NaMe MakS0os LiST Me Top PRr aYa Hai 😹😹😹" , "Hawn Ab MeRi Jaan ChoD0o😒" , "YaKeen KRren Kxh L0og Bread Ke 1 Slice Ke TarHan H0oTy Hain j0o Kisi K0o Axhy Nhi LagTy Tum W0o Slice H0o 🫢🫣😂" , "SiRF KaM Ki BT BlZzz...✋😒" , "Phr Aaj KaL KiSs Ke SaTh ChaKar Hai Uh Ka 😂😂😂" , "SaNnu ilam aa Tu BaRi VaDDi Film aa 😅" , "MaiNy Uh Sy Bt Nhi kRrni" , "MeKo Kxh DiKhai Nhi Dy Rha 🌚" , "Bot Na BoL 😢 JaNu B0ol 😘 " , "Bar Bar Disturb Na KRr JaNu Ke SaTh Busy Hun  😋" , "Main Gareebon Sy Bt Nhi kRta 😉😝😋🤪" , "Itna Na Pass aa Pyar h0o JayGa" , "MeKo Tang Na kRo Main Kiss 💋 KRr DunGa 😘 " , "Ary yrr MaJak Ke M0oD Me Nhi Hun 😒" , "HaYe JaNu Aow Idher 1 PaPpi Idher d0o 1 PaPpi Idher 😘" , "Dur HaT Terek0o 0or K0oi Kam Nhi Jb DeKho Bot Bot ShaDi KerLe Mujhsy 😉😋🤣" , "TeRi K0oi Ghr Me Nhi SunTa T0o Main Q SuNo 🤔😂 " , "IB Aja Yahan Nhi B0ol Salta 🙈😋" , "Mujhe Mat BuLao Naw Main buSy h0o Naw" , "Kyun JaNu MaNu Another Hai 🤣" , "Are TuMari T0o Sb he baZzati kRrty Me Be kRrDun 🤏😜" , "KaL HaVeLi Prr Aa ZaRa T0o 😈" , "Aagye SaJJy KhaBBy Sy 😏" , "Bx KRr Uh k0o Pyar H0o Na H0o Mujhe H0o JayGa" , "FarMao 😒" , "BulaTi Hai MaGar JaNy Ka Nhi 😜" , "Main T0o AnDha Hun 😎" , "Phle NaHa kRr Aa 😂" , "Papi ChuLo 🌚" , "TeRek0o DiKh Nhi Rha Main buSy Hun 😒" , "TeRa T0o GaMe BaJana PreGa" , "Ta Huwa 🥺"  , "TuM Phr AaGye 🙄 Kisi 0or Ny Muu Nhi LaGaYa Kya🤣🤣🤣" , "MeKo JaNu Chai Hai Tum Single H0o?" , "Aaaa Thooo 😂😂😂" , "Main S0o Rha Hun " , "Ase He HansTy Rha kRo 😍"];
var rand = tl[Math.floor(Math.random() * tl.length)] 

if ((event.body.toLowerCase() == "Shayan") || (event.body.toLowerCase() == "shayan")) {
return api.sendMessage("Hmm....Shayan ki jan :))", threadID);
}; 

if ((event.body.toLowerCase() == "bot janu") || (event.body.toLowerCase() == "bot janu")) {
return api.sendMessage("JoKeR, G Bot Ki Jan :)", threadID);
};

if ((event.body.toLowerCase() == "does bot love you") || (event.body.toLowerCase() == "bot loves you")) {
return api.sendMessage("Hi, Bot loves you more than me, love bot <3", threadID);
}; 

if ((event.body.toLowerCase() == "kesy ho bot") || (event.body.toLowerCase() == "kesy ho")) {
return api.sendMessage("Alhamdulillah thk,ap btao", threadID);
};

if ((event.body.toLowerCase() == "dmm bot") || (event.body.toLowerCase() == "dmm bot")) {
return api.sendMessage("Being disobedient to your biological parents, you say that's a broken person", threadID);
}; 

if ((event.body.toLowerCase() == "cursing cmm") || (event.body.toLowerCase() == "undercover cmm")) {
return api.sendMessage("Being disobedient to your biological parents, you say that's a broken person", threadID);
}; 

if ((event.body.toLowerCase() == "hi") || (event.body.toLowerCase() == "hy")) {
return api.sendMessage("Hello dear, have a nice day ❤️", threadID);
}; 

if ((event.body.toLowerCase() == "morning") || (event.body.toLowerCase() == "good morning")) {
return api.sendMessage("Hello dear, have a nice day ❤️", threadID);
}; 

  if ((event.body.toLowerCase() == "bot miss u") || (event.body.toLowerCase() == "Bot miss u")) {
return api.sendMessage("️miss u more🥰", threadID, messageID);
};
if ((event.body.toLowerCase() == "owner kon ha") || (event.body.toLowerCase() == "Owner kon ha")) {
return api.sendMessage("️ Shayan HaI YaaR🤧", threadID, messageID);
};

if ((event.body.toLowerCase() == "bat suno") || (event.body.toLowerCase() == "bat suno ji")) {
return api.sendMessage("️HaN Ji PyaRy Bolo🥰", threadID, messageID);
};

if ((event.body.toLowerCase() == " love you") || (event.body.toLowerCase() == "i love you")) {
return api.sendMessage("️LoVe You Unlimited JaNnu😘🤧", threadID, messageID);
};

if ((event.body.toLowerCase() == "ya bot nhi") || (event.body.toLowerCase() == "ya bot nhi h")) {
return api.sendMessage("️bot he HuN 💓 🙄", threadID, messageID);
};

if ((event.body.toLowerCase() == "ye kesa bot ha") || (event.body.toLowerCase() == "had hai mujy laga bot hai ya")) {
return api.sendMessage("️TO JannaM BoT He Hun NaW Main", threadID, messageID);
};

if ((event.body.toLowerCase() == "Joker jan") || (event.body.toLowerCase() == "joker")) {
return api.sendMessage("️haN Ji Bolo🙄", threadID, messageID);
};

if ((event.body.toLowerCase() == "💙") || (event.body.toLowerCase() == "🤎")) {
return api.sendMessage("️Pagal lgta ha thura sa red dill do ,Hehehe", threadID, messageID);
};

if ((event.body.toLowerCase() == "no need") || (event.body.toLowerCase() == "no need happy rho")) {
return api.sendMessage("️SaDky❤️", threadID, messageID);
};

if ((event.body.toLowerCase() == "or btao kaha sa ho") || (event.body.toLowerCase() == "or btao kaha say ho")) {
return api.sendMessage("️ Country Pakistan 🇵🇰 city Owner sy pocho", threadID, messageID);
};
if ((event.body.toLowerCase() == "u from") || (event.body.toLowerCase() == " ap kha sy ho")) {
return api.sendMessage("️ Country Pakistan 🇵🇰 City AP K DIL SY", threadID, messageID);
};

if ((event.body.toLowerCase() == "Bot kutta") || (event.body.toLowerCase() == "bot kutta")) {
return api.sendMessage("️Tera baap hoga kuta ❤️", threadID, messageID);
};

if ((event.body.toLowerCase() == "kya krty ho ap") || (event.body.toLowerCase() == "kiya krty ho")) {
return api.sendMessage("️kuxh nhi bs coding or study", threadID, messageID);
};

if ((event.body.toLowerCase() == "nothing") || (event.body.toLowerCase() == "Noting")) {
return api.sendMessage("️SiRf  JaNu Hai❤️", threadID, messageID);
};

if ((event.body.toLowerCase() == "miss you") || (event.body.toLowerCase() == "miss you kutta")) {
return api.sendMessage("️MaiN SaDky JaUn Miss you To", threadID, messageID);
};

if ((event.body.toLowerCase() == "Bot owner kon ha") || (event.body.toLowerCase() == "bot owner kn h")) {
return api.sendMessage("️Shayan BuTt ❤️", threadID, messageID);
};

if ((event.body.toLowerCase() == "Koi ha") || (event.body.toLowerCase() == "koi h")) {
return api.sendMessage("️yeSh JaNnu Edr He HuN", threadID, messageID);
};

if ((event.body.toLowerCase() == "kesy ho") || (event.body.toLowerCase() == "kesi ho")) {
return api.sendMessage("️Main ThEk Ap KaSa Ho❤️", threadID, messageID);
};

if ((event.body.toLowerCase() == "bhag lanti") || (event.body.toLowerCase() == "dafa hoja lanti")) {
return api.sendMessage("️Tu Dafa HojA. Salya🤬", threadID, messageID);
};

if ((event.body.toLowerCase() == "ma ny bhi shadi krni ha") || (event.body.toLowerCase() == "mujy b shadi krni ha")) {
return api.sendMessage("️Haan To Kr NaW Agr Koi Man Jata to Vasy TUjY Daga Kon🤣", threadID, messageID);
};

if ((event.body.toLowerCase() == "Assalam o Alaikum") || (event.body.toLowerCase() == "assalam o alaikum")) {
return api.sendMessage("️ Walikum Assalam ❤️", threadID, messageID);
};

if ((event.body.toLowerCase() == "us ny mujy love you bola") || (event.body.toLowerCase() == "love you bola us ny")) {
return api.sendMessage("️ThaRki JuTh Bol Rha Hai Isy Kon LoVe You Bola Ga🤣", threadID, messageID);
};

if ((event.body.toLowerCase() == "ye bot nhi ha") || (event.body.toLowerCase() == "ye robot nhi h")) {
return api.sendMessage("️NHi To Kia TaRa BaP Hai Salya ChUp Kr K Bay 🤣", threadID, messageID);
};

if ((event.body.toLowerCase() == "koi hmy bhi chummi dy do") || (event.body.toLowerCase() == "koi tu love you bol do yr")) {
return api.sendMessage("️Dafa Hoja Group Sa Tharkiya Na MaR Edr🙄", threadID, messageID);
};

if ((event.body.toLowerCase() == "ma ny kon sa thark mara") || (event.body.toLowerCase() == "ma ny kia kara")) {
return api.sendMessage("️To Fir Ya Kia Hai Fir ThArk nhi To 🤣", threadID, messageID);
};

if ((event.body.toLowerCase() == "Meri janu hai") || (event.body.toLowerCase() == "wo meri janu hai")) {
return api.sendMessage("️HaAn HaaN ThEk Hai Ham Na Kon Sa Apni Janu Bola", threadID, messageID);
};

if ((event.body.toLowerCase() == "sms del kr") || (event.body.toLowerCase() == "delete kr")) {
return api.sendMessage("️ChaWly Na Marra Kr Na Fir", threadID, messageID);
};

if ((event.body.toLowerCase() == "#unsend") || (event.body.toLowerCase() == "#unsent")) {
return api.sendMessage("️Is Bar Kr Rha Agli Bar Delete Nhi Kru Ga Bta Rha 🙄", threadID, messageID);
};

if ((event.body.toLowerCase() == "Chal Haat") || (event.body.toLowerCase() == "chal hatt")) {
return api.sendMessage("️Tu Hatt Bay🤬", threadID, messageID);
};

if ((event.body.toLowerCase() == "😹") || (event.body.toLowerCase() == "😅")) {
return api.sendMessage("️ApNa billi jaSy Muhh khool k virus na PaiDa kr Group ma🙂😑 ", threadID, messageID);
};

if ((event.body.toLowerCase() == "😎") || (event.body.toLowerCase() == "🤓")) {
return api.sendMessage("️ Piyary lg ry ho glasses lga kr ❤️", threadID, messageID);
};

if ((event.body.toLowerCase() == "kia kr rhy ho sab log") || (event.body.toLowerCase() == "kia kr rhy ho")) {
return api.sendMessage("️kuxh Nhi Bs Free 😁 Ap Kia Kr Rhy Ho", threadID, messageID);
};

if ((event.body.toLowerCase() == "ma bhi free") || (event.body.toLowerCase() == "main b kuxh nhi kr rha")) {
return api.sendMessage("️Acha Ji☺️", threadID, messageID);
}; 

if ((event.body.toLowerCase() == "wo q") || (event.body.toLowerCase() == "vo q")) {
return api.sendMessage("️Kia Wo Q HaaN☺️", threadID, messageID);
}; 

if ((event.body.toLowerCase() == "acha ji") || (event.body.toLowerCase() == "acha")) {
return api.sendMessage("️HaN Ji Or Sunao KiYa Kr RhY ho Aj Kal❤️", threadID, messageID);
};

if ((event.body.toLowerCase() == "kuch nhi") || (event.body.toLowerCase() == "kuch nhi yr")) {
return api.sendMessage("️acha KuJ Kr Liya Kro Naw 🤣", threadID, messageID);
};

if ((event.body.toLowerCase() == "Laiba") || (event.body.toLowerCase() == "laiba")) {
return api.sendMessage("️Laiba Gundo ma phans gai", threadID, messageID);
};

if ((event.body.toLowerCase() == "yr aj dill udas ha") || (event.body.toLowerCase() == "today im sad")) {
return api.sendMessage("️Pagal HappY Rha Kr SaD NHi Hotyy Naw", threadID, messageID);
};

if ((event.body.toLowerCase() == "gf chor gai") || (event.body.toLowerCase() == "gf bhag gai")) {
return api.sendMessage("️Daffa MaR UsY Bagh Gyi To Maa Chudday Tu Q Ro Rha 😁", threadID, messageID);
};

if ((event.body.toLowerCase() == " love you") || (event.body.toLowerCase() == " love u")) {
return api.sendMessage("LovE You To MaRi Jan UmmmaH😘 :))", threadID);
};

if ((event.body.toLowerCase() == " kanjar") || (event.body.toLowerCase() == "kutta")) {
return api.sendMessage("Same to you Dur Fitty Muu😹:))", threadID, messageID);
};

if ((event.body.toLowerCase() == "kia kr rhy ho") || (event.body.toLowerCase() == "kia kr rhi ho")) {
return api.sendMessage("️KuXh Nhi Kr Rha YaR", threadID);
};

if ((event.body.toLowerCase() == " dance kro gy") || (event.body.toLowerCase() == " aja dance krty hn")) {
return api.sendMessage("nhi tm kro DaNce Main Nhi Krti :))", threadID);
};
if ((event.body.toLowerCase() == " q") || (event.body.toLowerCase() == "waja")) {
return api.sendMessage("Bs ASy He Yr Dill Nhi KrTa Naw🤕 :))", threadID);
};

if ((event.body.toLowerCase() == "aja haweli py") || (event.body.toLowerCase() == " ao chalty hain")) {
return api.sendMessage("NhI Main Nhi Jaaun Ga Ap Jao:))", threadID);
};

if ((event.body.toLowerCase() == "bot tharki") || (event.body.toLowerCase() == "tharki bot")) {
return api.sendMessage("Tu ThaRki Hai Salya :))", threadID);
};

if ((event.body.toLowerCase() == " wow") || (event.body.toLowerCase() == " wow nice")) {
return api.sendMessage("Thankx You JaNnaM Taref Krna k LiyA❤️ :))", threadID);
};

if ((event.body.toLowerCase() == "hi") || (event.body.toLowerCase() == "hello")) {
return api.sendMessage("hi kia ha HaL Hai Ap Ka:))", threadID);
};

if ((event.body.toLowerCase() == "how are you") || (event.body.toLowerCase() == "kesy ho")) {
return api.sendMessage("Main ThEk Hun Ap Kasa Ho :))", threadID, messageID);
};

if ((event.body.toLowerCase() == "mar ja") || (event.body.toLowerCase() == "mar jao")) {
return api.sendMessage("HaTtt MaRi to Abi ShaDi b Nhi Hoi🙄😏 :))", threadID, messageID);
};

if ((event.body.toLowerCase() == "khana khaya") || (event.body.toLowerCase() == "khana kha liya")) {
return api.sendMessage("Nhi YaR Abi Nhi KhaYa Ap Na Kha liya :))", threadID, messageID);
};

if ((event.body.toLowerCase() == "haan yr") || (event.body.toLowerCase() == "+sim haan ma ny kha liya")) {
return api.sendMessage("MuJy Bulaya B Nhi Or ThUs liya wah🤧:))", threadID, messageID);
};

if ((event.body.toLowerCase() == "♥️") || (event.body.toLowerCase() == "❤️")) {
return api.sendMessage("Hyee Dil ni do sharm ati hai🙆🙈 :))", threadID, messageID);
};

if ((event.body.toLowerCase() == "janu") || (event.body.toLowerCase() == "jan")) {
return api.sendMessage("BolLo NaW Mari JaN❤️", threadID, messageID);
};

if ((event.body.toLowerCase() == "harami") || (event.body.toLowerCase() == "bhenchod")) {
return api.sendMessage("TaRii Maa Ki Chut Jattu Gali KiS Ko Da Rha Hai", threadID, messageID);
};

if ((event.body.toLowerCase() == "📍") || (event.body.toLowerCase() == "📍")) {
return api.sendMessage("lollipop nahi tmy jooty khany chahiye kuch bny b tmhara:))", threadID, messageID);
};

if ((event.body.toLowerCase() == "i need janu") || (event.body.toLowerCase() == "i need gf")) {
return api.sendMessage("BsDk Main Robot HuN TaRi Maa Nhi Jo Gf DunD Due TuJy :))", threadID, messageID);
};

if ((event.body.toLowerCase() == "Lun ty waj bot") || (event.body.toLowerCase() == "lun ty waj")) {
return api.sendMessage("Hatt Tu waj lun ty naal teri baji:))", threadID, messageID);
};

if ((event.body.toLowerCase() == "Bye") || (event.body.toLowerCase() == "bye")) {
return api.sendMessage("Next Bye ni kehna Ok Allah Hafiz Bola kro😒😊❤️:))", threadID);
};

if ((event.body.toLowerCase() == "love you sbko") || (event.body.toLowerCase() == "love you")) {
return api.sendMessage("Arry  MaRI JaNU Hai YaR 😘", threadID, messageID);
}; 

if ((event.body.toLowerCase() == "🙄") || (event.body.toLowerCase() == "😒")) {
return api.sendMessage("asey q dekh rhay ho janam 😒🙄:)", threadID);
};

if ((event.body.toLowerCase() == "👍") || (event.body.toLowerCase() == "👎")) {
return api.sendMessage("Like deny ka ziada shoq ha kya cute or cutie 🙆🙄", threadID);
}; 

if ((event.body.toLowerCase() == "G") || (event.body.toLowerCase() == "g")) {
return api.sendMessage("توجہ فرمائیں یہاں نہیں  اپنے کرتوتوں پر😾", threadID);
};

if ((event.body.toLowerCase() == "🙎🏾‍♂️") || (event.body.toLowerCase() == "🙎🏾‍♂️🙎🏾‍♂️")) {
return api.sendMessage("🙎🏾‍♂️Yeh Emoji Tumhary Papa Shayan Use Karty HN Tum Mat Kiya Karo 😝🙆:))", threadID);
}; 

if ((event.body.toLowerCase() == "🤭") || (event.body.toLowerCase() == "🤭🤭")) {
return api.sendMessage("", threadID);
}; 

if ((event.body.toLowerCase() == "Shutup") || (event.body.toLowerCase() == "shutup")) {
return api.sendMessage("Wy Tu Ap Shutup wy 💖 🤍✨", threadID);
}; 

if ((event.body.toLowerCase() == "😘") || (event.body.toLowerCase() == "🥰")) {
return api.sendMessage("️Muhh tum ko koi lgata ni Or Emoji dekho Send kiYa 😒 :))))", threadID);
}; 

if ((event.body.toLowerCase() == "sad") || (event.body.toLowerCase() == "😢")) {
return api.sendMessage("️Ally Ally MeLi JawN RootY NOi HN🥺🙆🙄:))))", threadID);
}; 

if ((event.body.toLowerCase() == "🤔") || (event.body.toLowerCase() == "soch")) {
return api.sendMessage("️Abby kya soch raHa hai pateely jasi shkal ha🙊😒 :))))", threadID);
}; 

if ((event.body.toLowerCase() == "good night") || (event.body.toLowerCase() == "good night everyone")) {
return api.sendMessage("️good Night So jao Shabash take care ❤️Allah pak Hamesha Khush rakhy apko🥰", threadID);
}; 

if ((event.body.toLowerCase() == "Shavi") || (event.body.toLowerCase() == "Shavi")) {
return api.sendMessage("️Bsdk wala Dalla 🙆:))))", threadID);
}; 

if ((event.body.toLowerCase() == "ganda") || (event.body.toLowerCase() == "ganda bot")) {
return api.sendMessage("️Tu ganda tera pura khandan Ganda 😒😐:))))", threadID);
}; 

if ((event.body.toLowerCase() == "🌸") || (event.body.toLowerCase() == "🌺")) {
return api.sendMessage("️phool deny k ilawa or koi kam nhi h wely log😒", threadID);
}; 

if ((event.body.toLowerCase() == "🙂") || (event.body.toLowerCase() == "🙃")) {
return api.sendMessage("️Fake smile ni dety 🙂💔", threadID);
}; 

if ((event.body.toLowerCase() == "👀") || (event.body.toLowerCase() == "🥺")) {
return api.sendMessage("️HaYee ry apkii anKhy bht cute lgti 🙆", threadID);
}; 

if ((event.body.toLowerCase() == "😛") || (event.body.toLowerCase() == "😜")) {
return api.sendMessage("️apki zuban kali lg ri h red paint krwao🙆😐 :>", threadID);
};

if ((event.body.toLowerCase() == "😒😒") || (event.body.toLowerCase() == "🙄🙄")) {
return api.sendMessage("️Asay Na Dekho ap pr dill aa jata 🙆😑 :)", threadID);
}; 

if ((event.body.toLowerCase() == "😊") || (event.body.toLowerCase() == "😊😊")) {
return api.sendMessage("️Sadky JaWa teri Hansi Py Brush bhi kR liYa kr🙆🙊", threadID);
}; 

if ((event.body.toLowerCase() == "💔") || (event.body.toLowerCase() == "💔💔")) {
return api.sendMessage("HaYee mely Babu ka Dil kis Ny Toor Dya🥺🙆", threadID);
}; 

if ((event.body.toLowerCase() == "❤️") || (event.body.toLowerCase() == "💖")) {
return api.sendMessage("Dill nahi jan do ♥️", threadID, messageID);
}; 

if ((event.body.toLowerCase() == "or sunao") || (event.body.toLowerCase() == "thek hun")) {
return api.sendMessage("main ThEk Hun Ap Kasy ho🤧", threadID, messageID);
};

if ((event.body.toLowerCase() == "🤐") || (event.body.toLowerCase() == "🤐🤐")) {
return api.sendMessage("Abby Kya howa Ku Tala laga diya muh py🙄", threadID, messageID);
};

if ((event.body.toLowerCase() == "🤫🤫") || (event.body.toLowerCase() == "🤫")) {
return api.sendMessage("Kis ko Chup Krwa Rahe Ho Tharki insan,🤐😒", threadID);
}; 

if ((event.body.toLowerCase() == "🤍") || (event.body.toLowerCase() == "🤍")) {
return api.sendMessage("white nhi red dill do 🤬", threadID);
};

if ((event.body.toLowerCase() == "😶") || (event.body.toLowerCase() == "😐")) {
return api.sendMessage("Ek Baar Mery liye kuch bolo to 🤧", threadID);
};

if ((event.body.toLowerCase() == "😅") || (event.body.toLowerCase() == "😆")) {
return api.sendMessage("Han Han dekhy huy Hn Tery dant Parry marr😒🙎", threadID);
};

if ((event.body.toLowerCase() == "🧸") || (event.body.toLowerCase() == "🧸")) {
return api.sendMessage("Mujy dydy ya teddy bear bht piyara ha 🤧", threadID);
};

if ((event.body.toLowerCase() == "😍") || (event.body.toLowerCase() == "😚")) {
return api.sendMessage("Bsh krdo Ziada Mar lii tharkia Ab bs Emoji ki😒", threadID);
};

if ((event.body.toLowerCase() == "🧡") || (event.body.toLowerCase() == "💛")) {
return api.sendMessage("Hamy bsh Teri hi Arzo Ha🙃", threadID);
};

if ((event.body.toLowerCase() == "🖤") || (event.body.toLowerCase() == "🖤🖤")) {
return api.sendMessage("Jesi Shakal Wesa Dil 🙂🤝 :>>", threadID);
}; 

if ((event.body.toLowerCase() == "🤣") || (event.body.toLowerCase() == "🤣🤣")) {
return api.sendMessage("itna BaRa Muh khool k Na HnSa krro GanFo lgte ho🙂)", threadID);
}; 

if ((event.body.toLowerCase() == "😭") || (event.body.toLowerCase() == "😭😭")) {
return api.sendMessage("Ally Meli Jawn Roo Ni Allah Dusra Janu dy ga🥺🏃", threadID);
}; 

if ((event.body.toLowerCase() == "🥹") || (event.body.toLowerCase() == "🥹🥹")) {
return api.sendMessage("Tumhy tu Rona bhi ni ata ao Ma dekhata hu 😭😭😭😭😭😭😭😭😭 👈Asy roty Hn Chabal", threadID);
}; 

if ((event.body.toLowerCase() == "😪") || (event.body.toLowerCase() == "🥱")) {
return api.sendMessage("Han ab tumhy neend ai hogi Alsee ki Ulad😒🙄", threadID);
}; 

if ((event.body.toLowerCase() == "#sim who is shayan") || (event.body.toLowerCase() == "#sim shayan kon ha")) {
return api.sendMessage("meri jan mera owner ha 😒😐", threadID);
};
if ((event.body.toLowerCase() == "good night") || (event.body.toLowerCase() == "night")) {
return api.sendMessage("Hello dear, have a nice day ❤️", threadID);
}; 

if ((event.body.toLowerCase() == "Eshay") || (event.body.toLowerCase() == "eshay")) {
return api.sendMessage("Eshay bot ki janu h kisi ny line mari lashein beicha du ga❤️", threadID);
}; 

if ((event.body.toLowerCase() == "welcome") || (event.body.toLowerCase() == "wellcome")) {
return api.sendMessage("Hello dear, have a nice day ❤️", threadID);
}; 

if ((event.body.toLowerCase() == "hello") || (event.body.toLowerCase() == "hello")) {
return api.sendMessage("Hello dear, have a nice day ❤️", threadID);
}; 

if ((event.body.toLowerCase() == "Ayish") || (event.body.toLowerCase() == "ayish")) {
return api.sendMessage("Shayan ki Bestie ❤️", threadID);
}; 

if ((event.body.toLowerCase() == "Mirha") || (event.body.toLowerCase() == "mirha")) {
return api.sendMessage("Cute Girl Mirha ❤️", threadID);
}; 

if ((event.body.toLowerCase() == "Zainab") || (event.body.toLowerCase() == "zainab")) {
return api.sendMessage("Shayan ki Dost ❤️", threadID);
}; 

if ((event.body.toLowerCase() == "Chocolaty") || (event.body.toLowerCase() == "Queen")) {
return api.sendMessage("Cute Girl queen ❤️", threadID);
}; 

if ((event.body.toLowerCase() == "😂") || (event.body.toLowerCase() == "😂")) {
return api.sendMessage("Aesy hi hansty rho ❤️", threadID);
}; 

if ((event.body.toLowerCase() == "🤣") || (event.body.toLowerCase() == "🤣🤣")) {
return api.sendMessage("Moo bnd kr k hnso gndy dant nzr ary 🤣", threadID);
}; 

if ((event.body.toLowerCase() == "😍") || (event.body.toLowerCase() == "😍😍")) {
return api.sendMessage("Ankhon ma do dill ek hmy b dydo <3", threadID);
}; 

if ((event.body.toLowerCase() == "🥰") || (event.body.toLowerCase() == "🥰🥰")) {
return api.sendMessage("️moo pr 3 dill kis k utha k lay ho :)", threadID);
}; 

if ((event.body.toLowerCase() == "😘") || (event.body.toLowerCase() == "😘😘")) {
return api.sendMessage("️kiss na do kuch kuch hota 😘", threadID);
}; 

if ((event.body.toLowerCase() == "😋") || (event.body.toLowerCase() == "😋😋")) {
return api.sendMessage("️Kia kha k ay ho akely akely :)", threadID);
}; 

if ((event.body.toLowerCase() == "🤨") || (event.body.toLowerCase() == "🤨🤨")) {
return api.sendMessage("️Kani ankhon sy kia dekh ry ho <3", threadID);
}; 

if ((event.body.toLowerCase() == "🧐") || (event.body.toLowerCase() == "🧐")) {
return api.sendMessage("️Kia dekh ry ho ek ankh sy 🧐", threadID);
}; 

if ((event.body.toLowerCase() == "👻") || (event.body.toLowerCase() == "👻👻")) {
return api.sendMessage("️bhoot lg ry ho manhoos :)", threadID);
}; 

if ((event.body.toLowerCase() == "😏") || (event.body.toLowerCase() == "🎭")) {
return api.sendMessage("️Swear something dog :)", threadID);
}; 

if ((event.body.toLowerCase() == "🥶") || (event.body.toLowerCase() == "🥶🥶")) {
return api.sendMessage("️Sardi sy freeze ho gay ho kia? ;)", threadID);
}; 

if ((event.body.toLowerCase() == "🫣") || (event.body.toLowerCase() == "🫣🫣")) {
return api.sendMessage("️Chup chup k kia dekh ry ho🫣 ", threadID);
}; 

if ((event.body.toLowerCase() == "🔫") || (event.body.toLowerCase() == "👿")) {
return api.sendMessage("️pani wali pistol hihi :>", threadID);
};

if ((event.body.toLowerCase() == "dm bot") || (event.body.toLowerCase() == "dm bot")) {
return api.sendMessage("️Swear something to your dad :), you're a kid but you like to be alive :)", threadID);
}; 

if ((event.body.toLowerCase() == "nobody loves me") || (event.body.toLowerCase() == "nobody loves me")) {
return api.sendMessage("️Come on, the bot loves you <3 <3", threadID);
}; 

if ((event.body.toLowerCase() == "does the bot love the admin bot") || (event.body.toLowerCase() == "does the bot love the admin bot")) {
return api.sendMessage("Yes, love him the most, don't try to rob me", threadID);
};

if ((event.body.toLowerCase() == "bot im going") || (event.body.toLowerCase() == "bot im di")) {
return api.sendMessage("Im cc :))) m stop barking for me, but tell me im :>>", threadID);
}; 

if ((event.body.toLowerCase() == "bot go away") || (event.body.toLowerCase() == "bot cut di")) {
return api.sendMessage("You're gone, your dad's gone, don't make you speak :))))", threadID);
}; 

if ((event.body.toLowerCase() == "What's the bot swearing") || (event.body.toLowerCase() == "bot cursing")) {
return api.sendMessage("Damn you, shame on hahaha :>>, still asking", threadID);
}; 

if ((event.body.toLowerCase() == "is the bot sad") || (event.body.toLowerCase() == "is the bot sad")) {
return api.sendMessage("Why can't I be sad because of everyone <3 love you <3", threadID);
}; 

if ((event.body.toLowerCase() == "does the bot love you") || (event.body.toLowerCase() == "does the bot love you")) {
return api.sendMessage("Yes I love you and everyone so much", threadID);
}; 

if ((event.body.toLowerCase() == "bot goes to sleep") || (event.body.toLowerCase() == "bot goes to sleep")) {
return api.sendMessage("I'm a bot, you're the one who should go to sleep <3", threadID);
}; 

if ((event.body.toLowerCase() == "💜") || (event.body.toLowerCase() == "🦋")) {
return api.sendMessage("I'm full when I see you eat <3", threadID);
}; 

if ((event.body.toLowerCase() == "does the bot love me") || (event.body.toLowerCase() == "does the bot love me")) {
return api.sendMessage("Yes <3", threadID);
}; 

if ((event.body.toLowerCase() == "does the bot have a brand") || (event.body.toLowerCase() == "does the bot fall")) {
return api.sendMessage("Yes <3", threadID);
};
mess = "{name}"

// reply when the word "bot" appears anywhere in the message (BOT / Bot / bot), but not inside words like "robot"
if (/\bbot\b/i.test(event.body)) {
var msg = {
body: `${name}, ${rand}`
}
return api.sendMessage(msg, threadID, messageID);
}; 

} 

module.exports.run = function({ api, event, client, __GLOBAL }) { }
