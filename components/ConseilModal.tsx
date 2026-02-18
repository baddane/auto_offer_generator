
import React, { useMemo } from 'react';
import { ConseilArticle } from '../types';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

interface ConseilModalProps {
  conseil: ConseilArticle | null;
  onClose: () => void;
}

const ConseilModal: React.FC<ConseilModalProps> = ({ conseil, onClose }) => {
  const renderedContent = useMemo(() => {
    if (!conseil?.contenu) return '';
    const rawHtml = marked.parse(conseil.contenu) as string;
    return DOMPurify.sanitize(rawHtml);
  }, [conseil?.contenu]);

  if (!conseil) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl w-full max-w-5xl max-h-[92vh] overflow-hidden shadow-2xl flex flex-col animate-in slide-in-from-bottom-8 duration-300">
        {/* Header */}
        <div className="p-8 border-b border-slate-100 flex justify-between items-center bg-gradient-to-r from-amber-500 to-orange-500 text-white relative">
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-2">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider border border-white/30">
                {conseil.thematique}
              </span>
              {conseil.tempsLecture && (
                <span className="text-amber-100 text-sm font-medium flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  {conseil.tempsLecture} de lecture
                </span>
              )}
            </div>
            <h2 className="text-3xl font-extrabold tracking-tight leading-tight">{conseil.titre}</h2>
            <p className="text-amber-50 opacity-90 text-sm mt-2 font-medium">/{conseil.slug} · {conseil.datePubli}</p>
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
              <div className="prose prose-slate prose-amber max-w-none prose-headings:font-bold prose-h1:text-3xl prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-p:text-slate-600 prose-p:leading-relaxed prose-li:text-slate-600">
                <div dangerouslySetInnerHTML={{ __html: renderedContent }} />
              </div>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-4 bg-slate-50/50 p-8 flex flex-col gap-8">
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
                <h4 className="font-bold text-slate-900 mb-6 flex items-center gap-2 border-b border-slate-50 pb-4">
                  <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Données SEO
                </h4>

                <div className="space-y-5 text-sm">
                  <div>
                    <span className="text-slate-500 font-medium block mb-1">Meta Title</span>
                    <span className="text-slate-900 font-semibold text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 block">
                      {conseil.metaTitle}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 font-medium block mb-1">Meta Description</span>
                    <span className="text-slate-600 text-xs bg-slate-50 p-2 rounded-lg border border-slate-100 block leading-relaxed">
                      {conseil.metaDescription}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Slug URL</span>
                    <span className="font-mono text-xs bg-slate-100 px-2 py-1 rounded text-slate-700">/{conseil.slug}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Thématique</span>
                    <span className="text-amber-700 font-bold">{conseil.thematique}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Publié le</span>
                    <span className="text-slate-900 font-medium">{conseil.datePubli}</span>
                  </div>
                </div>

                <div className="mt-8">
                  <h4 className="font-bold text-slate-900 mb-4 text-xs uppercase tracking-widest text-slate-400">Mots-clés SEO</h4>
                  <div className="flex flex-wrap gap-2">
                    {conseil.seoKeywords.map((tag, i) => (
                      <span key={i} className="text-[11px] font-bold bg-amber-50 text-amber-600 border border-amber-100 px-3 py-1 rounded-lg">
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-amber-50 border border-amber-100">
                <p className="text-amber-800 text-xs font-semibold leading-relaxed">
                  Cet article a été rédigé et optimisé SEO par JobGenie AI : H1, H2, méta-données, slug et mots-clés sont prêts pour la publication.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConseilModal;
