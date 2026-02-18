
import React, { useMemo } from 'react';
import { FullEntreprise } from '../types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface EntrepriseModalProps {
  entreprise: FullEntreprise | null;
  onClose: () => void;
}

const EntrepriseModal: React.FC<EntrepriseModalProps> = ({ entreprise, onClose }) => {
  const renderedContent = useMemo(() => {
    if (!entreprise?.presentation) return '';
    const rawHtml = marked.parse(entreprise.presentation) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [entreprise?.presentation]);

  if (!entreprise) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/30">
                {entreprise.secteur}
              </span>
              <span className="text-emerald-100 text-sm font-medium">/{entreprise.slug}</span>
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight">{entreprise.nom}</h2>
            <p className="text-emerald-50 opacity-90 text-lg mt-1 font-medium">{entreprise.ville}</p>
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
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-20 -mt-20 blur-3xl"></div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
            {/* Main Column */}
            <div className="lg:col-span-8 p-8 lg:p-12 border-r border-slate-50">
              <div className="prose prose-slate prose-emerald max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
              </div>

              <div className="mt-12 pt-8 border-t border-slate-100">
                <h3 className="text-xl font-bold mb-6 text-slate-900 flex items-center gap-2">
                  <span className="w-8 h-8 bg-emerald-100 text-emerald-600 rounded-lg flex items-center justify-center">
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </span>
                  Spécialités & Points Forts
                </h3>
                <div className="flex flex-wrap gap-3">
                  {entreprise.specialites.map((spec, idx) => (
                    <span key={idx} className="bg-slate-50 text-slate-700 px-4 py-2 rounded-xl text-sm font-semibold border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50 transition-colors">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 bg-slate-50/50 p-8 flex flex-col gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                  </svg>
                  Informations
                </h4>
                <div className="space-y-5 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Secteur</span>
                    <span className="text-slate-900 font-bold px-2 py-0.5 border border-emerald-100 rounded text-emerald-700">{entreprise.secteur}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Ville</span>
                    <span className="text-slate-900 font-medium">{entreprise.ville}</span>
                  </div>
                  {entreprise.nbEmployes && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Effectif</span>
                      <span className="text-slate-900 font-bold">{entreprise.nbEmployes}</span>
                    </div>
                  )}
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Ajouté le</span>
                    <span className="text-slate-900 font-medium">{entreprise.dateAjout}</span>
                  </div>
                  {entreprise.siteWeb && (
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500 font-medium">Site web</span>
                      <a
                        href={entreprise.siteWeb.startsWith('http') ? entreprise.siteWeb : `https://${entreprise.siteWeb}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-emerald-600 font-bold hover:underline truncate max-w-[120px]"
                      >
                        Visiter
                      </a>
                    </div>
                  )}
                </div>

                <div className="mt-8">
                  <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest text-slate-400">Mots-clés SEO</h4>
                  <div className="flex flex-wrap gap-2">
                    {entreprise.seoKeywords.map((tag, i) => (
                      <span key={i} className="text-[11px] font-bold bg-emerald-50 text-emerald-600 border border-emerald-100 px-3 py-1 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                <p className="text-emerald-800 text-xs font-semibold leading-relaxed">
                  Cette fiche entreprise a été générée et optimisée par JobGenie AI pour un meilleur référencement naturel.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EntrepriseModal;
