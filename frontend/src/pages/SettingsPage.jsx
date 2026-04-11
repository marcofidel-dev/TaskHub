import { useTranslation } from 'react-i18next';
import { useThemeStore } from '../store/themeStore';
import { colorPalettes } from '../config/themes';
import Layout from '../components/Layout';

export default function SettingsPage({ user, onLogout }) {
  const { t } = useTranslation('common');
  const { isDarkMode, colorPalette, toggleDarkMode, setColorPalette, resetTheme } = useThemeStore();

  return (
    <Layout user={user} onLogout={onLogout}>
      <div className="max-w-2xl">
        <h1 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-gray-100 mb-8">
          {t('settings')}
        </h1>

        {/* Dark Mode */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 mb-4 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('theme')}
          </h2>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">{t('dark_mode')}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                {isDarkMode ? '🌙' : '☀️'} {isDarkMode ? 'Activado' : 'Desactivado'}
              </p>
            </div>
            <button
              onClick={toggleDarkMode}
              role="switch"
              aria-checked={isDarkMode}
              className={`relative w-12 h-6 rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 ${
                isDarkMode ? 'focus:ring-offset-slate-800' : 'focus:ring-offset-white'
              }`}
              style={{ backgroundColor: isDarkMode ? 'var(--color-primary)' : '#D1D5DB' }}
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow-sm transition-transform duration-200 ${
                  isDarkMode ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </div>
        </div>

        {/* Color Palette */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 mb-4 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-4">
            {t('color_palette')}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {Object.entries(colorPalettes).map(([key, palette]) => (
              <button
                key={key}
                onClick={() => setColorPalette(key)}
                className={`p-4 rounded-xl border-2 transition-all duration-150 text-left hover:shadow-md ${
                  colorPalette === key
                    ? 'shadow-md'
                    : 'border-gray-200 dark:border-slate-600 hover:border-gray-300 dark:hover:border-slate-500'
                }`}
                style={colorPalette === key ? { borderColor: palette.primary } : {}}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="w-7 h-7 rounded-lg shadow-sm shrink-0"
                    style={{ backgroundColor: palette.primary }}
                  />
                  <div>
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{palette.name}</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 font-mono">{palette.primary}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Reset */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-6 shadow-sm">
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100 mb-1">{t('reset')}</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            Restablecer tema e idioma a los valores predeterminados.
          </p>
          <button
            onClick={resetTheme}
            className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-700 rounded-xl hover:bg-gray-200 dark:hover:bg-slate-600 transition-colors"
          >
            {t('reset')}
          </button>
        </div>
      </div>
    </Layout>
  );
}
