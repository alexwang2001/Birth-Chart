/**
 * Displays the interpretation modal for a specific point in a sign and house.
 */
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
        const { planets } = AppState.results.astro;
        const planetData = planets.find(p => p.id === pointId);
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

/**
 * Displays the transit interpretation modal.
 */
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

    if (houseIdx === undefined && AppState.results.astro.houses) {
        houseIdx = getHouseIndex(planet.longitude, AppState.results.astro.houses.cusps);
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

/**
 * Displays the Zi Wei Dou Shu interpretation modal.
 */
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

/**
 * Displays the Human Design interpretation modal.
 */
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
