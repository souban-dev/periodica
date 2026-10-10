import React from 'react';
import { ElementCategory, TrendProperty, ElementBlock, ViewMode } from '../types/element';
import { CATEGORIES } from '../data/categories';
import { TREND_RANGES } from '../data/elements';
import { STATE_METADATA } from '../data/states';
import { useTheme } from '../context/ThemeContext';
import { Search, Thermometer, Scale, History, Atom, ArrowLeft, Zap, TrendingUp, Sun, Moon, Radiation } from 'lucide-react';

interface ControlsBarProps {
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  trendProperty: TrendProperty;
  onTrendPropertyChange: (prop: TrendProperty) => void;
  tempKelvin: number;
  onTempChange: (temp: number) => void;
  selectedCategory: ElementCategory | 'all';
  onCategoryChange: (cat: ElementCategory | 'all') => void;
  selectedBlock: ElementBlock | 'all';
  onBlockChange: (block: ElementBlock | 'all') => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onOpenComparator: () => void;
  onOpenOrbitals?: () => void;
  onOpenElectrochemistry?: () => void;
  onOpenNuclear?: () => void;
  onOpenTrendGraph?: () => void;
}

const CATEGORY_SHORT_LABELS: Record<string, string> = {
  'alkali-metal': 'Alkali',
  'alkaline-earth': 'Alk. Earth',
  'transition-metal': 'Transition',
  'post-transition': 'Post-Trans.',
  'metalloid': 'Metalloid',
  'reactive-nonmetal': 'Nonmetal',
  'noble-gas': 'Noble Gas',
  'lanthanoid': 'Lanthanoid',
  'actinoid': 'Actinoid',
  'unknown': 'Unknown',
};

