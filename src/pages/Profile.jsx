import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiUser, FiAward, FiZap, FiHeart, FiGlobe, 
  FiArrowLeft, FiRotateCcw, FiSettings, FiLogOut 
} from 'react-icons/fi';
import API from '../utils/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

function Profile() {
  const [userData, setUserData] = useState({
    user: {
      username: '',
      email: ''
    },
    selected_language_name: '',
    proficiency_level: '',
    xp: 0,
    current_streak: 0
  });
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        const response = await API.get('profiles/me/');
        
        // Ensure all required fields have default values
        setUserData({
          user: {
            username: response.data.user?.username || '',
            email: response.data.user?.email || ''
          },
          selected_language_name: response.data.selected_language_name || 'Not selected',
          proficiency_level: response.data.proficiency_level || 'beginner',
          xp: response.data.xp || 0,
          current_streak: response.data.current_streak || 0
        });
      } catch (error) {
        console.error('Error fetching profile data:', error);
        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          toast.error('Failed to load profile data.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  const handleReset = async () => {
    if (!window.confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
      return;
    }

    try {
      const response = await API.post('/profiles/reset/');
      if (response.data.status === 'success') {
        toast.success('Progress reset successfully!');
        // Refresh user data with default values
        const updatedResponse = await API.get('profiles/me/');
        setUserData({
          user: {
            username: updatedResponse.data.user?.username || '',
            email: updatedResponse.data.user?.email || ''
          },
          selected_language_name: updatedResponse.data.selected_language_name || 'Not selected',
          proficiency_level: updatedResponse.data.proficiency_level || 'beginner',
          xp: updatedResponse.data.xp || 0,
          current_streak: updatedResponse.data.current_streak || 0
        });
      }
    } catch (error) {
      toast.error('Failed to reset progress');
      console.error(error);
    }
  };

  const handleLogout = async () => {
    try {
      await API.post('/logout/');
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-pink-50">
        <div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center mb-4">
          <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-pink-600 font-medium">Loading profile...</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
      {/* Header */}
      <header className="flex items-center p-4 bg-white shadow-md sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-pink-100 mr-2"
        >
          <FiArrowLeft className="text-lg text-pink-600" />
        </button>
        <h1 className="text-xl font-bold text-pink-800">My Profile</h1>
      </header>

      {/* Main Content */}
      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        {/* Profile Card */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6 border border-pink-100">
          <div className="flex flex-col items-center mb-6">
            <div className="w-24 h-24 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white text-3xl font-bold mb-4 shadow-lg">
              {userData.user.username.charAt(0).toUpperCase()}
            </div>
            <h2 className="text-xl font-bold text-gray-800">{userData.user.username}</h2>
            <p className="text-gray-500">{userData.user.email}</p>
          </div>

          <div className="space-y-4">
            <div className="flex items-center p-3 bg-pink-50 rounded-lg">
              <div className="p-2 bg-pink-100 rounded-full mr-3">
                <FiGlobe className="text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Learning</p>
                <p className="font-bold text-pink-700">{userData.selected_language_name}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-pink-50 rounded-lg">
              <div className="p-2 bg-pink-100 rounded-full mr-3">
                <FiAward className="text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Proficiency</p>
                <p className="font-bold text-pink-700 capitalize">{userData.proficiency_level}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-pink-50 rounded-lg">
              <div className="p-2 bg-pink-100 rounded-full mr-3">
                <FiZap className="text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Total XP</p>
                <p className="font-bold text-pink-700">{userData.xp}</p>
              </div>
            </div>

            <div className="flex items-center p-3 bg-pink-50 rounded-lg">
              <div className="p-2 bg-pink-100 rounded-full mr-3">
                <FiHeart className="text-pink-600" />
              </div>
              <div>
                <p className="text-sm text-gray-500">Current Streak</p>
                <p className="font-bold text-pink-700">{userData.current_streak} days</p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-3">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/settings')}
            className="w-full flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200"
          >
            <div className="p-2 bg-gray-100 rounded-full mr-3">
              <FiSettings className="text-gray-600" />
            </div>
            <span className="font-medium">Settings</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleReset}
            className="w-full flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 text-red-500"
          >
            <div className="p-2 bg-red-100 rounded-full mr-3">
              <FiRotateCcw className="text-red-500" />
            </div>
            <span className="font-medium">Reset Progress</span>
          </motion.button>

          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleLogout}
            className="w-full flex items-center p-4 bg-white rounded-xl shadow-sm border border-gray-200 text-red-500 mt-6"
          >
            <div className="p-2 bg-red-100 rounded-full mr-3">
              <FiLogOut className="text-red-500" />
            </div>
            <span className="font-medium">Log Out</span>
          </motion.button>
        </div>
      </div>
    </div>
  );
}

export default Profile;