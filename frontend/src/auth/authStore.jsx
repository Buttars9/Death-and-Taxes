import { create } from 'zustand';
import { persist, subscribeWithSelector } from 'zustand/middleware';
import axios from 'axios';

// ✅ Environment-aware backend base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE,
  withCredentials: true,
});

export const useAuthStore = create(
  subscribeWithSelector(
    persist(
      (set, get) => ({
        user: null,
        isAuthenticated: false,
        termsAccepted: false, // ✅ In-memory only
        hasRehydrated: false,

        setUser: (user) => set({ user, isAuthenticated: !!user }),

        logout: async () => {
          console.log('🚪 logout() called — clearing session and store');
          try {
            await api.post('/api/logout', null, {
              withCredentials: true,
              timeout: 30000,
            });
            console.log('✅ Logout API call succeeded');
          } catch (err) {
            console.warn('❌ Logout API call failed:', err.message || err);
          } finally {
            console.log('🧹 Clearing store and localStorage');
            localStorage.removeItem('auth-storage');
            set({
              user: null,
              isAuthenticated: false,
              termsAccepted: false, // ✅ Reset explicitly
              hasRehydrated: false,
            });
            console.log('🧾 Store after logout:', get());
            window.location.href = '/';
          }
        },

        rehydrate: async () => {
          const { hasRehydrated } = get();
          console.log('🔁 rehydrate() called — hasRehydrated:', hasRehydrated);
          if (hasRehydrated) {
            console.log('⏭️ Skipping rehydrate — already run');
            return;
          }

          try {
            console.log('🌐 Calling /api/me for session check');
            const { data } = await api.get('/api/me', { timeout: 30000 });
            if (data?.user) {
              console.log('✅ /api/me returned user:', data.user);
              set({ user: data.user, isAuthenticated: true });
            } else {
              console.log('⚠️ /api/me returned no user');
              set({ user: null, isAuthenticated: false });
            }
          } catch (err) {
            console.warn('❌ /api/me failed:', err.message || err);
            set({ user: null, isAuthenticated: false });
          } finally {
            console.log('✅ Setting hasRehydrated = true');
            set({ hasRehydrated: true });
            console.log('🧾 Store after rehydrate:', get());
          }
        },

        acceptTerms: () => {
          console.log('🔒 acceptTerms called — setting termsAccepted = true');
          set((state) => {
            if (state.termsAccepted) {
              console.log('🛑 acceptTerms skipped — already true');
              return {};
            }
            return { termsAccepted: true };
          });
        },

        authenticateWithPi: async () => {
          return new Promise((resolve, reject) => {
            if (!window?.Pi) {
              console.warn("⚠️ Pi SDK not available — skipping Pi auth");
              set({ isAuthenticated: true });
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
            };

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
                    }, { timeout: 30000 });
                    console.log('Backend auth response:', data);

                    set({ user: data.user, isAuthenticated: true });
                    resolve(data.user);
                  } catch (err) {
                    console.error("❌ Backend Pi auth failed:", err.response?.data || err.message);
                    set({ isAuthenticated: true });
                    reject(err);
                  }
                })
                .catch((error) => {
                  clearTimeout(timeout);
                  console.error("❌ Pi Auth failed:", error);
                  set({ isAuthenticated: true });
                  reject(error);
                });
            } catch (err) {
              console.error("❌ Pi SDK crashed:", err);
              set({ isAuthenticated: true });
              reject(err);
            }
          });
        },
      }),
      {
        name: 'auth-storage',
        partialize: (state) => ({
          // ✅ termsAccepted is no longer persisted
          // You can persist other fields here if needed
        }),
      }
    )
  )
);