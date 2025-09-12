// death-and-taxes/src/pages/Questionnaire/QueueHeartbeat.jsx

import { useEffect, useRef, useState } from 'react';

export default function QueueHeartbeat({ userId }) {
  const [lastPing, setLastPing] = useState(null);
  const [isAlive, setIsAlive] = useState(true);
  const retryCount = useRef(0);
  const intervalId = useRef(null);

  useEffect(() => {
    const pingQueue = async () => {
      if (document.visibilityState !== 'visible') return;

      try {
        await fetch(`/heartbeat?userId=${userId}`, { method: 'POST' });
        setLastPing(Date.now());
        setIsAlive(true);
        retryCount.current = 0;
      } catch (error) {
        console.error('Queue heartbeat failed:', error);
        retryCount.current += 1;
        setIsAlive(false);

        if (retryCount.current >= 3) {
          clearInterval(intervalId.current);
          intervalId.current = setInterval(pingQueue, 30000); // slow down to 30s
        }
      }
    };

    intervalId.current = setInterval(pingQueue, 15000); // every 15s

    return () => clearInterval(intervalId.current);
  }, [userId]);

  return null;
}