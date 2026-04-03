import React, { useState } from 'react';
import { Brain, Folder, Search, Sparkles, ChevronRight, Hash, Database, Layers, ArrowLeft, RefreshCw, Loader2 } from 'lucide-react';
import { Exam } from '../types';
import { extractKnowledgeFromContent } from '../services/geminiService';

interface KnowledgeProps {
  exams: Exam[];
}

interface KnowledgeItem {
  id: string;
  subject: string;
  title: string;
  content: string;
  tags: string[];
  sourceExamId: string;
  dateAdded: string;
}

const Knowledge: React.FC<KnowledgeProps> = ({ exams }) => {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [isExtracting, setIsExtracting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const [knowledgeBase, setKnowledgeBase] = useState<KnowledgeItem[]>([
    {
      id: '1', subject: 'Mathematik', title: 'Bruchrechnen Grundlagen',
      content: `### Bruchrechnen Grundlagen\n**Tags:** #Bruch #Division\n**Definition:** Ein Bruch beschreibt einen Anteil an einem Ganzen. Er besteht aus Zähler (oben) und Nenner (unten).\n**Key Fact:** Nenner darf nie 0 sein!`,
      tags: ['Bruch', 'Division'], sourceExamId: '2', dateAdded: '2023-11-20'
    },
    {
      id: '2', subject: 'Deutsch', title: 'Nomen-Regeln',
      content: `### Nomen-Regeln\n**Tags:** #Grammatik #Rechtschreibung\n**Definition:** Nomen sind Lebewesen, Dinge oder Abstrakta. Sie werden immer großgeschrieben.\n**Key Fact:** Artikelprobe (der/die/das) hilft beim Erkennen.`,
      tags: ['Grammatik', 'Rechtschreibung'], sourceExamId: '3', dateAdded: '2023-11-22'
    }
  ]);

  const subjects = Array.from(new Set([...knowledgeBase.map(k => k.subject), ...exams.map(e => e.subject)]));

  const handleExtractFromExams = async () => {
    setIsExtracting(true);
    let newItems: KnowledgeItem[] = [];

    for (const exam of exams) {
      if (exam.content && exam.content.length > 50) {
        try {
          const result = await extractKnowledgeFromContent(exam.content, exam.subject);
          if (result) {
            const snippets = result.split('---').filter(s => s.trim().length > 10);
            snippets.forEach((snippet, idx) => {
              const titleMatch = snippet.match(/### (.*)/);
              const title = titleMatch ? titleMatch[1] : `Konzept ${idx+1}`;
              const tagMatch = snippet.match(/Tags:\*\*(.*)/);
              const tags = tagMatch ? tagMatch[1].split(' ').filter(t => t.startsWith('#')).map(t => t.replace('#', '')) : [];
              newItems.push({
                id: Date.now() + idx + Math.random().toString(),
                subject: exam.subject, title, content: snippet.trim(), tags, sourceExamId: exam.id, dateAdded: new Date().toISOString()
              });
            });
          }
        } catch (e) {
          console.error("Failed to extract for exam", exam.title);
        }
      }
    }

    setKnowledgeBase(prev => [...newItems, ...prev]);
    setIsExtracting(false);
  };

  const filteredItems = knowledgeBase.filter(item =>
    (selectedSubject ? item.subject === selectedSubject : true) &&
    (item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
     item.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase())))
  );

  const getSubjectColor = (subj: string) => {
    switch(subj) {
      case 'Mathematik': return 'bg-blue-50 text-blue-600';
      case 'Deutsch': return 'bg-gray-100 text-gray-700';
      case 'Englisch': return 'bg-emerald-50 text-emerald-600';
      case 'Informatik': return 'bg-purple-50 text-purple-600';
      default: return 'bg-[var(--color-mv-surface-secondary)] text-[var(--color-mv-text-tertiary)]';
    }
  };

  return (
    <div className="p-5 md:p-8 max-w-[1400px] mx-auto h-full flex flex-col animate-fade-in pb-24">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-mv-text)] flex items-center gap-3">
            <Database className="text-[var(--color-mv-primary)]" size={24} />
            Wissens-Datenbank
          </h2>
          <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1">Dein Second Brain. Alles Wissen aus deinen Prüfungen, automatisch organisiert.</p>
        </div>

        <button
          onClick={handleExtractFromExams}
          disabled={isExtracting}
          className="mv-btn-primary flex items-center gap-2 disabled:opacity-50"
        >
          {isExtracting ? <Loader2 className="animate-spin" size={16} /> : <Sparkles size={16} />}
          {isExtracting ? 'Analysiere...' : 'Wissen extrahieren'}
        </button>
      </div>

      {/* Main Content */}
      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

        {/* Left Sidebar */}
        <div className="w-full lg:w-64 flex-shrink-0 space-y-4">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mv-text-tertiary)]" size={16} />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Keyword suchen..."
              className="mv-input pl-11"
            />
          </div>

          <div className="mv-card p-2">
            <button
              onClick={() => setSelectedSubject(null)}
              className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium mb-1 flex items-center justify-between transition-all ${
                !selectedSubject ? 'bg-[var(--color-mv-text)] text-white shadow-sm' : 'text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)]'
              }`}
            >
              <span className="flex items-center gap-2"><Layers size={16} /> Alle Fächer</span>
              <span className={`text-xs px-2 py-0.5 rounded-lg ${!selectedSubject ? 'bg-white/20' : 'bg-[var(--color-mv-surface-secondary)]'}`}>{knowledgeBase.length}</span>
            </button>

            <div className="h-px bg-[var(--color-mv-active)] my-2 mx-2" />

            {subjects.map(subj => {
              const count = knowledgeBase.filter(k => k.subject === subj).length;
              return (
                <button
                  key={subj}
                  onClick={() => setSelectedSubject(subj)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium mb-1 flex items-center justify-between transition-all ${
                    selectedSubject === subj ? 'bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)]' : 'text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)]'
                  }`}
                >
                  <span className="flex items-center gap-2"><Folder size={16} /> {subj}</span>
                  <span className="text-xs bg-[var(--color-mv-surface-secondary)] px-2 py-0.5 rounded-lg text-[var(--color-mv-text-tertiary)]">{count}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Knowledge Grid */}
        <div className="flex-1 overflow-y-auto pr-2">
          {filteredItems.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-[var(--color-mv-text-tertiary)] mv-card border-dashed border-[var(--color-mv-active)]">
              <Brain size={48} className="mb-4 opacity-20" />
              <p className="text-sm">Keine Einträge gefunden.</p>
              <button onClick={handleExtractFromExams} className="text-[var(--color-mv-primary)] text-sm mt-2 hover:underline">
                Starte die KI-Extraktion
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredItems.map(item => (
                <div key={item.id} className="mv-card p-5 transition-all hover:shadow-md group">
                  <div className="flex justify-between items-start mb-3">
                    <span className={`text-xs px-2.5 py-1 rounded-lg ${getSubjectColor(item.subject)}`}>
                      {item.subject}
                    </span>
                    <span className="text-xs text-[var(--color-mv-text-tertiary)] flex items-center gap-1">
                      <RefreshCw size={10} /> {new Date(item.dateAdded).toLocaleDateString()}
                    </span>
                  </div>

                  <h3 className="text-base font-semibold text-[var(--color-mv-text)] mb-3 group-hover:text-[var(--color-mv-primary)] transition-colors">{item.title}</h3>

                  <div className="text-sm text-[var(--color-mv-text-secondary)] bg-[var(--color-mv-surface-secondary)] p-4 rounded-xl mb-3 leading-relaxed">
                    {item.content.split('\n').filter(l => !l.startsWith('###') && !l.startsWith('**Tags')).map((l, i) => (
                      <p key={i} className="mb-1">{l.replace(/\*\*(.*?)\*\*/g, '$1')}</p>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {item.tags.map(tag => (
                      <span key={tag} className="flex items-center gap-1 text-xs text-[var(--color-mv-text-tertiary)] bg-[var(--color-mv-surface-secondary)] px-2 py-1 rounded-lg">
                        <Hash size={10} /> {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Knowledge;
