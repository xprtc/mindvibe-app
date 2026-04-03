import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  Upload, ClipboardCheck, GraduationCap, Sparkles,
  Target, ChevronLeft, Calendar, Plus,
  CheckCircle, XCircle, ArrowRight, Loader2,
  BookOpen, Star, X,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import Timeline from '../components/Timeline';
import MaterialUpload, { type PendingFile } from '../components/MaterialUpload';
import {
  getTimelineEvents, addTimelineEvent, updateSubject,
} from '../services/firestoreService';
import { generateQuiz, type QuizQuestion } from '../services/geminiService';
import type { Subject, TimelineEvent, UploadedFile } from '../types';
import { getSemesterForDate, SUBJECT_COLORS } from '../types';

/* ================================================================
   SubjectHub — Minimal Design
   - Compact header with avg + target
   - Single "+" dropdown for all actions
   - Timeline as the central element
   - Expandable modals for forms
   ================================================================ */

interface SubjectHubProps {
  subject: Subject;
  onBack: () => void;
}

type ActiveModal = null | 'upload' | 'self_test' | 'self_test_manual' | 'exam_entry' | 'grade_entry' | 'study_entry';

const SubjectHub: React.FC<SubjectHubProps> = ({ subject, onBack }) => {
  const { user } = useSession();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [targetGrade, setTargetGrade] = useState(subject.targetGrade);
  const [editingTarget, setEditingTarget] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const colors = SUBJECT_COLORS[subject.color] || SUBJECT_COLORS.blue;

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setShowDropdown(false);
      }
    };
    if (showDropdown) document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, [showDropdown]);

  // Load timeline events
  useEffect(() => {
    if (!user?.uid) return;
    setLoading(true);
    getTimelineEvents(user.uid, subject.id)
      .then(setEvents)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user?.uid, subject.id]);

  // Calculate stats
  const examGrades = events.filter(e => e.type === 'exam' && e.exam?.grade).map(e => e.exam!.grade!);
  const avg = examGrades.length > 0
    ? Math.round((examGrades.reduce((a, b) => a + b, 0) / examGrades.length) * 10) / 10
    : 0;

  // Handle material upload
  const handleUpload = useCallback(async (files: PendingFile[], description: string) => {
    if (!user?.uid) return;
    const uploadedFiles: UploadedFile[] = files.map((f) => ({
      id: f.id, name: f.name, type: f.type, size: f.size, url: '', uploadedAt: new Date().toISOString(),
    }));
    const event: Omit<TimelineEvent, 'id'> = {
      subjectId: subject.id, type: 'material',
      date: new Date().toISOString().split('T')[0],
      title: `${files.length} ${files.length === 1 ? 'Dokument' : 'Dokumente'} hochgeladen`,
      semesterId: getSemesterForDate(new Date().toISOString()).id,
      materials: { files: uploadedFiles, description: description || undefined },
    };
    const created = await addTimelineEvent(user.uid, subject.id, event);
    setEvents((prev) => [...prev, created]);
    setActiveModal(null);
  }, [user?.uid, subject.id]);

  // Handle self test
  const handleSelfTest = useCallback(async (score: number, total: number, format: 'written' | 'mc' | 'oral') => {
    if (!user?.uid) return;
    const event: Omit<TimelineEvent, 'id'> = {
      subjectId: subject.id, type: 'self_test',
      date: new Date().toISOString().split('T')[0],
      title: 'Selbsttest',
      semesterId: getSemesterForDate(new Date().toISOString()).id,
      selfTest: { score: Math.round((score / total) * 100), totalQuestions: total, correctAnswers: score, materialIds: [], format },
    };
    const created = await addTimelineEvent(user.uid, subject.id, event);
    setEvents((prev) => [...prev, created]);
    setActiveModal(null);
  }, [user?.uid, subject.id]);

  // Handle exam entry
  const handleExamEntry = useCallback(async (title: string, date: string, grade?: number) => {
    if (!user?.uid) return;
    const event: Omit<TimelineEvent, 'id'> = {
      subjectId: subject.id, type: 'exam', date, title,
      semesterId: getSemesterForDate(date).id,
      exam: { title, date, grade: grade || undefined, status: grade ? 'done' : 'preparing', materialIds: [] },
    };
    const created = await addTimelineEvent(user.uid, subject.id, event);
    setEvents((prev) => [...prev, created]);
    setActiveModal(null);
  }, [user?.uid, subject.id]);

  // Handle grade entry (existing grades)
  const handleGradeEntry = useCallback(async (value: number, isZeugnis: boolean) => {
    if (!user?.uid) return;
    const sem = getSemesterForDate(new Date().toISOString());
    const event: Omit<TimelineEvent, 'id'> = {
      subjectId: subject.id, type: 'grade',
      date: new Date().toISOString().split('T')[0],
      title: isZeugnis ? 'Zeugnisnote' : 'Bisherige Note',
      semesterId: sem.id,
      grade: { value, semester: sem.id, isZeugnis },
    };
    const created = await addTimelineEvent(user.uid, subject.id, event);
    setEvents((prev) => [...prev, created]);
    setActiveModal(null);
  }, [user?.uid, subject.id]);

  // Handle study session
  const handleStudyEntry = useCallback(async (topic: string, duration: number, notes: string) => {
    if (!user?.uid) return;
    const event: Omit<TimelineEvent, 'id'> = {
      subjectId: subject.id, type: 'study',
      date: new Date().toISOString().split('T')[0],
      title: topic || 'Gelernt',
      semesterId: getSemesterForDate(new Date().toISOString()).id,
      study: { duration, topic, notes: notes || undefined },
    };
    const created = await addTimelineEvent(user.uid, subject.id, event);
    setEvents((prev) => [...prev, created]);
    setActiveModal(null);
  }, [user?.uid, subject.id]);

  // Save target grade
  const saveTargetGrade = useCallback(async () => {
    if (!user?.uid) return;
    await updateSubject(user.uid, subject.id, { targetGrade });
    setEditingTarget(false);
  }, [user?.uid, subject.id, targetGrade]);

  const openAction = (modal: ActiveModal) => {
    setShowDropdown(false);
    setActiveModal(modal);
  };

  // Dropdown action items
  const actions = [
    { id: 'self_test' as const, icon: ClipboardCheck, label: 'Selbsttest', color: 'text-green-500' },
    { id: 'exam_entry' as const, icon: GraduationCap, label: 'Test / Prüfung', color: 'text-amber-500' },
    { id: 'upload' as const, icon: Upload, label: 'Material hochladen', color: 'text-blue-500' },
    { id: 'study_entry' as const, icon: BookOpen, label: 'Gelernt', color: 'text-indigo-500' },
    { id: 'grade_entry' as const, icon: Star, label: 'Note eintragen', color: 'text-yellow-500' },
  ];

  return (
    <div className="max-w-[800px] mx-auto px-4 md:px-6 py-5 space-y-5 pb-24">

      {/* ── HEADER — compact ── */}
      <div className="flex items-center gap-3">
        <button type="button" onClick={onBack} className="p-1.5 rounded-lg hover:bg-[var(--color-mv-hover)] transition-colors">
          <ChevronLeft size={18} />
        </button>

        <span className="text-xl">{subject.icon}</span>
        <h1 className="text-lg font-bold text-[var(--color-mv-text)] flex-1">{subject.name}</h1>

        {/* Average badge */}
        <div className={`px-2.5 py-1 rounded-lg text-sm font-bold ${
          avg >= 5 ? 'bg-green-50 text-green-700' : avg >= 4 ? 'bg-amber-50 text-amber-700' : avg > 0 ? 'bg-red-50 text-red-700' : 'bg-gray-50 text-gray-400'
        }`}>
          {avg > 0 ? `Ø ${avg.toFixed(1)}` : 'Ø –'}
        </div>
      </div>

      {/* Target grade — inline, small */}
      <div className="flex items-center gap-4 text-xs text-[var(--color-mv-text-tertiary)]">
        <div className="flex items-center gap-1">
          <Target size={12} />
          {editingTarget ? (
            <input
              type="number" min="1" max="6" step="0.1"
              value={targetGrade}
              onChange={(e) => setTargetGrade(parseFloat(e.target.value) || 4)}
              className="w-12 text-xs border rounded px-1.5 py-0.5"
              autoFocus
              onBlur={saveTargetGrade}
              onKeyDown={(e) => e.key === 'Enter' && saveTargetGrade()}
            />
          ) : (
            <button type="button" onClick={() => setEditingTarget(true)} className="hover:text-[var(--color-mv-text-secondary)]">
              Ziel: {targetGrade.toFixed(1)}
            </button>
          )}
        </div>
        <span>{events.filter(e => e.type === 'exam').length} Tests</span>
        <span>{events.filter(e => e.type === 'self_test').length} Selbsttests</span>
      </div>

      {/* ── ADD EVENT BUTTON + DROPDOWN ── */}
      <div className="relative" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowDropdown(v => !v)}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium transition-all ${
            showDropdown
              ? 'bg-[var(--color-mv-text)] text-white'
              : 'bg-[var(--color-mv-surface)] text-[var(--color-mv-text)] border border-[var(--color-mv-border)] hover:border-[var(--color-mv-active)] hover:shadow-sm'
          }`}
        >
          <Plus size={16} className={showDropdown ? 'rotate-45' : ''} style={{ transition: 'transform 0.2s' }} />
          Ereignis hinzufügen
        </button>

        {showDropdown && (
          <div className="absolute top-full left-0 mt-2 bg-[var(--color-mv-surface)] rounded-xl shadow-lg border border-[var(--color-mv-border)] overflow-hidden z-20 w-56 animate-fade-in">
            {actions.map((a) => (
              <button
                key={a.id}
                type="button"
                onClick={() => openAction(a.id)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-mv-hover)] transition-colors"
              >
                <a.icon size={16} className={a.color} />
                <span className="text-sm text-[var(--color-mv-text)]">{a.label}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── MODAL OVERLAY ── */}
      {activeModal && (
        <div className="mv-card overflow-hidden">
          {/* Close button */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--color-mv-border)]">
            <h3 className="text-sm font-semibold text-[var(--color-mv-text)]">
              {activeModal === 'upload' && 'Material hochladen'}
              {activeModal === 'self_test' && 'Selbsttest'}
              {activeModal === 'self_test_manual' && 'Ergebnis eintragen'}
              {activeModal === 'exam_entry' && 'Test eintragen'}
              {activeModal === 'grade_entry' && 'Note eintragen'}
              {activeModal === 'study_entry' && 'Lernzeit eintragen'}
            </h3>
            <button type="button" onClick={() => setActiveModal(null)} className="p-1 rounded-lg hover:bg-[var(--color-mv-hover)]">
              <X size={16} className="text-[var(--color-mv-text-tertiary)]" />
            </button>
          </div>

          <div className="p-4">
            {activeModal === 'upload' && (
              <MaterialUpload onUpload={handleUpload} onCancel={() => setActiveModal(null)} />
            )}
            {activeModal === 'self_test' && (
              <InteractiveQuiz
                subjectName={subject.name}
                onComplete={handleSelfTest}
                onCancel={() => setActiveModal(null)}
                onManualEntry={() => setActiveModal('self_test_manual')}
              />
            )}
            {activeModal === 'self_test_manual' && (
              <SelfTestEntry onSubmit={handleSelfTest} onCancel={() => setActiveModal(null)} />
            )}
            {activeModal === 'exam_entry' && (
              <ExamEntryForm subjectName={subject.name} onSubmit={handleExamEntry} onCancel={() => setActiveModal(null)} />
            )}
            {activeModal === 'grade_entry' && (
              <GradeEntryForm onSubmit={handleGradeEntry} onCancel={() => setActiveModal(null)} />
            )}
            {activeModal === 'study_entry' && (
              <StudyEntryForm onSubmit={handleStudyEntry} onCancel={() => setActiveModal(null)} />
            )}
          </div>
        </div>
      )}

      {/* ── TIMELINE ── */}
      {loading ? (
        <div className="mv-card p-8 text-center">
          <div className="w-5 h-5 border-2 border-[var(--color-mv-border)] border-t-[var(--color-mv-primary)] rounded-full animate-spin mx-auto" />
        </div>
      ) : (
        <Timeline events={events} subjectColor={subject.color} />
      )}
    </div>
  );
};

/* ══════════════════════════════════════════════
   FORM COMPONENTS — all compact, minimal
   ══════════════════════════════════════════════ */

/* ── Grade Entry (bisherige Noten eintragen) ── */
function GradeEntryForm({ onSubmit, onCancel }: {
  onSubmit: (value: number, isZeugnis: boolean) => void;
  onCancel: () => void;
}) {
  const [grade, setGrade] = useState(4.5);
  const [isZeugnis, setIsZeugnis] = useState(false);

  return (
    <div className="space-y-4">
      <p className="text-xs text-[var(--color-mv-text-tertiary)]">
        Trage bisherige Noten dieses Semesters ein, damit wir deinen Durchschnitt berechnen können.
      </p>

      <div>
        <label className="text-xs text-[var(--color-mv-text-secondary)] mb-1 block">Note (1–6)</label>
        <input type="number" min="1" max="6" step="0.1" value={grade}
          onChange={(e) => setGrade(parseFloat(e.target.value) || 4)}
          className="mv-input w-full text-center text-lg font-bold" />
      </div>

      <label className="flex items-center gap-2 cursor-pointer">
        <input type="checkbox" checked={isZeugnis} onChange={(e) => setIsZeugnis(e.target.checked)}
          className="rounded border-gray-300" />
        <span className="text-xs text-[var(--color-mv-text-secondary)]">Zeugnisnote (Semesterende)</span>
      </label>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="mv-btn-secondary flex-1">Abbrechen</button>
        <button type="button" onClick={() => onSubmit(grade, isZeugnis)} className="mv-btn-primary flex-1">Speichern</button>
      </div>
    </div>
  );
}

/* ── Study Session Entry ── */
function StudyEntryForm({ onSubmit, onCancel }: {
  onSubmit: (topic: string, duration: number, notes: string) => void;
  onCancel: () => void;
}) {
  const [topic, setTopic] = useState('');
  const [duration, setDuration] = useState(30);
  const [notes, setNotes] = useState('');

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[var(--color-mv-text-secondary)] mb-1 block">Was hast du gelernt?</label>
        <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)}
          placeholder="z.B. Brüche, Vokabeln Kapitel 5..."
          className="mv-input w-full" />
      </div>

      <div>
        <label className="text-xs text-[var(--color-mv-text-secondary)] mb-2 block">Dauer (Minuten)</label>
        <div className="flex gap-2">
          {[15, 30, 45, 60, 90].map(m => (
            <button key={m} type="button" onClick={() => setDuration(m)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                duration === m
                  ? 'bg-[var(--color-mv-text)] text-white'
                  : 'bg-[var(--color-mv-surface-secondary)] text-[var(--color-mv-text-secondary)] hover:bg-[var(--color-mv-hover)]'
              }`}>
              {m} min
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs text-[var(--color-mv-text-secondary)] mb-1 block">Notizen (optional)</label>
        <textarea value={notes} onChange={(e) => setNotes(e.target.value)}
          placeholder="Wie lief es?"
          rows={2}
          className="mv-input w-full resize-none" />
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="mv-btn-secondary flex-1">Abbrechen</button>
        <button type="button" onClick={() => onSubmit(topic || 'Gelernt', duration, notes)} className="mv-btn-primary flex-1">Speichern</button>
      </div>
    </div>
  );
}

