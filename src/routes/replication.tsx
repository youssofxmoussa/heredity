import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { pageMeta } from "@/lib/sheets";
import { meselson, phase, useSim } from "@/lib/genetics";
import { Choice, SheetLayout, Slider } from "@/components/SheetLayout";

export const Route = createFileRoute("/replication")({
  head: () => ({ meta: pageMeta("Réplication de l'ADN — Génétique ch.1", "Hélicase, primase, ADN polymérase, fragments d'Okazaki et expérience de Meselson–Stahl.") }),
  component: Page,
});

const L = 40, R = 560;

function Page() {
  const t = useT();
  const steps = [
    { titre: t("Ouverture (hélicase)", "Unwinding (helicase)"), texte: t("L'hélicase déroule la double hélice : fourche de réplication.", "Helicase unwinds the double helix: replication fork.") },
    { titre: t("Amorces ARN (primase)", "RNA primers (primase)"), texte: t("La primase pose de courtes amorces d'ARN.", "Primase lays down short RNA primers.") },
    { titre: t("Élongation (ADN polymérase)", "Elongation (DNA polymerase)"), texte: t("Synthèse 5'→3' : continue sur le brin précoce, en fragments d'Okazaki sur le brin retardé.", "5'→3' synthesis: continuous on the leading strand, in Okazaki fragments on the lagging strand.") },
    { titre: t("Remplacement & ligase", "Replacement & ligase"), texte: t("Les amorces sont remplacées par de l'ADN ; la ligase relie les fragments.", "Primers are replaced by DNA; ligase joins the fragments.") },
    { titre: t("Deux molécules filles", "Two daughter molecules"), texte: t("Chacune garde un brin ancien + un brin neuf : semi-conservative.", "Each keeps one old strand + one new strand: semi-conservative.") },
  ];
  const sim = useSim(steps.length);
  const [model, setModel] = useState("semi");
  const [gen, setGen] = useState(1);
  const [size, setSize] = useState("court");
  const p0 = phase(sim, 0), p1 = phase(sim, 1), p2 = phase(sim, 2), p3 = phase(sim, 3), p4 = phase(sim, 4);
  const fl = size === "court" ? 65 : 130;
  const fork = L + p0 * 520;
  const frags: [number, number][] = [];
  for (let x = L; x < R; x += fl) frags.push([x, Math.min(x + fl, R)]);
  const k = 1 + p4 * 0.6;
  const yA = 160 - 80 * k, yL = 160 - 50 * k, yG = 160 + 50 * k, yB = 160 + 80 * k;
  const added = Math.round((p2 * 520 * 2) / 4);
  const g = sim.done || p4 > 0 ? gen : 0;
  const tube = meselson(model, g);

  return (
    <SheetLayout
      num={4}
      sim={sim}
      steps={steps}
      startLabel={t("Répliquer", "Replicate")}
      intro={[
        t("Avant de se diviser, une cellule doit copier tout son ADN : c'est la réplication.", "Before dividing, a cell must copy all its DNA: this is replication."),
        t("Plusieurs enzymes travaillent ensemble au niveau de la fourche de réplication.", "Several enzymes work together at the replication fork."),
        t("Tu vas voir comment chaque brin est copié et tester les modèles de Meselson et Stahl.", "You will see how each strand is copied and test Meselson and Stahl's models."),
      ]}
      conclusion={[
        t("Chaque brin ancien sert de modèle pour fabriquer un brin neuf complémentaire.", "Each old strand is a template for making a new complementary strand."),
        t("L'ADN polymérase travaille toujours de 5' vers 3' : un brin est continu, l'autre en fragments d'Okazaki.", "DNA polymerase always works 5' to 3': one strand is continuous, the other in Okazaki fragments."),
        t("La réplication est semi-conservative : chaque ADN fils = 1 brin ancien + 1 brin neuf.", "Replication is semi-conservative: each daughter DNA = 1 old strand + 1 new strand."),
      ]}
      legend={[
        { color: "var(--old-strand)", label: t("Brin parental (ancien)", "Parental strand (old)") },
        { color: "var(--new-strand)", label: t("Brin neuf (ADN)", "New strand (DNA)") },
        { color: "var(--rna)", label: t("Amorce ARN", "RNA primer") },
        { color: "var(--enzyme)", label: t("Hélicase / ADN pol.", "Helicase / DNA pol.") },
      ]}
      params={
        <>
          <Choice label={t("Taille des fragments d'Okazaki", "Okazaki fragment size")} value={size} onChange={setSize} disabled={sim.started} options={[
            { v: "court", l: t("Courts", "Short") },
            { v: "long", l: t("Longs", "Long") },
          ]} />
          <Choice label={t("Modèle testé (Meselson–Stahl)", "Model tested (Meselson–Stahl)")} value={model} onChange={setModel} options={[
            { v: "semi", l: t("Semi-conservatif", "Semi-conservative") },
            { v: "conservatif", l: t("Conservatif", "Conservative") },
            { v: "dispersif", l: t("Dispersif", "Dispersive") },
          ]} />
          <Slider label={t("Générations en ¹⁴N", "Generations in ¹⁴N")} value={gen} min={1} max={3} onChange={setGen} />
        </>
      }
      scene={
        <svg viewBox="0 0 600 320" className="w-full">
          <polyline points={`${L},${yA} ${fork},${yA} ${fork + 20},155 ${R},155`} stroke="var(--old-strand)" strokeWidth={6} fill="none" />
          <polyline points={`${L},${yB} ${fork},${yB} ${fork + 20},165 ${R},165`} stroke="var(--old-strand)" strokeWidth={6} fill="none" />
          <text x={10} y={yA + 5} fontSize={13} fontWeight={700} fill="var(--foreground)">3'</text>
          <text x={10} y={yB + 5} fontSize={13} fontWeight={700} fill="var(--foreground)">5'</text>
          <text x={80} y={yA - 8} fontSize={12} fill="var(--foreground)">{t("brin parental", "parental strand")}</text>
          <text x={80} y={yB + 18} fontSize={12} fill="var(--foreground)">{t("brin parental", "parental strand")}</text>
          {p0 > 0 && p4 === 0 && <text x={Math.min(fork + 30, 500)} y={148} fontSize={12} fontWeight={700} fill="var(--foreground)">{t("fourche", "fork")}</text>}
          {p0 > 0 && p0 < 1 && <text x={fork - 10} y={135} fontSize={11} fill="var(--foreground)">{t("hélicase", "helicase")}</text>}
          {p1 > 0 && p1 < 1 && <text x={L} y={yL + 20} fontSize={11} fill="var(--foreground)">{t("amorce ARN (primase)", "RNA primer (primase)")}</text>}
          {p2 > 0 && p2 < 1 && <text x={60 + p2 * 500 - 30} y={yL + 26} fontSize={11} fill="var(--foreground)">{t("ADN polymérase", "DNA polymerase")}</text>}
          {p3 > 0.5 && p3 < 1 && <text x={L} y={yG + 40} fontSize={12} fill="var(--foreground)">{t("🔗 ligase : relie les fragments", "🔗 ligase: joins the fragments")}</text>}
          {p4 > 0.5 && <text x={300} y={164} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--foreground)">{t("2 molécules filles = 1 brin ancien + 1 brin neuf", "2 daughter molecules = 1 old strand + 1 new strand")}</text>}
          {p0 > 0 && p0 < 1 && <circle cx={fork + 8} cy={160} r={18} fill="var(--enzyme)" />}
          {p1 > 0 && <rect x={L} y={yL - 4} width={20} height={8} fill={p3 > 0.5 ? "var(--new-strand)" : "var(--rna)"} />}
          {p2 > 0 && <line x1={60} y1={yL} x2={60 + p2 * 500} y2={yL} stroke="var(--new-strand)" strokeWidth={6} />}
          {p2 > 0 && p2 < 1 && <circle cx={60 + p2 * 500} cy={yL} r={12} fill="var(--enzyme)" />}
          <text x={440} y={yL - 12} fontSize={12} fill="var(--foreground)">{t("brin précoce →", "leading strand →")}</text>
          {frags.map(([a, b], i) => {
            const len = b - a, off = p3 > 0.5 ? 0 : 4;
            return (
              <g key={i}>
                {p1 > i / frags.length && <rect x={b - 14 - off} y={yG - 4} width={14} height={8} fill={p3 > 0.5 ? "var(--new-strand)" : "var(--rna)"} />}
                {p2 > 0 && <line x1={b - 14 - off - p2 * (len - 14 - off)} y1={yG} x2={b - 14 - off} y2={yG} stroke="var(--new-strand)" strokeWidth={6} />}
              </g>
            );
          })}
          <text x={420} y={yG + 22} fontSize={12} fill="var(--foreground)">{t("← fragments d'Okazaki", "← Okazaki fragments")}</text>
          {p3 > 0.5 && p3 < 1 && frags.map(([a], i) => i > 0 && <text key={i} x={a - 6} y={yG + 4} fontSize={12}>🔗</text>)}
        </svg>
      }
      mesure={
        <>
          <p className="text-sm">
            {t("Nucléotides ajoutés", "Nucleotides added")} : <b>{added}</b> · Fragments : <b>{frags.length}</b>
          </p>
          <p className="mt-2 text-sm font-semibold">
            {t("Tube de Meselson–Stahl (gén.", "Meselson–Stahl tube (gen.")} {g})
          </p>
          <svg viewBox="0 0 200 110" className="mt-1 w-full">
            <rect x={70} y={4} width={60} height={100} rx={20} fill="var(--card)" stroke="var(--foreground)" />
            {([[t("léger ¹⁴N", "light ¹⁴N"), 30, tube.leger], [t("hybride", "hybrid"), 55, tube.hybride], [t("lourd ¹⁵N", "heavy ¹⁵N"), 80, tube.lourd]] as [string, number, number][]).map(([lab, y, v]) => (
              <g key={lab}>
                <rect x={74} y={y - 3} width={52} height={6} rx={3} fill="var(--primary)" opacity={v} />
                <text x={135} y={y + 4} fontSize={10} fill="var(--foreground)">
                  {lab} {Math.round(v * 100)}%
                </text>
              </g>
            ))}
            {tube.dispersif !== null && <rect x={74} y={30 + tube.dispersif * 50 - 3} width={52} height={6} rx={3} fill="var(--primary)" />}
          </svg>
        </>
      }
      questions={[
        { q: t("Pourquoi le brin retardé est-il fabriqué en fragments ?", "Why is the lagging strand made in fragments?"), r: t("L'ADN polymérase ne synthétise que dans le sens 5'→3' ; les brins étant antiparallèles, un brin est copié à l'envers de la fourche, par petits morceaux.", "DNA polymerase only synthesises 5'→3'; since the strands are antiparallel, one strand is copied away from the fork, in small pieces.") },
        { q: t("À quoi servent la primase et la ligase ?", "What do primase and ligase do?"), r: t("La primase pose une amorce d'ARN pour démarrer ; la ligase relie les fragments d'Okazaki par des liaisons phosphodiester.", "Primase lays an RNA primer to start; ligase joins Okazaki fragments with phosphodiester bonds.") },
        { q: t("Quel modèle donne 100 % d'ADN hybride à la génération 1 ?", "Which model gives 100% hybrid DNA at generation 1?"), r: t("Le semi-conservatif : chaque molécule fille = 1 brin ¹⁵N ancien + 1 brin ¹⁴N neuf (résultat de Meselson & Stahl).", "Semi-conservative: each daughter molecule = 1 old ¹⁵N strand + 1 new ¹⁴N strand (Meselson & Stahl's result).") },
      ]}
    />
  );
}
