import React from 'react';
import { Shield, Lock } from 'lucide-react';

const Privacy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto animate-fade-in p-8">
      <div className="mb-8 border-b border-slate-200 pb-8">
        <h2 className="text-3xl font-bold text-slate-800 flex items-center gap-3">
          <Shield className="text-fuchsia-500" size={32} />
          Datenschutzerklärung
        </h2>
        <p className="text-slate-500 mt-2">
          Nach Massgabe des Schweizerischen Datenschutzgesetzes (DSG).
        </p>
      </div>

      <div className="space-y-8 text-slate-700 leading-relaxed bg-white p-8 rounded-3xl border border-slate-100 shadow-sm">
        
        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-3">1. Verantwortliche Stelle</h3>
          <p>
            Verantwortlich für die Datenbearbeitung auf dieser Website ist:<br/><br/>
            <strong>Rastoder IT Consulting</strong><br/>
            Sabir Rastoder<br/>
            3063 Ittigen<br/>
            Schweiz<br/>
            E-Mail: sr@expertico.ch<br/>
            Website: expertico.com
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-3">2. Allgemeines</h3>
          <p>
            Gestützt auf Artikel 13 der schweizerischen Bundesverfassung und die datenschutzrechtlichen Bestimmungen des Bundes (Datenschutzgesetz, DSG) hat jede Person Anspruch auf Schutz ihrer Privatsphäre sowie auf Schutz vor Missbrauch ihrer persönlichen Daten. Wir nehmen den Schutz Ihrer persönlichen Daten sehr ernst. Wir behandeln Ihre personenbezogenen Daten vertraulich und entsprechend der gesetzlichen Datenschutzvorschriften.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-3">3. Datenerfassung auf unserer Website</h3>
          <p className="mb-2"><strong>Cookies</strong></p>
          <p className="mb-4">
            Unsere Website verwendet teilweise so genannte Cookies. Cookies richten auf Ihrem Rechner keinen Schaden an und enthalten keine Viren. Sie dienen dazu, unser Angebot nutzerfreundlicher, effektiver und sicherer zu machen.
          </p>
          
          <p className="mb-2"><strong>Server-Log-Dateien</strong></p>
          <p>
            Der Provider der Seiten erhebt und speichert automatisch Informationen in so genannten Server-Log-Dateien, die Ihr Browser automatisch an uns übermittelt. Dies sind:
          </p>
          <ul className="list-disc ml-5 mt-2 space-y-1">
            <li>Browsertyp und Browserversion</li>
            <li>Verwendetes Betriebssystem</li>
            <li>Referrer URL</li>
            <li>Hostname des zugreifenden Rechners</li>
            <li>Uhrzeit der Serveranfrage</li>
          </ul>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-3">4. KI-Verarbeitung (Google Gemini)</h3>
          <p>
            Diese Applikation ("MindVibe") nutzt Künstliche Intelligenz (Google Gemini API) zur Erstellung von Lerninhalten. 
            Wenn Sie Inhalte (Texte, Bilder) zur Analyse hochladen, werden diese Daten an die API-Schnittstellen von Google gesendet.
            Bitte laden Sie keine sensiblen personenbezogenen Daten Dritter ohne deren Einwilligung hoch.
          </p>
        </section>

        <section>
          <h3 className="text-xl font-bold text-slate-800 mb-3">5. Ihre Rechte</h3>
          <p>
            Sie haben jederzeit das Recht auf unentgeltliche Auskunft über Ihre gespeicherten personenbezogenen Daten, deren Herkunft und Empfänger und den Zweck der Datenverarbeitung sowie ein Recht auf Berichtigung, Sperrung oder Löschung dieser Daten. Hierzu sowie zu weiteren Fragen zum Thema personenbezogene Daten können Sie sich jederzeit unter der im Impressum angegebenen Adresse an uns wenden.
          </p>
        </section>

        <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-center gap-2 text-slate-400 text-sm">
           <Lock size={14} /> Sichere SSL/TLS-Verschlüsselung aktiv
        </div>

      </div>
    </div>
  );
};

export default Privacy;