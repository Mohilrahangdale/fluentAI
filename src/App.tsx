import React, { useState, useEffect } from 'react';
import { User, PracticeTopic, DailyChallenge, MistakeItem, SessionReportData } from './types';
import { StorageService } from './services/storageService';
import { AuthService } from './services/authService';
import { PRACTICE_TOPICS, DAILY_CHALLENGES } from './data/topics';
import { TopBar } from './components/TopBar';
import { BottomNav, NavTab } from './components/BottomNav';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { ConversationView } from './components/ConversationView';
import { SessionReportModal } from './components/SessionReportModal';
import { PracticeMistakeModal } from './components/PracticeMistakeModal';
import { ZeroCostModal } from './components/ZeroCostModal';
import { PWAInstallModal } from './components/PWAInstallModal';
import { OfflineIndicator } from './components/OfflineIndicator';
import { usePWAInstall } from './hooks/usePWAInstall';
import { HomePage } from './pages/HomePage';
import { PracticePage } from './pages/PracticePage';
import { ProgressPage } from './pages/ProgressPage';
import { ProfilePage } from './pages/ProfilePage';

export default function App() {
  // State
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentTab, setCurrentTab] = useState<NavTab>('home');
  const [activePracticeTopic, setActivePracticeTopic] = useState<PracticeTopic | null>(null);
  const [sessionReport, setSessionReport] = useState<SessionReportData | null>(null);
  const [practicingMistake, setPracticingMistake] = useState<MistakeItem | null>(null);

  // PWA Install State & Hook
  const {
    isInstalled,
    hasNativePrompt,
    isIOS,
    isAndroid,
    showAutoPopup,
    setShowAutoPopup,
    promptInstall,
    dismissInstall,
  } = usePWAInstall();
  const [manualShowInstallModal, setManualShowInstallModal] = useState(false);

  // Modals
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState(false);
  const [showZeroCostModal, setShowZeroCostModal] = useState(false);

  // Data
  const [challenges, setChallenges] = useState<DailyChallenge[]>(DAILY_CHALLENGES);
  const [recentMistake, setRecentMistake] = useState<MistakeItem | null>(null);

  // Initialize
  useEffect(() => {
    // Check if user is logged in
    let user = StorageService.getCurrentUser();
    if (!user) {
      // Seed default demo user for frictionless immediate experience
      user = AuthService.loginDemo();
    }
    setCurrentUser(user);

    // Load challenges & mistakes
    setChallenges(StorageService.getChallenges());
    const mistakes = StorageService.getMistakes();
    if (mistakes.length > 0) {
      setRecentMistake(mistakes[0]);
    }
  }, []);

  // Update recent mistake when mistakes change
  const refreshMistakes = () => {
    const list = StorageService.getMistakes();
    if (list.length > 0) {
      setRecentMistake(list[0]);
    }
  };

  // Auth Handlers
  const handleAuthSuccess = (user: User, isNewUser: boolean) => {
    setCurrentUser(user);
    setShowAuthModal(false);
    if (isNewUser) {
      setShowOnboardingModal(true);
    }
  };

  const handleOnboardingComplete = (updatedUser: User) => {
    setCurrentUser(updatedUser);
    setShowOnboardingModal(false);
    setCurrentTab('home');
  };

  const handleLogout = () => {
    AuthService.logout();
    setCurrentUser(null);
    setShowAuthModal(true);
  };

  // Session Handlers
  const handleStartSpeaking = (topic?: PracticeTopic) => {
    const selectedTopic = topic || PRACTICE_TOPICS[0]; // Free Talk default
    setActivePracticeTopic(selectedTopic);
  };

  const handleStartChallenge = (challenge: DailyChallenge) => {
    const topicFromChallenge: PracticeTopic = {
      id: challenge.id,
      title: challenge.title,
      category: 'daily_topic',
      description: challenge.prompt,
      starterQuestion: challenge.starterQuestion,
      suggestedKeywords: ['Challenge', 'Fluency', 'Confidence'],
      iconName: 'Flame',
      targetDurationMinutes: challenge.durationMinutes,
    };
    setActivePracticeTopic(topicFromChallenge);
  };

  const handleEndSession = (report: SessionReportData) => {
    StorageService.saveSession(report);
    const updatedUser = StorageService.getCurrentUser();
    if (updatedUser) {
      setCurrentUser(updatedUser);
    }
    refreshMistakes();
    setActivePracticeTopic(null);
    setSessionReport(report);
  };

  const handleMasteredMistake = (id: string) => {
    StorageService.toggleMistakeMastered(id);
    refreshMistakes();
  };

  // If in active voice call, render full screen ConversationView
  if (activePracticeTopic && currentUser) {
    return (
      <div className={`min-h-screen ${currentUser.darkMode ? 'bg-slate-900 text-white' : 'bg-slate-50'}`}>
        <ConversationView
          topic={activePracticeTopic}
          user={currentUser}
          onEndSession={handleEndSession}
          onBack={() => setActivePracticeTopic(null)}
        />
      </div>
    );
  }

  const todayChallenge = challenges[0] || DAILY_CHALLENGES[0];

  return (
    <div
      className={`min-h-screen transition-colors ${
        currentUser?.darkMode ? 'bg-slate-950 text-slate-100' : 'bg-slate-100 text-slate-900'
      }`}
    >
      {/* Mobile Shell Container */}
      <div className="max-w-md mx-auto min-h-screen bg-slate-50 relative flex flex-col shadow-2xl">
        {/* Top Bar */}
        <TopBar
          user={currentUser}
          onOpenProfile={() => setCurrentTab('profile')}
          onOpenFreeInfo={() => setShowZeroCostModal(true)}
          showInstallButton={!isInstalled}
          onOpenInstall={() => setManualShowInstallModal(true)}
        />

        {/* Main Tab Content */}
        <main className="flex-1">
          {currentTab === 'home' && currentUser && (
            <HomePage
              user={currentUser}
              onStartSpeaking={handleStartSpeaking}
              onStartChallenge={handleStartChallenge}
              onOpenTopic={(topicId) => {
                const found = PRACTICE_TOPICS.find((t) => t.id === topicId);
                if (found) handleStartSpeaking(found);
              }}
              onPracticeMistake={(m) => setPracticingMistake(m)}
              onViewAllMistakes={() => setCurrentTab('progress')}
              onViewProgress={() => setCurrentTab('progress')}
              todayChallenge={todayChallenge}
              recentMistake={recentMistake}
            />
          )}

          {currentTab === 'practice' && (
            <PracticePage onSelectTopic={handleStartSpeaking} />
          )}

          {currentTab === 'progress' && currentUser && (
            <ProgressPage
              user={currentUser}
              onPracticeMistake={(m) => setPracticingMistake(m)}
              onStartChallenge={handleStartChallenge}
              challenges={challenges}
            />
          )}

          {currentTab === 'profile' && currentUser && (
            <ProfilePage
              user={currentUser}
              onUpdateUser={(updated) => setCurrentUser(updated)}
              onLogout={handleLogout}
              onOpenZeroCostModal={() => setShowZeroCostModal(true)}
              onOpenInstall={() => setManualShowInstallModal(true)}
              isInstalled={isInstalled}
            />
          )}
        </main>

        {/* Bottom Navigation */}
        <BottomNav currentTab={currentTab} onSelectTab={setCurrentTab} />

        {/* Modals */}
        <AuthModal
          isOpen={showAuthModal || !currentUser}
          onClose={currentUser ? () => setShowAuthModal(false) : undefined}
          onSuccess={handleAuthSuccess}
        />

        {currentUser && (
          <OnboardingModal
            isOpen={showOnboardingModal}
            currentUser={currentUser}
            onComplete={handleOnboardingComplete}
          />
        )}

        {sessionReport && (
          <SessionReportModal
            report={sessionReport}
            onClose={() => setSessionReport(null)}
            onGoToProgress={() => setCurrentTab('progress')}
          />
        )}

        {practicingMistake && (
          <PracticeMistakeModal
            mistake={practicingMistake}
            onClose={() => setPracticingMistake(null)}
            onMastered={handleMasteredMistake}
          />
        )}

        <ZeroCostModal
          isOpen={showZeroCostModal}
          onClose={() => setShowZeroCostModal(false)}
        />

        {/* PWA Install Modal */}
        <PWAInstallModal
          isOpen={showAutoPopup || manualShowInstallModal}
          onClose={() => {
            setShowAutoPopup(false);
            setManualShowInstallModal(false);
            dismissInstall();
          }}
          onInstall={promptInstall}
          hasNativePrompt={hasNativePrompt}
          isIOS={isIOS}
          isAndroid={isAndroid}
        />

        {/* Offline Mode Alert */}
        <OfflineIndicator />
      </div>
    </div>
  );
}
