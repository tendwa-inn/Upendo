import { User, Match, Message } from '../types';

export const mockUsers: User[] = [
  {
    id: '1',
    name: 'Amina',
    age: 26,
    dateOfBirth: new Date('1998-03-15'),
    gender: 'woman',
    lookingFor: 'men',
    tribe: 'Bemba',
    hereFor: ['Dating', 'Serious Relationship'],
    interests: ['Hiking', 'Cooking', 'Photography'],
    bio: 'Adventurous soul who loves exploring new places and trying local cuisine. Looking for someone to share sunset views and deep conversations.',
    photos: [
      'https://core-normal.traeapi.us/api/ide/v1/text_to_image?prompt=Beautiful%20African%20woman%20portrait%20warm%20smile%20natural%20lighting%20professional%20photography&image_size=portrait_4_3',
      'https://core-normal.traeapi.us/api/ide/v1/text_to_image?prompt=African%20woman%20outdoor%20adventure%20hiking%20nature%20background%20confident%20pose&image_size=portrait_4_3',
      'https://core-normal.traeapi.us/api/ide/v1/text_to_image?prompt=African%20woman%20cooking%20traditional%20food%20kitchen%20warm%20atmosphere%20smiling&image_size=portrait_4_3',
    ],
    location: {
      latitude: -15.4167,
      longitude: 28.2833,
      city: 'Lusaka',
    },
    subscription: 'free',
    isVerified: false,
    lastActive: new Date(),
    online: true,
    preferences: {
      ageRange: [24, 35],
      distance: 50,
      gender: 'male',
    },
    aboutMe: {
      delicacies: [{ food: 'Nshima with goat stew' }],
      travel: [{ place: 'Victoria Falls', summary: 'Absolutely breathtaking!' }]
    },
    religion: 'Christian',
    education: 'bachelors',
    height: 165,
    drinking: 'socially',
    smoking: 'never',
    firstDate: 'on-a-date',
  },
  {
    id: '2',
    name: 'Kwame',
    age: 29,
    dateOfBirth: new Date('1995-08-22'),
    gender: 'man',
    lookingFor: 'women',
    tribe: 'Akan',
    hereFor: ['Dating', 'Friendship'],
    interests: ['Music', 'Art', 'Technology'],
    bio: 'Tech entrepreneur with a passion for music and art. Love deep conversations about life, business, and everything in between.',
    photos: [
      'https://core-normal.traeapi.us/api/ide/v1/text_to_image?prompt=Handsome%20African%20man%20professional%20portrait%20confident%20smile%20modern%20clothing&image_size=portrait_4_3',
      'https://core-normal.traeapi.us/api/ide/v1/text_to_image?prompt=African%20man%20music%20studio%20headphones%20creative%20environment%20passionate%20expression&image_size=portrait_4_3',
      'https://core-normal.traeapi.us/api/ide/v1/text_to_image?prompt=African%20man%20business%20meeting%20professional%20setting%20leadership%20confidence&image_size=portrait_4_3',
    ],
    location: {
      latitude: -15.4167,
      longitude: 28.2833,
      city: 'Lusaka',
    },
    subscription: 'pro',
    isVerified: true,
    lastActive: new Date(),
    online: true,
    preferences: {
      ageRange: [22, 32],
      distance: 30,
      gender: 'female',
    },
    aboutMe: {
      travel: [{ place: 'Cape Town', summary: 'The views from Table Mountain are incredible.' }]
    },
    religion: 'Spiritual',
    education: 'masters',
    height: 180,
    drinking: 'occasionally',
    smoking: 'never',
    firstDate: 'at-home',
  },
  // ... add more mock users with new fields
];

// Mock current user (you)
export const currentUser: User = {
  id: 'current-user',
  name: 'You',
  age: 28,
  dateOfBirth: new Date('1996-01-01'),
  gender: 'man',
  lookingFor: 'women',
  hereFor: ['Dating'],
  interests: ['Coding', 'Gaming'],
  bio: 'Looking for meaningful connections and great conversations.',
  photos: [
    'https://core-normal.traeapi.us/api/ide/v1/text_to_image?prompt=Modern%20professional%20portrait%20neutral%20background%20confident%20smile%20contemporary%20style&image_size=portrait_4_3',
  ],
  location: {
    latitude: -15.4167,
    longitude: 28.2833,
    city: 'Lusaka',
  },
  subscription: 'free',
  isVerified: false,
  lastActive: new Date(),
  online: true,
  preferences: {
    ageRange: [22, 35],
    distance: 50,
    gender: 'both',
  },
  aboutMe: {},
  religion: 'Agnostic',
  education: 'graduate',
  height: 175,
  drinking: 'never',
  smoking: 'never',
  firstDate: 'on-a-date',
};

// Mock matches
export const mockMatches: Match[] = [
  {
    id: 'match-1',
    user1: currentUser,
    user2: mockUsers[0], // Amina
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    lastMessage: {
      id: 'msg-1',
      matchId: 'match-1',
      senderId: '1',
      content: 'Hey! I saw you like hiking too 😊',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: false,
      type: 'text',
    },
  },
  {
    id: 'match-2',
    user1: currentUser,
    user2: mockUsers[1], // Kwame
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
    lastMessage: {
      id: 'msg-2',
      matchId: 'match-2',
      senderId: 'current-user',
      content: 'That sounds amazing! When are you free?',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      isRead: true,
      type: 'text',
    },
  },
];

// Mock messages
export const mockMessages: Record<string, Message[]> = {
  'match-1': [
    {
      id: 'msg-1',
      matchId: 'match-1',
      senderId: 'current-user',
      content: 'Hi Amina! Love your hiking photos!',
      timestamp: new Date(Date.now() - 60 * 60 * 1000), // 1 hour ago
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-2',
      matchId: 'match-1',
      senderId: '1',
      content: 'Hey! I saw you like hiking too 😊',
      timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: false,
      type: 'text',
    },
  ],
  'match-2': [
    {
      id: 'msg-1',
      matchId: 'match-2',
      senderId: '2',
      content: 'Hey there! Love your profile. What kind of music are you into?',
      timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
      isRead: true,
      type: 'text',
    },
    {
      id: 'msg-2',
      matchId: 'match-2',
      senderId: 'current-user',
      content: 'I\'m into all kinds! Mostly indie and electronic though. How about you?',
      timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
      isRead: true,
      type: 'text',
    },
  ],
};