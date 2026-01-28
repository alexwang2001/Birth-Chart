/**
 * Renders the history list in the UI.
 */
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

/**
 * Updates the transit results panel.
 */
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

/**
 * Updates the main planet results and element analysis bars.
 */
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
    const counts = calculateElementBalance(planetPos, houseData);
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

    const elChart = document.getElementById('elements-chart');
    if (elChart) {
        elChart.innerHTML = `
            ${renderBar('火 (Fire)', counts.fire, '#ff5f5f')}
            ${renderBar('土 (Earth)', counts.earth, '#69ff8c')}
            ${renderBar('風 (Air)', counts.air, '#ffff70')}
            ${renderBar('水 (Water)', counts.water, '#5fafff')}
        `;
    }

    const modChart = document.getElementById('modalities-chart');
    if (modChart) {
        modChart.innerHTML = `
            ${renderBar('開創 (Cardinal)', counts.cardinal, '#ff99cc')}
            ${renderBar('固定 (Fixed)', counts.fixed, '#cc99ff')}
            ${renderBar('變動 (Mutable)', counts.mutable, '#66ffff')}
        `;
    }
}
