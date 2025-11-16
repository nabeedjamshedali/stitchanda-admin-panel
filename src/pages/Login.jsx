import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, CheckCircle, Users, Package, Scissors } from 'lucide-react';

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
      {/* Left Panel - Brown/Tan */}
      <div className="hidden lg:flex lg:w-[35%] bg-[#A67B5B] text-white p-8 flex-col justify-between">
        <div>
          {/* Icon and Title */}
          <div className="mb-8">
            <CheckCircle className="w-10 h-10 mb-4" />
            <h1 className="text-2xl font-bold mb-3">Stitchanda Admin System</h1>
            <p className="text-white/90 text-sm leading-relaxed">
              Register your company and manage your tailoring operations. Ensure compliance,
              transparency, and trust with our automated management and reporting system.
            </p>
          </div>

          {/* Steps */}
          <div className="space-y-6">
            {/* Step 1 */}
            <div>
              <div className="mb-2">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">1- Register Your Company</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Start by creating an account and registering your company details.
                Provide your business credentials for verification.
              </p>
            </div>

            {/* Step 2 */}
            <div>
              <div className="mb-2">
                <Package className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">2- Submit Required Details</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Upload essential documents such as production records, compliance
                certificates, and quality assurance reports for review.
              </p>
            </div>

            {/* Step 3 */}
            <div>
              <div className="mb-2">
                <Scissors className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold mb-2">3- Start Managing</h3>
              <p className="text-white/90 text-sm leading-relaxed">
                Once verified, manage customers, tailors, orders, and track your
                business growth with comprehensive analytics.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Panel - Login Form */}
      <div className="flex-1 flex items-center justify-center px-6 py-6 bg-white">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-6">
            <Scissors className="w-14 h-14 mx-auto text-[#A67B5B] mb-2" />
            <h1 className="text-2xl font-bold text-gray-900">Stitchanda</h1>
          </div>

          {/* Desktop Logo */}
          <div className="hidden lg:flex items-center justify-center mb-12">
            <Scissors className="w-16 h-16 text-[#A67B5B]" />
          </div>

          {/* Welcome Text */}
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-gray-900 mb-3 leading-tight">
              Welcome Back to<br />Stitchanda Admin App
            </h2>
            <p className="text-gray-600">Log in to access your account.</p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                className="w-full px-4 py-3 bg-[#EEF2F6] border-2 border-[#EEF2F6] rounded-lg transition-all focus:outline-none focus:border-[#A67B5B] focus:bg-white disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
              />
            </div>

            {/* Password Field */}
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
                disabled={loading}
                className="w-full px-4 py-3 pr-12 bg-[#EEF2F6] border-2 border-[#EEF2F6] rounded-lg transition-all focus:outline-none focus:border-[#A67B5B] focus:bg-white disabled:bg-gray-200 disabled:cursor-not-allowed text-gray-900 placeholder-gray-500"
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

            {/* Login Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#A67B5B] hover:bg-[#8D6A4F] text-white font-semibold rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-1"
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
