import { useMemo } from "react";

// Génère des positions d'étoiles au hasard, une seule fois
function shadows(n: number, color: string) {
  return Array.from({ length: n }, () => {
    const x = Math.floor(Math.random() * 100);
    const y = Math.floor(Math.random() * 100);
    return `${x}vw ${y}vh ${color}`;
  }).join(",");
}

// Chaque objet : hauteur, vitesse (secondes pour traverser), décalage de départ, taille, sens
const SATS = [
  { icon: "🛰️", top: "72%", dur: 60, delay: 0, size: 28, rtl: false },
  { icon: "🛰️", top: "20%", dur: 85, delay: -30, size: 22, rtl: true },
  { icon: "🛰️", top: "45%", dur: 110, delay: -60, size: 18, rtl: false },
  { icon: "🛰️", top: "85%", dur: 75, delay: -20, size: 24, rtl: true },
  { icon: "🛰️", top: "8%", dur: 95, delay: -45, size: 20, rtl: false },
  { icon: "🚀", top: "58%", dur: 70, delay: -10, size: 22, rtl: true },
];

export default function SpaceBackground() {
  const s1 = useMemo(() => shadows(70, "#ffffff"), []);
  const s2 = useMemo(() => shadows(35, "#c9ccff"), []);
  const s3 = useMemo(() => shadows(15, "#ffffff"), []);

  return (
    <div className="space" aria-hidden="true">
      <div className="galaxy g1" />
      <div className="galaxy g2" />
      <div className="stars s1" style={{ boxShadow: s1 }} />
      <div className="stars s2" style={{ boxShadow: s2 }} />
      <div className="stars s3" style={{ boxShadow: s3 }} />
      <div className="shooting" />
      {SATS.map((s, i) => (
        <span
          key={i}
          className={`sat ${s.rtl ? "rtl" : ""}`}
          style={{
            top: s.top,
            fontSize: s.size,
            animationDuration: `${s.dur}s`,
            animationDelay: `${s.delay}s`,
          }}
        >
          {s.icon}
        </span>
      ))}
    </div>
  );
}