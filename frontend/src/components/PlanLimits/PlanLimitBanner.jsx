import React from 'react';
import { Link } from 'react-router-dom';

export default function PlanLimitBanner({ limits, loading }) {
  if (loading || !limits || limits.plan !== 'FREE') return null;

  const { taskCount, taskLimit, categoryCount, categoryLimit } = limits;
  const taskPercent = Math.min((taskCount / taskLimit) * 100, 100);
  const categoryPercent = Math.min((categoryCount / categoryLimit) * 100, 100);
  const isAtLimit = taskCount >= taskLimit || categoryCount >= categoryLimit;

  if (!isAtLimit && taskPercent < 60 && categoryPercent < 60) return null;

  return (
    <div
      className="mb-5 rounded-xl overflow-hidden animate-fadeIn"
      style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4c1d95 100%)' }}
    >
      <div className="px-4 py-3 flex items-center gap-3">
        <div className="shrink-0 w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center">
          <svg className="w-3.5 h-3.5 text-indigo-200" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2 flex-wrap">
            <span className="text-xs font-bold text-white">
              {isAtLimit ? 'Starter plan limit reached' : 'Approaching plan limit'}
            </span>
            <span className="text-xs text-indigo-300">
              Tasks {taskCount}/{taskLimit} · Categories {categoryCount}/{categoryLimit}
            </span>
          </div>
          <div className="flex gap-2 mt-1.5">
            <div className="flex-1 h-1 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${taskPercent}%`,
                  background: taskPercent >= 100 ? '#f87171' : 'rgba(165,180,252,0.9)'
                }}
              />
            </div>
            <div className="flex-1 h-1 bg-white/15 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${categoryPercent}%`,
                  background: categoryPercent >= 100 ? '#f87171' : 'rgba(165,180,252,0.9)'
                }}
              />
            </div>
          </div>
        </div>
        <Link
          to="/pricing"
          className="shrink-0 px-3.5 py-1.5 bg-white text-indigo-700 text-xs font-bold rounded-lg hover:bg-indigo-50 transition-colors cursor-pointer"
        >
          Upgrade
        </Link>
      </div>
    </div>
  );
}
