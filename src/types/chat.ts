export type UserIntent = 'investment' | 'buy' | 'job' | 'ai' | 'chat' | 'order' | string;
export type MessageSender = 'visitor' | 'owner' | 'admin' | 'elon' | 'system';

export interface FriendRequest {
  id: string;
  visitorId: string;
  name: string;
  email: string;
  location: string;
  status: 'pending' | 'accepted' | 'declined';
  timestamp: number;
}

export interface PrivateMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: number;
  timeString?: string;
  name?: string;
  city?: string;
  visitorId: string;
  isRead?: boolean;
  intent?: UserIntent;
}

export interface VisitorDoc {
  visitorId: string;
  name: string;
  location: string;
  intent?: UserIntent;
  timestamp: number;
  lastMessage: string;
  unreadCount?: number;
}

export interface ChatMessage {
  id: string;
  name: string;
  city: string;
  message: string;
  text?: string;
  imageUrl?: string;
  senderName?: string;
  timestamp: number;
  timeString: string;
  isElon: boolean;
  isAdmin: boolean;
  sender?: 'admin' | 'visitor' | MessageSender;
  read?: boolean;
  isVerified?: boolean;
  isSystem?: boolean;
  userId: string;
  visitorId?: string;
  channel?: string;
  intent?: UserIntent;
  image?: string;
  voiceDuration?: number;
  voiceNoteUrl?: string;
  reactions?: Record<string, number>;
}

export interface VisitorConversation {
  userId: string;
  visitorId?: string;
  userName: string;
  name?: string;
  userCity: string;
  location?: string;
  lastMessage: string;
  lastTimestamp: number;
  timestamp?: number;
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
