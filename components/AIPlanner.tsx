import React, { useState } from 'react';
import { Sparkles, MapPin, Loader2, ArrowRight, X, PlusCircle } from 'lucide-react';
import { getAIRecommendations, isAIEnabled } from '../services/geminiService';
import { Recommendation } from '../types';

interface AIPlannerProps {
    onClose: () => void;
    onPlanEvent?: (data: { location: string, title?: string, type?: string }) => void;
}

const HOBBY_OPTIONS = [
    '☕ Coworking',
    '🎨 Art & Culture',
    '🍸 Social Drinks',
    '🏃 Sport & Fitness',
    '🎵 Musique Live',
    '🍕 Foodie',
    '📚 Lecture',
    '🎮 Gaming',
    '🧘 Yoga & Bien-être'
];

// Mock recommendations database
const MOCK_RECOMMENDATIONS: Record<string, Recommendation[]> = {
    'coworking': [
        {
            placeName: 'La Cantine Numérique',
            category: 'Coworking',
            description: 'Espace de coworking moderne en plein centre-ville avec wifi ultra-rapide et ambiance collaborative.',
            reason: 'Parfait pour les nomades digitaux : wifi fibré, café gratuit, et communauté active de freelances et entrepreneurs.'
        },
        {
            placeName: 'Anticafé Nantes',
            category: 'Café Coworking',
            description: 'Café-coworking avec formule tout inclus : boissons, snacks et wifi premium.',
            reason: 'Idéal pour travailler au calme tout en profitant de boissons illimitées et d\'une atmosphère conviviale.'
        }
    ],
    'art': [
        {
            placeName: 'Le Lieu Unique',
            category: 'Art & Culture',
            description: 'Centre culturel dans une ancienne biscuiterie avec expositions, concerts et bar lounge.',
            reason: 'Lieu emblématique mêlant art contemporain et vie sociale, parfait pour les créatifs et curieux.'
        },
        {
            placeName: 'Musée d\'Arts de Nantes',
            category: 'Musée',
            description: 'Musée d\'art rénové avec collections impressionnantes et espaces modernes.',
            reason: 'Découvrez l\'art du 13ème au 21ème siècle dans un cadre architectural exceptionnel.'
        }
    ],
    'drinks': [
        {
            placeName: 'Le Nid - Bar Panoramique',
            category: 'Bar',
            description: 'Bar au sommet de la Tour de Bretagne avec vue à 360° sur Nantes.',
            reason: 'Vue spectaculaire et ambiance unique pour rencontrer d\'autres voyageurs autour d\'un verre.'
        },
        {
            placeName: 'Café Cult',
            category: 'Bar Café',
            description: 'Bar branché du quartier Bouffay avec terrasse animée et cocktails créatifs.',
            reason: 'Atmosphère décontractée et clientèle internationale, idéal pour socialiser.'
        }
    ],
    'sport': [
        {
            placeName: 'Urban Soccer Nantes',
            category: 'Sport',
            description: 'Centre de sport indoor avec terrains de foot en salle et bar convivial.',
            reason: 'Rencontrez des locaux et d\'autres nomades autour d\'une passion commune pour le sport.'
        },
        {
            placeName: 'Keep Cool Fitness',
            category: 'Fitness',
            description: 'Salle de sport moderne ouverte 24/7 avec cours collectifs et coaching.',
            reason: 'Accès flexible pour maintenir votre routine sportive même en voyage.'
        }
    ],
    'musique': [
        {
            placeName: 'Le Ferrailleur',
            category: 'Musique Live',
            description: 'Salle de concert intimiste avec programmation rock, électro et concerts locaux.',
            reason: 'Découvrez la scène musicale locale dans une ambiance authentique et chaleureuse.'
        },
        {
            placeName: 'Stereolux',
            category: 'Salle de Concert',
            description: 'Grande salle de concerts et club avec artistes nationaux et internationaux.',
            reason: 'Événements musicaux variés et soirées clubbing pour vivre la vie nocturne nantaise.'
        }
    ],
    'foodie': [
        {
            placeName: 'Talensac Market',
            category: 'Marché Gastronomique',
            description: 'Marché couvert historique avec produits frais, fromages locaux et spécialités.',
            reason: 'Expérience culinaire authentique pour découvrir la gastronomie locale et rencontrer les producteurs.'
        },
        {
            placeName: 'La Cigale',
            category: 'Brasserie',
            description: 'Brasserie Belle Époque classée monument historique avec cuisine traditionnelle.',
            reason: 'Décor exceptionnel et cuisine française raffinée dans un lieu emblématique de Nantes.'
        }
    ],
    'lecture': [
        {
            placeName: 'Coiffard Librairie',
            category: 'Librairie Café',
            description: 'Grande librairie indépendante avec espace café et événements littéraires.',
            reason: 'Ambiance cosy pour lire, travailler ou participer à des rencontres d\'auteurs.'
        },
        {
            placeName: 'Bibliothèque Municipale',
            category: 'Bibliothèque',
            description: 'Médiathèque moderne avec espaces de lecture, wifi gratuit et collections variées.',
            reason: 'Lieu calme pour lire ou travailler avec accès à des milliers de livres et ressources.'
        }
    ],
    'gaming': [
        {
            placeName: 'Meltdown Nantes',
            category: 'Bar Gaming',
            description: 'Bar esport avec écrans géants, consoles et PC gaming disponibles.',
            reason: 'Communauté gaming active, tournois réguliers et ambiance conviviale pour les gamers.'
        },
        {
            placeName: 'Geek Café',
            category: 'Café Jeux',
            description: 'Café ludique avec bibliothèque de jeux de société et événements geek.',
            reason: 'Parfait pour rencontrer d\'autres passionnés de jeux dans une atmosphère détendue.'
        }
    ],
    'yoga': [
        {
            placeName: 'YogaWorks Nantes',
            category: 'Studio Yoga',
            description: 'Studio moderne proposant yoga, méditation et cours de bien-être.',
            reason: 'Cours variés adaptés à tous niveaux pour maintenir votre pratique en voyage.'
        },
        {
            placeName: 'Zen & Spa',
            category: 'Centre Bien-être',
            description: 'Centre de bien-être avec yoga, massages et espaces de relaxation.',
            reason: 'Échappée zen en pleine ville pour se ressourcer entre deux sessions de travail.'
        }
    ]
};

