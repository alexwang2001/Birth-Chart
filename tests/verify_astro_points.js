const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load file contents
const vsopPath = path.join(__dirname, '../js/core/vsop87a_milli.js');
const corePath = path.join(__dirname, '../js/core/astro-core.js');

const vsopCode = fs.readFileSync(vsopPath, 'utf8');
const coreCode = fs.readFileSync(corePath, 'utf8');

// Create Sandbox
const sandbox = {
    Math: Math,
    console: console,
};

// Create Context
vm.createContext(sandbox);

// Execute Code
vm.runInContext(vsopCode, sandbox);
vm.runInContext(coreCode, sandbox);

// Test Cases (Times are Local Taiwan Time UTC+8)
const CASES = [
    { name: 'Terry Gou (郭台銘)', date: '1950-10-18', time: '08:00' },
    { name: 'Tsai Ing-wen (蔡英文)', date: '1956-08-31', time: '10:00' },
    { name: 'William Lai (賴清德)', date: '1959-10-06', time: '02:00' },
    { name: 'Wang Yung-ching (王永慶)', date: '1917-01-18', time: '04:00' },
    { name: 'Jay Chou (周杰倫)', date: '1979-01-18', time: '16:00' }
];

const TAIWAN_LON = 121.51;
const TAIWAN_LAT = 25.03;
const TZ_OFFSET = 8; // UTC+8

console.log(`| Name | Date (Local) | UTC | ASC | MC | Chiron | North Node |`);
console.log(`|---|---|---|---|---|---|---|`);

CASES.forEach(c => {
    // Convert Local to UTC
    let [y, m, d] = c.date.split('-').map(Number);
    let [hr, min] = c.time.split(':').map(Number);

    // Simplistic timezone adjustment
    hr -= TZ_OFFSET;
    if (hr < 0) {
        hr += 24;
        d -= 1;
        // Handle month/year rollback simplistic (just likely won't hit edge cases for these specific dates, 
        // but for robustness:
        if (d === 0) {
            m -= 1;
            if (m === 0) { m = 12; y -= 1; }
            // days in previous month... simplistic 30 for now or Date object
            const daysInPrev = new Date(y, m, 0).getDate();
            d = daysInPrev;
        }
    }

    const utcDateStr = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const utcTimeStr = `${String(hr).padStart(2, '0')}:${String(min).padStart(2, '0')}`;

    // Get JD
    const jd = sandbox.getJulianDate(utcDateStr, utcTimeStr);

    // Planets
    const chiron = sandbox.getHighPrecisionLongitude('Chiron', jd);
    const nn = sandbox.getHighPrecisionLongitude('NorthNode', jd);

    // Houses
    const lst = sandbox.getSiderealTime(jd, TAIWAN_LON);
    const houses = sandbox.calculateHouses(lst, TAIWAN_LAT);

    console.log(`| ${c.name} | ${c.date} ${c.time} | ${utcDateStr} ${utcTimeStr} | ${houses.asc.toFixed(2)}° | ${houses.mc.toFixed(2)}° | ${chiron.toFixed(2)}° | ${nn.toFixed(2)}° |`);
});
