import React from 'react';

export default function CompletionProgress({ total = 0, completed = 0 }) {
  const percentage = total > 0 ? (completed / total) * 100 : 0;

  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Progress: {completed} of {total} completed
        </p>
        <span className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          {Math.round(percentage)}%
        </span>
      </div>
      <div className="w-full bg-gray-200 dark:bg-slate-600 rounded-full h-2">
        <div
          className="h-2 rounded-full transition-all duration-300"
          style={{
            width: `${percentage}%`,
            background: percentage === 100
              ? 'linear-gradient(90deg, #10B981, #059669)'
              : 'linear-gradient(90deg, #3B82F6, #6366F1)',
          }}
        />
      </div>
    </div>
  );
}
