import React, { createContext, useContext, useState, useCallback, useMemo, useRef } from 'react';

/* ------------------------------------------------------------------ */
/*  PAGE META — context-aware tips & quick actions per page            */
/* ------------------------------------------------------------------ */

export interface QuickAction {
  label: string;
  icon: string; // lucide icon name
  prompt: string; // what gets sent to Einstein when tapped
  action?: string; // optional direct action id (navigate, create, etc.)
}

export interface PageMeta {
  pageId: string;
  label: string;
  greeting: string;
  tips: string[];
  quickActions: QuickAction[];
}

const PAGE_META: Record<string, PageMeta> = {
  home: {
    pageId: 'home',
    label: 'Dashboard',
    greeting: 'Na, bereit zum Durchstarten? Ich bin Einstein, dein Lerncoach!',
    tips: [
      'Wusstest du? Ich kann dir einen massgeschneiderten Lernplan erstellen.',
      'Sag mir einfach wann dein nächster Test ist — ich kümmere mich um den Rest.',
      'Auch ich habe mal klein angefangen. Lass uns zusammen deine Noten verbessern!',
    ],
    quickActions: [
      { label: 'Prüfung anlegen', icon: 'Plus', prompt: 'Ich habe bald eine Prüfung und brauche Hilfe.', action: 'navigate:create' },
      { label: 'Lernplan erstellen', icon: 'BookOpen', prompt: 'Erstell mir einen Lernplan für meine nächste Prüfung.' },
      { label: 'Wie läuft es?', icon: 'TrendingUp', prompt: 'Wie sieht mein Lernfortschritt aus? Bin ich auf Kurs?' },
    ],
  },
  pruefungen: {
    pageId: 'pruefungen',
    label: 'Prüfungen',
    greeting: 'Deine Prüfungen auf einen Blick. Wo soll ich anpacken?',
    tips: [
      'Sag mir Fach, Thema und Datum — ich richte alles für dich ein.',
      'Ich kann dir zeigen, wo du am dringendsten üben solltest.',
    ],
    quickActions: [
      { label: 'Neue Prüfung', icon: 'Plus', prompt: 'Ich habe einen neuen Test. Kannst du ihn anlegen?', action: 'navigate:create' },
      { label: 'Nächste Prüfung?', icon: 'Calendar', prompt: 'Welche Prüfung kommt als nächstes und wie bereite ich mich vor?' },
      { label: 'Übungstest', icon: 'CheckCircle', prompt: 'Erstell mir einen Übungstest für meine nächste Prüfung.' },
    ],
  },
  review: {
    pageId: 'review',
    label: 'Prüfungsanalyse',
    greeting: 'Lade deine korrigierte Prüfung hoch — ich schaue mir alles genau an.',
    tips: [
      'Ich prüfe auch, ob dein Lehrer fair korrigiert hat!',
      'Aus jedem Fehler kann man lernen — ich zeige dir wie.',
    ],
    quickActions: [
      { label: 'Prüfung analysieren', icon: 'Upload', prompt: 'Ich möchte eine korrigierte Prüfung zur Analyse hochladen.' },
      { label: 'Notenverbesserung', icon: 'Star', prompt: 'Prüfe ob ich bei meiner letzten Prüfung mehr Punkte verdient hätte.' },
    ],
  },
  bibliothek: {
    pageId: 'bibliothek',
    label: 'Bibliothek',
    greeting: 'Deine Schulunterlagen. Soll ich daraus etwas Nützliches machen?',
    tips: [
      'Ich kann aus deinen Unterlagen Flashcards, Quizze oder Zusammenfassungen erstellen.',
      'Lade ein Arbeitsblatt hoch — ich ordne es automatisch dem richtigen Fach zu.',
    ],
    quickActions: [
      { label: 'Stoff erklären', icon: 'Lightbulb', prompt: 'Erkläre mir ein Thema aus meinen Schulunterlagen einfach und verständlich.' },
      { label: 'Flashcards', icon: 'Layers', prompt: 'Erstell mir Flashcards aus meinem letzten Arbeitsblatt.' },
      { label: 'Quiz erstellen', icon: 'HelpCircle', prompt: 'Erstell mir ein Quiz zu meinem aktuellen Schulstoff.' },
    ],
  },
  wissen: {
    pageId: 'wissen',
    label: 'Wissensspeicher',
    greeting: 'Dein persönlicher Wissensspeicher. Wie ein zweites Gehirn!',
    tips: [
      'Ich kann aus deinen Prüfungen die wichtigsten Konzepte extrahieren und hier speichern.',
      'Frag mich, wenn du ein Konzept nicht verstehst — ich erkläre es dir auf verschiedene Arten.',
    ],
    quickActions: [
      { label: 'Konzept erklären', icon: 'BookOpen', prompt: 'Erkläre mir ein Konzept aus meinem Wissensspeicher so, dass ich es wirklich verstehe.' },
      { label: 'Wissen ergänzen', icon: 'Plus', prompt: 'Extrahiere wichtige Konzepte aus meinen letzten Prüfungen.' },
    ],
  },
  fortschritt: {
    pageId: 'fortschritt',
    label: 'Fortschritt',
    greeting: 'Schauen wir uns deine Zahlen an. Wissen ist Macht!',
    tips: [
      'Ich sehe wo deine Stärken und Schwächen liegen und gebe dir gezielte Tipps.',
      'Mit Spaced Repetition kannst du dir Stoff viel besser merken — frag mich wie!',
    ],
    quickActions: [
      { label: 'Schwächen finden', icon: 'Target', prompt: 'Analysiere meine Fehler und sag mir wo meine Lernschwächen liegen.' },
      { label: 'Lernstrategie', icon: 'Zap', prompt: 'Erstelle mir einen Lernplan mit den besten Lerntechniken für diese Woche.' },
      { label: 'Motivier mich!', icon: 'Flame', prompt: 'Ich brauche Motivation zum Lernen. Hilf mir!' },
    ],
  },
  erfolge: {
    pageId: 'erfolge',
    label: 'Erfolge',
    greeting: 'Schau dir an was du schon erreicht hast! Jeder Experte war mal Anfänger.',
    tips: [
      'Jedes Badge zeigt deinen Fortschritt — ich sage dir wie du das nächste holst.',
    ],
    quickActions: [
      { label: 'Nächstes Badge?', icon: 'Award', prompt: 'Welches Badge kann ich als nächstes freischalten und was muss ich dafür tun?' },
      { label: 'Mein Level', icon: 'TrendingUp', prompt: 'Was brauche ich um das nächste Level zu erreichen?' },
    ],
  },
  settings: {
    pageId: 'settings',
    label: 'Einstellungen',
    greeting: 'Einstellungen — brauchst du Hilfe bei der Konfiguration?',
    tips: ['Ich kann dir erklären was die verschiedenen Einstellungen bewirken.'],
    quickActions: [
      { label: 'Abo-Infos', icon: 'CreditCard', prompt: 'Erkläre mir die Unterschiede zwischen den Abo-Paketen.' },
    ],
  },
  create: {
    pageId: 'create',
    label: 'Prüfung erstellen',
    greeting: 'Lass uns deine Prüfung vorbereiten! Was steht an?',
    tips: [
      'Lade dein Material hoch — ich erstelle daraus automatisch Übungen, Flashcards und mehr.',
      'Ich empfehle dir die Module, die am besten zu deinem Lernstil passen.',
    ],
    quickActions: [
      { label: 'Wie funktioniert das?', icon: 'HelpCircle', prompt: 'Erkläre mir Schritt für Schritt wie ich hier eine Prüfung vorbereite.' },
      { label: 'Module empfehlen', icon: 'Lightbulb', prompt: 'Welche Lernmodule empfiehlst du mir für meine Prüfungsvorbereitung?' },
    ],
  },
  lerngruppen: {
    pageId: 'lerngruppen',
    label: 'Lerngruppen',
    greeting: 'Gemeinsam lernt es sich besser — das weiss auch ein Genie wie ich!',
    tips: ['Ich kann dir helfen, eine Lerngruppe einzurichten und den Stoff aufzuteilen.'],
    quickActions: [
      { label: 'Gruppe erstellen', icon: 'Users', prompt: 'Ich möchte eine Lerngruppe mit Freunden erstellen.' },
    ],
  },
};

