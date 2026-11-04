import { pageHead } from "@/lib/seo";
import { resolveLang } from "@/lib/language";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useT } from "@/lib/i18n";
import { sheets } from "@/lib/sheets";
import { AuthorFooter } from "@/components/SheetLayout";

export const Route = createFileRoute("/")({
  staticData: { sitemap: true },
  head: ({ match }) => pageHead("/", resolveLang(match.search.lang)),
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
    <main className="mx-auto max-w-4xl px-4 py-8 sm:py-12">
      <section className="relative overflow-hidden rounded-[2rem] bg-luxe p-6 shadow-luxe sm:p-10">
        <img src={sheets[2]!.icon} alt="" width={384} height={384} className="pointer-events-none absolute -right-4 -top-3 h-24 w-24 rotate-12 opacity-80 sm:-right-10 sm:-top-6 sm:h-64 sm:w-64 sm:opacity-90" />
        <p className="pr-24 text-xs font-semibold uppercase tracking-[0.22em] sm:tracking-[0.3em] text-muted-foreground sm:pr-0">{t("Génétique · Chapitre 1", "Genetics · Chapter 1")}</p>
        <h1 className="mt-3 max-w-lg pr-14 font-display sm:pr-0 text-[2.1rem] leading-[0.95] sm:text-6xl">
          {t("Bases biochimiques ", "Biochemical basis ")}
          <em className="block text-primary">{t("de l'hérédité", "of heredity")}</em>
        </h1>
        <div className="mt-4 h-px w-24 bg-primary/40" />
        <p className="mt-4 max-w-md text-base text-muted-foreground sm:text-lg">
          {t("Manipule, observe, réponds. 6 feuilles à suivre dans l'ordre.", "Experiment, observe, answer. 6 sheets to follow in order.")}
        </p>
      </section>
      <div className="mt-10 space-y-8">
        {groups.map((g) => (
          <section key={g.fr}>
            <h2 className="mb-3 font-display text-2xl italic text-primary">{t(g.fr, g.en)}</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {g.ids.map((id) => {
                const s = sheets[id]!;
                return (
                  <Link key={s.to} to={s.to} className="group flex items-center gap-4 rounded-3xl border border-border/70 bg-card/80 p-4 shadow-soft backdrop-blur transition duration-300 hover:-translate-y-1 hover:shadow-luxe">
                    <span className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-luxe">
                      <img src={s.icon} alt="" width={384} height={384} loading="lazy" className="h-[4.5rem] w-[4.5rem] object-contain transition duration-500 group-hover:-rotate-6 group-hover:scale-110" />
                    </span>
                    <span>
                      <span className="block text-[0.7rem] font-semibold uppercase tracking-[0.2em] text-muted-foreground">
                        {t("Feuille", "Sheet")} {String(id + 1).padStart(2, "0")}
                      </span>
                      <span className="block font-display text-2xl leading-tight">{t(s.titre, s.titreEn)}</span>
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
