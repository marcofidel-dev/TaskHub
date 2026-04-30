import React, { useState } from 'react';
import SubtaskItem from './SubtaskItem';
import SubtaskForm from './SubtaskForm';
import CompletionProgress from './CompletionProgress';

export default function SubtaskList({
  taskId,
  subtasks = [],
  stats = {},
  loading = false,
  onSubtaskAdded,
  onSubtaskToggled,
  onSubtaskDeleted
}) {
  const [showForm, setShowForm] = useState(false);
  const [draggedId, setDraggedId] = useState(null);

  const handleDragStart = (subtask) => setDraggedId(subtask.id);
  const handleDragEnd = () => setDraggedId(null);

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e, targetSubtask) => {
    e.preventDefault();
    // Reorder UI only — API reorder endpoint can be wired when backend supports it
    setDraggedId(null);
  };

  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
      </div>
    );
  }

  const total = stats.total || 0;
  const completed = stats.completed || 0;

  return (
    <div>
      {total > 0 && <CompletionProgress total={total} completed={completed} />}

      {showForm && (
        <SubtaskForm
          taskId={taskId}
          onSubtaskAdded={(newSubtask) => {
            setShowForm(false);
            if (onSubtaskAdded) onSubtaskAdded(newSubtask);
          }}
          onCancel={() => setShowForm(false)}
        />
      )}

      {subtasks.length > 0 ? (
        <div className="space-y-1.5 mb-3">
          {subtasks.map((subtask) => (
            <div
              key={subtask.id}
              draggable
              onDragStart={(e) => { e.dataTransfer.effectAllowed = 'move'; handleDragStart(subtask); }}
              onDragEnd={handleDragEnd}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, subtask)}
            >
              <SubtaskItem
                subtask={subtask}
                taskId={taskId}
                onToggle={onSubtaskToggled}
                onDelete={onSubtaskDeleted}
                isDragging={draggedId === subtask.id}
              />
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-4 text-center text-gray-500 dark:text-gray-400 text-sm mb-3">
          No subtasks yet. Break down this task into smaller steps.
        </div>
      )}

      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="w-full py-2 text-sm text-blue-600 dark:text-blue-400 font-semibold border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
        >
          + Add Subtask
        </button>
      )}
    </div>
  );
}