const DEFAULT_META: PageMeta = {
  pageId: 'unknown',
  label: 'MindVibe',
  greeting: 'Hallo! Ich bin Einstein, dein persönlicher Lerncoach. Was kann ich für dich tun?',
  tips: ['Auch ich habe mal mit einfachen Fragen angefangen. Frag mich einfach!'],
  quickActions: [
    { label: 'Zum Dashboard', icon: 'Home', prompt: 'Bring mich zum Dashboard.', action: 'navigate:home' },
  ],
};

/* ------------------------------------------------------------------ */
/*  CONCIERGE ACTION — structured actions Einstein can trigger         */
/* ------------------------------------------------------------------ */

export type ConciergeActionType =
  | 'navigate'
  | 'create_exam'
  | 'open_search'
  | 'open_upgrade'
  | 'start_timer'
  | 'show_tip';

export interface ConciergeAction {
  type: ConciergeActionType;
  payload?: Record<string, any>;
}

/* ------------------------------------------------------------------ */
/*  CONTEXT VALUE                                                      */
/* ------------------------------------------------------------------ */

export interface EinsteinMessage {
  id: string;
  role: 'user' | 'einstein';
  text: string;
  timestamp: Date;
  action?: ConciergeAction;
  quickReplies?: string[];
}

interface EinsteinContextValue {
  // Panel state
  isOpen: boolean;
  open: () => void;
  close: () => void;
  toggle: () => void;

