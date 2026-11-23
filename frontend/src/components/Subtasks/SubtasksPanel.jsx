import React, { useState, useEffect, useCallback } from 'react';
import api from '../../services/api';
import SubtaskList from './SubtaskList';

export default function SubtasksPanel({ taskId }) {
  const [subtasks, setSubtasks] = useState([]);
  const [stats, setStats] = useState({ total: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

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
    } catch {
      setError('Failed to load subtasks');
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    if (taskId) {
      fetchSubtasks();
    } else {
      setLoading(false);
    }
  }, [taskId, fetchSubtasks]);

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
