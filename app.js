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
    document.getElementById('modal-icon').textContent = palace.branch;
    document.getElementById('modal-icon').style.color = '#bc8cff';
    document.getElementById('modal-title').textContent = `${palace.stem}${palace.branch} ${palace.name}`;
    document.getElementById('modal-title').style.color = '#bc8cff';
    document.getElementById('modal-subtitle').textContent = "ZI WEI PALACE DETAILS";

    // 1. Stars List format
    let starsHtml = '';
    if (palace.stars.length > 0) {
        starsHtml = palace.stars.map(star =>
            `<span style="color:${star.color}; margin-right: 12px; font-weight:bold; font-size:1.3rem; text-shadow: 0 0 5px rgba(0,0,0,0.5);">${star.name}</span>`
        ).join('');
    } else {
        starsHtml = '<span style="color: var(--text-dim); font-style:italic;">無主星 (Empty Palace) - 請參考對宮星曜</span>';
    }

    // 2. Palace Meanings (Detailed)
    const palaceMeanings = {
        "命宮": "命宮是命盤的核心，代表你的先天個性、天賦才華、以及整體的行運特質。它顯示了你『是什麼樣的人』，以及你最重要的核心價值觀。命宮強勢的人，通常自主性強，能掌握自己的命運；命宮弱勢則較易受環境影響。",
        "兄弟": "兄弟宮代表你與兄弟姊妹、知心好友、合作夥伴的關係。在現代社會，它也深深影響著現金流動與儲蓄能力（作為財帛宮的田宅位）。此宮位良好，代表能得手足之助或累積財富。",
        "夫妻": "夫妻宮顯示了你對感情的態度、配偶的個性特質，以及婚姻生活的樣貌。它也能反映出你喜歡的異性類型。此宮位若有吉星，感情生活較順遂；若有煞星，可能經歷波折或需要更多經營。",
        "子女": "子女宮代表與子女的緣分、互動方式及教育觀念。廣義來說，它也代表晚輩緣、桃花運（性生活）、以及合夥生意（股東）。此宮位活躍的人，通常充滿創造力，也較容易招蜂引蝶。",
        "財帛": "財帛宮掌管你的理財能力、賺錢模式、以及對金錢的價值觀。它代表『現金』的進出狀況。有財星坐守者，通常對數字敏感，賺錢機會多；若逢煞星，則可能財來財去，需注意守財。",
        "疾厄": "疾厄宮代表你的先天體質、易患疾病的部位、以及潛意識的健康狀態。它也代表『家運』（田宅的氣數位）和工作場所的環境。此宮位主要用來評估身心健康與抗壓能力。",
        "遷移": "遷移宮代表你外出發展的際遇、社交能力、以及給人的第一印象。它是命宮的對宮，深深影響著你的外在表現與人際關係。此宮位吉利者，適合出外發展，易得貴人相助。",
        "交友": "交友宮（奴僕宮）代表你與朋友、部屬、粉絲、群眾的關係。它反映了你的領導統御能力與人氣指數。在現代社會，這個宮位對於公眾人物、業務人員或領導者特別重要。",
        "官祿": "官祿宮（事業宮）代表你的工作態度、創業能力、學業表現、以及職位升遷運勢。它與財帛宮（賺錢能力）和命宮（個性）息息相關，構成『三方四正』。此宮強者，事業心重，成就慾強。",
        "田宅": "田宅宮代表你的居住環境、不動產運勢、家庭生活氛圍，以及最終的財富累積（庫存）。它也象徵著家族的興衰。此宮位穩定者，容易置產，家庭生活安穩，晚年運佳。",
        "福德": "福德宮代表你的精神享受、內心世界、興趣嗜好、以及『福氣』的厚薄。它也影響著你的財源（財帛的對宮）與投資運。此宮位好的人，懂得生活情趣，抗壓性高，心態樂觀。",
        "父母": "父母宮代表你與父母長輩的關係、遺傳基因、以及受長輩提攜的機會。廣義來說，它也代表文書、學歷、以及與政府機構的關係。此宮位吉利，易得長輩疼愛與遺產。"
    };

    // 3. Star Meanings (Detailed)
    const starMeanings = {
        "紫微": "【帝王之星】尊貴、領導力強、耳根子軟。紫微星坐守，象徵你有領袖氣質，但可能較為獨斷或愛面子。適合擔任管理職或創業。",
        "天機": "【智慧之星】聰明、反應快、善於謀略。天機星坐守，代表你足智多謀，適應力強，但可能較容易神經質或思慮過度。適合企劃、幕僚工作。",
        "太陽": "【權貴之星】博愛、熱情、光明磊落。太陽星坐守，象徵你為人慷慨，樂於助人，有公益精神。太陽在旺宮（白天）更顯貴氣，陷落（夜晚）則較勞心勞力。",
        "武曲": "【財富之星】剛毅、果斷、執行力強。武曲星是正財星，坐守代表你對金錢敏感，務實肯幹。個性上可能較嚴肅或不解風情，但絕不拖泥帶水。",
        "天同": "【福氣之星】溫順、隨和、重視享受。天同星坐守，代表你福氣深厚，不喜與人爭執，有點孩子氣。雖然較缺乏開創力，但貴人運佳，生活安逸。",
        "廉貞": "【交際之星】複雜、桃花、是非分明。廉貞星坐守，代表你公關能力強，性格多變，既可是嚴格的執法者，也可是風流的才子。能量較難駕馭，好壞起伏大。",
        "天府": "【庫藏之星】穩重、保守、包容力強。天府星是南斗帝王，也是財庫星。坐守代表你個性寬厚，善於守成與理財，重視面子與排場，衣食無憂。",
        "太陰": "【富足之星】溫柔、細膩、重視情感。太陰星是田宅主，也是財星。坐守代表你心思細膩，有潔癖，重視家庭。在旺宮（夜晚）象徵財富豐盈，陷落則較操勞。",
        "貪狼": "【慾望之星】多才多藝、長袖善舞、投機。貪狼星是第一大桃花星，坐守代表你交際手腕高超，好勝心強，對新奇事物充滿好奇。適合演藝、公關或冒險投機。",
        "巨門": "【是非之星】多疑、口才佳、善於分析。巨門星坐守，代表你觀察力敏銳，能言善道，但容易犯口舌是非。適合從事律師、講師、評論員等靠嘴巴吃飯的行業。",
        "天相": "【印鑑之星】公正、熱心、輔佐能力強。天相星是宰相之星，坐守代表你儀表端莊，誠懇踏實，喜歡打抱不平。缺乏主見，易受環境影響，是很好的幕僚人才。",
        "天梁": "【蔭佑之星】成熟、正直、逢凶化吉。天梁星是老人星，坐守代表你早熟穩重，喜歡照顧人，有老大風範。雖然人生難免遇難關，但總能化險為夷。",
        "七殺": "【將帥之星】剛烈、衝動、勇往直前。七殺星坐守，代表你性格剛強，不畏艱難，喜歡獨當一面。人生變動大，大起大落，適合軍警、外科醫生或開創型事業。",
        "破軍": "【耗損之星】破壞、創新、反覆無常。破軍星坐守，代表你不按牌理出牌，喜歡破舊立新。人生充滿戲劇性變化，為了理想不惜孤注一擲，是標準的革命家。"
    };

    // Calculate dynamic content about star meanings in this specific palace
    let starDescriptionsHtml = "";
    if (palace.stars.length > 0) {
        starDescriptionsHtml = '<div style="margin-top: 1rem; padding-top: 1rem; border-top: 1px solid rgba(255,255,255,0.1);">';
        palace.stars.forEach(star => {
            const desc = starMeanings[star.name] || "具備特殊的宇宙能量。";
            starDescriptionsHtml += `
            <div style="margin-bottom: 0.8rem;">
                <span style="color:${star.color}; font-weight:bold;">● ${star.name}：</span>
                <span style="color: var(--text-light);">${desc}</span>
            </div>`;
        });
        starDescriptionsHtml += '</div>';
    }

    const content = `
        <div class="interpretation-section">
            <h3>宮位主星</h3>
            <div style="margin-bottom:0.5rem;">${starsHtml}</div>
            ${starDescriptionsHtml}
        </div>
        <div class="interpretation-section">
            <h3 style="color: #bc8cff;">${palace.name}的深層意涵</h3>
            <p style="line-height: 1.6; font-size: 1.05rem;">${palaceMeanings[palace.name] || "此宮位主要影響您人生的特定領域。"}</p>
        </div>
        <div class="interpretation-section">
            <h3>命盤格局</h3>
            <p>
                <strong>【${palace.stem}${palace.branch}宮】</strong>位況：<br>
                ${palace.isMing ? '<span style="color:#ff5f5f; font-weight:bold; display:block; margin: 4px 0;">★ 命宮（Life Palace）：</span>這是您命運的總指揮部。您的性格傾向、外在行為模式、以及一生的成敗關鍵都顯現於此。' : ""}
                ${palace.isShen ? '<span style="color:#ffff70; font-weight:bold; display:block; margin: 4px 0;">★ 身宮（Body Palace）：</span>這是您中晚年運勢的重點。它代表了您後天努力的方向，以及您最執著、最重視的人生領域。' : ""}
                ${!palace.isMing && !palace.isShen ? '此宮位在三方四正架構中扮演輔助或特定的角色，隨著十干四化的引動，將在不同流年產生具體的吉凶克應。' : ""}
            </p>
        </div>
    `;

    const container = document.querySelector('.interpretation-text');
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
        const zwData = ZiWei.calculate(date, parseInt(hh));
        if (zwData) {
            document.getElementById('ziwei-results-list').style.display = 'block';

            // Update Center Info
            const centerDiv = document.querySelector('.ziwei-center');
            if (centerDiv) {
                const lunar = zwData.lunar;
                centerDiv.innerHTML = `
                    <div class="ziwei-center-content">
                        <div class="center-title">紫微斗數</div>
                        <div class="center-info">
                            <div>農曆 ${lunar.year} 年 ${lunar.isLeap ? "閏" : ""}${lunar.month} 月 ${lunar.day} 日</div>
                            <div class="bureau-tag">${zwData.bureauName}</div>
                            <div>陽曆 ${date} / ${hh}時</div>
                        </div>
                    </div>
                `;
            }

            // Render Palaces
            zwData.palaces.forEach((palace, i) => { // i is position index 0-11 (Zi to Hai)
                // Map position index to DOM ID
                const branches = ["zi", "chou", "yin", "mao", "chen", "si", "wu", "wei", "shen", "you", "xu", "hai"];
                const elId = `palace-${branches[i]}`;
                const el = document.getElementById(elId);

                if (el) {
                    // Sort stars: Major > Minor (currently only major)
                    // We can also sort by color or fixed order if desired

                    let starsHtml = '';
                    palace.stars.forEach(star => {
                        starsHtml += `<span class="ziwei-star" style="color:${star.color}">${star.name}</span>`;
                    });

                    el.innerHTML = `
                        <div class="ziwei-bg-branch">${palace.branch}</div>
                        <div class="ziwei-header">
                            <span class="ziwei-stem-branch">${palace.stem}${palace.branch}</span>
                            <div class="ziwei-markers">
                                ${palace.isMing ? '<span class="ziwei-marker marker-ming">命</span>' : ''}
                                ${palace.isShen ? '<span class="ziwei-marker marker-shen">身</span>' : ''}
                            </div>
                        </div>
                        <div class="ziwei-stars">
                            ${starsHtml}
                        </div>
                        <div class="ziwei-palace-name">${palace.name}</div>
                    `;

                    // Interaction
                    el.style.cursor = 'pointer';
                    el.onclick = () => showZiWeiInterpretation(palace);

                    // Add Ming Palace Halo Effect (Optional JS override, though CSS handles hover)
                    if (palace.isMing) {
                        el.style.boxShadow = 'inset 0 0 20px rgba(255, 95, 95, 0.1)';
                        el.style.borderColor = 'rgba(255, 95, 95, 0.3)';
                    } else if (palace.isShen) {
                        el.style.borderColor = 'rgba(255, 255, 112, 0.3)';
                    } else {
                        el.style.boxShadow = '';
                        el.style.borderColor = ''; // Let CSS take over
                    }
                }
            });
        }

        // --- Human Design Calculation ---
        const hdData = HumanDesign.calculate(jd);
        const hdPanel = document.getElementById('hd-results-list');
        if (hdPanel && hdData) {
            hdPanel.style.display = 'block';

            // 1. Summary Cards
            const summaryDiv = document.getElementById('hd-summary');
            summaryDiv.innerHTML = `
                <div class="hd-card">
                    <div class="hd-card-label">類型 (Type)</div>
                    <div class="hd-card-value" style="font-size:1.1rem;">${hdData.type}</div>
                </div>
                 <div class="hd-card">
                    <div class="hd-card-label">人生角色 (Profile)</div>
                    <div class="hd-card-value">${hdData.profile}</div>
                </div>
                 <div class="hd-card">
                    <div class="hd-card-label">內在權威 (Authority)</div>
                    <div class="hd-card-value" style="font-size:1.1rem;">${hdData.authority}</div>
                </div>
             `;

            // 2. BodyGraph Visualization
            const centersDiv = document.getElementById('hd-centers-grid');
            centersDiv.className = 'hd-bodygraph-container'; // Ensures container styling
            centersDiv.style.display = 'block';

            // Render High-Fidelity SVG
            centersDiv.innerHTML = renderHumanDesignSVG(hdData);

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
                pCol += `<div class="hd-planet-row">
                    <span style="color:#ccc;">${p.id}</span>
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
                dCol += `<div class="hd-planet-row">
                    <span style="color:#ccc;">${d.id}</span>
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

function renderHumanDesignSVG(hdData) {
    const W = 500;
    const H = 640;

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
    const drawShape = (c, isActive) => {
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
            // Spleen: Points left? No, Spleen is usually drawn as a triangle pointing "inwards" or distinct. 
            // In standard BodyGraph, Spleen is a triangle pointing to the right (towards center).
            // Let's draw it pointing Right (towards G).
            path = `M${cx - hw},${cy - hh} L${cx + hw},${cy} L${cx - hw},${cy + hh} Z`;
            // Wait, let's just use standard Triangle pointing IN.
        } else if (c.type === 'tri-right') {
            // Solar: Points Left (towards center)
            path = `M${cx + hw},${cy - hh} L${cx - hw},${cy} L${cx + hw},${cy + hh} Z`;
        } else if (c.type === 'tri-br') {
            // Heart: Small triangle.
            path = `M${cx},${cy - hh} L${cx + hw},${cy + hh} L${cx - hw},${cy + hh} Z`;
        }

        const cls = `hd-center-shape ${isActive ? 'defined' : 'undefined'}`;
        const fill = isActive ? c.color : 'none';

        return `<path d="${path}" class="${cls}" style="${isActive ? 'fill:' + c.color : ''}" />
                <text x="${cx}" y="${cy}" dy="4" class="hd-center-label" style="${isActive ? 'fill:#000; font-weight:bold;' : ''}">${c.id}</text>`;
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

    // Helper: is Gate Active in P or D?
    // hdData.personality[i].gate
    const isP = (gate) => hdData.personality.some(g => g.gate === gate);
    const isD = (gate) => hdData.design.some(g => g.gate === gate);

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
        // Check Gate 1
        const drawGate = (gate, xStart, yStart, xEnd, yEnd) => {
            const mx = (xStart + xEnd) / 2;
            const my = (yStart + yEnd) / 2;

            // Determine Color
            const p = isP(gate);
            const d = isD(gate);

            if (!p && !d) return;

            let stroke = '#888';
            if (p && d) stroke = 'url(#striped)'; // Complex to impl stripes in string. Use dashed overlay?
            else if (p) stroke = '#ffffff'; // Personality Black -> White in Dark Mode
            else if (d) stroke = '#ff5f5f'; // Design Red

            // Draw half line
            svgHtml += `<line x1="${xStart}" y1="${yStart}" x2="${mx}" y2="${my}" stroke="${stroke}" stroke-width="4" stroke-linecap="round" />`;

            // If both P & D, draw dashed overlay or side-by-side?
            if (p && d) {
                svgHtml += `<line x1="${xStart}" y1="${yStart}" x2="${mx}" y2="${my}" stroke="#ff5f5f" stroke-width="4" stroke-linecap="round" />`;
                svgHtml += `<line x1="${xStart}" y1="${yStart}" x2="${mx}" y2="${my}" stroke="#ffffff" stroke-width="4" stroke-dasharray="4,4" stroke-linecap="round" />`;
            }
        };

        drawGate(g1, x1, y1, x2, y2);
        drawGate(g2, x2, y2, x1, y1);
    });

    // Draw Centers
    Object.values(centerLayout).forEach(c => {
        const isDefined = hdData.centers[c.id].defined;
        svgHtml += drawShape(c, isDefined);
    });

    svgHtml += `</svg>`;
    return svgHtml;
}

