import { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { answer, SUGGESTIONS, WELCOME } from "../lib/chatKB";
import { useAssistantSpeech } from "../hooks/useAssistantSpeech";

type Msg = { from: "user" | "bot"; text: string };

export default function ChatWidget() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([{ from: "bot", text: WELCOME }]);
  const [input, setInput] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const voice = useAssistantSpeech();
  const stopVoice = voice.stop;

  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [messages, open]);
  useEffect(() => {
    if (pathname === "/chat") stopVoice();
  }, [pathname, stopVoice]);

  // Sur la page Assistant, on a déjà le chat complet
  if (pathname === "/chat") return null;

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    const reply = answer(q);
    setMessages((m) => [...m, { from: "user", text: q }, { from: "bot", text: reply }]);
    voice.speak(reply);
    setInput("");
  }

  return (
    <>
      {open && (
        <div
          className="cw-panel"
          role="dialog"
          aria-label="Assistant ASTRA"
          onKeyDown={(e) => {
            if (e.key === "Escape") {
              voice.stop();
              setOpen(false);
            }
          }}
        >
          <div className="cw-head">
            <b>🤖 Assistant ASTRA</b>
            <button onClick={() => { voice.stop(); setOpen(false); }} aria-label="Close assistant">✕</button>
          </div>

          <div className="cw-msgs" ref={box}>
            {messages.map((m, i) => (
              <div key={i} className={`bubble ${m.from}`}>
                {m.text}
              </div>
            ))}
          </div>

          <div className="row">
            {SUGGESTIONS.map((s) => (
              <button key={s} className="alt" onClick={() => send(s)}>
                {s}
              </button>
            ))}
          </div>

          <div className="row">
            <button
              className="alt"
              onClick={() => voice.speaking
                ? voice.stop()
                : voice.speak(`Voici les questions proposées. ${SUGGESTIONS.join(". ")}`)}
              aria-pressed={voice.speaking}
            >
              {voice.speaking ? "Arrêter la lecture audio" : "🔊 Écouter les questions"}
            </button>
            {voice.message && <small className="muted" role="status">{voice.message}</small>}
          </div>

          <div className="chat-input">
            <input
              value={input}
              placeholder="Votre question…"
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send(input)}
            />
            <button onClick={() => send(input)}>Envoyer</button>
          </div>
        </div>
      )}

      <button
        className="cw-btn"
        onClick={() => {
          if (open) voice.stop();
          setOpen((o) => !o);
        }}
        aria-label={open ? "Close assistant" : "Open assistant"}
      >
        {open ? "✕" : "🤖"}
      </button>
    </>
  );
}