import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { usePlanFeatures } from '../../hooks/usePlanFeatures';
import TimeEntryForm from './TimeEntryForm';
import TimeEntryList from './TimeEntryList';

export default function TimeTrackingPanel({ taskId }) {
  const { canUseFeature, loading: featuresLoading } = usePlanFeatures();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);

  const hasAccess = canUseFeature('time_tracking');

  useEffect(() => {
    if (!featuresLoading && hasAccess && taskId) {
      fetchTimeEntries();
    } else if (!featuresLoading) {
      setLoading(false);
    }
  }, [taskId, hasAccess, featuresLoading]);

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

  if (featuresLoading) {
    return (
      <div className="flex justify-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-5">
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1.5">Time Tracking</h3>
        <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
          Track the time you spend on this task. Available on Pro and Team plans.
        </p>
        <Link
          to="/pricing"
          className="inline-block bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
        >
          Upgrade to Pro
        </Link>
      </div>
    );
  }

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
