import React, { useState } from 'react';
import { Outlet, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import Footer from './Footer';

const Layout = () => {
  const { user, loading } = useAuth();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // If loading user state, show a smooth spinner
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-gray-200 border-t-primary animate-spin" />
          <p className="text-sm font-semibold text-gray-500">Authenticating session...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if user session is missing
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50/50">
      {/* Top Header */}
      <Topbar onToggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
      
      <div className="flex flex-1 flex-row relative">
        {/* Sidebar Navigation */}
        <Sidebar isOpen={sidebarOpen} toggleSidebar={() => setSidebarOpen(!sidebarOpen)} />
        
        {/* Viewport Content */}
        <main className="flex-1 p-6 page-enter min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Global Footer */}
      <Footer />
    </div>
  );
};

export default Layout;
