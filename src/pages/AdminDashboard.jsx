// AdminDashboard.jsx (updated)
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiUsers, FiBook, FiGlobe,FiTrash2, FiEdit } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../utils/api';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState({ units: false, users: false, languages: false });
  const [activeTab, setActiveTab] = useState('units');

  useEffect(() => {
    fetchData('units/?include_lessons=true', setUnits, 'units');
    fetchData('profiles/', setUsers, 'users');
    fetchData('languages/', setLanguages, 'languages');
  }, []);

  
  const fetchData = async (endpoint, setData, key) => {
    try {
      setLoading(prev => ({ ...prev, [key]: true }));
      const response = await API.get(endpoint);

      if (key === 'users') {
        // Remove the filter to show all users including staff/admins
        setData(response.data);
      } else {
        setData(response.data);
      }
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      let errorMessage = `Failed to load ${key}`;
      
      if (error.response) {
        if (error.response.data) {
          console.error('Error details:', error.response.data);
          errorMessage = error.response.data.error || 
                        error.response.data.detail || 
                        errorMessage;
        }
      } else if (error.request) {
        errorMessage = "No response from server - check your connection";
      }
      
      toast.error(errorMessage);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Format date to handle invalid dates
  const formatDate = (dateString) => {
  if (!dateString) return 'Never';
  try {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      console.warn('Invalid date:', dateString);
      return 'Invalid date';
    }
    return date.toLocaleDateString();
  } catch {
    return 'Invalid date';
  }
};

  // Format datetime to handle invalid dates
  const formatDateTime = (dateString) => {
    if (!dateString) return 'Never';
    try {
      const date = new Date(dateString);
      return isNaN(date.getTime()) ? 'Never' : date.toLocaleString();
    } catch {
      return 'Never';
    }
  };

  const handleDeleteUnit = async (unitId) => {
    if (window.confirm('Delete this unit and all its lessons?')) {
      try {
        await API.delete(`units/${unitId}/`);
        setUnits(prev => prev.filter(unit => unit.id !== unitId));
        toast.success('Unit deleted');
      } catch (error) {
        toast.error('Failed to delete unit');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Permanently delete this user?')) {
      try {
        await API.delete(`users/${userId}/`);
        setUsers(prev => prev.filter(user => user.user.id !== userId));
        toast.success('User deleted');
      } catch (error) {
        toast.error('Failed to delete user');
      }
    }
  };

  const handleDeleteLanguage = async (languageId) => {
    if (window.confirm('Delete this language?')) {
      try {
        await API.delete(`languages/${languageId}/`);
        setLanguages(prev => prev.filter(lang => lang.id !== languageId));
        toast.success('Language deleted');
      } catch (error) {
        toast.error('Failed to delete language');
      }
    }
    
  };
  

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-pink-700">Admin Dashboard</h1>
          {activeTab === 'units' && (
            <button 
              onClick={() => navigate('/admin/units/new')}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FiPlus className="mr-2" /> Add Unit
            </button>
          )}
          {activeTab === 'languages' && (
            <button 
              onClick={() => navigate('/admin/languages/new')}
              className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center"
            >
              <FiPlus className="mr-2" /> Add Language
            </button>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex space-x-1 bg-pink-100 p-1 rounded-full mb-6">
            {['units', 'users', 'languages'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-full capitalize transition ${
                  activeTab === tab ? 'bg-pink-500 text-white shadow-md' : 'text-pink-700 hover:bg-pink-200'
                }`}
              >
                {tab === 'units' && <FiBook className="inline mr-2" />}
                {tab === 'users' && <FiUsers className="inline mr-2" />}
                {tab === 'languages' && <FiGlobe className="inline mr-2" />}
                {tab}
              </button>
            ))}
          </div>

          {activeTab === 'units' && (
            <div className="space-y-6">
              {units.length > 0 ? (
                units.map(unit => (
                  <div key={unit.id} className="bg-white rounded-xl shadow-sm border border-pink-100 p-4">
                    <div className="flex justify-between items-center mb-2">
                      <h2 className="text-xl font-semibold text-pink-800">
                        {unit.icon} {unit.title}
                      </h2>
                      <div className="flex space-x-2">
                        <button 
                          onClick={() => navigate(`/admin/units/edit/${unit.id}`)}
                          className="text-pink-600 hover:text-pink-800"
                        >
                          Edit
                        </button>
                        <button 
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    <p className="text-pink-600 mb-3">
                      {unit.language?.name} • {unit.lessons?.length || 0} lessons
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                      {unit.lessons?.slice(0, 3).map(lesson => (
                        <div key={lesson.id} className="p-2 bg-pink-50 rounded">
                          <p className="font-medium">{lesson.title}</p>
                          <p className="text-sm text-pink-600">{lesson.lesson_type}</p>
                        </div>
                      ))}
                      {unit.lessons?.length > 3 && (
                        <div className="p-2 bg-pink-100 rounded text-center">
                          +{unit.lessons.length - 3} more
                        </div>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {loading.units ? 'Loading...' : 'No units found'}
                </div>
              )}
            </div>
          )}

          {activeTab === 'users' && (
          <div className="overflow-x-auto">
            {users.length > 0 ? (
              <table className="min-w-full divide-y divide-pink-200">
                <thead className="bg-pink-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">User</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Joined</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Last Active</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Language</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Daily Progress</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Actions</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-pink-100">
                  {users.map(user => (
                    
                    <tr key={user.user?.id}>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-700">
                            {user.user?.username?.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-pink-800">{user.user?.username}</div>
                            <div className="text-sm text-pink-500">{user.user?.email}</div>
                            <div className="text-xs mt-1">
                              <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                                ${user.user?.is_staff ? 'bg-purple-100 text-purple-800' : 'bg-gray-100 text-gray-800'}`}>
                                {user.user?.is_staff ? 'Admin' : 'User'}
                              </span>
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-pink-800">
                          {formatDate(user.user?.date_joined)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-pink-800">
                          {formatDateTime(user.user?.last_login)}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <span className="mr-2">{user.selected_language_icon}</span>
                          <span>{user.selected_language_name || 'None'}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex flex-col space-y-1">
                          <div className="flex justify-between text-xs text-pink-700 font-semibold">
                            <span>Progress</span>
                            <span>{user.daily_goal_completed || 0}/{user.daily_goal || 0}</span>
                          </div>
                          <div className="w-full bg-pink-100 rounded-full h-2">
                            <div 
                              className="bg-pink-500 h-2 rounded-full transition-all" 
                              style={{ width: `${user.daily_goal_progress || 0}%` }}
                            ></div>
                          </div>
                          <div className="text-xs text-pink-500 mt-1 italic">
                            🔥 Streak: {user.current_streak || 0} day{user.current_streak !== 1 ? 's' : ''}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <button
                          onClick={() => handleDeleteUser(user.user.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-8 text-gray-500">
                {loading.users ? 'Loading...' : 'No users found'}
              </div>
            )}
          </div>
        )}
      
          
          {activeTab === 'languages' && (
            <div className="space-y-4">
              <div className="flex justify-end">
                <button 
                  onClick={() => navigate('/admin/languages/new')}
                  className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg flex items-center mb-4"
                >
                  <FiPlus className="mr-2" /> Add Language
                </button>
              </div>
              
              {languages.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {languages.map(language => (
                    <div key={language.id} className="bg-white rounded-xl shadow-sm border border-pink-100 p-4">
                      <div className="flex justify-between items-center mb-2">
                        <h2 className="text-xl font-semibold text-pink-800">
                          {language.name}
                        </h2>
                        <div className="flex space-x-2">
                          <button 
                            onClick={() => navigate(`/admin/languages/edit/${language.id}`)}
                            className="text-pink-600 hover:text-pink-800 p-1"
                          >
                            <FiEdit />
                          </button>
                          <button 
                            onClick={() => handleDeleteLanguage(language.id)}
                            className="text-red-500 hover:text-red-700 p-1"
                          >
                            <FiTrash2 />
                          </button>
                        </div>
                      </div>
                      <p className="text-pink-600 mb-1">Code: {language.code}</p>
                      <p className="text-pink-600">Flag: {language.flag}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  {loading.languages ? 'Loading...' : 'No languages found'}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;