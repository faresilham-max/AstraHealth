import { useEffect, useMemo, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  CartesianGrid, Line, LineChart, ReferenceArea, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { ASTRONAUTS } from "../lib/astronauts";
import { isReal } from "../lib/config";
import {
  clearSamples, downloadCsv, getSamples, SAMPLE_MS, toCsv, type Sample,
} from "../lib/history";
import { fmt, getStatus, KEYS, METRICS, STATUS_LABEL, type MetricKey } from "../lib/metrics";
import { useLive } from "../hooks/LiveContext";

type RangeId = "live" | "15m" | "1h" | "all";

const RANGES: { id: RangeId; label: string; ms: number }[] = [
  { id: "live", label: "Live (1 min)", ms: 0 },
  { id: "15m", label: "15 min", ms: 15 * 60 * 1000 },
  { id: "1h", label: "1 hour", ms: 60 * 60 * 1000 },
  { id: "all", label: "Full history", ms: Infinity },
];

const LIVE_STEP_MS = 2000; // one reading every 2 s in the “Live” view
const clock = (ts: number) => new Date(ts).toLocaleTimeString("en-GB");
const AXIS = { fill: "#8e9ab8", fontSize: 12 };

export default function MetricDetail() {
  const { id, metric } = useParams();
  const astro = ASTRONAUTS.find((a) => a.id === Number(id));
  const key = metric as MetricKey;
  const def = KEYS.includes(key) ? METRICS[key] : undefined;

  const live = useLive();
  const [range, setRange] = useState<RangeId>("live");
  const [samples, setSamples] = useState<Sample[]>([]);

  // Recharger l'historique enregistré, puis toutes les 15 s
  useEffect(() => {
    if (!astro) return;
    const load = () => setSamples(getSamples(astro.id));
    load();
    const t = setInterval(load, SAMPLE_MS);
    return () => clearInterval(t);
  }, [astro]);

  const points = useMemo(() => {
    if (!astro || !def) return [];
    if (range === "live") {
      const h = live[astro.id] ?? [];
      const now = Date.now();
      return h.map((r, i) => ({ t: now - (h.length - 1 - i) * LIVE_STEP_MS, v: r[key] }));
    }
    const ms = RANGES.find((r) => r.id === range)!.ms;
    const from = ms === Infinity ? 0 : Date.now() - ms;
    return samples.filter((s) => s.ts >= from).map((s) => ({ t: s.ts, v: s.v[key] }));
  }, [astro, def, range, live, samples, key]);

  if (!astro || !def) {
    return (
      <p>
        Metric not found. <Link to="/">Back</Link>
      </p>
    );
  }

  const history = live[astro.id];
  const current = history[history.length - 1][key];
  const status = getStatus(key, current);

  const vals = points.map((p) => p.v);
  const stats = vals.length
    ? {
        min: Math.min(...vals),
        max: Math.max(...vals),
        avg: vals.reduce((a, b) => a + b, 0) / vals.length,
      }
    : null;

  function exportCsv() {
    if (!astro) return;
    downloadCsv(`astra-${astro.name}-history.csv`, toCsv(samples));
  }

  function clearAll() {
    if (!astro) return;
    if (window.confirm("Delete all recorded history for this astronaut?")) {
      clearSamples(astro.id);
      setSamples([]);
    }
  }

  return (
    <div>
      <p>
        <Link to={`/astronaut/${astro.id}`}>← Back to {astro.name}</Link>
      </p>

      <h2>
        {def.label} <small className="muted">· {astro.name}</small>{" "}
        <span className={`src ${isReal(astro.id, key) ? "real" : "sim"}`}>
          {isReal(astro.id, key) ? "sensor" : "simulated"}
        </span>
      </h2>

      <div className="chips">
        {KEYS.map((k) => (
          <Link key={k} to={`/astronaut/${astro.id}/${k}`} className={`chip ${k === key ? "on" : ""}`}>
            {METRICS[k].label}
          </Link>
        ))}
      </div>

      <div className="card">
        <div className="big">
          <span className={`dot d${status}`} />
          <span className={`s${status}`}>{fmt(key, current)}</span>{" "}
          <small className="muted">{def.unit}</small>{" "}
          <span className={`tag t${status}`}>{STATUS_LABEL[status]}</span>
        </div>

        <div className="row">
          {RANGES.map((r) => (
            <button
              key={r.id}
              className={range === r.id ? "" : "alt"}
              aria-pressed={range === r.id}
              onClick={() => setRange(r.id)}
            >
              {r.label}
            </button>
          ))}
        </div>

        {points.length === 0 ? (
          <p className="muted">
            No data recorded yet for this period. A point is added every 15 seconds: wait a moment, or choose “Live”.
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={points} margin={{ top: 10, right: 16, bottom: 0, left: 0 }}>
              <CartesianGrid stroke="#2c3758" strokeDasharray="3 3" />
              <ReferenceArea
                y1={def.range[0]}
                y2={def.range[1]}
                ifOverflow="hidden"
                fill="#45a888"
                fillOpacity={0.12}
              />
              <XAxis
                dataKey="t"
                type="number"
                domain={["dataMin", "dataMax"]}
                tickFormatter={clock}
                tick={AXIS}
              />
              <YAxis domain={["auto", "auto"]} tick={AXIS} width={54} />
              <Tooltip
                labelFormatter={(l) => clock(Number(l))}
                formatter={(v) => [`${Number(v).toFixed(def.dec)} ${def.unit}`, def.label]}
                contentStyle={{ background: "#161f36", border: "1px solid #2c3758", borderRadius: 10 }}
              />
              <Line
                type="monotone"
                dataKey="v"
                stroke="#8a8fd8"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
        <small className="muted">The green area is the normal range ({def.range[0]} to {def.range[1]} {def.unit}).</small>
      </div>

      {stats && (
        <div className="stats">
          <div className="stat"><small>Minimum</small><b>{fmt(key, stats.min)}</b></div>
          <div className="stat"><small>Maximum</small><b>{fmt(key, stats.max)}</b></div>
          <div className="stat"><small>Average</small><b>{fmt(key, stats.avg)}</b></div>
          <div className="stat"><small>Points</small><b>{points.length}</b></div>
        </div>
      )}

      <div className="card" style={{ marginTop: 14 }}>
        <h3>Latest recorded readings</h3>
        {samples.length === 0 ? (
          <p className="muted">No readings recorded yet.</p>
        ) : (
          <table className="tbl">
            <thead>
              <tr><th>Time</th><th>Value</th><th>Status</th></tr>
            </thead>
            <tbody>
              {samples.slice(-15).reverse().map((s) => {
                const st = getStatus(key, s.v[key]);
                return (
                  <tr key={s.ts}>
                    <td>{clock(s.ts)}</td>
                    <td>{fmt(key, s.v[key])} {def.unit}</td>
                    <td><span className={`tag t${st}`}>{STATUS_LABEL[st]}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
        <div className="row">
          <button onClick={exportCsv} disabled={samples.length === 0}>Export CSV</button>
          <button className="alt" onClick={clearAll} disabled={samples.length === 0}>Clear history</button>
        </div>
        <small className="muted">
          One point is recorded every 15 seconds in this browser (6 hours maximum). “Simulated” values are demo data.
        </small>
      </div>
    </div>
  );
}