function drawChart(planetPos, houseData, shrinkInner = false, onPlanetClick) {
    const center = { x: 300, y: 300 };
    const radius = shrinkInner ? 220 : 280; // Shrink if transit mode

    // Clear layers
    document.getElementById('zodiac-ring').innerHTML = '';
    document.getElementById('houses-layer').innerHTML = '';
    document.getElementById('aspects-layer').innerHTML = '';
    document.getElementById('planets-layer').innerHTML = '';

    const zodiacGroup = document.getElementById('zodiac-ring');
    const housesGroup = document.getElementById('houses-layer');
    const aspectsGroup = document.getElementById('aspects-layer');
    const planetsGroup = document.getElementById('planets-layer');

    // Draw Zodiac Ring Background
    const bgRing = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    bgRing.setAttribute("cx", center.x);
    bgRing.setAttribute("cy", center.y);
    bgRing.setAttribute("r", radius);
    bgRing.setAttribute("fill", "none");
    bgRing.setAttribute("stroke", "rgba(201, 160, 80, 0.4)");
    bgRing.setAttribute("stroke-width", "40");
    bgRing.setAttribute("stroke-opacity", "0.1");
    zodiacGroup.appendChild(bgRing);

    // Draw Zodiac Signs
    ZODIAC_SIGNS.forEach((sign, index) => {
        const startLon = index * 30;
        const midLon = startLon + 15;
        let angle = 180 - (midLon - houseData.asc);

        const rText = radius + 20;
        const x = center.x + rText * Math.cos(angle * DEG_TO_RAD);
        const y = center.y + rText * Math.sin(angle * DEG_TO_RAD);

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", x);
        text.setAttribute("y", y);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("fill", sign.color || "var(--text-gold)");
        text.setAttribute("font-size", "14");
        text.textContent = sign.symbol;
        zodiacGroup.appendChild(text);

        // Dividers
        let divAngle = 180 - (startLon - houseData.asc);
        const x1 = center.x + (radius - 20) * Math.cos(divAngle * DEG_TO_RAD);
        const y1 = center.y + (radius - 20) * Math.sin(divAngle * DEG_TO_RAD);
        const x2 = center.x + (radius + 20) * Math.cos(divAngle * DEG_TO_RAD);
        const y2 = center.y + (radius + 20) * Math.sin(divAngle * DEG_TO_RAD);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", x1);
        line.setAttribute("y1", y1);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "rgba(255,255,255,0.2)");
        zodiacGroup.appendChild(line);
    });

    // Draw House Cusps
    houseData.cusps.forEach((cusp, i) => {
        let angle = 180 - (cusp - houseData.asc);
        const x2 = center.x + (radius - 20) * Math.cos(angle * DEG_TO_RAD);
        const y2 = center.y + (radius - 20) * Math.sin(angle * DEG_TO_RAD);

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", center.x);
        line.setAttribute("y1", center.y);
        line.setAttribute("x2", x2);
        line.setAttribute("y2", y2);
        line.setAttribute("stroke", "rgba(255, 255, 255, 0.1)");
        if (i === 0 || i === 9) {
            line.setAttribute("stroke", "var(--primary)");
            line.setAttribute("stroke-width", "2");
        }
        housesGroup.appendChild(line);

        let nextCusp = houseData.cusps[(i + 1) % 12];
        if (nextCusp < cusp) nextCusp += 360;
        let midH = (cusp + nextCusp) / 2;
        let hAngle = 180 - (midH - houseData.asc);
        const rNum = 60;
        const tx = center.x + rNum * Math.cos(hAngle * DEG_TO_RAD);
        const ty = center.y + rNum * Math.sin(hAngle * DEG_TO_RAD);

        const hText = document.createElementNS("http://www.w3.org/2000/svg", "text");
        hText.setAttribute("x", tx);
        hText.setAttribute("y", ty);
        hText.setAttribute("text-anchor", "middle");
        hText.setAttribute("fill", "rgba(255,255,255,0.3)");
        hText.setAttribute("font-size", "10");
        hText.textContent = i + 1;
        housesGroup.appendChild(hText);
    });

    // Draw Aspects
    const pRadius = radius - 60; // Planets inside zodiac

    for (let i = 0; i < planetPos.length; i++) {
        for (let j = i + 1; j < planetPos.length; j++) {
            const p1 = planetPos[i];
            const p2 = planetPos[j];
            const diff = Math.abs(p1.longitude - p2.longitude);
            const angle = diff > 180 ? 360 - diff : diff;

            let aspect = null;
            if (Math.abs(angle - 0) < 8) aspect = { name: 'Conjunction', color: '#ffffff' };
            else if (Math.abs(angle - 180) < 8) aspect = { name: 'Opposition', color: '#ff3333' };
            else if (Math.abs(angle - 120) < 8) aspect = { name: 'Trine', color: '#33ff33' };
            else if (Math.abs(angle - 90) < 8) aspect = { name: 'Square', color: '#ff9933' };
            else if (Math.abs(angle - 60) < 6) aspect = { name: 'Sextile', color: '#33ffff' };

            if (aspect) {
                const a1 = (180 - (p1.longitude - houseData.asc)) * DEG_TO_RAD;
                const a2 = (180 - (p2.longitude - houseData.asc)) * DEG_TO_RAD;

                const x1 = center.x + (pRadius - 10) * Math.cos(a1);
                const y1 = center.y + (pRadius - 10) * Math.sin(a1);
                const x2 = center.x + (pRadius - 10) * Math.cos(a2);
                const y2 = center.y + (pRadius - 10) * Math.sin(a2);

                const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
                line.setAttribute("x1", x1);
                line.setAttribute("y1", y1);
                line.setAttribute("x2", x2);
                line.setAttribute("y2", y2);
                line.setAttribute("stroke", aspect.color);
                line.setAttribute("stroke-width", "1");
                line.setAttribute("stroke-dasharray", aspect.name === 'Opposition' ? "4 2" : "none");
                line.setAttribute("opacity", "0.4");
                aspectsGroup.appendChild(line);
            }
        }
    }

    // Draw Planets
    planetPos.forEach((p, idx) => {
        const angle = (180 - (p.longitude - houseData.asc)) * DEG_TO_RAD;
        const dist = pRadius + 25;
        const px = center.x + dist * Math.cos(angle);
        const py = center.y + dist * Math.sin(angle);

        const group = document.createElementNS("http://www.w3.org/2000/svg", "g");
        group.setAttribute("class", "planet-node");
        group.onclick = () => {
            // Find sign name
            const signIdx = Math.floor(p.longitude / 30);
            const signName = ZODIAC_SIGNS[signIdx].name;

            // Find house
            const houseIdx = getHouseIndex(p.longitude, houseData.cusps);
            if (onPlanetClick) onPlanetClick(p.id, p.name, p.symbol, signName, houseIdx);
        };

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", px);
        text.setAttribute("y", py + 7);
        text.setAttribute("fill", p.color || "white");
        text.setAttribute("font-size", "20");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("filter", "drop-shadow(0px 0px 4px rgba(0,0,0,1))");
        text.textContent = p.symbol;
        group.appendChild(text);

        if (p.isRetrograde) {
            const rx = document.createElementNS("http://www.w3.org/2000/svg", "text");
            rx.setAttribute("x", px + 12);
            rx.setAttribute("y", py + 12);
            rx.setAttribute("fill", "var(--primary-light)");
            rx.setAttribute("font-size", "10");
            rx.setAttribute("font-weight", "bold");
            rx.textContent = "Rx";
            group.appendChild(rx);
        }

        // Tick mark
        const tick = document.createElementNS("http://www.w3.org/2000/svg", "line");
        const x_t1 = center.x + pRadius * Math.cos(angle);
        const y_t1 = center.y + pRadius * Math.sin(angle);
        const x_t2 = center.x + (pRadius + 10) * Math.cos(angle);
        const y_t2 = center.y + (pRadius + 10) * Math.sin(angle);
        tick.setAttribute("x1", x_t1);
        tick.setAttribute("y1", y_t1);
        tick.setAttribute("x2", x_t2);
        tick.setAttribute("y2", y_t2);
        tick.setAttribute("stroke", p.color || "white");
        tick.setAttribute("stroke-width", "2");
        group.appendChild(tick);

        planetsGroup.appendChild(group);
    });
}