const getMockRecommendations = (hobbies: string[]): Recommendation[] => {
    const results: Recommendation[] = [];
    
    hobbies.forEach(hobby => {
        const key = hobby.toLowerCase().split(' ').pop() || '';
        
        if (key.includes('coworking')) {
            results.push(...MOCK_RECOMMENDATIONS.coworking);
        } else if (key.includes('art') || key.includes('culture')) {
            results.push(...MOCK_RECOMMENDATIONS.art);
        } else if (key.includes('drinks') || key.includes('social')) {
            results.push(...MOCK_RECOMMENDATIONS.drinks);
        } else if (key.includes('sport') || key.includes('fitness')) {
            results.push(...MOCK_RECOMMENDATIONS.sport);
        } else if (key.includes('musique') || key.includes('live')) {
            results.push(...MOCK_RECOMMENDATIONS.musique);
        } else if (key.includes('foodie')) {
            results.push(...MOCK_RECOMMENDATIONS.foodie);
        } else if (key.includes('lecture')) {
            results.push(...MOCK_RECOMMENDATIONS.lecture);
        } else if (key.includes('gaming')) {
            results.push(...MOCK_RECOMMENDATIONS.gaming);
        } else if (key.includes('yoga') || key.includes('bien-être')) {
            results.push(...MOCK_RECOMMENDATIONS.yoga);
        }
    });
    
    // Remove duplicates and limit to 4 results
    const unique = results.filter((rec, index, self) => 
        index === self.findIndex(r => r.placeName === rec.placeName)
    );
    
    return unique.slice(0, 4);
};

export const AIPlanner: React.FC<AIPlannerProps> = ({ onClose, onPlanEvent }) => {
  const [city, setCity] = useState('Nantes, France');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>(['☕ Coworking', '🍸 Social Drinks']);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);

  const toggleHobby = (hobby: string) => {
    setSelectedHobbies(prev => 
      prev.includes(hobby) 
        ? prev.filter(h => h !== hobby)
        : [...prev, hobby]
    );
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!city || selectedHobbies.length === 0) return;
    
    setLoading(true);
    
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let results: Recommendation[];
    
    if (isAIEnabled) {
        // Try to use real AI
        try {
            const interests = selectedHobbies.map(h => h.replace(/^.+\s/, '')); // Remove emoji
            results = await getAIRecommendations(city, interests);
        } catch (error) {
            console.log('AI not available, using mock data');
            results = getMockRecommendations(selectedHobbies);
        }
    } else {
        // Use mock data
        results = getMockRecommendations(selectedHobbies);
    }
    
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
             <div className="bg-secondary-dark rounded-3xl p-6 text-white mb-6 shadow-xl">
                <h3 className="text-2xl font-bold mb-2">Où êtes-vous ?</h3>
                <p className="text-neutral-400 text-sm mb-6">Trouvons les meilleurs endroits pour vous aujourd'hui.</p>
                
                <form onSubmit={handleSearch} className="space-y-6">
                    <div className="relative">
                        <MapPin className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
                        <input 
                            type="text" 
                            value={city}
                            onChange={(e) => setCity(e.target.value)}
                            placeholder="ex: Nantes, France" 
                            className="w-full py-3 pl-12 pr-4 rounded-2xl bg-white text-text-main placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-orange transition-all"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold mb-3 text-neutral-200">Vos hobbies & intérêts</label>
                        <div className="flex flex-wrap gap-2">
                            {HOBBY_OPTIONS.map(hobby => (
                                <button
                                    key={hobby}
                                    type="button"
                                    onClick={() => toggleHobby(hobby)}
                                    className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
                                        selectedHobbies.includes(hobby)
                                            ? 'bg-primary-orange text-white shadow-lg shadow-orange-500/30'
                                            : 'bg-white/10 text-neutral-300 hover:bg-white/20'
                                    }`}
                                >
                                    {hobby}
                                </button>
                            ))}
                        </div>
                    </div>

                    <button 
                        type="submit"
                        disabled={loading || !city || selectedHobbies.length === 0}
                        className="w-full py-3 bg-primary-orange text-white rounded-2xl font-bold disabled:opacity-50 hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 shadow-lg"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Recherche en cours...
                            </>
                        ) : (
                            <>
                                <Sparkles className="w-5 h-5" />
                                Trouver des suggestions
                            </>
                        )}
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