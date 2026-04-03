import React, { useState, useEffect, useRef } from 'react';
import {
  ArrowRight, Sparkles, BookOpen, TrendingUp, Brain, Check, Star,
  MessageSquare, Zap, Shield, ChevronDown, ChevronUp, Users,
  GraduationCap, Trophy, Clock, Headphones, BarChart3, Gift,
  Crown, Heart, Play,
} from 'lucide-react';
import { PLANS, PLAN_FEATURES, type PlanTier } from '../context/SubscriptionContext';

interface LandingPageProps {
  onTryDemo: () => void;
  onLogin: () => void;
  onSelectPlan?: (plan: PlanTier) => void;
}

/* ───────── Animated counter ───────── */
function AnimatedNumber({ target, suffix = '' }: { target: number; suffix?: string }) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          let start = 0;
          const step = Math.max(1, Math.floor(target / 40));
          const interval = setInterval(() => {
            start += step;
            if (start >= target) { setCount(target); clearInterval(interval); }
            else setCount(start);
          }, 30);
          observer.disconnect();
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [target]);
  return <span ref={ref}>{count.toLocaleString('de-CH')}{suffix}</span>;
}

/* ───────── FAQ Accordion ───────── */
const faqData = [
  { q: 'Kann ich MindVibe kostenlos testen?', a: 'Ja! Du kannst dich registrieren und bekommst 7 Tage kostenlosen Zugang zum Smart-Abo. Keine Kreditkarte nötig.' },
  { q: 'Für welche Schulstufen ist MindVibe geeignet?', a: 'MindVibe ist für Schülerinnen und Schüler der 1. bis 9. Klasse in der Schweiz konzipiert. Die KI passt sich automatisch dem Niveau an.' },
  { q: 'Wie funktioniert der KI-Lernassistent?', a: 'Einstein, unser KI-Assistent, erklärt dir Themen in deinen eigenen Worten, erstellt Übungen und hilft dir bei Hausaufgaben. Er ist wie ein persönlicher Nachhilfelehrer — immer verfügbar.' },
  { q: 'Können Eltern den Lernfortschritt sehen?', a: 'Ja! Ab dem Smart-Abo haben Eltern Zugang zu einem Dashboard mit Notenübersicht, Lernstatistiken und Fortschrittsberichten.' },
  { q: 'Kann ich jederzeit kündigen?', a: 'Absolut. Alle Abos sind monatlich kündbar, ohne Mindestlaufzeit. Du kannst jederzeit in den Einstellungen kündigen.' },
  { q: 'Ist mein Kind sicher auf MindVibe?', a: 'Sicherheit hat für uns höchste Priorität. Die App enthält keine Werbung, keine In-App-Käufe und alle Daten werden in der Schweiz gehostet. Die KI ist speziell für Kinder optimiert.' },
];

function FAQItem({ q, a }: { q: string; a: string }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--color-mv-active)]">
      <button onClick={() => setOpen(!open)} className="w-full flex items-center justify-between py-5 text-left group">
        <span className="text-sm font-medium text-[var(--color-mv-text)] group-hover:text-[var(--color-mv-primary)] transition-colors pr-4">{q}</span>
        {open ? <ChevronUp size={18} className="text-[var(--color-mv-primary)] shrink-0" /> : <ChevronDown size={18} className="text-[var(--color-mv-text-tertiary)] shrink-0" />}
      </button>
      {open && (
        <div className="pb-5 text-sm text-[var(--color-mv-text-secondary)] leading-relaxed animate-fade-in">
          {a}
        </div>
      )}
    </div>
  );
}

/* ───────── Testimonials ───────── */
const testimonials = [
  { name: 'Lena M.', role: '7. Klasse, Zürich', text: 'Seit ich MindVibe nutze, habe ich mich in Mathe um eine ganze Note verbessert! Einstein erklärt alles so, dass ich es verstehe.', rating: 5 },
  { name: 'Marco T.', role: 'Vater von 2 Kindern', text: 'Endlich kann ich den Lernfortschritt meiner Kinder verfolgen, ohne ständig nachfragen zu müssen. Das Eltern-Dashboard ist Gold wert.', rating: 5 },
  { name: 'Sophie K.', role: '5. Klasse, Bern', text: 'Die Flashcards sind mega! Ich lerne jetzt viel schneller Vokabeln und die Quizze machen richtig Spass.', rating: 5 },
  { name: 'Anna R.', role: 'Mutter, Luzern', text: 'Mein Sohn hatte null Motivation zum Lernen. Mit MindVibe hat er jetzt einen Streak von 30 Tagen und ist stolz auf seine Fortschritte.', rating: 5 },
];

