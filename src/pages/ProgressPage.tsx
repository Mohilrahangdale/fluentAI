import React, { useState } from 'react';
import {
  Clock,
  Flame,
  Award,
  BookOpen,
  AlertTriangle,
  TrendingUp,
  Volume2,
  Trash2,
  RotateCcw,
  CheckCircle2,
  Plus,
  Search,
} from 'lucide-react';
import { User, MistakeItem, VocabularyItem, DailyChallenge } from '../types';
import { StorageService } from '../services/storageService';
import { SpeechService } from '../services/speechService';
import { MistakeCard } from '../components/MistakeCard';

interface ProgressPageProps {
  user: User;
  onPracticeMistake: (mistake: MistakeItem) => void;
  onStartChallenge: (challenge: DailyChallenge) => void;
  challenges: DailyChallenge[];
}

export const ProgressPage: React.FC<ProgressPageProps> = ({
  user,
  onPracticeMistake,
  onStartChallenge,
  challenges,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'mistakes' | 'vocabulary'>('overview');
  const [mistakes, setMistakes] = useState<MistakeItem[]>(StorageService.getMistakes());
  const [vocabulary, setVocabulary] = useState<VocabularyItem[]>(StorageService.getVocabulary());
  const [mistakeCategoryFilter, setMistakeCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showAddWordModal, setShowAddWordModal] = useState(false);
  const [newWord, setNewWord] = useState('');
  const [newMeaning, setNewMeaning] = useState('');
  const [newExample, setNewExample] = useState('');

  const formatHours = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins} mins`;
    return `${(mins / 60).toFixed(1)} hrs`;
  };

  const handleToggleMastered = (id: string) => {
    StorageService.toggleMistakeMastered(id);
    setMistakes(StorageService.getMistakes());
  };

  const handleRemoveWord = (id: string) => {
    StorageService.removeVocabulary(id);
    setVocabulary(StorageService.getVocabulary());
  };

  const handleListenWord = (word: string) => {
    SpeechService.speak(word);
  };

  const handleAddWordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWord.trim() || !newMeaning.trim()) return;

    const item: VocabularyItem = {
      id: 'v-' + Date.now(),
      word: newWord.trim(),
      meaning: newMeaning.trim(),
      example: newExample.trim() || `Use "${newWord.trim()}" in daily conversation.`,
      dateAdded: new Date().toISOString().split('T')[0],
      learned: false,
    };

    StorageService.addVocabulary(item);
    setVocabulary(StorageService.getVocabulary());
    setNewWord('');
    setNewMeaning('');
    setNewExample('');
    setShowAddWordModal(false);
  };

  const filteredMistakes = mistakes.filter((m) => {
    if (mistakeCategoryFilter !== 'All' && m.category !== mistakeCategoryFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        m.originalText.toLowerCase().includes(q) ||
        m.correctedText.toLowerCase().includes(q) ||
        m.explanation.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const filteredVocabulary = vocabulary.filter((v) => {
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        v.word.toLowerCase().includes(q) ||
        v.meaning.toLowerCase().includes(q) ||
        v.example.toLowerCase().includes(q)
      );
    }
    return true;
  });

  // Calculate stats
  const mistakesImproved = mistakes.filter((m) => m.mastered).length;
  const fluencyScore = Math.min(96, 32 + (user.sessionsCount || 0) * 5 + user.streak * 2);

  // Mock weekly activity for clean visual chart
  const weeklyData = [
    { day: 'Mon', mins: 15, active: true },
    { day: 'Tue', mins: 25, active: true },
    { day: 'Wed', mins: 20, active: true },
    { day: 'Thu', mins: 35, active: true },
    { day: 'Fri', mins: 30, active: true },
    { day: 'Sat', mins: 40, active: true },
    { day: 'Sun', mins: 20, active: true },
  ];

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-2">
      {/* Header */}
      <div>
        <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
          Progress & Learning
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Track speaking time, review mistakes, and build your word bank
        </p>
      </div>

      {/* Main Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'overview'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Analytics
        </button>
        <button
          onClick={() => setActiveTab('mistakes')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'mistakes'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Mistakes ({mistakes.length})
        </button>
        <button
          onClick={() => setActiveTab('vocabulary')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            activeTab === 'vocabulary'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Word Bank ({vocabulary.length})
        </button>
      </div>

      {/* TAB 1: OVERVIEW & ANALYTICS */}
      {activeTab === 'overview' && (
        <div className="space-y-4">
          {/* Key Metrics Grid */}
          <div className="grid grid-cols-2 gap-3">
            {/* Total Speaking Time */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                <Clock className="w-4 h-4 text-emerald-600" />
                <span>Total Speaking Time</span>
              </div>
              <div className="font-heading font-extrabold text-2xl text-slate-900">
                {formatHours(user.totalSpeakingSeconds || 0)}
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
                ~{Math.round((user.totalSpeakingSeconds || 0) / 60)} minutes spoken
              </span>
            </div>

            {/* Sessions Completed */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                <Award className="w-4 h-4 text-blue-600" />
                <span>Sessions Completed</span>
              </div>
              <div className="font-heading font-extrabold text-2xl text-slate-900">
                {user.sessionsCount || 0}
              </div>
              <span className="text-[10px] text-slate-400 font-medium mt-1 inline-block">
                Goal: 1 call daily
              </span>
            </div>

            {/* Current Streak */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                <Flame className="w-4 h-4 text-orange-500 fill-orange-500" />
                <span>Current Streak</span>
              </div>
              <div className="font-heading font-extrabold text-2xl text-slate-900">
                {user.streak} <span className="text-sm font-semibold text-slate-400">days</span>
              </div>
              <span className="text-[10px] text-orange-600 font-semibold mt-1 inline-block">
                Keep the momentum!
              </span>
            </div>

            {/* Improvement Percentage */}
            <div className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium mb-1">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                <span>Fluency Level</span>
              </div>
              <div className="font-heading font-extrabold text-2xl text-emerald-700">
                +{fluencyScore}%
              </div>
              <span className="text-[10px] text-emerald-600 font-semibold mt-1 inline-block">
                {mistakesImproved} mistakes improved
              </span>
            </div>
          </div>

          {/* Simple Clean Activity Chart */}
          <div className="p-4 rounded-3xl bg-white border border-slate-200/80 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading font-bold text-sm text-slate-900">
                Weekly Speaking Consistency
              </span>
              <span className="text-xs text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded-full">
                7 / 7 Days Active
              </span>
            </div>

            <div className="flex items-end justify-between gap-2 h-28 pt-4 px-2">
              {weeklyData.map((item, idx) => {
                const heightPercent = Math.max(15, (item.mins / 40) * 100);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-1.5 h-full justify-end">
                    <div className="w-full flex justify-center">
                      <span className="text-[9px] font-mono text-slate-400">
                        {item.mins}m
                      </span>
                    </div>
                    <div
                      className={`w-full rounded-t-lg transition-all duration-500 ${
                        idx === 5
                          ? 'bg-emerald-600'
                          : 'bg-emerald-200 hover:bg-emerald-300'
                      }`}
                      style={{ height: `${heightPercent}%` }}
                    />
                    <span className="text-[10px] font-semibold text-slate-500">
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Daily Challenges Section */}
          <div className="rounded-3xl bg-white border border-slate-200/80 p-4 shadow-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <Flame className="w-4 h-4 text-orange-500" />
                <span>Daily Speaking Challenges</span>
              </span>
              <span className="text-xs text-slate-400">
                {challenges.filter((c) => c.completed).length} / {challenges.length} Done
              </span>
            </div>

            <div className="space-y-2.5">
              {challenges.slice(0, 3).map((ch) => (
                <div
                  key={ch.id}
                  className="p-3 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-between gap-3"
                >
                  <div>
                    <div className="font-bold text-xs text-slate-900">{ch.title}</div>
                    <div className="text-[11px] text-slate-500 line-clamp-1">{ch.prompt}</div>
                  </div>
                  <button
                    onClick={() => onStartChallenge(ch)}
                    className="px-3 py-1.5 rounded-xl bg-slate-900 text-white text-xs font-semibold hover:bg-slate-800 shrink-0 cursor-pointer"
                  >
                    Start
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: MISTAKE BANK */}
      {activeTab === 'mistakes' && (
        <div className="space-y-3.5">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-1.5">
            {['All', 'Grammar', 'Vocabulary', 'Sentence Formation', 'Common Mistakes'].map((cat) => (
              <button
                key={cat}
                onClick={() => setMistakeCategoryFilter(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                  mistakeCategoryFilter === cat
                    ? 'bg-slate-900 text-white'
                    : 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search mistakes or corrections..."
              className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            />
          </div>

          {/* Mistakes list */}
          {filteredMistakes.length === 0 ? (
            <div className="p-8 text-center rounded-3xl bg-white border border-slate-200">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <div className="font-bold text-sm text-slate-900">No mistakes found</div>
              <div className="text-xs text-slate-500 mt-1">
                Your speaking accuracy is high! Keep speaking to record learning points.
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredMistakes.map((mistake) => (
                <MistakeCard
                  key={mistake.id}
                  mistake={mistake}
                  onPracticeAgain={onPracticeMistake}
                  onToggleMastered={handleToggleMastered}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: VOCABULARY WORD BANK */}
      {activeTab === 'vocabulary' && (
        <div className="space-y-3.5">
          <div className="flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search word bank..."
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
              />
            </div>
            <button
              onClick={() => setShowAddWordModal(true)}
              className="flex items-center gap-1 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shrink-0 cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add Word</span>
            </button>
          </div>

          {/* Words List */}
          <div className="space-y-2.5">
            {filteredVocabulary.map((vocab) => (
              <div
                key={vocab.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/80 shadow-2xs transition-all"
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div>
                    <div className="flex items-baseline gap-2">
                      <h3 className="font-heading font-extrabold text-base text-slate-900">
                        {vocab.word}
                      </h3>
                      {vocab.phonetic && (
                        <span className="font-mono text-xs text-slate-400">
                          {vocab.phonetic}
                        </span>
                      )}
                    </div>
                    {vocab.partOfSpeech && (
                      <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded">
                        {vocab.partOfSpeech}
                      </span>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleListenWord(vocab.word)}
                      className="p-2 rounded-lg text-emerald-700 hover:bg-emerald-50 transition-colors cursor-pointer"
                      title="Listen pronunciation"
                    >
                      <Volume2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleRemoveWord(vocab.id)}
                      className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                      title="Remove from word bank"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed mb-2 font-medium">
                  {vocab.meaning}
                </p>

                <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 italic border border-slate-100">
                  "{vocab.example}"
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Add Custom Word Modal */}
      {showAddWordModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm">
          <div className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-xl border border-slate-100">
            <h3 className="font-heading font-bold text-base text-slate-900 mb-3">
              Add New Word to Bank
            </h3>
            <form onSubmit={handleAddWordSubmit} className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Word</label>
                <input
                  type="text"
                  required
                  value={newWord}
                  onChange={(e) => setNewWord(e.target.value)}
                  placeholder="e.g. Resilient"
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Meaning</label>
                <textarea
                  required
                  rows={2}
                  value={newMeaning}
                  onChange={(e) => setNewMeaning(e.target.value)}
                  placeholder="Able to withstand or recover quickly from difficult conditions."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Example Sentence</label>
                <input
                  type="text"
                  value={newExample}
                  onChange={(e) => setNewExample(e.target.value)}
                  placeholder="She is resilient in the face of setbacks."
                  className="w-full p-2.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>
              <div className="flex gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddWordModal(false)}
                  className="flex-1 py-2.5 rounded-xl border border-slate-200 text-slate-600 font-semibold cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 rounded-xl bg-emerald-600 text-white font-bold hover:bg-emerald-700 cursor-pointer"
                >
                  Save Word
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
