import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiSettings, FiClock, FiBell, FiArrowLeft, FiCheck } from 'react-icons/fi';
import API from '../utils/api';
import { toast } from 'react-toastify';

function Settings() {
  const [reminderTime, setReminderTime] = useState('18:00');
  const [dailyReminder, setDailyReminder] = useState(true);
  const [weeklySummary, setWeeklySummary] = useState(true);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
  const fetchSettings = async () => {
    try {
      const response = await API.get('profiles/notification-settings/');
      setReminderTime(response.data.reminder_time || '18:00');
      setDailyReminder(response.data.daily_reminder !== false);
      setWeeklySummary(response.data.weekly_summary !== false);
    } catch (error) {
      console.error('Error fetching settings:', error);
    }
  };
  fetchSettings();
}, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await API.patch('profiles/update-notification-settings/', {
        reminder_time: reminderTime,
        daily_reminder: dailyReminder,
        weekly_summary: weeklySummary
      });
      toast.success('Settings saved successfully!');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-pink-50">
      <header className="flex items-center p-4 bg-white shadow-md sticky top-0 z-50">
        <button 
          onClick={() => navigate(-1)}
          className="p-2 rounded-full hover:bg-pink-100 mr-2"
        >
          <FiArrowLeft className="text-lg text-pink-600" />
        </button>
        <h1 className="text-xl font-bold text-pink-800">Notification Settings</h1>
      </header>

      <div className="flex-1 p-4 max-w-md mx-auto w-full">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <FiBell className="mr-2 text-pink-500" /> Daily Reminders
            </h2>
            
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={dailyReminder}
                  onChange={(e) => setDailyReminder(e.target.checked)}
                  className="rounded text-pink-500 focus:ring-pink-500"
                />
                <span className="ml-2">Enable daily practice reminders</span>
              </label>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Reminder Time
              </label>
              <input
                type="time"
                value={reminderTime}
                onChange={(e) => setReminderTime(e.target.value)}
                className="border rounded-lg px-3 py-2 w-full"
                disabled={!dailyReminder}
              />
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6">
            <h2 className="text-lg font-bold mb-4 flex items-center">
              <FiClock className="mr-2 text-pink-500" /> Weekly Summary
            </h2>
            
            <div className="flex items-center justify-between">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={weeklySummary}
                  onChange={(e) => setWeeklySummary(e.target.checked)}
                  className="rounded text-pink-500 focus:ring-pink-500"
                />
                <span className="ml-2">Send me weekly progress reports</span>
              </label>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-bold py-3 px-4 rounded-lg shadow-md transition disabled:opacity-50"
          >
            {loading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Settings;