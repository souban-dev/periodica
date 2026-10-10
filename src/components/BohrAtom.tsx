import React, { useRef, useEffect, useMemo } from 'react';
import { ElementData } from '../types/element';
import { generateOrbitalDots, OrbitalDot } from '../utils/dottedOrbital';
import { useTheme } from '../context/ThemeContext';

interface BohrAtomProps {
  element: ElementData;
  size?: number;
  interactive?: boolean;
}

export const BohrAtom: React.FC<BohrAtomProps> = ({ element, size = 180, interactive = true }) => {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rotRef = useRef({ x: 20, y: 30 });
  const isDragging = useRef(false);
  const lastMousePos = useRef({ x: 0, y: 0 });

  // Determine primary valence subshell
  const valenceSubshell = useMemo(() => {
    if (element.atomicNumber <= 2) return '1s';
    // Exception ground-state overrides (e.g. Lanthanum and Actinium have 0 electrons in f-subshell)
    if (element.atomicNumber === 57) return '5d'; // Lanthanum: [Xe] 5d¹ 6s²
    if (element.atomicNumber === 89 || element.atomicNumber === 90) return '6d'; // Actinium: [Rn] 6d¹ 7s², Thorium: [Rn] 6d² 7s²
    if (element.atomicNumber === 103) return '7pz'; // Lawrencium: [Rn] 5f¹⁴ 7s² 7p¹
    if (element.block === 'p') return `${element.period}pz`;
    if (element.block === 'd') return `${element.period - 1}d`;
    if (element.block === 'f') return `${element.period - 2}f`;
    return `${element.period}s`;
  }, [element]);

  // Generate lightweight 3D probability dots once per element
  const dots: OrbitalDot[] = useMemo(() => {
    const dotCount = Math.min(800, Math.max(500, Math.round(size * 3.8)));
    const scale = size * 0.40;
    return generateOrbitalDots(valenceSubshell, dotCount, scale);
  }, [valenceSubshell, size]);

  useEffect(() => {
    let animId: number;

    const render = () => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      const dpr = window.devicePixelRatio || 1;
      if (canvas.width !== size * dpr || canvas.height !== size * dpr) {
        canvas.width = size * dpr;
        canvas.height = size * dpr;
      }

      ctx.save();
      ctx.scale(dpr, dpr);
      ctx.clearRect(0, 0, size, size);

      // Auto-precession without triggering React state re-renders
      if (!isDragging.current) {
        rotRef.current.y = (rotRef.current.y + 0.4) % 360;
      }

      const cx = size / 2;
      const cy = size / 2;
      const radX = (rotRef.current.x * Math.PI) / 180;
      const radY = (rotRef.current.y * Math.PI) / 180;
      const cosX = Math.cos(radX);
      const sinX = Math.sin(radX);
      const cosY = Math.cos(radY);
      const sinY = Math.sin(radY);

      const fov = 260;

      // Project and depth-sort dots
      interface ProjDot {
        px: number;
        py: number;
        z: number;
        r: number;
        alpha: number;
        phase: number;
        isPerimeter?: boolean;
      }

      const projected: ProjDot[] = [];

      for (let i = 0; i < dots.length; i++) {
        const d = dots[i];

        // 3D rotation
        const x1 = d.x * cosY + d.z * sinY;
        const y1 = d.y;
        const z1 = -d.x * sinY + d.z * cosY;

        const x2 = x1;
        const y2 = y1 * cosX - z1 * sinX;
        const z2 = y1 * sinX + z1 * cosX;

        const factor = fov / (z2 + fov + 80);
        const px = cx + x2 * factor;
        const py = cy + y2 * factor;
        // Fine, crisp micro-dots
        const r = Math.max(0.75, 1.25 * factor);
        const alpha = Math.max(0.25, Math.min(0.95, (z2 + 80) / 140));

        projected.push({
          px,
          py,
          z: z2,
          r,
          alpha: d.isPerimeter ? Math.min(1, alpha * 1.15) : alpha,
          phase: d.phase,
          isPerimeter: d.isPerimeter,
        });
      }

      // Depth sort back-to-front
      projected.sort((a, b) => a.z - b.z);

      // Render Central Nucleus Marker
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = isDark ? '#38bdf8' : '#0f172a';
      if (isDark) {
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 6;
      }
      ctx.fill();
      ctx.shadowBlur = 0;

      // Render Prominent Clean Dotted Dumbbells
      for (let i = 0; i < projected.length; i++) {
        const p = projected[i];
        ctx.beginPath();
        ctx.arc(p.px, p.py, p.r, 0, Math.PI * 2);

        if (p.phase >= 0) {
          // Lobe 1
          ctx.fillStyle = isDark
            ? `rgba(56, 189, 248, ${p.alpha * 0.95})`
            : `rgba(37, 99, 235, ${p.alpha})`;
        } else {
          // Lobe 2
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
  }, [dots, size, isDark]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!interactive) return;
    isDragging.current = true;
    lastMousePos.current = { x: e.clientX, y: e.clientY };
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!interactive || !isDragging.current) return;
    const dx = e.clientX - lastMousePos.current.x;
    const dy = e.clientY - lastMousePos.current.y;
    lastMousePos.current = { x: e.clientX, y: e.clientY };

    rotRef.current.x = Math.max(-85, Math.min(85, rotRef.current.x - dy * 0.6));
    rotRef.current.y = (rotRef.current.y + dx * 0.6) % 360;
  };

  const handleMouseUp = () => {
    isDragging.current = false;
  };

  return (
    <div
      className="relative flex flex-col items-center justify-center select-none rounded-xl overflow-hidden bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800 shadow-xs cursor-grab active:cursor-grabbing group transition-colors duration-300"
      style={{ width: size, height: size }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      title={`${element.name} (${element.symbol}) Simple Dotted Probability Orbital (${valenceSubshell}) · Drag to rotate in 3D`}
    >
      <canvas ref={canvasRef} style={{ width: size, height: size }} className="block" />

      {/* Top Label */}
      <div className="absolute top-1.5 left-2 text-[9px] font-mono font-bold text-blue-900 dark:text-blue-200 bg-white/95 dark:bg-slate-900/95 px-1.5 py-0.5 rounded border border-blue-200 dark:border-blue-900/60 shadow-2xs pointer-events-none transition-colors duration-300">
        {valenceSubshell.toUpperCase()} Dotted Cloud
      </div>

      {/* Bottom Subtitle */}
      {interactive && size >= 140 && (
        <span className="absolute bottom-1.5 text-[8.5px] font-mono font-medium text-slate-700 dark:text-slate-300 bg-white/95 dark:bg-slate-900/95 px-1.5 py-0.5 rounded border border-slate-300 dark:border-slate-700 shadow-2xs pointer-events-none transition-colors duration-300">
          3D Dotted Probability · Drag to spin
        </span>
      )}
    </div>
  );
};
