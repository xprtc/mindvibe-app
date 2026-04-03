import React, { useState, useMemo, useRef, useEffect } from 'react';
import { 
  Calendar, CheckCircle2, Layout, MessageCircle, BookOpen, 
  GraduationCap, Calculator, ChevronRight, ChevronLeft, 
  RotateCw, Eye, EyeOff, Play, Download, Printer, 
  Edit3, Save, Share2, Brain, PieChart, Presentation, FileQuestion,
  MonitorPlay, FileText, GripVertical, Square, CheckSquare
} from 'lucide-react';

interface StudyContentRendererProps {
  content: string;
}

type SectionType = 'plan' | 'solutions_practice' | 'summary' | 'flashcards' | 'audio_script' | 'mock_exam' | 'quiz' | 'mindmap' | 'infographic' | 'presentation' | 'generic';

interface ParsedSection {
  type: SectionType;
  content: string;
}

const StudyContentRenderer: React.FC<StudyContentRendererProps> = ({ content }) => {
  const [activeTab, setActiveTab] = useState<SectionType | null>(null);
  const printRef = useRef<HTMLDivElement>(null);

  // Parse sections
  const sections = useMemo<ParsedSection[]>(() => {
    if (!content) return [];
    const parts = content.split(':::SECTION:');
    const parsed: ParsedSection[] = parts
      .filter(part => part.trim().length > 0)
      .map(part => {
        const firstLineEnd = part.indexOf(':::');
        if (firstLineEnd === -1) return { type: 'generic', content: part };
        const type = part.substring(0, firstLineEnd).trim() as SectionType;
        const text = part.substring(firstLineEnd + 3).trim();
        return { type, content: text };
      });
    if (parsed.length === 0 && content.length > 0) return [{ type: 'generic', content: content }];
    return parsed;
  }, [content]);

  React.useEffect(() => {
    if (sections.length > 0 && !activeTab) setActiveTab(sections[0].type);
  }, [sections, activeTab]);

  const handleExportPDF = () => {
    if (typeof window !== 'undefined' && (window as any).html2pdf) {
      const element = printRef.current;
      const opt = {
        margin: 10,
        filename: 'simply-lernen-paket.pdf',
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      };
      (window as any).html2pdf().set(opt).from(element).save();
    } else {
      window.print();
    }
  };

  const renderActiveSection = () => {
    const current = sections.find(s => s.type === activeTab);
    if (!current) return <div className="p-8 text-center text-slate-400">Wähle einen Bereich aus.</div>;

    switch (current.type) {
      case 'flashcards': return <FlashcardDeck content={current.content} />;
      case 'plan': return <TimelineView content={current.content} />;
      case 'audio_script':
      case 'summary': return <ChatScriptViewer content={current.content} />;
      case 'solutions_practice': return <PracticeView content={current.content} />;
      case 'quiz': return <QuizView content={current.content} />;
      case 'mindmap': return <MindmapView content={current.content} />;
      case 'infographic': return <InfographicView content={current.content} />;
      case 'presentation': return <PresentationView content={current.content} />;
      default: return <MarkdownView content={current.content} />;
    }
  };

  if (!content) return null;
  return (
    <div className="flex flex-col h-full bg-slate-50/30">
      {/* Action Bar */}
      <div className="bg-white border-b-2 border-slate-50 px-6 py-4 flex items-center justify-between sticky top-0 z-20 shadow-sm no-print">
         <div className="flex items-center overflow-x-auto gap-3 no-scrollbar max-w-[75%]">
            {sections.map((section) => (
              <button
                key={section.type}
                onClick={() => setActiveTab(section.type)}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap border-2 ${
                  activeTab === section.type 
                    ? 'bg-[var(--color-simply-dark)] text-white border-[var(--color-simply-dark)] shadow-lg shadow-slate-200' 
                    : 'bg-white text-slate-600 hover:text-[var(--color-simply-dark)] hover:border-slate-200 border-slate-50'
                }`}
              >
                {getIconForType(section.type)}
                {getLabelForType(section.type)}
              </button>
            ))}
         </div>
         <div className="flex items-center gap-3 pl-4 border-l-2 border-slate-50">
            <button className="p-3 hover:bg-slate-50 rounded-xl text-slate-300 hover:text-[var(--color-simply-dark)] transition-all active:scale-90" title="Bearbeiten">
               <Edit3 size={18} strokeWidth={3} />
            </button>
            <button onClick={handleExportPDF} className="p-3 hover:bg-slate-50 rounded-xl text-slate-300 hover:text-[var(--color-simply-blue)] transition-all active:scale-90" title="Als PDF speichern">
               <Download size={18} strokeWidth={3} />
            </button>
         </div>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-y-auto p-6 md:p-12 relative custom-scrollbar" ref={printRef}>
        <div className="max-w-4xl mx-auto print-break-inside animate-fade-in">
           {renderActiveSection()}
        </div>
      </div>
    </div>
  );

};

/* --- RENDERER COMPONENTS --- */

const TimelineView = ({ content }: { content: string }) => {
  interface PlanItem {
    id: number;
    text: string;
    type: 'phase' | 'task';
    done: boolean;
  }

  // Initial parse into state
  const [items, setItems] = useState<PlanItem[]>(() => {
    return content.split('\n')
      .filter(line => line.trim().length > 0)
      .map((line, idx) => ({
        id: idx,
        text: line.replace(/[*#]/g, '').trim(),
        type: (line.toLowerCase().includes('phase') || line.includes('###')) ? 'phase' : 'task',
        done: false
      }));
  });

  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent, index: number) => {
    setDraggedIndex(index);
    e.dataTransfer.effectAllowed = "move";
    // Optional: Set a custom drag image or style here
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault(); // Necessary to allow dropping
    if (draggedIndex === null || draggedIndex === index) return;
    
    // Reorder list
    const newItems = [...items];
    const draggedItem = newItems[draggedIndex];
    newItems.splice(draggedIndex, 1);
    newItems.splice(index, 0, draggedItem);
    
    setItems(newItems);
    setDraggedIndex(index);
  };

  const toggleDone = (id: number) => {
    setItems(prev => prev.map(item => 
      item.id === id ? { ...item, done: !item.done } : item
    ));
  };

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border-2 border-slate-50">
      <h3 className="text-xl font-black mb-10 flex items-center gap-4 uppercase tracking-tight text-[var(--color-simply-dark)]">
        <Calendar className="text-[var(--color-simply-blue)]" size={24} strokeWidth={3} />
        Dein Lernplan
      </h3>
      
      <div className="space-y-4">
        {items.map((item, index) => (
          <div 
            key={item.id}
            draggable
            onDragStart={(e) => handleDragStart(e, index)}
            onDragOver={(e) => handleDragOver(e, index)}
            onDragEnd={() => setDraggedIndex(null)}
            className={`
              relative flex items-start gap-4 p-5 rounded-2xl transition-all duration-300
              ${draggedIndex === index ? 'opacity-50 bg-slate-50 border-2 border-dashed border-slate-200' : 'bg-white border-2 border-transparent hover:border-slate-100 hover:shadow-md'}
              ${item.type === 'phase' ? 'mt-10 bg-slate-50 border-slate-100' : ''}
              group cursor-default
            `}
          >
             {/* Drag Handle */}
             <button 
                className="mt-1 text-slate-200 hover:text-slate-400 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity"
                title="Verschieben"
             >
               <GripVertical size={18} strokeWidth={3} />
             </button>

             {/* Checkbox (Task) or Icon (Phase) */}
             {item.type === 'task' ? (
                <button 
                  onClick={() => toggleDone(item.id)}
                  className={`mt-1 transition-colors ${item.done ? 'text-emerald-500' : 'text-slate-200 hover:text-[var(--color-simply-blue)]'}`}
                >
                  {item.done ? <CheckSquare size={20} strokeWidth={3} /> : <Square size={20} strokeWidth={3} />}
                </button>
             ) : (
                <div className="mt-1.5 w-4 h-4 rounded-full bg-[var(--color-simply-blue)] border-4 border-white ring-2 ring-blue-100 shadow-sm"></div>
             )}

             {/* Content */}
             <div 
                contentEditable 
                suppressContentEditableWarning
                className={`flex-1 outline-none text-[10px] font-black uppercase tracking-widest ${item.type === 'phase' ? 'text-[var(--color-simply-dark)] text-sm' : 'text-slate-800'} ${item.done ? 'line-through opacity-40' : ''}`}
             >
               {item.text}
             </div>
          </div>
        ))}
        
        {items.length === 0 && (
          <div className="text-center text-slate-400 italic py-4">
             Keine Plandaten gefunden.
          </div>
        )}
      </div>
    </div>
  );
};

const MindmapView = ({ content }: { content: string }) => {
  // Simple Indentation Parser
  const nodes = content.split('\n').filter(l => l.trim().length > 0).map((line, id) => {
    const trimmed = line.trim();
    const indent = line.search(/\S/) / 2; // Rough indent calc
    const label = trimmed.replace(/^[-*]\s*/, '');
    return { id, indent, label };
  });

  return (
    <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border-2 border-slate-50 overflow-x-auto">
      <div className="flex items-center gap-3 mb-10 text-[var(--color-simply-blue)] font-black uppercase text-[10px] tracking-[0.3em]">
        <Brain size={20} strokeWidth={3} /> Mindmap Visualisierung
      </div>
      <div className="space-y-4 min-w-[400px]">
        {nodes.map((node) => (
          <div key={node.id} className="flex items-center relative" style={{ marginLeft: `${node.indent * 60}px` }}>
            {node.indent > 0 && (
               <div className="absolute -left-[30px] top-1/2 w-[30px] h-0.5 bg-slate-100 rounded-full"></div>
            )}
            <div className={`
              px-6 py-4 rounded-2xl border-2 flex items-center gap-4 transition-all hover:scale-105 cursor-default shadow-sm
              ${node.indent === 0 ? 'bg-[var(--color-simply-dark)] text-white border-[var(--color-simply-dark)] shadow-xl text-sm font-black uppercase tracking-widest' : 
                node.indent === 1 ? 'bg-slate-50 text-[var(--color-simply-dark)] border-slate-100 font-black text-[10px] uppercase tracking-widest' : 
                'bg-white text-slate-700 border-slate-50 text-[8px] font-black uppercase tracking-widest'}
            `}>
              <div className={`w-2.5 h-2.5 rounded-full ${node.indent === 0 ? 'bg-[var(--color-simply-blue)]' : 'bg-slate-200'}`}></div>
              <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-white/10 px-1 rounded">{node.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const QuizView = ({ content }: { content: string }) => {
  // Parsing Format: Question: ... A) ... Correct: ...
  const questions = useMemo(() => {
     return content.split('---').filter(q => q.trim().length > 10).map((block) => {
       const lines = block.split('\n').map(l => l.trim());
       const qText = lines.find(l => l.startsWith('Question:'))?.replace('Question:', '').trim() || 'Frage?';
       const correctLine = lines.find(l => l.startsWith('Correct:'));
       const correctLetter = correctLine ? correctLine.replace('Correct:', '').trim().charAt(0) : 'A';
       const explanation = lines.find(l => l.startsWith('Explanation:'))?.replace('Explanation:', '').trim();
       
       const options = lines.filter(l => /^[A-D]\)/.test(l)).map(l => ({
         letter: l.charAt(0),
         text: l.substring(2).trim()
       }));
       
       return { qText, options, correctLetter, explanation };
     });
  }, [content]);

  const [activeIndex, setActiveIndex] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [showResult, setShowResult] = useState(false);

  if (questions.length === 0) return <MarkdownView content={content} />;
  const currentQ = questions[activeIndex];

  return (
    <div className="max-w-xl mx-auto">
      <div className="bg-white rounded-[2.5rem] border-2 border-slate-50 shadow-2xl overflow-hidden">
        <div className="bg-[var(--color-simply-dark)] p-10 text-white text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[var(--color-simply-blue)] opacity-10 blur-3xl -translate-y-1/2"></div>
          <div className="relative z-10">
            <div className="text-[8px] font-black opacity-50 uppercase tracking-[0.4em] mb-4">Frage {activeIndex + 1} / {questions.length}</div>
            <h3 className="text-xl font-black leading-tight uppercase tracking-tight">{currentQ.qText}</h3>
          </div>
        </div>
        
        <div className="p-8 space-y-4">
           {currentQ.options.map((opt) => {
             const isSelected = selected === opt.letter;
             const isCorrect = opt.letter === currentQ.correctLetter;
             let style = "border-slate-50 hover:border-slate-200 hover:bg-slate-50 text-[var(--color-simply-dark)]";
             
             if (showResult) {
               if (isCorrect) style = "bg-emerald-50 border-emerald-200 text-emerald-700";
               else if (isSelected && !isCorrect) style = "bg-red-50 border-red-100 text-red-600 opacity-60";
               else style = "opacity-40 border-transparent";
             } else if (isSelected) {
               style = "bg-[var(--color-simply-dark)] text-white border-[var(--color-simply-dark)] shadow-xl transform scale-105";
             }

             return (
               <button 
                 key={opt.letter}
                 onClick={() => !showResult && setSelected(opt.letter)}
                 className={`w-full p-6 rounded-2xl border-2 text-left transition-all font-black text-[10px] uppercase tracking-widest flex items-center justify-between group ${style}`}
               >
                 <span className="flex items-center gap-5">
                   <span className={`w-8 h-8 rounded-lg flex items-center justify-center text-[10px] transition-colors ${isSelected ? 'bg-white/20' : 'bg-slate-100 group-hover:bg-white'}`}>{opt.letter}</span>
                   <span className="flex-1">{opt.text}</span>
                 </span>
                 {showResult && isCorrect && <CheckCircle2 size={20} strokeWidth={3} className="text-emerald-500" />}
               </button>
             );
           })}
        </div>

        {showResult && currentQ.explanation && (
          <div className="px-8 pb-8 animate-fade-in">
             <div className="bg-blue-50 p-6 rounded-2xl text-[10px] font-black text-[var(--color-simply-blue)] border-2 border-blue-100 uppercase tracking-widest leading-relaxed">
               <span className="opacity-50">Erklärung:</span> {currentQ.explanation}
             </div>
          </div>
        )}

        <div className="p-6 border-t-2 border-slate-50 bg-slate-50/50 flex justify-between items-center">
           {!showResult ? (
             <button 
               onClick={() => setShowResult(true)}
               disabled={!selected}
               className="simply-button-primary w-full py-5 text-[10px] uppercase tracking-[0.3em] shadow-xl shadow-blue-100"
             >
               Prüfen
             </button>
           ) : (
             <button 
               onClick={() => {
                 if (activeIndex < questions.length - 1) {
                   setActiveIndex(prev => prev + 1);
                   setSelected(null);
                   setShowResult(false);
                 } else {
                   // Quiz finished
                 }
               }}
               className="simply-button-primary w-full py-5 text-[10px] uppercase tracking-[0.3em] flex items-center justify-center gap-4 shadow-xl shadow-blue-100"
             >
               Nächste Frage <ChevronRight size={20} strokeWidth={3}/>
             </button>
           )}
        </div>
      </div>
    </div>
  );
};

const PresentationView = ({ content }: { content: string }) => {
  const slides = content.split(/Slide \d+:/).filter(s => s.trim().length > 0);
  const [currentSlide, setCurrentSlide] = useState(0);

  if (slides.length === 0) return <MarkdownView content={content} />;

  const slideContent = slides[currentSlide];
  const titleMatch = slideContent.match(/Title:(.*)/);
  const title = titleMatch ? titleMatch[1].trim() : "Folie " + (currentSlide + 1);
  const body = slideContent.replace(/Title:.*\|?/, '').replace('Body:', '').trim();

  return (
    <div className="flex flex-col items-center">
      <div className="w-full aspect-video bg-white rounded-[3rem] border-4 border-slate-50 shadow-2xl p-16 flex flex-col relative overflow-hidden group">
         <div className="absolute top-0 right-0 p-10">
            <div className="w-20 h-20 bg-[var(--color-simply-blue)] rounded-full opacity-5 group-hover:scale-150 transition-transform duration-1000 blur-2xl"></div>
         </div>
         
         <div className="flex-1 flex flex-col justify-center relative z-10">
            <h2 contentEditable className="text-4xl font-black text-[var(--color-simply-dark)] mb-12 outline-none focus:border-b-4 border-[var(--color-simply-blue)] uppercase tracking-tight">{title}</h2>
            <div className="text-xl text-slate-700 space-y-6 leading-relaxed">
               {body.split(/[-*] /).filter(l => l.trim()).map((l, i) => (
                 <div key={i} className="flex items-start gap-5">
                   <div className="w-3 h-3 bg-[var(--color-simply-blue)] rounded-full mt-3 shadow-lg shadow-blue-100"></div>
                   <span contentEditable suppressContentEditableWarning className="outline-none focus:bg-slate-50 p-1 rounded font-black text-sm uppercase tracking-widest">{l.trim()}</span>
                 </div>
               ))}
            </div>
         </div>

         <div className="mt-auto pt-8 flex justify-between text-slate-300 text-[10px] font-black uppercase tracking-[0.3em] border-t-2 border-slate-50">
            <span>Simply Lernen Präsentation</span>
            <span className="text-[var(--color-simply-dark)]">{currentSlide + 1} / {slides.length}</span>
         </div>
      </div>

      <div className="flex items-center gap-8 mt-10">
        <button onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))} className="p-4 bg-white border-2 border-slate-50 rounded-2xl hover:bg-slate-50 text-slate-300 hover:text-[var(--color-simply-dark)] transition-all shadow-md active:scale-90">
           <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <div className="flex gap-3">
           {slides.map((_, i) => (
             <button 
              key={i} 
              onClick={() => setCurrentSlide(i)}
              className={`h-2 rounded-full transition-all duration-500 ${i === currentSlide ? 'bg-[var(--color-simply-blue)] w-10 shadow-lg shadow-blue-100' : 'bg-slate-200 w-2'}`}
             />
           ))}
        </div>
        <button onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))} className="p-4 bg-white border-2 border-slate-50 rounded-2xl hover:bg-slate-50 text-slate-300 hover:text-[var(--color-simply-dark)] transition-all shadow-md active:scale-90">
           <ChevronRight size={24} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

const InfographicView = ({ content }: { content: string }) => {
  const items = content.split('\n').filter(l => l.includes('|')).map(l => {
    const parts = l.split('|');
    return { icon: parts[0]?.trim(), title: parts[1]?.trim(), desc: parts[2]?.trim() };
  });

  return (
    <div className="bg-[var(--color-simply-dark)] p-10 rounded-[3rem] shadow-2xl text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-64 h-64 bg-[var(--color-simply-blue)] opacity-10 blur-[100px] -translate-y-1/2 translate-x-1/2"></div>
      
      <div className="flex items-center justify-between mb-12 relative z-10">
         <h2 className="text-2xl font-black flex items-center gap-4 uppercase tracking-tight">
           <PieChart className="text-[var(--color-simply-blue)]" size={28} strokeWidth={3} /> Key Facts
         </h2>
         <div className="text-[8px] font-black text-white/30 border-2 border-white/10 px-4 py-2 rounded-xl uppercase tracking-[0.3em]">Infografik</div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative z-10">
         {items.map((item, i) => (
           <div key={i} className="bg-white/5 p-8 rounded-[2rem] border-2 border-white/5 hover:bg-white/10 transition-all duration-500 backdrop-blur-sm flex items-start gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-[var(--color-simply-blue)] flex items-center justify-center text-[var(--color-simply-dark)] font-black text-xl shadow-xl shadow-blue-900/20 shrink-0 group-hover:scale-110 transition-transform">
                {item.icon ? item.icon.substring(0, 1) : i + 1}
              </div>
              <div>
                 <h3 contentEditable suppressContentEditableWarning className="font-black text-[10px] mb-2 outline-none uppercase tracking-widest text-white">{item.title}</h3>
                 <p contentEditable suppressContentEditableWarning className="text-slate-400 text-[8px] leading-relaxed outline-none uppercase tracking-widest font-black">{item.desc}</p>
              </div>
           </div>
         ))}
      </div>
    </div>
  );
};

const FlashcardDeck = ({ content }: { content: string }) => {
  // Parse: Q: Question | A: Answer
  const cards = useMemo(() => {
    return content.split('\n')
      .filter(line => line.includes('|'))
      .map(line => {
        const [q, a] = line.split('|');
        return { 
          q: q.replace('Q:', '').trim(), 
          a: a.replace('A:', '').trim() 
        };
      });
  }, [content]);

  const [index, setIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (cards.length === 0) return <MarkdownView content={content} />;

  const nextCard = () => {
    setIsFlipped(false);
    setTimeout(() => setIndex((prev) => (prev + 1) % cards.length), 150);
  };
  
  const prevCard = () => {
    setIsFlipped(false);
    setTimeout(() => setIndex((prev) => (prev - 1 + cards.length) % cards.length), 150);
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[450px]">
      <div className="w-full max-w-md perspective-1000 group">
        <div 
          onClick={() => setIsFlipped(!isFlipped)}
          className={`relative w-full h-72 bg-white rounded-[3rem] shadow-2xl cursor-pointer transition-all duration-700 transform-style-3d border-2 border-slate-50 hover:shadow-blue-100 ${isFlipped ? 'rotate-y-180' : ''}`}
          style={{ transformStyle: 'preserve-3d', transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)' }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-12 text-center">
            <span className="text-[8px] font-black text-[var(--color-simply-blue)] uppercase tracking-[0.4em] mb-6">Karte {index + 1} / {cards.length}</span>
            <p className="text-xl font-black text-[var(--color-simply-dark)] uppercase tracking-tight leading-tight">{cards[index].q}</p>
            <p className="text-[8px] font-black text-slate-300 mt-8 flex items-center gap-2 uppercase tracking-widest"><RotateCw size={14} strokeWidth={3}/> Klicken zum Drehen</p>
          </div>

          {/* Back */}
          <div className="absolute inset-0 backface-hidden flex flex-col items-center justify-center p-12 text-center bg-[var(--color-simply-dark)] text-white rounded-[3rem] rotate-y-180 border-4 border-[var(--color-simply-blue)]" style={{ transform: 'rotateY(180deg)' }}>
            <span className="text-[8px] font-black text-[var(--color-simply-blue)] uppercase tracking-[0.4em] mb-6">Lösung</span>
            <p className="text-lg font-black uppercase tracking-widest leading-relaxed">{cards[index].a}</p>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-10 mt-12">
        <button onClick={prevCard} className="p-5 rounded-2xl bg-white border-2 border-slate-50 shadow-lg hover:shadow-xl text-slate-300 hover:text-[var(--color-simply-dark)] transition-all active:scale-90">
          <ChevronLeft size={24} strokeWidth={3} />
        </button>
        <div className="flex gap-2">
          {cards.map((_, i) => (
             <div key={i} className={`h-2 rounded-full transition-all duration-500 ${i === index ? 'bg-[var(--color-simply-blue)] w-8 shadow-lg shadow-blue-100' : 'bg-slate-200 w-2'}`}></div>
          ))}
        </div>
        <button onClick={nextCard} className="p-5 rounded-2xl bg-white border-2 border-slate-50 shadow-lg hover:shadow-xl text-slate-300 hover:text-[var(--color-simply-dark)] transition-all active:scale-90">
          <ChevronRight size={24} strokeWidth={3} />
        </button>
      </div>
    </div>
  );
};

const ChatScriptViewer = ({ content }: { content: string }) => {
  const lines = content.split('\n').filter(l => l.trim().length > 0);
  return (
    <div className="bg-white rounded-[2.5rem] shadow-2xl border-2 border-slate-50 overflow-hidden max-w-xl mx-auto">
      <div className="bg-slate-50 p-6 border-b-2 border-slate-100 flex items-center gap-5">
         <div className="w-12 h-12 bg-[var(--color-simply-dark)] rounded-2xl flex items-center justify-center text-white shadow-lg">
           <Play size={24} fill="currentColor" strokeWidth={3} />
         </div>
         <div>
           <h4 className="font-black text-[var(--color-simply-dark)] uppercase tracking-widest text-[10px]">Audio-Guide</h4>
           <p className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Video- & Podcast-Skript</p>
         </div>
      </div>
      <div className="p-8 space-y-6 bg-slate-50/30">
        {lines.map((line, idx) => {
          const isHost = line.toLowerCase().startsWith('host') || line.toLowerCase().startsWith('moderator');
          const parts = line.split(':');
          const speaker = parts[0];
          const text = parts.slice(1).join(':');

          if (!text) return <div key={idx} className="text-center text-[8px] font-black text-slate-300 my-6 uppercase tracking-[0.4em]">{line}</div>;

          return (
            <div key={idx} className={`flex gap-4 ${isHost ? 'flex-row' : 'flex-row-reverse'}`}>
               <div className={`w-10 h-10 rounded-xl flex-shrink-0 flex items-center justify-center text-[10px] font-black shadow-sm border-2 border-white ${isHost ? 'bg-blue-50 text-[var(--color-simply-blue)]' : 'bg-[var(--color-simply-dark)] text-white'}`}>
                 {speaker.substring(0, 1).toUpperCase()}
               </div>
               <div className={`p-5 rounded-[1.5rem] max-w-[85%] text-[10px] font-black uppercase tracking-widest leading-relaxed ${isHost ? 'bg-white rounded-tl-none border-2 border-slate-50 text-slate-600 shadow-sm' : 'bg-[var(--color-simply-blue)] text-white rounded-tr-none shadow-xl shadow-blue-100'}`}>
                 <span className="block font-black text-[8px] opacity-50 mb-2">{speaker}</span>
                 <span contentEditable suppressContentEditableWarning className="outline-none">{text}</span>
               </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const PracticeView = ({ content }: { content: string }) => {
  const [showSolution, setShowSolution] = useState(false);
  return (
    <div className="space-y-8">
      <div className="bg-blue-50 p-6 rounded-2xl border-2 border-blue-100 text-[var(--color-simply-blue)] text-[10px] font-black uppercase tracking-widest flex items-start gap-5 shadow-sm">
        <Calculator className="shrink-0 mt-0.5" size={20} strokeWidth={3} />
        <div className="leading-relaxed">
          <span className="opacity-50">Anleitung:</span> Versuche erst die Aufgaben selbst zu lösen, bevor du dir die Lösungen ansiehst.
        </div>
      </div>
      <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border-2 border-slate-50 relative overflow-hidden">
        <MarkdownView content={content} />
        {content.toLowerCase().includes('lösung') && (
           <div className={`sticky bottom-0 left-0 right-0 pt-24 pb-6 flex justify-center transition-all ${showSolution ? 'bg-transparent' : 'bg-gradient-to-t from-white via-white to-transparent'}`}>
             <button 
               onClick={() => setShowSolution(!showSolution)}
               className="bg-[var(--color-simply-dark)] text-white px-10 py-4 rounded-2xl shadow-2xl hover:bg-[var(--color-simply-blue)] transition-all flex items-center gap-4 z-10 font-black text-[10px] uppercase tracking-widest active:scale-95"
             >
               {showSolution ? <EyeOff size={18} strokeWidth={3} /> : <Eye size={18} strokeWidth={3} />}
               {showSolution ? 'Lösungen verbergen' : 'Lösungen aufdecken'}
             </button>
           </div>
        )}
      </div>
    </div>
  );
};

const MarkdownView = ({ content }: { content: string }) => {
  const lines = content.split('\n');
  return (
    <div className="prose prose-slate max-w-none">
      {lines.map((line, i) => {
        if (line.startsWith('###')) return <h3 key={i} className="text-lg font-black text-[var(--color-simply-dark)] mt-10 mb-5 uppercase tracking-tight">{line.replace('###', '')}</h3>;
        if (line.startsWith('##')) return <h2 key={i} className="text-xl font-black text-[var(--color-simply-dark)] mt-12 mb-6 pb-4 border-b-2 border-slate-50 uppercase tracking-tight">{line.replace('##', '')}</h2>;
        if (line.startsWith('*') || line.startsWith('-')) return <li key={i} className="ml-6 text-slate-800 my-2 font-black text-[10px] uppercase tracking-widest list-none flex items-center gap-3">
          <div className="w-1.5 h-1.5 rounded-full bg-[var(--color-simply-blue)] shrink-0"></div>
          {line.replace(/[*|-]/, '').trim()}
        </li>;
        if (line.trim() === '') return <div key={i} className="h-4"></div>;
        return <p key={i} className="text-slate-800 leading-relaxed mb-4 font-black text-[10px] uppercase tracking-widest" contentEditable suppressContentEditableWarning>{line}</p>;
      })}
    </div>
  );
};

// --- Helpers ---

const getLabelForType = (type: SectionType) => {
  switch (type) {
    case 'plan': return 'Zeitplan';
    case 'solutions_practice': return 'Lösungen';
    case 'summary': return 'Zusammenfassung';
    case 'flashcards': return 'Karteikarten';
    case 'audio_script': return 'Video-Skript';
    case 'quiz': return 'Quiz';
    case 'mindmap': return 'Mindmap';
    case 'infographic': return 'Infografik';
    case 'presentation': return 'Präsentation';
    default: return 'Übersicht';
  }
};

const getIconForType = (type: SectionType) => {
  const size = 18;
  const stroke = 3;
  switch (type) {
    case 'plan': return <Calendar size={size} strokeWidth={stroke} className="text-[var(--color-simply-blue)]" />;
    case 'solutions_practice': return <CheckCircle2 size={size} strokeWidth={stroke} className="text-[var(--color-simply-blue)]" />;
    case 'summary': return <BookOpen size={size} strokeWidth={stroke} className="text-[var(--color-simply-blue)]" />;
    case 'flashcards': return <Layout size={size} strokeWidth={stroke} className="text-[var(--color-simply-blue)]" />;
    case 'audio_script': return <MonitorPlay size={size} strokeWidth={stroke} className="text-[var(--color-simply-blue)]" />;
    case 'quiz': return <FileQuestion size={size} strokeWidth={stroke} className="text-[var(--color-simply-blue)]" />;
    case 'mindmap': return <Brain size={size} strokeWidth={stroke} className="text-[var(--color-simply-blue)]" />;
    case 'infographic': return <PieChart size={size} strokeWidth={stroke} className="text-[var(--color-simply-blue)]" />;
    case 'presentation': return <Presentation size={size} strokeWidth={stroke} className="text-[var(--color-simply-blue)]" />;
    default: return <BookOpen size={size} strokeWidth={stroke} />;
  }
};

export default StudyContentRenderer;