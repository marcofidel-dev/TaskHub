import { useTranslation } from 'react-i18next';
import TaskCard from './TaskCard';

function EmptyState({ hasFilters, onClearFilters }) {
  const { t } = useTranslation('tasks');

  if (hasFilters) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
        <div className="w-14 h-14 rounded-2xl flex items-center justify-center mb-4 bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-slate-500">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        </div>
        <h3 className="text-gray-700 dark:text-gray-300 font-semibold text-base mb-1">{t('no_results_title')}</h3>
        <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs mb-5">{t('no_results_desc')}</p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 dark:bg-indigo-900/30 dark:text-indigo-400 dark:hover:bg-indigo-900/50 rounded-lg transition-colors"
          >
            {t('clear_filters')}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center py-20 text-center animate-fadeIn">
      {/* Illustration */}
      <div className="relative mb-6">
        <div className="w-20 h-20 rounded-3xl flex items-center justify-center text-indigo-500" style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        {/* Decorative dots */}
        <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-200 rounded-full opacity-60" />
        <span className="absolute -bottom-1 -left-1 w-3 h-3 bg-violet-200 rounded-full opacity-60" />
      </div>

      <h3 className="text-gray-800 dark:text-gray-200 font-bold text-lg mb-2">{t('no_tasks')}</h3>
      <p className="text-gray-400 dark:text-gray-500 text-sm max-w-xs leading-relaxed">{t('no_tasks_hint')}</p>
    </div>
  );
}

export default function TaskList({ tasks, onDelete, onTaskUpdate, onEdit, onTagFilter, hasFilters = false, onClearFilters }) {
  if (!tasks || tasks.length === 0) {
    return <EmptyState hasFilters={hasFilters} onClearFilters={onClearFilters} />;
  }

  return (
    <div className="space-y-2.5">
      {tasks.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          onDelete={onDelete}
          onTaskUpdate={onTaskUpdate}
          onEdit={onEdit}
          onTagFilter={onTagFilter}
        />
      ))}
    </div>
  );
}
