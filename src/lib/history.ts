import { KEYS, type Reading } from "./metrics";
import { ASTRONAUTS } from "./astronauts";
import { REAL_ID } from "./config";

export type Sample = { ts: number; v: Reading };

const PREFIX = "astra-hist-v1-";
const LEGACY_KEYS = KEYS.filter((key) => key !== "ambient");
export const SAMPLE_MS = 15000;   // un point toutes les 15 secondes
const MAX_SAMPLES = 1440;         // 1440 x 15 s = 6 heures

const storageKey = (id: number) => PREFIX + id;

// Format compact : [horodatage, valeur de chaque métrique dans l'ordre de KEYS]
function readRows(id: number): number[][] {
  try {
    const raw = localStorage.getItem(storageKey(id));
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function getSamples(id: number): Sample[] {
  return readRows(id)
    .filter((r) => r.length === KEYS.length + 1 || r.length === LEGACY_KEYS.length + 1)
    .map((r) => {
      const v = {} as Reading;
      if (r.length === LEGACY_KEYS.length + 1) {
        LEGACY_KEYS.forEach((key, index) => {
          v[key] = r[index + 1];
        });
        const astronaut = ASTRONAUTS.find((item) => item.id === id);
        v.ambient = id === REAL_ID
          ? v.t
          : astronaut?.base.ambient ?? 22;
      } else {
        KEYS.forEach((key, index) => {
          v[key] = r[index + 1];
        });
      }
      return { ts: r[0], v };
    });
}

export function addSample(id: number, v: Reading, ts = Date.now()) {
  const rows = readRows(id);
  rows.push([ts, ...KEYS.map((k) => Math.round(v[k] * 100) / 100)]);
  const trimmed = rows.slice(-MAX_SAMPLES);
  try {
    localStorage.setItem(storageKey(id), JSON.stringify(trimmed));
  } catch {
    // stockage plein : on garde seulement la moitié la plus récente
    try {
      localStorage.setItem(
        storageKey(id),
        JSON.stringify(trimmed.slice(Math.floor(trimmed.length / 2)))
      );
    } catch {
      /* on abandonne cet enregistrement */
    }
  }
}

export function clearSamples(id: number) {
  try {
    localStorage.removeItem(storageKey(id));
  } catch {
    /* rien à faire */
  }
}

export function toCsv(samples: Sample[]): string {
  const header = ["timestamp", ...KEYS].join(",");
  const lines = samples.map((s) =>
    [new Date(s.ts).toISOString(), ...KEYS.map((k) => s.v[k])].join(",")
  );
  return [header, ...lines].join("\n");
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}