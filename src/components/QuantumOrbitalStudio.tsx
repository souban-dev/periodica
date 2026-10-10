import React, { useState, useRef, useEffect } from 'react';
import { ElementData } from '../types/element';
import { ELEMENTS, getElementByNumber } from '../data/elements';
import {
  X,
  Atom,
  Rotate3d,
  Layers,
  TrendingUp,
  Sliders,
  Sparkles,
  HelpCircle,
  Play,
  Pause,
  RotateCcw,
  ChevronRight,
  Info,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Real3DOrbitalCanvas, RealSubshellType } from './Real3DOrbitalCanvas';

export interface QuantumOrbitalStudioProps {
  initialElement?: ElementData | null;
  initialTab?: StudioTab;
  onClose: () => void;
  onSelectElement?: (element: ElementData) => void;
}

export type StudioTab = 'isosurface' | 'aufbau' | 'radial' | 'quantum-numbers';

// Subshell definition for 3D Isosurfaces
type SubshellType = '1s' | '2s' | '2px' | '2py' | '2pz' | '3dxy' | '3dxz' | '3dyz' | '3dx2y2' | '3dz2' | '4f';

// Aufbau energy levels in order of filling (n+l rule)
export interface EnergyLevel {
  label: string;
  n: number;
  l: number; // 0=s, 1=p, 2=d, 3=f
  capacity: number;
  orbitalsCount: number;
}

export const AUFBAU_LEVELS: EnergyLevel[] = [
  { label: '1s', n: 1, l: 0, capacity: 2, orbitalsCount: 1 },
  { label: '2s', n: 2, l: 0, capacity: 2, orbitalsCount: 1 },
  { label: '2p', n: 2, l: 1, capacity: 6, orbitalsCount: 3 },
  { label: '3s', n: 3, l: 0, capacity: 2, orbitalsCount: 1 },
  { label: '3p', n: 3, l: 1, capacity: 6, orbitalsCount: 3 },
  { label: '4s', n: 4, l: 0, capacity: 2, orbitalsCount: 1 },
  { label: '3d', n: 3, l: 2, capacity: 10, orbitalsCount: 5 },
  { label: '4p', n: 4, l: 1, capacity: 6, orbitalsCount: 3 },
  { label: '5s', n: 5, l: 0, capacity: 2, orbitalsCount: 1 },
  { label: '4d', n: 4, l: 2, capacity: 10, orbitalsCount: 5 },
  { label: '5p', n: 5, l: 1, capacity: 6, orbitalsCount: 3 },
  { label: '6s', n: 6, l: 0, capacity: 2, orbitalsCount: 1 },
  { label: '4f', n: 4, l: 3, capacity: 14, orbitalsCount: 7 },
  { label: '5d', n: 5, l: 2, capacity: 10, orbitalsCount: 5 },
  { label: '6p', n: 6, l: 1, capacity: 6, orbitalsCount: 3 },
  { label: '7s', n: 7, l: 0, capacity: 2, orbitalsCount: 1 },
  { label: '5f', n: 5, l: 3, capacity: 14, orbitalsCount: 7 },
  { label: '6d', n: 6, l: 2, capacity: 10, orbitalsCount: 5 },
  { label: '7p', n: 7, l: 1, capacity: 6, orbitalsCount: 3 },
];

// Elements with known anomalous ground-state configurations (Aufbau & Hund exceptions)
export interface AufbauExceptionInfo {
  atomicNumber: number;
  symbol: string;
  name: string;
  groundState: string;
  naiveAufbau: string;
  subshells: Record<string, number>;
  shiftSummary: string;
  note: string;
}

