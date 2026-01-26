// Global State
let currentPlanetPositions = [];
let currentHouseData = null;

// --- Analysis Logic ---
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

// --- Interpretation Logic ---
function showInterpretation(pointId, pointName, symbol, signName, houseIdx) {
    const modal = document.getElementById('modal-overlay');
    const icon = document.getElementById('modal-icon');
    const title = document.getElementById('modal-title');
    const subtitle = document.getElementById('modal-subtitle');

    icon.textContent = symbol;
    title.textContent = pointName;
    icon.style.color = 'var(--primary)';
    title.style.color = 'var(--text-gold)';

    let subText = `${pointId} in ${signName}`;
    if (houseIdx !== undefined) subText += ` / ${houseIdx + 1} House`;
    subtitle.textContent = subText;

    // 1. Basic Planet Meaning
    const basicPlanetMeaning = PLANET_MEANINGS[pointId] || '這是一個重要的星圖支點。';

    // 2. Specific Interpretation (Combined)
    let combined = '';

    // Check for specific database entry (Sun/Moon specific)
    let specificText = null;
    if (INTERPRETATION_DB[pointId] && INTERPRETATION_DB[pointId][signName]) {
        specificText = INTERPRETATION_DB[pointId][signName];
    }

    if (specificText) {
        // Use the specific text
        combined = specificText.replace(/\n/g, '<br>');
        if (houseIdx !== undefined && HOUSE_DESC_DB[houseIdx]) {
            combined += '<br><br><strong style="color: var(--primary);">生命領域情境：</strong><br>' + HOUSE_DESC_DB[houseIdx].replace(/\n/g, '<br>');
        }
    } else {
        // Fallback to generic construction with polished phrasing
        const signText = SIGN_MEANINGS[signName] ? SIGN_MEANINGS[signName].split('，')[0] : '獨特';
        combined = `<strong style="color: var(--primary);">能量風格：</strong><br>`;
        combined += `您的${pointName}落在${signName}`;
        if (houseIdx !== undefined) combined += `（第 ${houseIdx + 1} 宮）`;
        combined += `。<br>這顯示您傾向以「${signText}」的特質，來展現${pointName}的能量。`;

        if (houseIdx !== undefined && HOUSE_DESC_DB[houseIdx]) {
            combined += '<br><br><strong style="color: var(--primary);">生命領域情境：</strong><br>' + HOUSE_DESC_DB[houseIdx].replace(/\n/g, '<br>');
        }
    }

    // Retrograde check
    if (pointId !== 'ASC' && pointId !== 'MC') {
        const planetData = currentPlanetPositions.find(p => p.id === pointId);
        if (planetData && planetData.isRetrograde) {
            combined += `<br><br><span style="color: #ff5f5f; font-weight: bold;">⚠️ 逆行提示：</span><br>目前該行星正處於逆行狀態。這並不代表凶兆，而是意味著能量的發揮會比較內斂、延遲，或者您需要透過反覆的內省與回顧，才能成熟地運用這股力量。`;
        }
    }

    // 3. Detail Section (Sign)
    const signTraitHtml = `
        <div style="margin-bottom: 1rem;">
            <strong style="color: var(--primary);">星座特質：</strong> ${SIGN_MEANINGS[signName] || ''}
        </div>
    `;

    // Final Content Reconstruction
    const content = `
        <div class="interpretation-section">
            <h3>行星能量</h3>
            <p>${basicPlanetMeaning}</p>
        </div>
        <div class="interpretation-section">
            <h3>星座表現</h3>
            <div>${signTraitHtml}</div>
        </div>
        <div class="interpretation-section">
            <h3>綜合解讀</h3>
            <p>${combined}</p>
        </div>
    `;

    const container = document.querySelector('.interpretation-text');
    if (container) container.innerHTML = content;

    modal.style.display = 'flex';
}

