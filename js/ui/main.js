/**
 * State Management & UI Main Logic
 * Refactored to use AppState for separating Input, Results, and UI status.
 */

/**
 * Reads all user inputs from the DOM and updates AppState
 */
function readInputsFromUI() {
    const isManual = document.getElementById('manual-coords-toggle').checked;
    let lon, lat, locName;
    const city = document.getElementById('location-city').value;
    const district = document.getElementById('location-district').value;

    if (isManual) {
        lon = parseFloat(document.getElementById('manual-lon').value);
        lat = parseFloat(document.getElementById('manual-lat').value);
        locName = `手動 (${lon}, ${lat})`;
    } else {
        const dSel = document.getElementById('location-district');
        const districtName = dSel.options[dSel.selectedIndex]?.text || '';
        lon = 121.56; lat = 25.03; // Default
        if (district) {
            [lon, lat] = district.split(',').map(Number);
        }
        locName = `${city} ${districtName}`;
    }

    const inputs = {
        birthDate: document.getElementById('birth-date').value,
        birthTime: `${document.getElementById('birth-hour').value}:${document.getElementById('birth-minute').value}`,
        birthHour: document.getElementById('birth-hour').value,
        location: {
            lon, lat, name: locName, isManual, city, district
        },
        gender: document.getElementById('gender').value,
        queryYear: parseInt(document.getElementById('query-year').value) || 2026,
        houseSystem: document.getElementById('house-system-select').value,
        transitDate: document.getElementById('transit-date').value,
        transitTime: `${document.getElementById('transit-hour').value}:${document.getElementById('transit-minute').value}`
    };

    AppState.updateInputs(inputs);
    return inputs;
}

/**
 * Synchronizes the transit date and time to the current local time.
 */
function syncTransitToNow() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const hourStr = now.getHours().toString().padStart(2, '0');
    const minStr = now.getMinutes().toString().padStart(2, '0');

    document.getElementById('transit-date').value = dateStr;
    document.getElementById('transit-hour').value = hourStr;
    document.getElementById('transit-minute').value = minStr;
}

// Calculate Button Event
document.getElementById('calculate-btn').addEventListener('click', () => {
    AppState.setLoading(true);

    setTimeout(() => {
        // 1. Read Inputs
        const inputs = readInputsFromUI();
        const { birthDate, birthTime, birthHour, location, houseSystem, transitDate, transitTime, gender, queryYear } = inputs;

        // 2. Perform Astrology Calculations
        const jd = getJulianDate(birthDate, birthTime);
        const lst = getSiderealTime(jd, location.lon);

        const planets = PLANETS.map(p => ({
            ...p,
            longitude: getHighPrecisionLongitude(p.id, jd),
            isRetrograde: isRetrograde(p.id, jd)
        }));

        const houses = calculateHouses(lst, location.lat, 23.439, houseSystem);

        // Save to state
        AppState.setAstroResults(planets, houses);

        // 3. Perform Zi Wei Dou Shu Calculations
        const zwData = ZiWei.calculate(birthDate, parseInt(birthHour));
        if (zwData) {
            // Process Period data
            const birthYear = new Date(birthDate).getFullYear();
            const age = queryYear - birthYear + 1; // 虛歲
            const isClockwise = ZiWei.isDaxianClockwise(zwData.yearStem, gender);
            const daxian = ZiWei.calculateDaxian(age, zwData.bureau, zwData.mingPos, isClockwise);
            const liunian = ZiWei.calculateLiunian(queryYear);

            zwData.palaces[daxian.palaceIndex].daxian = daxian;
            zwData.palaces[liunian.branchIndex].liunian = { ...liunian, year: queryYear };

            AppState.setZiWeiResults(zwData);
        }

        // 4. Perform Human Design Calculations
        const hdData = HumanDesign.calculate(jd);
        let hdTransitData = null;
        if (transitDate) {
            const tJd = getJulianDate(transitDate, transitTime);
            hdTransitData = HumanDesign.calculate(tJd);
        }
        AppState.setHDResults(hdData, hdData.design, hdTransitData);

        // 5. Render Everything
        renderAllModules();

        // 6. Save to History
        saveToHistory({
            date: birthDate,
            time: birthTime,
            lon: location.lon,
            lat: location.lat,
            isManual: location.isManual,
            locName: location.name,
            cityName: location.city,
            districtName: location.district
        });

        AppState.setLoading(false);
    }, 600);
});

/**
 * Orchestrates the rendering of all modules based on AppState
 */
