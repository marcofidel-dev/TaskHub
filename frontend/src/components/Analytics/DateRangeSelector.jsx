import React, { useState } from 'react';

const RANGES = [
  { value: '7',  label: 'Last 7 days' },
  { value: '30', label: 'Last 30 days' },
  { value: '90', label: 'Last 90 days' },
  { value: 'custom', label: 'Custom range' },
];

export default function DateRangeSelector({ onDateRangeChange, onCustomRange }) {
  const [selected, setSelected] = useState('30');
  const [showCustom, setShowCustom] = useState(false);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [customError, setCustomError] = useState('');

  const handleRangeChange = (value) => {
    setSelected(value);
    if (value === 'custom') {
      setShowCustom(true);
      return;
    }
    setShowCustom(false);
    const end   = new Date();
    const start = new Date(end);
    start.setDate(start.getDate() - parseInt(value));
    onDateRangeChange(start, end);
  };

  const handleCustomSubmit = () => {
    setCustomError('');
    if (!customStart || !customEnd) {
      setCustomError('Please select both start and end dates.');
      return;
    }
    const start = new Date(customStart);
    const end   = new Date(customEnd);
    if (start > end) {
      setCustomError('Start date must be before end date.');
      return;
    }
    onCustomRange(start, end);
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 mb-6">
      <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">Date Range</h3>

      <div className="flex flex-wrap gap-2">
        {RANGES.map((range) => (
          <button
            key={range.value}
            onClick={() => handleRangeChange(range.value)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition ${
              selected === range.value
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-slate-600'
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      {showCustom && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-slate-700">
          {customError && (
            <p className="text-red-500 text-xs mb-2">{customError}</p>
          )}
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Start</label>
              <input
                type="date"
                value={customStart}
                onChange={(e) => setCustomStart(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">End</label>
              <input
                type="date"
                value={customEnd}
                onChange={(e) => setCustomEnd(e.target.value)}
                className="w-full px-3 py-1.5 text-sm border border-gray-300 dark:border-slate-600 dark:bg-slate-700 dark:text-gray-100 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <button
            onClick={handleCustomSubmit}
            className="w-full py-2 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition"
          >
            Apply Custom Range
          </button>
        </div>
      )}
    </div>
  );
}
