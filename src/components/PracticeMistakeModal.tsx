import React, { useState } from 'react';
import { Volume2, Mic, CheckCircle2, X, RotateCcw, Sparkles } from 'lucide-react';
import { MistakeItem } from '../types';
import { SpeechService } from '../services/speechService';
import { StorageService } from '../services/storageService';

interface PracticeMistakeModalProps {
  mistake: MistakeItem | null;
  onClose: () => void;
  onMastered: (id: string) => void;
}

export const PracticeMistakeModal: React.FC<PracticeMistakeModalProps> = ({
  mistake,
  onClose,
  onMastered,
}) => {
  const [isListening, setIsListening] = useState(false);
  const [spokenText, setSpokenText] = useState('');
  const [resultStatus, setResultStatus] = useState<'idle' | 'success' | 'retry'>('idle');

  if (!mistake) return null;

  const handleListen = () => {
    SpeechService.speak(mistake.correctedText);
  };

  const handleStartSpeaking = () => {
    setResultStatus('idle');
    setSpokenText('');
    setIsListening(true);

    SpeechService.startListening({
      onStart: () => setIsListening(true),
      onResult: (transcript: string, isFinal: boolean) => {
        setSpokenText(transcript);
        if (isFinal) {
          evaluatePronunciation(transcript);
        }
      },
      onError: () => {
        setIsListening(false);
      },
      onEnd: () => {
        setIsListening(false);
      },
    });
  };

  const evaluatePronunciation = (userSpoken: string) => {
    setIsListening(false);
    StorageService.incrementMistakePracticeCount(mistake.id);

    const targetWords = mistake.correctedText.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');
    const spokenWords = userSpoken.toLowerCase().replace(/[^a-z0-9 ]/g, '').split(' ');

    // Check overlap
    const matches = targetWords.filter((w) => spokenWords.includes(w));
    const ratio = matches.length / Math.max(1, targetWords.length);

    if (ratio >= 0.65 || userSpoken.length >= 6) {
      setResultStatus('success');
      onMastered(mistake.id);
    } else {
      setResultStatus('retry');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-4">
          <div className="w-10 h-10 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2">
            <RotateCcw className="w-5 h-5" />
          </div>
          <h3 className="font-heading font-bold text-lg text-slate-900">
            Speaking Drill Practice
          </h3>
          <p className="text-xs text-slate-500">
            Listen to the correct phrasing, then speak it into your microphone.
          </p>
        </div>

        {/* Incorrect version reminder */}
        <div className="p-3 rounded-2xl bg-rose-50 border border-rose-100 mb-3 text-xs">
          <span className="font-bold text-rose-700 uppercase tracking-wide">Previous slip: </span>
          <span className="text-slate-800 line-through">"{mistake.originalText}"</span>
        </div>

        {/* Target Correct sentence */}
        <div className="p-4 rounded-2xl bg-emerald-50/80 border border-emerald-300 mb-4 text-center">
          <div className="text-xs font-semibold text-emerald-800 uppercase tracking-wider mb-1">
            Say This Aloud
          </div>
          <div className="font-heading font-bold text-base text-slate-900 mb-3">
            "{mistake.correctedText}"
          </div>
          <button
            onClick={handleListen}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-emerald-300 text-emerald-800 text-xs font-semibold hover:bg-emerald-100/50 shadow-2xs transition-colors cursor-pointer"
          >
            <Volume2 className="w-4 h-4 text-emerald-600" />
            <span>Hear Native Voice</span>
          </button>
        </div>

        {/* Spoken result state */}
        {spokenText && (
          <div className="p-3 rounded-xl bg-slate-100 text-xs text-center mb-3">
            <span className="text-slate-500">We heard: </span>
            <span className="font-semibold text-slate-900">"{spokenText}"</span>
          </div>
        )}

        {resultStatus === 'success' && (
          <div className="p-3.5 rounded-2xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold text-center mb-4 flex items-center justify-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700" />
            <span>Brilliant! That was natural and accurate. Marked as Mastered!</span>
          </div>
        )}

        {resultStatus === 'retry' && (
          <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium text-center mb-4">
            Almost there! Try speaking a bit slower and clearer.
          </div>
        )}

        {/* Big voice mic button */}
        <div className="flex flex-col items-center justify-center gap-2">
          <button
            onClick={handleStartSpeaking}
            disabled={isListening}
            className={`w-16 h-16 rounded-full flex items-center justify-center shadow-md transition-all cursor-pointer ${
              isListening
                ? 'bg-rose-500 text-white animate-pulse ring-4 ring-rose-200'
                : 'bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95'
            }`}
          >
            <Mic className="w-7 h-7" />
          </button>
          <span className="text-xs text-slate-500 font-semibold">
            {isListening ? 'Listening... Speak now!' : 'Tap mic and read aloud'}
          </span>
        </div>

        <div className="mt-5 pt-3 border-t border-slate-100 flex justify-end">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
