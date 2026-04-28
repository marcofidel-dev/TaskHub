import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PaymentForm from '../components/PaymentForm';

const prices = {
  PRO: 3.50,
  TEAM: 9.99
};

export default function UpgradePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const planToUpgrade = location.state?.plan || 'PRO';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <button
          onClick={() => navigate('/pricing')}
          className="mb-6 text-blue-600 hover:text-blue-700 flex items-center"
        >
          ← Back to pricing
        </button>

        <div className="bg-white rounded-lg shadow-xl p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Upgrade to {planToUpgrade}
          </h1>
          <p className="text-gray-600 mb-8">Secure payment powered by Wompi</p>

          <div className="border-t border-b border-gray-200 py-8 mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">{planToUpgrade} Plan</h3>
                <p className="text-gray-600">Monthly subscription</p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-gray-900">${prices[planToUpgrade]}</p>
                <p className="text-gray-600">per month</p>
              </div>
            </div>
          </div>

          <PaymentForm
            plan={planToUpgrade}
            amount={prices[planToUpgrade]}
            userId={user?.id}
          />

          <div className="mt-8 pt-8 border-t border-gray-200 text-center">
            <p className="text-gray-600 text-sm">
              🔒 Your payment information is secure and encrypted
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
