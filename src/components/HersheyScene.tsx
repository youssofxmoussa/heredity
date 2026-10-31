import { Backdrop, Finish, KitDefs, Pill, eBack, eIO, eOut, lerp, useClock, win } from "./scene-kit";

type T = (fr: string, en: string) => string;

/** T2 phage rig: icosahedral head (faceted), collar, contractile sheath, baseplate, 6 tail fibres. */
function Phage({ x, y, k, i, hotProt, hotDna, dnaLeft, contract, splay, glow }: {
  x: number; y: number; k: number; i: number; hotProt: boolean; hotDna: boolean;
  dnaLeft: number; contract: number; splay: number; glow: number;
}) {
  const sheath = lerp(30, 16, contract);
  const head = hotProt ? "var(--radio)" : "var(--capsid)";
  const legs = [-1, 1].flatMap((s) => [0.5, 1].map((f) => ({ s, f })));
  return (
    <g transform={`translate(${x},${y})`}>
      {hotProt && <circle cy={-10} r={34} fill="var(--radio)" opacity={0.25 + Math.sin(k * 5 + i) * 0.1 * glow} filter="url(#k-glow)" />}
      <g filter="url(#k-shadow)">
        <polygon points="0,-44 19,-33 19,-11 0,0 -19,-11 -19,-33" fill={head} stroke="var(--ink)" strokeOpacity={0.45} strokeWidth={1.2} />
        <polygon points="0,-44 19,-33 0,-22 -19,-33" fill="white" opacity={0.28} />
        <path d="M0,-22 V0 M-19,-11 L0,-22 L19,-11" stroke="var(--ink)" strokeOpacity={0.2} fill="none" />
        {dnaLeft > 0.02 && (
          <path d={`M-8,${-30 + (1 - dnaLeft) * 18} q8,6 0,8 q-8,4 4,${8 * dnaLeft}`} stroke={hotDna ? "var(--hot-dna)" : "var(--old-strand)"} strokeWidth={2.4} fill="none" />
        )}
        <rect x={-6} y={0} width={12} height={4} rx={2} fill="var(--brown)" />
        <g>
          {Array.from({ length: 6 }, (_, r) => (
            <rect key={r} x={-5 - contract * 2} y={4 + (r * sheath) / 6} width={10 + contract * 4} height={sheath / 6 - 0.6} rx={1.5} fill={hotProt ? "var(--radio)" : "var(--capsid-deep)"} />
          ))}
          <rect x={-1.5} y={4} width={3} height={30} fill="var(--brown)" opacity={0.6} />
        </g>
        <rect x={-11} y={4 + sheath} width={22} height={4} rx={2} fill="var(--brown)" />
        {legs.map(({ s, f }, j) => {
          const by = 6 + sheath;
          const kx = s * lerp(12, 22, splay) * f + Math.sin(k * 2 + i + j) * (1 - splay) * 2;
          const ky = by + lerp(10, 4, splay);
          const fx = s * lerp(16, 30, splay) * f;
          const fy = by + lerp(22, 18 + 0, splay);
          return <path key={j} d={`M${s * 8},${by} L${kx},${ky} L${fx},${fy}`} stroke="var(--brown)" strokeWidth={1.8} fill="none" strokeLinecap="round" strokeLinejoin="round" />;
        })}
      </g>
    </g>
  );
}

