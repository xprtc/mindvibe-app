import React, { useState } from 'react';
import { useSession } from '../context/SessionContext';

const steps = [
  {
    title: 'Willkommen bei MindVibe',
    body: 'Dein intelligenter Lernbegleiter. Erstelle Lernpläne, übe mit Flashcards und tracke deinen Fortschritt.',
  },
  {
    title: 'Dein Fokus',
    body: 'Worauf willst du dich zuerst konzentrieren? (Optional — du kannst das später jederzeit ändern.)',
  },
  {
    title: 'Alles bereit',
    body: 'Du bist startklar. Dein Dashboard wartet auf dich.',
  },
];

const OnboardingPage: React.FC = () => {
  const { completeOnboarding } = useSession();
  const [step, setStep] = useState(0);
  const [focus, setFocus] = useState('');

  const next = () => {
    if (step < steps.length - 1) setStep((s) => s + 1);
    else completeOnboarding();
  };

  const s = steps[step];

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--color-mv-bg)]">
      <div className="w-full max-w-lg space-y-8">
        <div className="flex gap-2 justify-center">
          {steps.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 max-w-16 rounded-full transition-colors ${
                i <= step ? 'bg-[var(--color-mv-primary)]' : 'bg-[var(--color-mv-border)]'
              }`}
            />
          ))}
        </div>

        <div className="mv-card p-8 space-y-4">
          <h1 className="text-xl font-semibold text-[var(--color-mv-text)]">{s.title}</h1>
          <p className="text-[var(--color-mv-text-secondary)] leading-relaxed">{s.body}</p>

          {step === 1 && (
            <textarea
              value={focus}
              onChange={(e) => setFocus(e.target.value)}
              rows={3}
              className="mv-input mt-2 resize-none"
              placeholder="z.B. Mathe-Prüfung, Deutsch-Grammatik ..."
            />
          )}
        </div>

        <div className="flex justify-end gap-3">
          {step > 0 && (
            <button
              type="button"
              onClick={() => setStep((x) => x - 1)}
              className="mv-btn-ghost"
            >
              Zurück
            </button>
          )}
          <button
            type="button"
            onClick={next}
            className="mv-btn-primary px-6"
          >
            {step === steps.length - 1 ? 'Los geht\'s' : 'Weiter'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPage;
