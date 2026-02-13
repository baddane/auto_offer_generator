
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
import JobCard from './components/JobCard';
import JobModal from './components/JobModal';
import { JobBasicInfo, FullJobOffer, ProcessingStatus, AIModel } from './types';
import { extractJobsFromImage, generateDetailedJobOffer } from './services/geminiService';
import { fetchAllJobs, saveJobOffer, testSupabaseConnection } from './services/supabaseService';

const App: React.FC = () => {
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');
  const [jobs, setJobs] = useState<FullJobOffer[]>([]);
  const [selectedJob, setSelectedJob] = useState<FullJobOffer | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const storedJobs = await fetchAllJobs();
        setJobs(storedJobs);
      } catch (err) {
        console.error("Échec du chargement initial", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadInitialData();
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Réinitialisation
    setStatus('extracting');
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        
        try {
          // ÉTAPE 1: Extraction des données brutes via Gemini Vision
          const basicJobs = await extractJobsFromImage(base64, selectedModel);
          
          if (!basicJobs || basicJobs.length === 0) {
            throw new Error("Aucune information lisible n'a été trouvée dans ce document.");
          }

          setStatus('generating');
          const generatedJobs: FullJobOffer[] = [];
          
          // ÉTAPE 2: Génération du contenu SEO pour chaque job trouvé
          for (const basicJob of basicJobs) {
            const fullJob = await generateDetailedJobOffer(basicJob, selectedModel);
            
            // ÉTAPE 3: Sauvegarde en base de données (Supabase)
            const saved = await saveJobOffer(fullJob);
            if (!saved) console.warn("L'offre n'a pas pu être archivée en base de données.");
            
            generatedJobs.push(fullJob);
          }
          
          setJobs(prev => [...generatedJobs, ...prev]);
          setStatus('completed');
          
          // Reset status après un court délai
          setTimeout(() => setStatus('idle'), 4000);
        } catch (e: any) {
          console.error("Process Error:", e);
          setError(e.message || "Une erreur inconnue est survenue lors de l'appel aux services IA.");
          setStatus('idle');
        }
      };
      reader.onerror = () => {
        setError("Erreur de lecture du fichier local.");
        setStatus('idle');
      };
      reader.readAsDataURL(file);
    } catch (e) {
      setError("Impossible de traiter ce fichier.");
      setStatus('idle');
    }

    // Reset input pour permettre de re-télécharger le même fichier si besoin
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerUpload = () => fileInputRef.current?.click();

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-7xl font-black text-slate-900 tracking-tight mb-6">
            Recrutement <br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-violet-600">Intelligent via IA</span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            Transformez vos fichiers (Images, PDF, Excel) en annonces d'emploi structurées et optimisées SEO instantanément.
          </p>

          <div className="flex justify-center mb-12">
            <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex items-center gap-1">
              <button 
                onClick={() => setSelectedModel('gemini')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${selectedModel === 'gemini' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                Google Gemini 3 Pro
              </button>
              <button 
                onClick={() => setSelectedModel('deepseek')}
                className={`flex items-center gap-2 px-6 py-3 rounded-xl font-bold text-sm transition-all duration-300 ${selectedModel === 'deepseek' ? 'bg-slate-900 text-white shadow-lg' : 'text-slate-500 hover:bg-slate-50'}`}
              >
                DeepSeek V3
              </button>
            </div>
          </div>
          
          {/* Bouton de test Supabase */}
          <div className="flex justify-center mb-8">
            <button 
              onClick={async () => {
                const success = await testSupabaseConnection();
                if (success) {
                  alert('Connexion Supabase réussie ! Les données peuvent être enregistrées.');
                } else {
                  alert('Erreur de connexion Supabase. Vérifiez vos clés API.');
                }
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
            >
              Tester la connexion Supabase
            </button>
          </div>
          
          <div className="flex flex-col items-center gap-6">
            <input 
              type="file" 
              ref={fileInputRef} 
              className="hidden" 
              accept="image/*,.pdf,.xlsx,.xls" 
              onChange={handleFileUpload} 
            />
            
            <button 
              onClick={triggerUpload}
              disabled={status !== 'idle'}
              className={`relative px-12 py-5 rounded-2xl font-black text-lg text-white shadow-2xl transition-all duration-300 transform active:scale-95 ${status === 'idle' ? 'bg-indigo-600 hover:bg-indigo-700 hover:-translate-y-1' : 'bg-slate-400 cursor-not-allowed'}`}
            >
              <div className="flex items-center gap-4 relative z-10">
                {status === 'idle' ? (
                  <>
                    <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" /></svg>
                    <span>Analyser avec {selectedModel === 'gemini' ? 'Gemini' : 'DeepSeek'}</span>
                  </>
                ) : (
                  <>
                    <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    <span>{status === 'extracting' ? 'Extraction des données...' : 'Rédaction SEO IA...'}</span>
                  </>
                )}
              </div>
            </button>
            
            {status === 'completed' && <p className="text-green-600 font-bold animate-bounce bg-green-50 px-4 py-2 rounded-full border border-green-100 flex items-center gap-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              Offres générées avec succès !
            </p>}
            
            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-medium max-w-xl shadow-sm flex flex-col items-center gap-2">
                <p className="text-center">{error}</p>
                <p className="text-xs opacity-60">Assurez-vous que vos clés API sont valides dans le fichier .env</p>
              </div>
            )}
          </div>
        </div>

        <div className="mt-24">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-slate-900">Toutes les offres</h2>
            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">{jobs.length} annonces</span>
          </div>

          {isInitialLoading ? (
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
               {[1,2,3].map(i => <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 h-64 animate-pulse"></div>)}
             </div>
          ) : jobs.length === 0 ? (
            <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
              <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
              </div>
              <p className="text-slate-500 text-lg font-medium">Aucune offre n'a encore été générée.</p>
              <button onClick={triggerUpload} className="mt-4 text-indigo-600 font-bold hover:underline">Importer votre premier fichier</button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {jobs.map((job) => <JobCard key={job.id} job={job} onView={setSelectedJob} />)}
            </div>
          )}
        </div>
      </main>

      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
    </div>
  );
};

export default App;
