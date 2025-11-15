import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';
import clsx from 'clsx';

const Toast = ({ title, description, variant = 'default', onDismiss }) => {
  const variantStyles = {
    default: {
      bg: 'bg-white border-gray-200',
      icon: <Info className="h-5 w-5 text-blue-500" />,
      titleColor: 'text-gray-900',
    },
    success: {
      bg: 'bg-green-50 border-green-200',
      icon: <CheckCircle className="h-5 w-5 text-green-500" />,
      titleColor: 'text-green-900',
    },
    destructive: {
      bg: 'bg-red-50 border-red-200',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      titleColor: 'text-red-900',
    },
    error: {
      bg: 'bg-red-50 border-red-200',
      icon: <AlertCircle className="h-5 w-5 text-red-500" />,
      titleColor: 'text-red-900',
    },
  };

  const style = variantStyles[variant] || variantStyles.default;

  return (
    <div
      className={clsx(
        'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border shadow-lg',
        style.bg,
        'animate-slide-in-right'
      )}
    >
      <div className="p-4">
        <div className="flex items-start">
          <div className="flex-shrink-0">{style.icon}</div>
          <div className="ml-3 flex-1 pt-0.5">
            <p className={clsx('text-sm font-medium', style.titleColor)}>{title}</p>
            {description && (
              <p className="mt-1 text-sm text-gray-500">{description}</p>
            )}
          </div>
          <div className="ml-4 flex flex-shrink-0">
            <button
              onClick={onDismiss}
              className="inline-flex rounded-md text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
            >
              <span className="sr-only">Close</span>
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Toast;
