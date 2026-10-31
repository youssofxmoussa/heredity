import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { GriffithScene } from "@/components/GriffithScene";
import { pageMeta } from "@/lib/sheets";
import { griffithResult, phase, useSim } from "@/lib/genetics";
import { Bars, Choice, SheetLayout } from "@/components/SheetLayout";

export const Route = createFileRoute("/griffith")({
  head: () => ({ meta: pageMeta("Griffith & Avery — Génétique ch.1", "Simule la transformation bactérienne et découvre que l'ADN est le principe transformant.") }),
  component: Page,
});

function Page() {
  const t = useT();
  const steps = [
    { titre: t("Les souches", "The strains"), texte: t("S = capsule, virulente. R = sans capsule, inoffensive.", "S = capsule, virulent. R = no capsule, harmless.") },
    { titre: t("Traitement de l'extrait", "Treating the extract"), texte: t("Avery : une enzyme détruit une seule molécule de l'extrait S tué.", "Avery: an enzyme destroys a single molecule in the killed S extract.") },
    { titre: "Injection", texte: t("On injecte le mélange à la souris.", "The mixture is injected into the mouse.") },
    { titre: t("5 jours d'observation", "5 days of observation"), texte: t("La souris tombe-t-elle malade (pneumonie) ?", "Does the mouse get sick (pneumonia)?") },
    { titre: t("Analyse du sang", "Blood test"), texte: t("Retrouve-t-on des bactéries S vivantes ?", "Are living S bacteria found?") },
  ];
  const sim = useSim(steps.length);
  const [inj, setInj] = useState("R+Smort");
  const [enz, setEnz] = useState("aucun");
  const res = griffithResult(inj, enz);
  const p1 = phase(sim, 1), p2 = phase(sim, 2), p3 = phase(sim, 3), p4 = phase(sim, 4);
  const health = res.meurt ? 100 - p3 * 100 : 100;

  return (
    <SheetLayout
      num={1}
      sim={sim}
      steps={steps}
      startLabel={t("Injecter", "Inject")}
      intro={[
        t("Une maladie, la pneumonie, est causée par une bactérie qui existe en deux formes : S (dangereuse) et R (inoffensive).", "Pneumonia is caused by a bacterium that exists in two forms: S (dangerous) and R (harmless)."),
        t("Griffith a découvert que des R peuvent devenir S : c'est la transformation.", "Griffith discovered that R can become S: this is transformation."),
        t("Ici, tu cherches quelle molécule provoque cette transformation.", "Here, you find out which molecule causes this transformation."),
      ]}
      conclusion={[
        t("Des bactéries R peuvent être transformées en S par une substance venant des S tuées.", "R bacteria can be transformed into S by a substance from killed S."),
        t("Seule la destruction de l'ADN (DNase) empêche la transformation.", "Only destroying DNA (DNase) prevents transformation."),
        t("L'ADN est donc le support de l'information génétique.", "DNA is therefore the carrier of genetic information."),
      ]}
      legend={[
        { color: "var(--base-g)", label: t("Bactérie S (capsule)", "S bacterium (capsule)") },
        { color: "var(--base-t)", label: t("Bactérie R", "R bacterium") },
        { color: "var(--muted-foreground)", label: t("Bactérie tuée (chaleur)", "Killed bacterium (heat)") },
        { color: "var(--enzyme)", label: t("Enzyme (Avery)", "Enzyme (Avery)") },
      ]}
      params={
        <>
          <Choice label={t("Ce qu'on injecte", "What is injected")} value={inj} onChange={setInj} disabled={sim.started} options={[
            { v: "S", l: t("S vivantes", "Living S") },
            { v: "R", l: t("R vivantes", "Living R") },
            { v: "Smort", l: t("S tuées", "Killed S") },
            { v: "R+Smort", l: t("R + S tuées", "R + killed S") },
          ]} />
          <Choice label={t("Enzyme ajoutée à l'extrait S (Avery)", "Enzyme added to S extract (Avery)")} value={enz} onChange={setEnz} disabled={sim.started || inj !== "R+Smort"} options={[
            { v: "aucun", l: t("Aucune", "None") },
            { v: "protease", l: t("Protéase", "Protease") },
            { v: "rnase", l: "RNase" },
            { v: "dnase", l: "DNase" },
          ]} />
        </>
      }
      scene={<GriffithScene p1={p1} p2={p2} p3={p3} p4={p4} started={sim.started} inj={inj} enz={enz} res={res} t={t} />}
      mesure={
        <>
          <Bars unit="%" max={100} items={[
            { label: t("Survie", "Survival"), value: health, color: "var(--success)" },
            { label: t("Jour", "Day"), value: p3 * 100, color: "var(--primary)" },
          ]} />
          <p className="mt-2 text-sm">
            {t("Jour", "Day")} {Math.round(p3 * 5)} / 5 · {t("survie", "survival")} {Math.round(health)} %
          </p>
        </>
      }
      questions={[
        { q: t("Les S tuées seules tuent-elles la souris ? Et R seules ?", "Do killed S alone kill the mouse? And R alone?"), r: t("Non pour les deux. La chaleur supprime la virulence des S, et R est inoffensive.", "No for both. Heat removes S virulence, and R is harmless.") },
        { q: t("Que se passe-t-il avec R vivantes + S tuées ?", "What happens with living R + killed S?"), r: t("La souris meurt et son sang contient des S vivantes : R a été transformée par un « principe transformant ».", "The mouse dies and its blood contains living S: R was transformed by a “transforming principle”.") },
        { q: t("Quelle enzyme bloque la transformation ? Conclusion ?", "Which enzyme blocks transformation? Conclusion?"), r: t("Seule la DNase. Le principe transformant est donc l'ADN (Avery, MacLeod, McCarty 1944).", "Only DNase. The transforming principle is therefore DNA (Avery, MacLeod, McCarty 1944).") },
      ]}
    />
  );
}
