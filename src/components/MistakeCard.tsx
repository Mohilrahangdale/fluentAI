import React, { useState } from 'react';
import { Volume2, CheckCircle2, RotateCw } from 'lucide-react';
import { MistakeItem } from '../types';
import { SpeechService } from '../services/speechService';

interface MistakeCardProps {
  mistake: MistakeItem;
  onPracticeAgain?: (mistake: MistakeItem) => void;
  onToggleMastered?: (id: string) => void;
  compact?: boolean;
}

export const MistakeCard: React.FC<MistakeCardProps> = ({
  mistake,
  onPracticeAgain,
  onToggleMastered,
  compact = false,
}) => {
  const [isPlaying, setIsPlaying] = useState(false);

  const handleListenCorrected = () => {
    setIsPlaying(true);
    SpeechService.speak(mistake.correctedText, {
      onEnd: () => setIsPlaying(false),
      onError: () => setIsPlaying(false),
    });
  };

  const getCategoryBadgeClass = (category: string) => {
    switch (category) {
      case 'Grammar':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Vocabulary':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Sentence Formation':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      default:
        return 'bg-rose-50 text-rose-700 border-rose-200';
    }
  };

  return (
    <div
      id={`mistake-card-${mistake.id}`}
      className={`rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all ${
        mistake.mastered ? 'border-emerald-300 bg-emerald-50/20' : ''
      }`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <span
          className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getCategoryBadgeClass(
            mistake.category
          )}`}
        >
          {mistake.category}
        </span>
        {mistake.timestamp && (
          <span className="text-xs text-slate-400">{mistake.timestamp}</span>
        )}
      </div>

      <div className="space-y-2.5">
        {/* You said */}
        <div className="rounded-xl bg-rose-50/70 p-3 border border-rose-100">
          <div className="text-xs font-semibold text-rose-700 uppercase tracking-wider mb-1">
            You said
          </div>
          <div className="text-sm font-medium text-slate-800 line-through decoration-rose-400">
            "{mistake.originalText}"
          </div>
        </div>

        {/* Better */}
        <div className="rounded-xl bg-emerald-50/80 p-3 border border-emerald-200/80">
          <div className="flex items-center justify-between mb-1">
            <div className="text-xs font-semibold text-emerald-700 uppercase tracking-wider">
              Better
            </div>
            <button
              id={`listen-btn-${mistake.id}`}
              onClick={handleListenCorrected}
              className="inline-flex items-center gap-1 text-xs text-emerald-700 hover:text-emerald-800 font-medium cursor-pointer"
              title="Listen to correct pronunciation"
            >
              <Volume2 className={`w-3.5 h-3.5 ${isPlaying ? 'animate-pulse text-emerald-600' : ''}`} />
              <span>{isPlaying ? 'Playing...' : 'Listen'}</span>
            </button>
          </div>
          <div className="text-sm font-semibold text-slate-900">
            "{mistake.correctedText}"
          </div>
        </div>

        {/* Why */}
        <div className="px-1 text-xs text-slate-600 leading-relaxed">
          <span className="font-semibold text-slate-700">Why: </span>
          {mistake.explanation}
        </div>
      </div>

      {/* Action footer */}
      {!compact && (
        <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
          {onToggleMastered && (
            <button
              id={`mastered-btn-${mistake.id}`}
              onClick={() => onToggleMastered(mistake.id)}
              className={`inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors cursor-pointer ${
                mistake.mastered
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{mistake.mastered ? 'Mastered' : 'Mark Mastered'}</span>
            </button>
          )}

          {onPracticeAgain && (
            <button
              id={`practice-btn-${mistake.id}`}
              onClick={() => onPracticeAgain(mistake)}
              className="inline-flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
            >
              <RotateCw className="w-3.5 h-3.5" />
              <span>Practice Again</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
