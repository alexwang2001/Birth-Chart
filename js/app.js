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



function showZiWeiInterpretation(palace) {
    const modal = document.getElementById('modal-overlay');
    const icon = document.getElementById('modal-icon');
    const title = document.getElementById('modal-title');
    const subtitle = document.getElementById('modal-subtitle');
    const container = document.querySelector('.interpretation-text');

    icon.textContent = palace.branch;
    icon.style.color = '#bc8cff';
    title.textContent = `${palace.stem}${palace.branch} ${palace.name}`;
    title.style.color = '#bc8cff';
    subtitle.textContent = "紫微命盤詳解 (Zi Wei Palace Details)";

    const data = ZIWEI_DATA.INTERPRETATIONS;
    const sihuaData = ZIWEI_DATA.SIHUA;

    // 1. Stars List format
    let starsHtml = '';
    if (palace.stars.length > 0) {
        starsHtml = palace.stars.map(star => {
            let sihuaTag = '';
            if (star.sihua) {
                const s = sihuaData.TYPES[star.sihua];
                sihuaTag = `<span style="font-size:0.8rem; background:${s.color}; color:#000; padding:2px 4px; border-radius:3px; vertical-align:middle; margin-left:4px;">${s.symbol}</span>`;
            }
            return `<div style="display:inline-block; margin-right:15px; margin-bottom:10px;">
                        <span style="color:${star.color}; font-weight:bold; font-size:1.4rem; text-shadow: 0 0 5px rgba(0,0,0,0.5);">${star.name}</span>${sihuaTag}
                    </div>`;
        }).join('');
    } else {
        starsHtml = '<span style="color: var(--text-dim); font-style:italic;">無主星 (Empty Palace) - 請參考對宮星曜</span>';
    }

    // 2. Star Meanings (Dynamic)
    let starDescriptionsHtml = "";
    if (palace.stars.length > 0) {
        starDescriptionsHtml = '<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">';

        const sortedStars = [...palace.stars].sort((a, b) => {
            const order = { "major": 1, "lucky": 2, "ominous": 3 };
            return (order[a.type] || 9) - (order[b.type] || 9);
        });

        sortedStars.forEach(star => {
            const starData = data.stars[star.id] || data.stars[star.name];
            let desc = starData ? `${starData.description}` : "具備特殊的宇宙能量。";
            let typeLabel = "";
            let color = star.color;
            if (star.type === "lucky") { typeLabel = " [吉]"; color = "#69ff8c"; }
            if (star.type === "ominous") { typeLabel = " [煞]"; color = "#ff5f5f"; }

            let sihuaBlock = '';
            if (star.sihua) {
                const s = sihuaData.TYPES[star.sihua];
                const sInterp = sihuaData.INTERPRETATIONS[star.sihua];
                sihuaBlock = `
                    <div style="margin-top: 5px; padding: 8px; background: rgba(255,255,255,0.05); border-radius: 4px; border-left: 2px solid ${s.color};">
                        <span style="color:${s.color}; font-weight:bold;">${s.name}：</span>
                        <span style="font-size:0.9rem; color:#ccc;">${s.meaning}。${sInterp.inPalace[palace.name] || ""}</span>
                    </div>
                `;
            }

            starDescriptionsHtml += `
            <div style="margin-bottom: 1.2rem; border-left: 2px solid ${color}; padding-left: 12px;">
                <div style="display:flex; align-items:center; gap:8px;">
                    <span style="color:${color}; font-weight:bold; font-size:1.1rem;">${star.name}${typeLabel}</span>
                    ${starData ? `<small style="color:var(--text-dim);">${starData.meaning}</small>` : ''}
                </div>
                <div style="color: var(--text-light); font-size: 0.95rem; line-height: 1.5; margin-top:4px;">${desc}</div>
                ${sihuaBlock}
            </div>`;
        });
        starDescriptionsHtml += '</div>';
    }

    const content = `
        <div class="interpretation-section">
            <h3 style="margin-bottom:1rem;">宮位主星 (Stars in Palace)</h3>
            <div style="margin-bottom:0.5rem;">${starsHtml}</div>
            ${starDescriptionsHtml}
        </div>
        <div class="interpretation-section" style="background: rgba(188, 140, 255, 0.05); padding: 1.2rem; border-radius: 8px; border: 1px solid rgba(188, 140, 255, 0.15);">
            <h3 style="color: #bc8cff; margin-top: 0;">🏰 ${palace.name} 的深層意涵</h3>
            <p style="line-height: 1.7; font-size: 1.05rem; color: #eee; margin-bottom: 0;">${data.palaces[palace.name] || "此宮位主要影響您人生的特定領域。"}</p>
        </div>
        <div class="interpretation-section">
            <h3>命盤地位 (Palace Status)</h3>
            <p style="line-height: 1.6;">
                這是您命盤中的 <strong>【${palace.stem}${palace.branch}宮】</strong>。<br>
                ${palace.isMing ? '<span style="color:#ff5f5f; font-weight:bold; display:block; margin: 8px 0; font-size: 1.1rem;">★ 命宮 (Life Palace)：</span>核心特質與一生總運。' : ""}
                ${palace.isShen ? '<span style="color:#ffff70; font-weight:bold; display:block; margin: 8px 0; font-size: 1.1rem;">★ 身宮 (Body Palace)：</span>後天發展重心。' : ""}
                ${palace.daxian ? `<span style="color:#69ff8c; font-weight:bold; display:block; margin: 8px 0;">◎ 當前大限 (${palace.daxian.ageRange})：</span>目前十年運勢的主導宮位。` : ""}
                ${palace.liunian ? `<span style="color:#ff9933; font-weight:bold; display:block; margin: 8px 0;">◎ ${palace.liunian.year} 流年：</span>今年的運勢重點。` : ""}
            </p>
        </div>
    `;

    if (container) container.innerHTML = content;
    modal.style.display = 'flex';
}

