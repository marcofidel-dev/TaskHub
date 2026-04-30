import { useEffect, useState, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

export function useUserLimits() {
  const { user } = useAuth();
  const [limits, setLimits] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLimits = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/v1/user/limits');
      setLimits(res.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load limits');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user) fetchLimits();
  }, [user, fetchLimits]);

  const isTaskLimitReached = () => {
    if (!limits || limits.plan !== 'FREE') return false;
    return limits.taskCount >= limits.taskLimit;
  };

  const isCategoryLimitReached = () => {
    if (!limits || limits.plan !== 'FREE') return false;
    return limits.categoryCount >= limits.categoryLimit;
  };

  return { limits, loading, error, isTaskLimitReached, isCategoryLimitReached, refetch: fetchLimits };
}
