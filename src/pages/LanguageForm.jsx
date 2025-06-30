import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { toast } from 'react-toastify';
import API from '../utils/api';
import { 
  isRecognitionSupported, 
  recognizeSpeech,
  isLanguageSupportedForRecognition
} from '../utils/tts';

const LanguageForm = () => {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    flag: '🌐',
    speech_recognition_code: 'en-US',
    is_active: true
  });

  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [recognitionSupported, setRecognitionSupported] = useState(false);
  const [testResult, setTestResult] = useState(null);

  useEffect(() => {
    if (isEdit) {
      const fetchLanguage = async () => {
        try {
          const response = await API.get(`languages/${id}/`);
          setFormData(response.data);
          // Check recognition support when editing existing language
          checkRecognitionSupport(response.data.speech_recognition_code);
        } catch (error) {
          toast.error('Failed to load language');
        }
      };
      fetchLanguage();
    } else {
      // For new language, check if recognition is supported at all
      setRecognitionSupported(isRecognitionSupported());
    }
  }, [id]);

  const checkRecognitionSupport = async (code) => {
    try {
      const supported = await isLanguageSupportedForRecognition(code);
      setRecognitionSupported(supported);
    } catch (error) {
      console.error('Error checking recognition support:', error);
      setRecognitionSupported(false);
    }
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setFormData({...formData, code: newCode});
    // Check recognition support when code changes
    checkRecognitionSupport(newCode + '-' + newCode.toUpperCase());
  };

  const handleSpeechRecognitionCodeChange = (e) => {
    const newCode = e.target.value;
    setFormData({...formData, speech_recognition_code: newCode});
    checkRecognitionSupport(newCode);
  };

  const testSpeechRecognition = async () => {
    if (!recognitionSupported) {
      toast.warning('Speech recognition not supported for this language');
      return;
    }

    try {
      setIsListening(true);
      setTestResult(null);
      toast.info('Speak now...', { autoClose: false });

      const result = await recognizeSpeech(formData.speech_recognition_code);
      setTestResult(result);
      toast.dismiss();
      toast.success('Recognition successful!');
    } catch (error) {
      toast.dismiss();
      toast.error(`Recognition failed: ${error.message}`);
      setTestResult(null);
    } finally {
      setIsListening(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      if (isEdit) {
        await API.put(`languages/${id}/`, formData);
        toast.success('Language updated successfully');
      } else {
        await API.post('languages/', formData);
        toast.success('Language created successfully');
      }
      navigate('/admin?tab=languages');
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-pink-50 p-6">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md p-6">
        <h2 className="text-2xl font-bold text-pink-700 mb-6">
          {isEdit ? 'Edit Language' : 'Add New Language'}
        </h2>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label className="block text-pink-700 mb-2">Name*</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({...formData, name: e.target.value})}
              className="w-full p-2 border border-pink-300 rounded"
              required
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-pink-700 mb-2">Language Code* (e.g., "en", "es")</label>
            <input
              type="text"
              value={formData.code}
              onChange={handleCodeChange}
              className="w-full p-2 border border-pink-300 rounded"
              required
              maxLength="10"
            />
          </div>
          
          <div className="mb-4">
            <label className="block text-pink-700 mb-2">Speech Recognition Code*</label>
            <div className="flex items-center space-x-2">
              <input
                type="text"
                value={formData.speech_recognition_code}
                onChange={handleSpeechRecognitionCodeChange}
                className="flex-1 p-2 border border-pink-300 rounded"
                placeholder="e.g., en-US, es-ES"
                required
              />
              <button
                type="button"
                onClick={testSpeechRecognition}
                disabled={!recognitionSupported || isListening}
                className={`px-3 py-2 rounded ${
                  recognitionSupported 
                    ? 'bg-blue-500 hover:bg-blue-600 text-white' 
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                }`}
                title={recognitionSupported ? 'Test speech recognition' : 'Recognition not supported for this language'}
              >
                {isListening ? 'Listening...' : 'Test'}
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Format: languageCode-countryCode (e.g., en-US, fr-FR)
            </p>
            {testResult && (
              <div className="mt-2 p-2 bg-gray-100 rounded">
                <p className="text-sm font-medium">Test Result:</p>
                <p className="text-sm">{testResult}</p>
              </div>
            )}
          </div>
          
          <div className="mb-4">
            <label className="block text-pink-700 mb-2">Flag Emoji</label>
            <input
              type="text"
              value={formData.flag}
              onChange={(e) => setFormData({...formData, flag: e.target.value})}
              className="w-full p-2 border border-pink-300 rounded"
              maxLength="2"
            />
          </div>
          
          <div className="flex items-center mb-6">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
              className="mr-2"
            />
            <label htmlFor="is_active" className="text-pink-700">
              Active
            </label>
          </div>
          
          <div className="flex justify-end space-x-4">
            <button
              type="button"
              onClick={() => navigate('/admin?tab=languages')}
              className="px-4 py-2 border border-pink-300 text-pink-700 rounded hover:bg-pink-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-pink-500 text-white rounded hover:bg-pink-600 disabled:opacity-50"
            >
              {loading ? 'Saving...' : isEdit ? 'Update' : 'Create'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default LanguageForm;