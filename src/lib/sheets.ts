import griffith from "@/assets/icon-griffith.png";
import hershey from "@/assets/icon-hershey.png";
import structure from "@/assets/icon-structure.png";
import replication from "@/assets/icon-replication.png";
import transcription from "@/assets/icon-transcription.png";
import traduction from "@/assets/icon-traduction.png";

export type Sheet = {
  to: "/griffith" | "/hershey-chase" | "/structure" | "/replication" | "/transcription" | "/traduction";
  section: string;
  sectionEn: string;
  titre: string;
  titreEn: string;
  court: string;
  courtEn: string;
  emoji: string;
  icon: string;
};

export const sheets: Sheet[] = [
  { to: "/griffith", section: "1.1 L'ADN, support de l'information", sectionEn: "1.1 DNA, carrier of information", titre: "Transformation : Griffith & Avery", titreEn: "Transformation: Griffith & Avery", court: "Griffith", courtEn: "Griffith", emoji: "🐭", icon: griffith },
  { to: "/hershey-chase", section: "1.1 L'ADN, support de l'information", sectionEn: "1.1 DNA, carrier of information", titre: "Expérience de Hershey–Chase", titreEn: "Hershey–Chase experiment", court: "Hershey–Chase", courtEn: "Hershey–Chase", emoji: "🦠", icon: hershey },
  { to: "/structure", section: "1.2 Composants et structure de l'ADN", sectionEn: "1.2 Components and structure of DNA", titre: "Construire la double hélice", titreEn: "Build the double helix", court: "Structure ADN", courtEn: "DNA structure", emoji: "🧬", icon: structure },
  { to: "/replication", section: "1.3 La réplication de l'ADN", sectionEn: "1.3 DNA replication", titre: "La fourche de réplication", titreEn: "The replication fork", court: "Réplication", courtEn: "Replication", emoji: "🍴", icon: replication },
  { to: "/transcription", section: "1.4–1.5 ARN & transcription", sectionEn: "1.4–1.5 RNA & transcription", titre: "De l'ADN à l'ARNm", titreEn: "From DNA to mRNA", court: "Transcription", courtEn: "Transcription", emoji: "📜", icon: transcription },
  { to: "/traduction", section: "1.5 Code génétique & traduction", sectionEn: "1.5 Genetic code & translation", titre: "Le ribosome traduit l'ARNm", titreEn: "The ribosome translates mRNA", court: "Traduction", courtEn: "Translation", emoji: "🔤", icon: traduction },
];

export const baseColors: Record<string, string> = {
  A: "var(--base-a)",
  T: "var(--base-t)",
  G: "var(--base-g)",
  C: "var(--base-c)",
  U: "var(--base-u)",
};

export function pageMeta(title: string, description: string) {
  return [
    { title },
    { name: "description", content: description },
    { property: "og:title", content: title },
    { property: "og:description", content: description },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary" },
  ];
}
