import { Link } from "@tanstack/react-router";
import { ArrowLeft, Pause, Play, RotateCcw } from "lucide-react";
import { useState, type ReactNode } from "react";
import { useT } from "@/lib/i18n";
import { sheets } from "@/lib/sheets";
import type { Sim } from "@/lib/genetics";

export function AuthorFooter({ compact = false }: { compact?: boolean }) {
  const t = useT();
  const name = "Dr. Mohamad DIAB";
  const lines = [
    t("PhD en microbiologie médicale et alimentaire", "PhD in Medical and Food Microbiology"),
    t(
      "Professeur assistant — Faculté des Sciences et de Santé Publique, Université Libanaise",
      "Assistant Professor — Faculty of Sciences and Public Health, Lebanese University",
    ),
  ];
  if (compact)
    return (
      <footer className="mt-8 rounded-2xl bg-secondary/40 px-4 py-3 text-center">
        <p className="font-display text-lg leading-tight">{name}</p>
        {lines.map((l) => (
          <p key={l} className="text-xs text-muted-foreground sm:text-sm">{l}</p>
        ))}
      </footer>
    );
  return (
    <footer className="mt-8 rounded-3xl bg-secondary/50 p-5 shadow-soft">
      <div className="flex flex-col items-center gap-3 text-center sm:flex-row sm:text-left">
        <span aria-hidden className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/15 font-display text-2xl">MD</span>
        <span>
          <span className="block font-display text-xl leading-tight">{name}</span>
          {lines.map((l) => (
            <span key={l} className="block text-sm text-muted-foreground">{l}</span>
          ))}
        </span>
      </div>
    </footer>
  );
}

export type Step = { titre: string; texte: string };