function renderAllModules() {
    const { planets, houses } = AppState.results.astro;
    const zwData = AppState.results.ziwei;
    const hdData = AppState.results.humanDesign.personality;
    const hdTransitData = AppState.results.humanDesign.transit;
    const { transitDate, transitTime } = AppState.inputs;

    // --- Astro Rendering ---
    updateHemisphereAnalysis(planets, houses.cusps);

    if (transitDate) {
        const transitPlanets = calculateTransits(transitDate, transitTime);
        drawChart(planets, houses, true, showInterpretation);
        drawTransitRing(transitPlanets, houses.asc, houses.cusps, showTransitInterpretation);
        updateTransitResults(transitPlanets, houses);
        document.getElementById('transit-layer').style.display = 'block';
    } else {
        drawChart(planets, houses, false, showInterpretation);
        document.getElementById('transit-results-list').style.display = 'none';
        document.getElementById('transit-layer').style.display = 'none';
    }
    updateResults(planets, houses);

    // --- Zi Wei Rendering ---
    if (zwData) {
        renderZiWeiModule(zwData);
    }

    // --- Human Design Rendering ---
    if (hdData) {
        renderHumanDesignModule(hdData, hdTransitData);
    }
}

/**
 * Handles Zi Wei Dou Shu specific rendering
 */
