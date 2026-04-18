import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const features = [
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="9 11 12 14 22 4" />
          <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
        </svg>
      ),
      title: t('feature_tasks_title'),
      desc: t('feature_tasks_desc'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="3" width="7" height="7" rx="1" />
          <rect x="14" y="14" width="7" height="7" rx="1" />
          <rect x="3" y="14" width="7" height="7" rx="1" />
        </svg>
      ),
      title: t('feature_categories_title'),
      desc: t('feature_categories_desc'),
    },
    {
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
        </svg>
      ),
      title: t('feature_filtering_title'),
      desc: t('feature_filtering_desc'),
    },
  ];

  return (
    <div className="min-h-screen flex flex-col" style={{ fontFamily: 'var(--font-body)' }}>
      {/* Nav */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-10 py-4 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <Logo size={28} />
          <span className="text-xl font-bold text-gray-900 tracking-tight">{t('app_name')}</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/login')}
            className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 rounded-lg hover:bg-gray-100 transition-colors duration-200"
          >
            {t('nav_signin')}
          </button>
          <button
            onClick={() => navigate('/register')}
            className="px-4 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:opacity-90 hover:shadow-md"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            {t('nav_get_started')}
          </button>
        </div>
      </nav>

      {/* Hero */}
      <main className="flex-1 flex flex-col">
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #4F46E5 0%, #7C3AED 60%, #6D28D9 100%)' }}>
          {/* Decorative blobs */}
          <div className="absolute top-0 right-0 w-96 h-96 opacity-20" style={{ background: 'radial-gradient(circle, #A78BFA 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
          <div className="absolute bottom-0 left-0 w-80 h-80 opacity-10" style={{ background: 'radial-gradient(circle, #818CF8 0%, transparent 70%)', transform: 'translate(-30%, 30%)' }} />

          <div className="relative max-w-5xl mx-auto px-6 py-24 md:py-32 text-center">
            <span className="inline-flex items-center gap-1.5 bg-white/15 text-white text-xs font-semibold px-3 py-1.5 rounded-full mb-8 backdrop-blur-sm border border-white/20">
              <span className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
              {t('hero_badge')}
            </span>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight tracking-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {t('hero_title_1')}{' '}
              <span className="text-yellow-300">{t('hero_title_highlight')}</span>
              <br />{t('hero_title_2')}
            </h1>
            <p className="text-lg md:text-xl text-indigo-100 mb-10 max-w-xl mx-auto leading-relaxed">
              {t('hero_subtitle')}
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="px-8 py-3.5 bg-white text-indigo-700 rounded-lg font-semibold text-base hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5"
              >
                {t('hero_cta_primary')}
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 bg-white/10 text-white rounded-lg font-semibold text-base hover:bg-white/20 transition-all duration-200 border border-white/30 backdrop-blur-sm"
              >
                {t('hero_cta_secondary')}
              </button>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="bg-gray-50 py-20 px-6">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-14">
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('features_title')}</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto">{t('features_subtitle')}</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {features.map(({ icon, title, desc }) => (
                <div
                  key={title}
                  className="bg-white rounded-xl p-6 shadow-sm border border-gray-100 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-left"
                >
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-indigo-600 mb-5" style={{ background: 'linear-gradient(135deg, #EEF2FF, #E0E7FF)' }}>
                    {icon}
                  </div>
                  <h3 className="text-gray-900 font-semibold text-lg mb-2">{title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Banner */}
        <section className="py-20 px-6">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('cta_title')}</h2>
            <p className="text-gray-500 text-lg mb-8">{t('cta_subtitle')}</p>
            <button
              onClick={() => navigate('/register')}
              className="px-10 py-4 text-white font-semibold text-base rounded-xl transition-all duration-200 hover:opacity-90 hover:shadow-lg hover:-translate-y-0.5 shadow-md"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
            >
              {t('cta_button')}
            </button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 py-6 px-6">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Logo size={20} />
            <span className="font-semibold text-gray-700 text-sm">{t('app_name')}</span>
          </div>
          <p className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} {t('app_name')}. {t('footer_rights')}</p>
        </div>
      </footer>
    </div>
  );
}
