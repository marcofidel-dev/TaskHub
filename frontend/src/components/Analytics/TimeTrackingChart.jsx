import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer
} from 'recharts';

export default function TimeTrackingChart({ timeTracking, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 h-80 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-slate-600 rounded w-48 mb-4" />
        <div className="flex items-end gap-3 h-56 px-4">
          {[60, 85, 45, 70, 90, 55, 75].map((h, i) => (
            <div key={i} className="flex-1 bg-gray-200 dark:bg-slate-600 rounded-t" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    );
  }

  if (!timeTracking) return null;

  const chartData = (timeTracking.byDay || []).map(day => ({
    name: (day.dayOfWeek ?? '').substring(0, 3) || 'N/A',
    Hours: parseFloat(day.hours ?? 0),
    Tasks: day.taskCount ?? 0,
  }));

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Time Tracking by Day
      </h3>

      {chartData.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500 text-sm">
          No time tracking data yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <BarChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="name" tick={{ fontSize: 12 }} />
            <YAxis yAxisId="left" tick={{ fontSize: 12 }} label={{ value: 'Hours', angle: -90, position: 'insideLeft', offset: 10, style: { fontSize: 11 } }} />
            <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 12 }} label={{ value: 'Tasks', angle: 90, position: 'insideRight', offset: 10, style: { fontSize: 11 } }} />
            <Tooltip
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Legend wrapperStyle={{ fontSize: '13px' }} />
            <Bar yAxisId="left" dataKey="Hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            <Bar yAxisId="right" dataKey="Tasks" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