/** E. coli rod: envelope (outer + inner membrane), cytoplasm texture, nucleoid. */
function Coli({ k, flow, hotDna, dnaIn }: { k: number; flow: number; hotDna: boolean; dnaIn: number }) {
  return (
    <g filter="url(#k-shadow)">
      {[0, 1, 2, 3].map((j) => (
        <path key={j} d={`M${-150 - j * 4},${-10 + j * 8} q-22,${Math.sin(k * 4 + j) * 12} -48,${Math.sin(k * 4 + j + 1) * 10}`} stroke="var(--coli-deep)" strokeWidth={1.4} fill="none" opacity={0.6} />
      ))}
      <rect x={-160} y={-45} width={320} height={90} rx={45} fill="var(--coli-deep)" />
      <rect x={-155} y={-40} width={310} height={80} rx={40} fill="var(--coli)" />
      <rect x={-140} y={-34} width={240} height={14} rx={7} fill="white" opacity={0.25} />
      {Array.from({ length: 26 }, (_, j) => (
        <circle key={j} cx={-130 + ((j * 53) % 260)} cy={-25 + ((j * 29) % 50)} r={1.6} fill="var(--coli-deep)" opacity={0.45} />
      ))}
      <path d={`M-70,8 q20,-18 40,0 t40,0 t40,0 q-10,14 -40,8`} stroke="var(--old-strand)" strokeWidth={2} fill="none" opacity={0.55} />
      {dnaIn > 0 && [0, 1, 2].map((j) => {
        const cx = -80 + j * 80;
        const L = 70 * dnaIn;
        return (
          <path key={j} d={`M${cx},-40 q${12 + Math.sin(k * 3 + j) * 4},14 0,24 q-14,10 4,18 q16,8 -6,14`}
            stroke={hotDna ? "var(--hot-dna)" : "var(--old-strand)"} strokeWidth={2.6} fill="none" strokeLinecap="round"
            strokeDasharray={`${L} 200`} opacity={0.95} filter={hotDna && flow > 0 ? undefined : undefined} />
        );
      })}
    </g>
  );
}

