const fs = require('fs');
const path = require('path');
const vm = require('vm');

const dataPath = path.join(__dirname, 'js/data/ziwei-data.js');
const corePath = path.join(__dirname, 'js/core/ziwei-core.js');

const dataCode = fs.readFileSync(dataPath, 'utf8') + "\n;this.ZIWEI_DATA = ZIWEI_DATA;";
const coreCode = fs.readFileSync(corePath, 'utf8') + "\n;this.ZiWei = ZiWei;";

const sandbox = { console: { log: console.log, error: console.error } };
vm.createContext(sandbox);
vm.runInContext(dataCode, sandbox);
vm.runInContext(coreCode, sandbox);

const result = sandbox.ZiWei.calculate('1995-01-01', 12);
console.log(JSON.stringify(result, null, 2));
