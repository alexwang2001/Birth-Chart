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

// Reference Data (from Astro-Seek / Astro-Charts)
const REFERENCES = [
    {
        name: 'Terry Gou (郭台銘)',
        date: '1950-10-18', // UTC 00:00 approx (assuming 8am TPE)
        time: '00:00', // UTC
        expected: {
            'Chiron': 258.25, // Sagittarius 18°15'
            'NorthNode': 356.73 // Pisces 26°44'
        }
    },
    {
        name: 'Jay Chou (周杰倫)',
        date: '1979-01-18', // UTC 08:00 (assuming 16:00 TPE)
        time: '08:00', // UTC
        expected: {
            'Chiron': 35.03, // Taurus 5°2'
            'NorthNode': 170.32 // Virgo 20°19'
        }
    }
];

console.log("================================================================================");
console.log("ASTRO POINTS ACCURACY TEST");
console.log("================================================================================\n");

REFERENCES.forEach(ref => {
    const jd = sandbox.getJulianDate(ref.date, ref.time);

    console.log(`Test Case: ${ref.name}`);
    console.log(`Date (UTC): ${ref.date} ${ref.time} (JD: ${jd})`);
    console.log(`--------------------------------------------------------------------------------`);
    console.log(`| Point       | Expected | Calculated | Error   | Status |`);
    console.log(`|-------------|----------|------------|---------|--------|`);

    for (const [point, expected] of Object.entries(ref.expected)) {
        const calculated = sandbox.getHighPrecisionLongitude(point, jd);
        let diff = Math.abs(calculated - expected);
        if (diff > 180) diff = 360 - diff;

        const status = diff < 1.0 ? 'PASS' : 'FAIL';
        // Detailed check for North Node (expect < 0.1)
        const strictStatus = (point === 'NorthNode' && diff > 0.1) ? 'WARN' : status;

        console.log(`| ${point.padEnd(11)} | ${expected.toFixed(4).padEnd(8)} | ${calculated.toFixed(4).padEnd(10)} | ${diff.toFixed(4).padEnd(7)} | ${strictStatus.padEnd(6)} |`);
    }
    console.log(`--------------------------------------------------------------------------------\n`);
});
