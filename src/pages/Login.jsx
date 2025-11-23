import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, CheckCircle, Users, Package } from 'lucide-react';
import logo from '../assets/logo.png';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const result = await login(email, password);
      if (result.success) {
        toast.success('Welcome to Stitchanda Admin Panel!');
        navigate('/');
      } else {
        toast.error(result.message || 'Invalid email or password');
      }
    } catch (error) {
      toast.error('Login failed. Please try again.');
      console.error('Login error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex">
      <div className="hidden lg:flex lg:w-[35%] bg-[#D29356] text-white p-8 flex-col justify-between">
        <div>
          <div className="mb-8">
            <CheckCircle className="w-10 h-10 mb-4" />
            <h1 className="text-2xl font-bold mb-3">Stitchanda Admin System</h1>
            <p className="text-white/90 text-sm leading-relaxed">
              Manage and monitor all operations of the Stitchanda platform. This panel helps the admin team oversee customers, tailors, orders, and payment activities within our system.
            </p>
          </div>

          <div className="space-y-6">
            <div>
              <div className="mb-2">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Sign In as Admin</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Log in using your assigned admin credentials to access the Stitchanda platform controls and management tools.
              </p>
            </div>

            <div>
              <div className="mb-2">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Review System Activity</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                View and handle customers, tailors, orders, and payment details. Monitor the progress of tailoring tasks and ensure everything is running smoothly.
              </p>
            </div>

            <div>
              <div className="mb-2">
                <img src={logo} alt="Stitchanda Logo" className="w-6 h-6 object-contain" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Manage Platform Settings</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Update system configurations, track commissions, review reports, and maintain the overall performance of the Stitchanda application.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 sm:px-6 py-6 sm:py-8 bg-white">
        <div className="w-full max-w-md">
          <div className="lg:hidden text-center mb-6">
            <div className="w-20 h-20 sm:w-28 sm:h-28 mx-auto mb-3">
              <img src={logo} alt="Stitchanda Logo" className="w-full h-full object-contain" />
            </div>
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900">Stitchanda</h1>
          </div>

          <div className="hidden lg:flex items-center justify-center mb-12">
            <div className="w-32 h-32">
              <img src={logo} alt="Stitchanda Logo" className="w-full h-full object-contain" />
            </div>
          </div>

          <div className="text-center mb-8 sm:mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3 leading-tight">
              Welcome Back to<br className="hidden sm:block" />
              <span className="sm:hidden"> </span>Stitchanda Admin App
            </h2>
            <p className="text-sm sm:text-base text-gray-600">Log in to access your account.</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-[#EEF2F6] border-2 border-[#EEF2F6] rounded-lg transition-all focus:outline-none focus:border-[#D49649] focus:bg-white disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="w-full px-4 py-3 pr-12 bg-[#EEF2F6] border-2 border-[#EEF2F6] rounded-lg transition-all focus:outline-none focus:border-[#D49649] focus:bg-white disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                disabled={loading}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#D29356] hover:bg-[#b87d47] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
            >
              {loading ? 'Signing in...' : 'Log In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
