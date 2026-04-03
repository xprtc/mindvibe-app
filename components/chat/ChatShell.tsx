import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  LogOut,
  MessageSquarePlus,
  PanelLeftClose,
  PanelLeft,
  Send,
  ArrowLeft,
} from 'lucide-react';
import { chatWithEinstein } from '../../services/geminiService';
import { getDemoReply } from '../../services/demoChat';
import { useSession } from '../../context/SessionContext';
import {
  getChatThreads,
  getChatMessages,
  saveChatThread,
  saveChatMessage,
  type ChatThread as FSThread,
  type ChatMsg as FSMsg,
} from '../../services/firestoreService';
import type { ChatMessage } from '../../types';

type Mode = 'demo' | 'full';

interface Thread {
  id: string;
  title: string;
  messages: ChatMessage[];
  updatedAt: number;
}

function uid() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function welcomeMessage(fullName?: string): ChatMessage {
  const greet = fullName ? `Hallo ${fullName}! ` : 'Hallo! ';
  return {
    id: 'welcome',
    role: 'model',
    text: `${greet}Ich bin Einstein – womit soll ich dir beim Lernen helfen?`,
    timestamp: new Date(),
  };
}

function parseStored(raw: string): Thread[] {
  try {
    const data = JSON.parse(raw) as Thread[];
    if (!Array.isArray(data)) return [];
    return data.map((t) => ({
      ...t,
      messages: (t.messages || []).map((m) => ({
        ...m,
        timestamp: new Date(m.timestamp as unknown as string | number),
      })),
    }));
  } catch {
    return [];
  }
}

