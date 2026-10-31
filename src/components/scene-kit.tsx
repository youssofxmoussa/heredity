import { useEffect, useState } from "react";

/** Motion helpers (after the claude-animation skill: snap then hold, overshoot, staggered phases). */
export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
export const eIO = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
export const eOut = (t: number) => 1 - Math.pow(1 - clamp01(t), 3);
export const eBack = (t: number, s = 1.9) => {
  const x = clamp01(t) - 1;
  return 1 + (s + 1) * x * x * x + s * x * x;
};
/** Window: maps t∈[a,b] → 0..1 (clamped). */
export const win = (t: number, a: number, b: number) => clamp01((t - a) / (b - a));

/** Ambient clock in seconds: keeps holds alive (breathing, drifting, wobble). */
export function useClock() {
  const [k, setK] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (now: number) => {
      setK((now - t0) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return k;
}

/** Shared SVG defs: soft shadow, glow, paper grain, vignette, glossy gradients. */
export function KitDefs() {
  return (
    <defs>
      <filter id="k-shadow" x="-30%" y="-30%" width="160%" height="170%">
        <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="var(--ink)" floodOpacity="0.22" />
      </filter>
      <filter id="k-glow" x="-100%" y="-100%" width="300%" height="300%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
      <filter id="k-grain" x="0" y="0" width="100%" height="100%">
        <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" seed="7" />
        <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.2  0 0 0 0.09 0" />
      </filter>
      <radialGradient id="k-bg" cx="50%" cy="40%" r="75%">
        <stop offset="0%" stopColor="var(--scene-hi)" />
        <stop offset="100%" stopColor="var(--scene-lo)" />
      </radialGradient>
      <radialGradient id="k-vignette" cx="50%" cy="50%" r="70%">
        <stop offset="65%" stopColor="var(--ink)" stopOpacity="0" />
        <stop offset="100%" stopColor="var(--ink)" stopOpacity="0.16" />
      </radialGradient>
      <radialGradient id="k-gloss" cx="35%" cy="30%" r="70%">
        <stop offset="0%" stopColor="white" stopOpacity="0.7" />
        <stop offset="45%" stopColor="white" stopOpacity="0.1" />
        <stop offset="100%" stopColor="white" stopOpacity="0" />
      </radialGradient>
      <linearGradient id="k-glass" x1="0" x2="1">
        <stop offset="0%" stopColor="white" stopOpacity="0.55" />
        <stop offset="25%" stopColor="white" stopOpacity="0.12" />
        <stop offset="75%" stopColor="white" stopOpacity="0.05" />
        <stop offset="100%" stopColor="white" stopOpacity="0.4" />
      </linearGradient>
    </defs>
  );
}

/** Background layers: warm gradient + drifting motes (far layer). Put first in the svg. */
export function Backdrop({ w, h, k, motes = 14 }: { w: number; h: number; k: number; motes?: number }) {
  return (
    <g>
      <rect width={w} height={h} fill="url(#k-bg)" />
      {Array.from({ length: motes }, (_, i) => {
        const sx = (i * 137.5) % w;
        const sy = (i * 71.3) % h;
        const x = (sx + Math.sin(k * 0.25 + i) * 18 + k * (4 + (i % 3))) % w;
        const y = sy + Math.cos(k * 0.3 + i * 1.7) * 10;
        return <circle key={i} cx={x} cy={y} r={1.5 + (i % 4)} fill="var(--mote)" opacity={0.35} />;
      })}
    </g>
  );
}

/** Foreground finish: grain + vignette. Put last in the svg. */
export function Finish({ w, h }: { w: number; h: number }) {
  return (
    <g pointerEvents="none">
      <rect width={w} height={h} filter="url(#k-grain)" />
      <rect width={w} height={h} fill="url(#k-vignette)" />
    </g>
  );
}

/** Caption pill drawn in-scene. */
export function Pill({ x, y, text, o = 1, tone = "card" }: { x: number; y: number; text: string; o?: number; tone?: "card" | "accent" }) {
  const w = Math.max(40, text.length * 6.6 + 22);
  return (
    <g transform={`translate(${x},${y})`} opacity={o}>
      <rect x={-w / 2} y={-13} width={w} height={26} rx={13} fill={tone === "accent" ? "var(--accent)" : "var(--card)"} stroke="var(--border)" filter="url(#k-shadow)" />
      <text textAnchor="middle" y={4.5} fontSize={12} fontWeight={700} fill="var(--foreground)">{text}</text>
    </g>
  );
}
