import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

const planColors = {
  PRO: { bg: 'from-indigo-600 to-violet-600', badge: 'bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300' },
  TEAM: { bg: 'from-violet-600 to-purple-600', badge: 'bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300' },
  FREE: { bg: 'from-slate-500 to-slate-600', badge: 'bg-gray-100 dark:bg-slate-700 text-gray-600 dark:text-gray-400' }
};

function CrownIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.562.562 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
    </svg>
  );
}

export default function SubscriptionPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [subscription, setSubscription] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState(location.state?.message || '');

  useEffect(() => {
    fetchSubscriptionData();
  }, []);

  const fetchSubscriptionData = async () => {
    try {
      setLoading(true);
      const [subRes, txRes] = await Promise.all([
        api.get('/v1/subscriptions/current'),
        api.get('/v1/subscriptions/transactions')
      ]);
      setSubscription(subRes.data);
      setTransactions(txRes.data || []);
    } catch {
      setError('Failed to load subscription data');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async () => {
    if (!window.confirm('Are you sure you want to cancel your subscription?')) return;
    try {
      await api.post('/v1/subscriptions/cancel');
      fetchSubscriptionData();
    } catch {
      setError('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-indigo-500 border-t-transparent" />
      </div>
    );
  }

  const plan = subscription?.plan || 'FREE';
  const colors = planColors[plan] || planColors.FREE;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Subscription & Billing</h1>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">Manage your plan and payment history</p>
        </div>

        {successMessage && (
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 text-emerald-700 dark:text-emerald-400 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
            <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
            </svg>
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        {/* Current plan card */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden mb-6">
          <div
            className={`bg-gradient-to-r ${colors.bg} px-8 py-6 flex items-center justify-between`}
          >
            <div>
              <div className="flex items-center gap-2 mb-1">
                <CrownIcon />
                <span className="text-white/80 text-xs font-semibold uppercase tracking-wider">Current Plan</span>
              </div>
              <h2 className="text-3xl font-extrabold text-white">{plan}</h2>
            </div>
            <div className="text-right">
              <span className="inline-flex items-center gap-1.5 bg-white/20 border border-white/30 text-white text-xs font-semibold px-3 py-1.5 rounded-full">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                Active
              </span>
              {subscription?.plan !== 'FREE' && subscription?.expiryDate && (
                <p className="text-white/70 text-xs mt-2">
                  Renews {new Date(subscription.expiryDate).toLocaleDateString()}
                </p>
              )}
            </div>
          </div>

          <div className="px-8 py-6">
            {subscription?.features?.length > 0 && (
              <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">Included Features</h3>
                <div className="grid grid-cols-2 gap-2.5">
                  {subscription.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <svg className="w-4 h-4 text-indigo-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-gray-600 dark:text-gray-300 text-sm capitalize">
                        {feature.replace(/_/g, ' ')}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              {subscription?.plan !== 'TEAM' && (
                <button
                  onClick={() => navigate('/pricing')}
                  className="flex-1 py-2.5 px-4 rounded-xl font-semibold text-sm text-white transition-all duration-200 cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 16px rgba(99,102,241,0.3)' }}
                >
                  Upgrade Plan
                </button>
              )}
              {subscription?.plan !== 'FREE' && (
                <button
                  onClick={handleCancel}
                  className="flex-1 border border-gray-200 dark:border-slate-600 text-gray-600 dark:text-gray-400 py-2.5 rounded-xl font-semibold text-sm hover:bg-gray-50 dark:hover:bg-slate-700 hover:text-red-600 dark:hover:text-red-400 hover:border-red-200 dark:hover:border-red-800 transition-all duration-200 cursor-pointer"
                >
                  Cancel Subscription
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Billing history */}
        {transactions.length > 0 && (
          <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 shadow-sm overflow-hidden">
            <div className="px-8 py-5 border-b border-gray-100 dark:border-slate-700">
              <h2 className="text-base font-bold text-gray-900 dark:text-white">Billing History</h2>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-100 dark:border-slate-700">
                    <th className="text-left py-3 px-8 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Date</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Plan</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50 dark:divide-slate-700/50">
                  {transactions.map((tx, idx) => (
                    <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-slate-700/30 transition-colors">
                      <td className="py-4 px-8 text-sm text-gray-700 dark:text-gray-300">
                        {new Date(tx.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="py-4 px-4">
                        <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${planColors[tx.plan]?.badge || planColors.FREE.badge}`}>
                          {tx.plan}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-sm font-semibold text-gray-900 dark:text-white">${tx.amount}</td>
                      <td className="py-4 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${
                            tx.status === 'COMPLETED'
                              ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                              : 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400'
                          }`}
                        >
                          <div className={`w-1.5 h-1.5 rounded-full ${tx.status === 'COMPLETED' ? 'bg-emerald-500' : 'bg-amber-500'}`} />
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
