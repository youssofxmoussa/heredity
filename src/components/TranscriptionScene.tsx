import { baseColors } from "@/lib/sheets";
import { Backdrop, Finish, KitDefs, Pill, eBack, eIO, eOut, lerp, useClock, win } from "./scene-kit";

type T = (fr: string, en: string) => string;
const W = 600, H = 320, X0 = 120, SPAN = 440, YC = 150, YT = 186;

export function TranscriptionScene(p: { rna: string; coding: string[]; template: string[]; has: boolean; p0: number; p1: number; p2: number; p3: number; p4: number; started: boolean; t: T }) {
  const k = useClock();
  const { rna, coding, template, has, p0, p1, p2, p3, p4, t } = p;
  const n = rna.length;
  const w = SPAN / n;
  const bx = (i: number) => X0 + i * w + w / 2;

  // Polymerase: lands on promoter (with overshoot), then slides along the gene; without promoter it bounces off.
  const land = eBack(win(p0, 0, 0.8));
  const slide = eIO(p2);
  const leave = eIO(p3);
  let px = lerp(75, X0 + 10, eIO(p1)) + slide * (SPAN - 50);
  let py = lerp(40, 168, land) - leave * 150;
  let pr = (has ? 0 : Math.sin(k * 2) * 8) + leave * 25;
  if (!has) {
    const bounce = win(p0, 0.5, 1);
    px = 190 + (p1 + p2) * 120 + Math.sin(k) * 10;
    py = lerp(40, 120, eOut(win(p0, 0, 0.5))) - eOut(bounce) * 40 - (p1 + p2 + p3) * 30 + Math.sin(k * 1.4) * 6;
    pr = Math.sin(k * 1.8) * 15;
  }
  const active = has && p1 > 0.3 && p3 < 0.6;
  const openAt = (x: number) => (active ? Math.exp(-Math.pow((x - px) / 46, 4)) * eOut(win(p1, 0.3, 1)) * (1 - win(p3, 0, 0.6)) : 0);
  const made = has ? Math.min(n, Math.floor(slide * (n + 0.999))) : 0;
  const release = eIO(p4);

  // RNA bead positions: paired with template inside the bubble, then peeling off up and behind the polymerase.
  const bead = (i: number) => {
    if (p3 > 0) {
      const s = i * w;
      const ox = 150 + s * 0.92, oy = 92 - release * 40 + Math.sin(i * 0.6 + k * 1.5) * (6 + release * 6);
      const tx = bx(i), ty = YT - 22;
      const free = eIO(p3);
      return { x: lerp(tx, ox, free), y: lerp(ty, oy, free) };
    }
    const d = px + (40 * slide) - bx(i);
    if (d < 40) return { x: bx(i), y: YT - 22 };
    const s = d - 40;
    return { x: px - 40 - s * 0.6, y: 118 - 52 * (1 - Math.exp(-s / 90)) + Math.sin(s * 0.05 + k * 2) * 6 };
  };
  const beads = Array.from({ length: made }, (_, i) => ({ i, ...bead(i) }));

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("Transcription", "Transcription")}>
      <KitDefs />
      <Backdrop w={W} h={H} k={k} />
      {/* promoter */}
      <g opacity={has ? 1 : 0.5}>
        <rect x={40} y={YC - 22} width={74} height={YT - YC + 44} rx={10} fill={has ? "var(--danger)" : "var(--muted)"} opacity={0.18} strokeDasharray={has ? undefined : "4 4"} stroke={has ? "none" : "var(--muted-foreground)"} />
        <text x={77} y={YC - 28} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--foreground)">{has ? t("promoteur", "promoter") : t("pas de promoteur", "no promoter")}</text>
        {has && <text x={77} y={(YC + YT) / 2 + 4} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--danger)">TATA</text>}
      </g>

      {/* polymerase back lobe */}
      {p.started && (
        <g transform={`translate(${px},${py}) rotate(${pr})`} opacity={1 - win(p3, 0.6, 1)}>
          <ellipse rx={50} ry={46} fill="var(--enzyme)" opacity={0.55} filter="url(#k-shadow)" />
        </g>
      )}

      {/* DNA backbones */}
      {[0, 1].map((s) => {
        let d = `M40,${s ? YT + 9 : YC - 9}`;
        for (let x = 40; x <= 570; x += 5) d += ` L${x},${(s ? YT + 9 : YC - 9) + (s ? 1 : -1) * openAt(x) * 26}`;
        return <path key={s} d={d} stroke="var(--old-strand)" strokeWidth={5} fill="none" strokeLinecap="round" />;
      })}
      {coding.map((b, i) => {
        const x = bx(i), o = openAt(x) * 26, tb = template[i] ?? "";
        return (
          <g key={i}>
            <rect x={x - w / 2 + 1} y={YC - 9 - o} width={w - 2} height={17} rx={4} fill={baseColors[b]} />
            <text x={x} y={YC + 4 - o} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--foreground)">{b}</text>
            <rect x={x - w / 2 + 1} y={YT - 8 + o} width={w - 2} height={17} rx={4} fill={baseColors[tb]} />
            <text x={x} y={YT + 5 + o} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--foreground)">{tb}</text>
            {o < 4 && <line x1={x} x2={x} y1={YC + 8} y2={YT - 8} stroke="var(--ink)" strokeOpacity={0.35} strokeWidth={1.5} strokeDasharray="2 2" />}
          </g>
        );
      })}

      {/* free NTPs streaming into the active site */}
      {has && p2 > 0 && p2 < 1 &&
        Array.from({ length: 6 }, (_, j) => {
          const c = ((k * 0.8 + j / 6) % 1);
          const x = lerp(px + 90 - j * 8, px + 6, eIO(c));
          const y = lerp(270 - j * 6, YT - 22, eIO(c));
          return <circle key={j} cx={x} cy={y} r={5} fill={baseColors["AUGC"[j % 4]!]} opacity={0.75 * (1 - c * 0.6)} />;
        })}

      {/* mRNA */}
      {beads.length > 1 && (
        <path d={beads.map((b, j) => `${j ? "L" : "M"}${b.x},${b.y}`).join(" ")} stroke="var(--rna)" strokeWidth={4} fill="none" strokeLinejoin="round" />
      )}
      {beads.map((b) => (
        <g key={b.i} transform={`translate(${b.x},${b.y}) scale(${b.i === made - 1 && p3 === 0 ? eBack(slide * (n + 0.999) - (made - 1)) : 1})`}>
          <circle r={Math.min(9, w / 2 - 1)} fill={baseColors[rna[b.i] ?? ""]} stroke="var(--rna)" strokeWidth={1.5} />
          <text y={3.5} textAnchor="middle" fontSize={9} fontWeight={700} fill="var(--foreground)">{rna[b.i]}</text>
        </g>
      ))}
      {beads.length > 0 && (() => {
        const f = beads[0]!, l = beads[beads.length - 1]!;
        return (
          <g fontSize={12} fontWeight={700} fill="var(--rna)">
            <text x={f.x - 22} y={f.y + 4}>5'</text>
            {p3 > 0 && <text x={l.x + 12} y={l.y + 4}>3'</text>}
          </g>
        );
      })()}

      {/* polymerase front lobe (DNA runs through it) */}
      {p.started && (
        <g transform={`translate(${px},${py}) rotate(${pr})`} opacity={1 - win(p3, 0.6, 1)}>
          <path d="M-46,-14 C-46,-50 46,-50 46,-14 L46,-6 C30,-16 -30,-16 -46,-6 z" fill="var(--enzyme)" opacity={0.85} />
          <path d="M-46,30 C-40,52 40,52 46,30 L46,22 C30,32 -30,32 -46,22 z" fill="var(--enzyme)" opacity={0.7} />
          <ellipse cx={-12} cy={-34} rx={20} ry={6} fill="url(#k-gloss)" />
          <text y={-24} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--foreground)">{t("ARN pol.", "RNA pol.")}</text>
        </g>
      )}

      <g fontSize={12} fontWeight={700} fill="var(--foreground)">
        <text x={14} y={YC + 4}>5'</text>
        <text x={14} y={YT + 5}>3'</text>
        <text x={575} y={YC + 4}>3'</text>
        <text x={575} y={YT + 5}>5'</text>
      </g>
      <g fontSize={9} fill="var(--muted-foreground)">
        <text x={120} y={YC - 14 - 26 * 0}>{t("brin codant", "coding strand")}</text>
        <text x={120} y={YT + 24}>{t("brin matrice (lu 3'→5')", "template strand (read 3'→5')")}</text>
      </g>

      {p4 > 0.3 && has && <Pill x={300} y={290} tone="accent" o={eOut(win(p4, 0.3, 0.6))} text={t("ARNm libéré : simple brin, U à la place de T", "mRNA released: single strand, U instead of T")} />}
      {!has && p.started && p0 > 0.5 && <Pill x={300} y={280} tone="accent" text={t("Pas de promoteur : l'ARN polymérase ne se fixe pas", "No promoter: RNA polymerase can't bind")} />}
      {!p.started && <Pill x={300} y={30} text={t("Appuie sur « Transcrire »", "Press “Transcribe”")} />}
      <Finish w={W} h={H} />
    </svg>
  );
}
