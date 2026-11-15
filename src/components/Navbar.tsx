import { NavLink } from "react-router-dom";
import { useAlerts } from "../hooks/AlertsContext";
import { useStatus } from "../hooks/LiveContext";

const links = [
  { to: "/", label: "🪐 Dashboard" },
  { to: "/astronaut/1", label: "🧑‍🚀 Astronauts" },
  { to: "/predictions", label: "🔮 Predictions" },
  { to: "/alerts", label: "🚨 Alerts" },
  { to: "/chat", label: "🤖 Assistant" },
  { to: "/emergency", label: "🚑 Emergency" },
];



export default function Navbar() {
  const { alerts } = useAlerts();
  const { mode, connected } = useStatus();

  const label =
    mode === "simulation" ? "Simulation" : connected ? "ESP32 connected" : "ESP32 offline";

  return (
    <header className="navbar">
      <b className="logo">🚀 ASTRA HEALTH</b>
      <nav>
        {links.map((l) => (
          <NavLink
            key={l.to}
            to={l.to}
            end={l.to === "/"}
            className={({ isActive }) => (isActive ? "on" : "")}
          >
            {l.label}
            {l.to === "/alerts" && alerts.length > 0 ? ` (${alerts.length})` : ""}
          </NavLink>
        ))}
      </nav>
      <span className={`conn ${mode === "esp32" && !connected ? "off" : "on"}`}>● {label}</span>
    </header>
  );
}