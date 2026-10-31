import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { baseColors, pageMeta } from "@/lib/sheets";
import { COMP, phase, useSim } from "@/lib/genetics";
import { Bars, Choice, SheetLayout } from "@/components/SheetLayout";

export const Route = createFileRoute("/transcription")({
  head: () => ({ meta: pageMeta("Transcription — Génétique ch.1", "Regarde l'ARN polymérase lire l'ADN et fabriquer l'ARNm, avec ou sans promoteur.") }),
  component: Page,
});

const GENES: Record<string, string> = { cours: "AUAUGCGAGUCCGGCCCUAA", g2: "GCAUGGCUUUCAAAGGAUGA", g3: "CCAUGUGGCACGAAUAG" };
const TO_DNA: Record<string, string> = { A: "A", U: "T", G: "G", C: "C" };

function Page() {
  const t = useT();
  const steps = [
    { titre: t("Fixation au promoteur", "Binding to the promoter"), texte: t("L'ARN polymérase reconnaît le promoteur, juste avant le gène.", "RNA polymerase recognises the promoter, just before the gene.") },
    { titre: t("Ouverture locale", "Local unwinding"), texte: t("Les deux brins se séparent localement.", "The two strands separate locally.") },
    { titre: t("Élongation", "Elongation"), texte: t("Brin matrice lu 3'→5' ; ARN fabriqué 5'→3'. U remplace T.", "Template strand read 3'→5'; RNA made 5'→3'. U replaces T.") },
    { titre: t("Terminaison", "Termination"), texte: t("Au signal de terminaison, l'ARN polymérase se détache.", "At the termination signal, RNA polymerase detaches.") },
    { titre: t("ARNm libéré", "mRNA released"), texte: t("ARN : simple brin, ribose, uracile (U).", "RNA: single strand, ribose, uracil (U).") },
  ];
  const sim = useSim(steps.length);
  const [gene, setGene] = useState("cours");
  const [promo, setPromo] = useState("oui");
  const rna = GENES[gene] ?? "";
  const coding = rna.split("").map((b) => TO_DNA[b] ?? "");
  const template = coding.map((b) => COMP[b] ?? "");
  const n = rna.length;
  const has = promo === "oui";
  const p0 = phase(sim, 0), p1 = phase(sim, 1), p2 = phase(sim, 2), p3 = phase(sim, 3), p4 = phase(sim, 4);
  const made = has ? Math.floor(p2 * n) : 0;
  const w = 440 / n;
  const polX = has ? 40 + p0 * 50 + n * w * p2 : 40 + p0 * 30;
  const polY = 160 - p3 * 120 * (has ? 1 : 0);
  const rnaY = 175 + p4 * 70;
  const counts: Record<string, number> = { A: 0, U: 0, G: 0, C: 0 };
  rna.slice(0, made).split("").forEach((b) => (counts[b] = (counts[b] ?? 0) + 1));

  return (
    <SheetLayout
      num={5}
      sim={sim}
      steps={steps}
      startLabel={t("Transcrire", "Transcribe")}
      intro={[
        t("L'ADN reste dans le noyau, mais les protéines sont fabriquées dehors.", "DNA stays in the nucleus, but proteins are made outside it."),
        t("La cellule fait donc une copie d'un gène sous forme d'ARN messager (ARNm).", "So the cell makes a copy of a gene as messenger RNA (mRNA)."),
        t("Tu vas voir l'ARN polymérase lire l'ADN et fabriquer cet ARNm.", "You will see RNA polymerase read DNA and make this mRNA."),
      ]}
      conclusion={[
        t("L'ARN polymérase se fixe au promoteur, puis lit le brin matrice de 3' vers 5'.", "RNA polymerase binds the promoter, then reads the template strand 3' to 5'."),
        t("L'ARNm est fabriqué de 5' vers 3' ; il ressemble au brin codant avec U à la place de T.", "mRNA is made 5' to 3'; it matches the coding strand with U instead of T."),
        t("Sans promoteur, pas de transcription.", "No promoter, no transcription."),
      ]}
      legend={[
        { color: "var(--old-strand)", label: t("ADN", "DNA") },
        { color: "var(--danger)", label: t("Promoteur", "Promoter") },
        { color: "var(--enzyme)", label: t("ARN polymérase", "RNA polymerase") },
        { color: "var(--base-u)", label: t("U (uracile)", "U (uracil)") },
        { color: "var(--rna)", label: t("ARNm", "mRNA") },
      ]}
      params={
        <>
          <Choice label={t("Gène transcrit", "Gene transcribed")} value={gene} onChange={setGene} disabled={sim.started} options={[
            { v: "cours", l: t("Exemple du cours", "Course example") },
            { v: "g2", l: t("Gène 2", "Gene 2") },
            { v: "g3", l: t("Gène 3", "Gene 3") },
          ]} />
          <Choice label={t("Promoteur présent ?", "Promoter present?")} value={promo} onChange={setPromo} disabled={sim.started} options={[
            { v: "oui", l: t("Oui", "Yes") },
            { v: "non", l: t("Non (délété)", "No (deleted)") },
          ]} />
        </>
      }
      scene={
        <svg viewBox="0 0 600 320" className="w-full">
          {has && <rect x={40} y={92} width={70} height={84} rx={8} fill="var(--danger)" opacity={0.25} />}
          <text x={75} y={86} textAnchor="middle" fontSize={11} fill="var(--foreground)">{has ? t("promoteur", "promoter") : t("pas de promoteur", "no promoter")}</text>
          <text x={14} y={110} fontSize={12} fontWeight={700} fill="var(--foreground)">5'</text>
          <text x={14} y={172} fontSize={12} fontWeight={700} fill="var(--foreground)">3'</text>
          <text x={8} y={124} fontSize={9} fill="var(--muted-foreground)">{t("codant", "coding")}</text>
          <text x={4} y={186} fontSize={9} fill="var(--muted-foreground)">{t("matrice", "template")}</text>
          {coding.map((b, i) => {
            const x = 120 + i * w;
            const open = has && p1 > 0 && Math.abs(x - polX) < 70 && p3 < 1;
            return (
              <g key={i}>
                <rect x={x} y={open ? 92 : 106} width={w - 2} height={18} rx={3} fill={baseColors[b]} />
                <text x={x + w / 2 - 1} y={(open ? 92 : 106) + 13} textAnchor="middle" fontSize={11}>{b}</text>
                <rect x={x} y={open ? 158 : 130} width={w - 2} height={18} rx={3} fill={baseColors[template[i] ?? ""]} />
                <text x={x + w / 2 - 1} y={(open ? 158 : 130) + 13} textAnchor="middle" fontSize={11}>{template[i]}</text>
                {i < made && (
                  <>
                    <rect x={x} y={rnaY + 8} width={w - 2} height={18} rx={3} fill={baseColors[rna[i] ?? ""]} />
                    <text x={x + w / 2 - 1} y={rnaY + 21} textAnchor="middle" fontSize={11} fontWeight={700}>{rna[i]}</text>
                  </>
                )}
              </g>
            );
          })}
          {made > 0 && <rect x={120} y={rnaY + 4} width={made * w} height={2} fill="var(--rna)" />}
          {made > 0 && <text x={98} y={rnaY + 22} fontSize={12} fontWeight={700} fill="var(--rna)">5'</text>}
          {sim.started && <ellipse cx={polX} cy={polY} rx={34} ry={44} fill="var(--enzyme)" opacity={0.55} />}
          {sim.started && <text x={polX} y={polY + 4} textAnchor="middle" fontSize={10} fontWeight={700} fill="var(--foreground)">{t("ARN pol.", "RNA pol.")}</text>}
          {made > 0 && <text x={120 + made * w + 6} y={rnaY + 22} fontSize={12} fontWeight={700} fill="var(--rna)">3'</text>}
          {made > 0 && <text x={120} y={rnaY + 44} fontSize={13} fontWeight={700} fill="var(--rna)">{t("ARNm (U à la place de T)", "mRNA (U instead of T)")}</text>}
          {!has && sim.step >= 1 && <text x={300} y={260} textAnchor="middle" fontWeight={700} fill="var(--danger)">{t("L'ARN polymérase ne se fixe pas : pas d'ARN !", "RNA polymerase does not bind: no RNA!")}</text>}
        </svg>
      }
      mesure={
        <>
          <p className="mb-2 text-sm">
            {t("ARN synthétisé", "RNA made")} : <b>{made}</b> / {has ? n : 0} {t("nucléotides", "nucleotides")}
          </p>
          <Bars max={8} items={["A", "U", "G", "C"].map((b) => ({ label: b, value: counts[b], color: baseColors[b] }))} />
        </>
      }
      questions={[
        { q: t("Compare l'ARNm au brin codant et au brin matrice.", "Compare the mRNA with the coding and template strands."), r: t("L'ARNm est complémentaire du brin matrice et a la même séquence que le brin codant, avec U au lieu de T.", "mRNA is complementary to the template strand and has the same sequence as the coding strand, with U instead of T.") },
        { q: t("Dans quel sens l'ARN est-il fabriqué ?", "In which direction is RNA made?"), r: t("De 5' vers 3', en lisant le brin matrice de 3' vers 5'.", "5' to 3', reading the template strand 3' to 5'.") },
        { q: t("Que se passe-t-il sans promoteur ?", "What happens without a promoter?"), r: t("L'ARN polymérase ne se fixe pas : aucun ARN n'est produit. Le promoteur est indispensable à l'initiation.", "RNA polymerase cannot bind: no RNA is made. The promoter is essential for initiation.") },
      ]}
    />
  );
}
