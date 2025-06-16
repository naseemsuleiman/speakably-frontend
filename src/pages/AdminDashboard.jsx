import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { 
  FiPlus, FiTrash2, FiEdit, FiUsers, FiBook, 
  FiGlobe, FiRefreshCw, FiAward, FiBarChart2,
  FiCheckCircle, FiXCircle, FiTrendingUp, FiLock, FiUnlock
} from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../utils/api';

const AdminDashboard = () => {
  // State declarations
  const [languages, setLanguages] = useState([]);
  const [units, setUnits] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState({
    languages: false,
    units: false,
    users: false
  });
  
  const [newLanguage, setNewLanguage] = useState('');
  const [newUnit, setNewUnit] = useState({
    language: '',
    title: '',
    icon: '📚',
    order: 0
  });
  const [newLesson, setNewLesson] = useState({
    unit: '',
    title: '',
    content: '',
    lesson_type: 'vocabulary',
    order: 0,
    xp_reward: 10,
    is_unlocked: true
  });
  const [activeTab, setActiveTab] = useState('languages');
  const [searchTerm, setSearchTerm] = useState('');
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [showLessonForm, setShowLessonForm] = useState(false);

  // Lesson types configuration
  const lessonTypes = [
    { value: 'vocabulary', icon: '📖', name: 'Vocabulary' },
    { value: 'grammar', icon: '✍️', name: 'Grammar' },
    { value: 'listening', icon: '🎧', name: 'Listening' },
    { value: 'speaking', icon: '🗣️', name: 'Speaking' },
    { value: 'practice', icon: '🔄', name: 'Practice' }
  ];

  // Fetch data function
  const fetchData = async (endpoint, setData, key) => {
    try {
      setLoading(prev => ({ ...prev, [key]: true }));
      const response = await API.get(endpoint);
      setData(response.data);
    } catch (error) {
      console.error(`Error fetching ${key}:`, error);
      toast.error(`Error fetching ${key}: ${error.message}`);
    } finally {
      setLoading(prev => ({ ...prev, [key]: false }));
    }
  };

  // Fetch all data on component mount
  useEffect(() => {
    fetchData('languages/', setLanguages, 'languages');
    fetchData('units/?include_lessons=true', setUnits, 'units');
    fetchData('profiles/', setUsers, 'users');
  }, []);

  // Add language function
  const handleAddLanguage = async () => {
    if (!newLanguage.trim()) {
      toast.error('Please enter a language name');
      return;
    }
    
    try {
      const response = await API.post('languages/', { name: newLanguage });
      setLanguages([...languages, response.data]);
      setNewLanguage('');
      toast.success('Language added successfully!');
    } catch (error) {
      toast.error(`Error adding language: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Add unit function
  const handleAddUnit = async () => {
    if (!newUnit.language || !newUnit.title) {
      toast.error('Please select a language and enter a title');
      return;
    }
    
    try {
      const response = await API.post('units/', {
        language: newUnit.language,
        title: newUnit.title,
        icon: newUnit.icon,
        order: newUnit.order
      });
      
      setUnits([...units, response.data]);
      setNewUnit({
        language: '',
        title: '',
        icon: '📚',
        order: 0
      });
      setShowUnitForm(false);
      toast.success('Unit added successfully!');
    } catch (error) {
      console.error('Error adding unit:', error);
      toast.error(`Error adding unit: ${error.response?.data?.detail || error.message}`);
    }
  };

  // Add lesson function
 const handleAddLesson = async () => {
  try {
    console.log('Submitting lesson data:', newLesson); // Log the payload
    
    const response = await API.post('lessons/', {
      unit: Number(newLesson.unit),
      title: newLesson.title,
      content: newLesson.content || '', // Ensure content is never null
      lesson_type: newLesson.lesson_type,
      order: Number(newLesson.order) || 0,
      xp_reward: Number(newLesson.xp_reward) || 10,
      is_unlocked: Boolean(newLesson.is_unlocked)
    });
setUnits(prevUnits => 
      prevUnits.map(unit => 
        unit.id === response.data.unit
          ? {
              ...unit,
              lessons: [...(unit.lessons || []), response.data]
            }
          : unit
      )
    );

    // ... success handling ...
  } catch (error) {
    console.error('Full error details:', {
      status: error.response?.status,
      data: error.response?.data,  // This contains the validation errors
      request: error.config?.data
    });
    
    if (error.response?.data) {
      // Display specific validation errors
      Object.entries(error.response.data).forEach(([field, errors]) => {
        toast.error(`${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`);
      });
    } else {
      toast.error('Failed to create lesson: ' + error.message);
    }
  }
};

  // Delete unit function
 const handleDeleteUnit = async (unitId) => {
  try {
    // Add logging to verify the URL being called
    console.log(`Attempting to delete unit at: /api/units/${unitId}/`);
    
    const response = await API.delete(`units/${unitId}/`);
    
    // Check if the deletion was successful
    if (response.status === 204) { // 204 is common for successful DELETE with no content
      setUnits(prevUnits => prevUnits.filter(unit => unit.id !== unitId));
      toast.success('Unit deleted successfully');
    } else {
      throw new Error(`Unexpected response status: ${response.status}`);
    }
  } catch (error) {
    console.error('Detailed error:', {
      message: error.message,
      response: error.response,
      config: error.config
    });
    toast.error(`Error deleting unit: ${error.response?.data?.detail || error.message}`);
  }
};

  // Delete lesson function
  const handleDeleteLesson = async (lessonId) => {
    try {
      await API.delete(`lessons/${lessonId}/`);
      
      // Update the units state to remove the deleted lesson
      setUnits(prevUnits => 
        prevUnits.map(unit => ({
          ...unit,
          lessons: unit.lessons?.filter(lesson => lesson.id !== lessonId)
        }))
      );
      
      toast.success('Lesson deleted successfully');
    } catch (error) {
      toast.error(`Error deleting lesson: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleDeleteUser = async (userId) => {
    try {
      await API.delete(`profiles/${userId}/`);
      await API.delete(`users/${userId}/`);
      setUsers(users.filter(user => user.id !== userId));
      toast.success('User deleted successfully');
    } catch (error) {
      toast.error(`Error deleting user: ${error.response?.data?.detail || error.message}`);
    }
  };

  const toggleLessonLock = async (lessonId, isUnlocked) => {
    try {
      const response = await API.patch(`lessons/${lessonId}/`, {
        is_unlocked: !isUnlocked
      });
      
      setUnits(prevUnits => 
        prevUnits.map(unit => ({
          ...unit,
          lessons: unit.lessons?.map(lesson => 
            lesson.id === lessonId ? response.data : lesson
          )
        }))
      );
      
      toast.success(`Lesson ${isUnlocked ? 'locked' : 'unlocked'} successfully`);
    } catch (error) {
      toast.error(`Error updating lesson: ${error.response?.data?.detail || error.message}`);
    }
  };

  const handleRefresh = () => {
    fetchData('languages/', setLanguages, 'languages');
    fetchData('units/?include_lessons=true', setUnits, 'units');
    fetchData('profiles/', setUsers, 'users');
    toast.info('Data refreshed');
  };

  // Filter data based on search term
  const filteredData = {
    languages: languages.filter(lang => 
      lang.name?.toLowerCase().includes(searchTerm.toLowerCase())
    ),
    units: units.filter(unit => 
      unit.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (unit.language?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    ),
    users: users.filter(user => 
      user.user?.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.selected_language?.name?.toLowerCase().includes(searchTerm.toLowerCase()))
    )
  };

 const UnitLessonStructure = ({ unit }) => {
    const [expanded, setExpanded] = useState(false);
    
    return (
      <div className="mb-6 bg-white rounded-xl shadow-md overflow-hidden">
        <div 
          className="flex items-center justify-between p-4 bg-pink-100 cursor-pointer"
          onClick={() => setExpanded(!expanded)}
        >
          <div className="flex items-center">
            <span className="text-2xl mr-3">{unit.icon}</span>
            <div>
              <h3 className="text-lg font-semibold text-pink-800">{unit.title}</h3>
              <p className="text-sm text-pink-600">
                {unit.language?.name || 'No language assigned'}
              </p>
            </div>
          </div>
          <div className="flex items-center">
            <span className="text-sm text-pink-600 mr-4">
              {unit.lessons?.length || 0} lessons
            </span>
            <div className="flex space-x-2">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteUnit(unit.id);
                }}
                className="text-red-500 hover:text-red-700 p-1 rounded-full hover:bg-red-100"
              >
                <FiTrash2 />
              </button>
              <span className="text-pink-600">
                {expanded ? '▲' : '▼'}
              </span>
            </div>
          </div>
        </div>
        
        {expanded && (
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="font-medium text-pink-800">Lessons in this unit</h4>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setNewLesson(prev => ({ 
                    ...prev, 
                    unit: unit.id,
                    order: unit.lessons ? unit.lessons.length + 1 : 1
                  }));
                  setShowLessonForm(true);
                }}
                className="flex items-center text-sm bg-pink-500 text-white px-3 py-1 rounded-full hover:bg-pink-600"
              >
                <FiPlus className="mr-1" /> Add Lesson
              </button>
            </div>
            
            {unit.lessons?.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {unit.lessons.map(lesson => (
                  <LessonCard 
                    key={lesson.id} 
                    lesson={lesson} 
                    onToggleLock={toggleLessonLock}
                    onDelete={() => handleDeleteLesson(lesson.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="text-center py-4 text-gray-500">
                No lessons in this unit yet
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  // Lesson card component
  const LessonCard = ({ lesson, onToggleLock, onDelete }) => (
    <motion.div 
      whileHover={{ scale: 1.02 }}
      className={`p-4 rounded-lg border ${
        lesson.is_unlocked ? 
          'border-pink-300 hover:bg-pink-50' : 
          'border-gray-300 bg-gray-100'
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <span className="text-xl mr-2">
            {lessonTypes.find(t => t.value === lesson.lesson_type)?.icon}
          </span>
          <h4 className="font-medium">{lesson.title}</h4>
        </div>
        <button 
          onClick={(e) => {
            e.stopPropagation();
            onToggleLock(lesson.id, lesson.is_unlocked);
          }}
          className="text-gray-500 hover:text-pink-700"
        >
          {lesson.is_unlocked ? <FiUnlock /> : <FiLock />}
        </button>
      </div>
      <div className="text-sm text-gray-600 mb-3 line-clamp-2">
        {lesson.content?.substring(0, 100) || 'No content yet'}...
      </div>
      <div className="flex justify-between items-center">
        <span className="text-sm text-pink-600">
          {lesson.xp_reward} XP
        </span>
        <div className="flex space-x-2">
          <button 
            onClick={(e) => {
              e.stopPropagation();
              onDelete();
            }}
            className="text-sm text-red-500 hover:text-red-700"
          >
            <FiTrash2 />
          </button>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setNewLesson({
                ...lesson,
                unit: lesson.unit?.id || lesson.unit
              });
              setShowLessonForm(true);
            }}
            className="text-sm text-pink-500 hover:text-pink-700"
          >
            <FiEdit />
          </button>
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header and refresh button */}
        <div className="flex justify-between items-center mb-8">
          <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-3xl font-bold text-pink-700 flex items-center"
          >
            <FiAward className="mr-2" /> Language Learning Admin
          </motion.h1>
          <button 
            onClick={handleRefresh}
            className="flex items-center gap-2 bg-pink-100 text-pink-700 px-4 py-2 rounded-full hover:bg-pink-200 transition shadow-sm"
          >
            <FiRefreshCw className={`${loading.languages || loading.units || loading.users ? 'animate-spin' : ''}`} />
            Refresh Data
          </button>
        </div>

        {/* Search and Tabs */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div className="flex space-x-1 bg-pink-100 p-1 rounded-full">
              {['languages', 'lessons', 'users'].map((tab) => (
                <motion.button
                  key={tab}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveTab(tab)}
                  className={`px-6 py-2 rounded-full capitalize transition ${
                    activeTab === tab ? 'bg-pink-500 text-white shadow-md' : 'text-pink-700 hover:bg-pink-200'
                  }`}
                >
                  {tab === 'languages' && <FiGlobe className="inline mr-2" />}
                  {tab === 'lessons' && <FiBook className="inline mr-2" />}
                  {tab === 'users' && <FiUsers className="inline mr-2" />}
                  {tab}
                </motion.button>
              ))}
            </div>
            <div className="relative w-full md:w-64">
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-pink-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
              />
              <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-pink-400">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Content Area */}
          <div className="space-y-8">
            {/* Languages Tab */}
            {activeTab === 'languages' && (
              <>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="bg-pink-50 p-6 rounded-xl shadow-inner"
                >
                  <h2 className="text-xl font-semibold text-pink-800 mb-4 flex items-center">
                    <FiPlus className="mr-2" /> Add New Language
                  </h2>
                  <div className="flex gap-3">
                    <input
                      type="text"
                      value={newLanguage}
                      onChange={(e) => setNewLanguage(e.target.value)}
                      placeholder="Language name"
                      className="flex-1 px-4 py-2 border border-pink-200 rounded-full focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-transparent"
                    />
                    <motion.button
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                      onClick={handleAddLanguage}
                      disabled={loading.languages}
                      className="bg-pink-500 text-white px-6 py-2 rounded-full hover:bg-pink-600 disabled:opacity-50 flex items-center gap-2 shadow-md"
                    >
                      <FiPlus /> Add
                    </motion.button>
                  </div>
                </motion.div>

                <div className="bg-white rounded-xl shadow-inner overflow-hidden">
                  <table className="min-w-full divide-y divide-pink-200">
                    <thead className="bg-pink-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Name</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-pink-100">
                      {filteredData.languages.length > 0 ? (
                        filteredData.languages.map((language) => (
                          <motion.tr 
                            key={language.id} 
                            whileHover={{ backgroundColor: 'rgba(249, 168, 212, 0.1)' }}
                            className="hover:bg-pink-50"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FiGlobe className="text-pink-500 mr-2" />
                                <span className="font-medium text-pink-800">{language.name}</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDelete('languages/', language.id, setLanguages, languages)}
                                  className="text-pink-500 hover:text-pink-700 p-2 rounded-full hover:bg-pink-100"
                                >
                                  <FiTrash2 />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-pink-500 hover:text-pink-700 p-2 rounded-full hover:bg-pink-100"
                                >
                                  <FiEdit />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="px-6 py-4 text-center text-gray-500">
                            {loading.languages ? 'Loading languages...' : 'No languages found'}
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </>
            )}

            {/* Lessons Tab */}
            {activeTab === 'lessons' && (
              <>
                <div className="flex justify-between items-center">
                  <h2 className="text-xl font-semibold text-pink-800">Learning Units</h2>
                  <button 
                    onClick={() => setShowUnitForm(true)}
                    className="flex items-center bg-pink-500 text-white px-4 py-2 rounded-full hover:bg-pink-600"
                  >
                    <FiPlus className="mr-1" /> Add Unit
                  </button>
                </div>

                {/* Unit Form */}
                {showUnitForm && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-pink-50 p-6 rounded-xl shadow-inner"
                  >
                    <h3 className="text-lg font-semibold mb-4">Create New Unit</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Language*</label>
                        <select
                          value={newUnit.language}
                          onChange={(e) => setNewUnit({...newUnit, language: e.target.value})}
                          className="w-full p-2 border border-pink-200 rounded-lg"
                          required
                        >
                          <option value="">Select Language</option>
                          {languages.map(lang => (
                            <option key={lang.id} value={lang.id}>{lang.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Title*</label>
                        <input
                          type="text"
                          value={newUnit.title}
                          onChange={(e) => setNewUnit({...newUnit, title: e.target.value})}
                          className="w-full p-2 border border-pink-200 rounded-lg"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Icon</label>
                        <input
                          type="text"
                          value={newUnit.icon}
                          onChange={(e) => setNewUnit({...newUnit, icon: e.target.value})}
                          className="w-full p-2 border border-pink-200 rounded-lg"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Order</label>
                        <input
                          type="number"
                          value={newUnit.order}
                          onChange={(e) => setNewUnit({...newUnit, order: parseInt(e.target.value) || 0})}
                          className="w-full p-2 border border-pink-200 rounded-lg"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                      <button 
                        onClick={() => setShowUnitForm(false)}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddUnit}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                      >
                        Create Unit
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Lesson Form */}
                {showLessonForm && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="bg-pink-50 p-6 rounded-xl shadow-inner mb-6"
                  >
                    <h3 className="text-lg font-semibold mb-4">
                      {newLesson.id ? 'Edit Lesson' : 'Create New Lesson'}
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Unit*</label>
                          <select
                            value={newLesson.unit}
                            onChange={(e) => setNewLesson({...newLesson, unit: e.target.value})}
                            className="w-full p-2 border border-pink-200 rounded-lg"
                            required
                          >
                            <option value="">Select Unit</option>
                            {units.map(unit => (
                              <option key={unit.id} value={unit.id}>
                                {unit.title} ({unit.language?.name || 'No language'})
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Lesson Type*</label>
                          <select
                            value={newLesson.lesson_type}
                            onChange={(e) => setNewLesson({...newLesson, lesson_type: e.target.value})}
                            className="w-full p-2 border border-pink-200 rounded-lg"
                            required
                          >
                            {lessonTypes.map(type => (
                              <option key={type.value} value={type.value}>
                                {type.icon} {type.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">XP Reward</label>
                          <input
                            type="number"
                            min="1"
                            value={newLesson.xp_reward}
                            onChange={(e) => setNewLesson({...newLesson, xp_reward: parseInt(e.target.value) || 10})}
                            className="w-full p-2 border border-pink-200 rounded-lg"
                          />
                        </div>
                        <div className="flex items-center">
                          <input
                            type="checkbox"
                            id="is_unlocked"
                            checked={newLesson.is_unlocked}
                            onChange={(e) => setNewLesson({...newLesson, is_unlocked: e.target.checked})}
                            className="mr-2"
                          />
                          <label htmlFor="is_unlocked" className="text-sm font-medium">
                            Initially Unlocked
                          </label>
                        </div>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Title*</label>
                          <input
                            type="text"
                            value={newLesson.title}
                            onChange={(e) => setNewLesson({...newLesson, title: e.target.value})}
                            className="w-full p-2 border border-pink-200 rounded-lg"
                            required
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Content</label>
                          <textarea
                            value={newLesson.content}
                            onChange={(e) => setNewLesson({...newLesson, content: e.target.value})}
                            rows={5}
                            className="w-full p-2 border border-pink-200 rounded-lg"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Order</label>
                          <input
                            type="number"
                            min="0"
                            value={newLesson.order}
                            onChange={(e) => setNewLesson({...newLesson, order: parseInt(e.target.value) || 0})}
                            className="w-full p-2 border border-pink-200 rounded-lg"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="flex justify-end mt-4 space-x-2">
                      <button 
                        onClick={() => {
                          setShowLessonForm(false);
                          setNewLesson({
                            unit: '',
                            title: '',
                            content: '',
                            lesson_type: 'vocabulary',
                            order: 0,
                            xp_reward: 10,
                            is_unlocked: true
                          });
                        }}
                        className="px-4 py-2 bg-gray-200 rounded-lg hover:bg-gray-300"
                      >
                        Cancel
                      </button>
                      <button 
                        onClick={handleAddLesson}
                        className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                      >
                        {newLesson.id ? 'Update Lesson' : 'Create Lesson'}
                      </button>
                    </div>
                  </motion.div>
                )}

                {/* Units and Lessons List */}
                <div className="space-y-6">
                  {filteredData.units.length > 0 ? (
                    filteredData.units.map(unit => (
                      <UnitLessonStructure key={unit.id} unit={unit} />
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500 bg-white rounded-xl shadow-inner">
                      {loading.units ? 'Loading units...' : 'No units found. Create your first unit!'}
                    </div>
                  )}
                </div>
              </>
            )}

            {/* Users Tab */}
            {activeTab === 'users' && (
              <div className="overflow-x-auto">
                {loading.users ? (
                  <div className="flex justify-center py-10">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-pink-500"></div>
                  </div>
                ) : (
                  <div className="bg-white rounded-xl shadow-inner overflow-hidden">
                    <table className="min-w-full divide-y divide-pink-200">
                      <thead className="bg-pink-50">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">User</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Language</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Progress</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-pink-700 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-pink-100">
                        {filteredData.users.map((user) => (
                          <motion.tr 
                            key={user.id} 
                            whileHover={{ backgroundColor: 'rgba(249, 168, 212, 0.1)' }}
                            className="hover:bg-pink-50"
                          >
                            <td className="px-6 py-4">
                              <div className="flex items-center">
                                <div className="flex-shrink-0 h-10 w-10 rounded-full bg-pink-200 flex items-center justify-center text-pink-700">
                                  {user.user?.username?.charAt(0).toUpperCase() || 'U'}
                                </div>
                                <div className="ml-4">
                                  <div className="text-sm font-medium text-pink-800">{user.user?.username}</div>
                                  <div className="text-sm text-pink-500">{user.user?.email}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <FiGlobe className="text-pink-500 mr-2" />
                                <span>{user.selected_language_name || user.selected_language?.name || 'None'}</span>
                              </div>
                              <div className="text-xs text-pink-500 mt-1">
                                Level: {user.proficiency_level || 'Not specified'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-24 mr-2">
                                  <div className="h-2 bg-pink-200 rounded-full overflow-hidden">
                                    <div 
                                      className="h-full bg-pink-500" 
                                      style={{ width: `${user.progress || 0}%` }}
                                    ></div>
                                  </div>
                                </div>
                                <span className="text-sm text-pink-700">{user.progress || 0}%</span>
                              </div>
                              <div className="text-xs text-pink-500 mt-1">
                                {user.completed_lessons || 0} of {user.total_lessons || 0} lessons
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {user.is_active ? (
                                  <>
                                    <FiCheckCircle className="text-green-500 mr-1" />
                                    <span className="text-green-700">Active</span>
                                  </>
                                ) : (
                                  <>
                                    <FiXCircle className="text-red-500 mr-1" />
                                    <span className="text-red-700">Inactive</span>
                                  </>
                                )}
                              </div>
                              <div className="text-xs text-pink-500 mt-1">
                                Last active: {user.last_login || 'Never'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex space-x-2">
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  onClick={() => handleDeleteUser(user.id)}
                                  className="text-pink-500 hover:text-pink-700 p-2 rounded-full hover:bg-pink-100"
                                >
                                  <FiTrash2 />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-pink-500 hover:text-pink-700 p-2 rounded-full hover:bg-pink-100"
                                >
                                  <FiEdit />
                                </motion.button>
                                <motion.button
                                  whileHover={{ scale: 1.1 }}
                                  whileTap={{ scale: 0.9 }}
                                  className="text-pink-500 hover:text-pink-700 p-2 rounded-full hover:bg-pink-100"
                                >
                                  <FiBarChart2 />
                                </motion.button>
                              </div>
                            </td>
                          </motion.tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;