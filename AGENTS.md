<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Project rules
- Every user-facing string goes through `useT()(fr, en)` from `src/lib/i18n.tsx`; French is the default (SSR) and English is selected client-side via the top-right switch. Why: the app is bilingual and untranslated strings were the main bug.
- Lessons share `SheetLayout` + `useSim` (src/components, src/lib/genetics.ts); the translation animation lives in `src/components/TranslationScene.tsx` with the ribosome fixed and the mRNA sliding. Why: keeps all six sheets consistent.
