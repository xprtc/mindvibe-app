/* ================================================================
   MindVibe — Type Definitions
   ================================================================ */

// ─── SUBJECT (dynamisch pro User) ───────────────────

export interface Subject {
  id: string;
  name: string;           // "Mathematik"
  icon: string;           // Emoji: "📐"
  color: string;          // Tailwind color key: "blue", "red", etc.
  targetGrade: number;    // Wunschnote (z.B. 5.5)
  currentGrade: number;   // Berechneter Durchschnitt
  createdAt?: any;
  order?: number;         // Reihenfolge in Sidebar
}

// ─── SEMESTER ───────────────────────────────────────

export type SemesterType = 'summer' | 'winter';

export interface Semester {
  id: string;             // z.B. "2026-S" oder "2025-W"
  type: SemesterType;
  year: number;           // 2026
  label: string;          // "Sommersemester 2026"
  startDate: string;      // ISO date
  endDate: string;        // ISO date
}

/** Helper: welches Semester gehört zu einem Datum? */
export function getSemesterForDate(dateStr: string): Semester {
  const d = new Date(dateStr);
  const month = d.getMonth(); // 0-based
  const year = d.getFullYear();

  // Schweiz: Sommersemester Feb-Jul, Wintersemester Aug-Jan
  if (month >= 1 && month <= 6) {
    return {
      id: `${year}-S`,
      type: 'summer',
      year,
      label: `Sommersemester ${year}`,
      startDate: `${year}-02-01`,
      endDate: `${year}-07-31`,
    };
  }
  // Aug-Dec = Wintersemester desselben Schuljahres
  if (month >= 7) {
    return {
      id: `${year}-W`,
      type: 'winter',
      year,
      label: `Wintersemester ${year}/${year + 1}`,
      startDate: `${year}-08-01`,
      endDate: `${year + 1}-01-31`,
    };
  }
  // Jan = gehört noch zum Wintersemester des Vorjahres
  return {
    id: `${year - 1}-W`,
    type: 'winter',
    year: year - 1,
    label: `Wintersemester ${year - 1}/${year}`,
    startDate: `${year - 1}-08-01`,
    endDate: `${year}-01-31`,
  };
}

// ─── UPLOADED FILE ──────────────────────────────────

export interface UploadedFile {
  id: string;
  name: string;
  type: string;           // MIME type (image/jpeg, application/pdf, etc.)
  size: number;           // Bytes
  url: string;            // Firebase Storage download URL
  thumbnailUrl?: string;  // Vorschau für Bilder
  uploadedAt: string;     // ISO date
}

// ─── TIMELINE EVENT ─────────────────────────────────

export type TimelineEventType = 'material' | 'self_test' | 'exam' | 'ai_content' | 'grade';

export interface TimelineEvent {
  id: string;
  subjectId: string;
  type: TimelineEventType;
  date: string;           // ISO date
  title: string;          // Kurze Beschreibung
  semesterId: string;     // z.B. "2026-S"
  createdAt?: any;

  // ── Material-Upload
  materials?: {
    files: UploadedFile[];
    description?: string;   // "Brüche Kapitel 3"
  };

  // ── Selbsttest
  selfTest?: {
    score: number;            // 0-100
    totalQuestions: number;
    correctAnswers: number;
    materialIds: string[];    // Welche Materialien getestet
    format: 'written' | 'mc' | 'oral';
    details?: string;         // AI-generierte Analyse
  };

  // ── Echte Prüfung
  exam?: {
    title: string;
    date: string;             // Prüfungsdatum
    grade?: number;           // Note 1-6
    status: 'preparing' | 'done' | 'reviewed';
    materialIds: string[];    // Lernmaterial für Vorbereitung
    teacherReview?: string;   // Analyse der Lehrerkorrektur
  };

  // ── Einstein-generiertes Material
  aiContent?: {
    contentType: 'flashcards' | 'quiz' | 'summary' | 'mindmap' | 'practice';
    content: string;          // Markdown
    prompt: string;           // Was der User gefragt hat
  };

