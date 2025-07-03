import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FiArrowRight, 
  FiArrowLeft,
  FiGlobe, 
  FiBarChart2,
  FiTarget,
  FiClock,
  FiCalendar,
  FiCheckCircle
} from 'react-icons/fi';
import API from '../utils/api';
import { toast } from 'react-toastify';

function WizardForm() {
  const [currentStep, setCurrentStep] = useState(1);
  const [languages, setLanguages] = useState([]);
  const [formData, setFormData] = useState({
    selectedLanguage: '',
    proficiencyLevel: '',
    learningGoal: '',
    dailyGoalTarget: '5',
    dailyPracticeTime: '15',
    availableDays: [],
    enableEmailReminders: true,
  reminderTime: '18:00',
  });
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        const response = await API.get('languages/');
        setLanguages(response.data);
      } catch (err) {
        toast.error('Failed to load languages');
      }
    };
    fetchLanguages();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleDayToggle = (day) => {
    setFormData(prev => {
      const newDays = prev.availableDays.includes(day)
        ? prev.availableDays.filter(d => d !== day)
        : [...prev.availableDays, day];
      return { ...prev, availableDays: newDays };
    });
  };

  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => prev - 1);
  };

  const validateStep = (step) => {
    switch(step) {
      case 1:
        if (!formData.selectedLanguage) {
          toast.error('Please select a language');
          return false;
        }
        return true;
      case 2:
        if (!formData.proficiencyLevel) {
          toast.error('Please select your proficiency level');
          return false;
        }
        return true;
      case 3:
        if (!formData.learningGoal) {
          toast.error('Please select your learning goal');
          return false;
        }
        return true;
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!validateStep(currentStep)) return;
    
    setLoading(true);
    try {
      await API.patch('profiles/update_preferences/', {
        selected_language: formData.selectedLanguage,
        proficiency_level: formData.proficiencyLevel,
        learning_goal: formData.learningGoal,
        daily_goal_target: formData.dailyGoalTarget,
        daily_practice_time: formData.dailyPracticeTime,
        available_days: formData.availableDays
      });
      navigate('/home');
    } catch (err) {
      toast.error(err.response?.data?.detail || err.response?.data?.error || 'Error saving preferences');
    } finally {
      setLoading(false);
    }
  };

  const steps = [
    { id: 1, title: 'Language' },
    { id: 2, title: 'Proficiency' },
    { id: 3, title: 'Goals' },
    { id: 4, title: 'Schedule' },
    { id: 5, title: 'Complete' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-white flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white rounded-3xl shadow-xl overflow-hidden w-full max-w-md"
      >
        {/* Progress Bar */}
        <div className="bg-gray-100 h-2">
          <div 
            className="bg-pink-500 h-full transition-all duration-500" 
            style={{ width: `${(currentStep / steps.length) * 100}%` }}
          ></div>
        </div>

        {/* Step Indicator */}
        <div className="flex justify-between px-6 py-4 bg-white border-b">
          {steps.map(step => (
            <div key={step.id} className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center 
                ${currentStep >= step.id ? 'bg-pink-500 text-white' : 'bg-gray-200 text-gray-600'}`}>
                {currentStep > step.id ? <FiCheckCircle /> : step.id}
              </div>
              <span className={`text-xs mt-1 ${currentStep === step.id ? 'font-semibold text-pink-500' : 'text-gray-500'}`}>
                {step.title}
              </span>
            </div>
          ))}
        </div>

        <div className="p-8">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiGlobe className="text-pink-500" />
                Which language do you want to learn?
              </h3>
              <select 
                name="selectedLanguage"
                value={formData.selectedLanguage} 
                onChange={handleChange} 
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select a language</option>
                {languages.map(lang => (
                  <option key={lang.id} value={lang.id}>{lang.name}</option>
                ))}
              </select>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiBarChart2 className="text-pink-500" />
                What's your current proficiency level?
              </h3>
              <div className="space-y-3">
                {['Beginner', 'Intermediate', 'Advanced'].map(level => (
                  <div key={level} className="flex items-center">
                    <input
                      type="radio"
                      id={level}
                      name="proficiencyLevel"
                      value={level.toLowerCase()}
                      checked={formData.proficiencyLevel === level.toLowerCase()}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor={level}
                      className={`w-full p-3 border rounded-lg cursor-pointer transition-all
                        ${formData.proficiencyLevel === level.toLowerCase() 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-gray-200 hover:border-pink-300'}`}
                    >
                      {level}
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiTarget className="text-pink-500" />
                What's your primary learning goal?
              </h3>
              <div className="space-y-3">
                {['Travel', 'Work', 'School', 'Conversation', 'Culture'].map(goal => (
                  <div key={goal} className="flex items-center">
                    <input
                      type="radio"
                      id={goal}
                      name="learningGoal"
                      value={goal}
                      checked={formData.learningGoal === goal}
                      onChange={handleChange}
                      className="hidden"
                    />
                    <label 
                      htmlFor={goal}
                      className={`w-full p-3 border rounded-lg cursor-pointer transition-all
                        ${formData.learningGoal === goal 
                          ? 'border-pink-500 bg-pink-50' 
                          : 'border-gray-200 hover:border-pink-300'}`}
                    >
                      {goal}
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

          {currentStep === 4 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiTarget className="text-pink-500" />
                Set your daily goal
              </h3>
              <div className="mb-6">
                <label className="block text-gray-700 mb-2">
                  Daily lesson target: {formData.dailyGoalTarget}
                </label>
                <input
                  type="range"
                  name="dailyGoalTarget"
                  min="1"
                  max="15"
                  value={formData.dailyGoalTarget}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>1 lesson</span>
                  <span>15 lessons</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiClock className="text-pink-500" />
                Daily practice time
              </h3>
              <div className="mb-6">
                <input
                  type="range"
                  name="dailyPracticeTime"
                  min="5"
                  max="120"
                  step="5"
                  value={formData.dailyPracticeTime}
                  onChange={handleChange}
                  className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-pink-500"
                />
                <div className="flex justify-between mt-2 text-sm text-gray-500">
                  <span>5 min</span>
                  <span className="font-medium text-pink-500">{formData.dailyPracticeTime} min</span>
                  <span>120 min</span>
                </div>
              </div>

              <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                <FiCalendar className="text-pink-500" />
                Which days are you available?
              </h3>
              <div className="grid grid-cols-4 gap-2">
                {daysOfWeek.map(day => (
                  <div key={day} className="col-span-2">
                    <input
                      type="checkbox"
                      id={day}
                      checked={formData.availableDays.includes(day)}
                      onChange={() => handleDayToggle(day)}
                      className="hidden"
                    />
                    <label 
                      htmlFor={day}
                      className={`block p-2 text-center rounded-lg cursor-pointer transition-all
                        ${formData.availableDays.includes(day)
                          ? 'bg-pink-500 text-white'
                          : 'bg-gray-100 hover:bg-pink-100'}`}
                    >
                      {day.slice(0, 3)}
                    </label>
                  </div>
                ))}
              </div>
            </motion.div>
          )}

         
          <div className="flex justify-between mt-8">
            {currentStep > 1 && (
              <motion.button
                onClick={prevStep}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium py-2 px-6 rounded-lg transition-all flex items-center gap-2"
              >
                <FiArrowLeft /> Back
              </motion.button>
            )}

            {currentStep < steps.length ? (
              <motion.button
                onClick={nextStep}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="ml-auto bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-6 rounded-lg shadow-sm transition-all flex items-center gap-2"
              >
                Next <FiArrowRight />
              </motion.button>
            ) : (
              <motion.button
                onClick={handleSubmit}
                disabled={loading}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.98 }}
                className="ml-auto bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-medium py-3 px-8 rounded-lg shadow-md transition-all flex items-center gap-2"
              >
                {loading ? 'Finalizing...' : 'Start Learning'} <FiArrowRight />
              </motion.button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default WizardForm;