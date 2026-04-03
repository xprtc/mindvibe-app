import React, { useState, useEffect } from 'react';
import {
  Home, Trophy, TrendingUp, Users, GraduationCap,
  BookOpen, Brain, Settings, Book, MessageSquare,
  Headphones, LogOut, Sparkles, Crown, Plus, ChevronDown, ChevronRight,
} from 'lucide-react';
import { useSubscription } from '../context/SubscriptionContext';
import { useSession } from '../context/SessionContext';
import { getSubjects, seedDefaultSubjects } from '../services/firestoreService';
import type { Subject } from '../types';
import { SUBJECT_COLORS } from '../types';

interface SidebarProps {
  currentPage: string;
  onNavigate: (page: string) => void;
  open: boolean;
  onClose: () => void;
  onLogout: () => void;
  userName?: string;
  userEmail?: string;
  collapsed?: boolean;
}

type NavIcon = React.ComponentType<{ size?: number; strokeWidth?: number; className?: string }>;

interface NavItem {
  id: string;
  label: string;
  icon: NavIcon;
  requiredPlan?: 'smart' | 'premium';
}

const topNav: NavItem[] = [
  { id: 'home', label: 'Dashboard', icon: Home },
  { id: 'chat', label: 'Einstein Chat', icon: MessageSquare },
];

const bottomMainNav: NavItem[] = [
  { id: 'erfolge', label: 'Erfolge & Level', icon: Trophy },
  { id: 'fortschritt', label: 'Statistiken', icon: TrendingUp },
];

const bottomNav: NavItem[] = [
  { id: 'settings', label: 'Einstellungen', icon: Settings },
  { id: 'contact', label: 'Hilfe & Support', icon: Headphones },
];

