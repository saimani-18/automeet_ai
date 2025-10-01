import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  theme: 'primary' | 'neon' | 'warm';
}

interface Meeting {
  id: string;
  title: string;
  date: string;
  participants: Array<{ name: string; avatar: string }>;
  summary: string;
  status: 'upcoming' | 'completed' | 'in-progress';
  transcript?: string;
  actionItems?: Array<{ id: string; task: string; assignee: string; completed: boolean }>;
}

interface Store {
  user: User | null;
  isAuthenticated: boolean;
  meetings: Meeting[];
  isDarkMode: boolean;
  chatMessages: Array<{ id: string; content: string; sender: 'user' | 'bot'; timestamp: Date }>;
  
  // Actions
  login: (user: User) => void;
  logout: () => void;
  setUser: (user: User) => void;
  addMeeting: (meeting: Meeting) => void;
  updateMeeting: (id: string, updates: Partial<Meeting>) => void;
  toggleDarkMode: () => void;
  addChatMessage: (content: string, sender: 'user' | 'bot') => void;
}

export const useStore = create<Store>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      meetings: [
        {
          id: '1',
          title: 'Product Strategy Review',
          date: '2024-01-15T10:00:00Z',
          participants: [
            { name: 'Sarah Chen', avatar: 'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=150&h=150' },
            { name: 'Alex Kumar', avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150' },
            { name: 'Maya Rodriguez', avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150' }
          ],
          summary: 'Discussed Q2 product roadmap, prioritized user authentication features, and allocated resources for mobile app development.',
          status: 'completed',
          transcript: 'Sarah: Let\'s start with the Q2 roadmap...',
          actionItems: [
            { id: '1', task: 'Draft authentication flow wireframes', assignee: 'Sarah Chen', completed: false },
            { id: '2', task: 'Research mobile development frameworks', assignee: 'Alex Kumar', completed: true }
          ]
        },
        {
          id: '2',
          title: 'Weekly Team Sync',
          date: '2024-01-20T15:30:00Z',
          participants: [
            { name: 'David Park', avatar: 'https://images.pexels.com/photos/697509/pexels-photo-697509.jpeg?auto=compress&cs=tinysrgb&w=150&h=150' },
            { name: 'Lisa Wang', avatar: 'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=150&h=150' }
          ],
          summary: 'Sprint progress review, blockers discussion, and planning for next iteration.',
          status: 'upcoming'
        }
      ],
      isDarkMode: true,
      chatMessages: [],

      login: (user) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false }),
      setUser: (user) => set({ user }),
      addMeeting: (meeting) => set((state) => ({ meetings: [...state.meetings, meeting] })),
      updateMeeting: (id, updates) => set((state) => ({
        meetings: state.meetings.map(meeting => 
          meeting.id === id ? { ...meeting, ...updates } : meeting
        )
      })),
      toggleDarkMode: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
      addChatMessage: (content, sender) => set((state) => ({
        chatMessages: [...state.chatMessages, {
          id: Date.now().toString(),
          content,
          sender,
          timestamp: new Date()
        }]
      }))
    }),
    {
      name: 'lovable-store'
    }
  )
);