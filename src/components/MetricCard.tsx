import { Link } from "react-router-dom";
import { LineChart, Line, YAxis, ResponsiveContainer } from "recharts";
import { fmt, getStatus, METRICS, type MetricKey, type Reading } from "../lib/metrics";

const COLORS = ["#4f9d84", "#d49a3a", "#c8503f"];

const ICON: Record<MetricKey, string> = {
  bpm: "❤️", sys: "🩸", dia: "🩸", spo2: "🫁", co2: "☁️",
  t: "🌡️", ambient: "🌡️", rr: "💨", glu: "🍬", hum: "💧",
};

type Props = { astronautId: number; metric: MetricKey; history: Reading[]; real?: boolean };

export default function MetricCard({ astronautId, metric, history, real = false }: Props) {
  const m = METRICS[metric];
  const last = history[history.length - 1][metric];
  const s = getStatus(metric, last);
  const data = history.map((r, i) => ({ i, v: r[metric] }));

  return (
    <Link
      to={`/astronaut/${astronautId}/${metric}`}
      className="card metric-card"
      aria-label={`View details: ${m.label}`}
    >
      <small className="muted">
        {ICON[metric]} {m.label}{" "}
        <span className={`src ${real ? "real" : "sim"}`}>{real ? "sensor" : "simulated"}</span>
      </small>
      <div className="big">
        <span className={`dot d${s}`} />
        <span className={`s${s}`}>{fmt(metric, last)}</span>{" "}
        <small className="muted">{m.unit}</small>
      </div>

      <ResponsiveContainer width="100%" height={60}>
        <LineChart data={data}>
          <YAxis hide domain={["auto", "auto"]} />
          <Line
            type="monotone"
            dataKey="v"
            stroke={COLORS[s]}
            strokeWidth={2}
            dot={false}
            isAnimationActive={false}
          />
        </LineChart>
      </ResponsiveContainer>

      <small className="muted">
        Normal range: {m.range[0]} to {m.range[1]}
      </small>
      <small className="more">View details →</small>
    </Link>
  );
}