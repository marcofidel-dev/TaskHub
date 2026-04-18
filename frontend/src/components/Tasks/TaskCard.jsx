import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { tasks as tasksApi } from '../../services/api';

const SWIPE_THRESHOLD = 50;
const ACTIONS_WIDTH   = 160;

const PRIORITY_CONFIG = {
  high:   { labelKey: 'tasks:high',   classes: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800',            dot: 'bg-red-500',    accent: '#EF4444' },
  medium: { labelKey: 'tasks:medium', classes: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800', dot: 'bg-amber-500',  accent: '#F59E0B' },
  low:    { labelKey: 'tasks:low',    classes: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800', dot: 'bg-emerald-500', accent: '#10B981' },
};

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" /><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);
const CheckIcon = ({ size = 13 }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);
const UndoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" /><path d="M3 3v5h5" />
  </svg>
);
const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6" /><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /><path d="M10 11v6" /><path d="M14 11v6" /><path d="M9 6V4h6v2" />
  </svg>
);
const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
  </svg>
);

export default function TaskCard({ task, onDelete, onTaskUpdate, onEdit, onTagFilter }) {
  const { t, i18n } = useTranslation(['tasks', 'common']);

  const normalizedPriority = (task.priority ?? '').toLowerCase();
  const priorityConfig     = PRIORITY_CONFIG[normalizedPriority];
  const isOverdue          = task.dueDate && !task.isCompleted && new Date(task.dueDate) < new Date();

  /* ── swipe state ─────────────────────────────────────────── */
  const [dragX, setDragX]     = useState(0);
  const [isOpen, setIsOpen]   = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const startXRef    = useRef(0);
  const startYRef    = useRef(0);
  const lockedAxis   = useRef(null);

  const resolvedX = isDragging ? dragX : (isOpen ? ACTIONS_WIDTH : 0);

  useEffect(() => {
    if (!isOpen) return;
    const onOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) closeActions();
    };
    document.addEventListener('pointerdown', onOutside);
    return () => document.removeEventListener('pointerdown', onOutside);
  }, [isOpen]);

  const handleTouchStart = (e) => {
    startXRef.current  = e.touches[0].clientX;
    startYRef.current  = e.touches[0].clientY;
    lockedAxis.current = null;
    setIsDragging(true);
    setDragX(isOpen ? ACTIONS_WIDTH : 0);
  };

  const handleTouchMove = (e) => {
    const dx = startXRef.current - e.touches[0].clientX;
    const dy = Math.abs(startYRef.current - e.touches[0].clientY);
    if (!lockedAxis.current) {
      if (Math.abs(dx) > 5 || dy > 5) lockedAxis.current = Math.abs(dx) > dy ? 'horizontal' : 'vertical';
      return;
    }
    if (lockedAxis.current !== 'horizontal') return;
    e.preventDefault();
    const base = isOpen ? ACTIONS_WIDTH : 0;
    setDragX(Math.max(0, Math.min(ACTIONS_WIDTH, base + dx)));
  };

  const handleTouchEnd = () => {
    setIsDragging(false);
    if (dragX > SWIPE_THRESHOLD) {
      setIsOpen(true);
      setDragX(ACTIONS_WIDTH);
      if (navigator.vibrate) navigator.vibrate(40);
    } else {
      setIsOpen(false);
      setDragX(0);
    }
  };

  const closeActions = () => { setIsOpen(false); setDragX(0); setIsDragging(false); };

  const handleComplete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      await tasksApi.complete(task.id);
      if (onTaskUpdate) onTaskUpdate();
    } catch (err) {
      console.error('Error completing task:', err);
    }
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return null;
    return new Date(dateStr).toLocaleDateString(i18n.language, { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const transition    = isDragging ? 'none' : 'transform 200ms ease';
  const contentStyle  = { transform: `translateX(-${resolvedX}px)`, transition };
  const panelStyle    = { transform: `translateX(${ACTIONS_WIDTH - resolvedX}px)`, transition, opacity: resolvedX > 0 ? 1 : 0, pointerEvents: resolvedX > 0 ? 'auto' : 'none' };

  /* ── left accent color by priority / state ───────────────── */
  const accentColor = task.isCompleted
    ? '#D1D5DB'
    : isOverdue
    ? '#EF4444'
    : priorityConfig?.accent ?? '#E5E7EB';

  return (
    <div
      ref={containerRef}
      className={`group relative rounded-xl overflow-hidden animate-fadeIn transition-all duration-200 ${
        isOpen ? 'shadow-lg' : 'shadow-sm hover:shadow-md hover:-translate-y-px'
      } ${task.isCompleted ? 'opacity-70' : ''}`}
      style={{ border: '1px solid', borderColor: isOverdue && !task.isCompleted ? '#FECACA' : '#E5E7EB' }}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onKeyDown={(e) => e.key === 'Escape' && closeActions()}
    >
      {/* Priority accent bar */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 rounded-l-xl z-10 pointer-events-none"
        style={{ backgroundColor: accentColor }}
      />

      {/* ── SWIPE ACTION PANEL (mobile) ───────────────────── */}
      <div
        className="absolute right-0 top-0 bottom-0 flex items-stretch"
        style={{ width: ACTIONS_WIDTH, ...panelStyle }}
        aria-hidden={!isOpen}
      >
        <button
          onClick={() => { onEdit(task); closeActions(); }}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-indigo-500 hover:bg-indigo-600 active:bg-indigo-700 text-white transition-colors"
          aria-label={t('common:edit')}
          tabIndex={isOpen ? 0 : -1}
        >
          <EditIcon />
          <span className="text-xs font-semibold">{t('common:edit')}</span>
        </button>
        <button
          onClick={async (e) => { await handleComplete(e); closeActions(); }}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-white transition-colors"
          aria-label={task.isCompleted ? t('common:undo') : t('tasks:done_action')}
          tabIndex={isOpen ? 0 : -1}
        >
          {task.isCompleted ? <UndoIcon /> : <CheckIcon />}
          <span className="text-xs font-semibold">{task.isCompleted ? t('common:undo') : t('tasks:done_action')}</span>
        </button>
        <button
          onClick={() => { onDelete(task.id); closeActions(); }}
          className="flex-1 flex flex-col items-center justify-center gap-1 bg-red-500 hover:bg-red-600 active:bg-red-700 text-white transition-colors"
          aria-label={t('common:delete')}
          tabIndex={isOpen ? 0 : -1}
        >
          <TrashIcon />
          <span className="text-xs font-semibold">{t('common:delete')}</span>
        </button>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────── */}
      <div
        className="bg-white dark:bg-slate-800 pl-5 pr-4 py-4 flex flex-col gap-2.5 will-change-transform"
        style={contentStyle}
      >
        {/* Row 1: checkbox + title + priority badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            {/* Complete toggle */}
            <button
              onClick={handleComplete}
              className={`mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 flex items-center justify-center transition-all duration-200 ${
                task.isCompleted
                  ? 'bg-indigo-600 border-indigo-600 text-white'
                  : 'border-gray-300 dark:border-slate-500 hover:border-indigo-400 hover:bg-indigo-50 dark:hover:bg-slate-700'
              }`}
              title={task.isCompleted ? t('common:undo') : t('common:complete')}
              aria-label={task.isCompleted ? t('common:undo') : t('common:complete')}
            >
              {task.isCompleted && <CheckIcon size={10} />}
            </button>

            {/* Title */}
            <h3 className={`font-semibold leading-snug text-sm md:text-base ${
              task.isCompleted
                ? 'line-through text-gray-400 dark:text-gray-500'
                : 'text-gray-900 dark:text-gray-100'
            }`}>
              {task.title}
            </h3>
          </div>

          {/* Priority badge */}
          {priorityConfig && (
            <span className={`inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border shrink-0 ${priorityConfig.classes}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${priorityConfig.dot}`} />
              {t(priorityConfig.labelKey)}
            </span>
          )}
        </div>

        {/* Row 2: description */}
        {task.description && (
          <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed pl-8 line-clamp-2">
            {task.description}
          </p>
        )}

        {/* Row 3: meta chips */}
        {(task.dueDate || task.category || task.tags?.length > 0) && (
          <div className="flex items-center gap-1.5 pl-8 flex-wrap">
            {/* Due date */}
            {task.dueDate && (
              <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${
                isOverdue
                  ? 'bg-red-50 text-red-600 border border-red-200 dark:bg-red-900/30 dark:text-red-400 dark:border-red-800'
                  : 'bg-gray-100 dark:bg-slate-700 text-gray-500 dark:text-gray-400'
              }`}>
                <CalendarIcon />
                {formatDate(task.dueDate)}
                {isOverdue && <span className="font-bold"> · {t('common:overdue')}</span>}
              </span>
            )}

            {/* Category */}
            {task.category && (
              <span
                className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-0.5 rounded-full border"
                style={{
                  backgroundColor: (task.category.color ?? '#4F46E5') + '18',
                  borderColor:     (task.category.color ?? '#4F46E5') + '55',
                  color:            task.category.color ?? '#4F46E5',
                }}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: task.category.color ?? '#4F46E5' }} />
                {task.category.name}
              </span>
            )}

            {/* Tags */}
            {task.tags?.map((tag) => (
              <button
                key={tag.id}
                type="button"
                onClick={() => onTagFilter?.(tag.id)}
                className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full border transition-opacity hover:opacity-75"
                style={{
                  backgroundColor: (tag.color ?? '#6B7280') + '18',
                  borderColor:     (tag.color ?? '#6B7280') + '55',
                  color:            tag.color ?? '#6B7280',
                }}
                title={t('tasks:filter_by_tag', { tag: tag.name })}
              >
                <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color ?? '#6B7280' }} />
                {tag.name}
              </button>
            ))}
          </div>
        )}

        {/* Row 4: desktop action buttons (revealed on hover) */}
        <div className="flex items-center gap-1.5 pl-8 h-0 overflow-hidden opacity-0 group-hover:h-auto group-hover:opacity-100 group-hover:mt-0.5 transition-all duration-150 touch-none pointer-events-none group-hover:pointer-events-auto">
          <button
            onClick={() => onEdit(task)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-lg hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
            aria-label={t('common:edit')}
          >
            <EditIcon /> {t('common:edit')}
          </button>

          <button
            onClick={handleComplete}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 dark:bg-indigo-900/30 dark:text-indigo-400 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
            aria-label={task.isCompleted ? t('common:undo') : t('common:complete')}
          >
            {task.isCompleted ? <><UndoIcon /> {t('common:undo')}</> : <><CheckIcon /> {t('common:complete')}</>}
          </button>

          <button
            onClick={() => onDelete(task.id)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-900/30 dark:text-red-400 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors"
            aria-label={t('common:delete')}
          >
            <TrashIcon /> {t('common:delete')}
          </button>
        </div>
      </div>
    </div>
  );
}
