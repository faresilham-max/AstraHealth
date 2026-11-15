import { Link } from "react-router-dom";
import { useAlerts } from "../hooks/AlertsContext";
import { STEPS } from "../lib/emergency";

export default function EmergencyBanner() {
  const { emergency, acknowledge } = useAlerts();
  if (!emergency) return null;

  return (
    <div className="emergency" role="alert">
      <b>🚨 EMERGENCY: {emergency.astronautName} has lost consciousness</b>
      <ol>
        {STEPS.map((s) => (
          <li key={s}>{s}</li>
        ))}
      </ol>
      <Link to="/emergency" className="btn-link">▶ Watch the instruction video</Link>
      <button onClick={acknowledge}>Acknowledge alert</button>
      <small> Demo procedure: to be validated by a doctor.</small>
    </div>
  );
}