import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { LANGUAGE_PROMPTS } from '../services/gemini.js';

const LanguageContext = createContext(null);

export const SUPPORTED_LANGUAGES = [
  { code: 'ta', label: 'தமிழ்', fullLabel: 'தமிழ் (Tamil)', speechLang: 'ta-IN' },
  { code: 'en', label: 'English', fullLabel: 'English', speechLang: 'en-IN' },
  { code: 'hi', label: 'हिन्दी', fullLabel: 'हिन्दी (Hindi)', speechLang: 'hi-IN' },
  { code: 'te', label: 'తెలుగు', fullLabel: 'తెలుగు (Telugu)', speechLang: 'te-IN' },
];

export function LanguageProvider({ children }) {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('farm_ai_lang');
    if (saved === 'tanglish') return 'ta';
    return saved || 'ta';
  });

  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [speakingTextId, setSpeakingTextId] = useState(null);
  const recognitionRef = useRef(null);

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === language) || SUPPORTED_LANGUAGES[0];

  const setLanguage = (code) => {
    setLanguageState(code);
    localStorage.setItem('farm_ai_lang', code);
    // If speaking, stop on language change
    if (window.speechSynthesis) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      setSpeakingTextId(null);
    }
  };

  // Text-To-Speech (Talking back to the user)
  const speakText = useCallback(
    (text, msgId = null) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported in this browser.');
        return;
      }

      // If currently speaking this message, toggle pause/stop
      if (isSpeaking && speakingTextId === msgId) {
        window.speechSynthesis.cancel();
        setIsSpeaking(false);
        setSpeakingTextId(null);
        return;
      }

      window.speechSynthesis.cancel(); // Stop any active speech

      // Clean markdown tags for natural speech
      const cleaned = text
        .replace(/[#*_`~>•]/g, ' ')
        .replace(/\n+/g, '. ')
        .trim();

      const utterance = new SpeechSynthesisUtterance(cleaned);
      utterance.lang = currentLangObj.speechLang;
      utterance.rate = 0.95; // Slightly slower for clarity in farming guidance

      // Try finding a matching native voice
      const voices = window.speechSynthesis.getVoices();
      const matchedVoice = voices.find(
        (v) => v.lang.toLowerCase() === currentLangObj.speechLang.toLowerCase()
      );
      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      utterance.onstart = () => {
        setIsSpeaking(true);
        setSpeakingTextId(msgId);
      };

      utterance.onend = () => {
        setIsSpeaking(false);
        setSpeakingTextId(null);
      };

      utterance.onerror = () => {
        setIsSpeaking(false);
        setSpeakingTextId(null);
      };

      window.speechSynthesis.speak(utterance);
    },
    [currentLangObj, isSpeaking, speakingTextId]
  );

  const stopSpeaking = useCallback(() => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setIsSpeaking(false);
    setSpeakingTextId(null);
  }, []);

  // Speech-To-Text (Voice input in user's talking language)
  const startListening = useCallback(
    ({ onResult, onError }) => {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;

      if (!SpeechRecognition) {
        alert('Voice recognition is not supported in this browser. Please use Google Chrome or Edge.');
        return;
      }

      // Stop previous instance if any
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }

      const recognition = new SpeechRecognition();
      recognition.lang = currentLangObj.speechLang;
      recognition.interimResults = false;
      recognition.continuous = false;

      recognition.onstart = () => {
        setIsListening(true);
      };

      recognition.onresult = (event) => {
        const transcript = event.results?.[0]?.[0]?.transcript;
        if (transcript && onResult) {
          onResult(transcript);
        }
      };

      recognition.onerror = (err) => {
        console.warn('Speech recognition error:', err);
        setIsListening(false);
        if (onError) onError(err);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
      try {
        recognition.start();
      } catch (err) {
        console.warn('Recognition start error:', err);
        setIsListening(false);
      }
    },
    [currentLangObj]
  );

  const stopListening = useCallback(() => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setIsListening(false);
  }, []);

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      if (window.speechSynthesis) {
        window.speechSynthesis.cancel();
      }
      if (recognitionRef.current) {
        try {
          recognitionRef.current.abort();
        } catch (e) {}
      }
    };
  }, []);

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        currentLangObj,
        languages: SUPPORTED_LANGUAGES,
        isListening,
        startListening,
        stopListening,
        isSpeaking,
        speakingTextId,
        speakText,
        stopSpeaking,
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return ctx;
}
