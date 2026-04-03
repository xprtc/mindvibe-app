import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, GraduationCap, BookOpen, MessageSquare, Settings, TrendingUp, Trophy, Brain, Home } from 'lucide-react';

interface SearchModalProps {
  open: boolean;
  onClose: () => void;
  onNavigate: (page: string) => void;
}

interface SearchResult {
  id: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  page: string;
}

const allPages: SearchResult[] = [
  { id: 'home', label: 'Dashboard', description: 'Übersicht & Tagesziele', icon: <Home size={16} />, page: 'home' },
  { id: 'chat', label: 'Einstein Chat', description: 'KI-Lernassistent', icon: <MessageSquare size={16} />, page: 'chat' },
  { id: 'pruefungen', label: 'Prüfungen', description: 'Termine & Vorbereitung', icon: <GraduationCap size={16} />, page: 'pruefungen' },
  { id: 'create', label: 'Prüfung erstellen', description: 'Neuen Lernplan anlegen', icon: <GraduationCap size={16} />, page: 'create' },
  { id: 'review', label: 'Prüfungs-Review', description: 'Fehler analysieren', icon: <BookOpen size={16} />, page: 'review' },
  { id: 'bibliothek', label: 'Bibliothek', description: 'Deine Unterlagen', icon: <BookOpen size={16} />, page: 'bibliothek' },
  { id: 'wissen', label: 'Wissen', description: 'Wissensdatenbank', icon: <Brain size={16} />, page: 'wissen' },
  { id: 'fortschritt', label: 'Fortschritt', description: 'Notenentwicklung', icon: <TrendingUp size={16} />, page: 'fortschritt' },
  { id: 'erfolge', label: 'Erfolge & Level', description: 'Badges & XP', icon: <Trophy size={16} />, page: 'erfolge' },
  { id: 'settings', label: 'Einstellungen', description: 'Profil & Präferenzen', icon: <Settings size={16} />, page: 'settings' },
];

const SearchModal: React.FC<SearchModalProps> = ({ open, onClose, onNavigate }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const results = query.trim()
    ? allPages.filter(
        (p) =>
          p.label.toLowerCase().includes(query.toLowerCase()) ||
          p.description.toLowerCase().includes(query.toLowerCase())
      )
    : allPages;

  useEffect(() => {
    if (open) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  const go = useCallback(
    (page: string) => {
      onNavigate(page);
      onClose();
    },
    [onNavigate, onClose]
  );

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      go(results[selectedIndex].page);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!open) return null;

  return (
    <div className="mv-search-overlay animate-fade-in" onClick={onClose}>
      <div
        className="mv-search-modal animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[var(--color-mv-border)]">
          <Search size={18} className="text-[var(--color-mv-text-tertiary)] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Seite suchen..."
            className="flex-1 bg-transparent text-sm text-[var(--color-mv-text)] placeholder:text-[var(--color-mv-text-tertiary)] outline-none"
          />
          <kbd className="hidden sm:inline-flex text-[10px] text-[var(--color-mv-text-tertiary)] bg-[var(--color-mv-bg)] border border-[var(--color-mv-border)] px-1.5 py-0.5 rounded">
            ESC
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[320px] overflow-y-auto p-2">
          {results.length === 0 ? (
            <div className="p-6 text-center text-sm text-[var(--color-mv-text-tertiary)]">
              Keine Ergebnisse
            </div>
          ) : (
            results.map((r, i) => (
              <button
                key={r.id}
                onClick={() => go(r.page)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-colors ${
                  i === selectedIndex
                    ? 'bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)]'
                    : 'text-[var(--color-mv-text)] hover:bg-[var(--color-mv-hover)]'
                }`}
              >
                <div className={`shrink-0 ${i === selectedIndex ? 'text-[var(--color-mv-primary)]' : 'text-[var(--color-mv-text-tertiary)]'}`}>
                  {r.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{r.label}</p>
                  <p className="text-xs text-[var(--color-mv-text-tertiary)] truncate">{r.description}</p>
                </div>
              </button>
            ))
          )}
        </div>

        {/* Footer hint */}
        <div className="px-4 py-2 border-t border-[var(--color-mv-border)] flex gap-4 text-[10px] text-[var(--color-mv-text-tertiary)]">
          <span>↑↓ navigieren</span>
          <span>↵ öffnen</span>
          <span>esc schliessen</span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
