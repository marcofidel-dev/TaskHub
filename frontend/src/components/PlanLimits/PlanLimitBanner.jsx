import React from 'react';
import { Link } from 'react-router-dom';

export default function PlanLimitBanner({ limits, loading }) {
  if (loading || !limits || limits.plan !== 'FREE') return null;

  const { taskCount, taskLimit, categoryCount, categoryLimit } = limits;
  const taskPercent = Math.min((taskCount / taskLimit) * 100, 100);
  const categoryPercent = Math.min((categoryCount / categoryLimit) * 100, 100);
  const isTaskAtLimit = taskCount >= taskLimit;
  const isCategoryAtLimit = categoryCount >= categoryLimit;

  if (!isTaskAtLimit && taskPercent < 60 && !isCategoryAtLimit && categoryPercent < 60) return null;

  return (
    <div className="mb-5 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700/50 rounded-xl animate-fadeIn">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-semibold text-amber-800 dark:text-amber-300 mb-2.5">
            Free plan limits
          </p>
          <div className="space-y-2">
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-amber-700 dark:text-amber-400">Tasks</span>
                <span className={`text-xs font-bold ${isTaskAtLimit ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {taskCount}/{taskLimit}
                </span>
              </div>
              <div className="w-full h-1.5 bg-amber-200 dark:bg-amber-800/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isTaskAtLimit ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${taskPercent}%` }}
                />
              </div>
            </div>
            <div>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-amber-700 dark:text-amber-400">Categories</span>
                <span className={`text-xs font-bold ${isCategoryAtLimit ? 'text-red-600 dark:text-red-400' : 'text-amber-700 dark:text-amber-400'}`}>
                  {categoryCount}/{categoryLimit}
                </span>
              </div>
              <div className="w-full h-1.5 bg-amber-200 dark:bg-amber-800/50 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${isCategoryAtLimit ? 'bg-red-500' : 'bg-amber-500'}`}
                  style={{ width: `${categoryPercent}%` }}
                />
              </div>
            </div>
          </div>
        </div>
        <Link
          to="/pricing"
          className="shrink-0 px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
