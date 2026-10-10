export interface SpectralLine {
  wavelengthNm: number; // in nanometers (380 to 750 for visible)
  intensity: number; // relative intensity 0.0 to 1.0
  colorHex: string;
  transition?: string; // e.g. "3d -> 2p" or "Balmer H-alpha"
  energyEv: number; // E = hc / lambda (in eV)
}

export interface FlameTestData {
  flameHex: string;
  glowHex: string;
  name: string;
  description: string;
  spectralPeakNm: number;
}

export interface GasDischargeData {
  tubeHex: string;
  glowRgba: string;
  name: string;
  uses: string;
}

export interface ElementSpectralProfile {
  symbol: string;
  name: string;
  atomicNumber: number;
  flameTest?: FlameTestData;
  gasDischarge?: GasDischargeData;
  lines: SpectralLine[];
  historicNote: string;
}

/**
 * Calculates photon energy in eV from wavelength in nm
 * E = hc / lambda = (1239.84 eV*nm) / lambda
 */
export function nmToEv(wavelengthNm: number): number {
  return Number((1239.84193 / wavelengthNm).toFixed(3));
}

/**
 * Physically grounded wavelength (nm) to RGB Hex conversion
 * Visible range: 380nm - 750nm
 */
export function wavelengthToHex(wl: number): string {
  let r = 0;
  let g = 0;
  let b = 0;

  if (wl >= 380 && wl < 440) {
    r = -(wl - 440) / (440 - 380);
    g = 0.0;
    b = 1.0;
  } else if (wl >= 440 && wl < 490) {
    r = 0.0;
    g = (wl - 440) / (490 - 440);
    b = 1.0;
  } else if (wl >= 490 && wl < 510) {
    r = 0.0;
    g = 1.0;
    b = -(wl - 510) / (510 - 490);
  } else if (wl >= 510 && wl < 580) {
    r = (wl - 510) / (580 - 510);
    g = 1.0;
    b = 0.0;
  } else if (wl >= 580 && wl < 645) {
    r = 1.0;
    g = -(wl - 645) / (645 - 580);
    b = 0.0;
  } else if (wl >= 645 && wl <= 750) {
    r = 1.0;
    g = 0.0;
    b = 0.0;
  }

  // Intensity falloff near visual limits (human eye sensitivity)
  let factor = 0.0;
  if (wl >= 380 && wl < 420) {
    factor = 0.3 + (0.7 * (wl - 380)) / (420 - 380);
  } else if (wl >= 420 && wl <= 700) {
    factor = 1.0;
  } else if (wl > 700 && wl <= 750) {
    factor = 0.3 + (0.7 * (750 - wl)) / (750 - 700);
  }

  const red = Math.round(255 * Math.pow(r * factor, 0.8));
  const green = Math.round(255 * Math.pow(g * factor, 0.8));
  const blue = Math.round(255 * Math.pow(b * factor, 0.8));

  return (
    '#' +
    [red, green, blue]
      .map((x) => x.toString(16).padStart(2, '0'))
      .join('')
  );
}

