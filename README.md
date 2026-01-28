# Offline Birth Chart Generator (Mandarin Version / 中文版)

This is a professional astrological birth chart generator produced by **Alex** and **Gemini (Antigravity)**. This application is optimized for Mandarin-speaking users and features a comprehensive local database for Taiwan locations. It integrates Western Astrology, Zi Wei Dou Shu (Purple Star Astrology), and Human Design into a single offline-capable interface.

## 🌐 Live Demo
The application is deployed on GitHub Pages: [https://alexwang2001.github.io/Birth-Chart/](https://alexwang2001.github.io/Birth-Chart/)

---

## 🛠 Features

- **Western Astrology**:
  - Precise geocentric planetary positions using J2000 epoch and Meeus/ELP-2000 algorithms.
  - Support for **Placidus**, **Whole Sign**, and **Equal House** systems.
  - Dynamic **Transit Overlay** with real-time house detection.
  - Interactive SVG chart rendering with aspect analysis.
- **Zi Wei Dou Shu (紫微斗數)**: 
  - Solar-to-Lunar calendar conversion (1900-2100).
  - Complete Ming Pan (命盤) generation including Main 14 stars, Lucky/Ominous stars, and Si Hua (Four Transformations).
  - Period Analysis: **Daxian (大限)** and **Liunian (流年)** support.
- **Human Design (人類圖)**:
  - BodyGraph calculation based on 88° solar arc design moment.
  - Automated determination of **Type**, **Authority**, **Profile**, and **Centers**.
  - **Incarnation Cross** identification and Quarter mapping.
  - Circuitry analysis and active channel highlighting.

---

## 📖 Usage / 使用方法

1. **Launch**: Open `index.html` in any modern web browser.
2. **Setup Birth Data**: Enter your **Birth Date**, **Time**, and **Location**.
3. **Transit Settings**: (Optional) Configure transit date/time to see current influences.
4. **Calculations**: Select your preferred House System and click **"生成星盤" (Generate Chart)**.
5. **Review Results**: Use the tabs or scroll to view Western, Zi Wei, and Human Design sections.

---

## 📁 Project Structure

```text
js/
├── core/
│   ├── astro-core.js          # Western astrology calculations
│   ├── human-design-core.js   # Human Design logic & graph traversal
│   ├── ziwei-core.js          # Zi Wei Dou Shu engine
│   └── analysis.js            # Interpretation & Aspect logic
├── data/
│   ├── astro-data.js          # Zodiac and planetary constants
│   ├── human-design-data.js   # HD interpretation database
│   └── ziwei-data.js          # ZWDS star maps & lunar tables
├── ui/
│   ├── main.js                # App state & event handling
│   ├── astro-chart.js         # SVG Astro wheel renderer
│   ├── human-design-renderer.js # SVG BodyGraph renderer
│   └── components.js          # Reusable UI elements
└── utils/
    ├── utils.js               # Julian Date & coordinate helpers
    └── storage.js             # LocalStorage history management
```

---

## 🧪 Algorithms & References

### 1. Western Astrology
- **Planetary Positions**: Based on standard orbital elements for J2000 epoch.
- **Lunar Calculation**: Truncated **Meeus/ELP-2000** algorithm (Jean Meeus, *Astronomical Algorithms*, Chapter 47).
- **House Systems**:
    - **Placidus**: Iterative Semi-Arc Trisecant Method.
    - **Whole Sign/Equal**: Fixed 30° divisions based on Ascendant.
- **Sidereal Time**: Calculated using IAU 1982 GMST formula.

### 2. Human Design
- **Rave Mandala**: 64 Gate mapping using standard HD gate rotation starting from Gate 41 at 02°15' Aquarius.
- **Design Date**: Found by calculating the moment the Sun was exactly 88.0 degrees prior to the natal Sun position in the ecliptic.
- **Graph Logic**: Center definition is derived from active channels using custom graph traversal (depth-first search).

### 3. Zi Wei Dou Shu
- **Lunar Conversion**: Based on standard Chinese Lunar Calendar lookup tables (1900-2100).
- **Star Placement**: Implementation of orthodox formulas for the 14 Major Stars (Zi Wei and Tian Fu groups) and the 6 Lucky/6 Ominous stars.
- **Na Yin**: Five Elements Bureau identification via the 60 Jia Zi cycle.

---

## 👨‍💻 Authors
- **Alex** - Lead Developer & Domain Expert
- **Gemini (Antigravity)** - AI Architect & UI/UX Design

## 📜 License
This project is for educational and personal use. All astrological calculations are approximate and provided "as is".
