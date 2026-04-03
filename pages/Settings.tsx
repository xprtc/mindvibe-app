import React, { useState } from 'react';
import { Settings as SettingsIcon, User, Bell, Shield, CreditCard, LogOut, Moon, Sun, Check, Crown, Sparkles, ArrowRight, ChevronRight } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useSession } from '../context/SessionContext';
import { useSubscription, PLANS, PLAN_FEATURES, type PlanTier } from '../context/SubscriptionContext';
import PlanSelection from './PlanSelection';

type SettingsTab = 'profile' | 'notifications' | 'security' | 'plan';

const Settings: React.FC = () => {
  const { resolved, toggle } = useTheme();
  const { user, logout } = useSession();
  const { plan, planInfo, setPlan } = useSubscription();
  const isDark = resolved === 'dark';
  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [showPlanChange, setShowPlanChange] = useState(false);

  const tabs: { id: SettingsTab; label: string; icon: React.FC<any> }[] = [
    { id: 'profile', label: 'Mein Profil', icon: User },
    { id: 'notifications', label: 'Benachrichtigungen', icon: Bell },
    { id: 'security', label: 'Sicherheit', icon: Shield },
    { id: 'plan', label: 'Abo & Plan', icon: CreditCard },
  ];

  if (showPlanChange) {
    return (
      <div className="max-w-5xl mx-auto p-4 md:p-5 animate-fade-in pb-24">
        <button
          onClick={() => setShowPlanChange(false)}
          className="mb-6 text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)] flex items-center gap-2"
        >
          ← Zurück zu Einstellungen
        </button>
        <PlanSelection
          onSelect={(tier) => { setPlan(tier); setShowPlanChange(false); }}
          currentPlan={plan}
          mode="upgrade"
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto p-4 md:p-5 animate-fade-in pb-24">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold text-[var(--color-mv-text)] flex items-center gap-4">
          <SettingsIcon className="text-[var(--color-mv-primary)]" size={24} strokeWidth={3} />
          Einstellungen
        </h2>
        <p className="text-[var(--color-mv-text-tertiary)] mt-2 text-sm font-medium">Verwalte dein Profil und deine App-Präferenzen.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Sidebar Menu */}
        <div className="space-y-3">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-4 p-4 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-[var(--color-mv-text)] text-white shadow-sm'
                    : 'hover:bg-white text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)] border border-transparent hover:border-[var(--color-mv-border-light)]'
                }`}
              >
                <Icon size={18} strokeWidth={2.5} />
                {tab.label}
                {tab.id === 'plan' && planInfo && (
                  <span className={`ml-auto text-xs px-2 py-0.5 rounded-full font-medium ${
                    plan === 'premium' ? 'bg-purple-100 text-purple-700' :
                    plan === 'smart' ? 'bg-green-100 text-green-700' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {planInfo.name}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Content Area */}
        <div className="md:col-span-2 space-y-8">

          {/* ═══════ Profile Tab ═══════ */}
          {activeTab === 'profile' && (
            <>
              <div className="mv-card p-5 border border-[var(--color-mv-border-light)]">
                <h3 className="font-semibold text-[var(--color-mv-text)] mb-8 text-xs">Profilbild & Daten</h3>
                <div className="flex items-center gap-5 mb-10">
                  <div className="w-24 h-24 rounded-xl bg-gradient-to-br from-blue-50 to-blue-100 text-[var(--color-mv-primary)] flex items-center justify-center font-semibold text-3xl border-4 border-white shadow-sm">
                    {user?.name?.charAt(0)?.toUpperCase() || 'U'}
                  </div>
                  <div>
                    <button className="px-6 py-3 bg-white border border-[var(--color-mv-border)] rounded-xl text-xs font-medium text-[var(--color-mv-text-tertiary)] hover:border-[var(--color-mv-primary)] hover:text-[var(--color-mv-primary)] transition-all">
                      Bild ändern
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-mv-text-tertiary)] mb-2">Name</label>
                    <input type="text" value={user?.name || ''} className="w-full p-4 bg-[var(--color-mv-bg)] border border-transparent rounded-xl text-sm font-medium text-[var(--color-mv-text)] focus:border-[var(--color-mv-primary)] focus:bg-white outline-none transition-all" readOnly />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-mv-text-tertiary)] mb-2">E-Mail</label>
                    <input type="email" value={user?.email || ''} className="w-full p-4 bg-[var(--color-mv-bg)] border border-transparent rounded-xl text-sm font-medium text-[var(--color-mv-text)] focus:border-[var(--color-mv-primary)] focus:bg-white outline-none transition-all" readOnly />
                  </div>
                </div>
              </div>

              {/* Appearance */}
              <button
                onClick={toggle}
                className="w-full mv-card p-5 border border-[var(--color-mv-border-light)] flex items-center justify-between group cursor-pointer hover:border-[var(--color-mv-primary)] transition-all text-left"
              >
                <div className="flex items-center gap-5">
                  <div className="p-4 bg-[var(--color-mv-bg)] rounded-xl text-[var(--color-mv-text-tertiary)] group-hover:text-[var(--color-mv-primary)] transition-all">
                    {isDark ? <Sun size={24} strokeWidth={2.5} /> : <Moon size={24} strokeWidth={2.5} />}
                  </div>
                  <div>
                    <h4 className="font-semibold text-[var(--color-mv-text)] text-sm">Dark Mode</h4>
                    <p className="text-xs font-medium text-[var(--color-mv-text-tertiary)] mt-1">{isDark ? 'Aktiv — klicke zum Deaktivieren' : 'Erscheinungsbild der App anpassen'}</p>
                  </div>
                </div>
                <div className={`w-12 h-7 rounded-full relative transition-colors ${isDark ? 'bg-[var(--color-mv-primary)]' : 'bg-[var(--color-mv-border)]'}`}>
                  <div className={`absolute top-1 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${isDark ? 'left-6' : 'left-1'}`} />
                </div>
              </button>
            </>
          )}

          {/* ═══════ Notifications Tab ═══════ */}
          {activeTab === 'notifications' && (
            <div className="mv-card p-5 border border-[var(--color-mv-border-light)] space-y-6">
              <h3 className="font-semibold text-[var(--color-mv-text)] text-sm">Benachrichtigungen</h3>
              {[
                { label: 'Prüfungs-Erinnerungen', desc: '2 Tage vor jeder Prüfung', enabled: true },
                { label: 'Tagesziele', desc: 'Tägliche Erinnerung an deine Lernziele', enabled: true },
                { label: 'Neue Badges', desc: 'Wenn du ein neues Badge freigeschaltet hast', enabled: false },
                { label: 'Lerngruppen-Updates', desc: 'Nachrichten aus deinen Lerngruppen', enabled: true },
              ].map((n, i) => (
                <div key={i} className="flex items-center justify-between py-3 border-b border-[var(--color-mv-active)] last:border-none">
                  <div>
                    <p className="text-sm font-medium text-[var(--color-mv-text)]">{n.label}</p>
                    <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-0.5">{n.desc}</p>
                  </div>
                  <div className={`w-11 h-6 rounded-full relative cursor-pointer transition-colors ${n.enabled ? 'bg-[var(--color-mv-primary)]' : 'bg-[var(--color-mv-active)]'}`}>
                    <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all ${n.enabled ? 'left-5.5' : 'left-0.5'}`} style={{ left: n.enabled ? '22px' : '2px' }} />
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══════ Security Tab ═══════ */}
          {activeTab === 'security' && (
            <div className="space-y-6">
              <div className="mv-card p-5 border border-[var(--color-mv-border-light)] space-y-6">
                <h3 className="font-semibold text-[var(--color-mv-text)] text-sm">Passwort ändern</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-mv-text-tertiary)] mb-2">Aktuelles Passwort</label>
                    <input type="password" className="mv-input" placeholder="••••••••" />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-mv-text-tertiary)] mb-2">Neues Passwort</label>
                    <input type="password" className="mv-input" placeholder="Mind. 6 Zeichen" />
                  </div>
                  <button className="mv-btn-primary text-sm">Passwort aktualisieren</button>
                </div>
              </div>
              <div className="mv-card p-5 border border-red-100 space-y-4">
                <h3 className="font-semibold text-red-600 text-sm">Gefahrenzone</h3>
                <p className="text-xs text-[var(--color-mv-text-tertiary)]">Lösche dein Konto und alle damit verknüpften Daten unwiderruflich.</p>
                <button className="px-4 py-2.5 rounded-xl text-sm font-medium border border-red-200 text-red-600 hover:bg-red-50 transition-all">
                  Konto löschen
                </button>
              </div>
            </div>
          )}

          {/* ═══════ Plan Tab ═══════ */}
          {activeTab === 'plan' && (
            <div className="space-y-6">
              {/* Current plan */}
              <div className={`mv-card p-5 border-2 ${
                plan === 'premium' ? 'border-purple-200' :
                plan === 'smart' ? 'border-[var(--color-mv-primary)]/30' :
                'border-[var(--color-mv-active)]'
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    {plan === 'premium' ? <Crown size={22} className="text-purple-600" /> :
                     plan === 'smart' ? <Sparkles size={22} className="text-[var(--color-mv-primary)]" /> :
                     <CreditCard size={22} className="text-gray-400" />}
                    <div>
                      <h3 className="text-lg font-bold text-[var(--color-mv-text)]">
                        {planInfo?.name || 'Kein Plan'} Plan
                      </h3>
                      <p className="text-xs text-[var(--color-mv-text-tertiary)]">
                        {planInfo ? `CHF ${planInfo.price.toFixed(2)}/Monat` : 'Wähle einen Plan'}
                      </p>
                    </div>
                  </div>
                  <span className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                    plan === 'premium' ? 'bg-purple-100 text-purple-700' :
                    plan === 'smart' ? 'bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)]' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    Aktiv
                  </span>
                </div>

                {/* Plan features summary */}
                {planInfo && (
                  <div className="mt-6 grid grid-cols-2 gap-3">
                    {PLAN_FEATURES.filter(f => {
                      const val = f[plan as 'basic' | 'smart' | 'premium'];
                      return val === true || typeof val === 'string';
                    }).slice(0, 6).map((f, i) => {
                      const val = f[plan as 'basic' | 'smart' | 'premium'];
                      return (
                        <div key={i} className="flex items-center gap-2 text-sm text-[var(--color-mv-text-secondary)]">
                          <Check size={14} className={plan === 'premium' ? 'text-purple-600' : 'text-[var(--color-mv-primary)]'} />
                          <span className="truncate">{typeof val === 'string' ? `${f.name}: ${val}` : f.name}</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                <div className="mt-8 flex gap-3">
                  <button
                    onClick={() => setShowPlanChange(true)}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                      plan === 'premium'
                        ? 'bg-purple-100 text-purple-700 hover:bg-purple-200'
                        : 'mv-btn-primary'
                    }`}
                  >
                    {plan === 'premium' ? 'Plan wechseln' : 'Upgraden'} <ArrowRight size={14} />
                  </button>
                  {plan !== 'none' && (
                    <button className="px-5 py-2.5 rounded-xl text-sm font-medium text-[var(--color-mv-text-tertiary)] hover:text-red-600 hover:bg-red-50 transition-all">
                      Abo kündigen
                    </button>
                  )}
                </div>
              </div>

              {/* Billing info */}
              <div className="mv-card p-5 border border-[var(--color-mv-border-light)]">
                <h3 className="font-semibold text-[var(--color-mv-text)] text-sm mb-6">Zahlungsinformationen</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3 border-b border-[var(--color-mv-active)]">
                    <span className="text-sm text-[var(--color-mv-text-secondary)]">Zahlungsmethode</span>
                    <span className="text-sm font-medium text-[var(--color-mv-text)]">Noch nicht hinterlegt</span>
                  </div>
                  <div className="flex items-center justify-between py-3 border-b border-[var(--color-mv-active)]">
                    <span className="text-sm text-[var(--color-mv-text-secondary)]">Nächste Zahlung</span>
                    <span className="text-sm font-medium text-[var(--color-mv-text)]">—</span>
                  </div>
                  <div className="flex items-center justify-between py-3">
                    <span className="text-sm text-[var(--color-mv-text-secondary)]">Rechnungsverlauf</span>
                    <button className="text-sm text-[var(--color-mv-primary)] font-medium hover:underline flex items-center gap-1">
                      Anzeigen <ChevronRight size={14} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Danger Zone — always visible at bottom */}
          <div className="pt-8 border-t border-[var(--color-mv-border-light)] flex justify-between items-center">
            <button onClick={logout} className="flex items-center gap-3 text-red-500 text-xs font-medium hover:bg-red-50 px-6 py-3 rounded-xl transition-all">
              <LogOut size={18} strokeWidth={2.5} /> Abmelden
            </button>
            <p className="text-xs font-medium text-[var(--color-mv-text-tertiary)]">Version 2.5.0</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
