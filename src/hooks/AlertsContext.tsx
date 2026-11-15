import {
  createContext, useCallback, useContext, useEffect, useRef, useState,
  type ReactNode,
} from "react";
import { ASTRONAUTS } from "../lib/astronauts";
import { fmt, getStatus, KEYS, METRICS } from "../lib/metrics";
import { useLive } from "./LiveContext";

export type AlertItem = {
  id: string;
  ts: number;
  astronautId: number;
  astronautName: string;
  message: string;
  level: "critical" | "emergency";
};

type Ctx = {
  alerts: AlertItem[];
  emergency: AlertItem | null;
  triggerEmergency: (astronautId: number) => void;
  acknowledge: () => void;
  clearAlerts: () => void;
};

const AlertsContext = createContext<Ctx | null>(null);

export function AlertsProvider({ children }: { children: ReactNode }) {
  const live = useLive();
  const [alerts, setAlerts] = useState<AlertItem[]>([]);
  const [emergency, setEmergency] = useState<AlertItem | null>(null);
  const lastSeen = useRef<Record<string, number>>({});

  // Alertes automatiques : une mesure critique crée une alerte (1 par minute max)
  useEffect(() => {
    const now = Date.now();
    const fresh: AlertItem[] = [];

    ASTRONAUTS.forEach((a) => {
      const hist = live[a.id];
      if (!hist) return;
      const last = hist[hist.length - 1];
      KEYS.forEach((k) => {
        if (getStatus(k, last[k]) !== 2) return;
        const key = `${a.id}-${k}`;
        if (lastSeen.current[key] && now - lastSeen.current[key] < 60000) return;
        lastSeen.current[key] = now;
        fresh.push({
          id: `${key}-${now}`,
          ts: now,
          astronautId: a.id,
          astronautName: a.name,
          message: `${METRICS[k].label} critical: ${fmt(k, last[k])} ${METRICS[k].unit}`,
          level: "critical",
        });
      });
    });

    if (fresh.length) setAlerts((prev) => [...fresh, ...prev].slice(0, 50));
  }, [live]);

  const triggerEmergency = useCallback((astronautId: number) => {
    const a = ASTRONAUTS.find((x) => x.id === astronautId);
    if (!a) return;
    const item: AlertItem = {
      id: `emergency-${astronautId}-${Date.now()}`,
      ts: Date.now(),
      astronautId,
      astronautName: a.name,
      message: "LOSS OF CONSCIOUSNESS",
      level: "emergency",
    };
    setEmergency(item);
    setAlerts((prev) => [item, ...prev].slice(0, 50));
  }, []);

  const acknowledge = useCallback(() => setEmergency(null), []);
  const clearAlerts = useCallback(() => setAlerts([]), []);

  return (
    <AlertsContext.Provider value={{ alerts, emergency, triggerEmergency, acknowledge, clearAlerts }}>
      {children}
    </AlertsContext.Provider>
  );
}

export function useAlerts() {
  const ctx = useContext(AlertsContext);
  if (!ctx) throw new Error("useAlerts must be used inside an AlertsProvider");
  return ctx;
}