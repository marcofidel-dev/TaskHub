import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Logo from '../components/Logo';

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const features = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" />
        <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    key: 'tasks',
    accent: '#4F46E5',
    bg: '#EEF2FF',
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
    key: 'categories',
    accent: '#7C3AED',
    bg: '#F5F3FF',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z" />
        <line x1="7" y1="7" x2="7.01" y2="7" />
      </svg>
    ),
    key: 'tags',
    accent: '#0891B2',
    bg: '#ECFEFF',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    key: 'filtering',
    accent: '#059669',
    bg: '#ECFDF5',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    key: 'secure',
    accent: '#DC2626',
    bg: '#FEF2F2',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10" />
        <line x1="12" y1="8" x2="12" y2="12" />
        <line x1="12" y1="16" x2="12.01" y2="16" />
      </svg>
    ),
    key: 'free',
    accent: '#D97706',
    bg: '#FFFBEB',
  },
];

const heroPerks = ['hero_perk_1', 'hero_perk_2', 'hero_perk_3'];

export default function Home() {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen flex flex-col bg-white" style={{ fontFamily: 'var(--font-body)' }}>

      {/* ── Navbar ─────────────────────────────────────────── */}
      <nav className="sticky top-0 z-30 flex items-center justify-between px-6 md:px-12 py-4 bg-white/90 backdrop-blur-md border-b border-gray-100 shadow-sm">
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
            className="px-5 py-2 text-sm font-semibold text-white rounded-lg transition-all duration-200 hover:opacity-90 hover:shadow-md shadow-sm"
            style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
          >
            {t('nav_get_started')}
          </button>
        </div>
      </nav>

      <main className="flex-1 flex flex-col">

        {/* ── Hero ───────────────────────────────────────────── */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 35%, #4c1d95 70%, #5b21b6 100%)' }}>
          {/* Background grid */}
          <div className="absolute inset-0 opacity-[0.07]" style={{
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
          }} />
          {/* Glow blobs */}
          <div className="absolute top-0 right-0 w-[600px] h-[600px] opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #818CF8 0%, transparent 65%)', transform: 'translate(25%, -35%)' }} />
          <div className="absolute bottom-0 left-0 w-[500px] h-[500px] opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #A78BFA 0%, transparent 65%)', transform: 'translate(-30%, 40%)' }} />
          <div className="absolute top-1/2 left-1/2 w-[300px] h-[300px] opacity-10 pointer-events-none" style={{ background: 'radial-gradient(circle, #C4B5FD 0%, transparent 65%)', transform: 'translate(-50%, -50%)' }} />

          <div className="relative max-w-5xl mx-auto px-6 py-28 md:py-36 text-center">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 bg-white/10 text-white/90 text-xs font-semibold px-4 py-2 rounded-full mb-8 backdrop-blur-sm border border-white/15 shadow-inner">
              <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
              {t('hero_badge')}
            </div>

            {/* Heading */}
            <h1 className="text-5xl md:text-6xl lg:text-[4.5rem] font-bold text-white leading-[1.1] tracking-tight mb-6">
              {t('hero_title_1')}{' '}
              <span className="relative inline-block">
                <span className="relative z-10" style={{ color: '#FDE68A' }}>{t('hero_title_highlight')}</span>
                <span className="absolute bottom-1 left-0 w-full h-3 opacity-30 rounded" style={{ background: '#FDE68A', zIndex: 0 }} />
              </span>
              <br />
              {t('hero_title_2')}
            </h1>

            {/* Subtitle */}
            <p className="text-lg md:text-xl text-indigo-200 mb-10 max-w-2xl mx-auto leading-relaxed">
              {t('hero_subtitle')}
            </p>

            {/* Perks */}
            <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 mb-10">
              {heroPerks.map((key) => (
                <span key={key} className="flex items-center gap-1.5 text-indigo-200 text-sm">
                  <span className="w-4 h-4 rounded-full bg-emerald-400/20 text-emerald-400 flex items-center justify-center shrink-0">
                    <CheckIcon />
                  </span>
                  {t(key)}
                </span>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <button
                onClick={() => navigate('/register')}
                className="group px-8 py-3.5 bg-white text-indigo-700 rounded-xl font-semibold text-base hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
              >
                {t('hero_cta_primary')}
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
                  <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                </svg>
              </button>
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-3.5 bg-white/10 text-white rounded-xl font-semibold text-base hover:bg-white/20 transition-all duration-200 border border-white/20 backdrop-blur-sm"
              >
                {t('hero_cta_secondary')}
              </button>
            </div>
          </div>

          {/* Wave divider */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
            <svg viewBox="0 0 1440 56" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" className="w-full h-14">
              <path d="M0,56 C360,0 1080,56 1440,10 L1440,56 Z" fill="white" />
            </svg>
          </div>
        </section>

        {/* ── Social proof strip ─────────────────────────────── */}
        <section className="py-8 px-6 border-b border-gray-100">
          <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-12 text-center">
            {[
              { value: t('stat_tasks_value'), label: t('stat_tasks_label') },
              { value: t('stat_users_value'), label: t('stat_users_label') },
              { value: t('stat_uptime_value'), label: t('stat_uptime_label') },
            ].map(({ value, label }) => (
              <div key={label}>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                <p className="text-sm text-gray-500 mt-0.5">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Features ───────────────────────────────────────── */}
        <section className="py-24 px-6 bg-gray-50">
          <div className="max-w-5xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4" style={{ background: '#EEF2FF', color: '#4F46E5' }}>
                {t('features_eyebrow')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('features_title')}</h2>
              <p className="text-gray-500 text-lg max-w-xl mx-auto leading-relaxed">{t('features_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {features.map(({ icon, key, accent, bg }) => (
                <div
                  key={key}
                  className="group bg-white rounded-2xl p-6 border border-gray-100 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 text-left"
                >
                  <div
                    className="w-12 h-12 rounded-2xl flex items-center justify-center mb-5 transition-transform duration-300 group-hover:scale-110"
                    style={{ background: bg, color: accent }}
                  >
                    {icon}
                  </div>
                  <h3 className="text-gray-900 font-semibold text-base mb-2">{t(`feature_${key}_title`)}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{t(`feature_${key}_desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── How it works ───────────────────────────────────── */}
        <section className="py-24 px-6">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-16">
              <span className="inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full mb-4" style={{ background: '#F5F3FF', color: '#7C3AED' }}>
                {t('how_eyebrow')}
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">{t('how_title')}</h2>
              <p className="text-gray-500 text-lg max-w-lg mx-auto">{t('how_subtitle')}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
              {/* Connector line (desktop only) — sits at vertical center of the step boxes (h-16/2 = 32px from top of box, box starts at 0) */}
              <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px bg-gradient-to-r from-indigo-200 via-violet-200 to-indigo-200" />

              {[
                { step: '01', key: 'step1', color: '#4F46E5' },
                { step: '02', key: 'step2', color: '#7C3AED' },
                { step: '03', key: 'step3', color: '#059669' },
              ].map(({ step, key, color }) => (
                <div key={key} className="flex flex-col items-center text-center relative">
                  <div
                    className="w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-lg mb-5 shadow-md relative z-10"
                    style={{ background: color }}
                  >
                    {step}
                  </div>
                  <h3 className="text-gray-900 font-semibold text-base mb-2">{t(`${key}_title`)}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed">{t(`${key}_desc`)}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── CTA Banner ─────────────────────────────────────── */}
        <section className="py-20 px-6">
          <div className="max-w-4xl mx-auto relative overflow-hidden rounded-3xl p-12 text-center" style={{ background: 'linear-gradient(135deg, #1e1b4b 0%, #4c1d95 100%)' }}>
            {/* Decorations */}
            <div className="absolute top-0 right-0 w-64 h-64 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #818CF8, transparent 70%)', transform: 'translate(20%, -20%)' }} />
            <div className="absolute bottom-0 left-0 w-48 h-48 opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #A78BFA, transparent 70%)', transform: 'translate(-20%, 20%)' }} />

            <div className="relative z-10">
              <div className="inline-flex items-center gap-2 bg-white/10 text-white/80 text-xs font-semibold px-3 py-1.5 rounded-full mb-6 border border-white/15">
                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse" />
                {t('cta_badge')}
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">{t('cta_title')}</h2>
              <p className="text-indigo-200 text-lg mb-10 max-w-lg mx-auto leading-relaxed">{t('cta_subtitle')}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  onClick={() => navigate('/register')}
                  className="group px-8 py-3.5 bg-white text-indigo-700 rounded-xl font-semibold text-base hover:bg-indigo-50 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 flex items-center justify-center gap-2"
                >
                  {t('cta_button_primary')}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-200 group-hover:translate-x-0.5">
                    <line x1="5" y1="12" x2="19" y2="12" /><polyline points="12 5 19 12 12 19" />
                  </svg>
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-8 py-3.5 bg-white/10 text-white rounded-xl font-semibold text-base hover:bg-white/20 transition-all duration-200 border border-white/20"
                >
                  {t('cta_button_secondary')}
                </button>
              </div>
            </div>
          </div>
        </section>

      </main>

      {/* ── Footer ─────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-5xl mx-auto px-6 py-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
            {/* Brand */}
            <div>
              <div className="flex items-center gap-2.5 mb-3">
                <Logo size={24} />
                <span className="font-bold text-gray-800">{t('app_name')}</span>
              </div>
              <p className="text-gray-500 text-sm max-w-xs leading-relaxed">{t('footer_tagline')}</p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-x-10 gap-y-4 text-sm text-gray-500">
              <div className="flex flex-col gap-2">
                <p className="font-semibold text-gray-700 text-xs uppercase tracking-wider mb-1">{t('footer_col_product')}</p>
                <button onClick={() => navigate('/register')} className="hover:text-indigo-600 transition-colors text-left">{t('footer_link_get_started')}</button>
                <button onClick={() => navigate('/login')} className="hover:text-indigo-600 transition-colors text-left">{t('footer_link_signin')}</button>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-gray-400 text-xs">&copy; {new Date().getFullYear()} {t('app_name')}. {t('footer_rights')}</p>
            <p className="text-gray-400 text-xs">{t('footer_made_with')}</p>
          </div>
        </div>
      </footer>

    </div>
  );
}
