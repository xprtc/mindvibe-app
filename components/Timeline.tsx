import React, { useMemo } from 'react';
import {
  FileText, CheckCircle, GraduationCap, Sparkles, Star,
  Upload, ChevronRight, Clock,
} from 'lucide-react';
import type { TimelineEvent, Semester } from '../types';
import { getSemesterForDate, SUBJECT_COLORS } from '../types';

/* ================================================================
   Timeline — responsive: vertikal (mobile), horizontal (desktop)
   Gruppiert nach Semester, innerhalb chronologisch
   ================================================================ */

interface TimelineProps {
  events: TimelineEvent[];
  subjectColor?: string;
  onEventClick?: (event: TimelineEvent) => void;
}

/* ── Event Icon ── */
function EventIcon({ type }: { type: TimelineEvent['type'] }) {
  const base = 'w-8 h-8 rounded-lg flex items-center justify-center shrink-0';
  switch (type) {
    case 'material':
      return <div className={`${base} bg-blue-50 text-blue-600`}><FileText size={16} /></div>;
    case 'self_test':
      return <div className={`${base} bg-green-50 text-green-600`}><CheckCircle size={16} /></div>;
    case 'exam':
      return <div className={`${base} bg-amber-50 text-amber-600`}><GraduationCap size={16} /></div>;
    case 'ai_content':
      return <div className={`${base} bg-purple-50 text-purple-600`}><Sparkles size={16} /></div>;
    case 'grade':
      return <div className={`${base} bg-yellow-50 text-yellow-600`}><Star size={16} /></div>;
    default:
      return <div className={`${base} bg-gray-50 text-gray-500`}><Clock size={16} /></div>;
  }
}

/* ── Format date nicely ── */
function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-CH', { day: 'numeric', month: 'short' });
}

function formatDateFull(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleDateString('de-CH', { day: 'numeric', month: 'long', year: 'numeric' });
}

/* ── Event description ── */
function eventDescription(event: TimelineEvent): { title: string; subtitle: string; badge?: string; badgeColor?: string } {
  switch (event.type) {
    case 'material': {
      const count = event.materials?.files?.length || 0;
      return {
        title: event.title || `${count} ${count === 1 ? 'Dokument' : 'Dokumente'} hochgeladen`,
        subtitle: event.materials?.description || 'Lernmaterial',
        badge: `${count} Dateien`,
        badgeColor: 'bg-blue-50 text-blue-600',
      };
    }
    case 'self_test': {
      const score = event.selfTest?.score || 0;
      return {
        title: event.title || 'Selbsttest',
        subtitle: `${event.selfTest?.correctAnswers}/${event.selfTest?.totalQuestions} Aufgaben · ${event.selfTest?.format === 'mc' ? 'Multiple Choice' : event.selfTest?.format === 'oral' ? 'Mündlich' : 'Schriftlich'}`,
        badge: `${score}%`,
        badgeColor: score >= 80 ? 'bg-green-50 text-green-600' : score >= 50 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-600',
      };
    }
    case 'exam': {
      const grade = event.exam?.grade;
      const isPast = new Date(event.exam?.date || event.date) < new Date();
      return {
        title: event.exam?.title || event.title || 'Prüfung',
        subtitle: grade ? `Note: ${grade.toFixed(1)}` : isPast ? 'Note ausstehend' : `Geplant: ${formatDateFull(event.exam?.date || event.date)}`,
        badge: grade ? grade.toFixed(1) : isPast ? '?' : 'Bald',
        badgeColor: grade ? (grade >= 5 ? 'bg-green-50 text-green-700 font-bold' : grade >= 4 ? 'bg-amber-50 text-amber-700 font-bold' : 'bg-red-50 text-red-700 font-bold') : 'bg-gray-50 text-gray-500',
      };
    }
    case 'ai_content':
      return {
        title: event.title || 'Einstein-Material',
        subtitle: event.aiContent?.contentType === 'flashcards' ? 'Flashcards' : event.aiContent?.contentType === 'quiz' ? 'Quiz' : event.aiContent?.contentType === 'summary' ? 'Zusammenfassung' : 'Lernmaterial',
        badge: 'KI',
        badgeColor: 'bg-purple-50 text-purple-600',
      };
    case 'grade':
      return {
        title: event.grade?.isZeugnis ? 'Zeugnisnote' : 'Zwischennote',
        subtitle: `Note: ${event.grade?.value?.toFixed(1) || '-'}`,
        badge: event.grade?.value?.toFixed(1) || '-',
        badgeColor: 'bg-yellow-50 text-yellow-700 font-bold',
      };
    default:
      return { title: event.title, subtitle: '' };
  }
}

