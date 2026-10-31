import { baseColors } from "@/lib/sheets";
import { COMP } from "@/lib/genetics";
import { Backdrop, Finish, KitDefs, Pill, eBack, eIO, eOut, lerp, useClock, win } from "./scene-kit";

type T = (fr: string, en: string) => string;
const W = 600, H = 320, CY = 165, AMP = 78;

/** One nucleotide close-up: phosphate, deoxyribose pentagon and base snap together with overshoot. */
function Nucleotide({ p, k, t }: { p: number; k: number; t: T }) {
  const ph = eBack(win(p, 0, 0.3)), su = eBack(win(p, 0.2, 0.5)), ba = eBack(win(p, 0.4, 0.7));
  const b1 = eOut(win(p, 0.55, 0.75)), b2 = eOut(win(p, 0.7, 0.9));
  const bob = Math.sin(k * 1.6) * 3;
  return (
    <g transform={`translate(170,${140 + bob})`}>
      <line x1={0} y1={30} x2={lerp(0, 70, b1)} y2={lerp(30, 32, b1)} stroke="var(--phosphate)" strokeWidth={4} strokeLinecap="round" />
      <line x1={108} y1={32} x2={lerp(108, 160, b2)} y2={32} stroke="var(--ink)" strokeOpacity={0.5} strokeWidth={3} strokeLinecap="round" />
      <g transform={`translate(${lerp(-90, 0, ph)},30) scale(${ph})`} filter="url(#k-shadow)">
        <circle r={24} fill="var(--phosphate)" />
        <circle r={24} fill="url(#k-gloss)" />
        <text y={6} textAnchor="middle" fontSize={17} fontWeight={700} fill="var(--card)">P</text>
      </g>
      <g transform={`translate(88,${lerp(-80, 32, su)}) scale(${su})`} filter="url(#k-shadow)">
        <polygon points="0,-26 25,-8 16,22 -16,22 -25,-8" fill="var(--sugar)" stroke="var(--brown)" strokeOpacity={0.4} />
        <polygon points="0,-26 25,-8 16,22 -16,22 -25,-8" fill="url(#k-gloss)" />
        <text y={4} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--foreground)">{t("sucre", "sugar")}</text>
        <text x={-34} y={-10} fontSize={10} fill="var(--muted-foreground)">5'</text>
        <text x={26} y={22} fontSize={10} fill="var(--muted-foreground)">3'</text>
        <text x={28} y={-10} fontSize={10} fill="var(--muted-foreground)">1'</text>
      </g>
      <g transform={`translate(${lerp(360, 200, ba)},32) scale(${ba})`} filter="url(#k-shadow)">
        <rect x={-40} y={-20} width={80} height={40} rx={12} fill="var(--base-a)" />
        <rect x={-36} y={-17} width={72} height={14} rx={7} fill="url(#k-gloss)" />
        <text y={6} textAnchor="middle" fontSize={17} fontWeight={700} fill="var(--foreground)">A</text>
      </g>
      <g opacity={eOut(win(p, 0.8, 1))}>
        <text x={0} y={-12} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--foreground)">phosphate</text>
        <text x={200} y={-6} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--foreground)">{t("base azotée", "nitrogenous base")}</text>
        <text x={100} y={95} textAnchor="middle" fontSize={13} fill="var(--foreground)">{t("= 1 nucléotide", "= 1 nucleotide")}</text>
      </g>
    </g>
  );
}