function showHDInterpretation(category, value) {
    const modal = document.getElementById('modal-overlay');
    const icon = document.getElementById('modal-icon');
    const title = document.getElementById('modal-title');
    const subtitle = document.getElementById('modal-subtitle');
    const container = document.querySelector('.interpretation-text');

    icon.textContent = '🧬';
    icon.style.color = '#ff69b4';
    title.style.color = '#ff69b4';

    let content = '';

    if (category === 'type') {
        const data = HD_INTERPRETATIONS.types[value];
        title.textContent = value;
        subtitle.textContent = '人類圖類型 (Type)';
        if (data) {
            content = `
                <div class="interpretation-section">
                    <h3 style="color:#ff69b4;">策略：${data.strategy}</h3>
                    <p style="font-size: 1.1rem; line-height: 1.6;">${data.description}</p>
                </div>
                <div class="interpretation-section">
                    <h3>人生主題 (Theme)</h3>
                    <p>${data.theme}</p>
                </div>
            `;
        }
    } else if (category === 'authority') {
        const desc = HD_INTERPRETATIONS.authorities[value];
        title.textContent = value;
        subtitle.textContent = '內在權威 (Inner Authority)';
        content = `
            <div class="interpretation-section">
                <h3>決策依據</h3>
                <p style="font-size: 1.1rem; line-height: 1.6;">${desc || "這是引導您做出正確決定的內在導航系統。"}</p>
            </div>
            <div class="interpretation-section">
                <p>請記得，內在權威永遠優先於大腦的邏輯分析。遵循您的權威能引領您走向最符合天賦的人生道路。</p>
            </div>
        `;
    } else if (category === 'profile') {
        // Find if value starts with the key
        const key = Object.keys(HD_INTERPRETATIONS.profiles).find(k => value.startsWith(k));
        const desc = HD_INTERPRETATIONS.profiles[key];
        title.textContent = value;
        subtitle.textContent = '人生角色 (Profile)';
        content = `
            <div class="interpretation-section">
                <h3>角色意涵</h3>
                <p style="font-size: 1.1rem; line-height: 1.6;">${desc || "人生角色決定了您如何與世界互動，以及您在社會中扮演的核心角色。"}</p>
            </div>
            <div class="interpretation-section">
                <p>人生角色結合了您的意識（第一數字）與潛意識（第二數字）的特質。</p>
            </div>
        `;
    } else if (category === 'center') {
        const data = HD_INTERPRETATIONS.centers[value];
        title.textContent = data ? data.name : value;
        subtitle.textContent = '能量中心 (Center)';
        if (data) {
            content = `
                <div class="interpretation-section">
                    <h3 style="color:#ff69b4;">核心功能：${data.function}</h3>
                </div>
                <div class="interpretation-section">
                    <h3 style="color: #69ff8c;">如果您是「有定義 (填色)」：</h3>
                    <p style="font-size: 1rem; color: var(--text-light);">${data.defined}</p>
                </div>
                <div class="interpretation-section">
                    <h3 style="color: #888;">如果您是「無定義 (空白)」：</h3>
                    <p style="font-size: 1rem; color: var(--text-dim);">${data.undefined}</p>
                </div>
            `;
        }
    } else if (category === 'channel') {
        const desc = HD_INTERPRETATIONS.channels[value];
        title.textContent = '通道 ' + value;
        subtitle.textContent = '人類圖通道 (Channel)';
        content = `
            <div class="interpretation-section">
                <h3>通道特質</h3>
                <p style="font-size: 1.1rem; line-height: 1.6;">${desc || "這條通道代表了您生命中特定且穩定的能量流動方式。"}</p>
            </div>
            <div class="interpretation-section">
                <p>通道連帶著兩個能量中心，當一條通道被定義時，這兩個中心也會同時被定義（填色），展現出特定的天賦才華。</p>
            </div>
        `;
    } else if (category === 'cross') {
        const { name, type, quarter, gates } = value;
        title.textContent = name;
        subtitle.textContent = '輪迴交叉 (Incarnation Cross)';

        const typeDesc = HD_INTERPRETATIONS.cross_types[type] || "";
        const quarterDesc = HD_INTERPRETATIONS.quarters[quarter] || "";

        content = `
            <div class="interpretation-section">
                <h3 style="color:#ff69b4;">您的核心使命</h3>
                <p style="font-size: 1.1rem; line-height: 1.6;">輪迴交叉代表了您此生在世界上的核心運作方式與「人生基調」。這是由您出生圖中最重要的四個能量點（太陽/地球）所構成的。</p>
            </div>
            <div class="interpretation-section" style="background: rgba(255, 105, 180, 0.05); padding: 1rem; border-radius: 8px; border: 1px solid rgba(255, 105, 180, 0.2);">
                <h3 style="color: #ff69b4;">運作幾何：${type}</h3>
                <p style="line-height: 1.6;">${typeDesc}</p>
            </div>
            <div class="interpretation-section">
                <h3 style="color: var(--text-gold);">生命季節：${quarter}</h3>
                <p style="line-height: 1.6;">${quarterDesc}</p>
            </div>
            <div class="interpretation-section">
                <h3>關鍵門戶 (Gates)</h3>
                <p style="font-family: monospace; font-size: 1.1rem; color: #ccc;">${gates}</p>
                <div style="font-size:0.85rem; color:var(--text-dim); margin-top:0.5rem;">
                    (個性太陽 / 個性地球 | 設計太陽 / 設計地球)
                </div>
            </div>
        `;
    } else if (category === 'gate') {
        const data = HD_INTERPRETATIONS.gates[value];
        title.textContent = `閘門 ${value}：${data ? data.name : ''}`;
        subtitle.textContent = '人類圖閘門 (Gate)';
        if (data) {
            content = `
                <div class="interpretation-section">
                    <h3 style="color:#ff69b4;">核心特質：${data.key}</h3>
                    <p style="font-size: 1.1rem; line-height: 1.6;">${data.desc}</p>
                </div>
                <div class="interpretation-section" style="margin-top:2rem; padding-top:1rem; border-top: 1px solid rgba(255,255,255,0.05);">
                    <p style="font-size:0.9rem; color:var(--text-dim);">閘門是您命盤中特定能量的出口。當閘門所在的中心被定義，或者與對向閘門接通形成通道時，這股力量將以更穩定、更具影響力的方式展現。</p>
                </div>
            `;
        }
    }

    if (container) container.innerHTML = content;
    modal.style.display = 'flex';
}

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

        // Zi Wei Dou Shu Calculation and Rendering
        const gender = document.getElementById('gender').value;
        const queryYear = parseInt(document.getElementById('query-year').value) || 2026;
        const zwData = ZiWei.calculate(date, parseInt(hh));

        if (zwData) {
            document.getElementById('ziwei-results-list').style.display = 'block';

            // Calculate Daxian and Liunian
            const birthYear = new Date(date).getFullYear();
            const age = queryYear - birthYear + 1; // 虛歲
            const isClockwise = ZiWei.isDaxianClockwise(zwData.yearStem, gender);
            const daxian = ZiWei.calculateDaxian(age, zwData.bureau, zwData.mingPos, isClockwise);
            const liunian = ZiWei.calculateLiunian(queryYear);

            // Update Palaces with Period info
            zwData.palaces[daxian.palaceIndex].daxian = daxian;
            zwData.palaces[liunian.branchIndex].liunian = { ...liunian, year: queryYear };

            // Update Center Info
            const centerDiv = document.querySelector('.ziwei-center');
            if (centerDiv) {
                const lunar = zwData.lunar;
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
                            
                            <!-- Period Info -->
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

                    // Period Markers
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
                        <div class="ziwei-stars">
                            ${starsHtml}
                        </div>
                        <div class="ziwei-palace-name" style="${palace.daxian ? 'color:#69ff8c;' : (palace.liunian ? 'color:#ff9933;' : '')}">${palace.name}</div>
                    `;

                    el.style.cursor = 'pointer';
                    el.onclick = () => showZiWeiInterpretation(palace);

                    // Add Highlighting
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

        // --- Human Design Calculation ---
        const hdData = HumanDesign.calculate(jd);

        // --- Human Design Transit Overlay ---
        let hdTransitData = null;
        if (document.getElementById('transit-date').value) {
            const tDate = document.getElementById('transit-date').value;
            const tHour = document.getElementById('transit-hour').value;
            const tMin = document.getElementById('transit-minute').value;
            const tJd = getJulianDate(tDate, `${tHour}:${tMin}`);
            hdTransitData = HumanDesign.calculate(tJd);
        }

        const hdPanel = document.getElementById('hd-results-list');

        if (hdPanel && hdData) {
            hdPanel.style.display = 'block';

            // 0. Circuitry & Cross Calculation
            const circuitry = calcCircuitry(hdData);
            const crossData = getIncarnationCross(hdData);

            // 1. Summary Cards
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
                                <span>${Math.round(circuitry.individual / circuitry.total * 100)}%</span>
                            </div>
                            <div style="height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                                <div style="width:${circuitry.individual / circuitry.total * 100}%; height:100%; background:#ffff70;"></div>
                            </div>
                        </div>
                        <div class="circuit-bar-group">
                            <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
                                <span>族群 (Tribal)</span>
                                <span>${Math.round(circuitry.tribal / circuitry.total * 100)}%</span>
                            </div>
                            <div style="height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                                <div style="width:${circuitry.tribal / circuitry.total * 100}%; height:100%; background:#ff5f5f;"></div>
                            </div>
                        </div>
                        <div class="circuit-bar-group">
                            <div style="display:flex; justify-content:space-between; font-size:0.75rem; margin-bottom:4px;">
                                <span>社會 (Coll)</span>
                                <span>${Math.round(circuitry.collective / circuitry.total * 100)}%</span>
                            </div>
                            <div style="height:4px; background:rgba(255,255,255,0.05); border-radius:2px; overflow:hidden;">
                                <div style="width:${circuitry.collective / circuitry.total * 100}%; height:100%; background:#bc8cff;"></div>
                            </div>
                        </div>
                    </div>
                </div>
             `;



            // 2. BodyGraph Visualization
            const centersDiv = document.getElementById('hd-centers-grid');
            centersDiv.className = 'hd-bodygraph-container'; // Ensures container styling
            centersDiv.style.display = 'block';

            // Render High-Fidelity SVG with Transit Overlay
            centersDiv.innerHTML = renderHumanDesignSVG(hdData, hdTransitData);


            // 3. Channels List (Styled Panel)
            const chanDiv = document.getElementById('hd-channels-list');
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

            const hdPlanetNames = {
                'Sun': '太陽', 'Earth': '地球', 'Moon': '月亮', 'NorthNode': '北交點', 'SouthNode': '南交點',
                'Mercury': '水星', 'Venus': '金星', 'Mars': '火星', 'Jupiter': '木星', 'Saturn': '土星',
                'Uranus': '天王星', 'Neptune': '海王星', 'Pluto': '冥王星'
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
                    item.innerHTML = `
                        <span class="hd-channel-id">${ch[0]}-${ch[1]}</span>
                        <span>${name}</span>
                     `;
                    listContainer.appendChild(item);
                });
                chanDiv.appendChild(listContainer);
            }

            // 4. Planets Table (Two columns)
            const tDiv = document.getElementById('hd-planets-table');
            tDiv.className = 'hd-planet-grid';

            let pCol = `<div class="hd-planet-col">
                            <div class="hd-planet-col-header" style="color:#fff;">
                                <span>個性 (Personality)</span>
                                <span>意識 (Black)</span>
                            </div>`;

            hdData.personality.forEach(p => {
                const pName = hdPlanetNames[p.id] || p.id;
                pCol += `<div class="hd-planet-row" style="cursor:pointer;" onclick="showHDInterpretation('gate', ${p.gate})">
                    <span style="color:#ccc;">${pName}</span>
                    <span style="font-family:monospace; font-weight:bold;">${p.gate}.${p.line}</span>
                 </div>`;
            });
            pCol += '</div>';

            let dCol = `<div class="hd-planet-col">
                            <div class="hd-planet-col-header" style="color:#ff5f5f;">
                                <span>設計 (Design)</span>
                                <span>潛意識 (Red)</span>
                            </div>`;

            hdData.design.forEach(d => {
                const dName = hdPlanetNames[d.id] || d.id;
                dCol += `<div class="hd-planet-row" style="cursor:pointer;" onclick="showHDInterpretation('gate', ${d.gate})">
                    <span style="color:#ccc;">${dName}</span>
                    <span style="font-family:monospace; font-weight:bold; color:#ff5f5f;">${d.gate}.${d.line}</span>
                 </div>`;
            });
            dCol += '</div>';

            tDiv.innerHTML = pCol + dCol;
        }


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

        // ... (Existing content)

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

