
const SUPPORTED_LANGUAGES = {
  'en-US': { name: 'English (US)', recognition: true, synthesis: true },
  'en-GB': { name: 'English (UK)', recognition: true, synthesis: true },
  'es-ES': { name: 'Spanish (Spain)', recognition: true, synthesis: true },
  'fr-FR': { name: 'French (France)', recognition: true, synthesis: true },
  'de-DE': { name: 'German', recognition: true, synthesis: true },
  'it-IT': { name: 'Italian', recognition: true, synthesis: true },
  'pt-BR': { name: 'Portuguese (Brazil)', recognition: true, synthesis: true },
  'ru-RU': { name: 'Russian', recognition: true, synthesis: true },
  'zh-CN': { name: 'Chinese (China)', recognition: true, synthesis: true },
  'ja-JP': { name: 'Japanese', recognition: true, synthesis: true },
  'ko-KR': { name: 'Korean', recognition: true, synthesis: true },
  'ar': { name: 'Arabic (Saudi Arabia)', recognition: false, synthesis: true },
  'hi-IN': { name: 'Hindi', recognition: false, synthesis: true },
  
};


let voices = [];
let voicesLoaded = false;
let recognitionSupportCache = {};


export const loadVoices = () => {
  return new Promise((resolve) => {
    if (voicesLoaded) {
      resolve(voices);
      return;
    }

    const updateVoices = () => {
      voices = window.speechSynthesis.getVoices();
      if (voices.length > 0) {
        voicesLoaded = true;
        resolve(voices);
      }
    };

   
    if (window.speechSynthesis.onvoiceschanged === undefined) {
      window.speechSynthesis.onvoiceschanged = updateVoices;
    }
    updateVoices();
  });
};


export const isSpeechSupported = () => {
  return 'speechSynthesis' in window;
};


export const isRecognitionSupported = () => {
  return 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
};


export const isLanguageSupportedForRecognition = async (langCode) => {
  if (!isRecognitionSupported()) return false;
  
  // Check cache first
  if (recognitionSupportCache[langCode] !== undefined) {
    return recognitionSupportCache[langCode];
  }

  // Create a test recognition instance
  const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
  const recognition = new SpeechRecognition();
  recognition.lang = langCode;
  
  return new Promise((resolve) => {
    recognition.onerror = (event) => {
      if (event.error === 'language-not-supported') {
        recognitionSupportCache[langCode] = false;
        resolve(false);
      } else {
        // Other errors might indicate the language is supported
        recognitionSupportCache[langCode] = true;
        resolve(true);
      }
    };

    recognition.onstart = () => {
      recognition.stop();
      recognitionSupportCache[langCode] = true;
      resolve(true);
    };

    try {
      recognition.start();
    } catch (e) {
      recognitionSupportCache[langCode] = false;
      resolve(false);
    }
  });
};

/**
 * Get supported languages with capabilities
 */
export const getSupportedLanguages = async () => {
  const results = {};
  
  for (const [code, data] of Object.entries(SUPPORTED_LANGUAGES)) {
    results[code] = {
      ...data,
      recognitionSupported: data.recognition ? await isLanguageSupportedForRecognition(code) : false,
      synthesisSupported: data.synthesis && isSpeechSupported()
    };
  }
  
  return results;
};

/**
 * Text-to-speech function
 */
export const speak = async (text, lang = 'en-US', options = {}) => {
  if (!isSpeechSupported()) {
    console.error('Speech synthesis not supported');
    return false;
  }

  // Cancel any ongoing speech
  window.speechSynthesis.cancel();

  await loadVoices();

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = lang;
  
  // Find the most appropriate voice for the language
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = lang.split('-')[0]; // e.g., 'es' from 'es-ES'
  
  // Try to find exact match first, then language prefix match
  const voice = voices.find(v => v.lang === lang) || 
               voices.find(v => v.lang.startsWith(langPrefix)) ||
               voices.find(v => v.lang.startsWith('en')); // Fallback to English

  if (voice) {
    utterance.voice = voice;
    utterance.rate = options.rate || (['ja-JP', 'zh-CN', 'ko-KR'].includes(lang) ? 0.8 : 1.0);
    utterance.pitch = options.pitch || 1;
    utterance.volume = options.volume || 1;
  } else {
    console.warn(`No voice found for language: ${lang}`);
    return false;
  }

  return new Promise((resolve) => {
    utterance.onend = () => resolve(true);
    utterance.onerror = (event) => {
      console.error('SpeechSynthesis error:', event.error);
      resolve(false);
    };
    window.speechSynthesis.speak(utterance);
  });
};

/**
 * Speech recognition function
 */
export const recognizeSpeech = (lang = 'en-US', options = {}) => {
  return new Promise((resolve, reject) => {
    if (!isRecognitionSupported()) {
      reject(new Error('Speech recognition not supported'));
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    
    recognition.lang = lang;
    recognition.interimResults = options.interimResults || false;
    recognition.maxAlternatives = options.maxAlternatives || 1;
    recognition.continuous = options.continuous || false;
    
    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      resolve(transcript);
    };
    
    recognition.onerror = (event) => {
      let errorMessage;
      switch(event.error) {
        case 'no-speech':
          errorMessage = 'No speech was detected';
          break;
        case 'audio-capture':
          errorMessage = 'No microphone was found';
          break;
        case 'not-allowed':
          errorMessage = 'Permission to use microphone was denied';
          break;
        case 'language-not-supported':
          errorMessage = `Language ${lang} is not supported for recognition`;
          break;
        default:
          errorMessage = `Error occurred in recognition: ${event.error}`;
      }
      reject(new Error(errorMessage));
    };
    
    recognition.onend = () => {
      // Clean up
    };
    
    try {
      recognition.start();
    } catch (e) {
      reject(new Error('Failed to start recognition'));
    }
  });
};

/**
 * Get available voices
 */
export const getVoiceForLanguage = (langCode) => {
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = langCode.split('-')[0];
  
  // Try exact match first
  const exactMatch = voices.find(v => v.lang === langCode);
  if (exactMatch) return exactMatch;
  
  // Then try language prefix match
  const langMatch = voices.find(v => v.lang.startsWith(langPrefix));
  if (langMatch) return langMatch;
  
  // Fallback to any English voice
  return voices.find(v => v.lang.startsWith('en'));
};

export const isVoiceAvailable = (langCode) => {
  const voices = window.speechSynthesis.getVoices();
  const langPrefix = langCode.split('-')[0];
  return voices.some(v => v.lang === langCode || v.lang.startsWith(langPrefix));
};
/**
 * Get browser's default language
 */
export const getBrowserLanguage = () => {
  const lang = navigator.language || 'en-US';
  return SUPPORTED_LANGUAGES[lang] ? lang : 'en-US';
};

/**
 * Initialize speech services
 */
export const initSpeechServices = async () => {
  if (isSpeechSupported()) {
    await loadVoices();
  }
  
  // Warm up recognition support cache
  if (isRecognitionSupported()) {
    await isLanguageSupportedForRecognition('en-US');
  }
};

// Initialize on import
initSpeechServices();
