import React, { useEffect, useState, useRef } from 'react';
import { TABLE_HISTORY_MILESTONES } from '../data/tableHistory';
import { useTheme } from '../context/ThemeContext';
import {
  Sparkles,
  Award,
  ChevronDown,
  Atom,
  Clock,
  FileText,
} from 'lucide-react';

interface ArchivalArtifact {
  title: string;
  subtitle: string;
  source: string;
  license: string;
  date: string;
  visualType:
    | 'lavoisier-manuscript'
    | 'dobereiner-table'
    | 'chancourtois-cylinder'
    | 'newlands-scale'
    | 'meyer-curve'
    | 'mendeleev-manuscript'
    | 'ramsay-spectra'
    | 'moseley-xray'
    | 'bohr-quantum'
    | 'seaborg-actinides'
    | 'iupac-period7';
}

const ARCHIVAL_ARTIFACTS: Record<string, ArchivalArtifact> = {
  'lavoisier-1789': {
    title: 'Tableau des Substances Simples',
    subtitle: 'Original classification of 33 chemical substances into four fundamental classes',
    source: 'Traité Élémentaire de Chimie, Paris (1789) · Bibliothèque Nationale de France',
    license: 'Public Domain / CC0 Archive',
    date: '1789 CE',
    visualType: 'lavoisier-manuscript'
  },
  'dobereiner-1829': {
    title: 'Versuch zu einer Gruppirung der elementaren Stoffe',
    subtitle: 'The Law of Triads mathematical mass averages table',
    source: 'Poggendorffs Annalen der Physik und Chemie, Leipzig · Deutsches Museum Archive',
    license: 'Public Domain / CC0 Historical Record',
    date: '1829 CE',
    visualType: 'dobereiner-table'
  },
  'chancourtois-1862': {
    title: 'Vis Tellurique (The Telluric Screw)',
    subtitle: 'First 3D geometric periodic cylinder with 16-division helical spiral',
    source: 'Comptes Rendus de l\'Académie des Sciences, Paris · French National Library',
    license: 'Public Domain',
    date: '1862 CE',
    visualType: 'chancourtois-cylinder'
  },
  'newlands-1865': {
    title: 'Law of Octaves Periodic Arrangement',
    subtitle: 'Musical octave analogy organizing 62 elements into seven repeating groups',
    source: 'Chemical News, London (Vol. 12, 1865) · Royal Society of Chemistry Archives',
    license: 'Public Domain',
    date: '1865 CE',
    visualType: 'newlands-scale'
  },
  'meyer-1869': {
    title: 'Die Natur der chemischen Elemente',
    subtitle: 'Atomic Volume periodic curve demonstration against increasing atomic weights',
    source: 'Annalen der Chemie und Pharmacie · Tübingen University Archives',
    license: 'Public Domain Historical Scientific Record',
    date: '1869 CE',
    visualType: 'meyer-curve'
  },
  'mendeleev-1869': {
    title: 'Опыт системы элементов (An Attempted System of Elements)',
    subtitle: 'The seminal periodic table with bold predictive gaps for Gallium, Scandium & Germanium',
    source: 'Zhurnal Russkogo Fiziko-Khimicheskogo Obshchestva (Vol. 1, 1869) · St. Petersburg Academy',
    license: 'Public Domain / CC0 Archival Document',
    date: '1869 CE',
    visualType: 'mendeleev-manuscript'
  },
  'ramsay-1898': {
    title: 'The Discovery of Group 0 (The Noble Gases)',
    subtitle: 'Monatomic unreactive element series completing the right boundary of the table',
    source: 'Proceedings of the Royal Society of London · University College London Archive',
    license: 'Public Domain',
    date: '1898 CE',
    visualType: 'ramsay-spectra'
  },
  'moseley-1913': {
    title: 'The High-Frequency Spectra of the Elements',
    subtitle: 'Characteristic X-ray K-alpha lines anchoring the periodic table on Atomic Number Z',
    source: 'Philosophical Magazine, London (Ser. 6, Vol. 26) · Oxford University Archives',
    license: 'Public Domain / CC0 Landmark Physics',
    date: '1913 CE',
    visualType: 'moseley-xray'
  },
  'bohr-1922': {
    title: 'Quantum Atomic Shell Capacities & The Aufbau Principle',
    subtitle: 'Explaining period lengths 2, 8, 8, 18, 18, 32 via principal and angular quantum numbers',
    source: 'The Theory of Spectra and Atomic Constitution · Nobel Lectures in Physics (1922)',
    license: 'Public Domain / Nobel Foundation Archive',
    date: '1922 CE',
    visualType: 'bohr-quantum'
  },
  'seaborg-1944': {
    title: 'The Actinide Concept & Transuranic Island',
    subtitle: 'Extraction of Thorium, Uranium & Plutonium into an independent f-block row below Lanthanides',
    source: 'Chemical & Engineering News (Vol. 23, 1945) · Lawrence Berkeley National Laboratory',
    license: 'Public Domain (US Government Work)',
    date: '1944 CE',
    visualType: 'seaborg-actinides'
  },
  'iupac-2016': {
    title: 'IUPAC Official Completion of the 7th Period',
    subtitle: 'Confirmation and official naming of Nihonium (113), Moscovium (115), Tennessine (117) & Oganesson (118)',
    source: 'Pure and Applied Chemistry (IUPAC Technical Report 2016) · IUPAC Archives',
    license: 'Open Access / Creative Commons CC-BY',
    date: '2016 CE',
    visualType: 'iupac-period7'
  }
};

