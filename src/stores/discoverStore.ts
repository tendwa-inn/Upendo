import { create } from 'zustand';
import { Story } from '../types';
import { mockUsers } from '../data/mockData';

interface DiscoverState {
  stories: Story[];
  addStory: (story: Omit<Story, 'id'>) => void;
}

const upendoAssistant = mockUsers.find(u => u.id === 'upendo-assistant');

const mockStories: Story[] = [
  {
    id: 'story-1',
    user: mockUsers[0],
    type: 'image',
    url: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?q=80&w=2787&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    duration: 5000,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
    viewedBy: [],
  },
  {
    id: 'story-2',
    user: upendoAssistant || mockUsers[1],
    type: 'text',
    content: 'Welcome to Upendo! Complete your profile to get more matches.',
    duration: 5000,
    createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
    viewedBy: [],
  },
];

export const useDiscoverStore = create<DiscoverState>()((set) => ({
  stories: mockStories,
  addStory: (story) => {
    const newStory: Story = {
      ...story,
      id: `story-${Date.now()}`,
    };
    set(state => ({ stories: [newStory, ...state.stories] }));
  },
}));