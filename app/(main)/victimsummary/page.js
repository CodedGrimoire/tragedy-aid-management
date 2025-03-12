"use client";

import { useState, useEffect } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from 'recharts';

export default function SummaryPage() {
  const [summary, setSummary] = useState(null);

  useEffect(() => {
    fetch('/api/summary')
      .then(res => res.json())
      .then(data => setSummary(data))
      .catch(err => console.error('Failed to fetch summary:', err));
  }, []);

  if (!summary) return <div>Loading...</div>;

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-semibold">Victims Data Summary</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Victims by Age Bracket" data={summary.ageBracket} dataKey="ageGroup" barKey="count" fill="#8884d8" />
        <ChartCard title="Victims by Status" data={summary.status} dataKey="statusType" fill="#82ca9d" />
        <ChartCard title="Victims by Gender" data={summary.gender} dataKey="genderType" fill="#ffc658" />
        <ChartCard title="Victims Supported by NGOs" data={summary.ngoSupport} dataKey="ngoName" fill="#d88488" />
        <ChartCard title="Events by Location" data={summary.eventsLocation} dataKey="location" fill="#84a8d8" barKey="eventCount" />
      </div>
    </div>
  );
}

function ChartCard({ title, data, dataKey, barKey = "count", fill }) {
  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="px-4 py-3 border-b">
        <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      </div>
      <div className="h-64 p-4">
        <ResponsiveContainer>
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey={dataKey} />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey={barKey} fill={fill} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
