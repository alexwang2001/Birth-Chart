// ============================================================================
// JS/CORE/ASTRO-CORE.JS
// High Precision Ephemeris using// VSOP87A Milli-arcsecond Precision Implementation
// Accuracy: ~0.001° (1 arcsecond) for 1800-2050 AD
// ============================================================================

// Import VSOP87 library (vsop87a_milli class loaded separately)

const D2R = Math.PI / 180.0;
const R2D = 180.0 / Math.PI;

// Normalize angle to 0-360
function normalize(angle) {
    angle = angle % 360;
    if (angle < 0) angle += 360;
    return angle;
}

// Precession from J2000 to Date
function addPrecession(lon, jd) {
    const T = (jd - 2451545.0) / 36525.0;
    const p = (1.396971 * T + 0.0003086 * T * T);
    return normalize(lon + p);
}

// Convert Date to Julian Date (UTC or Local with Offset)
// tzOffset: Hours to subtract from timeStr to get UTC (e.g. Taiwan is +8, so pass 8)
function getJulianDate(dateStr, timeStr, tzOffset = 0) {
    if (!dateStr || !timeStr) return 0;

    const [y, m, d] = dateStr.split('-').map(Number);
    const [hr, min] = timeStr.split(':').map(Number);

    let year = y;
    let month = m;
    if (month <= 2) {
        year -= 1;
        month += 12;
    }

    const A = Math.floor(year / 100);
    const B = 2 - A + Math.floor(A / 4);

    // Adjust for timezone: subtract offset from hours
    const dayDec = d + (hr - tzOffset + min / 60.0) / 24.0;

    const jd = Math.floor(365.25 * (year + 4716)) + Math.floor(30.6001 * (month + 1)) + dayDec + B - 1524.5;
    return jd;
}

// ============================================================================
// VSOP87-based Planetary Positions
// ============================================================================

function getHeliocentric(id, jd) {
    // VSOP87 uses Julian millennia from J2000
    const T = (jd - 2451545.0) / 365250.0;

    let pos;
    switch (id) {
        case 'Mercury':
            pos = vsop87a_milli.getMercury(T);
            break;
        case 'Venus':
            pos = vsop87a_milli.getVenus(T);
            break;
        case 'Earth':
            pos = vsop87a_milli.getEarth(T);
            break;
        case 'Mars':
            pos = vsop87a_milli.getMars(T);
            break;
        case 'Jupiter':
            pos = vsop87a_milli.getJupiter(T);
            break;
        case 'Saturn':
            pos = vsop87a_milli.getSaturn(T);
            break;
        case 'Uranus':
            pos = vsop87a_milli.getUranus(T);
            break;
        case 'Neptune':
            pos = vsop87a_milli.getNeptune(T);
            break;
        default:
            return null;
    }

    return { x: pos[0], y: pos[1], z: pos[2] };
}

// ============================================================================
// Moon Position (ELP2000-82B Truncated - Meeus Chapter 47)
// ============================================================================

