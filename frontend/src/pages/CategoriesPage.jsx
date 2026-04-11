import { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import Layout from '../components/Layout';
import CategoryCard from '../components/CategoryCard';
import { categories as categoriesApi } from '../services/api';

const DEFAULT_COLOR = '#6366F1';

function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center px-4 animate-fadeIn">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto animate-fadeInScale border border-gray-100 dark:border-slate-700">
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

function CategoryForm({ initialData, onSubmit, onCancel, loading }) {
  const { t } = useTranslation(['categories', 'common']);
  const [name, setName] = useState(initialData?.name ?? '');
  const [description, setDescription] = useState(initialData?.description ?? '');
  const [color, setColor] = useState(initialData?.color ?? DEFAULT_COLOR);
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = t('categories:name_required');
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const e2 = validate();
    if (Object.keys(e2).length > 0) { setErrors(e2); return; }
    onSubmit({ name: name.trim(), description: description.trim() || null, color });
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {/* Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
          {t('common:name')} <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={name}
          onChange={(e) => { setName(e.target.value); setErrors((p) => ({ ...p, name: '' })); }}
          placeholder={t('categories:category_name_placeholder')}
          className={`w-full px-3 py-2.5 text-sm border rounded-xl outline-none transition-colors dark:text-gray-100 ${
            errors.name
              ? 'border-red-400 bg-red-50 focus:border-red-500 dark:bg-red-900/20 dark:border-red-600'
              : 'border-gray-200 dark:border-slate-600 focus:border-indigo-400 bg-white dark:bg-slate-700'
          }`}
          autoFocus
        />
        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
      </div>

      {/* Description */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('common:description')}</label>
        <input
          type="text"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder={t('categories:category_description_placeholder')}
          className="w-full px-3 py-2.5 text-sm border border-gray-200 dark:border-slate-600 rounded-xl outline-none focus:border-indigo-400 transition-colors bg-white dark:bg-slate-700 text-gray-900 dark:text-gray-100"
        />
      </div>

      {/* Color */}
      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">{t('common:color')}</label>
        <div className="flex items-center gap-3">
          <input
            type="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-10 h-10 rounded-xl border border-gray-200 cursor-pointer p-0.5 bg-white"
          />
          <div
            className="flex-1 h-10 rounded-xl border border-gray-200"
            style={{ backgroundColor: color + '30', borderColor: color + '60' }}
          >
            <div className="h-full flex items-center px-3">
              <span className="text-xs font-mono font-medium" style={{ color }}>{color.toUpperCase()}</span>
            </div>
          </div>
        </div>

        {/* Preset colors */}
        <div className="flex gap-2 mt-2 flex-wrap">
          {['#6366F1', '#8B5CF6', '#EC4899', '#EF4444', '#F97316', '#EAB308', '#22C55E', '#06B6D4', '#3B82F6', '#64748B'].map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-7 h-7 rounded-lg transition-transform hover:scale-110 active:scale-95 ${color === c ? 'ring-2 ring-offset-2 ring-gray-400' : ''}`}
              style={{ backgroundColor: c }}
              aria-label={`Select color ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
        >
          {t('common:cancel')}
        </button>
        <button
          type="submit"
          disabled={loading}
          className="flex-1 px-4 py-2.5 text-sm font-semibold text-white rounded-xl transition-all disabled:opacity-60 flex items-center justify-center gap-2"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          {loading && (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {initialData ? t('categories:save_changes') : t('categories:create_category')}
        </button>
      </div>
    </form>
  );
}

function EmptyState() {
  const { t } = useTranslation('categories');
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <div className="w-16 h-16 rounded-2xl bg-indigo-50 flex items-center justify-center mb-4">
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#6366F1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      </div>
      <h3 className="text-gray-900 dark:text-gray-100 font-semibold text-base mb-1">{t('no_categories')}</h3>
      <p className="text-gray-400 dark:text-gray-500 text-sm">{t('no_categories_subtitle')}</p>
    </div>
  );
}

export default function CategoriesPage({ user, onLogout }) {
  const { t } = useTranslation(['categories', 'common']);

  const [categoryList, setCategoryList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await categoriesApi.list();
      setCategoryList(res.data?.categories ?? res.data ?? []);
    } catch (err) {
      setError(err.response?.data?.message || t('categories:failed_to_load'));
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => { fetchCategories(); }, [fetchCategories]);

  const showSuccess = (msg) => {
    setSuccess(msg);
    setTimeout(() => setSuccess(null), 3000);
  };

  const handleCreate = async (data) => {
    setFormLoading(true);
    setError(null);
    try {
      await categoriesApi.create(data);
      setShowForm(false);
      showSuccess(t('categories:category_created'));
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || t('categories:failed_to_create'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleUpdate = async (data) => {
    setFormLoading(true);
    setError(null);
    try {
      await categoriesApi.update(editingCategory.id, data);
      setEditingCategory(null);
      showSuccess(t('categories:category_updated'));
      fetchCategories();
    } catch (err) {
      setError(err.response?.data?.message || t('categories:failed_to_update'));
    } finally {
      setFormLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t('categories:delete_confirm'))) return;
    setError(null);
    try {
      await categoriesApi.delete(id);
      setCategoryList((prev) => prev.filter((c) => c.id !== id));
      showSuccess(t('categories:category_deleted'));
    } catch (err) {
      setError(err.response?.data?.message || t('categories:failed_to_delete'));
    }
  };

  return (
    <Layout user={user} onLogout={onLogout}>
      {/* Header */}
      <div className="flex items-center justify-between mb-8 gap-4">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 leading-tight">{t('categories:my_categories')}</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-0.5">
            {loading
              ? t('common:loading')
              : t('categories:category_count', { count: categoryList.length })}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditingCategory(null); }}
          className="flex items-center gap-2 px-4 py-2.5 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:shadow-md shadow-sm shrink-0 min-h-[44px]"
          style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
          </svg>
          <span className="hidden sm:inline">{t('categories:new_category')}</span>
        </button>
      </div>

      {/* Success toast */}
      {success && (
        <div className="mb-5 flex items-center gap-2.5 p-3.5 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm animate-fadeIn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <polyline points="20 6 9 17 4 12" />
          </svg>
          {success}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fadeIn">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          <span className="flex-1">{error}</span>
          <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600 transition-colors shrink-0">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>
      )}

      {/* List */}
      {loading ? (
        <div className="space-y-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="bg-white dark:bg-slate-800 rounded-xl border border-gray-200 dark:border-slate-700 p-4 flex items-center gap-4">
              <div className="skeleton w-11 h-11 rounded-xl shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="skeleton h-4 w-1/3 rounded" />
                <div className="skeleton h-3 w-1/2 rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : categoryList.length === 0 ? (
        <EmptyState />
      ) : (
        <div>
          {categoryList.map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onEdit={(c) => { setEditingCategory(c); setShowForm(false); }}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Create modal */}
      {showForm && (
        <Modal title={t('categories:new_category')} onClose={() => setShowForm(false)}>
          <CategoryForm
            onSubmit={handleCreate}
            onCancel={() => setShowForm(false)}
            loading={formLoading}
          />
        </Modal>
      )}

      {/* Edit modal */}
      {editingCategory && (
        <Modal title={t('categories:edit_category')} onClose={() => setEditingCategory(null)}>
          <CategoryForm
            initialData={editingCategory}
            onSubmit={handleUpdate}
            onCancel={() => setEditingCategory(null)}
            loading={formLoading}
          />
        </Modal>
      )}
    </Layout>
  );
}
