import React, { useState } from 'react';
import { Sparkles, MapPin, Loader2, ArrowRight, X, PlusCircle } from 'lucide-react';
import { getAIRecommendations } from '../services/geminiService';
import { Recommendation } from '../types';

interface AIPlannerProps {
    onClose: () => void;
    onPlanEvent?: (data: { location: string, title?: string, type?: string }) => void;
}

export const AIPlanner: React.FC<AIPlannerProps> = ({ onClose, onPlanEvent }) => {
  const [city, setCity] = useState('Nantes, France');
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city) return;
    
    setLoading(true);
    const interests = ["Digital Nomad Friendly", "Social Atmosphere", "Good Wifi", "Unique Experience"];
    const results = await getAIRecommendations(city, interests);
    setRecommendations(results);
    setLoading(false);
  };

  const mapCategoryToType = (category: string) => {
      const lower = category.toLowerCase();
      if (lower.includes('cowork') || lower.includes('travail') || lower.includes('cafe') || lower.includes('wifi')) return 'cowork';
      if (lower.includes('bar') || lower.includes('boire') || lower.includes('pub')) return 'drinks';
      if (lower.includes('restaurant') || lower.includes('manger') || lower.includes('food')) return 'food';
      return 'drinks'; // default
  };

  return (
    <div className="absolute inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom duration-300">
        <div className="p-4 flex items-center justify-between border-b border-neutral-grey">
            <h2 className="text-xl font-bold flex items-center gap-2 text-primary-orange">
                <Sparkles className="w-5 h-5 fill-current" />
                Suggestion IA
            </h2>
            <button onClick={onClose} className="p-2 bg-neutral-grey rounded-full hover:bg-neutral-200">
                <X className="w-5 h-5 text-text-main" />
            </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
             <div className="bg-secondary-dark rounded-3xl p-6 text-white mb-8 shadow-xl">
                <h3 className="text-2xl font-bold mb-2">Où êtes-vous ?</h3>
                <p className="text-neutral-400 text-sm mb-6">Trouvons les meilleurs endroits pour vous aujourd'hui.</p>
                
                <form onSubmit={handleSearch} className="relative">
                    <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                    <input 
                        type="text" 
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="ex: Nantes, France" 
                        className="w-full py-3 pl-12 pr-12 rounded-2xl bg-white text-text-main placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange transition-all"
                    />
                    <button 
                        type="submit"
                        disabled={loading || !city}
                        className="absolute right-2 top-2 p-1.5 bg-primary-orange text-white rounded-xl disabled:opacity-50 hover:bg-orange-600 transition-colors"
                    >
                        {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <ArrowRight className="w-5 h-5" />}
                    </button>
                </form>
            </div>

            {recommendations.length > 0 && (
                <div className="space-y-4 animate-in fade-in duration-500 pb-20">
                    <h3 className="font-bold text-text-main text-lg ml-1">Recommandations pour vous</h3>
                    {recommendations.map((rec, idx) => (
                        <div key={idx} className="bg-neutral-50 p-5 rounded-3xl border border-neutral-grey shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                                <h4 className="font-bold text-lg text-text-main">{rec.placeName}</h4>
                                <span className="text-xs bg-primary-yellow/20 text-orange-700 px-3 py-1 rounded-full font-bold uppercase tracking-wider">{rec.category}</span>
                            </div>
                            <p className="text-sm text-text-secondary mb-4 leading-relaxed">{rec.description}</p>
                            <div className="bg-white p-4 rounded-2xl border border-neutral-grey flex gap-3 mb-4">
                                <Sparkles className="w-5 h-5 text-primary-orange shrink-0" />
                                <p className="text-xs text-text-main font-medium">
                                    {rec.reason}
                                </p>
                            </div>
                            
                            {onPlanEvent && (
                                <button 
                                    onClick={() => onPlanEvent({
                                        location: rec.placeName,
                                        title: `Rencontre à ${rec.placeName}`,
                                        type: mapCategoryToType(rec.category)
                                    })}
                                    className="w-full py-2.5 bg-primary-orange text-white font-bold rounded-xl flex items-center justify-center gap-2 active:scale-[0.98] transition-transform shadow-lg shadow-orange-500/20"
                                >
                                    <PlusCircle className="w-5 h-5" />
                                    Organiser ici
                                </button>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    </div>
  );
};