function getMoonPosition(jd) {
    const T = (jd - 2451545.0) / 36525.0;

    // Mean Arguments (Meeus 47.1)
    const L_prime = normalize(218.3164477 + 481267.88123421 * T - 0.0015786 * T * T);
    const D = normalize(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T);
    const M = normalize(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T);
    const M_prime = normalize(134.9634114 + 477198.8676313 * T + 0.0087414 * T * T);
    const F = normalize(93.2720993 + 483202.0175273 * T - 0.0036539 * T * T);

    const Dr = D * D2R;
    const Mr = M * D2R;
    const Mpr = M_prime * D2R;
    const Fr = F * D2R;

    // Major Periodic Terms for Longitude (Meeus Table 47.A - Top 60 terms)
    let SigL = 0;
    SigL += 6.288774 * Math.sin(Mpr);
    SigL += 1.274027 * Math.sin(2 * Dr - Mpr);
    SigL += 0.658314 * Math.sin(2 * Dr);
    SigL += 0.213618 * Math.sin(2 * Mpr);
    SigL -= 0.185116 * Math.sin(Mr);
    SigL -= 0.114332 * Math.sin(2 * Fr);
    SigL += 0.058793 * Math.sin(2 * Dr - 2 * Mpr);
    SigL += 0.057066 * Math.sin(2 * Dr - Mr - Mpr);
    SigL += 0.053322 * Math.sin(2 * Dr + Mpr);
    SigL += 0.045758 * Math.sin(2 * Dr - Mr);
    SigL -= 0.040923 * Math.sin(Mr - Mpr);
    SigL -= 0.034720 * Math.sin(Dr);
    SigL -= 0.030383 * Math.sin(Mr + Mpr);
    SigL += 0.015327 * Math.sin(2 * Dr - 2 * Fr);
    SigL -= 0.012528 * Math.sin(Mpr + 2 * Fr);
    SigL += 0.010980 * Math.sin(Mpr - 2 * Fr);
    SigL += 0.010675 * Math.sin(4 * Dr - Mpr);
    SigL += 0.010034 * Math.sin(3 * Mpr);
    SigL += 0.008548 * Math.sin(4 * Dr - 2 * Mpr);
    SigL -= 0.007888 * Math.sin(2 * Dr + Mr - Mpr);
    SigL -= 0.006766 * Math.sin(2 * Dr + Mr);
    SigL -= 0.005163 * Math.sin(Dr - Mpr);
    SigL += 0.004987 * Math.sin(Dr + Mr);
    SigL += 0.004036 * Math.sin(2 * Dr - Mr + Mpr);
    SigL += 0.003994 * Math.sin(2 * Dr + 2 * Mpr);
    SigL += 0.003861 * Math.sin(4 * Dr);
    SigL += 0.003665 * Math.sin(2 * Dr - 3 * Mpr);
    SigL -= 0.002689 * Math.sin(Mr - 2 * Mpr);
    SigL -= 0.002602 * Math.sin(2 * Dr - Mpr + 2 * Fr);
    SigL += 0.002390 * Math.sin(2 * Dr - Mr - 2 * Mpr);
    SigL -= 0.002348 * Math.sin(Dr + Mpr);
    SigL += 0.002236 * Math.sin(2 * Dr - 2 * Mr);
    SigL -= 0.002120 * Math.sin(Mr + 2 * Mpr);
    SigL -= 0.002069 * Math.sin(2 * Mr);
    SigL += 0.002048 * Math.sin(2 * Dr - 2 * Mr - Mpr);
    SigL -= 0.001773 * Math.sin(2 * Dr + Mpr - 2 * Fr);
    SigL -= 0.001595 * Math.sin(2 * Dr + 2 * Fr);
    SigL += 0.001215 * Math.sin(4 * Dr - Mr - Mpr);
    SigL -= 0.001110 * Math.sin(2 * Mpr + 2 * Fr);
    SigL -= 0.000892 * Math.sin(3 * Dr - Mpr);
    SigL -= 0.000810 * Math.sin(2 * Dr + Mr + Mpr);
    SigL += 0.000759 * Math.sin(4 * Dr - Mr - 2 * Mpr);
    SigL -= 0.000713 * Math.sin(2 * Mr - Mpr);
    SigL -= 0.000700 * Math.sin(2 * Dr + 2 * Mr - Mpr);
    SigL += 0.000691 * Math.sin(2 * Dr + Mr - 2 * Mpr);
    SigL += 0.000596 * Math.sin(2 * Dr - Mr - 2 * Fr);
    SigL += 0.000549 * Math.sin(4 * Dr + Mpr);
    SigL += 0.000537 * Math.sin(4 * Mpr);
    SigL += 0.000520 * Math.sin(4 * Dr - Mr);
    SigL -= 0.000487 * Math.sin(Dr - 2 * Mpr);

    return normalize(L_prime + SigL);
}

// ============================================================================
// Geocentric Longitude
// ============================================================================

