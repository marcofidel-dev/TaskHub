import { useEffect, useState } from 'react';
import api from '../services/api';

export function usePlanLimits() {
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchLimits = async () => {
      try {
        setLoading(true);
        const response = await api.get('/v1/user/limits');
        setLimits(response.data);
      } catch (err) {
        setError('Failed to load plan limits');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchLimits();
  }, []);

  return { limits, loading, error };
}