function showTransitInterpretation(planet, houseIdx) {
    const modal = document.getElementById('modal-overlay');
    document.getElementById('modal-icon').textContent = planet.symbol;
    document.getElementById('modal-icon').style.color = '#69ff8c';
    document.getElementById('modal-title').textContent = `行運 ${planet.name}`;
    document.getElementById('modal-title').style.color = '#69ff8c';
    document.getElementById('modal-subtitle').textContent = `TRANSITING ${planet.id.toUpperCase()}`;

    const meanings = {
        'Sun': "焦點、活力、自我意識的投射。",
        'Moon': "情緒波動、潛意識、安全感的來源。",
        'Mercury': "溝通、思維模式、短途旅行、資訊交流。",
        'Venus': "愛情、價值觀、藝術、金錢、人際關係。",
        'Mars': "行動力、慾望、衝突、能量的釋放。",
        'Jupiter': "擴張、幸運、高等教育、哲學、過度自信。",
        'Saturn': "責任、限制、考驗、結構、業力。",
        'Uranus': "突變、革新、自由、意外、覺醒。",
        'Neptune': "夢幻、靈性、消融、欺騙、直覺。",
        'Pluto': "轉化、權力、毀滅與重生、深層心理。",
        'Chiron': "靈魂的創傷與療癒。",
        'NorthNode': "今生發展的方向與課題。"
    };

    if (houseIdx === undefined && currentHouseData) {
        houseIdx = getHouseIndex(planet.longitude, currentHouseData.cusps);
    }

    const impactDesc = (TRANSIT_HOUSE_IMPACTS[planet.id] && TRANSIT_HOUSE_IMPACTS[planet.id][houseIdx])
        ? TRANSIT_HOUSE_IMPACTS[planet.id][houseIdx]
        : "目前這顆行星正在啟動此宮位代表的生活領域，預示著相關事務的活化與展現潛能的時機。";

    const content = `
        <div class="interpretation-section">
            <h3>行運目前位置</h3>
            <p>行運 ${planet.name} 目前位於您星盤的 <strong>第 ${houseIdx + 1} 宮</strong>（度數：${Math.floor(planet.longitude * 100) / 100}°）。</p>
        </div>
        <div class="interpretation-section">
            <h3>行運能量關鍵字</h3>
            <p>${meanings[planet.id] || "宇宙能量的流動。"}</p>
        </div>
        <div class="interpretation-section" style="border: 1px solid rgba(105, 255, 140, 0.3); padding: 1rem; border-radius: 8px; background: rgba(105, 255, 140, 0.05);">
            <h3 style="color: #69ff8c;">🌸 當前生活影響 (Impact)</h3>
            <p style="font-size: 1.1rem; line-height: 1.6;">${impactDesc}</p>
        </div>
        <div class="interpretation-section">
            <h3>觀察要點</h3>
            <p>當行運行星進入特定宮位時，該宮位代表的人生領域將成為宇宙能量運作的舞台。外圈綠色星體即代表「現在的天象」正在如何與您的「本命潛能」產生互動與共鳴。</p>
        </div>
    `;

    const container = document.querySelector('.interpretation-text');
    if (container) container.innerHTML = content;

    modal.style.display = 'flex';
}

// --- Sync Logic ---
function syncTransitToNow() {
    const now = new Date();
    const dateStr = now.toISOString().split('T')[0];
    const hourStr = now.getHours().toString().padStart(2, '0');
    const minStr = now.getMinutes().toString().padStart(2, '0');

    document.getElementById('transit-date').value = dateStr;
    document.getElementById('transit-hour').value = hourStr;
    document.getElementById('transit-minute').value = minStr;
}

function updateTransitResults(transitPlanets, natalHouseData) {
    const container = document.getElementById('transit-items-container');
    const panel = document.getElementById('transit-results-list');
    if (!container || !panel) return;

    container.innerHTML = '';
    panel.style.display = 'block';
    transitPlanets.forEach(p => {
        const houseIdx = getHouseIndex(p.longitude, natalHouseData.cusps);
        const signIdx = Math.floor(p.longitude / 30);
        const signName = ZODIAC_SIGNS[signIdx].name;
        const deg = Math.floor(p.longitude % 30);

        const item = document.createElement('div');
        item.className = 'planet-info';
        item.style.background = 'rgba(105, 255, 140, 0.05)';
        item.style.border = '1px solid rgba(105, 255, 140, 0.2)';
        item.style.cursor = 'pointer';
        item.onclick = () => showTransitInterpretation(p, houseIdx);
        item.innerHTML = `
            <div class="planet-icon" style="color: #69ff8c;">${p.symbol}</div>
            <div class="planet-details">
                <div style="display: flex; align-items: center; gap: 0.4rem;">
                    <h4 style="color: #69ff8c;">${p.name}</h4>
                    <span style="font-size: 0.75rem; color: rgba(105, 255, 140, 0.7);">${signName} ${deg}°</span>
                </div>
                <p style="font-size: 0.85rem;">現落本命第 <strong style="color: #69ff8c; font-size: 1.1rem;">${houseIdx + 1}</strong> 宮</p>
            </div>
        `;
        container.appendChild(item);
    });
}

