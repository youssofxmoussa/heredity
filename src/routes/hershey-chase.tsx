import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { pageMeta } from "@/lib/sheets";
import { hersheyResult, phase, useSim } from "@/lib/genetics";
import { Bars, Choice, SheetLayout, Slider } from "@/components/SheetLayout";

export const Route = createFileRoute("/hershey-chase")({
  head: () => ({ meta: pageMeta("Hershey–Chase — Génétique ch.1", "Marque l'ADN ou les protéines du phage T2 et découvre quelle molécule entre dans la bactérie.") }),
  component: Page,
});

function Phage({ x, y, hot, empty, dnaHot }: { x: number; y: number; hot: boolean; empty: boolean; dnaHot: boolean }) {
  return (
    <g transform={`translate(${x},${y})`}>
      <polygon points="0,-28 16,-18 16,0 0,10 -16,0 -16,-18" fill={hot ? "var(--radio)" : "var(--protein)"} stroke="var(--foreground)" strokeWidth={1.5} />
      {!empty && <path d="M-6,-14 q6,6 0,10 q-6,4 0,8" stroke={dnaHot ? "var(--danger)" : "var(--old-strand)"} strokeWidth={3} fill="none" />}
      <rect x={-3} y={10} width={6} height={18} fill="var(--protein)" />
      <path d="M0,28 l-12,10 M0,28 l12,10" stroke="var(--foreground)" strokeWidth={2} />
    </g>
  );
}

