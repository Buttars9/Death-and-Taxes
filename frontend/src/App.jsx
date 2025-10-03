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
import TermsGate from './pages/TermsGate'; // ✅ Added import
import AdminGate from './components/AdminGate.jsx';       // ✅ Added import
import AdminVault from './pages/Admin/AdminVault.jsx';    // ✅ Corrected path
import { useAuthStore } from './auth/authStore.jsx';

function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const hasWizardData = !!localStorage.getItem('wizard-store');

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <DeathAndTaxes />} />
        <Route path="/dashboard" element={isAuthenticated ? <Dashboard /> : <DeathAndTaxes />} />
        {/* FIX: Ensure /filing routes to WizardRunner */}
        <Route path="/filing/*" element={isAuthenticated || hasWizardData ? <WizardRunner /> : <DeathAndTaxes />} />
        <Route path="/terms" element={<TermsGate />} /> {/* ✅ Added route */}
        <Route path="/admin" element={<AdminGate />} />         {/* ✅ Admin PIN gate */}
        <Route path="/admin/vault" element={<AdminVault />} />  {/* ✅ Admin dashboard */}
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  const rehydrate = useAuthStore((s) => s.rehydrate);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    rehydrate().then(() => setReady(true));
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