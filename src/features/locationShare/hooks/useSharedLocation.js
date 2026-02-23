import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchSharedLocation } from '../api/locationShareApi';

/**
 * React hook that polls the backend for a shared location.
 *
 * @param {string} token — the share token from the URL
 * @param {number} intervalMs — polling interval in milliseconds (default 3 000)
 * @returns {{ data, loading, error, expired, refetch }}
 */
export function useSharedLocation(token, intervalMs = 3000) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expired, setExpired] = useState(false);
  const timerRef = useRef(null);
  const mountedRef = useRef(true);

  const fetchOnce = useCallback(async () => {
    if (!token) return;
    try {
      const result = await fetchSharedLocation(token);

      if (!mountedRef.current) return;

      if (result.success) {
        setData(result.data);
        setLoading(false);
        setError(null);
        setExpired(false);
      } else if (result.expired) {
        setExpired(true);
        setData(result.data);
        setLoading(false);
        setError(null);
        // Stop polling
        if (timerRef.current) {
          clearInterval(timerRef.current);
          timerRef.current = null;
        }
      } else {
        setError(result.message);
        setLoading(false);
      }
    } catch (err) {
      if (mountedRef.current) {
        setError(err.message || 'Error de red');
        setLoading(false);
      }
    }
  }, [token]);

  useEffect(() => {
    mountedRef.current = true;
    fetchOnce();

    timerRef.current = setInterval(fetchOnce, intervalMs);

    return () => {
      mountedRef.current = false;
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [fetchOnce, intervalMs]);

  return { data, loading, error, expired, refetch: fetchOnce };
}
