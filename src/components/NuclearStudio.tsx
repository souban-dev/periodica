import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  ISOTOPES_DATABASE,
  IsotopeData,
  U238_DECAY_SERIES,
  BINDING_ENERGY_CURVE,
} from '../data/isotopes';
import {
  Radiation,
  Clock,
  Activity,
  Layers,
  Search,
  X,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Info,
  Flame,
  ShieldAlert,
  Play,
  RotateCcw,
  ChevronDown,
  Check,
  SlidersHorizontal,
} from 'lucide-react';

/**
 * Accurately calculates and formats the elapsed physical time:
 * (halfLivesElapsed) * (active_isotope_halflife)
 * e.g. 1.0 × "12.32 years" = "12.32 years"
 *      2.5 × "8.02 days" = "20.05 days"
 *      1.0 × "4.468 billion years" = "4.47 billion years"
 */
export function formatNuclideElapsedTime(halfLives: number, halfLifeStr: string): string {
  if (halfLives <= 0) return '0 seconds';
  const clean = halfLifeStr.replace(/,/g, '').trim();
  const match = clean.match(
    /^([0-9.]+)\s*(billion|million|thousand)?\s*(years|year|days|day|hours|hour|minutes|minute|seconds|second|milliseconds|ms)?/i
  );
  if (!match) return `${halfLives.toFixed(2)} × (${halfLifeStr})`;

  const baseNum = parseFloat(match[1]);
  if (isNaN(baseNum)) return `${halfLives.toFixed(2)} × (${halfLifeStr})`;

  const scale = (match[2] || '').toLowerCase();
  const rawUnit = (match[3] || 'years').toLowerCase();

  let totalNum = halfLives * baseNum;
  let currentScale = scale;

  // Handle scaling transitions (e.g. 703.8 million * 2.5 = 1.76 billion)
  if (currentScale === 'million' && totalNum >= 1000) {
    totalNum /= 1000;
    currentScale = 'billion';
  } else if (currentScale === 'thousand' && totalNum >= 1000) {
    totalNum /= 1000;
    currentScale = 'million';
  }

  let formattedVal: string;
  if (currentScale === 'billion') {
    formattedVal = (totalNum >= 10 ? totalNum.toFixed(1) : totalNum.toFixed(2)) + ' billion';
  } else if (currentScale === 'million') {
    formattedVal = (totalNum >= 10 ? totalNum.toFixed(1) : totalNum.toFixed(2)) + ' million';
  } else if (currentScale === 'thousand') {
    formattedVal = (totalNum >= 10 ? totalNum.toFixed(1) : totalNum.toFixed(2)) + ' thousand';
  } else {
    if (totalNum >= 1000) {
      formattedVal = Math.round(totalNum).toLocaleString('en-US');
    } else if (totalNum >= 100) {
      formattedVal = totalNum.toFixed(1);
    } else if (totalNum >= 10) {
      formattedVal = totalNum.toFixed(2);
    } else {
      formattedVal = totalNum.toFixed(2);
    }
  }

  let unit = rawUnit;
  if (!unit.endsWith('s')) unit = unit + 's';

  return `${formattedVal} ${unit}`;
}

/**
 * Computes a smooth cubic Catmull-Rom spline SVG path string through an array of 2D points.
 * Ensures the Binding Energy curve has organic, smooth physics curvature without rigid jagged corners.
 */
function generateCatmullRomSpline(points: { x: number; y: number }[]): string {
  if (points.length < 2) return '';
  const d: string[] = [];

  for (let i = 0; i < points.length - 1; i++) {
    const p0 = i === 0 ? points[0] : points[i - 1];
    const p1 = points[i];
    const p2 = points[i + 1];
    const p3 = i + 2 < points.length ? points[i + 2] : p2;

    const cp1x = p1.x + (p2.x - p0.x) / 6;
    const cp1y = p1.y + (p2.y - p0.y) / 6;
    const cp2x = p2.x - (p3.x - p1.x) / 6;
    const cp2y = p2.y - (p3.y - p1.y) / 6;

    if (i === 0) d.push(`M ${p1.x.toFixed(1)},${p1.y.toFixed(1)}`);
    d.push(
      `C ${cp1x.toFixed(1)},${cp1y.toFixed(1)} ${cp2x.toFixed(1)},${cp2y.toFixed(1)} ${p2.x.toFixed(1)},${p2.y.toFixed(1)}`
    );
  }

  return d.join(' ');
}

/**
 * Calculates human-readable scientific decay constant λ = ln(2) / t½
 */
function getDecayConstantDisplay(halfLifeSeconds?: number): string {
  if (!halfLifeSeconds || !isFinite(halfLifeSeconds) || halfLifeSeconds <= 0) {
    return '0 s⁻¹';
  }
  const lambda = Math.LN2 / halfLifeSeconds;
  return `${lambda.toExponential(3)} s⁻¹`;
}

interface NuclearStudioProps {
  onClose: () => void;
  initialElementSymbol?: string;
}

