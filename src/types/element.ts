export type ElementCategory =
  | 'alkali-metal'
  | 'alkaline-earth'
  | 'transition-metal'
  | 'post-transition'
  | 'metalloid'
  | 'reactive-nonmetal'
  | 'noble-gas'
  | 'lanthanide'
  | 'actinide'
  | 'unknown';

export type ElementBlock = 's' | 'p' | 'd' | 'f';
export type ElementState = 'solid' | 'liquid' | 'gas' | 'unknown';

export interface ElementData {
  atomicNumber: number;
  symbol: string;
  name: string;
  atomicMass: number;
  period: number;
  group: number;
  category: ElementCategory;
  block: ElementBlock;
  electronConfiguration: string;
  shells: number[];
  valenceElectrons: number;
  electronegativity: number | null;
  atomicRadius: number | null; // pm
  ionizationEnergy: number | null; // kJ/mol
  density: number | null; // g/cm³ (or g/L for gases)
  meltingPoint: number | null; // Kelvin
  boilingPoint: number | null; // Kelvin
  stateAt298K: ElementState;
  discoveredBy: string;
  yearDiscovered: number | string;
  oxidationStates: string;
  summary: string;
  applications: string[];
  spectralHex: string[];
}

export type TrendProperty =
  | 'none'
  | 'electronegativity'
  | 'atomicRadius'
  | 'ionizationEnergy'
  | 'meltingPoint'
  | 'density';

export type ViewMode = 'category' | 'trend' | 'state' | 'block' | 'timeline';

export interface CategoryMetadata {
  id: ElementCategory;
  label: string;
  color: string;
  bgRgba: string;
  borderHex: string;
  textHex: string;
  description: string;
  darkGlow?: string;
  darkBorder?: string;
  darkBg?: string;
  darkText?: string;
}
