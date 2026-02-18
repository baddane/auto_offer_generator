
import React from 'react';
import { FullEntreprise } from '../types';

interface EntrepriseCardProps {
  entreprise: FullEntreprise;
  onView: (entreprise: FullEntreprise) => void;
}

const EntrepriseCard: React.FC<EntrepriseCardProps> = ({ entreprise, onView }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-full uppercase tracking-wider">
            {entreprise.secteur}
          </span>
          <span className="text-slate-400 text-xs">{entreprise.dateAjout}</span>
        </div>

        <h3 className="text-xl font-bold text-slate-900 group-hover:text-emerald-600 transition-colors mb-2 leading-tight">
          {entreprise.nom}
        </h3>

        <div className="flex items-center text-slate-500 text-sm gap-1 mb-1">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {entreprise.ville}
        </div>

        {entreprise.nbEmployes && (
          <div className="flex items-center text-slate-500 text-sm gap-1 mb-4">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            {entreprise.nbEmployes} employés
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {entreprise.seoKeywords.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
        <button
          onClick={() => onView(entreprise)}
          className="text-emerald-600 font-semibold text-sm hover:underline"
        >
          Voir la fiche
        </button>
        {entreprise.siteWeb && (
          <a
            href={entreprise.siteWeb.startsWith('http') ? entreprise.siteWeb : `https://${entreprise.siteWeb}`}
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

export default EntrepriseCard;
