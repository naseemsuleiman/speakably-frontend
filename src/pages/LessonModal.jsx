import React, { useState, useEffect, useRef } from 'react';
import { FiX, FiCheck, FiVolume2, FiPause, FiMic, FiAward, FiStar } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import { loadVoices } from '../utils/tts';
import stringSimilarity from 'string-similarity';



const LessonModal = ({ lesson, onClose, onComplete }) => {
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState([]);
  const [showFeedback, setShowFeedback] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [progress, setProgress] = useState(0);
  const [recognitionError, setRecognitionError] = useState(null);
  const [selectedWord, setSelectedWord] = useState(null);
  const [selectedTranslation, setSelectedTranslation] = useState(null);
  const [matchedPairs, setMatchedPairs] = useState([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [showStreak, setShowStreak] = useState(false);
  const [shuffledOptions, setShuffledOptions] = useState([]);
  const audioRef = useRef(null);
  const recognitionRef = useRef(null);
  const [recognitionLang, setRecognitionLang] = useState('en-US');

  const currentExercise = lesson.exercises?.[currentExerciseIndex];
  const totalExercises = lesson.exercises?.length || 0;


  useEffect(() => {
  if (lesson?.unit?.language?.speech_recognition_code) {
    setRecognitionLang(lesson.unit.language.speech_recognition_code);
  } 
}, [lesson]);

  // Initialize speech recognition
  useEffect(() => {
  if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
    setRecognitionError('Speech recognition not supported in your browser');
    return;
  }

  try {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognitionRef.current = new SpeechRecognition();
    
    recognitionRef.current.continuous = false;
    recognitionRef.current.interimResults = false;
    recognitionRef.current.lang = recognitionLang; 
    recognitionRef.current.maxAlternatives = 1;
      
      recognitionRef.current.onstart = () => {
        setIsRecording(true);
        setRecognitionError(null);
      };
      
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        checkPronunciation(transcript);
      };
      
      recognitionRef.current.onerror = (event) => {
        console.error('Speech recognition error', event.error);
        setIsRecording(false);
        setRecognitionError(getRecognitionError(event.error));
      };
      
      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };
    } catch (error) {
      console.error('Error initializing speech recognition:', error);
      setRecognitionError('Failed to initialize speech recognition');
    }
    
     return () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };
}, [recognitionLang]);

  // Shuffle options when exercise changes
  useEffect(() => {
    if (currentExercise?.exercise_type === 'matching') {
      const shuffled = [...currentExercise.options].sort(() => Math.random() - 0.5);
      setShuffledOptions(shuffled);
      setMatchedPairs([]);
      setSelectedWord(null);
      setSelectedTranslation(null);
    }
  }, [currentExerciseIndex]);

  // Play audio when exercise changes
  useEffect(() => {
    if (currentExercise?.word) {
      speak(currentExercise.word);
    }
  }, [currentExerciseIndex]);

  const getRecognitionError = (errorCode) => {
    const errors = {
      'no-speech': 'No speech was detected',
      'audio-capture': 'No microphone was found',
      'not-allowed': 'Permission to use microphone was denied',
      'aborted': 'Listening was aborted',
      'network': 'Network communication failed',
      'service-not-allowed': 'Browser doesn\'t support speech recognition',
      'language-not-supported': 'Language not supported'
    };
    return errors[errorCode] || 'Error occurred during speech recognition';
  };

 
console.log("🔍 lesson.unit.language:", lesson?.unit?.language);
console.log("🧠 speech_recognition_code:", lesson?.unit?.language?.speech_recognition_code);

const speak = async (text) => {
  if (!window.speechSynthesis) {
    console.error('Speech synthesis not supported');
    return;
  }

  await loadVoices(); // Wait until all voices are fully available

  const langCode = lesson?.unit?.language?.speech_recognition_code || 'en-US';
  const langPrefix = langCode.split('-')[0];
  console.log("🗣 Requested language:", langCode);

  const voices = window.speechSynthesis.getVoices();

  // Debug log: all available voices
  console.log("🔊 Available voices:");
  voices.forEach(v => {
    console.log(`- ${v.name} (${v.lang})`);
  });

  // Cancel any ongoing speech
  if (window.speechSynthesis.speaking) {
    window.speechSynthesis.cancel();
  }

  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = langCode;

  // Preferred voice logic
  const preferredVoice =
    voices.find(v => v.lang === langCode && !v.name.includes('Microsoft')) ||
    voices.find(v => v.lang.startsWith(langPrefix) && !v.name.includes('Microsoft'));

  if (!preferredVoice) {
    console.warn(`⚠ No suitable voice found for ${langCode}. Speech skipped.`);
    return;
  }

  utterance.voice = preferredVoice;
  console.log(`✅ Using voice: ${preferredVoice.name} (${preferredVoice.lang})`);

  // Optional: slower rate for Asian languages
  utterance.rate = ['ja-JP', 'zh-CN', 'ko-KR'].includes(langCode) ? 0.8 : 1.0;

  utterance.onerror = (event) => {
    console.error('❌ Speech synthesis error:', event.error);
  };

  window.speechSynthesis.speak(utterance);
};

