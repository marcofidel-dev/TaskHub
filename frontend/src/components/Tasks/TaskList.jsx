import { useTranslation } from 'react-i18next';
import TaskCard from './TaskCard';

export default function TaskList({ tasks, onDelete, onTaskUpdate, onEdit, onTagFilter }) {
  const { t } = useTranslation('tasks');

  if (!tasks || tasks.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center animate-fadeIn">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-5 text-indigo-400" style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 11 12 14 22 4" />
            <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
        </div>
        <h3 className="text-gray-700 font-semibold text-lg mb-1">{t('no_tasks')}</h3>
        <p className="text-gray-400 text-sm max-w-xs">{t('create_first_task')}</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
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
