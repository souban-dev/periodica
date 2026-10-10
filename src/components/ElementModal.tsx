import React, { useState, useEffect } from 'react';
import { ElementData } from '../types/element';
import { CATEGORIES } from '../data/categories';
import { BohrAtom } from './BohrAtom';
import { getElementByNumber, getElementStateAtTemp } from '../data/elements';
import { STATE_METADATA } from '../data/states';
import { AUFBAU_EXCEPTIONS } from './QuantumOrbitalStudio';
import { X, ChevronLeft, ChevronRight, Scale, Info, Atom, Flame, Layers, Zap, Radiation } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface ElementModalProps {
  element: ElementData | null;
  tempKelvin: number;
  onClose: () => void;
  onSelectElement: (element: ElementData) => void;
  onCompareElement: (element: ElementData) => void;
  onOpenOrbitals?: (element: ElementData) => void;
  onOpenElectrochemistry?: (element: ElementData) => void;
  onOpenNuclear?: (element: ElementData) => void;
}

export const ElementModal: React.FC<ElementModalProps> = ({
  element,
  tempKelvin,
  onClose,
  onSelectElement,
  onCompareElement,
  onOpenOrbitals,
  onOpenElectrochemistry,
  onOpenNuclear,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [activeTab, setActiveTab] = useState<'overview' | 'atomic' | 'thermal' | 'spectrum'>('overview');
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => {
      setIsOpen(true);
    });
    return () => cancelAnimationFrame(raf);
  }, []);

  const handleSmoothClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 220);
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!element) return;
      if (e.key === 'Escape') {
        handleSmoothClose();
      } else if (e.key === 'ArrowLeft' && element.atomicNumber > 1) {
        const prev = getElementByNumber(element.atomicNumber - 1);
        if (prev) {
          onSelectElement(prev);
        }
      } else if (e.key === 'ArrowRight' && element.atomicNumber < 118) {
        const next = getElementByNumber(element.atomicNumber + 1);
        if (next) {
          onSelectElement(next);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [element, isClosing, onSelectElement]);

  if (!element) return null;

  const categoryMeta = CATEGORIES[element.category];
  const currentState = getElementStateAtTemp(element, tempKelvin);

  const prevElement = element.atomicNumber > 1 ? getElementByNumber(element.atomicNumber - 1) : null;
  const nextElement = element.atomicNumber < 118 ? getElementByNumber(element.atomicNumber + 1) : null;

  const meltK = element.meltingPoint;
  const boilK = element.boilingPoint;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 transition-all duration-300 ease-out ${
        isOpen && !isClosing
          ? 'bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm opacity-100'
          : 'bg-slate-900/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleSmoothClose();
      }}
    >
      <div
        className={`relative w-full max-w-4xl lg:max-w-5xl max-h-[92vh] overflow-y-auto overflow-x-hidden rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] shadow-2xl flex flex-col text-slate-800 dark:text-slate-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          isOpen && !isClosing
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-3'
        }`}
        style={{
          borderColor: isDark ? (categoryMeta.darkBorder || categoryMeta.color) : categoryMeta.borderHex,
          boxShadow: isDark ? (categoryMeta.darkGlow || '0 0 25px rgba(255,255,255,0.1)') : undefined,
        }}
      >
        {/* Sticky Header Wrapper: Keeps both Top Header & Tab Navigation pinned together so tabs NEVER hide behind the header */}
        <div className="sticky top-0 z-30 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md border-b border-slate-200 dark:border-zinc-800 w-full max-w-full shadow-xs relative">
          {/* Prominent Cross / Close Option at the top right corner */}
          <button
            type="button"
            onClick={handleSmoothClose}
            className="absolute top-3 right-3 sm:top-3.5 sm:right-4 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-zinc-700 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
            aria-label="Close dossier"
            title="Close dossier (Esc)"
          >
            <X size={20} className="stroke-[2.2]" />
          </button>

          {/* Top Header Bar */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-4 sm:px-6 py-3 sm:py-4 pr-14 sm:pr-16 md:pr-16 border-b border-slate-100 dark:border-zinc-800/80 w-full max-w-full">
            <div className="flex items-center gap-3 sm:gap-4 min-w-0 max-w-full">
              {/* Prominent, enlarged element badge so users clearly see the element details and click target */}
              <div
                className="w-14 h-14 sm:w-16 sm:h-16 rounded-2xl font-mono font-bold flex flex-col items-center justify-center border-2 shadow-md transition-transform duration-200 hover:scale-105 shrink-0 select-none"
                style={{
                  backgroundColor: isDark ? (categoryMeta.darkBg || 'rgba(18,18,20,0.85)') : categoryMeta.bgRgba,
                  borderColor: isDark ? (categoryMeta.darkBorder || categoryMeta.color) : categoryMeta.borderHex,
                  color: isDark ? (categoryMeta.darkText || categoryMeta.borderHex) : categoryMeta.textHex,
                  boxShadow: isDark ? (categoryMeta.darkGlow || '0 0 16px rgba(255,255,255,0.12)') : '0 4px 12px rgba(0,0,0,0.06)',
                }}
              >
                <span className="text-[9px] sm:text-[10px] font-semibold opacity-75 leading-none">#{element.atomicNumber}</span>
                <span className="text-2xl sm:text-3xl leading-none mt-0.5 tracking-tight">{element.symbol}</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
                  <h1 className="text-xl sm:text-2xl font-bold font-mono tracking-tight text-slate-900 dark:text-white truncate">
                    {element.name}
                  </h1>
                  <span
                    className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-md border whitespace-nowrap"
                    style={{
                      backgroundColor: isDark ? (categoryMeta.darkBg || 'rgba(18,18,20,0.85)') : categoryMeta.bgRgba,
                      borderColor: isDark ? (categoryMeta.darkBorder || categoryMeta.color) : categoryMeta.borderHex,
                      color: isDark ? (categoryMeta.darkText || categoryMeta.borderHex) : categoryMeta.textHex,
                    }}
                  >
                    {categoryMeta.label}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-zinc-400 mt-1 font-mono">
                  <span>Period {element.period}</span>
                  <span className="text-slate-300 dark:text-zinc-700">/</span>
                  <span>Group {element.group}</span>
                  <span className="text-slate-300 dark:text-zinc-700">/</span>
                  <span>{element.block}-block</span>
                </div>
              </div>
            </div>

            {/* Quick Action buttons in header with clean horizontal scroll if needed */}
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0 overflow-x-auto no-scrollbar scrollbar-none py-0.5">
              {onOpenOrbitals && (
                <button
                  type="button"
                  onClick={() => {
                    handleSmoothClose();
                    onOpenOrbitals(element);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-zinc-800 dark:text-zinc-200 hover:text-zinc-900 bg-zinc-100 dark:bg-zinc-800 hover:bg-zinc-200 dark:hover:bg-zinc-700 border border-zinc-200 dark:border-zinc-700 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                  title="Explore 3D Quantum Orbitals & Aufbau"
                >
                  <Atom size={14} className="text-zinc-600 dark:text-zinc-300" />
                  <span>Orbitals 3D</span>
                </button>
              )}
              {onOpenElectrochemistry && (
                <button
                  type="button"
                  onClick={() => {
                    handleSmoothClose();
                    onOpenElectrochemistry(element);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 hover:text-amber-900 bg-amber-50 dark:bg-amber-950/50 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-200 dark:border-amber-800 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                  title="Explore Standard Electrode Potentials & Redox Reactions"
                >
                  <Zap size={14} className="text-amber-600 dark:text-amber-400" />
                  <span>Redox E°</span>
                </button>
              )}
              {onOpenNuclear && (
                <button
                  type="button"
                  onClick={() => {
                    handleSmoothClose();
                    onOpenNuclear(element);
                  }}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 hover:text-emerald-900 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 border border-emerald-200 dark:border-emerald-800 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
                  title="Explore Isotopes, Radioactive Decay & Half-Life"
                >
                  <Radiation size={14} className="text-emerald-600 dark:text-emerald-400" />
                  <span>Nuclear</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => {
                  handleSmoothClose();
                  onCompareElement(element);
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:text-slate-900 bg-slate-100 dark:bg-zinc-800 hover:bg-slate-200 dark:hover:bg-zinc-700 border border-slate-300 dark:border-zinc-700 rounded-lg transition-colors cursor-pointer shadow-xs active:scale-95 whitespace-nowrap"
              >
                <Scale size={14} />
                <span>Compare</span>
              </button>
            </div>
          </div>

          {/* Tab Navigation - Fully visible, never hidden behind header, with generous padding so Spectrum tab is completely revealed */}
          <div className="w-full max-w-full overflow-x-auto overscroll-x-contain touch-pan-x scrollbar-none bg-slate-50/90 dark:bg-[#09090b]/90 text-xs sm:text-sm px-4 sm:px-6 py-2 select-none">
            <div className="flex items-center gap-2 min-w-max pr-8">
              <button
                type="button"
                onClick={() => setActiveTab('overview')}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:py-2 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'overview'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs'
                    : 'bg-white dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <Info size={14} className="shrink-0" />
                <span>Overview</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('atomic')}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:py-2 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'atomic'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs'
                    : 'bg-white dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <Atom size={14} className="shrink-0" />
                <span>3D Orbitals</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('thermal')}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:py-2 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'thermal'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs'
                    : 'bg-white dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <Flame size={14} className="shrink-0" />
                <span>Thermodynamics</span>
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('spectrum')}
                className={`shrink-0 whitespace-nowrap flex items-center gap-1.5 sm:gap-2 px-3.5 py-1.5 sm:py-2 rounded-lg font-medium transition-all cursor-pointer ${
                  activeTab === 'spectrum'
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 font-bold shadow-xs'
                    : 'bg-white dark:bg-zinc-900/80 text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white border border-slate-200 dark:border-zinc-800'
                }`}
              >
                <Layers size={14} className="shrink-0" />
                <span>Spectrum</span>
              </button>
            </div>
          </div>
        </div>

        {/* Tab Body Contents */}
        <div key={`${element.atomicNumber}-${activeTab}`} className="p-4 sm:p-7 flex-1 space-y-5 w-full max-w-full min-w-0 overflow-x-hidden animate-in fade-in duration-200">
          {activeTab === 'overview' && (
            <div className="space-y-5">
              {/* Summary text */}
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70 leading-relaxed text-sm sm:text-base text-slate-700 dark:text-slate-200 shadow-xs">
                <p>{element.summary}</p>
              </div>

              {/* High-level specs grid */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-xs">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">Standard Weight</div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                    {element.atomicMass} <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">u</span>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-xs">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">Room State (298K)</div>
                  <div className="flex items-center gap-2 mt-1">
                    <span
                      className="w-3 h-3 rounded-full shrink-0 shadow-xs"
                      style={{ backgroundColor: STATE_METADATA[element.stateAt298K]?.color || '#71717a' }}
                    />
                    <span className="text-lg sm:text-xl font-bold font-mono capitalize text-slate-900 dark:text-white">
                      {element.stateAt298K}
                    </span>
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-xs">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">Discovered</div>
                  <div className="text-lg sm:text-xl font-bold font-mono text-slate-900 dark:text-white mt-1">
                    {element.yearDiscovered}
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-xs">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">Discovered By</div>
                  <div className="text-sm sm:text-base font-semibold text-slate-800 dark:text-slate-200 mt-1 line-clamp-2">
                    {element.discoveredBy}
                  </div>
                </div>
              </div>

              {/* Real-World Key Applications */}
              <div>
                <h3 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                  Primary Real-World Applications
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                  {element.applications.map((app, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-950/70 text-xs sm:text-sm text-slate-700 dark:text-slate-200 font-medium"
                    >
                      <span
                        className="w-2 h-2 rounded-full shrink-0"
                        style={{
                          backgroundColor: isDark ? (categoryMeta.darkBorder || categoryMeta.color) : categoryMeta.color,
                          boxShadow: isDark ? `0 0 8px ${categoryMeta.darkBorder || categoryMeta.color}` : 'none'
                        }}
                      />
                      <span>{app}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'atomic' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-center">
              <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70">
                <BohrAtom element={element} size={220} />
                <div className="text-xs text-slate-600 dark:text-slate-400 mt-3 text-center font-mono flex items-center justify-center gap-1.5 whitespace-nowrap overflow-x-auto scrollbar-none px-1">
                  <span className="shrink-0 text-slate-500 dark:text-zinc-400">Shell Electrons:</span>
                  <strong className="text-slate-900 dark:text-white font-bold tracking-tight">{element.shells.join(' · ')}</strong>
                </div>
                {onOpenOrbitals && (
                  <button
                    type="button"
                    onClick={() => {
                      onClose();
                      onOpenOrbitals(element);
                    }}
                    className="w-full mt-3 py-2 px-3.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-950 font-mono text-xs font-bold flex items-center justify-center gap-2 shadow-xs transition-colors cursor-pointer active:scale-98"
                  >
                    <Atom size={14} />
                    <span>Launch 3D Quantum Studio ↗</span>
                  </button>
                )}
              </div>

              <div className="lg:col-span-7 grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3 text-xs">
                {/* Electron Configuration Cell - Single Line */}
                <div className="sm:col-span-2 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900/90 flex items-center justify-between gap-2 shadow-xs min-h-[46px]">
                  <div className="flex items-center gap-1.5 shrink-0">
                    <span className="text-slate-500 dark:text-zinc-400 font-mono text-[11px] uppercase tracking-wider whitespace-nowrap">Electron Config</span>
                    {AUFBAU_EXCEPTIONS[element.atomicNumber] && (
                      <span
                        className="px-1.5 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 font-mono text-[9px] font-bold border border-amber-300 dark:border-amber-700 whitespace-nowrap cursor-help"
                        title={`Aufbau Exception: ${AUFBAU_EXCEPTIONS[element.atomicNumber].shiftSummary} — ${AUFBAU_EXCEPTIONS[element.atomicNumber].note}`}
                      >
                        ⚡ Exception
                      </span>
                    )}
                  </div>
                  <span className="font-mono text-xs sm:text-sm font-bold text-zinc-900 dark:text-zinc-100 tracking-tight whitespace-nowrap overflow-x-auto scrollbar-none text-right">
                    {element.electronConfiguration}
                  </span>
                </div>

                {/* Valence Electrons Cell - Fits strictly on ONE line */}
                <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 flex items-center justify-between gap-2 shadow-xs min-h-[46px]">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider whitespace-nowrap">Valence Electrons</span>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white tabular-nums shrink-0">{element.valenceElectrons}</span>
                </div>

                {/* Oxidation States Cell - Single Line */}
                <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 flex items-center justify-between gap-2 shadow-xs min-h-[46px]">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider whitespace-nowrap">Oxidation States</span>
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white shrink-0">{element.oxidationStates}</span>
                </div>

                {/* Electronegativity Cell - Single Line */}
                <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 flex items-center justify-between gap-2 shadow-xs min-h-[46px]">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider whitespace-nowrap">Electronegativity</span>
                  <span className="font-mono text-base font-bold text-slate-900 dark:text-white shrink-0">{element.electronegativity ?? 'None'}</span>
                </div>

                {/* Atomic Radius Cell - Single Line */}
                <div className="p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 flex items-center justify-between gap-2 shadow-xs min-h-[46px]">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider whitespace-nowrap">Atomic Radius</span>
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white shrink-0">
                    {element.atomicRadius ? `${element.atomicRadius} pm` : 'N/A'}
                  </span>
                </div>

                {/* 1st Ionization Energy Cell - Single Line */}
                <div className="sm:col-span-2 p-3 sm:p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 flex items-center justify-between gap-2 shadow-xs min-h-[46px]">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono uppercase tracking-wider whitespace-nowrap">1st Ionization Energy</span>
                  <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white shrink-0">
                    {element.ionizationEnergy ? `${element.ionizationEnergy} kJ/mol` : 'Unknown'}
                  </span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'thermal' && (
            <div className="space-y-5">
              <div className="p-4 sm:p-5 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/70">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs sm:text-sm font-mono mb-3">
                  <span className="text-slate-600 dark:text-zinc-400">
                    Simulation Temperature:{' '}
                    <strong className="text-amber-500 font-bold text-base">{tempKelvin} K</strong> ({(tempKelvin - 273.15).toFixed(1)}°C)
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-500 dark:text-zinc-400 text-xs">Phase at {tempKelvin}K:</span>
                    <span
                      className="px-2.5 py-1 rounded-md font-bold font-mono text-xs uppercase shadow-xs flex items-center gap-2"
                      style={{
                        backgroundColor: theme === 'dark' ? STATE_METADATA[currentState]?.darkBg : STATE_METADATA[currentState]?.bgRgba,
                        color: theme === 'dark' ? STATE_METADATA[currentState]?.darkText : STATE_METADATA[currentState]?.textHex,
                        border: `1px solid ${theme === 'dark' ? STATE_METADATA[currentState]?.darkBorder : STATE_METADATA[currentState]?.borderHex}`,
                      }}
                    >
                      <span
                        className="w-2.5 h-2.5 rounded-full shadow-xs"
                        style={{ backgroundColor: STATE_METADATA[currentState]?.color }}
                      />
                      {currentState} [{STATE_METADATA[currentState]?.shortLabel}]
                    </span>
                  </div>
                </div>

                {/* Temperature Line Diagram */}
                <div className="relative h-9 bg-slate-200 dark:bg-slate-900 rounded-xl overflow-hidden flex items-center mt-3 border border-slate-300 dark:border-slate-700 shadow-inner">
                  {meltK !== null && (
                    <div
                      className="h-full bg-sky-200 dark:bg-sky-950/80 border-r border-sky-400 dark:border-sky-800 flex items-center justify-center text-xs font-mono text-sky-800 dark:text-sky-300 font-bold"
                      style={{ width: `${Math.min(90, Math.max(10, (meltK / 4000) * 100))}%` }}
                    >
                      Solid
                    </div>
                  )}
                  {meltK !== null && boilK !== null && (
                    <div
                      className="h-full bg-amber-200 dark:bg-amber-950/80 border-r border-amber-400 dark:border-amber-800 flex items-center justify-center text-xs font-mono text-amber-800 dark:text-amber-300 font-bold"
                      style={{ width: `${Math.min(90, Math.max(10, ((boilK - meltK) / 4000) * 100))}%` }}
                    >
                      Liquid
                    </div>
                  )}
                  <div className="flex-1 h-full bg-purple-200 dark:bg-purple-950/80 flex items-center justify-center text-xs font-mono text-purple-800 dark:text-purple-300 font-bold">
                    Gas
                  </div>
                </div>

                <div className="flex justify-between text-xs font-mono text-slate-600 dark:text-slate-400 mt-2.5">
                  <span>
                    Melting Point:{' '}
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {meltK ? `${meltK} K (${(meltK - 273.15).toFixed(1)}°C)` : 'Unknown'}
                    </strong>
                  </span>
                  <span>
                    Boiling Point:{' '}
                    <strong className="text-slate-900 dark:text-white font-semibold">
                      {boilK ? `${boilK} K (${(boilK - 273.15).toFixed(1)}°C)` : 'Unknown'}
                    </strong>
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-xs">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">Density @ STP</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                    {element.density ? `${element.density} g/cm³` : 'Unknown'}
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-xs">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">Melting Point</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                    {element.meltingPoint ? `${element.meltingPoint} K` : '—'}
                  </div>
                </div>

                <div className="p-3.5 sm:p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/70 shadow-xs">
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 uppercase font-mono tracking-wider">Boiling Point</div>
                  <div className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white mt-1 tabular-nums">
                    {element.boilingPoint ? `${element.boilingPoint} K` : '—'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'spectrum' && (
            <div className="space-y-4">
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                Visible atomic emission spectrum representation. Photons are emitted at quantized wavelengths as excited electrons decay to lower orbitals.
              </p>

              <div className="relative h-14 bg-slate-950 rounded-2xl border border-slate-300 dark:border-slate-700 flex items-center overflow-hidden shadow-inner">
                {element.spectralHex.map((hex, i) => (
                  <div
                    key={i}
                    className="absolute top-0 bottom-0 w-1.5 shadow-sm"
                    style={{
                      left: `${15 + i * (70 / Math.max(1, element.spectralHex.length - 1))}%`,
                      backgroundColor: hex,
                    }}
                  />
                ))}
              </div>

              <div className="flex justify-between text-[10px] sm:text-xs font-mono text-slate-500 dark:text-slate-400 flex-wrap gap-1">
                <span>380 nm (Near UV)</span>
                <span>Visible Spectrum (400–700 nm)</span>
                <span>750 nm (Near IR)</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer Navigation */}
        <div className="flex items-center justify-between px-5 sm:px-6 py-3.5 border-t border-slate-200 dark:border-zinc-800 bg-slate-50 dark:bg-[#0c0c0e] text-xs sm:text-sm">
          {prevElement ? (
            <button
              type="button"
              onClick={() => {
                onSelectElement(prevElement);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-medium shadow-2xs"
            >
              <ChevronLeft size={15} />
              <span>#{prevElement.atomicNumber} {prevElement.name}</span>
            </button>
          ) : (
            <div />
          )}

          <div className="text-slate-400 dark:text-zinc-500 text-[10px] font-mono hidden sm:block">
            Use Left / Right arrow keys
          </div>

          {nextElement ? (
            <button
              type="button"
              onClick={() => {
                onSelectElement(nextElement);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer font-medium shadow-2xs"
            >
              <span>#{nextElement.atomicNumber} {nextElement.name}</span>
              <ChevronRight size={15} />
            </button>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
};
