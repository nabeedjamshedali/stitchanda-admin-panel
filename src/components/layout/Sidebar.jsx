import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Scissors,
  Bike,
  ShoppingBag,
} from 'lucide-react';
import clsx from 'clsx';

const Sidebar = () => {
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
  ];

  return (
    <div className="w-64 bg-white border-r border-gray-200 h-screen fixed left-0 top-0 flex flex-col">
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-gray-200">
        <h1 className="text-2xl font-bold text-primary-500">Stitchanda</h1>
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
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-700 hover:bg-gray-100'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon
                    className={clsx(
                      'w-5 h-5 mr-3',
                      isActive ? 'text-primary-700' : 'text-gray-500'
                    )}
                  />
                  {item.name}
                </>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-200">
        <p className="text-xs text-gray-500 text-center">
          &copy; 2024 Stitchanda
        </p>
      </div>
    </div>
  );
};

export default Sidebar;
