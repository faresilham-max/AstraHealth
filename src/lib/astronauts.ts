import type { Reading } from "./metrics";

export type Astronaut = { id: number; name: string; role: string; base: Reading };

export const ASTRONAUTS: Astronaut[] = [
  {
    id: 1,
    name: "Ilham",
    role: "Commander",
    base: { bpm: 68, sys: 118, dia: 76, spo2: 98, co2: 620, t: 36.6, ambient: 22.4, rr: 14, glu: 5.1, hum: 45 },
  },
  {
    id: 2,
    name: "Tasnim",
    role: "Pilot",
    base: { bpm: 72, sys: 122, dia: 78, spo2: 98, co2: 700, t: 36.7, ambient: 22.8, rr: 15, glu: 5.3, hum: 47 },
  },
  {
    id: 3,
    name: "Ouafae",
    role: "Engineer",
    base: { bpm: 64, sys: 114, dia: 72, spo2: 99, co2: 580, t: 36.5, ambient: 22.1, rr: 13, glu: 4.9, hum: 44 },
  },
  {
    id: 4,
    name: "BAYOU",
    role: "Flight Surgeon",
    base: { bpm: 70, sys: 120, dia: 77, spo2: 97, co2: 820, t: 36.7, ambient: 23.2, rr: 14, glu: 5.0, hum: 50 },
  },
  {
    id: 5,
    name: "Anas",
    role: "Specialist",
    base: { bpm: 75, sys: 126, dia: 82, spo2: 97, co2: 900, t: 36.8, ambient: 22.6, rr: 16, glu: 5.6, hum: 46 },
  },
];