function Page() {
  const t = useT();
  const steps = [
    { titre: t("Marquage", "Labelling"), texte: t("³²P marque l'ADN (contient P). ³⁵S marque les protéines (contiennent S).", "³²P labels DNA (contains P). ³⁵S labels proteins (contain S).") },
    { titre: t("Adsorption", "Attachment"), texte: t("Les phages T2 se fixent sur E. coli.", "T2 phages attach to E. coli.") },
    { titre: "Injection", texte: t("Le phage injecte son matériel dans la bactérie.", "The phage injects its material into the bacterium.") },
    { titre: t("Agitation + centrifugation", "Blending + centrifugation"), texte: t("Les bactéries lourdes au culot, les capsides vides (« fantômes ») au surnageant.", "Heavy bacteria go to the pellet, empty capsids (“ghosts”) stay in the supernatant.") },
    { titre: t("Mesure & descendance", "Measurement & progeny"), texte: t("Où est la radioactivité ? Les nouveaux phages sont-ils marqués ?", "Where is the radioactivity? Are the new phages labelled?") },
  ];
  const sim = useSim(steps.length);
  const [iso, setIso] = useState("32P");
  const [agit, setAgit] = useState(4);
  const res = hersheyResult(iso, agit);
  const p1 = phase(sim, 1), p2 = phase(sim, 2), p3 = phase(sim, 3), p4 = phase(sim, 4);
  const protHot = iso === "35S";
  const dnaHot = iso === "32P";

  return (
    <SheetLayout
      num={2}
      sim={sim}
      steps={steps}
      startLabel={t("Infecter", "Infect")}
      intro={[
        t("Un virus (phage T2) est fait seulement d'ADN et de protéines.", "A virus (T2 phage) is made only of DNA and proteins."),
        t("Il infecte une bactérie en y faisant entrer son matériel génétique.", "It infects a bacterium by putting its genetic material inside."),
        t("En marquant l'ADN ou les protéines avec un élément radioactif, tu vas voir lequel entre.", "By labelling DNA or proteins with a radioactive element, you will see which one enters."),
      ]}
      conclusion={[
        t("Seul l'ADN du virus entre dans la bactérie ; les protéines restent dehors.", "Only the viral DNA enters the bacterium; proteins stay outside."),
        t("Les nouveaux virus contiennent l'ADN marqué, pas les protéines.", "New viruses contain the labelled DNA, not the proteins."),
        t("L'ADN est le matériel génétique du virus.", "DNA is the genetic material of the virus."),
      ]}
      legend={[
        { color: "var(--radio)", label: t("Protéine radioactive (³⁵S)", "Radioactive protein (³⁵S)") },
        { color: "var(--danger)", label: t("ADN radioactif (³²P)", "Radioactive DNA (³²P)") },
        { color: "var(--protein)", label: t("Capside protéique", "Protein capsid") },
        { color: "var(--base-t)", label: "E. coli" },
      ]}
      params={
        <>
          <Choice label={t("Isotope utilisé", "Isotope used")} value={iso} onChange={setIso} disabled={sim.started} options={[
            { v: "32P", l: t("³²P (ADN)", "³²P (DNA)") },
            { v: "35S", l: t("³⁵S (protéines)", "³⁵S (proteins)") },
          ]} />
          <Slider label={t("Durée d'agitation", "Blending time")} value={agit} min={0} max={5} unit=" min" onChange={setAgit} disabled={sim.started} />
        </>
      }
      scene={
        <svg viewBox="0 0 600 320" className="w-full">
          {p3 < 0.5 ? (
            <g opacity={1 - p3 * 2}>
              <ellipse cx={300} cy={220} rx={160} ry={60} fill="var(--base-t)" opacity={0.6} />
              <text x={300} y={290} textAnchor="middle" fill="var(--foreground)" fontWeight={700}>E. coli</text>
              {p2 > 0 && <path d={`M300,160 q-30,${30 * p2} 0,${60 * p2} q30,20 -20,${30 * p2}`} stroke={dnaHot ? "var(--danger)" : "var(--old-strand)"} strokeWidth={4} fill="none" />}
              {[220, 300, 380].map((x, i) => (
                <Phage key={i} x={x} y={40 + p1 * 82} hot={protHot} dnaHot={dnaHot} empty={p2 > 0.5} />
              ))}
              <text x={430} y={30 + p1 * 82} fontSize={13} fill="var(--foreground)">
                {t("← phage T2 (capside", "← T2 phage (capsid")}
                {p2 > 0.5 ? t(" vide", " empty") : t(" + ADN", " + DNA")})
              </text>
              {p2 > 0 && <text x={340} y={215} fontSize={13} fontWeight={700} fill="var(--foreground)">{t("ADN injecté", "DNA injected")}</text>}
            </g>
          ) : (
            <g opacity={(p3 - 0.5) * 2}>
              <path d="M240,30 h120 v220 q-60,50 -120,0 z" fill="var(--muted)" stroke="var(--foreground)" strokeWidth={2} />
              <text x={300} y={20} textAnchor="middle" fontWeight={700} fill="var(--foreground)">{t("Tube centrifugé", "Centrifuged tube")}</text>
              <rect x={242} y={40} width={116} height={150} fill={res.surnageant > 50 ? "var(--radio)" : "var(--card)"} opacity={0.3 + (res.surnageant / 100) * 0.7 * p4} />
              <ellipse cx={300} cy={250} rx={50} ry={18} fill={res.culot > 50 ? "var(--danger)" : "var(--base-t)"} opacity={0.4 + (res.culot / 100) * 0.6 * p4} />
              <text x={380} y={110} fill="var(--foreground)">{t("← Surnageant : capsides vides", "← Supernatant: empty capsids")}</text>
              <text x={360} y={255} fill="var(--foreground)">{t("← Culot : bactéries", "← Pellet: bacteria")}</text>
            </g>
          )}
          {p4 > 0.6 && (
            <g>
              <rect x={20} y={270} width={210} height={40} rx={12} fill="var(--accent)" />
              <text x={125} y={295} textAnchor="middle" fontSize={13} fill="var(--foreground)">
                {t("Nouveaux phages : ", "New phages: ")}
                {res.descendance ? t("radioactifs ✓", "radioactive ✓") : t("non radioactifs", "not radioactive")}
              </text>
            </g>
          )}
        </svg>
      }
      mesure={
        <>
          <Bars unit="%" max={100} items={[
            { label: t("Culot", "Pellet"), value: res.culot * p4, color: "var(--danger)" },
            { label: t("Surnageant", "Supernatant"), value: res.surnageant * p4, color: "var(--radio)" },
          ]} />
          <p className="mt-2 text-sm">{t("Radioactivité mesurée", "Measured radioactivity")} ({iso})</p>
        </>
      }
      questions={[
        { q: t("Avec ³²P, où se trouve la radioactivité ?", "With ³²P, where is the radioactivity?"), r: t("Surtout dans le culot, donc à l'intérieur des bactéries : l'ADN est entré.", "Mostly in the pellet, so inside the bacteria: DNA went in.") },
        { q: t("Avec ³⁵S, où se trouve-t-elle ?", "With ³⁵S, where is it?"), r: t("Dans le surnageant, avec les capsides vides : les protéines restent dehors.", "In the supernatant, with empty capsids: proteins stay outside.") },
        { q: t("Quelle molécule est le matériel génétique du phage ?", "Which molecule is the phage's genetic material?"), r: t("L'ADN : seul lui entre dans la cellule et se retrouve dans la descendance.", "DNA: only it enters the cell and is found in the progeny.") },
      ]}
    />
  );
}
