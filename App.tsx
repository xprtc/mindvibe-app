import React from 'react';
import { useSession } from './context/SessionContext';
import { useSubscription } from './context/SubscriptionContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import PlanSelection from './pages/PlanSelection';
import AppShell from './components/AppShell';
import UpgradeModal from './components/UpgradeModal';
import type { PlanTier } from './context/SubscriptionContext';

const App: React.FC = () => {
  const { user, loading, view, setView, logout } = useSession();
  const { plan, setPlan } = useSubscription();

  // Show loading spinner while Firebase auth initializes (max 3s)
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-stone-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-mv-primary)] flex items-center justify-center text-white font-semibold text-lg">
            M
          </div>
          <div className="w-5 h-5 border-2 border-stone-200 border-t-[var(--color-mv-primary)] rounded-full animate-spin" />
          <p className="text-xs text-stone-400 mt-2">Verbindung wird hergestellt...</p>
        </div>
      </div>
    );
  }

  // Logged in
  if (user) {
    if (!user.onboardingDone) {
      return <OnboardingPage />;
    }

    // Show plan selection if user has no plan yet
    if (plan === 'none') {
      return (
        <PlanSelection
          onSelect={(tier: PlanTier) => setPlan(tier)}
          mode="onboarding"
        />
      );
    }

    return (
      <>
        <AppShell
          userName={user.name}
          userEmail={user.email}
          onLogout={logout}
        />
        <UpgradeModal />
      </>
    );
  }

  // Login page
  if (view === 'login') {
    return <LoginPage onBack={() => setView('landing')} />;
  }

  // Landing page
  return (
    <LandingPage
      onTryDemo={() => setView('login')}
      onLogin={() => setView('login')}
      onSelectPlan={(tier: PlanTier) => setView('login')}
    />
  );
};

export default App;
