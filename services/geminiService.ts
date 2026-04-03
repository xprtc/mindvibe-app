import { GoogleGenAI } from "@google/genai";
import { ChatMessage } from "../types";

let _ai: GoogleGenAI | null = null;
function getAI(): GoogleGenAI {
  if (!_ai) {
    const key = process.env.API_KEY || process.env.GEMINI_API_KEY || '';
    if (!key) {
      console.warn('[geminiService] No API key set – AI features disabled.');
    }
    _ai = new GoogleGenAI({ apiKey: key || 'MISSING_KEY' });
  }
  return _ai;
}

// Existing functions...
export const generateStudyPlan = async (
  subject: string,
  topic: string,
  examDate: string,
  materialsContext: string,
  contentTypes: string[]
): Promise<string> => {
  try {
    // Determine prompt instructions based on selected content types
    let contentInstructions = "";

    if (contentTypes.includes('plan')) {
      contentInstructions += `
      ### 1. 📅 Strukturierter Zeitplan (Study Plan)
      - Calculate the days remaining until ${examDate}.
      - Create a table or list dividing the time into phases: "Lernen" (Learning), "Wiederholen" (Repetition), and "Üben" (Practice).
      - Assign specific sub-topics from the context to these days.
      `;
    }

    if (contentTypes.includes('solutions_practice')) {
      contentInstructions += `
      ### 2. ✅ Lösungen & Übungsaufgaben (Solutions & Practice)
      - **TASK 1:** Identify any questions or problem sets in the provided "Materials Context". Solve them step-by-step with clear explanations.
      - **TASK 2:** For every identified problem type, generate **3 NEW similar practice problems** (3x multiplication of tasks) so the student can practice the pattern. Provide the answers to these new problems at the very end of this section hidden behind a "Spoiler" warning or separated clearly.
      `;
    }

    if (contentTypes.includes('summary')) {
      contentInstructions += `
      ### 3. 📖 Audio-Zusammenfassung & Skript
      - Provide a structured summary script suitable for reading aloud or listening (Podcast style).
      - Use clear, conversational language.
      - Highlight key terms in bold.
      `;
    }

    if (contentTypes.includes('flashcards')) {
      contentInstructions += `
      ### 4. 🃏 Karteikarten (Flashcards)
      - Generate a list of 10-15 Question/Answer pairs.
      - Format: Q: [Question] | A: [Answer]
      `;
    }

    if (contentTypes.includes('quiz')) {
      contentInstructions += `
      ### 5. ❓ Interaktives Quiz
      - Create 5 multiple-choice questions.
      - Format strictly as follows for parsing:
        Question: [The Question text]
        A) [Option A]
        B) [Option B]
        C) [Option C]
        Correct: [Letter]
        Explanation: [Why it is correct]
        ---
      `;
    }

    if (contentTypes.includes('mindmap')) {
      contentInstructions += `
      ### 6. 🧠 Mindmap Struktur
      - Create a hierarchical list representing a mindmap.
      - Use indentation (bullet points) to show hierarchy.
      - Root node: The Main Topic.
      - Level 1: Main Categories.
      - Level 2: Details/Keywords.
      `;
    }

    if (contentTypes.includes('infographic')) {
      contentInstructions += `
      ### 7. 🎨 Infografik Konzept
      - Create 4-6 "Visual Cards" with key facts.
      - Format:
        [Icon Name like 'Star' or 'Zap'] | [Title] | [Short description max 10 words]
      `;
    }

    if (contentTypes.includes('presentation')) {
      contentInstructions += `
      ### 8. 📊 Präsentation (Slides)
      - Create content for 5 slides.
      - Format:
        Slide 1: Title: [Title] | Body: [Bullet points]
        Slide 2: Title: [Title] | Body: [Bullet points]
        ...
      `;
    }

    const prompt = `
      You are an elite AI tutor for the MindVibe app.
      
      **Metadata:**
      - Subject: "${subject}"
      - Exam Title: "${topic}"
      - Exam Date: ${examDate}
      - Current Date: ${new Date().toISOString().split('T')[0]}

      **User Materials (Context):**
      """
      ${materialsContext}
      """

      **Your Mission:**
      Generate a study output based strictly on the selected modules below. Use German language. 
      Format nicely with Markdown sections using the :::SECTION: type::: delimiter.

      Requested Modules:
      ${contentInstructions}
      
      If no specific tasks were found in the materials for the "Solutions" section, generate generic practice problems based on the topic topic.
    `;

    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Konnte keinen Lernplan generieren. Bitte versuche es erneut.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Ein Fehler ist bei der Generierung aufgetreten. Bitte überprüfe deine Internetverbindung.";
  }
};

