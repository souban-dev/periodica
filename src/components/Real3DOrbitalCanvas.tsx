import React, { useRef, useEffect, useState, useMemo } from 'react';
import { generateOrbitalDots, OrbitalDot } from '../utils/dottedOrbital';
import { useTheme } from '../context/ThemeContext';

export type RealSubshellType =
  | '1s'
  | '2s'
  | '2px'
  | '2py'
  | '2pz'
  | '3s'
  | '3p'
  | '3dxy'
  | '3dxz'
  | '3dyz'
  | '3dx2y2'
  | '3dz2'
  | '4f';

interface Real3DOrbitalCanvasProps {
  subshell?: RealSubshellType;
  autoRotate?: boolean;
  className?: string;
}

export const Real3DOrbitalCanvas: React.FC<Real3DOrbitalCanvasProps> = ({
  subshell = '2pz',
  autoRotate = true,
  className = '',
}) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef({ x: 25, y: -30 });
  const [dotCount, setDotCount] = useState(950);
  const isDragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });

  // Generate lightweight dotted points for subshell wavefunctions
  const rawDots: OrbitalDot[] = useMemo(() => {
    return generateOrbitalDots(subshell, dotCount, 105);
  }, [subshell, dotCount]);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;

      if (canvas.width !== width * dpr || canvas.height !== height * dpr) {
        canvas.width = width * dpr;
        canvas.height = height * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, width, height);

      // Auto-precession without triggering React state updates
      if (autoRotate && !isDragging.current) {
        rotRef.current.y = (rotRef.current.y + 0.35) % 360;
      }

      const cx = width / 2;
      const cy = height / 2;
      const radX = (rotRef.current.x * Math.PI) / 180;
      const radY = (rotRef.current.y * Math.PI) / 180;
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);

      const fov = 340;

      // Project 3D dots
      interface ProjDot {
        px: number;
        py: number;
        z: number;
        r: number;
        alpha: number;
        phase: number;
      }

      const projected: ProjDot[] = [];

      for (let i = 0; i < rawDots.length; i++) {
        const d = rawDots[i];

        const x1 = d.x * cosY + d.z * sinY;
        const y1 = d.y;
        const z1 = -d.x * sinY + d.z * cosY;

        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        const factor = fov / (z2 + fov + 120);
        const px = cx + x2 * factor;
        const py = cy + y2 * factor;
        const r = Math.max(0.75, 1.35 * factor);
        const alpha = Math.max(0.2, Math.min(0.95, (z2 + 100) / 180));

        projected.push({
          px,
          py,
          z: z2,
          r,
          alpha: d.isPerimeter ? Math.min(1, alpha * 1.15) : alpha,
          phase: d.phase,
        });
      }

      // Depth sort back to front
      projected.sort((a, b) => a.z - b.z);

      // Background coordinate axes (subtle dashed lines)
      ctx.strokeStyle = isDark ? 'rgba(71, 85, 105, 0.4)' : 'rgba(203, 213, 225, 0.5)';
      ctx.lineWidth = 1;
      ctx.setLineDash([2, 3]);

      ctx.beginPath();
      ctx.moveTo(cx - 110, cy);
      ctx.lineTo(cx + 110, cy);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(cx, cy - 110);
      ctx.lineTo(cx, cy + 110);
      ctx.stroke();
      ctx.setLineDash([]);

      // Draw Nucleus center point
      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#38bdf8' : '#0f172a';
      if (isDark) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Render Simple Dotted Probability Orbital
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.r, 0, Math.PI * 2);

        if (p.phase >= 0) {
          ctx.fillStyle = isDark
            ? `rgba(56, 189, 248, ${p.alpha * 0.95})`
            : `rgba(37, 99, 235, ${p.alpha})`;
        } else {
          ctx.fillStyle = isDark
            ? `rgba(251, 146, 60, ${p.alpha * 0.95})`
            : `rgba(217, 119, 6, ${p.alpha})`;
        }

        ctx.fill();
      }

      ctx.restore();
      animId = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animId) cancelAnimationFrame(animId);
    };
  }, [rawDots, autoRotate, isDark]);

  const handleMouseDown = (e: React.MouseEvent) => {
    isDragging.current = true;
    lastPos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging.current) return;
    const dx = e.clientX - lastPos.current.x;
    const dy = e.clientY - lastPos.current.y;
    lastPos.current = { x: e.clientX, y: e.clientY };

    rotRef.current.x = Math.max(-85, Math.min(85, rotRef.current.x - dy * 0.5));
    rotRef.current.y = (rotRef.current.y + dx * 0.5) % 360;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      className={`relative w-full h-full min-h-[380px] bg-slate-50/70 dark:bg-[#141210] rounded-xl overflow-hidden select-none flex flex-col items-center justify-center border border-slate-200 dark:border-[#2f2923] shadow-xs cursor-grab active:cursor-grabbing ${className}`}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <canvas ref={canvasRef} className="w-full h-full block" />

      {/* Top Floating Badge */}
      <div className="absolute top-3 left-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200 dark:border-slate-800 text-xs font-mono shadow-xs pointer-events-none">
        <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400" />
        <span className="font-bold text-slate-800 dark:text-slate-100">
          {subshell} Dotted Cloud
        </span>
      </div>

      {/* Dot Density Controller */}
      <div className="absolute top-3 right-3 flex items-center gap-2 px-2.5 py-1 rounded-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-xs border border-slate-200 dark:border-slate-800 text-[11px] font-mono shadow-xs">
        <span className="text-slate-500 dark:text-slate-400 font-medium">Dots:</span>
        <button
          type="button"
          onClick={() => setDotCount(600)}
          className={`px-1.5 py-0.5 rounded cursor-pointer ${dotCount === 600 ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Light (600)
        </button>
        <button
          type="button"
          onClick={() => setDotCount(950)}
          className={`px-1.5 py-0.5 rounded cursor-pointer ${dotCount === 950 ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Med (950)
        </button>
        <button
          type="button"
          onClick={() => setDotCount(1400)}
          className={`px-1.5 py-0.5 rounded cursor-pointer ${dotCount === 1400 ? 'bg-blue-600 text-white font-bold' : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'}`}
        >
          Dense (1400)
        </button>
      </div>

      {/* Bottom Subtitle / Info */}
      <div className="absolute bottom-2.5 inset-x-3 flex items-center justify-between text-[10px] font-mono text-slate-500 dark:text-slate-400 bg-white/85 dark:bg-slate-900/90 px-3 py-1 rounded-md border border-slate-200 dark:border-slate-800 pointer-events-none">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-sky-400" />
            <span>+ Phase Dots</span>
          </span>
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full bg-amber-600 dark:bg-amber-400" />
            <span>− Phase Dots</span>
          </span>
        </div>
        <span className="text-slate-400 dark:text-slate-500">
          Lightweight 3D Dotted Quantum Model · Drag to rotate
        </span>
      </div>
    </div>
  );
};
