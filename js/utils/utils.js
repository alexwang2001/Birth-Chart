const DEG_TO_RAD = Math.PI / 180;
const RAD_TO_DEG = 180 / Math.PI;

/**
 * Normalizes an angle to [0, 360) range.
 * @param {number} angle 
 * @returns {number}
 */
function normalize(angle) {
    angle = angle % 360;
    if (angle < 0) angle += 360;
    return angle;
}

/**
 * Determines which house a given longitude belongs to.
 * @param {number} longitude 
 * @param {number[]} cusps 
 * @returns {number} 0-11 index
 */
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

/**
 * Converts a date and time string to Julian Date.
 * @param {string} date YYYY-MM-DD
 * @param {string} time HH:mm
 * @returns {number}
 */
function getJulianDate(date, time) {
    // Assuming UTC+8 based on original code's hardcoded offset
    const d_obj = new Date(date + 'T' + time + ':00+08:00');
    const jd = (d_obj.getTime() / 86400000.0) + 2440587.5;
    return jd;
}