export const SPECTRAL_PROFILES: Record<string, ElementSpectralProfile> = {
  H: {
    symbol: 'H',
    name: 'Hydrogen',
    atomicNumber: 1,
    gasDischarge: {
      tubeHex: '#e879f9',
      glowRgba: 'rgba(232, 121, 249, 0.7)',
      name: 'Balmer Violet-Magenta',
      uses: 'Astronomical spectroscopy (H-alpha nebulae, stellar mass determinations)',
    },
    historicNote:
      'Johann Balmer (1885) and Niels Bohr (1913) formulated modern quantum physics based entirely on this precise 4-line visible hydrogen emission series.',
    lines: [
      {
        wavelengthNm: 410.2,
        intensity: 0.5,
        colorHex: '#7c3aed',
        transition: 'Balmer H-delta (n=6 -> 2)',
        energyEv: nmToEv(410.2),
      },
      {
        wavelengthNm: 434.0,
        intensity: 0.7,
        colorHex: '#4f46e5',
        transition: 'Balmer H-gamma (n=5 -> 2)',
        energyEv: nmToEv(434.0),
      },
      {
        wavelengthNm: 486.1,
        intensity: 0.9,
        colorHex: '#06b6d4',
        transition: 'Balmer H-beta (n=4 -> 2)',
        energyEv: nmToEv(486.1),
      },
      {
        wavelengthNm: 656.3,
        intensity: 1.0,
        colorHex: '#ef4444',
        transition: 'Balmer H-alpha (n=3 -> 2)',
        energyEv: nmToEv(656.3),
      },
    ],
  },
  He: {
    symbol: 'He',
    name: 'Helium',
    atomicNumber: 2,
    gasDischarge: {
      tubeHex: '#fed7aa',
      glowRgba: 'rgba(254, 215, 170, 0.8)',
      name: 'Peach Yellow-Gold Glow',
      uses: 'Gas laser tubes (He-Ne laser, 632.8 nm)',
    },
    historicNote:
      'Discovered on the Sun before Earth! Jules Janssen and Norman Lockyer noticed the unknown 587.6 nm yellow line (D3) in solar eclipse spectroscopy in 1868.',
    lines: [
      { wavelengthNm: 447.1, intensity: 0.6, colorHex: '#3b82f6', transition: '4d -> 2p', energyEv: nmToEv(447.1) },
      { wavelengthNm: 471.3, intensity: 0.4, colorHex: '#0ea5e9', transition: '4s -> 2p', energyEv: nmToEv(471.3) },
      { wavelengthNm: 492.2, intensity: 0.5, colorHex: '#06b6d4', transition: '4d -> 2p', energyEv: nmToEv(492.2) },
      { wavelengthNm: 501.6, intensity: 0.8, colorHex: '#10b981', transition: '3p -> 2s', energyEv: nmToEv(501.6) },
      { wavelengthNm: 587.6, intensity: 1.0, colorHex: '#eab308', transition: 'D3 Solar Line (3d -> 2p)', energyEv: nmToEv(587.6) },
      { wavelengthNm: 667.8, intensity: 0.7, colorHex: '#dc2626', transition: '3d -> 2p', energyEv: nmToEv(667.8) },
      { wavelengthNm: 706.5, intensity: 0.5, colorHex: '#b91c1c', transition: '3s -> 2p', energyEv: nmToEv(706.5) },
    ],
  },
  Li: {
    symbol: 'Li',
    name: 'Lithium',
    atomicNumber: 3,
    flameTest: {
      flameHex: '#e11d48',
      glowHex: '#fda4af',
      name: 'Carmine / Deep Crimson Red',
      description: 'Intense crimson flame emitted as thermally excited 2p electrons decay to 2s ground state.',
      spectralPeakNm: 670.8,
    },
    historicNote:
      'Robert Bunsen and Gustav Kirchhoff used their new spectroscope in 1860 to identify lithium in mineral waters by its distinct 670.8 nm scarlet doublet.',
    lines: [
      { wavelengthNm: 460.3, intensity: 0.3, colorHex: '#0284c7', transition: '4d -> 2p', energyEv: nmToEv(460.3) },
      { wavelengthNm: 497.2, intensity: 0.4, colorHex: '#14b8a6', transition: '4f -> 3d', energyEv: nmToEv(497.2) },
      { wavelengthNm: 610.4, intensity: 0.6, colorHex: '#ea580c', transition: '3d -> 2p', energyEv: nmToEv(610.4) },
      { wavelengthNm: 670.8, intensity: 1.0, colorHex: '#e11d48', transition: 'Principal Resonance (2p -> 2s)', energyEv: nmToEv(670.8) },
    ],
  },
  Na: {
    symbol: 'Na',
    name: 'Sodium',
    atomicNumber: 11,
    flameTest: {
      flameHex: '#f59e0b',
      glowHex: '#fde68a',
      name: 'Blinding Intense Amber-Yellow',
      description: 'Extremely strong sodium D-doublet (589.0 nm and 589.6 nm). A tiny grain turns any flame bright yellow.',
      spectralPeakNm: 589.0,
    },
    gasDischarge: {
      tubeHex: '#f59e0b',
      glowRgba: 'rgba(245, 158, 11, 0.8)',
      name: 'Low-Pressure Sodium Vapor (LPS)',
      uses: 'Highway street lighting (highest luminous efficacy of any electric light source)',
    },
    historicNote:
      'Fraunhofer designated the dark absorption line in the solar spectrum as the "D-line" in 1814. Kirchhoff and Bunsen proved it was vaporized sodium on the Sun.',
    lines: [
      { wavelengthNm: 589.0, intensity: 1.0, colorHex: '#f59e0b', transition: 'D2 Line (3p 3/2 -> 3s 1/2)', energyEv: nmToEv(589.0) },
      { wavelengthNm: 589.6, intensity: 0.9, colorHex: '#f59e0b', transition: 'D1 Line (3p 1/2 -> 3s 1/2)', energyEv: nmToEv(589.6) },
      { wavelengthNm: 568.8, intensity: 0.3, colorHex: '#84cc16', transition: '4d -> 3p', energyEv: nmToEv(568.8) },
      { wavelengthNm: 615.4, intensity: 0.2, colorHex: '#ea580c', transition: '5s -> 3p', energyEv: nmToEv(615.4) },
    ],
  },
  K: {
    symbol: 'K',
    name: 'Potassium',
    atomicNumber: 19,
    flameTest: {
      flameHex: '#c084fc',
      glowHex: '#e9d5ff',
      name: 'Delicate Pale Lilac / Violet',
      description: 'Soft violet glow viewed through cobalt blue glass to filter out trace sodium yellow contamination.',
      spectralPeakNm: 766.5,
    },
    historicNote:
      'Potassium salts emit a subtle violet hue with strong resonant lines in the deep violet (404.4 nm) and near-infrared (766.5 nm).',
    lines: [
      { wavelengthNm: 404.4, intensity: 0.7, colorHex: '#7e22ce', transition: '5p -> 4s', energyEv: nmToEv(404.4) },
      { wavelengthNm: 404.7, intensity: 0.6, colorHex: '#6b21a8', transition: '5p -> 4s', energyEv: nmToEv(404.7) },
      { wavelengthNm: 580.2, intensity: 0.3, colorHex: '#eab308', transition: '7s -> 4p', energyEv: nmToEv(580.2) },
      { wavelengthNm: 693.9, intensity: 0.4, colorHex: '#dc2626', transition: '6s -> 4p', energyEv: nmToEv(693.9) },
    ],
  },
  Ca: {
    symbol: 'Ca',
    name: 'Calcium',
    atomicNumber: 20,
    flameTest: {
      flameHex: '#ea580c',
      glowHex: '#fdba74',
      name: 'Brick-Red / Fiery Orange',
      description: 'Lustrous orange-red flame with prominent bands in the orange-red spectrum.',
      spectralPeakNm: 622.0,
    },
    historicNote:
      'Calcium is responsible for the deep orange flares in pyrotechnic fireworks and signal flares.',
    lines: [
      { wavelengthNm: 422.7, intensity: 1.0, colorHex: '#3b82f6', transition: '4p -> 4s', energyEv: nmToEv(422.7) },
      { wavelengthNm: 445.5, intensity: 0.5, colorHex: '#0284c7', transition: '4d -> 4p', energyEv: nmToEv(445.5) },
      { wavelengthNm: 558.9, intensity: 0.6, colorHex: '#84cc16', transition: '5s -> 4p', energyEv: nmToEv(558.9) },
      { wavelengthNm: 616.2, intensity: 0.8, colorHex: '#ea580c', transition: '4d -> 4p', energyEv: nmToEv(616.2) },
      { wavelengthNm: 643.9, intensity: 0.7, colorHex: '#dc2626', transition: '3d -> 4p', energyEv: nmToEv(643.9) },
    ],
  },
  Cu: {
    symbol: 'Cu',
    name: 'Copper',
    atomicNumber: 29,
    flameTest: {
      flameHex: '#10b981',
      glowHex: '#6ee7b7',
      name: 'Vivid Emerald Turquoise-Green',
      description: 'Striking blue-green flame caused by molecular CuOH and CuCl molecular band emissions.',
      spectralPeakNm: 510.5,
    },
    historicNote:
      'Copper(II) halides create the famous emerald-green hues used in traditional celebratory fireworks and stained glass coloration.',
    lines: [
      { wavelengthNm: 402.3, intensity: 0.4, colorHex: '#6b21a8', transition: '5d -> 4p', energyEv: nmToEv(402.3) },
      { wavelengthNm: 510.5, intensity: 1.0, colorHex: '#10b981', transition: '4p -> 4s (Laser transition)', energyEv: nmToEv(510.5) },
      { wavelengthNm: 515.3, intensity: 0.7, colorHex: '#22c55e', transition: '4d -> 4p', energyEv: nmToEv(515.3) },
      { wavelengthNm: 521.8, intensity: 0.8, colorHex: '#22c55e', transition: '4d -> 4p', energyEv: nmToEv(521.8) },
      { wavelengthNm: 578.2, intensity: 0.9, colorHex: '#eab308', transition: '4p -> 4s (Yellow-green line)', energyEv: nmToEv(578.2) },
    ],
  },
  Sr: {
    symbol: 'Sr',
    name: 'Strontium',
    atomicNumber: 38,
    flameTest: {
      flameHex: '#ef4444',
      glowHex: '#fca5a5',
      name: 'Brilliant Crimson Scarlet',
      description: 'The purest scarlet red flame test; universally used for roadside emergency flares and red fireworks.',
      spectralPeakNm: 650.0,
    },
    historicNote:
      'Strontium was named after the Scottish village of Strontian where the mineral strontianite was first analyzed.',
    lines: [
      { wavelengthNm: 407.8, intensity: 0.8, colorHex: '#6b21a8', transition: '5p -> 5s (Sr II)', energyEv: nmToEv(407.8) },
      { wavelengthNm: 460.7, intensity: 1.0, colorHex: '#0284c7', transition: '5p -> 5s Resonance', energyEv: nmToEv(460.7) },
      { wavelengthNm: 640.8, intensity: 0.6, colorHex: '#dc2626', transition: '5d -> 5p', energyEv: nmToEv(640.8) },
      { wavelengthNm: 687.8, intensity: 0.7, colorHex: '#b91c1c', transition: '6s -> 5p', energyEv: nmToEv(687.8) },
    ],
  },
  Ba: {
    symbol: 'Ba',
    name: 'Barium',
    atomicNumber: 56,
    flameTest: {
      flameHex: '#84cc16',
      glowHex: '#bef264',
      name: 'Pale Apple-Green',
      description: 'Distinctive yellow-green / apple-green glow caused by BaCl and BaOH thermal excimers.',
      spectralPeakNm: 524.2,
    },
    historicNote:
      'Barium chlorate is the classic pyrotechnic salt used to produce vibrant green fireworks in festival displays.',
    lines: [
      { wavelengthNm: 455.4, intensity: 1.0, colorHex: '#0284c7', transition: '6p -> 6s (Ba II principal)', energyEv: nmToEv(455.4) },
      { wavelengthNm: 493.4, intensity: 0.8, colorHex: '#06b6d4', transition: '6p -> 6s (Ba II)', energyEv: nmToEv(493.4) },
      { wavelengthNm: 553.5, intensity: 0.9, colorHex: '#84cc16', transition: '6p -> 6s Neutral Ba', energyEv: nmToEv(553.5) },
      { wavelengthNm: 611.1, intensity: 0.5, colorHex: '#ea580c', transition: '5d -> 6p', energyEv: nmToEv(611.1) },
    ],
  },
  Ne: {
    symbol: 'Ne',
    name: 'Neon',
    atomicNumber: 10,
    gasDischarge: {
      tubeHex: '#f97316',
      glowRgba: 'rgba(249, 115, 22, 0.85)',
      name: 'Fiery Orange-Red Glow',
      uses: 'Authentic classic neon signage and high-voltage indicator lamps',
    },
    historicNote:
      'Georges Claude patented the iconic neon lighting tube in 1910, capitalizing on neon’s extraordinarily rich red-orange emission line cluster.',
    lines: [
      { wavelengthNm: 585.2, intensity: 0.7, colorHex: '#eab308', transition: '3p -> 3s', energyEv: nmToEv(585.2) },
      { wavelengthNm: 614.3, intensity: 0.9, colorHex: '#ea580c', transition: '3p -> 3s', energyEv: nmToEv(614.3) },
      { wavelengthNm: 626.6, intensity: 0.8, colorHex: '#f97316', transition: '3p -> 3s', energyEv: nmToEv(626.6) },
      { wavelengthNm: 633.4, intensity: 0.9, colorHex: '#ef4444', transition: '3p -> 3s', energyEv: nmToEv(633.4) },
      { wavelengthNm: 640.2, intensity: 1.0, colorHex: '#dc2626', transition: '3p -> 3s (Strongest)', energyEv: nmToEv(640.2) },
      { wavelengthNm: 650.6, intensity: 0.6, colorHex: '#b91c1c', transition: '3p -> 3s', energyEv: nmToEv(650.6) },
      { wavelengthNm: 703.2, intensity: 0.5, colorHex: '#991b1b', transition: '3p -> 3s', energyEv: nmToEv(703.2) },
    ],
  },
  Hg: {
    symbol: 'Hg',
    name: 'Mercury',
    atomicNumber: 80,
    gasDischarge: {
      tubeHex: '#38bdf8',
      glowRgba: 'rgba(56, 189, 248, 0.8)',
      name: 'Eerie Violet-Cyan Discharge',
      uses: 'Fluorescent lighting phosphor excitation (via 253.7 nm UV resonance) & streetlamps',
    },
    historicNote:
      'The Franck-Hertz experiment (1914) proved the existence of quantized energy levels in atoms using vaporized mercury atoms bombarded by electrons.',
    lines: [
      { wavelengthNm: 404.7, intensity: 0.6, colorHex: '#7c3aed', transition: '7s -> 6p (Violet)', energyEv: nmToEv(404.7) },
      { wavelengthNm: 435.8, intensity: 0.9, colorHex: '#4f46e5', transition: '7s -> 6p (Deep Blue)', energyEv: nmToEv(435.8) },
      { wavelengthNm: 546.1, intensity: 1.0, colorHex: '#22c55e', transition: '7s -> 6p (Intense Green)', energyEv: nmToEv(546.1) },
      { wavelengthNm: 577.0, intensity: 0.8, colorHex: '#eab308', transition: '6d -> 6p (Yellow doublet A)', energyEv: nmToEv(577.0) },
      { wavelengthNm: 579.1, intensity: 0.8, colorHex: '#eab308', transition: '6d -> 6p (Yellow doublet B)', energyEv: nmToEv(579.1) },
    ],
  },
  Cs: {
    symbol: 'Cs',
    name: 'Cesium',
    atomicNumber: 55,
    flameTest: {
      flameHex: '#38bdf8',
      glowHex: '#bae6fd',
      name: 'Sky Azure Blue',
      description: 'Named after the Latin "caesius" (sky blue) because of its distinctive azure spectral lines.',
      spectralPeakNm: 455.5,
    },
    historicNote:
      'First element discovered by spectroscopy! Bunsen and Kirchhoff found it in Dürkheim mineral water in 1860 by tracking two sky-blue emission lines.',
    lines: [
      { wavelengthNm: 455.5, intensity: 1.0, colorHex: '#0284c7', transition: '7p -> 6s (Sky Blue A)', energyEv: nmToEv(455.5) },
      { wavelengthNm: 459.3, intensity: 0.8, colorHex: '#0ea5e9', transition: '7p -> 6s (Sky Blue B)', energyEv: nmToEv(459.3) },
      { wavelengthNm: 601.0, intensity: 0.3, colorHex: '#ea580c', transition: '6d -> 6p', energyEv: nmToEv(601.0) },
      { wavelengthNm: 621.3, intensity: 0.4, colorHex: '#dc2626', transition: '8s -> 6p', energyEv: nmToEv(621.3) },
    ],
  },
};
