import { useState } from "react";
import { useAlerts } from "../hooks/AlertsContext";
import { STEPS, VIDEO_SRC } from "../lib/emergency";

export default function Emergency() {
  const { emergency } = useAlerts();
  const [failed, setFailed] = useState(false);

  return (
    <div>
      <h2>Emergency: helping an unconscious crewmate</h2>

      {emergency && (
        <p className="notice">
          🚨 Alert in progress: <b>{emergency.astronautName}</b> has lost consciousness.
        </p>
      )}

      <div className="emergency-grid">
        <div className="card">
          {failed ? (
            <p className="muted">Video unavailable. Follow the steps beside it.</p>
          ) : (
            <video
              className="video"
              controls
              preload="metadata"
              src={VIDEO_SRC}
              onError={() => setFailed(true)}
            >
              Your browser cannot play this video.
            </video>
          )}
        </div>

        <div className="card">
          <h3>Step-by-step actions</h3>
          <ol className="steps">
            {STEPS.map((s) => (
              <li key={s}>{s}</li>
            ))}
          </ol>
        </div>
      </div>

      <p className="muted">Demo content, to be validated by a doctor.</p>
    </div>
  );
}