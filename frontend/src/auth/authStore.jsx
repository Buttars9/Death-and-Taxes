import { create } from 'zustand';
import axios from 'axios';

// ✅ Environment-aware backend base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true, // ✅ Send cookies for session auth
});

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  termsAccepted: false, // New: Track terms acceptance

  setUser: (user) => set({ user, isAuthenticated: !!user }),

  logout: async () => {
    try {
      await api.post('/api/logout', null, {
        withCredentials: true, // 🔒 Explicitly send cookie for logout
      });
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
    } finally {
      // New: Migrate legacy localStorage value if it exists (for backward compatibility)
      const legacyTerms = localStorage.getItem('termsAccepted');
      if (legacyTerms === 'true' && !get().termsAccepted) {
        set({ termsAccepted: true });
        localStorage.removeItem('termsAccepted'); // Clean up old key
      }
    }
  },

  acceptTerms: () => set({ termsAccepted: true }), // New: Action to accept terms

  authenticateWithPi: async () => {
    return new Promise((resolve, reject) => {
      if (!window?.Pi) {
        console.error("❌ Pi SDK not available");
        return reject("Pi SDK not available");
      }

      const scopes = ["payments", "username"]; // ✅ Declare scopes here

      // Required callback for handling incomplete payments (expand as needed for backend integration)
      const onIncompletePaymentFound = (payment) => {
        console.log("Incomplete payment found:", payment);
        // TODO: Optionally send payment details to backend to complete or cancel
      };

      window.Pi.authenticate(scopes, onIncompletePaymentFound)
        .then(async (auth) => {
          console.log("✅ Pi Auth success:", auth);
          const { accessToken, user: piUser } = auth;

          // Optional: send to backend for verification
          try {
            const { data } = await api.post('/api/pi-auth', {
              accessToken,
              username: piUser?.username,
            });

            set({ user: data.user, isAuthenticated: true });
            resolve(data.user);
          } catch (err) {
            console.error("❌ Backend Pi auth failed:", err.message || err);
            reject(err);
          }
        })
        .catch((error) => {
          console.error("❌ Pi Auth failed:", error);
          reject(error);
        });
    });
  },
}));