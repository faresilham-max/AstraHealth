import { Link } from "react-router-dom";
import { ASTRONAUTS } from "../lib/astronauts";
import { predict } from "../lib/predict";
import { useLive } from "../hooks/LiveContext";

const COLOR = ["ok", "w", "c"];

export default function Predictions() {
  const live = useLive();

  const rows = ASTRONAUTS.map((a) => ({ a, p: predict(live[a.id]) })).sort(
    (x, y) => y.p.probability - x.p.probability
  );

  return (
    <div>
      <h2>🔮 Predictions</h2>
      <p className="muted">Astronauts ranked from highest to lowest risk.</p>

      <div className="crew-grid">
        {rows.map(({ a, p }) => (
          <div className={`card ${p.level === 2 ? "crit" : ""}`} key={a.id}>
            <div className="card-head">
              <Link to={`/astronaut/${a.id}`}>
                <b>🧑‍🚀 {a.name}</b>
              </Link>
              <span className={`tag t${p.level}`}>{p.label}</span>
            </div>
            <small className="muted">{a.role}</small>

            <div className="big">{p.probability}%</div>
            <div className="bar">
              <i style={{ width: `${p.probability}%`, background: `var(--${COLOR[p.level]})` }} />
            </div>

            <small className="muted">
              {p.reasons.length ? p.reasons.join(" · ") : "No risk factors detected"}
            </small>
          </div>
        ))}
      </div>

      <p className="muted">
        Demo model based on rules and trends. It will be replaced by a Machine Learning model trained on the collected data.
      </p>
    </div>
  );
}