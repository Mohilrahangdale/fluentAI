import React, { useState } from 'react';
import {
  Mic,
  MessageSquare,
  BookOpen,
  Briefcase,
  GraduationCap,
  Plane,
  Utensils,
  ShoppingBag,
  Users,
  Home,
  Cpu,
  Sparkles,
  Clock,
  Shuffle,
  ChevronRight,
  Filter,
} from 'lucide-react';
import { PracticeTopic } from '../types';
import { PRACTICE_TOPICS } from '../data/topics';

interface PracticePageProps {
  onSelectTopic: (topic: PracticeTopic) => void;
}

export const PracticePage: React.FC<PracticePageProps> = ({ onSelectTopic }) => {
  const [filter, setFilter] = useState<'all' | 'quick' | 'situational'>('all');

  // Map icon names to lucide components
  const renderIcon = (name: string) => {
    switch (name) {
      case 'Mic':
        return <Mic className="w-5 h-5 text-emerald-600" />;
      case 'MessageSquare':
        return <MessageSquare className="w-5 h-5 text-blue-600" />;
      case 'BookOpen':
        return <BookOpen className="w-5 h-5 text-purple-600" />;
      case 'Briefcase':
        return <Briefcase className="w-5 h-5 text-amber-600" />;
      case 'GraduationCap':
        return <GraduationCap className="w-5 h-5 text-indigo-600" />;
      case 'Plane':
        return <Plane className="w-5 h-5 text-sky-600" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-orange-600" />;
      case 'ShoppingBag':
        return <ShoppingBag className="w-5 h-5 text-pink-600" />;
      case 'Users':
        return <Users className="w-5 h-5 text-teal-600" />;
      case 'Home':
        return <Home className="w-5 h-5 text-amber-700" />;
      case 'Cpu':
        return <Cpu className="w-5 h-5 text-blue-700" />;
      case 'Sparkles':
        return <Sparkles className="w-5 h-5 text-emerald-600" />;
      default:
        return <Clock className="w-5 h-5 text-slate-600" />;
    }
  };

  const handleRandomTopic = () => {
    const randomIndex = Math.floor(Math.random() * PRACTICE_TOPICS.length);
    onSelectTopic(PRACTICE_TOPICS[randomIndex]);
  };

  const filteredTopics = PRACTICE_TOPICS.filter((t) => {
    if (filter === 'quick') return t.category !== 'situational';
    if (filter === 'situational') return t.category === 'situational';
    return true;
  });

  return (
    <div className="space-y-5 pb-24 max-w-md mx-auto px-4 pt-2">
      {/* Page Header */}
      <div className="flex items-center justify-between pt-1">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-slate-900 tracking-tight">
            Speaking Practice
          </h1>
          <p className="text-xs text-slate-500 mt-0.5">
            Choose a topic or simulate real-world situations
          </p>
        </div>

        {/* Random Topic Button */}
        <button
          id="random-topic-btn"
          onClick={handleRandomTopic}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-bold transition-all cursor-pointer active:scale-95 shadow-2xs"
          title="Pick a random topic"
        >
          <Shuffle className="w-3.5 h-3.5 text-emerald-600" />
          <span>Random</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          All Topics ({PRACTICE_TOPICS.length})
        </button>
        <button
          onClick={() => setFilter('quick')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filter === 'quick'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Quick Practice
        </button>
        <button
          onClick={() => setFilter('situational')}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all cursor-pointer ${
            filter === 'situational'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-900'
          }`}
        >
          Situational
        </button>
      </div>

      {/* Topics List */}
      <div className="space-y-3">
        {filteredTopics.map((topic) => (
          <button
            key={topic.id}
            id={`topic-item-${topic.id}`}
            onClick={() => onSelectTopic(topic)}
            className="w-full p-4 rounded-2xl bg-white border border-slate-200/80 hover:border-emerald-300 hover:shadow-md transition-all text-left flex items-start gap-3.5 group cursor-pointer"
          >
            <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {renderIcon(topic.iconName)}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-1 mb-1">
                <h3 className="font-heading font-bold text-sm text-slate-900 line-clamp-1 group-hover:text-emerald-700 transition-colors">
                  {topic.title}
                </h3>
                {topic.situationalContext && (
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-md shrink-0">
                    Scenario
                  </span>
                )}
              </div>

              <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-2">
                {topic.description}
              </p>

              {/* Keywords chips */}
              <div className="flex flex-wrap gap-1">
                {topic.suggestedKeywords.slice(0, 3).map((kw, i) => (
                  <span
                    key={i}
                    className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600"
                  >
                    #{kw}
                  </span>
                ))}
              </div>
            </div>

            <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition-all shrink-0 mt-3" />
          </button>
        ))}
      </div>
    </div>
  );
};
