import React from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

const Layout = ({ children, title }) => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <div className="ml-64">
        <Header title={title} />
        <main className="pt-16">
          <div className="p-6">{children}</div>
        </main>
      </div>
    </div>
  );
};

export default Layout;
