import { useState, useEffect, useCallback } from 'react';

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

const DISMISSAL_STORAGE_KEY = 'fluentai_pwa_install_dismissed_at';
// Suppress automatic popup for 3 days after user explicitly taps "Not Now"
const DISMISSAL_EXPIRY_MS = 3 * 24 * 60 * 60 * 1000;

export function usePWAInstall() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState<boolean>(false);
  const [isInstallable, setIsInstallable] = useState<boolean>(false);
  const [isIOS, setIsIOS] = useState<boolean>(false);
  const [isAndroid, setIsAndroid] = useState<boolean>(false);
  const [showAutoPopup, setShowAutoPopup] = useState<boolean>(false);

  useEffect(() => {
    // 1. Detect standalone mode (already installed / launched from home screen)
    const checkIsStandalone = () => {
      const isStandaloneMedia = window.matchMedia('(display-mode: standalone)').matches;
      const isIOSStandalone = (window.navigator as unknown as { standalone?: boolean }).standalone === true;
      const isAndroidApp = document.referrer.includes('android-app://');
      return isStandaloneMedia || isIOSStandalone || isAndroidApp;
    };

    const standalone = checkIsStandalone();
    setIsInstalled(standalone);

    // If already installed, never show popup
    if (standalone) {
      return;
    }

    // 2. Device platform detection
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice = /iphone|ipad|ipod/.test(ua) && !(window as unknown as { MSStream?: unknown }).MSStream;
    const isAndroidDevice = /android/.test(ua);
    setIsIOS(isIOSDevice);
    setIsAndroid(isAndroidDevice);

    // 3. Check dismissal state
    const checkDismissal = (): boolean => {
      try {
        const dismissedAtStr = localStorage.getItem(DISMISSAL_STORAGE_KEY);
        if (!dismissedAtStr) return false;
        const dismissedAt = parseInt(dismissedAtStr, 10);
        if (isNaN(dismissedAt)) return false;
        return Date.now() - dismissedAt < DISMISSAL_EXPIRY_MS;
      } catch {
        return false;
      }
    };

    // 4. Listen for browser native PWA install trigger
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const promptEvent = e as BeforeInstallPromptEvent;
      setDeferredPrompt(promptEvent);
      setIsInstallable(true);

      // Only show popup automatically if not recently dismissed
      if (!checkDismissal()) {
        // Small delay so user has a second to see the app load first
        const timer = setTimeout(() => {
          setShowAutoPopup(true);
        }, 1200);
        return () => clearTimeout(timer);
      }
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
      setShowAutoPopup(false);
      try {
        localStorage.removeItem(DISMISSAL_STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    // For iOS Safari: since it doesn't emit beforeinstallprompt, if not dismissed and on iOS mobile,
    // we can still offer the custom install guide
    if (isIOSDevice && !standalone && !checkDismissal()) {
      const iosTimer = setTimeout(() => {
        setShowAutoPopup(true);
      }, 2500);
      return () => clearTimeout(iosTimer);
    }

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Trigger installation via native prompt or return false to show guide
  const promptInstall = useCallback(async (): Promise<{ outcome: 'accepted' | 'dismissed' | 'manual_guide' }> => {
    if (deferredPrompt) {
      try {
        await deferredPrompt.prompt();
        const choice = await deferredPrompt.userChoice;
        if (choice.outcome === 'accepted') {
          setIsInstalled(true);
          setIsInstallable(false);
          setDeferredPrompt(null);
          setShowAutoPopup(false);
        }
        return { outcome: choice.outcome };
      } catch (err) {
        console.warn('Error during native install prompt:', err);
        return { outcome: 'manual_guide' };
      }
    }
    return { outcome: 'manual_guide' };
  }, [deferredPrompt]);

  // Handle "Not Now" / dismissal
  const dismissInstall = useCallback(() => {
    setShowAutoPopup(false);
    try {
      localStorage.setItem(DISMISSAL_STORAGE_KEY, Date.now().toString());
    } catch {
      // Ignore
    }
  }, []);

  return {
    isInstalled,
    isInstallable: isInstallable || isIOS || isAndroid,
    hasNativePrompt: !!deferredPrompt,
    isIOS,
    isAndroid,
    showAutoPopup,
    setShowAutoPopup,
    promptInstall,
    dismissInstall,
  };
}
