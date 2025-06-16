import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAward, FiHeart, FiShoppingBag, FiUser, FiSettings } from 'react-icons/fi';
import API from '../utils/api';

function Home() {
  const [userData, setUserData] = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('learn');
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        // Fetch user profile data
        const profileResponse = await API.get('profiles/me/');
        setUserData(profileResponse.data);
        
        // Fetch lessons based on user's selected language
        if (profileResponse.data.selected_language) {
          const lessonsResponse = await API.get(`lessons/?language=${profileResponse.data.selected_language}`);
          setLessons(lessonsResponse.data);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        // Redirect to login if not authenticated
        if (error.response?.status === 401) {
          navigate('/login');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [navigate]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <div className="w-10 h-10 border-4 border-green-100 border-t-green-500 rounded-full animate-spin mb-4"></div>
        <p className="text-gray-600">Loading your learning path...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center">
        <h2 className="text-2xl font-bold mb-2">Welcome!</h2>
        <p className="text-gray-600 mb-6">Please complete your profile setup to start learning.</p>
        <button 
          onClick={() => navigate('/wizard')} 
          className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition"
        >
          Complete Setup
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center p-4 bg-white shadow-sm sticky top-0 z-50">
        <div className="flex items-center">
          <div className="w-32 h-5 bg-gray-200 rounded-full relative overflow-hidden">
            <div 
              className="absolute top-0 left-0 h-full bg-green-500" 
              style={{ width: `${userData.xp_progress || 0}%` }}
            ></div>
            <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-xs font-bold text-white">
              {userData.xp || 0} XP
            </span>
          </div>
        </div>
        <div className="flex items-center">
          <img src="/logo.png" alt="Logo" className="h-8" />
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center font-bold text-yellow-500">
            💎 {userData.gems || 0}
          </span>
          <span className="flex items-center font-bold text-red-500">
            ❤️ {userData.hearts || 5}
          </span>
        </div>
      </header>

      {/* User Greeting */}
      <div className="p-6 bg-white mb-4">
        <h1 className="text-2xl font-bold text-gray-800">Hello, {userData.user.username}!</h1>
        <div className="flex items-center mt-2 text-gray-600">
          <span className="text-xl mr-2">🌍</span>
          <span>
            Learning <strong className="text-green-600">{userData.selected_language_name || 'a language'}</strong> at{' '}
            <strong className="text-green-600">{userData.proficiency_level || 'beginner'}</strong> level
          </span>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 p-4 pb-24">
        {/* Daily Goal Progress */}
        <div className="flex justify-between items-center p-4 bg-white rounded-xl shadow-sm mb-6">
          <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16">
              <svg className="w-full h-full" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#e5e7eb"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845
                    a 15.9155 15.9155 0 0 1 0 31.831
                    a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#10b981"
                  strokeWidth="3"
                  strokeDasharray={`${userData.daily_goal_progress || 0}, 100`}
                />
              </svg>
              <span className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-sm font-bold">
                {userData.daily_goal_progress || 0}%
              </span>
            </div>
            <div>
              <h3 className="font-bold text-gray-800">Daily Goal</h3>
              <p className="text-sm text-gray-600">
                {userData.daily_goal_completed || 0}/{userData.daily_goal_target || 5} lessons
              </p>
            </div>
          </div>
          <button className="border-2 border-green-500 text-green-500 font-bold py-1 px-4 rounded-full hover:bg-green-50 transition">
            Extend Streak
          </button>
        </div>

        {/* Learning Path */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Your Learning Path</h2>
          <div className="space-y-3">
            {lessons.length > 0 ? (
              lessons.map((lesson, index) => (
                <div 
                  key={lesson.id} 
                  className={`flex items-center p-4 bg-white rounded-xl shadow-sm hover:shadow-md transition ${index === 0 ? 'border-l-4 border-green-500' : ''}`}
                >
                  <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-full text-xl mr-4">
                    {index === 0 ? '✨' : index % 3 === 0 ? '📖' : index % 2 === 0 ? '🎧' : '✍️'}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-bold text-gray-800">{lesson.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{lesson.content.substring(0, 50)}...</p>
                    <div className="flex space-x-3 mt-2 text-xs text-gray-500">
                      <span>⭐ {lesson.difficulty || 'Beginner'}</span>
                      <span>🕒 {lesson.duration || '5 min'}</span>
                    </div>
                  </div>
                  <button className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded-full transition">
                    Start
                  </button>
                </div>
              ))
            ) : (
              <div className="text-center p-6 bg-white rounded-xl shadow-sm">
                <p className="text-gray-600 mb-4">No lessons available for your selected language.</p>
                <button 
                  onClick={() => navigate('/languages')} 
                  className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded-full transition"
                >
                  Choose a Language
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Practice Section */}
        <div>
          <h2 className="text-xl font-bold text-gray-800 mb-4">Practice</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-blue-500 text-white p-4 rounded-xl">
              <h3 className="font-bold">Speaking</h3>
              <p className="text-sm opacity-90 mt-1">Practice pronunciation</p>
              <button className="mt-3 bg-white bg-opacity-20 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-opacity-30 transition">
                Start
              </button>
            </div>
            <div className="bg-purple-600 text-white p-4 rounded-xl">
              <h3 className="font-bold">Listening</h3>
              <p className="text-sm opacity-90 mt-1">Train your ears</p>
              <button className="mt-3 bg-white bg-opacity-20 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-opacity-30 transition">
                Start
              </button>
            </div>
            <div className="bg-orange-500 text-white p-4 rounded-xl">
              <h3 className="font-bold">Review</h3>
              <p className="text-sm opacity-90 mt-1">Strengthen weak words</p>
              <button className="mt-3 bg-white bg-opacity-20 text-white text-xs font-bold py-1 px-3 rounded-full hover:bg-opacity-30 transition">
                Start
              </button>
            </div>
          </div>
        </div>
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white shadow-lg flex justify-around py-3">
        <button 
          className={`flex flex-col items-center text-xs ${activeTab === 'learn' ? 'text-green-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('learn')}
        >
          <FiAward className="text-xl mb-1" />
          <span>Learn</span>
        </button>
        <button 
          className={`flex flex-col items-center text-xs ${activeTab === 'practice' ? 'text-green-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('practice')}
        >
          <FiHeart className="text-xl mb-1" />
          <span>Practice</span>
        </button>
        <button 
          className={`flex flex-col items-center text-xs ${activeTab === 'shop' ? 'text-green-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('shop')}
        >
          <FiShoppingBag className="text-xl mb-1" />
          <span>Shop</span>
        </button>
        <button 
          className={`flex flex-col items-center text-xs ${activeTab === 'profile' ? 'text-green-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('profile')}
        >
          <FiUser className="text-xl mb-1" />
          <span>Profile</span>
        </button>
        <button 
          className={`flex flex-col items-center text-xs ${activeTab === 'settings' ? 'text-green-500' : 'text-gray-500'}`}
          onClick={() => setActiveTab('settings')}
        >
          <FiSettings className="text-xl mb-1" />
          <span>Settings</span>
        </button>
      </nav>
    </div>
  );
}

export default Home;