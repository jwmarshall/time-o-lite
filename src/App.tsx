import React, { useCallback, useEffect, useRef } from 'react';
import { Github } from 'lucide-react';
import { CircularTimer } from './components/CircularTimer';
import { Controls } from './components/Controls';
import { useTimer } from './hooks/useTimer';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [developmentTime, setDevelopmentTime] = useLocalStorage('developmentTime', 10);
  const [agitationInterval, setAgitationInterval] = useLocalStorage('agitationInterval', 30);
  const [agitationDuration, setAgitationDuration] = useLocalStorage('agitationDuration', 10);

  // Wake Lock API to keep screen on during timer
  const wakeLockRef = useRef<WakeLockSentinel | null>(null);

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

  const playAlarmSound = useCallback(() => {
    // Create audio context for cross-browser compatibility
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.5);
  }, []);

  const handleAgitate = useCallback(() => {
    playAlarmSound();
  }, [playAlarmSound]);

  const handleAgitateEnd = useCallback(() => {
    // Play agitation end sound (lower frequency, shorter duration)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    gainNode.gain.setValueAtTime(0.2, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
  }, []);

  const handleComplete = useCallback(() => {
    // Play completion sound (longer and different tone)
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();

    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);

    oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
    oscillator.frequency.setValueAtTime(800, audioContext.currentTime + 0.5);
    gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 1);

    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 1);
  }, []);

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
          onDevelopmentTimeChange={setDevelopmentTime}
          onAgitationIntervalChange={setAgitationInterval}
          onAgitationDurationChange={setAgitationDuration}
          onStart={start}
          onPause={pause}
          onReset={reset}
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
