import React from 'react';

interface AudioWaveProps {
  active: boolean;
  state?: 'listening' | 'speaking' | 'thinking' | 'idle';
  color?: string;
  size?: 'sm' | 'md' | 'lg';
}

export const AudioWave: React.FC<AudioWaveProps> = ({
  active,
  state = 'idle',
  color = 'bg-emerald-500',
  size = 'md',
}) => {
  const heightMap = {
    sm: 'h-6',
    md: 'h-10',
    lg: 'h-16',
  };

  const barWidthMap = {
    sm: 'w-1',
    md: 'w-1.5',
    lg: 'w-2',
  };

  if (!active && state === 'idle') {
    return (
      <div className={`flex items-center justify-center gap-1.5 ${heightMap[size]}`}>
        {[1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`${barWidthMap[size]} h-2 rounded-full bg-slate-300 transition-all duration-300`}
          />
        ))}
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center gap-1.5 ${heightMap[size]}`}>
      <div
        className={`${barWidthMap[size]} rounded-full ${color} animate-voice-wave-1`}
        style={{ animationDuration: state === 'speaking' ? '0.8s' : '1.4s' }}
      />
      <div
        className={`${barWidthMap[size]} rounded-full ${color} animate-voice-wave-2`}
        style={{ animationDuration: state === 'speaking' ? '0.6s' : '1.1s' }}
      />
      <div
        className={`${barWidthMap[size]} rounded-full ${color} animate-voice-wave-3`}
        style={{ animationDuration: state === 'speaking' ? '0.9s' : '1.3s' }}
      />
      <div
        className={`${barWidthMap[size]} rounded-full ${color} animate-voice-wave-4`}
        style={{ animationDuration: state === 'speaking' ? '0.7s' : '1.0s' }}
      />
      <div
        className={`${barWidthMap[size]} rounded-full ${color} animate-voice-wave-5`}
        style={{ animationDuration: state === 'speaking' ? '1.0s' : '1.2s' }}
      />
    </div>
  );
};