/* ── Self Test Entry (manual) ── */
function SelfTestEntry({ onSubmit, onCancel }: {
  onSubmit: (score: number, total: number, format: 'written' | 'mc' | 'oral') => void;
  onCancel: () => void;
}) {
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(10);
  const [format, setFormat] = useState<'written' | 'mc' | 'oral'>('mc');

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--color-mv-text-secondary)] mb-1 block">Richtig</label>
          <input type="number" min="0" max={total} value={correct}
            onChange={(e) => setCorrect(parseInt(e.target.value) || 0)}
            className="mv-input w-full" />
        </div>
        <div>
          <label className="text-xs text-[var(--color-mv-text-secondary)] mb-1 block">Total</label>
          <input type="number" min="1" value={total}
            onChange={(e) => setTotal(parseInt(e.target.value) || 1)}
            className="mv-input w-full" />
        </div>
      </div>

      <div className="flex gap-2">
        {(['mc', 'written', 'oral'] as const).map((f) => (
          <button key={f} type="button" onClick={() => setFormat(f)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              format === f
                ? 'bg-[var(--color-mv-text)] text-white'
                : 'bg-[var(--color-mv-surface-secondary)] text-[var(--color-mv-text-secondary)] hover:bg-[var(--color-mv-hover)]'
            }`}>
            {f === 'mc' ? 'Multiple Choice' : f === 'written' ? 'Schriftlich' : 'Mündlich'}
          </button>
        ))}
      </div>

      {total > 0 && (
        <div className="p-2 rounded-lg bg-[var(--color-mv-bg)] text-center">
          <span className={`text-lg font-bold ${
            (correct / total) >= 0.8 ? 'text-green-600' : (correct / total) >= 0.5 ? 'text-amber-600' : 'text-red-600'
          }`}>{Math.round((correct / total) * 100)}%</span>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="mv-btn-secondary flex-1">Abbrechen</button>
        <button type="button" onClick={() => onSubmit(correct, total, format)} className="mv-btn-primary flex-1">Speichern</button>
      </div>
    </div>
  );
}

/* ── Exam Entry ── */
function ExamEntryForm({ subjectName, onSubmit, onCancel }: {
  subjectName: string;
  onSubmit: (title: string, date: string, grade?: number) => void;
  onCancel: () => void;
}) {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [hasGrade, setHasGrade] = useState(false);
  const [grade, setGrade] = useState(4.5);
  const isPast = new Date(date) <= new Date();

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-[var(--color-mv-text-secondary)] mb-1 block">Titel</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder={`z.B. Algebra Test`}
          className="mv-input w-full" />
      </div>

      <div>
        <label className="text-xs text-[var(--color-mv-text-secondary)] mb-1 block">
          <Calendar size={12} className="inline mr-1" />
          Datum
        </label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="mv-input w-full" />
      </div>

      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={hasGrade} onChange={(e) => setHasGrade(e.target.checked)}
            className="rounded border-gray-300" />
          <span className="text-xs text-[var(--color-mv-text-secondary)]">Note vorhanden</span>
        </label>
        {hasGrade && (
          <input type="number" min="1" max="6" step="0.1" value={grade}
            onChange={(e) => setGrade(parseFloat(e.target.value) || 4)}
            className="mv-input w-16 text-center" />
        )}
      </div>

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="mv-btn-secondary flex-1">Abbrechen</button>
        <button type="button"
          onClick={() => onSubmit(title || `Test ${subjectName}`, date, hasGrade ? grade : undefined)}
          className="mv-btn-primary flex-1">
          {isPast ? 'Speichern' : 'Planen'}
        </button>
      </div>
    </div>
  );
}

/* ── Interactive Quiz (AI-generated) ── */
function InteractiveQuiz({ subjectName, onComplete, onCancel, onManualEntry }: {
  subjectName: string;
  onComplete: (score: number, total: number, format: 'written' | 'mc' | 'oral') => void;
  onCancel: () => void;
  onManualEntry: () => void;
}) {
  const [questions, setQuestions] = useState<QuizQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [confirmed, setConfirmed] = useState(false);
  const [correctCount, setCorrectCount] = useState(0);
  const [finished, setFinished] = useState(false);
  const [numQuestions, setNumQuestions] = useState(5);
  const [started, setStarted] = useState(false);

  const startQuiz = useCallback(async () => {
    setStarted(true);
    setLoading(true);
    setError(false);
    try {
      const qs = await generateQuiz(subjectName, numQuestions);
      if (qs.length === 0) { setError(true); } else { setQuestions(qs); }
    } catch { setError(true); }
    finally { setLoading(false); }
  }, [subjectName, numQuestions]);

  const handleConfirm = () => {
    if (selected === null) return;
    setConfirmed(true);
    if (selected === questions[currentIdx].correctIndex) setCorrectCount(c => c + 1);
  };

  const handleNext = () => {
    if (currentIdx + 1 >= questions.length) { setFinished(true); }
    else { setCurrentIdx(i => i + 1); setSelected(null); setConfirmed(false); }
  };

  // Start screen
  if (!started) {
    return (
      <div className="space-y-4">
        <p className="text-xs text-[var(--color-mv-text-tertiary)]">Einstein generiert Quizfragen für {subjectName}.</p>

        <div>
          <label className="text-xs text-[var(--color-mv-text-secondary)] mb-2 block">Anzahl Fragen</label>
          <div className="flex gap-2">
            {[3, 5, 10].map(n => (
              <button key={n} type="button" onClick={() => setNumQuestions(n)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                  numQuestions === n
                    ? 'bg-[var(--color-mv-text)] text-white'
                    : 'bg-[var(--color-mv-surface-secondary)] text-[var(--color-mv-text-secondary)] hover:bg-[var(--color-mv-hover)]'
                }`}>
                {n}
              </button>
            ))}
          </div>
        </div>

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="mv-btn-secondary flex-1">Abbrechen</button>
          <button type="button" onClick={startQuiz} className="mv-btn-primary flex-1">
            <Sparkles size={14} className="inline mr-1" /> Quiz starten
          </button>
        </div>
        <button type="button" onClick={onManualEntry}
          className="w-full text-[11px] text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text-secondary)]">
          Ergebnis manuell eintragen →
        </button>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="py-8 text-center">
        <Loader2 size={24} className="animate-spin text-[var(--color-mv-primary)] mx-auto mb-2" />
        <p className="text-xs text-[var(--color-mv-text-tertiary)]">Quiz wird erstellt...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-4 text-center space-y-3">
        <p className="text-xs text-red-600">Konnte Quiz nicht generieren.</p>
        <div className="flex gap-2 justify-center">
          <button type="button" onClick={onCancel} className="mv-btn-secondary text-xs">Abbrechen</button>
          <button type="button" onClick={startQuiz} className="mv-btn-primary text-xs">Nochmal</button>
        </div>
      </div>
    );
  }

  if (finished) {
    const pct = Math.round((correctCount / questions.length) * 100);
    return (
      <div className="py-4 text-center space-y-4">
        <div className={`w-16 h-16 rounded-full flex items-center justify-center mx-auto ${
          pct >= 80 ? 'bg-green-50' : pct >= 50 ? 'bg-amber-50' : 'bg-red-50'
        }`}>
          <span className={`text-2xl font-bold ${
            pct >= 80 ? 'text-green-600' : pct >= 50 ? 'text-amber-600' : 'text-red-600'
          }`}>{pct}%</span>
        </div>
        <p className="text-sm font-medium text-[var(--color-mv-text)]">
          {correctCount} von {questions.length} richtig
        </p>
        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="mv-btn-secondary flex-1">Schliessen</button>
          <button type="button" onClick={() => onComplete(correctCount, questions.length, 'mc')} className="mv-btn-primary flex-1">Speichern</button>
        </div>
      </div>
    );
  }

  // Quiz question
  const q = questions[currentIdx];
  const isCorrect = selected === q.correctIndex;
  const labels = ['A', 'B', 'C', 'D'];

  return (
    <div className="space-y-3">
      {/* Progress bar */}
      <div className="flex items-center justify-between text-[11px] text-[var(--color-mv-text-tertiary)]">
        <span>Frage {currentIdx + 1}/{questions.length}</span>
        <span>{correctCount} richtig</span>
      </div>
      <div className="w-full h-1 bg-[var(--color-mv-bg)] rounded-full overflow-hidden">
        <div className="h-full bg-[var(--color-mv-primary)] rounded-full transition-all"
          style={{ width: `${((currentIdx + (confirmed ? 1 : 0)) / questions.length) * 100}%` }} />
      </div>

      <h4 className="text-sm font-semibold text-[var(--color-mv-text)] leading-relaxed">{q.question}</h4>

      <div className="space-y-1.5">
        {q.options.map((opt, i) => {
          let cls = 'w-full flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-left text-sm transition-all border ';
          if (!confirmed) {
            cls += selected === i
              ? 'border-[var(--color-mv-primary)] bg-[var(--color-mv-primary-light)]'
              : 'border-[var(--color-mv-border)] hover:border-[var(--color-mv-active)]';
          } else if (i === q.correctIndex) {
            cls += 'border-green-400 bg-green-50';
          } else if (i === selected) {
            cls += 'border-red-300 bg-red-50';
          } else {
            cls += 'border-[var(--color-mv-border)] opacity-50';
          }

          return (
            <button key={i} type="button" onClick={() => !confirmed && setSelected(i)} className={cls}>
              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[11px] font-bold shrink-0 ${
                confirmed && i === q.correctIndex ? 'bg-green-500 text-white' :
                confirmed && i === selected ? 'bg-red-400 text-white' :
                selected === i ? 'bg-[var(--color-mv-primary)] text-white' :
                'bg-[var(--color-mv-surface-secondary)] text-[var(--color-mv-text-tertiary)]'
              }`}>
                {confirmed && i === q.correctIndex ? <CheckCircle size={12} /> :
                 confirmed && i === selected && !isCorrect ? <XCircle size={12} /> : labels[i]}
              </span>
              <span className="flex-1 text-[var(--color-mv-text)]">{opt}</span>
            </button>
          );
        })}
      </div>

      {confirmed && (
        <div className={`p-2.5 rounded-lg text-xs ${isCorrect ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-800'}`}>
          <strong>{isCorrect ? 'Richtig!' : 'Falsch.'}</strong> {q.explanation}
        </div>
      )}

      {!confirmed ? (
        <button type="button" onClick={handleConfirm} disabled={selected === null}
          className="mv-btn-primary w-full disabled:opacity-30 text-sm">Prüfen</button>
      ) : (
        <button type="button" onClick={handleNext} className="mv-btn-primary w-full text-sm flex items-center justify-center gap-1.5">
          {currentIdx + 1 >= questions.length ? 'Ergebnis' : 'Weiter'} <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
}

export default SubjectHub;
