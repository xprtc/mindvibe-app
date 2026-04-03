import React from 'react';
import { Mail, MapPin, Send, Phone } from 'lucide-react';

const Contact: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in p-4 md:p-8">
      <div className="text-center mb-10">
        <h2 className="text-3xl font-bold text-slate-800 mb-2">Kontakt aufnehmen</h2>
        <p className="text-slate-500">Wir freuen uns von dir zu hören.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm space-y-8 relative overflow-hidden">
           <div className="absolute top-0 right-0 -mt-4 -mr-4 w-32 h-32 bg-fuchsia-50 rounded-full blur-2xl opacity-50"></div>
           
           <div>
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
               <Mail className="text-fuchsia-500" /> Kontaktdaten
             </h3>
             <div className="space-y-3 text-slate-600">
               <div>
                  <p className="font-bold text-slate-800">Rastoder IT Consulting</p>
                  <p className="text-sm">Sabir Rastoder</p>
               </div>
               
               <div className="pt-2 border-t border-slate-50">
                 <a href="mailto:sr@expertico.ch" className="flex items-center gap-2 text-sm text-fuchsia-600 hover:underline">
                   <Mail size={14} /> sr@expertico.ch
                 </a>
                 <a href="https://www.expertico.com" target="_blank" rel="noreferrer" className="flex items-center gap-2 text-sm text-fuchsia-600 hover:underline mt-1">
                   <Send size={14} /> www.expertico.com
                 </a>
               </div>
             </div>
           </div>

           <div>
             <h3 className="font-bold text-lg mb-4 flex items-center gap-2 text-slate-800">
               <MapPin className="text-blue-500" /> Standort
             </h3>
             <p className="text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 text-sm">
               <span className="font-semibold block mb-1">Hauptsitz:</span>
               3063 Ittigen<br/>
               Kanton Bern<br/>
               Schweiz
             </p>
           </div>
        </div>

        <div className="bg-white rounded-3xl p-8 border border-slate-100 shadow-sm">
           <h3 className="font-bold text-lg mb-6">Nachricht senden</h3>
           <div className="space-y-4">
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Name</label>
               <input type="text" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-100 outline-none transition-all" placeholder="Dein Name" />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">E-Mail</label>
               <input type="email" className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-100 outline-none transition-all" placeholder="deine@email.com" />
             </div>
             <div>
               <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">Nachricht</label>
               <textarea className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:ring-2 focus:ring-fuchsia-100 outline-none h-32 resize-none transition-all" placeholder="Wie können wir helfen?"></textarea>
             </div>
             <button className="w-full py-3 bg-slate-900 text-white rounded-xl font-bold hover:bg-gradient-to-r hover:from-slate-800 hover:to-slate-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-slate-200">
               <Send size={18} /> Absenden
             </button>
           </div>
        </div>
      </div>
    </div>
  );
};

export default Contact;