const startRecording = () => {
  if (recognitionError) {
    console.error('Cannot start recording:', recognitionError);
    return;
  }

  try {
    if (recognitionRef.current) {
      const langCode = lesson?.unit?.language?.speech_recognition_code || 'en-US';
      recognitionRef.current.lang = langCode;

      // 🧠 Ensure up-to-date currentExercise
      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        console.log("🎧 Heard:", transcript);
        checkPronunciation(transcript);  // always uses latest currentExercise
      };

      recognitionRef.current.onend = () => {
        setIsRecording(false);
      };

      recognitionRef.current.stop();
      setTimeout(() => {
        recognitionRef.current.start();
      }, 100);
    }
  } catch (error) {
    console.error('Error starting speech recognition:', error);
    setRecognitionError('Failed to start recording');
  }
};



 const checkPronunciation = (userSpeech) => {
  setIsRecording(false);
  const correctAnswer = currentExercise.word.toLowerCase(); // Compare against the word, not translation
  const userAnswer = userSpeech.toLowerCase();
  
  // Calculate similarity
  const similarity = stringSimilarity.compareTwoStrings(userAnswer, correctAnswer);
  const isSimilarEnough = similarity > 0.7;
  
  if (isSimilarEnough) {
    setStreak(prev => prev + 1);
    setShowStreak(true);
    setTimeout(() => setShowStreak(false), 1000);
    setShowFeedback('correct');
    
    // Delay moving to next exercise to show feedback
    setTimeout(() => {
      handleAnswer(correctAnswer); // Pass the correct answer
      setShowFeedback(null);
    }, 1500);
  } else {
    setStreak(0);
    setShowFeedback('incorrect');
    setTimeout(() => setShowFeedback(null), 1500);
  }
};


 const handleAnswer = (answer) => {
  const isCorrect = checkIfCorrect(answer);
  const newAnswers = [...userAnswers, { 
    exerciseId: currentExercise.id, 
    answer, 
    isCorrect 
  }];
  
  setUserAnswers(newAnswers);
  
  if (isCorrect) {
    setScore(prev => prev + 10);
    // Don't show feedback here - it's already shown in checkPronunciation
    // Move to next exercise after a delay
    setTimeout(() => {
      moveToNextExercise();
    }, 500);
  }
};
  const checkIfCorrect = (answer) => {
    switch(currentExercise.exercise_type) {
      case 'word_with_audio':
        return answer === currentExercise.translation;
      case 'image_selection':
        return answer === currentExercise.translation;
      case 'pronunciation':
        return answer === currentExercise.word.toLowerCase();
      case 'matching':
        return matchedPairs.length === currentExercise.options?.length;
      default:
        return false;
    }
  };

  const handleWordSelect = (word) => {
    setSelectedWord(word);
    checkForMatch(word, selectedTranslation);
  };

  const handleTranslationSelect = (translation) => {
    setSelectedTranslation(translation);
    checkForMatch(selectedWord, translation);
  };

const checkForMatch = (word, translation) => {
  if (word && translation) {
    const correctMatch = currentExercise.options.find(
      opt => opt.word === word && opt.translation === translation
    );
    
    if (correctMatch) {
      const newPairs = [...matchedPairs, { word, translation }];
      setMatchedPairs(newPairs);
      setScore(prev => prev + 5);
      setStreak(prev => prev + 1);
      setShowStreak(true);
      setTimeout(() => setShowStreak(false), 1000);
      
      // Check if all matches are complete
      if (newPairs.length === currentExercise.options.length) {
        setShowFeedback('correct');
        setTimeout(() => {
          // Create a mock answer for completion
          const newAnswers = [...userAnswers, { 
            exerciseId: currentExercise.id, 
            answer: 'complete', 
            isCorrect: true 
          }];
          setUserAnswers(newAnswers);
          
          // Move to next exercise or complete lesson
          if (currentExerciseIndex < totalExercises - 1) {
            setCurrentExerciseIndex(prev => prev + 1);
          } else {
            completeLesson();
          }
          
          setShowFeedback(null);
        }, 1000);
      }
    } else {
      setStreak(0);
      setShowFeedback('incorrect');
      setTimeout(() => setShowFeedback(null), 1000);
    }
    
    setSelectedWord(null);
    setSelectedTranslation(null);
  }
};
  
