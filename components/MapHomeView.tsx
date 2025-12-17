import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { 
  Search, 
  ChevronRight, 
  Plus, 
  Bell, 
  MapPin, 
  MessageCircle,
  HeartHandshake,
  Accessibility,
  Info,
  X,
  Calendar,
  Clock,
  User,
  List,
  Map as MapIcon,
  Loader2
} from 'lucide-react';
import { ActivitiesView } from './ActivitiesView';
import { Activity } from '../types';
import { searchPlaces, PlaceResult } from '../services/geminiService';

interface MapHomeViewProps {
  onSuggestClick: () => void;
  onChatClick: (id: string) => void;
  userAvatar: string;
  preFilledEvent?: { location: string, title?: string, type?: string } | null;
  onClearPreFilledEvent?: () => void;
}

// Data Interfaces
interface Attendee {
  name: string;
  avatar: string;
  role?: string;
}

interface AppEvent {
  id: string;
  type: 'party' | 'drinks' | 'cowork' | 'association' | 'sport' | 'food';
  lat: number;
  lng: number;
  emoji: string;
  color: string;
  label: string;
  
  // Detailed info
  title: string;
  location: string;
  time?: string;
  price?: string;
  description?: string;
  tags?: string[];
  attendeeCountLabel: string;
  attendees: Attendee[];
  isAssociation?: boolean;
  organizer?: { name: string; type: string; verified: boolean };
}

// Updated Data matching JSON Spec
const INITIAL_EVENTS: AppEvent[] = [
  { 
    id: 'evt_drink_01', 
    type: 'drinks', 
    lat: 47.2150, 
    lng: -1.5520, 
    emoji: '🍸', 
    label: 'Bouffay Drinks', 
    color: '#FF7F32', // brand_primary
    title: "Apéro coucher de soleil",
    location: "Place du Bouffay",
    time: "19:00",
    attendeeCountLabel: "12 participants",
    attendees: [
      { name: "Marc", avatar: "https://picsum.photos/seed/marc/100" },
      { name: "Sophie", avatar: "https://picsum.photos/seed/sophie/100" },
      { name: "John", avatar: "https://picsum.photos/seed/john/100" }
    ]
  },
  { 
    id: 'evt_assoc_01', 
    type: 'association', 
    lat: 47.2120, 
    lng: -1.5500, 
    emoji: '🂡', 
    label: 'Tournoi de Belote', 
    color: '#20B2AA', // brand_teal_association
    title: "Venez jouer à la Belote 🂡",
    location: "Salle Municipale B, Rezé",
    time: "14:00 - 17:00",
    price: "Gratuit / Don libre",
    attendeeCountLabel: "Participants (Locaux & Nomades)",
    isAssociation: true,
    organizer: {
      name: "Les Aînés de Nantes",
      type: "Association Loi 1901",
      verified: true
    },
    description: "Partagez un moment convivial avec nos aînés ! Débutants bienvenus, nous enseignons les règles.",
    tags: ["Accessible Fauteuil", "Calme", "Débutants bienvenus"],
    attendees: [
      { name: "Jeanne (72)", avatar: "https://picsum.photos/seed/jeanne/100", role: "Hôte Local" },
      { name: "Pierre (68)", avatar: "https://picsum.photos/seed/pierre/100", role: "Hôte Local" }
    ]
  },
  { 
    id: 'evt_coffee_01', 
    type: 'cowork', 
    lat: 47.2090, 
    lng: -1.5580, 
    emoji: '☕', 
    label: 'Morning Coffee', 
    color: '#4A90E2', // brand_blue_leisure
    title: "Coffee Meetup & Cowork",
    location: "La Cantine Numérique",
    time: "09:30",
    attendeeCountLabel: "4 coworkers",
    description: "On commence la journée avec un bon café avant d'attaquer les mails.",
    attendees: [
      { name: "Alex", avatar: "https://picsum.photos/seed/alex/100" },
      { name: "Sarah", avatar: "https://picsum.photos/seed/sarah/100" }
    ]
  },
  { 
    id: 'evt_nantes_1', 
    type: 'party', 
    lat: 47.2000, 
    lng: -1.5710, 
    emoji: '🎉', 
    label: 'Hangar Party', 
    color: '#a855f7',
    title: "Verre afterwork au Nid ?",
    location: "Tour de Bretagne, Nantes",
    time: "20:30",
    attendeeCountLabel: "8 nomades présents",
    attendees: [
      { name: "Tamara", avatar: "https://picsum.photos/seed/tamara/100" }
    ]
  }
];

