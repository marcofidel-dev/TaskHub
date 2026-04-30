import React, { useState, useEffect, useRef } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';

const DownloadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="7 10 12 15 17 10" />
    <line x1="12" y1="15" x2="12" y2="3" />
  </svg>
);

const ChevronDownIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const FORMATS = [
  { key: 'csv',      label: 'CSV',           desc: 'Spreadsheet format', icon: '📄', ext: 'csv',  endpoint: '/v1/export/tasks-csv' },
  { key: 'excel',    label: 'Excel',          desc: 'Formatted workbook', icon: '📊', ext: 'xlsx', endpoint: '/v1/export/tasks-excel' },
  { key: 'calendar', label: 'Calendar (ICS)', desc: 'Import to Google Calendar', icon: '📅', ext: 'ics', endpoint: '/v1/export/tasks-calendar' },
];

export default function ExportButton({ disabled = false }) {
  const { showToast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [loadingFormat, setLoadingFormat] = useState(null);
  const menuRef = useRef(null);

  useEffect(() => {
    const handleOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    if (isOpen) document.addEventListener('pointerdown', handleOutside);
    return () => document.removeEventListener('pointerdown', handleOutside);
  }, [isOpen]);

  const handleExport = async (format) => {
    setLoadingFormat(format.key);
    setIsOpen(false);

    try {
      const response = await api.post(format.endpoint, {
        includeSubtasks: true,
        includeTimeEntries: true,
        includeCompleted: true
      }, { responseType: 'blob' });

      const filename = `tasks_${new Date().toISOString().split('T')[0]}.${format.ext}`;
      const url  = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);

      showToast('success', `Exported as ${format.label}`);
    } catch (err) {
      showToast('error', err.response?.data?.message || `Failed to export as ${format.label}`);
    } finally {
      setLoadingFormat(null);
    }
  };

  const isBusy = loadingFormat !== null;

  return (
    <div className="relative inline-block" ref={menuRef}>
      <button
        onClick={() => setIsOpen(prev => !prev)}
        disabled={disabled || isBusy}
        className="inline-flex items-center gap-2 px-3 py-2.5 bg-emerald-600 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:bg-emerald-700 hover:shadow-md shadow-sm shrink-0 min-h-[44px] disabled:opacity-50 disabled:cursor-not-allowed"
        aria-label="Export tasks"
      >
        {isBusy ? (
          <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
        ) : (
          <DownloadIcon />
        )}
        <span className="hidden sm:inline">{isBusy ? 'Exporting...' : 'Export'}</span>
        <ChevronDownIcon />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-52 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-gray-200 dark:border-slate-700 z-50 animate-fadeIn overflow-hidden">
          {FORMATS.map((format, idx) => (
            <button
              key={format.key}
              onClick={() => handleExport(format)}
              disabled={isBusy}
              className={`w-full text-left px-4 py-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-slate-700 transition disabled:opacity-50 ${
                idx < FORMATS.length - 1 ? 'border-b border-gray-100 dark:border-slate-700' : ''
              }`}
            >
              <span className="text-lg shrink-0">{format.icon}</span>
              <div className="min-w-0 flex-1">
                <p className="font-semibold text-sm text-gray-900 dark:text-gray-100">{format.label}</p>
                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">{format.desc}</p>
              </div>
              {loadingFormat === format.key && (
                <div className="shrink-0 w-4 h-4 border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