export const NuclearStudio: React.FC<NuclearStudioProps> = ({
  onClose,
  initialElementSymbol,
}) => {
  const [activeTab, setActiveTab] = useState<'isotopes' | 'chains' | 'binding' | 'clock'>('isotopes');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStability, setSelectedStability] = useState<'all' | 'stable' | 'radioactive'>('all');
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Selected isotope for detail view
  const [selectedIsotope, setSelectedIsotope] = useState<IsotopeData>(
    ISOTOPES_DATABASE.find(
      (iso) =>
        initialElementSymbol && iso.elementSymbol.toLowerCase() === initialElementSymbol.toLowerCase()
    ) || ISOTOPES_DATABASE[7] // Default Carbon-14
  );

  // Half-life clock states
  const [clockIsotopeId, setClockIsotopeId] = useState<string>('c-14');
  const [halfLivesElapsed, setHalfLivesElapsed] = useState<number>(1.0);
  const [maxHalfLives, setMaxHalfLives] = useState<number>(5.0);
  const [isMaxScaleOpen, setIsMaxScaleOpen] = useState<boolean>(false);
  const [isPlayingDecay, setIsPlayingDecay] = useState<boolean>(false);
  const maxScaleRef = useRef<HTMLDivElement>(null);

  // Close max scale dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (maxScaleRef.current && !maxScaleRef.current.contains(e.target as Node)) {
        setIsMaxScaleOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

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

  // Set initial element match
  useEffect(() => {
    if (initialElementSymbol) {
      const match = ISOTOPES_DATABASE.find(
        (iso) => iso.elementSymbol.toLowerCase() === initialElementSymbol.toLowerCase()
      );
      if (match) setSelectedIsotope(match);
    }
  }, [initialElementSymbol]);

  // Filtered isotopes
  const filteredIsotopes = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return ISOTOPES_DATABASE.filter((iso) => {
      if (selectedStability === 'stable' && !iso.isStable) return false;
      if (selectedStability === 'radioactive' && iso.isStable) return false;
      if (!q) return true;
      return (
        iso.name.toLowerCase().includes(q) ||
        iso.elementSymbol.toLowerCase().includes(q) ||
        iso.elementName.toLowerCase().includes(q) ||
        iso.massNumber.toString() === q
      );
    });
  }, [searchQuery, selectedStability]);

  // Clock calculations
  const clockIsotope = useMemo(() => {
    return (
      ISOTOPES_DATABASE.find((iso) => iso.id === clockIsotopeId) ||
      ISOTOPES_DATABASE.find((iso) => !iso.isStable) ||
      ISOTOPES_DATABASE[7]
    );
  }, [clockIsotopeId]);

  // Derived radioisotope calculations
  const remainingFraction = Math.pow(0.5, halfLivesElapsed);
  const remainingPercentNum = remainingFraction * 100;
  const remainingPercent = remainingPercentNum.toFixed(1);
  const daughterPercent = (100 - remainingPercentNum).toFixed(1);
  const parentAtomCount = Math.min(100, Math.max(0, Math.round(remainingPercentNum)));

  // Physical absolute elapsed time dynamically calculated from active isotope
  const absoluteElapsedDisplay = useMemo(() => {
    return formatNuclideElapsedTime(halfLivesElapsed, clockIsotope.halfLife);
  }, [halfLivesElapsed, clockIsotope.halfLife]);

  // Scientific decay constant λ = ln(2) / t½
  const decayConstantDisplay = useMemo(() => {
    return getDecayConstantDisplay(clockIsotope.halfLifeSeconds);
  }, [clockIsotope.halfLifeSeconds]);

  // Active hover/selected point on the binding energy curve
  const [hoveredBindingPoint, setHoveredBindingPoint] = useState<typeof BINDING_ENERGY_CURVE[0] | null>(null);

  // Smooth natural Catmull-Rom spline path coordinates for the Binding Energy Curve
  const { bindingPathD, bindingAreaD, bindingCoords } = useMemo(() => {
    // Coordinate mapping: viewBox 500 x 220
    // X: A from 1 to 240 mapped to [40, 480]
    // Y: Eb/A from 0 to 9.5 MeV mapped to [200, 20]
    const coords = BINDING_ENERGY_CURVE.map((pt) => {
      const x = 40 + (pt.massNumber / 240) * 440;
      const y = 200 - (pt.bindingEnergy / 9.5) * 180;
      return { x, y, pt };
    });

    const pathD = generateCatmullRomSpline(coords);
    const first = coords[0];
    const last = coords[coords.length - 1];
    const areaD = `${pathD} L ${last.x.toFixed(1)},200 L ${first.x.toFixed(1)},200 Z`;

    return { bindingPathD: pathD, bindingAreaD: areaD, bindingCoords: coords };
  }, []);

  // Hovered coordinates on binding curve for stable crosshair indicator
  const hoveredCoords = useMemo(() => {
    if (!hoveredBindingPoint) return null;
    return bindingCoords.find((c) => c.pt.nuclide === hoveredBindingPoint.nuclide) || null;
  }, [hoveredBindingPoint, bindingCoords]);

  // Play decay animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isPlayingDecay) {
      interval = setInterval(() => {
        setHalfLivesElapsed((prev) => {
          if (prev >= maxHalfLives) {
            setIsPlayingDecay(false);
            return maxHalfLives;
          }
          return Number((prev + 0.05).toFixed(2));
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlayingDecay, maxHalfLives]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto transition-all duration-300 ease-out ${
        isOpen && !isClosing
          ? 'bg-slate-900/60 backdrop-blur-sm opacity-100'
          : 'bg-slate-900/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleSmoothClose();
      }}
    >
      <div
        className={`bg-white dark:bg-[#0c121e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col my-auto h-[88vh] max-h-[760px] min-h-[600px] text-slate-800 dark:text-slate-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          isOpen && !isClosing
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-3'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0c121e]/90 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center shadow-xs">
              <Radiation size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                  Nuclear Studio & Isotope Lab
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-800 font-mono text-[10px] font-bold">
                  Nuclides · Decay · Binding Energy
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Stable and radioisotopes, radioactive decay cascades, binding energy curve, and half-life clock
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSmoothClose}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            title="Close Lab"
          >
            <X size={18} />
          </button>
        </div>

        {/* Tab Navigation - Grid layout so all 4 tabs fit cleanly without horizontal scrolling */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 text-xs font-mono shrink-0">
          <button
            type="button"
            onClick={() => {
              setActiveTab('isotopes');
            }}
            className={`px-2.5 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'isotopes'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Radiation size={13} />
            <span>1. Chart of Isotopes</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('chains');
            }}
            className={`px-2.5 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'chains'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Activity size={13} />
            <span>2. Uranium Cascade</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('binding');
            }}
            className={`px-2.5 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'binding'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <TrendingUp size={13} />
            <span>3. Binding Energy Curve</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('clock');
            }}
            className={`px-2.5 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center justify-center gap-1.5 ${
              activeTab === 'clock'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Clock size={13} />
            <span>4. Half-Life Clock</span>
          </button>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-5 flex-1 overflow-hidden flex flex-col bg-slate-50/50 dark:bg-[#090d16]">
          {/* ========================================================================= */}
          {/* TAB 1: CHART OF ISOTOPES (Side-by-Side Clean Layout, All Fits)            */}
          {/* ========================================================================= */}
          {activeTab === 'isotopes' && (
            <div className="flex-1 flex flex-col md:flex-row gap-4 overflow-hidden">
              {/* Left Column: Search, Filter, and Scrollable Nuclide Selector */}
              <div className="w-full md:w-5/12 flex flex-col gap-2.5 overflow-hidden">
                {/* Search & Filters */}
                <div className="bg-white dark:bg-[#0c121e] p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-2 shrink-0">
                  <div className="relative w-full">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search C-14, U-235, mass..."
                      className="w-full pl-7 pr-3 py-1 rounded-md bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-xs outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-1.5 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setSelectedStability('all')}
                      className={`py-1 rounded-md transition-colors cursor-pointer text-center ${
                        selectedStability === 'all'
                          ? 'bg-slate-800 dark:bg-slate-700 text-white font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      All
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStability('stable')}
                      className={`py-1 rounded-md transition-colors cursor-pointer text-center ${
                        selectedStability === 'stable'
                          ? 'bg-blue-600 text-white font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Stable
                    </button>
                    <button
                      type="button"
                      onClick={() => setSelectedStability('radioactive')}
                      className={`py-1 rounded-md transition-colors cursor-pointer text-center ${
                        selectedStability === 'radioactive'
                          ? 'bg-amber-600 text-white font-bold'
                          : 'bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      Radioactive
                    </button>
                  </div>
                </div>

                {/* Compact Scrollable List of Nuclides */}
                <div className="flex-1 overflow-y-auto space-y-1.5 pr-1">
                  {filteredIsotopes.map((iso) => {
                    const isSelected = selectedIsotope.id === iso.id;

                    return (
                      <button
                        key={iso.id}
                        type="button"
                        onClick={() => setSelectedIsotope(iso)}
                        className={`w-full p-2 rounded-xl border text-left transition-all cursor-pointer flex items-center justify-between gap-2 ${
                          isSelected
                            ? 'border-emerald-500 ring-2 ring-emerald-500/20 bg-emerald-50/70 dark:bg-emerald-950/50 shadow-xs'
                            : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/80'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate font-mono">
                          <span
                            className={`w-7 h-7 rounded-md flex flex-col items-center justify-center font-bold text-[10px] shrink-0 border ${
                              iso.isStable
                                ? 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800'
                                : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800'
                            }`}
                          >
                            <span className="leading-none">{iso.elementSymbol}</span>
                          </span>
                          <div className="truncate">
                            <span className="font-bold text-xs text-slate-900 dark:text-white truncate block">
                              {iso.name}
                            </span>
                            <span className="text-[10px] text-slate-400 block truncate">
                              t½: {iso.halfLife}
                            </span>
                          </div>
                        </div>

                        <span
                          className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full shrink-0 font-mono ${
                            iso.isStable
                              ? 'bg-blue-100 dark:bg-blue-950/80 text-blue-800 dark:text-blue-300'
                              : 'bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300'
                          }`}
                        >
                          {iso.isStable ? 'STABLE' : iso.decayMode.split(' ')[0]}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Right Column: Detail Card for Selected Isotope */}
              <div className="w-full md:w-7/12 flex flex-col justify-between p-4 sm:p-5 rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white shadow-xl font-mono border border-slate-700 overflow-y-auto">
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3 border-b border-slate-700/80 pb-3">
                    <div className="flex items-center gap-3">
                      <span className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex flex-col items-center justify-center font-bold shrink-0">
                        <span className="text-xs leading-none text-emerald-300">{selectedIsotope.massNumber}</span>
                        <span className="text-base leading-none">{selectedIsotope.elementSymbol}</span>
                      </span>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="text-lg font-bold text-white">{selectedIsotope.name}</h3>
                          {selectedIsotope.isStable ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-500/20 text-blue-300 border border-blue-500/40">
                              STABLE NUCLIDE
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1">
                              <Radiation size={11} /> RADIOACTIVE ({selectedIsotope.decayMode})
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 font-sans mt-0.5">
                          Protons (Z): <strong className="text-white font-mono">{selectedIsotope.atomicNumber}</strong> · Neutrons (N): <strong className="text-white font-mono">{selectedIsotope.neutrons}</strong> · Mass: <strong className="text-white font-mono">{selectedIsotope.massNumber} u</strong>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <div className="text-[10px] text-slate-400 uppercase tracking-widest">Half-Life (t½)</div>
                      <div className="text-base sm:text-lg font-bold text-amber-400 mt-0.5">{selectedIsotope.halfLife}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Natural Abundance</span>
                      <span className="text-xs sm:text-sm font-bold text-white mt-0.5 block truncate">{selectedIsotope.naturalAbundance || 'Trace'}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Binding Energy</span>
                      <span className="text-xs sm:text-sm font-bold text-emerald-400 mt-0.5 block truncate">{selectedIsotope.bindingEnergyPerNucleon} MeV/A</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Particle Emitted</span>
                      <span className="text-xs sm:text-sm font-bold text-amber-300 mt-0.5 block truncate">{selectedIsotope.decayParticle}</span>
                    </div>

                    <div className="p-2 rounded-lg bg-slate-800/80 border border-slate-700">
                      <span className="text-slate-400 block text-[10px]">Daughter Product</span>
                      <span className="text-xs sm:text-sm font-bold text-sky-300 mt-0.5 block truncate">{selectedIsotope.daughterNuclide}</span>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-xs text-slate-300 font-sans leading-relaxed">
                    <strong className="text-slate-400 font-mono text-[10px] uppercase block mb-1">Scientific & Practical Applications:</strong>
                    {selectedIsotope.applications}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Selected Nuclide #{selectedIsotope.atomicNumber}</span>
                  <span className="text-emerald-400 font-semibold">100% IUPAC & NuDat 3.0 Verified</span>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: URANIUM-238 DECAY CASCADE                                          */}
          {/* ========================================================================= */}
          {activeTab === 'chains' && (
            <div className="space-y-4">
              <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 text-xs text-amber-900 dark:text-amber-200 leading-relaxed font-sans">
                <strong>Uranium-238 Radium Decay Series:</strong> A 14-step natural radioactive transmutation cascade beginning at primordial Uranium-238 (half-life: 4.468 billion years) and concluding at permanently stable Lead-206. Alpha decays reduce mass number by 4 (ΔA = -4, ΔZ = -2), while Beta-minus decays convert a neutron into a proton (ΔA = 0, ΔZ = +1).
              </div>

              <div className="space-y-2">
                {U238_DECAY_SERIES.map((step) => {
                  const isAlpha = step.mode.includes('Alpha');

                  return (
                    <div
                      key={step.step}
                      className="p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 font-mono text-xs"
                    >
                      <div className="flex items-center gap-2.5">
                        <span className="w-6 h-6 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 flex items-center justify-center font-bold text-slate-700 dark:text-slate-200 text-[11px] shrink-0">
                          {step.step}
                        </span>

                        <div>
                          <div className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{step.parent}</span>
                            <ArrowRight size={13} className="text-slate-400 dark:text-slate-500" />
                            <span className={step.step === 14 ? 'text-emerald-700 dark:text-emerald-400 font-extrabold' : 'text-blue-700 dark:text-blue-400'}>
                              {step.daughter}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 dark:text-slate-400 font-sans mt-0.5">
                            Half-Life: <strong className="font-mono text-slate-700 dark:text-slate-300">{step.halfLife}</strong> · Q-Value Energy: <strong className="font-mono text-amber-700 dark:text-amber-400">{step.energy}</strong>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isAlpha
                              ? 'bg-rose-100 dark:bg-rose-950/80 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800'
                              : 'bg-indigo-100 dark:bg-indigo-950/80 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800'
                          }`}
                        >
                          {step.mode} ({step.particleEmitted})
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-semibold w-16 text-right">
                          ΔZ={step.deltaZ > 0 ? `+${step.deltaZ}` : step.deltaZ}, ΔA={step.deltaA}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: NUCLEAR BINDING ENERGY CURVE                                       */}
          {/* ========================================================================= */}
          {activeTab === 'binding' && (
            <div className="space-y-3 flex-1 overflow-y-auto pr-1">
              <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-sans shrink-0">
                <strong>The Curve of Nuclear Binding Energy:</strong> Binding energy per nucleon (Eb/A) quantifies how tightly protons and neutrons are bound together. The apex is reached at <strong>Iron-56 (⁵⁶Fe)</strong> and <strong>Nickel-62 (⁶²Ni)</strong> (≈ 8.8 MeV/nucleon).
                <ul className="list-disc pl-5 mt-1 space-y-0.5">
                  <li><strong>Fusion Realm (Left of Fe-56)</strong>: Fusing light nuclei releases immense energy (powers stars, hydrogen bombs, and fusion reactors).</li>
                  <li><strong>Fission Realm (Right of Fe-56)</strong>: Splitting very heavy nuclei releases energy (powers commercial nuclear fission reactors).</li>
                </ul>
              </div>

              {/* Binding Energy SVG Visualization Curve */}
              <div className="p-4 sm:p-5 rounded-2xl bg-slate-900 text-white shadow-xl space-y-3 font-mono border border-slate-800 shrink-0">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 border-b border-slate-800 pb-2.5 text-xs">
                  <div>
                    <span className="text-slate-400 font-bold uppercase tracking-wider text-[11px] block">
                      Nuclear Binding Energy per Nucleon (E_b / A) vs Mass Number (A)
                    </span>
                    <span className="text-[10px] text-slate-500 font-sans">
                      Natural quantum binding energy curve modeled with nuclear shell saturation & Coulomb repulsion
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-full bg-rose-950/80 text-rose-300 border border-rose-800/60 text-[10px] font-bold">
                      Apex: ⁵⁶Fe (8.79 MeV) · ⁶²Ni (8.80 MeV)
                    </span>
                  </div>
                </div>

                {/* Graph Container - Rock Solid Fixed Dimensions, No Layout Shift */}
                <div className="relative h-72 w-full min-h-[288px] max-h-[288px] bg-slate-950/60 rounded-xl border border-slate-800/80 overflow-hidden select-none">
                  <svg
                    className="w-full h-full"
                    viewBox="0 0 500 220"
                    preserveAspectRatio="none"
                    onMouseLeave={() => setHoveredBindingPoint(null)}
                  >
                    <defs>
                      {/* Gradient fill under the curve */}
                      <linearGradient id="bindingGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.32" />
                        <stop offset="60%" stopColor="#059669" stopOpacity="0.08" />
                        <stop offset="100%" stopColor="#047857" stopOpacity="0.00" />
                      </linearGradient>
                      {/* Line glow filter */}
                      <filter id="curveGlow" x="-20%" y="-20%" width="140%" height="140%">
                        <feDropShadow dx="0" dy="0" stdDeviation="1.5" floodColor="#34d399" floodOpacity="0.6" />
                      </filter>
                    </defs>

                    {/* Horizontal grid lines */}
                    <line x1="40" y1="20" x2="480" y2="20" stroke="#1e293b" strokeDasharray="3,3" />
                    <line x1="40" y1="58" x2="480" y2="58" stroke="#1e293b" strokeDasharray="3,3" />
                    <line x1="40" y1="96" x2="480" y2="96" stroke="#1e293b" strokeDasharray="3,3" />
                    <line x1="40" y1="134" x2="480" y2="134" stroke="#1e293b" strokeDasharray="3,3" />
                    <line x1="40" y1="172" x2="480" y2="172" stroke="#1e293b" strokeDasharray="3,3" />
                    <line x1="40" y1="200" x2="480" y2="200" stroke="#334155" strokeWidth="1.5" />
                    <line x1="40" y1="10" x2="40" y2="200" stroke="#334155" strokeWidth="1.5" />

                    {/* Y-Axis Energy Labels */}
                    <text x="8" y="24" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">9.0 MeV</text>
                    <text x="8" y="62" fill="#64748b" fontSize="8" fontFamily="monospace">7.0 MeV</text>
                    <text x="8" y="100" fill="#64748b" fontSize="8" fontFamily="monospace">5.0 MeV</text>
                    <text x="8" y="138" fill="#64748b" fontSize="8" fontFamily="monospace">3.0 MeV</text>
                    <text x="8" y="176" fill="#64748b" fontSize="8" fontFamily="monospace">1.0 MeV</text>
                    <text x="14" y="204" fill="#94a3b8" fontSize="8.5" fontFamily="monospace">0 MeV</text>

                    {/* X-Axis Mass Number Labels */}
                    <text x="40" y="214" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">A=1</text>
                    <text x="113" y="214" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">A=40</text>
                    <text x="187" y="214" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">A=80</text>
                    <text x="260" y="214" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">A=120</text>
                    <text x="333" y="214" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">A=160</text>
                    <text x="407" y="214" fill="#64748b" fontSize="8" textAnchor="middle" fontFamily="monospace">A=200</text>
                    <text x="480" y="214" fill="#94a3b8" fontSize="8" textAnchor="middle" fontFamily="monospace">A=240</text>

                    {/* Area under curve */}
                    <path d={bindingAreaD} fill="url(#bindingGrad)" />

                    {/* Smooth Catmull-Rom Spline Curve */}
                    <path
                      d={bindingPathD}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="2.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      filter="url(#curveGlow)"
                    />

                    {/* Secondary theoretical baseline curve */}
                    <path
                      d={bindingPathD}
                      fill="none"
                      stroke="#34d399"
                      strokeWidth="1.2"
                      strokeLinecap="round"
                    />

                    {/* Active Point Vertical & Horizontal Crosshair Guide */}
                    {hoveredCoords && (
                      <g pointerEvents="none">
                        <line
                          x1={hoveredCoords.x}
                          y1={hoveredCoords.y}
                          x2={hoveredCoords.x}
                          y2="200"
                          stroke="#38bdf8"
                          strokeWidth="1.2"
                          strokeDasharray="2,2"
                          strokeOpacity="0.75"
                        />
                        <line
                          x1="40"
                          y1={hoveredCoords.y}
                          x2={hoveredCoords.x}
                          y2={hoveredCoords.y}
                          stroke="#38bdf8"
                          strokeWidth="1"
                          strokeDasharray="2,2"
                          strokeOpacity="0.5"
                        />
                        <circle
                          cx={hoveredCoords.x}
                          cy={hoveredCoords.y}
                          r="8"
                          fill="none"
                          stroke="#38bdf8"
                          strokeWidth="1.5"
                          strokeDasharray="3,2"
                        />
                      </g>
                    )}

                    {/* Data Points along the curve */}
                    {bindingCoords.map(({ x, y, pt }) => {
                      const isPeak = pt.type === 'peak';
                      const isHovered = hoveredBindingPoint?.nuclide === pt.nuclide;
                      const showLabel = pt.showLabel ?? (isPeak || pt.type === 'fusion-fuel');

                      return (
                        <g
                          key={pt.nuclide}
                          className="cursor-pointer"
                          onMouseEnter={() => setHoveredBindingPoint(pt)}
                        >
                          {/* Generous hover hotspot for smooth continuous cursor glide */}
                          <circle cx={x} cy={y} r="14" fill="transparent" />

                          {/* Outer pulse circle for peak */}
                          {isPeak && (
                            <circle
                              cx={x}
                              cy={y}
                              r={isHovered ? 8 : 6}
                              fill="none"
                              stroke="#ef4444"
                              strokeWidth="1"
                              strokeDasharray="2,2"
                              className="animate-pulse"
                            />
                          )}

                          {/* Core node dot - Fixed sizes without violent jumps */}
                          <circle
                            cx={x}
                            cy={y}
                            r={isPeak ? 4.5 : isHovered ? 4.5 : 3}
                            fill={isPeak ? '#ef4444' : isHovered ? '#38bdf8' : '#10b981'}
                            stroke="#ffffff"
                            strokeWidth={isPeak || isHovered ? 1.5 : 0.8}
                          />

                          {/* Static label on key landmarks - Fixed font size and weight */}
                          {showLabel && (
                            <text
                              x={x + (pt.massNumber <= 4 ? 4 : isPeak ? 0 : 3)}
                              y={isPeak ? y - 8 : pt.massNumber === 4 ? y - 6 : pt.massNumber <= 2 ? y + 10 : y - 5}
                              textAnchor={isPeak ? 'middle' : 'start'}
                              fill={isPeak ? '#f87171' : isHovered ? '#38bdf8' : '#cbd5e1'}
                              fontSize={isPeak ? '9' : '7.5'}
                              fontWeight="bold"
                              fontFamily="monospace"
                            >
                              {pt.nuclide}
                            </text>
                          )}
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Interactive Landmark Inspector Pill - Fixed In Place, Rock Solid, Zero Layout Shift */}
                <div className="h-11 min-h-[44px] max-h-[44px] flex items-center justify-between px-3.5 rounded-xl bg-slate-950/90 border border-slate-800 text-[11px] overflow-hidden select-none shrink-0">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="text-slate-400 font-sans font-semibold tracking-wide shrink-0">
                      Active Nucleus:
                    </span>
                    {hoveredBindingPoint ? (
                      <div className="flex items-center gap-2 truncate font-mono">
                        <span className="px-2 py-0.5 rounded-md bg-emerald-950/90 border border-emerald-600/70 text-emerald-300 font-bold text-xs shrink-0 shadow-xs">
                          {hoveredBindingPoint.nuclide}
                        </span>
                        <span className="text-slate-200 font-semibold shrink-0">
                          Mass A = {hoveredBindingPoint.massNumber}
                        </span>
                        <span className="text-slate-600 shrink-0">·</span>
                        <span className="text-amber-400 font-bold shrink-0">
                          {hoveredBindingPoint.bindingEnergy.toFixed(3)} MeV/nucleon
                        </span>
                        <span className="text-slate-600 shrink-0 hidden md:inline">·</span>
                        <span className={`text-[10px] px-1.5 py-0.5 rounded font-sans font-semibold shrink-0 hidden md:inline ${
                          hoveredBindingPoint.type === 'peak'
                            ? 'bg-rose-950/70 text-rose-300 border border-rose-800/60'
                            : hoveredBindingPoint.type === 'fusion-fuel'
                            ? 'bg-emerald-950/70 text-emerald-300 border border-emerald-800/60'
                            : 'bg-amber-950/70 text-amber-300 border border-amber-800/60'
                        }`}>
                          {hoveredBindingPoint.type === 'peak'
                            ? 'Apex Peak Stability'
                            : hoveredBindingPoint.type === 'fusion-fuel'
                            ? 'Fusion Exothermic Regime'
                            : 'Fission Exothermic Regime'}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-slate-400 font-sans text-xs">
                        <span className="relative flex h-2 w-2 shrink-0">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        <span className="text-slate-400 italic">
                          Hover any node along the curve
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Fixed Static Legend on the Right to Anchor the Container In Place */}
                  <div className="hidden sm:flex items-center gap-3 text-[10px] text-slate-400 shrink-0 font-sans border-l border-slate-800 pl-3">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
                      <span>Fusion Fuel</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0" />
                      <span>Peak (⁵⁶Fe / ⁶²Ni)</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-500 shrink-0" />
                      <span>Fission Heavy</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: HALF-LIFE DECAY SIMULATOR                                          */}
          {/* ========================================================================= */}
          {activeTab === 'clock' && (
            <div className="space-y-4">
              {/* Isotope Selection & Controls */}
              <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="flex-1">
                    <label className="text-slate-500 dark:text-slate-400 font-bold block mb-1">Select Radioactive Nuclide:</label>
                    <div className="relative">
                      <select
                        value={clockIsotopeId}
                        onChange={(e) => {
                          setClockIsotopeId(e.target.value);
                          setHalfLivesElapsed(1.0);
                          setIsPlayingDecay(false);
                        }}
                        className="w-full sm:w-auto min-w-[240px] px-3.5 py-1.5 pr-8 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-emerald-600 shadow-xs cursor-pointer appearance-none"
                      >
                        {ISOTOPES_DATABASE.filter((iso) => !iso.isStable).map((iso) => (
                          <option key={iso.id} value={iso.id} className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-100 py-1">
                            {iso.name} (t½ = {iso.halfLife})
                          </option>
                        ))}
                      </select>
                      <ChevronDown size={14} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    {/* Modern Max Scale Dropdown List */}
                    <div className="relative" ref={maxScaleRef}>
                      <button
                        type="button"
                        onClick={() => setIsMaxScaleOpen(!isMaxScaleOpen)}
                        className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 hover:border-emerald-500/70 dark:hover:border-emerald-500/70 shadow-xs hover:shadow-sm text-xs font-mono transition-all cursor-pointer group select-none"
                        title="Change maximum half-life timeline scale"
                      >
                        <SlidersHorizontal size={12} className="text-emerald-600 dark:text-emerald-400 shrink-0 group-hover:rotate-45 transition-transform duration-200" />
                        <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400 dark:text-slate-500 font-sans">
                          Max Scale:
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                          {maxHalfLives.toFixed(1)} t½
                        </span>
                        <ChevronDown
                          size={13}
                          className={`text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
                            isMaxScaleOpen ? 'rotate-180 text-emerald-600 dark:text-emerald-400' : ''
                          }`}
                        />
                      </button>

                      {/* Floating Modern Dropdown Menu */}
                      {isMaxScaleOpen && (
                        <div className="absolute right-0 top-full mt-1.5 w-60 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700/80 shadow-2xl backdrop-blur-md p-1.5 z-40 animate-in fade-in zoom-in-95 duration-150 font-mono">
                          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border-b border-slate-100 dark:border-slate-800 mb-1 flex items-center justify-between font-sans">
                            <span>Timeline Scope</span>
                            <span className="text-emerald-600 dark:text-emerald-400 font-mono text-[9px]">Max t½</span>
                          </div>

                          {[
                            { value: 3.0, label: '3.0 t½', desc: 'Short', sub: 'Up to 3 half-lives · 87.5% decay' },
                            { value: 5.0, label: '5.0 t½', desc: 'Standard', sub: 'Up to 5 half-lives · 96.9% decay' },
                            { value: 10.0, label: '10.0 t½', desc: 'Extended', sub: 'Up to 10 half-lives · 99.9% decay' },
                          ].map((option) => {
                            const isSelected = maxHalfLives === option.value;
                            return (
                              <button
                                key={option.value}
                                type="button"
                                onClick={() => {
                                  setMaxHalfLives(option.value);
                                  if (halfLivesElapsed > option.value) setHalfLivesElapsed(option.value);
                                  setIsMaxScaleOpen(false);
                                }}
                                className={`w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start justify-between gap-2 cursor-pointer ${
                                  isSelected
                                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 font-bold border border-emerald-200 dark:border-emerald-800/80 shadow-xs'
                                    : 'hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-300 font-medium'
                                }`}
                              >
                                <div>
                                  <div className="flex items-center gap-1.5">
                                    <span className="text-xs font-bold">{option.label}</span>
                                    <span className="text-[10px] text-slate-400 dark:text-slate-500 font-sans font-normal">({option.desc})</span>
                                  </div>
                                  <p className="text-[10px] text-slate-400 dark:text-slate-500 font-sans mt-0.5">{option.sub}</p>
                                </div>
                                {isSelected && (
                                  <Check size={14} className="text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5" />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsPlayingDecay(!isPlayingDecay)}
                      className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                    >
                      <Play size={13} />
                      <span>{isPlayingDecay ? 'Pause' : 'Animate Decay'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setHalfLivesElapsed(1.0);
                        setIsPlayingDecay(false);
                      }}
                      className="p-1.5 rounded-lg bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors cursor-pointer shadow-xs"
                      title="Reset clock to 1.0 half-life"
                    >
                      <RotateCcw size={15} />
                    </button>
                  </div>
                </div>

                {/* Slider */}
                <div className="space-y-1.5 pt-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-700 dark:text-slate-300">
                      Elapsed Time:{' '}
                      <span className="text-emerald-700 dark:text-emerald-400">
                        {halfLivesElapsed.toFixed(2)} Half-Lives
                      </span>{' '}
                      (≈ <span className="text-amber-600 dark:text-amber-400 font-semibold">{absoluteElapsedDisplay}</span>)
                    </span>
                    <span className="font-bold text-slate-500 dark:text-slate-400">
                      Max: {maxHalfLives.toFixed(1)} Half-Lives
                    </span>
                  </div>

                  <input
                    type="range"
                    min="0"
                    max={maxHalfLives}
                    step="0.05"
                    value={halfLivesElapsed}
                    onChange={(e) => setHalfLivesElapsed(parseFloat(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer"
                  />
                </div>
              </div>

              {/* Statistics & Decay Representation */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl space-y-4 font-mono">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-center">
                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] uppercase text-slate-400 block">Remaining Parent Nuclide</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-amber-400 mt-1 block">
                      {remainingPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">{clockIsotope.name}</span>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-800/80 border border-slate-700">
                    <span className="text-[10px] uppercase text-slate-400 block">Transmuted Daughter Product</span>
                    <span className="text-2xl sm:text-3xl font-extrabold text-emerald-400 mt-1 block">
                      {daughterPercent}%
                    </span>
                    <span className="text-[10px] text-slate-400 font-sans mt-0.5 block">{clockIsotope.daughterNuclide}</span>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-800/80 border border-slate-700 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] uppercase text-slate-400 font-bold tracking-wider">
                          Radioactive Decay Law
                        </span>
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950/80 text-emerald-300 border border-emerald-800/80 font-bold">
                          e-Formulation
                        </span>
                      </div>

                      {/* Mathematical formula with proper formatting and superscripts */}
                      <div className="my-2 py-1.5 px-2 rounded-lg bg-slate-900/90 border border-slate-700/80 flex items-center justify-center text-center">
                        <div className="text-base sm:text-lg font-serif italic text-white flex items-center justify-center gap-1 select-none">
                          <span className="font-semibold not-italic font-mono text-emerald-400">N(t)</span>
                          <span className="text-slate-400 font-mono not-italic text-sm">=</span>
                          <span className="font-semibold text-amber-300">
                            N<sub className="text-[11px] not-italic text-amber-200">0</sub>
                          </span>
                          <span className="text-slate-300 not-italic text-sm">·</span>
                          <span className="font-semibold text-emerald-300">
                            e<sup className="text-[11px] not-italic text-emerald-200 font-mono font-bold tracking-tight">−λt</sup>
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1 text-left font-sans text-[10px] text-slate-400 border-t border-slate-700/60 pt-1.5">
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">t½ (Half-Life):</span>
                        <span className="text-slate-200 font-bold">{clockIsotope.halfLife}</span>
                      </div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">λ = ln(2)/t½:</span>
                        <span className="text-emerald-400 font-bold">{decayConstantDisplay}</span>
                      </div>
                      <div className="flex items-center justify-between font-mono">
                        <span className="text-slate-400">N(t)/N₀ ratio:</span>
                        <span className="text-amber-300 font-bold">{remainingFraction.toFixed(4)}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* 100-Atom Visual Grid */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-[10px] uppercase text-slate-400 tracking-wider">
                    <span>Visual 100-Atom Population Decay Sample:</span>
                    <span>
                      <strong className="text-amber-400">{parentAtomCount} Parent</strong> /{' '}
                      <strong className="text-emerald-400">{100 - parentAtomCount} Daughter</strong> atoms
                    </span>
                  </div>
                  <div className="grid grid-cols-10 gap-1.5 p-3 rounded-xl bg-slate-950 border border-slate-800">
                    {Array.from({ length: 100 }).map((_, idx) => {
                      const isParent = idx < parentAtomCount;
                      return (
                        <div
                          key={idx}
                          className={`h-4 sm:h-5 rounded flex items-center justify-center text-[9px] font-bold transition-all duration-300 ${
                            isParent
                              ? 'bg-amber-500 text-slate-950 shadow-xs shadow-amber-500/30 font-extrabold'
                              : 'bg-emerald-600/50 text-emerald-200 border border-emerald-500/30'
                          }`}
                          title={isParent ? `Parent: ${clockIsotope.name}` : `Daughter: ${clockIsotope.daughterNuclide}`}
                        >
                          {isParent ? clockIsotope.elementSymbol : '✓'}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
