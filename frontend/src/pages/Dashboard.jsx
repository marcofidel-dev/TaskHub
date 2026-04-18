import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import TaskList from '../components/Tasks/TaskList';
import TaskForm from '../components/Tasks/TaskForm';
import TaskFilter from '../components/Tasks/TaskFilter';
import ConfirmModal from '../components/ConfirmModal';
import { tasks as tasksApi, categories as categoriesApi, tags as tagsApi } from '../services/api';
import { useToast } from '../context/ToastContext';

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto animate-fadeInScale border border-gray-100 dark:border-slate-700">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-slate-700">
          <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-700 transition-colors"
            aria-label="Close"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-5 flex flex-col gap-3">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1">
          <div className="skeleton w-5 h-5 rounded-full mt-0.5 shrink-0" />
          <div className="skeleton h-4 w-2/3 rounded" />
        </div>
        <div className="skeleton h-5 w-14 rounded-full" />
      </div>
      <div className="skeleton h-3 w-full rounded pl-8" />
      <div className="flex gap-2 pl-8">
        <div className="skeleton h-3 w-16 rounded" />
        <div className="skeleton h-3 w-20 rounded" />
      </div>
    </div>
  );
}

export default function Dashboard({ user, onLogout }) {
  const { t } = useTranslation(['tasks', 'auth', 'common']);
  const { showToast } = useToast();

  const [taskList, setTaskList]         = useState([]);
  const [categories, setCategories]     = useState([]);
  const [tagsList, setTagsList]         = useState([]);
  const [loadingTasks, setLoadingTasks] = useState(true);
  const [formLoading, setFormLoading]   = useState(false);
  const [showForm, setShowForm]         = useState(false);
  const [editingTask, setEditingTask]   = useState(null);
  const [activeFilters, setActiveFilters] = useState({});
  const [activeTagId, setActiveTagId]   = useState('');

  // Confirm-delete modal state
  const [confirmDelete, setConfirmDelete] = useState({ open: false, taskId: null });

  const fetchTasks = useCallback(async (filters = {}) => {
    setLoadingTasks(true);
    try {
      // Always use the filter endpoint — it returns full details (tags + category)
      const res = await tasksApi.listFull(filters);
      const raw = res.data?.tasks ?? res.data ?? [];
      setTaskList(raw.map((task) => {
        const completed = task.completed ?? task.isCompleted ?? false;
        return { ...task, completed, isCompleted: completed };
      }));
    } catch (err) {
      showToast('error', err.response?.data?.message || t('tasks:failed_to_load'));
    } finally {
      setLoadingTasks(false);
    }
  }, [t, showToast]);

  const fetchCategories = useCallback(async () => {
    try {
      const res = await categoriesApi.list();
      setCategories(res.data?.categories ?? res.data ?? []);
    } catch {
      // silent
    }
  }, []);

  const fetchTags = useCallback(async () => {
    try {
      const res = await tagsApi.list();
      setTagsList(res.data?.tags ?? res.data ?? []);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchCategories();
    fetchTags();
  }, [fetchTasks, fetchCategories, fetchTags]);

  const handleFilter = (filters) => {
    setActiveFilters(filters);
    setActiveTagId(filters.tagId ? String(filters.tagId) : '');
    fetchTasks(filters);
  };

  const handleTagFilter = (tagId) => {
    const next = { ...activeFilters, tagId };
    setActiveFilters(next);
    setActiveTagId(String(tagId));
    fetchTasks(next);
  };

  const handleCreate = async (data) => {
    setFormLoading(true);
    try {
      await tasksApi.create(data);
      setShowForm(false);
      await fetchTasks(activeFilters);
      showToast('success', t('tasks:task_created'));
    } catch (err) {
      showToast('error', err.response?.data?.message || t('tasks:failed_to_create'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    try {
      await tasksApi.update(editingTask.id, data);
      setEditingTask(null);
      await fetchTasks(activeFilters);
      showToast('success', t('tasks:task_updated'));
    } catch (err) {
      showToast('error', err.response?.data?.message || t('tasks:failed_to_update'));
    } finally {
      setFormLoading(false);
    }
  };

  // Step 1: request delete → open confirm modal
  const handleDeleteRequest = (taskId) => {
    setConfirmDelete({ open: true, taskId });
  };

  // Step 2: confirmed → actually delete
  const handleDeleteConfirm = async () => {
    const { taskId } = confirmDelete;
    setConfirmDelete({ open: false, taskId: null });
    try {
      await tasksApi.delete(taskId);
      setTaskList((prev) => prev.filter((task) => task.id !== taskId));
      showToast('success', t('tasks:task_deleted'));
    } catch (err) {
      showToast('error', err.response?.data?.message || t('tasks:failed_to_delete'));
    }
  };

  const handleTaskUpdate = useCallback(() => {
    fetchTasks(activeFilters);
  }, [fetchTasks, activeFilters]);

  const completedCount  = taskList.filter((task) => task.completed).length;
  const pendingCount    = taskList.filter((task) => !task.completed).length;
  const progressPercent = taskList.length > 0 ? Math.round((completedCount / taskList.length) * 100) : 0;
  const hasActiveFilters = Object.keys(activeFilters).length > 0;

  const hour = new Date().getHours();
  const greeting = hour < 12
    ? t('auth:good_morning')
    : hour < 18
    ? t('auth:good_afternoon')
    : t('auth:good_evening');

  const statCards = [
    {
      label: t('tasks:stat_total'),
      value: taskList.length,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="8" y1="6" x2="21" y2="6" /><line x1="8" y1="12" x2="21" y2="12" /><line x1="8" y1="18" x2="21" y2="18" />
          <line x1="3" y1="6" x2="3.01" y2="6" /><line x1="3" y1="12" x2="3.01" y2="12" /><line x1="3" y1="18" x2="3.01" y2="18" />
        </svg>
      ),
      accent: 'text-indigo-600', bg: 'bg-indigo-50', border: 'border-indigo-100',
    },
    {
      label: t('tasks:stat_pending'),
      value: pendingCount,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" /><polyline points="12 6 12 12 16 14" />
        </svg>
      ),
      accent: 'text-amber-600', bg: 'bg-amber-50', border: 'border-amber-100',
    },
    {
      label: t('tasks:stat_completed'),
      value: completedCount,
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="20 6 9 17 4 12" />
        </svg>
      ),
      accent: 'text-emerald-600', bg: 'bg-emerald-50', border: 'border-emerald-100',
    },
  ];

  const subtitle = pendingCount > 0
    ? t('tasks:pending_count', { count: pendingCount })
      + (completedCount > 0 ? ` · ${t('tasks:completed_count', { count: completedCount })}` : '')
    : t('tasks:all_caught_up');

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">
            {greeting}, {user?.username ?? 'there'}
          </h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">{subtitle}</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingTask(null); }}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:shadow-md shadow-sm shrink-0 min-h-[44px]"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="hidden sm:inline">{t('tasks:new_task')}</span>
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-3 md:gap-4 mb-4">
        {statCards.map(({ label, value, icon, accent, bg, border }) => (
          <div key={label} className={`bg-white dark:bg-slate-800 rounded-xl border ${border} dark:border-slate-700 p-3 md:p-4 flex flex-col gap-2.5 shadow-sm hover:shadow-md transition-all duration-200 hover:-translate-y-px`}>
            <div className={`w-8 h-8 md:w-9 md:h-9 ${bg} ${accent} rounded-xl flex items-center justify-center shrink-0`}>
              {icon}
            </div>
            <div>
              <p className={`text-xl md:text-2xl font-bold ${accent}`}>{value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5 leading-tight">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      {taskList.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-100 dark:border-slate-700 px-4 py-3 mb-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400">{t('tasks:progress_label')}</span>
            <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">{progressPercent}%</span>
          </div>
          <div className="w-full h-2 bg-gray-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500 ease-out"
              style={{
                width: `${progressPercent}%`,
                background: progressPercent === 100
                  ? 'linear-gradient(90deg, #10B981, #059669)'
                  : 'linear-gradient(90deg, #4F46E5, #7C3AED)',
              }}
            />
          </div>
          {progressPercent === 100 && (
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-semibold mt-1.5 flex items-center gap-1">
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
              {t('tasks:all_caught_up')}
            </p>
          )}
        </div>
      )}

      {/* Filters */}
      <div className="mb-5">
        <TaskFilter
          onFilter={handleFilter}
          categories={categories}
          tags={tagsList}
          activeTagId={activeTagId}
        />
      </div>

      {/* Section header */}
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">
          {t('tasks:my_tasks')}
        </h2>
        {!loadingTasks && taskList.length > 0 && (
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">
            {taskList.length} {taskList.length === 1 ? t('common:task_count_one', { count: taskList.length }) : t('common:task_count_other', { count: taskList.length })}
          </span>
        )}
      </div>

      {/* Task list */}
      {loadingTasks ? (
        <div className="space-y-2.5">
          {[...Array(4)].map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <TaskList
          tasks={taskList}
          onDelete={handleDeleteRequest}
          onTaskUpdate={handleTaskUpdate}
          onEdit={(task) => { setEditingTask(task); setShowForm(false); }}
          onTagFilter={handleTagFilter}
          hasFilters={hasActiveFilters}
          onClearFilters={() => { handleFilter({}); }}
        />
      )}

      {/* Create modal */}
      {showForm && (
        <Modal title={t('tasks:new_task')} onClose={() => setShowForm(false)}>
          <TaskForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            loading={formLoading}
            categories={categories}
            tags={tagsList}
          />
        </Modal>
      )}

      {/* Edit modal */}
      {editingTask && (
        <Modal title={t('tasks:edit_task')} onClose={() => setEditingTask(null)}>
          <TaskForm
            initialData={editingTask}
            onSubmit={handleUpdate}
            onCancel={() => setEditingTask(null)}
            loading={formLoading}
            categories={categories}
            tags={tagsList}
          />
        </Modal>
      )}

      {/* Confirm delete modal */}
      <ConfirmModal
        isOpen={confirmDelete.open}
        title={t('common:confirm_delete')}
        message={t('common:delete_confirmation')}
        confirmLabel={t('common:delete')}
        cancelLabel={t('common:cancel')}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setConfirmDelete({ open: false, taskId: null })}
        variant="danger"
      />
    </Layout>
  );
}
