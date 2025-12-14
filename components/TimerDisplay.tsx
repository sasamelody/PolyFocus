import React from 'react';
import { TimerMode } from '../types';

interface TimerDisplayProps {
  timeLeft: number;
  totalTime: number;
  mode: TimerMode;
}

const TimerDisplay: React.FC<TimerDisplayProps> = ({ timeLeft, totalTime, mode }) => {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  
  // Calculate polygon progress
  const percentage = 1 - (timeLeft / totalTime);
  
  // Visual config
  const size = 300;
  const center = size / 2;
  const radius = size / 2 - 10;
  
  // Hexagon points calculation
  const getHexPoints = (r: number) => {
    const points = [];
    for (let i = 0; i < 6; i++) {
        const angle = (Math.PI / 3) * i - Math.PI / 2; // Start from top
        points.push(`${center + r * Math.cos(angle)},${center + r * Math.sin(angle)}`);
    }
    return points.join(' ');
  };
  
  const hexPoints = getHexPoints(radius);
  const perimeter = 6 * radius; // Approx for stroke dasharray logic
  const strokeDashoffset = perimeter * percentage;

  return (
    <div className="relative w-[300px] h-[300px] flex items-center justify-center mb-8">
      {/* Background Hexagon */}
      <svg width={size} height={size} className="absolute inset-0 drop-shadow-[0_0_15px_rgba(0,0,0,0.5)]">
         <polygon 
            points={hexPoints} 
            fill="rgba(30, 41, 59, 0.5)" 
            stroke="#334155" 
            strokeWidth="4"
         />
         
         {/* Progress Overlay */}
         <circle
            cx={center}
            cy={center}
            r={radius - 20}
            fill="none"
            stroke="#1e293b"
            strokeWidth="12"
         />
         <circle
            cx={center}
            cy={center}
            r={radius - 20}
            fill="none"
            stroke={mode === TimerMode.WORK ? '#06b6d4' : '#10b981'}
            strokeWidth="8"
            strokeDasharray={2 * Math.PI * (radius - 20)}
            strokeDashoffset={2 * Math.PI * (radius - 20) * (timeLeft / totalTime)}
            strokeLinecap="butt"
            transform={`rotate(-90 ${center} ${center})`}
            className="transition-all duration-1000 ease-linear"
         />
      </svg>

      {/* Time Text */}
      <div className="z-10 flex flex-col items-center">
        <div className="text-6xl font-black tracking-tighter text-white drop-shadow-md font-mono">
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        <div className={`text-sm font-bold tracking-[0.2em] mt-2 uppercase ${mode === TimerMode.WORK ? 'text-cyan-400' : 'text-emerald-400'}`}>
            {mode === TimerMode.WORK ? '工作时段' : '休息时段'}
        </div>
      </div>
    </div>
  );
};

export default TimerDisplay;