import React, { useState } from 'react';
import api from '../../services/api';

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
  </svg>
);

const DragIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
    <circle cx="9"  cy="5"  r="1.5" />
    <circle cx="9"  cy="12" r="1.5" />
    <circle cx="9"  cy="19" r="1.5" />
    <circle cx="16" cy="5"  r="1.5" />
    <circle cx="16" cy="12" r="1.5" />
    <circle cx="16" cy="19" r="1.5" />
  </svg>
);

export default function SubtaskItem({ subtask, taskId, onToggle, onDelete, isDragging = false }) {
  const [loading, setLoading] = useState(false);

  const handleToggle = async () => {
    setLoading(true);
    try {
      await api.patch(`/v1/tasks/${taskId}/subtasks/${subtask.id}/toggle`);
      if (onToggle) onToggle({ ...subtask, completed: !subtask.completed });
    } catch (err) {
      console.error('Failed to toggle subtask:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this subtask?')) return;
    try {
      await api.delete(`/v1/tasks/${taskId}/subtasks/${subtask.id}`);
      if (onDelete) onDelete(subtask.id);
    } catch (err) {
      console.error('Failed to delete subtask:', err);
    }
  };

  return (
    <div
      className={`flex items-center gap-2.5 p-2.5 rounded-lg border transition-all ${
        isDragging
          ? 'bg-blue-50 dark:bg-blue-900/30 border-blue-300 shadow-md opacity-70'
          : 'bg-white dark:bg-slate-700 border-gray-200 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600'
      }`}
    >
      <span className="cursor-grab active:cursor-grabbing text-gray-300 dark:text-slate-500 shrink-0">
        <DragIcon />
      </span>

      <input
        type="checkbox"
        checked={subtask.completed || false}
        onChange={handleToggle}
        disabled={loading}
        className="w-4 h-4 text-green-600 rounded focus:ring-2 focus:ring-green-500 cursor-pointer disabled:opacity-50 shrink-0"
      />

      <div className="flex-1 min-w-0">
        <p className={`text-sm font-medium truncate ${
          subtask.completed
            ? 'text-gray-400 dark:text-gray-500 line-through'
            : 'text-gray-800 dark:text-gray-100'
        }`}>
          {subtask.title}
        </p>
        {subtask.description && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
            {subtask.description}
          </p>
        )}
      </div>

      <button
        onClick={handleDelete}
        className="p-1 text-gray-300 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors shrink-0"
        aria-label="Delete subtask"
      >
        <TrashIcon />
      </button>
    </div>
  );
}
