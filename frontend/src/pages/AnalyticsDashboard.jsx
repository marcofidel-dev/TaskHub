import React, { useState } from 'react';
import { useAnalytics } from '../hooks/useAnalytics';
import DashboardStats from '../components/Analytics/DashboardStats';
import CompletionChart from '../components/Analytics/CompletionChart';
import TimeTrackingChart from '../components/Analytics/TimeTrackingChart';
import DateRangeSelector from '../components/Analytics/DateRangeSelector';

export default function AnalyticsDashboard() {
  const { dashboard, completion, timeTracking, loading, error, fetchDateRangeAnalytics } = useAnalytics();
  const [dateRangeData, setDateRangeData] = useState(null);
  const [rangeLoading, setRangeLoading] = useState(false);

  const handleDateRangeChange = async (startDate, endDate) => {
    setRangeLoading(true);
    try {
      const data = await fetchDateRangeAnalytics(startDate, endDate);
      setDateRangeData(data);
    } catch {
      // error already set in hook
    } finally {
      setRangeLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-7">
          <div className="flex items-center gap-3 mb-1">
            <div
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
            >
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Analytics</h1>
          </div>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5 ml-11">
            Track your productivity and task completion
          </p>
        </div>

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <DateRangeSelector
          onDateRangeChange={handleDateRangeChange}
          onCustomRange={handleDateRangeChange}
        />

        <DashboardStats dashboard={dashboard} loading={loading} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <CompletionChart completion={completion} loading={loading} />
          <TimeTrackingChart timeTracking={timeTracking} loading={loading} />
        </div>

        {(rangeLoading || dateRangeData) && (
          <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {rangeLoading
                ? 'Loading period data...'
                : `Period: ${dateRangeData?.startDate} → ${dateRangeData?.endDate}`}
            </h3>
            {rangeLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-100 dark:bg-slate-700 rounded-xl p-4 animate-pulse h-20" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                  { label: 'Tasks Created', value: dateRangeData?.totalTasksCreated ?? 0, color: 'indigo' },
                  { label: 'Tasks Completed', value: dateRangeData?.totalTasksCompleted ?? 0, color: 'emerald' },
                  { label: 'Hours Tracked', value: `${parseFloat(dateRangeData?.totalHoursTracked ?? 0).toFixed(1)}h`, color: 'violet' },
                  { label: 'Avg Tasks/Day', value: parseFloat(dateRangeData?.averageTasksPerDay ?? 0).toFixed(1), color: 'orange' }
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="p-4 rounded-xl border border-gray-100 dark:border-slate-700 bg-gray-50 dark:bg-slate-700/50"
                  >
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">{stat.label}</p>
                    <p
                      className="text-2xl font-bold"
                      style={{
                        color: stat.color === 'indigo' ? '#6366f1'
                          : stat.color === 'emerald' ? '#10b981'
                          : stat.color === 'violet' ? '#8b5cf6'
                          : '#f97316'
                      }}
                    >
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