export const analyzeExamNotes = async (notes: string): Promise<string> => {
  try {
     const prompt = `
      Analyze the following student notes and suggest 3 key areas where they might be missing information or where clarification is often needed for this topic:
      
      "${notes}"
    `;

    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Could not analyze notes.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "An error occurred while analyzing notes.";
  }
}

export const analyzeExamReview = async (images: string[], notes: string): Promise<string> => {
  try {
    const prompt = `
      🎯 **Rolle und Ziel der KI**
      Du bist ein Experte für pädagogische Bewertung und Tutoring. Deine Aufgabe ist es, eine hochgeladene, korrigierte Schülerprüfung zu analysieren und zwei separate, strukturierte Outputs zu erstellen: Notenoptimierung und Themenvertiefung.

      📥 **Eingabe (Input)**
      Der Benutzer lädt Bilder einer korrigierten Prüfung hoch.
      Analysefokus: Konzentriere dich auf die vom Lehrer vorgenommenen Korrekturen, die vergebenen Punkte und die Gesamtnote.
      Zusätzliche Notizen des Schülers: "${notes}"

      📝 **Task 1: Notenoptimierung (Unmittelbare Verbesserung)**
      Ziel: Identifiziere Punkte, an denen der Schüler zusätzliche Punkte erhalten könnte, und generiere den fertigen Anfechtungstext an den Lehrer.
      Details:
      - Suche nach spezifischen Fehlern in der Korrektur. Schwerpunkte: Korrekter Ansatz/Lösungsweg vs. falsche Endzahl (Potenzial für Teilpunkte) und Missverständnisse des Lehrers bezüglich der Schülerantwort.
      - Erstelle eine Tabelle, die potenzielle Anfechtungspunkte listet.
      - Generiere für jeden relevanten Anfechtungspunkt einen formellen, höflichen und präzisen Textentwurf (E-Mail-Format) an den Lehrer. Der Text muss die Aufgabe nennen und begründen, warum eine Neubewertung angebracht ist.

      🧠 **Task 2: Themenvertiefung (Langfristige Verbesserung)**
      Ziel: Erkläre die Fehler und biete dem Schüler eine Möglichkeit, das zugrundeliegende Konzept zu festigen.
      Details:
      - Wähle alle Aufgaben, bei denen Punkte verloren wurden. Identifiziere das Kernkonzept/Thema und erkläre, wo der Fehler im Verständnis lag.
      - Liefere die vollständige, korrekte, schrittweise Musterlösung für die fehlerhafte Aufgabe.
      - Erstelle zwei neue, ähnliche Übungsaufgaben zum gleichen Konzept. Füge die korrekten Lösungen (kurz) hinzu.

      📊 **Ausgabeformat (Output Structure)**
      Deine Antwort muss in zwei Hauptsektionen gegliedert sein. Verwende Markdown.
      
      :::SECTION: optimization:::
      (Hier Task 1 Output einfügen: Tabelle und E-Mail-Entwürfe)
      
      :::SECTION: deepdive:::
      (Hier Task 2 Output einfügen: Fehleranalyse, Musterlösung, Übungen)
    `;

    const parts: any[] = [{ text: prompt }];
    
    // Add images
    images.forEach(img => {
      // Expecting base64 string like "data:image/png;base64,..."
      const match = img.match(/^data:(image\/[a-z]+);base64,(.+)$/);
      if (match) {
        parts.push({
          inlineData: {
            mimeType: match[1],
            data: match[2]
          }
        });
      }
    });

    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: { parts },
    });

    return response.text || "Analyse fehlgeschlagen.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Fehler bei der Analyse der Prüfung.";
  }
}

