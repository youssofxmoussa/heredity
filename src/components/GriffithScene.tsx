import { Backdrop, Finish, KitDefs, Pill, eBack, eIO, eOut, lerp, useClock, win } from "./scene-kit";

type T = (fr: string, en: string) => string;

/** Streptococcus pneumoniae: a diplococcus; S strains wear a translucent polysaccharide capsule. */
function Diplo({ x, y, rot, type, dead, k, i }: { x: number; y: number; rot: number; type: "S" | "R"; dead?: boolean | undefined; k: number; i: number }) {
  const wob = dead ? 0 : Math.sin(k * 3 + i * 1.3) * 4;
  const fill = dead ? "var(--muted-foreground)" : type === "S" ? "var(--base-g)" : "var(--base-t)";
  return (
    <g transform={`translate(${x},${y}) rotate(${rot + wob})`} opacity={dead ? 0.55 : 1}>
      {type === "S" && !dead && <ellipse rx={20} ry={12} fill="var(--base-g)" opacity={0.22} stroke="var(--base-g)" strokeOpacity={0.5} strokeDasharray="2 2" />}
      {type === "S" && dead && <ellipse rx={20} ry={12} fill="none" stroke="var(--muted-foreground)" strokeOpacity={0.4} strokeDasharray="3 3" />}
      {[-6.5, 6.5].map((dx) => (
        <g key={dx}>
          <ellipse cx={dx} rx={7.5} ry={6.2} fill={fill} stroke="var(--ink)" strokeOpacity={0.35} />
          <ellipse cx={dx - 2} cy={-2} rx={3} ry={2} fill="url(#k-gloss)" />
        </g>
      ))}
      {dead && <path d="M-4,-3 l8,6 M4,-3 l-8,6" stroke="var(--ink)" strokeOpacity={0.5} strokeWidth={1.2} />}
    </g>
  );
}

/** Lab mouse rig: body, head, ear, tail, eye; health drives posture. */
function Mouse({ k, sick, dead }: { k: number; sick: number; dead: boolean }) {
  const breathe = dead ? 1 : 1 + Math.sin(k * (2.4 + sick * 3)) * (0.018 + sick * 0.02);
  const blink = !dead && (k % 3.3) < 0.12;
  const slump = dead ? 1 : sick * 0.6;
  const body = sick > 0 ? `color-mix(in oklab, var(--fur) ${100 - sick * 45}%, var(--muted-foreground))` : "var(--fur)";
  const tail = Math.sin(k * 1.6) * (dead ? 0 : 8 * (1 - sick));
  return (
    <g transform={`rotate(${dead ? 8 : slump * 4}) scale(1,${breathe})`} filter="url(#k-shadow)">
      <path d={`M-58,10 C-95,${12 + tail} -110,${-10 - tail} -120,${8 + tail}`} stroke="var(--rose-deep)" strokeWidth={4} fill="none" strokeLinecap="round" />
      <ellipse cx={-10} cy={0} rx={56} ry={34 - slump * 6} fill={body} />
      <ellipse cx={-14} cy={-12} rx={36} ry={12} fill="white" opacity={0.25} />
      <ellipse cx={-30} cy={32 - slump * 6} rx={10} ry={5} fill="var(--rose-deep)" />
      <ellipse cx={18} cy={32 - slump * 6} rx={10} ry={5} fill="var(--rose-deep)" />
      <g transform={`translate(44,${-8 + slump * 14}) rotate(${slump * 18})`}>
        <ellipse rx={30} ry={22} fill={body} />
        <ellipse cx={-10} cy={-22} rx={14} ry={15} fill={body} />
        <ellipse cx={-10} cy={-22} rx={8} ry={9} fill="var(--rose-deep)" opacity={0.75} />
        <circle cx={28} cy={4} r={5} fill="var(--rose-deep)" />
        {dead ? (
          <path d="M6,-8 l8,8 M14,-8 l-8,8" stroke="var(--ink)" strokeWidth={2.2} strokeLinecap="round" />
        ) : blink || sick > 0.75 ? (
          <path d="M5,-4 q5,3 10,0" stroke="var(--ink)" strokeWidth={2.2} fill="none" strokeLinecap="round" />
        ) : (
          <g>
            <circle cx={10} cy={-4} r={4.5} fill="var(--ink)" />
            <circle cx={11.5} cy={-5.5} r={1.4} fill="white" />
          </g>
        )}
        {[-4, 2, 8].map((dy) => (
          <path key={dy} d={`M26,${4 + dy / 3} q14,${dy - 4} 24,${dy}`} stroke="var(--ink)" strokeOpacity={0.4} strokeWidth={0.8} fill="none" />
        ))}
      </g>
    </g>
  );
}

