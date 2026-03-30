export type Subscription = 'free' | 'pro' | 'vip' | 'premium' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  photos: string[];
  age: number;
  bio: string;
  interests: string[];
  tribe?: string;
  online: boolean;
  subscription?: Subscription;
  dateOfBirth?: Date;
  gender?: 'man' | 'woman' | 'other';
  lookingFor?: 'men' | 'women' | 'both';
  hereFor?: string[];
  location?: { name: string; latitude: number; longitude: number; };
  isVerified?: boolean;
  aboutMe?: { delicacies?: { food: string; photo?: string }[]; travel?: { place: string; summary: string }[] };
  education?: 'not-completed' | 'student' | 'undergraduate' | 'postgraduate' | 'graduate' | 'diploma' | 'bachelors' | 'masters';
  height?: number;
  drinking?: 'never' | 'occasionally' | 'socially' | 'regularly';
  smoking?: 'never' | 'occasionally' | 'socially' | 'regularly';
  religion?: string;
  firstDate?: 'at-home' | 'at-the-gym' | 'at-the-club' | 'on-a-date';
  preferences?: { distance: number; ageRange?: [number, number]; gender: string; };
  swipeCount?: number;
  replyRate?: number;
  loveLanguage?: string;
  lastActive?: Date;
  messageRequestsSent?: number;
  messageRequestResetDate?: Date;
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

export interface Story {
  id: string;
  userId: string;
  imageUrl: string;
  createdAt: Date;
  user: User;
  likes: StoryLike[];
}

export interface StoryLike {
  id: string;
  story_id: string;
  user_id: string;
}

export interface SwipeCard extends User {
  distance: number;
}

export interface SwipeStats {
  likes: number;
  passes: number;
  matches: number;
}

export interface AuthUser {
  id: string;
  email: string;
  phone?: string;
  isVerified: boolean;
  subscription: 'free' | 'pro' | 'vip';
  subscriptionExpiry?: Date;
}
