import React from 'react';
import { User } from '../types';
import { MapPin, MessageCircle, ShieldCheck } from 'lucide-react';

interface NearbyViewProps {
  users: User[];
  onOpenProfile: (user: User) => void;
  isPremium: boolean;
}

export const NearbyView: React.FC<NearbyViewProps> = ({ users, onOpenProfile, isPremium }) => {
  // Simulate limiting visibility for free users
  const visibleUsers = isPremium ? users : users.slice(0, 4);

  return (
    <div className="pb-24 pt-4 px-4">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800">Voyageurs à proximité</h2>
        <div className="bg-brand-100 text-brand-700 px-3 py-1 rounded-full text-xs font-semibold">
          {isPremium ? 'Illimité' : `${visibleUsers.length} visibles`}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visibleUsers.map((user) => (
          <div 
            key={user.id} 
            className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden cursor-pointer hover:shadow-md transition-shadow"
            onClick={() => onOpenProfile(user)}
          >
            <div className="relative h-48">
              <img 
                src={user.avatar} 
                alt={user.name} 
                className="w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-12">
                <div className="flex items-center gap-2">
                  <h3 className="text-white text-xl font-bold truncate">{user.name}, {user.age}</h3>
                  {user.isVerified && <ShieldCheck className="w-4 h-4 text-blue-400 fill-current" />}
                </div>
                <p className="text-white/90 text-sm flex items-center gap-1">
                  <MapPin className="w-3 h-3" /> {user.origin} • {user.distance}
                </p>
              </div>
            </div>
            <div className="p-4">
              <p className="text-sm text-slate-500 mb-2 font-medium">{user.role}</p>
              <div className="flex flex-wrap gap-2 mb-4">
                {user.interests.slice(0, 3).map((interest, idx) => (
                  <span key={idx} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs rounded-md">
                    {interest}
                  </span>
                ))}
              </div>
              <button className="w-full py-2 bg-brand-50 text-brand-600 rounded-lg text-sm font-semibold hover:bg-brand-100 flex items-center justify-center gap-2">
                <MessageCircle className="w-4 h-4" />
                Dire Salut
              </button>
            </div>
          </div>
        ))}
      </div>

      {!isPremium && (
        <div className="mt-8 p-6 bg-gradient-to-r from-slate-900 to-slate-800 rounded-2xl text-center text-white relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-xl font-bold mb-2">Voir +20 voyageurs autour de vous</h3>
            <p className="text-slate-300 mb-4 text-sm">Passez à Nomadtable Plus pour débloquer la visibilité illimitée.</p>
            <button className="px-6 py-2 bg-accent-500 hover:bg-accent-600 text-white font-bold rounded-full transition-colors">
              Découvrir Plus
            </button>
          </div>
        </div>
      )}
    </div>
  );
};