# 極致星盤 (Elite Chart) - Professional Birth Chart Calculator
## Western Astrology | Zi Wei Dou Shu | Human Design

[![Status](https://img.shields.io/badge/Status-Active-brightgreen.svg)]()
[![Platform](https://img.shields.io/badge/Platform-Web-blue.svg)]()
[![Version](https://img.shields.io/badge/Version-2.0-orange.svg)]()

**Elite Chart** is a state-of-the-art, Mandarin-optimized birth chart generator that integrates three major mystical systems into a singular, high-performance web experience. Designed with a premium dark-mode aesthetic and precision-first algorithms.

## 🌐 Live Demo
The application is deployed on GitHub Pages: [https://alexwang2001.github.io/Birth-Chart/](https://alexwang2001.github.io/Birth-Chart/)

---

## 🚀 Key Features

### 🌌 Western Astrology (現代占星)
- **High-Precision Calculations**: Geocentric planetary positions using J2000 epoch and truncated Meeus/ELP-2000 algorithms.
- **Dynamic Houses**: Support for **Placidus**, **Whole Sign**, and **Equal House** systems.
- **Transit Overlay**: Real-time transit calculations with automatic "Sync Now" functionality and house detection.
- **Energy Analysis**: Interactive dashboard for Hemispheres, Quadrants, and Element/Modality balancing.
- **Interactive SVG**: Click any planet or house for detailed interpretation modals.

### 🔮 Zi Wei Dou Shu (紫微斗數)
- **Classic Ming Pan**: Professional 12-palace grid layout with refined styling.
- **Star Strength (廟旺利陷)**: Advanced implementation of strength levels for Major, Lucky, and Ominous stars across all palaces.
- **Si Hua (四化)**: Complete transformation system (Lu, Quan, Ke, Ji) with palace-specific interpretations.
- **Period Analysis**: Integrated support for **Daxian (大限)** and **Liunian (流年)** tracking.
- **Lunar Engine**: Robust Solar-to-Lunar conversion (1900-2100).

### 🧬 Human Design (人類圖)
- **SVG BodyGraph**: Custom-rendered vector graphics for Centers and Channels.
- **Integrated Logic**: Automated determination of **Type**, **Authority**, **Profile**, and **Centers** (Defined vs Undefined).
- **Deep Interpretation**: Detailed explanations for Incarnation Crosses, Quarters, and active Channel circuitry.
- **Design Calculation**: Precise detection of the "Design" moment (88° Solar Arc prior to birth).

---

## 🎨 Premium UI/UX
- **Glassmorphism Design**: Modern, semi-transparent interface with vibrant accent colors.
- **Interactive Modals**: Instant access to interpretations without leaving the chart view.
- **Export Capabilities**: One-click **PNG Export** for sharing and archiving charts.
- **Smart History**: LocalStorage-based history management to keep track of previous calculations.
- **Location Presets**: Comprehensive database for Taiwan cities and districts with manual coordinate support.

---

## 📖 Usage Guide

1. **Enter Birth Data**: Input Date, Time, and Gender.
2. **Select Location**: Use the Taiwan dropdowns or toggle manual coordinates for international locations.
3. **Configure Transit**: (Optional) Use "Sync Now" to see current planetary influences on the natal chart.
4. **Choose House System**: Select your preferred calculation method.
5. **Generate**: Click **"生成星盤"** to compute and render all three systems simultaneously.
6. **Interpret**: Click on planets, stars, or centers to open the detailed interpretation modal.

---

## 📁 Project Structure

```text
├── index.html              # Main application entry
├── css/
│   ├── style.css           # Core styling & glassmorphism system
│   └── human-design.css    # Specialized SVG & HD styling
├── js/
│   ├── core/
│   │   ├── astro-core.js   # Western astrology engine
│   │   ├── ziwei-core.js   # 紫微斗數 engine
│   │   ├── human-design-core.js # HD logic & graph traversal
│   │   ├── analysis.js     # Interpretation & aspect logic
│   │   └── state.js        # AppState management
│   ├── data/
│   │   ├── astro-data.js   # Ephemeris & zodiac constants
│   │   ├── ziwei-data.js   # Lunar tables & star strengths
│   │   └── human-design-data.js # HD interpretation database
│   ├── ui/
│   │   ├── main.js         # Event handling & orchestration
│   │   ├── astro-chart.js  # SVG Astro wheel renderer
│   │   ├── human-design-renderer.js # SVG BodyGraph renderer
│   │   ├── modals.js       # Interpretation modal controller
│   │   └── components.js   # Reusable UI components
│   └── utils/
│       ├── utils.js        # Math & Julian Date helpers
│       └── storage.js      # LocalStorage history management
```

---

## 🛠 Tech Stack
- **Frontend**: Vanilla HTML5, CSS3 (Custom Variables), JavaScript (ES6+).
- **Graphics**: SVG (Scalable Vector Graphics) for all chart rendering.
- **Algorithms**: 
  - **Astro**: Meeus Astronomical Algorithms.
  - **HD**: 88-degree Solar Arc calculation.
  - **ZWDS**: Traditional Star Placement logic (Miao Wang Li Xian).

---

## 👨‍💻 Development
Produced by **Alex** & **Antigravity (Gemini)**.

## 📜 License
This project is for educational and personal use. All astrological calculations are approximate and provided "as is".
