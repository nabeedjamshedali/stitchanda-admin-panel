import { createContext, useContext } from 'react';
import { useToast } from '../hooks/useToast.jsx';
import ToastContainer from '../components/shared/ToastContainer';

const ToastContext = createContext(undefined);

export const ToastProvider = ({ children }) => {
  const { toast, toasts, dismissToast } = useToast();

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </ToastContext.Provider>
  );
};

export const useToastContext = () => {
  const context = useContext(ToastContext);
  if (context === undefined) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
};
