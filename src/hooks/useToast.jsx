import { useState, useCallback } from 'react';

let toastIdCounter = 0;

export const useToast = () => {
  const [toasts, setToasts] = useState([]);

  const toast = useCallback(({ title, description, variant = 'default', duration = 5000 }) => {
    const id = ++toastIdCounter;

    setToasts((prevToasts) => [
      ...prevToasts,
      {
        id,
        title,
        description,
        variant,
      },
    ]);

    if (duration !== Infinity) {
      setTimeout(() => {
        dismissToast(id);
      }, duration);
    }

    return {
      id,
      dismiss: () => dismissToast(id),
    };
  }, []);

  const dismissToast = useCallback((id) => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id));
  }, []);

  return {
    toast,
    toasts,
    dismissToast,
  };
};
