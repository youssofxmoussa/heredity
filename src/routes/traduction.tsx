import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useT } from "@/lib/i18n";
import { pageMeta } from "@/lib/sheets";
import { MRNAS, mutate, phase, readFrame, useSim } from "@/lib/genetics";
import { Choice, SheetLayout } from "@/components/SheetLayout";
import { TranslationScene } from "@/components/TranslationScene";

export const Route = createFileRoute("/traduction")({
  head: () => ({
    meta: pageMeta(
      "Traduction / Translation — Génétique ch.1",
      "Le ribosome lit l'ARNm codon par codon et assemble la protéine. Teste des mutations. (FR/EN)",
    ),
  }),
  component: Page,
});

function Page() {
  const t = useT();
  const steps = [
    { titre: "Initiation", texte: t("La petite sous-unité glisse sur l'ARNm jusqu'au codon AUG ; l'ARNt initiateur (anticodon UAC) y dépose Met au site P.", "The small subunit scans the mRNA to the AUG codon; the initiator tRNA (anticodon UAC) brings Met to the P site.") },
    { titre: t("Ribosome complet", "Complete ribosome"), texte: t("La grande sous-unité s'associe : les sites E, P et A sont formés.", "The large subunit joins: the E, P and A sites are formed.") },
    { titre: t("Élongation", "Elongation"), texte: t("Un ARNt chargé entre au site A ; son anticodon s'apparie au codon ; une liaison peptidique se forme.", "A charged tRNA enters the A site; its anticodon pairs with the codon; a peptide bond forms.") },
    { titre: "Translocation", texte: t("Le ribosome avance d'un codon (3 nucléotides) ; l'ARNt vide passe au site E puis sort. Le cycle recommence.", "The ribosome moves one codon (3 nucleotides); the empty tRNA moves to the E site and leaves. The cycle repeats.") },
    { titre: t("Terminaison", "Termination"), texte: t("Codon stop (UAA, UAG, UGA) au site A : le facteur de terminaison libère la protéine, le ribosome se dissocie.", "Stop codon (UAA, UAG, UGA) in the A site: the release factor frees the protein and the ribosome comes apart.") },
  ];
  const [mrna, setMrna] = useState("cours");
  const [mut, setMut] = useState("aucune");
  const seq = mutate(MRNAS[mrna] ?? "", mut);
  const frame = readFrame(seq);
  const cycles = Math.max(0, frame.aa.length - 1);
  const elong = Math.max(1, cycles * 0.55);
  const sim = useSim(steps.length, [1.3, 0.8, elong, elong, 1.5]);

  // live count mirrors the scene's chain
  const p0 = phase(sim, 0), p2 = phase(sim, 2), p3 = phase(sim, 3), p4 = phase(sim, 4);
  const g = ((p2 + p3) / 2) * cycles;
  const cycle = cycles === 0 || g === 0 ? 0 : g >= cycles ? cycles : Math.floor(g) + 1;
  const u = cycle === 0 || g >= cycles ? 1 : g - Math.floor(g);
  const holder = cycle === 0 ? 0 : u >= 0.48 ? cycle : cycle - 1;
  const linked = sim.started && p0 > 0.72 ? holder + 1 : 0;

  return (
    <SheetLayout
      num={6}
      sim={sim}
      steps={steps}
      startLabel={t("Traduire", "Translate")}
      intro={[
        t("L'ARNm porte un message écrit en codons (groupes de 3 lettres).", "mRNA carries a message written in codons (groups of 3 letters)."),
        t("Le ribosome lit ce message et assemble les acides aminés pour former une protéine.", "The ribosome reads this message and links amino acids into a protein."),
        t("Tu vas suivre la traduction et voir l'effet de mutations.", "You will follow translation and see the effect of mutations."),
      ]}
      conclusion={[
        t("La lecture commence au codon AUG et s'arrête à un codon stop.", "Reading starts at the AUG codon and stops at a stop codon."),
        t("Chaque codon correspond à un acide aminé : c'est le code génétique. L'ARNt fait le lien grâce à son anticodon.", "Each codon matches one amino acid: this is the genetic code. The tRNA makes the link with its anticodon."),
        t("Une mutation peut changer un acide aminé, raccourcir ou modifier toute la protéine.", "A mutation can change one amino acid, shorten or alter the whole protein."),
      ]}
      legend={[
        { color: "var(--rna)", label: t("ARNm", "mRNA") },
        { color: "var(--ribo-large)", label: "Ribosome" },
        { color: "var(--trna)", label: t("ARNt (anticodon)", "tRNA (anticodon)") },
        { color: "var(--protein)", label: t("Acide aminé", "Amino acid") },
        { color: "var(--danger)", label: t("Codon stop", "Stop codon") },
        { color: "var(--release)", label: t("Facteur de terminaison", "Release factor") },
      ]}
      params={
        <>
          <Choice label={t("ARNm", "mRNA")} value={mrna} onChange={setMrna} disabled={sim.started} options={[
            { v: "cours", l: t("Exemple du cours", "Course example") },
            { v: "g2", l: t("ARNm 2", "mRNA 2") },
          ]} />
          <Choice label="Mutation" value={mut} onChange={setMut} disabled={sim.started} options={[
            { v: "aucune", l: t("Aucune", "None") },
            { v: "faux", l: "Substitution" },
            { v: "non", l: t("Codon stop", "Stop codon") },
            { v: "ins", l: "Insertion (+1)" },
          ]} />
        </>
      }
      scene={<TranslationScene sim={sim} seq={seq} frame={frame} t={t} />}
      mesure={
        <>
          <p className="text-sm">
            {t("Acides aminés assemblés", "Amino acids linked")} : <b className="text-2xl">{linked}</b>
          </p>
          <div className="mt-2 flex flex-wrap gap-1">
            {frame.codons.map((c, i) => {
              const read = linked > 0 && (i < linked || (p4 > 0.1 && i === frame.codons.length - 1 && frame.stop));
              return (
                <span key={i} className={`rounded-lg px-2 py-1 font-mono text-xs ${read ? "bg-primary text-primary-foreground" : "bg-card"}`}>
                  {c}→{frame.aa[i] ?? "STOP"}
                </span>
              );
            })}
          </div>
          {!frame.stop && <p className="mt-2 text-xs font-semibold">{t("⚠ Aucun codon stop dans ce cadre de lecture.", "⚠ No stop codon in this reading frame.")}</p>}
        </>
      }
      questions={[
        { q: t("Combien de nucléotides forment un codon ? Où commence la lecture ?", "How many nucleotides make a codon? Where does reading start?"), r: t("3 nucléotides. La lecture commence au codon d'initiation AUG (Met) et s'arrête au premier codon stop.", "3 nucleotides. Reading starts at the AUG start codon (Met) and stops at the first stop codon.") },
        { q: t("Compare la protéine avec « Substitution » et avec « Codon stop ».", "Compare the protein with “Substitution” and with “Stop codon”."), r: t("Substitution : un seul acide aminé change. Codon stop : la protéine est raccourcie (arrêt précoce).", "Substitution: only one amino acid changes. Stop codon: the protein is shortened (early stop).") },
        { q: t("Pourquoi l'insertion d'un nucléotide est-elle grave ?", "Why is inserting one nucleotide serious?"), r: t("Elle décale le cadre de lecture : tous les codons suivants changent, la protéine est très différente.", "It shifts the reading frame: all following codons change, the protein is very different.") },
      ]}
    />
  );
}
