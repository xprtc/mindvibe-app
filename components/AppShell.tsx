import React, { useState, useCallback, useEffect } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import BottomNav from './BottomNav';
import Footer from './Footer';
import SearchModal from './SearchModal';
import ChatShell from './chat/ChatShell';
import Dashboard from '../pages/Dashboard';
import Exams from '../pages/Exams';
import ExamReview from '../pages/ExamReview';
import Library from '../pages/Library';
import Knowledge from '../pages/Knowledge';
import StudyGroups from '../pages/StudyGroups';
import Erfolge from '../pages/Erfolge';
import Progress from '../pages/Progress';
import Settings from '../pages/Settings';
import CreateWizard from '../pages/CreateWizard';
import SubjectHub from '../pages/SubjectHub';
import Contact from '../pages/Contact';
import Privacy from '../pages/Privacy';
import Imprint from '../pages/Imprint';
import { useSession } from '../context/SessionContext';
import { useEinstein } from '../context/EinsteinContext';
import { getExams, addExam as firestoreAddExam, getSubjects, seedDefaultSubjects } from '../services/firestoreService';
import Einstein from './Straeber';
import type { Exam, Subject } from '../types';

interface AppShellProps {
  userName: string;
  userEmail: string;
  onLogout: () => void;
}

const AppShell: React.FC<AppShellProps> = ({ userName, userEmail, onLogout }) => {
  const { user } = useSession();
  const einstein = useEinstein();
  const [currentPage, setCurrentPage] = useState('home');
  const [sidebarOpen, setSidebarOpen] = useState(false); // mobile drawer
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false); // desktop collapse
  const [searchOpen, setSearchOpen] = useState(false);
  const [exams, setExams] = useState<Exam[]>([]);
  const [examsLoaded, setExamsLoaded] = useState(false);
  const [subjects, setSubjects] = useState<Subject[]>([]);

  // Cmd+K for search
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  // Load exams & subjects from Firestore
  useEffect(() => {
    if (!user?.uid) return;
    getExams(user.uid)
      .then((data) => { setExams(data); setExamsLoaded(true); })
      .catch(() => setExamsLoaded(true));
    seedDefaultSubjects(user.uid)
      .then(setSubjects)
      .catch(console.error);
  }, [user?.uid]);

  // Seed demo exams for new users
  useEffect(() => {
    if (!examsLoaded || !user?.uid || exams.length > 0) return;
    const demoExams: Omit<Exam, 'id'>[] = [
      { title: 'Gedichtanalyse', subject: 'Deutsch', date: '2025-12-19', status: 'upcoming', tags: ['Lyrik'] },
      { title: 'Algebra Basics', subject: 'Mathematik', date: '2025-10-15', status: 'upcoming' },
      { title: 'Brüche & Dezimalzahlen', subject: 'Mathematik', date: '2025-12-19', status: 'ready', grade: 5.2 },
      { title: 'Einsatz & Mehrzahl', subject: 'Deutsch', date: '2025-09-30', status: 'passed', grade: 4.5 },
      { title: 'Grammatik Grundlagen', subject: 'Deutsch', date: '2025-09-18', status: 'upcoming' },
    ];
    Promise.all(demoExams.map((e) => firestoreAddExam(user.uid, e)))
      .then(setExams)
      .catch((err) => console.warn('[MindVibe] Demo-Prüfungen konnten nicht gespeichert werden:', err));
  }, [examsLoaded, user?.uid, exams.length]);

  const navigate = useCallback((page: string) => {
    setCurrentPage(page);
    einstein.setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [einstein]);

  // Register navigate callback for Einstein concierge
  useEffect(() => {
    einstein.setNavigateTo(navigate);
    einstein.setActionHandler((action) => {
      if (action.type === 'navigate' && action.payload?.page) {
        navigate(action.payload.page);
      }
      if (action.type === 'create_exam') {
        navigate('create');
      }
      if (action.type === 'open_search') {
        setSearchOpen(true);
      }
    });
  }, [navigate, einstein]);

  const addExam = useCallback(async (exam: Exam) => {
    if (!user?.uid) return;
    const created = await firestoreAddExam(user.uid, {
      title: exam.title, subject: exam.subject, date: exam.date,
      status: exam.status, tags: exam.tags, grade: exam.grade,
    });
    setExams((prev) => [...prev, created]);
  }, [user?.uid]);

  const handleToggleSidebar = useCallback(() => {
    // On mobile: toggle drawer
    // On desktop: collapse/expand
    const isMobile = window.innerWidth < 768;
    if (isMobile) {
      setSidebarOpen((v) => !v);
    } else {
      setSidebarCollapsed((v) => !v);
    }
  }, []);

  // Chat: full screen
  if (currentPage === 'chat') {
    return (
      <ChatShell mode="full" userName={userName} onLogout={onLogout} onBack={() => navigate('home')} />
    );
  }

  const renderPage = () => {
    // Subject pages: "subject:abc123"
    if (currentPage.startsWith('subject:')) {
      const subjectId = currentPage.split(':')[1];
      const subject = subjects.find((s) => s.id === subjectId);
      if (subject) {
        return <SubjectHub subject={subject} onBack={() => navigate('home')} />;
      }
    }

    switch (currentPage) {
      case 'home': return <Dashboard onNavigate={navigate} exams={exams} onOpenExam={() => {}} onAddExam={addExam} />;
      case 'pruefungen': return <Exams exams={exams} onOpenExam={() => {}} />;
      case 'review': return <ExamReview />;
      case 'bibliothek': return <Library />;
      case 'wissen': return <Knowledge exams={exams} />;
      case 'lerngruppen': return <StudyGroups />;
      case 'erfolge': return <Erfolge exams={exams} />;
      case 'fortschritt': return <Progress exams={exams} onOpenExam={() => {}} />;
      case 'settings': return <Settings />;
      case 'create': return <CreateWizard onBack={() => navigate('home')} onComplete={(exam) => { addExam(exam); navigate('pruefungen'); }} />;
      case 'contact': return <Contact />;
      case 'privacy': return <Privacy />;
      case 'impressum': return <Imprint />;
      default: return <Dashboard onNavigate={navigate} exams={exams} onOpenExam={() => {}} onAddExam={addExam} />;
    }
  };

  const sidebarWidth = sidebarCollapsed ? 'md:pl-[72px]' : 'md:pl-[260px]';

  return (
    <div className="min-h-screen bg-[var(--color-mv-bg)]">
      {/* Sidebar — desktop: permanent (collapsible), mobile: drawer via hamburger */}
      <Sidebar
        currentPage={currentPage}
        onNavigate={navigate}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        onLogout={onLogout}
        userName={userName}
        userEmail={userEmail}
        collapsed={sidebarCollapsed}
      />

      {/* Header */}
      <Header
        currentPage={currentPage}
        onNavigate={navigate}
        onToggleSidebar={handleToggleSidebar}
        onOpenSearch={() => setSearchOpen(true)}
        onLogout={onLogout}
        userName={userName}
        sidebarCollapsed={sidebarCollapsed}
      />

      {/* Search */}
      <SearchModal open={searchOpen} onClose={() => setSearchOpen(false)} onNavigate={navigate} />

      {/* Main */}
      <main className={`pt-14 ${sidebarWidth} pb-20 md:pb-0 min-h-screen transition-all`}>
        <div className="animate-fade-in">
          {renderPage()}
        </div>
        <Footer onNavigate={navigate} />
      </main>

      {/* Bottom nav — mobile only */}
      <BottomNav currentPage={currentPage} onNavigate={navigate} />

      {/* Einstein Concierge — floating on every page */}
      <Einstein />
    </div>
  );
};

export default AppShell;
