function normalize(angle) {
    angle = angle % 360;
    if (angle < 0) angle += 360;
    return angle;
}

// Planetary orbital elements (approximate for J2000)
const ELEMENTS = {
    'Sun': { // Earth/Sun relationship (Shifted by 180 deg)
        a: 1.00000011, e: 0.01671022, i: 0.0, L: 280.46435, w: 282.94719, N: 0.0,
        da: 0, de: -0.00001247, di: 0, dL: 36000.76937, dw: 1.72767, dN: 0
    },
    'Mercury': {
        a: 0.38709893, e: 0.20563069, i: 7.00487, L: 252.25084, w: 77.45645, N: 48.33167,
        da: 0, de: 0.00002046, di: -0.00653, dL: 149474.07062, dw: 1.79243, dN: 1.36224
    },
    'Venus': {
        a: 0.72333199, e: 0.00677323, i: 3.39471, L: 181.97973, w: 131.53298, N: 76.68069,
        da: 0, de: -0.00004109, di: -0.00236, dL: 58519.21138, dw: 1.42719, dN: 1.12030
    },
    'Mars': {
        a: 1.52366231, e: 0.09341233, i: 1.85061, L: 355.45332, w: 336.04084, N: 49.57854,
        da: 0, de: 0.00007792, di: -0.00707, dL: 19141.69634, dw: 1.83049, dN: 1.11358
    },
    'Jupiter': {
        a: 5.20336301, e: 0.04839266, i: 1.30530, L: 34.40438, w: 14.75385, N: 100.55615,
        da: -0.00012450, de: -0.00013917, di: -0.00115, dL: 3036.14041, dw: 1.63040, dN: 1.73507
    },
    'Saturn': {
        a: 9.53707032, e: 0.05415060, i: 2.48446, L: 49.94432, w: 92.43194, N: 113.71504,
        da: -0.00301530, de: -0.00036762, di: 0.00170, dL: 1223.91167, dw: 0.85559, dN: 0.95509
    },
    'Uranus': {
        a: 19.19126393, e: 0.04716771, i: 0.76986, L: 313.23218, w: 170.96424, N: 74.22988,
        da: 0.00152025, de: -0.00019150, di: -0.00058, dL: 429.88235, dw: 1.76156, dN: 1.41454
    },
    'Neptune': {
        a: 30.06896348, e: 0.00858587, i: 1.76917, L: 304.88003, w: 44.97135, N: 131.72169,
        da: -0.00125196, de: 0.0000251, di: -0.00101, dL: 219.85526, dw: 1.16239, dN: 1.35497
    },
    'Pluto': {
        a: 39.48168677, e: 0.24880766, i: 17.14175, L: 238.92881, w: 224.06676, N: 110.30347,
        da: -0.00076912, de: 0.00006465, di: 0.00307, dL: 146.60515, dw: 1.36021, dN: 1.38660
    },
    'Chiron': {
        a: 13.6749, e: 0.3703, i: 6.935, L: 13.56, w: 339.29, N: 209.34,
        da: 0, de: 0, di: 0, dL: 7.07, dw: 0, dN: 0
    },
    'NorthNode': { // Mean Node
        a: 1.0, e: 0, i: 5.14, L: 125.12, w: 0, N: 0,
        da: 0, de: 0, di: 0, dL: -1934.13, dw: 0, dN: 0
    }
};

