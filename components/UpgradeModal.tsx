import React from 'react';
import { X, Sparkles, Check, Crown, ArrowRight } from 'lucide-react';
import { useSubscription, PLANS, type PlanTier } from '../context/SubscriptionContext';

const UpgradeModal: React.FC = () => {
  const { showUpgradeModal, setShowUpgradeModal, upgradeReason, plan, setPlan } = useSubscription();

  if (!showUpgradeModal) return null;

  const handleUpgrade = (tier: PlanTier) => {
    setPlan(tier);
    setShowUpgradeModal(false);
  };

  const suggestedPlan = plan === 'basic' ? 'smart' : 'premium';

  return (
    <div className="fixed inset-0 z-[200] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setShowUpgradeModal(false)}>
      <div className="bg-[var(--color-mv-surface)] rounded-2xl shadow-2xl max-w-md w-full overflow-hidden animate-scale-in" onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div className="relative bg-gradient-to-br from-[var(--color-mv-primary)] to-[var(--color-mv-primary)]/80 px-6 py-8 text-center">
          <button onClick={() => setShowUpgradeModal(false)} className="absolute top-4 right-4 text-white/70 hover:text-white transition-colors">
            <X size={20} />
          </button>
          <div className="w-14 h-14 rounded-2xl bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Sparkles size={28} className="text-white" />
          </div>
          <h2 className="text-xl font-bold text-white">Upgrade erforderlich</h2>
          {upgradeReason && (
            <p className="text-sm text-white/80 mt-2">{upgradeReason}</p>
          )}
        </div>

        {/* Options */}
        <div className="p-6 space-y-4">
          {plan === 'none' || plan === 'basic' ? (
            <>
              {/* Suggest Smart */}
              <button
                onClick={() => handleUpgrade('smart')}
                className="w-full p-4 rounded-xl border-2 border-[var(--color-mv-primary)] bg-[var(--color-mv-primary-light)] text-left transition-all hover:shadow-md group"
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-[var(--color-mv-text)]">Smart</span>
                    <span className="text-xs bg-[var(--color-mv-primary)] text-white px-2 py-0.5 rounded-full font-medium">Empfohlen</span>
                  </div>
                  <span className="text-base font-bold text-[var(--color-mv-text)]">CHF 7.90/Mt.</span>
                </div>
                <ul className="space-y-1.5 mt-3">
                  {['KI-Assistent unbegrenzt', 'Alle Lerninhalt-Typen', 'Eltern-Dashboard', 'Lerngruppen'].map(f => (
                    <li key={f} className="flex items-center gap-2 text-sm text-[var(--color-mv-text-secondary)]">
                      <Check size={14} className="text-[var(--color-mv-primary)]" /> {f}
                    </li>
                  ))}
                </ul>
                <div className="mt-4 mv-btn-primary w-full py-2.5 text-sm flex items-center justify-center gap-2">
                  Auf Smart upgraden <ArrowRight size={14} />
                </div>
              </button>

              {/* Premium option */}
              <button
                onClick={() => handleUpgrade('premium')}
                className="w-full p-4 rounded-xl border border-[var(--color-mv-active)] text-left transition-all hover:border-purple-300 hover:shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Crown size={16} className="text-purple-600" />
                    <span className="text-sm font-semibold text-[var(--color-mv-text)]">Premium</span>
                    <span className="text-xs text-purple-600 font-medium">Familie</span>
                  </div>
                  <span className="text-sm font-bold text-[var(--color-mv-text)]">CHF 9.90/Mt.</span>
                </div>
                <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-1">Alles aus Smart + Familien-Account, unbegrenzte Lerngruppen</p>
              </button>
            </>
          ) : plan === 'smart' ? (
            <button
              onClick={() => handleUpgrade('premium')}
              className="w-full p-4 rounded-xl border-2 border-purple-300 bg-purple-50 text-left transition-all hover:shadow-md"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Crown size={18} className="text-purple-600" />
                  <span className="text-base font-bold text-[var(--color-mv-text)]">Premium</span>
                </div>
                <span className="text-base font-bold text-[var(--color-mv-text)]">CHF 9.90/Mt.</span>
              </div>
              <p className="text-sm text-[var(--color-mv-text-secondary)] mb-3">Nur CHF 2.00 mehr pro Monat</p>
              <ul className="space-y-1.5">
                {['Familien-Account (3 Kinder)', 'Unbegrenzte Lerngruppen', 'Prioritäts-Support', 'Exklusive Badges'].map(f => (
                  <li key={f} className="flex items-center gap-2 text-sm text-[var(--color-mv-text-secondary)]">
                    <Check size={14} className="text-purple-600" /> {f}
                  </li>
                ))}
              </ul>
              <div className="mt-4 w-full py-2.5 rounded-xl bg-purple-600 text-white text-sm font-medium flex items-center justify-center gap-2">
                Auf Premium upgraden <ArrowRight size={14} />
              </div>
            </button>
          ) : null}

          <button
            onClick={() => setShowUpgradeModal(false)}
            className="w-full text-sm text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)] py-2 transition-colors"
          >
            Vielleicht später
          </button>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
