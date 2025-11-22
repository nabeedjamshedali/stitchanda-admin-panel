import React, { useState, useEffect } from 'react';
import Layout from '../components/layout/Layout';
import StatsCard from '../components/dashboard/StatsCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import OrdersChart from '../components/dashboard/OrdersChart';
import RecentActivity from '../components/dashboard/RecentActivity';
import Loading from '../components/shared/Loading';
import {
  DollarSign,
  Users,
  Scissors,
  Bike,
  ShoppingBag,
} from 'lucide-react';
import { getStatistics, getOrders } from '../lib/firebase';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statistics, orders] = await Promise.all([
          getStatistics(),
          getOrders(),
        ]);

        setStats(statistics);

        // Sort orders by created_at descending
        const sortedOrders = orders.sort((a, b) => {
          const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
          const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
          return dateB - dateA;
        });
        setRecentOrders(sortedOrders);

        // Calculate last 6 months revenue from real order data
        const monthlyRevenue = calculateMonthlyRevenue(orders);
        setRevenueData(monthlyRevenue);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  // Calculate revenue for last 6 months from orders
  const calculateMonthlyRevenue = (orders) => {
    const now = new Date();
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    // Generate last 6 months
    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[date.getMonth()],
        revenue: 0,
        year: date.getFullYear(),
        monthIndex: date.getMonth()
      });
    }

    // Calculate revenue for each month from completed orders (status >= 5)
    // Admin gets 10% commission from each completed order
    const ADMIN_COMMISSION_RATE = 0.10; // 10%

    orders.forEach(order => {
      if (order.status >= 5 && order.status <= 11 && order.created_at) { // Completed orders
        const orderDate = order.created_at.toDate ? order.created_at.toDate() : new Date(order.created_at);
        const monthData = months.find(m =>
          m.year === orderDate.getFullYear() &&
          m.monthIndex === orderDate.getMonth()
        );
        if (monthData) {
          monthData.revenue += (order.total_price || 0) * ADMIN_COMMISSION_RATE;
        }
      }
    });

    return months.map(m => ({ month: m.month, revenue: m.revenue }));
  };

  if (loading) {
    return (
      <Layout title="Dashboard">
        <Loading />
      </Layout>
    );
  }

  // Order status distribution data from real statistics
  const orderStatusData = [
    { name: 'Pending', value: stats?.pendingOrders || 0 },
    { name: 'In Progress', value: stats?.inProgressOrders || 0 },
    { name: 'Completed', value: stats?.completedOrders || 0 },
    { name: 'Cancelled', value: stats?.cancelledOrders || 0 },
  ];

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">

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
