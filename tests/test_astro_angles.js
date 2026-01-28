const fs = require('fs');
const path = require('path');
const vm = require('vm');

// Load file contents
const vsopPath = path.join(__dirname, '../js/core/vsop87a_milli.js');
const corePath = path.join(__dirname, '../js/core/astro-core.js');
const dataPath = path.join(__dirname, '../js/data/astro-data.js');

const vsopCode = fs.readFileSync(vsopPath, 'utf8');
const coreCode = fs.readFileSync(corePath, 'utf8');
const dataCode = fs.readFileSync(dataPath, 'utf8');

// Create Sandbox
const sandbox = {
    Math: Math,
    console: console,
};

// Create Context
vm.createContext(sandbox);

// Execute Code
vm.runInContext(vsopCode, sandbox);
vm.runInContext(dataCode, sandbox);
vm.runInContext(coreCode, sandbox);

// Test Case: Terry Gou (郭台銘)
// Born: Oct 18, 1950, 19:10
const date = "1950-10-18";
const time = "19:10";
const lat = 25.03;
const lon = 121.51;

console.log(`Testing Astrological Points for: ${date} ${time} at Lat ${lat}, Lon ${lon}\n`);

const jd = sandbox.getJulianDate(date, time);
console.log(`Julian Date: ${jd}`);

const chiron = sandbox.getHighPrecisionLongitude('Chiron', jd);
const northNode = sandbox.getHighPrecisionLongitude('NorthNode', jd);

console.log(`Chiron (凱隆星): ${chiron.toFixed(4)}°`);
console.log(`North Node (北交點): ${northNode.toFixed(4)}°`);

const lst = sandbox.getSiderealTime(jd, lon);
console.log(`Local Sidereal Time: ${lst.toFixed(4)}° (${(lst / 15).toFixed(4)} hrs)`);

const houses = sandbox.calculateHouses(lst, lat);
console.log(`ASC (上升): ${houses.asc.toFixed(4)}°`);
console.log(`MC (天頂): ${houses.mc.toFixed(4)}°`);
console.log(`DSC (下降): ${sandbox.normalize(houses.asc + 180).toFixed(4)}°`);
console.log(`IC (天底): ${sandbox.normalize(houses.mc + 180).toFixed(4)}°`);

console.log("\nHouse Cusps (Placidus):");
houses.cusps.forEach((c, i) => {
    console.log(`House ${i + 1}: ${c.toFixed(4)}°`);
});
