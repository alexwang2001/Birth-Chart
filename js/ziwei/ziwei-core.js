/**
 * Zi Wei Dou Shu (紫微斗數) Core Logic
 * Handles Solar-to-Lunar conversion and Star Placement
 * 
 * This module provides the core calculation engine for Zi Wei Dou Shu astrology,
 * including lunar calendar conversion, palace determination, and star placement.
 */

const ZiWei = (function () {
    'use strict';

    // ============================================================================
    // CONSTANTS & DATA
    // ============================================================================

    /**
     * Lunar Calendar Data (1900-2100)
     * Each hex value encodes:
     *   - Bits 0-3: Leap month (0=none, 1-12=month number)
     *   - Bits 4-16: Month days (1=30 days, 0=29 days)
     * Reference date: 1900-01-31 = Lunar 1900-01-01
     */
    const LUNAR_INFO = [
        0x04bd8, 0x04ae0, 0x0a570, 0x054d5, 0x0d260, 0x0d950, 0x16554, 0x056a0, 0x09ad0, 0x055d2,
        0x04ae0, 0x0a5b6, 0x0a4d0, 0x0d250, 0x1d255, 0x0b540, 0x0d6a0, 0x0ada2, 0x095b0, 0x14977,
        0x04970, 0x0a4b0, 0x0b4b5, 0x06a50, 0x06d40, 0x1ab54, 0x02b60, 0x09570, 0x052f2, 0x04970,
        0x06566, 0x0d4a0, 0x0ea50, 0x06e95, 0x05ad0, 0x02b60, 0x186e3, 0x092e0, 0x1c8d7, 0x0c950,
        0x0d4a0, 0x1d8a6, 0x0b550, 0x056a0, 0x1a5b4, 0x025d0, 0x092d0, 0x0d2b2, 0x0a950, 0x0b557,
        0x06ca0, 0x0b550, 0x15355, 0x04da0, 0x0a5d0, 0x14573, 0x052d0, 0x0a9a8, 0x0e950, 0x06aa0,
        0x0aea6, 0x0ab50, 0x04b60, 0x0aae4, 0x0a570, 0x05260, 0x0f263, 0x0d950, 0x05b57, 0x056a0,
        0x096d0, 0x04dd5, 0x04ad0, 0x0a4d0, 0x0d4d4, 0x0d250, 0x0d558, 0x0b540, 0x0b5a0, 0x195a6,
        0x095b0, 0x049b0, 0x0a974, 0x0a4b0, 0x0b27a, 0x06a50, 0x06d40, 0x0af46, 0x0ab60, 0x09570,
        0x04af5, 0x04970, 0x064b0, 0x074a3, 0x0ea50, 0x06b58, 0x055c0, 0x0ab60, 0x096d5, 0x092e0,
        0x0c960, 0x0d954, 0x0d4a0, 0x0da50, 0x07552, 0x056a0, 0x0abb7, 0x025d0, 0x092d0, 0x0cab5,
        0x0a950, 0x0b4a0, 0x0baa4, 0x0ad50, 0x055d9, 0x04ba0, 0x0a5b0, 0x15176, 0x052b0, 0x0a930,
        0x07954, 0x06aa0, 0x0ad50, 0x05b52, 0x04b60, 0x0a6e6, 0x0a4e0, 0x0d260, 0x0ea65, 0x0d530,
        0x05aa0, 0x076a3, 0x096d0, 0x04bd7, 0x04ad0, 0x0a4d0, 0x1d0b6, 0x0d250, 0x0d520, 0x0dd45,
        0x0b5a0, 0x056d0, 0x055b2, 0x049b0, 0x0a577, 0x0a4b0, 0x0aa50, 0x1b255, 0x06d20, 0x0ada0
    ];

    const HEAVENLY_STEMS = ["甲", "乙", "丙", "丁", "戊", "己", "庚", "辛", "壬", "癸"];
    const EARTHLY_BRANCHES = ["子", "丑", "寅", "卯", "辰", "巳", "午", "未", "申", "酉", "戌", "亥"];

    const PALACE_NAMES = [
        "命宮", "兄弟", "夫妻", "子女", "財帛", "疾厄",
        "遷移", "交友", "官祿", "田宅", "福德", "父母"
    ];

    /**
     * Na Yin Bureau mapping for 60 Jia Zi cycle
     * Values: 2=Water, 3=Wood, 4=Gold, 5=Earth, 6=Fire
     */
    const NA_YIN_BUREAU = [
        4, 4, 6, 6, 3, 3, 4, 4, 2, 2,
        6, 6, 2, 2, 5, 5, 6, 6, 3, 3,
        4, 4, 5, 5, 2, 2, 3, 3, 4, 4,
        2, 2, 6, 6, 5, 5, 2, 2, 3, 3,
        3, 3, 5, 5, 6, 6, 3, 3, 2, 2,
        5, 5, 4, 4, 3, 3, 5, 5, 6, 6
    ];

    /**
     * Zi Wei Star Group (Purple Star Group)
     * Placed counter-clockwise from Zi Wei position
     */
    const ZI_WEI_STARS = [
        { id: "ZiWei", name: "紫微", color: "#bc8cff", offset: 0, type: "major" },
        { id: "TianJi", name: "天機", color: "#69ff8c", offset: -1, type: "major" },
        { id: "TaiYang", name: "太陽", color: "#ff5f5f", offset: -3, type: "major" },
        { id: "WuQu", name: "武曲", color: "#e1e1e1", offset: -4, type: "major" },
        { id: "TianTong", name: "天同", color: "#ffff70", offset: -5, type: "major" },
        { id: "LianZhen", name: "廉貞", color: "#ff5f5f", offset: -8, type: "major" }
    ];

    /**
     * Tian Fu Star Group (Heavenly Cluster)
     * Placed clockwise from Tian Fu position
     */
    const TIAN_FU_STARS = [
        { id: "TianFu", name: "天府", color: "#e6c27a", offset: 0, type: "major" },
        { id: "TaiYin", name: "太陰", color: "#5fafff", offset: 1, type: "major" },
        { id: "TanLang", name: "貪狼", color: "#69ff8c", offset: 2, type: "major" },
        { id: "JuMen", name: "巨門", color: "#e1e1e1", offset: 3, type: "major" },
        { id: "TianXiang", name: "天相", color: "#e6c27a", offset: 4, type: "major" },
        { id: "TianLiang", name: "天梁", color: "#69ff8c", offset: 5, type: "major" },
        { id: "QiSha", name: "七殺", color: "#ff5f5f", offset: 6, type: "major" },
        { id: "PoJun", name: "破軍", color: "#5fafff", offset: 10, type: "major" }
    ];

    const LUNAR_BASE_DATE = new Date(1900, 0, 31);
    const MS_PER_DAY = 86400000;

    // ============================================================================
    // LUNAR CALENDAR UTILITIES
    // ============================================================================

    /**
     * Get leap month for a given lunar year
     * @param {number} year - Lunar year (1900-2100)
     * @returns {number} Leap month (0 if none, 1-12 for month number)
     */
    function getLeapMonth(year) {
        return LUNAR_INFO[year - 1900] & 0xf;
    }

    /**
     * Get number of days in a specific lunar month
     * @param {number} year - Lunar year
     * @param {number} month - Month number (1-12)
     * @returns {number} Days (29 or 30)
     */
    function getMonthDays(year, month) {
        return (LUNAR_INFO[year - 1900] & (0x10000 >> month)) ? 30 : 29;
    }

    /**
     * Get number of days in leap month
     * @param {number} year - Lunar year
     * @returns {number} Days (0, 29, or 30)
     */
    function getLeapMonthDays(year) {
        if (!getLeapMonth(year)) return 0;
        return (LUNAR_INFO[year - 1900] & 0x10000) ? 30 : 29;
    }

    /**
     * Get total days in a lunar year
     * @param {number} year - Lunar year
     * @returns {number} Total days
     */
    function getYearDays(year) {
        let sum = 348; // Base: 12 months × 29 days
        for (let i = 0x8000; i > 0x8; i >>= 1) {
            sum += (LUNAR_INFO[year - 1900] & i) ? 1 : 0;
        }
        return sum + getLeapMonthDays(year);
    }

    /**
     * Convert solar date to lunar date
     * @param {string|Date} solarDate - Solar date (YYYY-MM-DD string or Date object)
     * @returns {Object|null} Lunar date {year, month, day, isLeap} or null if invalid
     */
    function getLunarDate(solarDate) {
        let year, month, day;

        if (typeof solarDate === 'string') {
            const parts = solarDate.split('-');
            year = parseInt(parts[0], 10);
            month = parseInt(parts[1], 10);
            day = parseInt(parts[2], 10);
        } else {
            year = solarDate.getFullYear();
            month = solarDate.getMonth() + 1;
            day = solarDate.getDate();
        }

        const objDate = new Date(year, month - 1, day);
        let offset = Math.floor((objDate - LUNAR_BASE_DATE) / MS_PER_DAY);

        if (offset < 0) return null; // Before 1900

        // Find lunar year
        let lunarYear = 1900;
        let temp = 0;
        for (; lunarYear < 2101 && offset > 0; lunarYear++) {
            temp = getYearDays(lunarYear);
            offset -= temp;
        }

        if (offset < 0) {
            offset += temp;
            lunarYear--;
        }

        // Find lunar month and day
        const leap = getLeapMonth(lunarYear);
        let isLeap = false;
        let lunarMonth = 1;

        for (; lunarMonth < 13 && offset >= 0; lunarMonth++) {
            // Handle leap month
            if (leap > 0 && lunarMonth === (leap + 1) && !isLeap) {
                lunarMonth--;
                isLeap = true;
                temp = getLeapMonthDays(lunarYear);
            } else {
                temp = getMonthDays(lunarYear, lunarMonth);
            }

            if (isLeap && lunarMonth === (leap + 1)) {
                isLeap = false;
            }

            offset -= temp;
        }

        // Edge case: exactly on leap month boundary
        if (offset === 0 && leap > 0 && lunarMonth === leap + 1) {
            if (isLeap) {
                isLeap = false;
            } else {
                isLeap = true;
                lunarMonth--;
            }
        }

        if (offset < 0) {
            offset += temp;
            lunarMonth--;
        }

        return {
            year: lunarYear,
            month: lunarMonth,
            day: offset + 1,
            isLeap: isLeap
        };
    }

    // ============================================================================
    // ZI WEI DOU SHU CALCULATION UTILITIES
    // ============================================================================

    /**
     * Get birth hour branch index
     * @param {number} hour - Hour (0-23)
     * @returns {number} Branch index (0-11)
     */
    function getBirthHourBranch(hour) {
        if (hour >= 23 || hour < 1) return 0; // Zi (子)
        return Math.floor((hour + 1) / 2);
    }

    /**
     * Calculate Ming Palace (Life Palace) position
     * @param {number} lunarMonth - Lunar month (1-12)
     * @param {number} hourBranch - Birth hour branch (0-11)
     * @returns {number} Palace position (0-11)
     */
    function calculateMingPalace(lunarMonth, hourBranch) {
        // Start from Yin(2), clockwise by month, counter-clockwise by hour
        let pos = (2 + (lunarMonth - 1) - hourBranch) % 12;
        return pos < 0 ? pos + 12 : pos;
    }

    /**
     * Calculate Shen Palace (Body Palace) position
     * @param {number} lunarMonth - Lunar month (1-12)
     * @param {number} hourBranch - Birth hour branch (0-11)
     * @returns {number} Palace position (0-11)
     */
    function calculateShenPalace(lunarMonth, hourBranch) {
        // Start from Yin(2), clockwise by both month and hour
        return (2 + (lunarMonth - 1) + hourBranch) % 12;
    }

    /**
     * Get starting stem for Yin palace based on year stem
     * Uses "Five Tigers Chasing Month" formula
     * @param {number} yearStem - Year stem index (0-9)
     * @returns {number} Yin palace stem index (0-9)
     */
    function getYinPalaceStem(yearStem) {
        return ((yearStem % 5) * 2 + 2) % 10;
    }

    /**
     * Find Jia Zi cycle index for stem-branch pair
     * @param {number} stem - Stem index (0-9)
     * @param {number} branch - Branch index (0-11)
     * @returns {number} Cycle index (0-59)
     */
    function findJiaZiIndex(stem, branch) {
        for (let k = 0; k < 60; k++) {
            if (k % 10 === stem && k % 12 === branch) {
                return k;
            }
        }
        return 0;
    }

    /**
     * Calculate Zi Wei star position
     * @param {number} lunarDay - Lunar day (1-30)
     * @param {number} bureau - Five Elements Bureau (2-6)
     * @returns {number} Position (0-11)
     */
    function calculateZiWeiPosition(lunarDay, bureau) {
        const remainder = lunarDay % bureau;
        const quotient = Math.floor(lunarDay / bureau);

        if (remainder === 0) {
            // Divisible case: start at Yin(2), advance by quotient-1
            return (2 + (quotient - 1)) % 12;
        } else {
            // Non-divisible: use "seek method"
            const Q = Math.ceil(lunarDay / bureau);
            const R = (Q * bureau) - lunarDay;
            const offset = Q + R;
            return (2 + offset - 1) % 12;
        }
    }

    /**
     * Calculate Tian Fu star position (mirror of Zi Wei)
     * @param {number} ziWeiPos - Zi Wei position (0-11)
     * @returns {number} Tian Fu position (0-11)
     */
    function calculateTianFuPosition(ziWeiPos) {
        // Mirror across Yin-Shen axis: sum = 4
        let pos = 4 - ziWeiPos;
        return pos < 0 ? pos + 12 : pos;
    }

    /**
     * Get bureau name in Chinese
     * @param {number} bureau - Bureau number (2-6)
     * @returns {string} Bureau name
     */
    function getBureauName(bureau) {
        const names = {
            2: "水二局",
            3: "木三局",
            4: "金四局",
            5: "土五局",
            6: "火六局"
        };
        return names[bureau] || "";
    }

    /**
     * Initialize palace array with stems and branches
     * @param {number} mingIdx - Ming palace position
     * @param {number} shenIdx - Shen palace position
     * @param {number} yearStem - Year stem index
     * @returns {Array} Array of 12 palace objects
     */
    function initializePalaces(mingIdx, shenIdx, yearStem) {
        const palaces = [];
        const yinStem = getYinPalaceStem(yearStem);

        // First pass: create palaces with names
        for (let i = 0; i < 12; i++) {
            let pos = (mingIdx - i) % 12;
            if (pos < 0) pos += 12;

            palaces[pos] = {
                name: PALACE_NAMES[i],
                isMing: i === 0,
                isShen: pos === shenIdx,
                stars: []
            };
        }

        // Second pass: assign stems and branches
        for (let i = 0; i < 12; i++) {
            const dist = i >= 2 ? i - 2 : i - 2 + 12;
            const stem = (yinStem + dist) % 10;

            palaces[i].stem = HEAVENLY_STEMS[stem];
            palaces[i].stemIdx = stem;
            palaces[i].branch = EARTHLY_BRANCHES[i];
            palaces[i].branchIdx = i;
        }

        return palaces;
    }

    /**
     * Place stars in palaces
     * @param {Array} palaces - Palace array
     * @param {number} ziWeiPos - Zi Wei position
     * @param {number} tianFuPos - Tian Fu position
     * @param {Object} lunar - Lunar date object
     * @param {number} hourBranch - Birth hour branch
     * @param {number} yearStem - Year stem index
     * @param {number} yearBranch - Year branch index
     */
    function placeStars(palaces, ziWeiPos, tianFuPos, lunar, hourBranch, yearStem, yearBranch) {
        // Place Zi Wei group
        ZI_WEI_STARS.forEach(star => {
            let pos = (ziWeiPos + star.offset) % 12;
            if (pos < 0) pos += 12;
            palaces[pos].stars.push(star);
        });

        // Place Tian Fu group
        TIAN_FU_STARS.forEach(star => {
            let pos = (tianFuPos + star.offset) % 12;
            if (pos < 0) pos += 12;
            palaces[pos].stars.push(star);
        });

        // --- Place 6 Lucky Stars ---

        // 1. Zuo Fu / You Bi (Month based)
        // Zuo Fu: Start Chen(4), clockwise
        let zuoFuPos = (4 + (lunar.month - 1)) % 12;
        palaces[zuoFuPos].stars.push({ id: "ZuoFu", name: "左輔", color: "#69ff8c", type: "lucky" });
        // You Bi: Start Xu(10), counter-clockwise
        let youBiPos = (10 - (lunar.month - 1)) % 12;
        if (youBiPos < 0) youBiPos += 12;
        palaces[youBiPos].stars.push({ id: "YouBi", name: "右弼", color: "#69ff8c", type: "lucky" });

        // 2. Wen Chang / Wen Qu (Hour based)
        // Wen Chang: Start Xu(10), counter-clockwise
        let wenChangPos = (10 - hourBranch) % 12;
        if (wenChangPos < 0) wenChangPos += 12;
        palaces[wenChangPos].stars.push({ id: "WenChang", name: "文昌", color: "#ffff70", type: "lucky" });
        // Wen Qu: Start Chen(4), clockwise
        let wenQuPos = (4 + hourBranch) % 12;
        palaces[wenQuPos].stars.push({ id: "WenQu", name: "文曲", color: "#ffff70", type: "lucky" });

        // 3. Tian Kui / Tian Yue (Year Stem based)
        let kuiPos, yuePos;
        switch (yearStem) {
            case 0: case 4: case 6: // 甲戊庚
                kuiPos = 1; yuePos = 7; break;
            case 1: case 5: // 乙己
                kuiPos = 0; yuePos = 8; break;
            case 2: case 3: // 丙丁
                kuiPos = 11; yuePos = 9; break;
            case 8: case 9: // 壬癸
                kuiPos = 5; yuePos = 3; break;
            case 7: // 辛
                kuiPos = 6; yuePos = 2; break;
            default: kuiPos = 0; yuePos = 0;
        }
        palaces[kuiPos].stars.push({ id: "TianKui", name: "天魁", color: "#e6c27a", type: "lucky" });
        palaces[yuePos].stars.push({ id: "TianYue", name: "天鉞", color: "#e6c27a", type: "lucky" });

        // --- Place 6 Ominous Stars ---

        // 1. Qing Yang / Tuo Luo (Lu Cun based)
        let luCunPos;
        const luCunMap = [2, 3, 5, 6, 5, 6, 8, 9, 11, 0]; // 甲乙丙丁戊己庚辛壬癸
        luCunPos = luCunMap[yearStem];

        let qingYangPos = (luCunPos + 1) % 12;
        let tuoLuoPos = (luCunPos - 1) % 12;
        if (tuoLuoPos < 0) tuoLuoPos += 12;

        palaces[qingYangPos].stars.push({ id: "QingYang", name: "擎羊", color: "#ff5f5f", type: "ominous" });
        palaces[tuoLuoPos].stars.push({ id: "TuoLuo", name: "陀羅", color: "#ff5f5f", type: "ominous" });

        // 2. Huo Xing / Ling Xing (Year Branch + Hour)
        let huoStart, lingStart;
        // Yin(2) Wu(6) Xu(10) -> Huo Yin(2), Ling Xu(10)
        // Shen(8) Zi(0) Chen(4) -> Huo Yin(2), Ling Xu(10)
        // Si(5) You(9) Chou(1) -> Huo Mao(3), Ling Xu(10)
        // Hai(11) Mao(3) Wei(7) -> Huo You(9), Ling Xu(10)
        if ([2, 6, 10].includes(yearBranch)) { huoStart = 2; lingStart = 10; }
        else if ([8, 0, 4].includes(yearBranch)) { huoStart = 2; lingStart = 10; }
        else if ([5, 9, 1].includes(yearBranch)) { huoStart = 3; lingStart = 10; }
        else { huoStart = 9; lingStart = 10; }

        let huoPos = (huoStart + hourBranch) % 12;
        let lingPos = (lingStart + hourBranch) % 12;
        palaces[huoPos].stars.push({ id: "HuoXing", name: "火星", color: "#ff5f5f", type: "ominous" });
        palaces[lingPos].stars.push({ id: "LingXing", name: "鈴星", color: "#ff5f5f", type: "ominous" });

        // 3. Di Kong / Di Jie (Hour based)
        let diKongPos = (11 - hourBranch) % 12;
        if (diKongPos < 0) diKongPos += 12;
        let diJiePos = (11 + hourBranch) % 12;
        palaces[diKongPos].stars.push({ id: "DiKong", name: "地空", color: "#bc8cff", type: "ominous" });
        palaces[diJiePos].stars.push({ id: "DiJie", name: "地劫", color: "#bc8cff", type: "ominous" });
    }

    // ============================================================================
    // MAIN CALCULATION FUNCTION
    // ============================================================================

    /**
     * Calculate complete Zi Wei Dou Shu chart
     * @param {string} dateStr - Solar date (YYYY-MM-DD)
     * @param {number} hour - Birth hour (0-23)
     * @returns {Object|null} Chart data or null if invalid
     */
    function calculate(dateStr, hour) {
        // Step 1: Convert to lunar date
        const lunar = getLunarDate(dateStr);
        if (!lunar) return null;

        // Step 2: Calculate year stem and branch
        const yearStemIdx = (lunar.year - 4) % 10;
        const yearBranchIdx = (lunar.year - 4) % 12;

        // Step 3: Calculate palace positions
        const birthHourBranch = getBirthHourBranch(hour);
        const mingIdx = calculateMingPalace(lunar.month, birthHourBranch);
        const shenIdx = calculateShenPalace(lunar.month, birthHourBranch);

        // Step 4: Initialize palaces
        const palaces = initializePalaces(mingIdx, shenIdx, yearStemIdx);

        // Step 5: Determine Five Elements Bureau
        const mingPalace = palaces[mingIdx];
        const cycleIdx = findJiaZiIndex(mingPalace.stemIdx, mingPalace.branchIdx);
        const bureau = NA_YIN_BUREAU[cycleIdx];

        // Step 6: Calculate star positions
        const ziWeiPos = calculateZiWeiPosition(lunar.day, bureau);
        const tianFuPos = calculateTianFuPosition(ziWeiPos);

        // Step 7: Place stars
        placeStars(palaces, ziWeiPos, tianFuPos, lunar, birthHourBranch, yearStemIdx, yearBranchIdx);

        // Step 8: Return complete chart data
        return {
            lunar: lunar,
            bureau: bureau,
            bureauName: getBureauName(bureau),
            palaces: palaces,
            mingPos: mingIdx,
            shenPos: shenIdx,
            ziWeiPos: ziWeiPos,
            tianFuPos: tianFuPos
        };
    }

    // ============================================================================
    // PUBLIC API
    // ============================================================================

    return {
        calculate: calculate,
        getLunarDate: getLunarDate // Expose for testing/debugging
    };

})();
