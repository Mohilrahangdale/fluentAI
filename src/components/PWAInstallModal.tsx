import React, { useState } from 'react';
import {
  Download,
  X,
  Smartphone,
  Share,
  PlusSquare,
  Sparkles,
  CheckCircle2,
  MoreVertical,
  Zap,
  WifiOff,
} from 'lucide-react';

interface PWAInstallModalProps {
  isOpen: boolean;
  onClose: () => void;
  onInstall: () => Promise<{ outcome: 'accepted' | 'dismissed' | 'manual_guide' }>;
  hasNativePrompt: boolean;
  isIOS: boolean;
  isAndroid: boolean;
}

export const PWAInstallModal: React.FC<PWAInstallModalProps> = ({
  isOpen,
  onClose,
  onInstall,
  hasNativePrompt,
  isIOS,
  isAndroid,
}) => {
  const [showManualGuide, setShowManualGuide] = useState(false);
  const [isInstalling, setIsInstalling] = useState(false);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    setIsInstalling(true);
    try {
      const result = await onInstall();
      if (result.outcome === 'manual_guide') {
        setShowManualGuide(true);
      } else if (result.outcome === 'accepted') {
        onClose();
      }
    } catch {
      setShowManualGuide(true);
    } finally {
      setIsInstalling(false);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="pwa-install-title"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div
        className="w-full max-w-sm bg-white rounded-3xl p-5 shadow-2xl border border-slate-100 flex flex-col relative animate-in slide-in-from-bottom-6 sm:slide-in-from-bottom-2 duration-300"
      >
        {/* Dismiss / Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
          aria-label="Close dialog"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Top Header with App Icon */}
        <div className="flex items-center gap-3.5 mb-4 pr-8">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-emerald-400 p-0.5 shadow-md shadow-emerald-200 flex items-center justify-center">
              <img
                src="/icon.svg"
                alt="FluentAI App Icon"
                className="w-full h-full rounded-[14px] object-cover"
                onError={(e) => {
                  // Fallback in case SVG preview is rendered before file write
                  (e.target as HTMLElement).style.display = 'none';
                }}
              />
            </div>
            <div className="absolute -bottom-1 -right-1 bg-emerald-600 text-white p-1 rounded-full border-2 border-white shadow-xs">
              <Sparkles className="w-2.5 h-2.5" />
            </div>
          </div>

          <div>
            <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200/80 mb-1">
              <span>Progressive Web App</span>
            </div>
            <h2 id="pwa-install-title" className="font-heading font-extrabold text-lg text-slate-900 tracking-tight leading-tight">
              Install FluentAI
            </h2>
          </div>
        </div>

        {/* Value Proposition Message */}
        <p className="text-slate-600 text-xs sm:text-sm leading-relaxed mb-4">
          Install this app on your device for a faster, app-like experience with zero lag, instant home screen access, and offline fluency review.
        </p>

        {/* Feature Highlights Grid */}
        <div className="space-y-2 bg-slate-50/80 border border-slate-100 rounded-2xl p-3 mb-5">
          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <div className="w-5 h-5 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
              <Zap className="w-3 h-3" />
            </div>
            <span>Instant launch right from your Home Screen</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <div className="w-5 h-5 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
              <WifiOff className="w-3 h-3" />
            </div>
            <span>Offline access to words, challenges & mistakes</span>
          </div>

          <div className="flex items-center gap-2.5 text-xs text-slate-700 font-medium">
            <div className="w-5 h-5 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
              <Smartphone className="w-3 h-3" />
            </div>
            <span>Full-screen view with zero browser clutter</span>
          </div>
        </div>

        {/* Manual Guide Fallback for iOS or non-native browsers */}
        {(showManualGuide || (!hasNativePrompt && isIOS)) && (
          <div className="mb-4 p-3.5 rounded-2xl bg-emerald-50/90 border border-emerald-200 text-xs text-emerald-950 animate-in fade-in duration-200">
            <div className="font-bold flex items-center gap-1.5 mb-2 text-emerald-900 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>How to add to your Home Screen:</span>
            </div>
            {isIOS ? (
              <ol className="space-y-2 text-[11px] leading-relaxed text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="font-bold bg-white text-emerald-700 w-5 h-5 rounded-full flex items-center justify-center shadow-xs shrink-0">1</span>
                  <span>Tap the <strong>Share</strong> button <Share className="w-3 h-3 inline mx-0.5 text-blue-600" /> in Safari's bottom bar.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold bg-white text-emerald-700 w-5 h-5 rounded-full flex items-center justify-center shadow-xs shrink-0">2</span>
                  <span>Scroll down and select <strong>Add to Home Screen</strong> <PlusSquare className="w-3 h-3 inline mx-0.5 text-slate-800" />.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold bg-white text-emerald-700 w-5 h-5 rounded-full flex items-center justify-center shadow-xs shrink-0">3</span>
                  <span>Tap <strong>Add</strong> in the top-right corner to finish!</span>
                </li>
              </ol>
            ) : (
              <ol className="space-y-2 text-[11px] leading-relaxed text-slate-700">
                <li className="flex items-center gap-2">
                  <span className="font-bold bg-white text-emerald-700 w-5 h-5 rounded-full flex items-center justify-center shadow-xs shrink-0">1</span>
                  <span>Tap the menu icon <MoreVertical className="w-3 h-3 inline mx-0.5 text-slate-700" /> in Chrome / your browser.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold bg-white text-emerald-700 w-5 h-5 rounded-full flex items-center justify-center shadow-xs shrink-0">2</span>
                  <span>Select <strong>Install app</strong> or <strong>Add to Home screen</strong>.</span>
                </li>
                <li className="flex items-center gap-2">
                  <span className="font-bold bg-white text-emerald-700 w-5 h-5 rounded-full flex items-center justify-center shadow-xs shrink-0">3</span>
                  <span>Confirm to install FluentAI onto your mobile apps list!</span>
                </li>
              </ol>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col gap-2">
          {hasNativePrompt && !showManualGuide ? (
            <button
              onClick={handleInstallClick}
              disabled={isInstalling}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-700 hover:from-emerald-500 hover:to-teal-600 active:scale-[0.99] text-white font-heading font-bold text-sm shadow-md shadow-emerald-300/40 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4 animate-bounce" style={{ animationDuration: '2.5s' }} />
              <span>{isInstalling ? 'Installing...' : 'Install App'}</span>
            </button>
          ) : showManualGuide || (!hasNativePrompt && isIOS) ? (
            <button
              onClick={onClose}
              className="w-full py-3.5 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-heading font-bold text-sm shadow-md shadow-emerald-200 transition-colors cursor-pointer"
            >
              Got It, Thanks!
            </button>
          ) : (
            <button
              onClick={() => setShowManualGuide(true)}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-heading font-bold text-sm shadow-md shadow-emerald-200 flex items-center justify-center gap-2 transition-all cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Install App Instructions</span>
            </button>
          )}

          <button
            onClick={onClose}
            className="w-full py-2.5 px-4 rounded-2xl text-slate-500 hover:text-slate-700 hover:bg-slate-100 font-heading font-semibold text-xs transition-colors cursor-pointer text-center"
          >
            Not Now
          </button>
        </div>
      </div>
    </div>
  );
};
