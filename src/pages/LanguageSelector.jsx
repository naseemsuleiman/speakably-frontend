import { useState, useEffect } from 'react';
import API from '../utils/api';
import { FiGlobe, FiCheck } from 'react-icons/fi';

export default function LanguageSelector() {
  const [languages, setLanguages] = useState([]);
  const [selectedLanguages, setSelectedLanguages] = useState([]);
  const [primaryLanguage, setPrimaryLanguage] = useState(null);

  useEffect(() => {
  const fetchData = async () => {
    try {
      const [langsRes, userLangsRes] = await Promise.all([
        API.get('languages/'),
        API.get('my-languages/')
      ]);

      setLanguages(langsRes.data);

      const selectedIds = Array.isArray(userLangsRes.data.learning_languages)
        ? userLangsRes.data.learning_languages.map(lang => lang.id)
        : [];

      const primaryId = userLangsRes.data.selected_language?.id || null;

      setSelectedLanguages(selectedIds);
      setPrimaryLanguage(primaryId);
    } catch (error) {
      console.error('Error loading languages:', error);
    }
  };
  fetchData();
}, []);

  const toggleLanguage = async (langId) => {
    const newSelected = selectedLanguages.includes(langId)
      ? selectedLanguages.filter(id => id !== langId)
      : [...selectedLanguages, langId];
    
    await API.patch('profiles/update-languages/', {
      selectedLanguages: newSelected,
      primaryLanguage
    });
    setSelectedLanguages(newSelected);
  };

  const setPrimary = async (langId) => {
    await API.patch('profiles/update-languages/', {
      selectedLanguages,
      primaryLanguage: langId
    });
    setPrimaryLanguage(langId);
  };

  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h2 className="text-xl font-bold mb-4 flex items-center">
        <FiGlobe className="mr-2" /> My Languages
      </h2>
      
      <div className="space-y-3">
        {languages.map(lang => (
          <div key={lang.id} className="flex items-center p-3 border rounded-lg">
            <button
              onClick={() => toggleLanguage(lang.id)}
              className={`w-6 h-6 rounded-md mr-3 flex items-center justify-center ${
                selectedLanguages.includes(lang.id) 
                  ? 'bg-pink-500 text-white' 
                  : 'border border-gray-300'
              }`}
            >
              {selectedLanguages.includes(lang.id) && <FiCheck size={14} />}
            </button>
            
            <span className="flex-1">{lang.name}</span>
            
            {selectedLanguages.includes(lang.id) && (
              <button
                onClick={() => setPrimary(lang.id)}
                className={`px-3 py-1 text-sm rounded-full ${
                  primaryLanguage === lang.id
                    ? 'bg-pink-500 text-white'
                    : 'bg-gray-100 hover:bg-gray-200'
                }`}
              >
                {primaryLanguage === lang.id ? 'Primary' : 'Set Primary'}
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}