function updateResults(planetPos, houseData) {
    const list = document.getElementById('results-list');
    const aspectDiv = document.getElementById('aspect-list');
    list.innerHTML = '';
    aspectDiv.innerHTML = '';

    // 1. Calculate and Populate Aspects List
    for (let i = 0; i < planetPos.length; i++) {
        for (let j = i + 1; j < planetPos.length; j++) {
            const p1 = planetPos[i];
            const p2 = planetPos[j];
            const diff = Math.abs(p1.longitude - p2.longitude);
            const angle = diff > 180 ? 360 - diff : diff;

            let aspect = null;
            if (Math.abs(angle - 0) < 8) aspect = { name: '合相', symbol: '☌', color: '#ffffff' };
            else if (Math.abs(angle - 180) < 8) aspect = { name: '對分', symbol: '☍', color: '#ff3333' };
            else if (Math.abs(angle - 120) < 8) aspect = { name: '三分', symbol: '△', color: '#33ff33' };
            else if (Math.abs(angle - 90) < 8) aspect = { name: '四分', symbol: '□', color: '#ff9933' };
            else if (Math.abs(angle - 60) < 6) aspect = { name: '六分', symbol: '✱', color: '#33ffff' };

            if (aspect) {
                const orb = Math.abs(angle - (aspect.name === '合相' ? 0 : aspect.name === '對分' ? 180 : aspect.name === '三分' ? 120 : aspect.name === '四分' ? 90 : 60)).toFixed(1);
                const item = document.createElement('div');
                item.className = 'aspect-item';
                item.innerHTML = `
                    <span class="aspect-symbol" style="color: ${aspect.color}">${aspect.symbol}</span>
                    <div style="flex: 1;">
                        <strong>${p1.name} ${aspect.name} ${p2.name}</strong>
                        <div style="font-size: 0.7rem; color: var(--text-dim);">容許度: ${orb}°</div>
                    </div>
                `;
                aspectDiv.appendChild(item);
            }
        }
    }
    if (aspectDiv.innerHTML === '') aspectDiv.innerHTML = '<div style="color: var(--text-dim); padding: 1rem;">未發現顯著相位</div>';

    // 2. Populate Planet Results
    planetPos.forEach(p => {
        const signIdx = Math.floor(p.longitude / 30);
        const degInSign = Math.floor(p.longitude % 30);
        const signName = ZODIAC_SIGNS[signIdx].name;

        // House detection
        const houseIdx = getHouseIndex(p.longitude, houseData.cusps);

        const card = document.createElement('div');
        card.className = 'planet-info';
        card.style.cursor = 'pointer';
        card.onclick = () => showInterpretation(p.id, p.name, p.symbol, signName, houseIdx);

        card.innerHTML = `
            <div class="planet-icon" style="color: ${p.color}">${p.symbol}</div>
            <div class="planet-details">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h4>${p.name}</h4>
                    ${p.isRetrograde ? '<span style="color: #ff5f5f; font-size: 0.7rem; font-weight: bold; border: 1px solid #ff5f5f; padding: 0 4px; border-radius: 4px;">Rx</span>' : ''}
                </div>
                <p>${signName} ${degInSign}° / 第 ${houseIdx + 1} 宮</p>
            </div>
        `;
        list.appendChild(card);
    });

    // 3. Four Angles (ASC, DSC, MC, IC)
    const dsc = (houseData.asc + 180) % 360;
    const ic = (houseData.mc + 180) % 360;

    [
        { id: 'ASC', name: '上升點 (Ascendant)', symbol: 'ASC', longitude: houseData.asc, color: 'var(--primary)' },
        { id: 'DSC', name: '下降點 (Descendant)', symbol: 'DSC', longitude: dsc, color: 'var(--primary)' },
        { id: 'MC', name: '天頂 (Midheaven)', symbol: 'MC', longitude: houseData.mc, color: 'var(--primary)' },
        { id: 'IC', name: '天底 (Imum Coeli)', symbol: 'IC', longitude: ic, color: 'var(--primary)' }
    ].forEach(p => {
        const signIdx = Math.floor(p.longitude / 30);
        const degInSign = Math.floor(p.longitude % 30);
        const signName = ZODIAC_SIGNS[signIdx].name;

        const card = document.createElement('div');
        card.className = 'planet-info';
        card.style.border = "1px solid var(--glass-border)"; // Consistent style
        card.style.cursor = 'pointer';
        card.onclick = () => showInterpretation(p.id, p.name, p.symbol, signName);
        card.innerHTML = `
            <div class="planet-icon" style="color: ${p.color}; font-size: 1.1rem; font-weight: bold;">${p.symbol}</div>
            <div class="planet-details">
                <div style="display: flex; align-items: center; gap: 0.5rem;">
                    <h4>${p.name}</h4>
                </div>
                <p>${signName} ${degInSign}°</p>
            </div>
        `;
        list.appendChild(card);
    });

    // 4. Update Balance Analysis
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

    const total = planetPos.length + 2; // Planets + ASC + MC

    const renderBar = (label, count, color) => `
        <div class="balance-label">
            <span>${label}</span>
            <span>${Math.round((count / total) * 100)}%</span>
        </div>
        <div class="balance-bar-bg">
            <div class="balance-bar-fill" style="width: ${(count / total) * 100}%; background: ${color};"></div>
        </div>
        <div style="margin-bottom: 0.8rem;"></div>
    `;

    document.getElementById('elements-chart').innerHTML = `
        ${renderBar('火 (Fire)', counts.fire, '#ff5f5f')}
        ${renderBar('土 (Earth)', counts.earth, '#69ff8c')}
        ${renderBar('風 (Air)', counts.air, '#ffff70')}
        ${renderBar('水 (Water)', counts.water, '#5fafff')}
    `;

    document.getElementById('modalities-chart').innerHTML = `
        ${renderBar('開創 (Cardinal)', counts.cardinal, '#ff99cc')}
        ${renderBar('固定 (Fixed)', counts.fixed, '#cc99ff')}
        ${renderBar('變動 (Mutable)', counts.mutable, '#66ffff')}
    `;
}