export const findSimilarResources = async (resourceName: string, subject: string, type: 'examples' | 'explanation' | 'advanced'): Promise<string> => {
  try {
    const prompt = `
      Du bist ein intelligenter Bibliothekar und Tutor für die MindVibe App.
      Der Schüler hat folgendes Material hochgeladen: "${resourceName}" im Fach "${subject}".
      
      Der Schüler möchte dazu passend mehr Inhalte generieren.
      Modus: ${type === 'examples' ? 'Ähnliche Übungsbeispiele' : type === 'explanation' ? 'Erklärung des Konzepts' : 'Vertiefende/Schwierigere Inhalte'}.

      Generiere einen strukturierten Output in Markdown.
      
      Wenn Modus = Übungsbeispiele:
      Erstelle 3 neue Aufgaben, die dem Thema von "${resourceName}" sehr ähnlich sind, aber andere Zahlen/Werte verwenden. Füge die Lösungen am Ende hinzu.

      Wenn Modus = Erklärung:
      Erkläre das zugrundeliegende Konzept einfach und verständlich (Feynman-Methode).

      Wenn Modus = Vertiefung:
      Erstelle eine Herausforderung ("Boss Battle Aufgabe"), die das Thema auf das nächste Level hebt.

      Halte dich kurz, prägnant und hilfreich.
    `;

    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Konnte keine ähnlichen Inhalte generieren.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Fehler bei der Generierung.";
  }
}

export const extractKnowledgeFromContent = async (examContent: string, subject: string): Promise<string> => {
  try {
    const prompt = `
      Analysiere den folgenden Prüfungsinhalt für das Fach "${subject}".
      
      Deine Aufgabe ist es, "Wissens-Nuggets" zu extrahieren. Das sind dauerhaft gültige Informationen, die es wert sind, in einer Wissensdatenbank gespeichert zu werden.
      
      Inhalt:
      "${examContent}"

      Bitte extrahiere 3-5 Schlüsselkonzepte.
      Format: Gib mir NUR eine Liste im folgenden Format (Markdown), ohne Einleitungstext:
      
      ### [Titel des Konzepts]
      **Tags:** #Tag1 #Tag2
      **Definition:** Kurze Erklärung (max 2 Sätze).
      **Key Fact:** Eine Formel, Regel oder wichtigste Information.
      
      ---
    `;

    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "";
  } catch (error) {
    console.error(error);
    return "";
  }
}

// --- EINSTEIN CONCIERGE CHAT FUNCTION ---

