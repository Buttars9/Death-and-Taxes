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
import TermsGate from './pages/TermsGate'; // ✅ Modal enforcement
import PublicTerms from './pages/PublicTerms.jsx'; // ✅ Public route
import AdminGate from './components/AdminGate.jsx';       // ✅ Admin PIN gate
import AdminVault from './pages/Admin/AdminVault.jsx';    // ✅ Admin dashboard
import ResetPassword from './pages/ResetPassword.jsx';    // 🔐 Password reset page
import { useAuthStore } from './auth/authStore.jsx';

function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasAgreedToTerms = useAuthStore((s) => s.termsAccepted); // Updated: Read from store
  const hasWizardData = !!localStorage.getItem('wizard-store');

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
        {/* FIX: Ensure /filing routes to WizardRunner */}
        <Route
          path="/filing/*"
          element={
            isAuthenticated || hasWizardData
              ? <WizardRunner />
              : <DeathAndTaxes />
          }
        />
        <Route path="/terms" element={<PublicTerms />} /> {/* ✅ Public PiOS route */}
        <Route path="/admin" element={<AdminGate />} />         {/* ✅ Admin PIN gate */}
        <Route path="/admin/vault" element={<AdminVault />} />  {/* ✅ Admin dashboard */}
        <Route path="/reset-password" element={<ResetPassword />} /> {/* 🔐 Password reset route */}
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  const rehydrate = useAuthStore((s) => s.rehydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // 🔄 Rehydrate session
    rehydrate().then(() => setReady(true));

    // 🟢 Warm-up backend immediately
    fetch('https://death-and-taxes-xzkb.onrender.com/api/ping').catch(() => {});

    // 🔁 Keep backend warm every 5 minutes
    const interval = setInterval(() => {
      fetch('https://death-and-taxes-xzkb.onrender.com/api/ping').catch(() => {});
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
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