import React, { useState } from 'react';
import api from '../../services/api';

export default function SubtaskForm({ taskId, onSubtaskAdded, onCancel }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      setError('Subtask title is required');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await api.post(`/v1/tasks/${taskId}/subtasks`, {
        title: title.trim(),
        description: description.trim() || null
      });

      setTitle('');
      setDescription('');

      if (onSubtaskAdded) onSubtaskAdded(response.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add subtask');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-3 mb-3">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-2 text-xs">
          {error}
        </div>
      )}

      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Add a new subtask..."
        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-500 dark:bg-slate-700 dark:text-gray-100 rounded-lg text-sm mb-2 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        disabled={loading}
        autoFocus
      />

      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Description (optional)"
        rows="1"
        className="w-full px-3 py-2 border border-gray-300 dark:border-slate-500 dark:bg-slate-700 dark:text-gray-100 rounded-lg text-sm mb-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
        disabled={loading}
      />

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 bg-blue-600 text-white py-1.5 rounded-lg text-sm font-semibold hover:bg-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Adding...' : 'Add Subtask'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-4 py-1.5 border border-gray-300 dark:border-slate-500 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-semibold hover:bg-gray-50 dark:hover:bg-slate-600 transition disabled:opacity-50"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