// --- History Logic ---
const STORAGE_KEY = 'birth_chart_history';

function getHistory() {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
}

function saveToHistory(entry) {
    let history = getHistory();
    // Remove duplicate
    history = history.filter(h =>
        !(h.date === entry.date && h.time === entry.time &&
            h.lon === entry.lon && h.lat === entry.lat)
    );
    history.unshift(entry);
    history = history.slice(0, 10); // Keep last 10
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    renderHistory();
}

function renderHistory() {
    const list = document.getElementById('history-list');
    const history = getHistory();
    list.innerHTML = '';

    history.forEach(item => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.onclick = () => {
            document.getElementById('birth-date').value = item.date;
            const [hh, mm] = item.time.split(':');
            document.getElementById('birth-hour').value = hh;
            document.getElementById('birth-minute').value = mm;

            if (item.isManual) {
                const toggle = document.getElementById('manual-coords-toggle');
                if (!toggle.checked) {
                    toggle.checked = true;
                    toggle.dispatchEvent(new Event('change'));
                }
                document.getElementById('manual-lon').value = item.lon;
                document.getElementById('manual-lat').value = item.lat;
            } else {
                const toggle = document.getElementById('manual-coords-toggle');
                if (toggle.checked) {
                    toggle.checked = false;
                    toggle.dispatchEvent(new Event('change'));
                }

                if (item.cityName && item.districtName) {
                    const citySel = document.getElementById('location-city');
                    citySel.value = item.cityName;
                    citySel.dispatchEvent(new Event('change'));
                    document.getElementById('location-district').value = `${item.lon},${item.lat}`;
                }
            }
            document.getElementById('calculate-btn').click();
        };

        div.innerHTML = `
            <div class="details">
                <span class="date">${item.date} ${item.time}</span>
                <span class="loc">${item.locName}</span>
            </div>
            <div style="font-size: 1.2rem; color: var(--primary);">↺</div>
        `;
        list.appendChild(div);
    });
}

// --- Initialization ---

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

