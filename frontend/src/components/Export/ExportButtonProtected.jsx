import React from 'react';
import { Link } from 'react-router-dom';
import { usePlanFeatures } from '../../hooks/usePlanFeatures';
import ExportButton from './ExportButton';

export default function ExportButtonProtected() {
  const { canUseFeature, loading } = usePlanFeatures();

  if (loading) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2.5 min-h-[44px] bg-gray-200 dark:bg-slate-700 text-gray-400 rounded-xl font-semibold text-sm animate-pulse shrink-0">
        <span className="hidden sm:inline">Export</span>
      </div>
    );
  }

  if (!canUseFeature('csv_export')) {
    return (
      <Link
        to="/pricing"
        className="inline-flex items-center gap-2 px-3 py-2.5 min-h-[44px] bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-300 rounded-xl font-semibold text-sm hover:bg-gray-200 dark:hover:bg-slate-600 transition shrink-0"
        title="Upgrade to Pro to export tasks"
      >
        <span>📤</span>
        <span className="hidden sm:inline">Export</span>
      </Link>
    );
  }

  return <ExportButton />;
}
