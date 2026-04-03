import React from 'react';
import { Trophy, Star, Medal, TrendingUp, Target, Crown, Zap, Lock, Award, Calendar, CheckCircle } from 'lucide-react';
import { Exam } from '../types';

interface ErfolgeProps {
  exams: Exam[];
}

const Erfolge: React.FC<ErfolgeProps> = ({ exams }) => {
  const passedExams = exams.filter(e => e.status === 'passed');
  const currentLevel = 4;
  const currentXP = 2450;
  const nextLevelXP = 3000;
  const progressPercent = (currentXP / nextLevelXP) * 100;

  const completedTestsWithGrades = passedExams.map((exam, index) => ({
    ...exam,
    grade: index === 0 ? 5.5 : 4.8
  }));

  const averageGrade = completedTestsWithGrades.length > 0
    ? (completedTestsWithGrades.reduce((acc, curr) => acc + curr.grade, 0) / completedTestsWithGrades.length).toFixed(1)
    : '-';

  const badges = [
    { id: 1, name: 'Lern-Starter', icon: <Zap size={20} />, unlocked: true, color: 'bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)]' },
    { id: 2, name: 'Mathe-Genie', icon: <Trophy size={20} />, unlocked: true, color: 'bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)]' },
    { id: 3, name: 'Streak 7', icon: <Star size={20} />, unlocked: false, color: 'bg-[var(--color-mv-surface-secondary)] text-[var(--color-mv-text-tertiary)]' },
    { id: 4, name: 'Nachteule', icon: <Crown size={20} />, unlocked: false, color: 'bg-[var(--color-mv-surface-secondary)] text-[var(--color-mv-text-tertiary)]' },
  ];

  return (
    <div className="p-5 md:p-8 max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-24">

      {/* Top: Level + Challenge */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Level Banner */}
        <div className="md:col-span-2 mv-card p-6 flex items-center gap-6 relative overflow-hidden">
          <div className="w-16 h-16 shrink-0 rounded-xl bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)] flex items-center justify-center font-bold text-2xl">
            {currentLevel}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex justify-between items-baseline mb-2">
              <h2 className="text-lg font-semibold text-[var(--color-mv-text)]">Elite Student</h2>
              <span className="text-xs text-[var(--color-mv-text-tertiary)]">{currentXP} / {nextLevelXP} XP</span>
            </div>
            <div className="w-full h-2.5 bg-[var(--color-mv-bg)] rounded-full overflow-hidden">
              <div className="h-full bg-[var(--color-mv-primary)] rounded-full transition-all duration-1000" style={{ width: `${progressPercent}%` }} />
            </div>
          </div>
          <Crown className="text-[var(--color-mv-active)] absolute -right-6 -bottom-6 w-28 h-28 transform rotate-12" />
        </div>

        {/* Weekly Challenge */}
        <div className="mv-card p-6 bg-[var(--color-mv-text)] text-white relative overflow-hidden">
          <div className="relative z-10 flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Target size={16} className="text-[var(--color-mv-primary)]" />
                <span className="text-xs opacity-60">Weekly Challenge</span>
              </div>
              <div className="text-3xl font-semibold">85%</div>
              <div className="text-xs opacity-60 mt-1">100 Lernminuten</div>
            </div>
            <button className="text-xs font-medium bg-white/10 hover:bg-white/20 px-4 py-2.5 rounded-xl transition-all">
              Claim
            </button>
          </div>
          <Target className="absolute -right-6 -bottom-6 opacity-5 w-24 h-24" />
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Ø Note', value: averageGrade, icon: <Award size={22} className="text-white" />, color: 'bg-emerald-500' },
          { label: 'Bestanden', value: passedExams.length.toString(), icon: <CheckCircle size={22} className="text-white" />, color: 'bg-[var(--color-mv-primary)]' },
          { label: 'Streak', value: '4 Tage', icon: <Zap size={22} className="text-white" />, color: 'bg-amber-500' },
          { label: 'Global', value: '#42', icon: <Trophy size={22} className="text-white" />, color: 'bg-[var(--color-mv-text)]' },
        ].map((kpi) => (
          <div key={kpi.label} className="mv-card p-5 flex items-center justify-between">
            <div>
              <div className="text-xs text-[var(--color-mv-text-tertiary)] mb-1">{kpi.label}</div>
              <div className="text-xl font-semibold text-[var(--color-mv-text)]">{kpi.value}</div>
            </div>
            <div className={`w-11 h-11 rounded-xl ${kpi.color} flex items-center justify-center`}>
              {kpi.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Wall of Fame */}
        <div className="lg:col-span-2 mv-card overflow-hidden">
          <div className="p-5 flex justify-between items-center">
            <h3 className="text-base font-semibold text-[var(--color-mv-text)] flex items-center gap-2">
              <Medal size={18} className="text-[var(--color-mv-primary)]" />
              Wall of Fame
            </h3>
          </div>
          <div className="px-2 pb-2">
            {completedTestsWithGrades.length > 0 ? completedTestsWithGrades.map((exam, idx) => (
              <div key={idx} className="flex items-center justify-between px-4 py-3.5 rounded-xl hover:bg-[var(--color-mv-hover)] transition-colors">
                <div className="flex items-center gap-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center text-sm font-semibold ${
                    exam.grade >= 5 ? 'bg-amber-50 text-amber-600' : 'bg-[var(--color-mv-surface-secondary)] text-[var(--color-mv-text-tertiary)]'
                  }`}>
                    {exam.grade}
                  </div>
                  <div>
                    <div className="text-sm font-medium text-[var(--color-mv-text)]">{exam.title}</div>
                    <div className="text-xs text-[var(--color-mv-text-tertiary)] mt-0.5">{exam.subject} · {new Date(exam.date).toLocaleDateString()}</div>
                  </div>
                </div>
                {exam.grade >= 5.5 && <Trophy size={18} className="text-amber-400" />}
              </div>
            )) : (
              <div className="p-12 text-center text-[var(--color-mv-text-tertiary)] text-xs">Noch keine Einträge.</div>
            )}
          </div>
        </div>

        {/* Badges */}
        <div className="mv-card p-5 h-fit">
          <h3 className="text-base font-semibold text-[var(--color-mv-text)] flex items-center gap-2 mb-5">
            <Award size={18} className="text-[var(--color-mv-primary)]" />
            Badges
          </h3>
          <div className="grid grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
            {badges.map(badge => (
              <div key={badge.id} title={badge.name} className={`aspect-square rounded-xl flex flex-col items-center justify-center p-2 text-center transition-all hover:scale-105 cursor-default ${
                badge.unlocked ? badge.color.split(' ')[0] + ' ' + badge.color.split(' ')[1] : 'bg-[var(--color-mv-surface-secondary)] grayscale opacity-30'
              }`}>
                {badge.icon}
              </div>
            ))}
          </div>
          <button className="w-full mt-6 text-xs font-medium text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-primary)] border-t border-[var(--color-mv-active)] pt-4 transition-colors">
            Alle anzeigen
          </button>
        </div>
      </div>
    </div>
  );
};

export default Erfolge;
