import React, { useState } from 'react';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { EnglishLevel, LearningGoal, User } from '../types';
import { StorageService } from '../services/storageService';

interface OnboardingModalProps {
  isOpen: boolean;
  currentUser: User;
  onComplete: (updatedUser: User) => void;
}

export const OnboardingModal: React.FC<OnboardingModalProps> = ({
  isOpen,
  currentUser,
  onComplete,
}) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [level, setLevel] = useState<EnglishLevel>(currentUser.englishLevel || 'Intermediate');
  const [goals, setGoals] = useState<LearningGoal[]>(
    currentUser.learningGoals.length > 0
      ? currentUser.learningGoals
      : ['Speaking Confidence', 'Fluency']
  );

  if (!isOpen) return null;

  const levelOptions: Array<{ level: EnglishLevel; title: string; desc: string; badge: string }> = [
    {
      level: 'Beginner',
      title: 'Beginner',
      desc: 'Simple English, short sentences, patient guidance and gentle corrections.',
      badge: 'Slow & Clear',
    },
    {
      level: 'Intermediate',
      title: 'Intermediate',
      desc: 'Normal English conversation, natural vocabulary, idioms, and feedback.',
      badge: 'Balanced Flow',
    },
    {
      level: 'Advanced',
      title: 'Advanced',
      desc: 'Natural rapid discussions, advanced vocabulary, and thought-provoking debates.',
      badge: 'Challenging',
    },
  ];

  const goalOptions: LearningGoal[] = [
    'Speaking Confidence',
    'Grammar',
    'Vocabulary',
    'Interview English',
    'Fluency',
  ];

  const toggleGoal = (goal: LearningGoal) => {
    if (goals.includes(goal)) {
      if (goals.length > 1) {
        setGoals(goals.filter((g) => g !== goal));
      }
    } else {
      setGoals([...goals, goal]);
    }
  };

  const handleFinish = () => {
    const updated = StorageService.updateUser({
      englishLevel: level,
      learningGoals: goals,
    });
    if (updated) {
      onComplete(updated);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
        {/* Step Indicator */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-1.5">
            <span className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold">
              {step}
            </span>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Step {step} of 2
            </span>
          </div>
          <div className="flex gap-1.5">
            <div className={`h-1.5 w-6 rounded-full ${step >= 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
            <div className={`h-1.5 w-6 rounded-full ${step === 2 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
          </div>
        </div>

        {step === 1 ? (
          <div>
            <div className="mb-4">
              <h2 className="font-heading font-extrabold text-xl text-slate-900">
                What is your English level?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Your AI speaking partner will adapt vocabulary and speaking speed to match you.
              </p>
            </div>

            <div className="space-y-3 mb-6">
              {levelOptions.map((opt) => (
                <button
                  key={opt.level}
                  id={`level-opt-${opt.level.toLowerCase()}`}
                  type="button"
                  onClick={() => setLevel(opt.level)}
                  className={`w-full text-left p-4 rounded-2xl border transition-all cursor-pointer ${
                    level === opt.level
                      ? 'border-emerald-600 bg-emerald-50/50 ring-2 ring-emerald-500/20 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-bold text-sm text-slate-900">{opt.title}</span>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
                      {opt.badge}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{opt.desc}</p>
                </button>
              ))}
            </div>

            <button
              id="onboarding-next-btn"
              type="button"
              onClick={() => setStep(2)}
              className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <span>Next: Choose Goals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <div className="mb-4">
              <h2 className="font-heading font-extrabold text-xl text-slate-900">
                What do you want to improve?
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                Select your primary goals. We'll tailor speaking challenges and vocabulary prompts for you.
              </p>
            </div>

            <div className="space-y-2.5 mb-6">
              {goalOptions.map((goal) => {
                const isSelected = goals.includes(goal);
                return (
                  <button
                    key={goal}
                    id={`goal-opt-${goal.toLowerCase().replace(/\s+/g, '-')}`}
                    type="button"
                    onClick={() => toggleGoal(goal)}
                    className={`w-full flex items-center justify-between p-3.5 rounded-2xl border transition-all cursor-pointer ${
                      isSelected
                        ? 'border-emerald-600 bg-emerald-50/60 font-semibold text-slate-900 shadow-xs'
                        : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="text-sm">{goal}</span>
                    <div
                      className={`w-5 h-5 rounded-md flex items-center justify-center border ${
                        isSelected
                          ? 'bg-emerald-600 border-emerald-600 text-white'
                          : 'border-slate-300 bg-white'
                      }`}
                    >
                      {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="flex gap-2.5">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="py-3 px-4 rounded-xl border border-slate-200 text-slate-600 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
              >
                Back
              </button>
              <button
                id="onboarding-finish-btn"
                type="button"
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-all cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                <span>Save & Start Speaking</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
