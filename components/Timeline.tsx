import React, { useMemo, useState } from 'react';
import {
  FileText, CheckCircle, GraduationCap, Sparkles, Star,
  Upload, ChevronDown, Clock, BookOpen,
} from 'lucide-react';
import type { TimelineEvent, Semester } from '../types';
import { getSemesterForDate } from '../types';

/* ================================================================
   Timeline — Minimal Design
   - Events collapsed by default (just icon + label)
   - Click to expand details
   - Grouped by semester, collapsible
   - Responsive: works on Desktop, iPad, iPhone
   ================================================================ */

interface TimelineProps {
  events: TimelineEvent[];
  subjectColor?: string;
  onEventClick?: (event: TimelineEvent) => void;
}

/* ── Event Icon (compact) ── */
function EventIcon({ type, small }: { type: TimelineEvent['type']; small?: boolean }) {
  const s = small ? 14 : 16;
  const base = small
    ? 'w-6 h-6 rounded-md flex items-center justify-center shrink-0'
    : 'w-7 h-7 rounded-lg flex items-center justify-center shrink-0';
  switch (type) {
    case 'material':
      return <div className={`${base} bg-blue-50 text-blue-500`}><FileText size={s} /></div>;
    case 'self_test':
      return <div className={`${base} bg-green-50 text-green-500`}><CheckCircle size={s} /></div>;
    case 'exam':
      return <div className={`${base} bg-amber-50 text-amber-500`}><GraduationCap size={s} /></div>;
    case 'ai_content':
      return <div className={`${base} bg-purple-50 text-purple-500`}><Sparkles size={s} /></div>;
    case 'grade':
      return <div className={`${base} bg-yellow-50 text-yellow-500`}><Star size={s} /></div>;
    case 'study':
      return <div className={`${base} bg-indigo-50 text-indigo-500`}><BookOpen size={s} /></div>;
    default:
      return <div className={`${base} bg-gray-50 text-gray-400`}><Clock size={s} /></div>;
  }
}

/* ── Short label for collapsed view ── */
function shortLabel(event: TimelineEvent): string {
  switch (event.type) {
    case 'material': return 'Material hochgeladen';
    case 'self_test': return 'Selbsttest';
    case 'exam': return event.exam?.title || event.title || 'Prüfung';
    case 'ai_content': return 'Einstein-Material';
    case 'grade': return event.grade?.isZeugnis ? 'Zeugnisnote' : 'Zwischennote';
    case 'study': return event.study?.topic || 'Gelernt';
    default: return event.title;
  }
}

/* ── Badge for collapsed view (optional small indicator) ── */
function eventBadge(event: TimelineEvent): { text: string; color: string } | null {
  switch (event.type) {
    case 'self_test': {
      const score = event.selfTest?.score || 0;
      return {
        text: `${score}%`,
        color: score >= 80 ? 'text-green-600 bg-green-50' : score >= 50 ? 'text-amber-600 bg-amber-50' : 'text-red-600 bg-red-50',
      };
    }
    case 'exam': {
      const grade = event.exam?.grade;
      if (!grade) return null;
      return {
        text: grade.toFixed(1),
        color: grade >= 5 ? 'text-green-700 bg-green-50' : grade >= 4 ? 'text-amber-700 bg-amber-50' : 'text-red-700 bg-red-50',
      };
    }
    case 'grade':
      return event.grade?.value ? {
        text: event.grade.value.toFixed(1),
        color: 'text-yellow-700 bg-yellow-50',
      } : null;
    case 'material': {
      const count = event.materials?.files?.length || 0;
      return count > 0 ? { text: `${count}`, color: 'text-blue-600 bg-blue-50' } : null;
    }
    default:
      return null;
  }
}

