
// Human Design Core Logic
// Renders the BodyGraph and calculates Chart details

// --- Constants ---

// Rave Mandala Gate Order (Starting from Gate 41 at Aquarius 02°15'00" -> 302.25°)
const GATE_ORDER = [
    41, 19, 13, 49, 30, 55, 37, 63, 22, 36, 25, 17, 21, 51, 42, 3, 27, 24, 2, 23, 8, 20, 16, 35, 45, 12, 15, 52, 39, 53,
    62, 56, 31, 33, 7, 4, 29, 59, 40, 64, 47, 6, 46, 18, 48, 57, 32, 50, 28, 44, 1, 43, 14, 34, 9, 5, 26, 11, 10, 58, 38,
    54, 61, 60
];

// Gate to Center Mapping
const GATE_CENTERS = {
    64: 'Head', 61: 'Head', 63: 'Head',
    47: 'Ajna', 24: 'Ajna', 4: 'Ajna', 17: 'Ajna', 43: 'Ajna', 11: 'Ajna',
    62: 'Throat', 23: 'Throat', 56: 'Throat', 35: 'Throat', 12: 'Throat', 45: 'Throat', 33: 'Throat', 8: 'Throat', 31: 'Throat', 20: 'Throat', 16: 'Throat',
    1: 'G', 7: 'G', 10: 'G', 15: 'G', 2: 'G', 46: 'G', 25: 'G', 13: 'G',
    21: 'Heart', 51: 'Heart', 26: 'Heart', 40: 'Heart',
    48: 'Spleen', 57: 'Spleen', 44: 'Spleen', 50: 'Spleen', 32: 'Spleen', 28: 'Spleen', 18: 'Spleen',
    36: 'Solar', 22: 'Solar', 37: 'Solar', 6: 'Solar', 49: 'Solar', 55: 'Solar', 30: 'Solar',
    5: 'Sacral', 14: 'Sacral', 29: 'Sacral', 59: 'Sacral', 9: 'Sacral', 3: 'Sacral', 42: 'Sacral', 27: 'Sacral', 34: 'Sacral',
    53: 'Root', 60: 'Root', 52: 'Root', 19: 'Root', 39: 'Root', 41: 'Root', 54: 'Root', 38: 'Root', 58: 'Root'
};

const CENTER_NAMES_ZH = {
    'Head': '頭腦中心',
    'Ajna': '邏輯中心',
    'Throat': '喉嚨中心',
    'G': 'G中心',
    'Heart': '意志力中心',
    'Spleen': '直覺中心',
    'Solar': '情緒中心',
    'Sacral': '薦骨中心',
    'Root': '根部中心'
};

// Channels (Gate Pairs)
const CHANNELS = [
    [1, 8], [2, 14], [3, 60], [4, 63], [5, 15], [6, 59], [7, 31], [9, 52], [10, 20],
    [10, 34], [10, 57], [11, 56], [12, 22], [13, 33], [16, 48], [17, 62], [18, 58], [19, 49],
    [20, 34], [20, 57], [21, 45], [23, 43], [24, 61], [25, 51], [26, 44], [27, 50], [28, 38],
    [29, 46], [30, 41], [32, 54], [34, 57], [35, 36], [37, 40], [39, 55], [42, 53], [47, 64]
];

// Profile Names
const PROFILES = {
    '1/3': '探究者/烈士 (Investigator/Martyr)',
    '1/4': '探究者/機會主義者 (Investigator/Opportunist)',
    '2/4': '隱士/機會主義者 (Hermit/Opportunist)',
    '2/5': '隱士/異端者 (Hermit/Heretic)',
    '3/5': '烈士/異端者 (Martyr/Heretic)',
    '3/6': '烈士/榜樣 (Martyr/Role Model)',
    '4/6': '機會主義者/榜樣 (Opportunist/Role Model)',
    '4/1': '機會主義者/探究者 (Opportunist/Investigator)',
    '5/1': '異端者/探究者 (Heretic/Investigator)',
    '5/2': '異端者/隱士 (Heretic/Hermit)',
    '6/2': '榜樣/隱士 (Role Model/Hermit)',
    '6/3': '榜樣/烈士 (Role Model/Martyr)'
};

// --- HumanDesign Class ---

