// death-and-taxes/src/pages/FilingWizard.jsx

import React, { useEffect } from 'react';
import { useAuthStore } from '../auth/authStore';
import AuthForm from '../auth/AuthForm';
import WizardFlow from './WizardFlow';

export default function FilingWizard() {
  const user = useAuthStore((s) => s.user);

  useEffect(() => {
    if (user) {
      // 🧠 Audit trail: log entry into filing flow
      fetch('/api/logEvent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ event: 'entered_filing_wizard', userId: user.id, timestamp: Date.now() }),
      });

      // 🧩 Estate planning eligibility check (placeholder)
      // if (user.age >= 18 && user.state !== 'Alaska') {
      //   enableWillFlow();
      // }
    }
  }, [user]);

  if (!user) {
    return <AuthForm onSuccess={() => window.location.reload()} />;
  }

  try {
    return <WizardFlow />;
  } catch (err) {
    console.error('WizardFlow failed to render:', err);
    return <p>Something went wrong loading the filing flow. Please try again later.</p>;
  }
}