/* ── Single Timeline Event Card ── */
function TimelineEventCard({ event, isLast, onClick }: {
  event: TimelineEvent; isLast: boolean; onClick?: () => void;
}) {
  const desc = eventDescription(event);
  const isFuture = new Date(event.date) > new Date();

  return (
    <div className="flex gap-3 group" onClick={onClick} role={onClick ? 'button' : undefined}
      style={{ cursor: onClick ? 'pointer' : undefined }}>
      {/* Vertical line + dot (mobile/vertical mode) */}
      <div className="flex flex-col items-center md:hidden">
        <div className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1.5 ${isFuture ? 'border-2 border-[var(--color-mv-primary)] bg-white' : 'bg-[var(--color-mv-primary)]'}`} />
        {!isLast && <div className="w-px flex-1 bg-[var(--color-mv-border)] mt-1" />}
      </div>

      {/* Card */}
      <div className={`flex-1 mb-4 md:mb-0 ${onClick ? 'hover:bg-[var(--color-mv-hover)] rounded-xl transition-colors' : ''}`}>
        <p className="text-[10px] text-[var(--color-mv-text-tertiary)] mb-1">{formatDate(event.date)}</p>
        <div className="flex items-start gap-3 p-2.5 rounded-xl">
          <EventIcon type={event.type} />
          <div className="flex-1 min-w-0">
            <p className={`text-sm font-medium ${isFuture ? 'text-[var(--color-mv-text-secondary)]' : 'text-[var(--color-mv-text)]'}`}>
              {desc.title}
            </p>
            <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-0.5">{desc.subtitle}</p>
          </div>
          {desc.badge && (
            <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-md shrink-0 ${desc.badgeColor}`}>
              {desc.badge}
            </span>
          )}
          {onClick && <ChevronRight size={14} className="text-[var(--color-mv-text-tertiary)] shrink-0 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" />}
        </div>
      </div>
    </div>
  );
}

