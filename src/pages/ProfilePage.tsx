import React, { useState } from 'react';
import {
  User as UserIcon,
  Flame,
  Clock,
  BookOpen,
  Award,
  ShieldCheck,
  Moon,
  Sun,
  LogOut,
  Sliders,
  ChevronRight,
  Sparkles,
  Volume2,
  Download,
} from 'lucide-react';
import { User, EnglishLevel, LearningGoal } from '../types';
import { StorageService } from '../services/storageService';

interface ProfilePageProps {
  user: User;
  onUpdateUser: (updated: User) => void;
  onLogout: () => void;
  onOpenZeroCostModal: () => void;
  onOpenInstall?: () => void;
  isInstalled?: boolean;
}

export const ProfilePage: React.FC<ProfilePageProps> = ({
  user,
  onUpdateUser,
  onLogout,
  onOpenZeroCostModal,
  onOpenInstall,
  isInstalled = false,
}) => {
  const [isEditingLevel, setIsEditingLevel] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [speechRate, setSpeechRate] = useState<'normal' | 'slower' | 'faster'>('normal');

  const formatHours = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m`;
    return `${(mins / 60).toFixed(1)}h`;
  };

  const handleSelectLevel = (newLevel: EnglishLevel) => {
    const updated = StorageService.updateUser({ englishLevel: newLevel });
    if (updated) onUpdateUser(updated);
    setIsEditingLevel(false);
  };

  const handleToggleGoal = (goal: LearningGoal) => {
    let current = [...user.learningGoals];
    if (current.includes(goal)) {
      if (current.length > 1) {
        current = current.filter((g) => g !== goal);
      }
    } else {
      current.push(goal);
    }
    const updated = StorageService.updateUser({ learningGoals: current });
    if (updated) onUpdateUser(updated);
  };

  const allGoals: LearningGoal[] = [
    'Speaking Confidence',
    'Grammar',
    'Vocabulary',
    'Interview English',
    'Fluency',
  ];

  const handleToggleDarkMode = () => {
    const newMode = !user.darkMode;
    const updated = StorageService.updateUser({ darkMode: newMode });
    if (updated) onUpdateUser(updated);
  };

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-2">
      {/* Profile Card */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-5 shadow-sm text-center relative overflow-hidden">
        <div className="w-16 h-16 rounded-full bg-slate-900 text-white flex items-center justify-center text-xl font-bold mx-auto mb-3 shadow-md">
          {user.name.charAt(0).toUpperCase()}
        </div>

        <h2 className="font-heading font-extrabold text-lg text-slate-900">
          {user.name}
        </h2>
        <p className="text-xs text-slate-400 font-mono mt-0.5">{user.email}</p>

        {/* Level Badge */}
        <div className="mt-3 flex justify-center">
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs font-bold">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
            <span>{user.englishLevel} English</span>
          </span>
        </div>

        {/* Key User Stats Grid */}
        <div className="grid grid-cols-3 gap-2 mt-5 pt-4 border-t border-slate-100 text-center">
          <div className="p-2">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
              <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
              <span>Streak</span>
            </div>
            <div className="font-heading font-bold text-base text-slate-900">
              {user.streak}d
            </div>
          </div>

          <div className="p-2 border-x border-slate-100">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
              <Clock className="w-3.5 h-3.5 text-emerald-600" />
              <span>Speaking</span>
            </div>
            <div className="font-heading font-bold text-base text-slate-900">
              {formatHours(user.totalSpeakingSeconds || 0)}
            </div>
          </div>

          <div className="p-2">
            <div className="flex items-center justify-center gap-1 text-slate-400 text-[11px] mb-0.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Words</span>
            </div>
            <div className="font-heading font-bold text-base text-slate-900">
              {user.wordsLearnedCount || 0}
            </div>
          </div>
        </div>
      </div>

      {/* Learning Goals Chips */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-4 shadow-2xs">
        <div className="flex items-center justify-between mb-2">
          <span className="font-heading font-bold text-sm text-slate-900">
            Active Learning Goals
          </span>
          <button
            onClick={() => setIsEditingGoals(!isEditingGoals)}
            className="text-xs text-emerald-700 font-bold hover:underline cursor-pointer"
          >
            {isEditingGoals ? 'Done' : 'Edit'}
          </button>
        </div>

        {isEditingGoals ? (
          <div className="space-y-2 pt-2">
            {allGoals.map((g) => {
              const active = user.learningGoals.includes(g);
              return (
                <button
                  key={g}
                  onClick={() => handleToggleGoal(g)}
                  className={`w-full text-left p-2.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                    active
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-900'
                      : 'border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <span>{g}</span>
                  {active && <span className="text-emerald-600 font-bold">✓</span>}
                </button>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {user.learningGoals.map((g, i) => (
              <span
                key={i}
                className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
              >
                🎯 {g}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Settings Section */}
      <div className="rounded-3xl bg-white border border-slate-200/80 p-2 shadow-2xs divide-y divide-slate-100">
        {/* English Level Setting */}
        <div className="p-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <div className="font-bold text-xs text-slate-900">English Level</div>
                <div className="text-[11px] text-slate-500">Currently: {user.englishLevel}</div>
              </div>
            </div>
            <button
              onClick={() => setIsEditingLevel(!isEditingLevel)}
              className="text-xs text-emerald-700 font-bold px-2.5 py-1 rounded-lg hover:bg-emerald-50 cursor-pointer"
            >
              {isEditingLevel ? 'Cancel' : 'Change'}
            </button>
          </div>

          {isEditingLevel && (
            <div className="grid grid-cols-3 gap-2 mt-3 pt-2">
              {(['Beginner', 'Intermediate', 'Advanced'] as EnglishLevel[]).map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => handleSelectLevel(lvl)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-colors cursor-pointer ${
                    user.englishLevel === lvl
                      ? 'bg-emerald-600 text-white border-emerald-600'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {lvl}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Dark Mode Toggle */}
        <div className="p-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
              {user.darkMode ? <Moon className="w-4 h-4" /> : <Sun className="w-4 h-4" />}
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Dark Mode</div>
              <div className="text-[11px] text-slate-500">
                {user.darkMode ? 'Enabled (night theme)' : 'Standard clean theme'}
              </div>
            </div>
          </div>
          <button
            onClick={handleToggleDarkMode}
            className={`w-11 h-6 flex items-center rounded-full p-1 cursor-pointer transition-colors ${
              user.darkMode ? 'bg-emerald-600' : 'bg-slate-200'
            }`}
          >
            <div
              className={`bg-white w-4 h-4 rounded-full shadow-md transform transition-transform ${
                user.darkMode ? 'translate-x-5' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

        {/* PWA App Installation */}
        <button
          onClick={onOpenInstall}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Download className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Install FluentAI App</div>
              <div className="text-[11px] text-slate-500">
                {isInstalled ? 'Installed on Home Screen' : 'Add to Home Screen (PWA)'}
              </div>
            </div>
          </div>
          {isInstalled ? (
            <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Installed
            </span>
          ) : (
            <ChevronRight className="w-4 h-4 text-slate-400" />
          )}
        </button>

        {/* ₹0 Zero Cost & Privacy Guarantee */}
        <button
          onClick={onOpenZeroCostModal}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-slate-50 rounded-2xl transition-colors cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs text-slate-900">Zero Cost (₹0) Guarantee</div>
              <div className="text-[11px] text-slate-500">Browser-native APIs & Privacy</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-slate-400" />
        </button>

        {/* Logout */}
        <button
          id="logout-btn"
          onClick={onLogout}
          className="w-full p-3 flex items-center justify-between text-left hover:bg-rose-50 rounded-2xl transition-colors text-rose-600 cursor-pointer"
        >
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-xs">Log Out</div>
              <div className="text-[11px] text-rose-400">Sign out of your session</div>
            </div>
          </div>
          <ChevronRight className="w-4 h-4 text-rose-300" />
        </button>
      </div>
    </div>
  );
};
