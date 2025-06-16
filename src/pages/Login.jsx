import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiUser, FiLock, FiChevronRight } from 'react-icons/fi';
import API from '../utils/api';
import { FaChartLine, FaLanguage, FaUserFriends } from 'react-icons/fa';


const colors = {
  primary: '#F2B5D4', // Soft pink
  secondary: '#89CFF0', // Baby blue
  accent: '#7C3AED',    // Purple for accents
  lightBg: '#FDF2F8',   // Very light pink background
  darkText: '#1F2937',  // Dark gray
  lightText: '#6B7280'  // Light gray
};

const Login = () => {
  const [formData, setFormData] = useState({
    username: '',
    password: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

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
    if (validateForm()) {
      setIsSubmitting(true);
      try {
        const response = await API.post('login/', {
          username: formData.username,
          password: formData.password
        });
        
        localStorage.setItem('token', response.data.token);
        
        // Check if user is admin
        if (response.data.is_staff) {
          navigate('/admin');
          return;
        }
        
        // Check if user has completed preferences
        try {
          const profileResponse = await API.get('profiles/me/');
          if (profileResponse.data.selected_language) {
            navigate('/home');
          } else {
            navigate('/wizard');
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError);
          navigate('/wizard');
        }
      } catch (err) {
        setErrors({ 
          form: err.response?.data?.non_field_errors?.[0] || 
               err.response?.data?.detail || 
               'Invalid credentials' 
        });
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  const features = [
    { icon: <FaLanguage className="text-xl" />, text: 'Learn 50+ languages' },
    { icon: <FaUserFriends className="text-xl" />, text: 'Join a community' },
    { icon: <FaChartLine className="text-xl" />, text: 'Track your progress' }
  ];

  return (
    <div className="min-h-screen flex">
      {/* Left side - Illustration/Info */}
      <div 
        className="hidden md:flex flex-col justify-center p-12 w-1/2"
        style={{ backgroundColor: colors.lightBg }}
      >
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5 }}
        >
          <h1 className="text-4xl font-bold mb-6" style={{ color: colors.primary }}>
            Welcome Back!
          </h1>
          <p className="text-lg mb-8" style={{ color: colors.darkText }}>
            Continue your language learning journey with us.
          </p>
          
          <div className="space-y-4 mb-12">
            {features.map((feature, index) => (
              <div key={index} className="flex items-center gap-3">
                <div 
                  className="p-2 rounded-full flex items-center justify-center"
                  style={{ backgroundColor: colors.primary, color: 'white' }}
                >
                  {feature.icon}
                </div>
                <span style={{ color: colors.darkText }}>{feature.text}</span>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-2">
            <div className="flex -space-x-2">
              {[1, 2, 3].map((item) => (
                <div 
                  key={item} 
                  className="w-10 h-10 rounded-full border-2 border-white"
                  style={{ 
                    backgroundColor: [colors.primary, colors.secondary, '#A78BFA'][item-1],
                    zIndex: 4-item
                  }}
                ></div>
              ))}
            </div>
            <span style={{ color: colors.lightText }}>Join our community of learners</span>
          </div>
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
            <h2 className="text-3xl font-bold mb-2" style={{ color: colors.primary }}>Login</h2>
            <p style={{ color: colors.lightText }}>Continue your language journey</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-5">
            {[
              { name: 'username', label: 'Username', icon: <FiUser />, type: 'text' },
              { name: 'password', label: 'Password', icon: <FiLock />, type: 'password' }
            ].map((field) => (
              <div key={field.name}>
                <label className="block mb-1 font-medium" style={{ color: colors.darkText }}>
                  {field.label}
                </label>
                <div className="relative">
                  <div 
                    className="absolute left-3 top-1/2 transform -translate-y-1/2"
                    style={{ color: colors.lightText }}
                  >
                    {field.icon}
                  </div>
                  <input
                    name={field.name}
                    type={field.type}
                    value={formData[field.name]}
                    onChange={handleChange}
                    placeholder={`Enter your ${field.label.toLowerCase()}`}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${errors[field.name] ? 'border-red-500 focus:ring-red-200' : `border-gray-300 focus:ring-[${colors.primary}]/50`}`}
                    style={{ color: colors.darkText }}
                  />
                </div>
                {errors[field.name] && (
                  <p className="text-red-500 text-sm mt-1">{errors[field.name]}</p>
                )}
              </div>
            ))}

            <div className="flex justify-end">
              <button 
                type="button" 
                className="text-sm hover:underline focus:outline-none"
                style={{ color: colors.secondary }}
              >
                Forgot password?
              </button>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isSubmitting}
              className="w-full py-3 px-6 rounded-lg font-semibold shadow-md transition-all flex items-center justify-center gap-2"
              style={{ 
                backgroundColor: colors.primary,
                color: 'white',
                opacity: isSubmitting ? 0.7 : 1
              }}
            >
              {isSubmitting ? (
                'Logging in...'
              ) : (
                <>
                  Login <FiChevronRight />
                </>
              )}
            </motion.button>
          </form>

          <div className="mt-8 text-center">
            <p style={{ color: colors.lightText }}>
              Don't have an account?{' '}
              <button 
                onClick={() => navigate('/signup')} 
                className="font-semibold hover:underline focus:outline-none"
                style={{ color: colors.secondary }}
              >
                Sign up
              </button>
            </p>
          </div>

          <div className="mt-8">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t" style={{ borderColor: colors.lightText }}></div>
              </div>
              <div className="relative flex justify-center">
                <span 
                  className="px-2 text-sm"
                  style={{ backgroundColor: 'white', color: colors.lightText }}
                >
                  Or login with
                </span>
              </div>
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-3">
              {['Google', 'Facebook'].map((provider) => (
                <button
                  key={provider}
                  type="button"
                  className="w-full py-2 px-4 border rounded-lg font-medium flex items-center justify-center gap-2"
                  style={{ 
                    borderColor: colors.lightText,
                    color: colors.darkText
                  }}
                >
                  <div 
                    className="w-6 h-6 rounded-full flex items-center justify-center"
                    style={{ backgroundColor: provider === 'Google' ? '#4285F4' : '#1877F2' }}
                  >
                    {provider === 'Google' ? (
                      <span className="text-white text-xs">G</span>
                    ) : (
                      <span className="text-white text-xs">f</span>
                    )}
                  </div>
                  {provider}
                </button>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;