export const AUFBAU_EXCEPTIONS: Record<number, AufbauExceptionInfo> = {
  24: {
    atomicNumber: 24,
    symbol: 'Cr',
    name: 'Chromium',
    groundState: '[Ar] 3d⁵ 4s¹',
    naiveAufbau: '[Ar] 3d⁴ 4s²',
    subshells: { '4s': 1, '3d': 5 },
    shiftSummary: '4s² 3d⁴ → 4s¹ 3d⁵ (half-filled d⁵)',
    note: 'Half-filled 3d⁵ subshell with parallel spins maximizes exchange energy (K) and provides symmetric charge distribution.',
  },
  29: {
    atomicNumber: 29,
    symbol: 'Cu',
    name: 'Copper',
    groundState: '[Ar] 3d¹⁰ 4s¹',
    naiveAufbau: '[Ar] 3d⁹ 4s²',
    subshells: { '4s': 1, '3d': 10 },
    shiftSummary: '4s² 3d⁹ → 4s¹ 3d¹⁰ (fully filled d¹⁰)',
    note: 'Fully-filled 3d¹⁰ closed subshell provides complete spherical shielding and exchange stabilization.',
  },
  41: {
    atomicNumber: 41,
    symbol: 'Nb',
    name: 'Niobium',
    groundState: '[Kr] 4d⁴ 5s¹',
    naiveAufbau: '[Kr] 4d³ 5s²',
    subshells: { '5s': 1, '4d': 4 },
    shiftSummary: '5s² 4d³ → 5s¹ 4d⁴',
    note: 'Transfer of a 5s electron to the more diffuse 4d subshell reduces inter-electronic Coulomb repulsion in 5s.',
  },
  42: {
    atomicNumber: 42,
    symbol: 'Mo',
    name: 'Molybdenum',
    groundState: '[Kr] 4d⁵ 5s¹',
    naiveAufbau: '[Kr] 4d⁴ 5s²',
    subshells: { '5s': 1, '4d': 5 },
    shiftSummary: '5s² 4d⁴ → 5s¹ 4d⁵ (half-filled d⁵)',
    note: 'Half-filled 4d⁵ 5s¹ configuration with maximum spin multiplicity across 6 unpaired valence electrons.',
  },
  44: {
    atomicNumber: 44,
    symbol: 'Ru',
    name: 'Ruthenium',
    groundState: '[Kr] 4d⁷ 5s¹',
    naiveAufbau: '[Kr] 4d⁶ 5s²',
    subshells: { '5s': 1, '4d': 7 },
    shiftSummary: '5s² 4d⁶ → 5s¹ 4d⁷',
    note: '4d and 5s orbitals are nearly degenerate; 4d⁷ 5s¹ minimizes total pairing energy.',
  },
  45: {
    atomicNumber: 45,
    symbol: 'Rh',
    name: 'Rhodium',
    groundState: '[Kr] 4d⁸ 5s¹',
    naiveAufbau: '[Kr] 4d⁷ 5s²',
    subshells: { '5s': 1, '4d': 8 },
    shiftSummary: '5s² 4d⁷ → 5s¹ 4d⁸',
    note: 'Enhanced 4d exchange stabilization outweighs the promotion energy of one 5s electron.',
  },
  46: {
    atomicNumber: 46,
    symbol: 'Pd',
    name: 'Palladium',
    groundState: '[Kr] 4d¹⁰ 5s⁰',
    naiveAufbau: '[Kr] 4d⁸ 5s²',
    subshells: { '5s': 0, '4d': 10 },
    shiftSummary: '5s² 4d⁸ → 5s⁰ 4d¹⁰ (closed 4d¹⁰, vacant 5s)',
    note: 'Complete closure of the 4d subshell (4d¹⁰) leaves 5s completely vacant, creating a pseudo-noble-gas closed core.',
  },
  47: {
    atomicNumber: 47,
    symbol: 'Ag',
    name: 'Silver',
    groundState: '[Kr] 4d¹⁰ 5s¹',
    naiveAufbau: '[Kr] 4d⁹ 5s²',
    subshells: { '5s': 1, '4d': 10 },
    shiftSummary: '5s² 4d⁹ → 5s¹ 4d¹⁰ (fully filled d¹⁰)',
    note: 'Completely filled 4d¹⁰ subshell provides spherical electronic symmetry and high exchange stabilization.',
  },
  57: {
    atomicNumber: 57,
    symbol: 'La',
    name: 'Lanthanum',
    groundState: '[Xe] 5d¹ 6s²',
    naiveAufbau: '[Xe] 4f¹ 6s²',
    subshells: { '4f': 0, '5d': 1, '6s': 2 },
    shiftSummary: '4f¹ → 5d¹ (4f left completely vacant)',
    note: 'The 5d orbital is lower in energy than 4f for Z=57 before the lanthanoid contraction sets in, leaving 4f completely empty (0 e⁻ in 4f).',
  },
  58: {
    atomicNumber: 58,
    symbol: 'Ce',
    name: 'Cerium',
    groundState: '[Xe] 4f¹ 5d¹ 6s²',
    naiveAufbau: '[Xe] 4f² 6s²',
    subshells: { '4f': 1, '5d': 1, '6s': 2 },
    shiftSummary: '4f² → 4f¹ 5d¹ (shared occupancy)',
    note: 'Competition between 4f and 5d subshells results in sharing one electron each: [Xe] 4f¹ 5d¹ 6s².',
  },
  64: {
    atomicNumber: 64,
    symbol: 'Gd',
    name: 'Gadolinium',
    groundState: '[Xe] 4f⁷ 5d¹ 6s²',
    naiveAufbau: '[Xe] 4f⁸ 6s²',
    subshells: { '4f': 7, '5d': 1, '6s': 2 },
    shiftSummary: '4f⁸ → 4f⁷ 5d¹ (half-filled 4f⁷)',
    note: 'Half-filled 4f⁷ spherical shell has enormous exchange energy (Hund’s rule); the next electron enters the 5d orbital.',
  },
  78: {
    atomicNumber: 78,
    symbol: 'Pt',
    name: 'Platinum',
    groundState: '[Xe] 4f¹⁴ 5d⁹ 6s¹',
    naiveAufbau: '[Xe] 4f¹⁴ 5d⁸ 6s²',
    subshells: { '6s': 1, '5d': 9 },
    shiftSummary: '6s² 5d⁸ → 6s¹ 5d⁹',
    note: 'Relativistic expansion of 5d and contraction of 6s stabilizes the 5d⁹ 6s¹ ground state.',
  },
  79: {
    atomicNumber: 79,
    symbol: 'Au',
    name: 'Gold',
    groundState: '[Xe] 4f¹⁴ 5d¹⁰ 6s¹',
    naiveAufbau: '[Xe] 4f¹⁴ 5d⁹ 6s²',
    subshells: { '6s': 1, '5d': 10 },
    shiftSummary: '6s² 5d⁹ → 6s¹ 5d¹⁰ (fully filled 5d¹⁰)',
    note: 'Strong relativistic contraction of 6s and closed-shell 5d¹⁰ stabilization yields [Xe] 4f¹⁴ 5d¹⁰ 6s¹.',
  },
  89: {
    atomicNumber: 89,
    symbol: 'Ac',
    name: 'Actinium',
    groundState: '[Rn] 6d¹ 7s²',
    naiveAufbau: '[Rn] 5f¹ 7s²',
    subshells: { '5f': 0, '6d': 1, '7s': 2 },
    shiftSummary: '5f¹ → 6d¹ (5f left completely vacant)',
    note: 'The 6d orbital is lower in energy than 5f for Z=89 before the actinoid contraction sets in, leaving 5f completely empty (0 e⁻ in 5f).',
  },
  90: {
    atomicNumber: 90,
    symbol: 'Th',
    name: 'Thorium',
    groundState: '[Rn] 6d² 7s²',
    naiveAufbau: '[Rn] 5f² 7s²',
    subshells: { '5f': 0, '6d': 2, '7s': 2 },
    shiftSummary: '5f² → 6d² (5f left completely vacant)',
    note: 'Both outer electrons occupy 6d rather than 5f, giving [Rn] 6d² 7s² (5f is completely empty in neutral Th).',
  },
  91: {
    atomicNumber: 91,
    symbol: 'Pa',
    name: 'Protactinium',
    groundState: '[Rn] 5f² 6d¹ 7s²',
    naiveAufbau: '[Rn] 5f³ 7s²',
    subshells: { '5f': 2, '6d': 1, '7s': 2 },
    shiftSummary: '5f³ → 5f² 6d¹',
    note: 'Near-degeneracy between 5f and 6d leads to a mixed [Rn] 5f² 6d¹ 7s² ground state.',
  },
  92: {
    atomicNumber: 92,
    symbol: 'U',
    name: 'Uranium',
    groundState: '[Rn] 5f³ 6d¹ 7s²',
    naiveAufbau: '[Rn] 5f⁴ 7s²',
    subshells: { '5f': 3, '6d': 1, '7s': 2 },
    shiftSummary: '5f⁴ → 5f³ 6d¹',
    note: 'Uranium ground state populates 5f³ with one persistent 6d¹ valence electron: [Rn] 5f³ 6d¹ 7s².',
  },
  93: {
    atomicNumber: 93,
    symbol: 'Np',
    name: 'Neptunium',
    groundState: '[Rn] 5f⁴ 6d¹ 7s²',
    naiveAufbau: '[Rn] 5f⁵ 7s²',
    subshells: { '5f': 4, '6d': 1, '7s': 2 },
    shiftSummary: '5f⁵ → 5f⁴ 6d¹',
    note: 'Retains one 6d electron due to 5f-6d orbital energy overlap: [Rn] 5f⁴ 6d¹ 7s².',
  },
  96: {
    atomicNumber: 96,
    symbol: 'Cm',
    name: 'Curium',
    groundState: '[Rn] 5f⁷ 6d¹ 7s²',
    naiveAufbau: '[Rn] 5f⁸ 7s²',
    subshells: { '5f': 7, '6d': 1, '7s': 2 },
    shiftSummary: '5f⁸ → 5f⁷ 6d¹ (half-filled 5f⁷)',
    note: 'Preserves the highly stable half-filled 5f⁷ subshell (maximum spin multiplicity); extra electron enters 6d.',
  },
  103: {
    atomicNumber: 103,
    symbol: 'Lr',
    name: 'Lawrencium',
    groundState: '[Rn] 5f¹⁴ 7s² 7p¹',
    naiveAufbau: '[Rn] 5f¹⁴ 6d¹ 7s²',
    subshells: { '6d': 0, '7p': 1, '7s': 2 },
    shiftSummary: '6d¹ → 7p¹ (relativistic 7p stabilization)',
    note: 'Strong relativistic spin-orbit coupling lowers 7p₁/₂ below 6d, experimentally confirmed (JAEA / Nature 2015).',
  },
  110: {
    atomicNumber: 110,
    symbol: 'Ds',
    name: 'Darmstadtium',
    groundState: '[Rn] 5f¹⁴ 6d⁹ 7s¹',
    naiveAufbau: '[Rn] 5f¹⁴ 6d⁸ 7s²',
    subshells: { '7s': 1, '6d': 9 },
    shiftSummary: '7s² 6d⁸ → 7s¹ 6d⁹',
    note: 'Relativistic destabilization of 6d and stabilization of 7s yields an anomalous 6d⁹ 7s¹ ground state.',
  },
  111: {
    atomicNumber: 111,
    symbol: 'Rg',
    name: 'Roentgenium',
    groundState: '[Rn] 5f¹⁴ 6d¹⁰ 7s¹',
    naiveAufbau: '[Rn] 5f¹⁴ 6d⁹ 7s²',
    subshells: { '7s': 1, '6d': 10 },
    shiftSummary: '7s² 6d⁹ → 7s¹ 6d¹⁰ (closed 6d¹⁰)',
    note: 'Relativistic closed-shell stabilization of 6d¹⁰ with a single 7s electron: [Rn] 5f¹⁴ 6d¹⁰ 7s¹.',
  },
};

