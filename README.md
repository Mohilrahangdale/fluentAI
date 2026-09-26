# FluentAI - Mobile-First English Learning Platform

> **"Speak. Learn. Improve."**

FluentAI is an English-learning web application where users learn English by practicing real voice conversations with an intelligent AI English partner — built strictly to operate at **₹0 cost**.

---

## 💎 Zero-Cost Architecture (₹0 Lifetime)

This project is engineered to cost **₹0** to build, test, host, and run:

1. **Browser-Native Voice Recognition**:
   Uses the W3C Web Speech API (`webkitSpeechRecognition` / `SpeechRecognition`) built natively into modern browsers (Chrome, Edge, Safari, Android). No third-party transcription or speech-to-text API billing.
2. **Browser-Native Text-to-Speech**:
   Uses `window.speechSynthesis` for clear, natural pronunciation. No paid voice-minute services.
3. **Local ESL AI Conversation & Correction Engine**:
   Runs client-side rule, grammar, and contextual analysis adapted to Beginner, Intermediate, and Advanced learners. Pluggable `AIService` abstraction allows connecting free local models (e.g., Ollama or WebLLM) without rewriting UI code.
4. **Zero-Cost Data Persistence**:
   Uses Web Storage (LocalStorage) with offline support. Also includes ready-to-use Express/MongoDB backend schemas for developers deploying on free local databases.
5. **No Paywalls or Subscriptions**:
   Includes full 40-minute daily speaking sessions without credit card requests or advertisements.

---

## 📱 Mobile-First Features

- **Home Page**:
  - Top bar with real-time Streak tracker (`🔥 5`) and User profile.
  - Hero with animated voice-waves and one-tap `🎤 Start Speaking` button.
  - Quick Practice (Free Talk, Daily Topic, Grammar, Job Interview).
  - Daily Speaking Challenge with progress tracking.
  - Progress summary (Speaking Time, Streak, Fluency Improvement).
  - Recent Mistake highlight with one-tap voice practice.
- **Voice Conversation Room**:
  - Full-screen voice calling interface with real-time `00:00 / 40:00` timer.
  - Dynamic AI states: `Listening`, `Thinking`, `Speaking`.
  - Non-intrusive English mistake correction card ("You said", "Better", "Why").
  - Live conversation subtitle transcript drawer.
  - Large touch-friendly microphone button + text input fallback for noisy environments.
- **Post-Session Report**:
  - Speaking time, turn counts, topics discussed.
  - Detailed grammar corrections and highlighted new vocabulary.
  - "Suggested Next Practice" recommendations.
- **Mistake Bank & Audio Practice**:
  - Categorized into Grammar, Vocabulary, Sentence Formation, and Common Mistakes.
  - Interactive "Practice Again" audio drill where learners read aloud and verify their pronunciation.
- **Word Bank (Vocabulary)**:
  - Definition, phonetics, part of speech, and example sentences.
  - Native audio pronunciation playback.
  - Add custom words or remove mastered words.

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Run Vite development server (Port 3000)
npm run dev

# Build production bundle
npm run build
```

---

## 📦 Backend Structure (Optional Local Node.js + MongoDB)

If you wish to run a dedicated local backend server with MongoDB:
- `backend/server.js`: Express REST API
- `backend/models/`: Mongoose schemas for User, Session, Mistake, Vocabulary
- `backend/routes/`: Authentication and practice routes
- `backend/middleware/`: JWT verification and input validation

All core features in this web app run smoothly out-of-the-box in any browser with **zero external server setup required**.
