const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load file contents
const vsopPath = path.join(__dirname, '../js/core/vsop87a_milli.js');
const corePath = path.join(__dirname, '../js/core/astro-core.js');
const hdPath = path.join(__dirname, '../js/core/human-design-core.js');

let vsopCode = fs.readFileSync(vsopPath, 'utf8');
let coreCode = fs.readFileSync(corePath, 'utf8');
let hdCode = fs.readFileSync(hdPath, 'utf8');

coreCode += "\n;this.getJulianDate = getJulianDate;";
coreCode += "\n;this.getHighPrecisionLongitude = getHighPrecisionLongitude;";
hdCode += "\n;this.HumanDesign = HumanDesign;";

const sandbox = { Math: Math, console: console, Set: Set, Object: Object };
vm.createContext(sandbox);
vm.runInContext(vsopCode, sandbox);
vm.runInContext(coreCode, sandbox);
vm.runInContext(hdCode, sandbox);

const date = '1955-02-25';
const time = '03:15';

const jd = sandbox.getJulianDate(date, time);
const natalSun = sandbox.getHighPrecisionLongitude('Sun', jd);

let targetSun = natalSun - 88;
if (targetSun < 0) targetSun += 360;

const designJd = sandbox.HumanDesign.calculateDesignDate(jd, natalSun);
const designSun = sandbox.getHighPrecisionLongitude('Sun', designJd);

const designInfo = sandbox.HumanDesign.getGateInfo(designSun);

console.log(`Natal JD: ${jd}`);
console.log(`Natal Sun Lon: ${natalSun}`);
console.log(`Target Design Sun Lon: ${targetSun}`);
console.log(`Calculated Design JD: ${designJd}`);
console.log(`Calculated Design Sun Lon: ${designSun}`);
console.log(`Difference: ${Math.abs(targetSun - designSun)}`);
console.log(`Design Gate: ${designInfo.gate}`);
console.log(`Design Line: ${designInfo.line}`);

// Detailed Line Calc
let offsetDeg = (designSun - 302.25);
if (offsetDeg < 0) offsetDeg += 360;
const remainder = offsetDeg % 5.625;
const rawLine = remainder / 0.9375;
console.log(`Offset from Gate Start: ${remainder}`);
console.log(`Raw Line Value (0-6): ${rawLine}`);
console.log(`Floor + 1: ${Math.floor(rawLine) + 1}`);
