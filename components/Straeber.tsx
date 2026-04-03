import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X, Mic, MicOff, Send, Minimize2, Sparkles,
  Plus, BookOpen, TrendingUp, Calendar, CheckCircle,
  Target, Zap, Flame, Award, Users, CreditCard,
  HelpCircle, Lightbulb, Layers, Upload, Star, Home,
  ChevronDown, RotateCcw, ArrowRight,
} from 'lucide-react';
import { useEinstein, type EinsteinMessage, type QuickAction } from '../context/EinsteinContext';
import { chatWithEinstein } from '../services/geminiService';
import { getDemoReply } from '../services/demoChat';
import { useSession } from '../context/SessionContext';
import type { ChatMessage } from '../types';

/* ------------------------------------------------------------------ */
/*  ICON MAP — maps string names to lucide components                  */
/* ------------------------------------------------------------------ */

const ICON_MAP: Record<string, React.FC<{ size?: number }>> = {
  Plus, BookOpen, TrendingUp, Calendar, CheckCircle,
  Target, Zap, Flame, Award, Users, CreditCard,
  HelpCircle, Lightbulb, Layers, Upload, Star, Home,
  Sparkles, ArrowRight,
};

function IconByName({ name, size = 14 }: { name: string; size?: number }) {
  const Icon = ICON_MAP[name] || Sparkles;
  return <Icon size={size} />;
}

/* ------------------------------------------------------------------ */
/*  EINSTEIN FACE — iconic tongue-out silhouette                       */
/* ------------------------------------------------------------------ */

const EinsteinFace = ({ isSpeaking, isListening, className = "", size = 'lg' }: {
  isSpeaking: boolean; isListening: boolean; className?: string; size?: 'sm' | 'lg';
}) => {
  const dim = size === 'sm' ? 'w-12 h-12' : 'w-24 h-24';
  return (
    <div className={`relative ${dim} transition-transform duration-300 ${className}`}>
      <div className="absolute inset-0 z-10">
        <svg viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full drop-shadow-lg">
          <ellipse cx="60" cy="56" rx="38" ry="42" fill="#ffe0bd" stroke="#1e293b" strokeWidth="2.5" />
          <path d="M22 48 C18 30, 28 12, 42 10 C46 9, 50 8, 55 8 C60 7, 68 7, 74 10 C88 16, 100 30, 96 50" fill="#d1d5db" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M26 38 C18 32, 14 22, 20 16" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M30 28 C24 18, 26 10, 34 8" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M94 40 C100 34, 104 24, 98 18" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M88 30 C96 20, 94 12, 86 8" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M50 10 C48 2, 54 0, 58 4" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M66 10 C68 2, 74 0, 72 6" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="none" />
          <path d="M38 30 Q 60 26, 82 30" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
          <path d="M40 35 Q 60 31, 80 35" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.3" />
          <path d="M36 42 C40 38, 48 38, 52 41" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
          <path d="M68 41 C72 38, 80 38, 84 42" stroke="#1e293b" strokeWidth="3" strokeLinecap="round" fill="none" />
          <ellipse cx="44" cy="50" rx="5" ry="4" fill="#1e293b" />
          <ellipse cx="76" cy="50" rx="5" ry="4" fill="#1e293b" />
          <circle cx="46" cy="49" r="1.5" fill="white" />
          <circle cx="78" cy="49" r="1.5" fill="white" />
          <path d="M34 50 C32 48, 31 52, 33 53" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
          <path d="M86 50 C88 48, 89 52, 87 53" stroke="#1e293b" strokeWidth="1" strokeLinecap="round" fill="none" opacity="0.4" />
          <path d="M58 48 C56 56, 52 62, 56 64 C58 65, 62 65, 64 64 C68 62, 64 56, 62 48" stroke="#1e293b" strokeWidth="1.8" strokeLinecap="round" fill="none" />
          <path d="M44 70 C48 66, 56 66, 60 68 C64 66, 72 66, 76 70" stroke="#1e293b" strokeWidth="2.5" strokeLinecap="round" fill="none" />
          <path d="M44 72 C48 80, 56 84, 60 84 C64 84, 72 80, 76 72" stroke="#1e293b" strokeWidth="2" strokeLinecap="round" fill="#fff" />
          <ellipse cx="60" cy={isSpeaking ? "90" : "88"} rx="10" ry={isSpeaking ? "10" : "8"} fill="#f87171" stroke="#1e293b" strokeWidth="1.8">
            {isSpeaking && <animate attributeName="ry" values="8;10;8" dur="0.4s" repeatCount="indefinite" />}
          </ellipse>
          <path d="M57 86 L57 92" stroke="#dc2626" strokeWidth="1" strokeLinecap="round" opacity="0.5" />
          <path d="M42 60 C40 66, 42 72, 44 72" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.3" />
          <path d="M78 60 C80 66, 78 72, 76 72" stroke="#1e293b" strokeWidth="1.2" strokeLinecap="round" fill="none" opacity="0.3" />
          <ellipse cx="22" cy="54" rx="5" ry="8" fill="#ffe0bd" stroke="#1e293b" strokeWidth="2" />
          <ellipse cx="98" cy="54" rx="5" ry="8" fill="#ffe0bd" stroke="#1e293b" strokeWidth="2" />
        </svg>
      </div>
      {isListening && <div className="absolute -inset-3 border-2 border-[var(--color-mv-primary)]/30 rounded-full animate-ping z-0" />}
      {isSpeaking && <div className="absolute -inset-2 bg-[var(--color-mv-primary)] rounded-full opacity-15 animate-pulse z-0" />}
    </div>
  );
};

