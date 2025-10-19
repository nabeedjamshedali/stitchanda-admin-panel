import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for Firestore CRUD operations with loading and error states
 */
export const useFirestore = (fetchFunction) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await fetchFunction();
      setData(result);
    } catch (err) {
      console.error('Error fetching data:', err);
      setError(err.message);
      toast.error('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetch = () => {
    fetchData();
  };

  return { data, loading, error, refetch };
};

/**
 * Hook for performing async operations with loading state
 */
export const useAsyncOperation = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const execute = async (operation, successMessage = 'Operation successful') => {
    try {
      setLoading(true);
      setError(null);
      const result = await operation();
      toast.success(successMessage);
      return result;
    } catch (err) {
      console.error('Operation failed:', err);
      setError(err.message);
      toast.error(err.message || 'Operation failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { execute, loading, error };
};
