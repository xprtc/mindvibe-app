import React from 'react';
import { Home, BookOpen, MessageSquare, TrendingUp, User } from 'lucide-react';

interface BottomNavProps {
  currentPage: string;
  onNavigate: (page: string) => void;
}

const navItems = [
  { id: 'home', label: 'Home', icon: Home },
  { id: 'pruefungen', label: 'Lernen', icon: BookOpen, match: ['pruefungen', 'review', 'bibliothek', 'wissen', 'lerngruppen', 'erfolge', 'create'] },
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'fortschritt', label: 'Stats', icon: TrendingUp, match: ['fortschritt'] },
  { id: 'settings', label: 'Profil', icon: User, match: ['settings'] },
];

const BottomNav: React.FC<BottomNavProps> = ({ currentPage, onNavigate }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden bg-[var(--color-mv-surface)] border-t border-[var(--color-mv-border)] pb-safe">
      <div className="flex items-center justify-around h-16 px-1">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.id === currentPage || (item.match?.includes(currentPage) ?? false);

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              className={`flex flex-col items-center justify-center gap-1 flex-1 py-1.5 transition-colors ${
                isActive ? 'text-[var(--color-mv-primary)]' : 'text-[var(--color-mv-text-tertiary)]'
              }`}
            >
              <Icon size={22} strokeWidth={isActive ? 2.5 : 1.5} />
              <span className={`text-[10px] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