const HumanDesign = {
    // Helper: Convert Longitude to Gate/Line
    // Gate 41 starts at 302.25 degrees
    /**
     * Converts a celestial longitude into a Human Design Gate and Line.
     * Gate 41 starts at 302.25° (start of Aquarius).
     * @param {number} longitude - The geocentric longitude in degrees.
     * @returns {Object} Gate info { gate, line }.
     */
    getGateInfo: function (longitude) {
        // Offset so 0 = Start of Gate 41
        let offsetDeg = (longitude - 302.25);
        if (offsetDeg < 0) offsetDeg += 360;

        const gateIndex = Math.floor(offsetDeg / 5.625) % 64;
        const gate = GATE_ORDER[gateIndex];

        const remainder = offsetDeg % 5.625;
        const line = Math.floor(remainder / 0.9375) + 1;

        return { gate, line };
    },

    // 1. Calculate Design Date (88 degrees solar arc prior)
    // Returns Julian Date for Design moment
    /**
     * Calculates the Design Date for a given Natal moment.
     * The Design moment is when the Sun is exactly 88 degrees (solar arc) prior to the natal sun position.
     * @param {number} natalJd - Natal Julian Date.
     * @param {number} natalSunLon - Natal Sun longitude.
     * @returns {number} Julian Date of the Design moment.
     */
    calculateDesignDate: function (natalJd, natalSunLon) {
        let targetSunLon = natalSunLon - 88;
        if (targetSunLon < 0) targetSunLon += 360;

        // Approximate: Sun moves ~1 deg/day. Go back 88 days.
        let guessJd = natalJd - 88;
        let guessSun = getHighPrecisionLongitude('Sun', guessJd);

        // Refine (Simple Newton-Raphson or Iteration)
        for (let i = 0; i < 5; i++) {
            let diff = targetSunLon - guessSun;
            if (diff > 180) diff -= 360;
            if (diff < -180) diff += 360;

            if (Math.abs(diff) < 0.0001) break;

            guessJd += diff; // Sun moves approx 1 deg per day
            guessSun = getHighPrecisionLongitude('Sun', guessJd);
        }

        return guessJd;
    },

    // 2. Main Calculation
    /**
     * Calculates the complete Human Design chart data for a given Natal moment.
     * Includes Personality/Design activations, Channels, Centers, Type, and Authority.
     * @param {number} natalJd - Natal Julian Date.
     * @returns {Object} Complete Human Design data object.
     */
    calculate: function (natalJd) {
        const natalSunLon = getHighPrecisionLongitude('Sun', natalJd);
        const designJd = this.calculateDesignDate(natalJd, natalSunLon);

        // Define Planets to exclude or include
        // Human Design uses: Sun, Earth, Moon, North Node, South Node, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto.
        // Earth is always exactly opposite Sun.
        // South Node is opposite North Node.

        const calcPos = (jd, type) => {
            const positions = [];
            const bodies = ['Sun', 'Moon', 'NorthNode', 'Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];

            bodies.forEach(id => {
                const lon = getHighPrecisionLongitude(id, jd);
                const info = this.getGateInfo(lon);
                positions.push({ id, type, gate: info.gate, line: info.line, lon });

                // Add Earth (Opposite Sun)
                if (id === 'Sun') {
                    const earthLon = (lon + 180) % 360;
                    const eInfo = this.getGateInfo(earthLon);
                    positions.push({ id: 'Earth', type, gate: eInfo.gate, line: eInfo.line, lon: earthLon });
                }

                // Add South Node (Opposite North Node)
                if (id === 'NorthNode') {
                    const snLon = (lon + 180) % 360;
                    const snInfo = this.getGateInfo(snLon);
                    positions.push({ id: 'SouthNode', type, gate: snInfo.gate, line: snInfo.line, lon: snLon });
                }
            });
            return positions;
        };

        const personality = calcPos(natalJd, 'Personality'); // Black
        const design = calcPos(designJd, 'Design');       // Red

        const allActivations = [...personality, ...design];

        // 3. Determine Channels
        const activeGates = new Set(allActivations.map(a => a.gate));
        const activeChannels = [];

        CHANNELS.forEach(pair => {
            if (activeGates.has(pair[0]) && activeGates.has(pair[1])) {
                activeChannels.push(pair);
            }
        });

        // 4. Determine Centers
        const centers = {
            Head: { defined: false },
            Ajna: { defined: false },
            Throat: { defined: false },
            G: { defined: false },
            Heart: { defined: false },
            Solar: { defined: false },
            Sacral: { defined: false },
            Spleen: { defined: false },
            Root: { defined: false }
        };

        activeChannels.forEach(ch => {
            // Activate both centers
            [ch[0], ch[1]].forEach(gate => {
                const centerName = GATE_CENTERS[gate];
                if (centerName) centers[centerName].defined = true;
            });
        });

        // 5. Determine Type & Authority (Simplified Rules)
        // - Reflector: No centers defined
        // - Manifestor: Throat connected to Motor (Heart, Solar, Root) via channel, Sacral Undefined.
        // - Generator: Sacral Defined.
        //   - Manifesting Generator: Sacral Defined + Throat connected to Motor.
        // - Projector: Sacral Undefined, no Motor to Throat.

        let type = 'Projector'; // Default fallback
        const definedCentersData = Object.keys(centers).filter(k => centers[k].defined);

        // Helper: Check connectivity to Throat
        // This requires a graph traversal to be accurate, simplified here:
        // We just check if Throat is defined, but "Motor to Throat" is specific.
        // Motors: Heart, Solar, Root, Sacral.

        // Actually, accurate type determination requires checking if a motor is connected to throat via continuous channel.
        // Let's implement basic graph traversal.

        const buildGraph = () => {
            const adj = {};
            activeChannels.forEach(ch => {
                const c1 = GATE_CENTERS[ch[0]];
                const c2 = GATE_CENTERS[ch[1]];
                if (!adj[c1]) adj[c1] = [];
                if (!adj[c2]) adj[c2] = [];
                adj[c1].push(c2);
                adj[c2].push(c1);
            });
            return adj;
        }

        const graph = buildGraph();
        const isConnected = (start, end, visited = new Set()) => {
            if (start === end) return true;
            visited.add(start);
            if (!graph[start]) return false;
            for (let neighbor of graph[start]) {
                if (!visited.has(neighbor)) {
                    if (isConnected(neighbor, end, visited)) return true;
                }
            }
            return false;
        };

        const motors = ['Heart', 'Solar', 'Root', 'Sacral'];
        let motorToThroat = false;

        if (centers['Throat'].defined) {
            motorToThroat = motors.some(m => centers[m].defined && isConnected(m, 'Throat'));
        }

        if (definedCentersData.length === 0) {
            type = '反映者 (Reflector)';
        } else if (centers['Sacral'].defined) {
            // Generator family
            if (motorToThroat) {
                type = '顯示生產者 (Manifesting Generator)';
            } else {
                type = '生產者 (Generator)';
            }
        } else if (motorToThroat) {
            type = '顯示者 (Manifestor)';
        } else {
            type = '投射者 (Projector)';
        }

        // 6. Profile
        // Sun/Earth Personality Line / Sun/Earth Design Line
        // Usually taken from Sun Personality Line / Sun Design Line
        const pSun = personality.find(p => p.id === 'Sun');
        const dSun = design.find(d => d.id === 'Sun');

        const profile = `${pSun.line}/${dSun.line}`;
        const profileName = PROFILES[profile] || `${profile} (Profile)`;

        // 7. Authority (Hierarchy)
        // 1. Solar Plexus (Emotional)
        // 2. Sacral
        // 3. Spleen
        // 4. Heart (Ego) - Projected or Manifested?
        // 5. G (Self)
        // 6. None/Moon (Reflector) - Outer
        // 7. Mental (No inner authority)

        let authority = '無';
        if (centers['Solar'].defined) authority = '情緒權威 (Emotional)';
        else if (centers['Sacral'].defined) authority = '薦骨權威 (Sacral)';
        else if (centers['Spleen'].defined) authority = '直覺權威 (Splenic)';
        else if (centers['Heart'].defined) {
            // Ego Projected or Ego Manifested
            // If Throat is connected to Heart -> Manifested. Else Projected.
            if (isConnected('Heart', 'Throat')) authority = '意志力顯示權威 (Ego Manifested)';
            else authority = '意志力投射權威 (Ego Projected)';
        }
        else if (centers['G'].defined) authority = '自我投射權威 (Self Projected)';
        else if (type.includes('Reflector')) authority = '月亮權威 (Lunar)'; // Cycle
        else authority = '環境權威/無 (Mental/None)'; // Mental Projector


        return {
            type,
            authority,
            profile: profileName,
            centers,
            activeChannels,
            personality,
            design
        };
    }
};
