import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiTrash2, FiChevronLeft, FiVolume2, FiImage, FiCheck } from 'react-icons/fi';
import { toast } from 'react-toastify';
import API from '../utils/api';

const UnitCreationPage = () => {
  const navigate = useNavigate();
  const [languages, setLanguages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [unitData, setUnitData] = useState({
    language: '',
    title: '',
    icon: '📚',
    order: 0,
    proficiency: 'beginner'
  });
  
  const [lessons, setLessons] = useState([]);
  const [currentLesson, setCurrentLesson] = useState({
    title: '',
    description: '',
    exercises: []
  });
  
  const [currentExercise, setCurrentExercise] = useState({
    type: 'word_with_audio',
    word: '',
    translation: '',
    audioUrl: '',
    images: [],
    options: [],
    correctAnswer: ''
  });

  const proficiencyLevels = ['beginner', 'intermediate', 'advanced'];

  const exerciseTypes = [
    { value: 'word_with_audio', name: 'Word with Audio' },
    { value: 'image_selection', name: 'Image Selection' },
    { value: 'pronunciation', name: 'Pronunciation' },
    { value: 'matching', name: 'Matching Quiz' }
  ];

  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        setLoading(true);
        const response = await API.get('languages/');
        setLanguages(response.data);
      } catch (error) {
        toast.error('Failed to load languages');
      } finally {
        setLoading(false);
      }
    };
    fetchLanguages();
  }, []);

  const handleUnitChange = (e) => {
    const { name, value } = e.target;
    setUnitData(prev => ({ ...prev, [name]: value }));
  };

  const handleLessonChange = (e) => {
    const { name, value } = e.target;
    setCurrentLesson(prev => ({ ...prev, [name]: value }));
  };

  const handleExerciseChange = (e) => {
    const { name, value } = e.target;
    setCurrentExercise(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (e, index) => {
    const file = e.target.files[0];
    if (!file) return;

    try {
      setUploading(true);
      const formData = new FormData();
      formData.append('image', file);

      const response = await API.post('upload-image/', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      const newImages = [...currentExercise.images];
      newImages[index] = {
        ...newImages[index],
        url: response.data.url
      };
      setCurrentExercise({ ...currentExercise, images: newImages });
    } catch (error) {
      toast.error('Failed to upload image');
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const addImageUrl = () => {
    setCurrentExercise(prev => ({
      ...prev,
      images: [...prev.images, { url: '', isCorrect: false, file: null }]
    }));
  };

  const handleImageChange = (index, field, value) => {
    const newImages = [...currentExercise.images];
    newImages[index][field] = field === 'isCorrect' ? value === 'true' : value;
    setCurrentExercise({ ...currentExercise, images: newImages });
  };

  const removeImage = (index) => {
    const newImages = [...currentExercise.images];
    newImages.splice(index, 1);
    setCurrentExercise({ ...currentExercise, images: newImages });
  };

  const addMatchingOption = () => {
    setCurrentExercise(prev => ({
      ...prev,
      options: [...prev.options, { word: '', translation: '' }]
    }));
  };

  const handleMatchingOptionChange = (index, field, value) => {
    const newOptions = [...currentExercise.options];
    newOptions[index] = {
      ...newOptions[index],
      [field]: value
    };
    setCurrentExercise({ ...currentExercise, options: newOptions });
  };

  const removeMatchingOption = (index) => {
    const newOptions = [...currentExercise.options];
    newOptions.splice(index, 1);
    setCurrentExercise({ ...currentExercise, options: newOptions });
  };

  const addExerciseToLesson = () => {
    if (!currentExercise.word && currentExercise.type !== 'matching') {
      toast.error('Word is required');
      return;
    }
    if (!currentExercise.translation && currentExercise.type !== 'matching') {
      toast.error('Translation is required');
      return;
    }
    if ((currentExercise.type === 'word_with_audio' || currentExercise.type === 'pronunciation') && !currentExercise.audioUrl) {
      toast.error('Audio URL is required for this exercise type');
      return;
    }
    if (currentExercise.type === 'image_selection' && currentExercise.images.length < 4) {
      toast.error('Please add exactly 4 images');
      return;
    }
    if (currentExercise.type === 'image_selection' && currentExercise.images.some(img => !img.url)) {
      toast.error('Please upload all images');
      return;
    }
    if (currentExercise.type === 'matching' && currentExercise.options.length < 2) {
      toast.error('Please add at least 2 matching pairs');
      return;
    }

    const exerciseToAdd = {
    ...currentExercise,
    xpReward: currentExercise.type === 'word_with_audio' ? 5 :
              currentExercise.type === 'image_selection' ? 10 :
              currentExercise.type === 'pronunciation' ? 15 :
              currentExercise.type === 'matching' ? 20 : 5,
    preferredVoice: unitData.preferredVoice // Add this if you have voice selection at unit level
  };

  setCurrentLesson(prev => ({
    ...prev,
    exercises: [...prev.exercises, exerciseToAdd]
  }));

  // Reset exercise state
  setCurrentExercise({
    type: 'word_with_audio',
    word: '',
    translation: '',
    audioUrl: '',
    images: [],
    options: [],
    correctAnswer: ''
  });

    toast.success('Exercise added to lesson!');
  };

  const saveLesson = () => {
  if (!currentLesson.title) {
    toast.error('Lesson title is required');
    return;
  }
  if (currentLesson.exercises.length === 0) {
    toast.error('Please add at least one exercise');
    return;
  }

  // Check for duplicate lesson titles
  if (lessons.some(l => l.title === currentLesson.title)) {
    toast.error('Lesson title must be unique within this unit');
    return;
  }

  // Create a new lesson object to avoid reference issues
  const newLesson = {
    title: currentLesson.title.trim(),
    description: currentLesson.description.trim(),
    exercises: currentLesson.exercises.map(ex => ({
      ...ex,
      word: ex.word.trim(),
      translation: ex.translation.trim()
    }))
  };

  setLessons(prev => [...prev, newLesson]);
  
  // Reset current lesson
  setCurrentLesson({
    title: '',
    description: '',
    exercises: []
  });

  toast.success('Lesson added to unit!');
};

  const submitUnit = async () => {
  try {
    setLoading(true);

    // Validate required fields
    if (!unitData.language) {
      toast.error('Please select a language');
      setLoading(false);
      return;
    }

    if (lessons.length === 0) {
      toast.error('Please add at least one lesson');
      setLoading(false);
      return;
    }

    // Prepare payload with better error checking
    const payload = {
      language_id: Number(unitData.language),
      title: unitData.title.trim(),
      icon: unitData.icon || '📚',
      order: Number(unitData.order) || 0,
      proficiency: unitData.proficiency || 'beginner',
      lessons: lessons.map((lesson, lessonIndex) => {
        // Validate each lesson
        if (!lesson.title || lesson.exercises.length === 0) {
          throw new Error(`Lesson ${lessonIndex + 1} is missing title or exercises`);
        }

        return {
          title: lesson.title.trim(),
          description: (lesson.description || '').trim(),
          lesson_type: 'vocabulary', // Make sure this matches your backend expectations
          order: lessonIndex,
          exercises: lesson.exercises.map((exercise, exIndex) => {
            // Basic exercise validation
            if (exercise.type === 'word_with_audio' && (!exercise.word || !exercise.translation)) {
              throw new Error(`Exercise ${exIndex + 1} in lesson "${lesson.title}" is missing required fields`);
            }

            return {
              exercise_type: exercise.type,
              order: exIndex,
              xp_reward: Number(exercise.xpReward) || 10,
              word: (exercise.word || '').trim(),
              translation: (exercise.translation || '').trim(),
              ...(exercise.audioUrl && { audio_url: exercise.audioUrl.trim() }),
              ...(exercise.images && {
                images: exercise.images.map(img => ({
                  url: img.url.trim(),
                  is_correct: Boolean(img.isCorrect)
                }))
              }),
              ...(exercise.options && {
                options: exercise.options.map(opt => ({
                  word: (opt.word || '').trim(),
                  translation: (opt.translation || '').trim()
                }))
              })
            };
          })
        };
      })
    };

    console.log('Final payload being sent:', JSON.stringify(payload, null, 2));

    const response = await API.post('units/', payload);
    toast.success('Unit created successfully!');
    navigate('/admin');
  } catch (error) {
    console.error('Error details:', error);
    
    if (error.message) {
      toast.error(error.message);
    } else if (error.response?.data?.error?.includes('unique')) {
      toast.error('Please ensure all lesson titles are unique within this unit');
    } else if (error.response?.data?.error?.includes('language_id')) {
      toast.error('Language is required for creating a unit');
    } else {
      toast.error('Failed to create unit. Please check all required fields.');
    }
  } finally {
    setLoading(false);
  }
};
  const renderExerciseFields = () => {
    switch (currentExercise.type) {
      case 'word_with_audio':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Word*</label>
              <input
                type="text"
                name="word"
                value={currentExercise.word}
                onChange={handleExerciseChange}
                className="w-full p-2 border border-pink-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Translation*</label>
              <input
                type="text"
                name="translation"
                value={currentExercise.translation}
                onChange={handleExerciseChange}
                className="w-full p-2 border border-pink-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Audio URL*</label>
              <div className="flex">
                <input
                  type="text"
                  name="audioUrl"
                  value={currentExercise.audioUrl}
                  onChange={handleExerciseChange}
                  className="flex-1 p-2 border border-pink-200 rounded-l-lg"
                  placeholder="Paste audio URL"
                  required
                />
                <button className="bg-pink-500 text-white p-2 rounded-r-lg">
                  <FiVolume2 />
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'image_selection':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Word*</label>
              <input
                type="text"
                name="word"
                value={currentExercise.word}
                onChange={handleExerciseChange}
                className="w-full p-2 border border-pink-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Translation*</label>
              <input
                type="text"
                name="translation"
                value={currentExercise.translation}
                onChange={handleExerciseChange}
                className="w-full p-2 border border-pink-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-2">Images (Exactly 4, one correct)*</label>
              {currentExercise.images.map((image, index) => (
                <div key={index} className="flex mb-2">
                  <div className="flex-1 flex">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, index)}
                      className="hidden"
                      id={`image-upload-${index}`}
                    />
                    <label
                      htmlFor={`image-upload-${index}`}
                      className="flex-1 p-2 border border-pink-200 rounded-l-lg cursor-pointer bg-white"
                    >
                      {image.url ? 'Change Image' : 'Upload Image'}
                    </label>
                    {image.url && (
                      <span className="flex items-center px-2 border-t border-b border-pink-200 text-sm text-gray-600">
                        Uploaded
                      </span>
                    )}
                  </div>
                  <select
                    value={image.isCorrect ? 'true' : 'false'}
                    onChange={(e) => handleImageChange(index, 'isCorrect', e.target.value)}
                    className="border-t border-b border-pink-200 px-2"
                  >
                    <option value="false">Incorrect</option>
                    <option value="true">Correct</option>
                  </select>
                  <button 
                    onClick={() => removeImage(index)}
                    className="bg-red-500 text-white p-2 rounded-r-lg"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
              {currentExercise.images.length < 4 && (
                <button 
                  onClick={addImageUrl}
                  className="text-pink-600 hover:text-pink-800 text-sm flex items-center mt-1"
                >
                  <FiPlus className="mr-1" /> Add Image
                </button>
              )}
            </div>
          </div>
        );
      
      case 'pronunciation':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Word*</label>
              <input
                type="text"
                name="word"
                value={currentExercise.word}
                onChange={handleExerciseChange}
                className="w-full p-2 border border-pink-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Translation*</label>
              <input
                type="text"
                name="translation"
                value={currentExercise.translation}
                onChange={handleExerciseChange}
                className="w-full p-2 border border-pink-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Audio URL*</label>
              <div className="flex">
                <input
                  type="text"
                  name="audioUrl"
                  value={currentExercise.audioUrl}
                  onChange={handleExerciseChange}
                  className="flex-1 p-2 border border-pink-200 rounded-l-lg"
                  placeholder="Paste audio URL"
                  required
                />
                <button className="bg-pink-500 text-white p-2 rounded-r-lg">
                  <FiVolume2 />
                </button>
              </div>
            </div>
          </div>
        );
      
      case 'matching':
        return (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Title*</label>
              <input
                type="text"
                name="word"
                value={currentExercise.word}
                onChange={handleExerciseChange}
                className="w-full p-2 border border-pink-200 rounded-lg"
                placeholder="E.g., 'Match the words'"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-2">Matching Pairs*</label>
              {currentExercise.options.map((option, index) => (
                <div key={index} className="flex mb-2 space-x-2">
                  <input
                    type="text"
                    value={option.word || ''}
                    onChange={(e) => handleMatchingOptionChange(index, 'word', e.target.value)}
                    className="flex-1 p-2 border border-pink-200 rounded-lg"
                    placeholder="Word"
                    required
                  />
                  <input
                    type="text"
                    value={option.translation || ''}
                    onChange={(e) => handleMatchingOptionChange(index, 'translation', e.target.value)}
                    className="flex-1 p-2 border border-pink-200 rounded-lg"
                    placeholder="Translation"
                    required
                  />
                  <button 
                    onClick={() => removeMatchingOption(index)}
                    className="bg-red-500 text-white p-2 rounded-lg"
                  >
                    <FiTrash2 size={16} />
                  </button>
                </div>
              ))}
              <button 
                onClick={addMatchingOption}
                className="text-pink-600 hover:text-pink-800 text-sm flex items-center mt-1"
              >
                <FiPlus className="mr-1" /> Add Matching Pair
              </button>
            </div>
          </div>
        );
      
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <button 
            onClick={() => navigate('/admin')}
            className="flex items-center text-pink-600 hover:text-pink-800"
          >
            <FiChevronLeft className="mr-1" /> Back to Dashboard
          </button>
          <h1 className="text-2xl font-bold text-pink-700">Create New Unit</h1>
          <button 
            onClick={submitUnit}
            disabled={loading}
            className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Unit'}
          </button>
        </div>

        {/* Unit Information */}
        <div className="mb-8 p-4 border border-pink-200 rounded-lg">
          <h2 className="text-xl font-semibold text-pink-800 mb-4">Unit Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Language*</label>
              <select
                name="language"
                value={unitData.language}
                onChange={handleUnitChange}
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
              <label className="block text-sm font-medium text-pink-700 mb-1">Title*</label>
              <input
                type="text"
                name="title"
                value={unitData.title}
                onChange={handleUnitChange}
                className="w-full p-2 border border-pink-200 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Proficiency Level</label>
              <select
                name="proficiency"
                value={unitData.proficiency}
                onChange={handleUnitChange}
                className="w-full p-2 border border-pink-200 rounded-lg"
              >
                {proficiencyLevels.map(level => (
                  <option key={level} value={level}>{level.charAt(0).toUpperCase() + level.slice(1)}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-pink-700 mb-1">Icon</label>
              <input
                type="text"
                name="icon"
                value={unitData.icon}
                onChange={handleUnitChange}
                className="w-full p-2 border border-pink-200 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Lesson Creation */}
        <div className="mb-8">
          <h2 className="text-xl font-semibold text-pink-800 mb-4">Create Lessons</h2>
          
          {/* Current Lesson Form */}
          <div className="p-4 border border-pink-200 rounded-lg mb-4">
            <div className="grid grid-cols-1 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-pink-700 mb-1">Lesson Title*</label>
                <input
                  type="text"
                  name="title"
                  value={currentLesson.title}
                  onChange={handleLessonChange}
                  className="w-full p-2 border border-pink-200 rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-pink-700 mb-1">Description</label>
                <textarea
                  name="description"
                  value={currentLesson.description}
                  onChange={handleLessonChange}
                  rows={2}
                  className="w-full p-2 border border-pink-200 rounded-lg"
                />
              </div>
            </div>

            {/* Exercises Section */}
            <div className="mt-6">
              <h3 className="text-lg font-medium text-pink-800 mb-3">Add Exercises</h3>
              
              {/* Exercise Type Selection */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-pink-700 mb-1">Exercise Type*</label>
                <select
                  name="type"
                  value={currentExercise.type}
                  onChange={(e) => {
                    setCurrentExercise({
                      type: e.target.value,
                      word: '',
                      translation: '',
                      audioUrl: '',
                      images: [],
                      options: [],
                      correctAnswer: ''
                    });
                  }}
                  className="w-full p-2 border border-pink-200 rounded-lg"
                >
                  {exerciseTypes.map(type => (
                    <option key={type.value} value={type.value}>{type.name}</option>
                  ))}
                </select>
              </div>

              {/* Exercise-specific fields */}
              {renderExerciseFields()}

              <button 
                onClick={addExerciseToLesson}
                className="bg-pink-500 hover:bg-pink-600 text-white px-4 py-2 rounded-lg mt-4"
              >
                Add Exercise to Lesson
              </button>
            </div>

            {/* Current Lesson Exercises Preview */}
            {currentLesson.exercises.length > 0 && (
              <div className="mt-6">
                <h4 className="text-md font-medium text-pink-800 mb-2">Current Exercises ({currentLesson.exercises.length})</h4>
                <div className="space-y-2">
                  {currentLesson.exercises.map((exercise, index) => (
                    <div key={index} className="p-3 bg-pink-50 rounded-lg flex justify-between items-center">
                      <div>
                        <span className="font-medium">
                          {exercise.type === 'word_with_audio' ? `${exercise.word} (Audio)` :
                           exercise.type === 'image_selection' ? `${exercise.word} (Image Select)` :
                           exercise.type === 'pronunciation' ? `${exercise.word} (Pronunciation)` :
                           exercise.type === 'matching' ? `${exercise.word} (Matching)` : 'Exercise'}
                        </span>
                        <span className="ml-3 text-sm text-pink-600">{exercise.xpReward} XP</span>
                      </div>
                      <button 
                        onClick={() => {
                          const newExercises = [...currentLesson.exercises];
                          newExercises.splice(index, 1);
                          setCurrentLesson({...currentLesson, exercises: newExercises});
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Save Lesson Button */}
            <button 
              onClick={saveLesson}
              disabled={currentLesson.exercises.length === 0}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg w-full mt-4 disabled:opacity-50"
            >
              Save This Lesson
            </button>
          </div>

          {/* List of Added Lessons */}
          <div>
            <h3 className="text-lg font-medium text-pink-800 mb-2">Lessons in this Unit ({lessons.length})</h3>
            {lessons.length > 0 ? (
              <div className="space-y-3">
                {lessons.map((lesson, index) => (
                  <div key={index} className="p-4 bg-pink-50 rounded-lg border border-pink-200">
                    <div className="flex justify-between items-center mb-2">
                      <h4 className="font-semibold text-pink-800">{lesson.title}</h4>
                      <button 
                        onClick={() => {
                          const newLessons = [...lessons];
                          newLessons.splice(index, 1);
                          setLessons(newLessons);
                        }}
                        className="text-red-500 hover:text-red-700"
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                    <p className="text-sm text-pink-600 mb-2">{lesson.description || 'No description'}</p>
                    <div className="text-xs text-pink-500">
                      {lesson.exercises.length} exercises • {lesson.exercises.reduce((sum, ex) => sum + ex.xpReward, 0)} total XP
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 text-center py-4">No lessons added yet</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UnitCreationPage;