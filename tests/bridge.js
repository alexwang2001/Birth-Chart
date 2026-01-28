const fs = require('fs');
const path = require('path');
const vm = require('vm');
const readline = require('readline');

// Load file contents
const vsopPath = path.join(__dirname, '../js/core/vsop87a_milli.js');
const corePath = path.join(__dirname, '../js/core/astro-core.js');
const dataPath = path.join(__dirname, '../js/data/astro-data.js');

let vsopCode = '';
let coreCode = '';
let dataCode = '';

try {
    vsopCode = fs.readFileSync(vsopPath, 'utf8');
    coreCode = fs.readFileSync(corePath, 'utf8');
    dataCode = fs.readFileSync(dataPath, 'utf8');

    // Explicitly attach functions to global object for reliability
    coreCode += "\n;this.getJulianDate = getJulianDate;";
    coreCode += "\n;this.getHighPrecisionLongitude = getHighPrecisionLongitude;";
} catch (e) {
    console.error(JSON.stringify({ error: `Failed to read file: ${e.message}` }));
    process.exit(1);
}

// Create Sandbox
const sandbox = {
    Math: Math,
    console: {
        log: () => { }, // suppress logs from core if any
        error: console.error
    },
    // Mock other potential globals if needed
};

// Create Context
vm.createContext(sandbox);

// Execute Code
try {
    vm.runInContext(vsopCode, sandbox);  // Load VSOP87 first
    vm.runInContext(dataCode, sandbox);
    vm.runInContext(coreCode, sandbox);
} catch (e) {
    console.error(JSON.stringify({ error: `Failed to execute JS: ${e.message}` }));
    process.exit(1);
}

// Setup Stdin Reading
const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
});

rl.on('line', (line) => {
    if (!line.trim()) return;

    try {
        const req = JSON.parse(line);
        // Expected req: { id: <any>, date: "YYYY-MM-DD", time: "HH:MM" }

        const { id, date, time } = req;

        // Call getJulianDate
        if (typeof sandbox.getJulianDate !== 'function') {
            throw new Error("getJulianDate not found in context");
        }

        const jd = sandbox.getJulianDate(date, time);

        const resultPlanets = {};
        const targets = ['Sun', 'Moon', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

        targets.forEach(pid => {
            const lon = sandbox.getHighPrecisionLongitude(pid, jd);
            resultPlanets[pid] = lon;
        });

        console.log(JSON.stringify({ id, planets: resultPlanets }));

    } catch (e) {
        console.log(JSON.stringify({ error: e.message }));
    }
});
