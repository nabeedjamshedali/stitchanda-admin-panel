import React from 'react';
import Sidebar from './Sidebar';

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="md:ml-64 ml-0">
        <main className="p-4 md:p-6 pt-16 md:pt-6">{children}</main>
      </div>
    </div>
  );
};

export default Layout;
