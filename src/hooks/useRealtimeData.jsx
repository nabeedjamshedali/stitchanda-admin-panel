import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

/**
 * Custom hook for real-time Firestore data using onSnapshot
 */
export const useRealtimeData = (listenerFunction) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    setError(null);

    // Set up real-time listener
    const unsubscribe = listenerFunction((newData) => {
      setData(newData);
      setLoading(false);
    }, (err) => {
      console.error('Real-time listener error:', err);
      setError(err.message);
      setLoading(false);
      toast.error('Failed to sync data');
    });

    // Cleanup listener on unmount
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  return { data, loading, error };
};