  // Page context
  currentPage: string;
  setCurrentPage: (page: string) => void;
  pageMeta: PageMeta;

  // Navigation callback (set by AppShell)
  navigateTo: (page: string) => void;
  setNavigateTo: (fn: (page: string) => void) => void;

  // Action dispatcher (set by AppShell)
  dispatchAction: (action: ConciergeAction) => void;
  setActionHandler: (fn: (action: ConciergeAction) => void) => void;

  // Chat messages
  messages: EinsteinMessage[];
  addMessage: (msg: EinsteinMessage) => void;
  clearMessages: () => void;

  // Proactive hint
  proactiveHint: string | null;
  setProactiveHint: (hint: string | null) => void;
}

const EinsteinContext = createContext<EinsteinContextValue | null>(null);

/* ------------------------------------------------------------------ */
/*  PROVIDER                                                           */
/* ------------------------------------------------------------------ */

export const EinsteinProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState('home');
  const [messages, setMessages] = useState<EinsteinMessage[]>([]);
  const [proactiveHint, setProactiveHint] = useState<string | null>(null);

  const navigateRef = useRef<(page: string) => void>(() => {});
  const actionHandlerRef = useRef<(action: ConciergeAction) => void>(() => {});

  const pageMeta = useMemo(() => PAGE_META[currentPage] || DEFAULT_META, [currentPage]);

  const open = useCallback(() => setIsOpen(true), []);
  const close = useCallback(() => setIsOpen(false), []);
  const toggle = useCallback(() => setIsOpen((v) => !v), []);

  const setNavigateTo = useCallback((fn: (page: string) => void) => {
    navigateRef.current = fn;
  }, []);

  const navigateTo = useCallback((page: string) => {
    navigateRef.current(page);
  }, []);

  const setActionHandler = useCallback((fn: (action: ConciergeAction) => void) => {
    actionHandlerRef.current = fn;
  }, []);

  const dispatchAction = useCallback((action: ConciergeAction) => {
    actionHandlerRef.current(action);
  }, []);

  const addMessage = useCallback((msg: EinsteinMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  const clearMessages = useCallback(() => setMessages([]), []);

  const value = useMemo(() => ({
    isOpen, open, close, toggle,
    currentPage, setCurrentPage, pageMeta,
    navigateTo, setNavigateTo,
    dispatchAction, setActionHandler,
    messages, addMessage, clearMessages,
    proactiveHint, setProactiveHint,
  }), [
    isOpen, open, close, toggle,
    currentPage, pageMeta,
    navigateTo, setNavigateTo,
    dispatchAction, setActionHandler,
    messages, addMessage, clearMessages,
    proactiveHint,
  ]);

  return (
    <EinsteinContext.Provider value={value}>{children}</EinsteinContext.Provider>
  );
};

export function useEinstein() {
  const ctx = useContext(EinsteinContext);
  if (!ctx) throw new Error('useEinstein must be used within EinsteinProvider');
  return ctx;
}

export { PAGE_META };
