export type MetricKey = "bpm" | "sys" | "dia" | "spo2" | "co2" | "t" | "ambient" | "rr" | "glu" | "hum";
export type Reading = Record<MetricKey, number>;
export type Status = 0 | 1 | 2;

// range = [normalMin, normalMax, attentionMin, attentionMax]
export const METRICS: Record<
  MetricKey,
  { label: string; unit: string; dec: number; range: [number, number, number, number] }
> = {
  bpm: { label: "Heart rate", unit: "BPM", dec: 0, range: [50, 90, 40, 110] },
  sys: { label: "Systolic pressure", unit: "mmHg", dec: 0, range: [100, 130, 90, 145] },
  dia: { label: "Diastolic pressure", unit: "mmHg", dec: 0, range: [60, 85, 50, 95] },
  spo2: { label: "SpO₂", unit: "%", dec: 0, range: [95, 101, 92, 101] },
  co2: { label: "Cabin CO₂", unit: "ppm", dec: 0, range: [0, 1000, 0, 2000] },
  t: { label: "Temperature", unit: "°C", dec: 1, range: [36, 37.5, 35.5, 38.3] },
  ambient: { label: "Cabin temperature", unit: "°C", dec: 1, range: [18, 26, 10, 35] },
  rr: { label: "Respiratory rate", unit: "/min", dec: 0, range: [12, 20, 10, 26] },
  glu: { label: "Blood glucose", unit: "mmol/L", dec: 1, range: [3.9, 7.8, 3.3, 10] },
  hum: { label: "Cabin humidity", unit: "%", dec: 0, range: [30, 60, 20, 70] },
};

export const KEYS = Object.keys(METRICS) as MetricKey[];

export const STATUS_LABEL = ["Stable", "Warning", "Critical"];

// 0 = normal, 1 = attention, 2 = critique
export function getStatus(key: MetricKey, value: number): Status {
  const [nMin, nMax, wMin, wMax] = METRICS[key].range;
  if (value >= nMin && value <= nMax) return 0;
  if (value >= wMin && value <= wMax) return 1;
  return 2;
}

export function fmt(key: MetricKey, value: number): string {
  return value.toFixed(METRICS[key].dec);
}

// Le pire statut parmi toutes les métriques d'un astronaute
export function worstStatus(r: Reading): Status {
  return Math.max(...KEYS.map((k) => getStatus(k, r[k]))) as Status;
}