export function StructureScene(p: { seq: string[]; p0: number; p1: number; p2: number; p3: number; p4: number; step: number; started: boolean; done: boolean; t: T }) {
  const k = useClock();
  const { seq, p0, p1, p2, p3, p4, t } = p;
  const n = seq.length;
  const x0 = 70, span = 460, dx = span / Math.max(1, n - 1);
  const twist = eIO(p4);
  const spin = p4 > 0 ? k * 0.9 * twist : 0;
  const showNuc = !p.started || p.step === 0;

  const pts = seq.map((b, i) => {
    const th = i * 0.62 * twist + spin;
    const c = lerp(1, Math.cos(th), twist);
    const z = Math.sin(th) * twist; // depth -1..1
    const appearTop = eBack(win(p1 * (n + 2) - i, 0, 1.6));
    const appearBot = eBack(win(p2 * (n + 2) - i, 0, 1.6));
    const hb = eOut(win(p3 * (n + 2) - i, 0, 1.5));
    return { i, b, c: COMP[b] ?? "", x: x0 + i * dx, yT: CY - AMP * c, yB: CY + AMP * c, z, appearTop, appearBot, hb };
  });
  const order = [...pts].sort((a, b) => a.z - b.z);
  const nBonds = (b: string) => (b === "A" || b === "T" ? 2 : 3);

  const backbone = (key: "yT" | "yB", vis: "appearTop" | "appearBot") => {
    const shown = pts.filter((q) => q[vis] > 0.5);
    if (shown.length < 2) return "";
    return shown.map((q, j) => `${j ? "L" : "M"}${q.x},${q[key] + (1 - Math.min(1, q[vis])) * (key === "yT" ? -40 : 40)}`).join(" ");
  };

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("Structure de l'ADN", "DNA structure")}>
      <KitDefs />
      <Backdrop w={W} h={H} k={k} />
      {showNuc ? (
        <Nucleotide p={p.started ? p0 : 0.999} k={k} t={t} />
      ) : (
        <g>
          {p1 > 0 && <path d={backbone("yT", "appearTop")} stroke="var(--phosphate)" strokeWidth={5} fill="none" strokeLinejoin="round" opacity={0.9} />}
          {p2 > 0 && <path d={backbone("yB", "appearBot")} stroke="var(--phosphate)" strokeWidth={5} fill="none" strokeLinejoin="round" opacity={0.9} />}
          {order.map((q) => {
            const depth = 0.65 + 0.35 * ((q.z + 1) / 2);
            const mid = (q.yT + q.yB) / 2;
            const sTop = q.appearTop, sBot = q.appearBot;
            const lift = (1 - Math.min(1, sTop)) * -50;
            const drop = (1 - Math.min(1, sBot)) * 50;
            const gap = 3;
            const topLen = Math.max(0, Math.abs(mid - q.yT) - gap);
            const botLen = Math.max(0, Math.abs(q.yB - mid) - gap);
            const down = q.yB >= q.yT;
            const bw = 16 * depth;
            return (
              <g key={q.i} opacity={depth}>
                {sTop > 0.02 && (
                  <g transform={`translate(0,${lift})`} opacity={Math.min(1, sTop)}>
                    <rect x={q.x - bw / 2} y={down ? q.yT : mid + gap} width={bw} height={topLen} rx={4} fill={baseColors[q.b]} />
                    <rect x={q.x - bw / 2 + 2} y={down ? q.yT : mid + gap} width={bw / 3} height={topLen} rx={2} fill="white" opacity={0.25} />
                    <circle cx={q.x} cy={q.yT} r={8 * depth} fill="var(--sugar)" stroke="var(--brown)" strokeOpacity={0.35} />
                    {topLen > 18 && <text x={q.x} y={down ? q.yT + 22 : q.yT - 14} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--foreground)">{q.b}</text>}
                  </g>
                )}
                {sBot > 0.02 && (
                  <g transform={`translate(0,${drop})`} opacity={Math.min(1, sBot)}>
                    <rect x={q.x - bw / 2} y={down ? mid + gap : q.yB} width={bw} height={botLen} rx={4} fill={baseColors[q.c]} />
                    <rect x={q.x - bw / 2 + 2} y={down ? mid + gap : q.yB} width={bw / 3} height={botLen} rx={2} fill="white" opacity={0.25} />
                    <circle cx={q.x} cy={q.yB} r={8 * depth} fill="var(--sugar)" stroke="var(--brown)" strokeOpacity={0.35} />
                    {botLen > 18 && <text x={q.x} y={down ? q.yB - 14 : q.yB + 22} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--foreground)">{q.c}</text>}
                  </g>
                )}
                {q.hb > 0 && sBot > 0.9 && Math.abs(q.yB - q.yT) > 14 &&
                  Array.from({ length: nBonds(q.b) }, (_, j) => {
                    const off = (j - (nBonds(q.b) - 1) / 2) * 5;
                    return (
                      <g key={j}>
                        <line x1={q.x + off} x2={q.x + off} y1={mid - 4 * q.hb} y2={mid + 4 * q.hb} stroke="var(--bond-glow)" strokeWidth={4} opacity={0.5 * (1 - twist)} filter="url(#k-glow)" />
                        <line x1={q.x + off} x2={q.x + off} y1={mid - 4 * q.hb} y2={mid + 4 * q.hb} stroke="var(--ink)" strokeWidth={1.6} strokeDasharray="2 1.5" />
                      </g>
                    );
                  })}
              </g>
            );
          })}
          {/* nucleotides arriving from the pool (only while a strand is growing) */}
          {((p1 > 0 && p1 < 1) || (p2 > 0 && p2 < 1)) &&
            Array.from({ length: 6 }, (_, j) => {
              const a = k * 0.7 + j;
              return <circle key={j} cx={(j * 97 + k * 20) % W} cy={p2 > 0 ? 290 + Math.sin(a) * 10 : 40 + Math.sin(a) * 10} r={5} fill={baseColors["ATGC"[j % 4]!]} opacity={0.5} />;
            })}
          {p.step >= 1 && (
            <g fontSize={14} fontWeight={700} fill="var(--foreground)" opacity={1 - twist}>
              <text x={30} y={CY - AMP + 5}>5'</text>
              <text x={550} y={CY - AMP + 5}>3'</text>
              {p2 > 0 && <text x={30} y={CY + AMP + 5}>3'</text>}
              {p2 > 0 && <text x={550} y={CY + AMP + 5}>5'</text>}
            </g>
          )}
        </g>
      )}
      {p3 > 0.25 && p4 < 0.2 && <Pill x={300} y={26} o={eOut(win(p3, 0.25, 0.45))} text={t("Liaisons H : A=T (2) · G≡C (3)", "H bonds: A=T (2) · G≡C (3)")} />}
      {p.step >= 1 && p.step < 3 && <Pill x={300} y={26} text={t("Squelette sucre–phosphate", "Sugar–phosphate backbone")} />}
      {p4 > 0.5 && <Pill x={300} y={300} tone="accent" o={eOut(win(p4, 0.5, 0.75))} text={t("Double hélice : 2 brins antiparallèles", "Double helix: 2 antiparallel strands")} />}
      {!p.started && <Pill x={300} y={26} text={t("Appuie sur « Assembler »", "Press “Build”")} />}
      <Finish w={W} h={H} />
    </svg>
  );
}
