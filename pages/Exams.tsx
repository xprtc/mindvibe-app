import React from 'react';
import { Plus, Trash2, Edit2, Calendar } from 'lucide-react';
import { Exam } from '../types';

interface ExamsProps {
  exams: Exam[];
  onOpenExam: (exam: Exam) => void;
}

const Exams: React.FC<ExamsProps> = ({ exams, onOpenExam }) => {
  // Group exams by subject
  const examsBySubject = exams.reduce((acc, exam) => {
    if (!acc[exam.subject]) {
      acc[exam.subject] = [];
    }
    acc[exam.subject].push(exam);
    return acc;
  }, {} as Record<string, Exam[]>);

  return (
    <div className="p-5 md:p-8 max-w-[1400px] mx-auto space-y-6 animate-fade-in pb-24">
       <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-mv-text)]">Prüfungsvorbereitung</h2>
          <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1">Verwalte deine Fächer und anstehenden Prüfungen.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <button className="flex-1 md:flex-none mv-btn-secondary text-xs">Fach hinzufügen</button>
          <button className="flex-1 md:flex-none mv-btn-primary flex items-center justify-center gap-2 text-xs">
            <Plus size={16}/> Prüfung erstellen
          </button>
        </div>
      </div>

      {/* Exam List Groups */}
      {Object.keys(examsBySubject).length === 0 ? (
         <div className="text-center py-16 mv-card">
           <h3 className="text-sm text-[var(--color-mv-text-tertiary)]">Keine Prüfungen gefunden</h3>
         </div>
      ) : (
        Object.entries(examsBySubject).map(([subject, subjectExams]: [string, Exam[]]) => (
          <div key={subject} className="mv-card overflow-hidden">
            <div className="px-5 py-4 border-b border-[var(--color-mv-active)] flex items-center justify-between">
              <h3 className="text-base font-semibold text-[var(--color-mv-text)]">{subject}</h3>
              <span className="text-xs text-[var(--color-mv-text-tertiary)] bg-[var(--color-mv-surface-secondary)] px-2.5 py-1 rounded-lg">{subjectExams.length} Prüfungen</span>
            </div>
            <div className="px-2 pb-2">
              {subjectExams.map(exam => (
                <div
                  key={exam.id}
                  onClick={() => onOpenExam(exam)}
                  className="px-4 py-3.5 flex items-center justify-between hover:bg-[var(--color-mv-hover)] rounded-xl transition-colors group cursor-pointer"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-11 h-11 rounded-xl bg-[var(--color-mv-surface-secondary)] flex items-center justify-center text-[var(--color-mv-text-tertiary)] group-hover:bg-[var(--color-mv-primary)] group-hover:text-white transition-all">
                      <Calendar size={18}/>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-[var(--color-mv-text)] group-hover:text-[var(--color-mv-primary)] transition-colors">{exam.title}</h4>
                      <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-0.5">{new Date(exam.date).toLocaleDateString('de-DE', { weekday: 'long', day: '2-digit', month: 'long', year: 'numeric' })}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <span className={`px-3 py-1 rounded-lg text-xs font-medium ${exam.status === 'passed' ? 'bg-[var(--color-mv-surface-secondary)] text-[var(--color-mv-text-tertiary)]' : 'bg-emerald-50 text-emerald-600'}`}>
                      {exam.status === 'passed' ? 'Vergangen' : 'Lernbereit'}
                    </span>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button className="w-8 h-8 flex items-center justify-center text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-primary)] hover:bg-blue-50 rounded-lg transition-all">
                        <Edit2 size={16}/>
                      </button>
                      <button className="w-8 h-8 flex items-center justify-center text-[var(--color-mv-text-tertiary)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all">
                        <Trash2 size={16}/>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default Exams;
