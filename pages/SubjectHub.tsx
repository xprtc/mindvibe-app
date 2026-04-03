import React, { useState, useEffect, useCallback } from 'react';
import {
  Upload, ClipboardCheck, GraduationCap, Sparkles,
  Target, TrendingUp, ChevronLeft, MoreHorizontal,
  Calendar, Edit3,
} from 'lucide-react';
import { useSession } from '../context/SessionContext';
import Timeline from '../components/Timeline';
import MaterialUpload, { type PendingFile } from '../components/MaterialUpload';
import {
  getTimelineEvents, addTimelineEvent, updateSubject,
} from '../services/firestoreService';
import type { Subject, TimelineEvent, UploadedFile } from '../types';
import { getSemesterForDate, SUBJECT_COLORS } from '../types';

/* ================================================================
   SubjectHub — the main page for each subject
   Shows: Header with grade, Semester Timeline, Action buttons
   ================================================================ */

interface SubjectHubProps {
  subject: Subject;
  onBack: () => void;
}

type ActiveModal = null | 'upload' | 'self_test' | 'exam_entry';

const SubjectHub: React.FC<SubjectHubProps> = ({ subject, onBack }) => {
  const { user } = useSession();
  const [events, setEvents] = useState<TimelineEvent[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeModal, setActiveModal] = useState<ActiveModal>(null);
  const [targetGrade, setTargetGrade] = useState(subject.targetGrade);
  const [editingTarget, setEditingTarget] = useState(false);

  const colors = SUBJECT_COLORS[subject.color] || SUBJECT_COLORS.blue;

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
  const totalUploads = events.filter(e => e.type === 'material').length;
  const totalTests = events.filter(e => e.type === 'self_test').length;
  const totalExams = events.filter(e => e.type === 'exam').length;

  // Handle material upload
  const handleUpload = useCallback(async (files: PendingFile[], description: string) => {
    if (!user?.uid) return;

    // For now, create timeline event with file metadata (actual Firebase Storage upload would go here)
    const uploadedFiles: UploadedFile[] = files.map((f) => ({
      id: f.id,
      name: f.name,
      type: f.type,
      size: f.size,
      url: '', // Would be Firebase Storage URL
      uploadedAt: new Date().toISOString(),
    }));

    const event: Omit<TimelineEvent, 'id'> = {
      subjectId: subject.id,
      type: 'material',
      date: new Date().toISOString().split('T')[0],
      title: `${files.length} ${files.length === 1 ? 'Dokument' : 'Dokumente'} hochgeladen`,
      semesterId: getSemesterForDate(new Date().toISOString()).id,
      materials: {
        files: uploadedFiles,
        description: description || undefined,
      },
    };

    const created = await addTimelineEvent(user.uid, subject.id, event);
    setEvents((prev) => [...prev, created]);
    setActiveModal(null);
  }, [user?.uid, subject.id]);

  // Handle self test entry
  const handleSelfTest = useCallback(async (score: number, total: number, format: 'written' | 'mc' | 'oral') => {
    if (!user?.uid) return;

    const event: Omit<TimelineEvent, 'id'> = {
      subjectId: subject.id,
      type: 'self_test',
      date: new Date().toISOString().split('T')[0],
      title: 'Selbsttest',
      semesterId: getSemesterForDate(new Date().toISOString()).id,
      selfTest: {
        score: Math.round((score / total) * 100),
        totalQuestions: total,
        correctAnswers: score,
        materialIds: [],
        format,
      },
    };

    const created = await addTimelineEvent(user.uid, subject.id, event);
    setEvents((prev) => [...prev, created]);
    setActiveModal(null);
  }, [user?.uid, subject.id]);

  // Handle exam entry
  const handleExamEntry = useCallback(async (title: string, date: string, grade?: number) => {
    if (!user?.uid) return;

    const event: Omit<TimelineEvent, 'id'> = {
      subjectId: subject.id,
      type: 'exam',
      date,
      title,
      semesterId: getSemesterForDate(date).id,
      exam: {
        title,
        date,
        grade: grade || undefined,
        status: grade ? 'done' : 'preparing',
        materialIds: [],
      },
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

  return (
    <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-6 space-y-6">

      {/* ── HEADER ── */}
      <div className="flex items-start gap-4">
        <button type="button" onClick={onBack} className="mt-1 p-2 rounded-xl hover:bg-[var(--color-mv-hover)] transition-colors md:hidden">
          <ChevronLeft size={20} />
        </button>

        <div className="flex-1">
          <div className="flex items-center gap-3 mb-1">
            <span className="text-2xl">{subject.icon}</span>
            <h1 className="text-xl font-bold text-[var(--color-mv-text)]">{subject.name}</h1>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap items-center gap-4 mt-3">
            {/* Average */}
            <div className="flex items-center gap-2">
              <div className={`px-3 py-1.5 rounded-xl ${avg >= 5 ? 'bg-green-50' : avg >= 4 ? 'bg-amber-50' : avg > 0 ? 'bg-red-50' : 'bg-gray-50'}`}>
                <span className={`text-lg font-bold ${avg >= 5 ? 'text-green-700' : avg >= 4 ? 'text-amber-700' : avg > 0 ? 'text-red-700' : 'text-gray-400'}`}>
                  {avg > 0 ? `Ø ${avg.toFixed(1)}` : 'Ø –'}
                </span>
              </div>
            </div>

            {/* Target */}
            <div className="flex items-center gap-1.5 text-xs text-[var(--color-mv-text-secondary)]">
              <Target size={13} />
              {editingTarget ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number" min="1" max="6" step="0.1"
                    value={targetGrade}
                    onChange={(e) => setTargetGrade(parseFloat(e.target.value) || 4)}
                    className="w-14 text-sm border rounded-lg px-2 py-0.5"
                    autoFocus
                    onBlur={saveTargetGrade}
                    onKeyDown={(e) => e.key === 'Enter' && saveTargetGrade()}
                  />
                </div>
              ) : (
                <button type="button" onClick={() => setEditingTarget(true)} className="hover:underline">
                  Ziel: {targetGrade.toFixed(1)}
                </button>
              )}
            </div>

            {/* Quick stats */}
            <span className="text-xs text-[var(--color-mv-text-tertiary)]">{totalExams} Tests</span>
            <span className="text-xs text-[var(--color-mv-text-tertiary)]">{totalUploads} Uploads</span>
            <span className="text-xs text-[var(--color-mv-text-tertiary)]">{totalTests} Selbsttests</span>
          </div>
        </div>
      </div>

      {/* ── 3 ACTION BUTTONS ── */}
      <div className="grid grid-cols-3 gap-3">
        <button
          type="button"
          onClick={() => setActiveModal('upload')}
          className="mv-card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow group"
        >
          <div className={`w-10 h-10 rounded-xl ${colors.bg} ${colors.text} flex items-center justify-center group-hover:scale-105 transition-transform`}>
            <Upload size={18} />
          </div>
          <span className="text-xs font-medium text-[var(--color-mv-text)]">Material hochladen</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModal('self_test')}
          className="mv-card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-green-50 text-green-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <ClipboardCheck size={18} />
          </div>
          <span className="text-xs font-medium text-[var(--color-mv-text)]">Selbsttest</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveModal('exam_entry')}
          className="mv-card p-4 flex flex-col items-center gap-2 hover:shadow-md transition-shadow group"
        >
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center group-hover:scale-105 transition-transform">
            <GraduationCap size={18} />
          </div>
          <span className="text-xs font-medium text-[var(--color-mv-text)]">Test eintragen</span>
        </button>
      </div>

      {/* ── MODAL OVERLAYS ── */}
      {activeModal === 'upload' && (
        <div className="mv-card p-5">
          <h3 className="text-sm font-semibold text-[var(--color-mv-text)] mb-4">Material hochladen</h3>
          <MaterialUpload
            onUpload={handleUpload}
            onCancel={() => setActiveModal(null)}
          />
        </div>
      )}

      {activeModal === 'self_test' && (
        <SelfTestEntry
          onSubmit={handleSelfTest}
          onCancel={() => setActiveModal(null)}
        />
      )}

      {activeModal === 'exam_entry' && (
        <ExamEntryForm
          subjectName={subject.name}
          onSubmit={handleExamEntry}
          onCancel={() => setActiveModal(null)}
        />
      )}

      {/* ── TIMELINE ── */}
      <div>
        <h2 className="text-sm font-semibold text-[var(--color-mv-text)] mb-3">Verlauf</h2>
        {loading ? (
          <div className="mv-card p-8 text-center">
            <div className="w-5 h-5 border-2 border-[var(--color-mv-border)] border-t-[var(--color-mv-primary)] rounded-full animate-spin mx-auto" />
            <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-2">Lade Timeline...</p>
          </div>
        ) : (
          <Timeline events={events} subjectColor={subject.color} />
        )}
      </div>
    </div>
  );
};

