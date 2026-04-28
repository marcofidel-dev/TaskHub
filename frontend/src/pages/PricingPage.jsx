import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const plans = [
  {
    name: 'Free',
    price: 0,
    period: 'forever',
    description: 'Perfect for personal use',
    features: [
      '5 tasks maximum',
      '2 categories maximum',
      'Unlimited tags',
      'Basic dashboard',
      'Mobile responsive'
    ],
    cta: 'Current Plan',
    tier: 'free',
    color: 'gray'
  },
  {
    name: 'Pro',
    price: 3.50,
    period: 'month',
    description: 'For power users',
    features: [
      'Unlimited tasks',
      'Unlimited categories',
      'Time tracking',
      'Subtasks & checklists',
      'Basic analytics',
      'Google Calendar sync',
      'CSV export',
      'No ads'
    ],
    cta: 'Upgrade to Pro',
    tier: 'pro',
    color: 'blue',
    popular: true
  },
  {
    name: 'Team',
    price: 9.99,
    period: 'month',
    description: 'For teams and organizations',
    features: [
      'Everything in Pro +',
      'Up to 5 team members',
      'Task comments',
      'Advanced analytics',
      'Slack integration',
      'API access',
      'SLA support'
    ],
    cta: 'Upgrade to Team',
    tier: 'team',
    color: 'purple'
  }
];

export default function PricingPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleUpgrade = (planName) => {
    if (planName.toLowerCase() === 'free' || planName.toLowerCase() === user?.plan?.toLowerCase()) {
      return;
    }
    setLoading(true);
    navigate('/upgrade', { state: { plan: planName.toUpperCase() } });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Simple, Transparent Pricing
          </h1>
          <p className="text-xl text-gray-600">
            Choose the perfect plan for your productivity needs
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {plans.map((plan) => (
            <div
              key={plan.tier}
              className={`relative bg-white rounded-lg shadow-lg transition-transform hover:scale-105 ${
                plan.popular ? 'ring-2 ring-blue-500 md:scale-105' : ''
              }`}
            >
              {plan.popular && (
                <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                  <span className="bg-blue-500 text-white px-4 py-1 rounded-full text-sm font-semibold">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="p-8">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{plan.name}</h3>
                <p className="text-gray-600 mb-6">{plan.description}</p>

                <div className="mb-6">
                  <span className="text-4xl font-bold text-gray-900">${plan.price}</span>
                  {plan.price > 0 && (
                    <span className="text-gray-600 ml-2">per {plan.period}</span>
                  )}
                </div>

                <button
                  onClick={() => handleUpgrade(plan.name)}
                  disabled={
                    loading ||
                    plan.tier === user?.plan?.toLowerCase() ||
                    plan.tier === 'free'
                  }
                  className={`w-full py-3 px-4 rounded-lg font-semibold transition mb-8 ${
                    plan.tier === 'pro'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : plan.tier === 'team'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-200 text-gray-600'
                  } disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {plan.tier === user?.plan?.toLowerCase() ? 'Current Plan' : plan.cta}
                </button>

                <div className="space-y-4">
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start">
                      <svg
                        className="h-5 w-5 text-green-500 mr-3 flex-shrink-0"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                          clipRule="evenodd"
                        />
                      </svg>
                      <span className="text-gray-700">{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-white rounded-lg shadow-lg p-8 max-w-3xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Frequently Asked Questions</h2>
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Can I change plans anytime?</h3>
              <p className="text-gray-600">
                Yes! You can upgrade or downgrade your plan at any time. Changes take effect immediately.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What happens if I downgrade?</h3>
              <p className="text-gray-600">
                When downgrading to Free, your excess tasks and categories will be locked until you upgrade again.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Is there a free trial?</h3>
              <p className="text-gray-600">
                Yes! Start with our Free plan and upgrade whenever you're ready.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">What payment methods do you accept?</h3>
              <p className="text-gray-600">
                We accept credit/debit cards via Wompi (secure payment processor).
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
