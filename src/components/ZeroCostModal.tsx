import React from 'react';
import { ShieldCheck, Check, Cpu, Mic, Database, X } from 'lucide-react';

interface ZeroCostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ZeroCostModal: React.FC<ZeroCostModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm overflow-y-auto">
      <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-slate-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="text-center mb-5">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 mx-auto flex items-center justify-center mb-2 shadow-xs">
            <ShieldCheck className="w-7 h-7" />
          </div>
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Architecture Guarantee
          </span>
          <h3 className="font-heading font-extrabold text-xl text-slate-900 mt-0.5">
            100% Free • ₹0 Cost Forever
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            How FluentAI delivers real voice conversations without asking for even ₹1.
          </p>
        </div>

        <div className="space-y-3 mb-6">
          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex gap-3">
            <Mic className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-slate-900">
                Browser-Native Voice Recognition & Audio
              </div>
              <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Uses the browser's built-in <code className="bg-slate-200/60 px-1 py-0.5 rounded text-[10px]">SpeechRecognition</code> and <code className="bg-slate-200/60 px-1 py-0.5 rounded text-[10px]">SpeechSynthesis</code> engines. No paid voice-minute services.
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex gap-3">
            <Cpu className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-slate-900">
                Local ESL Conversation & Correction Engine
              </div>
              <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                Intelligent local English grammar analysis and context engine runs directly in the client. Modular architecture allows connecting free local open-source models (e.g. Ollama/WebLLM).
              </div>
            </div>
          </div>

          <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 flex gap-3">
            <Database className="w-5 h-5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <div className="font-bold text-xs text-slate-900">
                Zero-Cost Data Storage
              </div>
              <div className="text-xs text-slate-600 mt-0.5 leading-relaxed">
                All sessions, streaks, vocabulary, and mistake history persist privately on device via Web Storage. No paid database cluster subscriptions required.
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl bg-emerald-50 border border-emerald-200/80 p-3 mb-5 text-xs text-emerald-900">
          <div className="font-bold mb-1 flex items-center gap-1.5">
            <Check className="w-4 h-4 text-emerald-600" />
            Zero-Cost Developer & Learner Promise:
          </div>
          <ul className="space-y-1 text-slate-700 list-disc list-inside text-[11px]">
            <li>No credit cards requested</li>
            <li>No hidden subscriptions or paywalls</li>
            <li>No promotional advertisements</li>
            <li>40-minute practice session included daily</li>
          </ul>
        </div>

        <button
          onClick={onClose}
          className="w-full py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
        >
          Understood & Continue
        </button>
      </div>
    </div>
  );
};
