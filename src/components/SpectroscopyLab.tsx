import React, { useState, useEffect, useMemo, useRef } from 'react';
import { ElementData } from '../types/element';
import { ELEMENTS } from '../data/elements';
import {
  SPECTRAL_PROFILES,
  ElementSpectralProfile,
  SpectralLine,
  wavelengthToHex,
  nmToEv,
} from '../data/spectroscopy';
import {
  X,
  Flame,
  Sparkles,
  Zap,
  Info,
  ChevronDown,
  Layers,
  Search,
  Eye,
  Activity,
  Check,
} from 'lucide-react';

interface SpectroscopyLabProps {
  onClose: () => void;
  initialElementSymbol?: string;
}

export const SpectroscopyLab: React.FC<SpectroscopyLabProps> = ({
  onClose,
  initialElementSymbol,
}) => {
  const [selectedSymbol, setSelectedSymbol] = useState<string>(
    initialElementSymbol && SPECTRAL_PROFILES[initialElementSymbol]
      ? initialElementSymbol
      : 'H'
  );
  const [activeTab, setActiveTab] = useState<'spectrometer' | 'flame' | 'discharge'>('spectrometer');
  const [spectrumMode, setSpectrumMode] = useState<'emission' | 'absorption'>('emission');
  const [selectedLine, setSelectedLine] = useState<SpectralLine | null>(null);

  // Flame test interactive state
  const [isFlameIgnited, setIsFlameIgnited] = useState(false);
  const [isDippingWire, setIsDippingWire] = useState(false);

  // Discharge tube state
  const [isDischargeOn, setIsDischargeOn] = useState(true);

  // Dropdown selector state
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Modal animations
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
      if (e.key === 'Escape') {
        if (isDropdownOpen) {
          setIsDropdownOpen(false);
        } else {
          handleSmoothClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isDropdownOpen, isClosing]);

  // Click outside to close dropdown
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [isDropdownOpen]);

  // Active spectral profile or fallback for elements not explicitly profiled
  const activeProfile: ElementSpectralProfile = useMemo(() => {
    if (SPECTRAL_PROFILES[selectedSymbol]) {
      return SPECTRAL_PROFILES[selectedSymbol];
    }
    const el = ELEMENTS.find((e) => e.symbol === selectedSymbol) || ELEMENTS[0];
    const generatedLines: SpectralLine[] = el.spectralHex.map((hex, i) => {
      const step = (720 - 410) / Math.max(1, el.spectralHex.length - 1);
      const wl = Math.round(410 + i * step);
      return {
        wavelengthNm: wl,
        intensity: 0.8,
        colorHex: hex,
        energyEv: nmToEv(wl),
        transition: `Emission band #${i + 1}`,
      };
    });

    return {
      symbol: el.symbol,
      name: el.name,
      atomicNumber: el.atomicNumber,
      lines: generatedLines,
      historicNote: el.summary,
    };
  }, [selectedSymbol]);

  // Trigger flame test reaction
  const handleDipWire = () => {
    setIsDippingWire(true);
    setIsFlameIgnited(true);
    setTimeout(() => {
      setIsDippingWire(false);
    }, 800);
  };

  const filteredElementsList = useMemo(() => {
    if (!searchQuery.trim()) return ELEMENTS;
    const q = searchQuery.toLowerCase().trim();
    return ELEMENTS.filter(
      (el) =>
        el.name.toLowerCase().includes(q) ||
        el.symbol.toLowerCase().includes(q) ||
        el.atomicNumber.toString() === q
    );
  }, [searchQuery]);

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto transition-all duration-300 ease-out ${
        isOpen && !isClosing
          ? 'bg-slate-900/60 dark:bg-black/80 backdrop-blur-sm opacity-100'
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
        {/* Sticky Header */}
        <div className="flex items-center justify-between px-5 py-3.5 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-[#0c121e]/90 backdrop-blur">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-rose-500 text-white flex items-center justify-center shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base sm:text-lg font-bold font-mono text-slate-900 dark:text-white">
                  Atomic Emission & Flame Spectrometry Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 dark:bg-purple-950/80 text-purple-800 dark:text-purple-300 border border-transparent dark:border-purple-800 font-mono text-[10px] font-bold">
                  380 – 750 nm Visible Spectrum
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                Spectroscopic fingerprints, Fraunhofer absorption lines, and laboratory flame test colors
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleSmoothClose}
            className="p-1.5 rounded-md hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white transition-colors cursor-pointer"
            title="Close Spectrometry Studio"
          >
            <X size={18} />
          </button>
        </div>

        {/* Studio Navigation & Element Selector Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-2.5 border-b border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950/80">
          {/* Tab Navigation */}
          <div className="flex items-center gap-1 text-xs font-mono">
            <button
              type="button"
              onClick={() => {
                setActiveTab('spectrometer');
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'spectrometer'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Eye size={13} />
              <span>1. Optical Spectrometer</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('flame');
                setIsFlameIgnited(true);
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'flame'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Flame size={13} />
              <span>2. Bunsen Burner Flame Test</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('discharge');
              }}
              className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
                activeTab === 'discharge'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900'
              }`}
            >
              <Zap size={13} />
              <span>3. Gas Discharge Tube</span>
            </button>
          </div>

          {/* Modern In-Place Element Dropdown Selector */}
          <div ref={dropdownRef} className="relative">
            <button
              type="button"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              className="px-3 py-1.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg flex items-center gap-2 text-xs font-mono font-bold text-slate-800 dark:text-slate-100 transition-all cursor-pointer shadow-xs"
            >
              <span className="w-5 h-5 rounded bg-blue-600 text-white text-[11px] flex items-center justify-center font-bold">
                {activeProfile.symbol}
              </span>
              <span>
                #{activeProfile.atomicNumber} {activeProfile.name}
              </span>
              <ChevronDown
                size={14}
                className={`text-slate-500 dark:text-slate-400 transition-transform duration-200 ${
                  isDropdownOpen ? 'rotate-180 text-blue-600 dark:text-blue-400' : ''
                }`}
              />
            </button>

            {/* Dropdown Menu attached directly to trigger */}
            {isDropdownOpen && (
              <div className="absolute right-0 top-full mt-1.5 w-72 bg-white dark:bg-[#0c121e] rounded-xl border border-slate-200 dark:border-slate-800 shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150">
                <div className="p-2 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/80">
                  <div className="relative">
                    <Search size={13} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500" />
                    <input
                      type="text"
                      autoFocus
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search element or #..."
                      className="w-full pl-7 pr-3 py-1 text-xs font-mono bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-700 rounded-md outline-none focus:border-blue-500 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500"
                    />
                  </div>
                </div>

                <div className="max-h-60 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800 text-xs font-mono">
                  {filteredElementsList.map((el) => {
                    const isSelected = el.symbol === activeProfile.symbol;
                    const hasFlame = !!SPECTRAL_PROFILES[el.symbol]?.flameTest;
                    const hasGas = !!SPECTRAL_PROFILES[el.symbol]?.gasDischarge;

                    return (
                      <button
                        key={el.atomicNumber}
                        type="button"
                        onClick={() => {
                          setSelectedSymbol(el.symbol);
                          setSelectedLine(null);
                          setIsDropdownOpen(false);
                          setSearchQuery('');
                        }}
                        className={`w-full px-3 py-1.5 text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'bg-blue-50 dark:bg-blue-950/80 text-blue-900 dark:text-blue-200 font-bold'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-900/60 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="font-bold text-slate-900 dark:text-white w-6">{el.symbol}</span>
                          <span className="text-slate-400 dark:text-slate-500 text-[10px] w-6 text-right">#{el.atomicNumber}</span>
                          <span className="truncate">{el.name}</span>
                        </div>
                        <div className="flex items-center gap-1 shrink-0 ml-1">
                          {hasFlame && <span title="Flame test data"><Flame size={12} className="text-rose-500" /></span>}
                          {hasGas && <span title="Gas discharge data"><Zap size={12} className="text-amber-500" /></span>}
                          {isSelected && <Check size={13} className="text-blue-600 dark:text-blue-400" />}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Studio Body */}
        <div className="p-4 sm:p-6 flex-1 overflow-y-auto space-y-5">
          {/* ========================================================================= */}
          {/* TAB 1: OPTICAL SPECTROMETER (EMISSION VS ABSORPTION)                      */}
          {/* ========================================================================= */}
          {activeTab === 'spectrometer' && (
            <div className="space-y-4">
              {/* Controls bar: Mode toggle & summary */}
              <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/80 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 uppercase">Spectrometer Mode:</span>
                  <div className="inline-flex rounded-lg border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 p-0.5 text-xs font-mono">
                    <button
                      type="button"
                      onClick={() => {
                        setSpectrumMode('emission');
                      }}
                      className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        spectrumMode === 'emission'
                          ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      🌟 Atomic Emission (Dark Ground)
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setSpectrumMode('absorption');
                      }}
                      className={`px-3 py-1 rounded-md font-semibold transition-all cursor-pointer ${
                        spectrumMode === 'absorption'
                          ? 'bg-slate-900 dark:bg-blue-600 text-white shadow-xs'
                          : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                    >
                      🌈 Fraunhofer Absorption (Continuous)
                    </button>
                  </div>
                </div>

                <div className="text-xs font-mono text-slate-500 dark:text-slate-400">
                  Found <strong className="text-slate-800 dark:text-slate-200">{activeProfile.lines.length}</strong> visible spectral lines
                </div>
              </div>

              {/* High-Resolution Spectrometer Display Tube */}
              <div className="space-y-2">
                <div className="relative h-28 rounded-2xl border-2 border-slate-800 overflow-hidden shadow-2xl">
                  {/* Background: Black for emission, Continuous visible rainbow for absorption */}
                  {spectrumMode === 'emission' ? (
                    <div className="absolute inset-0 bg-slate-950" />
                  ) : (
                    <div
                      className="absolute inset-0"
                      style={{
                        background:
                          'linear-gradient(to right, #4c1d95 0%, #3b82f6 18%, #06b6d4 32%, #22c55e 48%, #eab308 65%, #ea580c 80%, #ef4444 100%)',
                      }}
                    />
                  )}

                  {/* Spectral Lines */}
                  {activeProfile.lines.map((line, idx) => {
                    // Position mapped from 380nm to 750nm
                    const percent = Math.max(0, Math.min(100, ((line.wavelengthNm - 380) / (750 - 380)) * 100));
                    const isSelected = selectedLine?.wavelengthNm === line.wavelengthNm;

                    if (spectrumMode === 'emission') {
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedLine(line);
                          }}
                          className="group absolute top-0 bottom-0 -translate-x-1/2 cursor-pointer z-10"
                          style={{ left: `${percent}%`, width: `${Math.max(2, line.intensity * 4)}px` }}
                          title={`${line.wavelengthNm} nm (${line.energyEv} eV) - Click to probe`}
                        >
                          <div
                            className={`w-full h-full transition-all ${
                              isSelected
                                ? 'scale-x-150 ring-2 ring-white shadow-lg'
                                : 'opacity-90 group-hover:opacity-100 group-hover:scale-x-125'
                            }`}
                            style={{
                              backgroundColor: line.colorHex,
                              boxShadow: `0 0 12px ${line.colorHex}`,
                            }}
                          />
                        </button>
                      );
                    } else {
                      // Absorption: Black Fraunhofer line where photon was absorbed
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedLine(line);
                          }}
                          className="group absolute top-0 bottom-0 -translate-x-1/2 cursor-pointer z-10"
                          style={{ left: `${percent}%`, width: '2.5px' }}
                          title={`${line.wavelengthNm} nm absorbed - Click to probe`}
                        >
                          <div
                            className={`w-full h-full bg-black transition-all ${
                              isSelected ? 'scale-x-150 ring-2 ring-white shadow-lg' : 'opacity-95'
                            }`}
                          />
                        </button>
                      );
                    }
                  })}

                  {/* Subtle glass reflection overlay */}
                  <div className="absolute inset-0 bg-gradient-to-b from-white/10 via-transparent to-black/30 pointer-events-none" />
                </div>

                {/* Visible Spectrum Wavelength Ruler */}
                <div className="relative h-6 text-[10px] font-mono text-slate-500 select-none">
                  {[380, 400, 450, 500, 550, 600, 650, 700, 750].map((wl) => {
                    const pos = ((wl - 380) / (750 - 380)) * 100;
                    return (
                      <div
                        key={wl}
                        className="absolute -translate-x-1/2 flex flex-col items-center"
                        style={{ left: `${pos}%` }}
                      >
                        <div className="h-1.5 w-px bg-slate-400" />
                        <span className="mt-0.5">{wl} nm</span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Inspector Probe HUD: Detailed Photon Physics */}
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 space-y-3 font-mono">
                <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                  <div className="flex items-center gap-2">
                    <Activity size={15} className="text-blue-600 dark:text-blue-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-white uppercase">
                      Quantum Photon Line Inspector:
                    </span>
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {selectedLine ? 'Active Target Line' : 'Click any spectral line above to inspect'}
                  </span>
                </div>

                {selectedLine ? (
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">Wavelength (λ)</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 flex items-center gap-1.5">
                        <span
                          className="w-3 h-3 rounded-full border border-slate-300 dark:border-slate-600"
                          style={{ backgroundColor: selectedLine.colorHex }}
                        />
                        {selectedLine.wavelengthNm} nm
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">Photon Energy (E = hc/λ)</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block tabular-nums">
                        {selectedLine.energyEv} eV
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">Frequency (ν = c/λ)</span>
                      <span className="text-base font-bold text-slate-900 dark:text-white mt-0.5 block tabular-nums">
                        {((2.99792e8 / (selectedLine.wavelengthNm * 1e-9)) / 1e12).toFixed(1)} THz
                      </span>
                    </div>

                    <div className="p-3 bg-white dark:bg-slate-900 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs">
                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block uppercase">Orbital Transition</span>
                      <span className="text-xs font-bold text-blue-700 dark:text-blue-300 mt-0.5 block truncate">
                        {selectedLine.transition || 'Atomic excitation decay'}
                      </span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-2 text-xs text-slate-500 dark:text-slate-400">
                    Click any emission line above to calculate photon energy, frequency, and electron jump.
                  </div>
                )}
              </div>

              {/* Historical Context Note */}
              <div className="p-3.5 rounded-xl bg-blue-50/70 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200 flex items-start gap-2.5">
                <Info size={16} className="text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
                <div className="leading-relaxed">
                  <strong>Spectroscopic Discovery Legacy: </strong>
                  {activeProfile.historicNote}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 2: BUNSEN BURNER FLAME TEST SIMULATOR                                 */}
          {/* ========================================================================= */}
          {activeTab === 'flame' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                {/* Flame Apparatus Canvas */}
                <div className="relative h-72 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 rounded-2xl border border-slate-800 flex flex-col items-center justify-end pb-8 overflow-hidden shadow-2xl">
                  {/* Glowing halo behind flame */}
                  <div
                    className="absolute w-48 h-48 rounded-full blur-3xl transition-all duration-500 pointer-events-none"
                    style={{
                      backgroundColor:
                        isFlameIgnited && activeProfile.flameTest
                          ? activeProfile.flameTest.glowHex
                          : 'rgba(59, 130, 246, 0.2)',
                      opacity: isFlameIgnited ? 0.7 : 0.2,
                    }}
                  />

                  {/* Flame Graphic (SVG cone with realistic color shifts) */}
                  <div className="relative z-10 flex flex-col items-center">
                    <svg
                      width="120"
                      height="160"
                      viewBox="0 0 120 160"
                      className={`transition-transform duration-300 ${
                        isFlameIgnited ? 'scale-105' : 'scale-95'
                      }`}
                    >
                      <defs>
                        <radialGradient id="flameGrad" cx="50%" cy="80%" r="60%">
                          <stop
                            offset="0%"
                            stopColor={
                              isFlameIgnited && activeProfile.flameTest
                                ? activeProfile.flameTest.flameHex
                                : '#60a5fa'
                            }
                          />
                          <stop
                            offset="70%"
                            stopColor={
                              isFlameIgnited && activeProfile.flameTest
                                ? activeProfile.flameTest.flameHex
                                : '#2563eb'
                            }
                            stopOpacity="0.8"
                          />
                          <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
                        </radialGradient>
                      </defs>

                      {/* Outer Flame Cone */}
                      <path
                        d="M 60 10 Q 95 70 85 140 Q 60 155 35 140 Q 25 70 60 10 Z"
                        fill="url(#flameGrad)"
                        className="animate-pulse"
                      />

                      {/* Inner Inner Cone (Clean gas combustion) */}
                      <path
                        d="M 60 60 Q 75 105 70 145 Q 60 150 50 145 Q 45 105 60 60 Z"
                        fill={isFlameIgnited && activeProfile.flameTest ? '#ffffff' : '#93c5fd'}
                        opacity="0.85"
                      />
                    </svg>

                    {/* Bunsen Burner Metal Barrel */}
                    <div className="w-12 h-14 bg-gradient-to-r from-slate-400 via-slate-200 to-slate-400 rounded-t border-t border-slate-500 shadow-inner" />
                    <div className="w-20 h-3 bg-slate-600 rounded-b shadow-md" />
                  </div>

                  {/* Nichrome Wire Loop Dipping into Flame */}
                  <div
                    className={`absolute z-20 transition-all duration-500 ${
                      isDippingWire
                        ? 'translate-y-8 translate-x-2'
                        : 'translate-y-0 -translate-x-6'
                    }`}
                  >
                    <div className="w-1 h-36 bg-gradient-to-b from-slate-400 to-slate-200 rotate-12 origin-top rounded-full shadow-md flex items-end justify-center">
                      <div className="w-3.5 h-3.5 rounded-full border-2 border-amber-300 bg-amber-400/40" />
                    </div>
                  </div>
                </div>

                {/* Laboratory Bench Controls & Chemical Data */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white">
                      Flame Emission Test: {activeProfile.name}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-sans mt-1 leading-relaxed">
                      When a salt solution of {activeProfile.name} is vaporized in a 1,500°C Bunsen burner flame, thermal collisions excite electrons into higher energy shells. As they drop back down to lower orbitals, they emit photons with these signature wavelengths.
                    </p>
                  </div>

                  {activeProfile.flameTest ? (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px]">Characteristic Flame Hue:</span>
                        <span
                          className="font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: activeProfile.flameTest.flameHex }}
                        >
                          {activeProfile.flameTest.name}
                        </span>
                      </div>

                      <p className="text-slate-700 dark:text-slate-300 font-sans text-xs leading-normal">
                        {activeProfile.flameTest.description}
                      </p>

                      <div className="text-[11px] text-slate-500 dark:text-slate-400">
                        Dominant Spectral Peak: <strong>{activeProfile.flameTest.spectralPeakNm} nm</strong>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-amber-200 dark:border-amber-800/60 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs font-mono space-y-1">
                      <strong>Subtle or Non-Visible Flame:</strong>
                      <p className="text-amber-800 dark:text-amber-300 font-sans text-[11.5px]">
                        {activeProfile.name} does not produce a vivid visible flame test color because its dominant electronic transitions occur in the ultraviolet or infrared regions outside human vision. Try selecting <strong>Lithium, Sodium, Potassium, Calcium, Copper, Strontium, or Barium</strong>.
                      </p>
                    </div>
                  )}

                  {/* Interactive Button: Dip Nichrome Wire */}
                  <button
                    type="button"
                    onClick={handleDipWire}
                    disabled={isDippingWire}
                    className="w-full py-2.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md active:scale-98"
                  >
                    <Flame size={15} />
                    <span>{isDippingWire ? 'Dipping Wire into Salt...' : 'Dip Nichrome Wire into Flame'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* TAB 3: GAS DISCHARGE TUBE (PLÜCKER TUBE)                                 */}
          {/* ========================================================================= */}
          {activeTab === 'discharge' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 items-center">
                {/* Visual Glass Tube Discharge Simulation */}
                <div className="relative h-64 bg-slate-950 rounded-2xl border border-slate-800 flex items-center justify-center p-6 shadow-2xl overflow-hidden">
                  {/* Ambient Glow */}
                  <div
                    className="absolute inset-0 transition-opacity duration-300 pointer-events-none"
                    style={{
                      backgroundColor:
                        isDischargeOn && activeProfile.gasDischarge
                          ? activeProfile.gasDischarge.tubeHex
                          : 'transparent',
                      opacity: isDischargeOn && activeProfile.gasDischarge ? 0.15 : 0,
                    }}
                  />

                  {/* High Voltage Plücker Capillary Tube */}
                  <div className="relative flex items-center justify-center w-full max-w-sm">
                    {/* Metal Electrode Left */}
                    <div className="w-8 h-10 bg-gradient-to-r from-slate-400 to-slate-200 rounded-l shadow-md z-10" />

                    {/* Glass Tube Body */}
                    <div
                      className={`relative flex-1 h-8 rounded border-y border-white/20 transition-all duration-300 flex items-center justify-center ${
                        isDischargeOn && activeProfile.gasDischarge ? 'shadow-lg' : 'bg-slate-900/60'
                      }`}
                      style={{
                        backgroundColor:
                          isDischargeOn && activeProfile.gasDischarge
                            ? activeProfile.gasDischarge.tubeHex
                            : '#0f172a',
                        boxShadow:
                          isDischargeOn && activeProfile.gasDischarge
                            ? `0 0 25px ${activeProfile.gasDischarge.tubeHex}`
                            : 'none',
                      }}
                    >
                      {/* Narrow Center Capillary */}
                      <div
                        className="w-16 h-3 rounded-full bg-white/90 filter blur-xs"
                        style={{
                          opacity: isDischargeOn && activeProfile.gasDischarge ? 0.95 : 0,
                        }}
                      />
                    </div>

                    {/* Metal Electrode Right */}
                    <div className="w-8 h-10 bg-gradient-to-l from-slate-400 to-slate-200 rounded-r shadow-md z-10" />
                  </div>
                </div>

                {/* Controls & Industrial Usage */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-base font-bold font-mono text-slate-900 dark:text-white">
                      High-Voltage Cold-Cathode Discharge Tube
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-300 font-sans mt-1 leading-relaxed">
                      In a low-pressure gas tube (5,000 V electric potential), high-speed electrons collide with {activeProfile.name} atoms, ionizing them into a glowing plasma that emits pure quantized spectra.
                    </p>
                  </div>

                  {activeProfile.gasDischarge ? (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 space-y-3 font-mono text-xs">
                      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px]">Plasma Color:</span>
                        <span
                          className="font-bold px-2 py-0.5 rounded text-white"
                          style={{ backgroundColor: activeProfile.gasDischarge.tubeHex }}
                        >
                          {activeProfile.gasDischarge.name}
                        </span>
                      </div>

                      <div>
                        <span className="text-slate-500 dark:text-slate-400 uppercase text-[10px] block">Real-World Technologies:</span>
                        <p className="text-slate-800 dark:text-slate-200 font-sans text-xs mt-0.5">
                          {activeProfile.gasDischarge.uses}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 text-xs font-mono">
                      No dedicated low-pressure gas discharge tube data for {activeProfile.name}. Try selecting noble gases like <strong>Neon, Helium, Mercury, Sodium vapor, or Hydrogen</strong>.
                    </div>
                  )}

                  {/* Power Switch Toggle */}
                  <button
                    type="button"
                    onClick={() => {
                      setIsDischargeOn(!isDischargeOn);
                    }}
                    className={`w-full py-2.5 px-4 rounded-xl font-mono font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-md ${
                      isDischargeOn
                        ? 'bg-amber-600 hover:bg-amber-700 text-white'
                        : 'bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                    }`}
                  >
                    <Zap size={15} />
                    <span>{isDischargeOn ? 'Turn Off 5,000V Power Supply' : 'Power On 5,000V Discharge'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
