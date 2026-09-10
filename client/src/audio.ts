// audio.ts — Sistema de Áudio usando Web Speech API
export function speak(text: string): void {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  try {
    window.speechSynthesis.cancel(); // Cancela falas anteriores pendentes
    const utterance = new SpeechSynthesisUtterance(text.toLowerCase());
    utterance.lang = "pt-BR";
    utterance.rate = 0.82;
    utterance.pitch = 1.1;
    window.speechSynthesis.speak(utterance);
  } catch (e) {
    console.warn("Audio synthesis error:", e);
  }
}

export function speakMath(a: number, op: "+" | "-", b: number): void {
  const opWord = op === "+" ? "mais" : "menos";
  speak(`${a} ${opWord} ${b}, quanto é?`);
}
