import { useEffect, useState } from 'react';

const TOAST_CONFIGS = {
  success: {
    bar: 'bg-emerald-500',
    bg: 'bg-white dark:bg-slate-800',
    border: 'border-emerald-200 dark:border-emerald-700',
    iconBg: 'bg-emerald-100 dark:bg-emerald-900/40',
    iconColor: 'text-emerald-600 dark:text-emerald-400',
    titleColor: 'text-emerald-800 dark:text-emerald-200',
    messageColor: 'text-gray-600 dark:text-gray-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="20 6 9 17 4 12" />
      </svg>
    ),
  },
  error: {
    bar: 'bg-red-500',
    bg: 'bg-white dark:bg-slate-800',
    border: 'border-red-200 dark:border-red-700',
    iconBg: 'bg-red-100 dark:bg-red-900/40',
    iconColor: 'text-red-600 dark:text-red-400',
    titleColor: 'text-red-800 dark:text-red-200',
    messageColor: 'text-gray-600 dark:text-gray-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
  },
  warning: {
    bar: 'bg-amber-500',
    bg: 'bg-white dark:bg-slate-800',
    border: 'border-amber-200 dark:border-amber-700',
    iconBg: 'bg-amber-100 dark:bg-amber-900/40',
    iconColor: 'text-amber-600 dark:text-amber-400',
    titleColor: 'text-amber-800 dark:text-amber-200',
    messageColor: 'text-gray-600 dark:text-gray-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" /><line x1="12" y1="9" x2="12" y2="13" /><line x1="12" y1="17" x2="12.01" y2="17" />
      </svg>
    ),
  },
  info: {
    bar: 'bg-blue-500',
    bg: 'bg-white dark:bg-slate-800',
    border: 'border-blue-200 dark:border-blue-700',
    iconBg: 'bg-blue-100 dark:bg-blue-900/40',
    iconColor: 'text-blue-600 dark:text-blue-400',
    titleColor: 'text-blue-800 dark:text-blue-200',
    messageColor: 'text-gray-600 dark:text-gray-300',
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" /><line x1="12" y1="16" x2="12" y2="12" /><line x1="12" y1="8" x2="12.01" y2="8" />
      </svg>
    ),
  },
};

function ToastItem({ toast, onRemove }) {
  const [visible, setVisible] = useState(false);
  const cfg = TOAST_CONFIGS[toast.type] ?? TOAST_CONFIGS.info;

  useEffect(() => {
    // Mount → slide in
    const t1 = setTimeout(() => setVisible(true), 10);
    // Before auto-dismiss → start fade out
    const t2 = setTimeout(() => setVisible(false), toast.duration - 400);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [toast.duration]);

  return (
    <div
      role="alert"
      aria-live="polite"
      className={`
        relative flex items-start gap-3 w-full max-w-sm
        ${cfg.bg} ${cfg.border}
        rounded-xl border shadow-lg overflow-hidden
        transition-all duration-300 ease-out
        ${visible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8'}
      `}
    >
      {/* Colored left bar */}
      <div className={`absolute left-0 top-0 bottom-0 w-1 ${cfg.bar} rounded-l-xl`} />

      <div className="flex items-start gap-3 p-4 pl-5 flex-1 min-w-0">
        {/* Icon */}
        <div className={`w-7 h-7 rounded-full ${cfg.iconBg} ${cfg.iconColor} flex items-center justify-center shrink-0 mt-0.5`}>
          {cfg.icon}
        </div>

        {/* Message */}
        <p className={`text-sm font-medium leading-relaxed flex-1 min-w-0 ${cfg.messageColor}`}>
          {toast.message}
        </p>
      </div>

      {/* Close button */}
      <button
        onClick={() => onRemove(toast.id)}
        className="p-2 mt-2 mr-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors shrink-0"
        aria-label="Dismiss"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>
    </div>
  );
}

export default function ToastContainer({ toasts, onRemove }) {
  if (!toasts.length) return null;
  return (
    <div
      className="fixed top-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none"
      aria-label="Notifications"
    >
      {toasts.map((toast) => (
        <div key={toast.id} className="pointer-events-auto">
          <ToastItem toast={toast} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
