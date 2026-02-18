
import React from 'react';
import { FullEcole } from '../types';

interface EcoleCardProps {
  ecole: FullEcole;
  onView: (ecole: FullEcole) => void;
}

const EcoleCard: React.FC<EcoleCardProps> = ({ ecole, onView }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 bg-violet-50 text-violet-700 text-xs font-bold rounded-full uppercase tracking-wider">
            {ecole.typeEcole}
          </span>
          <span className="text-slate-400 text-xs">{ecole.dateAjout}</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 group-hover:text-violet-600 transition-colors mb-2 leading-tight">
          {ecole.nom}
        </h3>

        <div className="flex items-center text-slate-500 text-sm gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {ecole.ville}
        </div>

        {ecole.filieres.length > 0 && (
          <div className="mb-4">
            <p className="text-xs text-slate-400 uppercase tracking-wider mb-2">Filières</p>
            <div className="flex flex-wrap gap-1">
              {ecole.filieres.slice(0, 2).map((filiere, i) => (
                <span key={i} className="text-[10px] bg-violet-50 text-violet-600 px-2 py-0.5 rounded border border-violet-100 font-medium">
                  {filiere}
                </span>
              ))}
              {ecole.filieres.length > 2 && (
                <span className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
                  +{ecole.filieres.length - 2}
                </span>
              )}
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {ecole.seoKeywords.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
        <button
          onClick={() => onView(ecole)}
          className="text-violet-600 font-semibold text-sm hover:underline"
        >
          Voir la fiche
        </button>
        {ecole.siteWeb && (
          <a
            href={ecole.siteWeb.startsWith('http') ? ecole.siteWeb : `https://${ecole.siteWeb}`}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
          >
            Site web
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </a>
        )}
      </div>
    </div>
  );
};

export default EcoleCard;
