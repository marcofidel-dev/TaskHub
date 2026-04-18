import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

/* ── Icons ───────────────────────────────────────────── */
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
const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
  </svg>
);
const LockIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);
const AlertIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
  </svg>
);

/* ── Helpers ─────────────────────────────────────────── */
function inputCls(name, { touched, validationErrors, form }) {
  if (!touched[name]) return 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400';
  if (validationErrors[name]) return 'border-red-400 bg-red-50/40 focus:ring-red-200 focus:border-red-400';
  if (form[name]) return 'border-emerald-400 bg-emerald-50/30 focus:ring-emerald-200 focus:border-emerald-400';
  return 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400';
}

function FieldError({ msg }) {
  if (!msg) return null;
  return (
    <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5 animate-fadeIn">
      <AlertIcon /> {msg}
    </p>
  );
}

/* ── Password strength bar ───────────────────────────── */
const PW_CHECKS = [
  { key: 'len',      label: 'auth:pw_check_length',    test: (p) => p.length >= 8 },
  { key: 'upper',    label: 'auth:pw_check_upper',     test: (p) => /[A-Z]/.test(p) },
  { key: 'lower',    label: 'auth:pw_check_lower',     test: (p) => /[a-z]/.test(p) },
  { key: 'number',   label: 'auth:pw_check_number',    test: (p) => /\d/.test(p) },
  { key: 'special',  label: 'auth:pw_check_special',   test: (p) => /[@$!%*?&]/.test(p) },
];

const STRENGTH_CONFIG = [
  { label: 'auth:strength_weak',    color: '#EF4444', barColor: 'bg-red-500' },
  { label: 'auth:strength_fair',    color: '#F59E0B', barColor: 'bg-amber-500' },
  { label: 'auth:strength_good',    color: '#3B82F6', barColor: 'bg-blue-500' },
  { label: 'auth:strength_strong',  color: '#10B981', barColor: 'bg-emerald-500' },
  { label: 'auth:strength_strong',  color: '#10B981', barColor: 'bg-emerald-500' },
];

function PasswordStrength({ password, t }) {
  if (!password) return null;
  const passed  = PW_CHECKS.filter(({ test }) => test(password)).length;
  const config  = STRENGTH_CONFIG[Math.max(0, passed - 1)];
  const pct     = (passed / PW_CHECKS.length) * 100;

  return (
    <div className="mt-3 space-y-3 animate-fadeIn">
      {/* Bar */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs text-gray-500">{t('auth:password_strength')}</span>
          <span className="text-xs font-semibold" style={{ color: config.color }}>{t(config.label)}</span>
        </div>
        <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-400 ease-out ${config.barColor}`}
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      {/* Checklist */}
      <div className="grid grid-cols-2 gap-x-4 gap-y-1.5">
        {PW_CHECKS.map(({ key, label, test }) => {
          const ok = test(password);
          return (
            <p key={key} className={`flex items-center gap-1.5 text-xs transition-colors duration-200 ${ok ? 'text-emerald-600' : 'text-gray-400'}`}>
              <span className={`w-4 h-4 rounded-full flex items-center justify-center shrink-0 transition-all duration-200 ${ok ? 'bg-emerald-100 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                {ok
                  ? <svg width="8" height="8" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  : <svg width="6" height="6" viewBox="0 0 6 6" fill="currentColor"><circle cx="3" cy="3" r="2" /></svg>
                }
              </span>
              {t(label)}
            </p>
          );
        })}
      </div>
    </div>
  );
}

/* ── Brand panel (same as Login) ─────────────────────── */
const PANEL_FEATURES = [
  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 11 12 14 22 4" /><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" /></svg>, title: 'Set up in 30 seconds', desc: 'No setup required. Just sign up and go.' },
  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /></svg>, title: 'Categories & tags', desc: 'Structure your work the way you think.' },
  { icon: <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" /></svg>, title: 'Free forever', desc: 'No credit card. No hidden fees. Ever.' },
];

