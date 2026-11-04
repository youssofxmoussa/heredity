---
name: legend-motion
description: Apple-style UI motion design for explainer videos and in-app animation — kinetic word-by-word typography, floating UI cards with spring pop-ins, blurred gradient sweeps, cursor interactions, scribble annotations, light/dark scene rhythm and a clean end card. Use when the user asks for a promo/explainer video "like the reference", premium UI motion, motion graphics, or Framer Motion (motion/react) animation polish.
---

# LegendMotion

Style DNA distilled from the user's reference reel (Instagram "Save Reminders" concept) plus Framer Motion principles. Absorb the feeling; never copy a reference shot for shot.

## 1. Scene rhythm
- Alternate **light canvas** scenes (near-white / project background) with **dark scenes** (deep ink, never pure #000 unless asked). Switch every 2–4 s.
- One idea per scene. Hold each finished state ≥ 0.6 s so it can be read.
- Cut on motion: the outgoing element's exit drives the incoming one (whip blur, scale-through, mask wipe).
- Total pacing: hook in the first 2 s, end on a quiet card (title + handle + small disclaimer line) on dark.

## 2. Kinetic typography
- Words appear one at a time, 80–140 ms stagger, each rising 12–20 px with opacity 0→1 and blur 8px→0.
- Mix weights in one line: light/regular words + one **bold keyword** (e.g. "Mais, *quoi* si…"). Keyword can color-shift to the accent.
- Giant words (≥ 30 % frame width) sweep horizontally with motion blur and a soft gradient fill, partly out of frame.
- Captions in brackets, small, centered low: `[cette protéine ?]`.
- Display serif for titles, clean sans for body; tracking slightly negative on big type.

## 3. UI cards as actors
- Build real-looking UI (post card, settings card with toggle, date pickers, primary button, notification chip) — rounded 16–24 px, soft long shadow, 1 px hairline border.
- Entrance: spring scale 0.85→1, y +40→0 — `{ type: "spring", stiffness: 260, damping: 22 }`. Children stagger 40–60 ms.
- A cursor travels on an eased arc, presses (scale 0.9, 120 ms), and the target reacts (toggle slides, button darkens, icon fills).
- Notifications slide in from the side and stack with slight rotation and depth offset.

## 4. Depth & finish
- Shallow depth of field: background layers blurred 6–14 px, foreground sharp; animate focus pulls between them.
- Subtle camera: slow push-in 1.00→1.06 over a hold; small parallax between layers.
- Glow + vignette on dark scenes; light grain overall; warm bokeh dots for emotion beats.
- Hand-drawn scribble annotations (arrows, underlines, words) draw on with stroke-dashoffset in 400–700 ms, slightly jittery, in a bright accent.

## 5. Motion vocabulary (Framer Motion mapping)
| Need | Use |
| --- | --- |
| Pop-in | `initial={{scale:.85,opacity:0,y:40}} animate={{scale:1,opacity:1,y:0}}` + spring |
| Stagger | parent `variants` with `staggerChildren: .05–.12` |
| Exit | `AnimatePresence` + `exit={{opacity:0,y:-20,filter:"blur(8px)"}}` |
| Shared element | `layoutId` to morph a card into the next scene |
| Easing for tweens | `[0.22, 1, 0.36, 1]` (out-expo-like) — never linear except constant drifts |
Principles: anticipation (tiny dip before a big move), overshoot then settle, nothing ever fully still (micro drift during holds), never animate more than ~3 focal things at once.

## 6. Palette & brand
Use the project's own design tokens (read `src/styles.css`). Light scenes = background/card tokens; dark scenes = darkest ink token; accents = primary + one highlight. Never introduce off-brand colors.

## 7. Workflow for a video
1. Read the content source (routes, copy) and list one beat per scene with its on-screen text (in the user's language).
2. Pick per beat: kinetic text, UI-card demo, or illustration scene; enforce light/dark alternation.
3. Collect brand assets (icons, logo) — pass real paths, invent no facts.
4. Render, then check frames at every scene boundary: text clipping, overlaps, readability, holds long enough.
5. End card: title, credit handle, one-line small print.

## 8. Quality bar — reject if
- Any text is cut off, overlaps, or is on screen < 0.6 s after fully appearing.
- Linear easing on entrances, or everything enters at once.
- Colors outside the brand tokens, emojis, or generic purple gradients.
