import { useState, useEffect, useCallback } from 'react';
import { apiCallWithRetry } from '../config/api';

export const usePhishingStats = (autoRefresh = true, refreshInterval = 30000) => {
  const [stats, setStats] = useState({
    total_emails_scanned: 0,
    phishing_detected: 0,
    safe_emails: 0,
    workflow_status: 'loading',
    last_updated: null,
    phishing_rate: '0%'
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await apiCallWithRetry('/phishing-stats');
      setStats(result.data);
    } catch (err) {
      setError(err.message || 'Failed to fetch statistics');
      console.error('Error fetching stats:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();

    if (autoRefresh) {
      const interval = setInterval(fetchStats, refreshInterval);
      return () => clearInterval(interval);
    }
  }, [autoRefresh, refreshInterval, fetchStats]);

  return { stats, loading, error, refetch: fetchStats };
};

