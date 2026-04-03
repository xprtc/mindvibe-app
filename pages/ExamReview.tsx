import React, { useState, useRef } from 'react';
import { UploadCloud, FileText, X, Wand2, Loader2, ChevronRight, Mail, AlertTriangle, CheckCircle, BookOpen, Brain, Copy } from 'lucide-react';
import { analyzeExamReview } from '../services/geminiService';

const ExamReview: React.FC = () => {
  const [images, setImages] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{ optimization: string; deepdive: string } | null>(null);
  const [activeTab, setActiveTab] = useState<'upload' | 'optimization' | 'deepdive'>('upload');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      Array.from(e.target.files).forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (typeof reader.result === 'string') {
            setImages(prev => [...prev, reader.result as string]);
          }
        };
        reader.readAsDataURL(file as Blob);
      });
    }
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleAnalyze = async () => {
    if (images.length === 0) return;
    setLoading(true);
    try {
      const rawResult = await analyzeExamReview(images, notes);
      let optimization = "";
      let deepdive = "";

      if (rawResult.includes(':::SECTION: optimization:::')) {
        const parts = rawResult.split(':::SECTION:');
        parts.forEach(part => {
          if (part.startsWith(' optimization:::')) {
            optimization = part.replace(' optimization:::', '').trim();
          } else if (part.startsWith(' deepdive:::')) {
            deepdive = part.replace(' deepdive:::', '').trim();
          }
        });
      } else {
        optimization = rawResult;
      }

      setResult({ optimization, deepdive });
      setActiveTab('optimization');
    } catch (err) {
      console.error(err);
      alert("Fehler bei der Analyse. Bitte versuche es erneut.");
    } finally {
      setLoading(false);
    }
  };

  const MarkdownRenderer = ({ content }: { content: string }) => {
    if (!content) return <div className="text-[var(--color-mv-text-tertiary)] text-sm py-8 text-center">Keine Inhalte verfügbar.</div>;

    return (
      <div className="prose prose-sm max-w-none">
        {content.split('\n').map((line, i) => {
          if (line.startsWith('###')) return <h3 key={i} className="text-base font-semibold text-[var(--color-mv-text)] mt-6 mb-3 flex items-center gap-2"><div className="w-1.5 h-5 bg-[var(--color-mv-primary)] rounded-full" />{line.replace(/#/g, '')}</h3>;
          if (line.startsWith('##')) return <h2 key={i} className="text-lg font-semibold text-[var(--color-mv-text)] mt-8 mb-4 pb-3 border-b border-[var(--color-mv-active)]">{line.replace(/#/g, '')}</h2>;
          if (line.startsWith('-') || line.startsWith('*')) return <li key={i} className="ml-4 text-sm text-[var(--color-mv-text-secondary)] my-1.5 list-disc pl-1">{line.replace(/[-*]/, '')}</li>;
          if (line.includes('|')) {
            const cols = line.split('|').filter(c => c.trim());
            if (line.includes('---')) return null;
            return (
              <div key={i} className="grid grid-cols-3 gap-4 py-3 border-b border-[var(--color-mv-active)] last:border-0">
                {cols.map((col, idx) => (
                  <div key={idx} className="text-xs text-[var(--color-mv-text-tertiary)]">{col}</div>
                ))}
              </div>
            );
          }
          return <p key={i} className="text-sm text-[var(--color-mv-text-secondary)] leading-relaxed mb-3">{line}</p>;
        })}
      </div>
    );
  };

  return (
    <div className="p-5 md:p-8 max-w-[1200px] mx-auto h-full flex flex-col animate-fade-in pb-24">

      {/* Header */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-[var(--color-mv-text)] flex items-center gap-3">
          <BookOpen className="text-[var(--color-mv-primary)]" size={24} />
          Prüfungs-Review
        </h2>
        <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1 max-w-2xl">
          Lade deine korrigierte Prüfung hoch. Unsere KI analysiert Fehler, findet Punkte-Potenzial und erstellt dir einen passenden Lernplan.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-[var(--color-mv-surface)] p-1 rounded-xl shadow-sm w-fit">
        <button
          onClick={() => setActiveTab('upload')}
          className={`px-5 py-2.5 rounded-lg text-xs font-medium transition-all whitespace-nowrap ${activeTab === 'upload' ? 'bg-[var(--color-mv-text)] text-white shadow-sm' : 'text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)]'}`}
        >
          1. Upload & Scan
        </button>
        <button
          onClick={() => result && setActiveTab('optimization')}
          disabled={!result}
          className={`px-5 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'optimization' ? 'bg-[var(--color-mv-text)] text-white shadow-sm' : 'text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)] disabled:opacity-30 disabled:cursor-not-allowed'}`}
        >
          <Mail size={13} /> 2. Notenoptimierung
        </button>
        <button
          onClick={() => result && setActiveTab('deepdive')}
          disabled={!result}
          className={`px-5 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center gap-2 whitespace-nowrap ${activeTab === 'deepdive' ? 'bg-[var(--color-mv-text)] text-white shadow-sm' : 'text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)] disabled:opacity-30 disabled:cursor-not-allowed'}`}
        >
          <Brain size={13} /> 3. Themenvertiefung
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 mv-card p-6 min-h-[500px]">

        {/* TAB 1: UPLOAD */}
        {activeTab === 'upload' && (
          <div className="max-w-3xl mx-auto space-y-6">
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-[var(--color-mv-active)] rounded-xl p-12 flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-mv-surface-secondary)] hover:border-[var(--color-mv-primary)] transition-all group"
            >
              <div className="w-14 h-14 bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)] rounded-xl flex items-center justify-center mb-4 group-hover:scale-105 transition-transform">
                <UploadCloud size={28} />
              </div>
              <h3 className="text-base font-semibold text-[var(--color-mv-text)] mb-1">Prüfungsseiten hier ablegen</h3>
              <p className="text-xs text-[var(--color-mv-text-tertiary)] text-center mb-4">oder klicken zum Auswählen (JPG, PNG)</p>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileUpload}
              />
              <button className="mv-btn-secondary text-xs">Dateien wählen</button>
            </div>

            {/* Image Preview */}
            {images.length > 0 && (
              <div className="space-y-5 animate-fade-in">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-medium text-[var(--color-mv-text)]">Ausgewählte Seiten ({images.length})</h4>
                  <button onClick={() => setImages([])} className="text-xs text-red-500 hover:underline">Alle löschen</button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {images.map((img, idx) => (
                    <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden border border-[var(--color-mv-active)] group">
                      <img src={img} alt={`Page ${idx + 1}`} className="w-full h-full object-cover" />
                      <button
                        onClick={() => removeImage(idx)}
                        className="absolute top-2 right-2 p-1.5 bg-white text-red-500 rounded-lg shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                      >
                        <X size={14} />
                      </button>
                      <div className="absolute bottom-2 left-2 bg-[var(--color-mv-text)]/80 text-white text-[10px] px-2 py-1 rounded-lg backdrop-blur-sm">
                        Seite {idx + 1}
                      </div>
                    </div>
                  ))}

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-[3/4] rounded-xl border-2 border-dashed border-[var(--color-mv-active)] flex items-center justify-center text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-primary)] hover:bg-[var(--color-mv-primary-light)] hover:border-[var(--color-mv-primary)] cursor-pointer transition-all"
                  >
                    <div className="text-center">
                      <span className="text-2xl font-semibold block mb-1">+</span>
                      <div className="text-xs">Mehr</div>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[var(--color-mv-text-tertiary)] mb-2">Anmerkungen (Optional)</label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="z.B. Bei Aufgabe 3 bin ich mir sicher, dass mein Weg richtig war..."
                    className="mv-input h-28 resize-none"
                  />
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={handleAnalyze}
                    disabled={loading}
                    className="mv-btn-primary flex items-center gap-2 disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
                    {loading ? 'Analysiere Prüfung...' : 'Analyse starten'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: OPTIMIZATION */}
        {activeTab === 'optimization' && result && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="bg-blue-50 rounded-xl p-5 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-white text-blue-600 rounded-xl flex items-center justify-center shrink-0">
                <AlertTriangle size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--color-mv-text)]">Potenzial gefunden!</h3>
                <p className="text-sm text-[var(--color-mv-text-secondary)] mt-1">
                  Unsere KI hat Aufgaben identifiziert, bei denen eine Anfechtung sinnvoll sein könnte.
                </p>
              </div>
            </div>
            <MarkdownRenderer content={result.optimization} />
            <div className="mt-8 flex justify-end">
              <button
                onClick={() => setActiveTab('deepdive')}
                className="mv-btn-primary flex items-center gap-2"
              >
                Weiter zur Themenvertiefung <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: DEEP DIVE */}
        {activeTab === 'deepdive' && result && (
          <div className="animate-fade-in max-w-4xl mx-auto">
            <div className="bg-emerald-50 rounded-xl p-5 mb-6 flex items-start gap-4">
              <div className="w-10 h-10 bg-white text-emerald-600 rounded-xl flex items-center justify-center shrink-0">
                <Brain size={20} />
              </div>
              <div>
                <h3 className="text-base font-semibold text-[var(--color-mv-text)]">Verstehe deine Fehler</h3>
                <p className="text-sm text-[var(--color-mv-text-secondary)] mt-1">
                  Detaillierte Analyse deiner Fehler mit korrekten Lösungswegen und neuen Übungen.
                </p>
              </div>
            </div>
            <MarkdownRenderer content={result.deepdive} />
          </div>
        )}
      </div>
    </div>
  );
};

export default ExamReview;
