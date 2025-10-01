import axios from 'axios';

// Mock API base
const api = axios.create({
  baseURL: '/api',
  timeout: 5000,
});

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const authService = {
  async login(email: string, password: string) {
    await delay(1500);
    return {
      data: {
        user: {
          id: '1',
          name: 'Alex Chen',
          email: email,
          avatar: 'https://images.pexels.com/photos/1222271/pexels-photo-1222271.jpeg?auto=compress&cs=tinysrgb&w=150&h=150',
          theme: 'primary' as const
        },
        token: 'mock-jwt-token'
      }
    };
  },

  async signup(userData: any) {
    await delay(2000);
    return {
      data: {
        user: {
          id: Date.now().toString(),
          ...userData,
          avatar: 'https://images.pexels.com/photos/1300402/pexels-photo-1300402.jpeg?auto=compress&cs=tinysrgb&w=150&h=150'
        },
        token: 'mock-jwt-token'
      }
    };
  }
};

export const meetingService = {
  async getMeetings() {
    await delay(800);
    return { data: [] };
  },

  async createMeeting(meetingData: any) {
    await delay(1200);
    return {
      data: {
        id: Date.now().toString(),
        ...meetingData,
        status: 'upcoming'
      }
    };
  }
};

export const chatService = {
  async sendMessage(message: string) {
    await delay(1500);
    
    const responses = [
      "I can help you analyze your meetings and extract key insights. What would you like to know?",
      "Based on your recent meetings, I notice several action items that might need follow-up. Would you like me to prioritize them?",
      "I've found relevant information in your knowledge base. Here are the top 3 results that match your query.",
      "Let me summarize the key decisions from your last meeting and suggest next steps.",
      "I can help you prepare for your upcoming meeting. What specific areas would you like me to focus on?"
    ];
    
    return {
      data: {
        response: responses[Math.floor(Math.random() * responses.length)],
        suggestions: [
          "Show me action items from last week",
          "Summarize recent meetings",
          "Find documents about project planning"
        ]
      }
    };
  }
};

export const knowledgeService = {
  async search(query: string) {
    await delay(1000);
    
    const mockResults = [
      {
        id: '1',
        title: 'Product Strategy Meeting Notes',
        snippet: 'Key decisions regarding Q2 product roadmap and resource allocation...',
        type: 'meeting',
        relevance: 0.95,
        date: '2024-01-15'
      },
      {
        id: '2',
        title: 'Authentication System Documentation',
        snippet: 'Technical specifications for user authentication flow and security requirements...',
        type: 'document',
        relevance: 0.87,
        date: '2024-01-10'
      },
      {
        id: '3',
        title: 'Team Communication Guidelines',
        snippet: 'Best practices for internal communication and meeting protocols...',
        type: 'document',
        relevance: 0.78,
        date: '2024-01-08'
      }
    ];
    
    return { data: mockResults };
  }
};