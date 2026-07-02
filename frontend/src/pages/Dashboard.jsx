import React from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Layout/Navbar';
import AdminDashboard from '../components/Admin/AdminDashboard';
import MaintenanceDashboard from '../components/Maintenance/MaintenanceDashboard';
import ResidentDashboard from '../components/Resident/ResidentDashboard';

export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'admin' || user?.role === 'staff') {
    return <AdminDashboard />;
  }

  const renderDashboard = () => {
    switch (user?.role) {
      case 'maintenance':
        return <MaintenanceDashboard />;
      case 'homeowner':
      case 'tenant':
        return <ResidentDashboard />;
      default:
        return (
          <div className="p-6 text-center text-slate-400">
            Access denied. Invalid or missing user role.
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 w-full max-w-7xl mx-auto py-6">
        {renderDashboard()}
      </main>
    </div>
  );
}
