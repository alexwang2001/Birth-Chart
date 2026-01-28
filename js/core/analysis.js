/**
 * Performs hemisphere and quadrant analysis based on planet positions and house cusps.
 * @param {Array} planetPos 
 * @param {number[]} cusps 
 */
function updateHemisphereAnalysis(planetPos, cusps) {
    let counts = {
        east: 0, west: 0, north: 0, south: 0,
        q1: 0, q2: 0, q3: 0, q4: 0
    };

    const total = planetPos.length;

    planetPos.forEach(p => {
        const hIdx = getHouseIndex(p.longitude, cusps); // 0-11

        // Hemispheres
        // East: 10, 11, 12, 1, 2, 3 (Indices 9,10,11, 0,1,2)
        if ([9, 10, 11, 0, 1, 2].includes(hIdx)) counts.east++;
        else counts.west++;

        // South (Top/Day): 7, 8, 9, 10, 11, 12 (Indices 6,7,8,9,10,11)
        if (hIdx >= 6 && hIdx <= 11) counts.south++;
        else counts.north++; // North (Bottom/Night): 1-6

        // Quadrants
        if (hIdx >= 0 && hIdx <= 2) counts.q1++;       // 1-3
        else if (hIdx >= 3 && hIdx <= 5) counts.q2++;  // 4-6
        else if (hIdx >= 6 && hIdx <= 8) counts.q3++;  // 7-9
        else counts.q4++;                              // 10-12
    });

    const panel = document.getElementById('precision-diagnostic');

    const renderRow = (labelLeft, valLeft, labelRight, valRight, colorLeft, colorRight) => `
        <div style="margin-bottom: 0.8rem;">
            <div style="display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-dim); margin-bottom: 0.2rem;">
                <span>${labelLeft} ${valLeft}</span>
                <span>${labelRight} ${valRight}</span>
            </div>
            <div style="display: flex; height: 6px; border-radius: 3px; overflow: hidden; background: rgba(255,255,255,0.1);">
                <div style="width: ${(valLeft / total) * 100}%; background: ${colorLeft};"></div>
                <div style="width: ${(valRight / total) * 100}%; background: ${colorRight};"></div>
            </div>
        </div>
    `;

    if (panel) {
        panel.innerHTML = `
            <div style="font-size: 0.8rem; color: var(--text-gold); margin-bottom: 1rem;">
                能量分佈 (Energy Distribution)
            </div>
            ${renderRow('東半球 (自我)', counts.east, '西半球 (他人)', counts.west, '#ff5f5f', '#5fafff')}
            ${renderRow('上半球 (社會)', counts.south, '下半球 (隱私)', counts.north, '#ffff70', '#69ff8c')}
            
            <div style="margin-top: 1rem; display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem;">
                <div style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 4px; text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--text-dim);">第一象限 (1-3)</div>
                    <div style="font-size: 1.1rem; color: var(--text-white);">${counts.q1}</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 4px; text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--text-dim);">第二象限 (4-6)</div>
                    <div style="font-size: 1.1rem; color: var(--text-white);">${counts.q2}</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 4px; text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--text-dim);">第三象限 (7-9)</div>
                    <div style="font-size: 1.1rem; color: var(--text-white);">${counts.q3}</div>
                </div>
                <div style="background: rgba(255,255,255,0.05); padding: 0.5rem; border-radius: 4px; text-align: center;">
                    <div style="font-size: 0.7rem; color: var(--text-dim);">第四象限 (10-12)</div>
                    <div style="font-size: 1.1rem; color: var(--text-white);">${counts.q4}</div>
                </div>
            </div>
        `;
    }
}

/**
 * Calculates element and modality distribution.
 * @param {Array} planetPos 
 * @param {Object} houseData 
 * @returns {Object} Counts
 */
function calculateElementBalance(planetPos, houseData) {
    const counts = {
        fire: 0, earth: 0, air: 0, water: 0,
        cardinal: 0, fixed: 0, mutable: 0
    };

    planetPos.concat([
        { longitude: houseData.asc }, // ASC counts as a point
        { longitude: houseData.mc }   // MC counts as a point
    ]).forEach(p => {
        const signIdx = Math.floor(p.longitude / 30);
        const sign = ZODIAC_SIGNS[signIdx];
        if (sign.element) counts[sign.element]++;
        if (sign.mode) counts[sign.mode]++;
    });

    return counts;
}

/**
 * Calculates human design circuitry activation.
 * @param {Object} hdData 
 * @returns {Object} Circuitry counts
 */
function calcHD_Circuitry(hdData) {
    const circuits = { individual: 0, tribal: 0, collective: 0, total: 0 };
    const gates = new Set([...hdData.personality, ...hdData.design].map(p => p.gate));

    const individual = [1, 8, 2, 14, 3, 60, 24, 61, 43, 23, 38, 28, 57, 20, 10, 51, 25, 39, 55, 12, 22];
    const tribal = [6, 59, 49, 19, 37, 40, 21, 45, 32, 54, 50, 27, 26, 44];
    const collective = [64, 47, 11, 56, 17, 62, 31, 7, 33, 13, 16, 48, 18, 58, 53, 42, 9, 52, 5, 15, 29, 46, 30, 41, 35, 36];

    gates.forEach(g => {
        circuits.total++;
        if (individual.includes(g)) circuits.individual++;
        if (tribal.includes(g)) circuits.tribal++;
        if (collective.includes(g)) circuits.collective++;
    });

    return circuits;
}

/**
 * Calculates the Incarnation Cross for Human Design.
 * @param {Object} hdData 
 * @returns {Object} Full name, type, quarter, and gates string.
 */
function getIncarnationCross(hdData) {
    const pSun = hdData.personality.find(p => p.id === 'Sun').gate;
    const pEarth = hdData.personality.find(p => p.id === 'Earth').gate;
    const dSun = hdData.design.find(p => p.id === 'Sun').gate;
    const dEarth = hdData.design.find(p => p.id === 'Earth').gate;

    const profile = hdData.profile.split(' ')[0]; // e.g. "1/3"
    let type = "右角 (Right Angle)";
    if (["5/1", "5/2", "6/2", "6/3"].includes(profile)) type = "左角 (Left Angle)";
    if (profile === "4/1") type = "並置 (Juxtaposition)";

    // Identify Quarter
    let quarter = '';
    const q1 = [13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24];
    const q2 = [2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53, 62, 56, 31, 33];
    const q3 = [7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44];
    const q4 = [1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38, 54, 61, 60, 41, 19];

    if (q1.includes(pSun)) quarter = 'Initiation';
    else if (q2.includes(pSun)) quarter = 'Civilization';
    else if (q3.includes(pSun)) quarter = 'Duality';
    else if (q4.includes(pSun)) quarter = 'Mutation';

    // Simplified Cross Name Table (Common names for specific gates)
    const crossBaseNames = {
        1: '斯芬克斯 (Sphinx)', 2: '斯芬克斯 (Sphinx)', 7: '斯芬克斯 (Sphinx)', 13: '斯芬克斯 (Sphinx)',
        37: '規劃 (Planning)', 40: '規劃 (Planning)', 9: '規劃 (Planning)', 16: '規劃 (Planning)',
        25: '純真 (Innocence)', 46: '愛 (Love)', 10: '愛 (Love)', 15: '愛 (Love)'
    };

    const baseName = crossBaseNames[pSun] || `閘門 ${pSun}`;
    const fullName = `${type}交叉之「${baseName}」`;

    return { fullName, type, quarter, gates: `${pSun}/${pEarth} | ${dSun}/${dEarth}` };
}

