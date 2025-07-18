import React, { useCallback, useEffect, useRef } from 'react';
import { Github } from 'lucide-react';
import { CircularTimer } from './components/CircularTimer';
import { Controls } from './components/Controls';
import { useTimer } from './hooks/useTimer';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useAudio } from './hooks/useAudio';

function App() {
  const [developmentTime, setDevelopmentTime] = useLocalStorage('developmentTime', 10);
  const [agitationInterval, setAgitationInterval] = useLocalStorage('agitationInterval', 30);
  const [agitationDuration, setAgitationDuration] = useLocalStorage('agitationDuration', 10);
  const [audioInitialized, setAudioInitialized] = useLocalStorage('audioInitialized', false);

  // Wake Lock API to keep screen on during timer
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

  // Enhanced audio system
  const { playAgitationStart, playAgitationEnd, playCompletion, initializeAudio } = useAudio();

  const requestWakeLock = useCallback(async () => {
    try {
      if ('wakeLock' in navigator) {
        wakeLockRef.current = await navigator.wakeLock.request('screen');
        console.log('Wake lock acquired: screen will stay on');
      }
    } catch (error) {
      console.log('Wake lock failed:', error);
    }
  }, []);

  const releaseWakeLock = useCallback(async () => {
    try {
      if (wakeLockRef.current) {
        await wakeLockRef.current.release();
        wakeLockRef.current = null;
        console.log('Wake lock released');
      }
    } catch (error) {
      console.log('Wake lock release failed:', error);
    }
  }, []);

  const handleAudioInitialization = useCallback(() => {
    if (!audioInitialized) {
      initializeAudio();
      setAudioInitialized(true);
    }
  }, [audioInitialized, initializeAudio, setAudioInitialized]);

  const handleAgitate = useCallback(() => {
    if (audioInitialized) {
      playAgitationStart();
    }
  }, [playAgitationStart, audioInitialized]);

  const handleAgitateEnd = useCallback(() => {
    if (audioInitialized) {
      playAgitationEnd();
    }
  }, [playAgitationEnd, audioInitialized]);

  const handleComplete = useCallback(() => {
    if (audioInitialized) {
      playCompletion();
    }
  }, [playCompletion, audioInitialized]);

  const {
    currentTime,
    isRunning,
    isPaused,
    isAgitating,
    start,
    pause,
    reset
  } = useTimer(developmentTime, agitationInterval, agitationDuration, handleAgitate, handleAgitateEnd, handleComplete);

  // Manage wake lock based on timer state
  useEffect(() => {
    if (isRunning && !isPaused) {
      requestWakeLock();
    } else {
      releaseWakeLock();
    }

    // Cleanup wake lock on unmount
    return () => {
      releaseWakeLock();
    };
  }, [isRunning, isPaused, requestWakeLock, releaseWakeLock]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gold-400 mb-2">TIME-O-LITE</h1>
          <p className="text-gray-400 text-sm uppercase tracking-wider">Film Development Timer</p>
        </div>

        {/* Timer */}
        <div className="flex justify-center mb-8">
          <CircularTimer
            totalTime={developmentTime * 60}
            currentTime={currentTime}
            isRunning={isRunning}
            isAgitating={isAgitating}
          />
        </div>

        {/* Controls */}
        <Controls
          isRunning={isRunning}
          isPaused={isPaused}
          developmentTime={developmentTime}
          agitationInterval={agitationInterval}
          agitationDuration={agitationDuration}
          audioInitialized={audioInitialized}
          onDevelopmentTimeChange={setDevelopmentTime}
          onAgitationIntervalChange={setAgitationInterval}
          onAgitationDurationChange={setAgitationDuration}
          onStart={start}
          onPause={pause}
          onReset={reset}
          onAudioInitialize={handleAudioInitialization}
        />

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500 space-y-2">
          <p>Professional darkroom timer for film development</p>
          <div className="flex items-center justify-center space-x-4">
            <span>v1.0.0</span>
            <a
              href="https://github.com/jwmarshall/time-o-lite"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-1 text-gray-400 hover:text-gold-400 transition-colors duration-200"
              title="View source on GitHub"
            >
              <Github size={14} />
              <span>GitHub</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