export function SheetLayout(p: {
  num: number;
  intro: string[];
  conclusion: string[];
  sim: Sim;
  steps: Step[];
  startLabel?: string;
  legend: { color: string; label: string }[];
  params: ReactNode;
  scene: ReactNode;
  mesure: ReactNode;
  questions: { q: string; r: string }[];
}) {
  const t = useT();
  const { sim, steps } = p;
  const sheet = sheets[p.num - 1]!;
  const cur = steps[Math.max(0, Math.min(sim.step, steps.length - 1))]!;
  const [answers, setAnswers] = useState(p.questions.map(() => ""));
  const [showAns, setShowAns] = useState(false);
  const prev = sheets[p.num - 2];
  const next = sheets[p.num];

  return (
    <div className="mx-auto min-h-screen max-w-5xl px-3 pb-16 pt-4 sm:px-6">
      <header className="mb-4 flex items-center gap-3 pr-28">
        <Link to="/" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-card shadow-soft" aria-label={t("Sommaire", "Contents")}>
          <ArrowLeft className="h-5 w-5" />
        </Link>
        <img src={sheet.icon} alt="" width={384} height={384} className="h-14 w-14 shrink-0 object-contain drop-shadow sm:h-16 sm:w-16" />
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {t("Feuille", "Sheet")} {p.num} · {t(sheet.section, sheet.sectionEn)}
          </p>
          <h1 className="font-display text-3xl leading-tight sm:text-4xl">{t(sheet.titre, sheet.titreEn)}</h1>
        </div>
      </header>

      <section className="mb-4 rounded-2xl bg-secondary/40 p-4 shadow-soft">
        <h2 className="mb-2 font-display text-xl">📖 Introduction</h2>
        <ul className="space-y-1.5 text-base">
          {p.intro.map((x, i) => (
            <li key={i}>• {x}</li>
          ))}
        </ul>
      </section>

      <div className="mb-3 rounded-2xl bg-primary/15 p-3 sm:p-4" aria-live="polite">
        <div className="mb-2 flex gap-1.5">
          {steps.map((_, i) => (
            <div key={i} className="h-2 flex-1 overflow-hidden rounded-full bg-card">
              <div
                className="h-full bg-primary"
                style={{ width: `${sim.started ? (sim.step > i || sim.done ? 100 : sim.step === i ? sim.t * 100 : 0) : 0}%` }}
              />
            </div>
          ))}
        </div>
        {sim.started ? (
          <p className="text-base sm:text-lg">
            <b>
              {t("Étape", "Step")} {Math.min(sim.step, steps.length - 1) + 1}/{steps.length} — {cur.titre}
            </b>
            <span className="block text-sm text-foreground/80 sm:text-base">{cur.texte}</span>
          </p>
        ) : (
          <p className="text-base sm:text-lg">
            <b>{t("Prêt ?", "Ready?")}</b> {t("Choisis les paramètres puis appuie sur le gros bouton.", "Choose the settings, then press the big button.")}
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_300px]">
        <div className="space-y-3">
          <div className="overflow-hidden rounded-3xl border border-border/70 bg-card p-1.5 shadow-luxe">{p.scene}</div>
          <div className="flex flex-wrap gap-2 rounded-2xl bg-card p-3 text-sm shadow-soft">
            <b className="mr-1">{t("Légende :", "Key:")}</b>
            {p.legend.map((l) => (
              <span key={l.label} className="flex items-center gap-1.5">
                <span className="inline-block h-4 w-4 rounded-full border border-foreground/20" style={{ background: l.color }} />
                {l.label}
              </span>
            ))}
          </div>
        </div>
        <aside className="space-y-3">
          <button
            onClick={sim.toggle}
            disabled={sim.done}
            className="flex h-16 w-full items-center justify-center gap-2 rounded-2xl bg-primary bg-gradient-to-br from-primary to-primary/80 text-xl font-bold text-primary-foreground shadow-soft transition active:scale-95 disabled:opacity-50"
          >
            {sim.running ? <Pause /> : <Play />}
            {sim.running ? "Pause" : sim.started ? (sim.done ? t("Terminé", "Done") : t("Continuer", "Continue")) : (p.startLabel ?? t("Démarrer", "Start"))}
          </button>
          <button onClick={sim.reset} className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-secondary text-lg font-bold text-secondary-foreground transition active:scale-95">
            <RotateCcw className="h-5 w-5" /> {t("Recommencer", "Restart")}
          </button>
          <div className="rounded-2xl bg-card p-4 shadow-soft">
            <label className="mb-1 flex justify-between font-bold">
              {t("Vitesse de la simulation", "Simulation speed")} <span>×{sim.speed.toFixed(1)}</span>
            </label>
            <input type="range" min={0.3} max={3} step={0.1} value={sim.speed} onChange={(e) => sim.setSpeed(+e.target.value)} className="sim-range w-full" />
          </div>
          <div className="space-y-4 rounded-2xl bg-card p-4 shadow-soft">
            <p className="font-bold">{t("Paramètres", "Settings")}</p>
            {p.params}
            {sim.started && !sim.done && (
              <p className="text-xs text-muted-foreground">
                {t("Change un paramètre puis « Recommencer » pour comparer.", "Change a setting, then “Restart” to compare.")}
              </p>
            )}
          </div>
          <div className="rounded-2xl bg-accent/40 p-4 shadow-soft">
            <p className="mb-2 font-bold">📊 {t("Mesure en direct", "Live measurement")}</p>
            {p.mesure}
          </div>
        </aside>
      </div>

      <section className="mt-6 rounded-3xl border-2 border-dashed border-primary/40 bg-card p-4 sm:p-6">
        <h2 className="mb-3 font-display text-2xl">🔍 {t("Ce que j'observe", "What I observe")}</h2>
        <ol className="space-y-4">
          {p.questions.map((q, n) => (
            <li key={n}>
              <p className="mb-1 font-semibold">
                {n + 1}. {q.q}
              </p>
              <textarea
                rows={2}
                value={answers[n]}
                onChange={(e) => setAnswers(answers.map((a, i) => (i === n ? e.target.value : a)))}
                className="w-full rounded-xl border border-input bg-background p-3 text-base"
                placeholder={t("Ma réponse…", "My answer…")}
              />
              {showAns && <p className="mt-1 rounded-xl bg-success/20 p-3 text-sm">✅ {q.r}</p>}
            </li>
          ))}
        </ol>
        <button onClick={() => setShowAns((s) => !s)} className="mt-4 h-12 rounded-2xl bg-success px-6 text-lg font-bold text-success-foreground active:scale-95">
          {showAns ? t("Masquer la correction", "Hide the answers") : t("Voir la correction", "Show the answers")}
        </button>
      </section>

      <section className="mt-6 rounded-3xl bg-success/20 p-4 shadow-soft sm:p-6">
        <h2 className="mb-2 font-display text-2xl">🎯 Conclusion</h2>
        <ul className="space-y-1.5 text-base">
          {p.conclusion.map((c, i) => (
            <li key={i}>✔ {c}</li>
          ))}
        </ul>
      </section>

      <nav className="mt-6 flex justify-between gap-2">
        {prev ? (
          <Link to={prev.to} className="rounded-2xl bg-card px-4 py-3 font-bold shadow-soft">
            ← {t(prev.court, prev.courtEn)}
          </Link>
        ) : (
          <span />
        )}
        {next ? (
          <Link to={next.to} className="rounded-2xl bg-card px-4 py-3 font-bold shadow-soft">
            {t(next.court, next.courtEn)} →
          </Link>
        ) : (
          <span />
        )}
      </nav>
      <AuthorFooter compact />
    </div>
  );
}

export function Choice<V extends string>(p: { label: string; value: V; onChange: (v: V) => void; disabled?: boolean; options: { v: V; l: string }[] }) {
  return (
    <div>
      <p className="mb-1 text-sm font-semibold">{p.label}</p>
      <div className="grid grid-cols-2 gap-1.5">
        {p.options.map((o) => (
          <button
            key={o.v}
            disabled={p.disabled}
            onClick={() => p.onChange(o.v)}
            className={`min-h-11 rounded-xl px-2 text-sm font-semibold transition disabled:opacity-60 ${p.value === o.v ? "bg-primary text-primary-foreground" : "bg-muted"}`}
          >
            {o.l}
          </button>
        ))}
      </div>
    </div>
  );
}

export function Slider(p: { label: string; value: number; min: number; max: number; step?: number; unit?: string; disabled?: boolean; onChange: (v: number) => void }) {
  return (
    <div>
      <label className="mb-1 flex justify-between text-sm font-semibold">
        {p.label}
        <span>
          {p.value}
          {p.unit}
        </span>
      </label>
      <input type="range" min={p.min} max={p.max} step={p.step ?? 1} value={p.value} disabled={p.disabled} onChange={(e) => p.onChange(+e.target.value)} className="sim-range w-full" />
    </div>
  );
}

export function Bars(p: { items: { label: string; value?: number | undefined; color?: string | undefined }[]; max?: number; unit?: string }) {
  const max = p.max ?? Math.max(1, ...p.items.map((i) => i.value ?? 0));
  return (
    <div className="space-y-1.5">
      {p.items.map((i) => (
        <div key={i.label} className="flex items-center gap-2 text-sm">
          <span className="w-20 shrink-0 font-semibold">{i.label}</span>
          <div className="h-5 flex-1 overflow-hidden rounded-full bg-card">
            <div className="h-full rounded-full transition-all duration-300" style={{ width: `${((i.value ?? 0) / max) * 100}%`, background: i.color }} />
          </div>
          <span className="w-12 text-right tabular-nums">
            {Math.round(i.value ?? 0)}
            {p.unit}
          </span>
        </div>
      ))}
    </div>
  );
}
