/**
 * Renders the Human Design bodygraph as an SVG.
 * @param {Object} hdData Personality and design data.
 * @param {Object} hdTransitData Optional transit overlay.
 * @returns {string} SVG HTML string.
 */
function renderHumanDesignSVG(hdData, hdTransitData = null) {
    const W = 500;
    const H = 640;

    // Combine Gates for Center Definition (Transit can define NEW centers!)
    const allActiveGates = new Set(hdData.allActiveGates || [...hdData.personality, ...hdData.design].map(g => g.gate));
    const transitGates = hdTransitData ? new Set([...hdTransitData.personality, ...hdTransitData.design].map(g => g.gate)) : new Set();

    // Recalculate combined centers
    const combinedCenters = JSON.parse(JSON.stringify(hdData.centers));
    if (hdTransitData) {
        // Find channels formed by combined gates
        const totalGates = new Set([...allActiveGates, ...transitGates]);
        CHANNELS.forEach(pair => {
            if (totalGates.has(pair[0]) && totalGates.has(pair[1])) {
                const c1 = GATE_CENTERS[pair[0]];
                const c2 = GATE_CENTERS[pair[1]];
                if (c1) combinedCenters[c1].defined = true;
                if (c2) combinedCenters[c2].defined = true;
            }
        });
    }

    // 1. Define Centers Layout
    const centerLayout = {
        Head: { id: 'Head', x: 250, y: 50, w: 64, h: 60, type: 'tri-up', color: 'var(--center-head)' },
        Ajna: { id: 'Ajna', x: 250, y: 130, w: 64, h: 60, type: 'tri-down', color: 'var(--center-ajna)' },
        Throat: { id: 'Throat', x: 250, y: 220, w: 64, h: 64, type: 'square', color: 'var(--center-throat)' },
        G: { id: 'G', x: 250, y: 330, w: 64, h: 64, type: 'diamond', color: 'var(--center-g)' },
        Heart: { id: 'Heart', x: 350, y: 350, w: 40, h: 40, type: 'tri-br', color: 'var(--center-heart)' },
        Sacral: { id: 'Sacral', x: 250, y: 440, w: 64, h: 64, type: 'square', color: 'var(--center-sacral)' },
        Spleen: { id: 'Spleen', x: 100, y: 430, w: 60, h: 60, type: 'tri-left', color: 'var(--center-spleen)' },
        Solar: { id: 'Solar', x: 400, y: 430, w: 60, h: 60, type: 'tri-right', color: 'var(--center-solar)' },
        Root: { id: 'Root', x: 250, y: 560, w: 64, h: 64, type: 'square', color: 'var(--center-root)' }
    };

    // Helper: Gate Positions (Relative offsets from Center X,Y)
    const channelsMap = [
        // Head-Ajna
        { id: '64-47', p1: { c: 'Head', x: -15, y: 20 }, p2: { c: 'Ajna', x: -15, y: -20 } },
        { id: '61-24', p1: { c: 'Head', x: 0, y: 20 }, p2: { c: 'Ajna', x: 0, y: -20 } },
        { id: '63-4', p1: { c: 'Head', x: 15, y: 20 }, p2: { c: 'Ajna', x: 15, y: -20 } },

        // Ajna-Throat
        { id: '17-62', p1: { c: 'Ajna', x: -15, y: 20 }, p2: { c: 'Throat', x: -15, y: -32 } },
        { id: '43-23', p1: { c: 'Ajna', x: 0, y: 20 }, p2: { c: 'Throat', x: 0, y: -32 } },
        { id: '11-56', p1: { c: 'Ajna', x: 15, y: 20 }, p2: { c: 'Throat', x: 15, y: -32 } },

        // Throat-G
        { id: '31-7', p1: { c: 'Throat', x: -10, y: 32 }, p2: { c: 'G', x: -10, y: -32 } },
        { id: '8-1', p1: { c: 'Throat', x: 0, y: 32 }, p2: { c: 'G', x: 0, y: -32 } },
        { id: '33-13', p1: { c: 'Throat', x: 10, y: 32 }, p2: { c: 'G', x: 10, y: -32 } },

        // Throat-Spleen
        { id: '16-48', p1: { c: 'Throat', x: -32, y: -10 }, p2: { c: 'Spleen', x: 10, y: -20 } },
        { id: '20-57', p1: { c: 'Throat', x: -32, y: 10 }, p2: { c: 'Spleen', x: 15, y: 0 } },

        // Throat-Heart
        { id: '45-21', p1: { c: 'Throat', x: 32, y: 10 }, p2: { c: 'Heart', x: -10, y: -20 } },

        // Throat-Solar
        { id: '35-36', p1: { c: 'Throat', x: 32, y: -10 }, p2: { c: 'Solar', x: -10, y: -20 } },
        { id: '12-22', p1: { c: 'Throat', x: 32, y: 0 }, p2: { c: 'Solar', x: -15, y: -10 } },

        // G-Heart
        { id: '25-51', p1: { c: 'G', x: 32, y: 0 }, p2: { c: 'Heart', x: -20, y: 10 } },

        // G-Sacral
        { id: '15-5', p1: { c: 'G', x: -10, y: 32 }, p2: { c: 'Sacral', x: -10, y: -32 } },
        { id: '2-14', p1: { c: 'G', x: 0, y: 32 }, p2: { c: 'Sacral', x: 0, y: -32 } },
        { id: '46-29', p1: { c: 'G', x: 10, y: 32 }, p2: { c: 'Sacral', x: 10, y: -32 } },

        // G-Spleen
        { id: '10-57', p1: { c: 'G', x: -32, y: 0 }, p2: { c: 'Spleen', x: 25, y: 0 } },

        // Heart-Spleen
        { id: '26-44', p1: { c: 'Heart', x: -20, y: 0 }, p2: { c: 'Spleen', x: 20, y: -10 } },

        // Heart-Solar
        { id: '40-37', p1: { c: 'Heart', x: 20, y: 10 }, p2: { c: 'Solar', x: -20, y: -15 } },

        // Sacral-Spleen
        { id: '50-27', p1: { c: 'Sacral', x: -32, y: -10 }, p2: { c: 'Spleen', x: 20, y: 10 } },
        { id: '34-57', p1: { c: 'Sacral', x: -32, y: 0 }, p2: { c: 'Spleen', x: 20, y: 20 } },

        // Sacral-Solar
        { id: '59-6', p1: { c: 'Sacral', x: 32, y: -10 }, p2: { c: 'Solar', x: -20, y: 10 } },

        // Spleen-Root
        { id: '32-54', p1: { c: 'Spleen', x: 10, y: 25 }, p2: { c: 'Root', x: -32, y: -15 } },
        { id: '28-38', p1: { c: 'Spleen', x: 0, y: 25 }, p2: { c: 'Root', x: -32, y: -5 } },
        { id: '18-58', p1: { c: 'Spleen', x: -10, y: 25 }, p2: { c: 'Root', x: -32, y: 5 } },

        // Solar-Root
        { id: '49-19', p1: { c: 'Solar', x: -10, y: 25 }, p2: { c: 'Root', x: 32, y: -15 } },
        { id: '55-39', p1: { c: 'Solar', x: 0, y: 25 }, p2: { c: 'Root', x: 32, y: -5 } },
        { id: '30-41', p1: { c: 'Solar', x: 10, y: 25 }, p2: { c: 'Root', x: 32, y: 5 } },

        // Sacral-Root
        { id: '42-53', p1: { c: 'Sacral', x: -10, y: 32 }, p2: { c: 'Root', x: -10, y: -32 } },
        { id: '3-60', p1: { c: 'Sacral', x: 0, y: 32 }, p2: { c: 'Root', x: 0, y: -32 } },
        { id: '9-52', p1: { c: 'Sacral', x: 10, y: 32 }, p2: { c: 'Root', x: 10, y: -32 } },

        // Integration
        { id: '20-10', p1: { c: 'Throat', x: -20, y: 32 }, p2: { c: 'G', x: -32, y: -10 } },
        { id: '20-34', p1: { c: 'Throat', x: -25, y: 32 }, p2: { c: 'Sacral', x: -32, y: -20 } },
        { id: '10-34', p1: { c: 'G', x: -20, y: 32 }, p2: { c: 'Sacral', x: -20, y: -32 } },
    ];

    // Helper: Draw Center Shape
    const drawShape = (c, isActive, isNewlyDefined = false) => {
        let path = '';
        const cx = c.x, cy = c.y, w = c.w, h = c.h;
        const hw = w / 2, hh = h / 2;

        if (c.type === 'tri-up') {
            path = `M${cx},${cy - hh} L${cx + hw},${cy + hh} L${cx - hw},${cy + hh} Z`;
        } else if (c.type === 'tri-down') {
            path = `M${cx - hw},${cy - hh} L${cx + hw},${cy - hh} L${cx},${cy + hh} Z`;
        } else if (c.type === 'square') {
            path = `M${cx - hw},${cy - hh} L${cx + hw},${cy - hh} L${cx + hw},${cy + hh} L${cx - hw},${cy + hh} Z`;
        } else if (c.type === 'diamond') {
            path = `M${cx},${cy - hh} L${cx + hw},${cy} L${cx},${cy + hh} L${cx - hw},${cy} Z`;
        } else if (c.type === 'tri-left') {
            path = `M${cx - hw},${cy - hh} L${cx + hw},${cy} L${cx - hw},${cy + hh} Z`;
        } else if (c.type === 'tri-right') {
            path = `M${cx + hw},${cy - hh} L${cx - hw},${cy} L${cx + hw},${cy + hh} Z`;
        } else if (c.type === 'tri-br') {
            path = `M${cx},${cy - hh} L${cx + hw},${cy + hh} L${cx - hw},${cy + hh} Z`;
        }

        let cls = `hd-center-shape ${isActive ? 'defined' : 'undefined'}`;
        if (isNewlyDefined) cls += ' transit-defined';

        let style = isActive ? `fill:${c.color};` : '';
        if (isNewlyDefined) style = `fill:rgba(105, 255, 140, 0.7); stroke:#69ff8c; stroke-width:2px;`;

        const label = CENTER_NAMES_ZH[c.id] || c.id;

        return `<g style="cursor:pointer;" onclick="showHDInterpretation('center', '${c.id}')">
                    <path d="${path}" class="${cls}" style="${style}" />
                    <text x="${cx}" y="${cy}" dy="4" class="hd-center-label" style="${isActive ? 'fill:#000; font-weight:bold;' : ''}">${label}</text>
                </g>`;
    };

    // Build SVG
    let svgHtml = `<svg class="hd-chart-svg" viewBox="0 0 500 640" xmlns="http://www.w3.org/2000/svg">`;

    // First, determine activation of each channel
    const activeSet = new Set(hdData.activeChannels.map(ch => {
        const k1 = `${ch[0]}-${ch[1]}`;
        const k2 = `${ch[1]}-${ch[0]}`;
        return [k1, k2];
    }).flat());

    // Helper: is Gate Active in P or D?
    const isP = (gate) => hdData.personality.some(g => g.gate === gate);
    const isD = (gate) => hdData.design.some(g => g.gate === gate);
    const isT = (gate) => hdTransitData && (hdTransitData.personality.some(g => g.gate === gate) || hdTransitData.design.some(g => g.gate === gate));

    channelsMap.forEach(ch => {
        const [g1, g2] = ch.id.split('-').map(Number);
        const isActive = activeSet.has(ch.id);

        const c1 = centerLayout[ch.p1.c];
        const c2 = centerLayout[ch.p2.c];

        const x1 = c1.x + ch.p1.x;
        const y1 = c1.y + ch.p1.y;
        const x2 = c2.x + ch.p2.x;
        const y2 = c2.y + ch.p2.y;

        // Draw Base Line (Dim)
        svgHtml += `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" class="hd-connector-line" />`;

        // Draw Half-Channels (Gates)
        const drawGate = (gate, xStart, yStart, xEnd, yEnd) => {
            const mx = (xStart + xEnd) / 2;
            const my = (yStart + yEnd) / 2;

            const p = isP(gate);
            const d = isD(gate);
            const t = isT(gate);

            if (!p && !d && !t) return;

            let stroke = '#888';
            if (p && d) stroke = 'url(#striped)';
            else if (p) stroke = '#ffffff';
            else if (d) stroke = '#ff5f5f';

            // Draw Natal Gate
            if (p || d) {
                svgHtml += `<line x1="${xStart}" y1="${yStart}" x2="${mx}" y2="${my}" stroke="${stroke}" stroke-width="5" stroke-linecap="round" />`;
                if (p && d) {
                    svgHtml += `<line x1="${xStart}" y1="${yStart}" x2="${mx}" y2="${my}" stroke="#ff5f5f" stroke-width="5" stroke-linecap="round" />`;
                    svgHtml += `<line x1="${xStart}" y1="${yStart}" x2="${mx}" y2="${my}" stroke="#ffffff" stroke-width="5" stroke-dasharray="3,3" stroke-linecap="round" />`;
                }
            }

            // Draw Transit Overlay (Green)
            if (t) {
                const width = (p || d) ? 2 : 5;
                const glow = (p || d) ? '' : 'filter:drop-shadow(0 0 3px #69ff8c);';
                svgHtml += `<line x1="${xStart}" y1="${yStart}" x2="${mx}" y2="${my}" stroke="#69ff8c" stroke-width="${width}" stroke-linecap="round" style="${glow}" />`;
            }
        };

        drawGate(g1, x1, y1, x2, y2);
        drawGate(g2, x2, y2, x1, y1);
    });

    // Draw Centers
    Object.values(centerLayout).forEach(c => {
        const isDefined = combinedCenters[c.id].defined;
        const isNatalDefined = hdData.centers[c.id].defined;
        const isNewlyDefined = isDefined && !isNatalDefined;

        svgHtml += drawShape(c, isDefined, isNewlyDefined);
    });

    svgHtml += `</svg>`;
    return svgHtml;
}
