import React from 'react';

export default function TimeEntryList({ entries = [], loading, onDelete }) {
  if (loading) {
    return (
      <div className="flex justify-center py-6">
        <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600" />
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="bg-gray-50 dark:bg-slate-700 rounded-lg p-6 text-center text-gray-500 dark:text-gray-400">
        <p className="text-sm">No time entries yet. Add one to get started!</p>
      </div>
    );
  }

  const totalDecimalHours = entries.reduce((sum, entry) => {
    return sum + (parseFloat(entry.hours) || 0) + (parseInt(entry.minutes) || 0) / 60;
  }, 0);

  const totalH = Math.floor(totalDecimalHours);
  const totalM = Math.round((totalDecimalHours % 1) * 60);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg border border-gray-200 dark:border-slate-700 overflow-hidden">
      <div className="bg-blue-50 dark:bg-blue-900/30 px-4 py-3 border-b border-gray-200 dark:border-slate-700">
        <p className="text-xs text-gray-500 dark:text-gray-400">Total time tracked</p>
        <p className="text-xl font-bold text-blue-600 dark:text-blue-400">{totalH}h {totalM}m</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 dark:bg-slate-700 border-b border-gray-200 dark:border-slate-600">
            <tr>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Date</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Time</th>
              <th className="px-4 py-2 text-left font-semibold text-gray-700 dark:text-gray-300">Description</th>
              <th className="px-4 py-2 text-right font-semibold text-gray-700 dark:text-gray-300">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-slate-700">
            {entries.map((entry) => (
              <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-slate-700">
                <td className="px-4 py-2.5 text-gray-700 dark:text-gray-300 whitespace-nowrap">
                  {new Date(entry.entryDate).toLocaleDateString()}
                </td>
                <td className="px-4 py-2.5 font-medium text-gray-900 dark:text-gray-100 whitespace-nowrap">
                  {entry.hours}h {entry.minutes}m
                </td>
                <td className="px-4 py-2.5 text-gray-500 dark:text-gray-400 max-w-xs truncate">
                  {entry.description || '—'}
                </td>
                <td className="px-4 py-2.5 text-right">
                  <button
                    onClick={() => onDelete && onDelete(entry.id)}
                    className="text-red-500 hover:text-red-700 text-xs font-medium"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
