import { resolveLang, type Lang } from "./language";
import { localizedURL, publicOrigin } from "./site";
import socialAsset from "@/assets/heredo-social.asset.json";

// A real, verified image host, not the site's canonical domain. Replace this
// host if the preview is retired; page identity uses the public website origin.
export const socialImage = `https://id-preview--5396c623-b6c8-4a05-a023-8a40a146d0ec.lovable.app${socialAsset.url}`;
export const siteCreator = { "@type": "Person", name: "Youssof Moussa" };
const educator = {
  "@type": "Person",
  name: "Dr. Mohamad DIAB",
  jobTitle: "Professeur assistant",
  affiliation: { "@type": "Organization", name: "Université Libanaise" },
};

export const searchPages = {
  "/": {
    title: "Heredo Lab — Simulations de génétique, ADN, ARN et ribosome",
    description: "Explorez six simulations de génétique en français et en anglais : Griffith, Hershey–Chase, structure de l’ADN, réplication, transcription et traduction.",
    topic: "Bases biochimiques de l’hérédité / Biochemical basis of heredity",
  },
  "/griffith": {
    title: "Griffith et Avery : transformation bactérienne — Heredo Lab",
    description: "Simulez les expériences de Griffith et Avery. Comparez les souches S et R et l’action de la DNase pour identifier l’ADN comme principe transformant.",
    topic: "Transformation bactérienne / Bacterial transformation",
  },
  "/hershey-chase": {
    title: "Hershey–Chase : ADN du phage T2 — Heredo Lab",
    description: "Explorez l’expérience de Hershey–Chase : marquage au phosphore 32 et au soufre 35, infection d’E. coli et séparation par agitation et centrifugation.",
    topic: "ADN comme matériel génétique / DNA as genetic material",
  },
  "/structure": {
    title: "Structure de l’ADN : nucléotides et double hélice — Heredo Lab",
    description: "Assemblez des nucléotides, observez les paires A–T et G–C, les liaisons hydrogène, la règle de Chargaff et les deux brins antiparallèles de l’ADN.",
    topic: "Structure de l’ADN / DNA structure",
  },
  "/replication": {
    title: "Réplication de l’ADN et fragments d’Okazaki — Heredo Lab",
    description: "Suivez l’hélicase, la primase, l’ADN polymérase et la ligase. Comparez les modèles de réplication avec l’expérience de Meselson et Stahl.",
    topic: "Réplication semi-conservative / Semiconservative DNA replication",
  },
  "/transcription": {
    title: "Transcription : de l’ADN à l’ARN messager — Heredo Lab",
    description: "Observez l’ARN polymérase au promoteur, la lecture du brin matrice et la synthèse de l’ARNm de 5′ vers 3′. Comparez avec un promoteur supprimé.",
    topic: "Transcription et ARN messager / Transcription and messenger RNA",
  },
  "/traduction": {
    title: "Traduction : ribosome, codons et protéines — Heredo Lab",
    description: "Suivez le ribosome, les ARNt et les codons de l’ARNm, de l’initiation à la terminaison. Testez substitution, codon stop et décalage du cadre de lecture.",
    topic: "Traduction et code génétique / Translation and genetic code",
  },
} as const;

export type SearchPath = keyof typeof searchPages;

