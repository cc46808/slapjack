// slapjack/client/src/components/admin/Dashboard.jsx
import React, { useEffect, useState } from 'react';
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip
} from 'recharts';

export const Dashboard = () => {
  const [metrics, setMetrics] = useState(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      const response = await fetch('/api/admin/metrics');
      setMetrics(await response.json());
    };
    fetchMetrics();
    const interval = setInterval(fetchMetrics, 30000);
    return () => clearInterval(interval);
  }, []);

  if (!metrics) return <div className="flex items-center justify-center h-screen">
  <LoadingSpinner />
</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">System Dashboard</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Active Games</h2>
          <LineChart width={500} height={300} data={metrics.games}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="time" />
            <YAxis />
            <Tooltip />
            <Line type="monotone" dataKey="count" stroke="#8884d8" />
          </LineChart>
        </div>

        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-lg font-semibold mb-4">Player Statistics</h2>
          <BarChart width={500} height={300} data={metrics.players}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="wins" fill="#82ca9d" />
          </BarChart>
        </div>
      </div>
    </div>
  );
};