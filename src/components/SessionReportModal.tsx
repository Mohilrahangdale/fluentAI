import React from 'react';
import {
  Sparkles,
  Clock,
  MessageCircle,
  AlertTriangle,
  BookOpen,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  Share2,
} from 'lucide-react';
import { SessionReportData } from '../types';
import { MistakeCard } from './MistakeCard';

interface SessionReportModalProps {
  report: SessionReportData;
  onClose: () => void;
  onGoToProgress?: () => void;
}

export const SessionReportModal: React.FC<SessionReportModalProps> = ({
  report,
  onClose,
  onGoToProgress,
}) => {
  const formatDuration = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const remainder = secs % 60;
    if (mins === 0) return `${remainder}s`;
    return `${mins}m ${remainder}s`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative my-auto max-h-[92vh] flex flex-col">
        {/* Header */}
        <div className="text-center pb-4 border-b border-slate-100 shrink-0">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2 shadow-xs">
            <Sparkles className="w-6 h-6" />
          </div>
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Session Completed 🎉
          </span>
          <h2 className="font-heading font-extrabold text-xl text-slate-900 mt-0.5">
            Speaking Session Report
          </h2>
          <p className="text-xs text-slate-500 mt-1">
            "{report.topicTitle}"
          </p>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto py-4 space-y-4 pr-1">
          {/* Quick Metrics Cards */}
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <Clock className="w-4 h-4 text-emerald-600 mx-auto mb-1" />
              <div className="text-xs text-slate-500 font-medium">Speaking Time</div>
              <div className="font-heading font-bold text-sm text-slate-900">
                {formatDuration(report.durationSeconds)}
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <MessageCircle className="w-4 h-4 text-blue-600 mx-auto mb-1" />
              <div className="text-xs text-slate-500 font-medium">Turn Count</div>
              <div className="font-heading font-bold text-sm text-slate-900">
                {report.userTurnCount} spoken
              </div>
            </div>
            <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
              <AlertTriangle className="w-4 h-4 text-amber-500 mx-auto mb-1" />
              <div className="text-xs text-slate-500 font-medium">Corrections</div>
              <div className="font-heading font-bold text-sm text-slate-900">
                {report.mistakesCaught.length}
              </div>
            </div>
          </div>

          {/* Suggested Next Practice (High Priority Requirement) */}
          <div className="rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-4 text-white shadow-sm">
            <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-emerald-200 mb-1">
              <TrendingUp className="w-3.5 h-3.5" />
              Suggested Next Practice
            </div>
            <div className="font-bold text-sm leading-snug">
              {report.suggestedNextPractice}
            </div>
          </div>

          {/* Important Mistakes Caught */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4 text-amber-500" />
                <span>Important Mistakes ({report.mistakesCaught.length})</span>
              </h3>
            </div>

            {report.mistakesCaught.length === 0 ? (
              <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5 flex items-center gap-2 text-xs text-emerald-800">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Excellent job! You spoke naturally with high grammatical accuracy in this session.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                {report.mistakesCaught.map((mistake) => (
                  <MistakeCard key={mistake.id} mistake={mistake} compact />
                ))}
              </div>
            )}
          </div>

          {/* New Vocabulary */}
          {report.newVocabulary && report.newVocabulary.length > 0 && (
            <div>
              <h3 className="font-heading font-bold text-sm text-slate-900 flex items-center gap-1.5 mb-2">
                <BookOpen className="w-4 h-4 text-blue-600" />
                <span>New Vocabulary Highlighted</span>
              </h3>
              <div className="space-y-2">
                {report.newVocabulary.map((vocab) => (
                  <div
                    key={vocab.id}
                    className="p-3 rounded-2xl bg-blue-50/50 border border-blue-100 text-xs"
                  >
                    <div className="font-bold text-blue-950 text-sm">{vocab.word}</div>
                    <div className="text-slate-600 mt-0.5">{vocab.meaning}</div>
                    <div className="text-slate-500 italic mt-1 font-serif">
                      "{vocab.example}"
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Areas to Improve */}
          <div>
            <h3 className="font-heading font-bold text-sm text-slate-900 mb-2">
              Areas to Improve
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {report.areasToImprove.map((area, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 rounded-xl bg-slate-100 border border-slate-200 text-slate-700 text-xs font-medium"
                >
                  🎯 {area}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="pt-3 border-t border-slate-100 flex gap-2 shrink-0">
          <button
            id="report-continue-btn"
            onClick={onClose}
            className="flex-1 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm shadow-md shadow-emerald-600/20 flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <span>Continue Practicing</span>
            <ArrowRight className="w-4 h-4" />
          </button>
          {onGoToProgress && (
            <button
              onClick={() => {
                onClose();
                onGoToProgress();
              }}
              className="px-4 py-3 rounded-xl border border-slate-200 text-slate-700 font-semibold text-xs hover:bg-slate-50 cursor-pointer"
            >
              View Progress
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
