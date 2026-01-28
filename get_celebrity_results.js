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

const celebrities = [
    { name: '郭台銘 (Terry Gou)', date: '1950-10-18', hour: 8, gender: 'male' },
    { name: '蔡英文 (Tsai Ing-wen)', date: '1956-08-31', hour: 10, gender: 'female' },
    { name: '賴清德 (William Lai)', date: '1959-10-06', hour: 2, gender: 'male' },
    { name: '王永慶 (Wang Yung-ching)', date: '1917-01-18', hour: 4, gender: 'male' },
    { name: '周杰倫 (Jay Chou)', date: '1979-01-18', hour: 16, gender: 'male' }
];

const results = celebrities.map(c => {
    const res = sandbox.ZiWei.calculate(c.date, c.hour);
    return {
        name: c.name,
        input: { date: c.date, hour: c.hour, gender: c.gender },
        result: {
            lunar: res.lunar,
            bureau: res.bureau,
            bureauName: res.bureauName,
            mingPos: res.mingPos,
            shenPos: res.shenPos,
            ziWeiPos: res.ziWeiPos,
            tianFuPos: res.tianFuPos,
            yearStem: res.yearStem,
            yearBranch: res.yearBranch
        }
    };
});

console.log(JSON.stringify(results, null, 2));
