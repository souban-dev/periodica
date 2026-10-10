export interface TableHistoryMilestone {
  id: string;
  year: number;
  scientist: string;
  country: string;
  title: string;
  headline: string;
  description: string;
  breakthrough: string;
  tableImpact: string;
  highlightType: 'triads' | 'octaves' | 'lavoisier' | 'mendeleev' | 'noble-gases' | 'moseley' | 'seaborg' | 'modern';
  highlightedAtomicNumbers?: number[];
  specialPairs?: { label: string; elements: number[]; note: string }[];
}

export const TABLE_HISTORY_MILESTONES: TableHistoryMilestone[] = [
  {
    id: 'lavoisier-1789',
    year: 1789,
    scientist: 'Antoine Lavoisier',
    country: 'France',
    title: "Lavoisier's Table of Simple Substances",
    headline: 'First systematic classification into 4 fundamental chemical classes',
    description: 'In his landmark treatise "Traité Élémentaire de Chimie", Lavoisier discarded the ancient Aristotle four-element theory (Earth, Air, Fire, Water) and phlogiston, defining an element strictly as a substance that cannot be broken down further by chemical analysis.',
    breakthrough: 'Grouped 33 substances into Gases, Non-metals, Metals, and Earths, establishing mass conservation and modern chemical nomenclature.',
    tableImpact: 'Established empirical chemistry and the conceptual definition of chemical elements.',
    highlightType: 'lavoisier',
    highlightedAtomicNumbers: [1, 6, 7, 8, 15, 16, 26, 27, 28, 29, 30, 47, 50, 78, 79, 80, 82, 83]
  },
  {
    id: 'dobereiner-1829',
    year: 1829,
    scientist: 'Johann Wolfgang Döbereiner',
    country: 'Germany',
    title: "Döbereiner's Law of Triads",
    headline: 'Discovery that element weights and properties follow mathematical triplets',
    description: 'Döbereiner observed that certain elements with strikingly similar chemical behaviors could be arranged in groups of three (triads). When arranged by atomic weight, the middle element had properties and an atomic weight almost exactly equal to the mathematical average (arithmetic mean) of the first and third!',
    breakthrough: 'First empirical proof that elements possessed an underlying quantitative, periodic mathematical relationship.',
    tableImpact: 'Paved the way for arranging elements by numerical weight rather than arbitrary alphabetical lists.',
    highlightType: 'triads',
    specialPairs: [
      { label: 'Halogen Triad', elements: [17, 35, 53], note: 'Cl (35.5) + I (126.9) ÷ 2 = 81.2 ≈ Br (79.9)' },
      { label: 'Alkali Triad', elements: [3, 11, 19], note: 'Li (6.9) + K (39.1) ÷ 2 = 23.0 = Na (23.0)' },
      { label: 'Alkaline Earth Triad', elements: [20, 38, 56], note: 'Ca (40.1) + Ba (137.3) ÷ 2 = 88.7 ≈ Sr (87.6)' },
      { label: 'Chalcogen Triad', elements: [16, 34, 52], note: 'S (32.1) + Te (127.6) ÷ 2 = 79.8 ≈ Se (79.0)' }
    ],
    highlightedAtomicNumbers: [17, 35, 53, 3, 11, 19, 20, 38, 56, 16, 34, 52]
  },
  {
    id: 'chancourtois-1862',
    year: 1862,
    scientist: 'Alexandre-Émile de Chancourtois',
    country: 'France',
    title: 'The Telluric Screw (Vis Tellurique)',
    headline: 'The first geometric, 3D helical periodic classification',
    description: 'De Chancourtois transcribed the atomic weights of elements around a cylinder divided into 16 equal segments (corresponding to oxygen = 16). When plotted along a 45° descending spiral, elements with similar physical and chemical traits fell on vertical columns along the cylinder.',
    breakthrough: 'The very first geometric demonstration of recurring periodicity of chemical properties.',
    tableImpact: 'Demonstrated periodicity was cyclical and geometrical, though ignored due to geological and non-chemical terminology.',
    highlightType: 'octaves',
    highlightedAtomicNumbers: [3, 11, 19, 4, 12, 20, 6, 14, 8, 16]
  },
  {
    id: 'newlands-1865',
    year: 1865,
    scientist: 'John Newlands',
    country: 'United Kingdom',
    title: "Newlands's Law of Octaves",
    headline: 'Arranging elements by atomic weight reveals repeating properties every 8th element',
    description: 'Newlands arranged the 56 known elements by increasing atomic weight and noticed that each element exhibited similar characteristics to the element eight places ahead of it—analogous to musical octaves (do, re, mi, fa, sol, la, ti, do).',
    breakthrough: 'First explicit formulation of the periodic pattern where properties repeat at fixed intervals of eight.',
    tableImpact: 'Introduced atomic numerical ordering. Though ridiculed at the British Chemical Society ("Why not arrange by alphabet?"), he was later awarded the Davy Medal.',
    highlightType: 'octaves',
    highlightedAtomicNumbers: [1, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 19, 20]
  },
  {
    id: 'meyer-1869',
    year: 1869,
    scientist: 'Julius Lothar Meyer',
    country: 'Germany',
    title: "Meyer's Periodic Atomic Volume Curve",
    headline: 'Physical properties vary periodically as a function of atomic weight',
    description: 'Independent of Mendeleev, Lothar Meyer discovered that plotting atomic volume (molar volume) against atomic weight yielded a series of sharp periodic peaks corresponding to the alkali metals, demonstrating that physical properties are periodic functions of mass.',
    breakthrough: 'First graphical visualization of periodic periodicity showing rhythmic waves in physical density, volume, and valency.',
    tableImpact: 'Validated the physical reality of the periodic law with rigorous mathematical curves.',
    highlightType: 'octaves',
    highlightedAtomicNumbers: [3, 11, 19, 37, 55, 4, 12, 20, 38, 56]
  },
  {
    id: 'mendeleev-1869',
    year: 1869,
    scientist: 'Dmitri Mendeleev',
    country: 'Russia',
    title: "Mendeleev's Periodic Law & Breakthrough",
    headline: 'The master periodic table with bold blank spaces predicting undiscovered elements',
    description: 'On March 1, 1869, Mendeleev published his masterwork "The Dependence between the Properties of the Atomic Weights of the Elements". Unlike predecessors, Mendeleev boldly swapped elements when properties demanded it and left gaps for unknown elements, predicting their exact atomic weights, densities, and oxide formulas with astonishing accuracy!',
    breakthrough: 'Formulated the Periodic Law and predicted eka-boron (Scandium), eka-aluminium (Gallium), and eka-silicon (Germanium). When Gallium was discovered in 1875 with Mendeleev’s exact predicted properties, the scientific world was stunned.',
    tableImpact: 'The foundation of the modern periodic table. Transformed chemistry from a catalog of isolated facts into a predictive science.',
    highlightType: 'mendeleev',
    specialPairs: [
      { label: 'Eka-Aluminium (Predicted 1869)', elements: [31], note: 'Predicted mass 68, density 5.9 g/cm³ → Discovered as Gallium (mass 69.7, density 5.91 g/cm³)' },
      { label: 'Eka-Boron (Predicted 1869)', elements: [21], note: 'Predicted mass 44, oxide formula Eb₂O₃ → Discovered as Scandium (mass 45.0, Sc₂O₃)' },
      { label: 'Eka-Silicon (Predicted 1869)', elements: [32], note: 'Predicted mass 72, density 5.5 g/cm³ → Discovered as Germanium (mass 72.6, density 5.32 g/cm³)' }
    ],
    highlightedAtomicNumbers: [1, 3, 4, 5, 6, 7, 8, 9, 11, 12, 13, 14, 15, 16, 17, 19, 20, 21, 22, 23, 24, 25, 26, 27, 28, 29, 30, 31, 32, 33, 34, 35, 37, 38, 39, 40, 41, 42, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 55, 56, 57, 58, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 90, 92]
  },
  {
    id: 'ramsay-1898',
    year: 1898,
    scientist: 'William Ramsay & Lord Rayleigh',
    country: 'United Kingdom',
    title: 'The Noble Gas Column (Group 0 / 18)',
    headline: 'Adding an entire unpredicted column to the table without breaking periodicity',
    description: 'When Rayleigh and Ramsay discovered Argon in 1894, it had zero chemical valency and had no place in Mendeleev’s original 8-group system. Rather than breaking the table, Ramsay realized an entire new family of inert monatomic elements existed between the reactive halogens and alkali metals.',
    breakthrough: 'Discovered Helium, Neon, Argon, Krypton, and Xenon, proving Mendeleev’s architecture could seamlessly absorb an entire new group.',
    tableImpact: 'Created Group 0 (today’s Group 18 Noble Gases), demonstrating complete closed-shell electronic stability.',
    highlightType: 'noble-gases',
    highlightedAtomicNumbers: [2, 10, 18, 36, 54, 86]
  },
  {
    id: 'moseley-1913',
    year: 1913,
    scientist: 'Henry Moseley',
    country: 'United Kingdom',
    title: "Moseley's Law: Ordering by Atomic Number (Z)",
    headline: 'Atomic number (nuclear charge), NOT atomic mass, is the true ordering law of the table',
    description: 'Using high-frequency X-ray spectral tubes, 25-year-old Henry Moseley demonstrated a strict mathematical linear law: √ν = a(Z - b). The fundamental identity of an element is governed by its nuclear proton charge (Atomic Number Z), not its atomic weight.',
    breakthrough: 'Permanently resolved classic periodic weight anomalies where heavier elements correctly precede lighter ones: Tellurium (Z=52, 127.6u) precedes Iodine (Z=53, 126.9u); Argon (Z=18, 39.95u) precedes Potassium (Z=19, 39.10u); Cobalt (Z=27, 58.93u) precedes Nickel (Z=28, 58.69u).',
    tableImpact: 'Defined the modern mathematical foundation of the periodic table, accurately predicting the remaining missing elements (Z=43, 61, 72, 75).',
    highlightType: 'moseley',
    specialPairs: [
      { label: 'Tellurium vs Iodine Anomaly', elements: [52, 53], note: 'Te (mass 127.6) has higher mass than I (mass 126.9), but Moseley showed Te has Z=52 and I has Z=53.' },
      { label: 'Argon vs Potassium Anomaly', elements: [18, 19], note: 'Ar (mass 39.95) has higher mass than K (mass 39.10), but Ar has Z=18 and K has Z=19.' },
      { label: 'Cobalt vs Nickel Anomaly', elements: [27, 28], note: 'Co (mass 58.93) has higher mass than Ni (mass 58.69), but Co has Z=27 and Ni has Z=28.' }
    ],
    highlightedAtomicNumbers: [18, 19, 27, 28, 52, 53, 43, 61, 72, 75]
  },
  {
    id: 'bohr-1922',
    year: 1922,
    scientist: 'Niels Bohr',
    country: 'Denmark',
    title: 'Quantum Electron Shell Architecture',
    headline: 'Periodic properties explained by quantum energy levels and valence electron shells',
    description: 'Niels Bohr published his quantum mechanical explanation of the periodic table, demonstrating that rows correspond to principal electron shells (n=1, 2, 3...) and columns share identical valence electron numbers.',
    breakthrough: 'United Mendeleev’s empirical chemistry with quantum physics and atomic orbital mechanics (s, p, d, f subshells).',
    tableImpact: 'Provided the physical theoretical reason why chemical periodicity repeats at lengths of 2, 8, 8, 18, 18, and 32 elements.',
    highlightType: 'octaves',
    highlightedAtomicNumbers: [1, 2, 3, 10, 11, 18, 19, 36, 37, 54, 55, 86]
  },
  {
    id: 'seaborg-1944',
    year: 1944,
    scientist: 'Glenn T. Seaborg',
    country: 'United States',
    title: 'The Actinide Concept & The Modern 18-Column Layout',
    headline: 'Extracting the Actinides into a separate f-block row below the Lanthanides',
    description: 'During the Manhattan Project, Seaborg realized that Thorium (90), Protactinium (91), and Uranium (92) were not heavy transition metals in groups 4, 5, and 6, but instead formed a second 5f electron inner-transition series identical in structure to the 4f Lanthanides.',
    breakthrough: 'Pulled 15 elements out from the main transition body into a dedicated Actinide row, producing the standard 18-column rectangular periodic table displayed in every science classroom today.',
    tableImpact: 'Established the modern standard table layout and allowed the systematic synthetic synthesis of transuranic elements 93 through 106.',
    highlightType: 'seaborg',
    specialPairs: [
      { label: 'The Lanthanoid 4f Row', elements: [57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71], note: '15 elements filling the 4f subshell.' },
      { label: 'The Actinoid 5f Row', elements: [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103], note: 'Seaborg’s new series filling the 5f subshell.' }
    ],
    highlightedAtomicNumbers: [89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71]
  },
  {
    id: 'modern-2016',
    year: 2016,
    scientist: 'IUPAC & International Labs (RIKEN, JINR, LLNL, ORNL)',
    country: 'International',
    title: 'Completion of Period 7 & The Superheavy Frontier',
    headline: 'All 118 elements completed; exploring the theoretical Island of Stability',
    description: 'In 2016, IUPAC officially named elements 113 (Nihonium), 115 (Moscovium), 117 (Tennessine), and 118 (Oganesson), completing row 7 of the periodic table. Scientists are now investigating whether relativistic electron velocity effects begin warping periodicity in speculative Period 8 (elements 119 and 120).',
    breakthrough: 'First time in human history all 7 periods of the standard table are completely filled.',
    tableImpact: 'Focuses current research on the relativistic "Island of Stability" and the boundaries of chemical periodicity.',
    highlightType: 'modern',
    highlightedAtomicNumbers: [113, 114, 115, 116, 117, 118]
  }
];
