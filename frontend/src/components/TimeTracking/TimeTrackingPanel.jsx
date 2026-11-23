import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import TimeEntryForm from './TimeEntryForm';
import TimeEntryList from './TimeEntryList';

export default function TimeTrackingPanel({ taskId }) {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  useEffect(() => {
    if (taskId) {
      fetchTimeEntries();
    } else {
      setLoading(false);
    }
  }, [taskId]);

  const fetchTimeEntries = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/tasks/${taskId}/time-entries`);
      setEntries(response.data.entries || []);
    } catch (err) {
      if (err.response?.status !== 403) {
        setError('Failed to load time entries');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEntryAdded = (newEntry) => {
    setEntries(prev => [...prev, newEntry]);
    setShowForm(false);
  };

  const handleDelete = async (entryId) => {
    if (!window.confirm('Delete this time entry?')) return;
    try {
      await api.delete(`/v1/tasks/${taskId}/time-entries/${entryId}`);
      setEntries(prev => prev.filter(e => e.id !== entryId));
    } catch {
      setError('Failed to delete time entry');
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">
          ⏱ Time Tracking
        </h3>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-semibold hover:bg-blue-700 transition"
          >
            + Add Time
          </button>
        )}
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      {showForm && (
        <TimeEntryForm
          taskId={taskId}
          onEntryAdded={handleEntryAdded}
          onCancel={() => setShowForm(false)}
        />
      )}

      <TimeEntryList
        entries={entries}
        loading={loading}
        onDelete={handleDelete}
      />
    </div>
  );
}
