/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useCallback } from 'react';

// Types & Data
import { ElementData, ElementCategory, ElementBlock, TrendProperty, ViewMode } from './types/element';
import { ELEMENTS } from './data/elements';

// Context
import { useTheme } from './context/ThemeContext';

// Core UI Components
import { ControlsBar } from './components/ControlsBar';
import { PeriodicTableGrid } from './components/PeriodicTableGrid';
import { TableHistoryScrollPage } from './components/TableHistoryScrollPage';
import { Footer } from './components/Footer';
import { MobileElementBar } from './components/MobileElementBar';

// Interactive Scientific Modals & Studios
import { ElementModal } from './components/ElementModal';
import { ElementComparator } from './components/ElementComparator';
import { QuantumOrbitalStudio } from './components/QuantumOrbitalStudio';
import { ElectrochemistryLab } from './components/ElectrochemistryLab';
import { TrendGraphicalStudio } from './components/TrendGraphicalStudio';
import { NuclearStudio } from './components/NuclearStudio';

/**
 * Main Application Component - Periodica Interactive Periodic Table
 */
export default function App() {
  const { theme } = useTheme();

  // =========================================================================
  // Element Selection & Inspection State
  // =========================================================================
  const [hoveredElement, setHoveredElement] = useState<ElementData | null>(null);
  const [selectedElement, setSelectedElement] = useState<ElementData | null>(
    ELEMENTS[5] // Carbon (atomic number 6) selected by default
  );
  const [dossierElement, setDossierElement] = useState<ElementData | null>(null);

  // =========================================================================
  // Studio & Modal Dialog States
  // =========================================================================
  // 1. Element Comparator Tool
  const [isComparatorOpen, setIsComparatorOpen] = useState(false);
  const [compareElementA, setCompareElementA] = useState<ElementData>(ELEMENTS[5]); // Carbon
  const [compareElementB, setCompareElementB] = useState<ElementData>(ELEMENTS[13]); // Silicon

  // 2. 3D Quantum Orbital Studio
  const [isOrbitalsOpen, setIsOrbitalsOpen] = useState(false);

  // 3. Electrochemical Series & Redox Lab
  const [isElectroOpen, setIsElectroOpen] = useState(false);

  // 4. Nuclear Physics, Isotopes & Decay Studio
  const [isNuclearOpen, setIsNuclearOpen] = useState(false);

  // 5. Periodic Trend Graphical Interpretation Studio
  const [isTrendGraphOpen, setIsTrendGraphOpen] = useState(false);

  // =========================================================================
  // View Modes & Environmental Controls
  // =========================================================================
  // View modes: 'category' | 'trend' | 'state' | 'block' | 'timeline'
  const [viewMode, setViewMode] = useState<ViewMode>('category');
  const [isViewTransitioning, setIsViewTransitioning] = useState(false);
  const [trendProperty, setTrendProperty] = useState<TrendProperty>('electronegativity');
  const [tempKelvin, setTempKelvin] = useState<number>(298);

  // =========================================================================
  // Element Filters (Category, Block, Search)
  // =========================================================================
  const [selectedCategory, setSelectedCategory] = useState<ElementCategory | 'all'>('all');
  const [selectedBlock, setSelectedBlock] = useState<ElementBlock | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // =========================================================================
  // Transition & Event Handlers
  // =========================================================================
  /** Handles switching between periodic table views and historical timeline with smooth morph */
  const handleViewModeChange = (newMode: ViewMode) => {
    if (newMode === viewMode) return;

    const isTimelineSwitch =
      (viewMode === 'timeline' && newMode !== 'timeline') ||
      (viewMode !== 'timeline' && newMode === 'timeline');

    if (isTimelineSwitch) {
      setIsViewTransitioning(true);
      setTimeout(() => {
        setViewMode(newMode);
        window.scrollTo({ top: 0, behavior: 'instant' });
        requestAnimationFrame(() => {
          setTimeout(() => {
            setIsViewTransitioning(false);
          }, 40);
        });
      }, 190);
    } else {
      setViewMode(newMode);
    }
  };

  /** Global hotkey: press "/" to focus search input */
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === '/' && !dossierElement && !isComparatorOpen && viewMode !== 'timeline') {
        const input = document.querySelector('input[type="text"]') as HTMLInputElement;
        if (input && document.activeElement !== input) {
          e.preventDefault();
          input.focus();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [dossierElement, isComparatorOpen, viewMode]);

  /** Selecting an element opens its dossier */
  const handleSelectElement = useCallback((el: ElementData) => {
    setSelectedElement(el);
    setDossierElement(el);
  }, []);

  /** Open comparator tool with pre-selected elements */
  const handleOpenComparator = useCallback((el?: ElementData) => {
    if (el) {
      setCompareElementA(el);
    } else if (selectedElement) {
      setCompareElementA(selectedElement);
    }
    setIsComparatorOpen(true);
  }, [selectedElement]);

  // =========================================================================
  // Main Render
  // =========================================================================
  return (
    <div
      className="min-h-screen text-zinc-900 dark:text-zinc-100 flex flex-col selection:bg-zinc-700/50 selection:text-white transition-colors duration-300 relative overflow-x-hidden bg-[#f8fafc] dark:bg-[#121316]"
      style={{
        backgroundColor: viewMode === 'timeline' ? 'transparent' : 'var(--color-canvas, #121316)',
      }}
    >
      {/* ----------------------------------------------------------------- */}
      {/* MAIN CONTENT AREA: Controls Bar & Periodic Table Grid             */}
      {/* ----------------------------------------------------------------- */}
      <div className="max-w-[1440px] w-full mx-auto px-1.5 sm:px-3 py-1 flex-1 flex flex-col space-y-1 sm:space-y-1.5 pb-16 sm:pb-2">
        {/* Top Controls: View modes, temperature, search, studio launchers */}
        <ControlsBar
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
          trendProperty={trendProperty}
          onTrendPropertyChange={setTrendProperty}
          tempKelvin={tempKelvin}
          onTempChange={setTempKelvin}
          selectedCategory={selectedCategory}
          onCategoryChange={setSelectedCategory}
          selectedBlock={selectedBlock}
          onBlockChange={setSelectedBlock}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onOpenComparator={() => handleOpenComparator()}
          onOpenOrbitals={() => setIsOrbitalsOpen(true)}
          onOpenElectrochemistry={() => setIsElectroOpen(true)}
          onOpenNuclear={() => setIsNuclearOpen(true)}
          onOpenTrendGraph={() => setIsTrendGraphOpen(true)}
        />

        {/* View Switch Container: Fluid Crossfade Page Transition */}
        <div
          className={`w-full flex-1 transition-all duration-280 ease-[cubic-bezier(0.16,1,0.3,1)] transform ${
            isViewTransitioning
              ? 'opacity-0 scale-[0.985] translate-y-2 pointer-events-none'
              : 'opacity-100 scale-100 translate-y-0 pointer-events-auto'
          }`}
        >
          {viewMode === 'timeline' ? (
            <main className="w-full flex-1">
              <TableHistoryScrollPage />
            </main>
          ) : (
            <main className="w-full flex-1">
              <PeriodicTableGrid
                hoveredElement={hoveredElement}
                selectedElement={selectedElement}
                trendProperty={trendProperty}
                tempKelvin={tempKelvin}
                viewMode={viewMode}
                selectedCategory={selectedCategory}
                selectedBlock={selectedBlock}
                searchQuery={searchQuery}
                onHover={setHoveredElement}
                onSelect={handleSelectElement}
                onOpenDetails={setDossierElement}
              />
            </main>
          )}
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* FOOTER: Developer attribution & table stats (Visible on all views) */}
      {/* ----------------------------------------------------------------- */}
      <Footer viewMode={viewMode} authorName="Souban Chakraborty" />

      {/* ----------------------------------------------------------------- */}
      {/* MOBILE SCREEN: Quick action floating element card (< 640px)       */}
      {/* ----------------------------------------------------------------- */}
      {selectedElement && !dossierElement && !isComparatorOpen && (
        <MobileElementBar
          element={selectedElement}
          onOpenDossier={(el) => setDossierElement(el)}
          onOpenComparator={(el) => handleOpenComparator(el)}
          onDismiss={() => setSelectedElement(null)}
        />
      )}

      {/* ----------------------------------------------------------------- */}
      {/* MODAL STUDIOS & DIALOGS                                           */}
      {/* ----------------------------------------------------------------- */}
      {/* 1. Full Element Dossier Inspector */}
      {dossierElement && (
        <ElementModal
          element={dossierElement}
          tempKelvin={tempKelvin}
          onClose={() => setDossierElement(null)}
          onSelectElement={(el) => {
            setSelectedElement(el);
            setDossierElement(el);
          }}
          onCompareElement={(el) => {
            setDossierElement(null);
            handleOpenComparator(el);
          }}
          onOpenOrbitals={(el) => {
            setSelectedElement(el);
            setIsOrbitalsOpen(true);
          }}
          onOpenElectrochemistry={(el) => {
            setSelectedElement(el);
            setIsElectroOpen(true);
          }}
          onOpenNuclear={(el) => {
            setSelectedElement(el);
            setIsNuclearOpen(true);
          }}
        />
      )}

      {/* 2. Side-by-Side Element Comparison Tool */}
      {isComparatorOpen && (
        <ElementComparator
          initialElementA={compareElementA}
          initialElementB={compareElementB}
          onClose={() => setIsComparatorOpen(false)}
        />
      )}

      {/* 3. 3D Quantum Orbital Studio */}
      {isOrbitalsOpen && (
        <QuantumOrbitalStudio
          initialElement={selectedElement}
          onClose={() => setIsOrbitalsOpen(false)}
          onSelectElement={(el) => setSelectedElement(el)}
        />
      )}

      {/* 4. Electrochemical Series & Redox Lab */}
      {isElectroOpen && (
        <ElectrochemistryLab
          initialElementSymbol={selectedElement?.symbol}
          onClose={() => setIsElectroOpen(false)}
        />
      )}

      {/* 5. Nuclear Physics, Isotopes & Decay Series Studio */}
      {isNuclearOpen && (
        <NuclearStudio
          initialElementSymbol={selectedElement?.symbol}
          onClose={() => setIsNuclearOpen(false)}
        />
      )}

      {/* 6. Periodic Trend Graphical Data Interpretation Studio */}
      {isTrendGraphOpen && (
        <TrendGraphicalStudio
          isOpen={isTrendGraphOpen}
          onClose={() => setIsTrendGraphOpen(false)}
          initialProperty={trendProperty !== 'none' ? trendProperty : 'electronegativity'}
          selectedElement={selectedElement}
          onSelectElement={(el) => setSelectedElement(el)}
          onOpenDossier={(el) => setDossierElement(el)}
        />
      )}
    </div>
  );
}
