import React, { useState, useRef, useEffect } from 'react';
import { ElementData, TrendProperty, ElementCategory, ElementBlock, ViewMode } from '../types/element';
import { ElementCell } from './ElementCell';
import { getElementByNumber } from '../data/elements';
import { CATEGORIES } from '../data/categories';
import { useTheme } from '../context/ThemeContext';

interface PeriodicTableGridProps {
  hoveredElement: ElementData | null;
  selectedElement: ElementData | null;
  trendProperty: TrendProperty;
  tempKelvin: number;
  viewMode: ViewMode;
  activeMilestoneId?: string;
  highlightedAtomicNumbers?: number[];
  selectedHistoricalGroup?: number[] | null;
  selectedCategory: ElementCategory | 'all';
  selectedBlock: ElementBlock | 'all';
  searchQuery: string;
  onHover: (element: ElementData | null) => void;
  onSelect: (element: ElementData) => void;
  onOpenDetails?: (element: ElementData) => void;
}

export const PeriodicTableGrid: React.FC<PeriodicTableGridProps> = ({
  hoveredElement,
  selectedElement,
  trendProperty,
  tempKelvin,
  viewMode,
  activeMilestoneId,
  highlightedAtomicNumbers,
  selectedHistoricalGroup,
  selectedCategory,
  selectedBlock,
  searchQuery,
  onHover,
  onSelect,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Base reference width for the full 18-column periodic table + period index
  const TABLE_BASE_WIDTH = 760;

  // Responsive container measurement & gesture state
  const [containerWidth, setContainerWidth] = useState<number>(() =>
    typeof window !== 'undefined' ? window.innerWidth : 0
  );
  const [cardHeight, setCardHeight] = useState<number>(0);
  const [scale, setScale] = useState<number>(() => {
    if (typeof window !== 'undefined' && window.innerWidth > 0 && window.innerWidth < TABLE_BASE_WIDTH) {
      return Math.min(1, Math.max(0.35, (window.innerWidth - 6) / TABLE_BASE_WIDTH));
    }
    return 1;
  });
  const [isPinching, setIsPinching] = useState<boolean>(false);
  const [showIndicator, setShowIndicator] = useState<boolean>(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tableRef = useRef<HTMLDivElement>(null);

  const initialDistRef = useRef<number>(0);
  const initialTouchScaleRef = useRef<number>(1);
  const lastTapTimeRef = useRef<number>(0);
  const indicatorTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const userHasZoomedRef = useRef<boolean>(false);

  // Measure container dimensions
  useEffect(() => {
    const measure = () => {
      if (containerRef.current) {
        setContainerWidth(containerRef.current.clientWidth);
      }
      if (cardRef.current) {
        setCardHeight(cardRef.current.offsetHeight);
      }
    };
    measure();
    const timer = setTimeout(measure, 150);
    window.addEventListener('resize', measure);
    return () => {
      clearTimeout(timer);
      window.removeEventListener('resize', measure);
    };
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.target === containerRef.current) {
          setContainerWidth(entry.contentRect.width);
        }
      }
      if (cardRef.current) {
        setCardHeight(cardRef.current.offsetHeight);
      }
    });
    ro.observe(containerRef.current);
    if (tableRef.current) {
      ro.observe(tableRef.current);
    }
    return () => ro.disconnect();
  }, []);

  const isMobileScreen = containerWidth > 0 && containerWidth < TABLE_BASE_WIDTH;
  const fitScale = isMobileScreen
    ? Math.min(1, Math.max(0.35, (containerWidth - 6) / TABLE_BASE_WIDTH))
    : 1;

  // By default, full table view (fitScale) is active so all 18 groups fit the screen without sliding
  const defaultScale = fitScale;

  // Keep references fresh for non-passive touch listeners
  const currentScaleRef = useRef(scale);
  currentScaleRef.current = scale;
  const fitScaleRef = useRef(fitScale);
  fitScaleRef.current = fitScale;
  const defaultScaleRef = useRef(defaultScale);
  defaultScaleRef.current = defaultScale;

  // Synchronize scale to full table view by default unless user has manually zoomed
  useEffect(() => {
    if (!userHasZoomedRef.current) {
      setScale(fitScale);
    }
  }, [fitScale]);

  // Native non-passive touch listeners for 60fps pinch-to-zoom without page zoom interference
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const onTouchStart = (e: TouchEvent) => {
      if (e.touches.length === 2) {
        e.preventDefault();
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        initialDistRef.current = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
        initialTouchScaleRef.current = currentScaleRef.current;
        setIsPinching(true);
        setShowIndicator(true);
        userHasZoomedRef.current = true;
      }
    };

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 2 && initialDistRef.current > 0) {
        e.preventDefault(); // Prevents page-level zoom so pinch zooms only the periodic table!
        const t0 = e.touches[0];
        const t1 = e.touches[1];
        const dist = Math.hypot(t0.clientX - t1.clientX, t0.clientY - t1.clientY);
        const factor = dist / initialDistRef.current;
        const targetScale = Math.min(
          1.35,
          Math.max(fitScaleRef.current * 0.85, initialTouchScaleRef.current * factor)
        );
        setScale(targetScale);
        setShowIndicator(true);
        userHasZoomedRef.current = true;
      }
    };

    const onTouchEnd = (e: TouchEvent) => {
      if (e.touches.length < 2) {
        setIsPinching(false);
        initialDistRef.current = 0;
        // Smoothly snap to fitScale or 1.0 if close
        setScale((prev) => {
          if (prev <= fitScaleRef.current * 1.05) {
            return fitScaleRef.current;
          }
          if (Math.abs(prev - 1) < 0.05) {
            return 1;
          }
          if (prev > 1.35) {
            return 1.35;
          }
          return prev;
        });

        if (indicatorTimeoutRef.current) clearTimeout(indicatorTimeoutRef.current);
        indicatorTimeoutRef.current = setTimeout(() => {
          setShowIndicator(false);
        }, 1200);
      }

      // Smooth double-tap detection for 1 finger (toggle between 1.0 and fit overview)
      if (e.touches.length === 0) {
        const now = Date.now();
        if (now - lastTapTimeRef.current < 280) {
          userHasZoomedRef.current = true;
          setScale((prev) => {
            if (prev >= 0.92) {
              return fitScaleRef.current;
            } else {
              return 1.0;
            }
          });
          setShowIndicator(true);
          if (indicatorTimeoutRef.current) clearTimeout(indicatorTimeoutRef.current);
          indicatorTimeoutRef.current = setTimeout(() => {
            setShowIndicator(false);
          }, 1200);
          lastTapTimeRef.current = 0;
        } else {
          lastTapTimeRef.current = now;
        }
      }
    };

    el.addEventListener('touchstart', onTouchStart, { passive: false });
    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd, { passive: false });
    el.addEventListener('touchcancel', onTouchEnd, { passive: false });

    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
      el.removeEventListener('touchend', onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, []);

  const isFit = isMobileScreen ? scale <= fitScale * 1.04 : true;

  // Filter logic for dimming
  const isElementDimmed = (el: ElementData): boolean => {
    if (selectedCategory !== 'all' && el.category !== selectedCategory) {
      return true;
    }
    if (selectedBlock !== 'all' && el.block !== selectedBlock) {
      return true;
    }
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchNum = el.atomicNumber.toString() === q;
      const matchSymbol = el.symbol.toLowerCase() === q;
      const matchName = el.name.toLowerCase().includes(q);
      if (!matchNum && !matchSymbol && !matchName) {
        return true;
      }
    }
    return false;
  };

  const renderCell = (atomicNumber: number) => {
    const el = getElementByNumber(atomicNumber);
    if (!el) return null;
    return (
      <ElementCell
        key={el.atomicNumber}
        element={el}
        isHovered={hoveredElement?.atomicNumber === el.atomicNumber}
        isSelected={selectedElement?.atomicNumber === el.atomicNumber}
        isDimmed={isElementDimmed(el)}
        trendProperty={trendProperty}
        tempKelvin={tempKelvin}
        viewMode={viewMode}
        activeMilestoneId={activeMilestoneId}
        highlightedAtomicNumbers={highlightedAtomicNumbers}
        selectedHistoricalGroup={selectedHistoricalGroup}
        onHover={onHover}
        onSelect={onSelect}
      />
    );
  };

  const renderLanthanoidPlaceholder = () => {
    const isSelected = selectedElement && selectedElement.atomicNumber >= 57 && selectedElement.atomicNumber <= 71;
    const isHovered = hoveredElement && hoveredElement.atomicNumber >= 57 && hoveredElement.atomicNumber <= 71;

    return (
      <button
        type="button"
        onClick={() => {
          const el = getElementByNumber(57);
          if (el) onSelect(el);
        }}
        title="Lanthanoids series (Elements 57 to 71: La to Lu)"
        className={`group relative flex flex-col justify-center items-center p-0.5 sm:p-1 rounded-md sm:rounded-lg border-2 border-dashed border-pink-400 dark:border-pink-500 text-center outline-none cursor-pointer select-none transition-all duration-150 transform
          w-full aspect-[1/1.08] min-h-[40px] sm:min-h-[46px] md:min-h-[50px] max-h-[66px] bg-pink-50/60 dark:bg-pink-950/20 shadow-2xs hover:shadow-md
          ${isHovered ? 'scale-[1.08] z-30 shadow-md ring-1 ring-pink-300' : 'z-10'}
          ${isSelected ? 'scale-[1.06] z-30 ring-2 ring-pink-500 shadow-md' : ''}
          active:scale-95
        `}
      >
        <span className="font-mono text-[7.5px] sm:text-[8.5px] md:text-[9.5px] font-semibold text-pink-600 dark:text-pink-400 leading-none mb-0.5 sm:mb-1">
          57–71
        </span>
        <span className="font-mono font-bold text-[11px] sm:text-[13px] md:text-[15px] leading-none text-pink-600 dark:text-pink-400 tracking-tight">
          LA–LU
        </span>
      </button>
    );
  };

  const renderActinoidPlaceholder = () => {
    const isSelected = selectedElement && selectedElement.atomicNumber >= 89 && selectedElement.atomicNumber <= 103;
    const isHovered = hoveredElement && hoveredElement.atomicNumber >= 89 && hoveredElement.atomicNumber <= 103;

    return (
      <button
        type="button"
        onClick={() => {
          const el = getElementByNumber(89);
          if (el) onSelect(el);
        }}
        title="Actinoids series (Elements 89 to 103: Ac to Lr)"
        className={`group relative flex flex-col justify-center items-center p-0.5 sm:p-1 rounded-md sm:rounded-lg border-2 border-dashed border-red-400 dark:border-red-500 text-center outline-none cursor-pointer select-none transition-all duration-150 transform
          w-full aspect-[1/1.08] min-h-[40px] sm:min-h-[46px] md:min-h-[50px] max-h-[66px] bg-red-50/60 dark:bg-red-950/20 shadow-2xs hover:shadow-md
          ${isHovered ? 'scale-[1.08] z-30 shadow-md ring-1 ring-red-300' : 'z-10'}
          ${isSelected ? 'scale-[1.06] z-30 ring-2 ring-red-500 shadow-md' : ''}
          active:scale-95
        `}
      >
        <span className="font-mono text-[7.5px] sm:text-[8.5px] md:text-[9.5px] font-semibold text-red-600 dark:text-red-400 leading-none mb-0.5 sm:mb-1">
          89–103
        </span>
        <span className="font-mono font-bold text-[11px] sm:text-[13px] md:text-[15px] leading-none text-red-600 dark:text-red-400 tracking-tight">
          AC–LR
        </span>
      </button>
    );
  };

  const renderTableContent = () => (
    <>
      {/* Main 7 Periods Grid - 19 Columns (1 Period Index + 18 IUPAC Groups) */}
      <div className="grid grid-cols-[18px_repeat(18,minmax(0,1fr))] sm:grid-cols-[20px_repeat(18,minmax(0,1fr))] gap-[2px] sm:gap-[3px] md:gap-1 items-center">
        {/* ================================================================= */}
        {/* UNIFORM GROUP NUMBERING ROW (1 to 18 in one uniform line at top) */}
        {/* ================================================================= */}
        <div className="flex items-center justify-center font-mono text-[9px] sm:text-[10px] text-slate-400 dark:text-zinc-500 font-semibold select-none">
          {/* Blank corner above period numbers */}
        </div>
        {Array.from({ length: 18 }, (_, i) => i + 1).map((g) => (
          <div key={`group-top-${g}`} className="flex items-center justify-center pb-0.5">
            <span className="font-mono text-[9px] sm:text-[10px] md:text-[11px] font-semibold text-slate-500 dark:text-zinc-400 select-none">
              {g}
            </span>
          </div>
        ))}

        {/* ================================================================= */}
        {/* PERIOD 1 (Row 1): 1 H ... 2 He */}
        {/* ================================================================= */}
        <div className="flex items-center justify-center font-mono text-[9px] sm:text-xs font-semibold text-slate-400 dark:text-zinc-500 select-none">
          1
        </div>
        <div>{renderCell(1)}</div>
        {Array.from({ length: 16 }).map((_, i) => (
          <div key={`p1-empty-${i}`} />
        ))}
        <div>{renderCell(2)}</div>

        {/* ================================================================= */}
        {/* PERIOD 2 (Row 2): 3 Li, 4 Be, [empty 3-12], 5 B to 10 Ne */}
        {/* ================================================================= */}
        <div className="flex items-center justify-center font-mono text-[9px] sm:text-xs font-semibold text-slate-400 dark:text-zinc-500 select-none">
          2
        </div>
        <div>{renderCell(3)}</div>
        <div>{renderCell(4)}</div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`p2-empty-${i}`} />
        ))}
        <div>{renderCell(5)}</div>
        <div>{renderCell(6)}</div>
        <div>{renderCell(7)}</div>
        <div>{renderCell(8)}</div>
        <div>{renderCell(9)}</div>
        <div>{renderCell(10)}</div>

        {/* ================================================================= */}
        {/* PERIOD 3 (Row 3): 11 Na, 12 Mg, [empty 3-12], 13 Al to 18 Ar */}
        {/* ================================================================= */}
        <div className="flex items-center justify-center font-mono text-[9px] sm:text-xs font-semibold text-slate-400 dark:text-zinc-500 select-none">
          3
        </div>
        <div>{renderCell(11)}</div>
        <div>{renderCell(12)}</div>
        {Array.from({ length: 10 }).map((_, i) => (
          <div key={`p3-empty-${i}`} />
        ))}
        <div>{renderCell(13)}</div>
        <div>{renderCell(14)}</div>
        <div>{renderCell(15)}</div>
        <div>{renderCell(16)}</div>
        <div>{renderCell(17)}</div>
        <div>{renderCell(18)}</div>

        {/* ================================================================= */}
        {/* PERIOD 4 (Row 4): 19 K to 36 Kr */}
        {/* ================================================================= */}
        <div className="flex items-center justify-center font-mono text-[9px] sm:text-xs font-semibold text-slate-400 dark:text-zinc-500 select-none">
          4
        </div>
        {Array.from({ length: 18 }, (_, i) => 19 + i).map((num) => (
          <div key={`p4-${num}`}>{renderCell(num)}</div>
        ))}

        {/* ================================================================= */}
        {/* PERIOD 5 (Row 5): 37 Rb to 54 Xe */}
        {/* ================================================================= */}
        <div className="flex items-center justify-center font-mono text-[9px] sm:text-xs font-semibold text-slate-400 dark:text-zinc-500 select-none">
          5
        </div>
        {Array.from({ length: 18 }, (_, i) => 37 + i).map((num) => (
          <div key={`p5-${num}`}>{renderCell(num)}</div>
        ))}

        {/* ================================================================= */}
        {/* PERIOD 6 (Row 6): 55 Cs, 56 Ba, [57-71 LA-LU], 72 Hf to 86 Rn */}
        {/* ================================================================= */}
        <div className="flex items-center justify-center font-mono text-[9px] sm:text-xs font-semibold text-slate-400 dark:text-zinc-500 select-none">
          6
        </div>
        <div>{renderCell(55)}</div>
        <div>{renderCell(56)}</div>
        <div>{renderLanthanoidPlaceholder()}</div>
        {Array.from({ length: 15 }, (_, i) => 72 + i).map((num) => (
          <div key={`p6-${num}`}>{renderCell(num)}</div>
        ))}

        {/* ================================================================= */}
        {/* PERIOD 7 (Row 7): 87 Fr, 88 Ra, [89-103 AC-LR], 104 Rf to 118 Og */}
        {/* ================================================================= */}
        <div className="flex items-center justify-center font-mono text-[9px] sm:text-xs font-semibold text-slate-400 dark:text-zinc-500 select-none">
          7
        </div>
        <div>{renderCell(87)}</div>
        <div>{renderCell(88)}</div>
        <div>{renderActinoidPlaceholder()}</div>
        {Array.from({ length: 15 }, (_, i) => 104 + i).map((num) => (
          <div key={`p7-${num}`}>{renderCell(num)}</div>
        ))}
      </div>

      {/* ================================================================= */}
      {/* SEPARATE BOTTOM F-BLOCK: Lanthanoids (57-71) & Actinoids (89-103) */}
      {/* 15 Elements Wide, Aligned Directly Under Columns 3 to 17          */}
      {/* ================================================================= */}
      <div className="mt-2 sm:mt-2.5 pt-2 border-t border-dashed border-slate-200 dark:border-zinc-800/80">
        <div className="grid grid-cols-[18px_repeat(18,minmax(0,1fr))] sm:grid-cols-[20px_repeat(18,minmax(0,1fr))] gap-[2px] sm:gap-[3px] md:gap-1 items-center">
          {/* Row 1: Lanthanoids (57 La to 71 Lu) */}
          <div />
          <div className="col-span-2 flex items-center justify-end pr-1 sm:pr-2 font-mono font-bold text-[8px] sm:text-[9.5px] md:text-[10.5px] text-pink-600 dark:text-pink-400 uppercase tracking-wider select-none">
            LANTHANIDES
          </div>
          {Array.from({ length: 15 }, (_, i) => 57 + i).map((num) => (
            <div key={`lanth-${num}`}>{renderCell(num)}</div>
          ))}
          <div className="invisible" />

          {/* Row 2: Actinoids (89 Ac to 103 Lr) */}
          <div />
          <div className="col-span-2 flex items-center justify-end pr-1 sm:pr-2 font-mono font-bold text-[8px] sm:text-[9.5px] md:text-[10.5px] text-red-600 dark:text-red-400 uppercase tracking-wider select-none">
            ACTINIDES
          </div>
          {Array.from({ length: 15 }, (_, i) => 89 + i).map((num) => (
            <div key={`act-${num}`}>{renderCell(num)}</div>
          ))}
          <div className="invisible" />
        </div>
      </div>
    </>
  );

  return (
    <div
      ref={containerRef}
      className="w-full flex flex-col items-center pb-2 pt-0.5 px-0.5 sm:px-1 select-none relative"
    >
      {/* Subtle Gesture Zoom Indicator (only appears during pinch/zoom, automatically fades out) */}
      {showIndicator && isMobileScreen && (
        <div
          className={`fixed bottom-16 left-1/2 -translate-x-1/2 z-40 pointer-events-none px-3.5 py-1.5 rounded-full bg-slate-900/90 dark:bg-zinc-800/90 text-white border border-slate-700/60 shadow-xl backdrop-blur-md text-[11px] font-mono font-medium transition-all duration-200 ${
            isPinching ? 'opacity-100 scale-105' : 'opacity-90'
          }`}
        >
          {isFit ? 'Full Table View' : `${Math.round(scale * 100)}% Zoom`}
        </div>
      )}

      {/* Mobile Screen Helper Bar: Status & Instant Toggle */}
      {isMobileScreen && (
        <div className="w-full max-w-[760px] flex items-center justify-between px-2 mb-1.5 text-[11px]">
          <div className="flex items-center gap-1.5 text-slate-500 dark:text-zinc-400 font-mono text-[10px]">
            <span className={`w-1.5 h-1.5 rounded-full ${isFit ? 'bg-emerald-500' : 'bg-blue-500'} inline-block`} />
            <span className="font-semibold text-slate-600 dark:text-zinc-300">
              {isFit ? 'Full Table View' : `Zoomed (${Math.round(scale * 100)}%)`}
            </span>
          </div>
          <button
            type="button"
            onClick={() => {
              userHasZoomedRef.current = true;
              setScale((prev) => (prev <= fitScale * 1.05 ? 1.0 : fitScale));
              setShowIndicator(true);
              if (indicatorTimeoutRef.current) clearTimeout(indicatorTimeoutRef.current);
              indicatorTimeoutRef.current = setTimeout(() => setShowIndicator(false), 1200);
            }}
            className="px-2.5 py-0.5 rounded-md font-mono text-[10px] font-semibold bg-slate-100 hover:bg-slate-200 dark:bg-zinc-800 dark:hover:bg-zinc-700 text-slate-700 dark:text-zinc-200 border border-slate-200 dark:border-zinc-700 transition-colors shadow-2xs cursor-pointer flex items-center gap-1 active:scale-95"
          >
            {isFit ? 'Zoom In (100%)' : '⛶ Full Table View'}
          </button>
        </div>
      )}

      {/* Periodic Table Responsive Container */}
      <div
        ref={scrollContainerRef}
        className={`w-full ${
          isFit
            ? 'overflow-x-hidden flex justify-center'
            : 'overflow-x-auto overscroll-x-contain touch-pan-x'
        } pb-2 pt-0.5 px-0 sm:px-1`}
        style={{
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <div
          className={`${isFit ? 'mx-auto' : 'flex-none'}`}
          style={{
            width: isMobileScreen ? `${Math.round(TABLE_BASE_WIDTH * scale)}px` : '100%',
            height: isMobileScreen && cardHeight > 0 ? `${Math.round(cardHeight * scale)}px` : undefined,
            maxWidth: isMobileScreen ? undefined : '1420px',
            overflow: 'visible',
            flexShrink: 0,
          }}
        >
          <div
            ref={cardRef}
            style={{
              width: isMobileScreen ? `${TABLE_BASE_WIDTH}px` : '100%',
              maxWidth: isMobileScreen ? undefined : '1420px',
              transform: isMobileScreen && scale !== 1 ? `scale(${scale})` : undefined,
              transformOrigin: 'top left',
              transition: isPinching
                ? 'none'
                : 'transform 0.22s cubic-bezier(0.2, 0.8, 0.2, 1)',
            }}
            className="w-full p-2 sm:p-2.5 md:p-3 rounded-xl bg-white dark:bg-[#121316] border border-slate-200/90 dark:border-zinc-800/80 backdrop-blur-md shadow-xs transition-colors duration-300"
          >
            <div ref={tableRef}>
              {renderTableContent()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
