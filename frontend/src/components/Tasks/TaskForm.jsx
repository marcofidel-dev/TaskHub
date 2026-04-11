import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import TagSelector from '../TagSelector';
import CategorySelector from '../CategorySelector';

const PRIORITIES = ['low', 'medium', 'high'];

const PRIORITY_STYLES = {
  low:    'text-emerald-600',
  medium: 'text-amber-600',
  high:   'text-red-600',
};

const inputClass = 'w-full px-4 py-3 border rounded-xl text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 bg-white dark:bg-slate-700 text-sm transition-all duration-200 outline-none focus:ring-2 focus:border-transparent';
const labelClass = 'block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1.5';
const errorClass = 'text-red-500 text-xs mt-1.5 flex items-center gap-1';

const TITLE_MAX = 255;
const DESC_MAX  = 2000;

export default function TaskForm({
  onSubmit,
  onCancel,
  initialData = null,
  loading,
  categories = [],
  tags = [],
}) {
  const { t } = useTranslation(['tasks', 'common']);

  const [form, setForm] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: '',
    categoryId: '',
  });
  const [selectedTagIds, setSelectedTagIds] = useState([]);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setForm({
        title: initialData.title ?? '',
        description: initialData.description ?? '',
        priority: (initialData.priority ?? 'medium').toLowerCase(),
        dueDate: initialData.dueDate ? initialData.dueDate.split('T')[0] : '',
        categoryId: initialData.category?.id ?? initialData.categoryId ?? '',
      });
      setSelectedTagIds(
        Array.isArray(initialData.tags)
          ? initialData.tags.map((tg) => tg.id)
          : [],
      );
    }
  }, [initialData]);

  const validate = () => {
    const errs = {};
    if (!form.title.trim()) {
      errs.title = t('tasks:title_required');
    } else if (form.title.trim().length > TITLE_MAX) {
      errs.title = t('tasks:title_too_long', { max: TITLE_MAX });
    }
    if (form.description && form.description.length > DESC_MAX) {
      errs.description = t('tasks:description_too_long', { max: DESC_MAX });
    }
    return errs;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setErrors((v) => ({ ...v, [e.target.name]: undefined }));
  };

  const handleCategoryChange = (id) => {
    setForm((f) => ({ ...f, categoryId: id }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }
    onSubmit({
      title: form.title.trim(),
      description: form.description.trim() || undefined,
      priority: form.priority.toUpperCase(),
      dueDate: form.dueDate || undefined,
      categoryId: form.categoryId ? Number(form.categoryId) : null,
      tagIds: selectedTagIds,
    });
  };

  const descLen = form.description.length;
  const descNearLimit = descLen > DESC_MAX * 0.85;

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Title */}
      <div>
        <label className={labelClass}>
          {t('tasks:task_title')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder={t('tasks:task_title_placeholder')}
          autoFocus
          maxLength={TITLE_MAX + 10}
          className={`${inputClass} ${
            errors.title
              ? 'border-red-400 dark:border-red-600 focus:ring-red-200 dark:focus:ring-red-900'
              : 'border-gray-200 dark:border-slate-600 focus:ring-indigo-200 dark:focus:ring-indigo-700'
          }`}
        />
        <div className="flex items-center justify-between mt-1.5">
          {errors.title ? (
            <p className={errorClass}>
              <span>⚠</span> {errors.title}
            </p>
          ) : (
            <span />
          )}
          <span className={`text-xs ml-auto ${form.title.length > TITLE_MAX ? 'text-red-500' : 'text-gray-400'}`}>
            {form.title.length}/{TITLE_MAX}
          </span>
        </div>
      </div>

      {/* Description */}
      <div>
        <label className={labelClass}>
          {t('tasks:task_description')}{' '}
          <span className="text-gray-400 font-normal text-xs">({t('common:optional')})</span>
        </label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder={t('tasks:task_description_placeholder')}
          rows={3}
          maxLength={DESC_MAX + 10}
          className={`${inputClass} resize-none ${
            errors.description
              ? 'border-red-400 dark:border-red-600 focus:ring-red-200 dark:focus:ring-red-900'
              : 'border-gray-200 dark:border-slate-600 focus:ring-indigo-200 dark:focus:ring-indigo-700'
          }`}
        />
        <div className="flex items-center justify-between mt-1.5">
          {errors.description ? (
            <p className={errorClass}>
              <span>⚠</span> {errors.description}
            </p>
          ) : (
            <span />
          )}
          <span className={`text-xs ml-auto ${descLen > DESC_MAX ? 'text-red-500' : descNearLimit ? 'text-amber-500' : 'text-gray-400'}`}>
            {descLen}/{DESC_MAX}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Priority */}
        <div>
          <label className={labelClass}>{t('tasks:priority')}</label>
          <select
            name="priority"
            value={form.priority}
            onChange={handleChange}
            className={`${inputClass} border-gray-200 dark:border-slate-600 focus:ring-indigo-200 dark:focus:ring-indigo-700 ${PRIORITY_STYLES[form.priority] ?? ''}`}
          >
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{t(`tasks:${p}`)}</option>
            ))}
          </select>
        </div>

        {/* Due date */}
        <div>
          <label className={labelClass}>{t('tasks:due_date')}</label>
          <input
            type="date"
            name="dueDate"
            value={form.dueDate}
            onChange={handleChange}
            className={`${inputClass} border-gray-200 dark:border-slate-600 focus:ring-indigo-200 dark:focus:ring-indigo-700`}
          />
        </div>
      </div>

      {/* Category */}
      {categories.length > 0 && (
        <div>
          <label className={labelClass}>{t('tasks:category')}</label>
          <CategorySelector
            categories={categories}
            value={form.categoryId}
            onChange={handleCategoryChange}
          />
        </div>
      )}

      {/* Tags */}
      {tags.length > 0 && (
        <div>
          <label className={labelClass}>{t('tasks:tags')}</label>
          <TagSelector
            tags={tags}
            selectedIds={selectedTagIds}
            onChange={setSelectedTagIds}
          />
        </div>
      )}

      {/* Buttons */}
      <div className="flex gap-3 pt-1">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 py-3 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          {loading ? (
            <span className="flex items-center justify-center gap-2">
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              {t('tasks:saving')}
            </span>
          ) : (
            initialData ? t('tasks:save_changes') : t('tasks:create_task')
          )}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={loading}
          className="px-6 py-3 text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors disabled:opacity-50"
        >
          {t('common:cancel')}
        </button>
      </div>
    </form>
  );
}
