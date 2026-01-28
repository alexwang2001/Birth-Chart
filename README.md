# 極致星盤 (Elite Chart) - Professional Birth Chart Calculator
## Western Astrology | Zi Wei Dou Shu | Human Design

[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Web-blue.svg)]()
[![Version](https://img.shields.io/badge/Version-2.5-orange.svg)]()
[![Tests](https://img.shields.io/badge/Tests-Passing-success.svg)]()

**Elite Chart** is a state-of-the-art, Mandarin-optimized birth chart generator that integrates three major mystical systems into a singular, high-performance web experience. Designed with a premium dark-mode aesthetic and precision-first algorithms verified against professional astronomical and astrological data.

## 🌐 Live Demo
The application is deployed on GitHub Pages: [https://alexwang2001.github.io/Birth-Chart/](https://alexwang2001.github.io/Birth-Chart/)

---

## 🚀 Key Features

### 🌌 Western Astrology (現代占星)
- **High-Precision Calculations**: Integrated **VSOP87A** planetary theory with **Precession Correction** (Mean Ecliptic of Date), achieving **0.01° (36 arcseconds)** average accuracy against NASA JPL Horizons data.
- **Dynamic Houses**: Support for **Placidus**, **Whole Sign**, and **Equal House** systems.
- **Transit Overlay**: Real-time transit calculations with automatic "Sync Now" functionality and house detection.
- **Energy Analysis**: Interactive dashboard for Hemispheres, Quadrants, and Element/Modality balancing.
- **Interactive SVG**: High-fidelity vector rendering of the natal wheel and transit aspects.

### 🔮 Zi Wei Dou Shu (紫微斗數)
- **Professional Ming Pan**: Classic 12-palace grid with accurate star placements (100+ stars).
- **Verified Accuracy**: Extensively tested against professional calculators (Ziwei-Yun, Astro Online) and famous charts including **Jay Chou (周杰倫)**.
- **Complex Logic Support**: Robust handling of **Leap Months (閏月)**, **Early/Late Rat Hour (子時)**, and precise **Xū (戌)** hour edge cases.
- **Si Hua (四化)**: Dynamic transformation system based on birth year stem.
- **Period Analysis**: Integrated **Daxian (大限)** and **Liunian (流年)** tracking.

### 🧬 Human Design (人類圖)
- **SVG BodyGraph**: Precise vector rendering of Centers, Channels, and Gates.
- **Integrated Logic**: Automated determination of **Type**, **Authority**, **Profile**, and **Centers**.
- **Design Calculation**: High-precision 88° Solar Arc calculation for the Design (Unconscious) side.
- **Deep Interpretation**: Automated summaries for Incarnation Crosses and Circuitry.

---

## 🧪 Accuracy & Verification

Reliability is the core of Elite Chart. We maintain a rigorous verification suite:

- **Python Test Suite**: Automated bridge testing directly calling the JavaScript engine to verify results against hardcoded ground-truth data.
- **Cross-Platform Matching**: Calculations are verified line-by-line with professional-grade software to ensure zero-deviation in star positions and palace assignments.
- **Ephemeris Validation**: Planetary positions are cross-referenced with NASA JPL Horizons data for astronomical accuracy.

---

## 🎨 Premium UI/UX
- **Glassmorphism Design**: Modern, semi-transparent interface with vibrant accent colors.
- **Interactive Modals**: Instant access to interpretations without leaving the chart view.
- **Export Capabilities**: One-click **PNG Export** for sharing charts.
- **Smart History**: LocalStorage-based history management.
- **Location Presets**: Integrated database for Taiwan cities/districts.

---

## 📁 Project Structure

```text
├── index.html              # Main application entry
├── css/
│   ├── style.css           # Core styling & glassmorphism system
│   └── human-design.css    # Specialized SVG & HD styling
├── js/
│   ├── core/
│   │   ├── vsop87a_milli.js # High-precision planetary engine
│   │   ├── astro-core.js   # Western astrology logic
│   │   ├── ziwei-core.js   # 紫微斗數 engine (Verified)
│   │   ├── human-design-core.js # HD logic & graph traversal
│   │   └── state.js        # AppState management
│   ├── data/
│   │   ├── astro-data.js   # Ephemeris & zodiac constants
│   │   ├── ziwei-data.js   # Lunar tables & star definitions
│   │   └── human-design-data.js # HD interpretation database
│   └── ui/                 # Renders & event controllers
└── tests/
    ├── test_zwds.py       # ZWDS automated test suite
    ├── test_astro.py      # Astro precision validation
    ├── test_human_design.py # Human Design verification
    ├── bridge_zwds.js     # Node.js bridge for ZWDS
    └── bridge_hd.js       # Node.js bridge for HD
```

---

## 🛠 Tech Stack
- **Frontend**: Vanilla ES6+ JavaScript, CSS3 (Custom Variables), HTML5.
- **Graphics**: Scalable Vector Graphics (SVG).
- **Precision Engine**: VSOP87A Truncated Series.
- **Testing**: Python 3.x, Node.js (Bridge).

---

## 👨‍💻 Development
Produced by **Alex** & **Antigravity (Gemini)**.

## 📜 License
This project is for educational and personal use. All astrological calculations are approximate and provided "as is".
