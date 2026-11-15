import { useCallback, useEffect, useState } from "react";

export function useAssistantSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [message, setMessage] = useState("");

  const stop = useCallback(() => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
    setSpeaking(false);
  }, []);

  const speak = useCallback((text: string) => {
    if (!("speechSynthesis" in window) || typeof SpeechSynthesisUtterance === "undefined") {
      setMessage("La lecture audio n’est pas prise en charge par ce navigateur.");
      return false;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "fr-FR";
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = () => {
      setSpeaking(false);
      setMessage("La lecture audio a échoué. Vérifiez le son de l’appareil.");
    };
    setMessage("");
    setSpeaking(true);
    window.speechSynthesis.speak(utterance);
    return true;
  }, []);

  useEffect(() => () => {
    if ("speechSynthesis" in window) window.speechSynthesis.cancel();
  }, []);

  return { speaking, message, speak, stop };
}