/* ── Single nav button ── */
function SidebarNavButton({
  id, label, icon: Icon, currentPage, collapsed, onNavigate, requiredPlan, plan,
}: {
  id: string; label: string; icon: NavIcon; currentPage: string;
  collapsed?: boolean; onNavigate: (page: string) => void;
  requiredPlan?: 'smart' | 'premium'; plan: string;
}) {
  const isActive = currentPage === id;
  const needsUpgrade = requiredPlan && (
    (requiredPlan === 'smart' && plan === 'basic') ||
    (requiredPlan === 'premium' && (plan === 'basic' || plan === 'smart'))
  );

  return (
    <button
      type="button"
      onClick={() => onNavigate(id)}
      title={collapsed ? label : undefined}
      className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-4'} py-2.5 rounded-xl text-sm transition-all ${
        isActive
          ? 'bg-[var(--color-mv-sidebar-active)] text-white font-medium shadow-sm'
          : 'text-[var(--color-mv-sidebar-text-secondary)] hover:bg-[var(--color-mv-sidebar-hover)] hover:text-[var(--color-mv-sidebar-text)]'
      }`}
    >
      <Icon size={18} strokeWidth={isActive ? 2 : 1.5} className="shrink-0" />
      {!collapsed && (
        <>
          <span className="flex-1 text-left">{label}</span>
          {needsUpgrade && (
            <span className={`inline-flex items-center gap-0.5 text-[9px] font-bold px-1.5 py-0.5 rounded-md ${
              requiredPlan === 'premium' ? 'bg-purple-100 text-purple-600' : 'bg-amber-100 text-amber-600'
            }`}>
              <Sparkles size={8} /> {requiredPlan === 'premium' ? 'PRO' : 'SMART'}
            </span>
          )}
        </>
      )}
    </button>
  );
}

/* ── Subject button in sidebar ── */
function SubjectNavButton({
  subject, currentPage, collapsed, onNavigate,
}: {
  subject: Subject; currentPage: string; collapsed?: boolean; onNavigate: (page: string) => void;
}) {
  const pageId = `subject:${subject.id}`;
  const isActive = currentPage === pageId;
  const colors = SUBJECT_COLORS[subject.color] || SUBJECT_COLORS.blue;

  return (
    <button
      type="button"
      onClick={() => onNavigate(pageId)}
      title={collapsed ? subject.name : undefined}
      className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded-xl text-sm transition-all ${
        isActive
          ? 'bg-[var(--color-mv-sidebar-active)] text-white font-medium shadow-sm'
          : 'text-[var(--color-mv-sidebar-text-secondary)] hover:bg-[var(--color-mv-sidebar-hover)] hover:text-[var(--color-mv-sidebar-text)]'
      }`}
    >
      <span className="text-base shrink-0 leading-none">{subject.icon}</span>
      {!collapsed && (
        <span className="flex-1 text-left truncate">{subject.name}</span>
      )}
      {!collapsed && subject.currentGrade > 0 && (
        <span className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md ${isActive ? 'bg-white/20 text-white' : `${colors.bg} ${colors.text}`}`}>
          {subject.currentGrade.toFixed(1)}
        </span>
      )}
    </button>
  );
}

/* ── Main Sidebar ── */
const Sidebar: React.FC<SidebarProps> = ({ currentPage, onNavigate, onLogout, collapsed, userName, userEmail }) => {
  const w = collapsed ? 'w-[72px]' : 'w-[260px]';
  const { plan, planInfo } = useSubscription();
  const { user } = useSession();
  const [subjects, setSubjects] = useState<Subject[]>([]);
  const [subjectsExpanded, setSubjectsExpanded] = useState(true);

  // Load subjects
  useEffect(() => {
    if (!user?.uid) return;
    seedDefaultSubjects(user.uid).then(setSubjects).catch(console.error);
  }, [user?.uid]);

  return (
    <aside className={`fixed top-0 left-0 h-full ${w} bg-[var(--color-mv-sidebar-bg)] shadow-none z-30 flex flex-col transition-all duration-200 hidden md:flex`}>
      {/* Logo */}
      <div className={`h-14 flex items-center ${collapsed ? 'justify-center px-2' : 'px-5'} gap-3 border-none`}>
        <div className="w-9 h-9 rounded-xl bg-[var(--color-mv-primary)] flex items-center justify-center text-white font-bold text-base shadow-sm shrink-0">
          M
        </div>
        {!collapsed && <span className="text-lg font-bold text-[var(--color-mv-sidebar-text)]">MindVibe</span>}
      </div>

      {/* Plan badge */}
      {!collapsed && planInfo && (
        <div className="mx-3 mb-2">
          <div className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-medium ${
            plan === 'premium' ? 'bg-purple-50 text-purple-700' :
            plan === 'smart' ? 'bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)]' :
            'bg-gray-50 text-gray-600'
          }`}>
            {plan === 'premium' ? <Crown size={14} /> : plan === 'smart' ? <Sparkles size={14} /> : null}
            {planInfo.name} Plan
          </div>
        </div>
      )}

      {/* Scrollable nav area */}
      <div className="flex-1 overflow-y-auto scrollbar-hide px-2 py-3 space-y-1">

        {/* Top nav: Dashboard, Einstein */}
        {topNav.map((item) => (
          <SidebarNavButton key={item.id} id={item.id} label={item.label} icon={item.icon}
            currentPage={currentPage} collapsed={collapsed} onNavigate={onNavigate} plan={plan} />
        ))}

        {/* ── FÄCHER SECTION ── */}
        {!collapsed && (
          <div className="pt-4 pb-1 px-4">
            <button
              type="button"
              onClick={() => setSubjectsExpanded((v) => !v)}
              className="flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-[var(--color-mv-sidebar-text-secondary)] hover:text-[var(--color-mv-sidebar-text)] transition-colors w-full"
            >
              {subjectsExpanded ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
              Meine Fächer
            </button>
          </div>
        )}

        {collapsed && <div className="h-px bg-[var(--color-mv-sidebar-hover)] my-3 mx-2" />}

        {(subjectsExpanded || collapsed) && subjects.map((subject) => (
          <SubjectNavButton key={subject.id} subject={subject} currentPage={currentPage}
            collapsed={collapsed} onNavigate={onNavigate} />
        ))}

        {/* Add subject button */}
        {(subjectsExpanded || collapsed) && (
          <button
            type="button"
            onClick={() => onNavigate('add-subject')}
            title={collapsed ? 'Fach hinzufügen' : undefined}
            className={`w-full flex items-center gap-3 ${collapsed ? 'justify-center px-2' : 'px-4'} py-2 rounded-xl text-sm text-[var(--color-mv-sidebar-text-secondary)] hover:bg-[var(--color-mv-sidebar-hover)] hover:text-[var(--color-mv-sidebar-text)] transition-all opacity-60 hover:opacity-100`}
          >
            <Plus size={16} strokeWidth={1.5} className="shrink-0" />
            {!collapsed && <span>Fach hinzufügen</span>}
          </button>
        )}

        {/* Divider */}
        {!collapsed && <div className="h-px bg-[var(--color-mv-sidebar-hover)] my-3 mx-2" />}
        {collapsed && <div className="h-px bg-[var(--color-mv-sidebar-hover)] my-3 mx-2" />}

        {/* Bottom main nav: Erfolge, Statistiken */}
        {bottomMainNav.map((item) => (
          <SidebarNavButton key={item.id} id={item.id} label={item.label} icon={item.icon}
            currentPage={currentPage} collapsed={collapsed} onNavigate={onNavigate} plan={plan} />
        ))}
      </div>

      {/* Bottom: Settings, Help */}
      <div className="px-2 py-2 space-y-1 border-none">
        {bottomNav.map((item) => (
          <SidebarNavButton key={item.id} id={item.id} label={item.label} icon={item.icon}
            currentPage={currentPage} collapsed={collapsed} onNavigate={onNavigate} plan={plan} />
        ))}
      </div>

      {/* User */}
      <div className="p-2 border-none space-y-1">
        <button
          type="button"
          onClick={() => onNavigate('settings')}
          className={`w-full flex items-center gap-3 p-2 rounded-xl hover:bg-[var(--color-mv-sidebar-hover)] transition-colors ${collapsed ? 'justify-center' : ''}`}
        >
          <div className="w-8 h-8 rounded-full bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)] flex items-center justify-center text-sm font-semibold shrink-0">
            {userName?.charAt(0)?.toUpperCase() || 'U'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 text-left">
              <p className="text-sm font-medium text-[var(--color-mv-sidebar-text)] truncate">{userName || 'User'}</p>
              <p className="text-xs text-[var(--color-mv-sidebar-text-secondary)] truncate">{userEmail || ''}</p>
            </div>
          )}
        </button>
        <button
          type="button"
          onClick={onLogout}
          title="Abmelden"
          className={`w-full flex items-center gap-3 py-2.5 rounded-xl text-sm text-red-600 hover:bg-[var(--color-mv-sidebar-hover)] transition-colors ${collapsed ? 'justify-center px-2' : 'px-4'}`}
        >
          <LogOut size={18} strokeWidth={1.75} className="shrink-0" />
          {!collapsed && <span>Abmelden</span>}
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
