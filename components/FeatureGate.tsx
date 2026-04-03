import React from 'react';
import { Lock, Sparkles, ArrowRight } from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';

interface FeatureGateProps {
  feature: string;
  requiredPlan?: 'smart' | 'premium';
  children: React.ReactNode;
  fallbackMessage?: string;
}

/**
 * Wraps content that requires a specific plan.
 * If the user doesn't have the required plan, shows an upgrade prompt.
 */
const FeatureGate: React.FC<FeatureGateProps> = ({ feature, requiredPlan, children, fallbackMessage }) => {
  const { canUseFeature, promptUpgrade, plan } = useSubscription();

  if (canUseFeature(feature)) {
    return <>{children}</>;
  }

  const planLabel = requiredPlan === 'premium' ? 'Premium' : 'Smart';
  const message = fallbackMessage || `Diese Funktion ist ab dem ${planLabel}-Plan verfügbar.`;

  return (
    <div className="relative">
      {/* Blurred content preview */}
      <div className="opacity-30 blur-[2px] pointer-events-none select-none" aria-hidden="true">
        {children}
      </div>

      {/* Upgrade overlay */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="bg-[var(--color-mv-surface)] rounded-2xl shadow-xl p-6 max-w-sm mx-4 text-center space-y-4 border border-[var(--color-mv-active)]">
          <div className="w-12 h-12 rounded-xl bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)] flex items-center justify-center mx-auto">
            <Lock size={22} />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-[var(--color-mv-text)]">{planLabel}-Feature</h4>
            <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-1">{message}</p>
          </div>
          <button
            onClick={() => promptUpgrade(message)}
            className="mv-btn-primary text-sm flex items-center justify-center gap-2 mx-auto"
          >
            <Sparkles size={14} /> Auf {planLabel} upgraden <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeatureGate;

/**
 * Inline badge showing that a feature requires an upgrade.
 * Used in navigation, buttons, etc.
 */
export const PlanBadge: React.FC<{ requiredPlan: 'smart' | 'premium'; className?: string }> = ({ requiredPlan, className = '' }) => {
  const { plan } = useSubscription();

  const needsUpgrade =
    (requiredPlan === 'smart' && plan === 'basic') ||
    (requiredPlan === 'premium' && (plan === 'basic' || plan === 'smart'));

  if (!needsUpgrade) return null;

  return (
    <span className={`inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${
      requiredPlan === 'premium' ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'
    } ${className}`}>
      <Sparkles size={10} /> {requiredPlan === 'premium' ? 'PRO' : 'SMART'}
    </span>
  );
};
