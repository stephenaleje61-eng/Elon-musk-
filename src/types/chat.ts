export type UserIntent = 'investment' | 'buy' | 'job' | 'ai' | 'chat' | 'order' | string;


export interface ChatMessage {
  id: string;
  name: string;
  city: string;
  message: string;
  timestamp: number;
  timeString: string;
  isElon: boolean;
  isAdmin: boolean;
  isVerified?: boolean;
  isSystem?: boolean;
  userId: string;
  channel?: string;
  intent?: UserIntent;
  image?: string;
  voiceDuration?: number;
  voiceNoteUrl?: string;
  reactions?: Record<string, number>;
}

export interface VisitorConversation {
  userId: string;
  userName: string;
  userCity: string;
  lastMessage: string;
  lastTimestamp: number;
  intent?: UserIntent;
  unreadCount: number;
}

export interface AdminPresence {
  isOnline: boolean;
  adminName: string;
  adminCity: string;
  lastSeen: number;
}

export interface ChatChannel {
  id: string;
  name: string;
  description: string;
  isLive?: boolean;
  unreadCount?: number;
  category: 'primary' | 'engineering' | 'spaces';
}

export interface OnlineUser {
  id: string;
  name: string;
  role: 'elon' | 'admin' | 'vip' | 'user';
  city: string;
  status: 'online' | 'typing' | 'in starship';
  avatar?: string;
  badge?: string;
}

export interface AdminSettings {
  elonAiEnabled: boolean;
  autoReplyFrequency: number;
  ownerCity: string;
  ownerName: string;
  systemAnnouncementsEnabled: boolean;
}