export const ALL_AUFBAU_EXCEPTIONS_LIST: AufbauExceptionInfo[] = Object.values(AUFBAU_EXCEPTIONS).sort(
  (a, b) => a.atomicNumber - b.atomicNumber
);

// Computes the actual ground-state subshell electron occupancy for any atomic number Z
export function getElementSubshellElectrons(z: number): Record<string, number> {
  const counts: Record<string, number> = {};
  let remaining = z;
  for (const lvl of AUFBAU_LEVELS) {
    if (remaining <= 0) {
      counts[lvl.label] = 0;
    } else {
      const take = Math.min(lvl.capacity, remaining);
      counts[lvl.label] = take;
      remaining -= take;
    }
  }

  // Apply ground-state exception override if Z is an anomalous element
  const exception = AUFBAU_EXCEPTIONS[z];
  if (exception) {
    for (const [subshell, count] of Object.entries(exception.subshells)) {
      counts[subshell] = count;
    }
  }

  return counts;
}

// Computes theoretical subshell electron occupancy strictly following Madelung (n+l) rule
export function getNaiveAufbauSubshellElectrons(z: number): Record<string, number> {
  const counts: Record<string, number> = {};
  let remaining = z;
  for (const lvl of AUFBAU_LEVELS) {
    if (remaining <= 0) {
      counts[lvl.label] = 0;
    } else {
      const take = Math.min(lvl.capacity, remaining);
      counts[lvl.label] = take;
      remaining -= take;
    }
  }
  return counts;
}

// Computes electron counts for any given step in Aufbau filling
export function getTargetElementAufbauStepCounts(
  targetAtomicNumber: number,
  stepElectrons: number,
  mode: 'ground-state' | 'naive-aufbau'
): Record<string, number> {
  const effectiveElectrons = Math.min(targetAtomicNumber, Math.max(0, stepElectrons));
  if (effectiveElectrons <= 0) {
    const empty: Record<string, number> = {};
    AUFBAU_LEVELS.forEach((lvl) => {
      empty[lvl.label] = 0;
    });
    return empty;
  }

  if (mode === 'naive-aufbau') {
    return getNaiveAufbauSubshellElectrons(effectiveElectrons);
  }

  // In ground-state mode: return the exact ground-state electronic configuration at this electron count
  return getElementSubshellElectrons(effectiveElectrons);
}

