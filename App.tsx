import React, { useState, useEffect } from 'react';
import { ViewState, Trip } from './types';
import { MapHomeView } from './components/MapHomeView';
import { FutureTripsView } from './components/FutureTripsView';
import { ChatView } from './components/ChatView';
import { AIPlanner } from './components/AIPlanner';
import { OnboardingView } from './components/OnboardingView';
import { Map, Plane, MessageCircle, User } from 'lucide-react';

// Mock Trip Data
const MOCK_TRIPS: Trip[] = [
  { id: 't1', destination: 'Bali, Indonesia', startDate: '15 Nov', endDate: '15 Déc', matches: 12 },
  { id: 't2', destination: 'Lisbon, Portugal', startDate: '10 Jan', endDate: '10 Fév', matches: 8 },
];

function App() {
  // Check local storage for first launch
  const isFirstLaunch = !localStorage.getItem('nomad_onboarding_done');
  
  const [viewState, setViewState] = useState<ViewState>(
    isFirstLaunch ? ViewState.ONBOARDING : ViewState.EXPLORE
  );
  const [userProfile, setUserProfile] = useState({ name: 'Moi', age: 0 });
  const [showAIPlanner, setShowAIPlanner] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  
  // State to pass data from AI Planner to MapHomeView creation modal
  const [preFilledEvent, setPreFilledEvent] = useState<{ location: string, title?: string, type?: string } | null>(null);

  // Load user profile if exists
  useEffect(() => {
    const savedProfile = localStorage.getItem('nomad_user_profile');
    if (savedProfile) {
        setUserProfile(JSON.parse(savedProfile));
    }
  }, []);

  const handleOnboardingComplete = (data: { name: string, age: number }) => {
    setUserProfile(data);
    localStorage.setItem('nomad_user_profile', JSON.stringify(data));
    localStorage.setItem('nomad_onboarding_done', 'true');
    setViewState(ViewState.EXPLORE);
  };

  const handleOpenChat = (id: string) => {
    setActiveChatId(id);
    setViewState(ViewState.CHAT_DETAIL);
  };

  const handleNavChange = (view: ViewState) => {
    if (view === ViewState.CHATS) {
        setActiveChatId(null);
    }
    setViewState(view);
  }

  const handlePlanEvent = (data: { location: string, title?: string, type?: string }) => {
    setPreFilledEvent(data);
    setShowAIPlanner(false);
    setViewState(ViewState.EXPLORE);
  };

  const renderContent = () => {
    if (viewState === ViewState.ONBOARDING) {
        return <OnboardingView onComplete={handleOnboardingComplete} />;
    }

    if (showAIPlanner) {
        return <AIPlanner onClose={() => setShowAIPlanner(false)} onPlanEvent={handlePlanEvent} />;
    }

    switch (viewState) {
      case ViewState.EXPLORE:
        return <MapHomeView 
            onSuggestClick={() => setShowAIPlanner(true)} 
            onChatClick={(id) => handleOpenChat(id)}
            userAvatar={`https://picsum.photos/seed/${userProfile.name || 'me'}/200`}
            preFilledEvent={preFilledEvent}
            onClearPreFilledEvent={() => setPreFilledEvent(null)}
        />;
      case ViewState.TRIPS:
        return <FutureTripsView trips={MOCK_TRIPS} />;
      case ViewState.CHATS:
        return <ChatView viewState={ViewState.CHATS} onBack={() => {}} onOpenChat={handleOpenChat} />;
      case ViewState.CHAT_DETAIL:
        return <ChatView viewState={ViewState.CHAT_DETAIL} onBack={() => setViewState(ViewState.EXPLORE)} onOpenChat={() => {}} />;
      default:
        return <div className="p-8">Vue non trouvée</div>;
    }
  };

  const NavButton = ({ view, icon: Icon, label, badgeCount }: { view: ViewState, icon: any, label: string, badgeCount?: number }) => {
      const isActive = viewState === view || (view === ViewState.CHATS && viewState === ViewState.CHAT_DETAIL);
      
      return (
        <button 
            onClick={() => handleNavChange(view)}
            className={`flex-1 flex flex-col items-center justify-center py-2 relative transition-colors ${isActive ? 'text-primary-orange' : 'text-gray-400'}`}
        >
            <div className="relative">
                <Icon className={`w-6 h-6 mb-1 ${isActive ? 'fill-current' : ''}`} strokeWidth={isActive ? 2.5 : 2} />
                {badgeCount && (
                    <span className="absolute -top-1 -right-2 bg-alert-red text-white text-[10px] font-bold px-1.5 rounded-full border border-white">
                        {badgeCount}
                    </span>
                )}
            </div>
            <span className="text-[10px] font-medium">{label}</span>
        </button>
      );
  }

  // Hide nav bar on Onboarding, Chat Detail or Full Screen Planner
  const showNav = viewState !== ViewState.ONBOARDING && !showAIPlanner && viewState !== ViewState.CHAT_DETAIL;

  return (
    <div className="flex flex-col h-screen bg-white max-w-md mx-auto shadow-2xl overflow-hidden relative border-x border-neutral-100 font-sans">
      
      {/* Main Content */}
      <main className="flex-1 relative overflow-hidden">
        {renderContent()}
      </main>

      {/* Bottom Navigation */}
      {showNav && (
          <nav className="bg-white border-t border-neutral-grey pb-safe px-6 h-[80px] flex items-center justify-between z-50">
            <NavButton view={ViewState.EXPLORE} icon={Map} label="Explorer" />
            <NavButton view={ViewState.TRIPS} icon={Plane} label="Voyages" />
            <NavButton view={ViewState.CHATS} icon={MessageCircle} label="Discussions" badgeCount={1} />
          </nav>
      )}
    </div>
  );
}

export default App;