import socialAsset from "@/assets/heredo-social.asset.json";

// A real, verified image host, not the site's canonical domain. Replace this
// host if the preview is retired; page identity stays relative until publishing.
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

export function pageHead(path: SearchPath) {
  const page = searchPages[path];
  const isHome = path === "/";
  const website = {
    "@type": "WebSite", "@id": "/#website", url: "/", name: "Heredo Lab",
    description: searchPages["/"].description,
    inLanguage: ["fr", "en"], creator: siteCreator,
  };
  const resource = {
    "@type": isHome ? "CollectionPage" : "LearningResource",
    "@id": `${path}#resource`, url: path, name: page.title,
    description: page.description, inLanguage: ["fr", "en"],
    isPartOf: { "@id": "/#website" },
    ...(isHome ? {
      mainEntity: {
        "@type": "ItemList", numberOfItems: 6,
        itemListElement: Object.entries(searchPages).filter(([url]) => url !== "/").map(([url, item], index) => ({
          "@type": "ListItem", position: index + 1, url, name: item.title,
        })),
      },
    } : {
      learningResourceType: "Simulation interactive",
      educationalUse: ["instruction", "practice"],
      teaches: page.topic, isAccessibleForFree: true, author: educator,
      audience: { "@type": "EducationalAudience", educationalRole: "student" },
    }),
  };
  return {
    meta: [
      { title: page.title },
      { name: "description", content: page.description },
      { name: "creator", content: "Youssof Moussa" },
      { property: "og:site_name", content: "Heredo Lab" },
      { property: "og:title", content: page.title },
      { property: "og:description", content: page.description },
      { property: "og:type", content: "website" },
      { property: "og:url", content: path },
      { property: "og:locale", content: "fr_FR" },
      { property: "og:locale:alternate", content: "en_US" },
      { property: "og:image", content: socialImage },
      { property: "og:image:width", content: "1200" },
      { property: "og:image:height", content: "630" },
      { property: "og:image:alt", content: "Heredo Lab — Génétique : ADN, ARN et ribosome" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "twitter:title", content: page.title },
      { name: "twitter:description", content: page.description },
      { name: "twitter:image", content: socialImage },
      { name: "twitter:image:alt", content: "Heredo Lab — Génétique : ADN, ARN et ribosome" },
    ],
    links: [{ rel: "canonical", href: path }],
    scripts: [{ type: "application/ld+json", children: JSON.stringify({
      "@context": "https://schema.org", "@graph": [website, resource, ...(!isHome ? [{
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Heredo Lab", item: "/" },
          { "@type": "ListItem", position: 2, name: page.topic, item: path },
        ],
      }] : [])],
    }) }],
  };
}