// Calculate Button Event
document.getElementById('calculate-btn').addEventListener('click', () => {
    const loading = document.getElementById('loading');
    loading.style.display = 'flex';

    setTimeout(() => {
        const date = document.getElementById('birth-date').value;
        const hh = document.getElementById('birth-hour').value;
        const mm = document.getElementById('birth-minute').value;
        const time = `${hh}:${mm}`;

        let lon, lat;
        if (document.getElementById('manual-coords-toggle').checked) {
            lon = parseFloat(document.getElementById('manual-lon').value);
            lat = parseFloat(document.getElementById('manual-lat').value);
        } else {
            const distVal = document.getElementById('location-district').value;
            if (distVal) {
                [lon, lat] = distVal.split(',').map(Number);
            } else {
                lon = 121.56; lat = 25.03;
            }
        }

        const jd = getJulianDate(date, time);
        const lst = getSiderealTime(jd, lon);

        const planetPositionsRefined = PLANETS.map(p => ({
            ...p,
            longitude: getHighPrecisionLongitude(p.id, jd),
            isRetrograde: isRetrograde(p.id, jd)
        }));

        currentPlanetPositions = planetPositionsRefined;

        // Get selected house system
        const houseSystem = document.getElementById('house-system-select').value;
        const houseData = calculateHouses(lst, lat, 23.439, houseSystem);
        currentHouseData = houseData;

        updateHemisphereAnalysis(planetPositionsRefined, houseData.cusps);

        // Transit Calculation
        const tLayer = document.getElementById('transit-layer');
        tLayer.style.display = 'none';

        const tDate = document.getElementById('transit-date').value;
        const tHour = document.getElementById('transit-hour').value;
        const tMin = document.getElementById('transit-minute').value;

        if (tDate) {
            const transitPlanets = calculateTransits(tDate, `${tHour}:${tMin}`);
            drawChart(planetPositionsRefined, houseData, true, showInterpretation); // Pass callback
            drawTransitRing(transitPlanets, houseData.asc, houseData.cusps, showTransitInterpretation); // Pass callback & cusps
            updateTransitResults(transitPlanets, houseData);
        } else {
            drawChart(planetPositionsRefined, houseData, false, showInterpretation);
            document.getElementById('transit-results-list').style.display = 'none';
        }
        updateResults(planetPositionsRefined, houseData);

        // Save to history
        const isManual = document.getElementById('manual-coords-toggle').checked;
        let locName = "";
        let cityName = null;
        let districtName = null;

        if (isManual) {
            locName = `手動 (${lon}, ${lat})`;
        } else {
            const cSel = document.getElementById('location-city');
            const dSel = document.getElementById('location-district');
            cityName = cSel.value;
            districtName = dSel.options[dSel.selectedIndex].text;
            locName = `${cityName} ${districtName}`;
        }

        saveToHistory({
            date,
            time,
            lon,
            lat,
            isManual,
            locName,
            cityName,
            districtName
        });

        loading.style.display = 'none';
    }, 600);
});

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

    // Add namespaces if missing
    if (!source.match(/^<svg[^>]+xmlns="http\:\/\/www\.w3\.org\/2000\/svg"/)) {
        source = source.replace(/^<svg/, '<svg xmlns="http://www.w3.org/2000/svg"');
    }
    if (!source.match(/^<svg[^>]+xmlns\:xlink="http\:\/\/www\.w3\.org\/1999\/xlink"/)) {
        source = source.replace(/^<svg/, '<svg xmlns:xlink="http://www.w3.org/1999/xlink"');
    }

    // Create a Blob from the SVG source
    const svgBlob = new Blob([source], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const canvas = document.createElement('canvas');
    canvas.width = 1600; // High resolution
    canvas.height = 1600;
    const ctx = canvas.getContext('2d');

    const img = new Image();
    img.onload = function () {
        // Clear canvas and draw background
        ctx.fillStyle = '#0a0e14';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw the SVG image onto the canvas
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Add Planet Info Text at the bottom
        ctx.fillStyle = '#c9a050';
        ctx.font = 'bold 32px "Segoe UI", "PingFang TC", "Microsoft JhengHei"';
        ctx.textAlign = 'left';

        const startX = 80;
        const startY = 1480;
        const colWidth = 280;
        const rowHeight = 50;

        // Regular Planets
        if (currentPlanetPositions) {
            currentPlanetPositions.forEach((p, i) => {
                const signIdx = Math.floor(p.longitude / 30);
                const signName = ZODIAC_SIGNS[signIdx].name;
                const col = i % 5;
                const row = Math.floor(i / 5);
                ctx.fillText(`${p.name} ${signName}`, startX + col * colWidth, startY + row * rowHeight);
            });
        }

        // ASC and MC
        if (currentHouseData) {
            const ascSign = ZODIAC_SIGNS[Math.floor(currentHouseData.asc / 30)].name;
            const mcSign = ZODIAC_SIGNS[Math.floor(currentHouseData.mc / 30)].name;
            ctx.fillText(`上升 ${ascSign}`, startX + 2 * colWidth, startY + 2 * rowHeight);
            ctx.fillText(`天頂 ${mcSign}`, startX + 3 * colWidth, startY + 2 * rowHeight);
        }

        // Clean up URL
        URL.revokeObjectURL(url);

        // Create download link
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
