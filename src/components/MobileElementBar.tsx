import React from 'react';
import { ElementData } from '../types/element';
import { CATEGORIES } from '../data/categories';

export interface MobileElementBarProps {
  element: ElementData;
  onOpenDossier: (element: ElementData) => void;
  onOpenComparator: (element: ElementData) => void;
  onDismiss: () => void;
}

/**
 * Floating quick-action bar for mobile screens (< 640px).
 * Appears when an element is selected so touch users can view details or compare.
 * Positioned cleanly above the sticky footer.
 */
export const MobileElementBar: React.FC<MobileElementBarProps> = ({
  element,
  onOpenDossier,
  onOpenComparator,
  onDismiss,
}) => {
  const categoryInfo = CATEGORIES[element.category];

  return (
    <div className="sm:hidden fixed bottom-11 left-2 right-2 z-40 p-2 bg-white/95 dark:bg-[#18191f]/95 border border-slate-200/90 dark:border-zinc-700/80 rounded-xl backdrop-blur-md shadow-xl flex items-center justify-between gap-2 animate-in slide-in-from-bottom duration-200">
      {/* Element Symbol & Info Summary */}
      <button
        type="button"
        onClick={() => onOpenDossier(element)}
        className="flex items-center gap-2.5 min-w-0 text-left cursor-pointer active:scale-98 transition-transform"
      >
        <span
          className="w-10 h-10 rounded-xl font-mono font-bold text-sm flex items-center justify-center border shadow-xs shrink-0"
          style={{
            borderColor: categoryInfo?.color || '#3b82f6',
            backgroundColor: categoryInfo?.bgRgba || 'rgba(59,130,246,0.1)',
            color: categoryInfo?.textHex || '#2563eb',
            borderRadius: '10px',
          }}
        >
          {element.symbol}
        </span>
        <div className="flex flex-col min-w-0 leading-tight">
          <span className="font-semibold text-xs text-slate-900 dark:text-white truncate">
            {element.name} (#{element.atomicNumber})
          </span>
          <span className="text-[10px] text-slate-500 dark:text-zinc-400 font-mono truncate">
            {Number(element.atomicMass).toFixed(2)} u · {categoryInfo?.label}
          </span>
        </div>
      </button>

      {/* Action Buttons: Dossier, Compare & Dismiss */}
      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={() => onOpenDossier(element)}
          className="px-2.5 py-1 text-xs font-semibold rounded-md bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-xs cursor-pointer active:scale-95"
        >
          Dossier
        </button>
        <button
          type="button"
          onClick={() => onOpenComparator(element)}
          className="px-2 py-1 text-xs font-semibold rounded-md border border-slate-200 dark:border-zinc-700 text-slate-700 dark:text-zinc-300 bg-slate-50 dark:bg-zinc-800 cursor-pointer active:scale-95"
        >
          Compare
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="p-1 text-slate-400 hover:text-slate-600 dark:text-zinc-500 dark:hover:text-zinc-300 cursor-pointer ml-0.5 rounded-md hover:bg-slate-100 dark:hover:bg-zinc-800"
          title="Close floating preview"
          aria-label="Close floating preview"
        >
          <svg
            className="w-3.5 h-3.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18" />
            <line x1="6" y1="6" x2="18" y2="18" />
          </svg>
        </button>
      </div>
    </div>
  );
};
