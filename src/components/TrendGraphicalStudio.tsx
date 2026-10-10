import React, { useState, useMemo } from 'react';
import { ElementData, TrendProperty, ElementBlock } from '../types/element';
import { ELEMENTS, TREND_RANGES } from '../data/elements';
import { CATEGORIES } from '../data/categories';
import { useTheme } from '../context/ThemeContext';
import {
  X,
  TrendingUp,
  BarChart3,
  GitCommit,
  Layers,
  Info,
  Maximize2,
  Minimize2,
  Sparkles,
  ArrowRight,
  Filter
} from 'lucide-react';

interface TrendGraphicalStudioProps {
  isOpen: boolean;
  onClose: () => void;
  initialProperty?: TrendProperty;
  selectedElement: ElementData | null;
  onSelectElement: (el: ElementData) => void;
  onOpenDossier?: (el: ElementData) => void;
}

type GraphViewMode = 'continuous' | 'period-overlay' | 'group-trends' | 'correlation';

interface TrendStats {
  min: number;
  max: number;
  avg: number;
  minEl: ElementData | null;
  maxEl: ElementData | null;
}

export const TrendGraphicalStudio: React.FC<TrendGraphicalStudioProps> = ({
  isOpen,
  onClose,
  initialProperty = 'electronegativity',
  selectedElement,
  onSelectElement,
  onOpenDossier,
}) => {
  const { theme } = useTheme();

  // Active trend property (defaults to electronegativity or whatever was active)
  const [activeProp, setActiveProp] = useState<Exclude<TrendProperty, 'none'>>(
    initialProperty !== 'none' ? initialProperty : 'electronegativity'
  );

  // Secondary property for X-Y correlation mode
  const [secondaryProp, setSecondaryProp] = useState<Exclude<TrendProperty, 'none'>>('atomicRadius');

  // Graph interpretation sub-mode
  const [graphMode, setGraphMode] = useState<GraphViewMode>('continuous');

  // Filter by block
  const [blockFilter, setBlockFilter] = useState<ElementBlock | 'all'>('all');

  // Hovered data point for tooltip
  const [hoveredPoint, setHoveredPoint] = useState<{
    element: ElementData;
    x: number;
    y: number;
    value: number;
  } | null>(null);

  // Group filter for group-trends mode
  const [activeGroupNum, setActiveGroupNum] = useState<number>(1);

  // Filter elements that have a valid value for the active property
  const validElements = useMemo(() => {
    return ELEMENTS.filter((el) => {
      const val = el[activeProp];
      if (val === null || val === undefined) return false;
      if (blockFilter !== 'all' && el.block !== blockFilter) return false;
      return true;
    }).sort((a, b) => a.atomicNumber - b.atomicNumber);
  }, [activeProp, blockFilter]);

  // Compute statistics
  const stats: TrendStats = useMemo(() => {
    if (validElements.length === 0) return { min: 0, max: 0, avg: 0, minEl: null, maxEl: null };
    let min = Infinity;
    let max = -Infinity;
    let sum = 0;
    let minEl: ElementData | null = null;
    let maxEl: ElementData | null = null;

    validElements.forEach((el) => {
      const val = el[activeProp] as number;
      if (val < min) {
        min = val;
        minEl = el;
      }
      if (val > max) {
        max = val;
        maxEl = el;
      }
      sum += val;
    });

    return {
      min,
      max,
      avg: Number((sum / validElements.length).toFixed(2)),
      minEl,
      maxEl,
    };
  }, [validElements, activeProp]);

  if (!isOpen) return null;

  const currentTrendMeta = TREND_RANGES[activeProp];
  const secondaryTrendMeta = TREND_RANGES[secondaryProp];

  // Scientific explanation for each trend
  const trendScientificTheory: Record<Exclude<TrendProperty, 'none'>, { title: string; mechanism: string; rule: string }> = {
    electronegativity: {
      title: 'Effective Nuclear Charge & Atomic Shielding',
      mechanism: 'Across a period, nuclear charge (Z) increases while shielding remains roughly constant, pulling valence electrons tighter. Down a group, principal quantum number (n) increases, placing electrons further away and shielded by inner shells.',
      rule: 'Increases left-to-right across periods; decreases top-to-bottom down groups (Fluorine is highest at 3.98).',
    },
    atomicRadius: {
      title: 'Coulombic Attraction vs. Electron Shell Addition',
      mechanism: 'Moving across a period adds protons to the nucleus with electrons in the same principal energy level. The greater effective nuclear charge pulls electron clouds inward. Moving down a group adds new quantum shells, drastically expanding radius.',
      rule: 'Decreases left-to-right across periods; increases top-to-bottom down groups (Cesium/Francium are largest).',
    },
    ionizationEnergy: {
      title: 'Binding Energy of Valence Shells',
      mechanism: 'Ionization energy is the energy required to remove the outermost electron. Higher effective nuclear charge and smaller radius make electrons harder to remove. Full and half-filled subshells (e.g. N, Be, Noble gases) cause localized stability peaks.',
      rule: 'Increases left-to-right across periods with subshell stability peaks; decreases down groups (Helium is highest at 2372 kJ/mol).',
    },
    meltingPoint: {
      title: 'Bonding Matrix Strength & Crystal Lattice Energy',
      mechanism: 'Melting points reflect the energy required to disrupt intermolecular or interatomic bonds. Covalent network solids (like Carbon diamond) and refractory transition metals with partially filled d-orbitals (Tungsten, Rhenium) form exceptionally strong bonds.',
      rule: 'Peaks in the middle of periods (Group 6 in d-block, Group 14 in p-block) and drops precipitously for diatomic halogens and noble gases.',
    },
    density: {
      title: 'Atomic Mass to Volume Packing Ratio',
      mechanism: 'Density depends on both atomic mass and atomic radius packing. In transition series (Periods 5 & 6), lanthanoid contraction causes atomic radii to remain very small despite large atomic masses, resulting in ultra-dense metals (Osmium 22.59 g/cm³, Iridium 22.56 g/cm³).',
      rule: 'Peaks sharply near the center of transition metal series (Groups 8-10) and is lowest for gaseous nonmetals.',
    },
  };

  // Dimensions for SVG Plot
  const svgWidth = 920;
  const svgHeight = 360;
  const padding = { top: 25, right: 30, bottom: 45, left: 65 };
  const plotWidth = svgWidth - padding.left - padding.right;
  const plotHeight = svgHeight - padding.top - padding.bottom;

  // Periods boundary definitions (Z start of each period)
  const periodStarts = [
    { period: 1, z: 1, symbol: 'H' },
    { period: 2, z: 3, symbol: 'Li' },
    { period: 3, z: 11, symbol: 'Na' },
    { period: 4, z: 19, symbol: 'K' },
    { period: 5, z: 37, symbol: 'Rb' },
    { period: 6, z: 55, symbol: 'Cs' },
    { period: 7, z: 87, symbol: 'Fr' },
  ];

  // Helper scaling functions
  const scaleXContinuous = (z: number) => {
    return padding.left + ((z - 1) / (118 - 1)) * plotWidth;
  };

  const propMin = Math.min(stats.min, currentTrendMeta.min);
  const propMax = Math.max(stats.max, currentTrendMeta.max);

  const scaleY = (val: number) => {
    const range = propMax - propMin || 1;
    return padding.top + plotHeight - ((val - propMin) / range) * plotHeight;
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="trend-studio-title"
    >
      <div
        className="w-full max-w-5xl bg-white dark:bg-[#1a1b20] rounded-2xl border border-slate-200 dark:border-[#292c35] shadow-2xl overflow-hidden flex flex-col max-h-[94vh] text-slate-800 dark:text-zinc-100 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ========================================================================= */}
        {/* Header Bar                                                                */}
        {/* ========================================================================= */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-[#292c35] bg-slate-50/80 dark:bg-[#121316]/95">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-500 border border-amber-500/30 flex items-center justify-center shadow-xs">
              <TrendingUp size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 id="trend-studio-title" className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                  Graphical Interpretation Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 font-mono text-[10px] font-bold">
                  Periodicity Curves & Waveforms
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                Interactive analytical curves, extrema analysis, and physical trend mechanisms
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:text-zinc-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-[#22252c] transition-colors cursor-pointer"
            aria-label="Close graphical studio"
          >
            <X size={18} />
          </button>
        </div>

        {/* ========================================================================= */}
        {/* Controls Toolbar                                                          */}
        {/* ========================================================================= */}
        <div className="px-5 py-3 border-b border-slate-200 dark:border-[#292c35] bg-slate-50/50 dark:bg-[#15161b] flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Property Selector */}
          <div className="flex items-center gap-2">
            <span className="font-mono text-[11px] font-bold text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Property:
            </span>
            <select
              value={activeProp}
              onChange={(e) => setActiveProp(e.target.value as Exclude<TrendProperty, 'none'>)}
              className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#1a1b20] border border-slate-300 dark:border-[#292c35] text-slate-800 dark:text-zinc-100 font-mono text-xs font-semibold outline-none focus:border-amber-500 dark:focus:border-amber-400 cursor-pointer shadow-xs"
            >
              <option value="electronegativity">Electronegativity (Pauling)</option>
              <option value="atomicRadius">Atomic Radius (pm)</option>
              <option value="ionizationEnergy">1st Ionization Energy (kJ/mol)</option>
              <option value="meltingPoint">Melting Point (Kelvin)</option>
              <option value="density">Density (g/cm³)</option>
            </select>
          </div>

          {/* Graph Sub-Mode Tabs */}
          <div className="flex items-center gap-1 bg-slate-200/70 dark:bg-[#121316] p-1 rounded-lg border border-slate-200 dark:border-[#292c35] font-mono text-[11px]">
            <button
              type="button"
              onClick={() => setGraphMode('continuous')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                graphMode === 'continuous'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <TrendingUp size={12} />
              <span>Z = 1 → 118 Wave</span>
            </button>

            <button
              type="button"
              onClick={() => setGraphMode('period-overlay')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                graphMode === 'period-overlay'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers size={12} />
              <span>Period Overlay</span>
            </button>

            <button
              type="button"
              onClick={() => setGraphMode('group-trends')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                graphMode === 'group-trends'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 size={12} />
              <span>Down-Group Trend</span>
            </button>

            <button
              type="button"
              onClick={() => setGraphMode('correlation')}
              className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-all cursor-pointer ${
                graphMode === 'correlation'
                  ? 'bg-amber-500 text-zinc-950 font-bold shadow-xs'
                  : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <GitCommit size={12} />
              <span>X-Y Correlation</span>
            </button>
          </div>

          {/* Subshell Block Filters */}
          <div className="flex items-center gap-1 font-mono text-[11px]">
            <span className="text-slate-400 dark:text-zinc-500 mr-1 flex items-center gap-1">
              <Filter size={11} /> Block:
            </span>
            {(['all', 's', 'p', 'd', 'f'] as const).map((b) => (
              <button
                key={b}
                type="button"
                onClick={() => setBlockFilter(b)}
                className={`px-2 py-0.5 rounded uppercase font-bold transition-all cursor-pointer ${
                  blockFilter === b
                    ? 'bg-zinc-800 text-white dark:bg-zinc-200 dark:text-zinc-950 shadow-xs'
                    : 'text-slate-500 dark:text-zinc-400 hover:bg-slate-200 dark:hover:bg-[#22252c]'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Secondary Property Toolbar (only in correlation mode) */}
        {graphMode === 'correlation' && (
          <div className="px-5 py-2 border-b border-slate-200 dark:border-[#292c35] bg-amber-50/50 dark:bg-amber-950/20 flex items-center gap-3 text-xs font-mono">
            <span className="text-amber-700 dark:text-amber-400 font-bold">X-Axis Property:</span>
            <select
              value={secondaryProp}
              onChange={(e) => setSecondaryProp(e.target.value as Exclude<TrendProperty, 'none'>)}
              className="px-2.5 py-1 rounded bg-white dark:bg-[#1a1b20] border border-amber-300 dark:border-amber-800/80 text-slate-800 dark:text-zinc-200 text-xs font-semibold outline-none cursor-pointer"
            >
              <option value="atomicRadius">Atomic Radius (pm)</option>
              <option value="electronegativity">Electronegativity (Pauling)</option>
              <option value="ionizationEnergy">1st Ionization Energy (kJ/mol)</option>
              <option value="density">Density (g/cm³)</option>
              <option value="meltingPoint">Melting Point (K)</option>
            </select>
            <span className="text-slate-400 dark:text-zinc-500">vs.</span>
            <span className="text-amber-700 dark:text-amber-400 font-bold">Y-Axis: {currentTrendMeta.label}</span>
          </div>
        )}

        {/* Group Selector Toolbar (only in group-trends mode) */}
        {graphMode === 'group-trends' && (
          <div className="px-5 py-2 border-b border-slate-200 dark:border-[#292c35] bg-slate-50/70 dark:bg-[#121316] flex items-center gap-2 overflow-x-auto text-xs font-mono">
            <span className="text-slate-500 dark:text-zinc-400 font-bold shrink-0">Select Group:</span>
            {Array.from({ length: 18 }, (_, i) => i + 1).map((g) => (
              <button
                key={g}
                type="button"
                onClick={() => setActiveGroupNum(g)}
                className={`px-2 py-0.5 rounded text-[11px] font-bold transition-all cursor-pointer shrink-0 ${
                  activeGroupNum === g
                    ? 'bg-amber-500 text-zinc-950 shadow-xs'
                    : 'bg-white dark:bg-[#1a1b20] border border-slate-200 dark:border-[#292c35] text-slate-600 dark:text-zinc-300 hover:border-amber-400'
                }`}
              >
                G{g}
              </button>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* Main Canvas Viewport                                                      */}
        {/* ========================================================================= */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-slate-50/30 dark:bg-[#121316]">
          {/* Main SVG Graph Container */}
          <div className="relative bg-white dark:bg-[#1a1b20] rounded-xl border border-slate-200 dark:border-[#292c35] p-3 shadow-xs">
            {/* SVG Chart */}
            <div className="w-full overflow-x-auto">
              <svg
                viewBox={`0 0 ${svgWidth} ${svgHeight}`}
                className="w-full h-auto min-w-[700px] select-none font-mono"
              >
                <defs>
                  {/* Subtle Gradient fill under curve */}
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
                  </linearGradient>

                  {/* Dot glow */}
                  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                    <feGaussianBlur stdDeviation="2" result="blur" />
                    <feComposite in="SourceGraphic" in2="blur" operator="over" />
                  </filter>
                </defs>

                {/* Grid Lines - Horizontal */}
                {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
                  const y = padding.top + plotHeight * (1 - pct);
                  const val = propMin + (propMax - propMin) * pct;
                  return (
                    <g key={pct}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={padding.left + plotWidth}
                        y2={y}
                        stroke={theme === 'dark' ? '#292c35' : '#e2e8f0'}
                        strokeWidth="1"
                        strokeDasharray="4 4"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="9"
                        fill={theme === 'dark' ? '#71717a' : '#94a3b8'}
                      >
                        {val < 10 ? val.toFixed(1) : Math.round(val)}
                      </text>
                    </g>
                  );
                })}

                {/* MODE 1: Continuous Periodic Wave (Z = 1 to 118) */}
                {graphMode === 'continuous' && (
                  <>
                    {/* Period vertical boundary lines */}
                    {periodStarts.map((p) => {
                      const x = scaleXContinuous(p.z);
                      return (
                        <g key={p.period}>
                          <line
                            x1={x}
                            y1={padding.top}
                            x2={x}
                            y2={padding.top + plotHeight}
                            stroke={theme === 'dark' ? '#333742' : '#cbd5e1'}
                            strokeWidth="1"
                            strokeDasharray="2 3"
                          />
                          <text
                            x={x + 3}
                            y={padding.top + 10}
                            fontSize="8"
                            fontWeight="bold"
                            fill="#f59e0b"
                            opacity="0.85"
                          >
                            P{p.period} ({p.symbol})
                          </text>
                        </g>
                      );
                    })}

                    {/* Area under curve */}
                    {validElements.length > 1 && (
                      <path
                        d={`M ${scaleXContinuous(validElements[0].atomicNumber)} ${scaleY(
                          validElements[0][activeProp] as number
                        )} ${validElements
                          .map(
                            (el) =>
                              `L ${scaleXContinuous(el.atomicNumber)} ${scaleY(
                                el[activeProp] as number
                              )}`
                          )
                          .join(' ')} L ${scaleXContinuous(
                          validElements[validElements.length - 1].atomicNumber
                        )} ${padding.top + plotHeight} L ${scaleXContinuous(
                          validElements[0].atomicNumber
                        )} ${padding.top + plotHeight} Z`}
                        fill="url(#areaGradient)"
                      />
                    )}

                    {/* Polyline curve connecting elements */}
                    {validElements.length > 1 && (
                      <path
                        d={`M ${validElements
                          .map(
                            (el) =>
                              `${scaleXContinuous(el.atomicNumber)} ${scaleY(
                                el[activeProp] as number
                              )}`
                          )
                          .join(' L ')}`}
                        fill="none"
                        stroke="#f59e0b"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}

                    {/* Element node points */}
                    {validElements.map((el) => {
                      const val = el[activeProp] as number;
                      const cx = scaleXContinuous(el.atomicNumber);
                      const cy = scaleY(val);
                      const isHovered = hoveredPoint?.element.atomicNumber === el.atomicNumber;
                      const isSelected = selectedElement?.atomicNumber === el.atomicNumber;
                      const category = CATEGORIES[el.category];

                      return (
                        <g
                          key={el.atomicNumber}
                          className="cursor-pointer transition-transform"
                          onMouseEnter={() => setHoveredPoint({ element: el, x: cx, y: cy, value: val })}
                          onMouseLeave={() => setHoveredPoint(null)}
                          onClick={() => onSelectElement(el)}
                        >
                          {/* Outer highlight for selected or hovered */}
                          {(isHovered || isSelected) && (
                            <circle
                              cx={cx}
                              cy={cy}
                              r={isSelected ? 8 : 6}
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth={isSelected ? '2.5' : '1.5'}
                              className="animate-pulse"
                            />
                          )}

                          {/* Data node */}
                          <circle
                            cx={cx}
                            cy={cy}
                            r={isHovered ? 4.5 : isSelected ? 4.5 : 2.75}
                            fill={category?.color || '#f59e0b'}
                            stroke={theme === 'dark' ? '#121316' : '#ffffff'}
                            strokeWidth="1"
                          />

                          {/* Important element labels directly on graph (noble gases & alkalis) */}
                          {(el.group === 1 || el.group === 18 || isHovered || isSelected) && (
                            <text
                              x={cx}
                              y={cy - 6}
                              textAnchor="middle"
                              fontSize={isHovered || isSelected ? '10' : '7.5'}
                              fontWeight="bold"
                              fill={
                                isHovered || isSelected
                                  ? '#f59e0b'
                                  : theme === 'dark'
                                  ? '#a1a1aa'
                                  : '#475569'
                              }
                            >
                              {el.symbol}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </>
                )}

                {/* MODE 2: Period Overlay (Periods 2 through 6 compared) */}
                {graphMode === 'period-overlay' && (
                  <>
                    {[2, 3, 4, 5, 6].map((pNum) => {
                      const pElements = validElements
                        .filter((el) => el.period === pNum && el.group <= 18)
                        .sort((a, b) => a.group - b.group);

                      if (pElements.length < 2) return null;

                      const periodColors = ['#f59e0b', '#38bdf8', '#34d399', '#f43f5e', '#a855f7', '#fb923c'];
                      const pColor = periodColors[(pNum - 2) % periodColors.length];

                      const scaleXGroup = (group: number) => {
                        return padding.left + ((group - 1) / (18 - 1)) * plotWidth;
                      };

                      return (
                        <g key={pNum}>
                          <path
                            d={`M ${pElements
                              .map((el) => `${scaleXGroup(el.group)} ${scaleY(el[activeProp] as number)}`)
                              .join(' L ')}`}
                            fill="none"
                            stroke={pColor}
                            strokeWidth="2"
                            strokeLinecap="round"
                          />

                          {pElements.map((el) => {
                            const val = el[activeProp] as number;
                            const cx = scaleXGroup(el.group);
                            const cy = scaleY(val);
                            return (
                              <g
                                key={el.atomicNumber}
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredPoint({ element: el, x: cx, y: cy, value: val })}
                                onMouseLeave={() => setHoveredPoint(null)}
                                onClick={() => onSelectElement(el)}
                              >
                                <circle cx={cx} cy={cy} r="3" fill={pColor} stroke="#121316" strokeWidth="1" />
                                <text x={cx} y={cy - 5} textAnchor="middle" fontSize="7" fill={pColor}>
                                  {el.symbol}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    })}

                    {/* Overlay legend */}
                    <g transform={`translate(${padding.left + 10}, ${padding.top + 10})`}>
                      {[2, 3, 4, 5, 6].map((pNum, idx) => {
                        const periodColors = ['#f59e0b', '#38bdf8', '#34d399', '#f43f5e', '#a855f7'];
                        const color = periodColors[idx];
                        return (
                          <g key={pNum} transform={`translate(${idx * 75}, 0)`}>
                            <rect x="0" y="0" width="12" height="3" fill={color} rx="1.5" />
                            <text x="16" y="5" fontSize="8" fill={theme === 'dark' ? '#d4d4d8' : '#334155'}>
                              Period {pNum}
                            </text>
                          </g>
                        );
                      })}
                    </g>
                  </>
                )}

                {/* MODE 3: Down-Group Trend */}
                {graphMode === 'group-trends' && (
                  <>
                    {(() => {
                      const groupElements = validElements
                        .filter((el) => el.group === activeGroupNum)
                        .sort((a, b) => a.period - b.period);

                      if (groupElements.length === 0) {
                        return (
                          <text
                            x={svgWidth / 2}
                            y={svgHeight / 2}
                            textAnchor="middle"
                            fill="#71717a"
                            fontSize="12"
                          >
                            No data available for Group {activeGroupNum} with current filters
                          </text>
                        );
                      }

                      const scaleXPeriod = (period: number) => {
                        return padding.left + ((period - 1) / (7 - 1)) * plotWidth;
                      };

                      return (
                        <g>
                          {groupElements.length > 1 && (
                            <path
                              d={`M ${groupElements
                                .map((el) => `${scaleXPeriod(el.period)} ${scaleY(el[activeProp] as number)}`)
                                .join(' L ')}`}
                              fill="none"
                              stroke="#f59e0b"
                              strokeWidth="2.5"
                              strokeDasharray="4 2"
                            />
                          )}

                          {groupElements.map((el) => {
                            const val = el[activeProp] as number;
                            const cx = scaleXPeriod(el.period);
                            const cy = scaleY(val);
                            return (
                              <g
                                key={el.atomicNumber}
                                className="cursor-pointer"
                                onMouseEnter={() => setHoveredPoint({ element: el, x: cx, y: cy, value: val })}
                                onMouseLeave={() => setHoveredPoint(null)}
                                onClick={() => onSelectElement(el)}
                              >
                                <circle cx={cx} cy={cy} r="6" fill="#f59e0b" stroke="#121316" strokeWidth="2" />
                                <text
                                  x={cx}
                                  y={cy - 10}
                                  textAnchor="middle"
                                  fontSize="10"
                                  fontWeight="bold"
                                  fill="#f59e0b"
                                >
                                  {el.symbol} ({val})
                                </text>
                                <text
                                  x={cx}
                                  y={padding.top + plotHeight + 15}
                                  textAnchor="middle"
                                  fontSize="9"
                                  fill={theme === 'dark' ? '#a1a1aa' : '#64748b'}
                                >
                                  P{el.period}: {el.name}
                                </text>
                              </g>
                            );
                          })}
                        </g>
                      );
                    })()}
                  </>
                )}

                {/* MODE 4: Correlation X-Y Scatter Plot */}
                {graphMode === 'correlation' && (
                  <>
                    {(() => {
                      const correlationElements = ELEMENTS.filter((el) => {
                        const yVal = el[activeProp];
                        const xVal = el[secondaryProp];
                        if (yVal === null || yVal === undefined) return false;
                        if (xVal === null || xVal === undefined) return false;
                        if (blockFilter !== 'all' && el.block !== blockFilter) return false;
                        return true;
                      });

                      const xMin = secondaryTrendMeta.min;
                      const xMax = secondaryTrendMeta.max;
                      const scaleXCorr = (val: number) => {
                        const range = xMax - xMin || 1;
                        return padding.left + ((val - xMin) / range) * plotWidth;
                      };

                      return (
                        <g>
                          {correlationElements.map((el) => {
                            const yVal = el[activeProp] as number;
                            const xVal = el[secondaryProp] as number;
                            const cx = scaleXCorr(xVal);
                            const cy = scaleY(yVal);
                            const category = CATEGORIES[el.category];
                            const isSelected = selectedElement?.atomicNumber === el.atomicNumber;

                            return (
                              <g
                                key={el.atomicNumber}
                                className="cursor-pointer"
                                onMouseEnter={() =>
                                  setHoveredPoint({ element: el, x: cx, y: cy, value: yVal })
                                }
                                onMouseLeave={() => setHoveredPoint(null)}
                                onClick={() => onSelectElement(el)}
                              >
                                <circle
                                  cx={cx}
                                  cy={cy}
                                  r={isSelected ? 5.5 : 3.5}
                                  fill={category?.color || '#f59e0b'}
                                  stroke={isSelected ? '#f59e0b' : theme === 'dark' ? '#121316' : '#ffffff'}
                                  strokeWidth={isSelected ? '2' : '1'}
                                  opacity="0.85"
                                />
                                {(isSelected || el.atomicNumber <= 10) && (
                                  <text
                                    x={cx}
                                    y={cy - 5}
                                    fontSize="7.5"
                                    fontWeight="bold"
                                    textAnchor="middle"
                                    fill={theme === 'dark' ? '#d4d4d8' : '#475569'}
                                  >
                                    {el.symbol}
                                  </text>
                                )}
                              </g>
                            );
                          })}
                        </g>
                      );
                    })()}
                  </>
                )}

                {/* X-Axis Baseline */}
                <line
                  x1={padding.left}
                  y1={padding.top + plotHeight}
                  x2={padding.left + plotWidth}
                  y2={padding.top + plotHeight}
                  stroke={theme === 'dark' ? '#3f3f46' : '#94a3b8'}
                  strokeWidth="1.5"
                />

                {/* Y-Axis Baseline */}
                <line
                  x1={padding.left}
                  y1={padding.top}
                  x2={padding.left}
                  y2={padding.top + plotHeight}
                  stroke={theme === 'dark' ? '#3f3f46' : '#94a3b8'}
                  strokeWidth="1.5"
                />

                {/* X-Axis Label */}
                <text
                  x={padding.left + plotWidth / 2}
                  y={svgHeight - 8}
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill={theme === 'dark' ? '#a1a1aa' : '#64748b'}
                >
                  {graphMode === 'continuous'
                    ? 'Atomic Number (Z = 1 to 118)'
                    : graphMode === 'period-overlay'
                    ? 'IUPAC Group Number (1 to 18)'
                    : graphMode === 'group-trends'
                    ? `Period Progression down Group ${activeGroupNum}`
                    : `${secondaryTrendMeta.label} (${secondaryTrendMeta.unit})`}
                </text>

                {/* Y-Axis Label */}
                <text
                  x={-padding.top - plotHeight / 2}
                  y={16}
                  transform="rotate(-90)"
                  textAnchor="middle"
                  fontSize="10"
                  fontWeight="bold"
                  fill="#f59e0b"
                >
                  {currentTrendMeta.label} ({currentTrendMeta.unit})
                </text>
              </svg>
            </div>

            {/* Floating Interactive Tooltip */}
            {hoveredPoint && (
              <div
                className="absolute z-30 pointer-events-none p-3 rounded-xl bg-white/95 dark:bg-[#121316]/95 border border-slate-300 dark:border-[#292c35] shadow-2xl font-mono text-xs backdrop-blur-md animate-in fade-in duration-100 max-w-xs"
                style={{
                  left: Math.min(hoveredPoint.x, svgWidth - 220),
                  top: Math.max(10, hoveredPoint.y - 70),
                }}
              >
                <div className="flex items-center justify-between gap-2 border-b border-slate-200 dark:border-[#292c35] pb-1.5 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <span className="text-base font-bold text-slate-900 dark:text-white">
                      {hoveredPoint.element.symbol}
                    </span>
                    <span className="text-[11px] text-slate-500 dark:text-zinc-400">
                      #{hoveredPoint.element.atomicNumber} {hoveredPoint.element.name}
                    </span>
                  </div>
                  <span
                    className="w-2.5 h-2.5 rounded-full"
                    style={{ backgroundColor: CATEGORIES[hoveredPoint.element.category]?.color }}
                  />
                </div>

                <div className="space-y-1 text-[11px]">
                  <div className="flex justify-between">
                    <span className="text-slate-500 dark:text-zinc-400">{currentTrendMeta.label}:</span>
                    <strong className="text-amber-500 font-bold">
                      {hoveredPoint.value} {currentTrendMeta.unit}
                    </strong>
                  </div>
                  <div className="flex justify-between text-slate-500 dark:text-zinc-400 text-[10px]">
                    <span>Period {hoveredPoint.element.period} · Group {hoveredPoint.element.group}</span>
                    <span className="uppercase">{hoveredPoint.element.block}-block</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ========================================================================= */}
          {/* Scientific Interpretation & Statistical Extrema Card                      */}
          {/* ========================================================================= */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {/* Extrema Callout 1: Maximum */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a1b20] border border-slate-200 dark:border-[#292c35] shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                  Peak Extremum (Maximum)
                </span>
                {stats.maxEl && (
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                        {stats.maxEl.symbol}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-zinc-400">
                        ({stats.maxEl.name})
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold text-amber-500">
                      {stats.max} {currentTrendMeta.unit}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 font-mono">
                Z={stats.maxEl?.atomicNumber} · Period {stats.maxEl?.period}, Group {stats.maxEl?.group}
              </p>
            </div>

            {/* Extrema Callout 2: Minimum */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a1b20] border border-slate-200 dark:border-[#292c35] shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                  Base Extremum (Minimum)
                </span>
                {stats.minEl && (
                  <div className="flex items-baseline justify-between">
                    <div className="flex items-center gap-1.5">
                      <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                        {stats.minEl.symbol}
                      </span>
                      <span className="text-xs text-slate-500 dark:text-zinc-400">
                        ({stats.minEl.name})
                      </span>
                    </div>
                    <span className="text-sm font-mono font-bold text-sky-400">
                      {stats.min} {currentTrendMeta.unit}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 font-mono">
                Z={stats.minEl?.atomicNumber} · Period {stats.minEl?.period}, Group {stats.minEl?.group}
              </p>
            </div>

            {/* Statistical Average */}
            <div className="p-3.5 rounded-xl bg-white dark:bg-[#1a1b20] border border-slate-200 dark:border-[#292c35] shadow-xs flex flex-col justify-between">
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400 dark:text-zinc-500 block mb-1">
                  Sample Mean & Coverage
                </span>
                <div className="flex items-baseline justify-between">
                  <span className="text-lg font-bold font-mono text-slate-900 dark:text-white">
                    {stats.avg} {currentTrendMeta.unit}
                  </span>
                  <span className="text-xs font-mono text-slate-400 dark:text-zinc-500">
                    {validElements.length} / 118 elements
                  </span>
                </div>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-zinc-400 mt-2 font-mono">
                Global average across all measured isotopes
              </p>
            </div>
          </div>

          {/* Physical Mechanism Theory Box */}
          <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-slate-800 dark:text-zinc-200 space-y-1.5">
            <div className="flex items-center gap-2 text-amber-600 dark:text-amber-400 font-mono text-xs font-bold">
              <Info size={14} />
              <span>Physical Mechanism: {trendScientificTheory[activeProp].title}</span>
            </div>
            <p className="text-xs leading-relaxed text-slate-700 dark:text-zinc-300">
              {trendScientificTheory[activeProp].mechanism}
            </p>
            <div className="pt-1 text-[11px] font-mono text-amber-700 dark:text-amber-300 font-semibold">
              Rule of Thumb: {trendScientificTheory[activeProp].rule}
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* Footer                                                                    */}
        {/* ========================================================================= */}
        <div className="px-5 py-3 border-t border-slate-200 dark:border-[#292c35] bg-slate-50 dark:bg-[#121316] font-mono text-xs flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-500 dark:text-zinc-400">
            <span>Selected Element:</span>
            {selectedElement ? (
              <span className="font-bold text-slate-900 dark:text-amber-400">
                #{selectedElement.atomicNumber} {selectedElement.symbol} ({selectedElement.name}) ·{' '}
                {selectedElement[activeProp] !== null ? `${selectedElement[activeProp]} ${currentTrendMeta.unit}` : 'N/A'}
              </span>
            ) : (
              <span>None (click any point to inspect)</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedElement && onOpenDossier && (
              <button
                type="button"
                onClick={() => {
                  onOpenDossier(selectedElement);
                }}
                className="px-3 py-1.5 rounded-lg border border-slate-300 dark:border-[#292c35] bg-white dark:bg-[#1a1b20] hover:bg-slate-50 dark:hover:bg-[#22252c] text-slate-700 dark:text-zinc-200 font-bold text-xs cursor-pointer transition-colors shadow-xs"
              >
                Open Full Dossier ↗
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white dark:bg-amber-500 dark:text-zinc-950 font-bold text-xs cursor-pointer transition-colors shadow-xs"
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
