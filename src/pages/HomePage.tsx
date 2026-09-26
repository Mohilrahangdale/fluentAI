import React from 'react';
import {
  Mic,
  MessageSquare,
  BookOpen,
  Briefcase,
  Flame,
  ArrowRight,
  TrendingUp,
  Clock,
  CheckCircle2,
  Sparkles,
  RotateCw,
} from 'lucide-react';
import { User, PracticeTopic, DailyChallenge, MistakeItem } from '../types';
import { AudioWave } from '../components/AudioWave';

interface HomePageProps {
  user: User;
  onStartSpeaking: (topic?: PracticeTopic) => void;
  onStartChallenge: (challenge: DailyChallenge) => void;
  onOpenTopic: (topicId: string) => void;
  onPracticeMistake: (mistake: MistakeItem) => void;
  onViewAllMistakes: () => void;
  onViewProgress: () => void;
  todayChallenge: DailyChallenge;
  recentMistake?: MistakeItem | null;
}

export const HomePage: React.FC<HomePageProps> = ({
  user,
  onStartSpeaking,
  onStartChallenge,
  onOpenTopic,
  onPracticeMistake,
  onViewAllMistakes,
  onViewProgress,
  todayChallenge,
  recentMistake,
}) => {
  const formatSpeakingTime = (totalSecs: number) => {
    const mins = Math.floor(totalSecs / 60);
    if (mins < 60) return `${mins} mins`;
    const hours = (mins / 60).toFixed(1);
    return `${hours} hrs`;
  };

  return (
    <div className="space-y-6 pb-24 max-w-md mx-auto px-4 pt-2">
      {/* Hero Section */}
      <section className="relative rounded-3xl bg-gradient-to-b from-emerald-600 via-emerald-700 to-teal-800 text-white p-6 shadow-xl shadow-emerald-900/10 overflow-hidden">
        {/* Subtle decorative glow */}
        <div className="absolute -top-12 -right-12 w-40 h-40 bg-teal-400/20 rounded-full blur-2xl" />

        <div className="relative z-10 flex flex-col items-center text-center">
          {/* Friendly AI Visual with Voice Wave Animation */}
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center shadow-inner">
              <Sparkles className="w-9 h-9 text-emerald-100 animate-pulse" />
            </div>
            <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white text-emerald-800 px-2.5 py-0.5 rounded-full text-[10px] font-bold shadow-sm whitespace-nowrap">
              AI Partner Ready
            </div>
          </div>

          <div className="my-1">
            <AudioWave active={true} state="speaking" color="bg-emerald-200" size="sm" />
          </div>

          <h1 className="font-heading font-extrabold text-2xl tracking-tight leading-tight mt-2">
            Speak English Confidently with AI
          </h1>

          <p className="text-xs text-emerald-100/90 font-medium max-w-xs mt-1.5 leading-relaxed">
            Talk naturally, make mistakes, and improve every day.
          </p>

          {/* Main CTA */}
          <button
            id="home-start-speaking-btn"
            onClick={() => onStartSpeaking()}
            className="w-full mt-5 py-3.5 px-6 rounded-2xl bg-white text-emerald-950 font-bold text-base shadow-lg hover:bg-emerald-50 active:scale-[0.98] transition-all flex items-center justify-center gap-2.5 cursor-pointer"
          >
            <div className="w-7 h-7 rounded-full bg-emerald-600 text-white flex items-center justify-center">
              <Mic className="w-4 h-4" />
            </div>
            <span>Start Speaking</span>
          </button>

          <span className="text-[11px] text-emerald-200/90 font-semibold mt-2 flex items-center gap-1">
            <span>✨ Free voice conversation</span>
            <span>•</span>
            <span>40 min session</span>
          </span>
        </div>
      </section>

      {/* Quick Practice: ONLY 4 options as requested */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-heading font-bold text-base text-slate-900">
            Quick Practice
          </h2>
          <span className="text-xs text-slate-500 font-medium">Pick a mode</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* 1. Free Talk */}
          <button
            id="quick-freetalk-btn"
            onClick={() => onOpenTopic('free-talk')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Mic className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 mb-0.5">
              🎤 Free Talk
            </div>
            <div className="text-[11px] text-slate-500 leading-snug">
              Open conversation about anything
            </div>
          </button>

          {/* 2. Daily Topic */}
          <button
            id="quick-dailytopic-btn"
            onClick={() => onOpenTopic('daily-topic')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-blue-300 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 mb-0.5">
              💬 Daily Topic
            </div>
            <div className="text-[11px] text-slate-500 leading-snug">
              Thought-provoking question today
            </div>
          </button>

          {/* 3. Grammar */}
          <button
            id="quick-grammar-btn"
            onClick={() => onOpenTopic('grammar-practice')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-purple-300 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 mb-0.5">
              📚 Grammar
            </div>
            <div className="text-[11px] text-slate-500 leading-snug">
              Past tense & structure practice
            </div>
          </button>

          {/* 4. Interview */}
          <button
            id="quick-interview-btn"
            onClick={() => onOpenTopic('interview-prep')}
            className="p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-amber-300 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center mb-2.5 group-hover:scale-105 transition-transform">
              <Briefcase className="w-5 h-5" />
            </div>
            <div className="font-bold text-sm text-slate-900 mb-0.5">
              💼 Interview
            </div>
            <div className="text-[11px] text-slate-500 leading-snug">
              Job questions & articulate answers
            </div>
          </button>
        </div>
      </section>

      {/* Today's Challenge */}
      <section className="rounded-3xl bg-slate-900 text-white p-5 shadow-md relative overflow-hidden">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500/20 text-orange-400 text-xs font-bold border border-orange-500/30">
            <Flame className="w-3.5 h-3.5 fill-current" />
            <span>Today's Challenge</span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            {todayChallenge.durationMinutes} mins
          </span>
        </div>

        <h3 className="font-heading font-bold text-base text-white mt-1">
          {todayChallenge.title}
        </h3>
        <p className="text-xs text-slate-300 mt-1 leading-relaxed">
          {todayChallenge.prompt}
        </p>

        <div className="mt-4 flex items-center justify-between gap-3">
          <span className="text-[11px] text-emerald-400 font-semibold">
            🎯 Target: {todayChallenge.targetGoal}
          </span>
          <button
            id="start-challenge-btn"
            onClick={() => onStartChallenge(todayChallenge)}
            className="py-2.5 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <span>Start Challenge</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </section>

      {/* Your Progress */}
      <section>
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="font-heading font-bold text-base text-slate-900">
            Your Progress
          </h2>
          <button
            onClick={onViewProgress}
            className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer flex items-center gap-0.5"
          >
            <span>View All</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Speaking Time */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium mb-1">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Speaking Time</span>
            </div>
            <div className="font-heading font-extrabold text-base text-slate-900">
              {formatSpeakingTime(user.totalSpeakingSeconds || 0)}
            </div>
          </div>

          {/* Current Streak */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium mb-1">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>Streak</span>
            </div>
            <div className="font-heading font-extrabold text-base text-slate-900">
              {user.streak} days
            </div>
          </div>

          {/* Improvement */}
          <div className="p-3.5 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
            <div className="flex items-center gap-1 text-slate-400 text-[11px] font-medium mb-1">
              <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
              <span>Improvement</span>
            </div>
            <div className="font-heading font-extrabold text-base text-emerald-700">
              +{Math.min(92, 28 + (user.sessionsCount || 0) * 4)}%
            </div>
          </div>
        </div>
      </section>

      {/* Recent Mistake */}
      <section>
        <div className="flex items-center justify-between mb-2.5 px-1">
          <div className="flex items-center gap-1.5">
            <span className="text-base">💡</span>
            <h2 className="font-heading font-bold text-base text-slate-900">
              Recent Mistake
            </h2>
          </div>
          <button
            onClick={onViewAllMistakes}
            className="text-xs text-slate-500 font-medium hover:text-slate-800 cursor-pointer"
          >
            Mistake Bank
          </button>
        </div>

        {recentMistake ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-2 mb-3">
              {/* Wrong */}
              <div className="flex items-start gap-2 text-xs">
                <span className="text-rose-500 font-bold shrink-0">❌</span>
                <span className="text-slate-600 line-through font-medium">
                  {recentMistake.originalText}
                </span>
              </div>
              {/* Right */}
              <div className="flex items-start gap-2 text-xs">
                <span className="text-emerald-600 font-bold shrink-0">✅</span>
                <span className="text-slate-900 font-bold">
                  {recentMistake.correctedText}
                </span>
              </div>
            </div>

            <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
              <span className="text-[11px] text-slate-500">
                {recentMistake.category}
              </span>
              <button
                onClick={() => onPracticeMistake(recentMistake)}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 text-xs font-semibold hover:bg-emerald-100 transition-colors cursor-pointer"
              >
                <RotateCw className="w-3 h-3" />
                <span>Practice This</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="space-y-2 mb-3">
              <div className="flex items-start gap-2 text-xs">
                <span className="text-rose-500 font-bold shrink-0">❌</span>
                <span className="text-slate-600 line-through font-medium">
                  I am going yesterday.
                </span>
              </div>
              <div className="flex items-start gap-2 text-xs">
                <span className="text-emerald-600 font-bold shrink-0">✅</span>
                <span className="text-slate-900 font-bold">
                  I went yesterday.
                </span>
              </div>
            </div>
            <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
              Grammar • Past tense with completed time periods.
            </div>
          </div>
        )}
      </section>
    </div>
  );
};
