import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAnalytics } from '../hooks/useAnalytics';
import { usePlanFeatures } from '../hooks/usePlanFeatures';
import DashboardStats from '../components/Analytics/DashboardStats';
import CompletionChart from '../components/Analytics/CompletionChart';
import TimeTrackingChart from '../components/Analytics/TimeTrackingChart';
import DateRangeSelector from '../components/Analytics/DateRangeSelector';

export default function AnalyticsDashboard() {
  const { canUseFeature, loading: featuresLoading } = usePlanFeatures();
  const { dashboard, completion, timeTracking, loading, error, fetchDateRangeAnalytics } = useAnalytics();
  const [dateRangeData, setDateRangeData] = useState(null);
  const [rangeLoading, setRangeLoading] = useState(false);

  const hasAccess = canUseFeature('analytics_basic');

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

  if (featuresLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6 flex items-center justify-center">
        <div className="max-w-lg w-full bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-8 text-center">
          <div className="text-5xl mb-4">📊</div>
          <h1 className="text-2xl font-bold text-blue-900 dark:text-blue-200 mb-3">
            Analytics Dashboard
          </h1>
          <p className="text-blue-800 dark:text-blue-300 mb-6 text-sm leading-relaxed">
            Get detailed insights into your productivity, task completion rates, and time tracking.
            Available on Pro and Team plans.
          </p>
          <Link
            to="/pricing"
            className="inline-block bg-blue-600 text-white px-6 py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition text-sm"
          >
            Upgrade to Pro
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-6xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">
            📊 Analytics Dashboard
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            Track your productivity and task completion
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6 text-sm">
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
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
              {rangeLoading ? 'Loading period data...' : `Period: ${dateRangeData?.startDate} → ${dateRangeData?.endDate}`}
            </h3>
            {rangeLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[1, 2, 3, 4].map(i => (
                  <div key={i} className="bg-gray-100 dark:bg-slate-700 rounded-lg p-4 animate-pulse h-20" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tasks Created</p>
                  <p className="text-2xl font-bold text-blue-600">{dateRangeData?.totalTasksCreated ?? 0}</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tasks Completed</p>
                  <p className="text-2xl font-bold text-green-600">{dateRangeData?.totalTasksCompleted ?? 0}</p>
                </div>
                <div className="bg-purple-50 dark:bg-purple-900/20 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Hours Tracked</p>
                  <p className="text-2xl font-bold text-purple-600">
                    {parseFloat(dateRangeData?.totalHoursTracked ?? 0).toFixed(1)}h
                  </p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-4 rounded-lg">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">Avg Tasks/Day</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {parseFloat(dateRangeData?.averageTasksPerDay ?? 0).toFixed(1)}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
