import React from 'react';
import { Link } from 'react-router-dom';

export default function TaskLimitIndicator({ limits }) {
  if (!limits || limits.plan !== 'FREE') return null;

  const { taskCount, taskLimit } = limits;
  const percent = Math.min((taskCount / taskLimit) * 100, 100);
  const isAtLimit = taskCount >= taskLimit;
  const isNearLimit = percent >= 80;

  const barColor = isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-indigo-500';
  const countColor = isAtLimit
    ? 'text-red-600 dark:text-red-400'
    : isNearLimit
    ? 'text-amber-600 dark:text-amber-400'
    : 'text-gray-500 dark:text-gray-400';

  return (
    <div className="mb-4 p-3.5 bg-gray-50 dark:bg-slate-700/50 border border-gray-200 dark:border-slate-600 rounded-xl">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-xs font-semibold text-gray-600 dark:text-gray-400">
          Free plan — task usage
        </span>
        <span className={`text-xs font-bold ${countColor}`}>
          {taskCount}/{taskLimit}
        </span>
      </div>
      <div className="w-full h-1.5 bg-gray-200 dark:bg-slate-600 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-300 ${barColor}`}
          style={{ width: `${percent}%` }}
        />
      </div>
      {isAtLimit && (
        <p className="mt-2 text-xs text-red-600 dark:text-red-400">
          Task limit reached.{' '}
          <Link to="/pricing" className="font-semibold underline hover:opacity-80">
            Upgrade to Pro
          </Link>{' '}
          for unlimited tasks.
        </p>
      )}
    </div>
  );
}
