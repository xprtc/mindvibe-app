import React, { useState } from 'react';
import { Search, FileText, Link as LinkIcon, Sparkles, FolderOpen, MoreVertical, X, Loader2, ArrowRight, Download, BookOpen, Pause, Play, RotateCw } from 'lucide-react';
import { findSimilarResources } from '../services/geminiService';
import StudyContentRenderer from '../components/StudyContentRenderer';

interface Resource {
  id: string;
  name: string;
  type: 'pdf' | 'link' | 'image';
  subject: string;
  date: string;
  size?: string;
}

const Library: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedResource, setSelectedResource] = useState<Resource | null>(null);
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationType, setGenerationType] = useState<'examples' | 'explanation' | 'advanced'>('examples');

  const resources: Resource[] = [
    { id: '1', name: 'Arbeitsblatt_Brüche_Einführung.pdf', type: 'pdf', subject: 'Mathematik', date: '2023-11-20', size: '2.4 MB' },
    { id: '2', name: 'Vokabelliste_Unit_4.pdf', type: 'pdf', subject: 'Englisch', date: '2023-11-22', size: '1.1 MB' },
    { id: '3', name: 'Youtube: Geschichte der Römer', type: 'link', subject: 'Geschichte', date: '2023-11-25' },
    { id: '4', name: 'Zusammenfassung_Nomen.jpg', type: 'image', subject: 'Deutsch', date: '2023-11-28', size: '450 KB' },
    { id: '5', name: 'Übungsblatt_Geometrie_Dreiecke.pdf', type: 'pdf', subject: 'Mathematik', date: '2023-12-01', size: '3.2 MB' },
    { id: '6', name: 'Python_Cheat_Sheet.pdf', type: 'pdf', subject: 'Informatik', date: '2023-12-02', size: '0.8 MB' },
  ];

  const filteredResources = resources.filter(res =>
    res.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    res.subject.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleGenerate = async (type: 'examples' | 'explanation' | 'advanced') => {
    if (!selectedResource) return;
    setIsGenerating(true);
    setGenerationType(type);
    setGeneratedContent(null);
    try {
      const content = await findSimilarResources(selectedResource.name, selectedResource.subject, type);
      setGeneratedContent(content);
    } catch (error) {
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="p-5 md:p-8 max-w-[1400px] mx-auto h-full flex flex-col animate-fade-in pb-24">

      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-mv-text)] flex items-center gap-3">
            <BookOpen className="text-[var(--color-mv-primary)]" size={24} />
            Bibliothek
          </h2>
          <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1">Verwalte deine Uploads und generiere neue Lerninhalte.</p>
        </div>

        <div className="relative w-full md:w-80">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mv-text-tertiary)]" size={16} />
          <input
            type="text"
            placeholder="Suche nach Thema, Datei oder Fach..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="mv-input pl-11"
          />
        </div>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0">

        {/* Resource Grid */}
        <div className={`flex-1 overflow-y-auto pr-2 ${selectedResource ? 'hidden lg:block' : ''}`}>
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filteredResources.map(res => (
              <div
                key={res.id}
                onClick={() => { setSelectedResource(res); setGeneratedContent(null); }}
                className={`mv-card p-5 cursor-pointer transition-all group ${
                  selectedResource?.id === res.id
                    ? 'ring-2 ring-[var(--color-mv-primary)]'
                    : 'hover:shadow-md'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                    res.type === 'pdf' ? 'bg-red-50 text-red-500' :
                    res.type === 'link' ? 'bg-blue-50 text-blue-500' : 'bg-purple-50 text-purple-500'
                  }`}>
                    {res.type === 'pdf' && <FileText size={20} />}
                    {res.type === 'link' && <LinkIcon size={20} />}
                    {res.type === 'image' && <FileText size={20} />}
                  </div>
                  <button className="p-1.5 hover:bg-[var(--color-mv-hover)] rounded-lg text-[var(--color-mv-text-tertiary)] opacity-0 group-hover:opacity-100 transition-opacity">
                    <MoreVertical size={16} />
                  </button>
                </div>

                <h3 className="text-sm font-medium text-[var(--color-mv-text)] mb-1 line-clamp-2 group-hover:text-[var(--color-mv-primary)] transition-colors">{res.name}</h3>
                <div className="flex items-center gap-2 mt-3">
                  <span className="bg-[var(--color-mv-surface-secondary)] px-2.5 py-1 rounded-lg text-xs text-[var(--color-mv-text-secondary)]">{res.subject}</span>
                  <span className="text-xs text-[var(--color-mv-text-tertiary)]">{new Date(res.date).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detail / Generation Panel */}
        {selectedResource && (
          <div className="w-full lg:w-[480px] flex flex-col mv-card overflow-hidden animate-fade-in absolute inset-0 lg:static z-20">
            {/* Panel Header */}
            <div className="p-5 border-b border-[var(--color-mv-active)] flex justify-between items-start">
              <div className="flex items-center gap-4">
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                  selectedResource.type === 'pdf' ? 'bg-red-50 text-red-600' :
                  selectedResource.type === 'link' ? 'bg-blue-50 text-blue-600' : 'bg-purple-50 text-purple-600'
                }`}>
                  {selectedResource.type === 'pdf' && <FileText size={22} />}
                  {selectedResource.type === 'link' && <LinkIcon size={22} />}
                  {selectedResource.type === 'image' && <FileText size={22} />}
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-[var(--color-mv-text)] line-clamp-1">{selectedResource.name}</h3>
                  <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-0.5">{selectedResource.subject} · {selectedResource.size || 'Link'}</p>
                </div>
              </div>
              <button
                onClick={() => setSelectedResource(null)}
                className="p-2 hover:bg-[var(--color-mv-hover)] rounded-lg text-[var(--color-mv-text-tertiary)] transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex-1 overflow-y-auto p-5 space-y-5">

              {/* Open File */}
              <div className="flex items-center justify-between p-4 bg-[var(--color-mv-surface-secondary)] rounded-xl">
                <span className="text-sm text-[var(--color-mv-text-secondary)]">Originaldatei öffnen</span>
                <button className="w-9 h-9 rounded-lg bg-[var(--color-mv-surface)] text-[var(--color-mv-primary)] flex items-center justify-center shadow-sm hover:shadow-md transition-all">
                  <Download size={16} />
                </button>
              </div>

              {/* AI Extensions */}
              <div>
                <h4 className="text-xs font-medium text-[var(--color-mv-text-tertiary)] mb-3 flex items-center gap-2">
                  <Sparkles className="text-[var(--color-mv-primary)]" size={14} />
                  KI-Erweiterungen
                </h4>
                <div className="space-y-2">
                  {[
                    { type: 'examples' as const, label: 'Übungsbeispiele', desc: 'Generiere 3 neue Aufgaben', color: 'bg-blue-50 text-blue-600', num: '1' },
                    { type: 'explanation' as const, label: 'Konzept-Erklärung', desc: 'Verstehe das "Warum"', color: 'bg-emerald-50 text-emerald-600', num: '2' },
                    { type: 'advanced' as const, label: 'Boss-Level', desc: 'Schwierige Transferaufgaben', color: 'bg-amber-50 text-amber-600', num: '3' },
                  ].map(item => (
                    <button
                      key={item.type}
                      onClick={() => handleGenerate(item.type)}
                      className={`w-full p-4 rounded-xl text-left transition-all flex items-center justify-between group ${
                        generationType === item.type && generatedContent ? 'bg-[var(--color-mv-primary-light)] ring-1 ring-[var(--color-mv-primary)]' : 'bg-[var(--color-mv-surface-secondary)] hover:bg-[var(--color-mv-hover)]'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-lg ${item.color} flex items-center justify-center text-sm font-semibold`}>{item.num}</div>
                        <div>
                          <div className="text-sm font-medium text-[var(--color-mv-text)]">{item.label}</div>
                          <div className="text-xs text-[var(--color-mv-text-tertiary)] mt-0.5">{item.desc}</div>
                        </div>
                      </div>
                      <ArrowRight size={16} className="text-[var(--color-mv-text-tertiary)] group-hover:text-[var(--color-mv-primary)] transition-colors" />
                    </button>
                  ))}
                </div>
              </div>

              {/* Result Output */}
              {isGenerating ? (
                <div className="py-12 flex flex-col items-center justify-center text-[var(--color-mv-text-tertiary)] animate-fade-in">
                  <Loader2 className="animate-spin mb-3 text-[var(--color-mv-primary)]" size={28} />
                  <p className="text-xs">Analysiere "{selectedResource.name}"...</p>
                </div>
              ) : generatedContent ? (
                <div className="mv-card overflow-hidden animate-fade-in ring-1 ring-emerald-200">
                  <div className="bg-emerald-50 p-3 flex justify-between items-center">
                    <span className="text-xs font-medium text-emerald-700 flex items-center gap-2">
                      <Sparkles size={12} /> KI-Generiert
                    </span>
                    <button
                      onClick={() => navigator.clipboard.writeText(generatedContent)}
                      className="text-xs text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-primary)]"
                    >
                      Kopieren
                    </button>
                  </div>
                  <div className="p-5 max-h-[400px] overflow-y-auto">
                    <StudyContentRenderer content={generatedContent} />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Library;