export const chatWithEinstein = async (history: ChatMessage[], newMessage: string): Promise<ChatMessage> => {
  try {
    // 1. Construct history for prompt
    const conversation = history.map(h => `${h.role === 'user' ? 'Student' : 'Einstein'}: ${h.text}`).join('\n');
    const currentDate = new Date().toISOString().split('T')[0];

    // 2. Full Einstein Concierge System Prompt
    const prompt = `
SYSTEM-PROMPT: KI-Lerncoach "Albert Einstein" — Concierge-Modus

=== ROLLE UND IDENTITÄT ===
Du bist Albert Einstein — das Herzstück der MindVibe Lern-App. Du bist ein absolutes Lerngenie, ein motivierender Mentor, ein geduldiger Coach und der persönliche Concierge des Nutzers.
Du sprichst freundlich, weise, gelegentlich mit einem Augenzwinkern und nutzt dein Image als genialer Wissenschaftler, um Kindern die Angst vor Fehlern zu nehmen (denn auch du hast mal klein angefangen).
Dein oberstes Ziel: Dem Kind zu besseren Noten verhelfen und den Spass am Lernen zurückgeben.

=== KONTEXT UND SCHULSYSTEM ===
- Deutsch-Schweizer Schulsystem, Grundlage: Lehrplan 21
- Lehrmittel und Schulbücher des Kantons Bern
- Notensystem: 1 bis 6 (6 = beste Note, unter 4 = ungenügend)
- Ab 13 Jahren ist die App primär auf das Kind ausgerichtet

=== DEINE 5 KERNFUNKTIONEN ===

**1. Verwaltung der Schulunterlagen**
- Hochgeladene Unterlagen (Arbeitsblätter, Notizen, Übungen) automatisch analysieren
- Dokumente dem richtigen Fach, Thema und Datum zuordnen
- Strukturierte Wissensbasis pro Kind erstellen

**2. Prüfungsvorbereitung & Test-Simulation**
- Abfragen, welche Unterlagen geprüft werden (einzelne Themen oder alles)
- Format wählen lassen: schriftlich (offene Fragen), Multiple Choice, mündlich
- Massgeschneiderte Übungstests aus den exakten Schulunterlagen generieren
- Lernstoff auf verschiedene Arten erklären (schriftlich, mündlich, Alltagsbeispiele)

**3. Superlearning-Coach & Lernstrategien**
- Lernverhalten und Fehler analysieren, Lernschwächen erkennen
- Beste Lerntechniken empfehlen (Spaced Repetition, Active Recall, Pomodoro)
- Lernplan erstellen: Wann und wie oft wiederholen für Langzeitgedächtnis
- Träume, Stärken und Auszeichnungen des Kindes zur Motivation nutzen

**4. Zielsetzung & Noten-Tracking**
- Bisherige Noten/Semesterdurchschnitte verwalten
- Wunsch-Note eingeben lassen
- Konkreten Aktionsplan erstellen, um die Zielnote zu erreichen

**5. Test-Auswertung & Eltern-Interaktion**
- Korrigierte Tests detailliert analysieren (was gut lief + Fehler erklären)
- Korrektur der Lehrkraft auf Fehler prüfen (z.B. korrekter Rechenweg, falsches Ergebnis = null Punkte)
- Bei Korrekturfehler: Automatisch höfliche E-Mail-Vorlage für Eltern erstellen
- Eltern aktiv sensibilisieren und zur Unterstützung motivieren

=== CONCIERGE-FUNKTION (APP-STEUERUNG) ===

Du bist auch der Concierge der App. Du navigierst den Nutzer, richtest Dinge ein und übernimmst Aufgaben.

**Verfügbare App-Seiten:**
home (Dashboard), pruefungen (Prüfungen), create (Prüfung erstellen), review (Prüfungsanalyse), bibliothek (Bibliothek), wissen (Wissensspeicher), fortschritt (Fortschritt), erfolge (Erfolge & Badges), lerngruppen (Lerngruppen), settings (Einstellungen)

=== KOMMUNIKATIONSRICHTLINIEN ===
- Halte Antworten kurz und prägnant (max 3-4 Sätze im Chat)
- Passe Sprache an: Für Kinder simpel, bildhaft, ermutigend. Für Eltern auf Augenhöhe, analytisch, beratend.
- Gelegentlich Emojis, aber sparsam
- Markdown (**fett**) erlaubt
- Sei proaktiv: Schlage Dinge vor, bevor der Nutzer danach fragt

=== AKTUELLER KONTEXT ===
Datum: ${currentDate}

Conversation History:
${conversation}
Student: ${newMessage}

=== ACTION DETECTION ===

1. **Prüfung erstellen** — Wenn der Student eine Prüfung hat oder einen Test erstellen will:
Antworte NUR mit diesem JSON (kein Text davor/danach):
{
  "action": "create_exam",
  "title": "Titel der Prüfung",
  "subject": "Fach",
  "date": "YYYY-MM-DD",
  "reply": "Dein Antworttext"
}

2. **Navigation** — Wenn der Student zu einer Seite will, füge [NAVIGATE:seitenname] in deine Antwort ein.
Beispiel: "Klar, ich bringe dich zu deinen Prüfungen! [NAVIGATE:pruefungen]"

3. **Keine Aktion** — Antworte einfach als Text. Kontextbezogen, kurz, hilfreich.
    `;

    const response = await getAI().models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    const text = response.text || "Entschuldigung, ich habe den Faden verloren.";

    // 3. Try parsing JSON for actions
    try {
      // Clean up json markers if present
      const cleanedText = text.replace(/```json/g, '').replace(/```/g, '').trim();
      if (cleanedText.startsWith('{') && cleanedText.endsWith('}')) {
        const data = JSON.parse(cleanedText);
        if (data.action === 'create_exam') {
          return {
            id: Date.now().toString(),
            role: 'model',
            text: data.reply,
            timestamp: new Date(),
            action: {
              type: 'create_exam',
              status: 'pending',
              data: {
                title: data.title,
                subject: data.subject,
                date: data.date
              }
            }
          };
        }
      }
    } catch (e) {
      // Not valid JSON, just return text
    }

    return {
      id: Date.now().toString(),
      role: 'model',
      text: text,
      timestamp: new Date()
    };

  } catch (error) {
    console.error(error);
    return {
      id: Date.now().toString(),
      role: 'model',
      text: "Mein Gehirn hat kurz ausgesetzt (API Fehler). Versuch es nochmal!",
      timestamp: new Date()
    };
  }
};