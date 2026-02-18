
import React from 'react';
import { ConseilArticle } from '../types';

interface ConseilCardProps {
  conseil: ConseilArticle;
  onView: (conseil: ConseilArticle) => void;
}

const ConseilCard: React.FC<ConseilCardProps> = ({ conseil, onView }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 bg-amber-50 text-amber-700 text-xs font-bold rounded-full uppercase tracking-wider">
            {conseil.thematique}
          </span>
          <span className="text-slate-400 text-xs">{conseil.datePubli}</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 group-hover:text-amber-600 transition-colors mb-3 leading-tight">
          {conseil.titre}
        </h3>

        <p className="text-slate-500 text-sm leading-relaxed mb-4 line-clamp-3">
          {conseil.metaDescription}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {conseil.seoKeywords.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
        <button
          onClick={() => onView(conseil)}
          className="text-amber-600 font-semibold text-sm hover:underline"
        >
          Lire l'article
        </button>
        {conseil.tempsLecture && (
          <div className="flex items-center gap-1 text-slate-400 text-xs">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            {conseil.tempsLecture}
          </div>
        )}
      </div>
    </div>
  );
};

export default ConseilCard;
