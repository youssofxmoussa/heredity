import { useCallback, useEffect, useRef, useState } from "react";

export type Sim = ReturnType<typeof useSim>;

/** Step-based simulation clock. Each step lasts 4 s × weight / speed. */
export function useSim(nSteps: number, weights?: number[]) {
  const [running, setRunning] = useState(false);
  const [started, setStarted] = useState(false);
  const [step, setStep] = useState(0);
  const [t, setT] = useState(0);
  const [speed, setSpeed] = useState(1);
  const speedRef = useRef(speed);
  speedRef.current = speed;
  const weightsRef = useRef(weights);
  weightsRef.current = weights;
  const pos = useRef(0);

  useEffect(() => {
    if (!running) return;
    let raf = 0;
    let last = performance.now();
    const tick = (now: number) => {
      const dt = Math.max(0, now - last);
      last = now;
      const w = weightsRef.current?.[Math.floor(pos.current)] ?? 1;
      pos.current += (dt / (4000 * w)) * speedRef.current;
      if (pos.current >= nSteps) {
        pos.current = nSteps - 1e-4;
        setRunning(false);
      }
      setStep(Math.floor(pos.current));
      setT(pos.current % 1);
      if (pos.current < nSteps - 1e-4) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [running, nSteps]);

  const toggle = useCallback(() => {
    if (pos.current >= nSteps - 0.001) return;
    setStarted(true);
    setRunning((r) => !r);
  }, [nSteps]);

  const reset = useCallback(() => {
    pos.current = 0;
    setRunning(false);
    setStarted(false);
    setStep(0);
    setT(0);
  }, []);

  return {
    running,
    started,
    step,
    t,
    speed,
    setSpeed,
    toggle,
    reset,
    done: started && !running && pos.current >= nSteps - 0.001,
    nSteps,
  };
}

/** Progress (0..1) of step i. */
export function phase(sim: Sim, i: number) {
  if (!sim.started) return 0;
  if (sim.step > i || sim.done) return 1;
  if (sim.step < i) return 0;
  return sim.t;
}

export function griffithResult(inj: string, enzyme: string) {
  if (inj === "S") return { meurt: true, sang: "S" };
  if (inj === "R" || inj === "Smort" || enzyme === "dnase") return { meurt: false, sang: "aucune" };
  return { meurt: true, sang: "S" };
}

export function hersheyResult(iso: string, agitation: number) {
  const eff = Math.min(0.9, 0.3 + agitation * 0.12);
  if (iso === "32P") {
    const culot = Math.round(100 - (1 - eff) * 10 - 15 * (1 - eff));
    return { culot, surnageant: 100 - culot, descendance: true };
  }
  const s = Math.round(eff * 100);
  return { culot: 100 - s, surnageant: s, descendance: false };
}

export function chargaff(pA: number) {
  const g = 50 - pA;
  return { A: pA, T: pA, G: g, C: g };
}

export const COMP: Record<string, string> = { A: "T", T: "A", G: "C", C: "G" };
export const RNA_COMP: Record<string, string> = { A: "U", U: "A", G: "C", C: "G" };

export function meselson(model: string, gen: number) {
  if (gen === 0) return { lourd: 1, hybride: 0, leger: 0, dispersif: null as number | null };
  if (model === "semi") {
    const h = 2 / 2 ** gen;
    return { lourd: 0, hybride: h, leger: 1 - h, dispersif: null };
  }
  if (model === "conservatif") {
    const l = 1 / 2 ** gen;
    return { lourd: l, hybride: 0, leger: 1 - l, dispersif: null };
  }
  return { lourd: 0, hybride: 0, leger: 0, dispersif: 1 / 2 ** gen };
}

const ORDER = "UCAG";
const TABLE = "FFLLSSSSYY**CC*WLLLLPPPPHHQQRRRRIIIMTTTTNNKKSSRRVVVVAAAADDEEGGGG";
const NAMES: Record<string, string> = {
  F: "Phe", L: "Leu", S: "Ser", Y: "Tyr", C: "Cys", W: "Trp", P: "Pro", H: "His", Q: "Gln", R: "Arg",
  I: "Ile", M: "Met", T: "Thr", N: "Asn", K: "Lys", V: "Val", A: "Ala", D: "Asp", E: "Glu", G: "Gly", "*": "STOP",
};

export function translateCodon(codon: string) {
  const [a = "", b = "", c = ""] = codon.split("");
  const i = ORDER.indexOf(a) * 16 + ORDER.indexOf(b) * 4 + ORDER.indexOf(c);
  if (ORDER.indexOf(a) < 0 || ORDER.indexOf(b) < 0 || ORDER.indexOf(c) < 0) return "STOP";
  return NAMES[TABLE[i] ?? "*"] ?? "STOP";
}

/** Read an mRNA from the first AUG until a stop codon (or the end). */
export function readFrame(mrna: string) {
  const start = mrna.indexOf("AUG");
  if (start < 0) return { start: -1, codons: [] as string[], aa: [] as string[], stop: false };
  const codons: string[] = [];
  const aa: string[] = [];
  let stop = false;
  for (let i = start; i + 3 <= mrna.length; i += 3) {
    const c = mrna.slice(i, i + 3);
    codons.push(c);
    const a = translateCodon(c);
    if (a === "STOP") {
      stop = true;
      break;
    }
    aa.push(a);
  }
  return { start, codons, aa, stop };
}

export const MRNAS: Record<string, string> = {
  cours: "AUAUGCGAGUCCGGCCCUAA",
  g2: "GCAUGGCUUUCAAAGGAUGA",
};

export function mutate(seq: string, mutation: string) {
  const n = seq.indexOf("AUG");
  if (mutation === "faux") return seq.slice(0, n + 7) + "C" + seq.slice(n + 8);
  if (mutation === "non") return seq.slice(0, n + 3) + "UGA" + seq.slice(n + 6);
  if (mutation === "ins") return seq.slice(0, n + 3) + "A" + seq.slice(n + 3);
  return seq;
}
