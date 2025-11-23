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
  CheckCircle,
} from 'lucide-react';
import { getStatistics, getOrders, getCustomers } from '../lib/firebase';

const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [recentOrders, setRecentOrders] = useState([]);
  const [revenueData, setRevenueData] = useState([]);
  const [loading, setLoading] = useState(true);

  const calculateTrends = (orders) => {
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    const lastMonth = currentMonth === 0 ? 11 : currentMonth - 1;
    const lastMonthYear = currentMonth === 0 ? currentYear - 1 : currentYear;

    const ADMIN_COMMISSION_RATE = 0.10; 

    const currentMonthOrders = orders.filter(order => {
      if (!order.created_at || order.status < 5) return false;
      const date = order.created_at.toDate ? order.created_at.toDate() : new Date(order.created_at);
      return date.getMonth() === currentMonth &&
             date.getFullYear() === currentYear &&
             order.status >= 5 && order.status <= 11;
    });

    const lastMonthOrders = orders.filter(order => {
      if (!order.created_at || order.status < 5) return false;
      const date = order.created_at.toDate ? order.created_at.toDate() : new Date(order.created_at);
      return date.getMonth() === lastMonth &&
             date.getFullYear() === lastMonthYear &&
             order.status >= 5 && order.status <= 11;
    });

    const currentMonthRevenue = currentMonthOrders.reduce((sum, o) => sum + ((o.total_price || 0) * ADMIN_COMMISSION_RATE), 0);
    const lastMonthRevenue = lastMonthOrders.reduce((sum, o) => sum + ((o.total_price || 0) * ADMIN_COMMISSION_RATE), 0);

    const currentMonthOrderCount = currentMonthOrders.length;
    const lastMonthOrderCount = lastMonthOrders.length;

    const revenueChange = lastMonthRevenue === 0
      ? (currentMonthRevenue > 0 ? 100 : 0)
      : ((currentMonthRevenue - lastMonthRevenue) / lastMonthRevenue) * 100;

    const ordersChange = lastMonthOrderCount === 0
      ? (currentMonthOrderCount > 0 ? 100 : 0)
      : ((currentMonthOrderCount - lastMonthOrderCount) / lastMonthOrderCount) * 100;

    return {
      revenueTrend: revenueChange >= 0 ? 'up' : 'down',
      revenueTrendValue: `${revenueChange >= 0 ? '+' : ''}${Math.round(revenueChange)}%`,
      ordersTrend: ordersChange >= 0 ? 'up' : 'down',
      ordersTrendValue: `${ordersChange >= 0 ? '+' : ''}${Math.round(ordersChange)}%`,
    };
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [statistics, orders, customers] = await Promise.all([
          getStatistics(),
          getOrders(),
          getCustomers(),
        ]);

        const trendsData = calculateTrends(orders);
        setStats({
          ...statistics,
          revenueTrend: trendsData.revenueTrend,
          revenueTrendValue: trendsData.revenueTrendValue,
          ordersTrend: trendsData.ordersTrend,
          ordersTrendValue: trendsData.ordersTrendValue,
        });

        const ordersWithCustomers = orders.map(order => {
          const customer = customers.find(c => c.customerId === order.customer_id || c.id === order.customer_id);
          return {
            ...order,
            customerName: customer?.name || customer?.username || 'Unknown Customer'
          };
        });

        const sortedOrders = ordersWithCustomers.sort((a, b) => {
          const dateA = a.created_at?.toDate ? a.created_at.toDate() : new Date(a.created_at);
          const dateB = b.created_at?.toDate ? b.created_at.toDate() : new Date(b.created_at);
          return dateB - dateA;
        });
        setRecentOrders(sortedOrders);

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

  const calculateMonthlyRevenue = (orders) => {
    const now = new Date();
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    for (let i = 5; i >= 0; i--) {
      const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
      months.push({
        month: monthNames[date.getMonth()],
        revenue: 0,
        year: date.getFullYear(),
        monthIndex: date.getMonth()
      });
    }

    const ADMIN_COMMISSION_RATE = 0.10; 
    orders.forEach(order => {
      if (order.status >= 5 && order.status <= 11 && order.created_at) { 
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

  const orderStatusData = [
    { name: 'Pending', value: stats?.pendingOrders || 0 },
    { name: 'In Progress', value: stats?.inProgressOrders || 0 },
    { name: 'Completed', value: stats?.completedOrders || 0 },
    { name: 'Cancelled', value: stats?.cancelledOrders || 0 },
  ];

  return (
    <Layout title="Dashboard">
      <div className="space-y-6">

        {/* Stats Cards - Main Totals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard
            title="Total Revenue"
            value={`PKR ${(stats?.totalRevenue || 0).toLocaleString()}`}
            icon={DollarSign}
            color="green"
            trend={stats?.revenueTrend}
            trendValue={stats?.revenueTrendValue}
          />
          <StatsCard
            title="Total Orders"
            value={stats?.totalOrders || 0}
            icon={ShoppingBag}
            color="blue"
            trend={stats?.ordersTrend}
            trendValue={stats?.ordersTrendValue}
          />
          <StatsCard
            title="Total Customers"
            value={stats?.totalCustomers || 0}
            icon={Users}
            color="purple"
          />
          <StatsCard
            title="Total Tailors"
            value={stats?.totalTailors || 0}
            icon={Scissors}
            color="orange"
          />
        </div>

        {/* Secondary Stats - Order Status & Approvals */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
          <StatsCard
            title="Pending Orders"
            value={stats?.pendingOrders || 0}
            color="orange"
          />
          <StatsCard
            title="Completed Orders"
            value={stats?.completedOrders || 0}
            icon={CheckCircle}
            color="green"
          />
          <StatsCard
            title="Pending Tailors Approval"
            value={stats?.pendingTailors || 0}
            color="red"
          />
          <StatsCard
            title="Pending Riders Approval"
            value={stats?.pendingRiders || 0}
            color="red"
          />
          <StatsCard
            title="Total Riders"
            value={stats?.totalRiders || 0}
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
