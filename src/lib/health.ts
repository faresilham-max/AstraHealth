import { getStatus, type Reading } from "./metrics";

export type Mental = {
  mood: number;
  stress: number;
  fatigue: number;
  sleep: number;
  focus: number;
  lonely: number;
};

// Heures écoulées depuis la dernière fois
export type Since = { drink: number; eat: number; wc: number };

export const QUESTIONS: { key: keyof Mental; label: string }[] = [
  { key: "mood", label: "How are you feeling today? (mood)" },
  { key: "stress", label: "Stress level" },
  { key: "fatigue", label: "Fatigue level" },
  { key: "sleep", label: "Sleep quality" },
  { key: "focus", label: "Ability to concentrate" },
  { key: "lonely", label: "How lonely do you feel?" },
];

export const DEFAULT_MENTAL: Mental = {
  mood: 4, stress: 2, fatigue: 2, sleep: 4, focus: 4, lonely: 2,
};

// Score de 0 à 100 : plus il est haut, mieux c'est
export function mentalScore(m: Mental): number {
  const bad =
    (m.stress + m.fatigue + m.lonely + (6 - m.mood) + (6 - m.sleep) + (6 - m.focus)) / 6;
  return Math.round(100 - ((bad - 1) / 4) * 100);
}

// "done" : si présent, l'action a un bouton "Fait ✓" qui remet ce compteur à zéro
export type Action = { icon: string; text: string; done?: keyof Since };

export function getActions(r: Reading, m: Mental, s: Since): Action[] {
  const out: Action[] = [];

  if (s.drink > 3 || r.t > 37.5 || r.bpm > 100)
    out.push({ icon: "💧", text: "Drink about 250 ml of water", done: "drink" });
  if (s.eat > 5 || r.glu < 3.9)
    out.push({ icon: "🍽️", text: "Have a meal or a snack", done: "eat" });
  if (s.wc > 4)
    out.push({ icon: "🚻", text: "Take a bathroom break", done: "wc" });
  if (r.co2 > 1000)
    out.push({ icon: "🌬️", text: "Move closer to a ventilation outlet and check the module’s CO₂" });
  if (getStatus("spo2", r.spo2) > 0)
    out.push({ icon: "🫁", text: "Breathe slowly, rest and re-measure SpO₂ in 10 min" });
  if (m.sleep <= 2 || m.fatigue >= 4)
    out.push({ icon: "😴", text: "Plan a rest period" });
  if (m.stress >= 4 || m.lonely >= 4 || m.mood <= 2)
    out.push({ icon: "💬", text: "Talk to a crewmate or the psychological support team" });
  if (r.sys > 130 || r.bpm > 90)
    out.push({ icon: "🧘", text: "Take a calm break and re-measure blood pressure" });

  if (out.length === 0)
    out.push({ icon: "✅", text: "All good: keep up the routine (daily exercise)" });

  return out;
}