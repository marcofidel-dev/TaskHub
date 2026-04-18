import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

/* ── Shared micro-components ─────────────────────────── */
const EyeIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
  </svg>
);
const EyeOffIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
    <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
    <line x1="1" y1="1" x2="23" y2="23" />
  </svg>
);
const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" /><polyline points="22,6 12,13 2,6" />
  </svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const CheckCircleIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" />
  </svg>
);
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

function FieldWrapper({ name, label, error, touched, value, children }) {
  const isValid   = touched && !error && value;
  const isInvalid = touched && !!error;
  return (
    <div>
      <label className="block text-sm font-semibold text-gray-700 mb-1.5">{label}</label>
      <div className="relative">{children}</div>
      {isInvalid && (
        <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5 animate-fadeIn">
          <AlertIcon /> {error}
        </p>
      )}
      {isValid && !isInvalid && (
        <p className="flex items-center gap-1.5 text-emerald-600 text-xs mt-1.5 animate-fadeIn">
          <CheckCircleIcon /> Looks good
        </p>
      )}
    </div>
  );
}

function inputCls(name, { touched, validationErrors, form }) {
  const t = touched[name];
  const err = validationErrors[name];
  const val = form[name];
  if (!t) return 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400';
  if (err) return 'border-red-400 bg-red-50/40 focus:ring-red-200 focus:border-red-400';
  if (val) return 'border-emerald-400 bg-emerald-50/30 focus:ring-emerald-200 focus:border-emerald-400';
  return 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400';
}

/* ── Left branding panel ──────────────────────────────── */
const PANEL_FEATURES = [
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
      </svg>
    ),
    title: 'Smart task management',
    desc:  'Priorities, due dates & categories in one place.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
      </svg>
    ),
    title: 'Powerful filtering',
    desc:  'Find any task in seconds with smart filters.',
  },
  {
    icon: (
      <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      </svg>
    ),
    title: 'Secure & private',
    desc:  'Your tasks stay yours — always encrypted.',
  },
];

function BrandPanel({ heading, subheading }) {
  return (
    <div
      className="hidden lg:flex lg:w-[44%] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)' }}
    >
      {/* Grid overlay */}
      <div className="absolute inset-0 opacity-[0.06]" style={{
        backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)',
        backgroundSize: '32px 32px',
      }} />
      {/* Glow */}
      <div className="absolute top-0 right-0 w-80 h-80 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #818CF8, transparent 65%)', transform: 'translate(30%, -20%)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #A78BFA, transparent 65%)', transform: 'translate(-20%, 20%)' }} />

      {/* Logo */}
      <div className="relative z-10 flex items-center gap-3">
        <Logo size={32} />
        <span className="text-xl font-bold text-white tracking-tight">TaskHub</span>
      </div>

      {/* Center copy */}
      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-white leading-tight mb-3">{heading}</h2>
        <p className="text-indigo-200 text-base leading-relaxed mb-10">{subheading}</p>

        <ul className="space-y-5">
          {PANEL_FEATURES.map(({ icon, title, desc }) => (
            <li key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-indigo-200 shrink-0">
                {icon}
              </div>
              <div>
                <p className="text-white text-sm font-semibold">{title}</p>
                <p className="text-indigo-300 text-xs mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Footer */}
      <p className="relative z-10 text-indigo-400 text-xs">
        &copy; {new Date().getFullYear()} TaskHub. Free to use.
      </p>
    </div>
  );
}

/* ── Login Page ───────────────────────────────────────── */
export default function LoginPage() {
  const { login, loading, error } = useAuth();
  const navigate                  = useNavigate();
  const { t }                     = useTranslation(['auth', 'common']);

  const [form, setForm]             = useState({ email: '', password: '' });
  const [touched, setTouched]       = useState({});
  const [validationErrors, setVE]   = useState({});
  const [showPassword, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const validators = {
    email:    (v) => !v.trim() ? t('auth:email_required') : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? t('auth:email_invalid') : '',
    password: (v) => !v ? t('auth:password_required') : '',
  };

  const touchField = (name) => {
    setTouched((p) => ({ ...p, [name]: true }));
    const err = validators[name]?.(form[name]) ?? '';
    setVE((p) => ({ ...p, [name]: err }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (touched[name]) {
      const err = validators[name]?.(value) ?? '';
      setVE((p) => ({ ...p, [name]: err }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allTouched = { email: true, password: true };
    setTouched(allTouched);
    const errs = {};
    Object.keys(validators).forEach((k) => {
      const msg = validators[k](form[k]);
      if (msg) errs[k] = msg;
    });
    setVE(errs);
    if (Object.keys(errs).length) return;
    const ok = await login(form.email, form.password);
    if (ok) navigate('/dashboard');
  };

  const state = { touched, validationErrors, form };

  return (
    <div className="min-h-screen flex">
      <BrandPanel
        heading="Welcome back. Your tasks are waiting."
        subheading="Sign in to pick up right where you left off and stay on top of your day."
      />

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 bg-gray-50 lg:bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <Logo size={28} />
          <span className="text-xl font-bold text-gray-900 tracking-tight">{t('common:app_name')}</span>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('auth:welcome_back')}</h1>
            <p className="text-gray-500 text-sm mt-1.5">{t('auth:sign_in_subtitle')}</p>
          </div>

          {/* API error banner */}
          {error && (
            <div className="mb-6 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fadeIn">
              <AlertIcon />
              <span className="mt-px">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            {/* Email */}
            <FieldWrapper name="email" label={t('auth:email')} error={validationErrors.email} touched={touched.email} value={form.email}>
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <MailIcon />
              </span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={() => touchField('email')}
                placeholder={t('auth:email_placeholder')}
                autoComplete="email"
                className={`w-full pl-10 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 outline-none focus:ring-2 focus:border-transparent ${inputCls('email', state)}`}
              />
            </FieldWrapper>

            {/* Password */}
            <FieldWrapper name="password" label={t('auth:password')} error={validationErrors.password} touched={touched.password} value={form.password}>
              <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none">
                <LockIcon />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                name="password"
                value={form.password}
                onChange={handleChange}
                onBlur={() => touchField('password')}
                placeholder={t('auth:password_placeholder')}
                autoComplete="current-password"
                className={`w-full pl-10 pr-11 py-3 border rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 outline-none focus:ring-2 focus:border-transparent ${inputCls('password', state)}`}
              />
              <button
                type="button"
                onClick={() => setShowPass((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOffIcon /> : <EyeIcon />}
              </button>
            </FieldWrapper>

            {/* Remember me + Forgot password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <div
                  className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-all duration-150 ${rememberMe ? 'border-indigo-600 bg-indigo-600' : 'border-gray-300 bg-white'}`}
                  onClick={() => setRememberMe((v) => !v)}
                >
                  {rememberMe && (
                    <svg width="9" height="9" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="sr-only" />
                <span className="text-sm text-gray-600">{t('auth:remember_me')}</span>
              </label>
              <button type="button" className="text-sm font-medium text-indigo-600 hover:text-indigo-700 transition-colors">
                {t('auth:forgot_password')}
              </button>
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t('auth:sign_in_loading')}
                </span>
              ) : (
                t('auth:sign_in')
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center text-xs">
              <span className="bg-gray-50 lg:bg-white px-3 text-gray-400 font-medium">{t('auth:or_continue')}</span>
            </div>
          </div>

          {/* Register link */}
          <p className="text-center text-sm text-gray-500">
            {t('auth:dont_have_account')}{' '}
            <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              {t('auth:create_one_free')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
