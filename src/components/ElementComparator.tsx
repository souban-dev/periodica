import React, { useState, useMemo, useRef, useEffect } from 'react';
import { ElementData } from '../types/element';
import { ELEMENTS } from '../data/elements';
import { CATEGORIES } from '../data/categories';
import { BohrAtom } from './BohrAtom';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  ArrowRightLeft,
  Search,
  ChevronDown,
  Sparkles,
  TrendingUp,
  TrendingDown,
  Check,
} from 'lucide-react';

interface ElementComparatorProps {
  initialElementA: ElementData;
  initialElementB?: ElementData;
  onClose: () => void;
}

const COMPARISON_PRESETS: { label: string; symbolA: string; symbolB: string; description: string }[] = [
  { label: 'C vs Si', symbolA: 'C', symbolB: 'Si', description: 'Group 14 Organic vs Semiconductor' },
  { label: 'Na vs K', symbolA: 'Na', symbolB: 'K', description: 'Group 1 Alkali Reactivity & Hydration' },
  { label: 'F vs Cl', symbolA: 'F', symbolB: 'Cl', description: 'Halogen Electronegativity Drop' },
  { label: 'Fe vs Cu', symbolA: 'Fe', symbolB: 'Cu', description: 'Classic Transition Metal Redox Couple' },
  { label: 'Au vs Pt', symbolA: 'Au', symbolB: 'Pt', description: 'Noble Precious Metals Resistance' },
  { label: 'Li vs Pb', symbolA: 'Li', symbolB: 'Pb', description: 'Battery Extremes (Lightest vs Heavy)' },
];

/**
 * Modern floating dropdown component positioned directly beneath the select trigger.
 * Replaces the clunky native browser <select> with a searchable, styled floating menu.
 */
interface ModernElementDropdownProps {
  label: string;
  selectedElement: ElementData;
  onSelect: (element: ElementData) => void;
}

