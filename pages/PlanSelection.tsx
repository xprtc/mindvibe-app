import React, { useState } from 'react';
import { Check, Crown, ArrowRight, Gift, Sparkles, ChevronDown } from 'lucide-react';
import { PLANS, PLAN_FEATURES, type PlanTier } from '../context/SubscriptionContext';

interface PlanSelectionProps {
  onSelect: (tier: PlanTier) => void;
  currentPlan?: PlanTier;
  mode?: 'onboarding' | 'upgrade';
}

const PlanSelection: React.FC<PlanSelectionProps> = ({ onSelect, currentPlan = 'none', mode = 'onboarding' }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCompare, setShowCompare] = useState(false);
  const yearlyDiscount = 0.20;

  const getPrice = (base: number) => {
    if (billingCycle === 'yearly') return (base * (1 - yearlyDiscount)).toFixed(2);
    return base.toFixed(2);
  };

  return (
    <div className="min-h-screen bg-[var(--color-mv-bg)] flex flex-col items-center px-4 py-8 md:py-12">
      {/* Header */}
      <div className="text-center mb-8 space-y-3">
        <div className="w-12 h-12 rounded-xl bg-[var(--color-mv-primary)] flex items-center justify-center text-white font-bold text-xl mx-auto shadow-sm">
          M
        </div>
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--color-mv-text)] tracking-tight">
          {mode === 'onboarding' ? 'Wähle deinen Plan' : 'Plan ändern'}
        </h1>
        <p className="text-sm text-[var(--color-mv-text-tertiary)] max-w-md mx-auto">
          {mode === 'onboarding'
            ? 'Starte mit 7 Tagen kostenlosem Smart-Zugang. Wähle danach den Plan, der zu dir passt.'
            : 'Upgrade oder wechsle deinen aktuellen Plan.'}
        </p>
      </div>

      {/* Billing toggle */}
      <div className="flex items-center gap-2 mb-8 bg-[var(--color-mv-surface)] rounded-xl p-1 shadow-sm">
        <button
          onClick={() => setBillingCycle('monthly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-[var(--color-mv-text)] text-white shadow-sm' : 'text-[var(--color-mv-text-secondary)]'}`}
        >
          Monatlich
        </button>
        <button
          onClick={() => setBillingCycle('yearly')}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-[var(--color-mv-text)] text-white shadow-sm' : 'text-[var(--color-mv-text-secondary)]'}`}
        >
          Jährlich <span className="text-xs bg-[var(--color-mv-primary)] text-white px-2 py-0.5 rounded-full">-20%</span>
        </button>
      </div>

      {/* Plan Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-4xl w-full items-start">

        {/* BASIC */}
        <div className={`mv-card p-6 space-y-5 transition-all ${currentPlan === 'basic' ? 'ring-2 ring-gray-400' : ''}`}>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-mv-text)]">Basic</h3>
            <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-1">Für den Einstieg</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[var(--color-mv-text)]">CHF {getPrice(4.90)}</span>
            <span className="text-sm text-[var(--color-mv-text-tertiary)]">/Mt.</span>
          </div>
          {billingCycle === 'yearly' && (
            <p className="text-xs text-[var(--color-mv-primary)] font-medium -mt-3">
              Spare CHF {(4.90 * yearlyDiscount * 12).toFixed(2)}/Jahr
            </p>
          )}
          <button
            onClick={() => onSelect('basic')}
            disabled={currentPlan === 'basic'}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
              currentPlan === 'basic'
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'border-2 border-[var(--color-mv-active)] text-[var(--color-mv-text)] hover:border-[var(--color-mv-primary)] hover:text-[var(--color-mv-primary)]'
            }`}
          >
            {currentPlan === 'basic' ? 'Aktueller Plan' : 'Basic wählen'}
          </button>
          <ul className="space-y-2.5">
            {[
              'KI-Assistent (10 Fragen/Tag)',
              '3 aktive Prüfungen',
              'Flashcards & Quiz',
              'Notentracker',
              'Tagesziele & XP',
            ].map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-mv-text-secondary)]">
                <Check size={15} className="text-gray-400 shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* SMART */}
        <div className={`mv-card p-6 space-y-5 relative ring-2 ring-[var(--color-mv-primary)] shadow-xl shadow-[var(--color-mv-primary)]/10 scale-[1.02] ${currentPlan === 'smart' ? '' : ''}`}>
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[var(--color-mv-primary)] text-white text-xs font-semibold shadow-lg flex items-center gap-1">
            <Sparkles size={12} /> Empfohlen
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-mv-text)]">Smart</h3>
            <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-1">Für ambitionierte Schüler</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[var(--color-mv-text)]">CHF {getPrice(7.90)}</span>
            <span className="text-sm text-[var(--color-mv-text-tertiary)]">/Mt.</span>
          </div>
          {billingCycle === 'yearly' && (
            <p className="text-xs text-[var(--color-mv-primary)] font-medium -mt-3">
              Spare CHF {(7.90 * yearlyDiscount * 12).toFixed(2)}/Jahr
            </p>
          )}
          <button
            onClick={() => onSelect('smart')}
            disabled={currentPlan === 'smart'}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
              currentPlan === 'smart'
                ? 'bg-green-100 text-green-600 cursor-not-allowed'
                : 'mv-btn-primary shadow-lg shadow-[var(--color-mv-primary)]/20'
            }`}
          >
            {currentPlan === 'smart' ? 'Aktueller Plan' : mode === 'onboarding' ? '7 Tage gratis testen' : 'Smart wählen'}
          </button>
          <ul className="space-y-2.5">
            <li className="text-xs font-semibold text-[var(--color-mv-primary)] uppercase tracking-wide">Alles aus Basic, plus:</li>
            {[
              'KI-Assistent unbegrenzt',
              'Unbegrenzte Prüfungen',
              'Audio & Video Zusammenfassungen',
              'Mindmaps & Infografiken',
              'Lösungswege & Übungen',
              'Materialien hochladen',
              'Lerngruppen (bis 5)',
              'Eltern-Dashboard',
            ].map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-mv-text-secondary)]">
                <Check size={15} className="text-[var(--color-mv-primary)] shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
        </div>

        {/* PREMIUM */}
        <div className={`mv-card p-6 space-y-5 relative ${currentPlan === 'premium' ? 'ring-2 ring-purple-400' : ''}`}>
          <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold flex items-center gap-1">
            <Crown size={12} /> Familie
          </div>
          <div>
            <h3 className="text-lg font-bold text-[var(--color-mv-text)]">Premium</h3>
            <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-1">Für die ganze Familie</p>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-[var(--color-mv-text)]">CHF {getPrice(9.90)}</span>
            <span className="text-sm text-[var(--color-mv-text-tertiary)]">/Mt.</span>
          </div>
          {billingCycle === 'yearly' && (
            <p className="text-xs text-purple-600 font-medium -mt-3">
              Spare CHF {(9.90 * yearlyDiscount * 12).toFixed(2)}/Jahr
            </p>
          )}
          <button
            onClick={() => onSelect('premium')}
            disabled={currentPlan === 'premium'}
            className={`w-full py-3 rounded-xl text-sm font-medium transition-all ${
              currentPlan === 'premium'
                ? 'bg-purple-100 text-purple-400 cursor-not-allowed'
                : 'border-2 border-purple-200 text-purple-700 hover:bg-purple-50'
            }`}
          >
            {currentPlan === 'premium' ? 'Aktueller Plan' : 'Premium wählen'}
          </button>
          <ul className="space-y-2.5">
            <li className="text-xs font-semibold text-purple-600 uppercase tracking-wide">Alles aus Smart, plus:</li>
            {[
              'Lerngruppen unbegrenzt',
              'Familien-Account (3 Kinder)',
              'Prioritäts-Support',
              'Exklusive Badges',
              'Früher Zugang zu Features',
            ].map(f => (
              <li key={f} className="flex items-start gap-2 text-sm text-[var(--color-mv-text-secondary)]">
                <Check size={15} className="text-purple-600 shrink-0 mt-0.5" /> {f}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Compare toggle */}
      <button
        onClick={() => setShowCompare(!showCompare)}
        className="mt-8 flex items-center gap-2 text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)] transition-colors"
      >
        Alle Features vergleichen <ChevronDown size={16} className={`transition-transform ${showCompare ? 'rotate-180' : ''}`} />
      </button>

      {showCompare && (
        <div className="mt-4 max-w-4xl w-full overflow-x-auto animate-fade-in">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[var(--color-mv-active)]">
                <th className="text-left py-3 pr-4 text-[var(--color-mv-text-tertiary)] font-medium">Feature</th>
                <th className="text-center py-3 px-3 text-[var(--color-mv-text)] font-semibold w-24">Basic</th>
                <th className="text-center py-3 px-3 text-[var(--color-mv-primary)] font-semibold w-24">Smart</th>
                <th className="text-center py-3 px-3 text-purple-600 font-semibold w-24">Premium</th>
              </tr>
            </thead>
            <tbody>
              {PLAN_FEATURES.map((f, i) => (
                <tr key={i} className="border-b border-[var(--color-mv-active)]/50">
                  <td className="py-2.5 pr-4 text-[var(--color-mv-text-secondary)]">{f.name}</td>
                  {(['basic', 'smart', 'premium'] as const).map(tier => {
                    const val = f[tier];
                    return (
                      <td key={tier} className="text-center py-2.5 px-3">
                        {val === true ? (
                          <Check size={15} className="mx-auto text-[var(--color-mv-primary)]" />
                        ) : val === false ? (
                          <span className="text-[var(--color-mv-text-tertiary)]">—</span>
                        ) : (
                          <span className="text-xs font-medium text-[var(--color-mv-text)]">{val}</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Trust note */}
      <p className="mt-8 text-xs text-[var(--color-mv-text-tertiary)] text-center max-w-sm">
        Jederzeit kündbar · Keine Mindestlaufzeit · Daten in der Schweiz 🇨🇭
      </p>
    </div>
  );
};

export default PlanSelection;
