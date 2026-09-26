import { EnglishLevel, MistakeItem, MistakeCategory, ChatMessage } from '../types';

export interface AIResponse {
  message: string;
  correction?: {
    original: string;
    better: string;
    why: string;
    category: MistakeCategory;
  };
  suggestedFollowUps?: string[];
  newVocabulary?: {
    word: string;
    meaning: string;
    example: string;
  };
}

export interface ConversationContext {
  topicTitle: string;
  topicCategory: string;
  englishLevel: EnglishLevel;
  userTurnCount: number;
  history: ChatMessage[];
  lastMistakeTurnsAgo: number;
}

// Interface for pluggable AI engines (Local Rule Engine, Local Ollama, WebLLM, etc.)
export interface IAIEngine {
  generateReply(userInput: string, context: ConversationContext): Promise<AIResponse>;
}

// Built-in Zero-Cost Local ESL Teacher Engine
export class LocalESLTeacherEngine implements IAIEngine {
  async generateReply(userInput: string, context: ConversationContext): Promise<AIResponse> {
    const input = userInput.trim();
    const lower = input.toLowerCase();
    const { englishLevel, topicTitle, userTurnCount, lastMistakeTurnsAgo } = context;

    // 1. Detect Grammatical/ESL Mistakes
    const detectedCorrection = this.detectMistake(input, lower);

    // Rule: Don't interrupt user every single turn unless they asked or it's a prominent mistake.
    // In beginner mode, corrections are more frequent; in advanced, only for prominent mistakes.
    let activeCorrection = undefined;
    if (detectedCorrection) {
      if (
        englishLevel === 'Beginner' ||
        lastMistakeTurnsAgo >= 2 ||
        userTurnCount <= 2
      ) {
        activeCorrection = detectedCorrection;
      }
    }

    // 2. Generate Contextual & Empathetic Conversational Reply
    const replyText = this.generateConversationalText(input, lower, context);

    // 3. Generate Level-appropriate Sentence Prompts/Suggestions
    const suggestions = this.generateSuggestions(lower, englishLevel, topicTitle);

    // 4. Optionally highlight a new vocabulary word every few turns
    let newVocabulary = undefined;
    if (userTurnCount % 3 === 2 && englishLevel !== 'Beginner') {
      newVocabulary = this.getTopicVocabulary(topicTitle);
    }

    // Small artificial thinking pause (350ms) for natural feel
    await new Promise((resolve) => setTimeout(resolve, 350));

    return {
      message: replyText,
      correction: activeCorrection,
      suggestedFollowUps: suggestions,
      newVocabulary,
    };
  }

