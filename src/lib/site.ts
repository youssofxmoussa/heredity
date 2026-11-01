import type { Lang } from "./language";

export const publicOrigin = "https://hereditybydiab.vercel.app";

export function localizedURL(path: string, lang: Lang = "fr") {
  const url = new URL(path, publicOrigin);
  if (lang === "en") url.searchParams.set("lang", "en");
  return url.href;
}