const ModernElementDropdown: React.FC<ModernElementDropdownProps> = ({
  label,
  selectedElement,
  onSelect,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const meta = CATEGORIES[selectedElement.category];

  // Close when clicking outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      // Auto-focus search input when opened
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isOpen]);

  // Filter elements by search
  const filteredElements = useMemo(() => {
    if (!search.trim()) return ELEMENTS;
    const q = search.toLowerCase().trim();
    return ELEMENTS.filter(
      (el) =>
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        el.atomicNumber.toString() === q
    );
  }, [search]);

  return (
    <div ref={dropdownRef} className="relative w-full text-left">
      <label className="block text-[11px] font-mono font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-1">
        {label}
      </label>

      {/* Modern Dropdown Trigger Button */}
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setSearch('');
        }}
        className={`w-full bg-white dark:bg-[#0c0c0e] hover:bg-slate-50 dark:hover:bg-zinc-900 border border-slate-200 dark:border-zinc-800 rounded-xl px-3 py-2 flex items-center justify-between transition-all cursor-pointer shadow-xs outline-none ${
          isOpen
            ? 'border-zinc-400 ring-2 ring-zinc-500/20 dark:border-zinc-600 shadow-md'
            : 'hover:border-slate-300 dark:hover:border-zinc-700'
        }`}
      >
        <div className="flex items-center gap-2.5 truncate">
          <span
            className="w-7 h-7 rounded-lg font-mono font-bold text-xs flex items-center justify-center border shrink-0"
            style={{
              backgroundColor: isDark ? (meta.darkBg || 'rgba(18,18,20,0.85)') : meta.bgRgba,
              borderColor: isDark ? (meta.darkBorder || meta.color) : meta.borderHex,
              color: isDark ? (meta.darkText || meta.borderHex) : meta.textHex,
              boxShadow: isDark ? meta.darkGlow : 'none',
            }}
          >
            {selectedElement.symbol}
          </span>
          <div className="truncate text-left leading-tight">
            <div className="font-mono text-xs font-bold text-slate-900 dark:text-white truncate">
              #{selectedElement.atomicNumber} {selectedElement.name}
            </div>
            <div className="text-[10.5px] text-slate-500 dark:text-zinc-400 font-mono truncate">
              {meta.label} · {selectedElement.atomicMass} u
            </div>
          </div>
        </div>

        <ChevronDown
          size={16}
          className={`text-slate-400 dark:text-zinc-500 transition-transform duration-200 shrink-0 ml-1.5 ${
            isOpen ? 'rotate-180 text-zinc-900 dark:text-white' : ''
          }`}
        />
      </button>

      {/* Floating Menu positioned directly beneath trigger */}
      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 z-50 bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 rounded-xl shadow-2xl overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-150 max-h-[310px]">
          {/* Internal Quick Search Bar */}
          <div className="p-2 border-b border-slate-100 dark:border-zinc-800 bg-slate-50/70 dark:bg-zinc-900/80">
            <div className="relative flex items-center">
              <Search size={13} className="absolute left-2.5 text-slate-400 dark:text-zinc-500" />
              <input
                ref={searchInputRef}
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search symbol, name, or #..."
                className="w-full pl-8 pr-3 py-1.5 text-xs font-mono bg-white dark:bg-black/60 border border-slate-200 dark:border-zinc-700 rounded-lg outline-none focus:border-zinc-400 dark:focus:border-zinc-500 text-slate-800 dark:text-zinc-100 placeholder-slate-400 dark:placeholder-zinc-500"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => setSearch('')}
                  className="absolute right-2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-200 text-xs"
                >
                  ✕
                </button>
              )}
            </div>
          </div>

          {/* Scrollable Element Choices */}
          <div className="overflow-y-auto p-1 divide-y divide-slate-100/60 dark:divide-zinc-800/60 max-h-[240px]">
            {filteredElements.length === 0 ? (
              <div className="p-4 text-center text-xs font-mono text-slate-400">
                No matching elements
              </div>
            ) : (
              filteredElements.map((el) => {
                const elMeta = CATEGORIES[el.category];
                const isCurrent = el.atomicNumber === selectedElement.atomicNumber;
                return (
                  <button
                    key={el.atomicNumber}
                    type="button"
                    onClick={() => {
                      onSelect(el);
                      setIsOpen(false);
                    }}
                    className={`w-full px-2.5 py-1.5 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer text-xs ${
                      isCurrent
                        ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-950 dark:text-white font-bold'
                        : 'hover:bg-slate-50 dark:hover:bg-zinc-800/80 text-slate-700 dark:text-zinc-300'
                    }`}
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span
                        className="w-6 h-6 rounded-md font-mono font-bold text-[10.5px] flex items-center justify-center border shrink-0"
                        style={{
                          backgroundColor: isDark ? (elMeta.darkBg || 'rgba(18,18,20,0.85)') : elMeta.bgRgba,
                          borderColor: isDark ? (elMeta.darkBorder || elMeta.color) : elMeta.borderHex,
                          color: isDark ? (elMeta.darkText || elMeta.borderHex) : elMeta.textHex,
                        }}
                      >
                        {el.symbol}
                      </span>
                      <span className="font-mono text-slate-900 dark:text-zinc-100 truncate">
                        #{el.atomicNumber} {el.name}
                      </span>
                    </div>

                    <span className="text-[10px] font-mono text-slate-400 dark:text-zinc-500 uppercase shrink-0 ml-2">
                      {el.block}-block
                    </span>

                    {isCurrent && (
                      <Check size={14} className="text-zinc-900 dark:text-zinc-100 shrink-0 ml-2" />
                    )}
                  </button>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const ElementComparator: React.FC<ElementComparatorProps> = ({
  initialElementA,
  initialElementB,
  onClose,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [elementA, setElementA] = useState<ElementData>(initialElementA);
  const [elementB, setElementB] = useState<ElementData>(
    initialElementB ||
      ELEMENTS.find((e) => e.atomicNumber === (initialElementA.atomicNumber === 6 ? 14 : 6)) ||
      ELEMENTS[0]
  );

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsOpen(true));
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
      if (e.key === 'Escape') handleSmoothClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isClosing]);

  const swapElements = () => {
    const temp = elementA;
    setElementA(elementB);
    setElementB(temp);
  };

  const metaA = CATEGORIES[elementA.category];
  const metaB = CATEGORIES[elementB.category];

  const metrics = [
    {
      label: 'Atomic Number (Z)',
      valA: elementA.atomicNumber,
      valB: elementB.atomicNumber,
      unit: '',
      numeric: true,
    },
    {
      label: 'Atomic Mass',
      valA: elementA.atomicMass,
      valB: elementB.atomicMass,
      unit: 'u',
      numeric: true,
    },
    {
      label: 'Electronegativity (Pauling)',
      valA: elementA.electronegativity ?? null,
      valB: elementB.electronegativity ?? null,
      unit: '',
      numeric: true,
    },
    {
      label: 'Atomic Radius',
      valA: elementA.atomicRadius ?? null,
      valB: elementB.atomicRadius ?? null,
      unit: 'pm',
      numeric: true,
    },
    {
      label: '1st Ionization Energy',
      valA: elementA.ionizationEnergy ?? null,
      valB: elementB.ionizationEnergy ?? null,
      unit: 'kJ/mol',
      numeric: true,
    },
    {
      label: 'Density',
      valA: elementA.density ?? null,
      valB: elementB.density ?? null,
      unit: 'g/cm³',
      numeric: true,
    },
    {
      label: 'Melting Point',
      valA: elementA.meltingPoint ?? null,
      valB: elementB.meltingPoint ?? null,
      unit: 'K',
      numeric: true,
    },
    {
      label: 'Boiling Point',
      valA: elementA.boilingPoint ?? null,
      valB: elementB.boilingPoint ?? null,
      unit: 'K',
      numeric: true,
    },
    {
      label: 'Valence Block',
      valA: `${elementA.block.toUpperCase()}-block`,
      valB: `${elementB.block.toUpperCase()}-block`,
      unit: '',
      numeric: false,
    },
    {
      label: 'Period & Group',
      valA: `Period ${elementA.period}, Group ${elementA.group}`,
      valB: `Period ${elementB.period}, Group ${elementB.group}`,
      unit: '',
      numeric: false,
    },
    {
      label: 'Electron Configuration',
      valA: elementA.electronConfiguration,
      valB: elementB.electronConfiguration,
      unit: '',
      numeric: false,
    },
    {
      label: 'Electron Shells',
      valA: elementA.shells.join(' · '),
      valB: elementB.shells.join(' · '),
      unit: '',
      numeric: false,
    },
  ];

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
        className={`relative w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] shadow-2xl flex flex-col text-slate-800 dark:text-slate-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          isOpen && !isClosing
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-3'
        }`}
      >
        {/* Sticky Header */}
        <div className="sticky top-0 z-30 flex items-center justify-between px-5 py-3.5 bg-white/95 dark:bg-[#0c0c0e]/95 border-b border-slate-200 dark:border-zinc-800 backdrop-blur">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 flex items-center justify-center shadow-xs">
              <ArrowRightLeft size={16} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-mono tracking-tight text-slate-900 dark:text-white">
                  Element Comparison Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px] font-bold">
                  Side-by-Side Lab
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400 font-mono">
                Compare atomic radii, ionization energies, electron configurations, and periodic metrics
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSmoothClose}
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-zinc-800 rounded-md transition-colors cursor-pointer"
            title="Close comparator"
          >
            <X size={18} />
          </button>
        </div>

        <div className="p-4 sm:p-6 space-y-5">
          {/* Quick Presets Bar */}
          <div className="flex flex-wrap items-center gap-1.5 p-2 rounded-xl bg-slate-50 dark:bg-[#09090b] border border-slate-200 dark:border-zinc-800 text-xs font-mono">
            <span className="text-slate-400 dark:text-zinc-500 text-[11px] font-bold px-1 uppercase tracking-wider flex items-center gap-1">
              <Sparkles size={12} className="text-amber-500" /> Presets:
            </span>
            {COMPARISON_PRESETS.map((preset) => (
              <button
                key={preset.label}
                type="button"
                onClick={() => {
                  const elA = ELEMENTS.find((e) => e.symbol === preset.symbolA);
                  const elB = ELEMENTS.find((e) => e.symbol === preset.symbolB);
                  if (elA && elB) {
                    setElementA(elA);
                    setElementB(elB);
                  }
                }}
                className={`px-2.5 py-1 rounded-lg border transition-all cursor-pointer font-medium ${
                  (elementA.symbol === preset.symbolA && elementB.symbol === preset.symbolB) ||
                  (elementA.symbol === preset.symbolB && elementB.symbol === preset.symbolA)
                    ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 border-zinc-900 dark:border-white shadow-xs font-bold'
                    : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
                }`}
                title={preset.description}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Dual Element Cards with TRADITIONAL DROPDOWN PLACEMENT */}
          <div className="grid grid-cols-1 md:grid-cols-11 gap-4 items-center">
            {/* ELEMENT A CARD */}
            <div
              className="md:col-span-5 p-4 rounded-2xl border-2 flex flex-col items-center text-center shadow-xs transition-colors duration-300"
              style={{
                backgroundColor: isDark ? (metaA.darkBg || 'rgba(18, 18, 20, 0.85)') : metaA.bgRgba,
                borderColor: isDark ? (metaA.darkBorder || metaA.color) : metaA.borderHex,
                boxShadow: isDark ? metaA.darkGlow : undefined,
              }}
            >
              {/* Traditional Dropdown Placement: Right at top of card */}
              <div className="w-full mb-3">
                <ModernElementDropdown
                  label="Element A"
                  selectedElement={elementA}
                  onSelect={(el) => setElementA(el)}
                />
              </div>

              {/* Bohr Visualizer */}
              <div className="my-1.5 p-2 bg-white/75 dark:bg-black/60 rounded-xl border border-slate-200/60 dark:border-zinc-800 shadow-2xs">
                <BohrAtom element={elementA} size={135} />
              </div>

              <div className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-1">
                {elementA.name} [{elementA.symbol}]
              </div>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-3 py-1 rounded-lg border border-slate-300 dark:border-zinc-700 shadow-xs mt-1.5 tracking-tight select-all">
                {elementA.electronConfiguration}
              </span>
            </div>

            {/* SWAP BUTTON */}
            <div className="md:col-span-1 flex justify-center">
              <button
                type="button"
                onClick={swapElements}
                className="p-3 rounded-full border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 hover:bg-slate-100 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white transition-all cursor-pointer shadow-md hover:scale-110 active:rotate-180"
                title="Swap Element A and Element B"
              >
                <ArrowRightLeft size={16} />
              </button>
            </div>

            {/* ELEMENT B CARD */}
            <div
              className="md:col-span-5 p-4 rounded-2xl border-2 flex flex-col items-center text-center shadow-xs transition-colors duration-300"
              style={{
                backgroundColor: isDark ? (metaB.darkBg || 'rgba(18, 18, 20, 0.85)') : metaB.bgRgba,
                borderColor: isDark ? (metaB.darkBorder || metaB.color) : metaB.borderHex,
                boxShadow: isDark ? metaB.darkGlow : undefined,
              }}
            >
              {/* Traditional Dropdown Placement: Right at top of card */}
              <div className="w-full mb-3">
                <ModernElementDropdown
                  label="Element B"
                  selectedElement={elementB}
                  onSelect={(el) => setElementB(el)}
                />
              </div>

              {/* Bohr Visualizer */}
              <div className="my-1.5 p-2 bg-white/75 dark:bg-black/60 rounded-xl border border-slate-200/60 dark:border-zinc-800 shadow-2xs">
                <BohrAtom element={elementB} size={135} />
              </div>

              <div className="font-mono text-sm font-bold text-slate-900 dark:text-white mt-1">
                {elementB.name} [{elementB.symbol}]
              </div>
              <span className="text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 bg-white dark:bg-zinc-900 px-3 py-1 rounded-lg border border-slate-300 dark:border-zinc-700 shadow-xs mt-1.5 tracking-tight select-all">
                {elementB.electronConfiguration}
              </span>
            </div>
          </div>

          {/* ========================================================================= */}
          {/* COMPARATIVE METRICS TABLE                                                 */}
          {/* ========================================================================= */}
          <div className="rounded-2xl border border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e] overflow-hidden shadow-xs">
            <div className="px-4 py-2.5 bg-slate-50/80 dark:bg-[#09090b] border-b border-slate-200 dark:border-zinc-800 flex items-center justify-between text-xs font-mono">
              <span className="font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider text-[11px]">
                Quantitative Properties & Metrics Comparison
              </span>
              <span className="text-slate-400 dark:text-slate-500 text-[10px]">
                Δ = Absolute Difference between Element A & B
              </span>
            </div>

            <table className="w-full text-xs text-left">
              <thead className="bg-slate-100/70 dark:bg-zinc-900/90 border-b border-slate-200 dark:border-zinc-800 text-slate-500 dark:text-zinc-400 uppercase font-mono text-[10.5px]">
                <tr>
                  <th className="py-2.5 px-4 font-bold">Chemical Metric</th>
                  <th
                    className="py-2.5 px-4 font-bold text-center"
                    style={{ color: isDark ? (metaA.darkText || metaA.borderHex) : metaA.textHex }}
                  >
                    {elementA.symbol} ({elementA.name})
                  </th>
                  <th
                    className="py-2.5 px-4 font-bold text-center"
                    style={{ color: isDark ? (metaB.darkText || metaB.borderHex) : metaB.textHex }}
                  >
                    {elementB.symbol} ({elementB.name})
                  </th>
                  <th className="py-2.5 px-4 font-bold text-center text-slate-400 dark:text-zinc-500">
                    Comparative Delta (Δ)
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-zinc-800/60 font-mono text-xs">
                {metrics.map((row, i) => {
                  let deltaDisplay: React.ReactNode = '—';
                  let aWins = false;
                  let bWins = false;

                  if (row.numeric && typeof row.valA === 'number' && typeof row.valB === 'number') {
                    const diff = Number((row.valA - row.valB).toFixed(2));
                    const absDiff = Math.abs(diff);

                    if (diff > 0) {
                      aWins = true;
                      deltaDisplay = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/70 px-2 py-0.5 rounded-md border border-emerald-200 dark:border-emerald-800">
                          <TrendingUp size={11} /> {elementA.symbol} +{absDiff} {row.unit}
                        </span>
                      );
                    } else if (diff < 0) {
                      bWins = true;
                      deltaDisplay = (
                        <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/70 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-800">
                          <TrendingDown size={11} /> {elementB.symbol} +{absDiff} {row.unit}
                        </span>
                      );
                    } else {
                      deltaDisplay = (
                        <span className="text-slate-600 dark:text-zinc-400 font-semibold text-[11px]">
                          Equal (0)
                        </span>
                      );
                    }
                  }

                  return (
                    <tr key={i} className="hover:bg-slate-50/70 dark:hover:bg-zinc-900/60 transition-colors">
                      <td className="py-2.5 px-4 text-slate-800 dark:text-zinc-200 font-medium">
                        {row.label} {row.unit && <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-normal">({row.unit})</span>}
                      </td>

                      <td
                        className={`py-2.5 px-4 text-center font-bold tabular-nums ${
                          aWins
                            ? 'bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-950 dark:text-white'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {row.label === 'Electron Configuration' ? (
                          <span className="inline-block px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700">
                            {row.valA}
                          </span>
                        ) : row.valA !== null && row.valA !== undefined ? (
                          row.valA
                        ) : (
                          '—'
                        )}
                      </td>

                      <td
                        className={`py-2.5 px-4 text-center font-bold tabular-nums ${
                          bWins
                            ? 'bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-950 dark:text-white'
                            : 'text-slate-900 dark:text-slate-100'
                        }`}
                      >
                        {row.label === 'Electron Configuration' ? (
                          <span className="inline-block px-2 py-0.5 rounded-md font-mono text-[11px] font-bold bg-slate-100 dark:bg-zinc-800 text-slate-900 dark:text-zinc-100 border border-slate-200 dark:border-zinc-700">
                            {row.valB}
                          </span>
                        ) : row.valB !== null && row.valB !== undefined ? (
                          row.valB
                        ) : (
                          '—'
                        )}
                      </td>

                      <td className="py-2.5 px-4 text-center tabular-nums">
                        {deltaDisplay}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};
