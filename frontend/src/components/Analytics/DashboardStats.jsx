import React from 'react';

const colorText = {
  blue:    'text-blue-600',
  green:   'text-green-600',
  purple:  'text-purple-600',
  emerald: 'text-emerald-600',
  orange:  'text-orange-600',
};

const colorBg = {
  blue:    'bg-blue-50 dark:bg-blue-900/20',
  green:   'bg-green-50 dark:bg-green-900/20',
  purple:  'bg-purple-50 dark:bg-purple-900/20',
  emerald: 'bg-emerald-50 dark:bg-emerald-900/20',
  orange:  'bg-orange-50 dark:bg-orange-900/20',
};

export default function DashboardStats({ dashboard, loading }) {
  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 animate-pulse">
            <div className="h-3 bg-gray-200 dark:bg-slate-600 rounded w-24 mb-3" />
            <div className="h-8 bg-gray-300 dark:bg-slate-500 rounded w-20" />
          </div>
        ))}
      </div>
    );
  }

  if (!dashboard) return null;

  const trendPositive = (dashboard.weeklyTrend ?? 0) >= 0;

  const stats = [
    {
      label: 'Total Tasks',
      value: dashboard.totalTasks ?? 0,
      icon: '📋',
      color: 'blue',
    },
    {
      label: 'Completed',
      value: dashboard.completedTasks ?? 0,
      icon: '✓',
      color: 'green',
    },
    {
      label: 'Completion Rate',
      value: `${Math.round(dashboard.completionPercentage ?? 0)}%`,
      icon: '📈',
      color: 'purple',
    },
    {
      label: 'Weekly Trend',
      value: `${trendPositive ? '+' : ''}${Math.round(dashboard.weeklyTrend ?? 0)}%`,
      icon: trendPositive ? '📊' : '📉',
      color: trendPositive ? 'emerald' : 'orange',
    },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {stats.map((stat, idx) => (
        <div
          key={idx}
          className={`rounded-xl shadow-sm p-5 ${colorBg[stat.color]}`}
        >
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide">
              {stat.label}
            </p>
            <span className="text-lg">{stat.icon}</span>
          </div>
          <p className={`text-3xl font-bold ${colorText[stat.color]}`}>
            {stat.value}
          </p>
        </div>
      ))}
    </div>
  );
}
