
import React from 'react';
import { FullJobOffer } from '../types';

interface JobCardProps {
  job: FullJobOffer;
  onView: (job: FullJobOffer) => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, onView }) => {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 hover:shadow-md transition-all group flex flex-col justify-between h-full">
      <div>
        <div className="flex justify-between items-start mb-4">
          <span className="px-3 py-1 bg-indigo-50 text-indigo-700 text-xs font-bold rounded-full uppercase tracking-wider">
            {job.typeContrat}
          </span>
          <span className="text-slate-400 text-xs">{job.dateOffre}</span>
        </div>
        
        <h3 className="text-xl font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-2 leading-tight">
          {job.emploiMetier}
        </h3>
        
        <p className="text-slate-600 font-medium mb-1">{job.raisonSociale}</p>
        <div className="flex items-center text-slate-500 text-sm gap-1 mb-4">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          {job.ville}
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          {job.seoKeywords.slice(0, 3).map((tag, i) => (
            <span key={i} className="text-[10px] bg-slate-100 text-slate-500 px-2 py-0.5 rounded border border-slate-200">
              #{tag}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
        <button 
          onClick={() => onView(job)}
          className="text-indigo-600 font-semibold text-sm hover:underline"
        >
          Voir les détails
        </button>
        <a 
          href="http://www.anapec.org/sigec-app-rv/"
          target="_blank"
          rel="noopener noreferrer"
          className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors flex items-center gap-2"
        >
          Postuler
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
          </svg>
        </a>
      </div>
    </div>
  );
};

export default JobCard;
