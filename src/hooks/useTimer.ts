import { useState, useEffect, useCallback, useRef } from 'react';

export const useTimer = (
  totalMinutes: number,
  agitationInterval: number,
  onAgitate: () => void,
  onComplete: () => void
) => {
  const [currentTime, setCurrentTime] = useState(totalMinutes * 60);
  const [isRunning, setIsRunning] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [isAgitating, setIsAgitating] = useState(false);
  const [lastAgitationTime, setLastAgitationTime] = useState(0);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const agitationTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsRunning(true);
    setIsPaused(false);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
    setIsPaused(true);
  }, []);

  const reset = useCallback(() => {
    setIsRunning(false);
    setIsPaused(false);
    setCurrentTime(totalMinutes * 60);
    setIsAgitating(false);
    setLastAgitationTime(0);
    if (intervalRef.current) clearInterval(intervalRef.current);
    if (agitationTimeoutRef.current) clearTimeout(agitationTimeoutRef.current);
  }, [totalMinutes]);

  // Update current time when total minutes changes
  useEffect(() => {
    if (!isRunning) {
      setCurrentTime(totalMinutes * 60);
      setLastAgitationTime(0);
    }
  }, [totalMinutes, isRunning]);

  // Main timer logic
  useEffect(() => {
    if (isRunning && currentTime > 0) {
      intervalRef.current = setInterval(() => {
        setCurrentTime((prevTime) => {
          const newTime = prevTime - 1;
          
          // Check for agitation
          const elapsed = (totalMinutes * 60) - newTime;
          if (elapsed > 0 && elapsed % agitationInterval === 0 && elapsed !== lastAgitationTime) {
            setLastAgitationTime(elapsed);
            onAgitate();
            setIsAgitating(true);
            
            // Clear agitation state after 2 seconds
            agitationTimeoutRef.current = setTimeout(() => {
              setIsAgitating(false);
            }, 2000);
          }
          
          // Check for completion
          if (newTime <= 0) {
            onComplete();
            setIsRunning(false);
            setIsPaused(false);
            return 0;
          }
          
          return newTime;
        });
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [isRunning, currentTime, totalMinutes, agitationInterval, lastAgitationTime, onAgitate, onComplete]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (agitationTimeoutRef.current) clearTimeout(agitationTimeoutRef.current);
    };
  }, []);

  return {
    currentTime,
    isRunning,
    isPaused,
    isAgitating,
    start,
    pause,
    reset
  };
};