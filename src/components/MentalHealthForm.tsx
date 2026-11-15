import { mentalScore, QUESTIONS, type Mental } from "../lib/health";

type Props = { value: Mental; onChange: (m: Mental) => void };

export default function MentalHealthForm({ value, onChange }: Props) {
  const score = mentalScore(value);
  const level = score > 65 ? "ok" : score > 40 ? "w" : "c";
  const message =
    score > 65
      ? "Good balance"
      : score > 40
        ? "Keep an eye on it: plan some rest and talk with the crew"
        : "Psychological support recommended";

  return (
    <div className="card">
      <h3>Mental health questionnaire (1 to 5)</h3>

      <div className="questions-grid">
        {QUESTIONS.map((q) => (
          <div className="question" key={q.key}>
            <small>
              {q.label} : <b>{value[q.key]}</b>
            </small>
            <input
              type="range"
              min={1}
              max={5}
              value={value[q.key]}
              onChange={(e) => onChange({ ...value, [q.key]: Number(e.target.value) })}
            />
          </div>
        ))}
      </div>

      <div className="bar">
        <i style={{ width: `${Math.max(score, 4)}%`, background: `var(--${level})` }} />
      </div>
      <b>Mental health: {score}/100</b> <small className="muted">{message}</small>
    </div>
  );
}