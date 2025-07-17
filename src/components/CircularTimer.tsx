import React from 'react';

interface CircularTimerProps {
  totalTime: number;
  currentTime: number;
  isRunning: boolean;
  isAgitating: boolean;
}

export const CircularTimer: React.FC<CircularTimerProps> = ({
  totalTime,
  currentTime,
  isRunning,
  isAgitating
}) => {
  const progress = totalTime > 0 ? (totalTime - currentTime) / totalTime : 0;
  const circumference = 2 * Math.PI * 140; // radius = 140
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (progress * circumference);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="relative flex items-center justify-center">
      <svg className="w-80 h-80 transform -rotate-90" viewBox="0 0 320 320">
        {/* Outer ring */}
        <circle
          cx="160"
          cy="160"
          r="150"
          fill="none"
          stroke="#2a2a2a"
          strokeWidth="8"
        />
        
        {/* Minute markers */}
        {[...Array(12)].map((_, i) => {
          const angle = (i * 30) * Math.PI / 180;
          const x1 = 160 + Math.cos(angle) * 130;
          const y1 = 160 + Math.sin(angle) * 130;
          const x2 = 160 + Math.cos(angle) * 140;
          const y2 = 160 + Math.sin(angle) * 140;
          
          return (
            <line
              key={i}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="#d4af37"
              strokeWidth="2"
            />
          );
        })}

        {/* Progress track */}
        <circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke="#1a1a1a"
          strokeWidth="12"
        />
        
        {/* Progress bar */}
        <circle
          cx="160"
          cy="160"
          r="140"
          fill="none"
          stroke={isAgitating ? "#ff6b6b" : "#4a5d23"}
          strokeWidth="12"
          strokeLinecap="round"
          strokeDasharray={strokeDasharray}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-500 ${isAgitating ? 'animate-pulse' : ''}`}
        />

        {/* Center circle */}
        <circle
          cx="160"
          cy="160"
          r="80"
          fill="#0f0f0f"
          stroke="#d4af37"
          strokeWidth="2"
        />
      </svg>

      {/* Time display */}
      <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
        <div className={`text-4xl font-bold mb-2 transition-colors duration-300 ${
          isAgitating ? 'text-red-400' : 'text-gold-400'
        }`}>
          {formatTime(currentTime)}
        </div>
        <div className="text-sm text-gray-400 uppercase tracking-wide">
          {isRunning ? (isAgitating ? 'AGITATE' : 'DEVELOPING') : 'READY'}
        </div>
      </div>
    </div>
  );
};