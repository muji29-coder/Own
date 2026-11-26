// Time helpers in the bot's time zone (config.json "timezone", default Asia/Karachi).
const zone = () => (global.config && global.config.timezone) || "Asia/Karachi";

// {year, month, day, hour, minute, weekday} of a moment in the bot's time zone
function parts(date = new Date()) {
    const p = {};
    for (const x of new Intl.DateTimeFormat("en-GB", { timeZone: zone(), year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false, weekday: "short" }).formatToParts(date))
        p[x.type] = x.value;
    return { year: +p.year, month: +p.month, day: +p.day, hour: +p.hour % 24, minute: +p.minute, weekday: p.weekday };
}

// minutes the time zone is ahead of UTC at that moment
function offsetMinutes(date = new Date()) {
    const p = parts(date);
    return Math.round((Date.UTC(p.year, p.month - 1, p.day, p.hour, p.minute) - Math.floor(date.getTime() / 60000) * 60000) / 60000);
}

// "YYYY-MM-DD" in the bot's time zone
function dayKey(date = new Date()) {
    const p = parts(date);
    return `${p.year}-${String(p.month).padStart(2, "0")}-${String(p.day).padStart(2, "0")}`;
}

// next moment (ms) when the clock in the bot's time zone shows hour:minute (today if still ahead, else tomorrow)
function nextAt(hour, minute, from = Date.now()) {
    const p = parts(new Date(from));
    let t = Date.UTC(p.year, p.month - 1, p.day, hour, minute) - offsetMinutes(new Date(from)) * 60000;
    if (t <= from) t += 24 * 60 * 60 * 1000;
    return t;
}

// "5:30 PM" style text for a moment
function clock(ms) {
    return new Intl.DateTimeFormat("en-US", { timeZone: zone(), hour: "numeric", minute: "2-digit", hour12: true }).format(new Date(ms));
}

module.exports = { parts, dayKey, nextAt, clock, zone };
