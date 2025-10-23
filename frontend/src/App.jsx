import React, { useEffect, useState } from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from 'react-router-dom';

import AppLayout from './components/AppLayout.jsx';
import DeathAndTaxes from './DeathAndTaxes';
import Dashboard from './pages/Dashboard/Dashboard';
import WizardRunner from './wizard/WizardRunner';
import TermsGate from './pages/TermsGate';
import PublicTerms from './pages/PublicTerms.jsx';
import AdminGate from './components/AdminGate.jsx';
import AdminVault from './pages/Admin/AdminVault.jsx';
import ResetPassword from './pages/ResetPassword.jsx';
import { useAuthStore } from './auth/authStore.jsx';

function AppRoutes() {
  const hasRehydrated = useAuthStore((s) => s.hasRehydrated);
  const [isAuthenticated, setIsAuthenticated] = useState(useAuthStore.getState().isAuthenticated);
  const [hasAgreedToTerms, setHasAgreedToTerms] = useState(useAuthStore.getState().termsAccepted);

  useEffect(() => {
    const unsubAuth = useAuthStore.subscribe(
      (state) => state.isAuthenticated,
      (value) => {
        console.log('📡 AppRoutes subscription: isAuthenticated changed to', value);
        setIsAuthenticated(value);
      }
    );
    const unsubTerms = useAuthStore.subscribe(
      (state) => state.termsAccepted,
      (value) => {
        console.log('📡 AppRoutes subscription: termsAccepted changed to', value);
        setHasAgreedToTerms(value);
      }
    );
    return () => {
      unsubAuth();
      unsubTerms();
    };
  }, []);

  const hasWizardData = !!localStorage.getItem('wizard-store');

  if (!hasRehydrated) {
    return (
      <div style={{ background: '#111', color: '#fff', padding: '2rem' }}>
        🔄 Waiting for auth rehydration...
      </div>
    );
  }

  return (
    <AppLayout>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated
              ? hasAgreedToTerms
                ? <Dashboard />
                : <TermsGate />
              : <DeathAndTaxes />
          }
        />
        <Route
          path="/dashboard"
          element={
            isAuthenticated
              ? hasAgreedToTerms
                ? <Dashboard />
                : <TermsGate />
              : <DeathAndTaxes />
          }
        />
        <Route
          path="/filing/*"
          element={
            isAuthenticated || hasWizardData
              ? <WizardRunner />
              : <DeathAndTaxes />
          }
        />
        <Route path="/terms" element={<PublicTerms />} />
        <Route path="/admin" element={<AdminGate />} />
        <Route path="/admin/vault" element={<AdminVault />} />
        <Route path="/reset-password" element={<ResetPassword />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  const rehydrate = useAuthStore((s) => s.rehydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    rehydrate().then(() => setReady(true));

    fetch('https://deathntaxes-backend.onrender.com/api/ping').catch(() => {});

    const interval = setInterval(() => {
      fetch('https://deathntaxes-backend.onrender.com/api/ping').catch(() => {});
    }, 5 * 60 * 1000);

    const messageListener = (event) => {
      const allowedOrigins = ['https://www.deathntaxes.app'];
      if (window.Pi && window.Pi.sandbox) {
        allowedOrigins.push('https://sandbox.minepi.com');
      }

      if (!allowedOrigins.includes(event.origin)) {
        console.log('Discarding message - origin:', event.origin, '- data is logged below');
        console.log(event.data);
        return;
      }
    };

    window.addEventListener('message', messageListener);

    return () => {
      clearInterval(interval);
      window.removeEventListener('message', messageListener);
    };
  }, []);

  if (!ready) {
    return (
      <div style={{ background: '#111', color: '#fff', padding: '2rem' }}>
        🔄 Rehydrating session...
      </div>
    );
  }

  return (
    <Router>
      <AppRoutes />
    </Router>
  );
}