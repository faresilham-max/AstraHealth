import { getStatus, KEYS, METRICS, type Reading } from "./metrics";

export type Prediction = {
  probability: number; // 3 à 98 (%)
  level: 0 | 1 | 2;
  label: string;
  reasons: string[];
};

const LABELS = ["Normal", "Watch closely", "Likely critical case"];

// Tendance : moyenne des 5 dernières mesures moins moyenne des 5 précédentes
function trend(values: number[]): number {
  const last10 = values.slice(-10);
  const avg = (a: number[]) => a.reduce((s, v) => s + v, 0) / a.length;
  return (avg(last10.slice(5)) - avg(last10.slice(0, 5))) / 5;
}

export function predict(history: Reading[]): Prediction {
  const last = history[history.length - 1];
  let score = 0;
  const reasons: string[] = [];

  // 1) État actuel de chaque métrique
  KEYS.forEach((k) => {
    const s = getStatus(k, last[k]);
    if (s === 1) {
      score += 10;
      reasons.push(`${METRICS[k].label} in warning zone`);
    }
    if (s === 2) {
      score += 25;
      reasons.push(`${METRICS[k].label} critical`);
    }
  });

  // 2) Tendances récentes
  if (trend(history.map((r) => r.bpm)) > 0.4) {
    score += 12;
    reasons.push("Heart rate rising");
  }
  if (trend(history.map((r) => r.co2)) > 8) {
    score += 12;
    reasons.push("CO₂ rising");
  }
  if (trend(history.map((r) => r.spo2)) < -0.15) {
    score += 10;
    reasons.push("SpO₂ dropping");
  }

  const probability = Math.round(Math.min(98, Math.max(3, score + 3)));
  const level = probability < 30 ? 0 : probability < 60 ? 1 : 2;

  return { probability, level, label: LABELS[level], reasons };
}