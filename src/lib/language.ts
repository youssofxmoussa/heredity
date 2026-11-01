export type Lang = "fr" | "en";

export function resolveLang(value: unknown): Lang {
  return value === "en" ? "en" : "fr";
}

export function validateLanguageSearch(search: Record<string, unknown>) {
  return { lang: typeof search.lang === "string" ? search.lang : undefined };
}