  private detectMistake(
    original: string,
    lower: string
  ): { original: string; better: string; why: string; category: MistakeCategory } | undefined {
    // Pattern 1: "I am agree" / "he is agree"
    if (/\b(i am agree|i'm agree|he is agree|she is agree)\b/.test(lower)) {
      return {
        original: original,
        better: original.replace(/i am agree/i, 'I agree').replace(/i'm agree/i, 'I agree'),
        why: '"Agree" is already an active verb in English. We say "I agree" rather than "I am agree".',
        category: 'Common Mistakes',
      };
    }

    // Pattern 2: "I am going yesterday" or "I go college yesterday" (Past tense with yesterday/last)
    if (/\b(yesterday|last (week|month|year|night|weekend))\b/.test(lower)) {
      if (/\b(i go|i am going|i'm going)\b/.test(lower)) {
        return {
          original: original,
          better: original
            .replace(/i go\b/i, 'I went')
            .replace(/i am going\b/i, 'I went')
            .replace(/i'm going\b/i, 'I went')
            .replace(/go college/i, 'went to college'),
          why: 'When talking about a completed time in the past ("yesterday" or "last week"), use the simple past tense ("went").',
          category: 'Grammar',
        };
      }
      if (/\b(he go|she go)\b/.test(lower)) {
        return {
          original: original,
          better: original.replace(/he go\b/i, 'he went').replace(/she go\b/i, 'she went'),
          why: 'Use the past tense form "went" for past actions with "yesterday".',
          category: 'Grammar',
        };
      }
    }

    // Pattern 3: "listen music" without preposition "to"
    if (/\blisten\s+(music|songs|podcast|radio)\b/.test(lower)) {
      return {
        original: original,
        better: original.replace(/\blisten\s+/i, 'listen to '),
        why: 'In English, the verb "listen" requires the preposition "to" before an object: "listen to music".',
        category: 'Sentence Formation',
      };
    }

    // Pattern 4: "He don't" / "She don't" / "It don't"
    if (/\b(he|she|it)\s+don't\b/.test(lower)) {
      return {
        original: original,
        better: original.replace(/\bdon't\b/i, "doesn't"),
        why: 'With third-person singular subjects (he, she, it), use "doesn\'t" instead of "don\'t".',
        category: 'Grammar',
      };
    }

    // Pattern 5: "did went" or "didn't went" (double past tense)
    if (/\b(did|didn't|did not)\s+(went|saw|ate|bought|had)\b/.test(lower)) {
      return {
        original: original,
        better: original
          .replace(/\bdid went\b/i, 'did go')
          .replace(/\bdidn't went\b/i, "didn't go")
          .replace(/\bdid saw\b/i, 'did see')
          .replace(/\bdidn't saw\b/i, "didn't see"),
        why: 'After auxiliary "did" or "didn\'t", always use the base form of the main verb (e.g., "didn\'t go", not "didn\'t went").',
        category: 'Grammar',
      };
    }

    // Pattern 6: "discuss about"
    if (/\b(discuss|discussed|discussing)\s+about\b/.test(lower)) {
      return {
        original: original,
        better: original.replace(/\s+about\b/i, ''),
        why: '"Discuss" already means "to talk about", so the word "about" is unnecessary.',
        category: 'Vocabulary',
      };
    }

    // Pattern 7: "explain me"
    if (/\bexplain\s+me\b/.test(lower)) {
      return {
        original: original,
        better: original.replace(/\bexplain\s+me\b/i, 'explain to me'),
        why: 'We explain something "to someone" in English, so use "explain to me".',
        category: 'Sentence Formation',
      };
    }

    // Pattern 8: "I have 20 years old"
    if (/\bi have\s+\d+\s+years\b/.test(lower)) {
      return {
        original: original,
        better: original.replace(/\bi have\b/i, 'I am'),
        why: 'In English, we use the verb "to be" to state our age: "I am 20 years old", not "I have".',
        category: 'Common Mistakes',
      };
    }

    // Pattern 9: "more better" / "more easier"
    if (/\bmore\s+(better|easier|faster|taller|closer)\b/.test(lower)) {
      return {
        original: original,
        better: original.replace(/\bmore\s+(better|easier|faster)\b/i, (m) => m.split(' ')[1]),
        why: 'Comparative adjectives that already end in "-er" or irregulars like "better" do not need the word "more".',
        category: 'Grammar',
      };
    }

    // Pattern 10: "return back" / "reply back"
    if (/\b(return|reply|revert)\s+back\b/.test(lower)) {
      return {
        original: original,
        better: original.replace(/\s+back\b/i, ''),
        why: 'The prefix "re-" already implies back, so "return back" is redundant. Simply say "return" or "reply".',
        category: 'Vocabulary',
      };
    }

    // Pattern 11: "in the bus" -> "on the bus"
    if (/\bin the (bus|train|plane|flight)\b/.test(lower)) {
      return {
        original: original,
        better: original.replace(/\bin the\b/i, 'on the'),
        why: 'For public transportation where passengers can stand or walk (bus, train, plane), we say "on the bus".',
        category: 'Sentence Formation',
      };
    }

    return undefined;
  }

  private generateConversationalText(
    input: string,
    lower: string,
    context: ConversationContext
  ): string {
    const { englishLevel, topicTitle, userTurnCount } = context;

    // Friendly, patient English persona responses
    const isBeginner = englishLevel === 'Beginner';
    const isAdvanced = englishLevel === 'Advanced';

    // Greetings
    if (userTurnCount === 0 || /^(hi|hello|hey|good morning|good evening|good afternoon)\b/.test(lower)) {
      if (isBeginner) {
        return "Hello! I am very glad to speak with you today. Take your time, don't worry about mistakes, and let's have fun. How are you feeling today?";
      }
      return "Hi there! It's fantastic to practice speaking with you today. What exciting thoughts or plans are on your mind right now?";
    }

    // Career / Interview
    if (topicTitle.toLowerCase().includes('interview') || topicTitle.toLowerCase().includes('career') || lower.includes('job') || lower.includes('work') || lower.includes('career')) {
      if (lower.includes('software') || lower.includes('developer') || lower.includes('engineer') || lower.includes('tech')) {
        return isBeginner
          ? "That sounds great! Technology is a very exciting field. What kind of software or coding do you enjoy learning most?"
          : "That's a very rewarding ambition! The tech industry values clear communication as much as technical prowess. What particular problem or domain do you find most fascinating to build for?";
      }
      if (lower.includes('strength') || lower.includes('good at')) {
        return "Being aware of your strengths is so important! Can you share a real example or project where you used that strength successfully?";
      }
      return isBeginner
        ? "That is very interesting! Can you tell me one skill you want to improve this year?"
        : "I appreciate that perspective! Looking ahead, what key milestone or leadership opportunity do you hope to accomplish in the next few years?";
    }

    // College / Campus Life
    if (topicTitle.toLowerCase().includes('college') || lower.includes('college') || lower.includes('university') || lower.includes('study')) {
      if (lower.includes('exam') || lower.includes('test') || lower.includes('stress')) {
        return isBeginner
          ? "Exams can be stressful! How do you relax after studying hard for your tests?"
          : "Exam seasons definitely test our discipline and resilience. How do you maintain a healthy balance between rigorous studying and mental well-being?";
      }
      return isBeginner
        ? "College is a wonderful time to make friends and learn new things. What is your favorite class or subject so far?"
        : "Campus life often shapes our worldview significantly. Beyond academics, what clubs, extracurricular activities, or campus traditions have resonated with you the most?";
    }

    // Food / Restaurant
    if (topicTitle.toLowerCase().includes('restaurant') || lower.includes('food') || lower.includes('order') || lower.includes('dish') || lower.includes('eat')) {
      return isBeginner
        ? "Mmm, that sounds delicious! Do you prefer cooking your own meals at home or eating out at restaurants?"
        : "Culinary experiences are such an enjoyable way to explore different cultures! If you were curating a dinner menu for international guests, what signature dish would you feature?";
    }

    // Travel
    if (topicTitle.toLowerCase().includes('travel') || lower.includes('travel') || lower.includes('trip') || lower.includes('country') || lower.includes('flight')) {
      return isBeginner
        ? "Traveling is such an amazing experience! What is one place you really want to visit in the future?"
        : "Traveling opens our minds to diverse cultures and unexpected adventures. Do you prefer meticulously planned itineraries or spontaneous explorations when traveling?";
    }

    // Daily routine / Hobbies
    if (lower.includes('morning') || lower.includes('routine') || lower.includes('wake up') || lower.includes('evening') || lower.includes('hobby')) {
      return isBeginner
        ? "Having a good routine helps us stay productive and happy! What is your favorite part of your day?"
        : "Consistency in our daily rituals can create profound long-term momentum. How has your routine evolved over recent months to help you reach personal goals?";
    }

    // Short answers encouragement
    if (input.split(' ').length <= 3) {
      if (isBeginner) {
        return "I see! That's a good start. Can you try adding one more sentence to explain why? For example, 'I like it because...'";
      }
      return "Understood! Could you elaborate just a bit more on that thought? Expanding your reasoning will really unlock your conversational fluency.";
    }

    // General conversational continuations
    const responses = isBeginner
      ? [
          "Thank you for sharing that with me! You are speaking very clearly. What else would you like to say about that?",
          "That makes complete sense. I really like how you expressed that idea! Tell me more about your thoughts.",
          "You're doing very well! Keep speaking naturally. How does that make you feel when you think about it?",
        ]
      : [
          "That's a thoughtful insight! I like the way you phrased that. How do you think other people in your community view that topic?",
          "I completely see your point. The nuance you just touched on is quite important. What led you to that conclusion originally?",
          "You express yourself with great clarity and natural rhythm! If you had to look at the other side of that argument, what would someone say?",
        ];

    return responses[userTurnCount % responses.length];
  }

  private generateSuggestions(lower: string, level: EnglishLevel, topicTitle: string): string[] {
    if (level === 'Beginner') {
      if (topicTitle.toLowerCase().includes('interview')) {
        return [
          'My biggest strength is dedication.',
          'I have worked on several college projects.',
          'I am eager to learn new skills.',
        ];
      }
      if (topicTitle.toLowerCase().includes('restaurant')) {
        return [
          'Could I please see the dessert menu?',
          'What do you recommend for dinner?',
          'Could we please have the bill?',
        ];
      }
      return [
        'In my opinion, I think that...',
        'I really enjoy doing this because...',
        'Could you tell me what you think?',
      ];
    }

    if (level === 'Intermediate') {
      return [
        'To be honest, it really depends on the situation...',
        'From my personal experience, I noticed that...',
        'Could you share your perspective on this as well?',
      ];
    }

    return [
      'That brings up an intriguing dilemma regarding...',
      'Synthesizing both viewpoints, I would argue that...',
      'What underlying factors do you consider most critical?',
    ];
  }

  private getTopicVocabulary(topicTitle: string): { word: string; meaning: string; example: string } {
    const title = topicTitle.toLowerCase();
    if (title.includes('interview') || title.includes('career')) {
      return {
        word: 'Pragmatic',
        meaning: 'Dealing with things sensibly and realistically based on practical considerations.',
        example: 'She took a pragmatic approach to resolving the client deadline issue.',
      };
    }
    if (title.includes('travel')) {
      return {
        word: 'Picturesque',
        meaning: 'Visually attractive in a charming or scenic way.',
        example: 'The mountain village was picturesque and calm.',
      };
    }
    return {
      word: 'Spontaneous',
      meaning: 'Performed or occurring as a result of a sudden impulse without premeditation.',
      example: 'We made a spontaneous decision to visit the beach this weekend.',
    };
  }
}

// Export singleton instance with pluggable engine support
export class AIService {
  private static engine: IAIEngine = new LocalESLTeacherEngine();

  static setEngine(engine: IAIEngine): void {
    this.engine = engine;
  }

  static async reply(userInput: string, context: ConversationContext): Promise<AIResponse> {
    return this.engine.generateReply(userInput, context);
  }
}
