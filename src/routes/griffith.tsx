import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { pageMeta } from "@/lib/sheets";
import { griffithResult, phase, useSim } from "@/lib/genetics";
import { Bars, Choice, SheetLayout } from "@/components/SheetLayout";

export const Route = createFileRoute("/griffith")({
  head: () => ({ meta: pageMeta("Griffith & Avery — Génétique ch.1", "Simule la transformation bactérienne et découvre que l'ADN est le principe transformant.") }),
  component: Page,
});

function Bact({ x, y, type, dead }: { x: number; y: number; type: "S" | "R"; dead?: boolean }) {
  return (
    <g transform={`translate(${x},${y})`} opacity={dead ? 0.45 : 1}>
      {type === "S" && <ellipse rx={17} ry={11} fill="none" stroke="var(--base-g)" strokeWidth={4} />}
      <ellipse rx={12} ry={7} fill={dead ? "var(--muted-foreground)" : type === "S" ? "var(--base-g)" : "var(--base-t)"} />
      {dead && <text y={4} textAnchor="middle" fontSize={10}>✕</text>}
    </g>
  );
}

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
  const hasR = inj === "R" || inj === "R+Smort";
  const hasS = inj === "S";
  const hasDead = inj === "Smort" || inj === "R+Smort";
  const ex = 40 + p2 * 260;

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
      scene={
        <svg viewBox="0 0 600 320" className="w-full">
          <rect x={10} y={20} width={180} height={150} rx={20} fill="var(--muted)" />
          <text x={100} y={44} textAnchor="middle" fontWeight={700} fill="var(--foreground)">{t("Seringue", "Syringe")}</text>
          {hasS && [0, 1, 2].map((i) => <Bact key={i} x={60 + i * 40 + p2 * 330} y={100 + (i % 2) * 30} type="S" />)}
          {hasR && [0, 1, 2].map((i) => <Bact key={"r" + i} x={60 + i * 40 + p2 * 330} y={80 + i * 25} type="R" />)}
          {hasDead && [0, 1].map((i) => <Bact key={"m" + i} x={80 + i * 50 + p2 * 330} y={140} type="S" dead />)}
          {inj === "R+Smort" && enz !== "aucun" && p1 > 0 && (
            <g opacity={p2 > 0 ? 0 : 1}>
              <circle cx={ex + 60} cy={140} r={10 + p1 * 6} fill="var(--enzyme)" opacity={0.7} />
              <text x={100} y={195} textAnchor="middle" fontSize={14} fill="var(--foreground)">
                ✂ {({ protease: t("Protéines détruites", "Proteins destroyed"), rnase: t("ARN détruit", "RNA destroyed"), dnase: t("ADN détruit", "DNA destroyed") } as Record<string, string>)[enz]}
              </text>
            </g>
          )}
          {p2 > 0 && p2 < 1 && <text x={290} y={70} textAnchor="middle" fontSize={13} fill="var(--foreground)">injection →</text>}
          <g transform="translate(450,110)">
            <ellipse rx={80} ry={50} fill="var(--secondary)" />
            <text textAnchor="middle" y={-58} fontWeight={700} fill="var(--foreground)">{t("Souris", "Mouse")}</text>
            <text textAnchor="middle" y={20} fontSize={64}>{res.meurt && p3 > 0.7 ? "💀" : "🐭"}</text>
          </g>
          <rect x={370} y={185} width={160} height={14} rx={7} fill="var(--muted)" />
          <rect x={370} y={185} width={1.6 * health} height={14} rx={7} fill={health > 50 ? "var(--success)" : "var(--danger)"} />
          <text x={450} y={218} textAnchor="middle" fontSize={13} fill="var(--foreground)">{t("Santé de la souris", "Mouse health")}</text>
          <g opacity={p4}>
            <rect x={60} y={240} width={480} height={64} rx={16} fill="var(--accent)" />
            <text x={300} y={268} textAnchor="middle" fontWeight={700} fill="var(--foreground)">
              {t("Sang : ", "Blood: ")}
              {res.sang === "aucune" ? t("pas de bactérie S vivante", "no living S bacteria") : t("bactéries S vivantes !", "living S bacteria!")}
            </text>
            <text x={300} y={290} textAnchor="middle" fontSize={13} fill="var(--foreground)">
              {inj === "R+Smort"
                ? res.meurt
                  ? t("R a été TRANSFORMÉE en S", "R was TRANSFORMED into S")
                  : t("Pas de transformation : l'ADN était détruit", "No transformation: DNA was destroyed")
                : t("Témoin", "Control")}
            </text>
          </g>
        </svg>
      }
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