/* ───────── Main Component ───────── */
const LandingPage: React.FC<LandingPageProps> = ({ onTryDemo, onLogin, onSelectPlan }) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const yearlyDiscount = 0.20; // 20% off

  const getPrice = (base: number) => {
    if (billingCycle === 'yearly') return (base * (1 - yearlyDiscount)).toFixed(2);
    return base.toFixed(2);
  };

  const handleSelectPlan = (tier: PlanTier) => {
    if (onSelectPlan) onSelectPlan(tier);
    else onLogin();
  };

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-mv-bg)]">
      {/* ═══════════ HEADER ═══════════ */}
      <header className="sticky top-0 z-50 bg-[var(--color-mv-bg)]/80 backdrop-blur-xl">
        <div className="flex items-center justify-between px-6 py-3.5 max-w-6xl mx-auto w-full">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-mv-primary)] flex items-center justify-center text-white font-bold text-base shadow-sm">
              M
            </div>
            <span className="text-lg font-bold text-[var(--color-mv-text)]">MindVibe</span>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#features" className="text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)] transition-colors">Features</a>
            <a href="#pricing" className="text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)] transition-colors">Preise</a>
            <a href="#faq" className="text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)] transition-colors">FAQ</a>
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={onLogin} className="mv-btn-ghost text-sm">Anmelden</button>
            <button onClick={onLogin} className="mv-btn-primary text-sm hidden sm:flex items-center gap-1.5">
              Jetzt starten <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </header>

      {/* ═══════════ A — ATTENTION: Hero ═══════════ */}
      <section className="relative overflow-hidden">
        {/* Decorative gradient */}
        <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-mv-primary)]/5 via-transparent to-transparent pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-[var(--color-mv-primary)]/8 rounded-full blur-[120px] pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-16 pb-20 md:pt-24 md:pb-28">
          <div className="max-w-3xl mx-auto text-center space-y-6">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)] text-xs font-semibold shadow-sm">
              <Sparkles size={14} /> 7 Tage kostenlos testen
            </div>

            {/* Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold tracking-tight text-[var(--color-mv-text)] leading-[1.1]">
              Bessere Noten.<br />
              <span className="text-[var(--color-mv-primary)]">Weniger Stress.</span>
            </h1>

            {/* Subheadline */}
            <p className="text-lg md:text-xl text-[var(--color-mv-text-secondary)] leading-relaxed max-w-xl mx-auto">
              MindVibe ist der intelligente Lernbegleiter für Schweizer Schüler. KI-gestützt, von Eltern geliebt, von Kindern gefeiert.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
              <button onClick={onLogin} className="mv-btn-primary px-8 py-4 text-base flex items-center justify-center gap-2 shadow-lg shadow-[var(--color-mv-primary)]/20">
                Kostenlos starten <ArrowRight size={18} />
              </button>
              <button onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })} className="mv-btn-secondary px-8 py-4 text-base flex items-center justify-center gap-2">
                <Play size={18} /> So funktioniert's
              </button>
            </div>

            <p className="text-xs text-[var(--color-mv-text-tertiary)] flex items-center justify-center gap-4 pt-2">
              <span className="flex items-center gap-1"><Check size={12} className="text-[var(--color-mv-primary)]" /> Keine Kreditkarte</span>
              <span className="flex items-center gap-1"><Check size={12} className="text-[var(--color-mv-primary)]" /> 7 Tage gratis</span>
              <span className="flex items-center gap-1"><Check size={12} className="text-[var(--color-mv-primary)]" /> Jederzeit kündbar</span>
            </p>
          </div>

          {/* Explainer Video */}
          <div className="mt-16 max-w-4xl mx-auto">
            <ExplainerVideo />
          </div>
        </div>
      </section>

      {/* ═══════════ Social Proof Numbers ═══════════ */}
      <section className="py-12 bg-[var(--color-mv-surface)]">
        <div className="max-w-5xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: 2500, suffix: '+', label: 'Aktive Schüler' },
            { value: 15000, suffix: '+', label: 'Lerneinheiten erstellt' },
            { value: 94, suffix: '%', label: 'Notenverbesserung' },
            { value: 4.9, suffix: '/5', label: 'Bewertung' },
          ].map(s => (
            <div key={s.label}>
              <p className="text-3xl md:text-4xl font-bold text-[var(--color-mv-text)]">
                <AnimatedNumber target={typeof s.value === 'number' ? s.value : 0} suffix={s.suffix} />
              </p>
              <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ═══════════ I — INTEREST: Features ═══════════ */}
      <section id="features" className="py-20 md:py-28">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-blue-50 text-blue-600 text-xs font-semibold mb-4">
              <Zap size={14} /> Alles was dein Kind braucht
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-mv-text)] tracking-tight">
              Lernen, das Spass macht
            </h2>
            <p className="text-[var(--color-mv-text-secondary)] mt-3 max-w-lg mx-auto">
              Von der KI-Nachhilfe bis zum Notentracker — MindVibe begleitet dein Kind durch den ganzen Schulalltag.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Brain, color: 'bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)]', title: 'KI-Lernassistent «Einstein»', desc: 'Erklärt Themen kindgerecht, erstellt Übungen und hilft bei Hausaufgaben. Wie ein Nachhilfelehrer — aber immer verfügbar.' },
              { icon: GraduationCap, color: 'bg-blue-50 text-blue-600', title: 'Prüfungsvorbereitung', desc: 'Automatisch generierte Lernpläne, Flashcards, Quizze und Zusammenfassungen für jede Prüfung.' },
              { icon: BarChart3, color: 'bg-purple-50 text-purple-600', title: 'Notentracker & Statistiken', desc: 'Notenentwicklung auf einen Blick. Eltern sehen den Fortschritt im Eltern-Dashboard.' },
              { icon: Headphones, color: 'bg-amber-50 text-amber-600', title: 'Audio & Video Lernhilfen', desc: 'Zusammenfassungen als Podcast oder Video — perfekt für unterwegs oder zum Wiederholen.' },
              { icon: Trophy, color: 'bg-orange-50 text-orange-600', title: 'Gamification & Motivation', desc: 'XP sammeln, Level aufsteigen, Badges freischalten. Lernen wird zum Abenteuer.' },
              { icon: Users, color: 'bg-green-50 text-green-600', title: 'Lerngruppen', desc: 'Zusammen lernen macht mehr Spass. Erstelle Gruppen mit Freunden und lernt gemeinsam.' },
            ].map(f => (
              <div key={f.title} className="mv-card-hover p-6 space-y-4 group">
                <div className={`w-12 h-12 rounded-xl ${f.color} flex items-center justify-center transition-transform group-hover:scale-110`}>
                  <f.icon size={22} />
                </div>
                <h3 className="text-base font-semibold text-[var(--color-mv-text)]">{f.title}</h3>
                <p className="text-sm text-[var(--color-mv-text-secondary)] leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ D — DESIRE: How it works ═══════════ */}
      <section className="py-20 bg-[var(--color-mv-surface)]">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-mv-text)] tracking-tight">
              In 3 Schritten zum Lernerfolg
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { step: '1', title: 'Registrieren', desc: 'Erstelle ein kostenloses Konto in 30 Sekunden. Keine Kreditkarte nötig.', icon: Sparkles },
              { step: '2', title: 'Prüfung eintragen', desc: 'Sag Einstein, welche Prüfung ansteht. Er erstellt automatisch deinen Lernplan.', icon: BookOpen },
              { step: '3', title: 'Besser werden', desc: 'Lerne mit KI-generierten Inhalten und tracke deine Noten-Verbesserung.', icon: TrendingUp },
            ].map(s => (
              <div key={s.step} className="text-center space-y-4">
                <div className="w-16 h-16 rounded-2xl bg-[var(--color-mv-primary)] text-white flex items-center justify-center mx-auto shadow-lg shadow-[var(--color-mv-primary)]/20">
                  <s.icon size={28} />
                </div>
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)] text-sm font-bold">
                  {s.step}
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-mv-text)]">{s.title}</h3>
                <p className="text-sm text-[var(--color-mv-text-secondary)] leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ Testimonials ═══════════ */}
      <section className="py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-xs font-semibold mb-4">
              <Heart size={14} /> Von Familien geliebt
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-mv-text)] tracking-tight">
              Das sagen unsere Nutzer
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {testimonials.map((t, i) => (
              <div key={i} className="mv-card p-6 space-y-4">
                <div className="flex gap-0.5">
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={16} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-sm text-[var(--color-mv-text-secondary)] leading-relaxed italic">«{t.text}»</p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)] flex items-center justify-center text-sm font-semibold">
                    {t.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-[var(--color-mv-text)]">{t.name}</p>
                    <p className="text-xs text-[var(--color-mv-text-tertiary)]">{t.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ A — ACTION: Pricing ═══════════ */}
      <section id="pricing" className="py-20 bg-[var(--color-mv-surface)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)] text-xs font-semibold mb-4">
              <Gift size={14} /> 7 Tage kostenlos testen
            </div>
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-mv-text)] tracking-tight">
              Wähle deinen Plan
            </h2>
            <p className="text-[var(--color-mv-text-secondary)] mt-3 max-w-md mx-auto">
              Starte kostenlos und upgrade, wenn du bereit bist. Alle Pläne monatlich kündbar.
            </p>

            {/* Billing toggle */}
            <div className="flex items-center justify-center gap-3 mt-8">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${billingCycle === 'monthly' ? 'bg-[var(--color-mv-text)] text-white shadow-sm' : 'text-[var(--color-mv-text-secondary)] hover:bg-[var(--color-mv-hover)]'}`}
              >
                Monatlich
              </button>
              <button
                onClick={() => setBillingCycle('yearly')}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-2 ${billingCycle === 'yearly' ? 'bg-[var(--color-mv-text)] text-white shadow-sm' : 'text-[var(--color-mv-text-secondary)] hover:bg-[var(--color-mv-hover)]'}`}
              >
                Jährlich <span className="text-xs bg-[var(--color-mv-primary)] text-white px-2 py-0.5 rounded-full">-20%</span>
              </button>
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto items-start">

            {/* BASIC */}
            <div className="mv-card p-6 md:p-8 space-y-6 relative">
              <div>
                <h3 className="text-lg font-bold text-[var(--color-mv-text)]">Basic</h3>
                <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1">Für den Einstieg</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[var(--color-mv-text)]">CHF {getPrice(4.90)}</span>
                <span className="text-sm text-[var(--color-mv-text-tertiary)]">/Monat</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-xs text-[var(--color-mv-primary)] font-medium -mt-4">
                  CHF {(4.90 * (1 - yearlyDiscount) * 12).toFixed(2)}/Jahr (statt CHF {(4.90 * 12).toFixed(2)})
                </p>
              )}
              <button
                onClick={() => handleSelectPlan('basic')}
                className="w-full py-3 rounded-xl text-sm font-medium border-2 border-[var(--color-mv-active)] text-[var(--color-mv-text)] hover:border-[var(--color-mv-primary)] hover:text-[var(--color-mv-primary)] transition-all"
              >
                Basic wählen
              </button>
              <ul className="space-y-3">
                {[
                  'KI-Assistent (10 Fragen/Tag)',
                  '3 aktive Prüfungen',
                  'Flashcards & Quiz',
                  'Notentracker',
                  'Tagesziele & XP',
                  'Basis-Badges',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--color-mv-text-secondary)]">
                    <Check size={16} className="text-[var(--color-mv-primary)] shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* SMART — highlighted */}
            <div className="mv-card p-6 md:p-8 space-y-6 relative ring-2 ring-[var(--color-mv-primary)] shadow-xl shadow-[var(--color-mv-primary)]/10 scale-[1.02]">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1.5 rounded-full bg-[var(--color-mv-primary)] text-white text-xs font-semibold shadow-lg">
                Beliebteste Wahl
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-mv-text)]">Smart</h3>
                <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1">Für ambitionierte Schüler</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[var(--color-mv-text)]">CHF {getPrice(7.90)}</span>
                <span className="text-sm text-[var(--color-mv-text-tertiary)]">/Monat</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-xs text-[var(--color-mv-primary)] font-medium -mt-4">
                  CHF {(7.90 * (1 - yearlyDiscount) * 12).toFixed(2)}/Jahr (statt CHF {(7.90 * 12).toFixed(2)})
                </p>
              )}
              <button
                onClick={() => handleSelectPlan('smart')}
                className="w-full mv-btn-primary py-3 text-sm shadow-lg shadow-[var(--color-mv-primary)]/20"
              >
                Smart wählen — 7 Tage gratis
              </button>
              <ul className="space-y-3">
                <li className="text-xs font-semibold text-[var(--color-mv-primary)] uppercase tracking-wide pb-1">Alles aus Basic, plus:</li>
                {[
                  'KI-Assistent unbegrenzt',
                  'Unbegrenzte Prüfungen',
                  'Audio-Zusammenfassungen',
                  'Video-Übersichten',
                  'Mindmaps & Infografiken',
                  'Lösungswege & Übungen',
                  'Präsentationen generieren',
                  'Materialien hochladen',
                  'Lerngruppen (bis 5)',
                  'Alle Badges',
                  'Eltern-Dashboard',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--color-mv-text-secondary)]">
                    <Check size={16} className="text-[var(--color-mv-primary)] shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </div>

            {/* PREMIUM */}
            <div className="mv-card p-6 md:p-8 space-y-6 relative">
              <div className="absolute -top-3 right-4 px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-xs font-semibold flex items-center gap-1">
                <Crown size={12} /> Familie
              </div>
              <div>
                <h3 className="text-lg font-bold text-[var(--color-mv-text)]">Premium</h3>
                <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1">Für die ganze Familie</p>
              </div>
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold text-[var(--color-mv-text)]">CHF {getPrice(9.90)}</span>
                <span className="text-sm text-[var(--color-mv-text-tertiary)]">/Monat</span>
              </div>
              {billingCycle === 'yearly' && (
                <p className="text-xs text-[var(--color-mv-primary)] font-medium -mt-4">
                  CHF {(9.90 * (1 - yearlyDiscount) * 12).toFixed(2)}/Jahr (statt CHF {(9.90 * 12).toFixed(2)})
                </p>
              )}
              <button
                onClick={() => handleSelectPlan('premium')}
                className="w-full py-3 rounded-xl text-sm font-medium border-2 border-purple-200 text-purple-700 hover:bg-purple-50 transition-all"
              >
                Premium wählen
              </button>
              <ul className="space-y-3">
                <li className="text-xs font-semibold text-purple-600 uppercase tracking-wide pb-1">Alles aus Smart, plus:</li>
                {[
                  'Lerngruppen unbegrenzt',
                  'Familien-Account (3 Kinder)',
                  'Prioritäts-Support',
                  'Exklusive Badges',
                  'Früher Zugang zu Features',
                ].map(f => (
                  <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--color-mv-text-secondary)]">
                    <Check size={16} className="text-purple-600 shrink-0 mt-0.5" /> {f}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Feature Comparison Table */}
          <div className="mt-16 max-w-5xl mx-auto">
            <details className="group">
              <summary className="flex items-center justify-center gap-2 cursor-pointer text-sm font-medium text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)] transition-colors py-4">
                Alle Features im Detail vergleichen
                <ChevronDown size={16} className="group-open:rotate-180 transition-transform" />
              </summary>
              <div className="mt-4 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[var(--color-mv-active)]">
                      <th className="text-left py-3 pr-4 text-[var(--color-mv-text-tertiary)] font-medium">Feature</th>
                      <th className="text-center py-3 px-4 text-[var(--color-mv-text)] font-semibold w-28">Basic</th>
                      <th className="text-center py-3 px-4 text-[var(--color-mv-primary)] font-semibold w-28">Smart</th>
                      <th className="text-center py-3 px-4 text-purple-600 font-semibold w-28">Premium</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PLAN_FEATURES.map((f, i) => (
                      <tr key={i} className="border-b border-[var(--color-mv-active)]/50">
                        <td className="py-3 pr-4 text-[var(--color-mv-text-secondary)]">{f.name}</td>
                        {(['basic', 'smart', 'premium'] as const).map(tier => {
                          const val = f[tier];
                          return (
                            <td key={tier} className="text-center py-3 px-4">
                              {val === true ? (
                                <Check size={16} className="mx-auto text-[var(--color-mv-primary)]" />
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
            </details>
          </div>
        </div>
      </section>

      {/* ═══════════ Trust & Safety ═══════════ */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
            {[
              { icon: Shield, title: 'Sicher & werbefrei', desc: 'Keine Werbung, keine In-App-Käufe. Daten in der Schweiz gehostet.' },
              { icon: Clock, title: 'Jederzeit kündbar', desc: 'Keine Mindestlaufzeit. Du kannst dein Abo monatlich kündigen.' },
              { icon: Heart, title: 'Für Kinder gemacht', desc: 'Die KI ist speziell für Kinder optimiert — altersgerecht und sicher.' },
            ].map(t => (
              <div key={t.title} className="space-y-3">
                <div className="w-12 h-12 rounded-xl bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)] flex items-center justify-center mx-auto">
                  <t.icon size={22} />
                </div>
                <h4 className="text-sm font-semibold text-[var(--color-mv-text)]">{t.title}</h4>
                <p className="text-sm text-[var(--color-mv-text-secondary)]">{t.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════════ FAQ ═══════════ */}
      <section id="faq" className="py-20 bg-[var(--color-mv-surface)]">
        <div className="max-w-2xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-mv-text)] tracking-tight">
              Häufige Fragen
            </h2>
          </div>
          <div>
            {faqData.map((faq, i) => <FAQItem key={i} q={faq.q} a={faq.a} />)}
          </div>
        </div>
      </section>

      {/* ═══════════ Final CTA ═══════════ */}
      <section className="py-20">
        <div className="max-w-3xl mx-auto px-6 text-center space-y-6">
          <h2 className="text-3xl md:text-4xl font-bold text-[var(--color-mv-text)] tracking-tight">
            Bereit für bessere Noten?
          </h2>
          <p className="text-lg text-[var(--color-mv-text-secondary)]">
            Starte jetzt kostenlos und erlebe, wie MindVibe das Lernen deines Kindes verändert.
          </p>
          <button onClick={onLogin} className="mv-btn-primary px-10 py-4 text-base flex items-center justify-center gap-2 mx-auto shadow-lg shadow-[var(--color-mv-primary)]/20">
            7 Tage kostenlos testen <ArrowRight size={18} />
          </button>
          <p className="text-xs text-[var(--color-mv-text-tertiary)]">
            Keine Kreditkarte nötig · Jederzeit kündbar · Made in Switzerland 🇨🇭
          </p>
        </div>
      </section>

      {/* ═══════════ Footer ═══════════ */}
      <footer className="py-12 bg-[var(--color-mv-surface)] border-t border-[var(--color-mv-active)]">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[var(--color-mv-primary)] flex items-center justify-center text-white font-bold text-sm">M</div>
                <span className="text-base font-bold text-[var(--color-mv-text)]">MindVibe</span>
              </div>
              <p className="text-xs text-[var(--color-mv-text-tertiary)] leading-relaxed">
                Der intelligente Lernbegleiter für Schweizer Schüler.
              </p>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--color-mv-text)] uppercase tracking-wide mb-3">Produkt</h4>
              <div className="space-y-2">
                <a href="#features" className="block text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)]">Features</a>
                <a href="#pricing" className="block text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)]">Preise</a>
                <a href="#faq" className="block text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)]">FAQ</a>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--color-mv-text)] uppercase tracking-wide mb-3">Rechtliches</h4>
              <div className="space-y-2">
                <button onClick={() => {}} className="block text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)]">Datenschutz</button>
                <button onClick={() => {}} className="block text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)]">Impressum</button>
                <button onClick={() => {}} className="block text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)]">AGB</button>
              </div>
            </div>
            <div>
              <h4 className="text-xs font-semibold text-[var(--color-mv-text)] uppercase tracking-wide mb-3">Kontakt</h4>
              <div className="space-y-2">
                <p className="text-sm text-[var(--color-mv-text-secondary)]">support@mindvibe.ch</p>
                <p className="text-sm text-[var(--color-mv-text-secondary)]">Rastoder IT Consulting</p>
                <p className="text-sm text-[var(--color-mv-text-secondary)]">Schweiz 🇨🇭</p>
              </div>
            </div>
          </div>
          <div className="pt-8 border-t border-[var(--color-mv-active)] text-center text-xs text-[var(--color-mv-text-tertiary)]">
            © 2026 MindVibe by Rastoder IT Consulting. Alle Rechte vorbehalten.
          </div>
        </div>
      </footer>
    </div>
  );
};

/* ───────── Explainer Video with Voiceover ───────── */

const VIDEO_SCENES = [
  { time: 0, bg: 'linear-gradient(135deg, #064e3b, #10A37F, #34d399)', text: 'Dein Kind kommt nach Hause', bold: '— und freut sich aufs Lernen.', emoji: '😊📚' },
  { time: 6.5, bg: 'linear-gradient(135deg, #1e293b, #334155, #475569)', text: 'Kein Stress. Kein Frust.', bold: 'Kein Kampf um Hausaufgaben.', emoji: '✨' },
  { time: 13, bg: 'linear-gradient(135deg, #312e81, #6366f1, #818cf8)', text: 'MindVibe — dein persönlicher', bold: 'KI-Lerncoach Einstein.', emoji: '🧑‍🔬📐🌐📖' },
  { time: 19, bg: 'linear-gradient(135deg, #7c2d12, #ea580c, #fb923c)', text: 'Quizze, Lernpläne & Übungen', bold: '— automatisch erstellt.', emoji: '✅📝' },
  { time: 26, bg: 'linear-gradient(135deg, #134e4a, #0d9488, #5eead4)', text: 'Jede Note erfasst.', bold: 'Jeder Fortschritt sichtbar.', emoji: '📊🏆' },
  { time: 32, bg: 'linear-gradient(135deg, #064e3b, #10A37F, #6ee7b7)', text: 'Bessere Noten — ohne Stress.', bold: 'mindvibe.me', emoji: '🚀' },
];

function ExplainerVideo() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  const [sceneIdx, setSceneIdx] = useState(0);
  const [progress, setProgress] = useState(0);
  const frameRef = useRef<number>(0);

  const updateScene = () => {
    const audio = audioRef.current;
    if (!audio || audio.paused) return;

    const t = audio.currentTime;
    const pct = (t / audio.duration) * 100;
    setProgress(pct);

    // Find active scene
    let idx = 0;
    for (let i = VIDEO_SCENES.length - 1; i >= 0; i--) {
      if (t >= VIDEO_SCENES[i].time) { idx = i; break; }
    }
    setSceneIdx(idx);

    if (t < audio.duration) {
      frameRef.current = requestAnimationFrame(updateScene);
    } else {
      setPlaying(false);
      setSceneIdx(0);
      setProgress(0);
    }
  };

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      audio.pause();
      cancelAnimationFrame(frameRef.current);
      setPlaying(false);
    } else {
      audio.currentTime = 0;
      audio.play();
      setPlaying(true);
      frameRef.current = requestAnimationFrame(updateScene);
    }
  };

  useEffect(() => {
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  const scene = VIDEO_SCENES[sceneIdx];

  return (
    <div className="relative rounded-2xl overflow-hidden shadow-2xl shadow-black/20" style={{ aspectRatio: '16/9' }}>
      <audio ref={audioRef} src="/voiceover.mp3" preload="auto" />

      {/* Scene background */}
      <div
        className="absolute inset-0 transition-all duration-700 ease-in-out"
        style={{ background: scene.bg }}
      />

      {/* Scene content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center px-[8%] text-center transition-opacity duration-500"
        key={sceneIdx}>
        {/* Emoji row */}
        <div className="text-3xl sm:text-4xl md:text-5xl mb-4 md:mb-6 animate-fade-in" style={{ animationDuration: '0.5s' }}>
          {scene.emoji.split('').filter(c => c.trim()).map((e, i) => (
            <span key={i} className="inline-block mx-1" style={{ animation: `fadeInUp 0.4s ${i * 0.1}s ease-out both` }}>{e}</span>
          ))}
        </div>

        {/* Text */}
        <p className="text-lg sm:text-2xl md:text-4xl font-normal text-white/80 leading-snug animate-fade-in" style={{ animationDuration: '0.4s', animationDelay: '0.1s', animationFillMode: 'both' }}>
          {scene.text}
        </p>
        <p className="text-xl sm:text-3xl md:text-5xl font-black text-white leading-tight mt-2 md:mt-3 animate-fade-in" style={{ animationDuration: '0.4s', animationDelay: '0.25s', animationFillMode: 'both' }}>
          {scene.bold}
        </p>
      </div>

      {/* Play/Pause overlay */}
      {!playing && (
        <div
          className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center cursor-pointer z-10 transition-opacity"
          onClick={togglePlay}
        >
          <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-[var(--color-mv-primary)] flex items-center justify-center shadow-lg shadow-[var(--color-mv-primary)]/40 hover:scale-110 transition-transform">
            <Play size={32} className="text-white ml-1" fill="white" />
          </div>
          <p className="text-white/60 text-xs md:text-sm mt-4 font-medium">Video abspielen</p>
        </div>
      )}

      {/* Click to pause while playing */}
      {playing && (
        <div className="absolute inset-0 cursor-pointer z-10" onClick={togglePlay} />
      )}

      {/* Progress bar */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/10 z-20">
        <div
          className="h-full bg-white/60 transition-[width] duration-100"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Inline keyframes */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(16px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}

export default LandingPage;
