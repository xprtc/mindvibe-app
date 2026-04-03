import React, { useState } from 'react';
import {
  CheckCircle2, Sparkles, Check, TrendingUp,
  ChevronRight, Trophy, ArrowUpRight, Clock,
} from 'lucide-react';
import { Subject, Exam } from '../types';
import { examDateValue } from '../utils/examDate';
import { useSubscription } from '../context/SubscriptionContext';

interface DashboardProps {
  onNavigate: (page: string) => void;
  exams: Exam[];
  onOpenExam: (exam: Exam) => void;
  onAddExam: (exam: Exam) => void;
}

const gradeHistory = [
  { month: 'Aug', grade: 4.2 },
  { month: 'Sep', grade: 4.5 },
  { month: 'Okt', grade: 4.3 },
  { month: 'Nov', grade: 4.7 },
  { month: 'Dez', grade: 4.8 },
  { month: 'Jan', grade: 5.0 },
];

/** Reines SVG — Recharts verursacht mit React 19 oft einen leeren weißen Screen beim ersten Render. */
function GradeTrendSvg({ data }: { data: { month: string; grade: number }[] }) {
  const W = 640;
  const H = 220;
  const padL = 40;
  const padR = 16;
  const padT = 20;
  const padB = 32;
  const minG = 3.5;
  const maxG = 5.5;
  const iw = W - padL - padR;
  const ih = H - padT - padB;
  const n = data.length;
  const pts = data.map((d, i) => {
    const x = padL + (n <= 1 ? iw / 2 : (i / (n - 1)) * iw);
    const y = padT + ((maxG - d.grade) / (maxG - minG)) * ih;
    return { x, y, ...d };
  });
  const lineD = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
  const yTicks = [3.5, 4, 4.5, 5, 5.5];
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-[220px] block" role="img" aria-label="Notenentwicklung">
      {yTicks.map((g) => {
        const y = padT + ((maxG - g) / (maxG - minG)) * ih;
        return (
          <g key={g}>
            <line x1={padL} y1={y} x2={W - padR} y2={y} stroke="#e5e7eb" strokeWidth={1} />
            <text x={4} y={y + 4} fontSize={11} fill="#9ca3af">
              {g}
            </text>
          </g>
        );
      })}
      <path d={lineD} fill="none" stroke="#10A37F" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round" />
      {pts.map((p) => (
        <g key={p.month}>
          <circle cx={p.x} cy={p.y} r={5} fill="#fff" stroke="#10A37F" strokeWidth={2.5} />
          <text x={p.x} y={H - 8} textAnchor="middle" fontSize={11} fill="#9ca3af">
            {p.month}
          </text>
        </g>
      ))}
    </svg>
  );
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate, exams, onOpenExam }) => {
  const { plan, planInfo, promptUpgrade } = useSubscription();
  const currentXP = 2450;
  const streak = 4;
  const averageGrade = 4.8;
  const totalExams = exams.length;

  const [quests, setQuests] = useState([
    { id: 1, title: '10 min Mathe üben', xp: 50, completed: false },
    { id: 2, title: 'Flashcards wiederholen', xp: 30, completed: true },
    { id: 3, title: 'Wochenplanung machen', xp: 100, completed: false },
  ]);

  const subjects: Subject[] = [
    { id: '1', name: 'Deutsch', targetGrade: 5, currentGrade: 4.2, color: '#F472B6' },
    { id: '2', name: 'Englisch', targetGrade: 5, currentGrade: 5.3, color: '#60A5FA' },
    { id: '3', name: 'Mathe', targetGrade: 5, currentGrade: 4.8, color: '#818CF8' },
    { id: '4', name: 'Informatik', targetGrade: 5, currentGrade: 5.5, color: '#A78BFA' },
    { id: '5', name: 'Wirtschaft', targetGrade: 4.5, currentGrade: 4.0, color: '#FB923C' },
    { id: '6', name: 'Recht', targetGrade: 4.5, currentGrade: 4.8, color: '#F87171' },
  ];

  const sortedExams = [...exams].sort((a, b) => examDateValue(a).getTime() - examDateValue(b).getTime());
  const upcomingExams = sortedExams.filter(e => e.status !== 'passed').slice(0, 4);

  const leaderboard = [
    { rank: 1, name: 'Sarina', xp: 5200 },
    { rank: 2, name: 'Rayan', xp: 4850 },
    { rank: 3, name: 'Rinaldo', xp: 4100 },
    { rank: 4, name: 'Babo', xp: 3950 },
  ];

  // Stat card component like Mediocca
  const StatCard = ({ icon: Icon, iconBg, title, value, change, desc, onClick }: {
    icon: React.FC<any>; iconBg: string; title: string; value: string; change: string; desc: string; onClick?: () => void;
  }) => (
    <div className="mv-card p-5 md:p-6">
      <div className="flex items-center gap-3 mb-5">
        <div className={`w-11 h-11 rounded-xl ${iconBg} flex items-center justify-center shrink-0`}>
          <Icon size={22} className="text-white" />
        </div>
        <span className="text-base font-semibold text-[var(--color-mv-text)]">{title}</span>
      </div>
      <div className="flex items-baseline gap-3 mb-3">
        <span className="text-4xl font-bold text-[var(--color-mv-text)] tracking-tight">{value}</span>
        <span className="text-sm font-semibold text-[var(--color-mv-primary)] bg-[var(--color-mv-primary-light)] px-2.5 py-1 rounded-full flex items-center gap-1">
          <TrendingUp size={13} /> {change}
        </span>
      </div>
      <div className="flex items-center justify-between gap-2 mt-1">
        <span className="text-sm text-[var(--color-mv-text-tertiary)]">{desc}</span>
        {onClick && (
          <button onClick={onClick} className="text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-primary)] font-medium transition-colors whitespace-nowrap">
            Details →
          </button>
        )}
      </div>
    </div>
  );

  return (
    <div className="p-5 md:p-8 max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-24">

      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-mv-text)]">Dashboard</h1>
          <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1">Übersicht deiner Lernaktivitäten und Fortschritte</p>
        </div>
        <div className="flex gap-3">
          <button onClick={() => onNavigate('fortschritt')} className="mv-btn-secondary text-xs">
            Statistiken
          </button>
          <button onClick={() => onNavigate('create')} className="mv-btn-primary text-xs">
            + Prüfung erstellen
          </button>
        </div>
      </div>


      {/* Upgrade Banner for Basic users */}
      {plan === 'basic' && (
        <div className="mv-card p-5 bg-gradient-to-r from-[var(--color-mv-primary-light)] to-blue-50 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[var(--color-mv-primary)] text-white flex items-center justify-center shrink-0">
              <Sparkles size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-[var(--color-mv-text)]">Schalte alle Lerntools frei</p>
              <p className="text-xs text-[var(--color-mv-text-tertiary)]">Upgrade auf Smart für unbegrenzte KI-Hilfe, Audio, Video & mehr.</p>
            </div>
          </div>
          <button
            onClick={() => promptUpgrade('Upgrade auf Smart für das volle Lernerlebnis.')}
            className="mv-btn-primary text-xs whitespace-nowrap shrink-0"
          >
            Upgrade →
          </button>
        </div>
      )}

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LEFT: Chart + Exams (2 cols) */}
        <div className="lg:col-span-2 space-y-6">

          {/* Grade Trend Chart */}
          <div className="mv-card p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-base font-semibold text-[var(--color-mv-text)] flex items-center gap-2">
                <TrendingUp size={18} className="text-[var(--color-mv-primary)]" />
                Notenentwicklung
              </h3>
              <div className="flex gap-2">
                {subjects.slice(0, 3).map(s => (
                  <span key={s.id} className="flex items-center gap-1.5 text-xs text-[var(--color-mv-text-tertiary)]">
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                    {s.name}
                  </span>
                ))}
              </div>
            </div>
            <div className="w-full min-w-0">
              <GradeTrendSvg data={gradeHistory} />
            </div>
          </div>

          {/* Upcoming Exams */}
          <div className="mv-card">
            <div className="p-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--color-mv-text)] flex items-center gap-2">
                <Clock size={18} className="text-orange-500" />
                Anstehende Prüfungen
              </h3>
              <button onClick={() => onNavigate('pruefungen')} className="text-xs text-[var(--color-mv-primary)] font-medium hover:underline">
                Alle anzeigen
              </button>
            </div>
            <div className="px-2 pb-2">
              {upcomingExams.map(exam => {
                const d = examDateValue(exam);
                return (
                  <button
                    key={exam.id}
                    onClick={() => onOpenExam(exam)}
                    className="w-full flex items-center gap-4 px-4 py-3.5 rounded-xl hover:bg-[var(--color-mv-hover)] transition-colors text-left"
                  >
                    <div className="w-11 h-11 rounded-xl bg-[var(--color-mv-surface-secondary)] flex flex-col items-center justify-center shrink-0">
                      <span className="text-[10px] font-medium text-[var(--color-mv-text-tertiary)] leading-none">{d.toLocaleDateString('de-DE', { month: 'short' })}</span>
                      <span className="text-sm font-bold text-[var(--color-mv-text)] leading-none mt-0.5">{d.getDate()}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[var(--color-mv-text)] truncate">{exam.title}</p>
                      <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-0.5">{exam.subject}</p>
                    </div>
                    {exam.status === 'ready' && (
                      <span className="text-xs text-[var(--color-mv-primary)] bg-[var(--color-mv-primary-light)] px-2.5 py-1 rounded-full font-medium flex items-center gap-1">
                        <CheckCircle2 size={12} /> Bereit
                      </span>
                    )}
                    <ChevronRight size={16} className="text-[var(--color-mv-text-tertiary)] shrink-0" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Recommendation */}
          <div className="mv-card p-6 bg-gradient-to-br from-[var(--color-mv-surface)] to-[var(--color-mv-primary-light)] relative overflow-hidden">
            <div className="flex items-start gap-4">
              <div className="w-11 h-11 rounded-xl bg-[var(--color-mv-primary)] flex items-center justify-center shrink-0 shadow-sm">
                <Sparkles size={20} className="text-white" />
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-[var(--color-mv-text)]">Einstein empfiehlt</h4>
                <p className="text-sm text-[var(--color-mv-text-secondary)] mt-1.5 leading-relaxed">
                  Basierend auf deinen letzten Noten solltest du <strong>Englisch — Past Perfect</strong> wiederholen. 3 neue Übungen warten auf dich.
                </p>
                <button onClick={() => onNavigate('chat')} className="mt-3 text-sm font-medium text-[var(--color-mv-primary)] hover:underline flex items-center gap-1">
                  Übungen starten <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* RIGHT: Sidebar widgets (1 col) */}
        <div className="space-y-6">

          {/* Daily Quests */}
          <div className="mv-card">
            <div className="p-5 flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--color-mv-text)]">Tagesziele</h3>
              <span className="text-xs font-semibold text-[var(--color-mv-primary)] bg-[var(--color-mv-primary-light)] px-2.5 py-1 rounded-full">
                {quests.filter(q => q.completed).length}/{quests.length}
              </span>
            </div>
            <div className="px-2 pb-3">
              {quests.map(q => (
                <button
                  key={q.id}
                  onClick={() => setQuests(prev => prev.map(x => x.id === q.id ? { ...x, completed: !x.completed } : x))}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[var(--color-mv-hover)] transition-colors"
                >
                  <div className={`w-5 h-5 rounded-lg flex items-center justify-center transition-all ${
                    q.completed ? 'bg-[var(--color-mv-primary)]' : 'border-2 border-[var(--color-mv-active)]'
                  }`}>
                    {q.completed && <Check size={12} className="text-white" strokeWidth={3} />}
                  </div>
                  <span className={`flex-1 text-sm text-left ${q.completed ? 'text-[var(--color-mv-text-tertiary)] line-through' : 'text-[var(--color-mv-text)]'}`}>
                    {q.title}
                  </span>
                  <span className="text-xs text-[var(--color-mv-text-tertiary)]">+{q.xp} XP</span>
                </button>
              ))}
            </div>
          </div>

          {/* Subject Performance */}
          <div className="mv-card">
            <div className="p-5">
              <h3 className="text-base font-semibold text-[var(--color-mv-text)] mb-4">Fächer</h3>
              <div className="space-y-3">
                {subjects.map(s => {
                  const pct = Math.min((s.currentGrade / 6) * 100, 100);
                  const onTarget = s.currentGrade >= s.targetGrade;
                  return (
                    <div key={s.id} className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-sm text-[var(--color-mv-text)] w-24 truncate">{s.name}</span>
                      <div className="flex-1 h-2 bg-[var(--color-mv-bg)] rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: s.color }} />
                      </div>
                      <span className={`text-sm font-semibold w-8 text-right ${onTarget ? 'text-[var(--color-mv-primary)]' : 'text-[var(--color-mv-text)]'}`}>
                        {s.currentGrade}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Leaderboard */}
          <div className="mv-card">
            <div className="p-5">
              <h3 className="text-base font-semibold text-[var(--color-mv-text)] flex items-center gap-2 mb-4">
                <Trophy size={16} className="text-amber-500" /> Top Lerner
              </h3>
              <div className="space-y-2">
                {leaderboard.map(u => (
                  <div key={u.rank} className="flex items-center gap-3 py-2">
                    <span className={`w-6 h-6 rounded-lg flex items-center justify-center text-xs font-bold ${
                      u.rank === 1 ? 'bg-amber-100 text-amber-700' :
                      u.rank === 2 ? 'bg-gray-100 text-gray-600' :
                      u.rank === 3 ? 'bg-orange-100 text-orange-600' : 'text-[var(--color-mv-text-tertiary)]'
                    }`}>
                      {u.rank}
                    </span>
                    <div className="w-8 h-8 rounded-full bg-[var(--color-mv-surface-secondary)] flex items-center justify-center text-xs font-medium text-[var(--color-mv-text-secondary)]">
                      {u.name.charAt(0)}
                    </div>
                    <span className="flex-1 text-sm text-[var(--color-mv-text)]">{u.name}</span>
                    <span className="text-xs text-[var(--color-mv-text-tertiary)] font-medium">{u.xp.toLocaleString()} XP</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
