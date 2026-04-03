import React from 'react';
import { Users, Search, MessageCircle, Plus, Video } from 'lucide-react';

const StudyGroups: React.FC = () => {
  const groups = [
    { id: 1, name: 'Mathe Masterclass 4B', members: 12, topic: 'Mathematik', active: true, nextSession: 'Heute, 18:00' },
    { id: 2, name: 'English Conversation Club', members: 8, topic: 'Englisch', active: false, nextSession: 'Morgen, 19:30' },
    { id: 3, name: 'Informatik Projektgruppe', members: 4, topic: 'Informatik', active: true, nextSession: 'In 20 Min' },
  ];

  return (
    <div className="p-5 md:p-8 max-w-5xl mx-auto animate-fade-in pb-24">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h2 className="text-2xl font-bold text-[var(--color-mv-text)]">Lerngruppen</h2>
          <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-1">Lerne gemeinsam mit Freunden und Klassenkameraden.</p>
        </div>
        <button className="mv-btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Gruppe gründen
        </button>
      </div>

      {/* Search */}
      <div className="relative mb-6">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-mv-text-tertiary)]" size={18} />
        <input
          type="text"
          placeholder="Gruppe finden..."
          className="mv-input pl-11"
        />
      </div>

      {/* Groups */}
      <div className="space-y-4">
        {groups.map(group => (
          <div key={group.id} className="mv-card-hover p-5 cursor-pointer">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-[var(--color-mv-primary-light)] text-[var(--color-mv-primary)] flex items-center justify-center text-lg font-bold shrink-0">
                {group.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-semibold text-[var(--color-mv-text)]">{group.name}</h3>
                <p className="text-sm text-[var(--color-mv-text-tertiary)] mt-0.5">{group.topic} · {group.members} Mitglieder · Nächste Session: {group.nextSession}</p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                {group.active && (
                  <span className="flex items-center gap-1.5 text-xs font-medium text-[var(--color-mv-primary)] bg-[var(--color-mv-primary-light)] px-2.5 py-1 rounded-full">
                    <Video size={12} /> Live
                  </span>
                )}
                <button className="p-2 rounded-lg text-[var(--color-mv-text-tertiary)] hover:bg-[var(--color-mv-hover)] hover:text-[var(--color-mv-text)] transition-colors">
                  <MessageCircle size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Suggestions */}
      <div className="mt-8">
        <h3 className="text-base font-semibold text-[var(--color-mv-text)] mb-4">Vorschläge für dich</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {['Physik Labor', 'Französisch A2', 'Geschichte & Politik'].map((g, i) => (
            <div key={i} className="mv-card p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={16} className="text-[var(--color-mv-text-tertiary)]" />
                <span className="text-sm text-[var(--color-mv-text)]">{g}</span>
              </div>
              <button className="text-xs font-medium text-[var(--color-mv-primary)] hover:underline">Beitreten</button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default StudyGroups;
