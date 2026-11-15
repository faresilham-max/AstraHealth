import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import MetricCard from "../components/MetricCard";
import MentalHealthForm from "../components/MentalHealthForm";
import { anomalies } from "../lib/anomalies";
import { ASTRONAUTS } from "../lib/astronauts";
import { isReal } from "../lib/config";
import { KEYS, STATUS_LABEL, worstStatus } from "../lib/metrics";
import { DEFAULT_MENTAL, getActions, type Mental, type Since } from "../lib/health";
import { useLive } from "../hooks/LiveContext";
import { useAlerts } from "../hooks/AlertsContext";

const START: Since = { drink: 2.5, eat: 4.5, wc: 3.5 };

export default function Astronaut() {
  const { id } = useParams();
  const astro = ASTRONAUTS.find((a) => a.id === Number(id));
  const live = useLive();
  const { triggerEmergency } = useAlerts();

  const [mental, setMental] = useState<Mental>(DEFAULT_MENTAL);
  const [since, setSince] = useState<Since>(START);

  // Le temps passe : toutes les 3 s, les compteurs augmentent
  useEffect(() => {
    const t = setInterval(() => {
      setSince((s) => ({ drink: s.drink + 0.1, eat: s.eat + 0.1, wc: s.wc + 0.1 }));
    }, 3000);
    return () => clearInterval(t);
  }, []);

  // Quand on change d'astronaute, on repart de zéro
  useEffect(() => {
    setMental(DEFAULT_MENTAL);
    setSince(START);
  }, [id]);

  if (!astro) {
    return (
      <p>
        Astronaut not found. <Link to="/">Back</Link>
      </p>
    );
  }

  const history = live[astro.id];
  const last = history[history.length - 1];
  const status = worstStatus(last);
  const bad = anomalies(last);
  const actions = getActions(last, mental, since);

  return (
    <div>
      <p>
        <Link to="/">← Back to dashboard</Link>
      </p>

      <h2 className="page-title">
        {astro.name} <small className="muted">· {astro.role}</small>{" "}
        <span className={`tag t${status}`}>{STATUS_LABEL[status]}</span>
        {bad.map((a) => (
          <span key={a.key} className={`anom t${a.status}`}>{a.text}</span>
        ))}
      </h2>

      <div className="metrics-grid">
        {KEYS.filter((k) => astro.id !== 1 || (k !== "bpm" && k !== "t")).map((k) => (
          <MetricCard
            key={k}
            astronautId={astro.id}
            metric={k}
            history={history}
            real={isReal(astro.id, k)}
          />
        ))}
      </div>

      <div className="wide-stack">
        <div className="card">
          <h3>Recommended actions</h3>
          <div className="actions-list">
            {actions.map((a, i) => {
              const key = a.done;
              return (
                <div className="metric" key={i}>
                  <span>
                    {a.icon} {a.text}
                  </span>
                  {key && (
                    <button className="alt" onClick={() => setSince({ ...since, [key]: 0 })}>
                      Done ✓
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <MentalHealthForm value={mental} onChange={setMental} />
      </div>

      <div style={{ marginTop: 14 }}>
        <button className="danger" onClick={() => triggerEmergency(astro.id)}>
          Simulate loss of consciousness
        </button>
      </div>
    </div>
  );
}