import React, { useState } from 'react';
import { Activity } from '../types';
import { Calendar, Users, MapPin, Plus, Coffee, Beer, Compass, Laptop } from 'lucide-react';

interface ActivitiesViewProps {
  activities: Activity[];
}

const ActivityIcon = ({ type }: { type: Activity['type'] }) => {
  switch (type) {
    case 'Dinner': return <div className="p-2 bg-orange-100 text-orange-600 rounded-lg"><Calendar className="w-5 h-5" /></div>;
    case 'Drink': return <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Beer className="w-5 h-5" /></div>;
    case 'Coworking': return <div className="p-2 bg-blue-100 text-blue-600 rounded-lg"><Laptop className="w-5 h-5" /></div>;
    case 'Explore': return <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Compass className="w-5 h-5" /></div>;
    default: return <div className="p-2 bg-gray-100 text-gray-600 rounded-lg"><Coffee className="w-5 h-5" /></div>;
  }
};

export const ActivitiesView: React.FC<ActivitiesViewProps> = ({ activities }) => {
  const [filter, setFilter] = useState<'All' | Activity['type']>('All');

  const filteredActivities = filter === 'All' 
    ? activities 
    : activities.filter(a => a.type === filter);

  return (
    <div className="pb-24 pt-4 px-4 h-full overflow-y-auto no-scrollbar">
      <div className="flex justify-between items-end mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Activités</h2>
          <p className="text-slate-500 text-sm">Rejoignez des événements spontanés</p>
        </div>
        <button className="bg-brand-600 hover:bg-brand-700 text-white p-3 rounded-full shadow-lg transition-transform active:scale-95">
          <Plus className="w-6 h-6" />
        </button>
      </div>

      {/* Filters */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-2 no-scrollbar">
        {['All', 'Dinner', 'Drink', 'Explore', 'Coworking'].map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f as any)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              filter === f 
                ? 'bg-slate-800 text-white' 
                : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
            }`}
          >
            {f === 'All' ? 'Tout' : f === 'Dinner' ? 'Dîner' : f === 'Drink' ? 'Verre' : f === 'Explore' ? 'Exploration' : 'Co-working'}
          </button>
        ))}
      </div>

      <div className="space-y-4">
        {filteredActivities.map((activity) => (
          <div key={activity.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 hover:border-brand-200 transition-colors">
            <div className="flex gap-4">
              <ActivityIcon type={activity.type} />
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-lg text-slate-800">{activity.title}</h3>
                  <span className="text-xs font-semibold bg-slate-100 px-2 py-1 rounded text-slate-600">{activity.time}</span>
                </div>
                
                <p className="text-slate-600 text-sm mt-1 line-clamp-2">{activity.description}</p>
                
                <div className="flex items-center gap-4 mt-3 text-xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {activity.location}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users className="w-3 h-3" />
                    {activity.attendees} / {activity.maxAttendees || '∞'} participants
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <img src={`https://picsum.photos/seed/${activity.hostId}/30/30`} className="w-6 h-6 rounded-full" alt="host" />
                    <span className="text-xs text-slate-500">Par {activity.hostName}</span>
                  </div>
                  <button className="px-4 py-1.5 bg-brand-50 text-brand-600 text-xs font-bold rounded-lg hover:bg-brand-100 transition-colors">
                    Rejoindre
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};