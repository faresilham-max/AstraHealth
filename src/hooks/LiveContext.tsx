import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { ASTRONAUTS, type Astronaut } from "../lib/astronauts";
import { KEYS, type MetricKey, type Reading } from "../lib/metrics";
import { ESP_URL, MODE, POLL_MS, REAL_ID, REAL_KEYS } from "../lib/config";

type Live = Record<number, Reading[]>;
type SensorFields = { ambient: boolean; hum: boolean };
type Ctx = {
  data: Live;
  connected: boolean;
  sensorFields: SensorFields;
};

const MAX = 30; // mesures gardées pour les courbes
const TICK_MS = 2000;

const NOISE: Record<MetricKey, number> = {
  bpm: 1.6, sys: 1.6, dia: 1.2, spo2: 0.4, co2: 40, t: 0.08, ambient: 0.2, rr: 0.6, glu: 0.08, hum: 0.5,
};

const LiveContext = createContext<Ctx>({
  data: {},
  connected: false,
  sensorFields: { ambient: false, hum: false },
});

function initial(): Live {
  const out: Live = {};
  ASTRONAUTS.forEach((a) => {
    out[a.id] = Array.from({ length: MAX }, () => ({ ...a.base }));
  });
  return out;
}

// Calcule la mesure suivante d'un astronaute
function nextReading(a: Astronaut, last: Reading, tick: number, real: Partial<Reading>): Reading {
  const r = { ...last };
  KEYS.forEach((k) => {
    // Mesures venant de l'ESP32 (astronaute 1 seulement)
    if (MODE === "esp32" && a.id === REAL_ID && REAL_KEYS.includes(k)) {
      const v = real[k];
      if (typeof v === "number") r[k] = v;
      return;
    }
    // Sinon : simulation. L'astronaute 4 dérive peu à peu (CO₂ et BPM en hausse)
    const drifting = a.id === 4 && tick > 6 && k === "co2";
    const pull = drifting ? 0 : (a.base[k] - last[k]) * 0.08;
    let v = last[k] + (Math.random() - 0.5) * NOISE[k] + pull;
    if (a.id === 4 && tick > 6) {
      if (k === "bpm") v += 0.9;
      if (k === "co2") v += 22;
    }
    if (k === "spo2") v = Math.min(100, v);
    if (k === "co2") v = Math.min(v, 2600);
    r[k] = v;
  });
  return r;
}

export function LiveProvider({ children }: { children: ReactNode }) {
  const [data, setData] = useState<Live>(initial);
  const [connected, setConnected] = useState(MODE === "simulation");
  const [sensorFields, setSensorFields] = useState<SensorFields>({
    ambient: false,
    hum: false,
  });
  const real = useRef<Partial<Reading>>({}); // dernières valeurs reçues de l'ESP32

  // 1) Toutes les 2 s : construire une nouvelle mesure pour chaque astronaute
  useEffect(() => {
    let tick = 0;
    const timer = setInterval(() => {
      tick++;
      setData((prev) => {
        const next: Live = {};
        ASTRONAUTS.forEach((a) => {
          const hist = prev[a.id];
          next[a.id] = [...hist.slice(1), nextReading(a, hist[hist.length - 1], tick, real.current)];
        });
        return next;
      });
    }, TICK_MS);
    return () => clearInterval(timer);
  }, []);

  // 2) En mode ESP32 : demander les mesures à la carte
  useEffect(() => {
    if (MODE !== "esp32") return;
    let stopped = false;

    async function poll() {
      const ctrl = new AbortController();
      const abort = setTimeout(() => ctrl.abort(), 1500);
      try {
        const res = await fetch(`${ESP_URL}/api/data`, { signal: ctrl.signal });
        if (!res.ok) throw new Error(`ESP32 returned HTTP ${res.status}`);
        const body: unknown = await res.json();
        if (typeof body !== "object" || body === null || Array.isArray(body)) {
          throw new Error("ESP32 returned an invalid sensor payload");
        }
        const m = body as Record<string, unknown>;
        const ok = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
        const available: SensorFields = {
          ambient: ok(m.t) && m.t >= -40 && m.t <= 80,
          hum: ok(m.hum) && m.hum >= 0 && m.hum <= 100,
        };
        if (available.ambient && ok(m.t)) real.current.ambient = m.t;
        if (available.hum && ok(m.hum)) real.current.hum = m.hum;
        setSensorFields((previous) => ({
          ambient: previous.ambient || available.ambient,
          hum: previous.hum || available.hum,
        }));
        if (!stopped) setConnected(true);
      } catch {
        if (!stopped) setConnected(false);
      } finally {
        clearTimeout(abort);
      }
    }

    poll();
    const timer = setInterval(poll, POLL_MS);
    return () => {
      stopped = true;
      clearInterval(timer);
    };
  }, []);

  return (
    <LiveContext.Provider value={{ data, connected, sensorFields }}>
      {children}
    </LiveContext.Provider>
  );
}

export function useLive() {
  return useContext(LiveContext).data;
}

export function useStatus() {
  const { connected, sensorFields } = useContext(LiveContext);
  return { mode: MODE, connected, sensorFields };
}