/* ── Expanded detail content ── */
function EventDetail({ event }: { event: TimelineEvent }) {
  switch (event.type) {
    case 'material':
      return (
        <div className="space-y-1.5">
          {event.materials?.description && (
            <p className="text-xs text-[var(--color-mv-text-secondary)]">{event.materials.description}</p>
          )}
          {event.materials?.files?.map((f, i) => (
            <div key={i} className="flex items-center gap-2 text-xs text-[var(--color-mv-text-tertiary)]">
              <FileText size={11} />
              <span className="truncate">{f.name}</span>
            </div>
          ))}
        </div>
      );
    case 'self_test':
      return (
        <div className="flex items-center gap-4 text-xs text-[var(--color-mv-text-secondary)]">
          <span>{event.selfTest?.correctAnswers}/{event.selfTest?.totalQuestions} richtig</span>
          <span>{event.selfTest?.format === 'mc' ? 'Multiple Choice' : event.selfTest?.format === 'oral' ? 'Mündlich' : 'Schriftlich'}</span>
        </div>
      );
    case 'exam': {
      const isPast = new Date(event.exam?.date || event.date) < new Date();
      return (
        <div className="space-y-1 text-xs text-[var(--color-mv-text-secondary)]">
          {event.exam?.grade && <p>Note: <strong>{event.exam.grade.toFixed(1)}</strong></p>}
          {!event.exam?.grade && isPast && <p className="text-amber-600">Note noch nicht eingetragen</p>}
          {!isPast && <p>Geplant: {new Date(event.exam?.date || event.date).toLocaleDateString('de-CH', { day: 'numeric', month: 'long' })}</p>}
        </div>
      );
    }
    case 'ai_content':
      return (
        <p className="text-xs text-[var(--color-mv-text-secondary)]">
          {event.aiContent?.contentType === 'flashcards' ? 'Flashcards' :
           event.aiContent?.contentType === 'quiz' ? 'Quiz' :
           event.aiContent?.contentType === 'summary' ? 'Zusammenfassung' : 'Lernmaterial'}
        </p>
      );
    case 'study':
      return (
        <div className="text-xs text-[var(--color-mv-text-secondary)] space-y-1">
          {event.study?.duration && <p>{event.study.duration} Minuten gelernt</p>}
          {event.study?.notes && <p>{event.study.notes}</p>}
        </div>
      );
    case 'grade':
      return (
        <p className="text-xs text-[var(--color-mv-text-secondary)]">
          {event.grade?.isZeugnis ? 'Zeugnisnote' : 'Zwischennote'}: <strong>{event.grade?.value?.toFixed(1)}</strong>
        </p>
      );
    default:
      return null;
  }
}

