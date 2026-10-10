import { ElementData, ElementCategory, TrendProperty } from '../types/element';
import { elementsPart1 } from './elementsPart1';
import { elementsPart2 } from './elementsPart2';
import { elementsPart3 } from './elementsPart3';

export const ELEMENTS: ElementData[] = [
  ...elementsPart1,
  ...elementsPart2,
  ...elementsPart3
];

export const ELEMENT_MAP = new Map<number, ElementData>(
  ELEMENTS.map(el => [el.atomicNumber, el])
);

export const ELEMENT_SYMBOL_MAP = new Map<string, ElementData>(
  ELEMENTS.map(el => [el.symbol.toLowerCase(), el])
);

export function getElementByNumber(atomicNumber: number): ElementData | undefined {
  return ELEMENT_MAP.get(atomicNumber);
}

export function getElementBySymbol(symbol: string): ElementData | undefined {
  return ELEMENT_SYMBOL_MAP.get(symbol.toLowerCase());
}

/**
 * Returns the state of matter of the element at a given temperature in Kelvin.
 */
export function getElementStateAtTemp(element: ElementData, tempKelvin: number): 'solid' | 'liquid' | 'gas' | 'unknown' {
  if (element.meltingPoint === null && element.boilingPoint === null) {
    return element.stateAt298K;
  }
  if (element.meltingPoint !== null && tempKelvin < element.meltingPoint) {
    return 'solid';
  }
  if (element.boilingPoint !== null && tempKelvin >= element.boilingPoint) {
    return 'gas';
  }
  if (element.meltingPoint !== null && (element.boilingPoint === null || tempKelvin >= element.meltingPoint)) {
    return 'liquid';
  }
  return element.stateAt298K;
}

/**
 * Min and max ranges for trend properties to calculate color gradients.
 */
export const TREND_RANGES: Record<Exclude<TrendProperty, 'none'>, { min: number; max: number; unit: string; label: string; description: string }> = {
  electronegativity: {
    min: 0.7,
    max: 4.0,
    unit: 'Pauling',
    label: 'Electronegativity',
    description: 'Tendency of an atom to attract a shared pair of electrons in a chemical bond.'
  },
  atomicRadius: {
    min: 30,
    max: 350,
    unit: 'pm',
    label: 'Atomic Radius',
    description: 'Calculated typical distance from the atomic nucleus to the boundary of surrounding electrons.'
  },
  ionizationEnergy: {
    min: 350,
    max: 2400,
    unit: 'kJ/mol',
    label: 'First Ionization Energy',
    description: 'Energy required to remove the most loosely held electron from one mole of gaseous atoms.'
  },
  meltingPoint: {
    min: 0,
    max: 3900,
    unit: 'K',
    label: 'Melting Point',
    description: 'Temperature at which the solid and liquid phases exist in equilibrium at 1 atm.'
  },
  density: {
    min: 0.00008,
    max: 42.0,
    unit: 'g/cm³',
    label: 'Density',
    description: 'Mass per unit volume of the element at room temperature.'
  }
};