function BrandPanel() {
  return (
    <div
      className="hidden lg:flex lg:w-[44%] shrink-0 flex-col justify-between p-12 relative overflow-hidden"
      style={{ background: 'linear-gradient(145deg, #1e1b4b 0%, #312e81 40%, #4c1d95 100%)' }}
    >
      <div className="absolute inset-0 opacity-[0.06]" style={{ backgroundImage: 'linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)', backgroundSize: '32px 32px' }} />
      <div className="absolute top-0 right-0 w-80 h-80 opacity-20 pointer-events-none" style={{ background: 'radial-gradient(circle, #818CF8, transparent 65%)', transform: 'translate(30%, -20%)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 opacity-15 pointer-events-none" style={{ background: 'radial-gradient(circle, #A78BFA, transparent 65%)', transform: 'translate(-20%, 20%)' }} />

      <div className="relative z-10 flex items-center gap-3">
        <Logo size={32} />
        <span className="text-xl font-bold text-white tracking-tight">TaskHub</span>
      </div>

      <div className="relative z-10">
        <h2 className="text-3xl font-bold text-white leading-tight mb-3">Your productivity journey starts here.</h2>
        <p className="text-indigo-200 text-base leading-relaxed mb-10">Join thousands of people who use TaskHub to stay focused and get things done, every single day.</p>
        <ul className="space-y-5">
          {PANEL_FEATURES.map(({ icon, title, desc }) => (
            <li key={title} className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center text-indigo-200 shrink-0">{icon}</div>
              <div>
                <p className="text-white text-sm font-semibold">{title}</p>
                <p className="text-indigo-300 text-xs mt-0.5 leading-relaxed">{desc}</p>
              </div>
            </li>
          ))}
        </ul>
      </div>

      <p className="relative z-10 text-indigo-400 text-xs">&copy; {new Date().getFullYear()} TaskHub. Free to use.</p>
    </div>
  );
}

/* ── Register Page ───────────────────────────────────── */
export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();
  const navigate                                  = useNavigate();
  const { t }                                     = useTranslation(['auth', 'common']);

  useEffect(() => { clearError(); }, [clearError]);

  const [form, setForm]           = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [touched, setTouched]     = useState({});
  const [validationErrors, setVE] = useState({});
  const [showPw, setShowPw]       = useState(false);
  const [showCfm, setShowCfm]     = useState(false);
  const [termsAccepted, setTerms] = useState(false);
  const [termsError, setTermsErr] = useState(false);

  const validators = {
    email:           (v) => !v.trim() ? t('auth:email_required') : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? t('auth:email_invalid') : '',
    username:        (v) => !v.trim() ? t('auth:username_required') : (v.length < 3 || v.length > 30) ? t('auth:username_length') : '',
    password:        (v) => !v ? t('auth:password_required') : v.length < 8 ? t('auth:password_min_length') : !/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(v) ? t('auth:password_complexity') : '',
    confirmPassword: (v) => v !== form.password ? t('auth:passwords_dont_match') : '',
  };

  const touchField = (name) => {
    setTouched((p) => ({ ...p, [name]: true }));
    setVE((p) => ({ ...p, [name]: validators[name]?.(form[name]) ?? '' }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    if (touched[name]) setVE((p) => ({ ...p, [name]: validators[name]?.(value) ?? '' }));
    // Re-validate confirm when password changes
    if (name === 'password' && touched.confirmPassword) {
      setVE((p) => ({ ...p, confirmPassword: value !== form.confirmPassword ? t('auth:passwords_dont_match') : '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const allKeys = Object.keys(validators);
    setTouched(Object.fromEntries(allKeys.map((k) => [k, true])));
    const errs = {};
    allKeys.forEach((k) => { const msg = validators[k](form[k]); if (msg) errs[k] = msg; });
    setVE(errs);
    if (!termsAccepted) { setTermsErr(true); return; }
    if (Object.keys(errs).length) return;
    const ok = await register(form.email, form.username, form.password);
    if (ok) navigate('/dashboard', { replace: true });
  };

  const state = { touched, validationErrors, form };
  const usernameLen = form.username.length;

  return (
    <div className="min-h-screen flex">
      <BrandPanel />

      {/* Form panel */}
      <div className="flex-1 flex flex-col items-center justify-start lg:justify-center px-6 py-10 bg-gray-50 lg:bg-white overflow-y-auto">
        {/* Mobile logo */}
        <div className="lg:hidden flex items-center gap-2.5 mb-8">
          <Logo size={28} />
          <span className="text-xl font-bold text-gray-900 tracking-tight">{t('common:app_name')}</span>
        </div>

        <div className="w-full max-w-md">
          {/* Header */}
          <div className="mb-7">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{t('auth:create_account_title')}</h1>
            <p className="text-gray-500 text-sm mt-1.5">{t('auth:create_account_subtitle')}</p>
          </div>

          {/* API error */}
          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fadeIn">
              <AlertIcon />
              <span className="mt-px">{error}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} noValidate className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('auth:email')}</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><MailIcon /></span>
                <input
                  type="email" name="email" value={form.email}
                  onChange={handleChange} onBlur={() => touchField('email')}
                  placeholder={t('auth:email_placeholder')} autoComplete="email"
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 outline-none focus:ring-2 focus:border-transparent ${inputCls('email', state)}`}
                />
              </div>
              <FieldError msg={validationErrors.email} />
            </div>

            {/* Username */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-semibold text-gray-700">{t('auth:username')}</label>
                <span className={`text-xs font-medium ${usernameLen > 25 ? 'text-amber-600' : 'text-gray-400'}`}>
                  {usernameLen}/30
                </span>
              </div>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><UserIcon /></span>
                <input
                  type="text" name="username" value={form.username}
                  onChange={handleChange} onBlur={() => touchField('username')}
                  placeholder={t('auth:username_placeholder')} autoComplete="username"
                  maxLength={30}
                  className={`w-full pl-10 pr-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 outline-none focus:ring-2 focus:border-transparent ${inputCls('username', state)}`}
                />
              </div>
              <FieldError msg={validationErrors.username} />
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('auth:password')}</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><LockIcon /></span>
                <input
                  type={showPw ? 'text' : 'password'} name="password" value={form.password}
                  onChange={handleChange} onBlur={() => touchField('password')}
                  placeholder={t('auth:password_placeholder')} autoComplete="new-password"
                  className={`w-full pl-10 pr-11 py-3 border rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 outline-none focus:ring-2 focus:border-transparent ${inputCls('password', state)}`}
                />
                <button type="button" onClick={() => setShowPw((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5" aria-label={showPw ? 'Hide' : 'Show'}>
                  {showPw ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              <PasswordStrength password={form.password} t={t} />
              <FieldError msg={validationErrors.password} />
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('auth:confirm_password')}</label>
              <div className="relative">
                <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"><LockIcon /></span>
                <input
                  type={showCfm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword}
                  onChange={handleChange} onBlur={() => touchField('confirmPassword')}
                  placeholder={t('auth:password_placeholder')} autoComplete="new-password"
                  className={`w-full pl-10 pr-11 py-3 border rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 outline-none focus:ring-2 focus:border-transparent ${inputCls('confirmPassword', state)}`}
                />
                <button type="button" onClick={() => setShowCfm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors p-0.5" aria-label={showCfm ? 'Hide' : 'Show'}>
                  {showCfm ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
              {/* Match indicator */}
              {form.confirmPassword.length > 0 && !validationErrors.confirmPassword && (
                <p className="flex items-center gap-1.5 text-emerald-600 text-xs mt-1.5 animate-fadeIn">
                  <svg width="12" height="12" viewBox="0 0 10 8" fill="none"><path d="M1 4L3.5 6.5L9 1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" /></svg>
                  {t('auth:passwords_match')}
                </p>
              )}
              <FieldError msg={validationErrors.confirmPassword} />
            </div>

            {/* Terms */}
            <div>
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <div
                  className={`mt-0.5 w-4 h-4 rounded border-2 flex items-center justify-center shrink-0 transition-all duration-150 ${termsAccepted ? 'border-indigo-600 bg-indigo-600' : termsError ? 'border-red-400' : 'border-gray-300 bg-white'}`}
                  onClick={() => { setTerms((v) => !v); setTermsErr(false); }}
                >
                  {termsAccepted && (
                    <svg width="9" height="9" viewBox="0 0 10 8" fill="none">
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <input type="checkbox" checked={termsAccepted} onChange={(e) => { setTerms(e.target.checked); setTermsErr(false); }} className="sr-only" />
                <span className="text-sm text-gray-600 leading-relaxed">{t('auth:terms_accept')}</span>
              </label>
              {termsError && (
                <p className="flex items-center gap-1.5 text-red-500 text-xs mt-1.5 animate-fadeIn">
                  <AlertIcon /> {t('auth:terms_required')}
                </p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-px disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md mt-1"
              style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                  {t('auth:creating_account')}
                </span>
              ) : (
                t('auth:create_account')
              )}
            </button>
          </form>

          {/* Login link */}
          <p className="text-center text-sm text-gray-500 mt-6">
            {t('auth:already_have_account')}{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
              {t('auth:sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
