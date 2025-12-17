import React from 'react';
import { Trip } from '../types';
import { CalendarDays, MapPin, ArrowRight, MessageSquare, Plus } from 'lucide-react';

interface FutureTripsViewProps {
  trips: Trip[];
}

export const FutureTripsView: React.FC<FutureTripsViewProps> = ({ trips }) => {
  return (
    <div className="pb-24 pt-4 px-4 h-full overflow-y-auto bg-white">
      <h2 className="text-2xl font-bold text-text-main mb-2">Mes Voyages</h2>
      <p className="text-text-secondary mb-6">Planifiez vos rencontres avant d'arriver.</p>

      <div className="space-y-6">
        <button className="w-full p-4 border-2 border-dashed border-neutral-300 rounded-3xl flex items-center justify-center gap-2 text-text-secondary hover:border-primary-orange hover:text-primary-orange transition-colors">
            <Plus className="w-5 h-5" />
            <span className="font-medium">Ajouter une destination</span>
        </button>

        {trips.map((trip) => (
          <div key={trip.id} className="bg-white rounded-3xl shadow-sm border border-neutral-grey overflow-hidden">
            <div className="h-32 relative">
               <img 
                src={`https://picsum.photos/seed/${trip.destination}/600/200`} 
                alt={trip.destination} 
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                 <h3 className="text-white text-2xl font-bold flex items-center gap-2">
                    {trip.destination}
                 </h3>
              </div>
            </div>
            
            <div className="p-5">
              <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-text-secondary text-sm bg-neutral-grey px-3 py-1 rounded-full">
                    <CalendarDays className="w-4 h-4" />
                    <span>{trip.startDate} - {trip.endDate}</span>
                  </div>
              </div>

              <div className="flex items-center justify-between mb-5">
                 <div className="flex -space-x-2">
                        {[1,2,3,4].map(i => (
                            <img key={i} src={`https://picsum.photos/seed/${i+trip.matches}/40/40`} className="w-8 h-8 rounded-full border-2 border-white" alt="match"/>
                        ))}
                        <div className="w-8 h-8 rounded-full bg-neutral-200 border-2 border-white flex items-center justify-center text-[10px] font-bold text-text-secondary">
                            +{trip.matches}
                        </div>
                 </div>
                 <div className="text-right">
                     <span className="block text-xl font-bold text-primary-orange">{trip.matches}</span>
                     <span className="text-xs text-text-secondary">Voyageurs</span>
                 </div>
              </div>

              <button className="w-full flex items-center justify-center gap-2 py-3 bg-secondary-dark text-white rounded-3xl text-sm font-bold shadow-lg shadow-secondary-dark/20">
                <MessageSquare className="w-4 h-4" />
                Ouvrir le chat de groupe
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};