export function GriffithScene(p: {
  k?: number;
  p1: number; p2: number; p3: number; p4: number;
  started: boolean;
  inj: string; enz: string; res: { meurt: boolean; sang: string };
  t: T;
}) {
  const clock = useClock();
  const k = p.k ?? clock;
  const { p1, p2, p3, p4, t, inj, enz, res } = p;
  const hasR = inj === "R" || inj === "R+Smort";
  const hasS = inj === "S";
  const hasDead = inj === "Smort" || inj === "R+Smort";
  const transformed = inj === "R+Smort" && res.meurt;

  // Syringe choreography (tip position + angle): dip into vial, draw up, travel, pierce the back, push, withdraw.
  const fill = eIO(win(p2, 0.12, 0.32)) * (1 - eIO(win(p2, 0.64, 0.9)));
  const dir = (40 * Math.PI) / 180;
  const into = { x: 452, y: 180 };
  const outside = { x: into.x - Math.cos(dir) * 44, y: into.y - Math.sin(dir) * 44 };
  const inside = eIO(win(p2, 0.55, 0.62)) * (1 - eIO(win(p2, 0.9, 0.97)));
  const tip = (() => {
    const down = eIO(win(p2, 0, 0.12)), lift = eIO(win(p2, 0.32, 0.4)), go = eIO(win(p2, 0.4, 0.55));
    const vx = 100, vy = lerp(105, 188, down) - lift * 85;
    const x = lerp(vx, outside.x, go) + (into.x - outside.x) * inside;
    const y = lerp(vy, outside.y, go) - Math.sin(go * Math.PI) * 40 + (into.y - outside.y) * inside;
    return { x, y, a: lerp(90, 40, go) };
  })();
  const sick = res.meurt ? eIO(p3) : 0;
  const dead = res.meurt && p3 > 0.85;
  const health = 100 - sick * 100;

  // Bacteria live in the vial; at injection they flow along the needle and vanish into the mouse.
  type B = { type: "S" | "R"; dead?: boolean };
  const pop: B[] = [
    ...(hasS ? Array.from({ length: 5 }, () => ({ type: "S" as const })) : []),
    ...(hasR ? Array.from({ length: 5 }, () => ({ type: "R" as const })) : []),
    ...(hasDead ? Array.from({ length: 4 }, () => ({ type: "S" as const, dead: true })) : []),
  ];
  const enzymeOn = inj === "R+Smort" && enz !== "aucun";
  const enzymeIn = eBack(win(p1, 0, 0.35));
  const chew = win(p1, 0.3, 1);
  const fragColor = enz === "dnase" ? "var(--old-strand)" : enz === "rnase" ? "var(--rna)" : "var(--protein)";

  return (
    <svg viewBox="0 0 600 320" className="w-full" role="img" aria-label={t("Expérience de Griffith", "Griffith experiment")}>
      <KitDefs />
      <Backdrop w={600} h={320} k={k} />
      {/* bench */}
      <rect y={262} width={600} height={58} fill="var(--bench)" />
      <rect y={262} width={600} height={3} fill="var(--ink)" opacity={0.08} />

      {/* Vial with the extract */}
      <g transform="translate(40,70)" opacity={1 - eOut(win(p2, 0.4, 0.8)) * 0.6}>
        <path d="M0,0 h120 v170 q0,22 -22,22 h-76 q-22,0 -22,-22 z" fill="var(--glass)" stroke="var(--ink)" strokeOpacity={0.3} strokeWidth={1.5} />
        <path d={`M2,${60} q30,${Math.sin(k * 2) * 4} 58,0 t58,0 v108 q0,20 -20,20 h-76 q-20,0 -20,-20 z`} fill="var(--medium)" opacity={0.75} />
        <rect x={4} y={4} width={16} height={180} rx={8} fill="url(#k-glass)" />
        <text x={60} y={-10} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--foreground)">{t("Mélange injecté", "Injected mixture")}</text>
        {pop.map((b, i) => {
          const gone = eIO(win(p2, 0.12 + (i % 5) * 0.03, 0.24 + (i % 5) * 0.03));
          const hx = 25 + ((i * 37) % 75) + Math.sin(k * 0.8 + i) * 6;
          const hy = 85 + ((i * 53) % 85) + Math.cos(k * 0.7 + i * 2) * 5;
          return gone < 1 ? (
            <g key={i} opacity={1 - gone * 0.9}>
              <Diplo x={lerp(hx, 60, gone)} y={lerp(hy, 116, gone)} rot={(i * 47) % 180} type={b.type} dead={b.dead} k={k} i={i} />
            </g>
          ) : null;
        })}
        {/* DNA fragments released by killed S, and the enzyme chewing them */}
        {hasDead && p2 < 0.6 && [0, 1, 2].map((i) => {
          const cut = enzymeOn ? chew : 0;
          const fx = 30 + i * 30 + Math.sin(k + i) * 5;
          const fy = 75 + i * 9 + Math.cos(k * 1.2 + i) * 4;
          const destroyed = enz === "dnase" ? cut : 0;
          return (
            <path key={i} d={`M${fx},${fy} q6,-8 12,0 t12,0 t12,0`} stroke="var(--old-strand)" strokeWidth={2.5} fill="none" strokeLinecap="round"
              opacity={(1 - destroyed) * 0.9} strokeDasharray={destroyed > 0 ? `${6 - destroyed * 5} ${destroyed * 6}` : undefined} />
          );
        })}
        {enzymeOn && p1 > 0 && p2 < 0.5 && [0, 1].map((i) => {
          const ex = 40 + i * 40 + Math.sin(k * 2 + i * 3) * 12;
          const ey = 80 + Math.cos(k * 1.7 + i) * 8;
          const mouth = 20 + Math.abs(Math.sin(k * 9 + i)) * 35 * chew;
          return (
            <g key={i} transform={`translate(${ex},${ey}) scale(${enzymeIn})`}>
              <path d={`M0,0 L${13 * Math.cos((mouth * Math.PI) / 360)},${-13 * Math.sin((mouth * Math.PI) / 360)} A13,13 0 1,0 ${13 * Math.cos((mouth * Math.PI) / 360)},${13 * Math.sin((mouth * Math.PI) / 360)} z`}
                fill="var(--enzyme)" stroke="var(--ink)" strokeOpacity={0.3} />
              {chew > 0.2 && <circle cx={18 + chew * 6} cy={-4} r={2} fill={fragColor} opacity={1 - chew} />}
            </g>
          );
        })}
      </g>
      {enzymeOn && p1 > 0.15 && p2 < 0.3 && (
        <Pill x={100} y={290} o={eOut(win(p1, 0.15, 0.4)) * (1 - win(p2, 0, 0.3))}
          text={({ protease: t("Protéines détruites", "Proteins destroyed"), rnase: t("ARN détruit", "RNA destroyed"), dnase: t("ADN détruit", "DNA destroyed") } as Record<string, string>)[enz]!} />
      )}

      {/* Syringe: drawn BEFORE the mouse so the needle tip disappears under the skin of its back. */}
      {p2 > 0 && p2 < 1 && (
        <g transform={`translate(${tip.x},${tip.y}) rotate(${tip.a})`} opacity={eOut(win(p2, 0, 0.06)) * (1 - win(p2, 0.95, 1))} filter="url(#k-shadow)">
          {/* needle + hub */}
          <path d="M-52,-1.6 L0,-0.3 L0,0.3 L-52,1.6 z" fill="var(--ink)" opacity={0.75} />
          <path d="M-52,-0.6 L-6,-0.2" stroke="white" strokeOpacity={0.6} strokeWidth={0.6} />
          <rect x={-62} y={-5} width={10} height={10} rx={2} fill="var(--brown)" opacity={0.85} />
          {/* barrel */}
          <rect x={-172} y={-13} width={110} height={26} rx={5} fill="var(--glass)" stroke="var(--ink)" strokeOpacity={0.4} />
          {/* liquid with suspended bacteria */}
          {fill > 0.01 && (
            <rect x={-64 - fill * 96} y={-10.5} width={fill * 96} height={21} rx={3} fill="var(--medium)" opacity={0.85} />
          )}
          {Array.from({ length: 5 }, (_, j) => {
            const shown = fill * 5 > j + 0.3;
            if (!shown) return null;
            const bx = -68 - ((j + 0.5) / 5) * fill * 92;
            const by = Math.sin(k * 3 + j * 2) * 4;
            const b = pop[j % Math.max(1, pop.length)];
            return (
              <g key={j} transform={`translate(${bx},${by}) scale(0.42)`}>
                <Diplo x={0} y={0} rot={j * 50} type={b?.type ?? "R"} dead={b?.dead} k={k} i={j} />
              </g>
            );
          })}
          {/* graduations */}
          {Array.from({ length: 9 }, (_, j) => (
            <line key={j} x1={-72 - j * 11} x2={-72 - j * 11} y1={-13} y2={j % 2 ? -9 : -6} stroke="var(--ink)" strokeOpacity={0.35} />
          ))}
          {/* plunger seal + rod + thumb rest */}
          <rect x={-70 - fill * 96} y={-11} width={7} height={22} rx={2} fill="var(--brown)" />
          <rect x={-170 - fill * 96} y={-3} width={100} height={6} fill="var(--brown)" opacity={0.9} />
          <rect x={-178 - fill * 96} y={-15} width={8} height={30} rx={3} fill="var(--brown)" />
          <rect x={-176} y={-19} width={5} height={38} rx={2} fill="var(--ink)" opacity={0.35} />
          <rect x={-168} y={-11} width={102} height={5} rx={2.5} fill="url(#k-glass)" />
        </g>
      )}
      {/* skin dimple at the injection point */}
      {inside > 0 && p2 < 0.97 && <ellipse cx={449} cy={169} rx={6 * inside} ry={2.2 * inside} fill="var(--rose-deep)" opacity={0.5} />}

      {/* Mouse */}
      <g transform={`translate(${470 + Math.sin(win(p2, 0.55, 0.68) * Math.PI * 3) * 3},${200 - Math.sin(win(p2, 0.55, 0.68) * Math.PI) * 4})`}>
        <ellipse cx={-10} cy={62} rx={95} ry={8} fill="var(--ink)" opacity={0.1} />
        <Mouse k={k} sick={sick} dead={dead} />
      </g>
      {/* Health bar */}
      <g transform="translate(395,40)">
        <text x={75} y={-8} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--foreground)">
          {t("Santé", "Health")} · {t("jour", "day")} {Math.round(p3 * 5)}/5
        </text>
        <rect width={150} height={12} rx={6} fill="var(--muted)" />
        <rect width={1.5 * health} height={12} rx={6} fill={health > 50 ? "var(--success)" : "var(--danger)"} />
        <rect width={1.5 * health} height={5} rx={3} fill="white" opacity={0.3} />
      </g>
      {p3 > 0 && p3 < 1 && (
        <g transform="translate(470,110)" opacity={0.8}>
          {[0, 1, 2].map((i) => (
            <text key={i} x={(i - 1) * 30} y={-((k * 12 + i * 10) % 30)} fontSize={12} textAnchor="middle" fill="var(--muted-foreground)" opacity={res.meurt ? 0.9 : 0}>~</text>
          ))}
        </g>
      )}

      {/* Blood culture: Petri dish zooms in */}
      {p4 > 0 && (
        <g transform={`translate(255,170) scale(${eBack(win(p4, 0, 0.4))})`}>
          <circle r={78} fill="var(--card)" stroke="var(--ink)" strokeOpacity={0.3} strokeWidth={2} filter="url(#k-shadow)" />
          <circle r={70} fill="var(--agar)" />
          <circle r={70} fill="url(#k-gloss)" opacity={0.5} />
          {res.sang !== "aucune" &&
            Array.from({ length: 11 }, (_, i) => {
              const a = i * 2.4;
              const rr = 18 + ((i * 23) % 44);
              const g = eBack(win(p4, 0.35 + i * 0.04, 0.6 + i * 0.04));
              return (
                <g key={i} transform={`translate(${Math.cos(a) * rr},${Math.sin(a) * rr}) scale(${g})`}>
                  <circle r={7} fill="var(--base-g)" opacity={0.9} />
                  <circle cx={-2} cy={-2} r={3} fill="white" opacity={0.55} />
                </g>
              );
            })}
          <text y={98} textAnchor="middle" fontSize={12} fontWeight={700} fill="var(--foreground)">{t("Culture du sang", "Blood culture")}</text>
        </g>
      )}
      {p4 > 0.55 && (
        <Pill x={255} y={36} tone="accent" o={eOut(win(p4, 0.55, 0.8))}
          text={
            res.sang === "aucune"
              ? inj === "R+Smort" ? t("Pas de S : l'ADN était détruit", "No S: DNA was destroyed") : t("Aucune bactérie S vivante", "No living S bacteria")
              : transformed ? t("S vivantes : R a été TRANSFORMÉE", "Living S: R was TRANSFORMED") : t("Bactéries S vivantes", "Living S bacteria")
          } />
      )}
      {!p.started && <Pill x={300} y={30} text={t("Choisis le mélange puis « Injecter »", "Pick the mixture, then “Inject”")} />}
      <Finish w={600} h={320} />
    </svg>
  );
}
