import { useNavigate, useSearch } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { resolveLang, type Lang } from "./language";

export type { Lang } from "./language";
export type T = (fr: string, en: string) => string;

export function useLang(): Lang {
  const search = useSearch({ strict: false });
  return resolveLang(search.lang);
}

export function useT(): T {
  const l = useLang();
  return (fr, en) => (l === "en" ? en : fr);
}

export function LangSwitch() {
  const lang = useLang();
  const navigate = useNavigate();
  const t = useT();
  return (
    <div
      className="flex shrink-0 overflow-hidden rounded-full border border-border/70 bg-card p-0.5 shadow-soft"
      role="group"
      aria-label={t("Langue", "Language")}
    >
      {(["fr", "en"] as const).map((l) => (
        <Button
          key={l}
          variant="ghost"
          onClick={() => navigate({ search: (prev) => ({ ...prev, lang: l === "en" ? "en" : undefined }), resetScroll: false })}
          aria-pressed={lang === l}
          className={`h-10 min-w-11 rounded-full px-3 text-sm font-bold transition ${lang === l ? "bg-primary text-primary-foreground" : "text-muted-foreground"}`}
        >
          {l.toUpperCase()}
        </Button>
      ))}
    </div>
  );
}
