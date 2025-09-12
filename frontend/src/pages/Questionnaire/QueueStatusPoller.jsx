// death-and-taxes/src/pages/Questionnaire/QueueStatusPoller.jsx

import { useEffect, useRef } from 'react';

export default function QueueStatusPoller({ userId, setQueueStatus }) {
  const retryCount = useRef(0);
  const intervalId = useRef(null);

  useEffect(() => {
    const pollStatus = async () => {
      if (document.visibilityState !== 'visible') return;

      try {
        const response = await fetch(`/queueStatus?userId=${userId}`);
        const data = await response.json();

        setQueueStatus(data.status);
        retryCount.current = 0;
      } catch (error) {
        console.error('Queue polling failed:', error);
        retryCount.current += 1;

        if (retryCount.current >= 3) {
          clearInterval(intervalId.current);
          intervalId.current = setInterval(pollStatus, 30000); // backoff to 30s
        }
      }
    };

    intervalId.current = setInterval(pollStatus, 10000); // every 10s

    return () => clearInterval(intervalId.current);
  }, [userId, setQueueStatus]);

  return null;
}