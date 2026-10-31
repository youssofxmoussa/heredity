import { useSyncExternalStore } from "react";

export type Lang = "fr" | "en";
export type T = (fr: string, en: string) => string;

let current: Lang = "fr";
const subs = new Set<() => void>();

export function setLang(l: Lang) {
  current = l;
  try {
    localStorage.setItem("lang", l);
  } catch {
    /* ignore */
  }
  if (typeof document !== "undefined") document.documentElement.lang = l;
  subs.forEach((f) => f());
}

export function initLang() {
  try {
    const l = localStorage.getItem("lang");
    if (l === "en" || l === "fr") setLang(l);
  } catch {
    /* ignore */
  }
}

export function useLang(): Lang {
  return useSyncExternalStore(
    (cb) => {
      subs.add(cb);
      return () => {
        subs.delete(cb);
      };
    },
    () => current,
    () => "fr",
  );
}

export function useT(): T {
  const l = useLang();
  return (fr, en) => (l === "en" ? en : fr);
}

export function LangSwitch() {
  const lang = useLang();
  return (
    <div
      className="absolute right-3 top-3 z-50 flex overflow-hidden rounded-full bg-card shadow-soft"
      role="group"
      aria-label="Langue / Language"
    >
      {(["fr", "en"] as const).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          aria-pressed={lang === l}
          className={`h-11 min-w-12 px-3 text-base font-bold transition ${lang === l ? "bg-primary text-primary-foreground" : ""}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}
