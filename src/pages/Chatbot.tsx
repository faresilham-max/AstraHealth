import { useEffect, useRef, useState } from "react";
import { answer, SUGGESTIONS, WELCOME } from "../lib/chatKB";
import { useAssistantSpeech } from "../hooks/useAssistantSpeech";

type Msg = { from: "user" | "bot"; text: string };

export default function Chatbot() {
  const [messages, setMessages] = useState<Msg[]>([{ from: "bot", text: WELCOME }]);
  const [input, setInput] = useState("");
  const box = useRef<HTMLDivElement>(null);
  const voice = useAssistantSpeech();

  // Faire défiler vers le dernier message
  useEffect(() => {
    box.current?.scrollTo({ top: box.current.scrollHeight });
  }, [messages]);

  function send(text: string) {
    const q = text.trim();
    if (!q) return;
    const reply = answer(q);
    setMessages((m) => [...m, { from: "user", text: q }, { from: "bot", text: reply }]);
    voice.speak(reply);
    setInput("");
  }

  return (
    <div>
      <h2>Assistant ASTRA</h2>

      <div className="card">
        <div className="chatbox" ref={box}>
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

        <small className="muted">
          Assistant ASTRA lit ses réponses à voix haute. Pour les urgences, contactez les services de secours.
        </small>
      </div>
    </div>
  );
}