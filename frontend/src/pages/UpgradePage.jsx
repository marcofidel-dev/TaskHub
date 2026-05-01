import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import PaymentForm from '../components/PaymentForm';

const prices = { PRO: 3.50, TEAM: 9.99 };

const planFeatures = {
  PRO: [
    'Unlimited tasks & categories',
    'Time tracking',
    'Subtasks & checklists',
    'Analytics dashboard',
    'CSV export & Google Calendar'
  ],
  TEAM: [
    'Everything in Pro',
    'Up to 5 team members',
    'Task comments & collaboration',
    'Advanced analytics',
    'Slack integration & API access'
  ]
};

function BackIcon() {
  return (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
    </svg>
  );
}

function ShieldIcon() {
  return (
    <svg className="w-4 h-4 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
    </svg>
  );
}

export default function UpgradePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const planToUpgrade = location.state?.plan || 'PRO';
  const amount = prices[planToUpgrade];
  const features = planFeatures[planToUpgrade] || [];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        <button
          onClick={() => navigate('/pricing')}
          className="mb-6 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors cursor-pointer"
        >
          <BackIcon />
          Back to plans
        </button>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-xl overflow-hidden border border-gray-100 dark:border-slate-700">
          <div className="grid md:grid-cols-5">
            {/* Left: Plan summary */}
            <div
              className="md:col-span-2 p-8 flex flex-col"
              style={{ background: 'linear-gradient(160deg, #0f0c29 0%, #1e1b4b 40%, #312e81 80%, #4c1d95 100%)' }}
            >
              <div className="mb-8">
                <div className="inline-flex items-center gap-1.5 bg-white/10 border border-white/20 rounded-full px-3 py-1 mb-6">
                  <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                  <span className="text-white/80 text-xs font-medium">{planToUpgrade} Plan</span>
                </div>
                <div className="flex items-baseline gap-1 mb-1">
                  <span className="text-4xl font-extrabold text-white">${amount}</span>
                  <span className="text-indigo-300 text-sm">/ month</span>
                </div>
                <p className="text-indigo-300 text-xs">Billed monthly. Cancel anytime.</p>
              </div>

              <div className="flex-1">
                <p className="text-indigo-300 text-xs font-semibold uppercase tracking-wider mb-4">
                  What's included
                </p>
                <div className="space-y-3">
                  {features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2.5">
                      <svg
                        className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                        strokeWidth={2.5}
                      >
                        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                      </svg>
                      <span className="text-indigo-100 text-sm">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="mt-8 flex items-center gap-2">
                <ShieldIcon />
                <span className="text-indigo-300 text-xs">Payments encrypted via Wompi</span>
              </div>
            </div>

            {/* Right: Payment form */}
            <div className="md:col-span-3 p-8">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">Payment details</h2>
              <p className="text-gray-500 dark:text-gray-400 text-sm mb-7">
                Enter your card information to complete the upgrade
              </p>
              <PaymentForm plan={planToUpgrade} amount={amount} userId={user?.id} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
