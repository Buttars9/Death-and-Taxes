import { create } from 'zustand';
import axios from 'axios';

// ✅ Environment-aware backend base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true, // ✅ Send cookies for session auth
});

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  logout: async () => {
    try {
      await api.post('/api/logout'); // ✅ Backend logout route
    } catch (err) {
      console.warn('Logout error:', err.message || err);
    } finally {
      set({ user: null, isAuthenticated: false });
    }
  },

  rehydrate: async () => {
    try {
      const { data } = await api.get('/api/me'); // ✅ Session rehydration
      if (data?.user) {
        set({ user: data.user, isAuthenticated: true });
      } else {
        set({ user: null, isAuthenticated: false });
      }
    } catch (err) {
      console.warn('Session rehydration failed:', err.message || err);
      set({ user: null, isAuthenticated: false });
    }
  },
}));