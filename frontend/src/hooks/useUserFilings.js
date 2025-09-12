// death-and-taxes/src/hooks/useUserFilings.js

import { useEffect, useState } from 'react';

/**
 * Hook to fetch user filings based on email.
 * Returns filings array and loading state.
 * Used in dashboard and filing history views.
 */

export function useUserFilings(userEmail) {
  const [filings, setFilings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userEmail) return;

    const fetchFilings = async () => {
      try {
        const res = await fetch(`/api/filings?email=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        setFilings(data.filings || []);
      } catch (err) {
        console.error('❌ Error fetching filings:', err);
        setFilings([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFilings();
  }, [userEmail]);

  return { filings, loading };
}