import React, { useState, useEffect } from 'react';
import { ArrowLeft, Clock, Play, Pause, RotateCcw, Brain, Coffee, CheckCircle2, Trophy, Star, Zap, X } from 'lucide-react';
import { Exam } from '../types';
import StudyContentRenderer from '../components/StudyContentRenderer';

interface LearningSessionProps {
  exam: Exam;
  onBack: () => void;
}

interface Badge {
  id: string;
  name: string;
  icon: React.ReactNode;
  description: string;
  color: string;
  threshold: number;
}

const BADGES: Badge[] = [
  { id: 'starter', name: 'Lern-Starter', icon: <Zap size={20} />, description: 'Erste Session abgeschlossen!', color: 'bg-amber-50 text-amber-600', threshold: 1 },
  { id: 'focus', name: 'Fokus-Meister', icon: <Brain size={20} />, description: '3 Sessions pure Konzentration.', color: 'bg-blue-50 text-blue-600', threshold: 3 },
  { id: 'streak', name: 'Unaufhaltsam', icon: <Star size={20} />, description: '5 Sessions – du bist eine Maschine!', color: 'bg-fuchsia-50 text-fuchsia-600', threshold: 5 }
];

const LearningSession: React.FC<LearningSessionProps> = ({ exam, onBack }) => {
  const FOCUS_TIME = 25 * 60;
  const BREAK_TIME = 5 * 60;

  const [timeLeft, setTimeLeft] = useState(FOCUS_TIME);
  const [isActive, setIsActive] = useState(false);
  const [isBreak, setIsBreak] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [earnedBadges, setEarnedBadges] = useState<Badge[]>([]);
  const [showRewardModal, setShowRewardModal] = useState<Badge | null>(null);
  const [xp, setXp] = useState(0);

  useEffect(() => {
    let interval: number | undefined;
    if (isActive && timeLeft > 0) {
      interval = window.setInterval(() => {
        setTimeLeft((prev) => prev - 1);
        if (timeLeft % 60 === 0 && !isBreak) {
          setXp(prev => prev + 5);
        }
      }, 1000);
    } else if (timeLeft === 0) {
      setIsActive(false);
      if (!isBreak) {
        handleSessionComplete();
        setIsBreak(true);
        setTimeLeft(BREAK_TIME);
      } else {
        setIsBreak(false);
        setTimeLeft(FOCUS_TIME);
      }
    }
    return () => clearInterval(interval);
  }, [isActive, timeLeft, isBreak]);

  const handleSessionComplete = () => {
    const newCount = completedSessions + 1;
    setCompletedSessions(newCount);
    setXp(prev => prev + 100);
    const newBadge = BADGES.find(b => b.threshold === newCount);
    if (newBadge) {
      setEarnedBadges(prev => [...prev, newBadge]);
      setShowRewardModal(newBadge);
    }
  };

  const toggleTimer = () => setIsActive(!isActive);
  const resetTimer = () => { setIsActive(false); setIsBreak(false); setTimeLeft(FOCUS_TIME); };
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const healthTips = [
    "Trink ein Glas Wasser für bessere Konzentration.",
    "Mach kreisende Bewegungen mit deinen Schultern.",
    "Schau für 20 Sekunden in die Ferne (20-20-20 Regel).",
    "Streck dich und atme tief ein.",
    "Steh kurz auf und geh ein paar Schritte."
  ];
  const currentTip = healthTips[Math.floor(Math.random() * healthTips.length)];

  return (
    <div className="flex flex-col h-full animate-fade-in relative bg-[var(--color-mv-bg)]">

      {/* Reward Modal */}
      {showRewardModal && (
        <div className="absolute inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="mv-card p-8 max-w-sm w-full text-center relative">
            <button
              onClick={() => setShowRewardModal(null)}
              className="absolute top-4 right-4 text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)] transition-colors"
            >
              <X size={18} />
            </button>
            <div className="w-20 h-20 mx-auto bg-[var(--color-mv-primary)] rounded-xl flex items-center justify-center text-white mb-6">
              <Trophy size={40} />
            </div>
            <h3 className="text-xl font-bold text-[var(--color-mv-text)] mb-2">Neues Abzeichen!</h3>
            <span className="inline-block px-4 py-1.5 bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)] rounded-xl text-xs font-medium mb-3">
              {showRewardModal.name}
            </span>
            <p className="text-sm text-[var(--color-mv-text-tertiary)] mb-6">{showRewardModal.description}</p>
            <button
              onClick={() => setShowRewardModal(null)}
              className="mv-btn-primary w-full"
            >
              Weiter lernen!
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="bg-[var(--color-mv-surface)] border-b border-[var(--color-mv-active)] px-5 py-4 flex items-center justify-between sticky top-0 z-20">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--color-mv-hover)] text-[var(--color-mv-text-tertiary)] transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <h2 className="text-base font-semibold text-[var(--color-mv-text)]">{exam.title}</h2>
            <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-0.5">{exam.subject} · {isBreak ? 'Pause' : 'Fokuszeit'}</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 text-xs font-medium text-[var(--color-mv-primary)] bg-[var(--color-mv-primary-light)] px-3 py-1.5 rounded-xl">
            <Zap size={14} /> {xp} XP
          </div>

          <div className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
            isBreak ? 'bg-emerald-50 text-emerald-700' :
            isActive ? 'bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)]' :
            'bg-[var(--color-mv-surface-secondary)] text-[var(--color-mv-text-tertiary)]'
          }`}>
            {isBreak ? <Coffee size={16} /> : <Clock size={16} />}
            <span className="font-mono font-bold text-lg">{formatTime(timeLeft)}</span>
            <div className="flex gap-1 ml-2">
              <button onClick={toggleTimer} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors">
                {isActive ? <Pause size={16} /> : <Play size={16} />}
              </button>
              <button onClick={resetTimer} className="p-1.5 hover:bg-black/5 rounded-lg transition-colors">
                <RotateCcw size={16} />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden relative flex flex-col md:flex-row">
        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          {isBreak ? (
            <div className="h-full flex flex-col items-center justify-center p-8 text-center animate-fade-in">
              <div className="w-20 h-20 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 mb-6">
                <Coffee size={40} />
              </div>
              <h3 className="text-xl font-bold text-[var(--color-mv-text)] mb-2">Zeit für eine Pause!</h3>
              <p className="text-sm text-[var(--color-mv-text-tertiary)] max-w-md mb-8">
                Du hast 25 Minuten fokussiert gelernt. Gönn deinem Gehirn eine kurze Auszeit.
              </p>
              <div className="mv-card p-6 max-w-sm w-full">
                <h4 className="text-sm font-medium text-[var(--color-mv-primary)] mb-2 flex items-center justify-center gap-2">
                  <Brain size={16} /> Tipp
                </h4>
                <p className="text-sm text-[var(--color-mv-text-secondary)] italic">"{currentTip}"</p>
              </div>
              <button
                onClick={() => { setIsBreak(false); setTimeLeft(FOCUS_TIME); }}
                className="mt-6 text-xs text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-primary)] transition-colors"
              >
                Pause überspringen
              </button>
            </div>
          ) : (
            <div className="p-6 md:p-8">
              <StudyContentRenderer content={exam.content || "Keine Inhalte verfügbar."} />
            </div>
          )}
        </div>

        {/* Sidebar (Desktop) */}
        <div className="hidden md:block w-72 bg-[var(--color-mv-surface)] border-l border-[var(--color-mv-active)] p-5 overflow-y-auto">
          <h3 className="text-xs font-medium text-[var(--color-mv-text-tertiary)] mb-4">Deine Session</h3>

          <div className="space-y-4">
            <div className="bg-[var(--color-mv-surface-secondary)] p-4 rounded-xl">
              <div className="text-xs text-[var(--color-mv-text-tertiary)] mb-1">Abgeschlossene Pomodoros</div>
              <div className="text-2xl font-bold text-[var(--color-mv-text)]">{completedSessions}</div>
            </div>

            <div className="bg-[var(--color-mv-surface-secondary)] p-4 rounded-xl">
              <div className="text-xs text-[var(--color-mv-text-tertiary)] mb-1">Fokuszeit heute</div>
              <div className="text-2xl font-bold text-[var(--color-mv-text)]">
                {Math.floor(completedSessions * 25)} <span className="text-sm text-[var(--color-mv-text-tertiary)]">Min.</span>
              </div>
            </div>

            {earnedBadges.length > 0 && (
              <div className="mt-6">
                <h4 className="text-xs font-medium text-[var(--color-mv-text-tertiary)] mb-3">Gesammelte Badges</h4>
                <div className="space-y-2">
                  {earnedBadges.map(badge => (
                    <div key={badge.id} className={`flex items-center gap-3 p-3 rounded-xl ${badge.color}`}>
                      <div className="shrink-0">{badge.icon}</div>
                      <div>
                        <div className="text-xs font-medium">{badge.name}</div>
                        <div className="text-[10px] opacity-60 mt-0.5">Gerade eben</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="mt-8 pt-6 border-t border-[var(--color-mv-active)]">
            <h4 className="text-xs font-medium text-[var(--color-mv-text-tertiary)] mb-3">Shortcuts</h4>
            <ul className="space-y-2 text-xs text-[var(--color-mv-text-tertiary)]">
              <li className="flex justify-between items-center">
                <span>Timer Start/Stop</span>
                <kbd className="bg-[var(--color-mv-surface-secondary)] px-2 py-0.5 rounded-md text-[10px]">Space</kbd>
              </li>
              <li className="flex justify-between items-center">
                <span>Karte drehen</span>
                <kbd className="bg-[var(--color-mv-surface-secondary)] px-2 py-0.5 rounded-md text-[10px]">Klick</kbd>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningSession;
