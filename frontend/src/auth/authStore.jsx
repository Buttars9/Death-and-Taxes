import { create } from 'zustand';
import axios from 'axios';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  logout: async () => {
    try {
      await axios.post('/api/logout'); // Optional: backend logout route
    } catch (err) {
      console.warn('Logout error:', err);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  rehydrate: async () => {
    try {
      const { data } = await axios.get('/api/me', { withCredentials: true });
      if (data?.user) {
        set({ user: data.user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (err) {
      console.warn('Session rehydration failed:', err);
      set({ user: null, isAuthenticated: false });
    }
  },
}));