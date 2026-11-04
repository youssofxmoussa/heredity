import { pageHead } from "@/lib/seo";
import { resolveLang } from "@/lib/language";
import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { HersheyScene } from "@/components/HersheyScene";
import { hersheyResult, phase, useSim } from "@/lib/genetics";
import { Bars, Choice, SheetLayout, Slider } from "@/components/SheetLayout";

export const Route = createFileRoute("/hershey-chase")({
  staticData: { sitemap: true },
  head: ({ match }) => pageHead("/hershey-chase", resolveLang(match.search.lang)),
  component: Page,
});

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
      scene={<HersheyScene p1={p1} p2={p2} p3={p3} p4={p4} started={sim.started} iso={iso} res={res} t={t} />}
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
