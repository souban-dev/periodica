export type ElementState = 'solid' | 'liquid' | 'gas' | 'unknown';

export interface StateMetadata {
  id: ElementState;
  label: string;
  shortLabel: string;
  badgeSymbol: string;
  description: string;
  criteria: string;
  color: string;
  borderHex: string;
  darkBorder: string;
  bgRgba: string;
  darkBg: string;
  glowRgba: string;
  textHex: string;
  darkText: string;
}

export const STATE_METADATA: Record<ElementState, StateMetadata> = {
  solid: {
    id: 'solid',
    label: 'Solid',
    shortLabel: 'SOL',
    badgeSymbol: '■',
    description: 'Rigid crystalline lattice with fixed shape & volume',
    criteria: 'Temperature < Melting Point (T < Tm)',
    color: '#38bdf8', // Ice Cyan / Crystal Blue
    borderHex: '#38bdf8',
    darkBorder: '#38bdf8',
    bgRgba: 'rgba(56, 189, 248, 0.12)',
    darkBg: 'rgba(56, 189, 248, 0.16)',
    glowRgba: 'rgba(56, 189, 248, 0.45)',
    textHex: '#0284c7',
    darkText: '#7dd3fc',
  },
  liquid: {
    id: 'liquid',
    label: 'Liquid',
    shortLabel: 'LIQ',
    badgeSymbol: '▲',
    description: 'Fluid phase with fixed volume conforming to container',
    criteria: 'Melting Point ≤ T < Boiling Point (Tm ≤ T < Tb)',
    color: '#f59e0b', // Molten Amber / Fluid Gold
    borderHex: '#f59e0b',
    darkBorder: '#f59e0b',
    bgRgba: 'rgba(245, 158, 11, 0.15)',
    darkBg: 'rgba(245, 158, 11, 0.20)',
    glowRgba: 'rgba(245, 158, 11, 0.55)',
    textHex: '#b45309',
    darkText: '#fcd34d',
  },
  gas: {
    id: 'gas',
    label: 'Gas',
    shortLabel: 'GAS',
    badgeSymbol: '○',
    description: 'Compressible diffuse vapor expanding to fill entire volume',
    criteria: 'Temperature ≥ Boiling Point (T ≥ Tb)',
    color: '#f43f5e', // Vapor Rose / Thermal Crimson
    borderHex: '#fb7185',
    darkBorder: '#f43f5e',
    bgRgba: 'rgba(244, 63, 94, 0.13)',
    darkBg: 'rgba(244, 63, 94, 0.18)',
    glowRgba: 'rgba(244, 63, 94, 0.55)',
    textHex: '#e11d48',
    darkText: '#fda4af',
  },
  unknown: {
    id: 'unknown',
    label: 'Synthetic / Unknown',
    shortLabel: 'UNK',
    badgeSymbol: '?',
    description: 'Short-lived synthetic radioisotopes with unverified bulk phase',
    criteria: 'Decays in milliseconds; bulk phase unmeasured',
    color: '#71717a', // Muted Gray
    borderHex: '#a1a1aa',
    darkBorder: '#71717a',
    bgRgba: 'rgba(113, 113, 122, 0.10)',
    darkBg: 'rgba(113, 113, 122, 0.15)',
    glowRgba: 'rgba(113, 113, 122, 0.35)',
    textHex: '#52525b',
    darkText: '#d4d4d8',
  },
};
