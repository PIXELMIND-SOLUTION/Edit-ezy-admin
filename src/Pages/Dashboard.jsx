import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  FiFolder,
  FiClock,
  FiHelpCircle,
  FiGift,
  FiHeart,
  FiCreditCard,
  FiUsers,
} from "react-icons/fi"; // Import necessary icons from react-icons
import { AreaChart, Area, ResponsiveContainer, XAxis, Tooltip } from "recharts";

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("https://posterbnaobackend.onrender.com/api/admin/dashboard");
      setDashboardData(res.data); // ✅ No mock data
    } catch (error) {
      console.error("Failed to fetch dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) return <div className="p-6">Loading dashboard...</div>;
  if (!dashboardData) return <div className="p-6 text-red-500">Failed to load data</div>;

  const {
    activeUsersCount,
    todaysOrders,
    totalEarnings,
    completedOrdersCount,
    birthdayUsers,
    anniversaryUsers,
    planSummary,
    weeklyEarnings,
    weeklyCompletedOrders,
  } = dashboardData;

  return (
    <div className="bg-gray-100 min-h-screen p-6 space-y-6">
      {/* USERS + ORDERS */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Active Users */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <FiUsers className="text-blue-600 bg-blue-100 p-2 rounded-lg text-4xl" />
              <h2 className="text-lg font-semibold">Active Users</h2>
            </div>
            <span className="text-2xl font-bold">{activeUsersCount}</span>
          </div>
        </div>

        {/* Today's Orders */}
        <div className="bg-white p-4 rounded shadow col-span-2 space-y-4">
          <h2 className="text-xl font-bold">Today's Orders</h2>
          <div className="space-y-3">
            {todaysOrders.length === 0 ? (
              <p className="text-gray-500">No orders for today.</p>
            ) : (
              todaysOrders.map((order, i) => (
                <div key={order._id || i}>
                  <div className="flex items-center gap-2">
                    <FiClock className="text-blue-600 bg-blue-100 p-2 rounded-lg text-3xl" />
                    <p className="font-semibold">
                      Order #{order._id?.slice(-5) || "N/A"} - {order.status}
                    </p>
                  </div>
                  <p className="text-sm text-gray-500 ml-10">
                    Amount: ₹{order.totalAmount} •{" "}
                    {new Date(order.orderDate).toDateString()}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* EARNINGS + COMPLETED ORDERS CHART */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Earnings */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold">This Week's Earnings</h2>
          <p className="text-2xl font-bold mb-2">₹{totalEarnings}</p>
          <div className="h-24">
            {weeklyEarnings && weeklyEarnings.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyEarnings}>
                  <XAxis dataKey="day" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="amount"
                    stroke="#4F46E5"
                    fill="#C7D2FE"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center">(No earnings data for graph)</p>
            )}
          </div>
        </div>

        {/* Completed Orders */}
        <div className="bg-white p-4 rounded shadow">
          <div className="flex justify-between items-center text-xl font-semibold">
            Completed Orders
            <FiHelpCircle className="text-gray-400" />
          </div>
          <p className="text-sm mb-2">{completedOrdersCount} Orders</p>
          <div className="h-24">
            {weeklyCompletedOrders && weeklyCompletedOrders.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={weeklyCompletedOrders}>
                  <XAxis dataKey="day" />
                  <Tooltip />
                  <Area
                    type="monotone"
                    dataKey="count"
                    stroke="#10B981"
                    fill="#A7F3D0"
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-gray-400 text-sm text-center">(No orders data for graph)</p>
            )}
          </div>
        </div>
      </div>

      {/* BIRTHDAYS + ANNIVERSARIES + PLANS */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Birthdays */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-3">Today's User Birthdays</h2>
          <div className="flex items-center space-x-3">
            <FiGift className="text-pink-600 bg-pink-100 p-2 rounded-lg text-3xl" />
          </div>
          {birthdayUsers.length === 0 ? (
            <p className="text-gray-500">No birthdays today.</p>
          ) : (
            birthdayUsers.map((user, i) => (
              <div key={user._id || i} className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={user.profileImage || `https://randomuser.me/api/portraits/men/${i + 1}.jpg`}
                    className="w-8 h-8 rounded-full"
                  />
                  <p>{user.name}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Anniversaries */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-3">Anniversaries</h2>
          <div className="flex items-center space-x-3">
            <FiHeart className="text-red-600 bg-red-100 p-2 rounded-lg text-3xl" />
          </div>
          {anniversaryUsers.length === 0 ? (
            <p className="text-gray-500">No anniversaries today.</p>
          ) : (
            anniversaryUsers.map((user, i) => (
              <div key={user._id || i} className="flex justify-between items-center mb-2">
                <div className="flex items-center space-x-2">
                  <img
                    src={user.profileImage || `https://randomuser.me/api/portraits/women/${i + 1}.jpg`}
                    className="w-8 h-8 rounded-full"
                  />
                  <p>{user.name}</p>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Subscription Plans */}
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-xl font-bold mb-4">Subscription Plans</h2>
          <div className="flex items-center space-x-3">
            <FiCreditCard className="text-green-600 bg-green-100 p-2 rounded-lg text-3xl" />
          </div>
          <ul className="space-y-3 text-sm">
            {Object.entries(planSummary).map(([plan, count], i) => (
              <li key={i}>
                <p className="font-semibold text-lg">{plan}</p>
                <div className="text-gray-500 flex justify-between text-xs">
                  <span>Users Subscribed</span>
                  <span>{count}</span>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
