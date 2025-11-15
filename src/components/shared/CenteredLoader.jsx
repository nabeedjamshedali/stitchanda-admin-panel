import Loader from './Loader';

const CenteredLoader = ({ message = 'Loading...' }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
      <Loader size="lg" />
      {message && <p className="text-gray-600 text-sm">{message}</p>}
    </div>
  );
};

export default CenteredLoader;