function getHeliocentric(planetId, jd) {
    const T = (jd - 2451545.0) / 36525.0;
    const el = ELEMENTS[planetId];
    if (!el) return { x: 0, y: 0, z: 0 };

    const a = el.a + el.da * T;
    const e = el.e + el.de * T;
    const i = (el.i + el.di * T) * DEG_TO_RAD;
    const L = normalize(el.L + el.dL * T);
    const w = normalize(el.w + el.dw * T);
    const N = (el.N + el.dN * T) * DEG_TO_RAD;

    const M = normalize(L - w) * DEG_TO_RAD;
    let E = M + e * Math.sin(M);
    for (let j = 0; j < 5; j++) {
        E = E - (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
    }

    const x_orb = a * (Math.cos(E) - e);
    const y_orb = a * Math.sqrt(1 - e * e) * Math.sin(E);

    const v = Math.atan2(y_orb, x_orb);
    const r = Math.sqrt(x_orb * x_orb + y_orb * y_orb);
    const lp = w * DEG_TO_RAD - N;

    const x_h = r * (Math.cos(N) * Math.cos(v + lp) - Math.sin(N) * Math.sin(v + lp) * Math.cos(i));
    const y_h = r * (Math.sin(N) * Math.cos(v + lp) + Math.cos(N) * Math.sin(v + lp) * Math.cos(i));
    const z_h = r * (Math.sin(v + lp) * Math.sin(i));

    return { x: x_h, y: y_h, z: z_h };
}

function getGeocentricLongitude(planetId, jd) {
    const T = (jd - 2451545.0) / 36525.0;
    if (planetId === 'Moon') {
        return normalize(218.31617 + 481267.88088 * T);
    }
    if (planetId === 'NorthNode') {
        const el = ELEMENTS['NorthNode'];
        return normalize(el.L + el.dL * T);
    }

    const p = getHeliocentric(planetId, jd);
    const e = getHeliocentric('Sun', jd);

    const x = p.x + e.x;
    const y = p.y + e.y;
    const z = p.z + e.z;

    const lon = Math.atan2(y, x) * RAD_TO_DEG;
    return normalize(lon);
}

function isRetrograde(planetId, jd) {
    if (planetId === 'Sun' || planetId === 'Moon') return false;
    const lon1 = getGeocentricLongitude(planetId, jd);
    const lon2 = getGeocentricLongitude(planetId, jd + 0.05);
    let diff = lon2 - lon1;
    if (diff > 180) diff -= 360;
    if (diff < -180) diff += 360;
    return diff < 0;
}

// Improved Moon Calculation (Truncated Meeus/ELP-2000)
function getMoonMeeus(jd) {
    const T = (jd - 2451545.0) / 36525.0;

    // Mean arguments (degrees)
    const L_prime = normalize(218.3164477 + 481267.8812542 * T - 0.0015786 * T * T);
    const D = normalize(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
    const M = normalize(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
    const M_prime = normalize(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T);
    const F = normalize(93.2720950 + 483202.0175233 * T - 0.0036539 * T * T);

    const D_rad = D * DEG_TO_RAD;
    const M_rad = M * DEG_TO_RAD;
    const Mp_rad = M_prime * DEG_TO_RAD;
    const F_rad = F * DEG_TO_RAD;

    // Major Periodic Terms for Longitude (degrees)
    // Source: Astronomical Algorithms (Meeus), Ch. 47
    let Sigma_l = 0;

    Sigma_l += 6.288774 * Math.sin(Mp_rad);             // Equation of Center
    Sigma_l += 1.274027 * Math.sin(2 * D_rad - Mp_rad); // Evection
    Sigma_l += 0.658314 * Math.sin(2 * D_rad);          // Variation
    Sigma_l += 0.213618 * Math.sin(2 * Mp_rad);
    Sigma_l -= 0.185116 * Math.sin(M_rad);              // Annual Equation
    Sigma_l -= 0.114343 * Math.sin(2 * F_rad);
    Sigma_l += 0.058793 * Math.sin(2 * D_rad - 2 * Mp_rad);
    Sigma_l += 0.057066 * Math.sin(2 * D_rad - M_rad - Mp_rad);
    Sigma_l += 0.053322 * Math.sin(2 * D_rad + Mp_rad);
    Sigma_l += 0.045758 * Math.sin(2 * D_rad - M_rad);
    Sigma_l -= 0.040923 * Math.sin(Mp_rad - M_rad);     // Parallactic Equation (approx)
    Sigma_l -= 0.034720 * Math.sin(D_rad);
    Sigma_l -= 0.030383 * Math.sin(Mp_rad + M_rad);

    return normalize(L_prime + Sigma_l);
}

function getHighPrecisionLongitude(planetId, jd) {
    const T = (jd - 2451545.0) / 36525.0;

    if (planetId === 'Moon') {
        return getMoonMeeus(jd); // Use the new improved function
    }

    // Standard calc for others
    let lon = getGeocentricLongitude(planetId, jd);

    if (planetId === 'NorthNode') {
        return lon; // Already corrected in getGeocentricLongitude
    } else if (planetId === 'Jupiter') {
        const M_J = normalize(19.895 + 3034.746 * T);
        const M_S = normalize(316.967 + 1222.114 * T);
        lon += 0.331 * Math.sin((2 * M_J - 5 * M_S - 67.6) * DEG_TO_RAD);
    } else if (planetId === 'Saturn') {
        const M_J = normalize(19.895 + 3034.746 * T);
        const M_S = normalize(316.967 + 1222.114 * T);
        lon -= 0.812 * Math.sin((2 * M_J - 5 * M_S - 67.6) * DEG_TO_RAD);
    }
    return normalize(lon);
}

function getJulianDate(date, time) {
    const d_obj = new Date(date + 'T' + time + ':00+08:00');
    const jd = (d_obj.getTime() / 86400000.0) + 2440587.5;
    return jd;
}

function getSiderealTime(jd, lon) {
    const T = (jd - 2451545.0) / 36525.0;
    let gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T - T * T * T / 38710000.0;
    return normalize(gmst + lon);
}

// House Calculation System
function calculateHouses(lst, lat, eps = 23.439, system = 'placidus') {
    const RAMC = lst;
    const latRad = lat * DEG_TO_RAD;
    const epsRad = eps * DEG_TO_RAD;

    // MC & ASC Formulas using proper atan2(sin, cos) for correct quadrant
    const mc = normalize(RAD_TO_DEG * Math.atan2(Math.sin(RAMC * DEG_TO_RAD), Math.cos(RAMC * DEG_TO_RAD) * Math.cos(epsRad)));
    const asc = normalize(RAD_TO_DEG * Math.atan2(
        Math.cos(RAMC * DEG_TO_RAD),
        -(Math.sin(RAMC * DEG_TO_RAD) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad))
    ));

    const cusps = new Array(12);

    if (system === 'whole') {
        const ascSignIdx = Math.floor(asc / 30);
        const ascSignStart = ascSignIdx * 30;
        for (let i = 0; i < 12; i++) {
            cusps[i] = normalize(ascSignStart + i * 30);
        }
    } else if (system === 'equal') {
        for (let i = 0; i < 12; i++) {
            cusps[i] = normalize(asc + i * 30);
        }
    } else {
        // Placidus (Corrected Semi-Arc Trisecant Method)
        cusps[0] = asc;
        cusps[9] = mc;
        cusps[3] = normalize(mc + 180);
        cusps[6] = normalize(asc + 180);

        const calcPlacidusCusp = (raGuessOffset, isNocturnal, f) => {
            let L = normalize(RAD_TO_DEG * Math.atan2(Math.sin((RAMC + raGuessOffset) * DEG_TO_RAD), Math.cos((RAMC + raGuessOffset) * DEG_TO_RAD) * Math.cos(epsRad)));

            for (let i = 0; i < 12; i++) {
                const sinD = Math.sin(epsRad) * Math.sin(L * DEG_TO_RAD);
                const decl = Math.asin(sinD);
                const tanD = Math.tan(decl);

                if (Math.abs(Math.abs(lat) - 90) < 0.1) break;

                const cosH = -(tanD * Math.tan(latRad));
                let H = Math.acos(Math.max(-1, Math.min(1, cosH))) * RAD_TO_DEG;

                let targetRA;
                if (isNocturnal) {
                    H = 180 - H;
                    targetRA = normalize(RAMC + 180 - (H * f));
                } else {
                    targetRA = normalize(RAMC + (H * f));
                }

                let newL = normalize(RAD_TO_DEG * Math.atan2(Math.sin(targetRA * DEG_TO_RAD), Math.cos(targetRA * DEG_TO_RAD) * Math.cos(epsRad)));
                if (Math.abs(newL - L) < 0.0001) break;
                L = newL;
            }
            return L;
        };

        cusps[10] = calcPlacidusCusp(30, false, 1 / 3);  // House 11
        cusps[11] = calcPlacidusCusp(60, false, 2 / 3);  // House 12
        cusps[1] = calcPlacidusCusp(120, true, 2 / 3);   // House 2
        cusps[2] = calcPlacidusCusp(150, true, 1 / 3);   // House 3

        // Opposite houses
        cusps[4] = normalize(cusps[10] + 180);
        cusps[5] = normalize(cusps[11] + 180);
        cusps[7] = normalize(cusps[1] + 180);
        cusps[8] = normalize(cusps[2] + 180);
    }

    return { asc, mc, cusps };
}

function getHouseIndex(longitude, cusps) {
    for (let i = 0; i < 12; i++) {
        const c1 = cusps[i];
        const c2 = cusps[(i + 1) % 12];
        if (c2 > c1) {
            if (longitude >= c1 && longitude < c2) return i;
        } else {
            // Span across 0 degree Aries
            if (longitude >= c1 || longitude < c2) return i;
        }
    }
    return 0; // Fallback
}

function calculateTransits(transitDate, transitTime) {
    const jd = getJulianDate(transitDate, transitTime);
    return PLANETS.map(p => ({
        ...p,
        longitude: getHighPrecisionLongitude(p.id, jd),
        isRetrograde: isRetrograde(p.id, jd),
        isTransit: true
    }));
}