/* ── Single Timeline Event Row — minimal by default ── */
function TimelineRow({ event, isLast }: { event: TimelineEvent; isLast: boolean }) {
  const [expanded, setExpanded] = useState(false);
  const badge = eventBadge(event);
  const dateStr = new Date(event.date).toLocaleDateString('de-CH', { day: 'numeric', month: 'short' });

  return (
    <div className="flex gap-3">
      {/* Vertical line + dot */}
      <div className="flex flex-col items-center">
        <div className="w-2 h-2 rounded-full bg-[var(--color-mv-primary)] shrink-0 mt-2.5" />
        {!isLast && <div className="w-px flex-1 bg-[var(--color-mv-border)] mt-1" />}
      </div>

      {/* Event content */}
      <div className={`flex-1 pb-3 ${!isLast ? 'mb-0' : ''}`}>
        <button
          type="button"
          onClick={() => setExpanded(v => !v)}
          className="w-full flex items-center gap-2.5 py-1.5 px-2 -ml-1 rounded-lg hover:bg-[var(--color-mv-hover)] transition-colors text-left group"
        >
          <EventIcon type={event.type} small />
          <span className="text-[11px] text-[var(--color-mv-text-tertiary)] w-12 shrink-0">{dateStr}</span>
          <span className="text-sm text-[var(--color-mv-text)] truncate flex-1">{shortLabel(event)}</span>
          {badge && (
            <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md shrink-0 ${badge.color}`}>
              {badge.text}
            </span>
          )}
          <ChevronDown size={12} className={`text-[var(--color-mv-text-tertiary)] shrink-0 transition-transform opacity-0 group-hover:opacity-100 ${expanded ? 'rotate-180 opacity-100' : ''}`} />
        </button>

        {/* Expanded detail */}
        {expanded && (
          <div className="ml-9 mt-1 pl-2 border-l-2 border-[var(--color-mv-border)] pb-1">
            <EventDetail event={event} />
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Semester Group ── */
function SemesterGroup({ semester, events, isCurrentSemester, defaultExpanded, onEventClick }: {
  semester: Semester; events: TimelineEvent[]; isCurrentSemester: boolean;
  defaultExpanded: boolean; onEventClick?: (e: TimelineEvent) => void;
}) {
  const [expanded, setExpanded] = useState(defaultExpanded);

  const grades = events.filter(e => e.type === 'exam' && e.exam?.grade).map(e => e.exam!.grade!);
  const avg = grades.length > 0 ? (grades.reduce((a, b) => a + b, 0) / grades.length) : 0;

  return (
    <div className="mv-card overflow-hidden">
      {/* Semester header */}
      <button
        type="button"
        onClick={() => setExpanded(v => !v)}
        className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-[var(--color-mv-hover)] transition-colors"
      >
        <div className={`w-2 h-2 rounded-full shrink-0 ${isCurrentSemester ? 'bg-green-500' : 'bg-[var(--color-mv-text-tertiary)]'}`} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-semibold text-[var(--color-mv-text)]">
            {semester.label}
          </span>
          {isCurrentSemester && (
            <span className="ml-2 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">Aktuell</span>
          )}
          {!expanded && (
            <span className="ml-2 text-[11px] text-[var(--color-mv-text-tertiary)]">
              {events.length} {events.length === 1 ? 'Eintrag' : 'Einträge'}
            </span>
          )}
        </div>
        {avg > 0 && (
          <span className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
            avg >= 5 ? 'bg-green-50 text-green-700' : avg >= 4 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
          }`}>
            Ø {avg.toFixed(1)}
          </span>
        )}
        <ChevronDown size={14} className={`text-[var(--color-mv-text-tertiary)] shrink-0 transition-transform ${expanded ? 'rotate-180' : ''}`} />
      </button>

      {/* Events list */}
      {expanded && (
        <div className="px-4 pb-3">
          {events.length === 0 ? (
            <p className="text-xs text-[var(--color-mv-text-tertiary)] text-center py-4">
              Noch keine Einträge.
            </p>
          ) : (
            events.map((event, i) => (
              <TimelineRow key={event.id} event={event} isLast={i === events.length - 1} />
            ))
          )}
        </div>
      )}
    </div>
  );
}

/* ══════════════════════════════════════════════
   MAIN TIMELINE COMPONENT
   ══════════════════════════════════════════════ */

const Timeline: React.FC<TimelineProps> = ({ events, subjectColor, onEventClick }) => {
  const semesterGroups = useMemo(() => {
    const groups: Record<string, { semester: Semester; events: TimelineEvent[] }> = {};

    for (const event of events) {
      const sem = getSemesterForDate(event.date);
      if (!groups[sem.id]) {
        groups[sem.id] = { semester: sem, events: [] };
      }
      groups[sem.id].events.push(event);
    }

    // Sort events within each group by date desc (newest first)
    for (const g of Object.values(groups)) {
      g.events.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }

    // Sort semesters newest first
    return Object.values(groups).sort((a, b) => {
      if (a.semester.year !== b.semester.year) return b.semester.year - a.semester.year;
      return a.semester.type === 'summer' ? -1 : 1;
    });
  }, [events]);

  const currentSemester = getSemesterForDate(new Date().toISOString());

  // If no events, show empty state in current semester
  if (semesterGroups.length === 0) {
    return (
      <div className="mv-card overflow-hidden">
        <div className="flex items-center gap-3 px-4 py-3">
          <div className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-sm font-semibold text-[var(--color-mv-text)]">{currentSemester.label}</span>
          <span className="text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">Aktuell</span>
        </div>
        <div className="px-4 pb-5 text-center">
          <p className="text-xs text-[var(--color-mv-text-tertiary)]">
            Noch keine Einträge. Füge Material, Tests oder Noten hinzu.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {semesterGroups.map((group) => (
        <SemesterGroup
          key={group.semester.id}
          semester={group.semester}
          events={group.events}
          isCurrentSemester={group.semester.id === currentSemester.id}
          defaultExpanded={group.semester.id === currentSemester.id}
          onEventClick={onEventClick}
        />
      ))}
    </div>
  );
};

export default Timeline;
