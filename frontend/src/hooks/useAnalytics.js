import { useEffect, useState, useCallback } from 'react';
import api from '../services/api';

export function useAnalytics() {
  const [dashboard, setDashboard] = useState(null);
  const [completion, setCompletion] = useState(null);
  const [timeTracking, setTimeTracking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchAnalytics = useCallback(async () => {
    try {
      setLoading(true);
      setError('');

      const [dashboardRes, completionRes, timeRes] = await Promise.all([
        api.get('/v1/analytics/dashboard'),
        api.get('/v1/analytics/completion'),
        api.get('/v1/analytics/time-tracking')
      ]);

      setDashboard(dashboardRes.data);
      setCompletion(completionRes.data);
      setTimeTracking(timeRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load analytics');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const fetchDateRangeAnalytics = async (startDate, endDate) => {
    try {
      setLoading(true);
      const response = await api.get('/v1/analytics/date-range', {
        params: {
          startDate: startDate.toISOString().split('T')[0],
          endDate: endDate.toISOString().split('T')[0]
        }
      });
      return response.data;
    } catch (err) {
      setError('Failed to load date range analytics');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    dashboard,
    completion,
    timeTracking,
    loading,
    error,
    refetch: fetchAnalytics,
    fetchDateRangeAnalytics
  };
}
