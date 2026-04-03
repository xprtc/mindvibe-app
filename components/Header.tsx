import React from 'react';
import { Search, Plus, Moon, Sun, Bell, PanelLeftClose, PanelLeft, LogOut } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface HeaderProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  onToggleSidebar?: () => void;
  onOpenSearch?: () => void;
  onLogout?: () => void;
  userName?: string;
  sidebarCollapsed?: boolean;
}

const pageTitles: Record<string, string> = {
  home: 'Dashboard',
  pruefungen: 'Prüfungen',
  review: 'Prüfungs-Review',
  bibliothek: 'Bibliothek',
  wissen: 'Wissen',
  lerngruppen: 'Lerngruppen',
  erfolge: 'Erfolge & Level',
  fortschritt: 'Statistiken',
  settings: 'Einstellungen',
  create: 'Neue Prüfung',
  contact: 'Kontakt',
};

const Header: React.FC<HeaderProps> = ({ currentPage, onNavigate, onToggleSidebar, onOpenSearch, onLogout, sidebarCollapsed }) => {
  const { resolved, toggle } = useTheme();

  return (
    <header className={`fixed top-0 right-0 h-14 z-40 bg-[var(--color-mv-surface)] shadow-none flex items-center justify-between px-4 md:px-5 transition-all ${
      sidebarCollapsed ? 'left-0 md:left-[72px]' : 'left-0 md:left-[260px]'
    }`}>
      <div className="flex items-center gap-2">
        {/* Desktop: sidebar collapse toggle */}
        <button
          onClick={onToggleSidebar}
          className="hidden md:flex p-2 rounded-lg text-[var(--color-mv-text-secondary)] hover:bg-[var(--color-mv-hover)] transition-colors"
        >
          {sidebarCollapsed ? <PanelLeft size={18} /> : <PanelLeftClose size={18} />}
        </button>

        {/* Mobile: show logo */}
        <div className="flex md:hidden items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[var(--color-mv-primary)] flex items-center justify-center text-white font-semibold text-xs">
            M
          </div>
        </div>

        <span className="text-sm font-semibold text-[var(--color-mv-text)]">
          {pageTitles[currentPage] || 'MindVibe'}
        </span>
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={onOpenSearch}
          className="p-2 rounded-lg text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)] hover:text-[var(--color-mv-text)] transition-colors"
        >
          <Search size={18} />
        </button>

        <button className="p-2 rounded-lg text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)] hover:text-[var(--color-mv-text)] transition-colors relative hidden sm:flex">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-[var(--color-mv-primary)] rounded-full" />
        </button>

        <button
          onClick={toggle}
          className="p-2 rounded-lg text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)] hover:text-[var(--color-mv-text)] transition-colors"
        >
          {resolved === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        {onLogout && (
          <button
            type="button"
            onClick={onLogout}
            title="Abmelden"
            className="md:hidden p-2 rounded-lg text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)] hover:text-red-600 transition-colors"
          >
            <LogOut size={18} strokeWidth={1.75} />
          </button>
        )}

        <button
          onClick={() => onNavigate('create')}
          className="hidden md:flex items-center gap-1.5 ml-2 mv-btn-primary text-xs"
        >
          <Plus size={14} /> Erstellen
        </button>
      </div>
    </header>
  );
};

export default Header;
