import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, Plane } from 'lucide-react';

interface OnboardingViewProps {
  onComplete: (data: { name: string; age: number }) => void;
}

export const OnboardingView: React.FC<OnboardingViewProps> = ({ onComplete }) => {
  const [step, setStep] = useState(1);
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [loadingText, setLoadingText] = useState('Analyse des lieux sympas à Nantes...');

  // Validation logic: Name >= 2 chars, Age between 18 and 99
  const isValid = name.length >= 2 && parseInt(age) >= 18 && parseInt(age) <= 99;

  useEffect(() => {
    if (step === 2) {
        const sequences = [
            "Analyse des lieux sympas à Nantes...",
            "Recherche de partenaires de Belote...",
            `Personnalisation pour ${name}...`
        ];
        let i = 0;
        const interval = setInterval(() => {
            i++;
            if (i < sequences.length) setLoadingText(sequences[i]);
        }, 800); // Change text every 800ms

        const timeout = setTimeout(() => {
            onComplete({ name, age: parseInt(age) });
        }, 2500); // Complete after 2.5s

        return () => {
            clearInterval(interval);
            clearTimeout(timeout);
        };
    }
  }, [step, name, age, onComplete]);

  // Step 2: Loading Interstitial (AI Analysis)
  if (step === 2) {
      return (
          <div className="h-full flex flex-col items-center justify-center bg-primary-yellow p-8 text-center animate-in fade-in duration-500">
              <div className="relative mb-8">
                  <div className="absolute inset-0 bg-white/30 rounded-full animate-ping"></div>
                  <div className="w-20 h-20 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm">
                    <Sparkles className="w-10 h-10 text-white relative z-10 animate-pulse" />
                  </div>
              </div>
              <h2 className="text-2xl font-bold text-secondary-dark mb-2 transition-all duration-300">
                  {loadingText}
              </h2>
              <div className="w-48 h-1.5 bg-black/10 rounded-full mt-6 overflow-hidden">
                  <div className="h-full bg-secondary-dark/80 rounded-full animate-[progress_2.5s_ease-in-out_forwards]" style={{ width: '0%' }}></div>
              </div>
              <style>{`
                @keyframes progress {
                    0% { width: 0%; }
                    100% { width: 100%; }
                }
              `}</style>
          </div>
      );
  }

  // Step 1: Identity Form
  return (
    <div className="h-full bg-white p-6 flex flex-col pt-12 animate-in slide-in-from-right duration-300">
        <div className="flex-1 flex flex-col items-center justify-center text-center">
            <div className="w-24 h-24 bg-orange-100 rounded-full flex items-center justify-center mb-6 ring-4 ring-orange-50">
                <Plane className="w-10 h-10 text-primary-orange" />
            </div>
            <h1 className="text-3xl font-bold text-text-main mb-3">Bienvenue sur Nomadtable 👋</h1>
            <p className="text-text-secondary mb-10 leading-relaxed max-w-xs mx-auto">
                Dites-nous en un peu plus pour que notre IA puisse vous suggérer les meilleures activités autour de vous.
            </p>

            <div className="w-full space-y-5 text-left max-w-sm">
                <div>
                    <label className="block text-xs font-bold text-text-main uppercase mb-2 ml-1">Prénom</label>
                    <input 
                        type="text" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="ex: Thomas"
                        className="w-full p-4 bg-neutral-grey rounded-2xl outline-none focus:ring-2 focus:ring-primary-orange transition-all font-medium text-lg placeholder-gray-400"
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-text-main uppercase mb-2 ml-1">Âge</label>
                    <input 
                        type="number" 
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        placeholder="ex: 26"
                        className="w-full p-4 bg-neutral-grey rounded-2xl outline-none focus:ring-2 focus:ring-primary-orange transition-all font-medium text-lg placeholder-gray-400"
                    />
                    <p className="text-xs text-text-secondary mt-2 ml-1 flex items-center gap-1">
                        <span className="inline-block w-1 h-1 rounded-full bg-text-secondary"></span>
                        Utilisé pour vous matcher avec des groupes de votre génération.
                    </p>
                </div>
            </div>
        </div>

        <button 
            onClick={() => setStep(2)}
            disabled={!isValid}
            className="w-full py-4 bg-primary-orange text-white font-bold rounded-2xl shadow-xl shadow-orange-500/20 disabled:opacity-50 disabled:shadow-none active:scale-[0.98] transition-all flex items-center justify-center gap-2 text-lg"
        >
            Découvrir les activités
            <ArrowRight className="w-5 h-5" />
        </button>
    </div>
  );
};