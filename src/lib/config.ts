import type { MetricKey } from "./metrics";

// "esp32" = vraies données de l'ESP32 ; "simulation" = tout est simulé
export const MODE: "esp32" | "simulation" =
  import.meta.env.VITE_DATA_MODE === "esp32" ? "esp32" : "simulation";

// Adresse de l'ESP32 sur le réseau, sans "/" à la fin
export const ESP_URL: string = String(import.meta.env.VITE_ESP32_URL ?? "").replace(/\/$/, "");

export const POLL_MS = 2000;

// Les seules mesures physiques connectées sont celles du DHT11.
export const REAL_ID = 1;
export const REAL_KEYS: MetricKey[] = ["ambient", "hum"];

export function isReal(astronautId: number, key: MetricKey): boolean {
  return MODE === "esp32" && astronautId === REAL_ID && REAL_KEYS.includes(key);
}