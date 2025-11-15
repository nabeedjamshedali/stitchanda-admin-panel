import Toast from './Toast';

const ToastContainer = ({ toasts, onDismiss }) => {
  return (
    <div
      aria-live="assertive"
      className="pointer-events-none fixed inset-0 z-50 flex flex-col items-end px-4 py-6 sm:p-6"
    >
      <div className="flex w-full flex-col items-center space-y-4 sm:items-end">
        {toasts.map((toast) => (
          <Toast
            key={toast.id}
            title={toast.title}
            description={toast.description}
            variant={toast.variant}
            onDismiss={() => onDismiss(toast.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ToastContainer;