const englishPages: Record<SearchPath, { title: string; description: string; topic: string }> = {
  "/": { title: "Heredo Lab — Genetics simulations, DNA, RNA and ribosomes", description: "Explore six interactive genetics lessons in French and English: Griffith, Hershey–Chase, DNA structure, replication, transcription and translation.", topic: "Biochemical basis of heredity" },
  "/griffith": { title: "Griffith and Avery: bacterial transformation — Heredo Lab", description: "Simulate Griffith and Avery’s experiments. Compare S and R strains and the effects of DNase to identify DNA as the transforming principle.", topic: "Bacterial transformation" },
  "/hershey-chase": { title: "Hershey–Chase experiment: T2 phage DNA — Heredo Lab", description: "Explore the Hershey–Chase experiment using phosphorus-32 and sulfur-35 labels, E. coli infection, blending and centrifugation.", topic: "DNA as genetic material" },
  "/structure": { title: "DNA structure: nucleotides and the double helix — Heredo Lab", description: "Build nucleotides and explore A–T and G–C base pairs, hydrogen bonds, Chargaff’s rule and the antiparallel strands of the DNA double helix.", topic: "DNA structure" },
  "/replication": { title: "DNA replication and Okazaki fragments — Heredo Lab", description: "Follow helicase, primase, DNA polymerase and ligase. Explore leading and lagging strands and compare models with the Meselson–Stahl experiment.", topic: "Semiconservative DNA replication" },
  "/transcription": { title: "Transcription: from DNA to messenger RNA — Heredo Lab", description: "Observe RNA polymerase binding to a promoter, reading the template strand and making mRNA from 5′ to 3′. Test what happens without a promoter.", topic: "Transcription and messenger RNA" },
  "/traduction": { title: "Translation: ribosomes, codons and proteins — Heredo Lab", description: "Follow ribosomes, tRNA and mRNA codons from initiation to termination. Test substitutions, stop codons and frameshift mutations during protein synthesis.", topic: "Translation and the genetic code" },
};

export function languageDeps({ search }: { search: { lang?: string } }) {
  return { lang: resolveLang(search.lang) };
}

export function pageHead(path: SearchPath, lang: Lang = "fr") {
  const page = lang === "en" ? englishPages[path] : searchPages[path];
  const isHome = path === "/";
  const url = localizedURL(path, lang);
  const homeURL = localizedURL("/", lang);
  const topic = lang === "en" ? page.topic : page.topic.split(" / ")[0];
  const website = {
    "@type": "WebSite", "@id": `${publicOrigin}/#website`, url: publicOrigin + "/", name: "Heredo Lab",
    description: lang === "en" ? englishPages["/"].description : searchPages["/"].description,
    inLanguage: ["fr", "en"], creator: siteCreator,
  };
  const resource = {
    "@type": isHome ? "CollectionPage" : "LearningResource",
    "@id": `${url}#resource`, url, name: page.title,
    description: page.description, inLanguage: lang,
    isPartOf: { "@id": `${publicOrigin}/#website` },
    ...(isHome ? {
      mainEntity: {
        "@type": "ItemList", numberOfItems: 6,
        itemListElement: (Object.keys(searchPages) as SearchPath[]).filter(path => path !== "/").map((path, index) => ({
          "@type": "ListItem", position: index + 1, url: localizedURL(path, lang),
          name: lang === "en" ? englishPages[path].title : searchPages[path].title,
        })),
      },
    } : {
      learningResourceType: lang === "en" ? "Interactive simulation" : "Simulation interactive",
      educationalUse: ["instruction", "practice"],
      teaches: topic, isAccessibleForFree: true, author: educator,
      audience: { "@type": "EducationalAudience", educationalRole: "student" },
    }),
  };
  const imageAlt = lang === "en" ? "Heredo Lab — Genetics: DNA, RNA and ribosomes" : "Heredo Lab — Génétique : ADN, ARN et ribosome";
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { name: "creator", content: "Youssof Moussa" },
      { property: "og:site_name", content: "Heredo Lab" },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: url },
      { property: "og:locale", content: lang === "en" ? "en_US" : "fr_FR" },
      { property: "og:locale:alternate", content: lang === "en" ? "fr_FR" : "en_US" },
      { property: "og:image", content: socialImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: imageAlt },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.title },
      { name: "twitter:description", content: page.description },
      { name: "twitter:image", content: socialImage },
      { name: "twitter:image:alt", content: imageAlt },
    ],
    links: [
      { rel: "canonical", href: url },
      { rel: "alternate", hrefLang: "fr", href: localizedURL(path, "fr") },
      { rel: "alternate", hrefLang: "en", href: localizedURL(path, "en") },
      { rel: "alternate", hrefLang: "x-default", href: localizedURL(path, "fr") },
    ],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@graph": [website, resource, ...(!isHome ? [{
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Heredo Lab", item: homeURL },
          { "@type": "ListItem", position: 2, name: topic, item: url },
        ],
      }] : [])],
    }) }],
  };
}
