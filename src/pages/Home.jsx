import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiChevronRight, FiStar, FiClock, FiVolume2, FiBook,
  FiGlobe, FiCheck, FiUser, FiAward, FiHeart, FiZap,
  FiBell
} from 'react-icons/fi';
import API from '../utils/api';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import LessonModal from '../pages/LessonModal';

function Home() {
  const [userData, setUserData] = useState(null);
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedLesson, setSelectedLesson] = useState(null);
  const [showLessonModal, setShowLessonModal] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [lastLoginDate, setLastLoginDate] = useState(null);
  const navigate = useNavigate();

const showTodayReminderNotification = (notifications) => {
  const today = new Date().toISOString().split('T')[0];

  const todayReminder = notifications.find(n => {
    const dateOnly = new Date(n.created_at).toISOString().split('T')[0];
    return n.notification_type === 'reminder' && dateOnly === today;
  });

  if (todayReminder) {
    toast.info(todayReminder.message || "Don't forget your daily practice! 🧠");
  }
};




  const checkNewDay = () => {
  const today = new Date().toISOString().split('T')[0]; // safer than toDateString
  const lastSeen = localStorage.getItem('lastSeenDate');

  if (lastSeen !== today) {
    localStorage.setItem('lastSeenDate', today);
    refreshDailyProgress(); // only runs when the day changes
  }
};

  const refreshDailyProgress = async () => {
    try {
      await API.post('profiles/reset_daily_progress/');
      refreshData();
      toast.info("New day! Your daily progress has been reset.");
    } catch (error) {
      console.error('Error resetting daily progress:', error);
    }
  };

  const refreshData = async () => {
  try {
    setLoading(true);
    const profileResponse = await API.get('profiles/me/');
    setUserData(profileResponse.data);

    const unitsResponse = await API.get('units/', {
      params: {
        include_lessons: true,
        proficiency: profileResponse.data.proficiency_level,
        language: profileResponse.data.selected_language
      }
    });

    setUnits(unitsResponse.data || []);

    const notificationsResponse = await API.get('notifications/');
    setNotifications(notificationsResponse.data);

    // ✅ Must be inside this try block
    showTodayReminderNotification(notificationsResponse.data);

  } catch (error) {
    console.error('Refresh error:', error);
    toast.error('Failed to refresh data');
    
  } finally {
    setLoading(false);
  }
};


  useEffect(() => {
    const refreshData = async () => {
      try {
        setLoading(true);
        const profileResponse = await API.get('profiles/me/');
        setUserData(profileResponse.data);
        setLastLoginDate(new Date().toDateString());

        const unitsResponse = await API.get('units/', {
          params: {
            include_lessons: true,
            proficiency: profileResponse.data.proficiency_level,
            language: profileResponse.data.selected_language 
          }
        });

        setUnits(unitsResponse.data || []);

        const notificationsResponse = await API.get('notifications/');
        setNotifications(notificationsResponse.data);

      } catch (error) {
        console.error('Error fetching data:', error);
        console.log("Fetched notifications:", notificationsResponse.data);

        if (error.response?.status === 401) {
          navigate('/login');
        } else {
          toast.error('Failed to load user data.');
        }
      } finally {
        setLoading(false);
      }
    };

    refreshData();
    
    const interval = setInterval(checkNewDay, 3600000);
    return () => clearInterval(interval);
  }, [navigate, userData?.selected_language]);

  const handleStartLesson = (lesson) => {
    setSelectedLesson({
      ...lesson,
      exercises: lesson.exercises || [],
      unit_title: units.find(u => u.lessons?.some(l => l.id === lesson.id))?.title || ''
    });
    setShowLessonModal(true);
  };

  const markAsRead = async (id) => {
  try {
    await API.patch(`notifications/${id}/`, { is_read: true });
    refreshData();
  } catch (err) {
    console.error("Failed to mark notification as read", err);
  }
};

  const handleCompleteLesson = async (lessonId, earnedXp) => {
    try {
      const response = await API.post(`lessons/${lessonId}/complete/`, {
        xp_earned: Math.round(Number(earnedXp)) || 10
      });

      if (response.data.status === 'success') {
        const [profileResponse, unitsResponse] = await Promise.all([
          API.get('profiles/me/'),
          API.get('units/', {
            params: {
              include_lessons: true,
              proficiency: userData.proficiency_level,
              language: userData.selected_language
            }
          })
        ]);

        setUserData(profileResponse.data);
        setUnits(unitsResponse.data || []);

        toast.success(
          <div>
            <div className="font-bold">+{earnedXp} XP Earned!</div>
            <div>Daily Progress: {profileResponse.data.daily_goal_completed}/{profileResponse.data.daily_goal_target}</div>
          </div>,
          { autoClose: 3000 }
        );
        
        return true;
      }
      
      toast.error(response.data.error || 'Lesson completion failed');
      return false;
      
    } catch (error) {
      console.error('Complete lesson error:', error);
      toast.error(
        <div>
          <div className="font-bold">Error completing lesson</div>
          <div>{error.response?.data?.error || 'Failed to complete lesson'}</div>
        </div>,
        { autoClose: 5000 }
      );
      return false;
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-pink-50">
        <div className="w-16 h-16 rounded-full bg-pink-200 flex items-center justify-center mb-4">
          <div className="w-10 h-10 border-4 border-pink-100 border-t-pink-500 rounded-full animate-spin"></div>
        </div>
        <p className="text-pink-600 font-medium">Loading your learning journey...</p>
      </div>
    );
  }

  if (!userData) {
    return (
      <div className="flex flex-col items-center justify-center h-screen p-6 text-center bg-pink-50">
        <div className="w-24 h-24 bg-pink-100 rounded-full flex items-center justify-center mb-6">
          <FiGlobe className="text-4xl text-pink-500" />
        </div>
        <h2 className="text-2xl font-bold mb-2 text-pink-800">Welcome!</h2>
        <p className="text-pink-600 mb-6">Let's get started with your language journey</p>
        <motion.button 
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/wizard')} 
          className="bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-8 rounded-full shadow-md transition"
        >
          Get Started
        </motion.button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-pink-50 items-center">
      {/* Top Navigation Bar */}
      <header className="flex justify-between items-center p-4 bg-white shadow-md sticky top-0 z-50 w-full max-w-4xl rounded-b-xl">
        <div className="flex items-center space-x-3">
          <div className="relative">
            <div className="w-10 h-10 bg-gradient-to-br from-pink-500 to-pink-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm">
              {userData.user.username.charAt(0).toUpperCase()}
            </div>
            {userData.current_streak > 0 && (
              <div className="absolute -bottom-1 -right-1 bg-pink-600 text-white text-xs font-bold px-1.5 py-0.5 rounded-full border-2 border-white shadow-sm">
                {userData.current_streak}
              </div>
            )}
          </div>
          <div className="flex flex-col">
            <span className="text-xs text-gray-500">Learning</span>
            <span className="font-bold text-pink-700">{userData.selected_language_name}</span>
          </div>
        </div>
        
        <div className="flex items-center space-x-4">
          <div className="flex items-center bg-pink-100 rounded-full px-3 py-1 shadow-inner border border-pink-200">
            <FiZap className="text-pink-600 mr-1" />
            <span className="font-bold text-pink-700">{userData.xp || 0}</span>
          </div>
          
          {/* Notifications */}
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-full hover:bg-pink-100 transition"
            >
              <FiBell className="text-xl text-pink-600" />
              {notifications.length > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center shadow-md">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 mt-2 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                <div className="p-3 border-b border-gray-200 font-semibold text-gray-700">
                  Notifications
                </div>
                <div className="max-h-60 overflow-y-auto">
                  {notifications.length > 0 ? (
                    notifications.map((notification) => (
                      <div key={notification.id} className="p-3 border-b border-gray-100 hover:bg-pink-50 cursor-pointer">
                        <div className="font-medium text-gray-800">{notification.title}</div>
                        <div className="text-sm text-gray-600">{notification.message}</div>
                        <div className="text-xs text-gray-400 mt-1">
                          {new Date(notification.created_at).toLocaleString()}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-4 text-center text-gray-500">No new notifications</div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <div className="w-full max-w-4xl px-4 flex flex-col items-center pb-20">
        {/* User Greeting */}
        <motion.div 
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.5 }}
          className="w-full mt-4 p-4 bg-gradient-to-r from-pink-500 to-pink-400 text-white rounded-xl shadow-lg relative overflow-hidden"
        >
          <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-white bg-opacity-10 rounded-full"></div>
          <div className="absolute -right-8 -bottom-8 w-32 h-32 bg-white bg-opacity-5 rounded-full"></div>
          <h1 className="text-2xl font-bold relative z-10">Hello, {userData.user.username}!</h1>
          <p className="text-sm opacity-90 relative z-10">Ready for your next lesson?</p>
        </motion.div>

        {/* Daily Goal Progress */}
        <motion.div 
          whileHover={{ y: -2 }}
          className="w-full mt-6 bg-white rounded-xl shadow-lg p-4 border border-pink-100"
        >
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-bold text-gray-800 flex items-center">
              <FiStar className="text-pink-500 mr-2" /> Daily Goal
            </h3>
            <span className="text-sm font-bold bg-pink-100 text-pink-700 px-2 py-1 rounded-full">
              {userData.daily_goal_completed || 0}/{userData.daily_goal_target || 5}
            </span>
          </div>
          <div className="relative w-full h-4 bg-gray-100 rounded-full overflow-hidden shadow-inner">
            <div 
              className="absolute top-0 left-0 h-full bg-gradient-to-r from-pink-400 to-pink-600 rounded-full" 
              style={{ width: `${userData.daily_goal_progress || 0}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-3 text-xs text-gray-500">
            <span className="flex items-center">
              <FiAward className="mr-1" /> Streak: {userData.current_streak || 0} days
            </span>
            <span>{userData.daily_goal_progress || 0}% complete</span>
          </div>
        </motion.div>

        {/* Learning Path */}
        <div className="w-full mt-6">
          <h2 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
            <FiBook className="text-pink-500 mr-2" /> Your Learning Path
          </h2>
          
          {units.length > 0 ? (
            <div className="space-y-6">
              {units.map((unit) => (
                <div key={unit.id} className="bg-white rounded-xl shadow-md overflow-hidden border border-pink-100">
                  {/* Unit Header */}
                  <div className="p-4 bg-gradient-to-r from-pink-500 to-pink-400 text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full opacity-10 bg-white"></div>
                    <div className="flex justify-between items-center relative z-10">
                      <div className="flex items-center">
                        <span className="text-2xl mr-3 bg-white bg-opacity-20 p-2 rounded-lg">
                          {unit.icon || <FiBook />}
                        </span>
                        <h3 className="font-bold">{unit.title}</h3>
                      </div>
                      <span className="text-sm bg-white bg-opacity-20 px-3 py-1 rounded-full font-medium">
                        {unit.lessons?.filter(l => l.is_completed).length || 0}/{unit.lessons?.length || 0}
                      </span>
                    </div>
                  </div>
                  
                  {/* Lessons List */}
                  <div className="p-4">
                    {unit.lessons?.length > 0 ? (
                      <div className="grid grid-cols-1 gap-3">
                        {unit.lessons.map((lesson) => (
                          <motion.div 
                            key={lesson.id}
                            whileHover={{ scale: lesson.is_unlocked ? 1.02 : 1 }}
                            className={`relative flex items-center p-3 rounded-lg transition-all ${
                              lesson.is_completed ? 'bg-green-50 border border-green-200' : 
                              lesson.is_unlocked ? 'bg-white border border-pink-100 hover:border-pink-300 shadow-sm' : 
                              'bg-gray-50 border border-gray-200 opacity-70'
                            }`}
                          >
                            {lesson.is_completed && (
                              <div className="absolute top-0 right-0 -mt-2 -mr-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full shadow-md">
                                <FiCheck />
                              </div>
                            )}
                            
                            <div className={`flex items-center justify-center w-10 h-10 rounded-lg mr-3 shadow-sm ${
                              lesson.is_completed ? 'bg-green-100 text-green-600' :
                              lesson.is_unlocked ? 'bg-gradient-to-br from-pink-100 to-pink-200 text-pink-600' : 
                              'bg-gray-200 text-gray-500'
                            }`}>
                              {lesson.is_completed ? <FiCheck /> : <FiBook />}
                            </div>
                            <div className="flex-1">
                              <h3 className={`font-bold ${
                                lesson.is_completed ? 'text-green-800' : 
                                lesson.is_unlocked ? 'text-gray-800' : 'text-gray-500'
                              }`}>
                                {lesson.title}
                              </h3>
                              <div className="flex space-x-3 mt-1 text-xs">
                                <span className={`flex items-center ${
                                  lesson.is_completed ? 'text-green-600' : 
                                  lesson.is_unlocked ? 'text-pink-500' : 'text-gray-400'
                                }`}>
                                  <FiStar className="mr-1" /> {lesson.xp_reward || 10} XP
                                </span>
                                <span className={`flex items-center ${
                                  lesson.is_completed ? 'text-green-600' : 
                                  lesson.is_unlocked ? 'text-pink-500' : 'text-gray-400'
                                }`}>
                                  <FiClock className="mr-1" /> 5 min
                                </span>
                              </div>
                            </div>
                            <motion.button 
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              disabled={!lesson.is_unlocked}
                              className={`p-2 rounded-lg ${
                                lesson.is_unlocked ? 
                                  'text-white bg-gradient-to-br from-pink-500 to-pink-600 shadow-md hover:shadow-lg' : 
                                  'text-gray-400 bg-gray-200'
                              }`}
                              onClick={() => handleStartLesson(lesson)}
                            >
                              <FiChevronRight />
                            </motion.button>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center p-4 text-gray-500">
                        No lessons in this unit yet
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center p-6 bg-white rounded-xl shadow-md border border-pink-100">
              <div className="w-20 h-20 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
                <FiGlobe className="text-3xl text-pink-500" />
              </div>
              <p className="text-gray-600 mb-4">No learning content available yet.</p>
              <motion.button 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => navigate('/wizard')} 
                className="bg-gradient-to-r from-pink-500 to-pink-600 hover:from-pink-600 hover:to-pink-700 text-white font-bold py-2 px-6 rounded-full shadow-md transition"
              >
                Choose a Language
              </motion.button>
            </div>
          )}
        </div>
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-4 max-w-4xl mx-auto rounded-t-xl shadow-lg">
        <button className="flex flex-col items-center text-pink-600 relative">
          <div className="p-2 bg-pink-100 rounded-full">
            <FiBook className="text-xl" />
          </div>
          <span className="text-xs mt-1 font-medium">Learn</span>
          <div className="absolute -top-1 -right-1 w-3 h-3 bg-pink-500 rounded-full"></div>
        </button>
        <button className="flex flex-col items-center text-gray-500 hover:text-pink-500 transition">
          <div className="p-2 bg-gray-100 rounded-full hover:bg-pink-100">
            <FiAward className="text-xl" />
          </div>
          <span className="text-xs mt-1 font-medium">Leaderboard</span>
        </button>
        <button 
          className="flex flex-col items-center text-gray-500 hover:text-pink-500 transition"
          onClick={() => navigate('/profile')}
        >
          <div className="p-2 bg-gray-100 rounded-full hover:bg-pink-100">
            <FiUser className="text-xl" />
          </div>
          <span className="text-xs mt-1 font-medium">Profile</span>
        </button>
      </div>

      {/* Lesson Modal */}
      {showLessonModal && selectedLesson && (
        <LessonModal
          key={selectedLesson.id}
          lesson={selectedLesson}
          onClose={() => {
            setShowLessonModal(false);
            setSelectedLesson(null);
          }}
          onComplete={handleCompleteLesson}
        />
      )}
    </div>
  );
}

export default Home;