function drawTransitRing(transitPlanets, natalAsc, houseCusps, onTransitClick) {
    const layer = document.getElementById('transit-layer');
    layer.innerHTML = '';
    layer.style.display = 'block';

    const radius = 265;

    transitPlanets.forEach(planet => {
        let angle = 180 - (planet.longitude - natalAsc);
        const x = 300 + radius * Math.cos(angle * DEG_TO_RAD);
        const y = 300 + radius * Math.sin(angle * DEG_TO_RAD);

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        g.setAttribute("class", "planet-node");
        g.setAttribute("transform", `translate(${x}, ${y})`);

        // Simple distinct style for transit planets
        g.innerHTML = `
            <circle r="9" fill="#0f1520" stroke="#69ff8c" stroke-width="1.5" />
            <text text-anchor="middle" dy="4" fill="#69ff8c" font-size="12" font-weight="bold">${planet.symbol}</text>
        `;
        g.onclick = () => {
            const houseIdx = getHouseIndex(planet.longitude, houseCusps);
            if (onTransitClick) onTransitClick(planet, houseIdx);
        };
        layer.appendChild(g);

        // Optional line to center for major planets
        if (['Sun', 'Moon', 'Jupiter', 'Saturn'].includes(planet.id)) {
            const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
            line.setAttribute("x1", 300 + (radius - 10) * Math.cos(angle * DEG_TO_RAD));
            line.setAttribute("y1", 300 + (radius - 10) * Math.sin(angle * DEG_TO_RAD));
            line.setAttribute("x2", 300 + (radius - 20) * Math.cos(angle * DEG_TO_RAD));
            line.setAttribute("y2", 300 + (radius - 20) * Math.sin(angle * DEG_TO_RAD));
            line.setAttribute("stroke", "#69ff8c");
            line.setAttribute("stroke-width", "1");
            line.setAttribute("stroke-opacity", "0.5");
            layer.appendChild(line);
        }
    });
}
