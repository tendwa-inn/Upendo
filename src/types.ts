export interface User {
  id: string;
  name: string;
  photos: string[];
  age: number;
  bio: string;
  interests: string[];
  tribe?: string;
  online: boolean;
  subscription?: 'vip' | 'premium';
  loveLanguage?: string;
}

export interface Message {
  id: string;
  matchId: string;
  senderId: string;
  content: string;
  timestamp: Date;
  isRead: boolean;
  type: 'text' | 'image' | 'gif';
  replyTo?: string;
  parentMessage?: { content: string; senderId: string };
  isEdited?: boolean;
}

export interface Match {
  id: string;
  user1: User;
  user2: User;
  timestamp: Date;
  messages: Message[];
  lastMessage?: Message;
}

export type NotificationType = 
  | 'profile-view'
  | 'new-like'
  | 'swipe-refresh'
  | 'account-issue'
  | 'report-feedback'
  | 'new-message';

export interface Notification {
  id: string;
  type: NotificationType;
  isRead: boolean;
  timestamp: Date;
  message: string;
  relatedUser?: User;
  link?: string;
}
