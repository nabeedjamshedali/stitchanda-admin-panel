import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import StatsCard from '../components/dashboard/StatsCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import OrdersChart from '../components/dashboard/OrdersChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import Loading from '../components/shared/Loading';
import Button from '../components/shared/Button';
import {
  DollarSign,
  Users,
  Scissors,
  Bike,
  ShoppingBag,
  Database,
} from 'lucide-react';
import { getStatistics, getOrders } from '../lib/firebase';
import { seedSampleData } from '../utils/seedData';
import toast from 'react-hot-toast';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [seeding, setSeeding] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statistics, orders] = await Promise.all([
          getStatistics(),
          getOrders(),
        ]);

        setStats(statistics);
        // Sort orders by createdAt descending
        const sortedOrders = orders.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
        setRecentOrders(sortedOrders);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleSeedData = async () => {
    setSeeding(true);
    try {
      const result = await seedSampleData();
      if (result.success) {
        toast.success('Sample data added successfully!');
        // Refresh dashboard data
        const [statistics, orders] = await Promise.all([
          getStatistics(),
          getOrders(),
        ]);
        setStats(statistics);
        const sortedOrders = orders.sort((a, b) => {
          const dateA = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt);
          const dateB = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt);
          return dateB - dateA;
        });
        setRecentOrders(sortedOrders);
      } else {
        toast.error('Failed to add sample data');
      }
    } catch (error) {
      console.error('Error seeding data:', error);
      toast.error('Error: ' + error.message);
    } finally {
      setSeeding(false);
    }
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <Loading />
      </Layout>
    );
  }

  // Mock data for revenue chart (last 6 months)
  const revenueData = [
    { month: 'Jan', revenue: 45000 },
    { month: 'Feb', revenue: 52000 },
    { month: 'Mar', revenue: 48000 },
    { month: 'Apr', revenue: 61000 },
    { month: 'May', revenue: 55000 },
    { month: 'Jun', revenue: 67000 },
  ];

  // Order status distribution data
  const orderStatusData = [
    { name: 'Pending', value: stats?.pendingOrders || 0 },
    { name: 'In Progress', value: stats?.inProgressOrders || 0 },
    { name: 'Completed', value: stats?.completedOrders || 0 },
    { name: 'Cancelled', value: stats?.cancelledOrders || 0 },
  ];

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">
        {/* Header with Seed Data Button */}
        {(stats?.totalCustomers === 0 || stats?.totalOrders === 0) && (
          <div className="bg-blue-50 border-l-4 border-blue-400 p-4 rounded-lg flex items-center justify-between">
            <div className="flex items-center">
              <Database className="h-5 w-5 text-blue-400 mr-3" />
              <div>
                <p className="text-sm font-medium text-blue-800">No data found in database</p>
                <p className="text-xs text-blue-600 mt-1">
                  Click the button to add sample data or add data manually in other tabs
                </p>
              </div>
            </div>
            <Button
              variant="primary"
              icon={Database}
              onClick={handleSeedData}
              loading={seeding}
            >
              Add Sample Data
            </Button>
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={`PKR ${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="green"
            trend="up"
            trendValue="+12%"
          />
          <StatsCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingBag}
            color="blue"
            trend="up"
            trendValue="+8%"
          />
          <StatsCard
            title="Total Customers"
            value={stats?.totalCustomers || 0}
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="Active Tailors"
            value={stats?.approvedTailors || 0}
            icon={Scissors}
            color="orange"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <StatsCard
            title="Pending Orders"
            value={stats?.pendingOrders || 0}
            color="orange"
          />
          <StatsCard
            title="Pending Tailors Approval"
            value={stats?.pendingTailors || 0}
            color="red"
          />
          <StatsCard
            title="Active Riders"
            value={stats?.approvedRiders || 0}
            icon={Bike}
            color="blue"
          />
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <RevenueChart data={revenueData} />
          <OrdersChart data={orderStatusData} />
        </div>

        {/* Recent Activity */}
        <RecentActivity orders={recentOrders} />
      </div>
    </Layout>
  );
};

export default Dashboard;
