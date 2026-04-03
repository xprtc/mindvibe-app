import React, { createContext, useContext, useState, useCallback, useMemo, useEffect } from 'react';
import { useSession } from './SessionContext';

export type PlanTier = 'none' | 'basic' | 'smart' | 'premium';

export interface PlanInfo {
  id: PlanTier;
  name: string;
  price: number; // CHF per month
  badge: string;
  color: string;
}

export const PLANS: Record<Exclude<PlanTier, 'none'>, PlanInfo> = {
  basic: { id: 'basic', name: 'Basic', price: 4.90, badge: 'Basic', color: '#6B7280' },
  smart: { id: 'smart', name: 'Smart', price: 7.90, badge: 'Beliebteste Wahl', color: '#10A37F' },
  premium: { id: 'premium', name: 'Premium', price: 9.90, badge: 'Premium', color: '#8B5CF6' },
};

export interface PlanFeature {
  name: string;
  basic: boolean | string;
  smart: boolean | string;
  premium: boolean | string;
  category: 'core' | 'ai' | 'social' | 'extra';
}

export const PLAN_FEATURES: PlanFeature[] = [
  // Core
  { name: 'KI-Lernassistent (Einstein)', basic: '10 Fragen/Tag', smart: 'Unbegrenzt', premium: 'Unbegrenzt', category: 'core' },
  { name: 'Prüfungen verwalten', basic: '3 aktive', smart: 'Unbegrenzt', premium: 'Unbegrenzt', category: 'core' },
  { name: 'Flashcards & Quiz', basic: true, smart: true, premium: true, category: 'core' },
  { name: 'Notentracker', basic: true, smart: true, premium: true, category: 'core' },
  { name: 'Tagesziele & XP', basic: true, smart: true, premium: true, category: 'core' },
  // AI
  { name: 'Audio-Zusammenfassungen', basic: false, smart: true, premium: true, category: 'ai' },
  { name: 'Video-Übersichten', basic: false, smart: true, premium: true, category: 'ai' },
  { name: 'Mindmaps & Infografiken', basic: false, smart: true, premium: true, category: 'ai' },
  { name: 'Lösungswege & Übungen', basic: false, smart: true, premium: true, category: 'ai' },
  { name: 'Präsentationen generieren', basic: false, smart: true, premium: true, category: 'ai' },
  { name: 'Materialien hochladen', basic: false, smart: true, premium: true, category: 'ai' },
  // Social
  { name: 'Lerngruppen', basic: false, smart: 'Bis 5 Mitglieder', premium: 'Unbegrenzt', category: 'social' },
  { name: 'Leaderboard', basic: true, smart: true, premium: true, category: 'social' },
  { name: 'Erfolge & Badges', basic: 'Basis-Badges', smart: 'Alle Badges', premium: 'Alle Badges + Exklusiv', category: 'social' },
  // Extra
  { name: 'Eltern-Dashboard (Notenübersicht)', basic: false, smart: true, premium: true, category: 'extra' },
  { name: 'Familien-Account (bis 3 Kinder)', basic: false, smart: false, premium: true, category: 'extra' },
  { name: 'Prioritäts-Support', basic: false, smart: false, premium: true, category: 'extra' },
  { name: 'Früher Zugang zu neuen Features', basic: false, smart: false, premium: true, category: 'extra' },
];

// Feature limits per plan
export const PLAN_LIMITS = {
  basic: { questionsPerDay: 10, maxActiveExams: 3, studyGroupSize: 0, contentTypes: ['flashcards', 'quiz'] },
  smart: { questionsPerDay: Infinity, maxActiveExams: Infinity, studyGroupSize: 5, contentTypes: ['flashcards', 'quiz', 'audio', 'video', 'mindmap', 'solutions', 'infographic', 'presentation'] },
  premium: { questionsPerDay: Infinity, maxActiveExams: Infinity, studyGroupSize: Infinity, contentTypes: ['flashcards', 'quiz', 'audio', 'video', 'mindmap', 'solutions', 'infographic', 'presentation'] },
};

interface SubscriptionContextValue {
  plan: PlanTier;
  planInfo: PlanInfo | null;
  setPlan: (tier: PlanTier) => void;
  canUseFeature: (feature: string) => boolean;
  showUpgradeModal: boolean;
  setShowUpgradeModal: (v: boolean) => void;
  upgradeReason: string;
  promptUpgrade: (reason: string) => void;
}

const SubscriptionContext = createContext<SubscriptionContextValue | null>(null);

export const SubscriptionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useSession();
  const [plan, setPlanState] = useState<PlanTier>('none');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [upgradeReason, setUpgradeReason] = useState('');

  // Load plan from localStorage on mount
  useEffect(() => {
    if (user?.uid) {
      const saved = localStorage.getItem(`mv_plan_${user.uid}`);
      if (saved && (saved === 'basic' || saved === 'smart' || saved === 'premium')) {
        setPlanState(saved as PlanTier);
      }
    }
  }, [user?.uid]);

  const setPlan = useCallback((tier: PlanTier) => {
    setPlanState(tier);
    if (user?.uid && tier !== 'none') {
      localStorage.setItem(`mv_plan_${user.uid}`, tier);
    }
  }, [user?.uid]);

  const planInfo = plan !== 'none' ? PLANS[plan] : null;

  const canUseFeature = useCallback((feature: string): boolean => {
    if (plan === 'none') return false;
    const limits = PLAN_LIMITS[plan];
    if (feature === 'audio' || feature === 'video' || feature === 'mindmap' || feature === 'solutions' || feature === 'infographic' || feature === 'presentation') {
      return limits.contentTypes.includes(feature);
    }
    if (feature === 'lerngruppen') return limits.studyGroupSize > 0;
    if (feature === 'family') return plan === 'premium';
    if (feature === 'priority-support') return plan === 'premium';
    if (feature === 'eltern-dashboard') return plan === 'smart' || plan === 'premium';
    return true;
  }, [plan]);

  const promptUpgrade = useCallback((reason: string) => {
    setUpgradeReason(reason);
    setShowUpgradeModal(true);
  }, []);

  const value = useMemo(() => ({
    plan, planInfo, setPlan, canUseFeature, showUpgradeModal, setShowUpgradeModal, upgradeReason, promptUpgrade,
  }), [plan, planInfo, setPlan, canUseFeature, showUpgradeModal, upgradeReason, promptUpgrade]);

  return (
    <SubscriptionContext.Provider value={value}>{children}</SubscriptionContext.Provider>
  );
};

export function useSubscription() {
  const ctx = useContext(SubscriptionContext);
  if (!ctx) throw new Error('useSubscription must be used within SubscriptionProvider');
  return ctx;
}
