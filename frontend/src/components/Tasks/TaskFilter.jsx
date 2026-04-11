import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

const PRIORITY_OPTIONS = ['low', 'medium', 'high'];

const inputClass = 'w-full px-3 py-2.5 border border-gray-200 dark:border-slate-600 rounded-xl text-sm text-gray-800 dark:text-gray-200 bg-white dark:bg-slate-700 outline-none transition-all duration-200 focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 focus:border-indigo-400 appearance-none';
const labelClass = 'block text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1.5 uppercase tracking-wide';

const EMPTY = { priority: '', categoryId: '', tagId: '', isCompleted: '', sortBy: 'createdAt' };

export default function TaskFilter({ onFilter, categories = [], tags = [], activeTagId = '' }) {
  const { t } = useTranslation(['tasks', 'common']);

  const SORT_OPTIONS = [
    { value: 'createdAt', label: t('tasks:sort_created_date') },
    { value: 'dueDate',   label: t('tasks:sort_due_date') },
    { value: 'priority',  label: t('tasks:sort_priority') },
    { value: 'title',     label: t('tasks:sort_title') },
  ];

  const [filters, setFilters] = useState({ ...EMPTY });
  const [expanded, setExpanded] = useState(false);

  // When parent sets an activeTagId (from tag click in card), reflect it in the filter state
  useEffect(() => {
    if (activeTagId !== undefined && activeTagId !== filters.tagId) {
      const next = { ...filters, tagId: activeTagId };
      setFilters(next);
      const payload = buildPayload(next);
      onFilter(payload);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTagId]);

  const buildPayload = (f) => {
    const payload = {};
    if (f.priority) payload.priority = f.priority;
    if (f.categoryId) payload.categoryId = Number(f.categoryId);
    if (f.tagId) payload.tagId = Number(f.tagId);
    if (f.isCompleted !== '') payload.isCompleted = f.isCompleted === 'true';
    if (f.sortBy) payload.sortBy = f.sortBy;
    return payload;
  };

  const activeCount = [
    filters.priority,
    filters.categoryId,
    filters.tagId,
    filters.isCompleted,
    filters.sortBy !== 'createdAt' ? filters.sortBy : '',
  ].filter(Boolean).length;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilters((f) => ({
      ...f,
      [name]: type === 'checkbox' ? (checked ? 'true' : '') : value,
    }));
  };

  const handleApply = () => {
    onFilter(buildPayload(filters));
    setExpanded(false);
  };

  const handleClear = () => {
    setFilters({ ...EMPTY });
    onFilter({});
  };

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 shadow-sm overflow-hidden">
      {/* Mobile toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="md:hidden w-full flex items-center justify-between px-4 py-3 text-sm font-semibold text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors"
        aria-expanded={expanded}
        aria-controls="filter-panel"
      >
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
          {t('tasks:filters')}
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 text-xs font-bold text-white rounded-full" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
              {activeCount}
            </span>
          )}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="16"
          height="16"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-400 transition-transform duration-200 ${expanded ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Filter controls */}
      <div
        id="filter-panel"
        className={`md:block overflow-hidden transition-all duration-200 ${expanded ? 'max-h-[500px]' : 'max-h-0 md:max-h-none'}`}
      >
        <div className="flex flex-wrap gap-4 items-end p-4 border-t border-gray-100 dark:border-slate-700 md:border-t-0">
          {/* Priority */}
          <div className="flex-1 min-w-[130px]">
            <label className={labelClass}>{t('tasks:priority')}</label>
            <select name="priority" value={filters.priority} onChange={handleChange} className={inputClass}>
              <option value="">{t('tasks:all_priorities')}</option>
              {PRIORITY_OPTIONS.map((p) => (
                <option key={p} value={p}>{t(`tasks:${p}`)}</option>
              ))}
            </select>
          </div>

          {/* Category */}
          {categories.length > 0 && (
            <div className="flex-1 min-w-[130px]">
              <label className={labelClass}>{t('tasks:category')}</label>
              <select name="categoryId" value={filters.categoryId} onChange={handleChange} className={inputClass}>
                <option value="">{t('tasks:all_categories')}</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Tag filter */}
          {tags.length > 0 && (
            <div className="flex-1 min-w-[130px]">
              <label className={labelClass}>{t('tasks:tag')}</label>
              <select name="tagId" value={filters.tagId} onChange={handleChange} className={inputClass}>
                <option value="">{t('tasks:all_tags')}</option>
                {tags.map((tag) => (
                  <option key={tag.id} value={tag.id}>
                    {tag.name}
                  </option>
                ))}
              </select>
              {/* Active tag chip */}
              {filters.tagId && (() => {
                const activeTag = tags.find((tg) => String(tg.id) === String(filters.tagId));
                return activeTag ? (
                  <div className="mt-1.5 flex items-center gap-1.5">
                    <span
                      className="inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: (activeTag.color ?? '#6B7280') + '18',
                        borderColor:     (activeTag.color ?? '#6B7280') + '55',
                        color:            activeTag.color ?? '#6B7280',
                      }}
                    >
                      <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: activeTag.color ?? '#6B7280' }} />
                      {activeTag.name}
                    </span>
                  </div>
                ) : null;
              })()}
            </div>
          )}

          {/* Sort */}
          <div className="flex-1 min-w-[130px]">
            <label className={labelClass}>{t('tasks:sort_by')}</label>
            <select name="sortBy" value={filters.sortBy} onChange={handleChange} className={inputClass}>
              {SORT_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>{o.label}</option>
              ))}
            </select>
          </div>

          {/* Completed */}
          <div className="flex items-center gap-2 py-2 min-h-[44px]">
            <input
              type="checkbox"
              id="isCompleted"
              name="isCompleted"
              checked={filters.isCompleted === 'true'}
              onChange={handleChange}
              className="w-4 h-4 rounded border-gray-300 text-indigo-600 accent-indigo-600 cursor-pointer"
            />
            <label htmlFor="isCompleted" className="text-sm text-gray-700 dark:text-gray-300 whitespace-nowrap font-medium cursor-pointer">
              {t('tasks:completed_only')}
            </label>
          </div>

          {/* Buttons */}
          <div className="flex gap-2">
            <button
              onClick={handleApply}
              className="px-5 py-2.5 text-white text-sm font-semibold rounded-xl transition-all duration-200 hover:opacity-90 hover:shadow-md min-h-[44px]"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
            >
              {t('common:apply')}
            </button>
            <button
              onClick={handleClear}
              className="px-5 py-2.5 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 text-sm font-semibold rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors min-h-[44px]"
            >
              {t('common:clear')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
