import { Link } from "react-router-dom";
import { useAlerts } from "../hooks/AlertsContext";

export default function Alerts() {
  const { alerts, clearAlerts } = useAlerts();

  return (
    <div>
      <h2>Alerts</h2>

      {alerts.length === 0 ? (
        <p className="muted">No alerts at the moment.</p>
      ) : (
        <>
          <button className="alt" onClick={clearAlerts}>Clear history</button>
          <div className="alert-list">
            {alerts.map((a) => (
              <div className="card" key={a.id}>
                <span className={`tag ${a.level === "emergency" ? "t2" : "t1"}`}>
                  {a.level === "emergency" ? "EMERGENCY" : "Critical"}
                </span>{" "}
                <Link to={`/astronaut/${a.astronautId}`}><b>{a.astronautName}</b></Link> : {a.message}{" "}
                <small className="muted">· {new Date(a.ts).toLocaleTimeString("en-GB")}</small>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}