import { ElementData } from '../types/element';

export interface TimelineMilestone {
  year: number;
  title: string;
  description: string;
}

export const TIMELINE_MILESTONES: TimelineMilestone[] = [
  {
    year: 0,
    title: 'Ancient Antiquity',
    description: 'Gold, Silver, Copper, Iron, Lead, Tin, Mercury, Carbon, Sulfur, and early metalloids known since prehistoric times.'
  },
  {
    year: 1669,
    title: 'First Recorded Element',
    description: 'Hennig Brand discovers Phosphorus in Hamburg, the first element with a documented discoverer.'
  },
  {
    year: 1789,
    title: 'Lavoisier & Chemical Revolution',
    description: 'Antoine Lavoisier classifies 33 elements in his Elementary Treatise on Chemistry, redefining modern chemistry.'
  },
  {
    year: 1808,
    title: 'Davy & Electrochemistry',
    description: 'Humphry Davy uses electrolysis to isolate reactive alkali and alkaline earth metals (Na, K, Ca, Mg, Ba).'
  },
  {
    year: 1869,
    title: 'Mendeleev Periodic Table',
    description: 'Dmitri Mendeleev publishes the first Periodic Table of 63 elements, leaving empty gaps predicting undiscovered elements.'
  },
  {
    year: 1898,
    title: 'Radioactivity & Noble Gases',
    description: 'Marie & Pierre Curie discover Polonium and Radium; William Ramsay isolates the noble gases.'
  },
  {
    year: 1945,
    title: 'Seaborg & Actinide Concept',
    description: 'Glenn T. Seaborg reorganizes the periodic table to place the actinide series under the lanthanides.'
  },
  {
    year: 2016,
    title: 'Period 7 Completed',
    description: 'IUPAC officially ratifies Nihonium, Moscovium, Tennessine, and Oganesson, completing all 118 elements of Period 7.'
  }
];

export function getDiscoveredYearNumeric(element: ElementData): number {
  if (element.yearDiscovered === 'Ancient') return 0;
  return Number(element.yearDiscovered) || 0;
}

export function isElementDiscoveredByYear(element: ElementData, year: number): boolean {
  if (element.yearDiscovered === 'Ancient') return true;
  const numYear = Number(element.yearDiscovered);
  return !isNaN(numYear) && numYear <= year;
}

export function isElementDiscoveredInYearRange(element: ElementData, year: number, window = 15): boolean {
  if (element.yearDiscovered === 'Ancient') return year <= 50;
  const numYear = Number(element.yearDiscovered);
  return !isNaN(numYear) && Math.abs(numYear - year) <= window;
}
