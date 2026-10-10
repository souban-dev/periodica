import React, { useState, useEffect, useMemo } from 'react';
import {
  REDOX_SERIES,
  RedoxReaction,
  METAL_ACTIVITY_TIERS,
  SOLUBILITY_RULES,
} from '../data/electrochemistry';
import {
  Zap,
  Battery,
  FlaskConical,
  Droplets,
  ArrowRight,
  Scale,
  Info,
  X,
  Flame,
  Sparkles,
  ChevronRight,
  Search,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

interface ElectrochemistryLabProps {
  onClose: () => void;
  initialElementSymbol?: string;
}

export const ElectrochemistryLab: React.FC<ElectrochemistryLabProps> = ({
  onClose,
  initialElementSymbol,
}) => {
  const [activeTab, setActiveTab] = useState<'series' | 'cell' | 'activity' | 'solubility'>('series');
  const [searchQuery, setSearchQuery] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  // Cell Builder States (Default: Classic Daniell Cell Zn/Cu)
  const [anodeId, setAnodeId] = useState<string>('zn');
  const [cathodeId, setCathodeId] = useState<string>('cu');

  // Precipitation Matrix States
  const [selectedCation, setSelectedCation] = useState<string>('Ag⁺');
  const [selectedAnion, setSelectedAnion] = useState<string>('Cl⁻');

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

  // Find initial matching reaction if provided
  useEffect(() => {
    if (initialElementSymbol) {
      const match = REDOX_SERIES.find(
        (r) => r.elementSymbol.toLowerCase() === initialElementSymbol.toLowerCase()
      );
      if (match) {
        if (match.potential < 0) {
          setAnodeId(match.id);
        } else {
          setCathodeId(match.id);
        }
      }
    }
  }, [initialElementSymbol]);

  // Filtered redox reactions
  const filteredSeries = useMemo(() => {
    if (!searchQuery.trim()) return REDOX_SERIES;
    const q = searchQuery.toLowerCase().trim();
    return REDOX_SERIES.filter(
      (r) =>
        r.name.toLowerCase().includes(q) ||
        r.elementSymbol.toLowerCase().includes(q) ||
        r.halfReaction.toLowerCase().includes(q)
    );
  }, [searchQuery]);

  // Cell calculations
  const anode = REDOX_SERIES.find((r) => r.id === anodeId) || REDOX_SERIES[8]; // Zn
  const cathode = REDOX_SERIES.find((r) => r.id === cathodeId) || REDOX_SERIES[17]; // Cu

  // Standard Cell Potential E°cell = E°cathode - E°anode
  const cellPotential = Number((cathode.potential - anode.potential).toFixed(3));
  const isSpontaneous = cellPotential > 0;
  // Free Energy ΔG° = -n F E° (F = 96485 C/mol, 1 J = 1 C·V)
  const nElectrons = Math.max(anode.electrons, cathode.electrons);
  const deltaGkJ = -Number(((nElectrons * 96.485 * cellPotential)).toFixed(1));

  // Precipitation calculation
  const getPrecipitationResult = (cat: string, an: string) => {
    if (an === 'NO₃⁻') return { precipitate: false, text: 'Soluble: All nitrates are 100% soluble in water.' };
    if (cat === 'Na⁺' || cat === 'K⁺' || cat === 'NH₄⁺') {
      return { precipitate: false, text: 'Soluble: Group 1 and ammonium salts never precipitate.' };
    }
    if (an === 'Cl⁻' || an === 'Br⁻' || an === 'I⁻') {
      if (cat === 'Ag⁺') {
        const color = an === 'I⁻' ? 'Bright yellow' : an === 'Br⁻' ? 'Cream' : 'Curdy white';
        return { precipitate: true, color: '#fef08a', text: `Precipitate Forms: ${color} silver halide (${cat.replace('⁺', '')}${an.replace('⁻', '')}↓).` };
      }
      if (cat === 'Pb²⁺') {
        const color = an === 'I⁻' ? 'Golden yellow' : 'White';
        return { precipitate: true, color: '#fde047', text: `Precipitate Forms: ${color} lead halide (Pb${an.replace('⁻', '')}₂↓).` };
      }
      return { precipitate: false, text: 'Soluble: Common soluble halide solution.' };
    }
    if (an === 'SO₄²⁻') {
      if (cat === 'Ba²⁺' || cat === 'Pb²⁺') {
        return { precipitate: true, color: '#ffffff', text: `Precipitate Forms: Dense white sulfate precipitate (${cat.replace('²⁺', '')}SO₄↓).` };
      }
      if (cat === 'Ca²⁺') {
        return { precipitate: true, color: '#f8fafc', text: 'Slightly Soluble: Gypsum / calcium sulfate precipitate forms at higher concentrations.' };
      }
      return { precipitate: false, text: 'Soluble: Soluble aqueous sulfate solution.' };
    }
    if (an === 'OH⁻') {
      if (cat === 'Cu²⁺') {
        return { precipitate: true, color: '#38bdf8', text: 'Precipitate Forms: Sky-blue gelatinous copper(II) hydroxide precipitate Cu(OH)₂↓.' };
      }
      if (cat === 'Fe³⁺') {
        return { precipitate: true, color: '#b45309', text: 'Precipitate Forms: Rust-red/brown iron(III) hydroxide precipitate Fe(OH)₃↓.' };
      }
      if (cat === 'Fe²⁺') {
        return { precipitate: true, color: '#15803d', text: 'Precipitate Forms: Dirty green iron(II) hydroxide precipitate Fe(OH)₂↓.' };
      }
      if (cat === 'Mg²⁺' || cat === 'Al³⁺' || cat === 'Zn²⁺' || cat === 'Pb²⁺') {
        return { precipitate: true, color: '#ffffff', text: `Precipitate Forms: White gelatinous hydroxide precipitate.` };
      }
    }
    if (an === 'CO₃²⁻' || an === 'PO₄³⁻') {
      return { precipitate: true, color: '#e2e8f0', text: `Precipitate Forms: Insoluble ${cat} carbonate/phosphate precipitate.` };
    }
    return { precipitate: false, text: 'Soluble aqueous solution.' };
  };

  const precipResult = getPrecipitationResult(selectedCation, selectedAnion);

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
        className={`bg-white dark:bg-[#0c121e] rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col my-auto max-h-[92vh] text-slate-800 dark:text-slate-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          isOpen && !isClosing
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-3'
        }`}
      >
        {/* Top Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0c121e]/90">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center shadow-xs">
              <Zap size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                  Electrochemical Series & Redox Lab
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 border border-transparent dark:border-amber-800 font-mono text-[10px] font-bold">
                  E° vs SHE (298K)
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Standard reduction potentials, galvanic voltaic cells, metal activity, and precipitation rules
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

        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80 overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => {
              setActiveTab('series');
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'series'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Scale size={13} />
            <span>1. Reduction Potentials (E°)</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('cell');
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'cell'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Battery size={13} />
            <span>2. Galvanic Cell Simulator</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('activity');
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'activity'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <Flame size={13} />
            <span>3. Metal Activity & Reactivity</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('solubility');
            }}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'solubility'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <FlaskConical size={13} />
            <span>4. Salt Precipitation Matrix</span>
          </button>
        </div>

        {/* Tab Body */}
        <div className="p-4 sm:p-5 flex-1 overflow-y-auto space-y-4 bg-slate-50/50 dark:bg-[#090d16]">
          {/* ========================================================================= */}
          {/* TAB 1: STANDARD REDUCTION POTENTIALS TABLE                                */}
          {/* ========================================================================= */}
          {activeTab === 'series' && (
            <div className="space-y-4">
              {/* Search & Top Legend */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-white dark:bg-[#0c121e] p-3 rounded-xl border border-slate-200 dark:border-slate-800 shadow-xs">
                <div className="relative flex-1 max-w-sm">
                  <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search metal, half-reaction, symbol..."
                    className="w-full pl-7 pr-3 py-1 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-mono text-xs outline-none focus:border-blue-500"
                  />
                </div>

                <div className="flex items-center gap-4 text-[11px] font-mono">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                    <span className="text-slate-600 dark:text-slate-300">Strong Reducing Agents (Negative E°)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                    <span className="text-slate-600 dark:text-slate-300">Strong Oxidizing Agents (Positive E°)</span>
                  </div>
                </div>
              </div>

              {/* Series Table */}
              <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] shadow-xs">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-slate-100 dark:bg-slate-900/90 text-slate-600 dark:text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-200 dark:border-slate-800">
                    <tr>
                      <th className="py-2.5 px-3">Element / Species</th>
                      <th className="py-2.5 px-3">Standard Half-Reaction (Reduction)</th>
                      <th className="py-2.5 px-3 text-right">E° (Volts)</th>
                      <th className="py-2.5 px-3">Chemical Characteristics & Uses</th>
                      <th className="py-2.5 px-3 text-center">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
                    {filteredSeries.map((reaction) => {
                      const isNegative = reaction.potential < 0;
                      const isShe = reaction.potential === 0;

                      return (
                        <tr
                          key={reaction.id}
                          className={`hover:bg-slate-50 dark:hover:bg-slate-900/60 transition-colors ${
                            isShe ? 'bg-amber-50/60 dark:bg-amber-950/30 font-semibold' : ''
                          }`}
                        >
                          <td className="py-2.5 px-3 flex items-center gap-2">
                            <span className="font-bold text-slate-900 dark:text-white">{reaction.name}</span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                              {reaction.elementSymbol}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 font-semibold text-slate-800 dark:text-slate-200 whitespace-nowrap">
                            {reaction.halfReaction}
                          </td>
                          <td className="py-2.5 px-3 text-right tabular-nums whitespace-nowrap">
                            <span
                              className={`px-2 py-0.5 rounded font-bold ${
                                isShe
                                  ? 'bg-amber-100 dark:bg-amber-950/70 text-amber-900 dark:text-amber-300 border border-amber-300 dark:border-amber-800'
                                  : isNegative
                                  ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-900'
                                  : 'bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-cyan-300 border border-blue-200 dark:border-blue-900'
                              }`}
                            >
                              {reaction.potential > 0 ? `+${reaction.potential.toFixed(2)}` : reaction.potential.toFixed(2)} V
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-slate-600 dark:text-slate-400 font-sans text-xs max-w-xs leading-snug">
                            {reaction.notes}
                          </td>
                          <td className="py-2.5 px-3 text-center whitespace-nowrap">
                            <button
                              type="button"
                              onClick={() => {
                                if (isNegative) {
                                  setAnodeId(reaction.id);
                                } else {
                                  setCathodeId(reaction.id);
                                }
                                setActiveTab('cell');
                              }}
                              className="px-2 py-1 text-[11px] font-semibold text-blue-700 dark:text-cyan-300 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 rounded border border-blue-200 dark:border-blue-800 transition-colors cursor-pointer"
                              title="Load into Galvanic Cell Simulator"
                            >
                              Simulate Cell →
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: GALVANIC (VOLTAIC) CELL SIMULATOR                                  */}
          {/* ========================================================================= */}
          {activeTab === 'cell' && (
            <div className="space-y-4">
              {/* Presets Bar */}
              <div className="flex flex-wrap items-center gap-2 p-2.5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 text-xs font-mono shadow-xs">
                <span className="text-slate-500 dark:text-slate-400 font-semibold">Preset Cells:</span>
                <button
                  type="button"
                  onClick={() => {
                    setAnodeId('zn');
                    setCathodeId('cu');
                  }}
                  className="px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  ⚡ Classic Daniell Cell (Zn/Cu, +1.10V)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnodeId('li');
                    setCathodeId('cu');
                  }}
                  className="px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  🔋 High Voltage (Li/Cu, +3.38V)
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAnodeId('fe');
                    setCathodeId('ag');
                  }}
                  className="px-2.5 py-1 rounded bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 hover:border-blue-500 text-slate-800 dark:text-slate-200 transition-colors cursor-pointer"
                >
                  💍 Iron-Silver Couple (Fe/Ag, +1.24V)
                </button>
              </div>

              {/* Electrodes Selectors */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Anode Half-Cell (Oxidation) */}
                <div className="p-4 rounded-xl border-2 border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                      Anode Half-Cell (Oxidation: Loss of e⁻)
                    </span>
                    <span className="text-xs font-mono font-bold text-rose-800 dark:text-rose-300">
                      E°red = {anode.potential > 0 ? `+${anode.potential.toFixed(2)}` : anode.potential.toFixed(2)} V
                    </span>
                  </div>

                  <select
                    value={anodeId}
                    onChange={(e) => setAnodeId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-rose-300 dark:border-rose-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-rose-600 shadow-xs cursor-pointer"
                  >
                    {REDOX_SERIES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.elementSymbol}) — E°: {r.potential > 0 ? `+${r.potential}` : r.potential}V
                      </option>
                    ))}
                  </select>

                  <div className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded border border-rose-200 dark:border-rose-900/70">
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">Oxidation Reaction at Anode:</div>
                    <div className="font-bold text-rose-900 dark:text-rose-300 mt-0.5">
                      {anode.reducedSpecies} → {anode.oxidizedSpecies} + {anode.electrons}e⁻
                    </div>
                  </div>
                </div>

                {/* Cathode Half-Cell (Reduction) */}
                <div className="p-4 rounded-xl border-2 border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-blue-700 dark:text-cyan-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
                      Cathode Half-Cell (Reduction: Gain of e⁻)
                    </span>
                    <span className="text-xs font-mono font-bold text-blue-800 dark:text-cyan-300">
                      E°red = {cathode.potential > 0 ? `+${cathode.potential.toFixed(2)}` : cathode.potential.toFixed(2)} V
                    </span>
                  </div>

                  <select
                    value={cathodeId}
                    onChange={(e) => setCathodeId(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-blue-300 dark:border-blue-800 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-600 shadow-xs cursor-pointer"
                  >
                    {REDOX_SERIES.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.elementSymbol}) — E°: {r.potential > 0 ? `+${r.potential}` : r.potential}V
                      </option>
                    ))}
                  </select>

                  <div className="text-xs font-mono text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-900 p-2.5 rounded border border-blue-200 dark:border-blue-900/70">
                    <div className="text-slate-400 dark:text-slate-500 text-[10px] uppercase">Reduction Reaction at Cathode:</div>
                    <div className="font-bold text-blue-900 dark:text-cyan-300 mt-0.5">
                      {cathode.oxidizedSpecies} + {cathode.electrons}e⁻ → {cathode.reducedSpecies}
                    </div>
                  </div>
                </div>
              </div>

              {/* Live Voltmeter & Thermodynamics HUD */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 text-white shadow-xl space-y-4 font-mono">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-700 pb-3">
                  <div>
                    <span className="text-[10px] uppercase tracking-widest text-slate-400 block">
                      Standard Cell Electromotive Force (EMF)
                    </span>
                    <div className="text-3xl sm:text-4xl font-extrabold text-amber-400 mt-0.5 tabular-nums flex items-baseline gap-2">
                      <span>{cellPotential > 0 ? `+${cellPotential.toFixed(3)}` : cellPotential.toFixed(3)}</span>
                      <span className="text-xl text-slate-400 font-normal">Volts</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {isSpontaneous ? (
                      <span className="px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold flex items-center gap-1.5">
                        <CheckCircle2 size={14} />
                        Spontaneous Galvanic Battery (ΔG° &lt; 0)
                      </span>
                    ) : (
                      <span className="px-3 py-1 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/40 text-xs font-bold flex items-center gap-1.5">
                        <AlertTriangle size={14} />
                        Non-Spontaneous (Requires External Voltage)
                      </span>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Gibbs Free Energy (ΔG° = -nFE°)</span>
                    <span className="text-base font-bold text-white mt-0.5 block tabular-nums">
                      {deltaGkJ} <span className="text-xs text-slate-400">kJ/mol</span>
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Electrons Transferred (n)</span>
                    <span className="text-base font-bold text-white mt-0.5 block">
                      {nElectrons} e⁻
                    </span>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-800/80 border border-slate-700">
                    <span className="text-slate-400 block text-[10px]">Electron Flow Vector</span>
                    <span className="text-base font-bold text-amber-300 mt-0.5 block">
                      {anode.reducedSpecies} → Wire → {cathode.reducedSpecies}
                    </span>
                  </div>
                </div>

                {/* Standard Cell Notation */}
                <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300">
                  <div className="text-[10px] uppercase text-slate-500 mb-1">Standard IUPAC Cell Notation:</div>
                  <div className="font-bold text-amber-300 text-sm tracking-wide">
                    {anode.reducedSpecies} | {anode.oxidizedSpecies} (1 M) || {cathode.oxidizedSpecies} (1 M) | {cathode.reducedSpecies}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: METAL ACTIVITY & REACTIVITY MATRIX                                */}
          {/* ========================================================================= */}
          {activeTab === 'activity' && (
            <div className="space-y-4">
              <div className="p-3 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60 text-xs text-blue-900 dark:text-blue-200 leading-relaxed font-sans">
                <strong>Activity Series Principle:</strong> Any metal higher on this activity series will displace metals below it from aqueous solutions of their salts (e.g., dipping iron in copper sulfate coats the nail with pink copper: <code className="font-mono font-bold text-blue-700 dark:text-cyan-400">Fe + CuSO₄ → FeSO₄ + Cu</code>).
              </div>

              <div className="space-y-3">
                {METAL_ACTIVITY_TIERS.map((tier, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] shadow-xs space-y-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-2">
                      <div className="flex items-center gap-2">
                        <span
                          className="w-3 h-3 rounded-full shrink-0"
                          style={{ backgroundColor: tier.colorHex }}
                        />
                        <h3 className="font-mono font-bold text-sm text-slate-900 dark:text-white">
                          {tier.level}
                        </h3>
                      </div>
                      <div className="flex items-center gap-1.5 font-mono text-xs font-bold">
                        {tier.metals.map((m) => (
                          <span
                            key={m}
                            className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200"
                          >
                            {m}
                          </span>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5 text-xs font-mono text-slate-700 dark:text-slate-300">
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                        <strong className="text-slate-900 dark:text-white block text-[11px]">💧 Reaction with Water:</strong>
                        <span className="font-sans text-[11.5px] text-slate-600 dark:text-slate-400">{tier.reactionWithWater}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                        <strong className="text-slate-900 dark:text-white block text-[11px]">🧪 Reaction with Dilute Acids:</strong>
                        <span className="font-sans text-[11.5px] text-slate-600 dark:text-slate-400">{tier.reactionWithAcids}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                        <strong className="text-slate-900 dark:text-white block text-[11px]">🔥 Reaction with Oxygen:</strong>
                        <span className="font-sans text-[11.5px] text-slate-600 dark:text-slate-400">{tier.reactionWithOxygen}</span>
                      </div>
                      <div className="p-2 rounded bg-slate-50 dark:bg-slate-900/80 border border-slate-100 dark:border-slate-800">
                        <strong className="text-slate-900 dark:text-white block text-[11px]">⛏️ Metallurgical Extraction:</strong>
                        <span className="font-sans text-[11.5px] text-slate-600 dark:text-slate-400">{tier.extractionMethod}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 4: SALT SOLUBILITY & PRECIPITATION MATRIX                             */}
          {/* ========================================================================= */}
          {activeTab === 'solubility' && (
            <div className="space-y-4">
              {/* Interactive Virtual Test Tube Simulator */}
              <div className="p-4 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 space-y-3 shadow-xs">
                <div className="flex items-center gap-2">
                  <FlaskConical size={16} className="text-blue-600 dark:text-cyan-400" />
                  <h3 className="font-mono font-bold text-xs uppercase tracking-wider text-slate-800 dark:text-slate-200">
                    Interactive Salt Precipitation Predictor
                  </h3>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs font-mono">
                  {/* Select Cation */}
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Select Aqueous Cation:</label>
                    <select
                      value={selectedCation}
                      onChange={(e) => setSelectedCation(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-600"
                    >
                      {['Ag⁺', 'Pb²⁺', 'Ba²⁺', 'Ca²⁺', 'Cu²⁺', 'Fe³⁺', 'Fe²⁺', 'Na⁺', 'K⁺', 'NH₄⁺', 'Mg²⁺', 'Al³⁺', 'Zn²⁺'].map((cat) => (
                        <option key={cat} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>

                  {/* Select Anion */}
                  <div>
                    <label className="text-slate-500 dark:text-slate-400 block mb-1 font-semibold">Select Aqueous Anion:</label>
                    <select
                      value={selectedAnion}
                      onChange={(e) => setSelectedAnion(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-md bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 font-bold text-slate-800 dark:text-slate-100 outline-none focus:border-blue-600"
                    >
                      {['Cl⁻', 'Br⁻', 'I⁻', 'SO₄²⁻', 'OH⁻', 'CO₃²⁻', 'PO₄³⁻', 'NO₃⁻'].map((an) => (
                        <option key={an} value={an}>{an}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Outcome Display */}
                <div
                  className={`p-3.5 rounded-xl border flex items-center gap-3 transition-colors ${
                    precipResult.precipitate
                      ? 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800/80 text-amber-900 dark:text-amber-200'
                      : 'bg-emerald-50 dark:bg-emerald-950/40 border-emerald-300 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200'
                  }`}
                >
                  <div
                    className="w-8 h-8 rounded-full border shadow-xs flex items-center justify-center font-mono font-bold text-xs shrink-0"
                    style={{
                      backgroundColor: precipResult.color || '#e0f2fe',
                      borderColor: '#94a3b8',
                    }}
                  >
                    {precipResult.precipitate ? '↓' : 'aq'}
                  </div>
                  <div>
                    <div className="font-mono font-bold text-sm">
                      {selectedCation} + {selectedAnion} Mixture
                    </div>
                    <div className="text-xs font-sans mt-0.5">{precipResult.text}</div>
                  </div>
                </div>
              </div>

              {/* General Solubility Rules Reference */}
              <div className="space-y-2">
                <h4 className="font-mono font-bold text-xs text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                  Universal General Solubility Guidelines
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {SOLUBILITY_RULES.map((rule, idx) => (
                    <div
                      key={idx}
                      className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#0c121e] shadow-xs text-xs space-y-1"
                    >
                      <div className="font-mono font-bold text-slate-900 dark:text-white">{rule.ion}</div>
                      <p className="text-slate-600 dark:text-slate-400 font-sans text-[11.5px] leading-tight">{rule.rule}</p>
                      <div className="text-[10px] font-mono text-rose-700 dark:text-rose-400 bg-rose-50/70 dark:bg-rose-950/50 p-1 rounded border border-transparent dark:border-rose-900/40">
                        <strong>Exceptions: </strong>{rule.exceptions.join(', ')}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
