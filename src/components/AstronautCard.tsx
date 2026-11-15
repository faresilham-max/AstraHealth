import { Link } from "react-router-dom";
import { anomalies } from "../lib/anomalies";
import {
  fmt, getStatus, METRICS, STATUS_LABEL, worstStatus,
  type MetricKey, type Reading,
} from "../lib/metrics";

type Props = { id: number; name: string; role: string; reading: Reading };

const SHOWN: MetricKey[] = ["ambient", "hum", "spo2", "co2"];

export default function AstronautCard({ id, name, role, reading }: Props) {
  const w = worstStatus(reading);
  const bad = anomalies(reading);
  const tensionStatus = Math.max(getStatus("sys", reading.sys), getStatus("dia", reading.dia));

  return (
    <Link to={`/astronaut/${id}`} className={`card ${w === 2 ? "crit" : ""}`}>
      <div className="card-head">
        <b>🧑‍🚀 {name}</b>
        <span className="status-group">
          <span className={`tag t${w}`}>{STATUS_LABEL[w]}</span>
          {bad.map((a) => (
            <span key={a.key} className={`anom t${a.status}`}>{a.text}</span>
          ))}
        </span>
      </div>
      <small className="muted">{role}</small>

      {SHOWN.map((k) => (
        <div className="metric" key={k}>
          <span>{METRICS[k].label}</span>
          <span className={`val s${getStatus(k, reading[k])}`}>
            {fmt(k, reading[k])} {METRICS[k].unit}
          </span>
        </div>
      ))}

      <div className="metric">
        <span>Tension</span>
        <span className={`val s${tensionStatus}`}>
          {fmt("sys", reading.sys)}/{fmt("dia", reading.dia)} mmHg
        </span>
      </div>
    </Link>
  );
}