function renderZiWeiModule(zwData) {
    document.getElementById('ziwei-results-list').style.display = 'block';
    const { queryYear, gender } = AppState.inputs;

    // Update Center Info
    const centerDiv = document.querySelector('.ziwei-center');
    if (centerDiv) {
        const lunar = zwData.lunar;
        const daxian = zwData.palaces.find(p => p.daxian)?.daxian;
        const liunian = zwData.palaces.find(p => p.liunian)?.liunian;
        const daxianPalace = zwData.palaces[daxian.palaceIndex];
        const liunianPalace = zwData.palaces[liunian.branchIndex];

        centerDiv.innerHTML = `
            <div class="ziwei-center-content">
                <div class="center-title">紫微斗數</div>
                <div class="center-info">
                    <div style="color:var(--text-gold); font-size:0.9rem; border-bottom:1px solid rgba(255,255,255,0.1); padding-bottom:5px; margin-bottom:5px;">
                        農曆 ${lunar.year}(${zwData.palaces[zwData.yearBranch].branch})年 ${lunar.isLeap ? "閏" : ""}${lunar.month}月${lunar.day}日
                    </div>
                    <div style="display:flex; justify-content:center; gap:10px; margin-bottom:10px;">
                        <span class="bureau-tag">${zwData.bureauName}</span>
                        <span class="bureau-tag" style="background:rgba(105,255,140,0.1); color:#69ff8c; border-color:#69ff8c;">${gender === 'male' ? '乾造' : '坤造'}</span>
                    </div>
                    <div class="period-status" style="text-align:left; font-size:0.85rem; background:rgba(255,255,255,0.03); padding:8px; border-radius:6px; border:1px solid rgba(255,255,255,0.05);">
                        <div style="display:flex; justify-content:space-between; margin-bottom:4px;">
                            <span style="color:#69ff8c;">當前大限：</span>
                            <span style="color:#fff;">${daxianPalace.name} (${daxian.ageRange})</span>
                        </div>
                        <div style="display:flex; justify-content:space-between;">
                            <span style="color:#ff9933;">${queryYear}流年：</span>
                            <span style="color:#fff;">${liunianPalace.name}</span>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // Render Palaces
    zwData.palaces.forEach((palace, i) => {
        const branches = ["zi", "chou", "yin", "mao", "chen", "si", "wu", "wei", "shen", "you", "xu", "hai"];
        const elId = `palace-${branches[i]}`;
        const el = document.getElementById(elId);

        if (el) {
            let starsHtml = '';
            const sortedStarsForGrid = [...palace.stars].sort((a, b) => {
                const order = { "major": 1, "lucky": 2, "ominous": 3 };
                return (order[a.type] || 9) - (order[b.type] || 9);
            });

            sortedStarsForGrid.forEach(star => {
                let className = "ziwei-star";
                if (star.type === "lucky") className += " star-lucky";
                if (star.type === "ominous") className += " star-ominous";

                let sihuaTag = '';
                if (star.sihua) {
                    const s = ZIWEI_DATA.SIHUA.TYPES[star.sihua];
                    sihuaTag = `<span class="sihua-marker" style="background:${s.color}">${s.symbol}</span>`;
                }
                starsHtml += `<span class="${className}" style="color:${star.color}">${star.name}${sihuaTag}</span>`;
            });

            let periodMarkers = '';
            if (palace.daxian) periodMarkers += '<span class="period-marker daxian-tag">限</span>';
            if (palace.liunian) periodMarkers += '<span class="period-marker liunian-tag">流</span>';

            el.innerHTML = `
                <div class="ziwei-bg-branch">${palace.branch}</div>
                <div class="ziwei-header">
                    <span class="ziwei-stem-branch">${palace.stem}${palace.branch}</span>
                    <div class="ziwei-markers">
                        ${palace.isMing ? '<span class="ziwei-marker marker-ming">命</span>' : ''}
                        ${palace.isShen ? '<span class="ziwei-marker marker-shen">身</span>' : ''}
                        ${periodMarkers}
                    </div>
                </div>
                <div class="ziwei-stars">${starsHtml}</div>
                <div class="ziwei-palace-name" style="${palace.daxian ? 'color:#69ff8c;' : (palace.liunian ? 'color:#ff9933;' : '')}">${palace.name}</div>
            `;

            el.style.cursor = 'pointer';
            el.onclick = () => showZiWeiInterpretation(palace);
            el.classList.remove('active-daxian', 'active-liunian');
            if (palace.daxian) el.classList.add('active-daxian');
            if (palace.liunian) el.classList.add('active-liunian');

            if (palace.isMing) {
                el.style.boxShadow = 'inset 0 0 20px rgba(255, 95, 95, 0.15)';
                el.style.borderColor = 'rgba(255, 95, 95, 0.4)';
            } else {
                el.style.boxShadow = '';
                el.style.borderColor = '';
            }
        }
    });
}

/**
 * Handles Human Design specific rendering
 */
function renderHumanDesignModule(hdData, hdTransitData) {
    const hdPanel = document.getElementById('hd-results-list');
    hdPanel.style.display = 'block';

    const circuitry = calcHD_Circuitry(hdData);
    const crossData = getIncarnationCross(hdData);

    // Summary Cards
    const summaryDiv = document.getElementById('hd-summary');
    summaryDiv.innerHTML = `
        <div class="hd-card" style="cursor:pointer;" onclick="showHDInterpretation('type', '${hdData.type}')">
            <div class="hd-card-label">類型 (Type)</div>
            <div class="hd-card-value" style="font-size:1.1rem; color:var(--hd-accent);">${hdData.type}</div>
        </div>
        <div class="hd-card" style="cursor:pointer;" onclick="showHDInterpretation('profile', '${hdData.profile}')">
            <div class="hd-card-label">人生角色 (Profile)</div>
            <div class="hd-card-value">${hdData.profile}</div>
        </div>
        <div class="hd-card" style="cursor:pointer;" onclick="showHDInterpretation('authority', '${hdData.authority}')">
            <div class="hd-card-label">內在權威 (Authority)</div>
            <div class="hd-card-value" style="font-size:1.1rem; color:#69ff8c;">${hdData.authority}</div>
        </div>
        <div class="hd-card" style="grid-column: 1 / -1; align-items: flex-start; text-align: left; cursor:pointer;" onclick="showHDInterpretation('cross', {name:'${crossData.fullName}', type:'${crossData.type}', quarter:'${crossData.quarter}', gates:'${crossData.gates}'})">
            <div class="hd-card-label">輪迴交叉 (Incarnation Cross)</div>
            <div class="hd-card-value" style="font-size:1.2rem; color:var(--text-gold);">${crossData.fullName}</div>
            <div style="font-size:0.75rem; color:rgba(255,255,255,0.4); margin-top:4px;">${crossData.gates}</div>
        </div>
        <div class="hd-card" style="grid-column: 1 / -1; align-items: flex-start;">
            <div class="hd-card-label">迴路分析 (Circuitry Analysis)</div>
            <div style="width:100%; display: grid; grid-template-columns: repeat(3, 1fr); gap: 1rem; margin-top: 10px;">
                <div class="circuit-bar-group">
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
                        <span>個人 (Indiv)</span>
                        <span>${Math.round(circuitry.individual / (circuitry.total || 1) * 100)}%</span>
                    </div>
                    <div style="height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                        <div style="width:${circuitry.individual / (circuitry.total || 1) * 100}%; height:100%; background:#ffff70;"></div>
                    </div>
                </div>
                <div class="circuit-bar-group">
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
                        <span>族群 (Tribal)</span>
                        <span>${Math.round(circuitry.tribal / (circuitry.total || 1) * 100)}%</span>
                    </div>
                    <div style="height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                        <div style="width:${circuitry.tribal / (circuitry.total || 1) * 100}%; height:100%; background:#ff5f5f;"></div>
                    </div>
                </div>
                <div class="circuit-bar-group">
                    <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
                        <span>社會 (Coll)</span>
                        <span>${Math.round(circuitry.collective / (circuitry.total || 1) * 100)}%</span>
                    </div>
                    <div style="height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                        <div style="width:${circuitry.collective / (circuitry.total || 1) * 100}%; height:100%; background:#bc8cff;"></div>
                    </div>
                </div>
            </div>
        </div>
    `;

    // Render BodyGraph
    const centersDiv = document.getElementById('hd-centers-grid');
    if (centersDiv) {
        centersDiv.className = 'hd-bodygraph-container';
        centersDiv.style.display = 'block';
        centersDiv.innerHTML = renderHumanDesignSVG(hdData, hdTransitData);
    }

    // Channels List
    const chanDiv = document.getElementById('hd-channels-list');
    if (chanDiv) {
        chanDiv.className = 'hd-channels-panel';
        chanDiv.innerHTML = '<h4 style="color:var(--text-gold); margin-bottom:1rem; text-transform:uppercase; letter-spacing:2px; border-bottom:1px solid rgba(255,105,180,0.2); padding-bottom:0.8rem;">開啟通道 (Active Channels)</h4>';

        const channelNames = {
            '1-8': '靈感 (Inspiration)', '2-14': '脈動 (Beat)', '3-60': '突變 (Mutation)', '4-63': '邏輯 (Logic)',
            '5-15': '韻律 (Rhythm)', '6-59': '親密 (Intimacy)', '7-31': '創始 (Alpha)', '9-52': '專注 (Concentration)',
            '10-20': '覺醒 (Awakening)', '10-34': '探索 (Exploration)', '10-57': '完美 (Perfected Form)', '11-56': '好奇 (Curiosity)',
            '12-22': '開放 (Openness)', '13-33': '浪子 (Prodigal)', '16-48': '才華 (Wavelength)', '17-62': '接受 (Acceptance)',
            '18-58': '批判 (Judgment)', '19-49': '整合 (Synthesis)', '20-34': '魅力 (Charisma)', '20-57': '腦波 (Brainwave)',
            '21-45': '金錢 (Money)', '23-43': '架構 (Structuring)', '24-61': '察覺 (Awareness)', '25-51': '發起 (Initiation)',
            '26-44': '傳遞 (Surrender)', '27-50': '保存 (Preservation)', '28-38': '困頓 (Struggle)', '29-46': '發現 (Discovery)',
            '30-41': '夢想 (Recognition)', '32-54': '轉化 (Transformation)', '34-57': '力量 (Power)', '35-36': '無常 (Transitoriness)',
            '37-40': '社群 (Community)', '39-55': '情緒 (Emoting)', '42-53': '成熟 (Maturation)', '47-64': '抽象 (Abstraction)'
        };

        if (hdData.activeChannels.length === 0) {
            chanDiv.innerHTML += '<div style="color:rgba(255,255,255,0.4); font-style:italic; text-align:center; margin-top:2rem;">無特定通道定義 (Reflector)</div>';
        } else {
            const listContainer = document.createElement('div');
            listContainer.style.display = 'flex';
            listContainer.style.flexDirection = 'column';

            hdData.activeChannels.forEach(ch => {
                const key = `${ch[0]}-${ch[1]}`;
                const reverseKey = `${ch[1]}-${ch[0]}`;
                const name = channelNames[key] || channelNames[reverseKey] || '通道';

                const item = document.createElement('div');
                item.className = 'hd-channel-item';
                item.style.cursor = 'pointer';
                item.onclick = () => showHDInterpretation('channel', key);
                item.innerHTML = `<span class="hd-channel-id">${ch[0]}-${ch[1]}</span><span>${name}</span>`;
                listContainer.appendChild(item);
            });
            chanDiv.appendChild(listContainer);
        }
    }

    // Planets Table
    const tDiv = document.getElementById('hd-planets-table');
    if (tDiv) {
        tDiv.className = 'hd-planet-grid';
        const hdPlanetNames = {
            'Sun': '太陽', 'Earth': '地球', 'Moon': '月亮', 'NorthNode': '北交點', 'SouthNode': '南交點',
            'Mercury': '水星', 'Venus': '金星', 'Mars': '火星', 'Jupiter': '木星', 'Saturn': '土星',
            'Uranus': '天王星', 'Neptune': '海王星', 'Pluto': '冥王星'
        };

        let pCol = `<div class="hd-planet-col"><div class="hd-planet-col-header" style="color:#fff;"><span>個性 (Personality)</span><span>意識 (Black)</span></div>`;
        hdData.personality.forEach(p => {
            const pName = hdPlanetNames[p.id] || p.id;
            pCol += `<div class="hd-planet-row" style="cursor:pointer;" onclick="showHDInterpretation('gate', ${p.gate})"><span style="color:#ccc;">${pName}</span><span style="font-family:monospace; font-weight:bold;">${p.gate}.${p.line}</span></div>`;
        });
        pCol += '</div>';

        let dCol = `<div class="hd-planet-col"><div class="hd-planet-col-header" style="color:#ff5f5f;"><span>設計 (Design)</span><span>潛意識 (Red)</span></div>`;
        hdData.design.forEach(d => {
            const dName = hdPlanetNames[d.id] || d.id;
            dCol += `<div class="hd-planet-row" style="cursor:pointer;" onclick="showHDInterpretation('gate', ${d.gate})"><span style="color:#ccc;">${dName}</span><span style="font-family:monospace; font-weight:bold; color:#ff5f5f;">${d.gate}.${d.line}</span></div>`;
        });
        dCol += '</div>';
        tDiv.innerHTML = pCol + dCol;
    }
}

// Event Listeners for Modals and Toggles
document.getElementById('modal-close').onclick = () => {
    document.getElementById('modal-overlay').style.display = 'none';
};
document.getElementById('modal-overlay').onclick = (e) => {
    if (e.target === document.getElementById('modal-overlay')) {
        document.getElementById('modal-overlay').style.display = 'none';
    }
};

document.getElementById('manual-coords-toggle').addEventListener('change', (e) => {
    const presets = document.getElementById('location-presets');
    const manual = document.getElementById('manual-coords-inputs');
    if (e.target.checked) {
        presets.style.display = 'none';
        manual.style.display = 'flex';
    } else {
        presets.style.display = 'block';
        manual.style.display = 'none';
    }
});

const btnTransitInfo = document.getElementById('transit-info-btn');
if (btnTransitInfo) {
    btnTransitInfo.addEventListener('click', (e) => {
        e.preventDefault();
        const modal = document.getElementById('modal-overlay');
        document.getElementById('modal-icon').textContent = 'T';
        document.getElementById('modal-icon').style.color = '#69ff8c';
        document.getElementById('modal-title').textContent = '行運 (Transit)';
        document.getElementById('modal-title').style.color = '#69ff8c';
        document.getElementById('modal-subtitle').textContent = 'CURRENT PLANETARY POSITIONS';

        const content = `
            <div class="interpretation-section">
                <h3>什麼是行運 (Transit)？</h3>
                <p>行運是指天空中行星當前的實際位置。與您出生時的「本命星盤」不同，行運星盤顯示的是「現在」或「特定時間點」的宇宙能量。</p>
            </div>
            <div class="interpretation-section">
                <h3>如何運用？</h3>
                <p>當行運行星與您本命盤中的行星或交點形成相位時，通常預示著生命中特定事件的觸發或心理狀態的改變。</p>
                <ul>
                    <li><strong>外行星 (木、土、天、海、冥)</strong>：影響較長遠，通常對應人生重大階段或社會環境的變化。</li>
                    <li><strong>內行星 (日、月、水、金、火)</strong>：影響較短暫，對應日常情緒、思維或短期事件。</li>
                </ul>
            </div>
            <div class="interpretation-section">
                <h3>本介面說明</h3>
                <p>外圈綠色圖層代表當前的行運天象。您可以觀察外圈行星落入您內圈（本命）的哪一宮位，來了解近期生活的重心領域。</p>
            </div>
        `;

        const existingList = document.querySelector('.interpretation-text');
        if (existingList) existingList.innerHTML = content;

        modal.style.display = 'flex';
    });
}

const btnJson = document.getElementById('download-json-btn');
if (btnJson) {
    btnJson.onclick = () => {
        const history = getHistory();
        const blob = new Blob([JSON.stringify(history, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'Birth_Chart_History.json';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    };
}

// PNG Export Logic
document.getElementById('export-btn').addEventListener('click', () => {
    const svg = document.getElementById('chart-svg');
    const serializer = new XMLSerializer();
    let source = serializer.serializeToString(svg);

    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns\:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const canvas = document.createElement('canvas');
    canvas.width = 1600;
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = function () {
        ctx.fillStyle = '#0a0e14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#c9a050';
        ctx.font = 'bold 32px "Segoe UI", "PingFang TC", "Microsoft JhengHei"';
        ctx.textAlign = 'left';

        const startX = 80;
        const startY = 1480;
        const colWidth = 280;
        const rowHeight = 50;

        const { planets, houses } = AppState.results.astro;

        if (planets) {
            planets.forEach((p, i) => {
                const signIdx = Math.floor(p.longitude / 30);
                const signName = ZODIAC_SIGNS[signIdx].name;
                const col = i % 5;
                const row = Math.floor(i / 5);
                ctx.fillText(`${p.name} ${signName}`, startX + col * colWidth, startY + row * rowHeight);
            });
        }

        if (houses) {
            const ascSign = ZODIAC_SIGNS[Math.floor(houses.asc / 30)].name;
            const mcSign = ZODIAC_SIGNS[Math.floor(houses.mc / 30)].name;
            ctx.fillText(`上升 ${ascSign}`, startX + 2 * colWidth, startY + 2 * rowHeight);
            ctx.fillText(`天頂 ${mcSign}`, startX + 3 * colWidth, startY + 2 * rowHeight);
        }

        URL.revokeObjectURL(url);
        const pngUrl = canvas.toDataURL('image/png');
        const downloadLink = document.createElement('a');
        downloadLink.href = pngUrl;
        downloadLink.download = 'Birth_Chart.png';
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);
    };
    img.src = url;
});

// Initialization
window.addEventListener('load', () => {
    // Populate Hours
    const hourSelect = document.getElementById('birth-hour');
    for (let i = 0; i < 24; i++) {
        const opt = document.createElement('option');
        opt.value = i.toString().padStart(2, '0');
        opt.textContent = i + ' 時';
        if (i === 12) opt.selected = true;
        hourSelect.appendChild(opt);
    }
    // Populate Minutes
    const minSelect = document.getElementById('birth-minute');
    for (let i = 0; i < 60; i++) {
        const opt = document.createElement('option');
        opt.value = i.toString().padStart(2, '0');
        opt.textContent = i + ' 分';
        minSelect.appendChild(opt);
    }

    // Populate Cities
    const citySelect = document.getElementById('location-city');
    const districtSelect = document.getElementById('location-district');

    if (citySelect && districtSelect) {
        Object.keys(TAIWAN_LOCATIONS).forEach(city => {
            const opt = document.createElement('option');
            opt.value = city;
            opt.textContent = city;
            citySelect.appendChild(opt);
        });

        citySelect.value = "台北市";

        function updateDistricts() {
            const city = citySelect.value;
            districtSelect.innerHTML = '';
            if (TAIWAN_LOCATIONS[city]) {
                TAIWAN_LOCATIONS[city].forEach(dist => {
                    const opt = document.createElement('option');
                    opt.value = dist.v;
                    opt.textContent = dist.n;
                    districtSelect.appendChild(opt);
                });
            }
        }

        citySelect.addEventListener('change', updateDistricts);
        updateDistricts();
        districtSelect.value = "121.56,25.03";
    }

    // Populate Transit Time Options
    const tHourSelect = document.getElementById('transit-hour');
    for (let i = 0; i < 24; i++) {
        const opt = document.createElement('option');
        opt.value = i.toString().padStart(2, '0');
        opt.textContent = i + ' 時';
        tHourSelect.appendChild(opt);
    }
    const tMinSelect = document.getElementById('transit-minute');
    for (let i = 0; i < 60; i++) {
        const opt = document.createElement('option');
        opt.value = i.toString().padStart(2, '0');
        opt.textContent = i + ' 分';
        tMinSelect.appendChild(opt);
    }

    if (!document.getElementById('transit-date').value) {
        syncTransitToNow();
    }

    document.getElementById('sync-now-btn').onclick = () => {
        syncTransitToNow();
        document.getElementById('calculate-btn').click();
    };

    const houseSelect = document.getElementById('house-system-select');
    if (houseSelect) {
        houseSelect.addEventListener('change', () => {
            document.getElementById('calculate-btn').click();
        });
    }

    renderHistory();
    document.getElementById('calculate-btn').click();
});