export const ControlsBar: React.FC<ControlsBarProps> = ({
  viewMode,
  onViewModeChange,
  trendProperty,
  onTrendPropertyChange,
  tempKelvin,
  onTempChange,
  selectedCategory,
  onCategoryChange,
  selectedBlock,
  onBlockChange,
  searchQuery,
  onSearchChange,
  onOpenComparator,
  onOpenOrbitals,
  onOpenElectrochemistry,
  onOpenNuclear,
  onOpenTrendGraph,
}) => {
  const { theme, toggleTheme } = useTheme();
  const currentTrend = trendProperty !== 'none' ? TREND_RANGES[trendProperty] : null;

  return (
    <div className="w-full flex flex-col space-y-1.5 select-none">
      {/* ========================================================================= */}
      {/* TIER 1: PRIMARY HEADER & STANDALONE STUDIOS (Maximum Clarity & Rigor)      */}
      {/* ========================================================================= */}
      <header className="flex flex-col lg:flex-row items-center justify-between gap-2.5 px-3 py-1.5 rounded-xl border border-slate-200 dark:border-[#292c35] bg-white/95 dark:bg-[#1a1b20]/95 backdrop-blur-xl shadow-xs transition-colors duration-300">
        {/* Brand & IUPAC Badge */}
        <div className="flex items-center gap-2.5 w-full lg:w-auto justify-between">
          <div className="flex items-center gap-2">
            <span className="text-lg font-bold font-mono tracking-widest text-slate-900 dark:text-white uppercase transition-colors duration-300">
              PERIODICA
            </span>
            <span className="text-[10px] font-mono font-semibold text-zinc-700 bg-zinc-100 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700 px-1.5 py-0.5 rounded-md border border-zinc-200 transition-colors duration-300">
              118 ELEMENTS · IUPAC based
            </span>
          </div>

          {/* Mobile Theme Toggle */}
          <div className="flex items-center gap-1.5 lg:hidden">
            <button
              type="button"
              onClick={toggleTheme}
              className="p-1.5 text-slate-600 hover:text-slate-900 dark:text-zinc-300 dark:hover:text-white rounded-md border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-800 transition-colors cursor-pointer"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={15} className="text-amber-400" /> : <Moon size={15} className="text-zinc-700" />}
            </button>
          </div>
        </div>

        {/* Dedicated Separate Groups on Top Tier */}
        <div className="flex items-center gap-2 sm:gap-3 overflow-x-auto no-scrollbar scrollbar-none py-0.5 w-full lg:w-auto">
          {/* ------------------------------------------------------------------- */}
          {/* SEPARATE GROUP: CHRONOLOGY & EVOLUTION                              */}
          {/* ------------------------------------------------------------------- */}
          <div className="flex items-center gap-1.5 shrink-0">
            <button
              type="button"
              onClick={() => onViewModeChange(viewMode === 'timeline' ? 'category' : 'timeline')}
              className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-all cursor-pointer shadow-xs ${
                viewMode === 'timeline'
                  ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-white font-bold'
                  : 'bg-slate-50 hover:bg-slate-100 text-slate-700 hover:text-slate-900 border-slate-200 dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800'
              }`}
              title="Explore chronological element discovery from Lavoisier to Oganesson"
            >
              <History size={13} className={viewMode === 'timeline' ? '' : 'text-zinc-600 dark:text-zinc-400'} />
              <span>Table Evolution</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 shrink-0" aria-hidden="true" />

          {/* ------------------------------------------------------------------- */}
          {/* SEPARATE GROUP: QUANTUM MECHANICS STUDIO                           */}
          {/* ------------------------------------------------------------------- */}
          {onOpenOrbitals && (
            <div className="flex items-center gap-1.5 shrink-0">
              <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider hidden sm:inline">
                QUANTUM:
              </span>
              <button
                type="button"
                onClick={onOpenOrbitals}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-900 hover:bg-zinc-200 dark:hover:bg-zinc-800 rounded-md border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer shadow-xs"
                title="Launch 3D Quantum Wavefunction & Orbital Studio"
              >
                <Atom size={13} className="text-zinc-600 dark:text-zinc-300" />
                <span>3D Orbitals</span>
              </button>
            </div>
          )}

          <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 shrink-0" aria-hidden="true" />

          {/* ------------------------------------------------------------------- */}
          {/* SEPARATE GROUP: COMPARATIVE ANALYSIS LAB & TOOLS                    */}
          {/* ------------------------------------------------------------------- */}
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider hidden sm:inline">
              LAB TOOLS:
            </span>
            {onOpenElectrochemistry && (
              <button
                type="button"
                onClick={onOpenElectrochemistry}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50/90 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/40 rounded-md border border-amber-200 dark:border-amber-800/80 transition-colors cursor-pointer shadow-xs active:scale-95"
                title="Electrochemical Series, Galvanic Cells & Reactivity"
              >
                <Zap size={13} className="text-amber-600 dark:text-amber-400" />
                <span>Electrochemistry</span>
              </button>
            )}

            {onOpenNuclear && (
              <button
                type="button"
                onClick={onOpenNuclear}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 rounded-md border border-emerald-200 dark:border-emerald-800/80 transition-colors cursor-pointer shadow-xs active:scale-95"
                title="Nuclear Physics, Isotopes, Decay Chains & Half-Life Clock"
              >
                <Radiation size={13} className="text-emerald-600 dark:text-emerald-400" />
                <span>Nuclear</span>
              </button>
            )}

            {onOpenTrendGraph && (
              <button
                type="button"
                onClick={onOpenTrendGraph}
                className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs active:scale-95"
                title="Interactive graphical interpretation of periodic data & trends"
              >
                <TrendingUp size={13} className="text-amber-500" />
                <span>Graph Analysis</span>
              </button>
            )}

            <button
              type="button"
              onClick={onOpenComparator}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:text-slate-900 bg-slate-50 hover:bg-slate-100 rounded-md border border-slate-200 dark:bg-zinc-900/90 dark:border-zinc-800 dark:text-zinc-200 dark:hover:bg-zinc-800 transition-colors cursor-pointer shadow-xs active:scale-95"
              title="Side-by-side comparative laboratory"
            >
              <Scale size={13} className="text-zinc-600 dark:text-zinc-400" />
              <span>Compare</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-200 dark:bg-zinc-800 shrink-0 hidden lg:block" aria-hidden="true" />

          {/* Theme Switcher Toggle (Desktop) */}
          <div className="hidden lg:flex items-center shrink-0">
            <button
              type="button"
              onClick={toggleTheme}
              className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold rounded-md border transition-all duration-300 cursor-pointer shadow-xs active:scale-95 bg-slate-50 hover:bg-slate-100 text-slate-700 border-slate-200 dark:bg-zinc-900/90 dark:hover:bg-zinc-800 dark:text-zinc-200 dark:border-zinc-700"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
              aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? (
                <>
                  <Sun size={13} className="text-amber-400" />
                  <span className="font-mono text-[11px]">Light</span>
                </>
              ) : (
                <>
                  <Moon size={13} className="text-zinc-600" />
                  <span className="font-mono text-[11px]">Dark</span>
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* TIER 2: TABLE OVERLAYS (ONE GROUP) & CONTEXTUAL EXPLORER                  */}
      {/* ========================================================================= */}
      {viewMode === 'timeline' ? (
        /* Evolution Active Bar */
        <div className="flex items-center justify-between px-3.5 py-1.5 rounded-xl border border-amber-300 dark:border-amber-800/80 bg-amber-50/70 dark:bg-amber-950/30 text-xs font-mono shadow-xs animate-in fade-in duration-200 ease-out transition-colors duration-300">
          <div className="flex items-center gap-2 text-amber-950 dark:text-amber-200">
            <History size={14} className="text-amber-600 dark:text-amber-400" />
            <strong className="font-bold">Historical Table Evolution Active:</strong>
            <span className="text-amber-800 dark:text-amber-300 hidden sm:inline">
              Scroll through 230 years of chemical discovery from Lavoisier (1789) to Oganesson (2016).
            </span>
          </div>
          <button
            type="button"
            onClick={() => onViewModeChange('category')}
            className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-zinc-800 dark:text-zinc-200 bg-white dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 rounded-md border border-zinc-300 dark:border-zinc-700 transition-colors cursor-pointer shadow-xs active:scale-95"
          >
            <ArrowLeft size={13} />
            <span>Return to Interactive Table</span>
          </button>
        </div>
      ) : (
        /* Table Overlays Group + Search + Context Controls */
        <div className="flex flex-col gap-1.5 p-1.5 sm:p-2 rounded-xl border border-slate-200 dark:border-[#292c35] bg-white/95 dark:bg-[#1a1b20]/95 backdrop-blur-xl shadow-xs text-xs animate-in fade-in duration-200 ease-out transition-colors duration-300">
          {/* Top of Tier 2: Search + Overlays Segmented Group */}
          <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-2.5">
            {/* Search Input */}
            <div className="relative flex-1 max-w-sm">
              <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Search by name, symbol, or #... (Press /)"
                className="w-full pl-7 pr-3 py-1.5 rounded-md bg-slate-50 dark:bg-zinc-900/90 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500 font-mono text-xs outline-none focus:border-zinc-400 dark:focus:border-zinc-600 focus:bg-white dark:focus:bg-zinc-900 transition-colors"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-zinc-200 text-xs cursor-pointer"
                >
                  ✕
                </button>
              )}
            </div>

            {/* --------------------------------------------------------------- */}
            {/* ONE GROUP: TABLE OVERLAYS (Families, Trends, Thermal, Blocks)   */}
            {/* --------------------------------------------------------------- */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="text-[9px] font-mono font-bold text-slate-400 dark:text-zinc-500 uppercase tracking-wider shrink-0 hidden sm:inline">
                TABLE OVERLAYS:
              </span>
              <nav className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-black/60 rounded-lg border border-slate-200 dark:border-zinc-800 text-xs shrink-0 overflow-x-auto no-scrollbar max-w-full transition-colors duration-300">
                <button
                  type="button"
                  onClick={() => onViewModeChange('category')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    viewMode === 'category'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Classify elements by chemical families (Alkali, Halogens, Noble Gases, etc.)"
                >
                  Families
                </button>

                <button
                  type="button"
                  onClick={() => onViewModeChange('trend')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    viewMode === 'trend'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Heatmaps for Electronegativity, Atomic Radius, Ionization Energy, and Density"
                >
                  Periodic Trends
                </button>

                <button
                  type="button"
                  onClick={() => onViewModeChange('state')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    viewMode === 'state'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Simulate thermal state of matter (Solid, Liquid, Gas) from 0K to 4000K"
                >
                  Thermal States
                </button>

                <button
                  type="button"
                  onClick={() => onViewModeChange('block')}
                  className={`px-2.5 py-1 font-medium rounded-md transition-all whitespace-nowrap cursor-pointer ${
                    viewMode === 'block'
                      ? 'bg-white dark:bg-zinc-800 text-slate-900 dark:text-white shadow-xs font-bold'
                      : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="Organize table by valence subshell blocks (s, p, d, f)"
                >
                  Blocks (s, p, d, f)
                </button>
              </nav>
            </div>
          </div>

          {/* Contextual Sub-Bar for the Selected Overlay (Stabilized Height, Zero-Slide, All Fit) */}
          <div className="pt-2 border-t border-slate-100 dark:border-zinc-800/80 flex items-center min-h-[40px] text-xs transition-colors duration-300">
            {viewMode === 'trend' ? (
              <div className="flex flex-wrap items-center justify-between w-full gap-2">
                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-slate-500 dark:text-zinc-400 font-mono text-[11px] font-bold">Select Trend Heatmap:</span>
                  <select
                    value={trendProperty}
                    onChange={(e) => onTrendPropertyChange(e.target.value as TrendProperty)}
                    className="px-2.5 py-1 rounded-md bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 font-mono text-xs outline-none focus:border-zinc-400 dark:focus:border-zinc-600 cursor-pointer shadow-xs"
                  >
                    <option value="electronegativity">Electronegativity (Pauling)</option>
                    <option value="atomicRadius">Atomic Radius (pm)</option>
                    <option value="ionizationEnergy">1st Ionization Energy (kJ/mol)</option>
                    <option value="meltingPoint">Melting Point (K)</option>
                    <option value="density">Density (g/cm³)</option>
                  </select>

                  {/* Graphical Data Interpretation Tool */}
                  {onOpenTrendGraph && (
                    <button
                      type="button"
                      onClick={onOpenTrendGraph}
                      className="flex items-center gap-1.5 px-2.5 py-1 rounded-md border text-xs font-mono font-medium transition-all cursor-pointer shadow-xs active:scale-95 bg-slate-50 dark:bg-[#121316] border-slate-200 dark:border-[#292c35] text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-[#22252c]"
                      title="Open interactive graphical interpretation & curve analysis"
                    >
                      <TrendingUp size={13} className="text-amber-500" />
                      <span>Graph Interpretation</span>
                    </button>
                  )}
                </div>

                {/* Gradient Legend */}
                {currentTrend && (
                  <div className="flex items-center gap-2 font-mono text-[10px] text-slate-500 dark:text-zinc-400 bg-slate-50 dark:bg-zinc-900 px-2.5 py-1 rounded-md border border-slate-200 dark:border-zinc-800 shrink-0">
                    <span>Min: {currentTrend.min}</span>
                    <div
                      className="w-20 sm:w-24 h-2 rounded-full border border-slate-300 dark:border-zinc-700"
                      style={{
                        background:
                          'linear-gradient(to right, hsl(210, 85%, 85%), hsl(140, 80%, 75%), hsl(60, 85%, 75%), hsl(0, 85%, 75%))',
                      }}
                    />
                    <span>Max: {currentTrend.max} {currentTrend.unit}</span>
                  </div>
                )}
              </div>
            ) : viewMode === 'state' ? (
              /* Thermal Scrubber & Clean State Color Legend - Stabilized Size */
              <div className="flex flex-wrap items-center justify-between w-full gap-2 sm:gap-3 font-mono">
                {/* Temperature Scrubber - Stabilized with fixed widths */}
                <div className="flex items-center gap-2 sm:gap-3 shrink-0">
                  <div className="flex items-center gap-1.5 text-xs text-slate-800 dark:text-zinc-200 tabular-nums shrink-0 w-[130px]">
                    <Thermometer size={14} className="text-amber-500 shrink-0" />
                    <span className="font-bold">{tempKelvin} K</span>
                    <span className="text-slate-400 dark:text-zinc-500 font-normal">
                      ({(tempKelvin - 273.15).toFixed(0)}°C)
                    </span>
                  </div>

                  <div className="w-36 sm:w-48 md:w-56 shrink-0">
                    <input
                      type="range"
                      min="0"
                      max="4000"
                      step="5"
                      value={tempKelvin}
                      onChange={(e) => onTempChange(Number(e.target.value))}
                      className="w-full accent-amber-500 cursor-pointer h-2 bg-slate-200 dark:bg-[#121316] border border-slate-300 dark:border-[#292c35] rounded-lg outline-none block"
                      title="Adjust temperature to observe state transitions"
                    />
                  </div>
                </div>

                {/* State Color Legend */}
                <div className="flex items-center gap-2.5 sm:gap-3 text-[11px] text-slate-600 dark:text-zinc-300 shrink-0">
                  <div className="flex items-center gap-1" title="Solid: Temperature < Melting Point">
                    <span className="w-2.5 h-2.5 rounded-xs inline-block bg-[#38bdf8] shadow-xs" />
                    <span className="font-medium">Solid</span>
                  </div>
                  <div className="flex items-center gap-1" title="Liquid: Melting Point ≤ Temperature < Boiling Point">
                    <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#f59e0b] shadow-xs" />
                    <span className="font-medium">Liquid</span>
                  </div>
                  <div className="flex items-center gap-1" title="Gas: Temperature ≥ Boiling Point">
                    <span className="w-2.5 h-2.5 rounded-full inline-block bg-[#f43f5e] shadow-xs" />
                    <span className="font-medium">Gas</span>
                  </div>
                  <div className="flex items-center gap-1" title="Unknown / Synthetic Elements">
                    <span className="w-2.5 h-2.5 rounded-xs inline-block bg-[#71717a]" />
                    <span className="font-medium text-slate-400 dark:text-zinc-500">Unknown</span>
                  </div>
                </div>
              </div>
            ) : viewMode === 'block' ? (
              /* Blocks Quick Filter */
              <div className="flex items-center justify-between w-full gap-2 font-mono text-xs">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-slate-500 dark:text-zinc-400 font-bold shrink-0">Subshell Block:</span>
                  {(['all', 's', 'p', 'd', 'f'] as const).map((b) => (
                    <button
                      key={b}
                      type="button"
                      onClick={() => onBlockChange(b)}
                      className={`px-2.5 py-0.5 rounded-md border transition-colors cursor-pointer text-xs ${
                        selectedBlock === b
                          ? 'border-zinc-900 bg-zinc-900 text-white dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                      }`}
                    >
                      {b.toUpperCase()}{b !== 'all' ? '-block' : ' (All)'}
                    </button>
                  ))}
                </div>
                <span className="text-[10px] text-slate-400 dark:text-zinc-500 hidden md:inline">
                  Valence subshell blocks: s (l=0), p (l=1), d (l=2), f (l=3)
                </span>
              </div>
            ) : (
              /* Families Category Filter - All Fit, Zero Slide/Scroll */
              <div className="flex items-center gap-1 w-full overflow-x-auto no-scrollbar sm:flex-wrap py-0.5 text-[10.5px]">
                <button
                  type="button"
                  onClick={() => onCategoryChange('all')}
                  className={`px-2 py-0.5 rounded-md border transition-colors whitespace-nowrap cursor-pointer ${
                    selectedCategory === 'all'
                      ? 'border-zinc-900 bg-zinc-900 dark:border-white dark:bg-white text-white dark:text-zinc-950 font-bold'
                      : 'border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-zinc-900 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  All
                </button>
                {Object.values(CATEGORIES).map((cat) => {
                  const shortLabel = CATEGORY_SHORT_LABELS[cat.id] || cat.label;
                  return (
                    <button
                      key={cat.id}
                      type="button"
                      onClick={() => onCategoryChange(selectedCategory === cat.id ? 'all' : cat.id)}
                      title={cat.label}
                      className={`px-1.5 py-0.5 rounded-md border transition-colors whitespace-nowrap flex items-center gap-1 cursor-pointer ${
                        selectedCategory === cat.id
                          ? 'border-zinc-900 dark:border-white text-slate-900 dark:text-white font-bold shadow-xs'
                          : 'border-slate-200 dark:border-zinc-800/80 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      style={{
                        backgroundColor: selectedCategory === cat.id ? cat.bgRgba.replace('0.09', '0.2') : (theme === 'dark' ? cat.darkBg : cat.bgRgba),
                        borderColor: selectedCategory === cat.id ? (theme === 'dark' ? cat.darkBorder : cat.color) : undefined,
                      }}
                    >
                      <span
                        className="w-1.5 h-1.5 rounded-full shrink-0"
                        style={{
                          backgroundColor: theme === 'dark' ? (cat.darkBorder || cat.color) : cat.color,
                          boxShadow: theme === 'dark' ? `0 0 6px ${cat.darkBorder || cat.color}` : 'none'
                        }}
                      />
                      <span>{shortLabel}</span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
