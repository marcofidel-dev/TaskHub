import { useState, useRef, useEffect } from 'react';
import { useTranslation } from 'react-i18next';

export default function CategorySelector({ categories = [], value, onChange }) {
  const { t } = useTranslation(['tasks', 'common']);
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

  const selected = categories.find((c) => String(c.id) === String(value));

  const handleSelect = (id) => {
    onChange(id);
    setOpen(false);
  };

  return (
    <div ref={containerRef} className="relative">
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-full flex items-center justify-between px-4 py-3 border border-gray-200 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-700 hover:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-700 transition-all duration-200"
      >
        <div className="flex items-center gap-2.5">
          {selected ? (
            <>
              <span
                className="w-3 h-3 rounded-full shrink-0"
                style={{ backgroundColor: selected.color ?? '#6B7280' }}
              />
              <span className="text-gray-800 dark:text-gray-200 font-medium">{selected.name}</span>
            </>
          ) : (
            <span className="text-gray-400 dark:text-gray-500">{t('tasks:no_category')}</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {selected && (
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); handleSelect(''); }}
              className="p-0.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded transition-colors"
              aria-label="Clear category"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
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
        </div>
      </button>

      {/* Dropdown */}
      {open && (
        <div className="absolute z-30 mt-1 w-full bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-600 rounded-xl shadow-lg overflow-hidden animate-fadeIn">
          <ul className="max-h-52 overflow-y-auto py-1">
            {/* No category option */}
            <li>
              <button
                type="button"
                onClick={() => handleSelect('')}
                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left ${
                  !value ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                }`}
              >
                <span className="w-3 h-3 rounded-full bg-gray-300 dark:bg-slate-500 shrink-0" />
                <span className="text-gray-500 dark:text-gray-400">{t('tasks:no_category')}</span>
                {!value && (
                  <span className="ml-auto">
                    <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </span>
                )}
              </button>
            </li>

            {categories.map((cat) => {
              const isSelected = String(cat.id) === String(value);
              return (
                <li key={cat.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(cat.id)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors text-left ${
                      isSelected ? 'bg-indigo-50 dark:bg-indigo-900/20' : ''
                    }`}
                  >
                    <span
                      className="w-3 h-3 rounded-full shrink-0"
                      style={{ backgroundColor: cat.color ?? '#6B7280' }}
                    />
                    <span className="text-gray-800 dark:text-gray-200 font-medium">{cat.name}</span>
                    {isSelected && (
                      <span className="ml-auto">
                        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Color preview bar under the trigger */}
      {selected && (
        <div
          className="h-0.5 rounded-b-xl transition-all duration-200"
          style={{ backgroundColor: selected.color ?? 'transparent' }}
        />
      )}
    </div>
  );
}
