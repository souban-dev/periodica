# Periodica — Interactive Periodic Table & Chemistry Lab

An interactive, scientific periodic table web application featuring all 118 chemical elements, historical timeline morphing, 3D quantum atomic orbitals, electrochemistry series, nuclear physics decay chains, and periodic trend analytics.

---

## Project Architecture & File Organization

This project is organized into clean, modular directories so that any developer can easily locate and update code, styles, or scientific data without friction:

```
src/
├── components/          # Reusable UI components and scientific studios
│   ├── Footer.tsx               # Application footer (attribution & branding)
│   ├── MobileElementBar.tsx     # Mobile floating element card (< 640px)
│   ├── ControlsBar.tsx          # Top toolbar (view modes, search, temp slider)
│   ├── PeriodicTableGrid.tsx    # Responsive 18-column periodic grid layout
│   ├── ElementCell.tsx          # Individual element cell tile
│   ├── ElementModal.tsx         # Detailed element dossier dialog
│   ├── ElementComparator.tsx    # Side-by-side element comparison lab
│   ├── QuantumOrbitalStudio.tsx # 3D quantum wavefunctions & spherical harmonics
│   ├── ElectrochemistryLab.tsx  # Standard reduction potentials & galvanic cells
│   ├── NuclearStudio.tsx        # Isotopes, binding energy & radioactive decay
│   ├── TrendGraphicalStudio.tsx # 2D/3D periodic trends data charts
│   ├── TableHistoryScrollPage.tsx # Chronological evolution of the periodic table
│   └── BohrAtom.tsx             # Interactive Bohr model planetary animation
│
├── context/             # Global React state providers
│   └── ThemeContext.tsx         # Light / Dark mode state & theme provider
│
├── data/                # Accurate scientific datasets (IUPAC / NIST / CRC)
│   ├── elements.ts              # Combined 118 elements dataset & lookup utilities
│   ├── elementsPart1.ts         # Elements 1–40 (H to Zr)
│   ├── elementsPart2.ts         # Elements 41–80 (Nb to Hg)
│   ├── elementsPart3.ts         # Elements 81–118 (Tl to Og)
│   ├── categories.ts            # Element series categories (alkali, halogens, etc.)
│   ├── states.ts                # States of matter metadata (solid, liquid, gas, unknown)
│   ├── electrochemistry.ts      # Standard reduction potentials & half-cell reactions
│   ├── isotopes.ts              # Nuclear physics, half-lives & decay modes
│   ├── spectroscopy.ts          # Atomic emission spectra wavelengths
│   └── tableHistory.ts          # Historical milestones (Lavoisier to IUPAC Period 7)
│
├── types/               # TypeScript type definitions and interfaces
│   └── element.ts               # ElementData, TrendProperty, ViewMode, etc.
│
├── utils/               # Mathematical and algorithmic helpers
│   └── dottedOrbital.ts         # 3D Monte Carlo probability density point generator
│
├── App.tsx              # Main application shell, state management & modal routing
├── main.tsx             # React DOM entry point
└── index.css            # Tailwind CSS and global styling tokens
```

---

## How to Make Common Changes

### 1. Changing the Footer Text or Attribution
- Open **`src/components/Footer.tsx`**.
- To change the author name, update the `authorName` prop in `App.tsx` (e.g. `<Footer authorName="Your Name" />`) or directly edit the text in `Footer.tsx`:
  ```tsx
  The website is designed and developed by <span className="font-semibold text-slate-900 dark:text-white">Souban Chakraborty</span>
  ```

### 2. Editing Element Data (Atomic Masses, Configurations, Discovery, etc.)
- Elements 1–40: **`src/data/elementsPart1.ts`**
- Elements 41–80: **`src/data/elementsPart2.ts`**
- Elements 81–118: **`src/data/elementsPart3.ts`**
- All element objects conform to the TypeScript interface `ElementData` defined in **`src/types/element.ts`**.

### 3. Modifying Color Schemes & Categories
- Category colors, dark mode text accents, and borders are defined in **`src/data/categories.ts`**.
- State-of-matter definitions (melting / boiling temperature logic) are located in **`src/data/states.ts`**.

### 4. Adjusting the Mobile Layout & Controls
- The mobile floating quick-action bar is located in **`src/components/MobileElementBar.tsx`**.
- The main table responsive zoom/pinch controls are located in **`src/components/PeriodicTableGrid.tsx`**.

### 5. Modifying Scientific Studios
- **Quantum Wavefunctions**: `src/components/QuantumOrbitalStudio.tsx` & `src/components/Real3DOrbitalCanvas.tsx`
- **Electrochemical Series**: `src/components/ElectrochemistryLab.tsx`
- **Radioactive Decay & Isotopes**: `src/components/NuclearStudio.tsx`
- **Trend Graphs**: `src/components/TrendGraphicalStudio.tsx`
- **Historical Timeline**: `src/components/TableHistoryScrollPage.tsx`

---

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS 4
- **Icons**: Lucide React
- **Graphics**: HTML5 Canvas / WebGL / Three.js
