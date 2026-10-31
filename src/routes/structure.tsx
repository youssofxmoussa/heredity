import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useT } from "@/lib/i18n";
import { baseColors, pageMeta } from "@/lib/sheets";
import { chargaff, COMP, phase, useSim } from "@/lib/genetics";
import { Bars, SheetLayout, Slider } from "@/components/SheetLayout";

export const Route = createFileRoute("/structure")({
  head: () => ({ meta: pageMeta("Structure de l'ADN — Génétique ch.1", "Assemble les nucléotides, observe l'appariement A–T / G–C et la double hélice.") }),
  component: Page,
});

function makeSeq(n: number, pA: number) {
  const nAT = Math.round((n * pA * 2) / 100);
  const r: string[] = [];
  for (let i = 0; i < n; i++) r.push(i < nAT ? (i % 2 ? "T" : "A") : i % 2 ? "C" : "G");
  let seed = 7;
  for (let i = n - 1; i > 0; i--) {
    seed = (seed * 9301 + 49297) % 233280;
    const j = seed % (i + 1);
    [r[i], r[j]] = [r[j]!, r[i]!];
  }
  return r;
}

function Page() {
  const t = useT();
  const steps = [
    { titre: t("Le nucléotide", "The nucleotide"), texte: t("Base azotée + désoxyribose + phosphate.", "Nitrogenous base + deoxyribose + phosphate.") },
    { titre: t("Chaîne 5' → 3'", "5' → 3' chain"), texte: t("Les nucléotides s'unissent par des liaisons phosphodiester.", "Nucleotides join by phosphodiester bonds.") },
    { titre: t("Appariement", "Base pairing"), texte: t("Complémentarité : A avec T, G avec C.", "Complementarity: A with T, G with C.") },
    { titre: t("Liaisons hydrogène", "Hydrogen bonds"), texte: t("A=T : 2 liaisons. G≡C : 3 liaisons.", "A=T: 2 bonds. G≡C: 3 bonds.") },
    { titre: t("Double hélice", "Double helix"), texte: t("Deux brins antiparallèles enroulés (Watson & Crick, 1953).", "Two antiparallel strands coiled together (Watson & Crick, 1953).") },
  ];
  const sim = useSim(steps.length);
  const [pA, setPA] = useState(30);
  const [n, setN] = useState(10);
  const seq = useMemo(() => makeSeq(n, pA), [n, pA]);
  const p0 = phase(sim, 0), p1 = phase(sim, 1), p2 = phase(sim, 2), p3 = phase(sim, 3), p4 = phase(sim, 4);
  const top = Math.floor(p1 * n);
  const bot = Math.floor(p2 * n);
  const w = 520 / n;
  const exp = chargaff(pA);
  const counts: Record<string, number> = { A: 0, T: 0, G: 0, C: 0 };
  seq.forEach((b, i) => {
    if (i < top) counts[b] = (counts[b] ?? 0) + 1;
    const cb = COMP[b] ?? "";
    if (i < bot) counts[cb] = (counts[cb] ?? 0) + 1;
  });
  const hb = seq.slice(0, Math.floor(p3 * n)).reduce((s, b) => s + (b === "A" || b === "T" ? 2 : 3), 0);
  const yTop = (i: number) => 160 - 70 * (p4 ? Math.cos(i * 0.7 * p4) : 1);
  const yBot = (i: number) => 160 + 70 * (p4 ? Math.cos(i * 0.7 * p4) : 1);

  return (
    <SheetLayout
      num={3}
      sim={sim}
      steps={steps}
      startLabel={t("Assembler", "Build")}
      intro={[
        t("L'ADN est une longue molécule faite de petites unités : les nucléotides.", "DNA is a long molecule made of small units: nucleotides."),
        t("Chaque nucléotide = un phosphate + un sucre (désoxyribose) + une base (A, T, G ou C).", "Each nucleotide = a phosphate + a sugar (deoxyribose) + a base (A, T, G or C)."),
        t("Tu vas assembler l'ADN et découvrir comment les bases s'associent.", "You will build DNA and discover how bases pair up."),
      ]}
      conclusion={[
        t("L'ADN est une double hélice de deux brins antiparallèles.", "DNA is a double helix of two antiparallel strands."),
        t("Les bases sont complémentaires : A avec T (2 liaisons H), G avec C (3 liaisons H).", "Bases are complementary: A with T (2 H bonds), G with C (3 H bonds)."),
        t("Donc A = T et G = C : c'est la règle de Chargaff.", "So A = T and G = C: this is Chargaff's rule."),
      ]}
      legend={[
        { color: "var(--base-a)", label: "A (purine)" },
        { color: "var(--base-g)", label: "G (purine)" },
        { color: "var(--base-t)", label: "T (pyrimidine)" },
        { color: "var(--base-c)", label: "C (pyrimidine)" },
        { color: "var(--sugar)", label: t("Désoxyribose", "Deoxyribose") },
        { color: "var(--phosphate)", label: "Phosphate" },
      ]}
      params={
        <>
          <Slider label={t("% d'adénine (A)", "% adenine (A)")} value={pA} min={10} max={40} unit=" %" onChange={setPA} disabled={sim.started} />
          <Slider label={t("Nombre de paires", "Number of pairs")} value={n} min={6} max={14} onChange={setN} disabled={sim.started} />
        </>
      }
      scene={
        <svg viewBox="0 0 600 320" className="w-full">
          {sim.step === 0 && sim.started ? (
            <g opacity={p0 > 0 ? 1 : 0} transform="translate(200,120)">
              <circle cx={0} cy={40} r={22} fill="var(--phosphate)" />
              <text x={0} y={45} textAnchor="middle" fill="var(--card)" fontWeight={700}>P</text>
              <polygon points="50,20 90,20 100,55 70,75 40,55" fill="var(--sugar)" opacity={Math.min(1, p0 * 3)} />
              <text x={70} y={50} textAnchor="middle" fontSize={12}>{t("sucre", "sugar")}</text>
              <rect x={120} y={25} width={70} height={36} rx={10} fill="var(--base-a)" opacity={Math.min(1, p0 * 2)} />
              <text x={155} y={49} textAnchor="middle" fontWeight={700}>A</text>
              <text x={-20} y={110} fontSize={14} fill="var(--foreground)">C5' ← phosphate · C1' → base</text>
            </g>
          ) : (
            seq.map((b, i) => {
              const y1 = yTop(i), y2 = yBot(i), x = 40 + i * w + w / 2, c = COMP[b] ?? "", mid = (y1 + y2) / 2, nb = b === "A" || b === "T" ? 2 : 3;
              return (
                <g key={i}>
                  {i < top && (
                    <>
                      {i > 0 && <line x1={x - w} y1={yTop(i - 1)} x2={x} y2={y1} stroke="var(--phosphate)" strokeWidth={5} />}
                      <circle cx={x} cy={y1} r={8} fill="var(--sugar)" />
                      <rect x={x - 9} y={Math.min(y1, mid) + 6} width={18} height={Math.max(0, Math.abs(mid - y1) - 8)} rx={4} fill={baseColors[b]} />
                      <text x={x} y={Math.min(y1, mid) + 22} textAnchor="middle" fontSize={12} fontWeight={700}>{b}</text>
                    </>
                  )}
                  {i < bot && (
                    <>
                      {i > 0 && <line x1={x - w} y1={yBot(i - 1)} x2={x} y2={y2} stroke="var(--phosphate)" strokeWidth={5} />}
                      <circle cx={x} cy={y2} r={8} fill="var(--sugar)" />
                      <rect x={x - 9} y={Math.min(mid, y2) + 2} width={18} height={Math.max(0, Math.abs(y2 - mid) - 8)} rx={4} fill={baseColors[c]} />
                      <text x={x} y={Math.max(mid, y2) - 12} textAnchor="middle" fontSize={12} fontWeight={700}>{c}</text>
                    </>
                  )}
                  {i < Math.floor(p3 * n) && Array.from({ length: nb }).map((_, k) => (
                    <line key={k} x1={x - 6 + k * 6} x2={x - 6 + k * 6} y1={mid - 3} y2={mid + 3} stroke="var(--foreground)" strokeWidth={2} />
                  ))}
                </g>
              );
            })
          )}
          {p3 > 0.3 && <text x={300} y={20} textAnchor="middle" fontSize={13} fill="var(--foreground)">{t("┆ = liaisons hydrogène (A=T : 2 · G≡C : 3)", "┆ = hydrogen bonds (A=T: 2 · G≡C: 3)")}</text>}
          {sim.step >= 1 && !sim.done && p4 === 0 && <text x={300} y={300} textAnchor="middle" fontSize={13} fill="var(--foreground)">{t("● sucre — trait : phosphate = squelette du brin", "● sugar — line: phosphate = strand backbone")}</text>}
          {p4 > 0.5 && <text x={300} y={305} textAnchor="middle" fontSize={13} fontWeight={700} fill="var(--foreground)">{t("Double hélice : 2 brins antiparallèles", "Double helix: 2 antiparallel strands")}</text>}
          {sim.step >= 1 && (
            <>
              <text x={20} y={80} fontSize={14} fontWeight={700} fill="var(--foreground)">5'</text>
              <text x={565} y={80} fontSize={14} fontWeight={700} fill="var(--foreground)">3'</text>
              {bot > 0 && (
                <>
                  <text x={20} y={250} fontSize={14} fontWeight={700} fill="var(--foreground)">3'</text>
                  <text x={565} y={250} fontSize={14} fontWeight={700} fill="var(--foreground)">5'</text>
                </>
              )}
            </>
          )}
        </svg>
      }
      mesure={
        <>
          <Bars items={["A", "T", "G", "C"].map((b) => ({ label: b, value: counts[b], color: baseColors[b] }))} max={n} />
          <p className="mt-2 text-sm">
            {t("Chargaff attendu", "Expected (Chargaff)")} : A = T = {exp.A} %, G = C = {exp.G} %
          </p>
          <p className="text-sm">
            {t("Liaisons H", "H bonds")} : <b>{hb}</b> · {t("Séquences possibles", "Possible sequences")} : 4<sup>{n}</sup> = {(4 ** n).toLocaleString("fr")}
          </p>
        </>
      }
      questions={[
        { q: t("Compare les quantités de A et de T, puis de G et de C.", "Compare the amounts of A and T, then of G and C."), r: t("A = T et G = C, toujours : c'est la règle de Chargaff, due à l'appariement complémentaire.", "A = T and G = C, always: this is Chargaff's rule, due to complementary pairing.") },
        { q: t("Si tu augmentes le % de A, que deviennent G et les liaisons H ?", "If you increase % A, what happens to G and the H bonds?"), r: t("G et C diminuent (A+G = 50 %). Il y a moins de liaisons H car A=T n'en a que 2, G≡C en a 3.", "G and C decrease (A+G = 50%). There are fewer H bonds because A=T has only 2, G≡C has 3.") },
        { q: t("Pourquoi dit-on que les deux brins sont antiparallèles ?", "Why are the two strands called antiparallel?"), r: t("Un brin va de 5' vers 3', l'autre de 3' vers 5' : ils sont orientés en sens opposés.", "One strand runs 5' to 3', the other 3' to 5': they point in opposite directions.") },
      ]}
    />
  );
}
