import {
  fmt, getStatus, KEYS, METRICS,
  type MetricKey, type Reading, type Status,
} from "./metrics";

const SHORT: Record<MetricKey, string> = {
  bpm: "BPM", sys: "Systolic", dia: "Diastolic", spo2: "SpO₂", co2: "CO₂",
  t: "Temperature", ambient: "Cabin temperature", rr: "Breathing", glu: "Glucose", hum: "Humidity",
};

export type Anomaly = { key: MetricKey; status: Status; text: string };

// Renvoie les métriques qui expliquent l'état de l'astronaute :
// les critiques s'il y en a, sinon celles « en attention », sinon rien.
export function anomalies(r: Reading): Anomaly[] {
  const bad = KEYS.map((k) => ({ key: k, status: getStatus(k, r[k]) })).filter((a) => a.status > 0);
  if (bad.length === 0) return [];
  const worst = Math.max(...bad.map((a) => a.status));
  return bad
    .filter((a) => a.status === worst)
    .map((a) => ({ ...a, text: `${SHORT[a.key]} ${fmt(a.key, r[a.key])} ${METRICS[a.key].unit}` }));
}