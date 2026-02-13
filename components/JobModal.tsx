
import React, { useMemo } from 'react';
import { FullJobOffer } from '../types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface JobModalProps {
  job: FullJobOffer | null;
  onClose: () => void;
}

const JobModal: React.FC<JobModalProps> = ({ job, onClose }) => {
  const renderedContent = useMemo(() => {
    if (!job?.fullDescription) return '';
    const rawHtml = marked.parse(job.fullDescription) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [job?.fullDescription]);

  if (!job) return null;

  const applyUrl = "http://www.anapec.org/sigec-app-rv/";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-indigo-600 to-violet-700 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/30">
                {job.typeContrat}
              </span>
              <span className="text-indigo-100 text-sm font-medium">Réf: {job.refOffre}</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">{job.emploiMetier}</h2>
            <p className="text-indigo-50 opacity-90 text-lg mt-1 font-medium">{job.raisonSociale} — {job.ville}</p>
          </div>
          <button 
            onClick={onClose} 
            className="p-2 hover:bg-white/20 rounded-full transition-all hover:rotate-90 duration-300 z-10"
            aria-label="Fermer"
          >
            <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          {/* Decorative background element */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Main Column */}
            <div className="lg:col-span-8 p-8 lg:p-12 border-r border-slate-50">
              <div className="prose prose-slate prose-indigo max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                <div 
                  dangerouslySetInnerHTML={{ __html: renderedContent }} 
                />
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100">
                <h3 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-indigo-100 text-indigo-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Compétences Clés
                </h3>
                <div className="flex flex-wrap gap-3">
                  {job.requiredSkills.map((skill, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 hover:border-indigo-300 hover:bg-indigo-50 transition-colors">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 bg-slate-50/50 p-8 flex flex-col gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
                  <svg className="w-5 h-5 text-indigo-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Détails Pratiques
                </h4>
                <div className="space-y-5 text-sm">
                  <div className="flex justify-between items-center group">
                    <span className="text-slate-500 font-medium">Référence</span>
                    <span className="text-slate-900 font-bold font-mono bg-slate-100 px-2 py-0.5 rounded group-hover:bg-indigo-100 transition-colors">{job.refOffre}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Contrat</span>
                    <span className="text-slate-900 font-bold px-2 py-0.5 border border-indigo-100 rounded text-indigo-700">{job.typeContrat}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Date de publication</span>
                    <span className="text-slate-900 font-medium">{job.dateOffre}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Nombre de postes</span>
                    <span className="bg-indigo-600 text-white font-bold w-8 h-8 rounded-full flex items-center justify-center text-xs shadow-lg shadow-indigo-200">
                      {job.nbrePostes}
                    </span>
                  </div>
                  {job.suggestedSalaryRange && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Salaire Estimé</span>
                      <span className="text-green-600 font-bold text-base">{job.suggestedSalaryRange}</span>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                   <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest text-slate-400">Mots-clés SEO</h4>
                   <div className="flex flex-wrap gap-2">
                     {job.seoKeywords.map((tag, i) => (
                       <span key={i} className="text-[11px] font-bold bg-indigo-50 text-indigo-600 border border-indigo-100 px-3 py-1 rounded-lg">
                         #{tag}
                       </span>
                     ))}
                   </div>
                </div>

                <div className="mt-10">
                  <a 
                    href={applyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full bg-slate-900 hover:bg-indigo-600 text-white font-bold py-4 rounded-2xl shadow-xl shadow-slate-200 transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-2 group text-center"
                  >
                    Postuler à cette offre
                    <svg className="w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </a>
                  <p className="text-[10px] text-slate-400 text-center mt-3 italic">
                    En cliquant sur postuler, vous serez redirigé vers le portail de recrutement officiel ANAPEC.
                  </p>
                </div>
              </div>
              
              <div className="p-6 rounded-2xl bg-indigo-50 border border-indigo-100">
                <p className="text-indigo-800 text-xs font-semibold leading-relaxed">
                  Cette description a été optimisée par JobGenie AI pour un meilleur référencement sur Google Jobs et LinkedIn.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobModal;
