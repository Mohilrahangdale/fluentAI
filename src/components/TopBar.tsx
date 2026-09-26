import React from 'react';
import { Sparkles, Flame, User as UserIcon, ShieldCheck, Download } from 'lucide-react';
import { User } from '../types';

interface TopBarProps {
  user: User | null;
  onOpenProfile: () => void;
  onOpenFreeInfo: () => void;
  showInstallButton?: boolean;
  onOpenInstall?: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  user,
  onOpenProfile,
  onOpenFreeInfo,
  showInstallButton = false,
  onOpenInstall,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-slate-100 px-4 py-3">
      <div className="max-w-md mx-auto flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-heading font-extrabold text-base tracking-tight text-slate-900">
                Fluent<span className="text-emerald-600">AI</span>
              </span>
              <button
                onClick={onOpenFreeInfo}
                className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors cursor-pointer"
                title="100% Free - ₹0 Lifetime"
              >
                <ShieldCheck className="w-2.5 h-2.5" />
                <span>₹0 Free</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right side items: Install, Streak & Profile */}
        <div className="flex items-center gap-2">
          {/* PWA Install Button */}
          {showInstallButton && onOpenInstall && (
            <button
              onClick={onOpenInstall}
              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Install FluentAI App on your device"
              aria-label="Install App"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Install</span>
            </button>
          )}

          {/* Streak */}
          <div
            className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-50 border border-orange-200/80 text-orange-700 text-xs font-bold shadow-xs"
            title="Current speaking streak"
          >
            <Flame className="w-4 h-4 text-orange-500 fill-orange-500 animate-bounce" style={{ animationDuration: '2s' }} />
            <span>{user?.streak ?? 1}</span>
          </div>

          {/* Profile button */}
          <button
            id="topbar-profile-btn"
            onClick={onOpenProfile}
            className="flex items-center gap-1.5 p-1 rounded-full hover:bg-slate-100 transition-colors cursor-pointer"
            aria-label="Open user profile"
          >
            <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
              {user ? (
                user.name.charAt(0).toUpperCase()
              ) : (
                <UserIcon className="w-4 h-4" />
              )}
            </div>
          </button>
        </div>
      </div>
    </header>
  );
};
