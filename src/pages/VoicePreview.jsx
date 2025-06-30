import React, { useEffect, useState } from "react";

const VoicePreview = ({ langCode, onVoiceSelect, initialVoice }) => {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(initialVoice || "");
  const [sampleText, setSampleText] = useState("Hello, how are you?");

  useEffect(() => {
    const loadVoices = () => {
      const all = window.speechSynthesis.getVoices();
      const filtered = all.filter(
        (v) => v.lang === langCode || v.lang.startsWith(langCode?.split("-")[0])
      );
      setVoices(filtered);
      
      if (filtered.length > 0) {
        // Find the preferred voice or first available
        const preferredVoice = initialVoice && filtered.find(v => v.name === initialVoice);
        const voiceToSelect = preferredVoice ? preferredVoice.name : filtered[0].name;
        
        setSelectedVoice(voiceToSelect);
        if (onVoiceSelect) {
          onVoiceSelect(voiceToSelect);
        }
      }
    };

    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.onvoiceschanged = null;
    };
  }, [langCode, initialVoice]);

  const speak = () => {
    const voice = voices.find((v) => v.name === selectedVoice);
    if (!voice) return;

    const utterance = new SpeechSynthesisUtterance(sampleText);
    utterance.voice = voice;
    utterance.lang = voice.lang;
    
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const handleVoiceChange = (e) => {
    const voiceName = e.target.value;
    setSelectedVoice(voiceName);
    if (onVoiceSelect) onVoiceSelect(voiceName);
  };

  if (!langCode) return null;

  return (
    <div className="mt-4 p-4 bg-gray-50 border rounded space-y-2">
      <h3 className="text-md font-semibold text-gray-700">Voice Preview</h3>

      <textarea
        value={sampleText}
        onChange={(e) => setSampleText(e.target.value)}
        rows={2}
        className="w-full border p-2 rounded"
        placeholder="Sample text to speak..."
      />

      <select
        className="w-full border p-2 rounded"
        value={selectedVoice}
        onChange={handleVoiceChange}
      >
        {voices.length > 0 ? (
          voices.map((v, idx) => (
            <option key={idx} value={v.name}>
              {v.name} ({v.lang})
            </option>
          ))
        ) : (
          <option>No voices found for {langCode}</option>
        )}
      </select>

      <button
        onClick={speak}
        disabled={!selectedVoice}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Test Voice
      </button>
    </div>
  );
};

export default VoicePreview;