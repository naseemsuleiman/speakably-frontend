import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Signup from './pages/Signup';
import WizardForm from './components/WizardForm';
import Home from './pages/Home';
import AdminDashboard from './pages/AdminDashboard';
import UnitCreationPage from './pages/UnitCreationPage';
import LanguageForm from './pages/LanguageForm';
import Profile from './pages/Profile';
import VoiceTester from './pages/VoicePreview';
import VoicePreview from './pages/VoicePreview';

function App() {
  return (
    
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/wizard" element={<WizardForm />} />
        <Route path="/home" element={<Home />} />
        <Route path="/admin" element={<AdminDashboard />} />
         <Route path="/admin/units/new" element={<UnitCreationPage />} />
        <Route path="/admin/units/edit/:id" element={<UnitCreationPage />} />
        <Route path="/admin/languages/new" element={<LanguageForm/>} />
        <Route path="/admin/languages/edit/:id" element={<LanguageForm />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/voice" element={<VoicePreview />} />
        
      </Routes>
    
  );
}

export default App;
