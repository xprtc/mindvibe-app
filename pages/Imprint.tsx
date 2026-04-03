import React from 'react';
import { FileText, MapPin, Globe, Mail } from 'lucide-react';

const Imprint: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in p-8">
      <div className="mb-8 border-b border-slate-200 pb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <FileText className="text-fuchsia-500" size={32} />
          Impressum
        </h2>
        <p className="text-slate-500 mt-2">
          Angaben gemäss Schweizer Recht.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        
        {/* Company Info */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
           <h3 className="text-xl font-bold text-slate-800 border-b border-slate-50 pb-2">Kontaktadresse</h3>
           
           <div className="space-y-1 text-slate-600">
             <p className="font-bold">Rastoder IT Consulting</p>
             <p>Sabir Rastoder</p>
             <p>3063 Ittigen</p>
             <p>Schweiz</p>
           </div>
           
           <div className="space-y-2 pt-4">
             <a href="mailto:sr@expertico.ch" className="flex items-center gap-2 text-fuchsia-600 hover:underline">
               <Mail size={16} /> sr@expertico.ch
             </a>
             <a href="https://expertico.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-fuchsia-600 hover:underline">
               <Globe size={16} /> www.expertico.com
             </a>
           </div>
        </div>

        {/* Responsible Person */}
        <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-4">
           <h3 className="text-xl font-bold text-slate-800 border-b border-slate-50 pb-2">Vertretungsberechtigte Person</h3>
           <p className="text-slate-600">
             <span className="font-semibold">Sabir Rastoder</span><br/>
             Inhaber / Geschäftsführer
           </p>
        </div>
      </div>

      <div className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm space-y-6 text-slate-600 leading-relaxed">
        <section>
          <h4 className="font-bold text-slate-800 mb-2">Haftungsausschluss</h4>
          <p className="text-sm">
            Der Autor übernimmt keinerlei Gewähr hinsichtlich der inhaltlichen Richtigkeit, Genauigkeit, Aktualität, Zuverlässigkeit und Vollständigkeit der Informationen. Haftungsansprüche gegen den Autor wegen Schäden materieller oder immaterieller Art, welche aus dem Zugriff oder der Nutzung bzw. Nichtnutzung der veröffentlichten Informationen, durch Missbrauch der Verbindung oder durch technische Störungen entstanden sind, werden ausgeschlossen.
          </p>
        </section>

        <section>
          <h4 className="font-bold text-slate-800 mb-2">Haftung für Links</h4>
          <p className="text-sm">
            Verweise und Links auf Webseiten Dritter liegen ausserhalb unseres Verantwortungsbereichs. Es wird jegliche Verantwortung für solche Webseiten abgelehnt. Der Zugriff und die Nutzung solcher Webseiten erfolgen auf eigene Gefahr des Nutzers oder der Nutzerin.
          </p>
        </section>

        <section>
          <h4 className="font-bold text-slate-800 mb-2">Urheberrechte</h4>
          <p className="text-sm">
            Die Urheber- und alle anderen Rechte an Inhalten, Bildern, Fotos oder anderen Dateien auf der Website gehören ausschliesslich der Firma <strong>Rastoder IT Consulting</strong> oder den speziell genannten Rechtsinhabern. Für die Reproduktion jeglicher Elemente ist die schriftliche Zustimmung der Urheberrechtsträger im Voraus einzuholen.
          </p>
        </section>
      </div>

    </div>
  );
};

export default Imprint;