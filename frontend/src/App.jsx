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

import { useAuthStore } from './auth/authStore.jsx';

function AppRoutes() {
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);

  return (
    <AppLayout>
      <Routes>
        <Route path="/" element={isAuthenticated ? <Dashboard /> : <DeathAndTaxes />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/filing" element={<WizardRunner />} />
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