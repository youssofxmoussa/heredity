import { useEffect, useState } from "react";
import { RNA_COMP, phase, type Sim } from "@/lib/genetics";
import { baseColors } from "@/lib/sheets";
import type { T } from "@/lib/i18n";

/* ---------- geometry ---------- */
const NT = 26; // nucleotide width
const CW = NT * 3; // codon width
const X0 = 320; // centre of the P site (ribosome is fixed, mRNA slides)
const BASE_Y = 238; // top of mRNA bases
const ANTI_Y = 214; // top of tRNA anticodon
const ACC_DY = -98; // amino-acid position relative to ANTI_Y
const TUNNEL = { x: X0 - 46, y: 74 };

const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
const seg = (p: number, a: number, b: number) => clamp01((p - a) / (b - a));
const ease = (x: number) => (x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2);
const outBack = (x: number) => {
  if (x <= 0) return 0;
  const c1 = 1.5, c3 = c1 + 1;
  return 1 + c3 * Math.pow(x - 1, 3) + c1 * Math.pow(x - 1, 2);
};
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const bump = (p: number, a: number, b: number) => (p <= a || p >= b ? 0 : Math.sin(((p - a) / (b - a)) * Math.PI));

/** Wall-clock seconds, for idle "alive" motion (thermal wobble). */
function useClock() {
  const [now, setNow] = useState(0);
  useEffect(() => {
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      setNow((t - t0) / 1000);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
  return now;
}

/* ---------- tRNA ---------- */
function TRNA({ x, y, rot, opacity, anti, aa, isRelease }: { x: number; y: number; rot: number; opacity: number; anti: string; aa?: string; isRelease?: boolean }) {
  if (opacity <= 0.01) return null;
  const body = isRelease ? "var(--release)" : "var(--trna)";
  return (
    <g transform={`translate(${x},${y}) rotate(${rot})`} opacity={opacity} filter="url(#soft)">
      {/* acceptor arm */}
      {!isRelease && <rect x={-4} y={ACC_DY + 12} width={8} height={26} rx={3} fill={body} />}
      {/* cloverleaf body */}
      <path
        d="M-10,0 L-10,-18 C-30,-16 -40,-30 -32,-42 C-26,-52 -14,-50 -11,-46 L-11,-62 C-11,-70 11,-70 11,-62 L11,-46 C14,-50 26,-52 32,-42 C40,-30 30,-16 10,-18 L10,0 Z"
        fill={body}
      />
      <path d="M-11,-62 C-11,-70 11,-70 11,-62 L11,-46 L-11,-46 Z" fill="var(--trna-hi)" opacity={isRelease ? 0.25 : 0.55} />
      {isRelease ? (
        <text y={-34} textAnchor="middle" fontSize={11} fontWeight={800} fill="var(--card)">RF</text>
      ) : (
        <>
          {/* anticodon */}
          {anti.split("").map((b, k) => (
            <g key={k}>
              <rect x={-CW / 2 + 2 + k * NT} y={0} width={NT - 3} height={20} rx={4} fill={baseColors[b]} stroke="var(--trna)" strokeWidth={2} />
              <text x={-CW / 2 + 2 + k * NT + (NT - 3) / 2} y={14.5} textAnchor="middle" fontSize={11} fontWeight={800}>{b}</text>
            </g>
          ))}
          {aa && <AminoAcid x={0} y={ACC_DY} label={aa} />}
        </>
      )}
      {isRelease && <rect x={-CW / 2 + 4} y={0} width={CW - 8} height={20} rx={6} fill="var(--release)" />}
    </g>
  );
}

function AminoAcid({ x, y, label, r = 13, glow = false }: { x: number; y: number; label: string; r?: number; glow?: boolean }) {
  const start = label === "Met";
  return (
    <g transform={`translate(${x},${y})`}>
      {glow && <circle r={r + 6} fill="var(--bond-glow)" opacity={0.6} />}
      <circle r={r} fill="url(#aaGrad)" stroke={start ? "var(--base-g)" : "var(--foreground)"} strokeOpacity={start ? 1 : 0.25} strokeWidth={start ? 2.5 : 1} />
      <text y={3.5} textAnchor="middle" fontSize={r > 12 ? 9.5 : 8} fontWeight={800} fill="var(--foreground)">{label}</text>
    </g>
  );
}

/* ---------- polypeptide path ---------- */
function chainPoints(ax: number, ay: number, n: number, now: number, wob: number) {
  // dense guide path: anchor -> tunnel -> wiggly tail drifting up-left in the cytoplasm
  const guide: [number, number][] = [];
  const pushLine = (x1: number, y1: number, x2: number, y2: number, steps: number) => {
    for (let i = 0; i <= steps; i++) guide.push([lerp(x1, x2, i / steps), lerp(y1, y2, i / steps)]);
  };
  pushLine(ax, ay, X0 - 22, 104, 12);
  pushLine(X0 - 22, 104, TUNNEL.x, TUNNEL.y, 12);
  for (let s = 1; s < 420; s += 2) {
    guide.push([TUNNEL.x - s * 0.82, TUNNEL.y - 6 - s * 0.05 + Math.sin(s / 24 - now * 1.6) * 14 * wob - Math.sin(s / 90) * 18]);
  }
  const pts: [number, number][] = [];
  let acc = 0;
  const SP = 25;
  pts.push(guide[0]);
  for (let i = 1; i < guide.length && pts.length < n; i++) {
    const [x1, y1] = guide[i - 1], [x2, y2] = guide[i];
    acc += Math.hypot(x2 - x1, y2 - y1);
    if (acc >= SP) {
      pts.push([x2, y2]);
      acc = 0;
    }
  }
  while (pts.length < n) pts.push(pts[pts.length - 1]);
  return pts;
}

function foldedPoints(n: number, cx: number, cy: number) {
  // compact coil: beads evenly spaced on a small loop, readable labels
  const R = Math.max(24, (n * 30) / (2 * Math.PI));
  return Array.from({ length: n }, (_, k) => {
    const a = -Math.PI / 2 + (k / Math.max(1, n)) * Math.PI * 2;
    return [cx + Math.cos(a) * R, cy + Math.sin(a) * R * 0.85] as [number, number];
  });
}

/* ---------- scene ---------- */
export function TranslationScene({ sim, seq, frame, t }: { sim: Sim; seq: string; frame: { start: number; codons: string[]; aa: string[]; stop: boolean }; t: T }) {
  const now = useClock();
  const { start, codons, aa, stop } = frame;
  const cycles = Math.max(0, aa.length - 1);
  const p0 = phase(sim, 0), p1 = phase(sim, 1), p2 = phase(sim, 2), p3 = phase(sim, 3), p4 = phase(sim, 4);

  // --- elongation cycle state
  const g = ((p2 + p3) / 2) * cycles;
  let cycle = 0, u = 1;
  if (cycles > 0 && g > 0) {
    if (g >= cycles) cycle = cycles;
    else {
      cycle = Math.floor(g) + 1;
      u = g - Math.floor(g);
    }
  }
  const translocate = ease(seg(u, 0.58, 0.92));
  let cp = cycle === 0 ? 0 : cycle - 1 + translocate;
  // scanning: the small subunit slides from the 5' cap to AUG
  if (p1 === 0) cp = lerp(-2.2, 0, ease(seg(p0, 0.25, 0.72)));
  // no stop codon: the ribosome keeps sliding off the end of the frame
  const stalled = !stop && p4 > 0;
  if (stalled) cp = cycles + ease(seg(p4, 0, 0.5)) * 0.6;

  const codonX = (j: number) => X0 + (j - cp) * CW;
  const ntX = (i: number) => X0 - CW / 2 + (i - start - 3 * cp) * NT;

  // chain holder: which tRNA currently carries the polypeptide
  const bonded = u >= 0.48;
  const holder = cycle === 0 ? 0 : bonded ? cycle : cycle - 1;
  const chainLen = sim.started && p0 > 0.72 ? holder + 1 : 0;

  // termination
  const rfIn = stop ? outBack(seg(p4, 0, 0.28)) : 0;
  const release = stop ? ease(seg(p4, 0.3, 0.68)) : 0;
  const diss = stop ? ease(seg(p4, 0.6, 1)) : 0;

  // ribosome assembly
  const smallIn = ease(seg(p0, 0, 0.25));
  const largeIn = outBack(p1);
  const breathe = 1 + Math.sin(now * 2.2) * 0.008;
  const shake = stalled ? Math.sin(now * 38) * 2.2 * seg(p4, 0.4, 0.6) : 0;

  // --- tRNAs
  type TR = { key: string; j: number; x: number; y: number; rot: number; op: number; aa?: string };
  const trnas: TR[] = [];
  if (sim.started) {
    // initiator
    const d = outBack(seg(p0, 0.72, 1));
    const exit0 = cycles >= 2 ? (cycle > 2 ? 1 : cycle === 2 ? ease(seg(u, 0, 0.45)) : 0) : 0;
    if (d > 0) trnas.push(mkTR(0, d, exit0));
    for (let c = 1; c <= cycles; c++) {
      if (c > cycle) break;
      const arrive = c < cycle ? 1 : outBack(seg(u, 0, 0.42));
      const ex = c + 2 > cycle ? 0 : c + 2 < cycle ? 1 : ease(seg(u, 0, 0.45));
      trnas.push(mkTR(c, arrive, ex));
    }
  }
  function mkTR(j: number, arrive: number, exit: number): TR {
    const tx = codonX(j);
    const fromX = tx + 190, fromY = -230;
    let x = lerp(fromX, tx, arrive), y = lerp(fromY, 0, arrive), rot = lerp(32, 0, arrive);
    let op = clamp01(arrive * 2.5);
    x -= 140 * exit;
    y -= 190 * exit;
    rot -= 30 * exit;
    op *= 1 - exit;
    // dissociation at termination
    x -= 60 * diss * (j % 2 ? -1 : 1);
    y -= 160 * diss;
    op *= 1 - diss;
    // stalled
    if (stalled) op *= 1 - seg(p4, 0.6, 1) * 0.6;
    // thermal wobble
    rot += Math.sin(now * 2.6 + j * 1.7) * 2.2 * (1 - exit);
    const charged = j > holder || chainLen === 0;
    return { key: "t" + j, j, x, y: y + ANTI_Y, rot, op, aa: charged ? aa[j] : undefined };
  }

  const holderTR = trnas.find((tr) => tr.j === holder);
  const anchor: [number, number] = holderTR ? [holderTR.x, holderTR.y + ACC_DY] : [X0, ANTI_Y + ACC_DY];
  const wob = 1 - release;
  const cPts = chainLen > 0 ? chainPoints(anchor[0], anchor[1], chainLen, now, wob) : [];
  const fPts = foldedPoints(chainLen, X0, 130);
  // newest amino acid is at index 0 of the path; aa index = holder - k
  const beads = cPts.map(([x, y], k) => {
    const [fx, fy] = fPts[k] ?? [x, y];
    const lift = release * -10 + Math.sin(now * 1.3 + k) * 2 * release;
    return { x: lerp(x, fx, release), y: lerp(y, fy, release) + lift, label: aa[holder - k] };
  });

  // peptide bond flash between P and A acceptors
  const flash = cycle > 0 ? bump(u, 0.38, 0.6) : 0;
  const flashX = codonX(cycle - 0.5);

  // free-floating molecules in the cytoplasm
  const floaters = Array.from({ length: 9 }, (_, i) => ({
    x: (i * 83 + now * (6 + (i % 3) * 3)) % 680 - 20,
    y: 30 + ((i * 47) % 130) + Math.sin(now * 0.8 + i) * 8,
    r: 4 + (i % 3) * 2,
    c: i % 2 ? "var(--trna)" : "var(--protein)",
  }));

  const ribX = X0 + shake;
  const largeY = lerp(-260, 0, largeIn) - 170 * diss;
  const smallY = 110 * diss;
  const smallX = lerp(-460, 0, smallIn);
  const showRibo = sim.started;
  const aSiteCodon = cycle === 0 ? 1 : bonded ? cycle + (translocate > 0.5 ? 1 : 0) : cycle;

  return (
    <svg viewBox="0 0 640 360" className="w-full" role="img" aria-label={t("Animation de la traduction par le ribosome", "Animation of translation by the ribosome")}>
      <defs>
        <radialGradient id="cyto" cx="50%" cy="40%" r="75%">
          <stop offset="0%" style={{ stopColor: "var(--cytoplasm)" }} />
          <stop offset="100%" style={{ stopColor: "var(--cytoplasm-deep)" }} />
        </radialGradient>
        <radialGradient id="largeGrad" cx="40%" cy="30%" r="80%">
          <stop offset="0%" style={{ stopColor: "var(--ribo-large-hi)" }} />
          <stop offset="100%" style={{ stopColor: "var(--ribo-large)" }} />
        </radialGradient>
        <radialGradient id="smallGrad" cx="45%" cy="20%" r="85%">
          <stop offset="0%" style={{ stopColor: "var(--ribo-small-hi)" }} />
          <stop offset="100%" style={{ stopColor: "var(--ribo-small)" }} />
        </radialGradient>
        <radialGradient id="aaGrad" cx="35%" cy="30%" r="75%">
          <stop offset="0%" style={{ stopColor: "var(--card)" }} />
          <stop offset="55%" style={{ stopColor: "var(--protein)" }} />
          <stop offset="100%" style={{ stopColor: "var(--protein)" }} />
        </radialGradient>
        <filter id="soft" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow dx="0" dy="3" stdDeviation="3" floodOpacity="0.18" />
        </filter>
        <filter id="glow" x="-100%" y="-100%" width="300%" height="300%">
          <feGaussianBlur stdDeviation="6" />
        </filter>
      </defs>

      <rect width={640} height={360} rx={18} fill="url(#cyto)" />
      {floaters.map((f, i) => (
        <circle key={i} cx={f.x} cy={f.y} r={f.r} fill={f.c} opacity={0.18} />
      ))}

      {/* small subunit (behind mRNA) */}
      {showRibo && (
        <g transform={`translate(${ribX + smallX},${smallY}) scale(${breathe})`} opacity={1 - diss} filter="url(#soft)">
          <path d="M-128,262 C-138,248 -112,244 -60,246 L60,246 C112,244 140,250 130,266 C122,302 64,312 0,308 C-62,312 -120,298 -128,262 Z" fill="url(#smallGrad)" />
          <ellipse cx={-50} cy={284} rx={30} ry={8} fill="var(--card)" opacity={0.12} />
          <text x={0} y={296} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--foreground)" opacity={0.7}>{t("petite sous-unité", "small subunit")}</text>
        </g>
      )}

      {/* mRNA */}
      <g>
        {(() => {
          const x1 = ntX(0) - 4, x2 = ntX(seq.length - 1) + NT;
          return (
            <>
              <path d={`M${x1},${BASE_Y + 24} L${x2},${BASE_Y + 24}`} stroke="var(--rna)" strokeWidth={5} strokeLinecap="round" />
              <circle cx={x1 - 10} cy={BASE_Y + 24} r={9} fill="var(--rna)" />
              <text x={x1 - 10} y={BASE_Y + 27.5} textAnchor="middle" fontSize={9} fontWeight={800} fill="var(--card)">5'</text>
              <text x={x2 + 8} y={BASE_Y + 28} fontSize={12} fontWeight={800} fill="var(--foreground)">3'</text>
              <text x={x1 - 2} y={BASE_Y + 46} fontSize={11} fill="var(--foreground)" opacity={0.75}>{t("ARNm", "mRNA")}</text>
            </>
          );
        })()}
        {seq.split("").map((b, i) => {
          const ci = Math.floor((i - start) / 3);
          const inFrame = i >= start && ci < codons.length;
          const isStop = stop && inFrame && ci === codons.length - 1;
          const x = ntX(i);
          if (x < -40 || x > 680) return null;
          const read = inFrame && chainLen > 0 && ci <= holder;
          return (
            <g key={i}>
              <rect x={x} y={BASE_Y} width={NT - 3} height={20} rx={4} fill={isStop ? "var(--danger)" : baseColors[b]} opacity={inFrame ? 1 : 0.4} />
              <line x1={x + (NT - 3) / 2} y1={BASE_Y + 20} x2={x + (NT - 3) / 2} y2={BASE_Y + 24} stroke="var(--rna)" strokeWidth={2} />
              <text x={x + (NT - 3) / 2} y={BASE_Y + 14.5} textAnchor="middle" fontSize={11} fontWeight={800}>{b}</text>
              {inFrame && (i - start) % 3 === 0 && <line x1={x - 1.5} y1={BASE_Y - 4} x2={x - 1.5} y2={BASE_Y + 24} stroke="var(--foreground)" strokeOpacity={0.25} strokeDasharray="2 2" />}
              {read && (i - start) % 3 === 1 && <circle cx={x + (NT - 3) / 2} cy={BASE_Y + 34} r={2.5} fill="var(--foreground)" opacity={0.35} />}
            </g>
          );
        })}
      </g>

      {/* large subunit */}
      {showRibo && p1 > 0 && (
        <g transform={`translate(${ribX},${largeY}) scale(${breathe})`} opacity={clamp01(p1 * 3) * (1 - diss)} filter="url(#soft)">
          <path
            d="M-136,232 C-160,196 -150,128 -100,96 C-70,76 -44,70 -26,66 C-10,62 6,70 24,66 C70,58 128,86 146,132 C160,168 154,210 136,232 Z"
            fill="url(#largeGrad)"
          />
          {/* exit tunnel */}
          <ellipse cx={TUNNEL.x - X0} cy={TUNNEL.y - 2} rx={14} ry={7} fill="var(--ribo-small)" opacity={0.7} />
          {/* E P A sites */}
          {[
            { k: "E", dx: -CW },
            { k: "P", dx: 0 },
            { k: "A", dx: CW },
          ].map((s) => (
            <g key={s.k}>
              <rect x={s.dx - CW / 2 + 5} y={118} width={CW - 10} height={110} rx={18} fill="var(--ribo-site)" opacity={0.35} />
              <text x={s.dx} y={112} textAnchor="middle" fontSize={13} fontWeight={800} fill="var(--foreground)">{s.k}</text>
            </g>
          ))}
          <text x={118} y={84} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--foreground)" opacity={0.7}>{t("grande sous-unité", "large subunit")}</text>
        </g>
      )}

      {/* codon–anticodon pairing ticks */}
      {trnas.map((tr) =>
        tr.op > 0.9 && Math.abs(tr.y - ANTI_Y) < 2
          ? [0, 1, 2].map((k) => (
              <line key={tr.key + k} x1={tr.x - CW / 2 + 2 + k * NT + 11} x2={tr.x - CW / 2 + 2 + k * NT + 11} y1={ANTI_Y + 20} y2={BASE_Y} stroke="var(--foreground)" strokeWidth={1.5} strokeDasharray="1.5 1.5" opacity={0.7} />
            ))
          : null,
      )}

      {/* tRNAs */}
      {trnas.map((tr) => (
        <TRNA key={tr.key} x={tr.x} y={tr.y} rot={tr.rot} opacity={tr.op} anti={(codons[tr.j] ?? "").split("").map((b) => RNA_COMP[b]).join("")} aa={tr.aa} />
      ))}

      {/* release factor */}
      {stop && rfIn > 0 && (
        <TRNA x={codonX(codons.length - 1) + 50 * diss} y={lerp(-200, 0, rfIn) + ANTI_Y - 150 * diss} rot={lerp(25, 0, rfIn)} opacity={clamp01(rfIn * 2) * (1 - diss)} anti="" isRelease />
      )}

      {/* peptide-bond flash */}
      {flash > 0 && (
        <g opacity={flash}>
          <circle cx={flashX} cy={ANTI_Y + ACC_DY} r={26} fill="var(--bond-glow)" filter="url(#glow)" />
          <text x={flashX} y={ANTI_Y + ACC_DY - 26} textAnchor="middle" fontSize={11} fontWeight={800} fill="var(--foreground)">{t("liaison peptidique", "peptide bond")}</text>
        </g>
      )}

      {/* polypeptide */}
      {beads.length > 1 &&
        beads.slice(1).map((b, k) => (
          <line key={"l" + k} x1={beads[k].x} y1={beads[k].y} x2={b.x} y2={b.y} stroke="var(--foreground)" strokeOpacity={0.45} strokeWidth={3} strokeLinecap="round" />
        ))}
      {beads
        .slice()
        .reverse()
        .map((b, k) => (
          <AminoAcid key={"b" + k} x={b.x} y={b.y} label={b.label ?? ""} r={13} glow={release > 0.95 && k === beads.length - 1 && false} />
        ))}
      {chainLen > 1 && release < 0.3 && (
        <text x={TUNNEL.x - 70} y={22} fontSize={12} fontWeight={700} fill="var(--foreground)" opacity={0.8}>{t("protéine en formation", "growing protein")}</text>
      )}

      {/* idle hint */}
      {!sim.started && (
        <text x={320} y={150} textAnchor="middle" fontSize={15} fontWeight={700} fill="var(--foreground)" opacity={0.7}>{t("Les sous-unités du ribosome attendent dans le cytoplasme…", "Ribosome subunits are waiting in the cytoplasm…")}</text>
      )}

      {/* A-site arrow during elongation */}
      {sim.started && p1 >= 1 && p4 === 0 && cycles > 0 && aSiteCodon < codons.length && (
        <text x={X0 + CW} y={BASE_Y + 62} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--foreground)" opacity={0.7}>
          ▲ {t("codon lu", "codon read")}
        </text>
      )}

      {/* outcome */}
      {p4 > 0.7 && (
        <g>
          <rect x={150} y={318} width={340} height={32} rx={14} fill={stop ? "var(--card)" : "var(--danger)"} opacity={0.92} />
          <text x={320} y={339} textAnchor="middle" fontSize={14} fontWeight={800} fill={stop ? "var(--foreground)" : "var(--card)"}>
            {stop
              ? t(`Protéine libérée : ${aa.length} acide(s) aminé(s)`, `Protein released: ${aa.length} amino acid(s)`)
              : t("Pas de codon stop dans le cadre : lecture anormale !", "No stop codon in frame: abnormal reading!")}
          </text>
        </g>
      )}
    </svg>
  );
}
