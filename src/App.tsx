import React, { useCallback } from 'react';
import { CircularTimer } from './components/CircularTimer';
import { Controls } from './components/Controls';
import { useTimer } from './hooks/useTimer';
import { useLocalStorage } from './hooks/useLocalStorage';

function App() {
  const [developmentTime, setDevelopmentTime] = useLocalStorage('developmentTime', 10);
  const [agitationInterval, setAgitationInterval] = useLocalStorage('agitationInterval', 30);

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
  } = useTimer(developmentTime, agitationInterval, handleAgitate, handleComplete);

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
          onDevelopmentTimeChange={setDevelopmentTime}
          onAgitationIntervalChange={setAgitationInterval}
          onStart={start}
          onPause={pause}
          onReset={reset}
        />

        {/* Footer */}
        <div className="text-center mt-8 text-xs text-gray-500">
          <p>Professional darkroom timer for film development</p>
        </div>
      </div>
    </div>
  );
}

export default App;