/* ------------------------------------------------------------------ */
/*  QUICK ACTION CHIP                                                  */
/* ------------------------------------------------------------------ */

function QuickActionChip({ qa, onClick }: { qa: QuickAction; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[var(--color-mv-surface-secondary)] hover:bg-[var(--color-mv-hover)] text-[var(--color-mv-text-secondary)] text-xs font-medium transition-colors whitespace-nowrap"
    >
      <IconByName name={qa.icon} size={12} />
      {qa.label}
    </button>
  );
}

/* ------------------------------------------------------------------ */
/*  MARKDOWN-ISH TEXT RENDERER                                         */
/* ------------------------------------------------------------------ */

function Boldish({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-semibold">{p.slice(2, -2)}</strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  EINSTEIN CONCIERGE — the main component                           */
/* ------------------------------------------------------------------ */

const Einstein: React.FC = () => {
  const {
    isOpen, open, close, toggle,
    pageMeta, currentPage,
    navigateTo, dispatchAction,
    messages, addMessage, clearMessages,
    proactiveHint, setProactiveHint,
  } = useEinstein();

  const { user } = useSession();
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [showTip, setShowTip] = useState(false);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [showAttachMenu, setShowAttachMenu] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  // Auto-scroll
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 200);
    }
  }, [isOpen]);

  // Speaking animation on model replies
  useEffect(() => {
    const last = messages[messages.length - 1];
    if (last?.role === 'einstein') {
      setIsSpeaking(true);
      const t = setTimeout(() => setIsSpeaking(false), 2500);
      return () => clearTimeout(t);
    }
  }, [messages]);

  // Show proactive tip after 5s on new page (if no messages)
  useEffect(() => {
    if (messages.length > 0 || isOpen) return;
    const t = setTimeout(() => {
      const tip = pageMeta.tips[Math.floor(Math.random() * pageMeta.tips.length)];
      setProactiveHint(tip);
      setShowTip(true);
      // Auto-hide after 6s
      setTimeout(() => setShowTip(false), 6000);
    }, 5000);
    return () => clearTimeout(t);
  }, [currentPage, pageMeta, messages.length, isOpen, setProactiveHint]);

  // Voice recording
  const toggleRecording = useCallback(async () => {
    if (isRecording && mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      const chunks: Blob[] = [];
      recorder.ondataavailable = (e) => chunks.push(e.data);
      recorder.onstop = () => {
        stream.getTracks().forEach((t) => t.stop());
        // For now, add a note that voice was recorded
        const blob = new Blob(chunks, { type: 'audio/webm' });
        addMessage({
          id: `u-${Date.now()}`,
          role: 'user',
          text: '🎤 Sprachnachricht gesendet',
          timestamp: new Date(),
        });
        addMessage({
          id: `e-${Date.now()}`,
          role: 'einstein',
          text: 'Ich habe deine Sprachnachricht erhalten! Für vollständige Sprachinteraktion nutze den Voice-Modus über das Mikrofon-Symbol im Header.',
          timestamp: new Date(),
        });
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Mic error:', err);
    }
  }, [isRecording, addMessage]);

  // File attachment
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    setAttachments((prev) => [...prev, ...Array.from(files)]);
    setShowAttachMenu(false);
  }, []);

  const removeAttachment = useCallback((idx: number) => {
    setAttachments((prev) => prev.filter((_, i) => i !== idx));
  }, []);

  // Handle quick action — might be a direct app action or a chat prompt
  const handleQuickAction = useCallback((qa: QuickAction) => {
    if (qa.action) {
      const [type, target] = qa.action.split(':');
      if (type === 'navigate' && target) {
        navigateTo(target);
        close();
        return;
      }
    }
    // Otherwise, send as chat message
    handleSend(qa.prompt);
  }, [navigateTo, close]);

  // Send message to Einstein
  const handleSend = useCallback(async (text?: string) => {
    const msg = (text || input).trim();
    const hasAttach = attachments.length > 0;
    if ((!msg && !hasAttach) || loading) return;
    if (!text) setInput('');

    // Build display text with attachment info
    const attachInfo = hasAttach
      ? `\n📎 ${attachments.map(f => f.name).join(', ')}`
      : '';
    const displayText = (msg || 'Datei gesendet') + attachInfo;

    // Clear attachments after sending
    if (hasAttach) setAttachments([]);

    const userMsg: EinsteinMessage = {
      id: `u-${Date.now()}`,
      role: 'user',
      text: displayText,
      timestamp: new Date(),
    };
    addMessage(userMsg);
    setLoading(true);

    try {
      // Build chat history for Gemini
      const history: ChatMessage[] = messages.map((m) => ({
        id: m.id,
        role: m.role === 'user' ? 'user' : 'model',
        text: m.text,
        timestamp: m.timestamp,
      }));

      // Enhanced system context — prepend page info
      const contextPrefix = `[KONTEXT: Der Nutzer ist auf der Seite "${pageMeta.label}" (${pageMeta.pageId}). Verfügbare Aktionen: ${pageMeta.quickActions.map(q => q.label).join(', ')}. Antworte kontextbezogen.]`;
      const enrichedMessage = `${contextPrefix}\n\nNutzer: ${msg}`;

      if (!user) {
        // Demo mode
        await new Promise((r) => setTimeout(r, 400));
        const reply = getDemoReply(msg);
        addMessage({
          id: `e-${Date.now()}`,
          role: 'einstein',
          text: reply,
          timestamp: new Date(),
        });
      } else {
        const modelMsg = await chatWithEinstein(history, enrichedMessage);

        // Check if Einstein triggered an action
        let action = undefined;
        let quickReplies: string[] | undefined = undefined;

        if (modelMsg.action?.type === 'create_exam') {
          action = { type: 'create_exam' as const, payload: modelMsg.action.data };
        }

        // Parse navigation hints from response
        const navMatch = modelMsg.text.match(/\[NAVIGATE:(\w+)\]/);
        if (navMatch) {
          navigateTo(navMatch[1]);
          modelMsg.text = modelMsg.text.replace(/\[NAVIGATE:\w+\]/, '').trim();
        }

        addMessage({
          id: `e-${Date.now()}`,
          role: 'einstein',
          text: modelMsg.text,
          timestamp: new Date(),
          action,
          quickReplies,
        });

        // Dispatch action if present
        if (action) {
          dispatchAction(action);
        }
      }
    } catch (err) {
      addMessage({
        id: `e-${Date.now()}`,
        role: 'einstein',
        text: 'Ups, da ist etwas schiefgelaufen. Versuch es nochmal!',
        timestamp: new Date(),
      });
    } finally {
      setLoading(false);
    }
  }, [input, loading, messages, pageMeta, user, addMessage, navigateTo, dispatchAction]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const hasMessages = messages.length > 0;

  return (
    <>
      <style>{`
        @keyframes float { 0% { transform: translateY(0px); } 50% { transform: translateY(-6px); } 100% { transform: translateY(0px); } }
        .animate-float { animation: float 4s ease-in-out infinite; }
        @keyframes slide-up { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-up { animation: slide-up 0.25s ease-out; }
        @keyframes hint-pop { from { opacity: 0; transform: scale(0.9) translateY(4px); } to { opacity: 1; transform: scale(1) translateY(0); } }
        .animate-hint { animation: hint-pop 0.3s ease-out; }
      `}</style>

      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end">

        {/* ── CONCIERGE PANEL ── */}
        {isOpen && (
          <div className="bg-[var(--color-mv-surface)] w-[360px] max-w-[calc(100vw-48px)] rounded-2xl shadow-lg overflow-hidden mb-3 animate-slide-up flex flex-col" style={{ height: 'min(520px, calc(100dvh - 120px))' }}>

            {/* Header */}
            <div className="px-4 py-3 flex items-center gap-3 border-b border-[var(--color-mv-active)] bg-[var(--color-mv-surface)] shrink-0">
              <EinsteinFace isSpeaking={isSpeaking} isListening={loading} size="sm" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-[var(--color-mv-text)] leading-tight">Einstein</h3>
                <p className="text-[10px] text-[var(--color-mv-text-tertiary)] truncate">
                  {loading ? 'Denkt nach...' : `Dein Mentor \u00b7 ${pageMeta.label}`}
                </p>
              </div>
              <div className="flex items-center gap-1">
                {hasMessages && (
                  <button
                    type="button"
                    onClick={() => { clearMessages(); }}
                    className="p-1.5 rounded-lg text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)] transition-colors"
                    title="Neuer Chat"
                  >
                    <RotateCcw size={14} />
                  </button>
                )}
                <button
                  type="button"
                  onClick={close}
                  className="p-1.5 rounded-lg text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)] transition-colors"
                >
                  <ChevronDown size={16} />
                </button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto px-4 py-3">
              {!hasMessages ? (
                /* Welcome state with quick actions */
                <div className="flex flex-col items-center text-center pt-4 animate-fade-in">
                  <EinsteinFace isSpeaking={false} isListening={false} size="lg" className="mb-4" />
                  <h4 className="text-base font-semibold text-[var(--color-mv-text)] mb-1">
                    {pageMeta.greeting}
                  </h4>
                  <p className="text-xs text-[var(--color-mv-text-tertiary)] mb-5 px-4 leading-relaxed">
                    Dein KI-Lerncoach, Mentor und pers\u00f6nlicher Assistent. Frag mich etwas oder w\u00e4hle eine Aktion!
                  </p>

                  {/* Quick Actions */}
                  <div className="flex flex-wrap justify-center gap-2 px-2">
                    {pageMeta.quickActions.map((qa, i) => (
                      <QuickActionChip key={i} qa={qa} onClick={() => handleQuickAction(qa)} />
                    ))}
                  </div>
                </div>
              ) : (
                /* Chat messages */
                <div className="space-y-3">
                  {messages.map((m) => (
                    <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[85%] rounded-xl px-3 py-2 text-[13px] leading-relaxed ${
                        m.role === 'user'
                          ? 'bg-[var(--color-mv-text)] text-white rounded-br-sm'
                          : 'bg-[var(--color-mv-bg)] text-[var(--color-mv-text)] rounded-bl-sm'
                      }`}>
                        <p className="whitespace-pre-wrap"><Boldish text={m.text} /></p>
                        {m.action && (
                          <div className="mt-2 pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] opacity-80">
                            <Sparkles size={10} />
                            <span>Aktion wird ausgef\u00fchrt...</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}

                  {loading && (
                    <div className="flex justify-start">
                      <div className="bg-[var(--color-mv-bg)] rounded-xl px-3 py-2 text-[13px] text-[var(--color-mv-text-tertiary)]">
                        <div className="flex items-center gap-1.5">
                          <div className="flex gap-0.5">
                            <span className="w-1.5 h-1.5 bg-[var(--color-mv-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                            <span className="w-1.5 h-1.5 bg-[var(--color-mv-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                            <span className="w-1.5 h-1.5 bg-[var(--color-mv-text-tertiary)] rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                          </div>
                          <span className="text-[11px]">Einstein denkt nach...</span>
                        </div>
                      </div>
                    </div>
                  )}

                  <div ref={bottomRef} />
                </div>
              )}

              {/* In-chat quick actions after messages */}
              {hasMessages && !loading && (
                <div className="flex flex-wrap gap-1.5 mt-3 pt-3 border-t border-[var(--color-mv-active)]">
                  {pageMeta.quickActions.slice(0, 3).map((qa, i) => (
                    <QuickActionChip key={i} qa={qa} onClick={() => handleQuickAction(qa)} />
                  ))}
                </div>
              )}
            </div>

            {/* Input */}
            <div className="px-3 py-2.5 border-t border-[var(--color-mv-active)] bg-[var(--color-mv-surface)] shrink-0">

              {/* Attachment previews */}
              {attachments.length > 0 && (
                <div className="flex gap-2 mb-2 overflow-x-auto pb-1">
                  {attachments.map((f, i) => (
                    <div key={i} className="relative shrink-0 w-14 h-14 rounded-lg bg-[var(--color-mv-bg)] border border-[var(--color-mv-border)] flex items-center justify-center group">
                      {f.type.startsWith('image/') ? (
                        <img src={URL.createObjectURL(f)} alt="" className="w-full h-full rounded-lg object-cover" />
                      ) : (
                        <span className="text-[10px] text-[var(--color-mv-text-tertiary)] text-center px-1 truncate">{f.name.split('.').pop()?.toUpperCase()}</span>
                      )}
                      <button type="button" onClick={() => removeAttachment(i)}
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white flex items-center justify-center text-[8px] opacity-0 group-hover:opacity-100 transition-opacity">
                        ×
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex items-end gap-1.5 rounded-xl border border-[var(--color-mv-border)] bg-white px-2 py-1.5">

                {/* Attachment button */}
                <div className="relative mb-0.5">
                  <button
                    type="button"
                    onClick={() => setShowAttachMenu((v) => !v)}
                    className="p-1.5 rounded-lg text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)] transition-colors"
                    title="Datei anhängen"
                  >
                    <Plus size={16} />
                  </button>

                  {/* Attach menu dropdown */}
                  {showAttachMenu && (
                    <div className="absolute bottom-full left-0 mb-1 bg-[var(--color-mv-surface)] rounded-xl shadow-lg border border-[var(--color-mv-border)] overflow-hidden w-44 animate-slide-up z-10">
                      <button type="button"
                        onClick={() => { fileInputRef.current?.setAttribute('accept', '.pdf,.doc,.docx'); fileInputRef.current?.click(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-[var(--color-mv-text)] hover:bg-[var(--color-mv-hover)] transition-colors">
                        <Upload size={14} className="text-blue-500" /> Dokument (PDF, Word)
                      </button>
                      <button type="button"
                        onClick={() => { fileInputRef.current?.setAttribute('accept', 'image/*'); fileInputRef.current?.click(); }}
                        className="w-full flex items-center gap-2.5 px-3 py-2.5 text-xs text-[var(--color-mv-text)] hover:bg-[var(--color-mv-hover)] transition-colors">
                        <Upload size={14} className="text-green-500" /> Foto / Bild
                      </button>
                    </div>
                  )}
                </div>

                <input ref={fileInputRef} type="file" multiple className="hidden"
                  onChange={handleFileSelect} />

                {/* Text input */}
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setShowAttachMenu(false)}
                  rows={1}
                  placeholder="Frag Einstein..."
                  className="flex-1 max-h-24 min-h-[36px] resize-none bg-transparent text-[13px] outline-none py-1.5"
                />

                {/* Mic button */}
                <button
                  type="button"
                  onClick={toggleRecording}
                  className={`mb-0.5 p-1.5 rounded-lg transition-colors ${
                    isRecording
                      ? 'bg-red-500 text-white animate-pulse'
                      : 'text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)]'
                  }`}
                  title={isRecording ? 'Aufnahme stoppen' : 'Sprachnachricht'}
                >
                  {isRecording ? <MicOff size={14} /> : <Mic size={14} />}
                </button>

                {/* Send button */}
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={loading || (!input.trim() && attachments.length === 0)}
                  className="mb-0.5 p-1.5 rounded-lg bg-[var(--color-mv-text)] text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-[var(--color-mv-text)]/80 transition-colors"
                >
                  <Send size={14} />
                </button>
              </div>
              <p className="text-center text-[10px] text-[var(--color-mv-text-tertiary)] mt-1.5">
                Einstein \u00b7 Dein KI-Mentor & Concierge
              </p>
            </div>
          </div>
        )}

        {/* ── PROACTIVE TIP BUBBLE ── */}
        {!isOpen && showTip && proactiveHint && (
          <button
            type="button"
            onClick={() => { setShowTip(false); open(); }}
            className="mb-2 max-w-[240px] bg-[var(--color-mv-surface)] rounded-xl shadow-md px-3 py-2.5 text-left animate-hint group hover:shadow-lg transition-shadow"
          >
            <p className="text-[11px] text-[var(--color-mv-text-secondary)] leading-snug">{proactiveHint}</p>
            <span className="text-[10px] text-[var(--color-mv-primary)] font-medium mt-1 inline-block group-hover:underline">
              Einstein fragen &rarr;
            </span>
          </button>
        )}

        {/* ── FLOATING TRIGGER ── */}
        {!isOpen && (
          <button
            type="button"
            onClick={() => { setShowTip(false); open(); }}
            className="group animate-float focus:outline-none transition-transform hover:scale-105 active:scale-95"
            aria-label="Frag Einstein"
          >
            <div className="relative">
              <div className="transform scale-[0.55] origin-bottom-right drop-shadow-lg">
                <EinsteinFace isSpeaking={false} isListening={false} />
              </div>
              {/* Notification dot when there's a hint */}
              {proactiveHint && !showTip && (
                <div className="absolute top-0 right-0 w-3 h-3 bg-[var(--color-mv-primary)] rounded-full border-2 border-white" />
              )}
            </div>
          </button>
        )}
      </div>
    </>
  );
};

export default Einstein;