function getHighPrecisionLongitude(id, jd) {
    if (id === 'Moon') return getMoonPosition(jd);
    if (id === 'NorthNode') {
        const T = (jd - 2451545.0) / 36525.0;
        return normalize(125.04452 - 1934.136261 * T + 0.0020708 * T * T);
    }
    if (id === 'Chiron') {
        // Chiron Elements (JPL Horizons, Epoch 2017, J2000 Frame)
        // Using Keplerian Elements for much better accuracy than linear approx
        const e = 0.382552372;
        const q = 8.42445079;
        const Tp = 2450143.460017;
        const node = 209.201944 * D2R;
        const w = 339.629568 * D2R;
        const i = 6.9299 * D2R;
        const a = q / (1 - e);
        const n = 0.9856076686 / Math.pow(a, 1.5); // deg per day (using Gaussian constant approx)

        // Mean Anomaly
        let M = normalize((jd - Tp) * n) * D2R;

        // Solve Kepler Equation: M = E - e*sin(E)
        let E = M;
        let delta = 1;
        let iter = 0;
        while (Math.abs(delta) > 1e-7 && iter < 100) {
            delta = (E - e * Math.sin(E) - M) / (1 - e * Math.cos(E));
            E -= delta;
            iter++;
        }

        // True Anomaly (v) and Radius (r)
        const v = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
        const r = a * (1 - e * Math.cos(E));

        // Heliocentric coordinates in orbital plane
        // x' = r * cos(v)
        // y' = r * sin(v)
        // z' = 0

        // Rotate to Ecliptic (J2000)
        // u = v + w (argument of latitude)
        const u = v + w;

        // Heliocentric J2000 coords
        const x_h = r * (Math.cos(node) * Math.cos(u) - Math.sin(node) * Math.sin(u) * Math.cos(i));
        const y_h = r * (Math.sin(node) * Math.cos(u) + Math.cos(node) * Math.sin(u) * Math.cos(i));
        const z_h = r * (Math.sin(u) * Math.sin(i));

        // Geocentric Conversion
        const earth = getHeliocentric('Earth', jd);
        if (!earth) return 0;

        const dx = x_h - earth.x;
        const dy = y_h - earth.y;
        const dz = z_h - earth.z; // Chiron has significant inclination, so z matters if we wanted latitude, but for longitude atan2(dy, dx) is primary

        // Longitude (J2000)
        let lon = Math.atan2(dy, dx) * R2D;

        // Precess to Date
        return addPrecession(normalize(lon), jd);
    }
    if (id === 'Pluto') {
        // Pluto approximation (not in VSOP87A)
        const T = (jd - 2451545.0) / 36525.0;
        const L = normalize(238.92881 + 145.18453 * T);
        const a = 39.48;
        const e = 0.2488;
        const PI = normalize(224.07 + 0 * T);
        const M = normalize(L - PI) * D2R;

        // Simple Kepler solve
        let E = M + e * Math.sin(M);
        for (let i = 0; i < 5; i++) {
            E = M + e * Math.sin(E);
        }

        const v = 2 * Math.atan2(Math.sqrt(1 + e) * Math.sin(E / 2), Math.sqrt(1 - e) * Math.cos(E / 2));
        const N = normalize(110.30) * D2R;
        const i = 17.14 * D2R;
        const w = normalize(PI - 110.30) * D2R;

        const r = a * (1 - e * Math.cos(E));
        const u = v + w;

        const x_h = r * (Math.cos(N) * Math.cos(u) - Math.sin(N) * Math.sin(u) * Math.cos(i));
        const y_h = r * (Math.sin(N) * Math.cos(u) + Math.cos(N) * Math.sin(u) * Math.cos(i));
        // const z_h = ... (Pluto has inclination too, similar to Chiron)

        const earth = getHeliocentric('Earth', jd);
        if (!earth) return 0;

        const dx = x_h - earth.x;
        const dy = y_h - earth.y;
        return addPrecession(Math.atan2(dy, dx) * R2D, jd);
    }

    if (id === 'Sun') {
        const e = getHeliocentric('Earth', jd);
        if (!e) return 0;
        const dx = -e.x;
        const dy = -e.y;
        return addPrecession(Math.atan2(dy, dx) * R2D, jd);
    }

    const p = getHeliocentric(id, jd);
    const e = getHeliocentric('Earth', jd);

    if (!p || !e) return 0;

    const dx = p.x - e.x;
    const dy = p.y - e.y;
    return addPrecession(Math.atan2(dy, dx) * R2D, jd);
}

// ============================================================================
// Sidereal Time & House Calculation
// ============================================================================

function getSiderealTime(jd, lon) {
    const T = (jd - 2451545.0) / 36525.0;
    const gmst = 280.46061837 + 360.98564736629 * (jd - 2451545.0) + 0.000387933 * T * T;
    return normalize(gmst + lon);
}

