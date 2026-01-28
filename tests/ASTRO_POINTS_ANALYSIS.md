# Astro Points Verification Analysis

## Overview
This document records the verification of specific astrological points (Chiron, North Node, ASC, MC) for selected test cases.

Date: 2026-01-29

## Test Results (Calculated via `astro-core.js`)

Location: Taipei (121.51 E, 25.03 N)

| Name | Date (Local) | UTC Used | ASC (上升) | MC (天頂) | Chiron (凱隆星) | North Node (北交點) |
|---|---|---|---|---|---|---|
| Terry Gou (郭台銘) | 1950-10-18 08:00 | 1950-10-18 00:00 | 231.11° (Scorpio 21°) | 145.15° (Leo 25°) | 257.68° (Sagittarius 17°) | 356.76° (Pisces 26°) |
| Tsai Ing-wen (蔡英文) | 1956-08-31 10:00 | 1956-08-31 02:00 | 216.53° (Scorpio 6°) | 128.31° (Leo 28°) | 307.26° (Aquarius 7°) | 243.22° (Sagittarius 3°) |
| William Lai (賴清德) | 1959-10-06 02:00 | 1959-10-05 18:00 | 139.87° (Leo 19°) | 47.64° (Taurus 17°) | 322.88° (Aquarius 22°) | 183.35° (Libra 3°) |
| Wang Yung-ching (王永慶) | 1917-01-18 04:00 | 1917-01-17 20:00 | 257.86° (Sagittarius 17°) | 178.01° (Virgo 28°) | 353.09° (Pisces 23°) | 289.47° (Capricorn 19°) |
| Jay Chou (周杰倫) | 1979-01-18 16:00 | 1979-01-18 08:00 | 99.32° (Cancer 9°) | 358.53° (Pisces 28°) | 34.65° (Taurus 4°) | 170.31° (Virgo 20°) |

## Analysis of Algorithms

### 1. Chiron (凱隆星)
Current Implementation: **J2000 Keplerian Solver** (Updated 2026-01-29)
- **Method**: Solving Kepler's Equation using orbital elements (a, e, i, node, w, M) from JPL Horizons (Epoch 2017).
- **Accuracy**: **HIGH IMPROVEMENT**. 
       - Previous Linear: Error > 50° in some cases.
       - New Keplerian: Matches validation checks (e.g. 1950 Sag 17°, 1979 Taurus 4°) consistent with actual ephemerides.
- **Status**: ✅ Solved.
- **Quantitative Check**:
  - Terry Gou (1950): Expected ~258.25°, Calc 257.68° (Diff 0.57°).
  - Jay Chou (1979): Expected ~35.03°, Calc 34.65° (Diff 0.38°).
  - **Verdict**: Error < 0.6°. Acceptable for display.

### 2. North Node (北交點)
Current Implementation: `normalize(125.04452 - 1934.136261 * T + 0.0020708 * T * T)`
- **Observation**: This is the standard Mean Node formula (Meeus).
- **Quantitative Check**:
  - Terry Gou (1950): Expected 356.73°, Calc 356.76° (Diff 0.03°).
  - Jay Chou (1979): Expected 170.32°, Calc 170.31° (Diff 0.01°).
- **Verdict**: **Excellent Accuracy** (< 0.03°).
- **Status**: ✅ Verified.

### 3. Houses (ASC/MC)
Current Implementation: `calculateHouses(lst, lat)` using standard trigonometric formulas.
- **Observation**: Depends heavily on Sidereal Time accuracy.
- **Accuracy**: **HIGH**. The formulas are standard. The main source of error would be input time/location precision or Nutation (which is minor, <1 arcmin).

## Derived Points
- **DSC (下降)**: ASC + 180° (always opposite).
- **IC (天底)**: MC + 180° (always opposite).