/* ── SELF TEST ENTRY FORM ── */
function SelfTestEntry({ onSubmit, onCancel }: {
  onSubmit: (score: number, total: number, format: 'written' | 'mc' | 'oral') => void;
  onCancel: () => void;
}) {
  const [correct, setCorrect] = useState(0);
  const [total, setTotal] = useState(10);
  const [format, setFormat] = useState<'written' | 'mc' | 'oral'>('mc');

  return (
    <div className="mv-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--color-mv-text)]">Selbsttest-Ergebnis eintragen</h3>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="text-xs text-[var(--color-mv-text-secondary)] mb-1 block">Richtige Antworten</label>
          <input type="number" min="0" max={total} value={correct}
            onChange={(e) => setCorrect(parseInt(e.target.value) || 0)}
            className="mv-input w-full" />
        </div>
        <div>
          <label className="text-xs text-[var(--color-mv-text-secondary)] mb-1 block">Total Aufgaben</label>
          <input type="number" min="1" value={total}
            onChange={(e) => setTotal(parseInt(e.target.value) || 1)}
            className="mv-input w-full" />
        </div>
      </div>

      <div>
        <label className="text-xs text-[var(--color-mv-text-secondary)] mb-2 block">Format</label>
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
      </div>

      {/* Preview */}
      {total > 0 && (
        <div className="p-3 rounded-xl bg-[var(--color-mv-bg)] text-center">
          <span className={`text-2xl font-bold ${
            (correct / total) >= 0.8 ? 'text-green-600' : (correct / total) >= 0.5 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {Math.round((correct / total) * 100)}%
          </span>
          <p className="text-xs text-[var(--color-mv-text-tertiary)]">{correct} von {total} richtig</p>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="mv-btn-secondary flex-1">Abbrechen</button>
        <button type="button" onClick={() => onSubmit(correct, total, format)}
          className="mv-btn-primary flex-1">Speichern</button>
      </div>
    </div>
  );
}

/* ── EXAM ENTRY FORM ── */
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
    <div className="mv-card p-5 space-y-4">
      <h3 className="text-sm font-semibold text-[var(--color-mv-text)]">Test eintragen</h3>

      <div>
        <label className="text-xs text-[var(--color-mv-text-secondary)] mb-1 block">Titel</label>
        <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
          placeholder={`z.B. Algebra Test — ${subjectName}`}
          className="mv-input w-full" />
      </div>

      <div>
        <label className="text-xs text-[var(--color-mv-text-secondary)] mb-1 block">
          <Calendar size={12} className="inline mr-1" />
          {isPast ? 'Prüfungsdatum' : 'Geplantes Datum'}
        </label>
        <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
          className="mv-input w-full" />
      </div>

      {/* Grade toggle (only if date is past) */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={hasGrade} onChange={(e) => setHasGrade(e.target.checked)}
            className="rounded border-gray-300" />
          <span className="text-xs text-[var(--color-mv-text-secondary)]">Note vorhanden</span>
        </label>
        {hasGrade && (
          <input type="number" min="1" max="6" step="0.1" value={grade}
            onChange={(e) => setGrade(parseFloat(e.target.value) || 4)}
            className="mv-input w-20 text-center" />
        )}
      </div>

      {hasGrade && (
        <div className="p-3 rounded-xl bg-[var(--color-mv-bg)] text-center">
          <span className={`text-2xl font-bold ${
            grade >= 5 ? 'text-green-600' : grade >= 4 ? 'text-amber-600' : 'text-red-600'
          }`}>
            {grade.toFixed(1)}
          </span>
          <p className="text-xs text-[var(--color-mv-text-tertiary)]">
            {grade >= 5 ? 'Sehr gut!' : grade >= 4 ? 'Genügend' : 'Ungenügend — lass uns üben!'}
          </p>
        </div>
      )}

      <div className="flex gap-3">
        <button type="button" onClick={onCancel} className="mv-btn-secondary flex-1">Abbrechen</button>
        <button type="button"
          onClick={() => onSubmit(title || `Test ${subjectName}`, date, hasGrade ? grade : undefined)}
          disabled={!title && !date}
          className="mv-btn-primary flex-1 disabled:opacity-40">
          {isPast ? 'Test speichern' : 'Test planen'}
        </button>
      </div>
    </div>
  );
}

export default SubjectHub;