export function HersheyScene(p: {
  p1: number; p2: number; p3: number; p4: number; started: boolean;
  iso: string; res: { culot: number; surnageant: number; descendance: boolean }; t: T;
}) {
  const k = useClock();
  const { p1, p2, p3, p4, t, iso, res } = p;
  const hotProt = iso === "35S";
  const hotDna = iso === "32P";
  const xs = [-80, 0, 80];

  // Act 1: phages descend (staggered, with overshoot settle) and attach.
  const land = (i: number) => eBack(win(p1, i * 0.1, 0.75 + i * 0.08), 1.2);
  // Act 2: sheath contracts (snap), DNA flows in.
  const contract = eOut(win(p2, 0, 0.12));
  const flow = eIO(win(p2, 0.12, 0.9));
  // Act 3: blender (shake + ghosts fly off) then the tube.
  const blend = win(p3, 0, 0.45);
  const shake = blend > 0 && blend < 1 ? Math.sin(k * 60) * 3 * Math.sin(blend * Math.PI) : 0;
  const tubeIn = eOut(win(p3, 0.45, 0.7));
  const settle = eIO(win(p3, 0.6, 1));
  const glow = p4;

  return (
    <svg viewBox="0 0 600 320" className="w-full" role="img" aria-label={t("Expérience de Hershey et Chase", "Hershey–Chase experiment")}>
      <KitDefs />
      <Backdrop w={600} h={320} k={k} />

      {tubeIn < 1 && (
        <g opacity={1 - tubeIn} transform={`translate(${300 + shake},220)`}>
          <Coli k={k} flow={flow} hotDna={hotDna} dnaIn={flow} />
          {xs.map((x, i) => {
            const l = land(i);
            const fly = eIO(win(blend, i * 0.1, 0.7 + i * 0.1));
            const py = lerp(-250, -90, l) - fly * 140;
            const px = x + Math.sin(k * 1.4 + i * 2) * 6 * (1 - l) + fly * (i - 1) * 120;
            return (
              <g key={i} transform={`rotate(${fly * (i - 1) * 40}, ${px}, ${py})`}>
                <Phage x={px} y={py} k={k} i={i} hotProt={hotProt} hotDna={hotDna} dnaLeft={1 - flow} contract={contract} splay={eOut(win(p1, 0.6 + i * 0.08, 1))} glow={1} />
              </g>
            );
          })}
          {/* DNA stream through the tail into the cell */}
          {flow > 0 && flow < 1 && xs.map((x, i) => (
            <circle key={i} cx={x} cy={-46 + ((k * 40 + i * 9) % 12)} r={2.2} fill={hotDna ? "var(--hot-dna)" : "var(--old-strand)"} />
          ))}
          {p2 > 0.2 && blend === 0 && <Pill x={0} y={72} o={eOut(win(p2, 0.2, 0.4))} text={t("Seul l'ADN entre dans la bactérie", "Only DNA enters the bacterium")} />}
          {blend > 0 && <Pill x={0} y={72} o={Math.sin(blend * Math.PI)} text={t("Agitation : les capsides vides se détachent", "Blending: empty capsids detach")} />}
          {p1 > 0 && p1 < 1 && <Pill x={175} y={-170} text={t("Phages T2", "T2 phages")} o={eOut(win(p1, 0, 0.2))} />}
        </g>
      )}

      {tubeIn > 0 && (
        <g opacity={tubeIn}>
          <g transform={`translate(300,${lerp(340, 22, tubeIn)})`} filter="url(#k-shadow)">
            <path d="M-60,0 h120 v210 q0,48 -60,58 q-60,-10 -60,-58 z" fill="var(--glass)" stroke="var(--ink)" strokeOpacity={0.35} strokeWidth={1.6} />
            <path d="M-57,30 h114 v180 q0,44 -57,54 q-57,-10 -57,-54 z" fill={res.surnageant > 50 ? "var(--radio)" : "var(--medium)"} opacity={0.25 + (res.surnageant / 100) * 0.55 * glow} />
            {Array.from({ length: 14 }, (_, j) => {
              const gx = -45 + ((j * 31) % 90);
              const gy = 50 + ((j * 47) % 140) + Math.sin(k + j) * 4;
              return <polygon key={j} transform={`translate(${gx},${gy}) scale(0.45) rotate(${j * 40 + k * 10})`} points="0,-20 17,-10 17,10 0,20 -17,10 -17,-10" fill={hotProt ? "var(--radio)" : "var(--capsid)"} stroke="var(--ink)" strokeOpacity={0.3} />;
            })}
            {Array.from({ length: 16 }, (_, j) => {
              const sx = -40 + ((j * 23) % 80);
              const sy0 = 60 + ((j * 37) % 150);
              const sy = lerp(sy0, 236 + (j % 3) * 6 - Math.abs(sx) * 0.2, settle);
              return <rect key={j} x={sx - 7} y={sy - 3} width={14} height={6} rx={3} fill={hotDna ? "var(--hot-dna)" : "var(--coli-deep)"} opacity={0.85} />;
            })}
            {hotDna && glow > 0 && <ellipse cy={242} rx={44} ry={16} fill="var(--hot-dna)" opacity={0.25 + Math.sin(k * 4) * 0.08} filter="url(#k-glow)" />}
            {hotProt && glow > 0 && <rect x={-55} y={40} width={110} height={150} rx={20} fill="var(--radio)" opacity={(0.18 + Math.sin(k * 4) * 0.06) * glow} filter="url(#k-glow)" />}
            <rect x={-54} y={4} width={14} height={240} rx={7} fill="url(#k-glass)" />
          </g>
          <Pill x={460} y={110} o={eOut(win(p3, 0.75, 1))} text={t("Surnageant : capsides vides", "Supernatant: empty capsids")} />
          <Pill x={460} y={262} o={eOut(win(p3, 0.85, 1))} text={t("Culot : bactéries", "Pellet: bacteria")} />
          {p4 > 0 && (
            <g transform="translate(110,150)">
              {[{ l: t("Culot", "Pellet"), v: res.culot, c: "var(--hot-dna)" }, { l: t("Surnageant", "Supernatant"), v: res.surnageant, c: "var(--radio)" }].map((b, j) => (
                <g key={j} transform={`translate(${j * 60 - 30},0)`}>
                  <rect x={-14} y={-90} width={28} height={110} rx={8} fill="var(--muted)" />
                  <rect x={-14} y={20 - 1.1 * b.v * eOut(p4)} width={28} height={1.1 * b.v * eOut(p4)} rx={8} fill={b.c} />
                  <text y={38} textAnchor="middle" fontSize={11} fontWeight={700} fill="var(--foreground)">{b.l}</text>
                  <text y={-96} textAnchor="middle" fontSize={11} fill="var(--foreground)">{Math.round(b.v * eOut(p4))}%</text>
                </g>
              ))}
            </g>
          )}
          {p4 > 0.6 && (
            <Pill x={300} y={304} tone="accent" o={eOut(win(p4, 0.6, 0.85))}
              text={t("Nouveaux phages : ", "New phages: ") + (res.descendance ? t("radioactifs", "radioactive") : t("non radioactifs", "not radioactive"))} />
          )}
        </g>
      )}
      {!p.started && <Pill x={300} y={30} text={t("Choisis l'isotope puis « Infecter »", "Pick the isotope, then “Infect”")} />}
      <Finish w={600} h={320} />
    </svg>
  );
}
