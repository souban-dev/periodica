import React from 'react';
import { ElementData, TrendProperty, ViewMode } from '../types/element';
import { CATEGORIES } from '../data/categories';
import { TREND_RANGES, getElementStateAtTemp } from '../data/elements';
import { STATE_METADATA } from '../data/states';
import { useTheme } from '../context/ThemeContext';

interface ElementCellProps {
  element: ElementData;
  isHovered: boolean;
  isSelected: boolean;
  isDimmed: boolean;
  trendProperty: TrendProperty;
  tempKelvin: number;
  viewMode: ViewMode;
  activeMilestoneId?: string;
  highlightedAtomicNumbers?: number[];
  selectedHistoricalGroup?: number[] | null;
  onHover: (element: ElementData | null) => void;
  onSelect: (element: ElementData) => void;
}

const ElementCellComponent: React.FC<ElementCellProps> = ({
  element,
  isHovered,
  isSelected,
  isDimmed,
  trendProperty,
  tempKelvin,
  viewMode,
  activeMilestoneId,
  highlightedAtomicNumbers,
  selectedHistoricalGroup,
  onHover,
  onSelect,
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const categoryMeta = CATEGORIES[element.category];
  const currentState = getElementStateAtTemp(element, tempKelvin);

  // Background, border, and text styles
  let bgStyle: React.CSSProperties = {};
  let textAccent = isDark ? (categoryMeta.darkText || categoryMeta.borderHex) : categoryMeta.textHex;
  let bottomLabel: string = Number(element.atomicMass).toFixed(element.atomicMass % 1 === 0 ? 0 : 2);
  let isHistoricalActive = true;
  let isSpecialFocus = false;

  if (viewMode === 'timeline') {
    if (selectedHistoricalGroup && selectedHistoricalGroup.length > 0) {
      isSpecialFocus = selectedHistoricalGroup.includes(element.atomicNumber);
      isHistoricalActive = isSpecialFocus;
    } else if (highlightedAtomicNumbers && highlightedAtomicNumbers.length > 0) {
      isHistoricalActive = highlightedAtomicNumbers.includes(element.atomicNumber);
    }

    // Special historical labels
    if (activeMilestoneId === 'mendeleev-1869') {
      if (element.atomicNumber === 31) bottomLabel = '★ Eka-Al';
      else if (element.atomicNumber === 21) bottomLabel = '★ Eka-B';
      else if (element.atomicNumber === 32) bottomLabel = '★ Eka-Si';
    } else if (activeMilestoneId === 'moseley-1913') {
      bottomLabel = `Z=${element.atomicNumber}`;
    } else if (activeMilestoneId === 'dobereiner-1829') {
      if ([17, 35, 53, 3, 11, 19, 20, 38, 56, 16, 34, 52].includes(element.atomicNumber)) {
        bottomLabel = `Triad ${element.atomicMass.toFixed(0)}`;
      }
    }

    if (isSpecialFocus) {
      bgStyle = isDark
        ? {
            backgroundColor: 'rgba(245, 158, 11, 0.22)',
            borderColor: '#f59e0b',
            boxShadow: '0 0 14px rgba(245, 158, 11, 0.5), inset 0 0 6px rgba(245, 158, 11, 0.15)',
          }
        : {
            backgroundColor: '#fef3c7',
            borderColor: '#d97706',
          };
      textAccent = isDark ? '#fde68a' : '#b45309';
    } else if (isHistoricalActive) {
      bgStyle = isDark
        ? {
            backgroundColor: isHovered
              ? (categoryMeta.darkBg ? categoryMeta.darkBg.replace('0.09', '0.22').replace('0.12', '0.25') : 'rgba(32, 32, 36, 0.95)')
              : (categoryMeta.darkBg || 'rgba(18, 18, 20, 0.85)'),
            borderColor: categoryMeta.darkBorder || categoryMeta.color,
            boxShadow: isHovered
              ? (categoryMeta.darkGlow ? categoryMeta.darkGlow.replace('10px', '16px') : '0 0 14px rgba(255, 255, 255, 0.4)')
              : (isSelected ? categoryMeta.darkGlow : (categoryMeta.darkGlow ? categoryMeta.darkGlow.split(',')[0] : 'none')),
          }
        : {
            backgroundColor: isHovered ? categoryMeta.bgRgba.replace('0.09', '0.22') : categoryMeta.bgRgba,
            borderColor: isHovered || isSelected ? categoryMeta.color : categoryMeta.borderHex,
          };
    } else {
      bgStyle = isDark
        ? {
            backgroundColor: 'rgba(12, 12, 14, 0.5)',
            borderColor: '#26262a',
          }
        : {
            backgroundColor: '#f8fafc',
            borderColor: '#e2e8f0',
          };
      textAccent = isDark ? '#52525b' : '#94a3b8';
    }
  } else if (viewMode === 'category') {
    if (isDark) {
      bgStyle = {
        backgroundColor: isHovered
          ? (categoryMeta.darkBg ? categoryMeta.darkBg.replace('0.09', '0.22').replace('0.12', '0.25') : 'rgba(32, 32, 36, 0.95)')
          : (categoryMeta.darkBg || 'rgba(18, 18, 20, 0.85)'),
        borderColor: isHovered || isSelected ? (categoryMeta.darkBorder || categoryMeta.color) : (categoryMeta.darkBorder || categoryMeta.color),
        boxShadow: isHovered
          ? (categoryMeta.darkGlow ? categoryMeta.darkGlow.replace('10px', '16px') : '0 0 14px rgba(255, 255, 255, 0.4)')
          : (isSelected ? categoryMeta.darkGlow : (categoryMeta.darkGlow ? categoryMeta.darkGlow.split(',')[0] : 'none')),
      };
      textAccent = categoryMeta.darkText || categoryMeta.borderHex;
    } else {
      bgStyle = {
        backgroundColor: isHovered ? categoryMeta.bgRgba.replace('0.09', '0.22') : categoryMeta.bgRgba,
        borderColor: isHovered || isSelected ? categoryMeta.color : categoryMeta.borderHex,
        boxShadow: isHovered || isSelected ? `0 0 12px ${categoryMeta.color}40` : 'none',
      };
      textAccent = categoryMeta.textHex;
    }
  } else if (viewMode === 'block') {
    if (isDark) {
      const darkBlockStyles: Record<string, { bg: string; border: string; glow: string; text: string }> = {
        s: { bg: 'rgba(239, 68, 68, 0.16)', border: '#f87171', glow: '0 0 12px rgba(248, 113, 113, 0.5)', text: '#fca5a5' },
        p: { bg: 'rgba(45, 212, 191, 0.16)', border: '#2dd4bf', glow: '0 0 12px rgba(45, 212, 191, 0.5)', text: '#99f6e4' },
        d: { bg: 'rgba(250, 204, 21, 0.16)', border: '#facc15', glow: '0 0 12px rgba(250, 204, 21, 0.5)', text: '#fef08a' },
        f: { bg: 'rgba(192, 132, 252, 0.16)', border: '#c084fc', glow: '0 0 12px rgba(192, 132, 252, 0.5)', text: '#e9d5ff' },
      };
      const bs = darkBlockStyles[element.block];
      bgStyle = {
        backgroundColor: isHovered ? bs.border + '33' : bs.bg,
        borderColor: bs.border,
        boxShadow: isHovered || isSelected ? bs.glow : bs.glow.split(',')[0],
      };
      textAccent = bs.text;
    } else {
      const blockStyles: Record<string, { bg: string; border: string; text: string }> = {
        s: { bg: 'rgba(239, 68, 68, 0.08)', border: '#fca5a5', text: '#b91c1c' },
        p: { bg: 'rgba(20, 184, 166, 0.08)', border: '#5eead4', text: '#0f766e' },
        d: { bg: 'rgba(202, 138, 4, 0.08)', border: '#fde047', text: '#a16207' },
        f: { bg: 'rgba(147, 51, 234, 0.08)', border: '#d8b4fe', text: '#7e22ce' },
      };
      const bs = blockStyles[element.block];
      bgStyle = {
        backgroundColor: isHovered ? bs.border + '44' : bs.bg,
        borderColor: isHovered || isSelected ? bs.text : bs.border,
      };
      textAccent = bs.text;
    }
    bottomLabel = `${element.block}-block`;
  } else if (viewMode === 'state') {
    const meta = STATE_METADATA[currentState] || STATE_METADATA.unknown;
    if (isDark) {
      bgStyle = {
        backgroundColor: isHovered ? meta.darkBg.replace('0.16', '0.28').replace('0.20', '0.35') : meta.darkBg,
        borderColor: isHovered || isSelected ? '#ffffff' : meta.darkBorder,
        boxShadow: isHovered || isSelected ? `0 0 14px ${meta.glowRgba}` : `0 0 5px ${meta.glowRgba}`,
      };
      textAccent = meta.darkText;
    } else {
      bgStyle = {
        backgroundColor: isHovered ? meta.bgRgba.replace('0.12', '0.24').replace('0.15', '0.28') : meta.bgRgba,
        borderColor: isHovered || isSelected ? meta.textHex : meta.borderHex,
      };
      textAccent = meta.textHex;
    }
    // In state mode, bottomLabel remains standard atomic mass
  } else if (viewMode === 'trend' && trendProperty !== 'none') {
    const range = TREND_RANGES[trendProperty];
    const val = element[trendProperty];

    if (val === null || val === undefined) {
      bgStyle = isDark
        ? {
            backgroundColor: 'rgba(18, 18, 20, 0.65)',
            borderColor: '#27272a',
          }
        : {
            backgroundColor: '#f1f5f9',
            borderColor: '#e2e8f0',
          };
      textAccent = isDark ? '#71717a' : '#94a3b8';
      bottomLabel = '—';
    } else {
      const ratio = Math.max(0, Math.min(1, (val - range.min) / (range.max - range.min)));
      const hue = (1 - ratio) * 210;

      if (isDark) {
        bgStyle = {
          backgroundColor: `hsla(${hue}, 80%, 15%, 0.75)`,
          borderColor: `hsl(${hue}, 90%, 55%)`,
          boxShadow: isHovered || isSelected ? `0 0 14px hsla(${hue}, 85%, 55%, 0.55)` : `0 0 6px hsla(${hue}, 85%, 50%, 0.25)`,
        };
        textAccent = `hsl(${hue}, 95%, 75%)`;
      } else {
        const lightness = 93 - ratio * 15;
        const textLightness = 25 + (1 - ratio) * 15;
        bgStyle = {
          backgroundColor: `hsl(${hue}, 85%, ${lightness}%)`,
          borderColor: `hsl(${hue}, 75%, 45%)`,
        };
        textAccent = `hsl(${hue}, 85%, ${textLightness}%)`;
      }
      bottomLabel = `${val}`;
    }
  }

  const handleMouseEnter = () => {
    onHover(element);
  };

  const handleClick = () => {
    onSelect(element);
  };

  const effectiveDimmed = isDimmed || (viewMode === 'timeline' && !isHistoricalActive);
  const stateMeta = STATE_METADATA[currentState] || STATE_METADATA.unknown;

  // Glyph for crystal/state icon in top right matching the image chart
  const getStateGlyph = (st: string, num: number) => {
    if (st === 'gas') return '○';
    if (st === 'liquid') return '●';
    return ([4, 5, 12, 13, 21, 22, 23, 24, 25, 26, 27, 28, 29, 31, 32, 40, 42, 44, 45, 72, 73, 74, 75, 77, 78, 79, 81, 82, 83, 90, 91, 92, 93, 94, 95, 96].includes(num)) ? '▲' : '○';
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onFocus={handleMouseEnter}
      style={{
        ...bgStyle,
        borderRadius: '7px',
      }}
      aria-label={`${element.name} (${element.symbol}), Atomic Number ${element.atomicNumber}`}
      className={`group relative flex flex-col justify-between items-center p-0.5 sm:p-1 rounded-md sm:rounded-lg border text-center outline-none cursor-pointer select-none transition-all duration-150 transform
        w-full aspect-[1/1.08] min-h-[40px] sm:min-h-[46px] md:min-h-[50px] max-h-[66px] shadow-2xs hover:shadow-md
        ${isHovered ? 'scale-[1.08] z-30 shadow-lg ring-1 ring-white/50' : 'z-10'}
        ${isSelected ? 'scale-[1.06] z-30 ring-2 ring-emerald-500 shadow-lg' : ''}
        ${isSpecialFocus ? 'scale-[1.06] z-30 ring-2 ring-amber-500 shadow-lg' : ''}
        ${effectiveDimmed ? 'opacity-20 grayscale' : 'opacity-100'}
        active:scale-95
      `}
    >
      {/* Top Row: Atomic Number (left) & State Glyph (right) */}
      <div className="w-full flex items-center justify-between leading-none px-0.5">
        <span className="font-mono text-[7.5px] sm:text-[8.5px] md:text-[9.5px] font-semibold text-slate-500 dark:text-zinc-400 group-hover:text-slate-800 dark:group-hover:text-zinc-200">
          {element.atomicNumber}
        </span>
        <span
          className="font-mono text-[6.5px] sm:text-[7.5px] md:text-[8.5px] leading-none text-slate-400 dark:text-zinc-500 shrink-0 font-normal select-none"
          title={`${stateMeta.label} at ${tempKelvin}K`}
          aria-label={`${stateMeta.label} state`}
        >
          {getStateGlyph(currentState, element.atomicNumber)}
        </span>
      </div>

      {/* Middle: Symbol - Prominent & Visible */}
      <span
        className="font-mono font-bold text-[13.5px] sm:text-[15.5px] md:text-[17.5px] lg:text-[19.5px] leading-none my-auto tracking-tight drop-shadow-xs"
        style={{ color: textAccent }}
      >
        {element.symbol}
      </span>

      {/* Bottom: Name & Mass Stack - Clean single lines */}
      <div className="w-full flex flex-col items-center justify-end leading-none mt-auto">
        <span className="text-[6.5px] sm:text-[7.5px] md:text-[8.5px] font-medium leading-none text-slate-700 dark:text-zinc-200 truncate w-full px-0.5 text-center whitespace-nowrap">
          {element.name}
        </span>
        <span className="text-[6px] sm:text-[7px] md:text-[8px] font-mono text-slate-500 dark:text-zinc-400 tabular-nums leading-none text-center mt-0.5 truncate w-full whitespace-nowrap">
          {bottomLabel}
        </span>
      </div>
    </button>
  );
};

export const ElementCell = React.memo(ElementCellComponent, (prev, next) => {
  if (prev.viewMode !== 'state' && next.viewMode !== 'state') {
    return (
      prev.element.atomicNumber === next.element.atomicNumber &&
      prev.isHovered === next.isHovered &&
      prev.isSelected === next.isSelected &&
      prev.isDimmed === next.isDimmed &&
      prev.trendProperty === next.trendProperty &&
      prev.viewMode === next.viewMode &&
      prev.activeMilestoneId === next.activeMilestoneId &&
      prev.highlightedAtomicNumbers === next.highlightedAtomicNumbers &&
      prev.selectedHistoricalGroup === next.selectedHistoricalGroup
    );
  }

  // When in state mode: only re-render if physical state actually changed at the new temperature
  const prevState = getElementStateAtTemp(prev.element, prev.tempKelvin);
  const nextState = getElementStateAtTemp(next.element, next.tempKelvin);
  if (prevState !== nextState) {
    return false;
  }

  return (
    prev.isHovered === next.isHovered &&
    prev.isSelected === next.isSelected &&
    prev.isDimmed === next.isDimmed &&
    prev.viewMode === next.viewMode
  );
});
