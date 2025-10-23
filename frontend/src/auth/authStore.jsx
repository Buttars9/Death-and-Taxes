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
      set({ user: null, isAuthenticated: false, termsAccepted: false });
      localStorage.removeItem('hasAcceptedTerms');
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
  const legacyTerms = localStorage.getItem('hasAcceptedTerms') === 'true';
  set({
    user: null,
    isAuthenticated: legacyTerms, // ✅ fallback to allow TermsGate routing
    termsAccepted: legacyTerms,
  });
}
  },

  acceptTerms: () => set({ termsAccepted: true }), // New: Action to accept terms

  authenticateWithPi: async () => {
    return new Promise((resolve, reject) => {
      if (!window?.Pi) {
  console.warn("⚠️ Pi SDK not available — skipping Pi auth");
  set({ isAuthenticated: true }); // ✅ Allow fallback flow
  return resolve(null);
}

      if (!window.Pi.initialized) {
        console.error("❌ Pi SDK not initialized");
        return reject(new Error("Pi SDK not initialized"));
      }

      const scopes = ["payments", "username"];
      console.log('Calling window.Pi.authenticate with scopes:', scopes);

      const onIncompletePaymentFound = (payment) => {
        console.log("Incomplete payment found:", payment);
        // TODO: Optionally send payment details to backend to complete or cancel
      };

      // Add timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.error("❌ Pi Auth timed out after 60 seconds");
        reject(new Error("Authentication timed out"));
      }, 60000);

     try {
  window.Pi.authenticate(scopes, onIncompletePaymentFound)
    .then(async (auth) => {
      clearTimeout(timeout);
      console.log("✅ Pi Auth success:", auth);
      const { accessToken, user: piUser } = auth;

      try {
        console.log('Sending to backend /api/pi-auth with:', { accessToken, username: piUser?.username });
        const { data } = await api.post('/api/pi-auth', {
          accessToken,
          username: piUser?.username,
        });
        console.log('Backend auth response:', data);

        set({ user: data.user, isAuthenticated: true });
        resolve(data.user);
      } catch (err) {
        console.error("❌ Backend Pi auth failed:", err.response?.data || err.message);
        set({ isAuthenticated: true }); // ✅ fallback
        reject(err);
      }
    })
    .catch((error) => {
      clearTimeout(timeout);
      console.error("❌ Pi Auth failed:", error);
      set({ isAuthenticated: true }); // ✅ fallback
      reject(error);
    });
} catch (err) {
  console.error("❌ Pi SDK crashed:", err);
  set({ isAuthenticated: true }); // ✅ fallback
  reject(err);
}
    });
  },
}));