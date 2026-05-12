import { useState, useCallback } from "react";

/**
 * Generic hook for backend API calls with loading/error handling.
 * Usage: const { data, loading, error, execute } = useApi(myServiceFn);
 */
export function useApi(apiFn) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (...args) => {
      setLoading(true);
      setError(null);
      try {
        const result = await apiFn(...args);
        setData(result);
        return result;
      } catch (err) {
        const message =
          err.response?.data?.message || err.message || "An error occurred";
        setError(message);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [apiFn]
  );

  return { data, loading, error, execute };
}

export default useApi;
