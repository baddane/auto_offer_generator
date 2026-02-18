
import React, { useState, useRef, useEffect } from 'react';
import Header from './components/Header';
// Offres
import JobCard from './components/JobCard';
import JobModal from './components/JobModal';
// Entreprises
import EntrepriseCard from './components/EntrepriseCard';
import EntrepriseModal from './components/EntrepriseModal';
// Écoles
import EcoleCard from './components/EcoleCard';
import EcoleModal from './components/EcoleModal';
// Conseils
import ConseilCard from './components/ConseilCard';
import ConseilModal from './components/ConseilModal';

import {
  FullJobOffer,
  FullEntreprise,
  FullEcole,
  ConseilArticle,
  ProcessingStatus, AIModel, AppTab
} from './types';

// Services Offres (existant)
import { extractJobsFromImage, generateDetailedJobOffer } from './services/geminiService';
// Services Entreprises
import { extractEntreprisesFromImage, generateDetailedEntreprise } from './services/geminiServiceEntreprises';
// Services Écoles
import { extractEcolesFromImage, generateDetailedEcole } from './services/geminiServiceEcoles';
// Services Conseils
import { generateConseilArticle } from './services/geminiServiceConseils';
// Supabase
import {
  fetchAllJobs, saveJobOffer,
  fetchAllEntreprises, saveEntreprise,
  fetchAllEcoles, saveEcole,
  fetchAllConseils, saveConseil,
  testSupabaseConnection
} from './services/supabaseService';

// ─── Composant de navigation par onglets ──────────────────────────────────────

const TAB_CONFIG: { id: AppTab; label: string; color: string; activeColor: string }[] = [
  { id: 'offres',      label: 'Offres d\'emploi', color: 'text-slate-500 hover:bg-slate-50', activeColor: 'bg-indigo-600 text-white shadow-lg' },
  { id: 'entreprises', label: 'Entreprises',      color: 'text-slate-500 hover:bg-slate-50', activeColor: 'bg-emerald-600 text-white shadow-lg' },
  { id: 'ecoles',      label: 'Écoles',           color: 'text-slate-500 hover:bg-slate-50', activeColor: 'bg-violet-600 text-white shadow-lg' },
  { id: 'conseils',    label: 'Conseils',         color: 'text-slate-500 hover:bg-slate-50', activeColor: 'bg-amber-500 text-white shadow-lg' },
];

