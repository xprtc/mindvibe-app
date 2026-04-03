import React, { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
}

/**
 * Fängt Render-Fehler ab (z. B. Recharts + React 19), damit nicht nur ein weißer Screen bleibt.
 */
export class AppErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false };

  static getDerivedStateFromError(): State {
    return { hasError: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.error('[MindVibe] UI error:', error.message, info.componentStack);
  }

  render(): ReactNode {
    const { children } = (this as unknown as { props: Readonly<Props> }).props;
    if (this.state.hasError) {
      return (
        <div className="min-h-[100dvh] flex flex-col items-center justify-center gap-4 p-8 bg-[var(--color-mv-bg)] text-[var(--color-mv-text)]">
          <p className="text-center font-semibold max-w-md">
            Die Ansicht konnte nicht geladen werden. Bitte lade die Seite neu.
          </p>
          <button
            type="button"
            className="mv-btn-primary px-6"
            onClick={() => window.location.reload()}
          >
            Neu laden
          </button>
        </div>
      );
    }
    return children;
  }
}

interface SubtreeProps {
  children: ReactNode;
  fallback: ReactNode;
}

/** Nur für Teilbäume (z. B. Diagramm), ohne die ganze App zu ersetzen */
export class SubtreeErrorBoundary extends Component<SubtreeProps, { err: boolean }> {
  state = { err: false };

  static getDerivedStateFromError(): { err: boolean } {
    return { err: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    console.warn('[MindVibe] Subtree error:', error.message, info.componentStack);
  }

  render(): ReactNode {
    const { fallback, children } = (this as unknown as { props: Readonly<SubtreeProps> }).props;
    return this.state.err ? fallback : children;
  }
}
