import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Scissors,
  Bike,
  ShoppingBag,
  CreditCard,
  LogOut,
  User,
} from 'lucide-react';
import clsx from 'clsx';
import { useAuth } from '../../contexts/AuthContext';
import toast from 'react-hot-toast';

const Sidebar = () => {
  const navigate = useNavigate();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const navItems = [
    {
      name: 'Dashboard',
      path: '/',
      icon: LayoutDashboard,
    },
    {
      name: 'Customers',
      path: '/customers',
      icon: Users,
    },
    {
      name: 'Tailors',
      path: '/tailors',
      icon: Scissors,
    },
    {
      name: 'Riders',
      path: '/riders',
      icon: Bike,
    },
    {
      name: 'Orders',
      path: '/orders',
      icon: ShoppingBag,
    },
    {
      name: 'Payments',
      path: '/payments',
      icon: CreditCard,
    },
  ];

  return (
    <div className="w-64 bg-[#6B4423] h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-[#8D6A4F]">
        <h1 className="text-2xl font-bold text-white">Stitchanda</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === '/'}
              className={({ isActive }) =>
                clsx(
                  'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors',
                  isActive
                    ? 'bg-[#8D6A4F] text-white'
                    : 'text-gray-300 hover:bg-[#8D6A4F]/50 hover:text-white'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={clsx(
                      'w-5 h-5 mr-3',
                      isActive ? 'text-white' : 'text-gray-400'
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Admin Profile */}
      <div className="border-t border-[#8D6A4F]">
        <div className="p-4 flex items-center space-x-3">
          <div className="w-10 h-10 bg-[#A67B5B] rounded-full flex items-center justify-center flex-shrink-0">
            <User className="w-5 h-5 text-white" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-white truncate">Admin</p>
            <p className="text-xs text-gray-400 truncate">Super Admin</p>
          </div>
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full px-4 py-3 flex items-center space-x-3 text-gray-300 hover:bg-[#8D6A4F]/50 hover:text-white transition-colors"
        >
          <LogOut className="w-5 h-5" />
          <span className="text-sm font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