export const MapHomeView: React.FC<MapHomeViewProps> = ({ 
    onSuggestClick, 
    onChatClick, 
    userAvatar, 
    preFilledEvent,
    onClearPreFilledEvent 
}) => {
  const [events, setEvents] = useState<AppEvent[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isListView, setIsListView] = useState(false);
  
  // Search State
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Form State
  const [newEvent, setNewEvent] = useState({
    title: '',
    type: 'drinks' as AppEvent['type'],
    location: '',
    date: '',
    time: ''
  });

  // Location Search State
  const [placeSuggestions, setPlaceSuggestions] = useState<PlaceResult[]>([]);
  const [isSearchingPlace, setIsSearchingPlace] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.LayerGroup | null>(null);

  const selectedEvent = events.find(e => e.id === selectedEventId);

  // Derived filtered events
  const filteredEvents = events.filter(e => {
    const q = searchQuery.toLowerCase();
    return (
        e.title.toLowerCase().includes(q) ||
        e.location.toLowerCase().includes(q) ||
        e.label.toLowerCase().includes(q) ||
        e.type.toLowerCase().includes(q)
    );
  });

  // Initialize Map (Runs once)
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Prevent double init

    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: false
    }).setView([47.2150, -1.5550], 14);

    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
      subdomains: 'abcd',
      maxZoom: 20
    }).addTo(map);

    // User Location
    const userIcon = L.divIcon({
      className: 'custom-div-icon',
      html: `
        <div class="relative w-full h-full flex items-center justify-center">
           <div class="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg relative z-10"></div>
           <div class="absolute w-full h-full bg-blue-500 rounded-full animate-ping opacity-20"></div>
        </div>
      `,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });
    L.marker([47.2100, -1.5550], { icon: userIcon, zIndexOffset: -10 }).addTo(map);

    mapRef.current = map;
    markersRef.current = L.layerGroup().addTo(map);
    
    // Initial marker render
    updateMarkers();

  }, []); // Empty dependency array ensures map is only created once

  // Handle View Switching (Map <-> List)
  useEffect(() => {
    if (!isListView && mapRef.current) {
        // When coming back to map view, force a resize calculation to avoid gray tiles
        setTimeout(() => {
            mapRef.current?.invalidateSize();
        }, 100);
    }
  }, [isListView]);

  const updateMarkers = () => {
      if (!mapRef.current || !markersRef.current) return;

      markersRef.current.clearLayers();

      filteredEvents.forEach(event => {
         const iconHtml = `
            <div class="marker-container relative">
               <div class="marker-label" style="color: ${event.color}">${event.label}</div>
               <div class="marker-pin" style="background-color: ${event.color}; border-color: white; color: white;">
                  ${event.emoji}
               </div>
            </div>
          `;

          const customIcon = L.divIcon({
            className: 'custom-div-icon',
            html: iconHtml,
            iconSize: [40, 40],
            iconAnchor: [20, 20]
          });

          const m = L.marker([event.lat, event.lng], { icon: customIcon });
          
          m.on('click', () => {
            setSelectedEventId(event.id);
            mapRef.current?.setView([event.lat, event.lng], 15, { animate: true });
          });

          m.addTo(markersRef.current!);
      });
  };

  // Update Markers when events or search query change
  useEffect(() => {
    updateMarkers();
  }, [events, searchQuery]);

  // Handle pre-filled event
  useEffect(() => {
    if (preFilledEvent) {
        const now = new Date();
        now.setMinutes(now.getMinutes() + 30);
        const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        const dateStr = now.toISOString().split('T')[0];

        setNewEvent({
            title: preFilledEvent.title || '',
            type: (preFilledEvent.type as any) || 'drinks',
            location: preFilledEvent.location,
            date: dateStr,
            time: timeStr
        });
        setShowCreateModal(true);
        if (onClearPreFilledEvent) onClearPreFilledEvent();
    }
  }, [preFilledEvent]);

  // Debounced search effect for Create Event
  useEffect(() => {
    const timer = setTimeout(async () => {
      if (newEvent.location.length > 2 && showSuggestions) {
        setIsSearchingPlace(true);
        const results = await searchPlaces(newEvent.location);
        setPlaceSuggestions(results);
        setIsSearchingPlace(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, [newEvent.location, showSuggestions]);

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewEvent({...newEvent, location: e.target.value});
    setShowSuggestions(true);
    if (e.target.value.length <= 2) {
      setPlaceSuggestions([]);
    }
  };

  const selectPlace = (place: PlaceResult) => {
    setNewEvent({...newEvent, location: `${place.name}`});
    setShowSuggestions(false);
  };

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear search to ensure new event is visible
    setSearchQuery('');
    
    let emoji = '📅';
    let color = '#3b82f6';
    switch(newEvent.type) {
        case 'party': emoji = '🎉'; color = '#a855f7'; break;
        case 'drinks': emoji = '🍸'; color = '#FF7F32'; break;
        case 'cowork': emoji = '☕'; color = '#4A90E2'; break;
        case 'sport': emoji = '⚽'; color = '#10b981'; break;
        case 'food': emoji = '🍔'; color = '#ef4444'; break;
    }

    // Add some random offset to current center or default
    // In a real app we'd geocode the chosen location address
    const lat = 47.2184 + (Math.random() - 0.5) * 0.01;
    const lng = -1.5536 + (Math.random() - 0.5) * 0.01;

    const createdEvent: AppEvent = {
        id: Date.now().toString(),
        type: newEvent.type,
        lat,
        lng,
        emoji,
        color,
        label: newEvent.type.charAt(0).toUpperCase() + newEvent.type.slice(1),
        title: newEvent.title,
        location: newEvent.location,
        time: `${newEvent.time}`,
        attendeeCountLabel: "1 participant (Vous)",
        attendees: [
            { name: "Moi", avatar: userAvatar, role: "Organisateur" }
        ]
    };

    setEvents(prev => [...prev, createdEvent]);
    setShowCreateModal(false);
    setSelectedEventId(createdEvent.id);
    
    // Fly to new event location
    if (mapRef.current) {
        mapRef.current.flyTo([lat, lng], 16, { duration: 1.5 });
    }

    setNewEvent({ title: '', type: 'drinks', location: '', date: '', time: '' });
    setPlaceSuggestions([]);
  };

  // Map AppEvents to Activity for List View
  const mapEventsToActivities = (): Activity[] => {
      return filteredEvents.map(evt => ({
          id: evt.id,
          title: evt.title,
          type: evt.type === 'drinks' ? 'Drink' : evt.type === 'cowork' ? 'Coworking' : evt.type === 'party' ? 'Other' : 'Explore',
          description: evt.description || "Pas de description",
          location: evt.location,
          time: evt.time || 'Maintenant',
          hostId: 'unknown',
          hostName: evt.organizer?.name || 'Un Nomade',
          attendees: evt.attendees.length
      }));
  };

  return (
    <div className="relative h-full w-full bg-neutral-grey overflow-hidden">
      {/* Header */}
      <header className="absolute top-0 left-0 right-0 z-50 px-4 py-4 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto shadow-md rounded-full bg-white p-0.5">
            <img src={userAvatar} alt="Profile" className="w-9 h-9 rounded-full" />
        </div>
        
        <div className="font-bold text-xl tracking-tight text-secondary-dark pointer-events-auto flex items-center gap-1 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
            nomad-nantes
        </div>

        <div className="flex gap-2 pointer-events-auto">
            <button className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm relative text-secondary-dark hover:bg-neutral-50">
                <Bell className="w-5 h-5" />
                <span className="absolute top-0 right-0 bg-alert-red text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full border-2 border-white">3</span>
            </button>
        </div>
      </header>

      {/* Main Content: Map or List */}
      
      {/* Map is always rendered to preserve state, but hidden via visibility when list is active */}
      <div 
         id="map-container" 
         ref={mapContainerRef} 
         className={`absolute inset-0 z-0 bg-slate-200 ${isListView ? 'invisible' : 'visible'}`} 
      />

      {/* List View Overlay */}
      {isListView && (
         <div className="absolute inset-0 pt-20 bg-neutral-grey z-10 animate-in fade-in duration-200">
            <ActivitiesView activities={mapEventsToActivities()} />
         </div>
      )}

      {/* Top Overlays */}
      <div className={`absolute top-24 left-4 z-40 flex flex-col items-start gap-3 transition-all duration-300 ${isListView ? 'hidden' : 'block'}`}>
        
        {/* Expandable Search Bar */}
        <div className={`transition-all duration-300 ${isSearchOpen ? 'w-64' : 'w-10'}`}>
            {isSearchOpen ? (
                <div className="flex items-center w-full bg-white rounded-full shadow-lg border border-slate-100 overflow-hidden">
                    <div className="pl-3 text-gray-400">
                        <Search className="w-4 h-4" />
                    </div>
                    <input 
                        type="text"
                        autoFocus
                        placeholder="Chercher..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full py-2.5 px-2 outline-none text-sm font-medium text-text-main bg-transparent"
                    />
                    <button onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }} className="p-2 text-gray-400 hover:text-gray-600">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            ) : (
                <button 
                    onClick={() => setIsSearchOpen(true)}
                    className="w-10 h-10 bg-white rounded-full shadow-lg border border-slate-100 flex items-center justify-center text-text-main hover:bg-gray-50"
                >
                    <Search className="w-5 h-5" />
                </button>
            )}
        </div>

        <button 
            onClick={onSuggestClick}
            className="bg-white px-4 py-2.5 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 text-text-main font-bold text-sm animate-bounce hover:bg-gray-50"
        >
            Suggérer ✨
        </button>
      </div>

      <div className={`absolute top-24 right-4 z-40 ${isListView ? 'hidden' : 'block'}`}>
        <button className="bg-white/90 backdrop-blur pl-1 pr-3 py-1 rounded-full shadow-lg border border-slate-100 flex items-center gap-2 hover:bg-white transition-colors">
            <div className="relative w-8 h-8">
                <img src="https://picsum.photos/seed/traveler/100" className="w-8 h-8 rounded-full border border-white" />
                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border border-white"></div>
            </div>
            <div className="flex flex-col items-start mr-1">
                <span className="text-xs font-extrabold text-text-main">35 Nomades</span>
                <span className="text-[10px] text-text-secondary font-medium">À Nantes</span>
            </div>
            <ChevronRight className="w-3 h-3 text-text-secondary" />
        </button>
      </div>

      {/* Bottom Controls */}
      {/* List Toggle */}
      <div className="absolute bottom-24 left-4 z-40">
        <button 
            onClick={() => setIsListView(!isListView)}
            className="px-4 py-2.5 bg-white text-text-main font-bold rounded-full shadow-lg shadow-gray-200 border border-slate-100 flex items-center gap-2 active:scale-95 transition-transform"
        >
            {isListView ? <MapIcon className="w-5 h-5" /> : <List className="w-5 h-5" />}
            {isListView ? 'Carte' : 'Liste'}
        </button>
      </div>

      {/* Create Event FAB */}
      <div className="absolute bottom-24 right-4 z-40">
        <button 
            onClick={() => setShowCreateModal(true)}
            className="w-14 h-14 bg-gradient-to-tr from-primary-orange to-orange-400 rounded-full shadow-xl shadow-orange-500/30 flex items-center justify-center text-white transition-transform active:scale-90 hover:scale-105"
        >
            <Plus className="w-7 h-7" />
        </button>
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
          <div className="absolute inset-0 z-50 flex items-end justify-center bg-black/40 backdrop-blur-sm p-4">
              <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 mb-4 flex flex-col max-h-[90vh]">
                  <div className="flex justify-between items-center mb-6 shrink-0">
                      <h2 className="text-xl font-bold text-text-main">Créer une activité</h2>
                      <button onClick={() => setShowCreateModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200">
                          <X className="w-5 h-5 text-gray-500" />
                      </button>
                  </div>

                  <form onSubmit={handleCreateSubmit} className="space-y-4 overflow-y-auto flex-1 pb-4">
                      {/* Location First */}
                      <div className="relative">
                          <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Lieu (Où ?)</label>
                          <div className="relative">
                              <input 
                                  type="text" 
                                  required
                                  placeholder="Rechercher..."
                                  value={newEvent.location}
                                  onChange={handleLocationChange}
                                  onFocus={() => setShowSuggestions(true)}
                                  className="w-full p-3 bg-neutral-grey rounded-xl outline-none focus:ring-2 focus:ring-primary-orange pr-10"
                              />
                              <div className="absolute right-3 top-3 text-gray-400">
                                  {isSearchingPlace ? <Loader2 className="w-5 h-5 animate-spin" /> : <Search className="w-5 h-5" />}
                              </div>
                          </div>
                          {/* Suggestions Dropdown */}
                          {showSuggestions && placeSuggestions.length > 0 && (
                              <div className="absolute left-0 right-0 top-full mt-2 bg-white rounded-xl shadow-xl border border-gray-100 z-50 overflow-hidden max-h-48 overflow-y-auto">
                                  {placeSuggestions.map((place, idx) => (
                                      <div 
                                          key={idx} 
                                          onClick={() => selectPlace(place)}
                                          className="p-3 hover:bg-gray-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-none transition-colors"
                                      >
                                          <div className="flex-1 min-w-0">
                                              <h4 className="font-bold text-sm text-text-main truncate">{place.name}</h4>
                                              <p className="text-xs text-text-secondary truncate">{place.address}</p>
                                          </div>
                                      </div>
                                  ))}
                              </div>
                          )}
                      </div>

                      {/* Title Second */}
                      <div>
                          <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Titre (Quoi ?)</label>
                          <input 
                              type="text" 
                              required
                              placeholder="ex: Session Coworking..."
                              value={newEvent.title}
                              onChange={e => setNewEvent({...newEvent, title: e.target.value})}
                              className="w-full p-3 bg-neutral-grey rounded-xl outline-none focus:ring-2 focus:ring-primary-orange"
                          />
                      </div>

                      {/* Date & Time Third */}
                      <div className="grid grid-cols-2 gap-4">
                          <div>
                              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Date</label>
                              <input 
                                  type="date" 
                                  required
                                  value={newEvent.date}
                                  onChange={e => setNewEvent({...newEvent, date: e.target.value})}
                                  className="w-full p-3 bg-neutral-grey rounded-xl outline-none focus:ring-2 focus:ring-primary-orange"
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Heure</label>
                              <input 
                                  type="time" 
                                  required
                                  value={newEvent.time}
                                  onChange={e => setNewEvent({...newEvent, time: e.target.value})}
                                  className="w-full p-3 bg-neutral-grey rounded-xl outline-none focus:ring-2 focus:ring-primary-orange"
                              />
                          </div>
                      </div>

                      {/* Type Last */}
                      <div>
                          <label className="block text-xs font-bold text-text-secondary uppercase mb-1">Type</label>
                          <select 
                            value={newEvent.type}
                            onChange={e => setNewEvent({...newEvent, type: e.target.value as any})}
                            className="w-full p-3 bg-neutral-grey rounded-xl outline-none focus:ring-2 focus:ring-primary-orange"
                          >
                              <option value="drinks">🍸 Verre</option>
                              <option value="cowork">☕ Coworking</option>
                              <option value="party">🎉 Soirée</option>
                              <option value="food">🍔 Repas</option>
                              <option value="sport">⚽ Sport</option>
                          </select>
                      </div>

                      <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-xl text-xs text-blue-700 font-medium">
                          <User className="w-4 h-4" />
                          Créé par Vous (Organisateur)
                      </div>

                      <button 
                          type="submit" 
                          className="w-full py-3.5 mt-2 bg-primary-orange text-white font-bold rounded-2xl shadow-lg shadow-orange-500/20 active:scale-[0.98] transition-transform"
                      >
                          Publier l'activité
                      </button>
                  </form>
              </div>
          </div>
      )}

      {/* Detail Bottom Sheet Modal - Only show if not in list view or handle click in list view separately */}
      {selectedEvent && !isListView && (
          <div className="absolute inset-0 z-50 flex flex-col justify-end bg-black/20 backdrop-blur-sm" onClick={() => setSelectedEventId(null)}>
              <div 
                className="bg-white rounded-t-[32px] p-6 shadow-2xl animate-in slide-in-from-bottom duration-300 pb-10 max-h-[80vh] overflow-y-auto"
                onClick={(e) => e.stopPropagation()}
              >
                  <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6"></div>
                  
                  {selectedEvent.isAssociation && (
                    <div className="mb-3 flex items-center gap-2">
                         <span className="px-2 py-1 bg-[#20B2AA]/10 text-[#20B2AA] text-[10px] font-bold uppercase tracking-wider rounded-md border border-[#20B2AA]/20">
                             Association Locale
                         </span>
                         {selectedEvent.organizer?.verified && (
                             <span className="flex items-center gap-1 text-[10px] text-gray-500 font-medium">
                                 <HeartHandshake className="w-3 h-3 text-[#20B2AA]" />
                                 {selectedEvent.organizer.name}
                             </span>
                         )}
                    </div>
                  )}

                  <div className="flex items-start justify-between mb-2">
                     <h2 className="text-xl font-bold text-text-main leading-tight max-w-[85%]">
                        {selectedEvent.title}
                     </h2>
                     <button onClick={() => setSelectedEventId(null)} className="p-1 bg-gray-100 rounded-full">
                         <ChevronRight className="w-5 h-5 rotate-90 text-gray-500" />
                     </button>
                  </div>
                  
                  <div className="space-y-1 mb-4">
                      <p className="text-sm text-text-secondary flex items-center gap-1.5 font-medium">
                        <MapPin className="w-4 h-4 text-primary-orange" /> {selectedEvent.location}
                      </p>
                      {selectedEvent.time && (
                         <p className="text-xs text-text-secondary pl-6 flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {selectedEvent.time}
                         </p>
                      )}
                      {selectedEvent.price && (
                         <p className="text-xs text-text-secondary pl-6">
                            💶 {selectedEvent.price}
                         </p>
                      )}
                  </div>

                  {selectedEvent.tags && (
                      <div className="flex flex-wrap gap-2 mb-4">
                          {selectedEvent.tags.map(tag => (
                              <span key={tag} className="px-2 py-1 bg-neutral-100 text-text-secondary text-xs rounded-lg flex items-center gap-1">
                                  {tag.includes('Accessible') ? <Accessibility className="w-3 h-3"/> : <Info className="w-3 h-3"/>}
                                  {tag}
                              </span>
                          ))}
                      </div>
                  )}

                  {selectedEvent.description && (
                      <p className="text-sm text-text-main mb-6 leading-relaxed bg-neutral-50 p-3 rounded-xl border border-neutral-100">
                          {selectedEvent.description}
                      </p>
                  )}

                  <div className="flex flex-col gap-2 mb-8 p-4 bg-neutral-grey/50 rounded-2xl">
                      <div className="flex items-center gap-2 mb-2">
                           <span className="font-bold text-text-main text-sm">{selectedEvent.attendeeCountLabel}</span>
                      </div>
                      <div className="flex items-center justify-between">
                          <div className="flex -space-x-2.5">
                              {selectedEvent.attendees.map((att, i) => (
                                  <div key={i} className="relative group">
                                    <img src={att.avatar} className="w-8 h-8 rounded-full border-2 border-white ring-1 ring-gray-100" alt={att.name}/>
                                    {att.role && (
                                        <div className="absolute -bottom-4 left-1/2 -translate-x-1/2 bg-black/80 text-white text-[9px] px-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap z-10">
                                            {att.role}
                                        </div>
                                    )}
                                  </div>
                              ))}
                          </div>
                          {selectedEvent.isAssociation && (
                              <button className="text-xs font-bold text-[#20B2AA] hover:underline">
                                  Règles de la Belote ↗
                              </button>
                          )}
                      </div>
                  </div>

                  <div className="space-y-3">
                      <button 
                        onClick={() => onChatClick(selectedEvent.id)}
                        className={`w-full py-4 text-white font-bold rounded-2xl flex items-center justify-center gap-2 shadow-lg active:scale-[0.98] transition-transform ${
                            selectedEvent.isAssociation 
                                ? 'bg-[#20B2AA] shadow-[#20B2AA]/20' 
                                : 'bg-secondary-dark shadow-gray-900/10'
                        }`}
                      >
                          <MessageCircle className="w-5 h-5" />
                          {selectedEvent.isAssociation ? 'Rejoindre' : 'Rejoindre le chat'}
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};