import { useState, useEffect } from 'react';
import api from '../services/api';
import SkeletonLoader from '../components/SkeletonLoader';

const Analytics = () => {
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchAnalytics();
    
    // Auto-refresh every 5 seconds
    const interval = setInterval(() => {
      fetchAnalytics(true); // Silent refresh
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const fetchAnalytics = async (silent = false) => {
    try {
      if (!silent) setLoading(true);
      const response = await api.get('/analytics');
      setAnalytics(response.data.analytics);
      setError(false);
    } catch (error) {
      if (!silent) setError(true);
    } finally {
      if (!silent) setLoading(false);
    }
  };

  if (loading && !analytics) return <SkeletonLoader type="analytics" />;
  
  if (error && !analytics) return (
    <div className="text-center py-12">
      <p className="text-red-600">Failed to load analytics data</p>
      <button onClick={() => fetchAnalytics()} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700">
        Retry
      </button>
    </div>
  );

  const { overview, ticketsByPriority, ticketsByCategory, ticketsByStatus, topStats } = analytics;

  return (
    <div className="max-w-7xl mx-auto py-6 px-4">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Analytics Dashboard</h1>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">
              📊
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{overview.totalTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">
              ✅
            </div>
            <div>
              <p className="text-sm text-gray-600">Open Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{overview.openTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-gray-100 text-gray-600 mr-4">
              🔒
            </div>
            <div>
              <p className="text-sm text-gray-600">Closed Tickets</p>
              <p className="text-2xl font-bold text-gray-900">{overview.closedTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">
              ⚠️
            </div>
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-gray-900">{overview.overdueTickets}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-3 rounded-full bg-indigo-100 text-indigo-600 mr-4">
              👥
            </div>
            <div>
              <p className="text-sm text-gray-600">Total Users</p>
              <p className="text-2xl font-bold text-gray-900">{overview.totalUsers}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Tickets by Priority */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Priority</h2>
          <div className="space-y-3">
            {ticketsByPriority.map((item) => {
              const total = ticketsByPriority.reduce((sum, i) => sum + i.count, 0);
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
              const colorMap = {
                high: 'bg-red-500',
                medium: 'bg-yellow-500',
                low: 'bg-green-500'
              };
              
              return (
                <div key={item.priority}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">{item.priority}</span>
                    <span className="text-sm font-medium text-gray-900">{item.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${colorMap[item.priority]}`}
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Tickets by Category */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Category</h2>
          <div className="space-y-3">
            {ticketsByCategory.map((item) => {
              const total = ticketsByCategory.reduce((sum, i) => sum + i.count, 0);
              const percentage = total > 0 ? Math.round((item.count / total) * 100) : 0;
              
              return (
                <div key={item.category}>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700 capitalize">
                      {item.category.replace('-', ' ')}
                    </span>
                    <span className="text-sm font-medium text-gray-900">{item.count} ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="h-2 rounded-full bg-purple-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Status and Top Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tickets by Status */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Tickets by Status</h2>
          <div className="space-y-4">
            {ticketsByStatus.map((item) => {
              const colorMap = {
                open: 'bg-blue-500',
                closed: 'bg-gray-500'
              };
              
              return (
                <div key={item.status} className="flex items-center justify-between p-3 bg-gray-50 rounded">
                  <div className="flex items-center">
                    <div className={`w-3 h-3 rounded-full ${colorMap[item.status]} mr-3`}></div>
                    <span className="text-sm font-medium text-gray-700 capitalize">{item.status}</span>
                  </div>
                  <span className="text-lg font-bold text-gray-900">{item.count}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Stats */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Top Contributors</h2>
          <div className="space-y-4">
            {topStats.mostActiveUser && (
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Most Active User</div>
                <div className="font-semibold text-gray-900">{topStats.mostActiveUser.name}</div>
                <div className="text-xs text-gray-500">{topStats.mostActiveUser.email}</div>
                <div className="text-sm text-blue-600 mt-2">{topStats.mostActiveUser.ticketCount} tickets</div>
              </div>
            )}
            
            {topStats.mostActiveAdmin && (
              <div className="p-4 bg-purple-50 rounded-lg">
                <div className="text-sm text-gray-600 mb-1">Most Active Admin</div>
                <div className="font-semibold text-gray-900">{topStats.mostActiveAdmin.name}</div>
                <div className="text-xs text-gray-500">{topStats.mostActiveAdmin.email}</div>
                <div className="text-sm text-purple-600 mt-2">{topStats.mostActiveAdmin.ticketCount} tickets handled</div>
              </div>
            )}

            <div className="p-4 bg-green-50 rounded-lg">
              <div className="text-sm text-gray-600 mb-1">Recent Activity (7 days)</div>
              <div className="text-2xl font-bold text-gray-900">{overview.recentTickets}</div>
              <div className="text-xs text-gray-500">new tickets created</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
