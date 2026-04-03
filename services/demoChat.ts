/** Kurze Demo-Antworten ohne API (Landing „Ausprobieren“). */
export function getDemoReply(userMessage: string): string {
  const t = userMessage.trim();
  if (!t) {
    return 'Schreib etwas in das Feld – ich antworte dir mit einer **Demo-Antwort**. Für die volle KI melde dich an.';
  }
  return `**Demo-Modus**\n\nDanke für deine Nachricht: „${t.slice(0, 120)}${t.length > 120 ? '…' : ''}“\n\nSo könnte eine echte Antwort aussehen – mit Anmeldung nutzt du den **Einstein**-Assistenten mit vollem Kontext und Lernhilfen.\n\n_Tipp: Nach dem Login durchläufst du ein kurzes Onboarding und landest im gleichen Chat – nur mit echten Antworten._`;
}