/* ── Horizontal Event (Desktop) ── */
function HorizontalEventCard({ event, onClick }: {
  event: TimelineEvent; onClick?: () => void;
}) {
  const desc = eventDescription(event);
  const isFuture = new Date(event.date) > new Date();

  return (
    <div
      className={`flex flex-col items-center min-w-[120px] max-w-[140px] group ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
    >
      {/* Date */}
      <p className="text-[10px] text-[var(--color-mv-text-tertiary)] mb-2 whitespace-nowrap">{formatDate(event.date)}</p>

      {/* Dot on line */}
      <div className={`w-3 h-3 rounded-full shrink-0 z-10 ${
        isFuture ? 'border-2 border-[var(--color-mv-primary)] bg-white' : 'bg-[var(--color-mv-primary)]'
      }`} />

      {/* Card below line */}
      <div className={`mt-3 p-2.5 rounded-xl text-center w-full ${
        onClick ? 'hover:bg-[var(--color-mv-hover)]' : ''
      } transition-colors`}>
        <EventIcon type={event.type} />
        {desc.badge && (
          <span className={`inline-block mt-1.5 text-[10px] font-semibold px-2 py-0.5 rounded-md ${desc.badgeColor}`}>
            {desc.badge}
          </span>
        )}
        <p className={`text-xs font-medium mt-1 leading-tight ${isFuture ? 'text-[var(--color-mv-text-secondary)]' : 'text-[var(--color-mv-text)]'}`}>
          {desc.title}
        </p>
        <p className="text-[10px] text-[var(--color-mv-text-tertiary)] mt-0.5 leading-tight">{desc.subtitle}</p>
      </div>
    </div>
  );
}

/* ── Semester Group ── */
function SemesterGroup({ semester, events, isCurrentSemester, defaultExpanded, onEventClick }: {
  semester: Semester; events: TimelineEvent[]; isCurrentSemester: boolean;
  defaultExpanded: boolean; onEventClick?: (e: TimelineEvent) => void;
}) {
  const [expanded, setExpanded] = React.useState(defaultExpanded);

  // Calculate semester average from exam grades
  const grades = events.filter(e => e.type === 'exam' && e.exam?.grade).map(e => e.exam!.grade!);
  const avg = grades.length > 0 ? (grades.reduce((a, b) => a + b, 0) / grades.length) : 0;
  const examCount = events.filter(e => e.type === 'exam').length;
  const uploadCount = events.filter(e => e.type === 'material').length;

  return (
    <div className={`mv-card overflow-hidden ${isCurrentSemester ? '' : 'opacity-90'}`}>
      {/* Semester header — always visible */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-[var(--color-mv-hover)] transition-colors"
      >
        <div className={`w-2 h-2 rounded-full ${isCurrentSemester ? 'bg-green-500' : 'bg-[var(--color-mv-text-tertiary)]'}`} />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-[var(--color-mv-text)]">
            {semester.label}
            {isCurrentSemester && <span className="ml-2 text-[10px] font-medium text-green-600 bg-green-50 px-1.5 py-0.5 rounded-md">Aktuell</span>}
          </p>
          {!expanded && (
            <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-0.5">
              {examCount} {examCount === 1 ? 'Test' : 'Tests'} · {uploadCount} Uploads
              {avg > 0 && ` · Beste Note: ${Math.max(...grades).toFixed(1)}`}
            </p>
          )}
        </div>
        {avg > 0 && (
          <span className={`text-sm font-bold px-2.5 py-1 rounded-lg ${
            avg >= 5 ? 'bg-green-50 text-green-700' : avg >= 4 ? 'bg-amber-50 text-amber-700' : 'bg-red-50 text-red-700'
          }`}>
            Ø {avg.toFixed(1)}
          </span>
        )}
        <ChevronRight size={16} className={`text-[var(--color-mv-text-tertiary)] shrink-0 transition-transform ${expanded ? 'rotate-90' : ''}`} />
      </button>

      {/* Events */}
      {expanded && (
        <div className="px-5 pb-4">
          {/* Mobile: vertical list */}
          <div className="md:hidden space-y-0">
            {events.map((event, i) => (
              <TimelineEventCard
                key={event.id}
                event={event}
                isLast={i === events.length - 1}
                onClick={onEventClick ? () => onEventClick(event) : undefined}
              />
            ))}
          </div>

          {/* Desktop: horizontal timeline */}
          <div className="hidden md:block overflow-x-auto">
            <div className="relative flex items-start gap-0 pt-2 pb-4 min-w-max">
              {/* Horizontal line */}
              <div className="absolute top-[38px] left-4 right-4 h-px bg-[var(--color-mv-border)]" />
              {events.map((event) => (
                <HorizontalEventCard
                  key={event.id}
                  event={event}
                  onClick={onEventClick ? () => onEventClick(event) : undefined}
                />
              ))}
            </div>
          </div>

          {events.length === 0 && (
            <p className="text-sm text-[var(--color-mv-text-tertiary)] text-center py-6">
              Noch keine Einträge in diesem Semester.
            </p>
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
  // Group events by semester
  const semesterGroups = useMemo(() => {
    const groups: Record<string, { semester: Semester; events: TimelineEvent[] }> = {};

    for (const event of events) {
      const sem = getSemesterForDate(event.date);
      if (!groups[sem.id]) {
        groups[sem.id] = { semester: sem, events: [] };
      }
      groups[sem.id].events.push(event);
    }

    // Sort semesters newest first
    return Object.values(groups).sort((a, b) => {
      if (a.semester.year !== b.semester.year) return b.semester.year - a.semester.year;
      return a.semester.type === 'summer' ? -1 : 1;
    });
  }, [events]);

  // Current semester
  const currentSemester = getSemesterForDate(new Date().toISOString());

  if (semesterGroups.length === 0) {
    return (
      <div className="mv-card p-8 text-center">
        <Upload size={32} className="mx-auto text-[var(--color-mv-text-tertiary)] mb-3" />
        <p className="text-sm font-medium text-[var(--color-mv-text)]">Noch keine Einträge</p>
        <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-1">
          Lade Lernmaterial hoch oder trage eine Prüfung ein, um deine Timeline zu starten.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
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