// --- Human Design SVG Renderer ---

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
    // We map each channel to a specific path.
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
        { id: '31-7', p1: { c: 'Throat', x: -10, y: 32 }, p2: { c: 'G', x: -10, y: -32 } }, // Leftish
        { id: '8-1', p1: { c: 'Throat', x: 0, y: 32 }, p2: { c: 'G', x: 0, y: -32 } },   // Center
        { id: '33-13', p1: { c: 'Throat', x: 10, y: 32 }, p2: { c: 'G', x: 10, y: -32 } },  // Rightish

        // Throat-Spleen
        { id: '16-48', p1: { c: 'Throat', x: -32, y: -10 }, p2: { c: 'Spleen', x: 10, y: -20 } }, // Top connection
        { id: '20-57', p1: { c: 'Throat', x: -32, y: 10 }, p2: { c: 'Spleen', x: 15, y: 0 } },

        // Throat-Heart
        { id: '45-21', p1: { c: 'Throat', x: 32, y: 10 }, p2: { c: 'Heart', x: -10, y: -20 } }, // Curvy?

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
        { id: '10-57', p1: { c: 'G', x: -32, y: 0 }, p2: { c: 'Spleen', x: 25, y: 0 } }, // 10 is complex

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

        // Integration / Missing / Complex
        { id: '20-10', p1: { c: 'Throat', x: -20, y: 32 }, p2: { c: 'G', x: -32, y: -10 } }, // 20-10 Awakening
        { id: '20-34', p1: { c: 'Throat', x: -25, y: 32 }, p2: { c: 'Sacral', x: -32, y: -20 } }, // 20-34 Charisma. Needs curve?
        { id: '10-34', p1: { c: 'G', x: -20, y: 32 }, p2: { c: 'Sacral', x: -20, y: -32 } }, // 10-34 Exploration

        // 34-57 is Power (Sacral-Spleen) - Added above
        // 10-57 is Perfected Form (G-Spleen) - Added above
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

    // Draw Channels
    // We iterate active channels from hdData, but we also want to draw inactive "pipes"? 
    // Usually HD charts show outlines of ALL channels.
    // Let's stick to drawing Lines for all, highlighting active ones.

    // First, determine activation of each channel
    // format of activeChannels: [[g1, g2], ...]
    const activeSet = new Set(hdData.activeChannels.map(ch => {
        const k1 = `${ch[0]}-${ch[1]}`;
        const k2 = `${ch[1]}-${ch[0]}`;
        return [k1, k2];
    }).flat());

    // Transit Active Set
    const transitActiveSet = hdTransitData ? new Set(hdTransitData.activeChannels.map(ch => {
        const k1 = `${ch[0]}-${ch[1]}`;
        return k1;
    })) : new Set();

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
                const width = (p || d) ? 2 : 5; // Thinner if overlaying natal
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

        // Add a class for newly defined centers by transit
        let finalColor = isDefined ? c.color : 'none';
        if (isNewlyDefined) finalColor = 'rgba(105, 255, 140, 0.6)'; // Greenish defined by transit

        svgHtml += drawShape(c, isDefined, isNewlyDefined);
    });

    svgHtml += `</svg>`;
    return svgHtml;
}

// --- Circuitry and Cross Helpers ---

function calcCircuitry(hdData) {
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

    // We return an object for better internal use if needed, 
    // but the UI expects a string currently. 
    // Let's modify the UI calling code to pass more info to showHDInterpretation.
    return { fullName, type, quarter, gates: `${pSun}/${pEarth} | ${dSun}/${dEarth}` };
}


