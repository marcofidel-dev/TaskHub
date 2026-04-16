import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../hooks/useAuth';

export default function RegisterPage() {
  const { register, loading, error, clearError } = useAuth();
  const navigate = useNavigate();
  const { t } = useTranslation(['auth', 'common']);

  useEffect(() => { clearError(); }, [clearError]);

  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' });
  const [validationErrors, setValidationErrors] = useState({});

  const fields = [
    { name: 'email',           label: t('auth:email'),            type: 'email',    placeholder: t('auth:email_placeholder'),    autoComplete: 'email' },
    { name: 'username',        label: t('auth:username'),          type: 'text',     placeholder: t('auth:username_placeholder'), autoComplete: 'username' },
    { name: 'password',        label: t('auth:password'),          type: 'password', placeholder: t('auth:password_placeholder'), autoComplete: 'new-password' },
    { name: 'confirmPassword', label: t('auth:confirm_password'),  type: 'password', placeholder: t('auth:password_placeholder'), autoComplete: 'new-password' },
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
            <div className="w-9 h-9 rounded-xl flex items-center justify-center font-bold text-white text-sm shadow-sm" style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}>
              T
            </div>
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
            {fields.map(({ name, label, type, placeholder, autoComplete }) => (
              <div key={name}>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  {label}
                </label>
                <input
                  type={type}
                  name={name}
                  value={form[name]}
                  onChange={handleChange}
                  placeholder={placeholder}
                  autoComplete={autoComplete}
                  className={`w-full px-4 py-3 border rounded-xl text-gray-900 placeholder-gray-400 text-sm transition-all duration-200 outline-none focus:ring-2 focus:border-transparent ${
                    validationErrors[name]
                      ? 'border-red-400 focus:ring-red-200'
                      : 'border-gray-200 focus:ring-indigo-200 focus:border-indigo-400'
                  }`}
                />
                {validationErrors[name] && (
                  <p className="text-red-500 text-xs mt-1.5 flex items-center gap-1">
                    <span>⚠</span> {validationErrors[name]}
                  </p>
                )}
              </div>
            ))}

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
