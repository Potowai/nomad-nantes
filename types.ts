export interface User {
  id: string;
  name: string;
  age: number;
  origin: string;
  role: string;
  languages: string[];
  interests: string[];
  bio: string;
  avatar: string;
  isVerified?: boolean;
  distance?: string; 
}

export interface Activity {
  id: string;
  title: string;
  type: 'Dinner' | 'Drink' | 'Explore' | 'Coworking' | 'Other';
  description: string;
  location: string;
  time: string;
  hostId: string;
  hostName: string;
  attendees: number;
  maxAttendees?: number;
}

export interface Trip {
  id: string;
  destination: string;
  startDate: string;
  endDate: string;
  matches: number; 
}

export interface Recommendation {
  placeName: string;
  category: string;
  description: string;
  reason: string;
}

export interface ChatMessage {
  id: string;
  sender: string;
  text: string;
  timestamp: string;
  isMe: boolean;
  status?: 'read' | 'sent';
}

export enum ViewState {
  ONBOARDING = 'ONBOARDING',
  EXPLORE = 'EXPLORE', // Replaces NEARBY/ACTIVITIES
  TRIPS = 'TRIPS',
  CHATS = 'CHATS',
  CHAT_DETAIL = 'CHAT_DETAIL',
  PROFILE = 'PROFILE',
  AI_PLANNER = 'AI_PLANNER'
}