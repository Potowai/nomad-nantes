import React, { useState, useEffect } from 'react';
import { ViewState, ChatMessage } from '../types';
import { ArrowLeft, Search, Info, Plus, Send, Image as ImageIcon, Loader2 } from 'lucide-react';
import { initDB, getMessages, addMessage } from '../services/chatDb';

interface ChatViewProps {
  viewState: ViewState;
  onBack: () => void;
  onOpenChat: (id: string) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({ viewState, onBack, onOpenChat }) => {
  const [inputValue, setInputValue] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isDbReady, setIsDbReady] = useState(false);
  const currentChatId = 'chat_1'; // Hardcoded for single chat demo

  useEffect(() => {
    const loadData = async () => {
      await initDB();
      setIsDbReady(true);
      if (viewState === ViewState.CHAT_DETAIL) {
        setMessages(getMessages(currentChatId));
      }
    };
    loadData();
  }, [viewState]);

  const handleSendMessage = () => {
    if (!inputValue.trim()) return;
    
    const newMsg: ChatMessage = {
      id: Date.now().toString(),
      sender: 'Moi',
      text: inputValue,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      isMe: true,
      status: 'sent'
    };

    addMessage(currentChatId, newMsg);
    setMessages(getMessages(currentChatId)); // Refresh from DB
    setInputValue('');
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSendMessage();
    }
  };

  if (!isDbReady) {
    return (
      <div className="h-full flex items-center justify-center bg-white text-primary-orange">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  if (viewState === ViewState.CHATS) {
    // We only have one real chat in the DB for now, mocking the list view based on it
    const lastMsg = getMessages('chat_1').pop() || { 
      id: 'empty', 
      sender: 'Système', 
      text: 'Aucun message', 
      timestamp: '', 
      isMe: false,
      status: 'read'
    } as ChatMessage;
    
    return (
      <div className="h-full bg-white flex flex-col pt-4">
         <div className="px-4 mb-4 flex justify-between items-center">
             <h1 className="text-2xl font-bold text-text-main">Discussions</h1>
             <button className="p-2 bg-neutral-grey rounded-full"><Plus className="w-5 h-5 text-text-main"/></button>
         </div>
         
         <div className="flex-1 overflow-y-auto px-4 space-y-4">
            <div onClick={() => onOpenChat(currentChatId)} className="flex items-center gap-4 p-2 hover:bg-neutral-grey/50 rounded-xl cursor-pointer">
                <div className="relative">
                    <img src={`https://picsum.photos/seed/chat1/50`} className="w-14 h-14 rounded-full object-cover" />
                    <div className="absolute bottom-0 right-0 w-4 h-4 bg-status-success rounded-full border-2 border-white"></div>
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-text-main truncate">Rencontre Nomades Nantes</h3>
                        <span className="text-xs text-text-secondary">{lastMsg.timestamp}</span>
                    </div>
                    <p className="text-sm text-text-secondary truncate">
                      {lastMsg.isMe ? 'Vous : ' : ''}{lastMsg.text}
                    </p>
                </div>
            </div>
            {/* Some static mock chats to fill space */}
            <div className="flex items-center gap-4 p-2 opacity-60">
                <div className="relative">
                     <img src={`https://picsum.photos/seed/chat2/50`} className="w-14 h-14 rounded-full object-cover grayscale" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-baseline mb-1">
                        <h3 className="font-bold text-text-main truncate">Mission Co-working</h3>
                        <span className="text-xs text-text-secondary">Hier</span>
                    </div>
                    <p className="text-sm text-text-secondary truncate">Sarah : Des places vers Bouffay ?</p>
                </div>
            </div>
         </div>
      </div>
    );
  }

  // Chat Detail View
  return (
    <div className="h-full bg-white flex flex-col">
        {/* Header */}
        <div className="px-4 py-3 border-b border-neutral-grey flex items-center justify-between bg-white/95 backdrop-blur z-10">
            <div className="flex items-center gap-3">
                <button onClick={onBack} className="p-1 -ml-2 text-text-main">
                    <ArrowLeft className="w-6 h-6" />
                </button>
                <div className="flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {[1,2,3].map(i => <img key={i} src={`https://picsum.photos/seed/nantes${i}/30`} className="w-8 h-8 rounded-full border border-white" />)}
                    </div>
                    <div>
                        <h2 className="font-bold text-sm text-text-main leading-none">Rencontre Nomades Nantes</h2>
                        <span className="text-xs text-text-secondary">8 membres • Nantes</span>
                    </div>
                </div>
            </div>
            <div className="flex gap-3 text-text-main">
                <Search className="w-5 h-5" />
                <Info className="w-5 h-5" />
            </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-neutral-50">
            {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                    {!msg.isMe && (
                         <div className="w-8 h-8 rounded-full bg-gray-300 mr-2 self-end mb-1 overflow-hidden">
                             <img src={`https://picsum.photos/seed/${msg.sender}/30`} />
                         </div>
                    )}
                    <div className="max-w-[75%]">
                        {!msg.isMe && <p className="text-xs text-text-secondary ml-1 mb-0.5">{msg.sender}</p>}
                        <div 
                            className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                                msg.isMe 
                                ? 'bg-primary-yellow text-text-main rounded-br-none' 
                                : 'bg-white border border-gray-100 text-text-main rounded-bl-none shadow-sm'
                            }`}
                        >
                            {msg.text}
                        </div>
                        <div className={`flex items-center gap-1 mt-1 text-[10px] text-text-secondary ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                            <span>{msg.timestamp}</span>
                            {msg.isMe && msg.status === 'read' && <span className="font-bold text-primary-orange">Lu</span>}
                        </div>
                    </div>
                </div>
            ))}
        </div>

        {/* Input */}
        <div className="p-4 bg-white border-t border-neutral-grey flex items-center gap-3">
            <button className="text-primary-orange bg-orange-50 p-2 rounded-full">
                <Plus className="w-5 h-5" />
            </button>
            <div className="flex-1 relative">
                <input 
                    type="text" 
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyPress={handleKeyPress}
                    placeholder="Envoyer un message"
                    className="w-full bg-neutral-grey py-3 pl-4 pr-10 rounded-3xl text-sm focus:outline-none focus:ring-1 focus:ring-primary-orange"
                />
            </div>
             <button onClick={handleSendMessage} className="text-primary-orange disabled:opacity-50" disabled={!inputValue.trim()}>
                 {inputValue ? <Send className="w-6 h-6" /> : <ImageIcon className="w-6 h-6 text-text-secondary" />}
            </button>
        </div>
    </div>
  );
};