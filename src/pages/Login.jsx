import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiChevronRight, FiArrowRight } from 'react-icons/fi';
import API from '../utils/api';
import { FaLanguage, FaUserFriends, FaRegSmileBeam, FaChartLine } from 'react-icons/fa';
import { GiConversation } from 'react-icons/gi';
import { RiChatSmile2Line } from 'react-icons/ri';
import axios from 'axios'; 

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const colors = {
    primary: '#EC4899', // Vibrant pink (matches landing page)
    secondary: '#7C3AED', // Purple for accents
    lightBg: '#FDF2F8', // Very light pink background
    darkText: '#1F2937', // Dark gray
    lightText: '#6B7280' // Light gray
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.username.trim()) newErrors.username = 'Username is required';
    if (!formData.password) newErrors.password = 'Password is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

 const handleLogin = async (e) => {
  e.preventDefault();
  setErrors({});

  if (!validateForm()) return;
  setIsSubmitting(true);

  try {
    // 🔒 Clear any old token before login
    delete API.defaults.headers.common['Authorization'];
    localStorage.removeItem('token');
    localStorage.removeItem('user');

    const response = await API.post('login/', {
      username: formData.username.trim(),
      password: formData.password
    });

    const { token, user_id, is_staff, profile } = response.data;

    // 💾 Save auth data
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify({
      id: user_id,
      isStaff: is_staff,
      username: formData.username.trim(),
      profile: profile
    }));

    // ✅ Manually set token for API instance
    API.defaults.headers.common['Authorization'] = `Token ${token}`;

    // ⏱️ Micro delay to ensure headers and storage are set
    await new Promise(res => setTimeout(res, 0));

    // 🚀 Redirect based on role/profile
    if (is_staff) {
      navigate('/admin');
    } else if (!profile.selected_language) {
      navigate('/onboarding', { state: { from: 'login' } });
    } else {
      navigate('/home', {
        replace: true,
        state: {
          welcomeBack: true,
          lastLogin: profile.last_login
        }
      });
    }

  } catch (err) {
    console.error('Full error object:', err);
    console.error('Error response data:', err.response?.data);
    console.error('Error status:', err.response?.status);

    const data = err.response?.data || {};
    const newErrors = {};

    if (data.username) newErrors.username = data.username.join(' ');
    if (data.password) newErrors.password = data.password.join(' ');
    if (data.non_field_errors) newErrors.form = data.non_field_errors[0];
    else if (data.detail) newErrors.form = data.detail;
    else newErrors.form = 'Login failed. Please try again.';

    setErrors(newErrors);

    // 🚫 Clear any partial auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    delete API.defaults.headers.common['Authorization'];
  } finally {
    setIsSubmitting(false);
  }
};


  const features = [
    { 
      icon: <GiConversation size={24} className="text-pink-600" />, 
      text: 'Real conversation practice' 
    },
    { 
      icon: <FaChartLine size={24} className="text-pink-600" />, 
      text: 'Track your progress' 
    },
    { 
      icon: <FaUserFriends size={24} className="text-pink-600" />, 
      text: 'Join our community' 
    }
  ];

  return (
    <div className="min-h-screen flex bg-gradient-to-b from-pink-50 to-white">
      {/* Left side - Illustration/Info */}
      <div className="hidden md:flex flex-col justify-center p-12 w-1/2 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-20 left-10 w-32 h-32 rounded-full bg-pink-200 opacity-20 blur-xl"></div>
        <div className="absolute bottom-1/4 right-20 w-48 h-48 rounded-full bg-purple-200 opacity-20 blur-xl"></div>
        
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
          className="relative z-10"
        >
          <div className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-2 bg-pink-100 rounded-full">
                <RiChatSmile2Line className="text-pink-600 text-xl" />
              </div>
              <span className="text-sm font-semibold text-pink-600 uppercase tracking-wider">
                Welcome Back
              </span>
            </div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
              Continue Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-pink-400">Language Journey</span>
            </h1>
            <p className="text-xl text-gray-700 mb-8">
              Pick up right where you left off and keep improving your skills
            </p>
          </div>
          
          <div className="space-y-6 mb-12">
            {features.map((feature, index) => (
              <motion.div 
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 + 0.3 }}
                className="flex items-center gap-4 p-4 bg-white rounded-xl shadow-sm border border-gray-100"
              >
                <div className="p-3 bg-pink-100 rounded-lg text-pink-600">
                  {feature.icon}
                </div>
                <span className="text-lg font-medium text-gray-700">{feature.text}</span>
              </motion.div>
            ))}
          </div>
          
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex items-center gap-4"
          >
            <div className="flex -space-x-2">
              {[1, 2, 3].map((item) => (
                <div 
                  key={item} 
                  className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                  style={{ 
                    backgroundColor: ['#F472B6', '#A78BFA', '#818CF8'][item-1],
                    zIndex: 4-item
                  }}
                ></div>
              ))}
            </div>
            <span className="text-gray-600">Join 10M+ language learners worldwide</span>
          </motion.div>
        </motion.div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 flex items-center justify-center p-6">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="w-full max-w-md"
        >
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-2 text-gray-900">Login to Speakably</h2>
            <p className="text-gray-600">Continue your language learning journey</p>
          </div>

          {errors.form && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 p-4 bg-red-50 text-red-600 rounded-lg border border-red-100"
            >
              {errors.form}
            </motion.div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {[
              { name: 'username', label: 'Username', icon: <FiUser />, type: 'text' },
              { name: 'password', label: 'Password', icon: <FiLock />, type: 'password' }
            ].map((field) => (
              <div key={field.name}>
                <label className="block mb-2 font-medium text-gray-700">
                  {field.label}
                </label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                    {field.icon}
                  </div>
                  <input
                    name={field.name}
                    type={field.type}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${
                      errors[field.name] 
                        ? 'border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:ring-pink-200'
                    }`}
                  />
                </div>
                {errors[field.name] && (
                  <p className="mt-1 text-sm text-red-500">{errors[field.name]}</p>
                )}
              </div>
            ))}

            <div className="flex justify-end">
              <button 
                type="button" 
                className="text-sm font-medium text-pink-600 hover:underline focus:outline-none"
              >
                Forgot password?
              </button>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-lg font-semibold shadow-md transition-all flex items-center justify-center gap-2 bg-gradient-to-r from-pink-600 to-pink-500 text-white hover:from-pink-700 hover:to-pink-600"
            >
              {isSubmitting ? (
                'Logging in...'
              ) : (
                <>
                  Continue <FiArrowRight />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/signup')} 
                className="font-semibold text-pink-600 hover:underline focus:outline-none"
              >
                Sign up now
              </button>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;