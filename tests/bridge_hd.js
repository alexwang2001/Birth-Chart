const fs = require('fs');
const path = require('path');
const vm = require('vm');
const readline = require('readline');

// Load file contents
const vsopPath = path.join(__dirname, '../js/core/vsop87a_milli.js');
const corePath = path.join(__dirname, '../js/core/astro-core.js');
const hdPath = path.join(__dirname, '../js/core/human-design-core.js');
const dataPath = path.join(__dirname, '../js/data/astro-data.js'); // Might be needed if astro-core relies on it

let vsopCode = '';
let coreCode = '';
let hdCode = '';
let dataCode = '';

try {
    vsopCode = fs.readFileSync(vsopPath, 'utf8');
    coreCode = fs.readFileSync(corePath, 'utf8');
    hdCode = fs.readFileSync(hdPath, 'utf8');

    // Attempt to read data path, but it might not be strictly required for HD if HD doesn't use it directly
    if (fs.existsSync(dataPath)) {
        dataCode = fs.readFileSync(dataPath, 'utf8');
    }

    // Explicitly attach functions to global object for reliability
    coreCode += "\n;this.getJulianDate = getJulianDate;";
    coreCode += "\n;this.getHighPrecisionLongitude = getHighPrecisionLongitude;";

    // Attach HumanDesign object
    hdCode += "\n;this.HumanDesign = HumanDesign;";

} catch (e) {
    console.error(JSON.stringify({ error: `Failed to read file: ${e.message}` }));
    process.exit(1);
}

// Create Sandbox
const sandbox = {
    Math: Math,
    console: {
        log: () => { }, // suppress logs
        error: console.error
    },
    Set: Set, // HD Core uses Set
    Object: Object
};

// Create Context
vm.createContext(sandbox);

// Execute Code
try {
    vm.runInContext(vsopCode, sandbox);
    if (dataCode) vm.runInContext(dataCode, sandbox);
    vm.runInContext(coreCode, sandbox);
    vm.runInContext(hdCode, sandbox);
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
        // Expected req: { date: "YYYY-MM-DD", time: "HH:MM" }

        const { id, date, time } = req;

        if (typeof sandbox.getJulianDate !== 'function') {
            throw new Error("getJulianDate not found");
        }
        if (typeof sandbox.HumanDesign !== 'object') {
            throw new Error("HumanDesign object not found");
        }

        const jd = sandbox.getJulianDate(date, time);
        const result = sandbox.HumanDesign.calculate(jd);

        console.log(JSON.stringify({ id, result }));

    } catch (e) {
        console.log(JSON.stringify({ error: e.message }));
    }
});
