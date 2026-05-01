import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';

export default function PaymentForm({ plan, amount }) {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    cardholderName: '',
    cardNumber: '',
    expiryDate: '',
    cvv: ''
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === 'cardNumber') {
      const digits = value.replace(/\D/g, '').slice(0, 16);
      const formatted = digits.replace(/(\d{4})(?=\d)/g, '$1 ');
      setFormData(prev => ({ ...prev, [name]: formatted }));
    } else if (name === 'expiryDate') {
      let digits = value.replace(/\D/g, '').slice(0, 4);
      if (digits.length >= 3) digits = digits.slice(0, 2) + '/' + digits.slice(2);
      setFormData(prev => ({ ...prev, [name]: digits }));
    } else if (name === 'cvv') {
      setFormData(prev => ({ ...prev, [name]: value.replace(/\D/g, '').slice(0, 4) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const validateForm = () => {
    if (!formData.cardholderName.trim()) {
      setError('Cardholder name is required');
      return false;
    }
    if (formData.cardNumber.replace(/\s/g, '').length !== 16) {
      setError('Card number must be 16 digits');
      return false;
    }
    if (!formData.expiryDate.match(/^\d{2}\/\d{2}$/)) {
      setError('Expiry date must be in MM/YY format');
      return false;
    }
    if (formData.cvv.length < 3) {
      setError('CVV must be 3 or 4 digits');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      const mockWompiTransactionId = `wompi_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const response = await api.post('/v1/subscriptions/upgrade', {
        plan,
        wompiTransactionId: mockWompiTransactionId
      });

      if (response.data.success) {
        navigate('/subscription', {
          state: { success: true, message: `Successfully upgraded to ${plan} plan!` }
        });
      } else {
        setError(response.data.message || 'Payment failed. Please try again.');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Payment processing failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-gray-50 dark:bg-slate-700/60 border border-gray-200 dark:border-slate-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all text-sm';
  const labelClass = 'block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5';

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 px-4 py-3 rounded-xl text-sm">
          {error}
        </div>
      )}

      <div>
        <label className={labelClass}>Cardholder Name</label>
        <input
          type="text"
          name="cardholderName"
          value={formData.cardholderName}
          onChange={handleChange}
          placeholder="Name as it appears on card"
          className={inputClass}
          disabled={loading}
        />
      </div>

      <div>
        <label className={labelClass}>Card Number</label>
        <input
          type="text"
          name="cardNumber"
          value={formData.cardNumber}
          onChange={handleChange}
          placeholder="0000 0000 0000 0000"
          maxLength="19"
          className={inputClass}
          disabled={loading}
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className={labelClass}>Expiry Date</label>
          <input
            type="text"
            name="expiryDate"
            value={formData.expiryDate}
            onChange={handleChange}
            placeholder="MM/YY"
            maxLength="5"
            className={inputClass}
            disabled={loading}
          />
        </div>
        <div>
          <label className={labelClass}>CVV</label>
          <input
            type="text"
            name="cvv"
            value={formData.cvv}
            onChange={handleChange}
            placeholder="•••"
            maxLength="4"
            className={inputClass}
            disabled={loading}
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3 px-4 rounded-xl font-bold text-white text-sm transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer mt-1"
        style={{ background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', boxShadow: '0 4px 20px rgba(99,102,241,0.35)' }}
      >
        {loading ? (
          <span className="flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
            Processing...
          </span>
        ) : (
          `Pay $${amount} / month`
        )}
      </button>

      <p className="text-xs text-gray-400 dark:text-gray-500 text-center leading-relaxed">
        By completing this purchase, you agree to our Terms of Service and Privacy Policy.
      </p>
    </form>
  );
}
