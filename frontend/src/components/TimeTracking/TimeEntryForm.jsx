import React, { useState } from 'react';
import api from '../../services/api';

export default function TimeEntryForm({ taskId, onEntryAdded, onCancel }) {
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [description, setDescription] = useState('');
  const [entryDate, setEntryDate] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!hours && !minutes) {
      setError('Please enter at least some time');
      return;
    }

    const hoursNum = parseFloat(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;

    if (hoursNum < 0 || minutesNum < 0 || minutesNum >= 60) {
      setError('Invalid time format');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/v1/tasks/${taskId}/time-entries`, {
        hours: hoursNum,
        minutes: minutesNum,
        description: description.trim() || null,
        entryDate
      });

      setHours('');
      setMinutes('');
      setDescription('');
      setEntryDate(new Date().toISOString().split('T')[0]);

      if (onEntryAdded) onEntryAdded(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add time entry');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-3">Add Time Entry</h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 mb-3">
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Hours</label>
          <input
            type="number"
            min="0"
            step="0.5"
            value={hours}
            onChange={(e) => setHours(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-500 dark:bg-slate-600 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Minutes</label>
          <input
            type="number"
            min="0"
            max="59"
            value={minutes}
            onChange={(e) => setMinutes(e.target.value)}
            placeholder="0"
            className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-500 dark:bg-slate-600 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            disabled={loading}
          />
        </div>
      </div>

      <div className="mb-3">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Date</label>
        <input
          type="date"
          value={entryDate}
          onChange={(e) => setEntryDate(e.target.value)}
          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-500 dark:bg-slate-600 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          disabled={loading}
        />
      </div>

      <div className="mb-4">
        <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description <span className="font-normal text-gray-400">(optional)</span>
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What did you work on?"
          rows="2"
          className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-500 dark:bg-slate-600 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
          disabled={loading}
        />
      </div>

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Entry'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="flex-1 border border-gray-300 dark:border-slate-500 text-gray-700 dark:text-gray-300 py-1.5 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
