const Card = ({ children, className = '' }) => {
  return (
    <div className={`bg-white rounded-lg shadow-md border border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

const CardHeader = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 border-b border-gray-200 ${className}`}>
      {children}
    </div>
  );
};

const CardTitle = ({ children, icon: Icon, className = '' }) => {
  return (
    <h3 className={`text-lg font-semibold text-gray-900 flex items-center gap-2 ${className}`}>
      {Icon && <Icon className="w-5 h-5 text-gray-700" />}
      {children}
    </h3>
  );
};

const CardContent = ({ children, className = '' }) => {
  return (
    <div className={`px-6 py-4 ${className}`}>
      {children}
    </div>
  );
};

const InfoRow = ({ label, value, className = '' }) => {
  return (
    <div className={className}>
      <div className="text-sm font-medium text-gray-500 mb-1">{label}</div>
      <div className="text-base text-gray-900">{value || 'N/A'}</div>
    </div>
  );
};

export { Card, CardHeader, CardTitle, CardContent, InfoRow };
export default Card;
