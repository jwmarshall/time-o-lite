import React from 'react';
import { Play, Pause, RotateCcw, Volume2 } from 'lucide-react';

interface ControlsProps {
  isRunning: boolean;
  isPaused: boolean;
  developmentTime: number;
  agitationInterval: number;
  agitationDuration: number;
  audioInitialized: boolean;
  onDevelopmentTimeChange: (time: number) => void;
  onAgitationIntervalChange: (interval: number) => void;
  onAgitationDurationChange: (duration: number) => void;
  onStart: () => void;
  onPause: () => void;
  onReset: () => void;
  onAudioInitialize: () => void;
}

export const Controls: React.FC<ControlsProps> = ({
  isRunning,
  isPaused,
  developmentTime,
  agitationInterval,
  agitationDuration,
  audioInitialized,
  onDevelopmentTimeChange,
  onAgitationIntervalChange,
  onAgitationDurationChange,
  onStart,
  onPause,
  onReset,
  onAudioInitialize
}) => {
  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {/* Time inputs */}
      <div className="grid grid-cols-3 gap-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gold-400 uppercase tracking-wide">
            Development Time
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="60"
              value={developmentTime}
              onChange={(e) => onDevelopmentTimeChange(parseInt(e.target.value) || 1)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
              disabled={isRunning}
            />
            <span className="absolute right-3 top-2 text-sm text-gray-400">min</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gold-400 uppercase tracking-wide">
            Agitation Interval
          </label>
          <div className="relative">
            <input
              type="number"
              min="5"
              max="120"
              value={agitationInterval}
              onChange={(e) => onAgitationIntervalChange(parseInt(e.target.value) || 30)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
              disabled={isRunning}
            />
            <span className="absolute right-3 top-2 text-sm text-gray-400">sec</span>
          </div>
        </div>

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gold-400 uppercase tracking-wide">
            Agitation Time
          </label>
          <div className="relative">
            <input
              type="number"
              min="1"
              max="60"
              value={agitationDuration}
              onChange={(e) => onAgitationDurationChange(parseInt(e.target.value) || 10)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-gold-400 focus:border-transparent"
              disabled={isRunning}
            />
            <span className="absolute right-3 top-2 text-sm text-gray-400">sec</span>
          </div>
        </div>
      </div>

      {/* Audio initialization notice */}
      {!audioInitialized && (
        <div className="text-center p-3 bg-yellow-900/20 border border-yellow-700/50 rounded-lg">
          <p className="text-sm text-yellow-300 mb-2">
            Enable audio for timer alerts (required for mobile Safari)
          </p>
          <button
            onClick={onAudioInitialize}
            className="inline-flex items-center px-3 py-1 bg-yellow-600 hover:bg-yellow-700 text-white text-sm rounded transition-colors duration-200"
          >
            <Volume2 size={14} className="mr-1" />
            Enable Audio
          </button>
        </div>
      )}

      {/* Control buttons */}
      <div className="flex justify-center space-x-4">
        {/* Start/Pause button */}
        <button
          onClick={isRunning ? onPause : onStart}
          className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-white transition-all duration-200 transform hover:scale-105 active:scale-95 ${isRunning && !isPaused
            ? 'bg-red-600 hover:bg-red-700 shadow-lg shadow-red-500/25'
            : 'bg-green-600 hover:bg-green-700 shadow-lg shadow-green-500/25'
            }`}
        >
          {isRunning && !isPaused ? (
            <Pause size={16} />
          ) : (
            <Play size={16} />
          )}
        </button>

        {/* Reset button */}
        <button
          onClick={onReset}
          className="flex items-center justify-center w-12 h-12 rounded-full bg-gray-700 hover:bg-gray-600 text-white transition-all duration-200 transform hover:scale-105 active:scale-95"
        >
          <RotateCcw size={16} />
        </button>
      </div>

      {/* Quick time presets */}
      <div className="flex justify-center space-x-2">
        {[5, 10, 15, 20].map((minutes) => (
          <button
            key={minutes}
            onClick={() => onDevelopmentTimeChange(minutes)}
            className="px-3 py-1 text-sm bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors duration-200"
            disabled={isRunning}
          >
            {minutes}m
          </button>
        ))}
      </div>
    </div>
  );
};
