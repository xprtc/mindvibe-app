import React from 'react';

interface FooterProps {
  onNavigate: (page: string) => void;
}

const Footer: React.FC<FooterProps> = ({ onNavigate }) => {
  return (
    <footer className="w-full max-w-5xl mx-auto px-6 py-12 mt-16 mb-8 hidden md:block">
      <div className="border-t border-[var(--color-mv-border)] pt-8">
        <div className="grid grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-md bg-[var(--color-mv-primary)] flex items-center justify-center text-white font-semibold text-xs">
                M
              </div>
              <span className="text-sm font-semibold text-[var(--color-mv-text)]">MindVibe</span>
            </div>
            <p className="text-xs text-[var(--color-mv-text-tertiary)] leading-relaxed">
              Intelligente Lernplattform für bessere Noten.
            </p>
            <div className="flex items-center gap-2 text-xs text-[var(--color-mv-text-tertiary)]">
              <span>🇨🇭</span> Made in Switzerland
            </div>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="text-xs font-medium text-[var(--color-mv-text)] mb-3">Navigation</h4>
            <div className="space-y-2">
              {['home:Dashboard', 'pruefungen:Prüfungen', 'bibliothek:Bibliothek', 'fortschritt:Fortschritt'].map(item => {
                const [id, label] = item.split(':');
                return (
                  <button key={id} onClick={() => onNavigate(id)} className="block text-xs text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)] transition-colors">
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-medium text-[var(--color-mv-text)] mb-3">Rechtliches</h4>
            <div className="space-y-2">
              <button onClick={() => onNavigate('impressum')} className="block text-xs text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)] transition-colors">Impressum</button>
              <button onClick={() => onNavigate('privacy')} className="block text-xs text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)] transition-colors">Datenschutz</button>
            </div>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-xs font-medium text-[var(--color-mv-text)] mb-3">Kontakt</h4>
            <button onClick={() => onNavigate('contact')} className="block text-xs text-[var(--color-mv-text-tertiary)] hover:text-[var(--color-mv-text)] transition-colors mb-3">
              Kontaktformular
            </button>
            <p className="text-xs text-[var(--color-mv-text-tertiary)] leading-relaxed">
              Rastoder IT Consulting<br />
              3063 Ittigen, Schweiz
            </p>
          </div>
        </div>

        <div className="flex justify-between items-center mt-8 pt-6 border-t border-[var(--color-mv-border-light)]">
          <span className="text-[11px] text-[var(--color-mv-text-tertiary)]">
            &copy; {new Date().getFullYear()} Rastoder IT Consulting
          </span>
          <span className="text-[11px] text-[var(--color-mv-text-tertiary)]">
            Powered by Expertico
          </span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
