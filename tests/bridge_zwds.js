const fs = require('fs');
const path = require('path');
const vm = require('vm');
const readline = require('readline');

// Load file contents
const dataPath = path.join(__dirname, '../js/data/ziwei-data.js');
const corePath = path.join(__dirname, '../js/core/ziwei-core.js');

let dataCode = '';
let coreCode = '';

try {
    dataCode = fs.readFileSync(dataPath, 'utf8');
    // Expose ZIWEI_DATA to global this
    dataCode += "\n;this.ZIWEI_DATA = ZIWEI_DATA;";

    coreCode = fs.readFileSync(corePath, 'utf8');
    // Expose ZiWei to global this
    coreCode += "\n;this.ZiWei = ZiWei;";
} catch (e) {
    console.error(JSON.stringify({ error: `Failed to read file: ${e.message}` }));
    process.exit(1);
}

// Create Sandbox
const sandbox = {
    console: {
        log: () => { }, // suppress logs
        error: console.error
    },
    // ZIWEI_DATA will be defined by dataCode
    // ZiWei will be defined by coreCode
};

// Create Context
vm.createContext(sandbox);

// Execute Code
try {
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
        // Expected req: { id: <any>, date: "YYYY-MM-DD", hour: int, gender: str }

        const { id, date, hour } = req;

        if (typeof sandbox.ZiWei === 'undefined' || typeof sandbox.ZiWei.calculate !== 'function') {
            throw new Error("ZiWei.calculate not found in context");
        }

        const result = sandbox.ZiWei.calculate(date, hour);

        if (!result) {
            console.log(JSON.stringify({ id, error: "Calculation returned null" }));
            return;
        }

        // We return the raw result. The python test will extract what it needs.
        console.log(JSON.stringify({ id, result }));

    } catch (e) {
        console.log(JSON.stringify({ error: e.message }));
    }
});
