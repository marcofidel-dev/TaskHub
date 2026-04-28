import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';

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
    } catch (err) {
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
    } catch (err) {
      setError('Failed to cancel subscription');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Subscription & Billing</h1>

        {successMessage && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg mb-8">
            {successMessage}
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-8">
            {error}
          </div>
        )}

        <div className="bg-white rounded-lg shadow-lg p-8 mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {subscription?.plan || 'FREE'} Plan
              </h2>
              <p className="text-gray-600 mt-1">
                Status: <span className="font-semibold text-green-600">Active</span>
              </p>
            </div>
            {subscription?.plan !== 'FREE' && subscription?.expiryDate && (
              <div>
                <p className="text-gray-600">Renews on</p>
                <p className="text-lg font-semibold text-gray-900">
                  {new Date(subscription.expiryDate).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>

          {subscription?.features?.length > 0 && (
            <div className="border-t pt-6">
              <h3 className="font-semibold text-gray-900 mb-4">Included Features</h3>
              <div className="grid grid-cols-2 gap-3">
                {subscription.features.map((feature, idx) => (
                  <div key={idx} className="flex items-center">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-700 text-sm">{feature.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="border-t pt-6 mt-6 flex gap-4">
            {subscription?.plan !== 'TEAM' && (
              <button
                onClick={() => navigate('/pricing')}
                className="flex-1 bg-blue-600 text-white py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
              >
                Upgrade Plan
              </button>
            )}
            {subscription?.plan !== 'FREE' && (
              <button
                onClick={handleCancel}
                className="flex-1 border border-red-200 text-red-600 py-2 rounded-lg font-semibold hover:bg-red-50 transition"
              >
                Cancel Subscription
              </button>
            )}
          </div>
        </div>

        {transactions.length > 0 && (
          <div className="bg-white rounded-lg shadow-lg p-8">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Billing History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-gray-200">
                  <tr>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Date</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Plan</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Amount</th>
                    <th className="text-left py-3 px-4 font-semibold text-gray-900">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={idx} className="border-b border-gray-200">
                      <td className="py-3 px-4 text-gray-700">
                        {new Date(tx.transactionDate).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-gray-700 font-medium">{tx.plan}</td>
                      <td className="py-3 px-4 text-gray-700">${tx.amount}</td>
                      <td className="py-3 px-4">
                        <span className={`px-3 py-1 rounded-full text-sm font-semibold ${
                          tx.status === 'COMPLETED'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}>
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
