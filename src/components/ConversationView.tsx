import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Square,
  Volume2,
  VolumeX,
  Sparkles,
  MessageSquare,
  ChevronDown,
  ChevronUp,
  Send,
  AlertCircle,
  HelpCircle,
  Clock,
  RotateCcw,
} from 'lucide-react';
import {
  PracticeTopic,
  User,
  ChatMessage,
  MistakeItem,
  VocabularyItem,
  SessionReportData,
  ConversationState,
} from '../types';
import { SpeechService } from '../services/speechService';
import { AIService, ConversationContext } from '../services/aiService';
import { AudioWave } from './AudioWave';
import { SessionTimer } from './SessionTimer';
import { MistakeCard } from './MistakeCard';

interface ConversationViewProps {
  topic: PracticeTopic;
  user: User;
  onEndSession: (report: SessionReportData) => void;
  onBack: () => void;
}

export const ConversationView: React.FC<ConversationViewProps> = ({
  topic,
  user,
  onEndSession,
  onBack,
}) => {
  // Session State
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [conversationState, setConversationState] = useState<ConversationState>('idle');
  const [statusMessage, setStatusMessage] = useState('Tap the microphone to speak');
  const [isMuted, setIsMuted] = useState(false);
  const [showTranscript, setShowTranscript] = useState(true);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentInterimTranscript, setCurrentInterimTranscript] = useState('');
  const [textInputFallback, setTextInputFallback] = useState('');
  const [showTextInput, setShowTextInput] = useState(false);
  const [activeCorrection, setActiveCorrection] = useState<MistakeItem | null>(null);
  const [sessionMistakes, setSessionMistakes] = useState<MistakeItem[]>([]);
  const [sessionVocabulary, setSessionVocabulary] = useState<VocabularyItem[]>([]);
  const [suggestedFollowUps, setSuggestedFollowUps] = useState<string[]>([]);
  const [micSupported, setMicSupported] = useState(true);
  const [micErrorMessage, setMicErrorMessage] = useState<string | null>(null);

  // References
  const timerRef = useRef<any>(null);
  const userTurnsCountRef = useRef(0);
  const turnsSinceLastMistakeRef = useRef(0);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, currentInterimTranscript]);

  // Check speech recognition capability
  useEffect(() => {
    const supported = SpeechService.isRecognitionSupported();
    setMicSupported(supported);
    if (!supported) {
      setShowTextInput(true);
      setStatusMessage('Voice recognition unsupported in this browser. Type below!');
    }
  }, []);

  // Initialize Voices & Greeting
  useEffect(() => {
    SpeechService.initVoices();

    // Start 40-minute speaking practice session timer
    timerRef.current = setInterval(() => {
      setElapsedSeconds((prev) => {
        if (prev >= 2400) {
          // 40 minutes reached
          clearInterval(timerRef.current);
          return 2400;
        }
        return prev + 1;
      });
    }, 1000);

    // Initial greeting from AI
    const starter = topic.starterQuestion;
    const initialAiMsg: ChatMessage = {
      id: 'ai-init',
      sender: 'ai',
      text: starter,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages([initialAiMsg]);

    // Speak initial starter question unless muted
    setConversationState('speaking');
    setStatusMessage('AI partner is speaking...');
    SpeechService.speak(starter, {
      rate: user.englishLevel === 'Beginner' ? 0.88 : 0.98,
      onEnd: () => {
        setConversationState('idle');
        setStatusMessage('Your turn! Tap the microphone and speak.');
      },
      onError: () => {
        setConversationState('idle');
        setStatusMessage('Ready for your voice. Tap the microphone!');
      },
    });

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
      SpeechService.stopSpeaking();
      SpeechService.stopListening();
    };
  }, [topic, user.englishLevel]);

  // Handle User Voice Input
  const startVoiceInput = () => {
    setMicErrorMessage(null);
    SpeechService.stopSpeaking();

    const success = SpeechService.startListening({
      onStart: () => {
        setConversationState('listening');
        setStatusMessage('Listening to your English...');
        setCurrentInterimTranscript('');
      },
      onResult: (transcript: string, isFinal: boolean) => {
        setCurrentInterimTranscript(transcript);
        if (isFinal) {
          handleUserSpeechSubmitted(transcript);
        }
      },
      onError: (err: string) => {
        setConversationState('idle');
        setMicErrorMessage(err);
        setStatusMessage('Tap microphone to try again or type below.');
        setShowTextInput(true);
      },
      onEnd: () => {
        // If recognition stops before a final result, transition safely
        setConversationState((prev) => (prev === 'listening' ? 'idle' : prev));
      },
    });

    if (!success) {
      setShowTextInput(true);
    }
  };

  const stopVoiceInput = () => {
    SpeechService.stopListening();
    if (currentInterimTranscript.trim()) {
      handleUserSpeechSubmitted(currentInterimTranscript.trim());
    } else {
      setConversationState('idle');
      setStatusMessage('Voice paused. Tap microphone when ready.');
    }
  };

  // Process user speech or typed submission
  const handleUserSpeechSubmitted = async (userInput: string) => {
    const text = userInput.trim();
    if (!text) return;

    setCurrentInterimTranscript('');
    userTurnsCountRef.current += 1;
    turnsSinceLastMistakeRef.current += 1;

    // Append user message
    const userMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      sender: 'user',
      text: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setMessages((prev) => [...prev, userMsg]);

    // Transition to thinking state
    setConversationState('thinking');
    setStatusMessage('AI partner is thinking...');

    // Call AI conversation engine
    const context: ConversationContext = {
      topicTitle: topic.title,
      topicCategory: topic.category,
      englishLevel: user.englishLevel,
      userTurnCount: userTurnsCountRef.current,
      history: messages,
      lastMistakeTurnsAgo: turnsSinceLastMistakeRef.current,
    };

    try {
      const reply = await AIService.reply(text, context);

      // Check if mistake correction detected
      let recordedMistake: MistakeItem | null = null;
      if (reply.correction) {
        turnsSinceLastMistakeRef.current = 0;
        recordedMistake = {
          id: 'mistake-' + Date.now(),
          originalText: reply.correction.original,
          correctedText: reply.correction.better,
          explanation: reply.correction.why,
          category: reply.correction.category,
          timestamp: 'Just now',
          mastered: false,
          practiceCount: 1,
        };
        setActiveCorrection(recordedMistake);
        setSessionMistakes((prev) => [...prev, recordedMistake!]);
      }

      // Check for new vocabulary word
      if (reply.newVocabulary) {
        const vocabItem: VocabularyItem = {
          id: 'vocab-' + Date.now(),
          word: reply.newVocabulary.word,
          meaning: reply.newVocabulary.meaning,
          example: reply.newVocabulary.example,
          dateAdded: new Date().toISOString().split('T')[0],
          learned: false,
        };
        setSessionVocabulary((prev) => {
          if (!prev.some((v) => v.word.toLowerCase() === vocabItem.word.toLowerCase())) {
            return [...prev, vocabItem];
          }
          return prev;
        });
      }

      if (reply.suggestedFollowUps && reply.suggestedFollowUps.length > 0) {
        setSuggestedFollowUps(reply.suggestedFollowUps);
      }

      // Add AI reply message
      const aiMsg: ChatMessage = {
        id: 'ai-' + Date.now(),
        sender: 'ai',
        text: reply.message,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        correction: reply.correction,
      };
      setMessages((prev) => [...prev, aiMsg]);

      // Speak AI response
      if (!isMuted) {
        setConversationState('speaking');
        setStatusMessage('AI partner is speaking...');
        SpeechService.speak(reply.message, {
          rate: user.englishLevel === 'Beginner' ? 0.88 : 0.98,
          onEnd: () => {
            setConversationState('idle');
            setStatusMessage('Your turn! Tap mic to speak.');
          },
          onError: () => {
            setConversationState('idle');
            setStatusMessage('Your turn! Tap mic to speak.');
          },
        });
      } else {
        setConversationState('idle');
        setStatusMessage('Your turn! Tap mic to speak.');
      }
    } catch (error) {
      console.error('AI response error:', error);
      setConversationState('idle');
      setStatusMessage('Tap mic to continue speaking.');
    }
  };

  const handleManualTextSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!textInputFallback.trim()) return;
    const text = textInputFallback;
    setTextInputFallback('');
    handleUserSpeechSubmitted(text);
  };

  const handleSuggestionClick = (suggestion: string) => {
    handleUserSpeechSubmitted(suggestion);
  };

  const handleFinishSession = () => {
    SpeechService.stopSpeaking();
    SpeechService.stopListening();
    if (timerRef.current) clearInterval(timerRef.current);

    // Formulate areas to improve and next practice advice
    let areasToImprove: string[] = ['Sentence Fluency & Smoothness'];
    let suggestedNextPractice = 'Daily conversation: Keep practicing speaking daily for 10-15 minutes.';

    if (sessionMistakes.some((m) => m.category === 'Grammar')) {
      areasToImprove.push('Past Tense & Verb Conjugation');
      suggestedNextPractice = 'Focus next time: Past tense + sentence formation';
    }
    if (sessionMistakes.some((m) => m.category === 'Sentence Formation')) {
      areasToImprove.push('Prepositions and Word Order');
    }
    if (sessionMistakes.length === 0 && userTurnsCountRef.current >= 3) {
      areasToImprove.push('Expanding complex compound vocabulary');
      suggestedNextPractice = 'Great accuracy! Try challenging topics or interview practice next time.';
    }

    const report: SessionReportData = {
      id: 'session-' + Date.now(),
      topicTitle: topic.title,
      topicCategory: topic.category,
      durationSeconds: elapsedSeconds,
      timestamp: new Date().toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      }),
      userTurnCount: userTurnsCountRef.current,
      mistakesCaught: sessionMistakes,
      newVocabulary: sessionVocabulary,
      topicsDiscussed: [topic.title, 'General English conversation'],
      areasToImprove,
      suggestedNextPractice,
    };

    onEndSession(report);
  };

  return (
    <div className="flex flex-col h-screen max-w-md mx-auto bg-slate-50 relative overflow-hidden">
      {/* Top Header */}
      <div className="bg-white/95 backdrop-blur-md border-b border-slate-100 px-4 py-3 shrink-0 z-20">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={onBack}
              className="p-1.5 -ml-1.5 text-slate-500 hover:text-slate-900 rounded-lg hover:bg-slate-100 transition-colors cursor-pointer"
              aria-label="Back to topics"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <div>
              <h2 className="font-heading font-bold text-sm text-slate-900 line-clamp-1">
                {topic.title}
              </h2>
              <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded-full border border-emerald-200">
                {user.englishLevel}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mute button */}
            <button
              onClick={() => {
                if (!isMuted) SpeechService.stopSpeaking();
                setIsMuted(!isMuted);
              }}
              className={`p-2 rounded-xl border text-xs font-medium transition-colors cursor-pointer ${
                isMuted
                  ? 'bg-rose-50 text-rose-700 border-rose-200'
                  : 'bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100'
              }`}
              title={isMuted ? 'Unmute AI Voice' : 'Mute AI Voice'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {/* End Session CTA */}
            <button
              id="end-session-btn"
              onClick={handleFinishSession}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:scale-95 text-white text-xs font-bold shadow-xs transition-all cursor-pointer"
            >
              <Square className="w-3 h-3 fill-current text-rose-400" />
              <span>End Call</span>
            </button>
          </div>
        </div>

        {/* 40-minute Session Timer */}
        <SessionTimer elapsedSeconds={elapsedSeconds} maxSeconds={2400} />
      </div>

      {/* Main Voice Canvas / Partner Center Stage */}
      <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col justify-between relative">
        {/* AI Partner Visual & State */}
        <div className="flex flex-col items-center justify-center my-auto py-4">
          {/* Avatar with dynamic ring */}
          <div className="relative mb-3">
            <div
              className={`w-28 h-28 rounded-full flex items-center justify-center transition-all duration-500 shadow-xl ${
                conversationState === 'listening'
                  ? 'bg-gradient-to-tr from-emerald-500 to-teal-400 ring-8 ring-emerald-200/80 scale-105'
                  : conversationState === 'speaking'
                  ? 'bg-gradient-to-tr from-teal-500 to-cyan-500 ring-8 ring-teal-200/80 scale-105'
                  : conversationState === 'thinking'
                  ? 'bg-gradient-to-tr from-indigo-500 to-blue-500 ring-8 ring-indigo-100 animate-pulse'
                  : 'bg-gradient-to-tr from-slate-800 to-slate-700'
              }`}
            >
              <Sparkles className="w-12 h-12 text-white animate-pulse" />
            </div>

            {/* Micro badge indicator */}
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2.5 py-0.5 rounded-full bg-white border border-slate-200 shadow-sm flex items-center gap-1.5 whitespace-nowrap">
              <span
                className={`w-2 h-2 rounded-full ${
                  conversationState === 'listening'
                    ? 'bg-emerald-500 animate-ping'
                    : conversationState === 'speaking'
                    ? 'bg-teal-500 animate-pulse'
                    : conversationState === 'thinking'
                    ? 'bg-indigo-500'
                    : 'bg-slate-400'
                }`}
              />
              <span className="text-[11px] font-bold text-slate-800 capitalize">
                {conversationState === 'listening'
                  ? 'Listening...'
                  : conversationState === 'speaking'
                  ? 'Speaking...'
                  : conversationState === 'thinking'
                  ? 'Thinking...'
                  : 'Ready'}
              </span>
            </div>
          </div>

          {/* Voice Wave Animation */}
          <div className="h-10 my-2 flex items-center justify-center">
            <AudioWave
              active={conversationState === 'listening' || conversationState === 'speaking'}
              state={conversationState}
              color={conversationState === 'speaking' ? 'bg-teal-500' : 'bg-emerald-500'}
            />
          </div>

          {/* Status Message */}
          <p className="text-xs font-semibold text-slate-600 text-center max-w-xs px-2">
            {statusMessage}
          </p>

          {/* Realtime Interim user speech */}
          {currentInterimTranscript && (
            <div className="mt-3 px-4 py-2 rounded-2xl bg-emerald-100/70 border border-emerald-300 text-emerald-950 text-xs font-medium text-center animate-fade-in max-w-sm">
              <span className="opacity-70">Hearing: </span>
              "{currentInterimTranscript}..."
            </div>
          )}

          {/* Mic Error Banner if any */}
          {micErrorMessage && (
            <div className="mt-3 px-3 py-2 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2 max-w-sm">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>{micErrorMessage}</span>
            </div>
          )}
        </div>

        {/* Live Correction Feedback Drawer (shows when ESL error detected) */}
        {activeCorrection && (
          <div className="mb-3 animate-slide-up">
            <div className="flex items-center justify-between px-1 mb-1.5">
              <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-emerald-600" />
                English Correction
              </span>
              <button
                onClick={() => setActiveCorrection(null)}
                className="text-[11px] text-slate-400 hover:text-slate-700 cursor-pointer"
              >
                Dismiss
              </button>
            </div>
            <MistakeCard mistake={activeCorrection} compact />
          </div>
        )}

        {/* Suggested Sentence Helpers for Beginners & Intermediate */}
        {suggestedFollowUps.length > 0 && conversationState === 'idle' && (
          <div className="mb-3">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <HelpCircle className="w-3 h-3" />
              Need ideas? Tap to say:
            </div>
            <div className="flex flex-wrap gap-1.5">
              {suggestedFollowUps.map((suggestion, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="px-2.5 py-1.5 rounded-xl bg-white border border-slate-200 hover:border-emerald-300 hover:bg-emerald-50/50 text-slate-700 text-xs font-medium transition-all text-left shadow-2xs cursor-pointer active:scale-95"
                >
                  "{suggestion}"
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Live Transcript Collapsible Sheet */}
        <div className="rounded-2xl border border-slate-200 bg-white/95 shadow-xs overflow-hidden mb-2">
          <button
            type="button"
            onClick={() => setShowTranscript(!showTranscript)}
            className="w-full px-3 py-2 flex items-center justify-between text-xs font-bold text-slate-700 bg-slate-50/80 border-b border-slate-100 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
              <span>Conversation Subtitles ({messages.length})</span>
            </span>
            {showTranscript ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>

          {showTranscript && (
            <div className="max-h-40 overflow-y-auto p-3 space-y-2 text-xs">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3 py-2 ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-xs'
                        : 'bg-slate-100 text-slate-900 rounded-bl-xs'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.timestamp}</span>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
          )}
        </div>
      </div>

      {/* Bottom Control Deck */}
      <div className="bg-white border-t border-slate-200/80 px-4 py-3 shrink-0 z-20">
        {showTextInput ? (
          <form onSubmit={handleManualTextSubmit} className="flex items-center gap-2 mb-2">
            <input
              type="text"
              value={textInputFallback}
              onChange={(e) => setTextInputFallback(e.target.value)}
              placeholder="Type your English response..."
              className="flex-1 py-2.5 px-3.5 rounded-xl border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={!textInputFallback.trim()}
              className="p-2.5 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 transition-colors cursor-pointer"
            >
              <Send className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setShowTextInput(false)}
              className="p-2.5 rounded-xl border border-slate-200 text-slate-500 hover:bg-slate-50 text-xs cursor-pointer"
              title="Switch back to voice"
            >
              <Mic className="w-4 h-4" />
            </button>
          </form>
        ) : null}

        {/* Giant Ergonomic Microphone Button */}
        <div className="flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => setShowTextInput(!showTextInput)}
            className="p-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Toggle text typing fallback"
          >
            <MessageSquare className="w-5 h-5" />
          </button>

          {/* Big Center Mic */}
          <div className="relative flex-1 flex justify-center">
            {conversationState === 'listening' ? (
              <button
                id="mic-stop-btn"
                onClick={stopVoiceInput}
                className="w-20 h-20 rounded-full bg-rose-600 hover:bg-rose-700 text-white shadow-lg shadow-rose-600/30 flex flex-col items-center justify-center transition-all duration-200 cursor-pointer active:scale-95 animate-pulse"
                aria-label="Stop Speaking"
              >
                <Square className="w-7 h-7 fill-current mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Done</span>
              </button>
            ) : (
              <button
                id="mic-start-btn"
                onClick={startVoiceInput}
                disabled={conversationState === 'thinking'}
                className={`w-20 h-20 rounded-full flex flex-col items-center justify-center shadow-lg transition-all duration-200 cursor-pointer active:scale-95 ${
                  conversationState === 'thinking'
                    ? 'bg-slate-300 text-slate-500 cursor-not-allowed'
                    : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30 ring-4 ring-emerald-100'
                }`}
                aria-label="Tap to Speak"
              >
                <Mic className="w-8 h-8 mb-0.5" />
                <span className="text-[10px] font-bold uppercase tracking-wider">Speak</span>
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={() => {
              if (messages.length > 0) {
                const lastAi = [...messages].reverse().find((m) => m.sender === 'ai');
                if (lastAi) {
                  SpeechService.speak(lastAi.text);
                }
              }
            }}
            className="p-3 rounded-2xl border border-slate-200 text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
            title="Replay AI last sentence"
          >
            <Volume2 className="w-5 h-5" />
          </button>
        </div>

        <div className="text-center mt-2">
          <span className="text-[11px] text-slate-400 font-medium">
            {conversationState === 'listening'
              ? 'Listening... Tap "Done" when finished'
              : 'Tap "Speak" to talk with your AI partner'}
          </span>
        </div>
      </div>
    </div>
  );
};