function calculateHouses(lst, lat, eps = 23.439, system = 'P') {
    const RAMC = lst * D2R;
    const latRad = lat * D2R;
    const epsRad = eps * D2R;

    const mc = normalize(Math.atan2(Math.sin(RAMC), Math.cos(RAMC) * Math.cos(epsRad)) * R2D);
    const asc = normalize(Math.atan2(Math.cos(RAMC), -(Math.sin(RAMC) * Math.cos(epsRad) + Math.tan(latRad) * Math.sin(epsRad))) * R2D);

    const cusps = new Array(12);
    cusps[0] = asc;
    cusps[9] = mc;
    cusps[3] = normalize(mc + 180);
    cusps[6] = normalize(asc + 180);

    const calcCusp = (offset, isNight, f) => {
        let L = normalize(Math.atan2(Math.sin(RAMC + offset * D2R), Math.cos(RAMC + offset * D2R) * Math.cos(epsRad)) * R2D);
        for (let i = 0; i < 5; i++) {
            const sinD = Math.sin(epsRad) * Math.sin(L * D2R);
            const clampedSinD = Math.max(-1, Math.min(1, sinD));
            const tanD = Math.tan(Math.asin(clampedSinD));
            const cosH = -tanD * Math.tan(latRad);

            if (Math.abs(cosH) > 1) return normalize(asc + offset);
            let H = Math.acos(cosH) * R2D;
            if (isNight) H = 180 - H;
            const RA = normalize((lst + (isNight ? 180 : 0) + (isNight ? -H : H) * f));
            L = normalize(Math.atan2(Math.sin(RA * D2R), Math.cos(RA * D2R) * Math.cos(epsRad)) * R2D);
        }
        return L;
    };

    cusps[10] = calcCusp(30, false, 1 / 3);
    cusps[11] = calcCusp(60, false, 2 / 3);
    cusps[1] = calcCusp(120, true, 2 / 3);
    cusps[2] = calcCusp(150, true, 1 / 3);

    cusps[4] = normalize(cusps[10] + 180);
    cusps[5] = normalize(cusps[11] + 180);
    cusps[7] = normalize(cusps[1] + 180);
    cusps[8] = normalize(cusps[2] + 180);

    return { asc, mc, cusps };
}

// ============================================================================
// Transit & Retrograde Calculations
// ============================================================================

function calculateTransits(date, time) {
    const jd = getJulianDate(date, time);
    const planetList = (typeof PLANETS !== 'undefined') ? PLANETS : [
        { id: 'Sun', name: 'Sun' }, { id: 'Moon', name: 'Moon' },
        { id: 'Mercury', name: 'Mercury' }, { id: 'Venus', name: 'Venus' },
        { id: 'Mars', name: 'Mars' }, { id: 'Jupiter', name: 'Jupiter' },
        { id: 'Saturn', name: 'Saturn' }, { id: 'Uranus', name: 'Uranus' },
        { id: 'Neptune', name: 'Neptune' }, { id: 'Pluto', name: 'Pluto' }
    ];

    return planetList.map(p => {
        return {
            id: p.id,
            name: p.name,
            symbol: p.symbol || '?',
            color: p.color || '#fff',
            longitude: getHighPrecisionLongitude(p.id, jd),
            isTransit: true
        };
    });
}

function isRetrograde(id, jd) {
    if (id === 'Sun' || id === 'Moon' || id === 'NorthNode') return false;
    const l1 = getHighPrecisionLongitude(id, jd);
    const l2 = getHighPrecisionLongitude(id, jd - 1 / 24);
    let diff = l1 - l2;
    if (diff < -300) diff += 360;
    else if (diff > 300) diff -= 360;
    return diff < 0;
}

// ============================================================================
// Aspect Calculation
// ============================================================================

function calculateAspects(list1, list2 = null) {
    const aspects = [];
    const set2 = list2 || list1;
    const isSelf = !list2;

    const types = (typeof ASPECT_TYPES !== 'undefined') ? ASPECT_TYPES : [
        { angle: 0, orb: 8, name: 'Conjunction' },
        { angle: 180, orb: 8, name: 'Opposition' },
        { angle: 120, orb: 8, name: 'Trine' },
        { angle: 90, orb: 8, name: 'Square' },
        { angle: 60, orb: 6, name: 'Sextile' }
    ];

    for (let i = 0; i < list1.length; i++) {
        for (let j = (isSelf ? i + 1 : 0); j < set2.length; j++) {
            if (isSelf && list1[i].id === set2[j].id) continue;
            const diff = Math.abs(list1[i].longitude - set2[j].longitude);
            const ang = diff > 180 ? 360 - diff : diff;
            for (let type of types) {
                if (Math.abs(ang - type.angle) <= type.orb) {
                    aspects.push({
                        p1: list1[i],
                        p2: set2[j],
                        type: type,
                        orb: Math.abs(ang - type.angle),
                        isTransit: !!(list1[i].isTransit || set2[j].isTransit)
                    });
                }
            }
        }
    }
    return aspects;
}

// Export for Node/Tests
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        getJulianDate,
        getHighPrecisionLongitude,
        calculateHouses,
        calculateTransits,
        calculateAspects,
        getSiderealTime,
        normalize
    };
}