interface ColorStop {
  progress: number;
  color: string;
  name: string;
  year: number;
}

const LIGHT_ERA_COLOR_STOPS: ColorStop[] = [
  { progress: 0.00, color: '#f1f5f9', name: 'Prologue Era', year: 1789 },
  { progress: 0.08, color: '#bae6fd', name: 'Lavoisier · Sky Blue', year: 1789 },
  { progress: 0.17, color: '#fde68a', name: 'Döbereiner · Amber Gold', year: 1829 },
  { progress: 0.26, color: '#bbf7d0', name: 'Chancourtois · Mint Green', year: 1862 },
  { progress: 0.35, color: '#e9d5ff', name: 'Newlands · Harmonic Lilac', year: 1865 },
  { progress: 0.44, color: '#a5f3fc', name: 'Lothar Meyer · Bright Cyan', year: 1869 },
  { progress: 0.53, color: '#c7d2fe', name: 'Mendeleev · Imperial Azure', year: 1869 },
  { progress: 0.62, color: '#f5d0fe', name: 'Ramsay · Noble Orchid', year: 1898 },
  { progress: 0.71, color: '#fbcfe8', name: 'Moseley · X-Ray Pink', year: 1913 },
  { progress: 0.80, color: '#99f6e4', name: 'Bohr · Quantum Teal', year: 1922 },
  { progress: 0.90, color: '#fecdd3', name: 'Seaborg · Actinide Coral', year: 1944 },
  { progress: 1.00, color: '#ddd6fe', name: 'Modern · Frontier Violet', year: 2016 }
];

const DARK_ERA_COLOR_STOPS: ColorStop[] = [
  { progress: 0.00, color: '#121316', name: 'Prologue Era', year: 1789 },
  { progress: 0.08, color: '#07080a', name: 'Lavoisier · Dark Platinum', year: 1789 },
  { progress: 0.17, color: '#0c0a06', name: 'Döbereiner · Obsidian Gold', year: 1829 },
  { progress: 0.26, color: '#060a08', name: 'Chancourtois · Deep Emerald', year: 1862 },
  { progress: 0.35, color: '#0a070f', name: 'Newlands · Deep Amethyst', year: 1865 },
  { progress: 0.44, color: '#060a0b', name: 'Lothar Meyer · Graphite Cyan', year: 1869 },
  { progress: 0.53, color: '#08080a', name: 'Mendeleev · Deep Onyx', year: 1869 },
  { progress: 0.62, color: '#0a060d', name: 'Ramsay · Noble Violet', year: 1898 },
  { progress: 0.71, color: '#0c0609', name: 'Moseley · X-Ray Crimson', year: 1913 },
  { progress: 0.80, color: '#050a0a', name: 'Bohr · Quantum Teal', year: 1922 },
  { progress: 0.90, color: '#0c0608', name: 'Seaborg · Actinide Rose', year: 1944 },
  { progress: 1.00, color: '#08060d', name: 'Modern · Frontier Obsidian', year: 2016 }
];

function parseHex(hex: string): [number, number, number] {
  const clean = hex.replace('#', '');
  return [
    parseInt(clean.substring(0, 2), 16),
    parseInt(clean.substring(2, 4), 16),
    parseInt(clean.substring(4, 6), 16)
  ];
}

