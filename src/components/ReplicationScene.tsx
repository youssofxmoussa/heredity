import { Backdrop, Finish, KitDefs, Pill, eBack, eIO, eOut, lerp, useClock, win } from "./scene-kit";

type T = (fr: string, en: string) => string;
const W = 600, H = 320, L = 40, R = 560, CY = 165;
const yA = 105, yB = 225, GAP = 24;

function Polymerase({ x, y, flip, k }: { x: number; y: number; flip?: boolean; k: number }) {
  const s = 1 + Math.sin(k * 6) * 0.04;
  return (
    <g transform={`translate(${x},${y}) scale(${flip ? -s : s},${s})`} filter="url(#k-shadow)">
      <path d="M-18,-16 C-4,-26 18,-20 20,-4 C22,10 12,20 -2,18 C-12,16 -10,6 -4,2 C2,-2 -2,-8 -10,-6 C-18,-4 -26,-8 -18,-16 z" fill="var(--enzyme)" stroke="var(--ink)" strokeOpacity={0.3} />
      <ellipse cx={4} cy={-10} rx={9} ry={4} fill="url(#k-gloss)" />
    </g>
  );
}

export function ReplicationScene(p: { p0: number; p1: number; p2: number; p3: number; p4: number; frags: [number, number][]; started: boolean; t: T }) {
  const k = useClock();
  const { p0, p1, p2, p3, p4, frags, t } = p;
  const fork = lerp(L - 10, R + 30, eIO(p0));
  const split = eIO(p4);
  const dTop = -split * 22, dBot = split * 22;
  const sep = (x: number) => (x < fork ? 1 : Math.exp(-(x - fork) / 22));
  const wave = (x: number) => Math.sin(x * 0.07 - k * 1.2) * 18;
  const topY = (x: number) => lerp(CY + wave(x), yA, sep(x));
  const botY = (x: number) => lerp(CY - wave(x), yB, sep(x));
  const path = (f: (x: number) => number, dy: number) => {
    let d = "";
    for (let x = L; x <= R; x += 6) d += `${x === L ? "M" : "L"}${x},${f(x) + dy}`;
    return d;
  };
  const xs = Array.from({ length: Math.floor((R - L) / 14) + 1 }, (_, i) => L + i * 14);
  const lead = L + 4 + 516 * eIO(p2);
  const nf = frags.length;
  const fragProg = (i: number) => eIO(win(p2, (i / nf) * 0.6, (i / nf) * 0.6 + 0.4));
  const primerOn = (i: number) => eBack(win(p1, i / (nf + 1), i / (nf + 1) + 0.25));
  const replaced = eOut(win(p3, 0.1, 0.5));
  const nts = (p2 > 0 && p2 < 1) || (p1 > 0 && p1 < 1);

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full" role="img" aria-label={t("Fourche de réplication", "Replication fork")}>
      <KitDefs />
      <Backdrop w={W} h={H} k={k} />

      {/* base-pair rungs: duplex ahead of the fork, half-rungs on separated templates */}
      {xs.map((x) => {
        const s = sep(x), a = topY(x), b = botY(x);
        if (s < 0.5) return <line key={x} x1={x} x2={x} y1={a} y2={b} stroke="var(--ink)" strokeOpacity={0.28} strokeWidth={3} strokeLinecap="round" />;
        return (
          <g key={x} stroke="var(--ink)" strokeOpacity={0.25} strokeWidth={3} strokeLinecap="round">
            <line x1={x} x2={x} y1={a + dTop} y2={a + dTop + 9} />
            <line x1={x} x2={x} y1={b + dBot} y2={b + dBot - 9} />
          </g>
        );
      })}

      {/* parental strands */}
      <path d={path(topY, dTop)} stroke="var(--old-strand)" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={path(botY, dBot)} stroke="var(--old-strand)" strokeWidth={6} fill="none" strokeLinecap="round" />
      <path d={path(topY, dTop - 1.5)} stroke="white" strokeOpacity={0.25} strokeWidth={1.5} fill="none" />

      {/* leading strand (continuous, towards the fork) */}
      {p1 > 0 && (
        <g transform={`translate(0,${dTop})`}>
          {p2 > 0 && <line x1={L + 4} x2={lead} y1={yA + GAP} y2={yA + GAP} stroke="var(--new-strand)" strokeWidth={6} strokeLinecap="round" />}
          {p2 > 0 && xs.filter((x) => x < lead).map((x) => <line key={x} x1={x} x2={x} y1={yA + 9} y2={yA + GAP} stroke="var(--new-strand)" strokeOpacity={0.5} strokeWidth={3} />)}
          <rect x={L} y={yA + GAP - 4} width={20} height={8} rx={4} fill={replaced > 0.5 ? "var(--new-strand)" : "var(--rna)"} transform={`scale(1,1)`} opacity={primerOn(0)} />
          {p2 > 0 && p2 < 1 && <g opacity={1 - win(p2, 0.9, 1)}><Polymerase x={Math.min(lead, R - 22)} y={yA + GAP} k={k} /></g>}
          <text x={R - 4} y={yA + GAP + 22} textAnchor="end" fontSize={11} fontWeight={700} fill="var(--foreground)" opacity={eOut(p2)}>{t("brin précoce (continu) →", "leading strand (continuous) →")}</text>
        </g>
      )}

      {/* lagging strand: primers then Okazaki fragments, synthesised away from the fork */}
      {p1 > 0 && (
        <g transform={`translate(0,${dBot})`}>
          {frags.map(([a, b], i) => {
            const pr = primerOn(i + 1), fp = fragProg(i);
            const start = b - 16;
            const end = lerp(start, a + 2, fp);
            const joined = i > 0 && eBack(win(p3, 0.45 + (i / nf) * 0.4, 0.6 + (i / nf) * 0.4));
            return (
              <g key={i}>
                {p2 > 0 && fp > 0 && <line x1={end} x2={start} y1={yB - GAP} y2={yB - GAP} stroke="var(--new-strand)" strokeWidth={6} strokeLinecap="round" />}
                {fp > 0 && xs.filter((x) => x > end && x < b).map((x) => <line key={x} x1={x} x2={x} y1={yB - 9} y2={yB - GAP} stroke="var(--new-strand)" strokeOpacity={0.5} strokeWidth={3} />)}
                <rect x={b - 16} y={yB - GAP - 4} width={14} height={8} rx={4} fill={replaced > 0.5 ? "var(--new-strand)" : "var(--rna)"} opacity={Math.min(1, pr)} />
                {p1 < 1 && pr > 0 && pr < 1 && <circle cx={b - 9} cy={yB - GAP - 14} r={8 * pr} fill="var(--protein)" opacity={0.85} />}
                {fp > 0 && fp < 1 && <Polymerase x={end} y={yB - GAP} flip k={k + i} />}
                {joined ? (
                  <g transform={`translate(${a},${yB - GAP}) scale(${joined})`}>
                    <circle r={10} fill="var(--bond-glow)" opacity={0.6 * (1 - win(p3, 0.9, 1))} filter="url(#k-glow)" />
                    <circle r={4} fill="var(--gold)" />
                  </g>
                ) : null}
              </g>
            );
          })}
          <text x={R - 4} y={yB - GAP - 14} textAnchor="end" fontSize={11} fontWeight={700} fill="var(--foreground)" opacity={eOut(p2)}>{t("← fragments d'Okazaki", "← Okazaki fragments")}</text>
        </g>
      )}

      {/* helicase hexamer ring at the fork */}
      {p0 > 0 && p0 < 1 && (
        <g transform={`translate(${Math.min(fork + 6, R - 10)},${CY}) scale(${1 - 0.4 * win(p0, 0.8, 1)})`} opacity={1 - win(p0, 0.82, 1)} filter="url(#k-shadow)">
          {Array.from({ length: 6 }, (_, i) => {
            const a = (i / 6) * Math.PI * 2 + k * 4;
            return <circle key={i} cx={Math.cos(a) * 15} cy={Math.sin(a) * 15} r={8} fill="var(--enzyme)" stroke="var(--ink)" strokeOpacity={0.25} />;
          })}
          <text y={-32} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--foreground)">{t("hélicase", "helicase")}</text>
        </g>
      )}

      {/* free nucleotides diffusing in */}
      {nts && Array.from({ length: 10 }, (_, i) => {
        const x = (i * 61 + k * 25) % W;
        const y = CY + Math.sin(k * 1.3 + i * 2) * 20 + (i % 2 ? 0 : 6);
        return <circle key={i} cx={x} cy={y} r={3.5} fill={["var(--base-a)", "var(--base-t)", "var(--base-g)", "var(--base-c)"][i % 4]} opacity={0.6} />;
      })}

      <g fontSize={13} fontWeight={700} fill="var(--foreground)">
        <text x={14} y={yA + dTop + 5}>3'</text>
        <text x={14} y={yB + dBot + 5}>5'</text>
      </g>
      {p1 > 0 && p1 < 1 && <Pill x={300} y={24} text={t("Primase : amorces d'ARN", "Primase: RNA primers")} />}
      {p2 > 0 && p2 < 1 && <Pill x={300} y={24} text={t("ADN polymérase : 5' → 3'", "DNA polymerase: 5' → 3'")} />}
      {p3 > 0 && p3 < 1 && <Pill x={300} y={24} text={replaced < 1 || p3 < 0.45 ? t("Amorces remplacées par de l'ADN", "Primers replaced by DNA") : t("Ligase : relie les fragments", "Ligase: joins the fragments")} />}
      {p4 > 0.4 && <Pill x={300} y={CY} tone="accent" o={eOut(win(p4, 0.4, 0.7))} text={t("2 molécules = 1 brin ancien + 1 brin neuf", "2 molecules = 1 old + 1 new strand")} />}
      {!p.started && <Pill x={300} y={24} text={t("Appuie sur « Répliquer »", "Press “Replicate”")} />}
      <Finish w={W} h={H} />
    </svg>
  );
}
