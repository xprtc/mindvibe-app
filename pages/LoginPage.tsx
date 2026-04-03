import React, { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { useSession } from '../context/SessionContext';

interface LoginPageProps {
  onBack: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onBack }) => {
  const { loginEmail, registerEmail, loginGoogle, authError, clearError } = useSession();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearError();
    setBusy(true);
    try {
      if (mode === 'register') {
        await registerEmail(email.trim(), password, name.trim() || email.split('@')[0]);
      } else {
        await loginEmail(email.trim(), password);
      }
    } catch {
      // Error is handled in context
    } finally {
      setBusy(false);
    }
  };

  const handleGoogle = async () => {
    clearError();
    setBusy(true);
    try {
      await loginGoogle();
    } catch {
      // Error handled in context
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 bg-[var(--color-mv-bg)]">
      <button
        type="button"
        onClick={onBack}
        className="absolute top-6 left-6 flex items-center gap-2 text-sm text-[var(--color-mv-text-secondary)] hover:text-[var(--color-mv-text)]"
      >
        <ArrowLeft className="h-4 w-4" /> Zurück
      </button>

      <div className="w-full max-w-sm space-y-6">
        {/* Logo */}
        <div className="text-center">
          <div className="w-10 h-10 rounded-lg bg-[var(--color-mv-primary)] flex items-center justify-center text-white font-semibold text-lg mx-auto mb-4">
            M
          </div>
          <h1 className="text-xl font-semibold text-[var(--color-mv-text)]">
            {mode === 'login' ? 'Willkommen zurück' : 'Konto erstellen'}
          </h1>
          <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1">
            {mode === 'login' ? 'Melde dich bei MindVibe an.' : 'Erstelle dein MindVibe-Konto.'}
          </p>
        </div>

        {/* Google Login */}
        <button
          type="button"
          onClick={handleGoogle}
          disabled={busy}
          className="w-full flex items-center justify-center gap-3 mv-btn-secondary py-3"
        >
          <svg width="18" height="18" viewBox="0 0 24 24">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Mit Google anmelden
        </button>

        <div className="flex items-center gap-3">
          <div className="flex-1 h-px bg-[var(--color-mv-border)]" />
          <span className="text-xs text-[var(--color-mv-text-tertiary)]">oder</span>
          <div className="flex-1 h-px bg-[var(--color-mv-border)]" />
        </div>

        {/* Email Form */}
        <form onSubmit={submit} className="space-y-4">
          {mode === 'register' && (
            <div>
              <label className="block text-xs font-medium text-[var(--color-mv-text-secondary)] mb-1.5">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="mv-input"
                placeholder="Dein Name"
                autoComplete="name"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-[var(--color-mv-text-secondary)] mb-1.5">E-Mail</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mv-input"
              placeholder="du@beispiel.ch"
              required
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-[var(--color-mv-text-secondary)] mb-1.5">Passwort</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mv-input"
              placeholder={mode === 'register' ? 'Mind. 6 Zeichen' : 'Passwort'}
              required
              minLength={6}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
            />
          </div>

          {authError && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{authError}</p>
          )}

          <button
            type="submit"
            disabled={busy}
            className="w-full mv-btn-primary py-3 disabled:opacity-50"
          >
            {busy ? 'Laden...' : mode === 'login' ? 'Anmelden' : 'Registrieren'}
          </button>
        </form>

        {/* Toggle */}
        <p className="text-center text-sm text-[var(--color-mv-text-tertiary)]">
          {mode === 'login' ? (
            <>
              Noch kein Konto?{' '}
              <button onClick={() => { setMode('register'); clearError(); }} className="text-[var(--color-mv-primary)] font-medium hover:underline">
                Registrieren
              </button>
            </>
          ) : (
            <>
              Schon registriert?{' '}
              <button onClick={() => { setMode('login'); clearError(); }} className="text-[var(--color-mv-primary)] font-medium hover:underline">
                Anmelden
              </button>
            </>
          )}
        </p>
      </div>
    </div>
  );
};

export default LoginPage;