  // ── Note (Zeugnisnote am Semesterende)
  grade?: {
    value: number;            // 1-6
    semester: string;         // Semester-ID
    isZeugnis: boolean;       // Zeugnisnote vs Zwischennote
  };
}

// ─── EXAM (bestehend, erweitert) ────────────────────

export interface Exam {
  id: string;
  title: string;
  subject: string;
  subjectId?: string;       // NEU: Link zum Subject
  date: string;             // ISO date string
  status: 'passed' | 'upcoming' | 'ready';
  tags?: string[];
  content?: string;
  grade?: number;           // Note 1-6 (6 = best)
  materialIds?: string[];   // NEU: Verknüpfte Materialien
}

// ─── GOAL ───────────────────────────────────────────

export interface Goal {
  id: string;
  type: 'short' | 'mid' | 'long';
  title: string;
  description: string;
  metric?: {
    label: string;
    value: string | number;
    target?: string | number;
  };
  icon?: string;
}

// ─── USER ───────────────────────────────────────────

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

// ─── WIZARD ─────────────────────────────────────────

export interface WizardData {
  title: string;
  subject: string;
  subjectId?: string;
  date: string;
  contentTypes: string[];
  materialIds?: string[];
}

// ─── STEP STATUS ────────────────────────────────────

export enum StepStatus {
  IDLE = 'IDLE',
  LOADING = 'LOADING',
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

// ─── CHAT ───────────────────────────────────────────

export type ChatActionType = 'create_exam' | 'navigate' | 'generate_quiz' | 'generate_flashcards' | 'start_timer' | 'upload_material';

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: Date;
  attachments?: UploadedFile[];  // NEU: Dateien im Chat
  action?: {
    type: ChatActionType;
    data: Partial<Exam> & Record<string, any>;
    status: 'pending' | 'done';
  };
}

// ─── SUBJECT COLOR MAP ──────────────────────────────

export const SUBJECT_COLORS: Record<string, { bg: string; text: string; accent: string }> = {
  blue:   { bg: 'bg-blue-50',   text: 'text-blue-700',   accent: '#3b82f6' },
  red:    { bg: 'bg-red-50',    text: 'text-red-700',    accent: '#ef4444' },
  green:  { bg: 'bg-green-50',  text: 'text-green-700',  accent: '#22c55e' },
  purple: { bg: 'bg-purple-50', text: 'text-purple-700', accent: '#a855f7' },
  orange: { bg: 'bg-orange-50', text: 'text-orange-700', accent: '#f97316' },
  teal:   { bg: 'bg-teal-50',   text: 'text-teal-700',   accent: '#14b8a6' },
  pink:   { bg: 'bg-pink-50',   text: 'text-pink-700',   accent: '#ec4899' },
  amber:  { bg: 'bg-amber-50',  text: 'text-amber-700',  accent: '#f59e0b' },
  cyan:   { bg: 'bg-cyan-50',   text: 'text-cyan-700',   accent: '#06b6d4' },
  slate:  { bg: 'bg-slate-50',  text: 'text-slate-700',  accent: '#64748b' },
};

export const DEFAULT_SUBJECTS: Omit<Subject, 'id'>[] = [
  { name: 'Mathematik',  icon: '📐', color: 'blue',   targetGrade: 5.0, currentGrade: 0, order: 0 },
  { name: 'Deutsch',     icon: '📖', color: 'red',    targetGrade: 5.0, currentGrade: 0, order: 1 },
  { name: 'Englisch',    icon: '🌐', color: 'green',  targetGrade: 5.0, currentGrade: 0, order: 2 },
  { name: 'Französisch', icon: '🇫🇷', color: 'purple', targetGrade: 4.5, currentGrade: 0, order: 3 },
  { name: 'NMG',         icon: '🔬', color: 'teal',   targetGrade: 5.0, currentGrade: 0, order: 4 },
  { name: 'Informatik',  icon: '💻', color: 'orange', targetGrade: 5.0, currentGrade: 0, order: 5 },
];