function rgbToHex(r: number, g: number, b: number): string {
  return (
    '#' +
    [r, g, b]
      .map((x) => Math.max(0, Math.min(255, Math.round(x))).toString(16).padStart(2, '0'))
      .join('')
  );
}

function interpolateColors(color1: string, color2: string, factor: number): string {
  const clamped = Math.max(0, Math.min(1, factor));
  const [r1, g1, b1] = parseHex(color1);
  const [r2, g2, b2] = parseHex(color2);
  const r = r1 + clamped * (r2 - r1);
  const g = g1 + clamped * (g2 - g1);
  const b = b1 + clamped * (b2 - b1);
  return rgbToHex(r, g, b);
}

export const TableHistoryScrollPage: React.FC = () => {
  const { theme, currentDarkPaletteInfo } = useTheme();
  const isDark = theme === 'dark';
  const containerRef = useRef<HTMLDivElement>(null);
  const [currentBgColor, setCurrentBgColor] = useState(isDark ? (currentDarkPaletteInfo?.canvasHex || '#121316') : '#f1f5f9');
  const [currentEraName, setCurrentEraName] = useState('Prologue Era');
  const [displayYear, setDisplayYear] = useState(1789);
  const [scrollPercent, setScrollPercent] = useState(0);

  const eraStops = isDark ? DARK_ERA_COLOR_STOPS : LIGHT_ERA_COLOR_STOPS;

  // Directly control document.body and container background on scroll
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY || window.pageYOffset;
      const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
      const progress = scrollHeight > 0 ? Math.max(0, Math.min(1, scrollY / scrollHeight)) : 0;

      setScrollPercent(Math.round(progress * 100));

      // Calculate approximate historical year
      const calculatedYear = Math.round(1789 + progress * (2016 - 1789));
      setDisplayYear(calculatedYear);

      // Find current gradient color stops
      let stopA = eraStops[0];
      let stopB = eraStops[eraStops.length - 1];

      for (let i = 0; i < eraStops.length - 1; i++) {
        if (progress >= eraStops[i].progress && progress <= eraStops[i + 1].progress) {
          stopA = eraStops[i];
          stopB = eraStops[i + 1];
          break;
        }
      }

      const segmentSpan = stopB.progress - stopA.progress;
      const segmentProgress = segmentSpan > 0 ? (progress - stopA.progress) / segmentSpan : 0;
      const interpolatedColor = interpolateColors(stopA.color, stopB.color, segmentProgress);

      setCurrentBgColor(interpolatedColor);
      setCurrentEraName(stopA.name);

      // Directly update the entire document and body background style
      document.body.style.backgroundColor = interpolatedColor;
      document.documentElement.style.backgroundColor = interpolatedColor;
      if (containerRef.current) {
        containerRef.current.style.backgroundColor = interpolatedColor;
      }
    };

    // Initial setup on mount
    document.body.style.transition = 'background-color 0.15s ease-out';
    document.documentElement.style.transition = 'background-color 0.15s ease-out';
    handleScroll();

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
      // Reset back to standard applet background based on current active theme
      const targetBg = document.documentElement.classList.contains('dark') ? (currentDarkPaletteInfo?.canvasHex || '#121316') : '#f8fafc';
      document.body.style.backgroundColor = targetBg;
      document.documentElement.style.backgroundColor = targetBg;
      document.body.style.transition = '';
      document.documentElement.style.transition = '';
    };
  }, [isDark, eraStops]);

  const renderArtifactGraphic = (artifact: ArchivalArtifact) => {
    switch (artifact.visualType) {
      case 'lavoisier-manuscript':
        return (
          <div className="p-4 bg-white/95 dark:bg-[#0c0c0e]/95 rounded-xl border border-slate-200/80 dark:border-zinc-800 font-mono text-[11px] space-y-2 shadow-xs">
            <div className="text-center font-bold text-slate-800 dark:text-zinc-200 border-b border-slate-200 dark:border-zinc-800 pb-1.5 uppercase text-[10px] tracking-wider">
              TABLEAU DES SUBSTANCES SIMPLES (1789)
            </div>
            <div className="grid grid-cols-2 gap-1.5 text-[10px] text-slate-700 dark:text-zinc-300">
              <div className="p-1.5 rounded bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <span className="text-amber-600 dark:text-amber-400 font-bold block">Chaleur & Lumière</span>
                Calorique, Lumière
              </div>
              <div className="p-1.5 rounded bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <span className="text-emerald-700 dark:text-emerald-400 font-bold block">Gases</span>
                Oxygène, Azote, Hydrogène
              </div>
              <div className="p-1.5 rounded bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <span className="text-amber-700 dark:text-amber-400 font-bold block">Non-Métaux</span>
                Soufre, Phosphore, Carbone
              </div>
              <div className="p-1.5 rounded bg-slate-50 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800">
                <span className="text-purple-700 dark:text-purple-400 font-bold block">Métaux</span>
                Fer, Cuivre, Plomb, Argent, Or
              </div>
            </div>
          </div>
        );

      case 'dobereiner-table':
        return (
          <div className="p-4 bg-white/95 dark:bg-[#0c0c0e]/95 rounded-xl border border-amber-200 dark:border-amber-900/60 font-mono text-xs space-y-2.5 shadow-xs">
            <div className="text-center font-bold text-amber-900 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800 pb-1 uppercase text-[10px]">
              DÖBEREINER'SCHE TRIADEN (1829)
            </div>
            <div className="bg-amber-50/70 dark:bg-amber-950/40 p-2.5 rounded border border-amber-200 dark:border-amber-800/80 text-center space-y-1">
              <div className="text-[10px] text-slate-600 dark:text-zinc-400">The Arithmetic Mean Law:</div>
              <div className="text-xs font-bold text-slate-900 dark:text-white">
                Mass(Cl: 35.5) + Mass(I: 126.9) ÷ 2 = <span className="text-amber-800 dark:text-amber-400 font-bold">81.2 u</span>
              </div>
              <div className="text-[10px] text-emerald-700 dark:text-emerald-400 font-semibold">
                Actual Bromine Weight: 79.9 u (98.4% Accord)
              </div>
            </div>
          </div>
        );

      case 'chancourtois-cylinder':
        return (
          <div className="p-4 bg-white/95 dark:bg-[#0c0c0e]/95 rounded-xl border border-emerald-200 dark:border-emerald-900/60 font-mono text-xs space-y-2 shadow-xs">
            <div className="text-center font-bold text-emerald-900 dark:text-emerald-300 border-b border-emerald-200 dark:border-emerald-800 pb-1 uppercase text-[10px]">
              VIS TELLURIQUE (TELLURIC SCREW, 1862)
            </div>
            <div className="h-24 bg-emerald-50/50 dark:bg-emerald-950/40 rounded border border-emerald-200 dark:border-emerald-800/80 relative flex items-center justify-around overflow-hidden px-2">
              <div className="z-10 text-center">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">Col 1</span>
                <div className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">Li (7)</div>
                <div className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">Na (23)</div>
                <div className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">K (39)</div>
              </div>
              <div className="z-10 text-center border-l border-emerald-200 dark:border-emerald-800 pl-3">
                <span className="text-[10px] text-slate-500 dark:text-zinc-400">Col 2</span>
                <div className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">Be (9)</div>
                <div className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">Mg (24)</div>
                <div className="font-bold text-emerald-800 dark:text-emerald-300 text-[11px]">Ca (40)</div>
              </div>
            </div>
          </div>
        );

      case 'newlands-scale':
        return (
          <div className="p-4 bg-white/95 dark:bg-[#0c0c0e]/95 rounded-xl border border-purple-200 dark:border-purple-900/60 font-mono text-xs space-y-2 shadow-xs">
            <div className="text-center font-bold text-purple-900 dark:text-purple-300 border-b border-purple-200 dark:border-purple-800 pb-1 uppercase text-[10px]">
              THE LAW OF OCTAVES (1865)
            </div>
            <div className="grid grid-cols-7 gap-1 text-center text-[10px] pt-1">
              {['do', 're', 'mi', 'fa', 'sol', 'la', 'ti'].map((note, i) => (
                <div key={i} className="p-1 rounded bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800">
                  <div className="text-purple-600 dark:text-purple-400 font-bold">{note}</div>
                  <div className="font-bold text-slate-800 dark:text-zinc-200 mt-0.5">{['H', 'Li', 'Be', 'B', 'C', 'N', 'O'][i]}</div>
                  <div className="text-slate-500 dark:text-zinc-400">{['F', 'Na', 'Mg', 'Al', 'Si', 'P', 'S'][i]}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'meyer-curve':
        return (
          <div className="p-4 bg-white/95 dark:bg-[#0c0c0e]/95 rounded-xl border border-cyan-200 dark:border-cyan-900/60 font-mono text-xs space-y-2 shadow-xs">
            <div className="text-center font-bold text-cyan-900 dark:text-cyan-300 border-b border-cyan-200 dark:border-cyan-800 pb-1 uppercase text-[10px]">
              ATOMIC VOLUME PERIODIC CURVE (1869)
            </div>
            <div className="h-24 bg-cyan-50/50 dark:bg-cyan-950/40 rounded border border-cyan-200 dark:border-cyan-800/80 relative flex items-end justify-between px-3 pb-2 pt-1">
              <svg className="absolute inset-0 w-full h-full text-cyan-500" viewBox="0 0 200 80" preserveAspectRatio="none">
                <path d="M 0 75 Q 25 10 50 75 Q 80 15 110 75 Q 140 18 170 75 L 200 75" fill="none" stroke="currentColor" strokeWidth="2" />
              </svg>
              <span className="text-[9px] font-bold text-cyan-800 dark:text-cyan-300 z-10">Li (peak)</span>
              <span className="text-[9px] font-bold text-cyan-800 dark:text-cyan-300 z-10">Na (peak)</span>
              <span className="text-[9px] font-bold text-cyan-800 dark:text-cyan-300 z-10">K (peak)</span>
              <span className="text-[9px] font-bold text-cyan-800 dark:text-cyan-300 z-10">Rb (peak)</span>
            </div>
          </div>
        );

      case 'mendeleev-manuscript':
        return (
          <div className="p-4 bg-white/95 dark:bg-[#0c0c0e]/95 rounded-xl border border-amber-300/80 dark:border-amber-900/60 font-mono text-xs space-y-2 shadow-xs">
            <div className="text-center font-bold text-amber-900 dark:text-amber-300 border-b border-amber-200 dark:border-amber-800 pb-1 uppercase text-[10px]">
              ОПЫТЪ СИСТЕМЫ ЭЛЕМЕНТОВЪ (1869)
            </div>
            <div className="p-2.5 rounded bg-amber-50/70 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/80 text-[11px] space-y-1">
              <div className="flex justify-between">
                <span>Ti = 50</span>
                <span>Zr = 90</span>
                <span className="text-amber-800 dark:text-amber-400 font-bold">? = 180</span>
              </div>
              <div className="flex justify-between">
                <span>V = 51</span>
                <span>Nb = 94</span>
                <span>Ta = 182</span>
              </div>
              <div className="flex justify-between">
                <span>Cr = 52</span>
                <span>Mo = 96</span>
                <span>W = 186</span>
              </div>
              <div className="flex justify-between text-amber-800 dark:text-amber-400 font-bold border-t border-amber-200 dark:border-amber-800 pt-1">
                <span>Al = 27.4</span>
                <span>? (Eka-Al) = 68</span>
                <span>In = 113.4</span>
              </div>
            </div>
          </div>
        );

      case 'ramsay-spectra':
        return (
          <div className="p-4 bg-white/95 dark:bg-[#0c0c0e]/95 rounded-xl border border-purple-200 dark:border-purple-900/60 font-mono text-xs space-y-2 shadow-xs">
            <div className="text-center font-bold text-purple-900 dark:text-purple-300 border-b border-purple-200 dark:border-purple-800 pb-1 uppercase text-[10px]">
              GROUP 0 INERT SPECTRA (1898)
            </div>
            <div className="grid grid-cols-5 gap-1 text-center text-[10px]">
              {['He (2)', 'Ne (10)', 'Ar (18)', 'Kr (36)', 'Xe (54)'].map((gas, i) => (
                <div key={i} className="p-1 rounded bg-purple-50 dark:bg-purple-950/50 border border-purple-200 dark:border-purple-800">
                  <span className="font-bold text-purple-800 dark:text-purple-300">{gas.split(' ')[0]}</span>
                  <div className="text-[8px] text-slate-500 dark:text-zinc-400">{gas.split(' ')[1]}</div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'moseley-xray':
        return (
          <div className="p-4 bg-white/95 dark:bg-[#0c0c0e]/95 rounded-xl border border-rose-200 dark:border-rose-900/60 font-mono text-xs space-y-2 shadow-xs">
            <div className="text-center font-bold text-rose-900 dark:text-rose-300 border-b border-rose-200 dark:border-rose-800 pb-1 uppercase text-[10px]">
              MOSELEY'S LAW X-RAY GRAPH (1913)
            </div>
            <div className="p-2 rounded bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-center space-y-1">
              <div className="text-xs font-bold text-rose-900 dark:text-rose-300">√ν = a(Z - b)</div>
              <div className="text-[10px] text-slate-600 dark:text-zinc-400">
                Proved frequency square-root is strictly linear with Atomic Number Z.
              </div>
            </div>
          </div>
        );

      case 'bohr-quantum':
        return (
          <div className="p-4 bg-white/95 dark:bg-[#0c0c0e]/95 rounded-xl border border-cyan-200 dark:border-cyan-900/60 font-mono text-xs space-y-2 shadow-xs">
            <div className="text-center font-bold text-cyan-900 dark:text-cyan-300 border-b border-cyan-200 dark:border-cyan-800 pb-1 uppercase text-[10px]">
              QUANTUM SHELL CAPACITIES (1922)
            </div>
            <div className="flex justify-between items-center text-center text-[10px] text-cyan-950 dark:text-cyan-200 px-1">
              <span>n=1: <strong>2e⁻</strong></span>
              <span>·</span>
              <span>n=2: <strong>8e⁻</strong></span>
              <span>·</span>
              <span>n=3: <strong>18e⁻</strong></span>
              <span>·</span>
              <span>n=4: <strong>32e⁻</strong></span>
            </div>
          </div>
        );

      case 'seaborg-actinides':
        return (
          <div className="p-4 bg-white/95 dark:bg-[#0c0c0e]/95 rounded-xl border border-rose-200 dark:border-rose-900/60 font-mono text-xs space-y-2 shadow-xs">
            <div className="text-center font-bold text-rose-900 dark:text-rose-300 border-b border-rose-200 dark:border-rose-800 pb-1 uppercase text-[10px]">
              THE 5f ACTINIDE ROW EXTRACTION (1944)
            </div>
            <div className="p-2 rounded bg-rose-50/70 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-[10px] text-center font-bold text-rose-900 dark:text-rose-300">
              Ac (89) → Th (90) → Pa (91) → U (92) → Pu (94) ... Lr (103)
            </div>
          </div>
        );

      case 'iupac-period7':
        return (
          <div className="p-4 bg-white/95 dark:bg-[#0c0c0e]/95 rounded-xl border border-indigo-200 dark:border-indigo-900/60 font-mono text-xs space-y-2 shadow-xs">
            <div className="text-center font-bold text-indigo-900 dark:text-indigo-300 border-b border-indigo-200 dark:border-indigo-800 pb-1 uppercase text-[10px]">
              IUPAC ROW 7 COMPLETION (2016)
            </div>
            <div className="grid grid-cols-4 gap-1 text-center text-[10px] font-bold text-indigo-900 dark:text-indigo-300">
              <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">113: Nh</div>
              <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">115: Mc</div>
              <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">117: Ts</div>
              <div className="p-1 rounded bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800">118: Og</div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full min-h-screen text-slate-800 dark:text-zinc-100 select-none pb-28 transition-colors duration-200"
      style={{ backgroundColor: currentBgColor }}
    >
      {/* Scroll-Linked Top Progress Indicator */}
      <div className="fixed top-0 left-0 right-0 z-50 h-1.5 bg-slate-300/40 dark:bg-zinc-800/80">
        <div
          className="h-full bg-gradient-to-r from-amber-500 via-orange-500 to-rose-500 transition-all duration-75"
          style={{ width: `${scrollPercent}%` }}
        />
      </div>

      {/* Floating HUD Pill showing current historical year AND active background color */}
      <div className="fixed top-3 right-4 z-40 px-3.5 py-1.5 rounded-full bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-md border border-slate-300 dark:border-zinc-800 shadow-md flex items-center gap-2.5 font-mono text-xs text-slate-800 dark:text-zinc-100">
        <Clock size={13} className="text-amber-500 dark:text-amber-400" />
        <span className="font-bold text-slate-900 dark:text-white text-sm tabular-nums">Year {displayYear}</span>
        <span className="text-slate-300 dark:text-zinc-700">·</span>
        <div className="flex items-center gap-1.5">
          <span
            className="w-3 h-3 rounded-full border border-slate-400 dark:border-zinc-700 shadow-xs inline-block shrink-0"
            style={{ backgroundColor: currentBgColor }}
            title={`Active background: ${currentBgColor}`}
          />
          <span className="text-[11px] text-slate-600 dark:text-zinc-300 hidden sm:inline font-semibold">{currentEraName}</span>
        </div>
      </div>

      {/* Hero Prologue Section */}
      <section className="min-h-[76vh] flex flex-col items-center justify-center text-center px-4 max-w-4xl mx-auto pt-6">
        <div className="space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/90 dark:bg-[#0c0c0e]/90 border border-slate-300 dark:border-zinc-800 text-slate-800 dark:text-zinc-200 font-mono text-xs font-semibold uppercase tracking-wider shadow-xs">
            <Sparkles size={13} className="text-amber-500" />
            <span>230 Years of Scientific Discovery</span>
          </div>

          <h1 className="text-3xl sm:text-5xl md:text-6xl font-extrabold font-mono tracking-tight text-slate-900 dark:text-white leading-[1.15]">
            The Evolution of the <br />
            <span className="text-amber-600 dark:text-amber-400">Periodic Table</span>
          </h1>

          <p className="text-base sm:text-lg text-slate-700 dark:text-zinc-300 max-w-2xl mx-auto leading-relaxed font-medium">
            Scroll down to watch the solid background transform across the centuries. Experience how Lavoisier, Döbereiner, Newlands, Meyer, Mendeleev, Moseley, and Seaborg deciphered the recurring harmony of matter.
          </p>

          <div className="pt-6 flex flex-col items-center space-y-2 text-slate-600 dark:text-zinc-400 font-mono text-xs">
            <span className="tracking-widest uppercase text-[11px] font-bold">
              Scroll down to explore
            </span>
            <div className="w-8 h-8 rounded-full border border-slate-400 dark:border-zinc-700 bg-white dark:bg-zinc-800 shadow-xs flex items-center justify-center text-slate-700 dark:text-zinc-200 animate-bounce">
              <ChevronDown size={18} />
            </div>
          </div>
        </div>
      </section>

      {/* Main Continuous Historical Spine */}
      <div className="relative max-w-5xl mx-auto px-4 sm:px-6">
        {/* Central timeline rail */}
        <div className="absolute left-6 sm:left-1/2 top-0 bottom-0 w-0.5 -translate-x-1/2 bg-slate-400/60 dark:bg-zinc-800" />

        {/* Milestone Rows Stream */}
        <div className="space-y-24 sm:space-y-32 pt-8">
          {TABLE_HISTORY_MILESTONES.map((milestone, idx) => {
            const isEven = idx % 2 === 0;
            const artifact = ARCHIVAL_ARTIFACTS[milestone.id];

            return (
              <article
                key={milestone.id}
                className={`relative flex flex-col sm:flex-row items-center ${
                  isEven ? 'sm:flex-row-reverse' : ''
                } gap-6 sm:gap-12`}
              >
                {/* Central Spine Node */}
                <div className="absolute left-6 sm:left-1/2 -translate-x-1/2 flex items-center justify-center z-20">
                  <div className="w-9 h-9 rounded-full bg-white dark:bg-[#0c0c0e] border-2 border-slate-900 dark:border-zinc-500 shadow-md flex items-center justify-center font-mono text-[11px] font-bold text-slate-900 dark:text-white">
                    {idx + 1}
                  </div>
                </div>

                {/* Narrative Content Card (Side 1) */}
                <div className="w-full sm:w-[calc(50%-2.5rem)] pl-12 sm:pl-0">
                  <div className="rounded-2xl border border-slate-300/80 dark:border-zinc-800 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-sm p-6 sm:p-7 shadow-md space-y-4">
                    {/* Top Era Tag */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-zinc-800 pb-3">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-full font-mono text-xs font-bold bg-slate-100 dark:bg-zinc-800 text-slate-800 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700">
                          {milestone.year}
                        </span>
                        <span className="text-slate-300 dark:text-zinc-700">·</span>
                        <span className="font-mono text-xs font-medium text-slate-500 dark:text-zinc-400">
                          {milestone.country}
                        </span>
                      </div>
                      <span className="text-[11px] font-mono text-slate-400 dark:text-zinc-500">
                        Stage {idx + 1} of {TABLE_HISTORY_MILESTONES.length}
                      </span>
                    </div>

                    <div>
                      <h2 className="text-xl sm:text-2xl font-bold font-mono text-slate-900 dark:text-white tracking-tight">
                        {milestone.scientist}
                      </h2>
                      <div className="text-sm font-semibold font-mono text-amber-600 dark:text-amber-400 mt-0.5">
                        {milestone.title}
                      </div>
                    </div>

                    <div className="p-3 rounded-lg text-xs leading-relaxed font-medium bg-amber-50/80 dark:bg-amber-950/30 text-amber-950 dark:text-amber-200 border border-amber-200/80 dark:border-amber-900/60">
                      <strong>The Breakthrough Idea:</strong> {milestone.headline}
                    </div>

                    <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed">
                      {milestone.description}
                    </p>

                    <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 flex items-start gap-2 text-xs text-slate-600 dark:text-zinc-400">
                      <Award size={14} className="shrink-0 mt-0.5 text-amber-500 dark:text-amber-400" />
                      <span>
                        <strong className="text-slate-900 dark:text-white font-mono">Lasting Impact: </strong>
                        {milestone.tableImpact}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Archival Artifact Plate & Attribution in Side 2 */}
                <div className="w-full sm:w-[calc(50%-2.5rem)] pl-12 sm:pl-0">
                  {artifact && (
                    <div className="rounded-2xl border border-slate-300/80 dark:border-zinc-800 bg-white/95 dark:bg-[#0c0c0e]/95 backdrop-blur-sm p-5 shadow-md space-y-3">
                      {/* Artifact Header with Badge */}
                      <div className="flex items-center justify-between border-b border-slate-100 dark:border-zinc-800 pb-2">
                        <div className="flex items-center gap-1.5 text-slate-600 dark:text-zinc-300 font-mono text-[10px] uppercase font-bold">
                          <FileText size={12} className="text-zinc-500 dark:text-zinc-400" />
                          <span>Historical Archival Record</span>
                        </div>
                        <span className="text-[10px] font-mono text-slate-500 dark:text-zinc-400 font-semibold">{artifact.date}</span>
                      </div>

                      {/* Artifact Graphic Representation */}
                      {renderArtifactGraphic(artifact)}

                      {/* Caption & Title */}
                      <div className="space-y-0.5">
                        <div className="text-xs font-bold font-mono text-slate-900 dark:text-white">
                          {artifact.title}
                        </div>
                        <p className="text-[11px] text-slate-600 dark:text-zinc-300 font-sans leading-tight">
                          {artifact.subtitle}
                        </p>
                      </div>

                      {/* Explicit Royalty-Free Attribution Box */}
                      <div className="pt-2 border-t border-slate-100 dark:border-zinc-800 text-[9.5px] font-mono text-slate-600 dark:text-zinc-400 space-y-0.5 bg-slate-50 dark:bg-zinc-900/60 p-2 rounded-lg border border-slate-200 dark:border-zinc-800">
                        <div className="truncate">
                          <span className="text-slate-400 dark:text-zinc-500">Attribution:</span> {artifact.source}
                        </div>
                        <div className="flex items-center justify-between text-slate-700 dark:text-zinc-300 font-bold">
                          <span>License: {artifact.license}</span>
                          <span className="text-zinc-600 dark:text-zinc-400 font-semibold">Archival Preservation</span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Epilogue Conclusion */}
      <section className="mt-32 max-w-2xl mx-auto text-center px-4 space-y-4">
        <div className="w-12 h-12 mx-auto rounded-full bg-white dark:bg-[#0c0c0e] border border-slate-400 dark:border-zinc-700 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-sm">
          <Atom size={24} />
        </div>
        <h3 className="text-2xl font-bold font-mono text-slate-900 dark:text-white">
          Period 7 Complete — The Frontier Continues
        </h3>
        <p className="text-xs sm:text-sm text-slate-700 dark:text-zinc-300 leading-relaxed font-medium">
          From Lavoisier's first 33 substances to all 118 elements verified today, the periodic table stands as humanity’s premier roadmap of matter. Research continues toward synthesizing elements 119 and 120 in Period 8.
        </p>
      </section>
    </div>
  );
};
