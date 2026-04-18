import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../context/AuthContext';
import Logo from '../Logo';

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['auth', 'common']);

  useEffect(() => { clearError(); }, [clearError]);

  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [validationErrors, setValidationErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const passwordChecks = [
    { label: '8+ characters', test: (p) => p.length >= 8 },
    { label: 'Uppercase letter', test: (p) => /[A-Z]/.test(p) },
    { label: 'Number', test: (p) => /\d/.test(p) },
    { label: 'Special character (@$!%*?&)', test: (p) => /[@$!%*?&]/.test(p) },
  ];

  const validate = () => {
    const errs = {};
    if (!form.email.trim()) errs.email = t('auth:email_required');
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      errs.email = t('auth:email_invalid');
    if (!form.username.trim()) errs.username = t('auth:username_required');
    else if (form.username.length < 3 || form.username.length > 30)
      errs.username = t('auth:username_length');
    if (!form.password) errs.password = t('auth:password_required');
    else if (form.password.length < 8) errs.password = t('auth:password_min_length');
    else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])/.test(form.password))
      errs.password = t('auth:password_complexity');
    if (form.password !== form.confirmPassword)
      errs.confirmPassword = t('auth:passwords_dont_match');
    return errs;
  };

  const handleChange = (e) => {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));
    setValidationErrors((v) => ({ ...v, [e.target.name]: undefined }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) {
      setValidationErrors(errs);
      return;
    }
    const ok = await register(form.email, form.username, form.password);
    if (ok) navigate('/dashboard', { replace: true });
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12" style={{ background: 'linear-gradient(135deg, #EEF2FF 0%, #F5F3FF 50%, #FAF5FF 100%)' }}>
      <div className="w-full max-w-md animate-fadeIn">
        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
          {/* Logo */}
          <div className="flex items-center gap-2.5 mb-8">
            <Logo size={32} />
            <span className="text-xl font-bold text-gray-900 tracking-tight">{t('common:app_name')}</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">{t('auth:create_account_title')}</h2>
          <p className="text-gray-500 text-sm mb-7">{t('auth:create_account_subtitle')}</p>

          {/* API error */}
          {error && (
            <div className="mb-5 flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm animate-fadeIn">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 mt-0.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('auth:email')}</label>
              <input
                type="email" name="email" value={form.email} onChange={handleChange}
                placeholder={t('auth:email_placeholder')} autoComplete="email"
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 outline-none focus:ring-2 focus:border-transparent ${validationErrors.email ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400'}`}
              />
              {validationErrors.email && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span> {validationErrors.email}</p>}
            </div>

            {/* Username */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('auth:username')}</label>
              <input
                type="text" name="username" value={form.username} onChange={handleChange}
                placeholder={t('auth:username_placeholder')} autoComplete="username"
                className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 outline-none focus:ring-2 focus:border-transparent ${validationErrors.username ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400'}`}
              />
              {validationErrors.username && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span> {validationErrors.username}</p>}
            </div>

            {/* Password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('auth:password')}</label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'} name="password" value={form.password} onChange={handleChange}
                  placeholder={t('auth:password_placeholder')} autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-11 border rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 outline-none focus:ring-2 focus:border-transparent ${validationErrors.password ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400'}`}
                />
                <button type="button" onClick={() => setShowPassword((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" aria-label={showPassword ? 'Hide password' : 'Show password'}>
                  {showPassword ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {/* Password requirements */}
              {form.password.length > 0 && (
                <div className="mt-2 grid grid-cols-2 gap-1">
                  {passwordChecks.map(({ label, test }) => (
                    <p key={label} className={`text-xs flex items-center gap-1 ${test(form.password) ? 'text-emerald-600' : 'text-gray-400'}`}>
                      <span>{test(form.password) ? '✓' : '○'}</span> {label}
                    </p>
                  ))}
                </div>
              )}
              {validationErrors.password && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span> {validationErrors.password}</p>}
            </div>

            {/* Confirm password */}
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1.5">{t('auth:confirm_password')}</label>
              <div className="relative">
                <input
                  type={showConfirm ? 'text' : 'password'} name="confirmPassword" value={form.confirmPassword} onChange={handleChange}
                  placeholder={t('auth:password_placeholder')} autoComplete="new-password"
                  className={`w-full px-4 py-3 pr-11 border rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 outline-none focus:ring-2 focus:border-transparent ${validationErrors.confirmPassword ? 'border-red-400 focus:ring-red-200' : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400'}`}
                />
                <button type="button" onClick={() => setShowConfirm((v) => !v)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors" aria-label={showConfirm ? 'Hide password' : 'Show password'}>
                  {showConfirm ? (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" /><path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" /><line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" /><circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
              {validationErrors.confirmPassword && <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1"><span>⚠</span> {validationErrors.confirmPassword}</p>}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 text-white rounded-xl font-semibold text-sm transition-all duration-200 hover:opacity-90 hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed mt-2"
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

          <p className="text-center text-sm text-gray-500 mt-6">
            {t('auth:already_have_account')}{' '}
            <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 hover:underline transition-colors">
              {t('auth:sign_in')}
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
