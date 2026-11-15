import { useEffect, useRef } from "react";
import { ASTRONAUTS } from "../lib/astronauts";
import { addSample, SAMPLE_MS } from "../lib/history";
import { useLive } from "../hooks/LiveContext";

export default function Recorder() {
  const live = useLive();
  const latest = useRef(live);

  useEffect(() => {
    latest.current = live;
  }, [live]);

  useEffect(() => {
    const timer = setInterval(() => {
      ASTRONAUTS.forEach((a) => {
        const h = latest.current[a.id];
        if (h && h.length) addSample(a.id, h[h.length - 1]);
      });
    }, SAMPLE_MS);
    return () => clearInterval(timer);
  }, []);

  return null;
}