import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const plans = [
  {
    name: 'Starter',
    price: 0,
    period: null,
    description: 'Get started with the basics',
    features: [
      'Up to 5 tasks',
      'Up to 2 categories',
      'Unlimited tags',
      'Basic dashboard',
      'Mobile responsive'
    ],
    cta: 'Current Plan',
    tier: 'free'
  },
  {
    name: 'Pro',
    price: 3.50,
    period: 'month',
    description: 'Everything you need to stay productive',
    features: [
      'Unlimited tasks',
      'Unlimited categories',
      'Time tracking',
      'Subtasks & checklists',
      'Analytics dashboard',
      'Google Calendar sync',
      'CSV export'
    ],
    cta: 'Get Pro',
    tier: 'pro',
    popular: true,
    badge: 'Most Popular'
  },
  {
    name: 'Team',
    price: 9.99,
    period: 'month',
    description: 'Built for teams that move fast',
    features: [
      'Everything in Pro',
      'Up to 5 team members',
      'Task comments',
      'Advanced analytics',
      'Slack integration',
      'API access',
      'Priority support'
    ],
    cta: 'Get Team',
    tier: 'team'
  }
];

const faqItems = [
  {
    q: 'Can I change plans anytime?',
    a: 'Yes! You can upgrade your plan at any time. Changes take effect immediately.'
  },
  {
    q: 'What happens if I downgrade?',
    a: 'When downgrading, your excess tasks and categories will be locked until you upgrade again.'
  },
  {
    q: 'What payment methods do you accept?',
    a: 'We accept credit and debit cards via Wompi, our secure payment processor.'
  },
  {
    q: 'Is my data safe?',
    a: 'Absolutely. All payment data is encrypted and processed securely through Wompi.'
  }
];

function CheckIcon({ accent }) {
  return (
    <svg
      className="w-4 h-4 shrink-0"
      style={{ color: accent || '#6366f1' }}
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2.5}
    >
      <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
    </svg>
  );
}

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const userPlan = user?.plan?.toLowerCase() || 'free';

  const handleUpgrade = (plan) => {
    if (plan.tier === 'free' || plan.tier === userPlan) return;
    setLoading(true);
    navigate('/upgrade', { state: { plan: plan.name.toUpperCase() } });
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      {/* Hero header */}
      <div
        className="pt-16 pb-14 px-4 text-center"
        style={{ background: 'linear-gradient(135deg, #0f0c29 0%, #1e1b4b 40%, #312e81 80%, #4c1d95 100%)' }}
      >
        <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-1.5 mb-6">
          <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-white/80 text-xs font-medium tracking-wide">Simple, transparent pricing</span>
        </div>
        <h1 className="text-4xl font-extrabold text-white mb-3 tracking-tight">
          Choose your plan
        </h1>
        <p className="text-indigo-200 text-lg max-w-md mx-auto leading-relaxed">
          Scale your productivity with the right plan for you
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-4 -mt-6 pb-16">
        {/* Plans grid */}
        <div className="grid md:grid-cols-3 gap-5 mb-12">
          {plans.map((plan) => {
            const isCurrent = plan.tier === userPlan;
            const isStarter = plan.tier === 'free';

            return (
              <div
                key={plan.tier}
                className={`relative flex flex-col bg-white dark:bg-slate-800 rounded-2xl transition-all duration-300 ${
                  plan.popular
                    ? 'ring-2 ring-indigo-500 shadow-2xl shadow-indigo-500/20'
                    : 'border border-gray-100 dark:border-slate-700 shadow-md hover:shadow-lg'
                } ${isStarter ? 'opacity-60' : ''}`}
              >
                {plan.popular && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span
                      className="text-white text-xs font-bold px-4 py-1.5 rounded-full"
                      style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)' }}
                    >
                      {plan.badge}
                    </span>
                  </div>
                )}

                <div className="p-7 flex flex-col flex-1">
                  <div className="mb-5">
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-1">{plan.name}</h3>
                    <p className="text-gray-500 dark:text-gray-400 text-sm">{plan.description}</p>
                  </div>

                  <div className="mb-7">
                    {plan.price > 0 ? (
                      <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-extrabold text-gray-900 dark:text-white">${plan.price}</span>
                        <span className="text-gray-400 dark:text-gray-500 text-sm">/ {plan.period}</span>
                      </div>
                    ) : (
                      <span className="text-2xl font-bold text-gray-300 dark:text-slate-600">Included</span>
                    )}
                  </div>

                  <button
                    onClick={() => handleUpgrade(plan)}
                    disabled={loading || isCurrent || isStarter}
                    className={`w-full py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 mb-7 cursor-pointer disabled:cursor-not-allowed disabled:opacity-60 ${
                      isCurrent || isStarter
                        ? 'bg-gray-100 dark:bg-slate-700 text-gray-400 dark:text-gray-500'
                        : !plan.popular
                        ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 hover:bg-slate-700 dark:hover:bg-gray-100'
                        : ''
                    }`}
                    style={
                      !isCurrent && !isStarter && plan.popular
                        ? { background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: '#fff', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }
                        : undefined
                    }
                  >
                    {isCurrent ? 'Current Plan' : plan.cta}
                  </button>

                  <div className="space-y-3 flex-1">
                    {plan.features.map((feature, idx) => (
                      <div key={idx} className="flex items-center gap-2.5">
                        <CheckIcon accent={plan.popular ? '#6366f1' : '#10b981'} />
                        <span className="text-gray-600 dark:text-gray-300 text-sm">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* FAQ */}
        <div className="bg-white dark:bg-slate-800 rounded-2xl border border-gray-100 dark:border-slate-700 p-8 max-w-3xl mx-auto shadow-sm">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-7">Frequently Asked Questions</h2>
          <div className="space-y-0 divide-y divide-gray-100 dark:divide-slate-700">
            {faqItems.map((faq, idx) => (
              <div key={idx} className={`${idx > 0 ? 'pt-6' : ''} pb-6`}>
                <h3 className="font-semibold text-gray-900 dark:text-white mb-2 text-sm">{faq.q}</h3>
                <p className="text-gray-500 dark:text-gray-400 text-sm leading-relaxed">{faq.a}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
