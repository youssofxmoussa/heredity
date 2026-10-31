import { createFileRoute, Link } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { pageMeta, sheets } from "@/lib/sheets";
import { AuthorFooter } from "@/components/SheetLayout";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: pageMeta(
      "Heredo Lab — Génétique ch.1 : bases biochimiques de l'hérédité",
      "6 simulations interactives (FR/EN) : Griffith, Hershey–Chase, ADN, réplication, transcription et traduction.",
    ),
  }),
  component: Home,
});

const groups = [
  { fr: "1.1 L'ADN est le matériel génétique", en: "1.1 DNA is the genetic material", ids: [0, 1] },
  { fr: "1.2 Structure de l'ADN", en: "1.2 DNA structure", ids: [2] },
  { fr: "1.3 Réplication de l'ADN", en: "1.3 DNA replication", ids: [3] },
  { fr: "1.4–1.5 ARN et expression du gène", en: "1.4–1.5 RNA and gene expression", ids: [4, 5] },
];

function Home() {
  const t = useT();
  return (
    <main className="mx-auto max-w-3xl px-4 py-8">
      <p className="pr-28 text-sm font-bold uppercase tracking-wide text-muted-foreground">{t("Génétique · Chapitre 1", "Genetics · Chapter 1")}</p>
      <h1 className="font-display text-4xl leading-tight sm:text-5xl">{t("Bases biochimiques de l'hérédité", "Biochemical basis of heredity")}</h1>
      <p className="mt-2 text-lg text-muted-foreground">
        {t("Manipule, observe, réponds. 6 feuilles à suivre dans l'ordre.", "Experiment, observe, answer. 6 sheets to follow in order.")}
      </p>
      <div className="mt-8 space-y-6">
        {groups.map((g) => (
          <section key={g.fr}>
            <h2 className="mb-2 font-display text-xl">{t(g.fr, g.en)}</h2>
            <div className="grid gap-3 sm:grid-cols-2">
              {g.ids.map((id) => {
                const s = sheets[id];
                return (
                  <Link key={s.to} to={s.to} className="flex items-center gap-4 rounded-3xl bg-card p-5 shadow-soft transition hover:-translate-y-0.5">
                    <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-3xl">{s.emoji}</span>
                    <span>
                      <span className="block text-xs font-bold text-muted-foreground">
                        {t("Feuille", "Sheet")} {id + 1}
                      </span>
                      <span className="block text-lg font-bold leading-tight">{t(s.titre, s.titreEn)}</span>
                    </span>
                  </Link>
                );
              })}
            </div>
          </section>
        ))}
      </div>
      <AuthorFooter />
    </main>
  );
}
