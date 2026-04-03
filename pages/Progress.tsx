import React from 'react';
import {
  Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ReferenceLine, Line, ComposedChart,
} from 'recharts';
import {
  TrendingUp, Calendar, Target, Crown,
  ChevronRight, Award, GraduationCap, Clock, Zap, Star, BarChart3
} from 'lucide-react';
import { Exam } from '../types';
import { examDateValue } from '../utils/examDate';
import { SubtreeErrorBoundary } from '../components/AppErrorBoundary';

interface ProgressProps {
  exams: Exam[];
  onOpenExam: (exam: Exam) => void;
}

const SUBJECT_CONFIGS: Record<string, { color: string, target: number }> = {
  'Mathematik': { color: '#D97706', target: 5.0 },
  'Deutsch': { color: '#1C1917', target: 4.8 },
  'Englisch': { color: '#D97706', target: 5.2 },
  'Informatik': { color: '#D97706', target: 5.5 },
};

const Progress: React.FC<ProgressProps> = ({ exams, onOpenExam }) => {
  const currentXP = 2450;
  const level = 4;

  const passedExams = exams.filter(e => e.status === 'passed' && e.grade);
  const averageGrade = passedExams.length > 0
    ? (passedExams.reduce((acc, curr) => acc + (curr.grade || 0), 0) / passedExams.length).toFixed(2)
    : '-';

  const uniqueSubjects = Array.from(new Set(exams.map(e => e.subject))) as string[];

  const renderSubjectTimeline = (subjectName: string) => {
    const config = SUBJECT_CONFIGS[subjectName] || { color: '#D97706', target: 5.0 };

    const subjectExams = exams
      .filter(e => e.subject === subjectName)
      .sort((a, b) => examDateValue(a).getTime() - examDateValue(b).getTime());

    if (subjectExams.length === 0) return null;

    const gradedExams = subjectExams.filter(e => e.grade);
    const subjAverage = gradedExams.length > 0
      ? (gradedExams.reduce((acc, curr) => acc + (curr.grade || 0), 0) / gradedExams.length)
      : 0;

    const chartData = subjectExams.map(exam => {
      const isPassed = exam.status === 'passed';
      return {
        date: examDateValue(exam).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit' }),
        fullDate: exam.date,
        grade: isPassed ? exam.grade : null,
        target: config.target,
        future: !isPassed ? config.target : null,
        name: exam.title,
        status: exam.status,
        id: exam.id,
        originalExam: exam
      };
    });

    const CustomDot = (props: any) => {
      const { cx, cy, payload } = props;
      if (!cx || !cy) return null;
      if (payload.status !== 'passed') return null;
      return (
        <g cursor="pointer" onClick={() => onOpenExam(payload.originalExam)}>
          <circle cx={cx} cy={cy} r={5} fill="white" stroke={config.color} strokeWidth={3} />
        </g>
      );
    };

    const FutureDot = (props: any) => {
      const { cx, cy, payload } = props;
      if (!cx || !cy) return null;
      if (payload.status === 'passed') return null;
      return (
        <g cursor="pointer" onClick={() => onOpenExam(payload.originalExam)}>
          <circle cx={cx} cy={cy} r={4} fill="white" stroke="#cbd5e1" strokeWidth={2} strokeDasharray="3 3" />
        </g>
      );
    };

    return (
      <div key={subjectName} className="mv-card p-6 flex flex-col h-full">
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white" style={{ backgroundColor: config.color }}>
              <TrendingUp size={18} />
            </div>
            <div>
              <h3 className="text-base font-semibold text-[var(--color-mv-text)]">{subjectName}</h3>
              <div className="text-xs text-[var(--color-mv-text-tertiary)] mt-0.5">Ziel: {config.target.toFixed(1)}</div>
            </div>
          </div>
          <div className={`text-xl font-semibold ${subjAverage >= config.target ? 'text-emerald-500' : 'text-[var(--color-mv-text)]'}`}>
            Ø {subjAverage ? subjAverage.toFixed(2) : '-'}
          </div>
        </div>

        <div className="h-48 w-full min-w-0 mt-auto">
          <SubtreeErrorBoundary
            fallback={
              <div className="h-full flex items-center justify-center rounded-xl bg-[var(--color-mv-surface-secondary)] text-xs text-[var(--color-mv-text-tertiary)] px-3 text-center">
                Diagramm konnte nicht geladen werden.
              </div>
            }
          >
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                <defs>
                  <linearGradient id={`gradient-${subjectName}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor={config.color} stopOpacity={0.15} />
                    <stop offset="95%" stopColor={config.color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} dy={10} />
                <YAxis domain={[3, 6]} hide={false} axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 500 }} tickCount={4} />
                <Tooltip
                  cursor={{ stroke: '#e2e8f0', strokeWidth: 2 }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-[var(--color-mv-surface)] text-[var(--color-mv-text)] p-3 rounded-xl shadow-sm border border-[var(--color-mv-active)]">
                          <p className="font-medium text-xs">{data.name}</p>
                          <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-1">{data.grade ? `Note: ${data.grade}` : 'Geplant'}</p>
                        </div>
                      );
                    }
                    return null;
                  }}
                />
                <ReferenceLine y={config.target} stroke={config.color} strokeOpacity={0.2} strokeDasharray="5 5" strokeWidth={2} />
                <Area type="monotone" dataKey="grade" stroke="none" fill={`url(#gradient-${subjectName})`} />
                <Line type="monotone" dataKey="grade" stroke={config.color} strokeWidth={3} dot={<CustomDot />} activeDot={{ r: 7, strokeWidth: 0 }} connectNulls={true} />
                <Line type="monotone" dataKey="future" stroke="transparent" dot={<FutureDot />} activeDot={false} />
              </ComposedChart>
            </ResponsiveContainer>
          </SubtreeErrorBoundary>
        </div>
      </div>
    );
  };

  return (
    <div className="p-5 md:p-8 max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-24">

      {/* Header Stats Bar */}
      <div className="mv-card p-5 flex flex-wrap md:flex-nowrap justify-between gap-6 items-center">
        <div className="flex items-center gap-4 px-2 flex-1 min-w-[140px]">
          <div className="w-11 h-11 bg-amber-50 text-amber-500 rounded-xl flex items-center justify-center"><Crown size={22} /></div>
          <div>
            <div className="text-xs text-[var(--color-mv-text-tertiary)]">Level {level}</div>
            <div className="text-lg font-semibold text-[var(--color-mv-text)]">{currentXP} XP</div>
          </div>
        </div>
        <div className="w-px h-10 bg-[var(--color-mv-active)] hidden md:block" />
        <div className="flex items-center gap-4 px-2 flex-1 min-w-[140px]">
          <div className="w-11 h-11 bg-emerald-50 text-emerald-500 rounded-xl flex items-center justify-center"><Award size={22} /></div>
          <div>
            <div className="text-xs text-[var(--color-mv-text-tertiary)]">Schnitt</div>
            <div className="text-lg font-semibold text-[var(--color-mv-text)]">Ø {averageGrade}</div>
          </div>
        </div>
        <div className="w-px h-10 bg-[var(--color-mv-active)] hidden md:block" />
        <div className="flex items-center gap-4 px-2 flex-1 min-w-[140px]">
          <div className="w-11 h-11 bg-blue-50 text-[var(--color-mv-primary)] rounded-xl flex items-center justify-center"><Zap size={22} /></div>
          <div>
            <div className="text-xs text-[var(--color-mv-text-tertiary)]">Streak</div>
            <div className="text-lg font-semibold text-[var(--color-mv-text)]">4 Tage</div>
          </div>
        </div>
        <div className="w-px h-10 bg-[var(--color-mv-active)] hidden md:block" />
        <div className="flex items-center gap-4 px-2 flex-1 min-w-[140px]">
          <div className="w-11 h-11 bg-[var(--color-mv-surface-secondary)] text-[var(--color-mv-text-tertiary)] rounded-xl flex items-center justify-center"><Target size={22} /></div>
          <div>
            <div className="text-xs text-[var(--color-mv-text-tertiary)]">Ziel</div>
            <div className="text-lg font-semibold text-[var(--color-mv-text)]">Semester</div>
          </div>
        </div>
      </div>

      {/* Timeline Grid */}
      <div>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <h2 className="text-2xl font-bold text-[var(--color-mv-text)] flex items-center gap-3">
            <TrendingUp className="text-[var(--color-mv-primary)]" size={24} />
            Fortschritt
          </h2>
          <div className="flex bg-[var(--color-mv-surface)] p-1 rounded-xl shadow-sm">
            <button className="px-5 py-2 bg-[var(--color-mv-text)] rounded-lg text-xs font-medium text-white transition-all">Sem 1</button>
            <button className="px-5 py-2 text-xs font-medium text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)] transition-all">Sem 2</button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {uniqueSubjects.map(subject => renderSubjectTimeline(subject))}
        </div>
      </div>
    </div>
  );
};

export default Progress;
