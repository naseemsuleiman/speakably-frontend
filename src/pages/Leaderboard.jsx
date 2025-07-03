import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { 
  FiAward, 
  FiClock, 
  FiTrendingUp, 
  FiUser,
  FiStar,
  FiZap,
  FiBook
} from 'react-icons/fi';
import { motion } from 'framer-motion';
import Avatar from './Avatar';

export default function Leaderboard({ user }) {
  const [leaderboard, setLeaderboard] = useState([]);
  const [timeLeft, setTimeLeft] = useState('');
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [timeRange, setTimeRange] = useState('week');
  const navigate = useNavigate();

  const calculateTimeLeft = (range) => {
    const now = new Date();
    let resetTime;
    
    if (range === 'week') {
      // Next Monday
      const daysUntilMonday = (7 - now.getDay()) % 7 || 7;
      resetTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + daysUntilMonday,
        0, 0, 0
      );
    } else if (range === 'month') {
      // First day of next month
      resetTime = new Date(
        now.getFullYear(),
        now.getMonth() + 1,
        1,
        0, 0, 0
      );
    } else {
      // Daily - next day
      resetTime = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + 1,
        0, 0, 0
      );
    }
    
    const diff = resetTime - now;
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${days > 0 ? `${days}d ` : ''}${hours}h ${minutes}m`;
  };

  const fetchLeaderboardData = async (range) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch leaderboard data
      const leaderboardRes = await API.get(`/leaderboard/?range=${timeRange}`);
      setLeaderboard(leaderboardRes.data.leaderboard || []);
      
      // Fetch user rank if not included in leaderboard response
      if (!leaderboardRes.data.user_rank) {
        const userRankRes = await API.get('/leaderboard/');
        setUserRank(userRankRes.data);
      } else {
        setUserRank(leaderboardRes.data.user_rank);
      }
      
      setTimeLeft(calculateTimeLeft(range));
    } catch (error) {
      setError('Failed to load leaderboard data. Please try again later.');
      console.error('Error fetching leaderboard:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaderboardData(timeRange);
  }, [timeRange]);

  const getMedalColor = (index) => {
    switch(index) {
      case 0: return 'bg-gradient-to-br from-yellow-400 to-yellow-500';
      case 1: return 'bg-gradient-to-br from-gray-400 to-gray-500';
      case 2: return 'bg-gradient-to-br from-orange-400 to-orange-500';
      default: return 'bg-pink-100';
    }
  };

  const getMedalIcon = (index) => {
    switch(index) {
      case 0: return '🥇';
      case 1: return '🥈';
      case 2: return '🥉';
      default: return index + 1;
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-500">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto p-4 pb-20">
      <div className="bg-white rounded-xl shadow-md p-6 mb-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
          <h2 className="text-xl font-bold flex items-center mb-2 sm:mb-0">
            <FiAward className="mr-2 text-pink-500" /> 
            {timeRange === 'week' ? 'Weekly' : timeRange === 'month' ? 'Monthly' : 'Daily'} Leaderboard
          </h2>
          
          <div className="flex space-x-2 bg-gray-100 p-1 rounded-lg">
            <button
              onClick={() => setTimeRange('day')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === 'day' ? 'bg-white shadow-sm' : ''}`}
            >
              Daily
            </button>
            <button
              onClick={() => setTimeRange('week')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === 'week' ? 'bg-white shadow-sm' : ''}`}
            >
              Weekly
            </button>
            <button
              onClick={() => setTimeRange('month')}
              className={`px-3 py-1 text-sm rounded-md ${timeRange === 'month' ? 'bg-white shadow-sm' : ''}`}
            >
              Monthly
            </button>
          </div>
        </div>
        
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center">
            <FiClock className="mr-1" /> 
            Resets in {timeLeft}
          </div>
          <div className="flex items-center">
            <FiZap className="mr-1 text-yellow-500" />
            <span>Top 3 get bonus XP</span>
          </div>
        </div>
        
        <div className="space-y-3 mb-6">
          {leaderboard.map((user, index) => (
            <motion.div 
              key={user.user_id || index}
              whileHover={{ scale: 1.01 }}
              className={`flex items-center p-3 rounded-lg ${index < 3 ? 'bg-gradient-to-r from-pink-50 to-pink-100 border border-pink-200' : 'bg-gray-50'}`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold ${getMedalColor(index)} text-white`}>
                {getMedalIcon(index)}
              </div>
              
              <div className="flex-1 flex items-center">
                <Avatar username={user.username} size={32} className="mr-2" />
                <div>
                  <div className="font-medium">{user.username}</div>
                  {user.language && (
                    <div className="text-xs text-gray-500 flex items-center">
                      <span className="mr-1">{user.language.icon || '🌍'}</span>
                      {user.language.name}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                <FiTrendingUp className="mr-1 text-pink-500" />
                <span className="font-bold text-pink-700">{user.xp_earned} XP</span>
              </div>
            </motion.div>
          ))}
        </div>
        
        {/* User's Position */}
        {userRank && (
          <div className="bg-gradient-to-r from-pink-50 to-pink-100 rounded-lg p-4 border border-pink-200">
            <h3 className="font-medium text-pink-800 mb-2 flex items-center">
              <FiUser className="mr-1" /> Your Position
            </h3>
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-pink-500 text-white flex items-center justify-center mr-3 font-bold">
                  {userRank.position}
                </div>
                <div>
                  <div className="font-medium">You</div>
                  {userRank.language && (
                    <div className="text-xs text-gray-500 flex items-center">
                      <span className="mr-1">{userRank.language.icon || '🌍'}</span>
                      {userRank.language.name}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex items-center bg-white px-3 py-1 rounded-full shadow-sm">
                <FiTrendingUp className="mr-1 text-pink-500" />
                <span className="font-bold text-pink-700">{userRank.xp_earned} XP</span>
              </div>
            </div>
            
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>0 XP</span>
                <span>{userRank.next_level_xp || 1000} XP</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-pink-400 to-pink-600 h-2 rounded-full" 
                  style={{ 
                    width: `${Math.min(100, (userRank.xp_earned / (userRank.next_level_xp || 1000)) * 100)}%` 
                  }}
                ></div>
              </div>
              {userRank.next_level_xp && (
                <div className="text-xs text-gray-500 mt-1 text-right">
                  {userRank.next_level_xp - userRank.xp_earned} XP to next level
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around py-3 px-4 max-w-4xl mx-auto rounded-t-xl shadow-lg">
        <button 
          onClick={() => navigate('/home')}
          className={`flex flex-col items-center ${window.location.pathname === '/home' ? 'text-pink-600' : 'text-gray-500'}`}
        >
          <div className={`p-2 rounded-full ${window.location.pathname === '/home' ? 'bg-pink-100' : 'bg-gray-100'}`}>
            <FiBook className="text-xl" />
          </div>
          <span className="text-xs mt-1 font-medium">Learn</span>
        </button>
        
        <button 
          onClick={() => navigate('/community')}
          className={`flex flex-col items-center ${window.location.pathname === '/community' ? 'text-pink-600' : 'text-gray-500'}`}
        >
          <div className={`p-2 rounded-full ${window.location.pathname === '/community' ? 'bg-pink-100' : 'bg-gray-100'}`}>
            <FiUser className="text-xl" />
          </div>
          <span className="text-xs mt-1 font-medium">Community</span>
        </button>
        
        <button 
          onClick={() => navigate('/leaderboard')}
          className={`flex flex-col items-center ${window.location.pathname === '/leaderboard' ? 'text-pink-600' : 'text-gray-500'}`}
        >
          <div className={`p-2 rounded-full ${window.location.pathname === '/leaderboard' ? 'bg-pink-100' : 'bg-gray-100'}`}>
            <FiAward className="text-xl" />
          </div>
          <span className="text-xs mt-1 font-medium">Leaderboard</span>
        </button>
        
        <button 
          onClick={() => navigate('/profile')}
          className={`flex flex-col items-center ${window.location.pathname === '/profile' ? 'text-pink-600' : 'text-gray-500'}`}
        >
          <div className={`p-2 rounded-full ${window.location.pathname === '/profile' ? 'bg-pink-100' : 'bg-gray-100'}`}>
            <FiUser className="text-xl" />
          </div>
          <span className="text-xs mt-1 font-medium">Profile</span>
        </button>
      </div>
    </div>
  );
}