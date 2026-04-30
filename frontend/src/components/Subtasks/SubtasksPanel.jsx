import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { usePlanFeatures } from '../../hooks/usePlanFeatures';
import SubtaskList from './SubtaskList';

export default function SubtasksPanel({ taskId }) {
  const { canUseFeature, loading: featuresLoading } = usePlanFeatures();
  const [subtasks, setSubtasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const hasAccess = canUseFeature('subtasks');

  const fetchSubtasks = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get(`/v1/tasks/${taskId}/subtasks`);
      setSubtasks(response.data.subtasks || []);
      setStats({
        total: response.data.total ?? 0,
        completed: response.data.completed ?? 0,
        percentage: response.data.completionPercentage ?? 0,
      });
    } catch (err) {
      if (err.response?.status !== 403) {
        setError('Failed to load subtasks');
      }
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (!featuresLoading && hasAccess && taskId) {
      fetchSubtasks();
    } else if (!featuresLoading) {
      setLoading(false);
    }
  }, [taskId, hasAccess, featuresLoading, fetchSubtasks]);

  const handleSubtaskAdded = (newSubtask) => {
    setSubtasks(prev => [...prev, newSubtask]);
    fetchSubtasks();
  };

  const handleSubtaskToggled = (updatedSubtask) => {
    setSubtasks(prev => prev.map(s => s.id === updatedSubtask.id ? updatedSubtask : s));
    fetchSubtasks();
  };

  const handleSubtaskDeleted = (subtaskId) => {
    setSubtasks(prev => prev.filter(s => s.id !== subtaskId));
    fetchSubtasks();
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
        <h3 className="font-semibold text-blue-900 dark:text-blue-300 mb-1.5">Subtasks & Checklists</h3>
        <p className="text-sm text-blue-800 dark:text-blue-400 mb-3">
          Break down complex tasks into smaller subtasks. Available on Pro and Team plans.
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
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-3">
        Subtasks & Checklists
      </h3>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-3 py-2 rounded-lg mb-3 text-sm">
          {error}
        </div>
      )}

      <SubtaskList
        taskId={taskId}
        subtasks={subtasks}
        stats={stats}
        loading={loading}
        onSubtaskAdded={handleSubtaskAdded}
        onSubtaskToggled={handleSubtaskToggled}
        onSubtaskDeleted={handleSubtaskDeleted}
      />
    </div>
  );
}
