import AstronautCard from "../components/AstronautCard";
import { ASTRONAUTS } from "../lib/astronauts";
import { useLive, useStatus } from "../hooks/LiveContext";
import { useAssistantSpeech } from "../hooks/useAssistantSpeech";
import { fmt, getStatus, STATUS_LABEL, type MetricKey } from "../lib/metrics";

const SENSOR_METRICS: { key: MetricKey; label: string }[] = [
  { key: "ambient", label: "Température ambiante" },
  { key: "hum", label: "Humidité ambiante" },
];

const STATUS_IN_FRENCH = ["normale", "à surveiller", "critique"];

export default function Dashboard() {
  const live = useLive();
  const { mode, connected, sensorFields } = useStatus();
  const speech = useAssistantSpeech();

  const reading = live[1]?.[live[1].length - 1];
  const configured = mode === "esp32";
  const hasValue = (key: MetricKey) => configured && Boolean(sensorFields[key === "ambient" ? "ambient" : "hum"]);
  const sensorStatus = !configured
    ? "Capteurs non configurés"
    : connected
      ? "ESP32 connecté"
      : "ESP32 hors ligne";

  function speakSummary() {
    if (!reading || !configured) {
      speech.speak("Les capteurs DHT11 ne sont pas configurés. Connectez l’ESP32 pour afficher les mesures.");
      return;
    }

    const parts = [connected
      ? "ESP32 connecté. Voici les mesures du capteur DHT onze."
      : "ESP32 hors ligne. Les dernières mesures reçues peuvent être anciennes."];
    SENSOR_METRICS.forEach(({ key, label }) => {
      if (!hasValue(key)) {
        parts.push(`${label} : aucune mesure disponible.`);
        return;
      }
      const unit = key === "ambient" ? "degrés Celsius" : "pour cent";
      const status = STATUS_IN_FRENCH[getStatus(key, reading[key])];
      parts.push(`${label} : ${fmt(key, reading[key])} ${unit}, valeur ${status}.`);
    });
    parts.push("Le DHT11 mesure l’air ambiant et non la température du corps.");
    speech.speak(parts.join(" "));
  }

  return (
    <div>
      <h2>🪐 Crew dashboard</h2>
      <section className="device-panel" aria-labelledby="sensor-title">
        <div className="device-head">
          <div>
            <h3 id="sensor-title">Mesures des capteurs</h3>
            <p className="muted">DHT11 · GPIO 4 · Astronaute Ilham</p>
          </div>
          <span className={`tag ${!configured ? "t1" : connected ? "t0" : "t2"}`}>
            {sensorStatus}
          </span>
        </div>

        <div className="sensor-grid">
          {SENSOR_METRICS.map(({ key, label }) => {
            const available = hasValue(key);
            const status = available ? getStatus(key, reading?.[key] ?? 0) : null;
            const value = available
              ? `${fmt(key, reading?.[key] ?? 0)} ${key === "ambient" ? "°C" : "%"}`
              : "En attente de mesure";
            return (
              <div className="sensor-stat" key={key}>
                <span className="sensor-label">{label}</span>
                <b className={status === null ? "" : `s${status}`}>{value}</b>
                <small className="muted">
                  {status === null ? "Donnée DHT11 indisponible" : STATUS_LABEL[status]}
                </small>
              </div>
            );
          })}
        </div>

        <div className="row">
          <button onClick={speech.speaking ? speech.stop : speakSummary} aria-pressed={speech.speaking}>
            {speech.speaking ? "Arrêter la lecture audio" : "Lire le résumé vocal"}
          </button>
        </div>
        {speech.message && <p className="muted" role="status">{speech.message}</p>}
        <p className="muted sensor-note">
          Le DHT11 mesure la température et l’humidité ambiantes, pas la température corporelle.
        </p>
      </section>

      <div className="crew-grid">
        {ASTRONAUTS.map((a) => {
          const hist = live[a.id];
          const last = hist[hist.length - 1];
          return (
            <AstronautCard key={a.id} id={a.id} name={a.name} role={a.role} reading={last} />
          );
        })}
      </div>
      <p className="muted">
        Seules la température et l’humidité ambiantes sont mesurées par le DHT11 actuellement connecté.
      </p>
    </div>
  );
}
