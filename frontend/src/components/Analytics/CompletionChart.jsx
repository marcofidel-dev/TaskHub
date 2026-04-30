import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

const COLORS = { Completed: '#10b981', Remaining: '#f43f5e' };

export default function CompletionChart({ completion, loading }) {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 h-80 animate-pulse">
        <div className="h-5 bg-gray-200 dark:bg-slate-600 rounded w-36 mb-4" />
        <div className="flex items-center justify-center h-56">
          <div className="w-40 h-40 bg-gray-200 dark:bg-slate-600 rounded-full" />
        </div>
      </div>
    );
  }

  if (!completion) return null;

  const total = completion.totalTasks ?? 0;
  const done  = completion.completedTasks ?? 0;

  const data = [
    { name: 'Completed', value: done },
    { name: 'Remaining', value: total - done },
  ].filter(d => d.value > 0);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
      <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
        Task Completion
      </h3>

      {data.length === 0 ? (
        <div className="flex items-center justify-center h-64 text-gray-400 dark:text-gray-500 text-sm">
          No tasks yet
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={280}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              outerRadius={90}
              dataKey="value"
              label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
              labelLine={false}
            >
              {data.map((entry) => (
                <Cell key={entry.name} fill={COLORS[entry.name]} />
              ))}
            </Pie>
            <Tooltip
              formatter={(value) => [value, 'Tasks']}
              contentStyle={{
                backgroundColor: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: '8px',
                fontSize: '13px',
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}
