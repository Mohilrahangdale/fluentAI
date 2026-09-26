/**
 * Browser-native Web Speech API service.
 * STRICTLY ZERO-COST: Uses 100% free, browser-native SpeechRecognition and SpeechSynthesis.
 * No external paid APIs or tokens required.
 */

// Extend window for WebkitSpeechRecognition
declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

export interface SpeechRecognitionHandlers {
  onResult: (transcript: string, isFinal: boolean) => void;
  onError: (error: string) => void;
  onStart: () => void;
  onEnd: () => void;
}

export class SpeechService {
  private static recognitionInstance: any = null;
  private static isListening: boolean = false;
  private static preferredVoice: SpeechSynthesisVoice | null = null;

  static isRecognitionSupported(): boolean {
    return typeof window !== 'undefined' && Boolean(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  static isSynthesisSupported(): boolean {
    return typeof window !== 'undefined' && 'speechSynthesis' in window;
  }

  // --- TEXT TO SPEECH (SYNTHESIS) ---
  static initVoices(): void {
    if (!this.isSynthesisSupported()) return;
    const updateVoice = () => {
      const voices = window.speechSynthesis.getVoices();
      // Find an English voice (prefer natural or high quality US/UK/IN voices)
      const englishVoice =
        voices.find((v) => v.lang === 'en-US' && (v.name.includes('Natural') || v.name.includes('Google') || v.name.includes('Samantha'))) ||
        voices.find((v) => v.lang.startsWith('en')) ||
        voices[0];
      if (englishVoice) {
        this.preferredVoice = englishVoice;
      }
    };

    updateVoice();
    if (window.speechSynthesis.onvoiceschanged !== undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoice;
    }
  }

  static speak(
    text: string,
    options?: {
      rate?: number;
      pitch?: number;
      onStart?: () => void;
      onEnd?: () => void;
      onError?: () => void;
    }
  ): void {
    if (!this.isSynthesisSupported()) {
      options?.onEnd?.();
      return;
    }

    // Cancel any previous speech
    window.speechSynthesis.cancel();

    // Clean text of markdown/asterisks or symbols for clean reading
    const cleanText = text.replace(/[*#_`]/g, '').trim();
    if (!cleanText) {
      options?.onEnd?.();
      return;
    }

    const utterance = new SpeechSynthesisUtterance(cleanText);
    utterance.lang = 'en-US';
    utterance.rate = options?.rate ?? 0.95; // slightly slower for optimal English learner clarity
    utterance.pitch = options?.pitch ?? 1.0;

    if (this.preferredVoice) {
      utterance.voice = this.preferredVoice;
    } else {
      const voices = window.speechSynthesis.getVoices();
      const enVoice = voices.find((v) => v.lang.startsWith('en'));
      if (enVoice) utterance.voice = enVoice;
    }

    utterance.onstart = () => {
      options?.onStart?.();
    };

    utterance.onend = () => {
      options?.onEnd?.();
    };

    utterance.onerror = (e) => {
      console.warn('Speech synthesis notice:', e);
      options?.onEnd?.();
      options?.onError?.();
    };

    window.speechSynthesis.speak(utterance);
  }

  static stopSpeaking(): void {
    if (this.isSynthesisSupported()) {
      window.speechSynthesis.cancel();
    }
  }

  // --- SPEECH TO TEXT (RECOGNITION) ---
  static startListening(handlers: SpeechRecognitionHandlers): boolean {
    if (!this.isRecognitionSupported()) {
      handlers.onError('Speech recognition is not supported in this browser. You can type using the text box below!');
      return false;
    }

    try {
      this.stopListening();

      const SpeechRecognitionConstructor = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognitionConstructor();
      recognition.lang = 'en-US';
      recognition.continuous = false; // Turn-based conversation
      recognition.interimResults = true;
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        this.isListening = true;
        handlers.onStart();
      };

      recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          const transcriptPiece = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcriptPiece;
          } else {
            interimTranscript += transcriptPiece;
          }
        }

        if (finalTranscript.trim()) {
          handlers.onResult(finalTranscript.trim(), true);
        } else if (interimTranscript.trim()) {
          handlers.onResult(interimTranscript.trim(), false);
        }
      };

      recognition.onerror = (event: any) => {
        this.isListening = false;
        let errorMessage = 'Could not hear voice clearly.';
        if (event.error === 'not-allowed') {
          errorMessage = 'Microphone permission was denied. Please allow microphone access or type your message.';
        } else if (event.error === 'no-speech') {
          errorMessage = 'No speech was detected. Tap the mic to try speaking again.';
        }
        handlers.onError(errorMessage);
      };

      recognition.onend = () => {
        this.isListening = false;
        handlers.onEnd();
      };

      this.recognitionInstance = recognition;
      recognition.start();
      return true;
    } catch (err: any) {
      this.isListening = false;
      handlers.onError('Could not start microphone: ' + (err?.message || 'unknown error'));
      return false;
    }
  }

  static stopListening(): void {
    if (this.recognitionInstance && this.isListening) {
      try {
        this.recognitionInstance.stop();
      } catch {
        // ignore
      }
    }
    this.isListening = false;
  }
}