export const QuantumOrbitalStudio: React.FC<QuantumOrbitalStudioProps> = ({
  initialElement,
  initialTab,
  onClose,
  onSelectElement,
}) => {
  const [selectedElement, setSelectedElement] = useState<ElementData>(
    initialElement || ELEMENTS[5] // Default to Carbon
  );
  const [activeTab, setActiveTab] = useState<StudioTab>(initialTab || 'isosurface');

  // --- 1. 3D Isosurface State ---
  const [selectedSubshell, setSelectedSubshell] = useState<SubshellType>('2pz');
  const [isovalue, setIsovalue] = useState(0.85); // 85% probability envelope
  const [showPhaseColors, setShowPhaseColors] = useState(true);
  const [showNodalPlanes, setShowNodalPlanes] = useState(false);
  const [rotX, setRotX] = useState(25);
  const [rotY, setRotY] = useState(-35);
  const isDraggingRef = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // --- 2. Aufbau State ---
  const [aufbauStep, setAufbauStep] = useState<number>(selectedElement.atomicNumber);
  const [isPlayingAufbau, setIsPlayingAufbau] = useState(false);
  const [aufbauMode, setAufbauMode] = useState<'ground-state' | 'naive-aufbau'>('ground-state');

  // Sync aufbau electrons whenever selected element changes
  useEffect(() => {
    setAufbauStep(selectedElement.atomicNumber);
  }, [selectedElement]);

  // Autoplay timer for Aufbau filling
  useEffect(() => {
    if (!isPlayingAufbau) return;
    const interval = setInterval(() => {
      setAufbauStep((prev) => {
        if (prev >= selectedElement.atomicNumber) {
          setIsPlayingAufbau(false);
          return selectedElement.atomicNumber;
        }
        return prev + 1;
      });
    }, 280);
    return () => clearInterval(interval);
  }, [isPlayingAufbau, selectedElement.atomicNumber]);

  // --- 3. Radial Probability State ---
  const [radialN, setRadialN] = useState(2);
  const [radialL, setRadialL] = useState(1); // 2p by default
  const [showComparison4s3d, setShowComparison4s3d] = useState(false);

  // Keep radial n/l valid
  useEffect(() => {
    if (radialL >= radialN) {
      setRadialL(radialN - 1);
    }
  }, [radialN, radialL]);

  // --- 4. Quantum Numbers State ---
  const [qnN, setQnN] = useState(3);
  const [qnL, setQnL] = useState(1);
  const [qnMl, setQnMl] = useState(0);
  const [qnMs, setQnMs] = useState<0.5 | -0.5>(0.5);

  useEffect(() => {
    if (qnL >= qnN) setQnL(qnN - 1);
  }, [qnN, qnL]);

  useEffect(() => {
    if (Math.abs(qnMl) > qnL) setQnMl(0);
  }, [qnL, qnMl]);

  // Mouse drag handlers for 3D viewports
  const handleMouseDown = (e: React.MouseEvent) => {
    isDraggingRef.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    if (activeTab === 'isosurface') {
      setRotX((prev) => Math.max(-85, Math.min(85, prev - dy * 0.6)));
      setRotY((prev) => (prev + dx * 0.6) % 360);
    }
  };

  const [isOpen, setIsOpen] = useState(false);
  const [isClosing, setIsClosing] = useState(false);

  useEffect(() => {
    const raf = requestAnimationFrame(() => setIsOpen(true));
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleSmoothClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const handleSmoothClose = () => {
    if (isClosing) return;
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 220);
  };

  const handleMouseUp = () => {
    isDraggingRef.current = false;
  };

  const currentAnomaly = AUFBAU_EXCEPTIONS[selectedElement.atomicNumber];

  // Dynamically determine highest occupied subshell level for focused visualization
  const visibleLevels = React.useMemo(() => {
    const groundCounts = getElementSubshellElectrons(selectedElement.atomicNumber);
    const naiveCounts = getNaiveAufbauSubshellElectrons(selectedElement.atomicNumber);
    let maxFilledIdx = 0;
    AUFBAU_LEVELS.forEach((lvl, i) => {
      if ((groundCounts[lvl.label] ?? 0) > 0 || (naiveCounts[lvl.label] ?? 0) > 0) {
        maxFilledIdx = Math.max(maxFilledIdx, i);
      }
    });
    // Show filled subshells plus 1-2 upcoming subshells so user sees the immediate next rung
    return AUFBAU_LEVELS.slice(0, Math.min(AUFBAU_LEVELS.length, maxFilledIdx + 2));
  }, [selectedElement.atomicNumber]);

  // Helper to compute electron distribution in quantum boxes for Aufbau using true ground-state or naive Madelung subshell populations
  const computeSubshellBoxes = (level: EnergyLevel, currentElectrons: number) => {
    // 1. Get accurate subshell electron allocations for currentElectrons and active aufbauMode
    const subshellCounts = getTargetElementAufbauStepCounts(
      selectedElement.atomicNumber,
      currentElectrons,
      aufbauMode
    );
    const available = subshellCounts[level.label] ?? 0;

    // 2. Fill orbitals following Hund's Rule: 1 electron spin-up in each box, then spin-down pairs
    const boxes: { up: boolean; down: boolean }[] = [];
    for (let i = 0; i < level.orbitalsCount; i++) {
      const up = available > i;
      const down = available > level.orbitalsCount + i;
      boxes.push({ up, down });
    }

    // Flag if this subshell deviates from naive Madelung filling for the selected element
    const groundCounts = getElementSubshellElectrons(selectedElement.atomicNumber);
    const naiveCounts = getNaiveAufbauSubshellElectrons(selectedElement.atomicNumber);
    const actualGroundCount = groundCounts[level.label] ?? 0;
    const expectedNaiveCount = naiveCounts[level.label] ?? 0;
    const isExceptionSubshell =
      currentAnomaly !== undefined && actualGroundCount !== expectedNaiveCount;

    return {
      boxes,
      totalInLevel: available,
      isExceptionSubshell,
      actualGroundCount,
      expectedNaiveCount,
    };
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 overflow-y-auto transition-all duration-300 ease-out ${
        isOpen && !isClosing
          ? 'bg-slate-900/60 backdrop-blur-sm opacity-100'
          : 'bg-slate-900/0 backdrop-blur-none opacity-0 pointer-events-none'
      }`}
      onMouseUp={handleMouseUp}
      onClick={(e) => {
        if (e.target === e.currentTarget) handleSmoothClose();
      }}
    >
      <div
        className={`relative bg-white dark:bg-[#1a1b20] rounded-2xl border border-slate-200 dark:border-[#292c35] shadow-2xl w-full max-w-5xl overflow-hidden flex flex-col my-auto max-h-[92vh] text-slate-800 dark:text-zinc-100 transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
          isOpen && !isClosing
            ? 'opacity-100 scale-100 translate-y-0'
            : 'opacity-0 scale-95 translate-y-3'
        }`}
      >
        {/* Prominent Cross / Close Option at the top right corner */}
        <button
          type="button"
          onClick={handleSmoothClose}
          className="absolute top-3 right-3 sm:top-3.5 sm:right-4 z-40 w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white border border-slate-300 dark:border-zinc-700 flex items-center justify-center transition-all cursor-pointer shadow-sm active:scale-95 shrink-0"
          aria-label="Close Quantum Studio"
          title="Close Quantum Studio (Esc)"
        >
          <X size={20} className="stroke-[2.2]" />
        </button>

        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3 px-4 sm:px-5 py-3 sm:py-3.5 pr-14 sm:pr-16 border-b border-slate-200 dark:border-[#292c35] bg-slate-50/80 dark:bg-[#121316]/95">
          <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-zinc-900 dark:bg-zinc-800 text-amber-500 dark:text-amber-400 border border-zinc-300 dark:border-zinc-700 flex items-center justify-center shadow-xs shrink-0">
              <Atom size={18} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="text-sm sm:text-base md:text-lg font-bold font-mono text-slate-900 dark:text-white truncate">
                  Quantum Orbital Studio
                </h2>
                <span className="px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-700 font-mono text-[10px] font-bold whitespace-nowrap">
                  3D Orbitals
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-zinc-400 font-mono truncate">
                Explore 3D electron densities, spin filling, radial nodes & quantum numbers
              </p>
            </div>
          </div>

          {/* Quick Element Selector */}
          <div className="flex items-center gap-2 shrink-0">
            <select
              value={selectedElement.atomicNumber}
              onChange={(e) => {
                const el = getElementByNumber(Number(e.target.value));
                if (el) {
                  setSelectedElement(el);
                  if (onSelectElement) onSelectElement(el);
                }
              }}
              className="px-2.5 py-1 rounded-md border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-mono font-medium text-slate-800 dark:text-zinc-100 outline-none focus:border-zinc-500 shadow-xs cursor-pointer max-w-[190px] sm:max-w-[220px] truncate"
            >
              {ELEMENTS.map((el) => (
                <option key={el.atomicNumber} value={el.atomicNumber}>
                  #{el.atomicNumber} {el.symbol} — {el.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Studio Navigation Tabs (The 4 Key Quantum Ideas) */}
        <div className="flex items-center gap-1 px-4 py-2 border-b border-slate-200 dark:border-zinc-800 bg-white dark:bg-[#0c0c0e]/95 overflow-x-auto text-xs font-mono">
          <button
            type="button"
            onClick={() => setActiveTab('isosurface')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'isosurface'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-white'
            }`}
          >
            <Rotate3d size={14} />
            <span>1. Dotted Quantum Orbitals</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('aufbau')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'aufbau'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-white'
            }`}
          >
            <Layers size={14} />
            <span>2. Aufbau & Hund's Ladder</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('radial')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'radial'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-white'
            }`}
          >
            <TrendingUp size={14} />
            <span>3. Radial Probability Densities</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('quantum-numbers')}
            className={`px-3 py-1.5 rounded-md font-semibold transition-all whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'quantum-numbers'
                ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-bold shadow-xs'
                : 'text-slate-600 dark:text-zinc-400 hover:bg-slate-100 dark:hover:bg-zinc-800 dark:hover:text-white'
            }`}
          >
            <Sliders size={14} />
            <span>4. Quantum Numbers (n, l, mₗ, mₛ)</span>
          </button>
        </div>

        {/* Tab Body Viewport */}
        <div className="flex-1 p-5 overflow-y-auto bg-slate-50/50 dark:bg-[var(--color-canvas,#121316)]">
          {/* ======================================================== */}
          {/* TAB 1: 3D True Quantum Mechanical Isosurfaces            */}
          {/* ======================================================== */}
          {activeTab === 'isosurface' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-stretch">
              {/* Left Column: Interactive 3D Canvas */}
              <div className="lg:col-span-8 bg-white dark:bg-[#0c0c0e] rounded-xl border border-slate-200 dark:border-zinc-800 p-3 shadow-xs relative flex flex-col justify-between select-none min-h-[390px]">
                {/* 3D Coordinate overlay */}
                <div className="absolute top-3 left-3 text-[11px] font-mono text-slate-500 dark:text-zinc-400 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xs px-2.5 py-1 rounded border border-slate-200 dark:border-zinc-800 pointer-events-none z-10 shadow-xs">
                  Subshell: <strong className="text-zinc-900 dark:text-amber-400">{selectedSubshell}</strong> · Simple Dotted Cloud
                </div>

                {/* Lightweight Dotted 3D Quantum Canvas */}
                <div className="w-full flex-1 flex items-center justify-center relative min-h-[320px]">
                  <Real3DOrbitalCanvas
                    subshell={selectedSubshell as RealSubshellType}
                    autoRotate={true}
                  />
                </div>

                {/* Bottom Legend */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-100 dark:border-zinc-800 pt-2 text-[11px] font-mono text-slate-500 dark:text-zinc-400 z-10 bg-white dark:bg-[#0c0c0e]">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-zinc-700 dark:bg-zinc-300" />
                      <span>+ Phase Dots</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded-full bg-amber-600 dark:bg-amber-400" />
                      <span>− Phase Dots</span>
                    </span>
                  </div>
                  <span className="text-[10px] text-slate-400 dark:text-zinc-500">
                    Lightweight Dotted Probability Model · Drag to rotate in 3D
                  </span>
                </div>
              </div>

              {/* Right Column: Controls & Quantum Properties */}
              <div className="lg:col-span-4 space-y-4">
                {/* Subshell Picker */}
                <div className="p-4 rounded-xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold uppercase text-slate-700 dark:text-zinc-300 block">
                      Quantum Subshell (n, l, m):
                    </span>
                    <span className="text-[10px] font-mono text-zinc-800 dark:text-zinc-200 bg-zinc-100 dark:bg-zinc-800 px-1.5 py-0.5 rounded border border-zinc-200 dark:border-zinc-700 font-bold">
                      Dotted |ψ|²
                    </span>
                  </div>
                  <div className="grid grid-cols-2 gap-1.5 font-mono text-xs">
                    {[
                      { id: '1s', label: '(1,0,0) · 1s' },
                      { id: '2s', label: '(2,0,0) · 2s' },
                      { id: '3s', label: '(3,0,0) · 3s' },
                      { id: '2pz', label: '(2,1,0) · 2pz' },
                      { id: '2px', label: '(2,1,1) · 2px' },
                      { id: '3p', label: '(3,1,0) · 3p' },
                      { id: '3dz2', label: '(3,2,0) · 3dz²' },
                      { id: '3dxz', label: '(3,2,1) · 3dxz' },
                      { id: '3dx2y2', label: '(3,2,2) · 3dx²-y²' },
                      { id: '4f', label: '(4,3,0) · 4f' },
                    ].map((item) => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => {
                          setSelectedSubshell(item.id as SubshellType);
                        }}
                        className={`py-1.5 px-2 rounded border font-semibold text-left transition-colors cursor-pointer text-[11px] ${
                          selectedSubshell === item.id
                            ? 'bg-zinc-900 text-white border-zinc-900 dark:bg-zinc-100 dark:text-zinc-950 dark:border-white font-bold shadow-xs'
                            : 'bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-slate-700 dark:text-zinc-300 hover:bg-slate-100 dark:hover:bg-zinc-800'
                        }`}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Physics Info Card */}
                <div className="p-3.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-xs font-mono text-zinc-900 dark:text-zinc-200 space-y-1">
                  <div className="font-bold flex items-center gap-1 text-slate-900 dark:text-white">
                    <Info size={13} className="text-zinc-600 dark:text-zinc-400" />
                    Simple Dotted Quantum Model:
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-zinc-400 leading-relaxed font-sans">
                    Each dot represents a discrete probability sample point for finding the electron. Densely populated clusters represent high electron presence probability (|ψ|²), while the clear gaps represent nodal boundaries.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 2: Live Aufbau & Hund's Rule Energy Ladder           */}
          {/* ======================================================== */}
          {activeTab === 'aufbau' && (
            <div className="space-y-4">
              {/* Top Controller Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 shadow-xs">
                <div className="space-y-1 font-mono">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-bold text-slate-500 dark:text-zinc-400 uppercase">Target Element:</span>
                    <strong className="text-sm text-slate-900 dark:text-white">
                      #{selectedElement.atomicNumber} {selectedElement.symbol} ({selectedElement.name})
                    </strong>
                    {currentAnomaly && (
                      <span className="px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/80 text-amber-800 dark:text-amber-300 text-[10px] font-bold border border-amber-300 dark:border-amber-700 flex items-center gap-1">
                        <Sparkles size={11} className="text-amber-500" />
                        Aufbau Exception
                      </span>
                    )}
                  </div>
                  <div className="text-xs flex items-center gap-2 flex-wrap">
                    <span className="text-slate-500 dark:text-zinc-400">
                      {aufbauMode === 'ground-state' ? 'Active Ground State:' : 'Theoretical Madelung:'}
                    </span>
                    <strong className="font-bold text-amber-600 dark:text-amber-400">
                      {aufbauMode === 'ground-state'
                        ? selectedElement.electronConfiguration
                        : (currentAnomaly?.naiveAufbau ?? selectedElement.electronConfiguration)}
                    </strong>
                  </div>
                </div>

                {/* Mode Toggle (Observed Ground State vs Idealized Madelung Rule) */}
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="flex items-center rounded-lg p-0.5 bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-800 text-[11px] font-mono">
                    <button
                      type="button"
                      onClick={() => setAufbauMode('ground-state')}
                      className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                        aufbauMode === 'ground-state'
                          ? 'bg-amber-500 text-zinc-950 shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Observed experimental ground-state electronic configuration (with anomalies)"
                    >
                      Observed State {currentAnomaly ? '⚡' : ''}
                    </button>
                    <button
                      type="button"
                      onClick={() => setAufbauMode('naive-aufbau')}
                      className={`px-2.5 py-1 rounded font-bold transition-all cursor-pointer ${
                        aufbauMode === 'naive-aufbau'
                          ? 'bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-950 shadow-xs'
                          : 'text-slate-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white'
                      }`}
                      title="Idealized Madelung (n+l) Aufbau filling rule"
                    >
                      Madelung Rule
                    </button>
                  </div>

                  {/* Step / Play Controls */}
                  <div className="flex items-center gap-1.5 font-mono text-xs">
                    <button
                      type="button"
                      onClick={() => setAufbauStep((p) => Math.max(0, p - 1))}
                      disabled={aufbauStep <= 0}
                      className="px-2.5 py-1 rounded border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
                    >
                      − 1e⁻
                    </button>

                    <div className="px-2.5 py-1 rounded bg-slate-100 dark:bg-zinc-900 border border-slate-200 dark:border-zinc-700 text-slate-800 dark:text-zinc-200 font-bold tabular-nums text-xs">
                      {aufbauStep} / {selectedElement.atomicNumber} e⁻
                    </div>

                    <button
                      type="button"
                      onClick={() => setAufbauStep((p) => Math.min(selectedElement.atomicNumber, p + 1))}
                      disabled={aufbauStep >= selectedElement.atomicNumber}
                      className="px-2.5 py-1 rounded border border-slate-300 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 text-slate-700 dark:text-zinc-200 hover:bg-slate-100 dark:hover:bg-zinc-800 disabled:opacity-40 cursor-pointer"
                    >
                      + 1e⁻
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        if (aufbauStep >= selectedElement.atomicNumber) setAufbauStep(0);
                        setIsPlayingAufbau(!isPlayingAufbau);
                      }}
                      className={`px-3 py-1 rounded font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                        isPlayingAufbau
                          ? 'bg-amber-600 text-white'
                          : 'bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-zinc-100 dark:text-zinc-950 dark:hover:bg-white'
                      }`}
                    >
                      {isPlayingAufbau ? <Pause size={13} /> : <Play size={13} />}
                      <span>{isPlayingAufbau ? 'Pause' : 'Autoplay'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setIsPlayingAufbau(false);
                        setAufbauStep(selectedElement.atomicNumber);
                      }}
                      className="p-1.5 rounded border border-slate-200 dark:border-zinc-700 bg-slate-50 dark:bg-zinc-900 hover:bg-slate-100 dark:hover:bg-zinc-800 text-slate-500 dark:text-zinc-400 cursor-pointer"
                      title="Fill all electrons"
                    >
                      <RotateCcw size={14} />
                    </button>
                  </div>
                </div>
              </div>

              {/* Anomaly Banner if element is an Aufbau exception */}
              {currentAnomaly && (
                <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800/70 text-xs font-mono space-y-2.5 shadow-xs">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <div className="flex items-center gap-2">
                      <AlertCircle size={16} className="text-amber-600 dark:text-amber-400 shrink-0" />
                      <strong className="text-sm text-amber-950 dark:text-amber-100">
                        Aufbau Exception Detected: {currentAnomaly.name} ({currentAnomaly.symbol})
                      </strong>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-amber-200/90 dark:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-[11px] font-bold border border-amber-300 dark:border-amber-700">
                      ⚡ {currentAnomaly.shiftSummary}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-white/80 dark:bg-zinc-900/80 border border-amber-200 dark:border-amber-900/60 space-y-0.5">
                      <span className="text-slate-500 dark:text-zinc-400 block text-[10px] uppercase font-bold">
                        Observed Ground State (Experimental)
                      </span>
                      <span className="text-amber-700 dark:text-amber-300 font-bold text-xs">
                        {currentAnomaly.groundState}
                      </span>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white/90 dark:bg-zinc-900/90 border border-amber-200 dark:border-amber-900/60 space-y-0.5">
                      <span className="text-slate-600 dark:text-zinc-400 block text-[10px] uppercase font-bold">
                        Idealized Madelung (Naive Aufbau)
                      </span>
                      <span className="text-slate-800 dark:text-zinc-200 font-bold text-xs">
                        {currentAnomaly.naiveAufbau}
                      </span>
                    </div>
                  </div>

                  <p className="text-[11px] text-amber-900 dark:text-amber-200/90 leading-relaxed font-sans">
                    <strong>Quantum Mechanism: </strong>{currentAnomaly.note}
                  </p>
                </div>
              )}

              {/* Quick Jump Ribbon for All 22 Aufbau Exceptions */}
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-zinc-900/50 border border-slate-200 dark:border-zinc-800 text-xs font-mono space-y-2">
                <div className="flex items-center justify-between flex-wrap gap-1">
                  <span className="font-bold text-slate-800 dark:text-zinc-200 flex items-center gap-1.5 text-[11px]">
                    <Sparkles size={13} className="text-amber-500" />
                    All 22 Aufbau & Hund's Rule Exceptions in the Periodic Table:
                  </span>
                  <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                    Click any element to inspect its anomalous subshell ladder
                  </span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ALL_AUFBAU_EXCEPTIONS_LIST.map((anom) => {
                    const isSelected = selectedElement.atomicNumber === anom.atomicNumber;
                    const isHighlight = anom.symbol === 'La' || anom.symbol === 'Ac';
                    return (
                      <button
                        key={anom.atomicNumber}
                        type="button"
                        onClick={() => {
                          const el = getElementByNumber(anom.atomicNumber);
                          if (el) {
                            setSelectedElement(el);
                            if (onSelectElement) onSelectElement(el);
                          }
                        }}
                        className={`px-2 py-0.5 rounded text-[11px] font-bold border transition-colors cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-amber-500 text-zinc-950 border-amber-500 shadow-xs ring-1 ring-amber-400 font-extrabold'
                            : isHighlight
                            ? 'bg-amber-100/60 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 border-amber-300 dark:border-amber-700 hover:border-amber-500'
                            : 'bg-white dark:bg-zinc-900 text-slate-700 dark:text-zinc-300 border-slate-300 dark:border-zinc-700 hover:border-amber-400 dark:hover:border-amber-500'
                        }`}
                        title={`${anom.name} (#${anom.atomicNumber}): ${anom.groundState} (vs Madelung ${anom.naiveAufbau}) — ${anom.shiftSummary}`}
                      >
                        <span>{anom.symbol}</span>
                        <span className="text-[9px] opacity-70">({anom.atomicNumber})</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Energy Ladder (Aufbau Subshell Rungs) */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c0c0e] border border-slate-200 dark:border-zinc-800 shadow-xs space-y-3 font-mono">
                <div className="flex justify-between items-center text-xs text-slate-500 dark:text-zinc-400 border-b border-slate-100 dark:border-zinc-800 pb-2">
                  <span className="font-bold uppercase tracking-wider">Subshell Energy Level (E ↑)</span>
                  <span>Quantum Boxes & Spin Vectors (Hund's Rule)</span>
                </div>

                <div className="space-y-2.5 max-h-[460px] overflow-y-auto pr-1">
                  {visibleLevels.map((level) => {
                    const {
                      boxes,
                      totalInLevel,
                      isExceptionSubshell,
                      actualGroundCount,
                      expectedNaiveCount,
                    } = computeSubshellBoxes(level, aufbauStep);

                    const isFullyFilled = totalInLevel === level.capacity;
                    const isPartiallyFilled = totalInLevel > 0 && !isFullyFilled;

                    return (
                      <div
                        key={level.label}
                        className={`flex items-center justify-between p-2.5 rounded-lg border transition-all ${
                          isExceptionSubshell
                            ? 'bg-amber-50/70 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600 ring-1 ring-amber-300 dark:ring-amber-700/60'
                            : isFullyFilled
                            ? 'bg-zinc-100/70 dark:bg-zinc-900/60 border-zinc-300 dark:border-zinc-700'
                            : isPartiallyFilled
                            ? 'bg-amber-50/80 dark:bg-amber-950/40 border-amber-300 dark:border-amber-700 ring-1 ring-amber-300 dark:ring-amber-800'
                            : 'bg-slate-50/50 dark:bg-zinc-900/30 border-slate-200/80 dark:border-zinc-800/80 opacity-60'
                        }`}
                      >
                        {/* Subshell Label & Exception Indicator */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-8 font-bold text-sm text-slate-800 dark:text-zinc-100">{level.label}</span>
                          <span className="text-[10px] text-slate-500 dark:text-zinc-400">
                            (n={level.n}, l={level.l})
                          </span>
                          {isExceptionSubshell && (
                            <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-700 text-[10px] font-bold">
                              {actualGroundCount === 0
                                ? `⚡ Exception: Vacant (${level.label}⁰ vs Madelung ${level.label}${expectedNaiveCount})`
                                : actualGroundCount > expectedNaiveCount
                                ? `⚡ Exception: +${actualGroundCount - expectedNaiveCount} e⁻ Promoted (${level.label}${actualGroundCount} vs Madelung ${level.label}${expectedNaiveCount})`
                                : `⚡ Exception: −${expectedNaiveCount - actualGroundCount} e⁻ Shifted (${level.label}${actualGroundCount} vs Madelung ${level.label}${expectedNaiveCount})`}
                            </span>
                          )}
                        </div>

                        {/* Electron Boxes with Spin Arrows */}
                        <div className="flex items-center gap-2">
                          {boxes.map((box, bIdx) => (
                            <div
                              key={bIdx}
                              className={`w-9 h-9 rounded border-2 flex items-center justify-center gap-1 font-bold text-base transition-colors ${
                                box.up && box.down
                                  ? 'border-zinc-700 dark:border-zinc-400 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-white shadow-xs'
                                  : box.up
                                  ? 'border-amber-600 dark:border-amber-500 bg-white dark:bg-zinc-900 text-amber-600 dark:text-amber-400 shadow-xs'
                                  : 'border-slate-300 dark:border-zinc-700 bg-slate-100 dark:bg-zinc-900 text-slate-300 dark:text-zinc-700'
                              }`}
                            >
                              <span className={box.up ? 'text-zinc-900 dark:text-amber-400' : 'text-transparent'}>↑</span>
                              <span className={box.down ? 'text-rose-600 dark:text-rose-400' : 'text-transparent'}>↓</span>
                            </div>
                          ))}

                          <span className="text-xs font-bold text-slate-700 dark:text-zinc-300 w-12 text-right">
                            {totalInLevel} / {level.capacity}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-zinc-800 flex flex-wrap items-center justify-between gap-2 text-[11px] text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center gap-4">
                    <span className="flex items-center gap-1.5">
                      <strong className="text-zinc-900 dark:text-amber-400">↑ Spin-Up:</strong> mₛ = +½
                    </span>
                    <span className="flex items-center gap-1.5">
                      <strong className="text-rose-600 dark:text-rose-400">↓ Spin-Down:</strong> mₛ = −½
                    </span>
                  </div>
                  <span className="text-slate-400 dark:text-zinc-500">Hund's Rule: Degenerate orbitals half-fill with parallel spins first to maximize exchange energy.</span>
                </div>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 3: Radial Probability Density Distribution           */}
          {/* ======================================================== */}
          {activeTab === 'radial' && (
            <div className="space-y-5">
              {/* Subshell Selection Header */}
              <div className="flex flex-wrap items-center justify-between gap-3 p-4 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-xs font-mono text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Principal Shell (n):</span>
                  {[1, 2, 3, 4, 5].map((nVal) => (
                    <button
                      key={nVal}
                      type="button"
                      onClick={() => setRadialN(nVal)}
                      className={`w-7 h-7 rounded border font-bold cursor-pointer transition-colors ${
                        radialN === nVal
                          ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                          : 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {nVal}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700 dark:text-slate-300">Subshell (l):</span>
                  {['s (l=0)', 'p (l=1)', 'd (l=2)', 'f (l=3)'].map((lLabel, lIdx) => {
                    const isAvailable = lIdx < radialN;
                    return (
                      <button
                        key={lLabel}
                        type="button"
                        disabled={!isAvailable}
                        onClick={() => setRadialL(lIdx)}
                        className={`px-2.5 py-1 rounded border font-semibold cursor-pointer transition-colors ${
                          radialL === lIdx && isAvailable
                            ? 'bg-blue-600 text-white border-blue-600 shadow-xs'
                            : isAvailable
                            ? 'bg-slate-50 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800'
                            : 'opacity-30 border-dashed cursor-not-allowed text-slate-400 dark:text-slate-600'
                        }`}
                      >
                        {lLabel}
                      </button>
                    );
                  })}
                </div>

                <button
                  type="button"
                  onClick={() => setShowComparison4s3d(!showComparison4s3d)}
                  className={`px-3 py-1 rounded border transition-colors cursor-pointer font-semibold ${
                    showComparison4s3d
                      ? 'bg-purple-600 text-white border-purple-600 shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700'
                  }`}
                >
                  {showComparison4s3d ? '✓ 4s vs 3d Shielding Active' : 'Compare 4s vs 3d Shielding'}
                </button>
              </div>

              {/* Radial Probability Graph SVG */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
                <div className="flex items-center justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 dark:text-white text-sm">
                      P(r) = 4π r² |R_{radialN}{radialL === 0 ? 's' : radialL === 1 ? 'p' : radialL === 2 ? 'd' : 'f'}(r)|²
                    </span>
                    <span className="text-slate-400 dark:text-slate-500">· Probability of finding electron at distance r</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500 dark:text-slate-400">
                    <span>Radial Nodes = <strong className="text-rose-600 dark:text-rose-400">{radialN - radialL - 1}</strong></span>
                    <span>Angular Nodes = <strong className="text-blue-600 dark:text-cyan-400">{radialL}</strong></span>
                    <span>Total Nodes = <strong className="text-slate-800 dark:text-slate-200">{radialN - 1}</strong></span>
                  </div>
                </div>

                {/* SVG Curve Plot */}
                <div className="relative h-64 w-full bg-slate-50 dark:bg-[#070b14] rounded-lg border border-slate-200 dark:border-slate-800 p-2 overflow-hidden">
                  <svg viewBox="0 0 500 220" className="w-full h-full overflow-visible" preserveAspectRatio="none">
                    {/* Grid lines */}
                    {[50, 100, 150, 200].map((y) => (
                      <line key={y} x1="0" y1={y} x2="500" y2={y} stroke="rgba(100, 116, 139, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                    ))}
                    {[100, 200, 300, 400].map((x) => (
                      <line key={x} x1={x} y1="0" x2={x} y2="220" stroke="rgba(100, 116, 139, 0.25)" strokeWidth="1" strokeDasharray="3 3" />
                    ))}

                    {/* Standard Curve Generation */}
                    {!showComparison4s3d ? (
                      <path
                        d={
                          radialN === 1 && radialL === 0
                            ? 'M 0 215 C 30 210, 50 10, 90 20 C 140 30, 200 180, 480 215'
                            : radialN === 2 && radialL === 0
                            ? 'M 0 215 Q 35 150 65 215 Q 120 20 220 180 T 480 215'
                            : radialN === 2 && radialL === 1
                            ? 'M 0 215 Q 100 20 160 40 T 480 215'
                            : radialN === 3 && radialL === 0
                            ? 'M 0 215 Q 25 180 45 215 Q 85 130 135 215 Q 220 20 380 215'
                            : radialN === 3 && radialL === 1
                            ? 'M 0 215 Q 50 160 90 215 Q 180 25 360 215'
                            : 'M 0 215 Q 160 20 240 60 T 480 215'
                        }
                        fill="rgba(56, 189, 248, 0.2)"
                        stroke="#38bdf8"
                        strokeWidth="2.5"
                      />
                    ) : (
                      <>
                        {/* 4s Curve (penetrating closer to nucleus!) */}
                        <path
                          d="M 0 215 Q 18 160 32 215 Q 60 140 95 215 Q 150 110 200 215 Q 280 40 460 215"
                          fill="rgba(59, 130, 246, 0.2)"
                          stroke="#38bdf8"
                          strokeWidth="2.5"
                        />
                        {/* 3d Curve (diffuse, fills after 4s) */}
                        <path
                          d="M 0 215 Q 120 215 160 210 Q 220 25 320 140 T 480 215"
                          fill="rgba(244, 63, 94, 0.2)"
                          stroke="#f43f5e"
                          strokeWidth="2.5"
                        />
                      </>
                    )}

                    {/* Nucleus origin indicator */}
                    <circle cx="2" cy="215" r="4" fill="#38bdf8" />
                  </svg>
                </div>

                {/* Penetration Legend */}
                {showComparison4s3d && (
                  <div className="p-3.5 rounded-lg bg-purple-50 dark:bg-purple-950/40 border border-purple-200 dark:border-purple-900/60 text-xs font-mono space-y-1">
                    <div className="font-bold text-purple-900 dark:text-purple-300 flex items-center gap-2">
                      <span className="w-3 h-0.5 bg-blue-600 dark:bg-sky-400 inline-block" /> 4s Orbital (Blue) vs
                      <span className="w-3 h-0.5 bg-rose-600 dark:bg-rose-400 inline-block" /> 3d Orbital (Red)
                    </div>
                    <p className="text-[11px] text-slate-700 dark:text-slate-300 leading-relaxed font-sans">
                      Notice the small inner wave maxima of the <strong>4s orbital</strong> close to the nucleus (r &lt; 2 a₀). Even though the average radius of 4s is greater than 3d, this penetration gives 4s a lower potential energy in neutral atoms, explaining why <strong>4s fills before 3d in the periodic table!</strong>
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* TAB 4: Quantum Numbers Dashboard (n, l, ml, ms)          */}
          {/* ======================================================== */}
          {activeTab === 'quantum-numbers' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Controls Panel */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-xs space-y-5 font-mono">
                <div className="border-b border-slate-100 dark:border-slate-800 pb-2">
                  <h3 className="font-bold text-slate-900 dark:text-white text-sm uppercase">
                    The 4 Fundamental Quantum Numbers
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Every electron in an atom possesses a unique set of 4 quantum coordinates (Pauli Exclusion).
                  </p>
                </div>

                {/* 1. Principal Quantum Number n */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">1. Principal (n): Shell Energy & Size</span>
                    <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-cyan-300 border border-transparent dark:border-blue-800 font-bold">n = {qnN}</span>
                  </div>
                  <input
                    type="range"
                    min="1"
                    max="7"
                    value={qnN}
                    onChange={(e) => setQnN(Number(e.target.value))}
                    className="w-full accent-blue-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>n=1 (K shell)</span>
                    <span>n=4 (N shell)</span>
                    <span>n=7 (Q shell)</span>
                  </div>
                </div>

                {/* 2. Azimuthal / Orbital Angular Momentum l */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">2. Azimuthal (l): Subshell Geometry</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border border-transparent dark:border-emerald-800 font-bold">
                      l = {qnL} ({qnL === 0 ? 's' : qnL === 1 ? 'p' : qnL === 2 ? 'd' : 'f'})
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max={qnN - 1}
                    value={qnL}
                    onChange={(e) => setQnL(Number(e.target.value))}
                    className="w-full accent-emerald-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>0 ≤ l &lt; n</span>
                    <span>l={qnL}: {qnL === 0 ? 'Spherical' : qnL === 1 ? 'Dumbbell' : qnL === 2 ? 'Clover' : 'Octal'}</span>
                  </div>
                </div>

                {/* 3. Magnetic Quantum Number ml */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">3. Magnetic (mₗ): Spatial Orientation</span>
                    <span className="px-2 py-0.5 rounded bg-purple-100 dark:bg-purple-950/60 text-purple-800 dark:text-purple-300 border border-transparent dark:border-purple-800 font-bold">
                      mₗ = {qnMl > 0 ? `+${qnMl}` : qnMl}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={-qnL}
                    max={qnL}
                    value={qnMl}
                    onChange={(e) => setQnMl(Number(e.target.value))}
                    className="w-full accent-purple-600 cursor-pointer h-1.5 bg-slate-200 dark:bg-slate-700 rounded"
                  />
                  <div className="flex justify-between text-[10px] text-slate-400 dark:text-slate-500">
                    <span>−{qnL} ≤ mₗ ≤ +{qnL}</span>
                    <span>Total Orientations = 2l + 1 ({2 * qnL + 1})</span>
                  </div>
                </div>

                {/* 4. Spin Quantum Number ms */}
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-200">4. Spin (mₛ): Intrinsic Angular Momentum</span>
                    <span className="px-2 py-0.5 rounded bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border border-transparent dark:border-rose-800 font-bold">
                      mₛ = {qnMs > 0 ? '+½' : '−½'}
                    </span>
                  </div>
                  <div className="flex gap-2 text-xs">
                    <button
                      type="button"
                      onClick={() => setQnMs(0.5)}
                      className={`flex-1 py-1.5 rounded border font-bold transition-colors cursor-pointer ${
                        qnMs === 0.5 ? 'bg-blue-600 text-white border-blue-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      ↑ Spin Up (+½)
                    </button>
                    <button
                      type="button"
                      onClick={() => setQnMs(-0.5)}
                      className={`flex-1 py-1.5 rounded border font-bold transition-colors cursor-pointer ${
                        qnMs === -0.5 ? 'bg-rose-600 text-white border-rose-600 shadow-xs' : 'bg-slate-50 dark:bg-slate-900 border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      ↓ Spin Down (−½)
                    </button>
                  </div>
                </div>
              </div>

              {/* Derived Physical Quantities Display */}
              <div className="p-5 rounded-xl bg-white dark:bg-[#0c121e] border border-slate-200 dark:border-slate-800 shadow-xs space-y-4 font-mono">
                <h4 className="font-bold text-slate-900 dark:text-white text-sm uppercase border-b border-slate-100 dark:border-slate-800 pb-2">
                  Derived Physical Properties for ({qnN}, {qnL}, {qnMl}, {qnMs > 0 ? '+½' : '−½'}):
                </h4>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-bold">Shell Capacity (2n²)</span>
                    <strong className="text-base text-blue-700 dark:text-cyan-400">{2 * qnN * qnN} electrons</strong>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-bold">Subshell Capacity (2(2l+1))</span>
                    <strong className="text-base text-emerald-700 dark:text-emerald-400">{2 * (2 * qnL + 1)} electrons</strong>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-bold">Radial Nodes (n - l - 1)</span>
                    <strong className="text-base text-rose-700 dark:text-rose-400">{qnN - qnL - 1}</strong>
                  </div>

                  <div className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 space-y-1">
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block font-bold">Angular Nodes (l)</span>
                    <strong className="text-base text-purple-700 dark:text-purple-400">{qnL}</strong>
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60 text-xs text-amber-950 dark:text-amber-200 font-sans space-y-1">
                  <strong className="font-mono">Orbital Angular Momentum:</strong>
                  <div className="font-mono text-sm font-bold text-amber-900 dark:text-amber-400">
                    L = ℏ√({qnL}({qnL}+1)) = {(Math.sqrt(qnL * (qnL + 1))).toFixed(3)} ℏ
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-5 py-3 border-t border-slate-200 dark:border-[#292c35] bg-slate-50 dark:bg-[#121316] font-mono text-xs text-slate-500 dark:text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="font-bold text-slate-700 dark:text-zinc-200">Quantum Studio</span>
            <span>·</span>
            <span>Selected Element: #{selectedElement.atomicNumber} {selectedElement.symbol}</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-md bg-slate-900 dark:bg-amber-500 hover:bg-slate-800 dark:hover:bg-amber-400 text-white dark:text-zinc-950 font-bold cursor-pointer transition-colors shadow-xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
