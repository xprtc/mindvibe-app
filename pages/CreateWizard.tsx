import React, { useState, useRef } from 'react';
import {
  ArrowLeft, Calendar as CalendarIcon, UploadCloud, ChevronRight, Wand2, Check,
  Loader2, Link as LinkIcon, FileText, Plus, Trash2,
  Target, Mic, Layout, Presentation, Brain, FileSpreadsheet,
  MonitorPlay, PieChart, FileQuestion
} from 'lucide-react';
import { generateStudyPlan } from '../services/geminiService';
import StudyContentRenderer from '../components/StudyContentRenderer';
import { Exam } from '../types';
import { useSubscription, PLAN_LIMITS } from '../context/SubscriptionContext';

interface CreateWizardProps {
  onBack: () => void;
  onComplete: (exam: Exam) => void;
}

interface Material {
  id: string;
  type: 'text' | 'link' | 'file';
  value: string;
  name?: string;
}

interface ContentOption {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const CreateWizard: React.FC<CreateWizardProps> = ({ onBack, onComplete }) => {
  const { plan, canUseFeature, promptUpgrade } = useSubscription();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    subject: '',
    date: '2025-12-10',
    selectedContentTypes: [] as string[],
    generatedPlan: ''
  });

  const [materials, setMaterials] = useState<Material[]>([]);
  const [inputType, setInputType] = useState<'text' | 'link' | 'file'>('text');
  const [inputValue, setInputValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const contentOptions: ContentOption[] = [
    { id: 'summary', title: 'Audio-Zusammenfassung', description: 'Ein Podcast-Skript zum Anhören & Verstehen.', icon: <Mic size={20} className="text-[var(--color-mv-primary)]" /> },
    { id: 'plan', title: 'Videoübersicht (Skript)', description: 'Ein visuelles Skript für ein Erklärvideo.', icon: <MonitorPlay size={20} className="text-[var(--color-mv-primary)]" /> },
    { id: 'mindmap', title: 'Mindmap', description: 'Strukturierte visuelle Übersicht der Zusammenhänge.', icon: <Brain size={20} className="text-[var(--color-mv-primary)]" /> },
    { id: 'solutions_practice', title: 'Berichte & Lösungen', description: 'Detaillierte Rechenwege und Analysen.', icon: <FileSpreadsheet size={20} className="text-[var(--color-mv-primary)]" /> },
    { id: 'flashcards', title: 'Karteikarten', description: 'Klassisches Active Recall Training.', icon: <Layout size={20} className="text-[var(--color-mv-primary)]" /> },
    { id: 'quiz', title: 'Interaktives Quiz', description: 'Teste dein Wissen direkt in der App.', icon: <FileQuestion size={20} className="text-[var(--color-mv-primary)]" /> },
    { id: 'infographic', title: 'Infografik', description: 'Visuelle Faktenkarten für das Gedächtnis.', icon: <PieChart size={20} className="text-[var(--color-mv-primary)]" /> },
    { id: 'presentation', title: 'Präsentation', description: 'Folien für Referate oder Zusammenfassungen.', icon: <Presentation size={20} className="text-[var(--color-mv-primary)]" /> }
  ];

  const contentFeatureMap: Record<string, string> = {
    summary: 'audio', plan: 'video', mindmap: 'mindmap',
    solutions_practice: 'solutions', infographic: 'infographic', presentation: 'presentation',
    flashcards: 'flashcards', quiz: 'quiz',
  };

  const toggleContentOption = (id: string) => {
    const featureKey = contentFeatureMap[id];
    if (featureKey && !canUseFeature(featureKey)) {
      promptUpgrade(`"${contentOptions.find(o => o.id === id)?.title}" ist ab dem Smart-Plan verfügbar.`);
      return;
    }
    setFormData(prev => {
      const exists = prev.selectedContentTypes.includes(id);
      if (exists) {
        return { ...prev, selectedContentTypes: prev.selectedContentTypes.filter(type => type !== id) };
      } else {
        return { ...prev, selectedContentTypes: [...prev.selectedContentTypes, id] };
      }
    });
  };

  const addMaterial = () => {
    if (!inputValue.trim() && inputType !== 'file') return;
    const newMaterial: Material = {
      id: Date.now().toString(),
      type: inputType,
      value: inputValue,
      name: inputType === 'link' ? inputValue : undefined
    };
    setMaterials(prev => [...prev, newMaterial]);
    setInputValue('');
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const newMaterial: Material = {
        id: Date.now().toString(),
        type: 'file',
        value: file.name,
        name: file.name
      };
      setMaterials(prev => [...prev, newMaterial]);
      e.target.value = '';
    }
  };

  const removeMaterial = (id: string) => {
    setMaterials(prev => prev.filter(m => m.id !== id));
  };

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const combinedTopics = materials
        .map(m => `${m.type.toUpperCase()}: ${m.value}`)
        .join('\n');
      const plan = await generateStudyPlan(
        formData.subject, formData.title, formData.date, combinedTopics, formData.selectedContentTypes
      );
      setFormData(prev => ({ ...prev, generatedPlan: plan }));
      setStep(3);
    } catch (e) {
      console.error(e);
      setFormData(prev => ({ ...prev, generatedPlan: "Fehler bei der Generierung. Bitte versuche es erneut." }));
      setStep(3);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAndExit = () => {
    const newExam: Exam = {
      id: Date.now().toString(),
      title: formData.title,
      subject: formData.subject,
      date: formData.date,
      status: 'upcoming',
      content: formData.generatedPlan
    };
    onComplete(newExam);
  };

  return (
    <div className="p-5 md:p-8 max-w-[1200px] mx-auto space-y-6 animate-fade-in pb-24">

      {/* Header */}
      <div className="flex items-center gap-4 mb-2">
        <button onClick={onBack} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-[var(--color-mv-hover)] text-[var(--color-mv-text-tertiary)] transition-colors">
          <ArrowLeft size={20} />
        </button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-[var(--color-mv-text)]">Prüfung einrichten</h1>
          <div className="flex items-center gap-3 mt-2">
            <div className="flex gap-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 w-8 rounded-full transition-all ${step >= i ? 'bg-[var(--color-mv-primary)]' : 'bg-[var(--color-mv-active)]'}`} />
              ))}
            </div>
            <span className="text-xs text-[var(--color-mv-text-tertiary)]">
              Schritt {step} / 3: {step === 1 ? 'Material' : step === 2 ? 'KI-Module' : 'Fertig'}
            </span>
          </div>
        </div>
      </div>

      {/* Step 1: Basic Info & Materials */}
      {step === 1 && (
        <div className="animate-fade-in grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Left: Basisdaten */}
          <div className="mv-card p-6 space-y-6">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-mv-text)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--color-mv-surface-secondary)] flex items-center justify-center text-xs font-semibold text-[var(--color-mv-text-secondary)]">01</div>
                Basisdaten
              </h3>
              <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-1 ml-11">Worum geht es in dieser Prüfung?</p>
            </div>

            <div className="space-y-5">
              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--color-mv-text-tertiary)]">Titel der Prüfung *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="z.B. Mathe-Abschlussprüfung"
                  className="mv-input"
                />
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--color-mv-text-tertiary)]">Fach *</label>
                <select
                  value={formData.subject}
                  onChange={(e) => setFormData({...formData, subject: e.target.value})}
                  className="mv-input appearance-none cursor-pointer"
                >
                  <option value="">Fach wählen</option>
                  <option value="Mathematik">Mathematik</option>
                  <option value="Deutsch">Deutsch</option>
                  <option value="Englisch">Englisch</option>
                  <option value="Informatik">Informatik</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-medium text-[var(--color-mv-text-tertiary)]">Prüfungsdatum *</label>
                <div className="relative">
                  <CalendarIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mv-text-tertiary)]" size={16} />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({...formData, date: e.target.value})}
                    className="mv-input pl-11"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Lernmaterial */}
          <div className="mv-card p-6 space-y-6 flex flex-col">
            <div>
              <h3 className="text-base font-semibold text-[var(--color-mv-text)] flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[var(--color-mv-surface-secondary)] flex items-center justify-center text-xs font-semibold text-[var(--color-mv-text-secondary)]">02</div>
                Lernmaterial
              </h3>
              <p className="text-xs text-[var(--color-mv-text-tertiary)] mt-1 ml-11">Was möchtest du lernen? Füge alles hier hinzu.</p>
            </div>

            {/* Input Tabs + Area */}
            <div className="bg-[var(--color-mv-surface-secondary)] p-5 rounded-xl space-y-4">
              {/* Tabs */}
              <div className="flex bg-[var(--color-mv-surface)] p-1 rounded-xl">
                {(['text', 'link', 'file'] as const).map(type => (
                  <button
                    key={type}
                    onClick={() => setInputType(type)}
                    className={`flex-1 py-2.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-2 ${
                      inputType === type ? 'bg-[var(--color-mv-text)] text-white shadow-sm' : 'text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)]'
                    }`}
                  >
                    {type === 'text' && <><Target size={14} /> Text</>}
                    {type === 'link' && <><LinkIcon size={14} /> Link</>}
                    {type === 'file' && <><FileText size={14} /> Datei</>}
                  </button>
                ))}
              </div>

              {/* Input Fields */}
              {inputType === 'text' && (
                <textarea
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Kopiere hier deine Lernziele oder Themenliste rein..."
                  className="mv-input h-28 resize-none"
                />
              )}

              {inputType === 'link' && (
                <input
                  type="url"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="https://..."
                  className="mv-input"
                />
              )}

              {inputType === 'file' && (
                <div
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-28 border-2 border-dashed border-[var(--color-mv-active)] rounded-xl flex flex-col items-center justify-center cursor-pointer hover:bg-[var(--color-mv-surface)] hover:border-[var(--color-mv-primary)] transition-all group"
                >
                  <UploadCloud className="text-[var(--color-mv-text-tertiary)] mb-2 group-hover:text-[var(--color-mv-primary)] transition-colors" size={24} />
                  <span className="text-xs text-[var(--color-mv-text-tertiary)]">Datei auswählen</span>
                  <input ref={fileInputRef} type="file" className="hidden" onChange={handleFileUpload} />
                </div>
              )}

              {inputType !== 'file' && (
                <button
                  onClick={addMaterial}
                  disabled={!inputValue.trim()}
                  className="mv-btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus size={16} /> Hinzufügen
                </button>
              )}
            </div>

            {/* Material List */}
            <div className="flex-1 overflow-y-auto space-y-2 min-h-[100px]">
              {materials.length === 0 ? (
                <div className="text-center text-[var(--color-mv-text-tertiary)] text-xs py-8 border-2 border-dashed border-[var(--color-mv-active)] rounded-xl bg-[var(--color-mv-surface-secondary)]">
                  Noch keine Inhalte hinzugefügt.
                </div>
              ) : (
                materials.map((item) => (
                  <div key={item.id} className="flex items-center justify-between px-4 py-3 bg-[var(--color-mv-surface-secondary)] rounded-xl group hover:bg-[var(--color-mv-hover)] transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                        item.type === 'text' ? 'bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)]' :
                        item.type === 'link' ? 'bg-[var(--color-mv-surface)] text-[var(--color-mv-text-secondary)]' :
                        'bg-[var(--color-mv-text)] text-white'
                      }`}>
                        {item.type === 'text' && <Target size={16} />}
                        {item.type === 'link' && <LinkIcon size={16} />}
                        {item.type === 'file' && <FileText size={16} />}
                      </div>
                      <span className="text-sm text-[var(--color-mv-text)] truncate">{item.value}</span>
                    </div>
                    <button
                      onClick={() => removeMaterial(item.id)}
                      className="p-2 text-[var(--color-mv-text-tertiary)] hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Content Selection */}
      {step === 2 && (
        <div className="animate-fade-in space-y-6">
          <div className="text-center mb-2">
            <h3 className="text-xl font-bold text-[var(--color-mv-text)] flex items-center justify-center gap-3">
              <Wand2 className="text-[var(--color-mv-primary)]" size={22} /> KI-Konfigurator
            </h3>
            <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1">Was soll Simply Lernen für dich erstellen? Wähle deine Module.</p>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {contentOptions.map((option) => {
              const isSelected = formData.selectedContentTypes.includes(option.id);
              return (
                <div
                  key={option.id}
                  onClick={() => toggleContentOption(option.id)}
                  className={`cursor-pointer mv-card p-5 transition-all relative group ${
                    isSelected
                      ? 'ring-2 ring-[var(--color-mv-primary)] bg-[var(--color-mv-primary-light)]'
                      : 'hover:shadow-md'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 bg-[var(--color-mv-primary)] text-white rounded-lg p-1">
                      <Check size={12} strokeWidth={3} />
                    </div>
                  )}
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 transition-all ${
                    isSelected ? 'bg-white shadow-sm' : 'bg-[var(--color-mv-surface-secondary)] group-hover:scale-105'
                  }`}>
                    {option.icon}
                  </div>
                  <h4 className={`text-sm font-semibold mb-1 ${isSelected ? 'text-[var(--color-mv-primary)]' : 'text-[var(--color-mv-text)]'}`}>
                    {option.title}
                  </h4>
                  <p className="text-xs text-[var(--color-mv-text-tertiary)] leading-relaxed">{option.description}</p>
                </div>
              );
            })}
          </div>

          {/* Status */}
          <div className="mv-card p-4 flex items-center gap-4 max-w-lg mx-auto">
            <div className="w-9 h-9 rounded-xl bg-[var(--color-mv-primary-light)] flex items-center justify-center shrink-0">
              <Loader2 size={18} className="text-[var(--color-mv-primary)] animate-spin" />
            </div>
            <p className="text-sm text-[var(--color-mv-text-secondary)]">
              <span className="font-medium text-[var(--color-mv-primary)]">Status:</span> Wir analysieren deine {materials.length} Quellen und erstellen interaktive Inhalte für dich.
            </p>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 3 && (
        <div className="animate-fade-in space-y-6">
          <div className="text-center">
            <span className="inline-flex items-center gap-2 bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)] px-4 py-2 rounded-xl text-xs font-medium mb-4">
              <Check size={14} /> Fertiggestellt
            </span>
            <h3 className="text-xl font-bold text-[var(--color-mv-text)]">
              Dein Lern-Paket für <span className="text-[var(--color-mv-primary)]">{formData.title}</span>
            </h3>
            <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1">Alles bereit für deinen Lernerfolg. Viel Erfolg bei der Prüfung!</p>
          </div>

          <div className="mv-card p-6 min-h-[300px] overflow-y-auto">
            <StudyContentRenderer content={formData.generatedPlan} />
          </div>

          <div className="flex justify-center gap-4">
            <button onClick={onBack} className="mv-btn-secondary">
              Zurück
            </button>
            <button onClick={handleSaveAndExit} className="mv-btn-primary">
              Alles speichern
            </button>
          </div>
        </div>
      )}

      {/* Footer Navigation */}
      {step < 3 && (
        <div className="flex justify-end">
          {step === 1 ? (
            <button
              onClick={() => setStep(2)}
              disabled={!formData.title || !formData.subject || materials.length === 0}
              className="mv-btn-primary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Weiter zu Schritt 2 <ChevronRight size={16} />
            </button>
          ) : (
            <button
              onClick={handleGenerate}
              disabled={loading || formData.selectedContentTypes.length === 0}
              className="mv-btn-primary flex items-center gap-2 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              {loading ? <Loader2 className="animate-spin" size={16} /> : <Wand2 size={16} />}
              {loading ? 'Generiere Inhalte...' : 'Generieren starten'}
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default CreateWizard;