function Boldish({ text }: { text: string }) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return (
    <>
      {parts.map((p, i) =>
        p.startsWith('**') && p.endsWith('**') ? (
          <strong key={i} className="font-semibold">
            {p.slice(2, -2)}
          </strong>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  );
}

interface ChatShellProps {
  mode: Mode;
  userName?: string;
  onExitDemo?: () => void;
  onOpenLogin?: () => void;
  onLogout?: () => void;
  onBack?: () => void;
}

const ChatShell: React.FC<ChatShellProps> = ({
  mode,
  userName,
  onExitDemo,
  onOpenLogin,
  onLogout,
  onBack,
}) => {
  const session = useSession();
  const userUid = session.user?.uid;
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [threads, setThreads] = useState<Thread[]>([
    {
      id: uid(),
      title: 'Neuer Chat',
      messages: [welcomeMessage(mode === 'full' ? userName : undefined)],
      updatedAt: Date.now(),
    },
  ]);

  const [activeId, setActiveId] = useState(() => threads[0]?.id ?? '');
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  const active = useMemo(
    () => threads.find((t) => t.id === activeId) ?? threads[0],
    [threads, activeId]
  );

  // Load threads from Firestore on mount
  useEffect(() => {
    if (mode !== 'full' || !userUid) return;
    (async () => {
      const fsThreads = await getChatThreads(userUid);
      if (fsThreads.length === 0) return; // keep default welcome thread
      const loaded: Thread[] = [];
      for (const t of fsThreads) {
        const msgs = await getChatMessages(userUid, t.id);
        loaded.push({
          id: t.id,
          title: t.title,
          messages: msgs.map((m) => ({
            id: m.id,
            role: m.role,
            text: m.text,
            timestamp: new Date(m.timestamp),
          })),
          updatedAt: t.updatedAt,
        });
      }
      if (loaded.length > 0) {
        setThreads(loaded);
        setActiveId(loaded[0].id);
      }
    })();
  }, [mode, userUid]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages, loading]);

  // Save thread + message to Firestore (fire-and-forget)
  const persistThread = useCallback((thread: Thread) => {
    if (mode !== 'full' || !userUid) return;
    saveChatThread(userUid, { id: thread.id, title: thread.title, updatedAt: thread.updatedAt });
  }, [mode, userUid]);

  const persistMsg = useCallback((threadId: string, msg: ChatMessage) => {
    if (mode !== 'full' || !userUid) return;
    saveChatMessage(userUid, threadId, {
      id: msg.id,
      role: msg.role,
      text: msg.text,
      timestamp: msg.timestamp.getTime(),
    });
  }, [mode, userUid]);

  const newChat = useCallback(() => {
    const t: Thread = {
      id: uid(),
      title: 'Neuer Chat',
      messages: [welcomeMessage(mode === 'full' ? userName : undefined)],
      updatedAt: Date.now(),
    };
    setThreads((prev) => [t, ...prev]);
    setActiveId(t.id);
    persistThread(t);
    persistMsg(t.id, t.messages[0]);
  }, [mode, userName, persistThread, persistMsg]);

  const send = async () => {
    const text = input.trim();
    if (!text || loading || !active) return;
    setInput('');
    setLoading(true);

    const userMsg: ChatMessage = {
      id: uid(),
      role: 'user',
      text,
      timestamp: new Date(),
    };

    const historyBefore = active.messages;

    const nextTitle =
      active.title === 'Neuer Chat' && active.messages.length <= 1
        ? text.slice(0, 40) + (text.length > 40 ? '…' : '')
        : active.title;
    const now = Date.now();

    setThreads((prev) =>
      prev.map((th) =>
        th.id !== active.id
          ? th
          : { ...th, title: nextTitle, messages: [...th.messages, userMsg], updatedAt: now }
      )
    );

    persistMsg(active.id, userMsg);
    persistThread({ id: active.id, title: nextTitle, messages: [], updatedAt: now });

    try {
      if (mode === 'demo') {
        await new Promise((r) => setTimeout(r, 350));
        const replyText = getDemoReply(text);
        const modelMsg: ChatMessage = {
          id: uid(),
          role: 'model',
          text: replyText,
          timestamp: new Date(),
        };
        setThreads((prev) =>
          prev.map((th) =>
            th.id === active.id
              ? { ...th, messages: [...th.messages, modelMsg], updatedAt: Date.now() }
              : th
          )
        );
      } else {
        const modelMsg = await chatWithEinstein(historyBefore, userMsg.text);
        setThreads((prev) =>
          prev.map((th) =>
            th.id === active.id
              ? { ...th, messages: [...th.messages, modelMsg], updatedAt: Date.now() }
              : th
          )
        );
        persistMsg(active.id, modelMsg);
      }
    } finally {
      setLoading(false);
    }
  };

  const messages = active?.messages ?? [];

  return (
    <div className="flex h-[100dvh] w-full bg-[var(--color-mv-surface)] text-[var(--color-mv-text)]">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? 'w-[260px] min-w-[260px]' : 'w-0 min-w-0 overflow-hidden'
        } border-r border-[var(--color-mv-border)] bg-[var(--color-mv-bg)] flex flex-col transition-[width] duration-200`}
      >
        <div className="p-3 flex items-center gap-2">
          <button
            type="button"
            onClick={newChat}
            className="flex flex-1 items-center gap-2 rounded-lg border border-[var(--color-mv-border)] bg-white px-3 py-2.5 text-sm font-medium text-[var(--color-mv-text)] shadow-sm hover:bg-[var(--color-mv-hover)]"
          >
            <MessageSquarePlus className="h-4 w-4 shrink-0" />
            Neuer Chat
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
          {threads.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setActiveId(t.id)}
              className={`w-full text-left rounded-lg px-3 py-2.5 text-sm truncate transition-colors ${
                t.id === active.id
                  ? 'bg-[var(--color-mv-hover)] text-[var(--color-mv-text)]'
                  : 'text-[var(--color-mv-text-secondary)] hover:bg-[var(--color-mv-hover)]'
              }`}
            >
              {t.title}
            </button>
          ))}
        </div>

        {mode === 'demo' ? (
          <div className="p-3 border-t border-[var(--color-mv-border)] space-y-2 bg-[var(--color-mv-hover)]">
            <p className="text-xs text-[var(--color-mv-text-tertiary)] leading-snug">
              Demo-Modus – nur Beispielantworten.
            </p>
            <button
              type="button"
              onClick={onOpenLogin}
              className="w-full rounded-lg bg-[var(--color-mv-primary)] py-2 text-xs font-medium text-white"
            >
              Konto anlegen / Anmelden
            </button>
            <button
              type="button"
              onClick={onExitDemo}
              className="w-full text-xs text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)] py-1"
            >
              Zur Startseite
            </button>
          </div>
        ) : (
          <div className="p-3 border-t border-[var(--color-mv-border)] flex items-center justify-between gap-2">
            <span className="text-xs text-[var(--color-mv-text-tertiary)] truncate">{userName ?? 'Angemeldet'}</span>
            <button
              type="button"
              onClick={onLogout}
              className="p-2 rounded-lg text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)] hover:text-[var(--color-mv-text)]"
              title="Abmelden"
            >
              <LogOut className="h-4 w-4" />
            </button>
          </div>
        )}
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-12 shrink-0 flex items-center gap-2 px-3 border-b border-[var(--color-mv-border)]">
          {onBack && (
            <button
              type="button"
              onClick={onBack}
              className="p-2 rounded-lg text-[var(--color-mv-text-secondary)] hover:bg-[var(--color-mv-hover)]"
              aria-label="Zurück"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
          )}
          <button
            type="button"
            onClick={() => setSidebarOpen((o) => !o)}
            className="p-2 rounded-lg text-[var(--color-mv-text-secondary)] hover:bg-[var(--color-mv-hover)]"
            aria-label="Sidebar"
          >
            {sidebarOpen ? (
              <PanelLeftClose className="h-5 w-5" />
            ) : (
              <PanelLeft className="h-5 w-5" />
            )}
          </button>
          <span className="text-sm font-medium text-[var(--color-mv-text)] truncate">
            {active?.title ?? 'Chat'}
          </span>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-[15px] leading-relaxed ${
                    m.role === 'user'
                      ? 'bg-[var(--color-mv-text)] text-white'
                      : 'bg-[var(--color-mv-bg)] text-[var(--color-mv-text)]'
                  }`}
                >
                  <p className="whitespace-pre-wrap">
                    <Boldish text={m.text} />
                  </p>
                </div>
              </div>
            ))}
            {loading ? (
              <div className="flex gap-3">
                <div className="bg-[var(--color-mv-bg)] rounded-2xl px-4 py-3 text-sm text-[var(--color-mv-text-tertiary)]">
                  Schreibt…
                </div>
              </div>
            ) : null}
            <div ref={bottomRef} />
          </div>
        </div>

        <div className="border-t border-[var(--color-mv-border-light)] p-4 bg-white">
          <div className="max-w-3xl mx-auto">
            <div className="flex items-end gap-2 rounded-2xl border border-[var(--color-mv-border)] bg-white shadow-sm px-3 py-2">
              <textarea
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={1}
                placeholder="Nachricht…"
                className="flex-1 max-h-40 min-h-[44px] resize-none bg-transparent text-[15px] outline-none py-2.5 px-1"
              />
              <button
                type="button"
                onClick={send}
                disabled={loading || !input.trim()}
                className="mb-1 p-2 rounded-xl bg-[var(--color-mv-text)] text-white disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-mv-text)]/80"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
            <p className="text-center text-[11px] text-[var(--color-mv-text-tertiary)] mt-2">
              KI kann Fehler machen. Prüfe wichtige Lerninhalte.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatShell;