// ─── App ──────────────────────────────────────────────────────────────────────

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AppTab>('offres');
  const [status, setStatus] = useState<ProcessingStatus>('idle');
  const [selectedModel, setSelectedModel] = useState<AIModel>('gemini');
  const [error, setError] = useState<string | null>(null);
  const [isInitialLoading, setIsInitialLoading] = useState(true);

  // Données par section
  const [jobs, setJobs] = useState<FullJobOffer[]>([]);
  const [entreprises, setEntreprises] = useState<FullEntreprise[]>([]);
  const [ecoles, setEcoles] = useState<FullEcole[]>([]);
  const [conseils, setConseils] = useState<ConseilArticle[]>([]);

  // Modals
  const [selectedJob, setSelectedJob] = useState<FullJobOffer | null>(null);
  const [selectedEntreprise, setSelectedEntreprise] = useState<FullEntreprise | null>(null);
  const [selectedEcole, setSelectedEcole] = useState<FullEcole | null>(null);
  const [selectedConseil, setSelectedConseil] = useState<ConseilArticle | null>(null);

  // Champ texte pour Conseils
  const [conseilTitre, setConseilTitre] = useState('');
  const [conseilThematique, setConseilThematique] = useState('');

  // Ref input fichier
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ─── Chargement initial depuis Supabase ──────────────────────────────────────

  useEffect(() => {
    const loadAll = async () => {
      try {
        const [storedJobs, storedEntreprises, storedEcoles, storedConseils] = await Promise.all([
          fetchAllJobs(),
          fetchAllEntreprises(),
          fetchAllEcoles(),
          fetchAllConseils(),
        ]);
        setJobs(storedJobs);
        setEntreprises(storedEntreprises);
        setEcoles(storedEcoles);
        setConseils(storedConseils);
      } catch (err) {
        console.error("Échec du chargement initial", err);
      } finally {
        setIsInitialLoading(false);
      }
    };
    loadAll();
  }, []);

  // ─── Upload fichier (Offres, Entreprises, Écoles) ────────────────────────────

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setStatus('extracting');
    setError(null);

    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(',')[1];
        try {
          if (activeTab === 'offres') {
            const basicJobs = await extractJobsFromImage(base64, selectedModel);
            if (!basicJobs || basicJobs.length === 0) {
              throw new Error("Aucune information lisible n'a été trouvée dans ce document.");
            }
            setStatus('generating');
            const generated: FullJobOffer[] = [];
            for (const basicJob of basicJobs) {
              const full = await generateDetailedJobOffer(basicJob, selectedModel);
              await saveJobOffer(full);
              generated.push(full);
            }
            setJobs(prev => [...generated, ...prev]);

          } else if (activeTab === 'entreprises') {
            const basicEnts = await extractEntreprisesFromImage(base64, selectedModel);
            if (!basicEnts || basicEnts.length === 0) {
              throw new Error("Aucune entreprise lisible n'a été trouvée dans ce document.");
            }
            setStatus('generating');
            const generated: FullEntreprise[] = [];
            for (const basic of basicEnts) {
              const full = await generateDetailedEntreprise(basic, selectedModel);
              await saveEntreprise(full);
              generated.push(full);
            }
            setEntreprises(prev => [...generated, ...prev]);

          } else if (activeTab === 'ecoles') {
            const basicEcoles = await extractEcolesFromImage(base64, selectedModel);
            if (!basicEcoles || basicEcoles.length === 0) {
              throw new Error("Aucun établissement lisible n'a été trouvé dans ce document.");
            }
            setStatus('generating');
            const generated: FullEcole[] = [];
            for (const basic of basicEcoles) {
              const full = await generateDetailedEcole(basic, selectedModel);
              await saveEcole(full);
              generated.push(full);
            }
            setEcoles(prev => [...generated, ...prev]);
          }

          setStatus('completed');
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

    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const triggerUpload = () => fileInputRef.current?.click();

  // ─── Génération article Conseil ───────────────────────────────────────────────

  const handleGenerateConseil = async () => {
    if (!conseilTitre.trim()) {
      setError("Veuillez saisir un titre ou une thématique pour l'article.");
      return;
    }

    setStatus('generating');
    setError(null);

    try {
      const thematique = conseilThematique.trim() || 'Emploi & Carrière';
      const article = await generateConseilArticle(conseilTitre.trim(), thematique, selectedModel);
      const saved = await saveConseil(article);
      if (!saved) console.warn("L'article n'a pas pu être archivé en base de données.");
      setConseils(prev => [article, ...prev]);
      setStatus('completed');
      setConseilTitre('');
      setConseilThematique('');
      setTimeout(() => setStatus('idle'), 4000);
    } catch (e: any) {
      console.error("Conseil Error:", e);
      setError(e.message || "Une erreur est survenue lors de la génération de l'article.");
      setStatus('idle');
    }
  };

  // ─── Config par onglet ────────────────────────────────────────────────────────

  const tabMeta = {
    offres: {
      title: 'Offres d\'emploi',
      subtitle: 'Transformez vos fichiers (Images, PDF, Excel) en annonces d\'emploi structurées et optimisées SEO instantanément.',
      uploadLabel: 'Analyser le document',
      successMsg: 'Offres générées avec succès !',
      emptyMsg: 'Aucune offre n\'a encore été générée.',
      emptyAction: 'Importer votre premier fichier',
      count: jobs.length,
      countLabel: 'annonces',
      accentColor: 'bg-indigo-600 hover:bg-indigo-700',
      headingColor: 'from-indigo-600 to-violet-600',
    },
    entreprises: {
      title: 'Entreprises',
      subtitle: 'Importez une liste d\'entreprises et obtenez des fiches professionnelles SEO générées par IA, prêtes à être consultées.',
      uploadLabel: 'Analyser le document',
      successMsg: 'Fiches entreprises générées avec succès !',
      emptyMsg: 'Aucune entreprise n\'a encore été ajoutée.',
      emptyAction: 'Importer votre premier fichier',
      count: entreprises.length,
      countLabel: 'entreprises',
      accentColor: 'bg-emerald-600 hover:bg-emerald-700',
      headingColor: 'from-emerald-600 to-teal-600',
    },
    ecoles: {
      title: 'Écoles',
      subtitle: 'Importez une liste d\'établissements et obtenez des fiches détaillées SEO avec filières, niveaux d\'accès et présentation.',
      uploadLabel: 'Analyser le document',
      successMsg: 'Fiches écoles générées avec succès !',
      emptyMsg: 'Aucun établissement n\'a encore été ajouté.',
      emptyAction: 'Importer votre premier fichier',
      count: ecoles.length,
      countLabel: 'établissements',
      accentColor: 'bg-violet-600 hover:bg-violet-700',
      headingColor: 'from-violet-600 to-purple-600',
    },
    conseils: {
      title: 'Conseils',
      subtitle: 'Saisissez un titre ou une thématique et obtenez un article de blog complet, structuré et optimisé SEO en quelques secondes.',
      uploadLabel: '',
      successMsg: 'Article généré avec succès !',
      emptyMsg: 'Aucun article n\'a encore été généré.',
      emptyAction: 'Créer votre premier article',
      count: conseils.length,
      countLabel: 'articles',
      accentColor: 'bg-amber-500 hover:bg-amber-600',
      headingColor: 'from-amber-500 to-orange-500',
    },
  };

  const meta = tabMeta[activeTab];
  const isFileTab = activeTab !== 'conseils';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 pb-20">
      <Header />

      <main className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">

        {/* ── Navigation par onglets ── */}
        <div className="flex justify-center mb-12">
          <div className="bg-white p-1.5 rounded-2xl shadow-sm border border-slate-200 inline-flex items-center gap-1 flex-wrap justify-center">
            {TAB_CONFIG.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setError(null); setStatus('idle'); }}
                className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all duration-300 ${activeTab === tab.id ? tab.activeColor : tab.color}`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Hero / zone d'action ── */}
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-black text-slate-900 tracking-tight mb-6">
            {meta.title} <br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${meta.headingColor}`}>
              Optimisés par IA
            </span>
          </h1>
          <p className="text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed">
            {meta.subtitle}
          </p>

          {/* Sélecteur de modèle IA */}
          <div className="flex justify-center mb-10">
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

          {/* Bouton test Supabase */}
          <div className="flex justify-center mb-8">
            <button
              onClick={async () => {
                const success = await testSupabaseConnection();
                alert(success
                  ? 'Connexion Supabase réussie ! Les données peuvent être enregistrées.'
                  : 'Erreur de connexion Supabase. Vérifiez vos clés API.'
                );
              }}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-bold"
            >
              Tester la connexion Supabase
            </button>
          </div>

          {/* Zone d'action : Upload (Offres/Entreprises/Écoles) ou Formulaire texte (Conseils) */}
          <div className="flex flex-col items-center gap-6">
            {isFileTab ? (
              <>
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
                  className={`relative px-12 py-5 rounded-2xl font-black text-lg text-white shadow-2xl transition-all duration-300 transform active:scale-95 ${status === 'idle' ? `${meta.accentColor} hover:-translate-y-1` : 'bg-slate-400 cursor-not-allowed'}`}
                >
                  <div className="flex items-center gap-4 relative z-10">
                    {status === 'idle' ? (
                      <>
                        <svg className="w-7 h-7" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                        </svg>
                        <span>Analyser avec {selectedModel === 'gemini' ? 'Gemini' : 'DeepSeek'}</span>
                      </>
                    ) : (
                      <>
                        <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        <span>{status === 'extracting' ? 'Extraction des données...' : 'Rédaction SEO IA...'}</span>
                      </>
                    )}
                  </div>
                </button>
              </>
            ) : (
              /* Formulaire texte pour Conseils */
              <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-slate-200 p-8 text-left">
                <div className="mb-5">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Titre de l'article <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={conseilTitre}
                    onChange={e => setConseilTitre(e.target.value)}
                    placeholder="ex : Comment réussir son entretien d'embauche en 2025"
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    disabled={status !== 'idle'}
                  />
                </div>
                <div className="mb-6">
                  <label className="block text-sm font-bold text-slate-700 mb-2">
                    Thématique <span className="text-slate-400 font-normal">(optionnel)</span>
                  </label>
                  <input
                    type="text"
                    value={conseilThematique}
                    onChange={e => setConseilThematique(e.target.value)}
                    placeholder="ex : Emploi & Carrière, Formation, Recrutement..."
                    className="w-full px-4 py-3 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent transition"
                    disabled={status !== 'idle'}
                  />
                </div>
                <button
                  onClick={handleGenerateConseil}
                  disabled={status !== 'idle' || !conseilTitre.trim()}
                  className={`w-full py-4 rounded-2xl font-black text-lg text-white shadow-xl transition-all duration-300 transform active:scale-95 flex items-center justify-center gap-3 ${status === 'idle' && conseilTitre.trim() ? 'bg-amber-500 hover:bg-amber-600 hover:-translate-y-0.5' : 'bg-slate-300 cursor-not-allowed'}`}
                >
                  {status === 'generating' ? (
                    <>
                      <svg className="animate-spin h-6 w-6 text-white" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Rédaction de l'article en cours...
                    </>
                  ) : (
                    <>
                      <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                      Générer l'article SEO avec {selectedModel === 'gemini' ? 'Gemini' : 'DeepSeek'}
                    </>
                  )}
                </button>
              </div>
            )}

            {status === 'completed' && (
              <p className="text-green-600 font-bold animate-bounce bg-green-50 px-4 py-2 rounded-full border border-green-100 flex items-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                {meta.successMsg}
              </p>
            )}

            {error && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-2xl text-red-700 font-medium max-w-xl shadow-sm flex flex-col items-center gap-2">
                <p className="text-center">{error}</p>
                <p className="text-xs opacity-60">Assurez-vous que vos clés API sont valides dans le fichier .env</p>
              </div>
            )}
          </div>
        </div>

        {/* ── Grille de résultats ── */}
        <div className="mt-16">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-slate-900">
              {activeTab === 'offres' && 'Toutes les offres'}
              {activeTab === 'entreprises' && 'Toutes les entreprises'}
              {activeTab === 'ecoles' && 'Tous les établissements'}
              {activeTab === 'conseils' && 'Tous les articles'}
            </h2>
            <span className="bg-slate-200 text-slate-600 px-3 py-1 rounded-full text-xs font-bold">
              {meta.count} {meta.countLabel}
            </span>
          </div>

          {isInitialLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3].map(i => (
                <div key={i} className="bg-white rounded-3xl p-8 border border-slate-100 h-64 animate-pulse"></div>
              ))}
            </div>
          ) : (
            <>
              {/* OFFRES */}
              {activeTab === 'offres' && (
                jobs.length === 0 ? (
                  <EmptyState message={meta.emptyMsg} action={meta.emptyAction} onAction={triggerUpload} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {jobs.map(job => <JobCard key={job.id} job={job} onView={setSelectedJob} />)}
                  </div>
                )
              )}

              {/* ENTREPRISES */}
              {activeTab === 'entreprises' && (
                entreprises.length === 0 ? (
                  <EmptyState message={meta.emptyMsg} action={meta.emptyAction} onAction={triggerUpload} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {entreprises.map(e => <EntrepriseCard key={e.id} entreprise={e} onView={setSelectedEntreprise} />)}
                  </div>
                )
              )}

              {/* ÉCOLES */}
              {activeTab === 'ecoles' && (
                ecoles.length === 0 ? (
                  <EmptyState message={meta.emptyMsg} action={meta.emptyAction} onAction={triggerUpload} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {ecoles.map(e => <EcoleCard key={e.id} ecole={e} onView={setSelectedEcole} />)}
                  </div>
                )
              )}

              {/* CONSEILS */}
              {activeTab === 'conseils' && (
                conseils.length === 0 ? (
                  <EmptyState message={meta.emptyMsg} action={meta.emptyAction} onAction={() => {}} />
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {conseils.map(c => <ConseilCard key={c.id} conseil={c} onView={setSelectedConseil} />)}
                  </div>
                )
              )}
            </>
          )}
        </div>
      </main>

      {/* ── Modals ── */}
      <JobModal job={selectedJob} onClose={() => setSelectedJob(null)} />
      <EntrepriseModal entreprise={selectedEntreprise} onClose={() => setSelectedEntreprise(null)} />
      <EcoleModal ecole={selectedEcole} onClose={() => setSelectedEcole(null)} />
      <ConseilModal conseil={selectedConseil} onClose={() => setSelectedConseil(null)} />
    </div>
  );
};

// ─── Composant état vide ──────────────────────────────────────────────────────

const EmptyState: React.FC<{ message: string; action: string; onAction: () => void }> = ({ message, action, onAction }) => (
  <div className="bg-white border-2 border-dashed border-slate-200 rounded-[3rem] p-24 text-center">
    <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
      <svg className="w-10 h-10 text-slate-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    </div>
    <p className="text-slate-500 text-lg font-medium">{message}</p>
    {onAction && (
      <button onClick={onAction} className="mt-4 text-indigo-600 font-bold hover:underline">
        {action}
      </button>
    )}
  </div>
);

export default App;