const completeLesson = async () => {
  try {
    const correctAnswers = userAnswers.filter(a => a.isCorrect).length;
    const xpEarned = Math.floor((correctAnswers / totalExercises) * 100);
    
    const success = await onComplete(lesson.id, xpEarned);
    
    if (success) {
      // Reset state before closing
      setCurrentExerciseIndex(0);
      setUserAnswers([]);
      setMatchedPairs([]);
      setScore(0);
      setStreak(0);
      onClose();
    } else {
      toast.error("Failed to update progress");
    }
  } catch (error) {
    console.error("Completion error:", error);
    toast.error("Error updating progress");
  }
};

const moveToNextExercise = () => {
  if (currentExerciseIndex < totalExercises - 1) {
    setCurrentExerciseIndex(prev => prev + 1);
    setMatchedPairs([]);
    setSelectedWord(null);
    setSelectedTranslation(null);
    setShowFeedback(null); // Reset feedback
  } else {
    completeLesson();
  }
};

const renderExercise = () => {
  if (!currentExercise) return null;

  switch(currentExercise.exercise_type) {
    case 'word_with_audio':
  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <div className="bg-pink-50 p-8 rounded-full">
        <FiVolume2 
          size={48} 
          className="text-pink-600 cursor-pointer hover:text-pink-800" 
          onClick={() => speak(currentExercise.word)}
        />
      </div>
      <h3 className="text-3xl font-bold text-center bg-gradient-to-r from-pink-600 to-pink-500 bg-clip-text text-transparent">
        {currentExercise.word}
      </h3>
      {/* Add translation display */}
      <div className="text-xl text-gray-600 mb-4">
        Translation: <span className="font-semibold text-gray-800">{currentExercise.translation}</span>
      </div>
      <motion.button 
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
        onClick={moveToNextExercise}
        className="px-8 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-lg hover:from-pink-600 hover:to-pink-700 transition shadow-lg"
      >
        Next
      </motion.button>
    </div>
  );

      case 'image_selection':
        return (
          <div className="flex flex-col items-center p-6 space-y-6">
            <h3 className="text-2xl font-bold text-center">{currentExercise.word}</h3>
            <div className="grid grid-cols-2 gap-4">
              {currentExercise.images?.map((img, index) => (
                <motion.button
                  key={index}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => handleAnswer(img.is_correct ? currentExercise.translation : '')}
                  className={`p-2 border-4 rounded-xl transition-all ${
                    img.is_correct ? 
                    'border-emerald-400 hover:border-emerald-500' : 
                    'border-rose-400 hover:border-rose-500'
                  }`}
                >
                  <img 
  src={img.url} 
  alt="Exercise option" 
  className="w-32 h-32 object-cover rounded-lg"
  onError={(e) => {
    e.target.onerror = null;
    e.target.src = `https://via.placeholder.com/200?text=${currentExercise.word}`;
  }}
/>
                </motion.button>
              ))}
            </div>
          </div>
        );

      case 'pronunciation':
  return (
    <div className="flex flex-col items-center p-6 space-y-6">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-8 rounded-full shadow-lg">
        <FiMic size={48} className="text-white" />
      </div>
      <h3 className="text-3xl font-bold text-center">Pronounce:</h3>
      <h3 className="text-4xl font-bold text-purple-600">{currentExercise.word}</h3>
      
      {/* Add translation display */}
      <div className="text-xl text-gray-600 mb-4">
        Translation: <span className="font-semibold text-gray-800">{currentExercise.translation}</span>
      </div>
      
      <motion.button 
        onClick={startRecording}
        disabled={isRecording || recognitionError}
        animate={{
          scale: isRecording ? [1, 1.1, 1] : 1,
          backgroundColor: isRecording ? '#ef4444' : recognitionError ? '#6b7280' : '#10b981'
        }}
        transition={isRecording ? { repeat: Infinity, duration: 1 } : {}}
        className="p-6 rounded-full text-white shadow-lg"
      >
        <FiMic size={32} />
      </motion.button>
      
      {isRecording && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-gray-600 font-medium"
        >
          Listening... Speak now!
        </motion.p>
      )}
      {recognitionError && (
        <motion.p 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-red-500 text-sm max-w-xs text-center"
        >
          {recognitionError}
        </motion.p>
      )}
    </div>
  );

      case 'matching':
        const unmatchedWords = shuffledOptions.filter(
          opt => !matchedPairs.some(pair => pair.word === opt.word)
        );
        const unmatchedTranslations = [...shuffledOptions].sort(() => Math.random() - 0.5).filter(
          opt => !matchedPairs.some(pair => pair.translation === opt.translation)
        );

        return (
          <div className="flex flex-col items-center p-6 space-y-6">
            <h3 className="text-2xl font-bold text-center bg-gradient-to-r from-blue-600 to-green-500 bg-clip-text text-transparent">
              Match the pairs
            </h3>
            
            <div className="w-full flex justify-between space-x-4">
              {/* Words Column */}
              <div className="w-1/2 space-y-3">
                <h4 className="text-lg font-semibold text-center text-blue-600">Words</h4>
                {unmatchedWords.map((opt, index) => (
                  <motion.button
                    key={`word-${index}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleWordSelect(opt.word)}
                    className={`p-3 rounded-lg w-full transition-all ${
                      selectedWord === opt.word ? 
                      'bg-blue-200 border-2 border-blue-500' : 
                      'bg-blue-100 hover:bg-blue-200'
                    }`}
                  >
                    {opt.word}
                  </motion.button>
                ))}
              </div>
              
              {/* Translations Column */}
              <div className="w-1/2 space-y-3">
                <h4 className="text-lg font-semibold text-center text-green-600">Translations</h4>
                {unmatchedTranslations.map((opt, index) => (
                  <motion.button
                    key={`trans-${index}`}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => handleTranslationSelect(opt.translation)}
                    className={`p-3 rounded-lg w-full transition-all ${
                      selectedTranslation === opt.translation ? 
                      'bg-green-200 border-2 border-green-500' : 
                      'bg-green-100 hover:bg-green-200'
                    }`}
                  >
                    {opt.translation}
                  </motion.button>
                ))}
              </div>
            </div>
            
            {/* Matched Pairs Display */}
            {matchedPairs.length > 0 && (
              <div className="w-full mt-4">
                <h4 className="text-sm font-semibold text-center text-gray-500 mb-2">Matched Pairs</h4>
                <div className="grid grid-cols-2 gap-2">
                  {matchedPairs.map((pair, index) => (
                    <motion.div
                      key={index}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="bg-emerald-100 p-2 rounded-lg flex justify-between"
                    >
                      <span className="font-medium text-blue-600">{pair.word}</span>
                      <span className="font-medium text-green-600">{pair.translation}</span>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );

      default:
        return <div>Unsupported exercise type</div>;
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm"
    >
      <motion.div 
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        className="bg-gradient-to-br from-white to-gray-100 rounded-2xl p-6 w-full max-w-2xl relative mx-4 shadow-2xl border-2 border-white"
      >
        {/* Score Display */}
        <div className="absolute -top-4 -right-4 bg-pink-400 text-black px-4 py-2 rounded-full font-bold flex items-center shadow-lg">
          <FiAward className="mr-1" /> {score}
        </div>
        
        {/* Streak Display */}
        {showStreak && streak > 1 && (
          <motion.div 
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            className="absolute -top-4 -left-4 bg-orange-500 text-white px-3 py-1 rounded-full font-bold flex items-center shadow-lg"
          >
            <FiStar className="mr-1" /> {streak} streak!
          </motion.div>
        )}
        
        {/* Feedback overlay */}
        {showFeedback && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`absolute inset-0 flex flex-col items-center justify-center rounded-2xl ${
              showFeedback === 'correct' ? 'bg-pink-500' : 'bg-red-500'
            } bg-opacity-90 z-10`}
          >
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 10, -10, 0]
              }}
              transition={{ duration: 0.5 }}
              className="text-white text-5xl font-bold mb-2"
            >
              {showFeedback === 'correct' ? '✓ Correct!' : '✗ Try Again'}
            </motion.div>
            {showFeedback === 'correct' && (
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-white text-xl"
              >
                +10 points!
              </motion.p>
            )}
          </motion.div>
        )}
        
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <div>
            <h3 className="text-2xl font-bold text-gray-800">{lesson.title}</h3>
            <p className="text-sm text-gray-500">{currentExercise?.exercise_type.replace('_', ' ')}</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onClose} 
            className="text-gray-500 hover:text-gray-700 transition p-1"
          >
            <FiX size={28} />
          </motion.button>
        </div>
        
        {/* Progress Bar */}
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${((currentExerciseIndex + 1) / totalExercises) * 100}%` }}
              className="bg-gradient-to-r from-pink-500 to-pink-600 h-3 rounded-full" 
            ></motion.div>
          </div>
          <div className="flex justify-between mt-1">
            <span className="text-sm font-medium text-gray-600">
              Level {Math.floor(score / 100) + 1}
            </span>
            <span className="text-sm font-medium text-gray-600">
              Question {currentExerciseIndex + 1} of {totalExercises}
            </span>
          </div>
        </div>
        
        {/* Exercise Content */}
        <div className="min-h-[300px] flex items-center justify-center">
          {renderExercise()}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default LessonModal;