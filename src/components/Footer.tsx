import React from 'react';
import { ViewMode } from '../types/element';

/**
 * Props for the Footer component.
 */
export interface FooterProps {
  /** The current active table view mode */
  viewMode: ViewMode;
  /** Optional developer/creator attribution text. Defaults to 'Souban Chakraborty' */
  authorName?: string;
}

/**
 * Global application footer.
 * - Displays centered design & development attribution: "The website is designed and developed by Souban Chakraborty".
 * - Fully responsive and visible across both desktop and mobile viewports.
 * - Sticky at the bottom of the viewport with subtle backdrop blur.
 */
export const Footer: React.FC<FooterProps> = ({ viewMode, authorName = 'Souban Chakraborty' }) => {
  return (
    <footer className="w-full border-t border-slate-200 dark:border-[#292c35] py-2 px-3 sm:px-4 text-xs text-slate-500 dark:text-zinc-400 flex items-center justify-between bg-white/95 dark:bg-[#1a1b20]/95 backdrop-blur-md transition-colors duration-300 mt-auto sticky bottom-0 z-30 shadow-xs">
      {/* Left: Branding & Total Elements (Desktop & Tablet) */}
      <div className="hidden sm:flex flex-1 items-center justify-start text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
        <span className="font-semibold text-slate-700 dark:text-zinc-300">PERIODICA</span>
        <span className="mx-1.5 opacity-40">·</span>
        <span>118 Elements</span>
      </div>

      {/* Center: Developer Attribution (Visible & Centered on All Screens) */}
      <div className="flex-1 flex items-center justify-center text-center font-medium text-slate-700 dark:text-zinc-200 text-xs sm:text-xs">
        <span>
          The website is designed and developed by{' '}
          <span className="font-semibold text-slate-900 dark:text-white">{authorName}</span>
        </span>
      </div>

      {/* Right: Shortcuts & Mode Indicator (Desktop & Tablet) */}
      <div className="hidden sm:flex flex-1 items-center justify-end text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
        <span>{viewMode === 'timeline' ? 'Historical Mode' : 'Click element for dossier'}</span>
        {viewMode !== 'timeline' && (
          <>
            <span className="mx-1.5 opacity-40">·</span>
            <span>
              Press{' '}
              <kbd className="px-1 py-0.5 rounded bg-slate-100 dark:bg-zinc-800 border border-slate-300 dark:border-zinc-700 text-slate-600 dark:text-zinc-300 text-[10px]">
                /
              </kbd>
            </span>
          </>
        )}
      </div>
    </footer>
  );
};
