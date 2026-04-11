import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function TagSelector({ tags = [], selectedIds = [], onChange }) {
  const { t } = useTranslation('common');
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    if (!open) return;
    const handler = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', handler);
    return () => document.removeEventListener('pointerdown', handler);
  }, [open]);

  const toggle = (id) => {
    const next = selectedIds.includes(id)
      ? selectedIds.filter((x) => x !== id)
      : [...selectedIds, id];
    onChange(next);
  };

  const remove = (id) => onChange(selectedIds.filter((x) => x !== id));

  const selectedTags = tags.filter((t) => selectedIds.includes(t.id));

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 text-gray-700 dark:text-gray-200 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 transition-all duration-200"
      >
        <span className={selectedIds.length === 0 ? 'text-gray-400 dark:text-gray-500' : ''}>
          {selectedIds.length === 0
            ? t('select_tags')
            : t('tags_selected', { count: selectedIds.length })}
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className={`text-gray-400 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        >
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden animate-fadeIn">
          {tags.length === 0 ? (
            <p className="px-4 py-3 text-sm text-gray-400 dark:text-gray-500 text-center">{t('no_tags_available')}</p>
          ) : (
            <ul className="max-h-52 overflow-y-auto py-1">
              {tags.map((tag) => {
                const checked = selectedIds.includes(tag.id);
                return (
                  <li key={tag.id}>
                    <button
                      type="button"
                      onClick={() => toggle(tag.id)}
                      className="w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left"
                    >
                      {/* Checkbox */}
                      <span
                        className={`w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-colors ${
                          checked
                            ? 'border-indigo-500 bg-indigo-500'
                            : 'border-gray-300 dark:border-slate-500'
                        }`}
                      >
                        {checked && (
                          <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                          </svg>
                        )}
                      </span>

                      {/* Color dot */}
                      <span
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: tag.color ?? '#6B7280' }}
                      />

                      {/* Name */}
                      <span className="text-gray-800 dark:text-gray-200 font-medium">{tag.name}</span>
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}

      {/* Selected chips */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mt-2">
          {selectedTags.map((tag) => (
            <span
              key={tag.id}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full border"
              style={{
                backgroundColor: (tag.color ?? '#6B7280') + '18',
                borderColor: (tag.color ?? '#6B7280') + '55',
                color: tag.color ?? '#6B7280',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tag.color ?? '#6B7280' }} />
              {tag.name}
              <button
                type="button"
                onClick={() => remove(tag.id)}
                className="ml-0.5 hover:opacity-70 transition-opacity"
                aria-label={`Remove ${tag.name}`}
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
