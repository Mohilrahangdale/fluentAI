import React from 'react';
import { Clock } from 'lucide-react';

interface SessionTimerProps {
  elapsedSeconds: number;
  maxSeconds?: number; // 40 minutes = 2400 seconds
  compact?: boolean;
}

export const SessionTimer: React.FC<SessionTimerProps> = ({
  elapsedSeconds,
  maxSeconds = 2400, // 40 minutes
  compact = false,
}) => {
  const formatTime = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${remainder.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, (elapsedSeconds / maxSeconds) * 100);

  if (compact) {
    return (
      <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-mono font-semibold">
        <Clock className="w-3.5 h-3.5 text-emerald-600 animate-pulse" />
        <span>
          {formatTime(elapsedSeconds)} / {formatTime(maxSeconds)}
        </span>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
        <span className="flex items-center gap-1.5 text-slate-700">
          <Clock className="w-3.5 h-3.5 text-emerald-600" />
          <span>Speaking Session</span>
        </span>
        <span className="font-mono font-bold text-slate-800 tracking-wider">
          {formatTime(elapsedSeconds)} <span className="text-slate-400 font-normal">/</span> {formatTime(maxSeconds)}
        </span>
      </div>
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-emerald-500 to-teal-500 transition-all duration-300 rounded-full"
          style={{ width: `${Math.max(2, progressPercent)}%` }}
        />
      </div>
      <div className="mt-1 flex justify-between text-[10px] text-slate-400">
        <span>00:00</span>
        <span className="font-medium text-emerald-600">40-Min Free Practice</span>
        <span>40:00</span>
      </div>
    </div>
  );
};
