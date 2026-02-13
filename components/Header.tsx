import React from 'react';

const Header: React.FC = () => {
  const isDemo = !process.env.API_KEY || process.env.API_KEY.includes("votre_cle");

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-200">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div>
              <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-violet-600">
                JobGenie AI
              </span>
              {isDemo && (
                <span className="ml-2 px-2 py-0.5 bg-amber-100 text-amber-700 text-[10px] font-bold rounded-md uppercase tracking-tight">
                  Mode Démo
                </span>
              )}
            </div>
          </div>
          
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex space-x-8">
              <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Tableau de bord</a>
              <a href="#" className="text-slate-600 hover:text-indigo-600 font-medium transition-colors">Archives</a>
            </nav>
          </div>

          <div className="flex items-center gap-4">
             <div className="h-8 w-[1px] bg-slate-200 mx-2 hidden sm:block"></div>
             <button className="bg-slate-50 border border-slate-200 text-slate-700 px-4 py-2 rounded-xl font-semibold hover:bg-slate-100 transition-all text-sm">
                Mon Compte
             </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;